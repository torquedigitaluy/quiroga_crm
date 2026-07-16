import { z } from "zod";

export const ubicacionEnum = z.enum(["SAN_LUIS", "ZONAMERICA", "TALLER", "PROPIETARIO"]);
export const tipoPropiedadEnum = z.enum(["PROPIA", "PARTNER", "CONSIGNADO"]);
export const estadoVehiculoEnum = z.enum(["APRONTANDO", "SENADO", "PUBLICADO", "VENDIDO"]);

// All fields optional here; the server action decides which ones the caller
// is actually allowed to persist based on their effective permissions.
export const vehiculoSchema = z.object({
  marca: z.string().trim().min(1, "La marca es obligatoria").optional(),
  modelo: z.string().trim().min(1, "El modelo es obligatorio").optional(),
  version: z.string().trim().optional().nullable(),
  anio: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  color: z.string().trim().optional().nullable(),
  km: z.coerce.number().int().min(0).optional().nullable(),
  motor: z.string().trim().optional().nullable(),
  transmision: z.string().trim().optional().nullable(),
  matricula: z.string().trim().optional().nullable(),
  padron: z.string().trim().optional().nullable(),
  chasis: z.string().trim().optional().nullable(),
  segundaLlave: z.coerce.boolean().optional(),
  ubicacionLibreta: z.string().trim().optional().nullable(),
  comentarios: z.string().trim().optional().nullable(),
  esVehiculo: z.coerce.boolean().optional(),

  precioVentaUsdCents: z.coerce.number().int().min(0).optional().nullable(),
  patenteCuotaCents: z.coerce.number().int().min(0).optional().nullable(),
  patenteAnualCents: z.coerce.number().int().min(0).optional().nullable(),
  ubicacion: ubicacionEnum.optional(),
  estado: estadoVehiculoEnum.optional(),
  propietario: z.string().trim().optional().nullable(),
  tipoPropiedad: tipoPropiedadEnum.optional(),
  responsableId: z.string().trim().optional().nullable(),
});

export type VehiculoInput = z.infer<typeof vehiculoSchema>;

export const createVehiculoSchema = vehiculoSchema.extend({
  marca: z.string().trim().min(1, "La marca es obligatoria"),
  modelo: z.string().trim().min(1, "El modelo es obligatorio"),
});
