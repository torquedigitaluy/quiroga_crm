import { z } from "zod";

export const localVentaEnum = z.enum([
  "SAN_LUIS",
  "ZONAMERICA",
  "SHOPPINGCAR",
  "SANTA_ROSA",
  "AUTOBULEVAR",
  "PEDERNAL",
  "HOMERO_DE_LEON",
  "CONCORDE",
  "ROVEIRA",
]);

export const ventaSchema = z.object({
  vehiculoId: z.string().min(1, "Elegí un vehículo"),
  clienteNombre: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
  clienteApellido: z.string().trim().optional(),
  clienteCi: z.string().trim().optional(),
  clienteContacto: z.string().trim().optional(),
  fechaSena: z.string().optional(),
  senaUsdCents: z.coerce.number().int().min(0).optional().default(0),
  fechaEntrega: z.string().optional(),
  precioVentaUsdCents: z.coerce.number().int().min(0),
  vendedorId: z.string().optional(),
  localVenta: localVentaEnum,
  propietarioVehiculo: z.string().trim().optional(),
  comisionVentaUsdCents: z.coerce.number().int().min(0).optional().default(0),
  comisionTituloUsdCents: z.coerce.number().int().min(0).optional().default(0),
});

export type VentaInput = z.infer<typeof ventaSchema>;
