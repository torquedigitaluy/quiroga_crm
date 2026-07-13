import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions/engine";

export type AccionAudit = "CREAR" | "EDITAR" | "ELIMINAR";

/**
 * Registra una acción en el historial de auditoría. Toma el usuario actual de
 * la sesión. Nunca lanza: si el log falla, no debe romper la operación real.
 */
export async function logAudit(params: {
  accion: AccionAudit;
  entidad: string;
  entidadId?: string | null;
  descripcion: string;
}) {
  try {
    const user = await getCurrentUser();
    await db.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userNombre: user?.name ?? user?.email ?? "Desconocido",
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        descripcion: params.descripcion,
      },
    });
  } catch (e) {
    console.error("No se pudo registrar la auditoría:", e);
  }
}
