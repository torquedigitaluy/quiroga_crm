-- CreateEnum
CREATE TYPE "PrioridadOrden" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "CategoriaImagenOrden" AS ENUM ('INGRESO', 'REPARACION', 'FINALIZADO', 'OTRA');

-- AlterEnum: nuevos estados (aditivo, no se tocan los valores existentes)
ALTER TYPE "EstadoOrdenTaller" ADD VALUE IF NOT EXISTS 'EN_DIAGNOSTICO';
ALTER TYPE "EstadoOrdenTaller" ADD VALUE IF NOT EXISTS 'EN_REPARACION';

-- AlterTable: numeroOrden como SERIAL para que las filas existentes se
-- numeren automáticamente sin violar la restricción unique.
ALTER TABLE "OrdenTaller" ADD COLUMN "numeroOrden" SERIAL;
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_numeroOrden_key" UNIQUE ("numeroOrden");

ALTER TABLE "OrdenTaller"
  ADD COLUMN "prioridad" "PrioridadOrden" NOT NULL DEFAULT 'MEDIA',
  ADD COLUMN "vehMarca" TEXT,
  ADD COLUMN "vehModelo" TEXT,
  ADD COLUMN "vehVersion" TEXT,
  ADD COLUMN "vehAnio" INTEGER,
  ADD COLUMN "vehColor" TEXT,
  ADD COLUMN "vehMatricula" TEXT,
  ADD COLUMN "vehKm" INTEGER,
  ADD COLUMN "vehChasis" TEXT,
  ADD COLUMN "clienteNombre" TEXT,
  ADD COLUMN "clienteTelefono" TEXT,
  ADD COLUMN "clienteDireccion" TEXT,
  ADD COLUMN "tiposServicio" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "tipoServicioOtro" TEXT,
  ADD COLUMN "tecnicoResponsableId" TEXT,
  ADD COLUMN "tecnicoResponsableFecha" TIMESTAMP(3),
  ADD COLUMN "revisadoPorId" TEXT,
  ADD COLUMN "revisadoAprobado" BOOLEAN,
  ADD COLUMN "revisadoAt" TIMESTAMP(3),
  ADD COLUMN "clienteFirmaDataUrl" TEXT,
  ADD COLUMN "clienteFirmaFecha" TIMESTAMP(3),
  ADD COLUMN "creadoPorId" TEXT;

-- AddForeignKey
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_tecnicoResponsableId_fkey" FOREIGN KEY ("tecnicoResponsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: categoría de fotos
ALTER TABLE "OrdenTallerImagen" ADD COLUMN "categoria" "CategoriaImagenOrden" NOT NULL DEFAULT 'OTRA';
