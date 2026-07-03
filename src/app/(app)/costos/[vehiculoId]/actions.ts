"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents, rateToMicros } from "@/lib/money";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

export async function upsertCosteo(vehiculoId: string, formData: FormData) {
  await assertCan("costos.edit");

  const tipoCambio = parseFloat(String(formData.get("tipoCambio") ?? "0")) || 0;
  const precioCompra = parseFloat(String(formData.get("precioCompraUsdCents") ?? "0")) || 0;
  const valorPatente = parseFloat(String(formData.get("valorPatenteUsdCents") ?? "0")) || 0;
  const cantCuotas = parseInt(String(formData.get("cantCuotasPatentePagas") ?? "0"), 10) || 0;
  const precioVentaReal = parseFloat(String(formData.get("precioVentaRealUsdCents") ?? "0")) || 0;

  const data = {
    tipoCambioMicros: rateToMicros(tipoCambio),
    fechaCompra: dateOrNull(formData.get("fechaCompra")),
    fechaPublicacion: dateOrNull(formData.get("fechaPublicacion")),
    fechaVenta: dateOrNull(formData.get("fechaVenta")),
    precioCompraUsdCents: unitsToCents(precioCompra),
    valorPatenteUsdCents: unitsToCents(valorPatente),
    cantCuotasPatentePagas: cantCuotas,
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
  await assertCan("costos.edit");

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
  await assertCan("costos.edit");
  await db.gastoLine.delete({ where: { id: gastoId } });
  revalidatePath(`/costos/${vehiculoId}`);
}
