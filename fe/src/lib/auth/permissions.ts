import { ROLES, type Role } from "@/constants/roles";

const ROUTE_PREFIX_ROLES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/quan-tri", roles: [ROLES.admin] },
  { prefix: "/tin-dang-cua-toi", roles: [ROLES.user, ROLES.admin] },
  { prefix: "/dang-tin", roles: [ROLES.user, ROLES.admin] },
  { prefix: "/yeu-thich", roles: [ROLES.user, ROLES.admin] },
  { prefix: "/tai-khoan", roles: [ROLES.user, ROLES.admin] },
];

export function canAccessRoute(pathname: string, role: Role): boolean {
  const rule = ROUTE_PREFIX_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
}
