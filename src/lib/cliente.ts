import { db } from "@/lib/db";

export type ClienteFormFields = {
  nombre: string;
  apellido?: string;
  ci?: string;
  contacto?: string;
};

/** Finds an existing client by CI (preferred) or by name, otherwise creates one. Used by every module that captures a client inline (Ventas, Escribanía, Títulos, BBVA, Financiación Propia, Deudas) so the same person doesn't get duplicated across modules. */
export async function findOrCreateCliente(fields: ClienteFormFields) {
  let cliente = null;
  if (fields.ci) {
    cliente = await db.cliente.findFirst({ where: { ci: fields.ci } });
  }
  if (!cliente) {
    cliente = await db.cliente.findFirst({
      where: { nombre: fields.nombre, apellido: fields.apellido || null },
    });
  }
  if (!cliente) {
    cliente = await db.cliente.create({
      data: {
        nombre: fields.nombre,
        apellido: fields.apellido || null,
        ci: fields.ci || null,
        contacto: fields.contacto || null,
      },
    });
  }
  return cliente;
}
