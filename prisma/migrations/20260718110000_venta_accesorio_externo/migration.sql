-- Permite registrar la venta de un producto que no está en el stock
-- (accesorioId pasa a ser opcional + campo de texto libre), y agrega moneda
-- elegible al precio de venta del accesorio (antes fijo en USD).

ALTER TABLE "VentaAccesorio" ALTER COLUMN "accesorioId" DROP NOT NULL;
ALTER TABLE "VentaAccesorio" ADD COLUMN "accesorioExterno" TEXT;

ALTER TABLE "VentaAccesorio" RENAME COLUMN "precioVentaUsdCents" TO "precioVentaCents";
ALTER TABLE "VentaAccesorio" ADD COLUMN "precioVentaMoneda" "Moneda" NOT NULL DEFAULT 'USD';
