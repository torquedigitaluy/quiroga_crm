"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";

export async function createOrdenTaller(formData: FormData) {
  await assertCan("docs.generate");

  const vehiculoId = String(formData.get("vehiculoId") ?? "");
  const fechaIngreso = String(formData.get("fechaIngreso") ?? "");
  const trabajos = String(formData.get("trabajos") ?? "").trim();
  const repuestos = String(formData.get("repuestos") ?? "").trim();
  const responsable = String(formData.get("responsable") ?? "").trim();

  if (!vehiculoId) throw new Error("Elegí un vehículo");
  if (!trabajos) throw new Error("Describí los trabajos solicitados");

  const orden = await db.ordenTaller.create({
    data: {
      vehiculoId,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : new Date(),
      trabajos,
      repuestos: repuestos || null,
      responsable: responsable || null,
    },
  });

  revalidatePath("/documentos");
  redirect(`/api/documentos/orden-taller/${orden.id}`);
}
