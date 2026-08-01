export const ROLES = {
  guest: "guest",
  user: "user",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
