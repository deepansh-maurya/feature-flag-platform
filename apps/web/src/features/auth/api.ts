import { http, setAuthToken } from "@/src/shared/lib/http";
import { z } from "zod";

/** ───────── Types & Schemas ───────── */

export const UserSchema = z.object({
    id: z.string(),
    email: z.email(),
    name: z.string(),
    createdAt: z.string().optional() // ISO (optional if not returned)
});
export type User = z.infer<typeof UserSchema>;

const TokensSchema = z.object({
    accessToken: z.string()
});

export const AuthResponseSchema = z.object({
    ...TokensSchema.shape,
    user: z.object({
        id: z.string(),
        email: z.email(),
        name: z.string(),
    }),
    workspace: z.any(), // tighten later if you know the structure
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RegisterInputSchema = z.object({
    workspace: z.string(),
    fullName: z.string().min(2).max(64),
    email: z.email(),
    password: z.string().min(8).max(128)
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(128),
    remember: z.boolean()
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const ChangePasswordInputSchema = z.object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128)
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const LogoutInputSchema = z.object({
    allDevices: z.boolean().optional() // if your backend supports it
});
export type LogoutInput = z.infer<typeof LogoutInputSchema>;

/** ───────── Helpers (optional persistence) ───────── */

export const TOKEN_STORAGE_KEY = "ff_access_token";
let installed = false;

export function persistAccessToken(token?: string, remember?: boolean) {
    console.log("1");

    if (typeof window === "undefined") return; // SSR guard
    console.log(2);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);

    if (!token) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken(undefined);
        return;
    }

    console.log(3);
    // set axios header for this runtime

    if (remember) {
        // persist across browser restarts
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        console.log(4);



    } else {
        // session-only (cleared on browser close)
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        console.log(5);

    }
}

export function loadAccessTokenFromStorage() {
    if (typeof window === "undefined") return;
    // prefer session token (non-remember) over persistent token
    const t =
        sessionStorage.getItem(TOKEN_STORAGE_KEY) ||
        localStorage.getItem(TOKEN_STORAGE_KEY) ||
        undefined;
    setAuthToken(t || undefined);
}

export function installAuthStorageSync() {
    if (typeof window === "undefined" || installed) return () => { };
    const handler = (e: StorageEvent) => {
        if (e.key !== TOKEN_STORAGE_KEY) return;
        const t = e.newValue || undefined;
        setAuthToken(t);
    };
    window.addEventListener("storage", handler);
    installed = true;

    // allow cleanup if your component unmounts (good practice)
    return () => {
        window.removeEventListener("storage", handler);
        installed = false;
    };
}
/** ───────── Endpoints ─────────
 * Adjust paths if your backend differs.
 * Assumes Bearer auth for protected routes.
 */

const base = "/auth";

export async function register(input: RegisterInput): Promise<AuthResponse> {
    console.log(`${base}/register`);

    RegisterInputSchema.parse(input);
    const { data } = await http.post(`${base}/register`, input);
    console.log(data);

    const parsed = AuthResponseSchema.parse(data);
    persistAccessToken(parsed.accessToken);
    return parsed;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
    LoginInputSchema.parse(input);
    console.log(input);

    const { data } = await http.post(`${base}/login`, {
        email: input.email,
        password: input.password
    });
    const parsed = data
    console.log(parsed);

    persistAccessToken(parsed.accessToken, input.remember);
    setAuthToken(parsed.accessToken);
    return parsed;
}

export async function changePassword(
    input: ChangePasswordInput
): Promise<{ ok: true }> {
    ChangePasswordInputSchema.parse(input);
    const { data } = await http.post(`${base}/change-password`, input);
    // expect { ok: true } from backend; relax if your API returns different
    return z.object({ ok: z.literal(true) }).parse(data);
}

export async function logout(input?: LogoutInput): Promise<{ ok: true }> {
    if (input) LogoutInputSchema.parse(input);
    const { data } = await http.post(`${base}/logout`, input ?? {});
    persistAccessToken(undefined);
    return z.object({ ok: z.literal(true) }).parse(data);
}

/**
 * Delete the authenticated user’s account.
 * Common patterns:
 *   - DELETE /api/v1/auth/me   (no body)
 *   - or DELETE /api/v1/users/me (sometimes with password confirm)
 * This version supports an optional { password } confirm if you use it.
 */
export const DeleteAccountInputSchema = z.object({
    password: z.string().min(8).max(128).optional()
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;

export async function deleteAccount(
    input?: DeleteAccountInput
): Promise<{ ok: true }> {
    if (input) DeleteAccountInputSchema.parse(input);
    // axios allows body on DELETE via { data }
    const { data } = await http.delete(`${base}/me`, { data: input ?? {} });
    persistAccessToken(undefined);
    return z.object({ ok: z.literal(true) }).parse(data);
}
