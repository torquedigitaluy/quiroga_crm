"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { financiacionPropiaSchema, deudaClienteSchema, conformeSchema } from "./schema";

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

export async function generateConforme(financiacionPropiaId: string, cuotaId: string, formData: FormData) {
  await assertCan("conforme.generate");

  const raw = {
    firmante1Nombre: String(formData.get("firmante1Nombre") ?? ""),
    firmante1Ci: String(formData.get("firmante1Ci") ?? ""),
    firmante2Nombre: String(formData.get("firmante2Nombre") ?? ""),
    firmante2Ci: String(formData.get("firmante2Ci") ?? ""),
  };
  const parsed = conformeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const [financiacion, cuota] = await Promise.all([
    db.financiacionPropia.findUniqueOrThrow({ where: { id: financiacionPropiaId } }),
    db.cuotaPropia.findUniqueOrThrow({ where: { id: cuotaId } }),
  ]);

  const conforme = await db.conforme.create({
    data: {
      financiacionPropiaId,
      cuotaId,
      montoCuotaCents: cuota.montoCents,
      fechaVencimiento: cuota.fechaVencimiento,
      cantidadCuotas: financiacion.cantidadCuotas,
      firmantes: {
        create: [
          { nombre: data.firmante1Nombre, ci: data.firmante1Ci || null, orden: 1 },
          ...(data.firmante2Nombre
            ? [{ nombre: data.firmante2Nombre, ci: data.firmante2Ci || null, orden: 2 }]
            : []),
        ],
      },
    },
  });

  revalidatePath(`/propia/${financiacionPropiaId}`);
  redirect(`/propia/conformes/${conforme.id}`);
}
