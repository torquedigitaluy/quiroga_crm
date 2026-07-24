"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente, buscarClientesTaller, type CandidatoClienteTaller } from "@/lib/clienteTaller";

export async function buscarClientesPresupuestoAction(query: string): Promise<CandidatoClienteTaller[]> {
  await assertCan("presupuestos.edit");
  return buscarClientesTaller(query);
}

export async function createPresupuesto(formData: FormData) {
  const user = await assertCan("presupuestos.edit");

  const origenVehiculo = String(formData.get("origenVehiculo") ?? "stock");
  const vehiculoId = origenVehiculo === "stock" ? String(formData.get("vehiculoId") ?? "").trim() : "";
  const vehiculoExterno = origenVehiculo === "externo" ? String(formData.get("vehiculoExterno") ?? "").trim() : "";

  if (!vehiculoId && !vehiculoExterno) {
    throw new Error("Elegí un vehículo de stock o describí el vehículo externo");
  }

  const clienteNombre = String(formData.get("clienteNombre") ?? "").trim();
  const clienteTelefono = String(formData.get("clienteTelefono") ?? "").trim();
  const clienteId = await findOrCreateCliente(clienteNombre, clienteTelefono || null);

  const presupuesto = await db.presupuesto.create({
    data: {
      vehiculoId: vehiculoId || null,
      vehiculoExterno: vehiculoExterno || null,
      vehMarca: String(formData.get("vehMarca") ?? "").trim() || null,
      vehModelo: String(formData.get("vehModelo") ?? "").trim() || null,
      vehMatricula: String(formData.get("vehMatricula") ?? "").trim() || null,
      vehCombustible: String(formData.get("vehCombustible") ?? "").trim() || null,
      clienteId,
      clienteNombre: clienteNombre || null,
      clienteTelefono: clienteTelefono || null,
      comentarios: String(formData.get("comentarios") ?? "").trim() || null,
      creadoPorId: user.id,
    },
  });

  revalidatePath("/presupuestos");
  redirect(`/presupuestos/${presupuesto.id}`);
}

export async function updatePresupuesto(presupuestoId: string, formData: FormData) {
  const origenVehiculo = String(formData.get("origenVehiculo") ?? "stock");
  const vehiculoId = origenVehiculo === "stock" ? String(formData.get("vehiculoId") ?? "").trim() : "";
  const vehiculoExterno = origenVehiculo === "externo" ? String(formData.get("vehiculoExterno") ?? "").trim() : "";

  if (!vehiculoId && !vehiculoExterno) {
    throw new Error("Elegí un vehículo de stock o describí el vehículo externo");
  }

  await assertCan("presupuestos.edit");

  const clienteNombre = String(formData.get("clienteNombre") ?? "").trim();
  const clienteTelefono = String(formData.get("clienteTelefono") ?? "").trim();
  const clienteId = await findOrCreateCliente(clienteNombre, clienteTelefono || null);

  await db.presupuesto.update({
    where: { id: presupuestoId },
    data: {
      vehiculoId: vehiculoId || null,
      vehiculoExterno: vehiculoExterno || null,
      vehMarca: String(formData.get("vehMarca") ?? "").trim() || null,
      vehModelo: String(formData.get("vehModelo") ?? "").trim() || null,
      vehMatricula: String(formData.get("vehMatricula") ?? "").trim() || null,
      vehCombustible: String(formData.get("vehCombustible") ?? "").trim() || null,
      clienteId,
      clienteNombre: clienteNombre || null,
      clienteTelefono: clienteTelefono || null,
      comentarios: String(formData.get("comentarios") ?? "").trim() || null,
    },
  });

  revalidatePath(`/presupuestos/${presupuestoId}`);
  revalidatePath("/presupuestos");
}

export async function addAceitePresupuesto(presupuestoId: string, formData: FormData) {
  await assertCan("presupuestos.edit");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const precio = parseFloat(String(formData.get("precioCents") ?? "0")) || 0;
  const cantidad = parseInt(String(formData.get("cantidad") ?? "1"), 10) || 1;

  if (!nombre) throw new Error("Elegí o escribí el aceite");

  await db.presupuestoAceite.create({
    data: { presupuestoId, nombre, moneda, precioCents: unitsToCents(precio), cantidad },
  });

  revalidatePath(`/presupuestos/${presupuestoId}`);
}

export async function deleteAceitePresupuesto(presupuestoId: string, itemId: string) {
  await assertCan("presupuestos.edit");
  await db.presupuestoAceite.delete({ where: { id: itemId } });
  revalidatePath(`/presupuestos/${presupuestoId}`);
}

export async function addArticuloPresupuesto(presupuestoId: string, formData: FormData) {
  await assertCan("presupuestos.edit");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const precio = parseFloat(String(formData.get("precioCents") ?? "0")) || 0;
  const cantidad = parseInt(String(formData.get("cantidad") ?? "1"), 10) || 1;

  if (!nombre) throw new Error("El nombre del artículo es obligatorio");

  await db.presupuestoArticulo.create({
    data: { presupuestoId, nombre, moneda, precioCents: unitsToCents(precio), cantidad },
  });

  revalidatePath(`/presupuestos/${presupuestoId}`);
}

export async function deleteArticuloPresupuesto(presupuestoId: string, itemId: string) {
  await assertCan("presupuestos.edit");
  await db.presupuestoArticulo.delete({ where: { id: itemId } });
  revalidatePath(`/presupuestos/${presupuestoId}`);
}

export async function archivePresupuesto(id: string) {
  await assertCan("presupuestos.edit");
  await db.presupuesto.update({ where: { id }, data: { archivedAt: new Date() } });
  revalidatePath("/presupuestos");
  redirect("/presupuestos");
}

export async function restorePresupuesto(id: string) {
  await assertCan("presupuestos.edit");
  await db.presupuesto.update({ where: { id }, data: { archivedAt: null } });
  revalidatePath("/presupuestos");
}

// ---------- Catálogo de aceites predefinidos ----------

export async function createAceitePredefinido(formData: FormData) {
  await assertCan("presupuestos.edit");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const precio = parseFloat(String(formData.get("precioCents") ?? "0")) || 0;

  if (!nombre) throw new Error("El nombre del aceite es obligatorio");

  const count = await db.aceitePredefinido.count();
  await db.aceitePredefinido.create({
    data: { nombre, moneda, precioCents: unitsToCents(precio), orden: count },
  });

  revalidatePath("/presupuestos/aceites");
  revalidatePath("/presupuestos");
}

export async function updateAceitePredefinido(id: string, formData: FormData) {
  await assertCan("presupuestos.edit");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "UYU") as "UYU" | "USD";
  const precio = parseFloat(String(formData.get("precioCents") ?? "0")) || 0;

  if (!nombre) throw new Error("El nombre del aceite es obligatorio");

  await db.aceitePredefinido.update({
    where: { id },
    data: { nombre, moneda, precioCents: unitsToCents(precio) },
  });

  revalidatePath("/presupuestos/aceites");
  revalidatePath("/presupuestos");
}

export async function deleteAceitePredefinido(id: string) {
  await assertCan("presupuestos.edit");
  await db.aceitePredefinido.delete({ where: { id } });
  revalidatePath("/presupuestos/aceites");
  revalidatePath("/presupuestos");
}
