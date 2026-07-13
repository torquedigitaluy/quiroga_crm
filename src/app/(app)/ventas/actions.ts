"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
import { logAudit } from "@/lib/audit";
import { ventaSchema } from "./schema";

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const str = String(value ?? "").trim();
  return str ? new Date(str) : null;
}

export async function createVenta(formData: FormData) {
  await assertCan("ventas.create");

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

  // El propietario del vehículo se toma automáticamente del stock, no del form.
  const vehiculo = await db.vehiculo.findUnique({ where: { id: data.vehiculoId } });

  await db.venta.create({
    data: {
      vehiculoId: data.vehiculoId,
      clienteId: cliente.id,
      fechaSena: dateOrNull(formData.get("fechaSena")),
      senaUsdCents: data.senaUsdCents,
      fechaEntrega: dateOrNull(formData.get("fechaEntrega")),
      precioVentaUsdCents: data.precioVentaUsdCents,
      vendedorId: data.vendedorId || null,
      localVenta: data.localVenta,
      propietarioVehiculo: vehiculo?.propietario ?? null,
      comisionVentaUsdCents: data.comisionVentaUsdCents,
      comisionTituloUsdCents: data.comisionTituloUsdCents,
    },
  });

  await db.vehiculo.update({ where: { id: data.vehiculoId }, data: { estado: "VENDIDO" } });
  await logAudit({
    accion: "CREAR",
    entidad: "Venta",
    entidadId: data.vehiculoId,
    descripcion: `Registró la venta de ${vehiculo?.marca ?? ""} ${vehiculo?.modelo ?? ""}`.trim(),
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
  const vehiculo = await db.vehiculo.findUnique({ where: { id: data.vehiculoId } });

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
      propietarioVehiculo: vehiculo?.propietario ?? null,
      comisionVentaUsdCents: data.comisionVentaUsdCents,
      comisionTituloUsdCents: data.comisionTituloUsdCents,
    },
  });

  await logAudit({
    accion: "EDITAR",
    entidad: "Venta",
    entidadId: id,
    descripcion: `Editó la venta de ${vehiculo?.marca ?? ""} ${vehiculo?.modelo ?? ""}`.trim(),
  });

  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
  revalidatePath(`/ventas/${id}`);
  redirect("/ventas");
}
