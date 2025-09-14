import { http } from "@/src/shared/lib/http";
import {
  Cancel,
  ChangePlan,
  CheckoutInitDto,
  Entitlements,
  Portal,
  Resume,
  StartCheckout,
  Subscription
} from "./types";

const BASE_ROUTE = "/billing";

export async function startCheckout(
  input: StartCheckout
): Promise<CheckoutInitDto> {
  const { data } = await http.post(BASE_ROUTE + "/start-checkout", input);
  return data;
}

export async function changePlan(input: ChangePlan): Promise<void> {
  await http.post(BASE_ROUTE + "/change-plan", input);
}

export async function cancel(input: Cancel): Promise<void> {
  await http.post(BASE_ROUTE + "/cancel", {
    ...input,
    atPeriodEnd: input.atPeriodEnd ?? true
  });
}

export async function resume(input: Resume): Promise<void> {
  await http.post(BASE_ROUTE + "/resume", input);
}

export async function createPortalSession(
  input: Portal
): Promise<{ url: string }> {
  const { data } = await http.post(BASE_ROUTE + "/portal", input);
  return data as { url: string };
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const { data } = await http.get(BASE_ROUTE + "/subscription");
    return (data ?? null) as Subscription | null;
  } catch (err: any) {
    // Treat 404 as "no subscription" (null) rather than throwing
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function getEntitlements(
  workspaceId: string
): Promise<Entitlements> {
  const { data } = await http.get(BASE_ROUTE + "/entitlements", {
    params: { workspaceId }
  });
  return data as Entitlements;
}

export async function openBillingPortal(input: Portal): Promise<void> {
  const { url } = await createPortalSession(input);
  window.location.assign(url);
}
