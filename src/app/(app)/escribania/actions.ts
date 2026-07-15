"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";
import { escribaniaSchema } from "./schema";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

function parseTramite(formData: FormData) {
  const raw = {
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    clienteNombre: String(formData.get("clienteNombre") ?? ""),
    clienteApellido: String(formData.get("clienteApellido") ?? ""),
    clienteCi: String(formData.get("clienteCi") ?? ""),
    clienteContacto: String(formData.get("clienteContacto") ?? ""),
    tipoDoc: String(formData.get("tipoDoc") ?? "CV"),
    titulosCon: String(formData.get("titulosCon") ?? "ANALIA"),
    pagoEscribaniaCents: unitsToCents(parseFloat(String(formData.get("pagoEscribaniaCents") ?? "0")) || 0),
    pagoMoneda: String(formData.get("pagoMoneda") ?? "USD"),
    cobroAlCliente: String(formData.get("cobroAlCliente") ?? "CONTADO"),
    cobroMontoCents: unitsToCents(parseFloat(String(formData.get("cobroMontoCents") ?? "0")) || 0),
    ubicacionTitulos: String(formData.get("ubicacionTitulos") ?? "CLIENTE"),
    comentarios: String(formData.get("comentarios") ?? ""),
  };

  const parsed = escribaniaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  return parsed.data;
}

/** Campos de la fila EscribaniaTramite tomados del formulario (sin el cliente). */
function tramiteData(data: ReturnType<typeof parseTramite>, formData: FormData) {
  return {
    fecha: dateOrNull(formData.get("fecha")),
    tipoDoc: data.tipoDoc,
    titulosCon: data.titulosCon,
    fechaFirma: dateOrNull(formData.get("fechaFirma")),
    pagoEscribaniaCents: data.pagoEscribaniaCents,
    pagoMoneda: data.pagoMoneda,
    fechaPago: dateOrNull(formData.get("fechaPago")),
    cobroAlCliente: data.cobroAlCliente,
    cobroMontoCents: data.cobroMontoCents,
    fechaCobro: dateOrNull(formData.get("fechaCobro")),
    fechaEntregaTitulos: dateOrNull(formData.get("fechaEntregaTitulos")),
    ubicacionTitulos: data.ubicacionTitulos,
    comentarios: data.comentarios || null,
  };
}

export async function createTramite(formData: FormData) {
  await assertCan("escribania.edit");
  const data = parseTramite(formData);

  const cliente = await findOrCreateCliente({
    nombre: data.clienteNombre,
    apellido: data.clienteApellido,
    ci: data.clienteCi,
    contacto: data.clienteContacto,
  });

  await db.escribaniaTramite.create({
    data: {
      vehiculoId: data.vehiculoId,
      clienteId: cliente.id,
      ...tramiteData(data, formData),
    },
  });

  revalidatePath("/escribania");
  redirect("/escribania");
}

export async function updateTramite(id: string, formData: FormData) {
  await assertCan("escribania.edit");
  const data = parseTramite(formData);

  const cliente = await findOrCreateCliente({
    nombre: data.clienteNombre,
    apellido: data.clienteApellido,
    ci: data.clienteCi,
    contacto: data.clienteContacto,
  });

  await db.escribaniaTramite.update({
    where: { id },
    data: {
      clienteId: cliente.id,
      ...tramiteData(data, formData),
    },
  });

  revalidatePath("/escribania");
  revalidatePath(`/escribania/${id}`);
  redirect("/escribania");
}

export async function deleteTramite(id: string) {
  await assertCan("escribania.edit");
  const tramite = await db.escribaniaTramite.update({
    where: { id },
    data: { archivedAt: new Date() },
    include: { vehiculo: true },
  });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Trámite de escribanía",
    entidadId: id,
    descripcion: `Archivó el trámite de ${tramite.vehiculo.marca} ${tramite.vehiculo.modelo}`,
  });
  revalidatePath("/escribania");
}

export async function restoreTramite(id: string) {
  await assertCan("escribania.edit");
  const tramite = await db.escribaniaTramite.update({
    where: { id },
    data: { archivedAt: null },
    include: { vehiculo: true },
  });
  await logAudit({
    accion: "EDITAR",
    entidad: "Trámite de escribanía",
    entidadId: id,
    descripcion: `Restauró el trámite de ${tramite.vehiculo.marca} ${tramite.vehiculo.modelo}`,
  });
  revalidatePath("/escribania");
}
