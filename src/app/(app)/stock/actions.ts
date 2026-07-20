"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan, getEffectivePermissions, getCurrentUser } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { logAudit } from "@/lib/audit";
import { resolveResponsableIds } from "@/lib/responsablesCostos";
import { createVehiculoSchema, vehiculoSchema, type VehiculoInput } from "./schema";

const VEHICLE_FIELDS = [
  "marca",
  "modelo",
  "version",
  "anio",
  "color",
  "km",
  "motor",
  "transmision",
  "matricula",
  "padron",
  "chasis",
  "segundaLlave",
  "ubicacionLibreta",
  "comentarios",
  "esVehiculo",
] as const;

/** Maps each updatable field to the permission required to change it. */
const FIELD_PERMISSIONS: Record<string, string> = Object.fromEntries(
  VEHICLE_FIELDS.map((f) => [f, "stock.edit_vehicle_fields"]),
);
FIELD_PERMISSIONS.precioVentaUsdCents = "stock.edit_price";
FIELD_PERMISSIONS.patenteCuotaCents = "stock.edit_patente";
FIELD_PERMISSIONS.patenteAnualCents = "stock.edit_patente";
FIELD_PERMISSIONS.ubicacion = "stock.move_location";
FIELD_PERMISSIONS.estado = "stock.edit_status";
FIELD_PERMISSIONS.propietario = "stock.edit_owner";
FIELD_PERMISSIONS.tipoPropiedad = "stock.edit_owner";

function formDataToRaw(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value === "") continue;
    raw[key] = value;
  }
  // Money fields arrive from the form in dollar units; convert to cents.
  for (const moneyField of ["precioVentaUsdCents", "patenteCuotaCents", "patenteAnualCents"]) {
    if (raw[moneyField] !== undefined) {
      raw[moneyField] = unitsToCents(parseFloat(String(raw[moneyField])));
    }
  }
  raw.segundaLlave = formData.get("segundaLlave") === "on" || formData.get("segundaLlave") === "true";
  if (formData.has("esVehiculo")) {
    raw.esVehiculo = formData.get("esVehiculo") !== "false";
  }
  return raw;
}

export async function createVehiculo(formData: FormData) {
  await assertCan("stock.create");
  const raw = formDataToRaw(formData);
  const parsed = createVehiculoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  // Va al final del orden manual, con hueco para que el drag & drop siempre
  // tenga slots distintos con los que reordenar.
  const ultimo = await db.vehiculo.findFirst({ orderBy: { orden: "desc" }, select: { orden: true } });
  const responsableIds = await resolveResponsableIds(parsed.data.propietario);
  const vehiculo = await db.vehiculo.create({
    data: {
      ...parsed.data,
      orden: (ultimo?.orden ?? 0) + 100,
      responsables: { connect: responsableIds.map((id) => ({ id })) },
    },
  });
  await logAudit({
    accion: "CREAR",
    entidad: "Vehículo",
    entidadId: vehiculo.id,
    descripcion: `Creó el vehículo ${vehiculo.marca} ${vehiculo.modelo}${vehiculo.matricula ? ` (${vehiculo.matricula})` : ""}`,
  });
  revalidatePath("/stock");
  redirect(vehiculo.esVehiculo ? `/stock/${vehiculo.id}` : "/stock?tab=accesorios");
}

export async function updateVehiculo(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perms = await getEffectivePermissions(user.id);

  const raw = formDataToRaw(formData);
  const parsed = vehiculoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  // Only keep fields the caller is actually permitted to change (defense in
  // depth — the UI already hides fields the user can't edit).
  const allowed: Partial<VehiculoInput> = {};
  for (const [field, value] of Object.entries(parsed.data)) {
    const requiredPermission = FIELD_PERMISSIONS[field];
    if (requiredPermission && perms.has(requiredPermission)) {
      (allowed as Record<string, unknown>)[field] = value;
    }
  }

  if (Object.keys(allowed).length === 0) {
    throw new Error("No tenés permiso para editar estos campos.");
  }

  const updateData: Record<string, unknown> = { ...allowed };
  // El propietario se editó en este submit: recalcula quién es responsable
  // de costos a partir del nuevo valor.
  if ("propietario" in allowed) {
    const responsableIds = await resolveResponsableIds(allowed.propietario);
    updateData.responsables = { set: responsableIds.map((rid) => ({ id: rid })) };
  }

  await db.vehiculo.update({ where: { id }, data: updateData });
  await logAudit({
    accion: "EDITAR",
    entidad: "Vehículo",
    entidadId: id,
    descripcion: `Editó campos: ${Object.keys(allowed).join(", ")}`,
  });
  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
}

/**
 * Reordena el listado de stock (drag & drop). Recibe los ids visibles en su
 * nuevo orden y les reasigna los mismos "slots" de orden que ya ocupaban entre
 * ellos. Así el orden manual funciona aunque haya filtros aplicados: los
 * vehículos que no se ven no cambian de lugar.
 */
export async function reordenarVehiculos(ids: string[]) {
  await assertCan("stock.edit_vehicle_fields");
  if (ids.length < 2) return;

  const vehiculos = await db.vehiculo.findMany({
    where: { id: { in: ids } },
    select: { id: true, orden: true },
  });
  if (vehiculos.length !== ids.length) throw new Error("Alguno de los vehículos ya no existe.");

  const slots = vehiculos.map((v) => v.orden).sort((a, b) => a - b);

  await db.$transaction(
    ids.map((id, i) => db.vehiculo.update({ where: { id }, data: { orden: slots[i] } })),
  );

  revalidatePath("/stock");
}

export async function deleteVehiculo(id: string) {
  await assertCan("stock.delete");
  const vehiculo = await db.vehiculo.findUnique({ where: { id } });
  await db.vehiculo.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Vehículo",
    entidadId: id,
    descripcion: vehiculo
      ? `Archivó el vehículo ${vehiculo.marca} ${vehiculo.modelo}${vehiculo.matricula ? ` (${vehiculo.matricula})` : ""}`
      : `Archivó un vehículo (${id})`,
  });
  revalidatePath("/stock");
  redirect("/stock");
}

export async function restoreVehiculo(id: string) {
  await assertCan("stock.delete");
  const vehiculo = await db.vehiculo.findUnique({ where: { id } });
  await db.vehiculo.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({
    accion: "EDITAR",
    entidad: "Vehículo",
    entidadId: id,
    descripcion: vehiculo
      ? `Restauró el vehículo ${vehiculo.marca} ${vehiculo.modelo}${vehiculo.matricula ? ` (${vehiculo.matricula})` : ""}`
      : `Restauró un vehículo (${id})`,
  });
  revalidatePath("/stock");
}
