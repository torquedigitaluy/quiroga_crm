import { z } from "zod";

export const financiacionPropiaSchema = z.object({
  vehiculoId: z.string().optional(),
  clienteNombre: z.string().trim().min(1, "El nombre del cliente es obligatorio"),
  clienteApellido: z.string().trim().optional(),
  clienteCi: z.string().trim().optional(),
  contacto: z.string().trim().optional(),
  montoFinanciadoUsdCents: z.coerce.number().int().min(0),
  cantidadCuotas: z.coerce.number().int().min(1).max(60),
  montoCuotaUsdCents: z.coerce.number().int().min(0),
  diaVencimientoMensual: z.coerce.number().int().min(1).max(28).default(10),
});

export const deudaClienteSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  contacto: z.string().trim().optional(),
  vehiculoId: z.string().optional(),
  matricula: z.string().trim().optional(),
  concepto: z.string().trim().min(1, "El concepto es obligatorio"),
  montoCents: z.coerce.number().int().min(0),
  moneda: z.enum(["UYU", "USD"]).default("UYU"),
});

export const conformeSchema = z.object({
  firmante1Nombre: z.string().trim().min(1, "El primer firmante es obligatorio"),
  firmante1Ci: z.string().trim().optional(),
  firmante2Nombre: z.string().trim().optional(),
  firmante2Ci: z.string().trim().optional(),
  formaPago: z.enum(["CONTADO", "TRANSFERENCIA"]).default("CONTADO"),
});
