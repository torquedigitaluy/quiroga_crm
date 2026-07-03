import { z } from "zod";

export const creditoBBVASchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  ci: z.string().trim().optional(),
  contacto: z.string().trim().optional(),
  montoSolicitadoUsdCents: z.coerce.number().int().min(0),
  estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]).default("PENDIENTE"),
  vehiculoId: z.string().optional(),
});
