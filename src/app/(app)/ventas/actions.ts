"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { ventaSchema } from "./schema";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

export async function createVenta(formData: FormData) {
  await assertCan("ventas.create");

  const raw = {
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    vehiculoExterno: String(formData.get("vehiculoExterno") ?? ""),
    clienteNombre: String(formData.get("clienteNombre") ?? ""),
    clienteApellido: String(formData.get("clienteApellido") ?? ""),
    clienteCi: String(formData.get("clienteCi") ?? ""),
    clienteContacto: String(formData.get("clienteContacto") ?? ""),
    fechaSena: String(formData.get("fechaSena") ?? ""),
    senaUsdCents: unitsToCents(parseFloat(String(formData.get("senaUsdCents") ?? "0")) || 0),
    fechaEntrega: String(formData.get("fechaEntrega") ?? ""),
    precioVentaUsdCents: unitsToCents(parseFloat(String(formData.get("precioVentaUsdCents") ?? "0")) || 0),
    vendedorId: String(formData.get("vendedorId") ?? ""),
    localVenta: String(formData.get("localVenta") ?? "ZONAMERICA"),
    propietarioVehiculo: String(formData.get("propietarioVehiculo") ?? ""),
    comisionVentaUsdCents: unitsToCents(parseFloat(String(formData.get("comisionVentaUsdCents") ?? "0")) || 0),
    comisionTituloUsdCents: unitsToCents(parseFloat(String(formData.get("comisionTituloUsdCents") ?? "0")) || 0),
  };

  const parsed = ventaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const cliente = await findOrCreateCliente({
    nombre: data.clienteNombre,
    apellido: data.clienteApellido,
    ci: data.clienteCi,
    contacto: data.clienteContacto,
  });

  // El propietario del vehículo se toma automáticamente del stock; para un
  // vehículo externo se usa lo que se haya escrito a mano en el formulario.
  const vehiculo = data.vehiculoId ? await db.vehiculo.findUnique({ where: { id: data.vehiculoId } }) : null;

  await db.venta.create({
    data: {
      vehiculoId: data.vehiculoId || null,
      vehiculoExterno: data.vehiculoId ? null : data.vehiculoExterno || null,
      clienteId: cliente.id,
      fechaSena: dateOrNull(formData.get("fechaSena")),
      senaUsdCents: data.senaUsdCents,
      fechaEntrega: dateOrNull(formData.get("fechaEntrega")),
      precioVentaUsdCents: data.precioVentaUsdCents,
      vendedorId: data.vendedorId || null,
      localVenta: data.localVenta,
      propietarioVehiculo: vehiculo?.propietario ?? data.propietarioVehiculo ?? null,
      comisionVentaUsdCents: data.comisionVentaUsdCents,
      comisionTituloUsdCents: data.comisionTituloUsdCents,
    },
  });

  if (data.vehiculoId) {
    await db.vehiculo.update({ where: { id: data.vehiculoId }, data: { estado: "VENDIDO" } });
  }
  await logAudit({
    accion: "CREAR",
    entidad: "Venta",
    entidadId: data.vehiculoId || undefined,
    descripcion: `Registró la venta de ${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : data.vehiculoExterno || "vehículo externo"}`,
  });

  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
  revalidatePath("/stock");
  redirect("/ventas");
}

