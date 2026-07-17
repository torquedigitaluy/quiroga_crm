import { z } from "zod";

export const financiacionTituloSchema = z
  .object({
    vehiculoId: z.string().trim().optional(),
    vehiculoExterno: z.string().trim().optional(),
    clienteNombre: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
    clienteApellido: z.string().trim().optional(),
    clienteCi: z.string().trim().optional(),
    contacto: z.string().trim().optional(),
    costoEscribaniaCents: z.coerce.number().int().min(0).optional().default(0),
    costoMoneda: z.enum(["UYU", "USD"]).default("USD"),
    cartaDePago: z.coerce.boolean().optional().default(false),
    formaPago: z.enum(["CONTADO", "FINANCIADO"]).default("CONTADO"),
  })
  .refine((data) => Boolean(data.vehiculoId) || Boolean(data.vehiculoExterno), {
    message: "Elegí un vehículo del stock o describí el vehículo externo",
    path: ["vehiculoId"],
  });
