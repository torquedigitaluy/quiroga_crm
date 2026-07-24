import Link from "next/link";

// Pestañas para la sección unificada de Taller (órdenes de trabajo + presupuestos).
const TABS = [
  { href: "/taller", label: "Órdenes de trabajo", key: "ordenes" },
  { href: "/presupuestos", label: "Presupuestos", key: "presupuestos" },
] as const;

export function TallerTabs({ active }: { active: "ordenes" | "presupuestos" }) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={
              isActive
                ? "border-b-2 border-brand px-4 py-2 text-sm font-semibold text-foreground"
                : "border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
