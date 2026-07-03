"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";

export async function createGastoContadora(formData: FormData) {
  await assertCan("contadora.edit");

  const tipoComprobante = String(formData.get("tipoComprobante") ?? "FACTURA") as "FACTURA" | "NOTA_CREDITO";
  const fecha = String(formData.get("fecha") ?? "");
  const numeroFactura = String(formData.get("numeroFactura") ?? "").trim();
  const proveedor = String(formData.get("proveedor") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const ivaRate = String(formData.get("ivaRate") ?? "VEINTIDOS") as "EXENTO" | "DIEZ" | "VEINTIDOS";
  const importeTotal = parseFloat(String(formData.get("importeTotalCents") ?? "0")) || 0;

  if (!proveedor) throw new Error("El proveedor es obligatorio");
  if (!fecha) throw new Error("La fecha es obligatoria");

  await db.gastoContadora.create({
    data: {
      tipoComprobante,
      fecha: new Date(fecha),
      numeroFactura: numeroFactura || null,
      proveedor,
      moneda,
      ivaRate,
      importeTotalCents: unitsToCents(importeTotal),
    },
  });

  revalidatePath("/contadora");
}

export async function deleteGastoContadora(id: string) {
  await assertCan("contadora.edit");
  await db.gastoContadora.delete({ where: { id } });
  revalidatePath("/contadora");
}
