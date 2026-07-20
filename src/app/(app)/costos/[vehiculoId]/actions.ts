"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { unitsToCents, rateToMicros } from "@/lib/money";
import { logAudit } from "@/lib/audit";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

/**
 * Permite editar los costos si el usuario tiene el permiso global `costos.edit`
 * o si es el responsable asignado de ese vehículo.
 */
async function assertPuedeEditarCostos(vehiculoId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const perms = await getEffectivePermissions(user.id);
  if (perms.has("costos.edit")) return user;
  const vehiculo = await db.vehiculo.findUnique({
    where: { id: vehiculoId },
    select: { responsables: { select: { id: true } } },
  });
  if (vehiculo?.responsables.some((r) => r.id === user.id)) return user;
  throw new Error("No autorizado: no sos responsable de este vehículo.");
}

export async function upsertCosteo(vehiculoId: string, formData: FormData) {
  await assertPuedeEditarCostos(vehiculoId);

  const tipoCambio = parseFloat(String(formData.get("tipoCambio") ?? "0")) || 0;
  const precioCompra = parseFloat(String(formData.get("precioCompraUsdCents") ?? "0")) || 0;
  const precioVentaReal = parseFloat(String(formData.get("precioVentaRealUsdCents") ?? "0")) || 0;

  const data = {
    tipoCambioMicros: rateToMicros(tipoCambio),
    fechaCompra: dateOrNull(formData.get("fechaCompra")),
    fechaPublicacion: dateOrNull(formData.get("fechaPublicacion")),
    fechaVenta: dateOrNull(formData.get("fechaVenta")),
    precioCompraUsdCents: unitsToCents(precioCompra),
    precioVentaRealUsdCents: unitsToCents(precioVentaReal),
  };

  await db.vehiculoCosteo.upsert({
    where: { vehiculoId },
    update: data,
    create: { vehiculoId, ...data },
  });

  revalidatePath(`/costos/${vehiculoId}`);
}

export async function addGasto(vehiculoId: string, formData: FormData) {
  await assertPuedeEditarCostos(vehiculoId);

  const costeo = await db.vehiculoCosteo.upsert({
    where: { vehiculoId },
    update: {},
    create: { vehiculoId },
  });

  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "USD") as "UYU" | "USD";
  const monto = parseFloat(String(formData.get("montoCents") ?? "0")) || 0;

  if (!descripcion) throw new Error("La descripción es obligatoria");

  await db.gastoLine.create({
    data: {
      costeoId: costeo.id,
      descripcion,
      moneda,
      montoCents: unitsToCents(monto),
    },
  });

  revalidatePath(`/costos/${vehiculoId}`);
}

export async function deleteGasto(vehiculoId: string, gastoId: string) {
  await assertPuedeEditarCostos(vehiculoId);
  const gasto = await db.gastoLine.findUnique({ where: { id: gastoId } });
  await db.gastoLine.delete({ where: { id: gastoId } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Gasto de vehículo",
    entidadId: gastoId,
    descripcion: gasto ? `Eliminó el gasto "${gasto.descripcion}"` : `Eliminó un gasto de costos (${gastoId})`,
  });
  revalidatePath(`/costos/${vehiculoId}`);
}
