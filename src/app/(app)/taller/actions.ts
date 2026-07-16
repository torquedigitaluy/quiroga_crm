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

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

function intOrNull(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}

export async function createOrdenTaller(formData: FormData) {
  const user = await assertCan("taller.edit");

  const origenVehiculo = String(formData.get("origenVehiculo") ?? "stock");
  const vehiculoId = origenVehiculo === "stock" ? String(formData.get("vehiculoId") ?? "").trim() : "";
  const vehiculoExterno = origenVehiculo === "externo" ? String(formData.get("vehiculoExterno") ?? "").trim() : "";

  if (!vehiculoId && !vehiculoExterno) {
    throw new Error("Elegí un vehículo de stock o describí el vehículo externo");
  }

  const prioridad = String(formData.get("prioridad") ?? "MEDIA") as "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  const tiposServicio = formData.getAll("tiposServicio").map(String);
  const tipoServicioOtro = String(formData.get("tipoServicioOtro") ?? "").trim();
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "");
  const responsable = String(formData.get("responsable") ?? "").trim();
  const tecnicoResponsableId = String(formData.get("tecnicoResponsableId") ?? "").trim();
  const problema = String(formData.get("problema") ?? "").trim();

  if (!problema) throw new Error("Describí el problema o lo que tiene el vehículo");
  if (tiposServicio.length === 0) throw new Error("Elegí al menos un tipo de servicio");

  const imagenesIngreso = await filesToDataUrls(formData, "imagenesIngreso");

  const orden = await db.ordenTaller.create({
    data: {
      vehiculoId: vehiculoId || null,
      vehiculoExterno: vehiculoExterno || null,
      vehMarca: String(formData.get("vehMarca") ?? "").trim() || null,
      vehModelo: String(formData.get("vehModelo") ?? "").trim() || null,
      vehVersion: String(formData.get("vehVersion") ?? "").trim() || null,
      vehAnio: intOrNull(formData.get("vehAnio")),
      vehColor: String(formData.get("vehColor") ?? "").trim() || null,
      vehMatricula: String(formData.get("vehMatricula") ?? "").trim() || null,
      vehKm: intOrNull(formData.get("vehKm")),
      vehChasis: String(formData.get("vehChasis") ?? "").trim() || null,
      clienteNombre: String(formData.get("clienteNombre") ?? "").trim() || null,
      clienteTelefono: String(formData.get("clienteTelefono") ?? "").trim() || null,
      clienteDireccion: String(formData.get("clienteDireccion") ?? "").trim() || null,
      prioridad,
      tiposServicio,
      tipoServicioOtro: tipoServicioOtro || null,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
      problema,
      responsable: responsable || null,
      tecnicoResponsableId: tecnicoResponsableId || null,
      tecnicoResponsableFecha: tecnicoResponsableId ? new Date() : null,
      creadoPorId: user.id,
      checklist: { create: CHECKLIST_DEFAULT.map((tarea, i) => ({ tarea, orden: i })) },
      imagenes: { create: imagenesIngreso.map((dataUrl) => ({ dataUrl, categoria: "INGRESO" as const })) },
    },
  });

  await logAudit({
    accion: "CREAR",
    entidad: "Orden de taller",
    entidadId: orden.id,
    descripcion: `Creó la orden de taller N° ${orden.numeroOrden} ("${problema}")`,
  });

  revalidatePath("/taller");
  redirect(`/taller/ordenes/${orden.id}`);
}

