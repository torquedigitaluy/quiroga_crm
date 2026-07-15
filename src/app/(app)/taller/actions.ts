"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { logAudit } from "@/lib/audit";

const CHECKLIST_DEFAULT = ["Mecánica", "Electricidad", "Chapa", "Pintura", "Lavado", "Documentación", "Entrega"];

async function filesToDataUrls(formData: FormData, field: string): Promise<string[]> {
  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    urls.push(`data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`);
  }
  return urls;
}

export async function createOrdenTaller(formData: FormData) {
  await assertCan("taller.edit");

  const origenVehiculo = String(formData.get("origenVehiculo") ?? "stock");
  const vehiculoId = origenVehiculo === "stock" ? String(formData.get("vehiculoId") ?? "").trim() : "";
  const vehiculoExterno = origenVehiculo === "externo" ? String(formData.get("vehiculoExterno") ?? "").trim() : "";

  if (!vehiculoId && !vehiculoExterno) {
    throw new Error("Elegí un vehículo de stock o describí el vehículo externo");
  }

  const tipoServicio = String(formData.get("tipoServicio") ?? "MANTENIMIENTO") as
    | "MANTENIMIENTO"
    | "DIAGNOSTICO"
    | "REPARACION"
    | "OTRO";
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "");
  const responsable = String(formData.get("responsable") ?? "").trim();
  const problema = String(formData.get("problema") ?? "").trim();

  if (!problema) throw new Error("Describí el problema o lo que tiene el vehículo");

  const imagenes = await filesToDataUrls(formData, "imagenes");

  const orden = await db.ordenTaller.create({
    data: {
      vehiculoId: vehiculoId || null,
      vehiculoExterno: vehiculoExterno || null,
      tipoServicio,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
      problema,
      responsable: responsable || null,
      checklist: { create: CHECKLIST_DEFAULT.map((tarea, i) => ({ tarea, orden: i })) },
      imagenes: { create: imagenes.map((dataUrl) => ({ dataUrl })) },
    },
  });

  await logAudit({
    accion: "CREAR",
    entidad: "Orden de taller",
    entidadId: orden.id,
    descripcion: `Creó la orden de taller "${problema}"`,
  });

  revalidatePath("/taller");
  redirect(`/taller/ordenes/${orden.id}`);
}

export async function updateOrdenTaller(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");

  const tipoServicio = String(formData.get("tipoServicio") ?? "MANTENIMIENTO") as
    | "MANTENIMIENTO"
    | "DIAGNOSTICO"
    | "REPARACION"
    | "OTRO";
  const estado = String(formData.get("estado") ?? "PENDIENTE") as
    | "PENDIENTE"
    | "EN_PROCESO"
    | "ESPERANDO_REPUESTOS"
    | "ESPERANDO_APROBACION"
    | "FINALIZADA"
    | "ENTREGADA";
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "");
  const fechaFinalizacion = String(formData.get("fechaFinalizacion") ?? "");
  const responsable = String(formData.get("responsable") ?? "").trim();
  const problema = String(formData.get("problema") ?? "").trim();
  const trabajosRealizados = String(formData.get("trabajosRealizados") ?? "").trim();
  const observaciones = String(formData.get("observaciones") ?? "").trim();
  const manoDeObra = parseFloat(String(formData.get("manoDeObraCents") ?? "0")) || 0;

  if (!problema) throw new Error("Describí el problema o lo que tiene el vehículo");

  await db.ordenTaller.update({
    where: { id: ordenId },
    data: {
      tipoServicio,
      estado,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
      fechaFinalizacion: fechaFinalizacion ? new Date(fechaFinalizacion) : null,
      responsable: responsable || null,
      problema,
      trabajosRealizados: trabajosRealizados || null,
      observaciones: observaciones || null,
      manoDeObraCents: unitsToCents(manoDeObra),
    },
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Orden de taller",
    entidadId: ordenId,
    descripcion: `Editó la orden de taller "${problema}"`,
  });

  revalidatePath(`/taller/ordenes/${ordenId}`);
  revalidatePath("/taller");
}

export async function addRepuesto(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");

  const codigo = String(formData.get("codigo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const cantidad = parseInt(String(formData.get("cantidad") ?? "1"), 10) || 1;
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const precioUnit = parseFloat(String(formData.get("precioUnitCents") ?? "0")) || 0;

  if (!descripcion) throw new Error("La descripción del repuesto es obligatoria");

  await db.ordenTallerRepuesto.create({
    data: { ordenTallerId: ordenId, codigo: codigo || null, descripcion, cantidad, moneda, precioUnitCents: unitsToCents(precioUnit) },
  });

  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function deleteRepuesto(ordenId: string, repuestoId: string) {
  await assertCan("taller.edit");
  await db.ordenTallerRepuesto.delete({ where: { id: repuestoId } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function addGastoOrden(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");

  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const monto = parseFloat(String(formData.get("montoCents") ?? "0")) || 0;

  if (!descripcion) throw new Error("La descripción del gasto es obligatoria");

  await db.ordenTallerGasto.create({
    data: { ordenTallerId: ordenId, descripcion, moneda, montoCents: unitsToCents(monto) },
  });

  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function deleteGastoOrden(ordenId: string, gastoId: string) {
  await assertCan("taller.edit");
  await db.ordenTallerGasto.delete({ where: { id: gastoId } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function toggleChecklistItem(ordenId: string, itemId: string, hecho: boolean) {
  await assertCan("taller.edit");
  await db.ordenTallerChecklistItem.update({ where: { id: itemId }, data: { hecho } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function addChecklistItem(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");
  const tarea = String(formData.get("tarea") ?? "").trim();
  if (!tarea) throw new Error("Describí la tarea");
  const count = await db.ordenTallerChecklistItem.count({ where: { ordenTallerId: ordenId } });
  await db.ordenTallerChecklistItem.create({ data: { ordenTallerId: ordenId, tarea, orden: count } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function deleteChecklistItem(ordenId: string, itemId: string) {
  await assertCan("taller.edit");
  await db.ordenTallerChecklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function addImagenes(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");
  const imagenes = await filesToDataUrls(formData, "imagenes");
  if (imagenes.length === 0) throw new Error("Elegí al menos una imagen");
  await db.ordenTallerImagen.createMany({
    data: imagenes.map((dataUrl) => ({ ordenTallerId: ordenId, dataUrl })),
  });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function deleteImagen(ordenId: string, imagenId: string) {
  await assertCan("taller.edit");
  await db.ordenTallerImagen.delete({ where: { id: imagenId } });
  revalidatePath(`/taller/ordenes/${ordenId}`);
}

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

export async function archiveOrdenTaller(id: string) {
  await assertCan("taller.edit");
  await db.ordenTaller.update({ where: { id }, data: { archivedAt: new Date() } });
  await logAudit({ accion: "ELIMINAR", entidad: "Orden de taller", entidadId: id, descripcion: "Archivó la orden de taller" });
  revalidatePath("/taller");
  redirect("/taller");
}

export async function restoreOrdenTaller(id: string) {
  await assertCan("taller.edit");
  await db.ordenTaller.update({ where: { id }, data: { archivedAt: null } });
  await logAudit({ accion: "EDITAR", entidad: "Orden de taller", entidadId: id, descripcion: "Restauró la orden de taller" });
  revalidatePath("/taller");
}
