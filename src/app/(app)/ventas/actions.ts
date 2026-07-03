"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { unitsToCents } from "@/lib/money";
import { findOrCreateCliente } from "@/lib/cliente";
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
      propietarioVehiculo: data.propietarioVehiculo || null,
      comisionVentaUsdCents: data.comisionVentaUsdCents,
      comisionTituloUsdCents: data.comisionTituloUsdCents,
    },
  });

  await db.vehiculo.update({ where: { id: data.vehiculoId }, data: { estado: "SENADO" } });

  revalidatePath("/ventas");
  revalidatePath("/ventas/planilla");
  revalidatePath("/stock");
  redirect("/ventas");
}
