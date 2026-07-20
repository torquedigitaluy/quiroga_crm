import { db } from "@/lib/db";

/**
 * Deriva quién puede editar los costos de un vehículo a partir del texto de
 * "Propietario": si dice "Jorge", "Pepe", "Emilio" y/o "Francisco" (en cualquier
 * combinación), esos son los responsables. Cualquier otro valor (p.ej.
 * "Consignado") no asigna responsable — solo lo puede tocar quien tenga el
 * permiso general `costos.edit` (Administración / Jorge como superadmin).
 */
const PROPIETARIOS_CONOCIDOS = ["Jorge", "Pepe", "Emilio", "Francisco"];

export async function resolveResponsableIds(propietario: string | null | undefined): Promise<string[]> {
  if (!propietario) return [];
  const p = propietario.toLowerCase();
  const nombres = PROPIETARIOS_CONOCIDOS.filter((n) => p.includes(n.toLowerCase()));
  if (nombres.length === 0) return [];

  const usuarios = await db.user.findMany({ where: { nombre: { in: nombres } }, select: { id: true } });
  return usuarios.map((u) => u.id);
}
