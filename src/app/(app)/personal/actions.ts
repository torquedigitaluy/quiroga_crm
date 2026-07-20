"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { logAudit } from "@/lib/audit";

export async function createEmpleado(formData: FormData) {
  await assertCan("personal.edit");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const tipoPago = String(formData.get("tipoPago") ?? "MENSUAL") as "MENSUAL" | "JORNAL";
  const sueldoMensual = parseFloat(String(formData.get("sueldoMensualCents") ?? "0")) || 0;
  const jornalDiario = parseFloat(String(formData.get("jornalDiarioCents") ?? "0")) || 0;

  if (!nombre) throw new Error("El nombre es obligatorio");

  await db.empleado.create({
    data: {
      nombre,
      apellido: apellido || null,
      tipoPago,
      sueldoMensualCents: tipoPago === "MENSUAL" ? unitsToCents(sueldoMensual) : null,
      jornalDiarioCents: tipoPago === "JORNAL" ? unitsToCents(jornalDiario) : null,
    },
  });

  revalidatePath("/personal");
}

export async function setAsistencia(empleadoId: string, fechaIso: string, estado: string) {
  await assertCan("personal.edit");
  const fecha = new Date(fechaIso);

  await db.asistenciaDia.upsert({
    where: { empleadoId_fecha: { empleadoId, fecha } },
    update: { estado: estado as "PRESENTE" | "MEDIO_DIA" | "LICENCIA" | "ENFERMO" | "AUSENTE" },
    create: { empleadoId, fecha, estado: estado as "PRESENTE" | "MEDIO_DIA" | "LICENCIA" | "ENFERMO" | "AUSENTE" },
  });

  revalidatePath("/personal/asistencia");
}

export async function addComentarioAsistencia(anio: number, mes: number, formData: FormData) {
  const user = await assertCan("personal.edit");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) throw new Error("El comentario no puede estar vacío");

  const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { nombre: true } });

  await db.comentarioAsistencia.create({
    data: { anio, mes, texto, autorId: user.id, autorNombre: dbUser?.nombre ?? user.name ?? user.email ?? null },
  });

  revalidatePath("/personal/asistencia");
}

export async function updateComentarioAsistencia(id: string, formData: FormData) {
  await assertCan("personal.edit");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) throw new Error("El comentario no puede estar vacío");

  await db.comentarioAsistencia.update({ where: { id }, data: { texto } });

  revalidatePath("/personal/asistencia");
}

export async function deleteComentarioAsistencia(id: string) {
  await assertCan("personal.edit");
  await db.comentarioAsistencia.delete({ where: { id } });
  revalidatePath("/personal/asistencia");
}

export async function addDescuento(empleadoId: string, formData: FormData) {
  await assertCan("personal.edit");

  const concepto = String(formData.get("concepto") ?? "").trim();
  const monto = parseFloat(String(formData.get("montoCents") ?? "0")) || 0;
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const fecha = String(formData.get("fecha") ?? "");

  if (!concepto) throw new Error("El concepto es obligatorio");

  await db.descuentoEmpleado.create({
    data: {
      empleadoId,
      concepto,
      montoCents: unitsToCents(monto),
      moneda,
      fecha: fecha ? new Date(fecha) : new Date(),
    },
  });

  revalidatePath(`/personal/${empleadoId}`);
}

export async function deleteDescuento(empleadoId: string, descuentoId: string) {
  await assertCan("personal.edit");
  const desc = await db.descuentoEmpleado.findUnique({ where: { id: descuentoId } });
  await db.descuentoEmpleado.delete({ where: { id: descuentoId } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Descuento de empleado",
    entidadId: descuentoId,
    descripcion: desc ? `Eliminó el descuento "${desc.concepto}"` : `Eliminó un descuento (${descuentoId})`,
  });
  revalidatePath(`/personal/${empleadoId}`);
}
