"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";
import { financiacionPropiaSchema, deudaClienteSchema } from "./schema";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export async function createFinanciacionPropia(formData: FormData) {
  await assertCan("propia.edit");

  const raw = {
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    clienteNombre: String(formData.get("clienteNombre") ?? ""),
    clienteApellido: String(formData.get("clienteApellido") ?? ""),
    clienteCi: String(formData.get("clienteCi") ?? ""),
    contacto: String(formData.get("contacto") ?? ""),
    montoFinanciadoUsdCents: unitsToCents(parseFloat(String(formData.get("montoFinanciadoUsdCents") ?? "0")) || 0),
    cantidadCuotas: parseInt(String(formData.get("cantidadCuotas") ?? "1"), 10) || 1,
    montoCuotaUsdCents: unitsToCents(parseFloat(String(formData.get("montoCuotaUsdCents") ?? "0")) || 0),
    diaVencimientoMensual: parseInt(String(formData.get("diaVencimientoMensual") ?? "10"), 10) || 10,
  };

  const parsed = financiacionPropiaSchema.safeParse(raw);
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

  const fechaPrimeraCuotaRaw = String(formData.get("fechaPrimeraCuota") ?? "").trim();
  const fechaPrimeraCuota = fechaPrimeraCuotaRaw ? new Date(fechaPrimeraCuotaRaw) : new Date();

  const financiacion = await db.financiacionPropia.create({
    data: {
      clienteId: cliente.id,
      nombre: `${data.clienteNombre} ${data.clienteApellido ?? ""}`.trim(),
      contacto: data.contacto || null,
      vehiculoId: data.vehiculoId || null,
      montoFinanciadoUsdCents: data.montoFinanciadoUsdCents,
      cantidadCuotas: data.cantidadCuotas,
      montoCuotaUsdCents: data.montoCuotaUsdCents,
      fechaPrimeraCuota,
      diaVencimientoMensual: data.diaVencimientoMensual,
    },
  });

  const cuotas = Array.from({ length: data.cantidadCuotas }, (_, i) => ({
    financiacionPropiaId: financiacion.id,
    numero: i + 1,
    montoCents: data.montoCuotaUsdCents,
    fechaVencimiento: addMonths(fechaPrimeraCuota, i),
  }));
  await db.cuotaPropia.createMany({ data: cuotas });

  revalidatePath("/propia");
  redirect(`/propia/${financiacion.id}`);
}

export async function marcarCuotaPagada(financiacionPropiaId: string, cuotaId: string, pagada: boolean) {
  await assertCan("propia.edit");
  await db.cuotaPropia.update({
    where: { id: cuotaId },
    data: { pagada, fechaPago: pagada ? new Date() : null },
  });
  revalidatePath(`/propia/${financiacionPropiaId}`);
  revalidatePath("/propia");
}

export async function createDeuda(formData: FormData) {
  await assertCan("deudas.edit");

  const raw = {
    nombre: String(formData.get("nombre") ?? ""),
    contacto: String(formData.get("contacto") ?? ""),
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    matricula: String(formData.get("matricula") ?? ""),
    concepto: String(formData.get("concepto") ?? ""),
    montoCents: unitsToCents(parseFloat(String(formData.get("montoCents") ?? "0")) || 0),
    moneda: String(formData.get("moneda") ?? "UYU"),
  };

  const parsed = deudaClienteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const cliente = await findOrCreateCliente({ nombre: data.nombre, contacto: data.contacto });

  await db.deudaCliente.create({
    data: {
      clienteId: cliente.id,
      nombre: data.nombre,
      contacto: data.contacto || null,
      vehiculoId: data.vehiculoId || null,
      matricula: data.matricula || null,
      concepto: data.concepto,
      montoCents: data.montoCents,
      moneda: data.moneda,
    },
  });

  revalidatePath("/propia/deudas");
}

export async function marcarDeudaSaldada(id: string, saldado: boolean) {
  await assertCan("deudas.edit");
  await db.deudaCliente.update({ where: { id }, data: { saldado } });
  revalidatePath("/propia/deudas");
}

function conformeStr(formData: FormData, field: string): string | null {
  const v = String(formData.get(field) ?? "").trim();
  return v || null;
}
function conformeDate(formData: FormData, field: string): Date | null {
  const v = String(formData.get(field) ?? "").trim();
  return v ? new Date(v) : null;
}

