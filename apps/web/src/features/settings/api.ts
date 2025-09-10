import { http } from "@/src/shared/lib/http";
import {
  UserDto,
  CreateUserDto,
  GetUserByEmailDto,
  UpdateUserDto,
  SoftDeleteUserDto,
  WorkspaceDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  GetWorkspaceDto,
} from "./types";

/* -------------------- Users -------------------- */

export async function createUser(input: CreateUserDto): Promise<UserDto> {
  const { data } = await http.post("/users", input);
  return data as UserDto;
}

export async function findUserById(id: string): Promise<UserDto | null> {
  const { data } = await http.get(`/users/${id}`);
  return (data ?? null) as UserDto | null;
}

export async function findUserByEmail(input: GetUserByEmailDto): Promise<UserDto | null> {
  const { data } = await http.get(`/users/by-email`, { params: input });
  return (data ?? null) as UserDto | null;
}

export async function updateUser(input: UpdateUserDto): Promise<UserDto> {
  const { id, ...patch } = input;
  const { data } = await http.patch(`/users/${id}`, patch);
  return data as UserDto;
}

export async function softDeleteUser(input: SoftDeleteUserDto): Promise<SoftDeleteUserDto> {
  await http.delete(`/users/${input.id}`);
  return input
}

/* -------------------- Workspaces -------------------- */

export async function createWorkspace(input: CreateWorkspaceDto): Promise<WorkspaceDto> {
  const { data } = await http.post("/workspaces", input);
  return data as WorkspaceDto;
}

export async function getWorkspace(dto: GetWorkspaceDto): Promise<WorkspaceDto | null> {
  const { data } = await http.get(`/workspaces/${dto.id}`);
  return (data ?? null) as WorkspaceDto | null;
}

export async function updateWorkspace(input: UpdateWorkspaceDto): Promise<WorkspaceDto> {
  const { id, ...patch } = input;
  const { data } = await http.patch(`/workspaces/${id}`, patch);
  return data as WorkspaceDto;
}
