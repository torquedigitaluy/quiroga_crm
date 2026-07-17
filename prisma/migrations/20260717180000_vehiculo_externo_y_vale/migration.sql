-- Permite cargar vehículos externos (fuera del stock) en Ventas, Escribanía y
-- Financiación de Títulos: la FK a Vehiculo pasa a ser opcional y se agrega
-- un campo de texto libre para describir el vehículo externo. Aditivo /
-- relajación de constraint, sin pérdida de datos (las filas existentes ya
-- tienen vehiculoId cargado).

ALTER TABLE "Venta" ALTER COLUMN "vehiculoId" DROP NOT NULL;
ALTER TABLE "Venta" ADD COLUMN "vehiculoExterno" TEXT;

ALTER TABLE "EscribaniaTramite" ALTER COLUMN "vehiculoId" DROP NOT NULL;
ALTER TABLE "EscribaniaTramite" ADD COLUMN "vehiculoExterno" TEXT;

ALTER TABLE "FinanciacionTitulo" ALTER COLUMN "vehiculoId" DROP NOT NULL;
ALTER TABLE "FinanciacionTitulo" ADD COLUMN "vehiculoExterno" TEXT;

-- Nuevo documento "Vale": condiciones de un plan de financiación propia +
-- los dos responsables del pago, para firmar en papel (sin firma digital).
CREATE TABLE "Vale" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "financiacionPropiaId" TEXT,
    "clienteId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condiciones" TEXT,
    "montoFinanciadoUsdCents" INTEGER,
    "cantidadCuotas" INTEGER,
    "montoCuotaUsdCents" INTEGER,
    "diaVencimientoMensual" INTEGER,
    "fechaPrimeraCuota" TIMESTAMP(3),
    "observaciones" TEXT,
    "firmante1Nombre" TEXT,
    "firmante1Ci" TEXT,
    "firmante1Domicilio" TEXT,
    "firmante2Nombre" TEXT,
    "firmante2Ci" TEXT,
    "firmante2Domicilio" TEXT,
    "creadoPorId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Vale_numero_key" ON "Vale"("numero");
CREATE INDEX "Vale_clienteId_idx" ON "Vale"("clienteId");
CREATE INDEX "Vale_financiacionPropiaId_idx" ON "Vale"("financiacionPropiaId");

ALTER TABLE "Vale" ADD CONSTRAINT "Vale_financiacionPropiaId_fkey" FOREIGN KEY ("financiacionPropiaId") REFERENCES "FinanciacionPropia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vale" ADD CONSTRAINT "Vale_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Vale" ADD CONSTRAINT "Vale_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
