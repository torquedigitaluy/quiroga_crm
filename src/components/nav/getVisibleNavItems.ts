import { getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { NAV_ITEMS, type NavItem } from "./nav-items";

function tienePermiso(perms: Set<string>, permission: string | string[]): boolean {
  return Array.isArray(permission) ? permission.some((p) => perms.has(p)) : perms.has(permission);
}

export async function getVisibleNavItems(): Promise<NavItem[]> {
  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  return NAV_ITEMS.filter((item) => tienePermiso(perms, item.permission));
}
