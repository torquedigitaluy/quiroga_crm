-- La comisión por venta de accesorios ahora se puede cargar en USD o en
-- pesos (antes estaba fija en USD). Se renombra la columna de monto
-- (sin conversión: los valores existentes ya estaban en USD) y se agrega
-- la moneda, con USD como default para no alterar filas existentes.

ALTER TABLE "VentaAccesorio" RENAME COLUMN "comisionAccesorioUsdCents" TO "comisionAccesorioCents";
ALTER TABLE "VentaAccesorio" ADD COLUMN "comisionAccesorioMoneda" "Moneda" NOT NULL DEFAULT 'USD';
