import type { Role } from "@/constants/roles";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
