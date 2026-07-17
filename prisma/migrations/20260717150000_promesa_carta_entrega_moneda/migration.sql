-- Promesa: moneda para Carta de pago y Entrega a cuenta de títulos.
ALTER TABLE "PromesaCompraventa" ADD COLUMN     "cartaPagoMoneda" "Moneda" NOT NULL DEFAULT 'USD',
ADD COLUMN     "entregaCuentaTitulosMoneda" "Moneda" NOT NULL DEFAULT 'USD';
