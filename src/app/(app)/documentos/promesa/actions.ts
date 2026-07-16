"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
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

function bool(formData: FormData, field: string): boolean {
  return String(formData.get(field) ?? "") === "true";
}

function buildData(formData: FormData) {
  return {
    ventaId: str(formData, "ventaId"),
    vehiculoId: str(formData, "vehiculoId"),
    clienteId: str(formData, "clienteId"),
    fecha: str(formData, "fecha") ? new Date(String(formData.get("fecha"))) : new Date(),
    vendedores: str(formData, "vendedores"),

    vehMarca: str(formData, "vehMarca"),
    vehModelo: str(formData, "vehModelo"),
    vehTipo: str(formData, "vehTipo"),
    vehColor: str(formData, "vehColor"),
    vehAnio: intOrNull(formData, "vehAnio"),
    vehMatricula: str(formData, "vehMatricula"),
    vehMotor: str(formData, "vehMotor"),
    vehChasis: str(formData, "vehChasis"),

    clienteNombre: str(formData, "clienteNombre"),
    clienteApellido: str(formData, "clienteApellido"),
    clienteCi: str(formData, "clienteCi"),
    clienteDomicilio: str(formData, "clienteDomicilio"),
    clienteCiudad: str(formData, "clienteCiudad"),
    clienteContacto: str(formData, "clienteContacto"),
    clienteEstadoCivil: str(formData, "clienteEstadoCivil"),
    clienteNombre2: str(formData, "clienteNombre2"),
    clienteMail: str(formData, "clienteMail"),

    financia: bool(formData, "financia"),
    financiaCon: str(formData, "financiaCon"),

    senaUsdCents: centsOrNull(formData, "senaUsdCents"),
    pagoRetiroUnidadUsdCents: centsOrNull(formData, "pagoRetiroUnidadUsdCents"),
    capitalFinanciadoUsdCents: centsOrNull(formData, "capitalFinanciadoUsdCents"),
    conformesUsdCents: centsOrNull(formData, "conformesUsdCents"),
    valorTomaAutoUsdCents: centsOrNull(formData, "valorTomaAutoUsdCents"),
    totalUsdCents: centsOrNull(formData, "totalUsdCents"),

    costoTitulosUsdCents: centsOrNull(formData, "costoTitulosUsdCents"),
    cartaPagoUsdCents: centsOrNull(formData, "cartaPagoUsdCents"),
    entregaCuentaTitulosUsdCents: centsOrNull(formData, "entregaCuentaTitulosUsdCents"),

    seguro: bool(formData, "seguro"),
    aseguradora: str(formData, "aseguradora"),
    cobertura: str(formData, "cobertura"),

    cesionDerechos: bool(formData, "cesionDerechos"),
    cesionANombreDe: str(formData, "cesionANombreDe"),

    observaciones: str(formData, "observaciones"),

    permutaMarca: str(formData, "permutaMarca"),
    permutaModelo: str(formData, "permutaModelo"),
    permutaTipo: str(formData, "permutaTipo"),
    permutaColor: str(formData, "permutaColor"),
    permutaLlaves: str(formData, "permutaLlaves"),
    permutaAnio: intOrNull(formData, "permutaAnio"),
    permutaMatricula: str(formData, "permutaMatricula"),
    permutaMotor: str(formData, "permutaMotor"),
    permutaChasis: str(formData, "permutaChasis"),
  };
}

export async function createPromesa(formData: FormData) {
  const user = await assertCan("docs.generate");

  const promesa = await db.promesaCompraventa.create({
    data: { ...buildData(formData), creadoPorId: user.id },
  });

  await logAudit({
    accion: "CREAR",
    entidad: "Promesa de Compraventa",
    entidadId: promesa.id,
    descripcion: `Creó la promesa de compraventa N° ${promesa.numero}`,
  });

  revalidatePath("/documentos");
  redirect(`/documentos/promesa/${promesa.id}`);
}

export async function updatePromesa(id: string, formData: FormData) {
  await assertCan("docs.generate");

  await db.promesaCompraventa.update({
    where: { id },
    data: buildData(formData),
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Promesa de Compraventa",
    entidadId: id,
    descripcion: "Editó la promesa de compraventa",
  });

  revalidatePath("/documentos");
  revalidatePath(`/documentos/promesa/${id}`);
}

export async function archivePromesa(id: string) {
  await assertCan("docs.generate");
  await db.promesaCompraventa.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({ accion: "ELIMINAR", entidad: "Promesa de Compraventa", entidadId: id, descripcion: "Archivó la promesa de compraventa" });
  revalidatePath("/documentos");
  redirect("/documentos");
}

export async function restorePromesa(id: string) {
  await assertCan("docs.generate");
  await db.promesaCompraventa.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({ accion: "EDITAR", entidad: "Promesa de Compraventa", entidadId: id, descripcion: "Restauró la promesa de compraventa" });
  revalidatePath("/documentos");
}
