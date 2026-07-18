"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";

function str(formData: FormData, field: string): string | null {
  const v = String(formData.get(field) ?? "").trim();
  return v || null;
}

function intOrNull(formData: FormData, field: string): number | null {
  const v = String(formData.get(field) ?? "").trim();
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function centsOrNull(formData: FormData, field: string): number | null {
  const v = String(formData.get(field) ?? "").trim();
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : unitsToCents(n);
}

async function buildData(formData: FormData) {
  const financiacionPropiaId = str(formData, "financiacionPropiaId");

  let clienteId: string | null = null;
  const clienteNombre = str(formData, "clienteNombre");
  if (clienteNombre) {
    const cliente = await findOrCreateCliente({ nombre: clienteNombre, contacto: str(formData, "clienteContacto") ?? undefined });
    clienteId = cliente.id;
  }

  return {
    financiacionPropiaId,
    clienteId,
    fecha: str(formData, "fecha") ? new Date(String(formData.get("fecha"))) : new Date(),
    // Importes del vale (en la moneda elegida)
    moneda: (String(formData.get("moneda") ?? "UYU") === "USD" ? "USD" : "UYU") as "UYU" | "USD",
    totalPesosCents: centsOrNull(formData, "totalPesosCents"),
    totalEnLetras: str(formData, "totalEnLetras"),
    capitalPrestadoPesosCents: centsOrNull(formData, "capitalPrestadoPesosCents"),
    montoCuotaPesosCents: centsOrNull(formData, "montoCuotaPesosCents"),
    montoCuotaEnLetras: str(formData, "montoCuotaEnLetras"),
    acreedores: str(formData, "acreedores"),
    cantidadCuotas: intOrNull(formData, "cantidadCuotas"),
    diaVencimientoMensual: intOrNull(formData, "diaVencimientoMensual"),
    fechaPrimeraCuota: str(formData, "fechaPrimeraCuota") ? new Date(String(formData.get("fechaPrimeraCuota"))) : null,
    firmante1Nombre: str(formData, "firmante1Nombre"),
    firmante1Ci: str(formData, "firmante1Ci"),
    firmante1Domicilio: str(formData, "firmante1Domicilio"),
    firmante2Nombre: str(formData, "firmante2Nombre"),
    firmante2Ci: str(formData, "firmante2Ci"),
    firmante2Domicilio: str(formData, "firmante2Domicilio"),
    firmante3Nombre: str(formData, "firmante3Nombre"),
    firmante3Ci: str(formData, "firmante3Ci"),
    firmante3Domicilio: str(formData, "firmante3Domicilio"),
  };
}

export async function createVale(formData: FormData) {
  const user = await assertCan("docs.generate_vale");

  const vale = await db.vale.create({
    data: { ...(await buildData(formData)), creadoPorId: user.id },
  });

  await logAudit({
    accion: "CREAR",
    entidad: "Vale",
    entidadId: vale.id,
    descripcion: `Creó el vale N° ${vale.numero}`,
  });

  revalidatePath("/documentos");
  redirect(`/documentos/vale/${vale.id}`);
}

export async function updateVale(id: string, formData: FormData) {
  await assertCan("docs.generate_vale");

  await db.vale.update({
    where: { id },
    data: await buildData(formData),
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Vale",
    entidadId: id,
    descripcion: "Editó el vale",
  });

  revalidatePath("/documentos");
  revalidatePath(`/documentos/vale/${id}`);
}

export async function archiveVale(id: string) {
  await assertCan("docs.generate_vale");
  await db.vale.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({ accion: "ELIMINAR", entidad: "Vale", entidadId: id, descripcion: "Archivó el vale" });
  revalidatePath("/documentos");
  redirect("/documentos");
}

export async function restoreVale(id: string) {
  await assertCan("docs.generate_vale");
  await db.vale.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({ accion: "EDITAR", entidad: "Vale", entidadId: id, descripcion: "Restauró el vale" });
  revalidatePath("/documentos");
}
