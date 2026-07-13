// Etiquetas y orden de los locales donde se puede vender un vehículo.
// El valor es el enum LocalVenta de Prisma; el label es lo que ve el usuario.

export const LOCAL_VENTA_OPTIONS = [
  { value: "SAN_LUIS", label: "San Luis" },
  { value: "ZONAMERICA", label: "Zonamérica" },
  { value: "SHOPPINGCAR", label: "Shoppingcar" },
  { value: "SANTA_ROSA", label: "Santa Rosa" },
  { value: "AUTOBULEVAR", label: "AutoBulevar" },
  { value: "PEDERNAL", label: "Pedernal Automóviles" },
  { value: "HOMERO_DE_LEON", label: "Homero de León" },
  { value: "CONCORDE", label: "Concorde" },
  { value: "ROVEIRA", label: "Roveira" },
] as const;

export const LOCAL_VENTA_LABELS: Record<string, string> = Object.fromEntries(
  LOCAL_VENTA_OPTIONS.map((o) => [o.value, o.label]),
);

export function localVentaLabel(value: string): string {
  return LOCAL_VENTA_LABELS[value] ?? value;
}
