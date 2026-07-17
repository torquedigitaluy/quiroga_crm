-- Promesa de Compraventa: cuotas y monto de conformes + moneda del costo de títulos.
ALTER TABLE "PromesaCompraventa" ADD COLUMN     "conformesCantidadCuotas" INTEGER,
ADD COLUMN     "conformesCuotaUsdCents" INTEGER,
ADD COLUMN     "costoTitulosMoneda" "Moneda" NOT NULL DEFAULT 'USD';
