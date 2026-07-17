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

export const ventaSchema = z
  .object({
    vehiculoId: z.string().trim().optional(),
    vehiculoExterno: z.string().trim().optional(),
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
    comisionTituloPesosCents: z.coerce.number().int().min(0).optional().default(0),
  })
  .refine((data) => Boolean(data.vehiculoId) || Boolean(data.vehiculoExterno), {
    message: "Elegí un vehículo del stock o describí el vehículo externo",
    path: ["vehiculoId"],
  });

export type VentaInput = z.infer<typeof ventaSchema>;
