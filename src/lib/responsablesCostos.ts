import { db } from "@/lib/db";

/**
 * Deriva quién puede editar los costos de un vehículo a partir del texto de
 * "Propietario": si dice "Jorge" y/o "Pepe" (en cualquier combinación), esos
 * son los responsables. Cualquier otro valor (p.ej. "Consignado") no asigna
 * responsable — solo lo puede tocar quien tenga el permiso general
 * `costos.edit` (Administración / Jorge como superadmin).
 */
export async function resolveResponsableIds(propietario: string | null | undefined): Promise<string[]> {
  if (!propietario) return [];
  const p = propietario.toLowerCase();
  const nombres: string[] = [];
  if (p.includes("jorge")) nombres.push("Jorge");
  if (p.includes("pepe")) nombres.push("Pepe");
  if (nombres.length === 0) return [];

  const usuarios = await db.user.findMany({ where: { nombre: { in: nombres } }, select: { id: true } });
  return usuarios.map((u) => u.id);
}
