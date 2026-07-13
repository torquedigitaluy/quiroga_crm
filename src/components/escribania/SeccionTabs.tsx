import Link from "next/link";

// Pestañas para la sección unificada de Escribanía + Financiación de títulos.
const TABS = [
  { href: "/escribania", label: "Escribanía", key: "escribania" },
  { href: "/titulos", label: "Financiación de títulos", key: "titulos" },
] as const;

export function SeccionTabs({ active }: { active: "escribania" | "titulos" }) {
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
