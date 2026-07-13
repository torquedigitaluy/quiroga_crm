"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";

async function getGastosTallerCuenta() {
  return db.cuentaBancaria.upsert({
    where: { nombre: "GASTOS_TALLER" },
    update: {},
    create: { nombre: "GASTOS_TALLER" },
  });
}

export async function createGastoTaller(formData: FormData) {
  await assertCan("taller.edit");

  const fecha = String(formData.get("fecha") ?? "");
  const detalle = String(formData.get("detalle") ?? "").trim();
  const montoPesos = parseFloat(String(formData.get("montoPesosCents") ?? "0")) || 0;
  const montoUsd = parseFloat(String(formData.get("montoUsdCents") ?? "0")) || 0;

  if (!detalle) throw new Error("La descripción es obligatoria");
  if (!fecha) throw new Error("La fecha es obligatoria");

  const cuenta = await getGastosTallerCuenta();

  await db.movimientoBancario.create({
    data: {
      cuentaId: cuenta.id,
      fecha: new Date(fecha),
      detalle,
      tipo: "EGRESO",
      montoPesosCents: unitsToCents(montoPesos),
      montoUsdCents: unitsToCents(montoUsd),
      categoria: "taller",
    },
  });

  revalidatePath("/taller");
}
