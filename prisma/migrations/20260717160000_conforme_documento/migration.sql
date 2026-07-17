-- Conforme: campos para replicar el documento físico (acreedor, factura,
-- concepto, datos del deudor, monto en letras y estado).
CREATE TYPE "EstadoConforme" AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO');

ALTER TABLE "Conforme" ADD COLUMN     "acreedorCi" TEXT NOT NULL DEFAULT '3.283.578-8',
ADD COLUMN     "acreedorNombre" TEXT NOT NULL DEFAULT 'JORGE DANIEL QUIROGA SANABRIA',
ADD COLUMN     "concepto" TEXT NOT NULL DEFAULT 'COMPRA VENTA AUTOMOTOR',
ADD COLUMN     "deudorCedula" TEXT,
ADD COLUMN     "deudorDepartamentoDireccion" TEXT,
ADD COLUMN     "deudorDomicilio" TEXT,
ADD COLUMN     "deudorNombre" TEXT,
ADD COLUMN     "deudorTelefono" TEXT,
ADD COLUMN     "estado" "EstadoConforme" NOT NULL DEFAULT 'PAGADO',
ADD COLUMN     "fechaFactura" TIMESTAMP(3),
ADD COLUMN     "montoEnLetras" TEXT,
ADD COLUMN     "numeroFactura" TEXT;
