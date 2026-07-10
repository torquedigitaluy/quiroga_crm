export type IconKey =
  | "dashboard"
  | "stock"
  | "costos"
  | "ventas"
  | "bbva"
  | "escribania"
  | "titulos"
  | "personal"
  | "propia"
  | "contadora"
  | "bancos"
  | "documentos"
  | "clientes"
  | "admin";

export type NavItem = {
  href: string;
  label: string;
  icon: IconKey;
  permission: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Resumen", icon: "dashboard", permission: "dashboard.view" },
  { href: "/stock", label: "Stock", icon: "stock", permission: "stock.view" },
  { href: "/costos", label: "Costos de Vehículos", icon: "costos", permission: "costos.view" },
  { href: "/ventas", label: "Ventas", icon: "ventas", permission: "ventas.view_full" },
  { href: "/ventas/planilla", label: "Mi Planilla de Venta", icon: "ventas", permission: "ventas.view_own" },
  { href: "/bbva", label: "Créditos BBVA", icon: "bbva", permission: "bbva.view" },
  { href: "/escribania", label: "Escribanía y Títulos", icon: "escribania", permission: "escribania.view" },
  { href: "/personal", label: "Personal", icon: "personal", permission: "personal.view" },
  { href: "/propia", label: "Financiación Propia", icon: "propia", permission: "propia.view" },
  { href: "/contadora", label: "Contadora", icon: "contadora", permission: "contadora.view" },
  { href: "/bancos", label: "Bancos", icon: "bancos", permission: "bancos.view" },
  { href: "/documentos", label: "Documentos", icon: "documentos", permission: "docs.generate" },
  { href: "/clientes", label: "Clientes", icon: "clientes", permission: "clientes.view" },
  { href: "/admin/usuarios", label: "Administración", icon: "admin", permission: "admin.users" },
  { href: "/admin/auditoria", label: "Historial de cambios", icon: "admin", permission: "audit.view" },
];
