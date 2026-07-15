"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { logAudit } from "@/lib/audit";
import { creditoBBVASchema } from "./schema";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

export async function createCreditoBBVA(formData: FormData) {
  await assertCan("bbva.edit");

  const raw = {
    nombre: String(formData.get("nombre") ?? ""),
    ci: String(formData.get("ci") ?? ""),
    contacto: String(formData.get("contacto") ?? ""),
    montoSolicitadoUsdCents: unitsToCents(parseFloat(String(formData.get("montoSolicitadoUsdCents") ?? "0")) || 0),
    estado: String(formData.get("estado") ?? "PENDIENTE"),
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
  };

  const parsed = creditoBBVASchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await db.creditoBBVA.create({
    data: {
      nombre: data.nombre,
      ci: data.ci || null,
      contacto: data.contacto || null,
      montoSolicitadoUsdCents: data.montoSolicitadoUsdCents,
      estado: data.estado,
      fechaFirma: dateOrNull(formData.get("fechaFirma")),
      vehiculoId: data.vehiculoId || null,
    },
  });

  revalidatePath("/bbva");
  redirect("/bbva");
}

export async function updateEstadoCredito(id: string, estado: string) {
  await assertCan("bbva.edit");
  await db.creditoBBVA.update({ where: { id }, data: { estado: estado as "PENDIENTE" | "APROBADO" | "RECHAZADO" } });
  revalidatePath("/bbva");
}

export async function archiveCreditoBBVA(id: string) {
  await assertCan("bbva.edit");
  const credito = await db.creditoBBVA.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Crédito BBVA",
    entidadId: id,
    descripcion: `Archivó el crédito BBVA de ${credito.nombre}`,
  });
  revalidatePath("/bbva");
}

export async function restoreCreditoBBVA(id: string) {
  await assertCan("bbva.edit");
  const credito = await db.creditoBBVA.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({
    accion: "EDITAR",
    entidad: "Crédito BBVA",
    entidadId: id,
    descripcion: `Restauró el crédito BBVA de ${credito.nombre}`,
  });
  revalidatePath("/bbva");
}
