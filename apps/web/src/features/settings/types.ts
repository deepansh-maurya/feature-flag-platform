// apps/web/src/users/types.ts

type ID = string;
type IsoDate = string;

/* =============== Enums =============== */
export enum UserStatus {
  active = "active",
  deleted = "deleted",
}

/* =============== User DTOs =============== */
export interface UserDto {
  id: ID;
  email: string;
  name: string;
  status: UserStatus;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

/* =============== User Input DTOs =============== */
export interface CreateUserDto {
  email: string;
  name: string;
}

export interface GetUserByEmailDto {
  email: string;
}

export interface UpdateUserDto {
  id: ID;
  name?: string;
  status?: UserStatus;
}

export interface SoftDeleteUserDto {
  id: ID;
}

/* =============== Workspace DTOs =============== */
export interface WorkspaceDto {
  id: ID;
  name: string;
  ownerId: ID;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

/* =============== Workspace Input DTOs =============== */
export interface CreateWorkspaceDto {
  name: string;
  ownerId: ID;
}

export interface UpdateWorkspaceDto {
  id: ID;
  name?: string;
}

export interface GetWorkspaceDto {
  id: ID;
}
