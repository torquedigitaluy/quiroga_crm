import { getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { NAV_ITEMS } from "./nav-items";
import { NavLinks } from "./NavLinks";
import { Logo } from "@/components/brand/Logo";

export async function Sidebar() {
  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const items = NAV_ITEMS.filter((item) => perms.has(item.permission));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo width={140} height={32} />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks items={items} />
      </div>
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        Quiroga Automóviles © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
