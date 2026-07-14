-- CreateEnum
CREATE TYPE "TipoServicioTaller" AS ENUM ('MANTENIMIENTO', 'DIAGNOSTICO', 'REPARACION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoOrdenTaller" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'ESPERANDO_REPUESTOS', 'ESPERANDO_APROBACION', 'FINALIZADA', 'ENTREGADA');

-- AlterTable: vehiculoId pasa a ser opcional (orden puede ser de un vehículo externo)
ALTER TABLE "OrdenTaller" ALTER COLUMN "vehiculoId" DROP NOT NULL;

-- AlterTable: nuevas columnas + renombre de "trabajos" a "problema" preservando los datos existentes
ALTER TABLE "OrdenTaller"
  ADD COLUMN "vehiculoExterno" TEXT,
  ADD COLUMN "tipoServicio" "TipoServicioTaller" NOT NULL DEFAULT 'MANTENIMIENTO',
  ADD COLUMN "fechaFinalizacion" TIMESTAMP(3),
  ADD COLUMN "trabajosRealizados" TEXT,
  ADD COLUMN "observaciones" TEXT,
  ADD COLUMN "manoDeObraCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "estado" "EstadoOrdenTaller" NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "OrdenTaller" RENAME COLUMN "trabajos" TO "problema";

-- CreateTable
CREATE TABLE "OrdenTallerRepuesto" (
    "id" TEXT NOT NULL,
    "ordenTallerId" TEXT NOT NULL,
    "codigo" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitCents" INTEGER NOT NULL DEFAULT 0,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrdenTallerRepuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTallerGasto" (
    "id" TEXT NOT NULL,
    "ordenTallerId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "montoCents" INTEGER NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrdenTallerGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTallerChecklistItem" (
    "id" TEXT NOT NULL,
    "ordenTallerId" TEXT NOT NULL,
    "tarea" TEXT NOT NULL,
    "hecho" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "OrdenTallerChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTallerImagen" (
    "id" TEXT NOT NULL,
    "ordenTallerId" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrdenTallerImagen_pkey" PRIMARY KEY ("id")
);

-- Migra el texto libre de "repuestos" a la nueva tabla relacional antes de borrar la columna
INSERT INTO "OrdenTallerRepuesto" (id, "ordenTallerId", descripcion, cantidad, "precioUnitCents", moneda, "createdAt")
SELECT md5(random()::text || clock_timestamp()::text), id, repuestos, 1, 0, 'UYU', now()
FROM "OrdenTaller"
WHERE repuestos IS NOT NULL AND repuestos <> '';

ALTER TABLE "OrdenTaller" DROP COLUMN "repuestos";

-- AddForeignKey
ALTER TABLE "OrdenTallerRepuesto" ADD CONSTRAINT "OrdenTallerRepuesto_ordenTallerId_fkey" FOREIGN KEY ("ordenTallerId") REFERENCES "OrdenTaller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTallerGasto" ADD CONSTRAINT "OrdenTallerGasto_ordenTallerId_fkey" FOREIGN KEY ("ordenTallerId") REFERENCES "OrdenTaller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTallerChecklistItem" ADD CONSTRAINT "OrdenTallerChecklistItem_ordenTallerId_fkey" FOREIGN KEY ("ordenTallerId") REFERENCES "OrdenTaller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTallerImagen" ADD CONSTRAINT "OrdenTallerImagen_ordenTallerId_fkey" FOREIGN KEY ("ordenTallerId") REFERENCES "OrdenTaller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "OrdenTaller_estado_idx" ON "OrdenTaller"("estado");
