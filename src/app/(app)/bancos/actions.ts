"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";

export async function createMovimiento(cuentaId: string, formData: FormData) {
  await assertCan("bancos.edit");

  const fecha = String(formData.get("fecha") ?? "");
  const detalle = String(formData.get("detalle") ?? "").trim();
  const comentario = String(formData.get("comentario") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "INGRESO") as "INGRESO" | "EGRESO";
  const montoPesos = parseFloat(String(formData.get("montoPesosCents") ?? "0")) || 0;
  const montoUsd = parseFloat(String(formData.get("montoUsdCents") ?? "0")) || 0;

  if (!detalle) throw new Error("El detalle es obligatorio");
  if (!fecha) throw new Error("La fecha es obligatoria");

  await db.movimientoBancario.create({
    data: {
      cuentaId,
      fecha: new Date(fecha),
      detalle,
      comentario: comentario || null,
      tipo,
      montoPesosCents: unitsToCents(montoPesos),
      montoUsdCents: unitsToCents(montoUsd),
    },
  });

  revalidatePath("/bancos");
}

export async function deleteMovimiento(id: string) {
  await assertCan("bancos.edit");
  await db.movimientoBancario.delete({ where: { id } });
  revalidatePath("/bancos");
}

export async function createTransferencia(formData: FormData) {
  await assertCan("bancos.edit");

  const fecha = String(formData.get("fecha") ?? "");
  const cuentaOrigenId = String(formData.get("cuentaOrigenId") ?? "");
  const cuentaDestinoId = String(formData.get("cuentaDestinoId") ?? "");
  const montoPesos = parseFloat(String(formData.get("montoPesosCents") ?? "0")) || 0;
  const montoUsd = parseFloat(String(formData.get("montoUsdCents") ?? "0")) || 0;
  const comision = parseFloat(String(formData.get("comisionBancariaCents") ?? "0")) || 0;
  const comentario = String(formData.get("comentario") ?? "").trim();

  if (!cuentaOrigenId || !cuentaDestinoId) throw new Error("Elegí cuenta de origen y destino");
  if (cuentaOrigenId === cuentaDestinoId) throw new Error("La cuenta de origen y destino no pueden ser la misma");
  if (!fecha) throw new Error("La fecha es obligatoria");

  const montoPesosCents = unitsToCents(montoPesos);
  const montoUsdCents = unitsToCents(montoUsd);
  const comisionCents = unitsToCents(comision);

  const transferencia = await db.transferenciaEntreCuentas.create({
    data: {
      fecha: new Date(fecha),
      cuentaOrigenId,
      cuentaDestinoId,
      montoPesosCents,
      montoUsdCents,
      comisionBancariaCents: comisionCents,
      comentario: comentario || null,
    },
  });

  const detalleOrigen = "Transferencia enviada";
  const detalleDestino = "Transferencia recibida";

  await db.movimientoBancario.create({
    data: {
      cuentaId: cuentaOrigenId,
      fecha: new Date(fecha),
      detalle: detalleOrigen,
      comentario: comentario || null,
      tipo: "EGRESO",
      montoPesosCents,
      montoUsdCents,
      transferenciaId: transferencia.id,
      categoria: "transferencia",
    },
  });
  await db.movimientoBancario.create({
    data: {
      cuentaId: cuentaDestinoId,
      fecha: new Date(fecha),
      detalle: detalleDestino,
      comentario: comentario || null,
      tipo: "INGRESO",
      montoPesosCents,
      montoUsdCents,
      transferenciaId: transferencia.id,
      categoria: "transferencia",
    },
  });

  if (comisionCents > 0) {
    await db.movimientoBancario.create({
      data: {
        cuentaId: cuentaOrigenId,
        fecha: new Date(fecha),
        detalle: "Comisión bancaria por transferencia",
        tipo: "EGRESO",
        montoPesosCents: comisionCents,
        montoUsdCents: 0,
        transferenciaId: transferencia.id,
        categoria: "transferencia",
      },
    });
  }

  revalidatePath("/bancos");
}
