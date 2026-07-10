-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('CONTADO', 'FINANCIADO');

-- AlterEnum (Supabase corre PostgreSQL 15: se pueden agregar varios valores)
ALTER TYPE "LocalVenta" ADD VALUE 'SHOPPINGCAR';
ALTER TYPE "LocalVenta" ADD VALUE 'SANTA_ROSA';
ALTER TYPE "LocalVenta" ADD VALUE 'AUTOBULEVAR';
ALTER TYPE "LocalVenta" ADD VALUE 'PEDERNAL';
ALTER TYPE "LocalVenta" ADD VALUE 'HOMERO_DE_LEON';
ALTER TYPE "LocalVenta" ADD VALUE 'CONCORDE';
ALTER TYPE "LocalVenta" ADD VALUE 'ROVEIRA';

-- AlterEnum
ALTER TYPE "Banco" ADD VALUE 'GASTOS_TALLER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "esVendedor" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehiculo" ADD COLUMN     "responsableId" TEXT;

-- AlterTable
ALTER TABLE "EscribaniaTramite" ADD COLUMN     "comentarios" TEXT;

-- AlterTable
ALTER TABLE "FinanciacionTitulo" ADD COLUMN     "formaPago" "FormaPago" NOT NULL DEFAULT 'CONTADO';

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userNombre" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_idx" ON "AuditLog"("entidad");

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
