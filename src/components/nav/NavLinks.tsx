"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calculator,
  Handshake,
  Landmark,
  Scale,
  FileStack,
  Users,
  Wallet,
  Receipt,
  Building2,
  FileText,
  UserCog,
  Search,
  Wrench,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, IconKey } from "./nav-items";

const ICONS: Record<IconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  stock: Car,
  costos: Calculator,
  ventas: Handshake,
  bbva: Landmark,
  escribania: Scale,
  titulos: FileStack,
  personal: Users,
  propia: Wallet,
  contadora: Receipt,
  bancos: Building2,
  documentos: FileText,
  clientes: Search,
  admin: UserCog,
  taller: Wrench,
  presupuestos: ClipboardList,
};

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-tint text-brand"
                : "text-foreground/70 hover:bg-surface-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