/** Campos del documento Conforme tomados del formulario (réplica del papel). */
function conformeData(formData: FormData) {
  const estadoRaw = String(formData.get("estado") ?? "PAGADO");
  const estado = ["PENDIENTE", "PAGADO", "VENCIDO"].includes(estadoRaw)
    ? (estadoRaw as "PENDIENTE" | "PAGADO" | "VENCIDO")
    : "PAGADO";
  return {
    montoCuotaCents: unitsToCents(parseFloat(String(formData.get("montoCents") ?? "0")) || 0),
    montoEnLetras: conformeStr(formData, "montoEnLetras"),
    fechaVencimiento: conformeDate(formData, "fechaVencimiento") ?? new Date(),
    fechaPago: conformeDate(formData, "fechaPago") ?? new Date(),
    acreedorNombre: conformeStr(formData, "acreedorNombre") ?? "JORGE DANIEL QUIROGA SANABRIA",
    acreedorCi: conformeStr(formData, "acreedorCi") ?? "3.283.578-8",
    numeroFactura: conformeStr(formData, "numeroFactura"),
    concepto: conformeStr(formData, "concepto") ?? "COMPRA VENTA AUTOMOTOR",
    fechaFactura: conformeDate(formData, "fechaFactura"),
    deudorNombre: conformeStr(formData, "deudorNombre"),
    deudorCedula: conformeStr(formData, "deudorCedula"),
    deudorDomicilio: conformeStr(formData, "deudorDomicilio"),
    deudorDepartamentoDireccion: conformeStr(formData, "deudorDepartamentoDireccion"),
    deudorTelefono: conformeStr(formData, "deudorTelefono"),
    estado,
    vehiculoId: conformeStr(formData, "vehiculoId"),
    vehMarca: conformeStr(formData, "vehMarca"),
    vehModelo: conformeStr(formData, "vehModelo"),
    vehMatricula: conformeStr(formData, "vehMatricula"),
  };
}

export async function generateConforme(financiacionPropiaId: string, cuotaId: string, formData: FormData) {
  await assertCan("conforme.generate");

  const [financiacion, cuota, existente] = await Promise.all([
    db.financiacionPropia.findUniqueOrThrow({ where: { id: financiacionPropiaId } }),
    db.cuotaPropia.findUniqueOrThrow({ where: { id: cuotaId } }),
    db.conforme.findUnique({ where: { cuotaId } }),
  ]);

  // Una cuota tiene un solo conforme: si ya existe, se abre en vez de duplicar.
  if (existente) redirect(`/propia/conformes/${existente.id}`);

  if (!cuota.pagada) {
    throw new Error("Marcá la cuota como pagada antes de generar el conforme.");
  }

  const conforme = await db.conforme.create({
    data: {
      financiacionPropiaId,
      cuotaId,
      cantidadCuotas: financiacion.cantidadCuotas,
      ...conformeData(formData),
    },
  });

  await logAudit({
    accion: "CREAR",
    entidad: "Conforme",
    entidadId: conforme.id,
    descripcion: `Generó un conforme del plan de ${financiacion.nombre}`,
  });

  revalidatePath(`/propia/${financiacionPropiaId}`);
  redirect(`/propia/conformes/${conforme.id}`);
}

export async function updateConforme(conformeId: string, formData: FormData) {
  await assertCan("conforme.generate");
  const conforme = await db.conforme.update({
    where: { id: conformeId },
    data: conformeData(formData),
  });
  await logAudit({
    accion: "EDITAR",
    entidad: "Conforme",
    entidadId: conformeId,
    descripcion: "Editó un conforme",
  });
  revalidatePath(`/propia/conformes/${conformeId}`);
  redirect(`/propia/conformes/${conformeId}`);
}

export async function archiveFinanciacionPropia(id: string) {
  await assertCan("propia.edit");
  const fin = await db.financiacionPropia.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Financiación propia",
    entidadId: id,
    descripcion: `Archivó la financiación propia de ${fin.nombre}`,
  });
  revalidatePath("/propia");
}

export async function restoreFinanciacionPropia(id: string) {
  await assertCan("propia.edit");
  const fin = await db.financiacionPropia.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({
    accion: "EDITAR",
    entidad: "Financiación propia",
    entidadId: id,
    descripcion: `Restauró la financiación propia de ${fin.nombre}`,
  });
  revalidatePath("/propia");
}
