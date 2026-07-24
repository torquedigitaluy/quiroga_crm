// Central permission catalog. Every server action/route handler gates on one
// of these keys via assertCan(). Roles grant a set of these; individual users
// can additionally GRANT or REVOKE any key on top of their role(s) — this is
// the "funcionalidades personalizadas" feature from the superadmin panel.

export type PermissionDef = {
  key: string;
  label: string;
  grupo: string;
};

export const PERMISSIONS: PermissionDef[] = [
  // Stock
  { key: "stock.view", label: "Ver stock", grupo: "Stock" },
  { key: "stock.create", label: "Crear vehículos", grupo: "Stock" },
  { key: "stock.edit_vehicle_fields", label: "Editar datos del vehículo", grupo: "Stock" },
  { key: "stock.edit_price", label: "Cambiar precio de venta", grupo: "Stock" },
  { key: "stock.edit_patente", label: "Actualizar valor de patente", grupo: "Stock" },
  { key: "stock.move_location", label: "Mover el auto de local", grupo: "Stock" },
  { key: "stock.edit_status", label: "Cambiar estado (taller/señado/publicado)", grupo: "Stock" },
  { key: "stock.edit_owner", label: "Editar propietario", grupo: "Stock" },
  { key: "stock.delete", label: "Eliminar vehículos", grupo: "Stock" },

  // Costos
  { key: "costos.view", label: "Ver costos de vehículos", grupo: "Costos" },
  { key: "costos.edit", label: "Editar costos de vehículos", grupo: "Costos" },
  { key: "costos.view_own", label: "Ver y editar solo los vehículos donde es responsable", grupo: "Costos" },

  // Ventas
  { key: "ventas.view_full", label: "Ver todas las ventas", grupo: "Ventas" },
  { key: "ventas.view_own", label: "Ver mi planilla de venta", grupo: "Ventas" },
  { key: "ventas.create", label: "Registrar ventas", grupo: "Ventas" },
  { key: "ventas.edit", label: "Editar cualquier venta", grupo: "Ventas" },
  { key: "ventas.edit_own", label: "Editar las ventas propias", grupo: "Ventas" },

  // BBVA
  { key: "bbva.view", label: "Ver créditos BBVA", grupo: "BBVA" },
  { key: "bbva.edit", label: "Editar créditos BBVA", grupo: "BBVA" },

  // Escribanía
  { key: "escribania.view", label: "Ver escribanía", grupo: "Escribanía" },
  { key: "escribania.edit", label: "Editar escribanía", grupo: "Escribanía" },

  // Financiación de títulos
  { key: "titulos.view", label: "Ver financiación de títulos", grupo: "Financiación de Títulos" },
  { key: "titulos.edit", label: "Editar financiación de títulos", grupo: "Financiación de Títulos" },

  // Personal
  { key: "personal.view", label: "Ver personal", grupo: "Personal" },
  { key: "personal.edit", label: "Editar personal / asistencia", grupo: "Personal" },

  // Financiación propia
  { key: "propia.view", label: "Ver financiación propia", grupo: "Financiación Propia" },
  { key: "propia.edit", label: "Editar financiación propia", grupo: "Financiación Propia" },
  { key: "conforme.generate", label: "Generar conformes", grupo: "Financiación Propia" },
  { key: "deudas.view", label: "Ver deudas de clientes", grupo: "Financiación Propia" },
  { key: "deudas.edit", label: "Editar deudas de clientes", grupo: "Financiación Propia" },

  // Contadora
  { key: "contadora.view", label: "Ver gastos administrativos", grupo: "Contadora" },
  { key: "contadora.edit", label: "Editar gastos administrativos", grupo: "Contadora" },

  // Bancos
  { key: "bancos.view", label: "Ver bancos", grupo: "Bancos" },
  { key: "bancos.edit", label: "Editar movimientos bancarios", grupo: "Bancos" },

  // Documentos
  { key: "docs.generate", label: "Generar documentos", grupo: "Documentos" },
  { key: "docs.generate_vale", label: "Generar y ver vales de financiación", grupo: "Documentos" },
  { key: "docs.view_conformes", label: "Ver los conformes generados (solo Super Admin)", grupo: "Documentos" },
  { key: "docs.template_edit", label: "Editar plantillas de documentos", grupo: "Documentos" },

  // Clientes
  { key: "clientes.view", label: "Ver buscador de clientes", grupo: "Clientes" },

  // Taller
  { key: "taller.view", label: "Ver taller (caja de gastos y órdenes de trabajo)", grupo: "Taller" },
  { key: "taller.edit", label: "Cargar gastos y órdenes de trabajo de taller", grupo: "Taller" },
  { key: "taller.view_ordenes", label: "Ver solo el estado y observaciones de las órdenes (sin costos)", grupo: "Taller" },
  { key: "taller.edit_ordenes", label: "Crear y editar órdenes de trabajo (sin ver la caja de gastos de taller)", grupo: "Taller" },
  { key: "taller.control_calidad", label: "Completar el control de calidad de una orden", grupo: "Taller" },

  // Presupuestos
  { key: "presupuestos.view", label: "Ver presupuestos", grupo: "Presupuestos" },
  { key: "presupuestos.edit", label: "Crear y editar presupuestos", grupo: "Presupuestos" },

  // Dashboard
  { key: "dashboard.view", label: "Ver panel principal", grupo: "Dashboard" },

  // Admin
  { key: "admin.users", label: "Administrar usuarios y roles", grupo: "Administración" },
  { key: "audit.view", label: "Ver historial de cambios", grupo: "Administración" },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

export const ROLE_DEFS = {
  SUPERADMIN: { nombre: "Super Admin", descripcion: "Acceso total, gestiona usuarios y permisos" },
  VENDEDOR: { nombre: "Vendedor", descripcion: "Acceso a stock y su propia planilla de venta" },
  CONTADORA: { nombre: "Contadora", descripcion: "Gastos administrativos y bancos" },
  ESCRIBANIA: { nombre: "Escribanía", descripcion: "Trámites de escribanía y títulos" },
  ADMINISTRACION: { nombre: "Administración", descripcion: "Acceso amplio de back-office" },
  TALLER: { nombre: "Taller", descripcion: "Gastos de taller y órdenes de trabajo, sin acceso a costos ni ganancias" },
  COSTOS_VEHICULOS: { nombre: "Costos de Vehículos", descripcion: "Solo ve y edita los vehículos donde figura como responsable" },
} as const;

export type RoleKey = keyof typeof ROLE_DEFS;

// Which permissions each seeded role grants. SUPERADMIN bypasses checks entirely
// in the permission engine, but we still give it every key here for consistency
// in the admin UI.
export const ROLE_PERMISSIONS: Record<RoleKey, string[]> = {
  SUPERADMIN: PERMISSION_KEYS,
  VENDEDOR: [
    "dashboard.view",
    "stock.view",
    "stock.create",
    "stock.edit_vehicle_fields",
    "stock.edit_price",
    "stock.edit_patente",
    "stock.move_location",
    "stock.edit_status",
    "ventas.view_own",
    "ventas.create",
    "ventas.edit_own",
    "taller.edit_ordenes",
    "presupuestos.view",
    "presupuestos.edit",
    "docs.generate",
  ],
  CONTADORA: [
    "dashboard.view",
    "contadora.view",
    "contadora.edit",
    "bancos.view",
    "bancos.edit",
    "ventas.view_full",
    "clientes.view",
  ],
  ESCRIBANIA: [
    "dashboard.view",
    "stock.view",
    "escribania.view",
    "escribania.edit",
    "titulos.view",
    "titulos.edit",
    "docs.generate",
    "clientes.view",
  ],
  ADMINISTRACION: [
    "dashboard.view",
    "stock.view",
    "costos.view",
    "costos.edit",
    "ventas.view_full",
    "ventas.create",
    "ventas.edit",
    "bbva.view",
    "bbva.edit",
    "personal.view",
    "personal.edit",
    "propia.view",
    "propia.edit",
    "conforme.generate",
    "deudas.view",
    "deudas.edit",
    "docs.generate",
    "docs.generate_vale",
    "clientes.view",
    "audit.view",
    "taller.view",
    "taller.edit",
    "taller.control_calidad",
    "presupuestos.view",
    "presupuestos.edit",
  ],
  TALLER: [
    "dashboard.view",
    "stock.view",
    "taller.view",
    "taller.edit",
    "presupuestos.view",
    "presupuestos.edit",
  ],
  COSTOS_VEHICULOS: [
    "dashboard.view",
    "costos.view_own",
  ],
};
