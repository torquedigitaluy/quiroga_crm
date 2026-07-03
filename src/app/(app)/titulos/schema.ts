import { z } from "zod";

export const financiacionTituloSchema = z.object({
  vehiculoId: z.string().min(1, "Elegí un vehículo"),
  clienteNombre: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
  clienteApellido: z.string().trim().optional(),
  clienteCi: z.string().trim().optional(),
  contacto: z.string().trim().optional(),
  costoEscribaniaCents: z.coerce.number().int().min(0).optional().default(0),
  costoMoneda: z.enum(["UYU", "USD"]).default("USD"),
  cartaDePago: z.coerce.boolean().optional().default(false),
});
