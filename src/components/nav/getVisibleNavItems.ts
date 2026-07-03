import { getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { NAV_ITEMS, type NavItem } from "./nav-items";

export async function getVisibleNavItems(): Promise<NavItem[]> {
  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  return NAV_ITEMS.filter((item) => perms.has(item.permission));
}
