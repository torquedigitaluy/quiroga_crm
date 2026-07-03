"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan, getEffectivePermissions, getCurrentUser } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
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
  return raw;
}

export async function createVehiculo(formData: FormData) {
  await assertCan("stock.create");
  const raw = formDataToRaw(formData);
  const parsed = createVehiculoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const vehiculo = await db.vehiculo.create({ data: parsed.data });
  revalidatePath("/stock");
  redirect(`/stock/${vehiculo.id}`);
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

  await db.vehiculo.update({ where: { id }, data: allowed });
  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
}

export async function deleteVehiculo(id: string) {
  await assertCan("stock.delete");
  await db.vehiculo.delete({ where: { id } });
  revalidatePath("/stock");
  redirect("/stock");
}