export async function updateOrdenTaller(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");

  const prioridad = String(formData.get("prioridad") ?? "MEDIA") as "BAJA" | "MEDIA" | "ALTA" | "URGENTE";
  const tiposServicio = formData.getAll("tiposServicio").map(String);
  const tipoServicioOtro = String(formData.get("tipoServicioOtro") ?? "").trim();
  const estado = String(formData.get("estado") ?? "PENDIENTE") as
    | "PENDIENTE"
    | "EN_PROCESO"
    | "ESPERANDO_REPUESTOS"
    | "ESPERANDO_APROBACION"
    | "FINALIZADA"
    | "ENTREGADA"
    | "EN_DIAGNOSTICO"
    | "EN_REPARACION";
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "");
  const fechaFinalizacion = String(formData.get("fechaFinalizacion") ?? "");
  const responsable = String(formData.get("responsable") ?? "").trim();
  const tecnicoResponsableId = String(formData.get("tecnicoResponsableId") ?? "").trim();
  const problema = String(formData.get("problema") ?? "").trim();
  const trabajosRealizados = String(formData.get("trabajosRealizados") ?? "").trim();
  const observaciones = String(formData.get("observaciones") ?? "").trim();
  const manoDeObra = parseFloat(String(formData.get("manoDeObraCents") ?? "0")) || 0;

  if (!problema) throw new Error("Describí el problema o lo que tiene el vehículo");
  if (tiposServicio.length === 0) throw new Error("Elegí al menos un tipo de servicio");

  const previa = await db.ordenTaller.findUnique({ where: { id: ordenId }, select: { tecnicoResponsableId: true } });

  await db.ordenTaller.update({
    where: { id: ordenId },
    data: {
      prioridad,
      tiposServicio,
      tipoServicioOtro: tipoServicioOtro || null,
      estado,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : undefined,
      fechaFinalizacion: fechaFinalizacion ? new Date(fechaFinalizacion) : null,
      responsable: responsable || null,
      tecnicoResponsableId: tecnicoResponsableId || null,
      tecnicoResponsableFecha:
        tecnicoResponsableId && tecnicoResponsableId !== previa?.tecnicoResponsableId ? new Date() : undefined,
      problema,
      trabajosRealizados: trabajosRealizados || null,
      observaciones: observaciones || null,
      manoDeObraCents: unitsToCents(manoDeObra),
      vehMarca: String(formData.get("vehMarca") ?? "").trim() || null,
      vehModelo: String(formData.get("vehModelo") ?? "").trim() || null,
      vehVersion: String(formData.get("vehVersion") ?? "").trim() || null,
      vehAnio: intOrNull(formData.get("vehAnio")),
      vehColor: String(formData.get("vehColor") ?? "").trim() || null,
      vehMatricula: String(formData.get("vehMatricula") ?? "").trim() || null,
      vehKm: intOrNull(formData.get("vehKm")),
      vehChasis: String(formData.get("vehChasis") ?? "").trim() || null,
      clienteNombre: String(formData.get("clienteNombre") ?? "").trim() || null,
      clienteTelefono: String(formData.get("clienteTelefono") ?? "").trim() || null,
      clienteDireccion: String(formData.get("clienteDireccion") ?? "").trim() || null,
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

export async function setControlCalidad(ordenId: string, formData: FormData) {
  const user = await assertCan("taller.control_calidad");

  const aprobado = String(formData.get("revisadoAprobado") ?? "") === "true";

  await db.ordenTaller.update({
    where: { id: ordenId },
    data: { revisadoPorId: user.id, revisadoAprobado: aprobado, revisadoAt: new Date() },
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Orden de taller",
    entidadId: ordenId,
    descripcion: `Completó el control de calidad (${aprobado ? "aprobado" : "no aprobado"})`,
  });

  revalidatePath(`/taller/ordenes/${ordenId}`);
}

export async function saveFirmaCliente(ordenId: string, formData: FormData) {
  await assertCan("taller.edit");

  const firma = String(formData.get("firma") ?? "");
  if (!firma) throw new Error("Falta la firma");

  await db.ordenTaller.update({
    where: { id: ordenId },
    data: { clienteFirmaDataUrl: firma, clienteFirmaFecha: new Date() },
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Orden de taller",
    entidadId: ordenId,
    descripcion: "Registró la conformidad firmada del cliente",
  });

  revalidatePath(`/taller/ordenes/${ordenId}`);
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
  const categoria = String(formData.get("categoria") ?? "OTRA") as "INGRESO" | "REPARACION" | "FINALIZADO" | "OTRA";
  const imagenes = await filesToDataUrls(formData, "imagenes");
  if (imagenes.length === 0) throw new Error("Elegí al menos una imagen");
  await db.ordenTallerImagen.createMany({
    data: imagenes.map((dataUrl) => ({ ordenTallerId: ordenId, dataUrl, categoria })),
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
