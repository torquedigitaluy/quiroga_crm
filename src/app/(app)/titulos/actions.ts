"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";
import { financiacionTituloSchema } from "./schema";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

export async function createFinanciacionTitulo(formData: FormData) {
  await assertCan("titulos.edit");

  const raw = {
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    clienteNombre: String(formData.get("clienteNombre") ?? ""),
    clienteApellido: String(formData.get("clienteApellido") ?? ""),
    clienteCi: String(formData.get("clienteCi") ?? ""),
    contacto: String(formData.get("contacto") ?? ""),
    costoEscribaniaCents: unitsToCents(parseFloat(String(formData.get("costoEscribaniaCents") ?? "0")) || 0),
    costoMoneda: String(formData.get("costoMoneda") ?? "USD"),
    cartaDePago: formData.get("cartaDePago") === "on",
    formaPago: String(formData.get("formaPago") ?? "CONTADO"),
  };

  const parsed = financiacionTituloSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const cliente = await findOrCreateCliente({
    nombre: data.clienteNombre,
    apellido: data.clienteApellido,
    ci: data.clienteCi,
    contacto: data.contacto,
  });

  const financiacion = await db.financiacionTitulo.create({
    data: {
      vehiculoId: data.vehiculoId,
      clienteId: cliente.id,
      contacto: data.contacto || null,
      fechaVenta: dateOrNull(formData.get("fechaVenta")),
      fechaFirma: dateOrNull(formData.get("fechaFirma")),
      costoEscribaniaCents: data.costoEscribaniaCents,
      costoMoneda: data.costoMoneda,
      cartaDePago: data.cartaDePago,
      formaPago: data.formaPago,
    },
  });

  revalidatePath("/titulos");
  redirect(`/titulos/${financiacion.id}`);
}

export async function addEntrega(financiacionTituloId: string, formData: FormData) {
  await assertCan("titulos.edit");

  const monto = parseFloat(String(formData.get("montoCents") ?? "0")) || 0;
  const fecha = String(formData.get("fecha") ?? "").trim();

  const count = await db.entregaTitulo.count({ where: { financiacionTituloId } });

  await db.entregaTitulo.create({
    data: {
      financiacionTituloId,
      numero: count + 1,
      montoCents: unitsToCents(monto),
      fecha: fecha ? new Date(fecha) : null,
    },
  });

  revalidatePath(`/titulos/${financiacionTituloId}`);
  revalidatePath("/titulos");
}

export async function deleteEntrega(financiacionTituloId: string, entregaId: string) {
  await assertCan("titulos.edit");
  await db.entregaTitulo.delete({ where: { id: entregaId } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Entrega de título",
    entidadId: entregaId,
    descripcion: `Eliminó una entrega de la financiación de títulos ${financiacionTituloId}`,
  });
  revalidatePath(`/titulos/${financiacionTituloId}`);
  revalidatePath("/titulos");
}