export async function updateVenta(id: string, formData: FormData) {
  await assertCan("ventas.edit");

  const raw = {
    vehiculoId: String(formData.get("vehiculoId") ?? ""),
    clienteNombre: String(formData.get("clienteNombre") ?? ""),
    clienteApellido: String(formData.get("clienteApellido") ?? ""),
    clienteCi: String(formData.get("clienteCi") ?? ""),
    clienteContacto: String(formData.get("clienteContacto") ?? ""),
    fechaSena: String(formData.get("fechaSena") ?? ""),
    senaUsdCents: unitsToCents(parseFloat(String(formData.get("senaUsdCents") ?? "0")) || 0),
    fechaEntrega: String(formData.get("fechaEntrega") ?? ""),
    precioVentaUsdCents: unitsToCents(parseFloat(String(formData.get("precioVentaUsdCents") ?? "0")) || 0),
    vendedorId: String(formData.get("vendedorId") ?? ""),
    localVenta: String(formData.get("localVenta") ?? "ZONAMERICA"),
    propietarioVehiculo: "",
    comisionVentaUsdCents: unitsToCents(parseFloat(String(formData.get("comisionVentaUsdCents") ?? "0")) || 0),
    comisionTituloUsdCents: unitsToCents(parseFloat(String(formData.get("comisionTituloUsdCents") ?? "0")) || 0),
  };

  const parsed = ventaSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  const venta = await db.venta.findUnique({ where: { id } });
  if (!venta) throw new Error("La venta no existe");

  // Actualiza (o reasigna) el cliente vinculado a la venta.
  const cliente = await findOrCreateCliente({
    nombre: data.clienteNombre,
    apellido: data.clienteApellido,
    ci: data.clienteCi,
    contacto: data.clienteContacto,
  });

  // El propietario se mantiene sincronizado con el vehículo (viene del stock).
  // El vehículo en sí no se reasigna desde este formulario de edición.
  const vehiculo = venta.vehiculoId ? await db.vehiculo.findUnique({ where: { id: venta.vehiculoId } }) : null;

  await db.venta.update({
    where: { id },
    data: {
      clienteId: cliente.id,
      fechaSena: dateOrNull(formData.get("fechaSena")),
      senaUsdCents: data.senaUsdCents,
      fechaEntrega: dateOrNull(formData.get("fechaEntrega")),
      precioVentaUsdCents: data.precioVentaUsdCents,
      vendedorId: data.vendedorId || null,
      localVenta: data.localVenta,
      propietarioVehiculo: vehiculo?.propietario ?? data.propietarioVehiculo ?? null,
      comisionVentaUsdCents: data.comisionVentaUsdCents,
      comisionTituloUsdCents: data.comisionTituloUsdCents,
    },
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Venta",
    entidadId: id,
    descripcion: `Editó la venta de ${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : venta.vehiculoExterno || "vehículo externo"}`,
  });

  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
  revalidatePath(`/ventas/${id}`);
  redirect("/ventas");
}

export async function createVentaAccesorio(formData: FormData) {
  await assertCan("ventas.create");

  const accesorioId = String(formData.get("accesorioId") ?? "").trim();
  const clienteNombre = String(formData.get("clienteNombre") ?? "").trim();
  const clienteApellido = String(formData.get("clienteApellido") ?? "").trim();
  const clienteCi = String(formData.get("clienteCi") ?? "").trim();
  const clienteContacto = String(formData.get("clienteContacto") ?? "").trim();
  const vendedorId = String(formData.get("vendedorId") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "");
  const precioVenta = parseFloat(String(formData.get("precioVentaUsdCents") ?? "0")) || 0;
  const comisionAccesorio = parseFloat(String(formData.get("comisionAccesorioUsdCents") ?? "0")) || 0;

  if (!accesorioId) throw new Error("Elegí un accesorio");

  const accesorio = await db.vehiculo.findUnique({ where: { id: accesorioId } });
  if (!accesorio || accesorio.esVehiculo) throw new Error("El accesorio no existe");

  let clienteId: string | null = null;
  if (clienteNombre) {
    const cliente = await findOrCreateCliente({
      nombre: clienteNombre,
      apellido: clienteApellido,
      ci: clienteCi,
      contacto: clienteContacto,
    });
    clienteId = cliente.id;
  }

  await db.ventaAccesorio.create({
    data: {
      accesorioId,
      clienteId,
      vendedorId: vendedorId || null,
      fecha: fecha ? new Date(fecha) : new Date(),
      precioVentaUsdCents: unitsToCents(precioVenta),
      comisionAccesorioUsdCents: unitsToCents(comisionAccesorio),
    },
  });

  await db.vehiculo.update({ where: { id: accesorioId }, data: { estado: "VENDIDO" } });
  await logAudit({
    accion: "CREAR",
    entidad: "Venta de accesorio",
    entidadId: accesorioId,
    descripcion: `Registró la venta del accesorio ${accesorio.marca} ${accesorio.modelo}`,
  });

  revalidatePath("/ventas/planilla");
  revalidatePath("/stock");
  redirect("/stock?tab=accesorios");
}

export async function archiveVenta(id: string) {
  await assertCan("ventas.edit");
  const venta = await db.venta.update({ where: { id }, data: { archivedAt: new Date() }, include: { vehiculo: true } });
  await logAudit({
    accion: "ELIMINAR",
    entidad: "Venta",
    entidadId: id,
    descripcion: `Archivó la venta de ${vehiculoLabel(venta.vehiculo, venta.vehiculoExterno)}`,
  });
  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
}

export async function restoreVenta(id: string) {
  await assertCan("ventas.edit");
  const venta = await db.venta.update({ where: { id }, data: { archivedAt: null }, include: { vehiculo: true } });
  await logAudit({
    accion: "EDITAR",
    entidad: "Venta",
    entidadId: id,
    descripcion: `Restauró la venta de ${vehiculoLabel(venta.vehiculo, venta.vehiculoExterno)}`,
  });
  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
}
