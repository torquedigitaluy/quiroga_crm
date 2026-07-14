-- DropForeignKey
ALTER TABLE "OrdenTaller" DROP CONSTRAINT "OrdenTaller_vehiculoId_fkey";

-- AlterTable
ALTER TABLE "OrdenTaller" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "VentaAccesorio" (
    "id" TEXT NOT NULL,
    "accesorioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "vendedorId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precioVentaUsdCents" INTEGER NOT NULL,
    "comisionAccesorioUsdCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaAccesorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VentaAccesorio_fecha_idx" ON "VentaAccesorio"("fecha");

-- CreateIndex
CREATE INDEX "VentaAccesorio_vendedorId_idx" ON "VentaAccesorio"("vendedorId");

-- AddForeignKey
ALTER TABLE "VentaAccesorio" ADD CONSTRAINT "VentaAccesorio_accesorioId_fkey" FOREIGN KEY ("accesorioId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaAccesorio" ADD CONSTRAINT "VentaAccesorio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaAccesorio" ADD CONSTRAINT "VentaAccesorio_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
