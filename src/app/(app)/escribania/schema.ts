import { z } from "zod";

export const escribaniaSchema = z.object({
  vehiculoId: z.string().min(1, "Elegí un vehículo"),
  clienteNombre: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
  clienteApellido: z.string().trim().optional(),
  clienteCi: z.string().trim().optional(),
  clienteContacto: z.string().trim().optional(),
  fecha: z.string().optional(),
  tipoDoc: z.enum(["CV", "CP"]),
  titulosCon: z.enum(["ANALIA", "CAMILA", "SU_ESCRIBANO"]),
  fechaFirma: z.string().optional(),
  pagoEscribaniaCents: z.coerce.number().int().min(0).optional().default(0),
  pagoMoneda: z.enum(["UYU", "USD"]).default("USD"),
  fechaPago: z.string().optional(),
  cobroAlCliente: z.enum(["FINANCIADO_CASA", "CONTADO", "SU_ESCRIBANO", "OTRO"]),
  cobroMontoCents: z.coerce.number().int().min(0).optional().default(0),
  fechaCobro: z.string().optional(),
  fechaEntregaTitulos: z.string().optional(),
  ubicacionTitulos: z.enum(["CLIENTE", "CAMILA", "ANALIA", "ADM_ZONA"]),
  comentarios: z.string().trim().optional(),
});
