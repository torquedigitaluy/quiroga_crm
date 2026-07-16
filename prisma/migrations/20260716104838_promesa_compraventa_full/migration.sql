-- Additive: nuevo campo en Vehiculo, flag de bypass de 2FA en User, y tabla nueva PromesaCompraventa.

ALTER TABLE "Vehiculo" ADD COLUMN "chasis" TEXT;

ALTER TABLE "User" ADD COLUMN "skipTwoFactor" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "PromesaCompraventa" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "ventaId" TEXT,
    "vehiculoId" TEXT,
    "clienteId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendedores" TEXT,
    "vehMarca" TEXT,
    "vehModelo" TEXT,
    "vehTipo" TEXT,
    "vehColor" TEXT,
    "vehAnio" INTEGER,
    "vehMatricula" TEXT,
    "vehMotor" TEXT,
    "vehChasis" TEXT,
    "clienteNombre" TEXT,
    "clienteApellido" TEXT,
    "clienteCi" TEXT,
    "clienteDomicilio" TEXT,
    "clienteCiudad" TEXT,
    "clienteContacto" TEXT,
    "clienteEstadoCivil" TEXT,
    "clienteNombre2" TEXT,
    "clienteMail" TEXT,
    "financia" BOOLEAN NOT NULL DEFAULT false,
    "financiaCon" TEXT,
    "senaUsdCents" INTEGER,
    "pagoRetiroUnidadUsdCents" INTEGER,
    "capitalFinanciadoUsdCents" INTEGER,
    "conformesUsdCents" INTEGER,
    "valorTomaAutoUsdCents" INTEGER,
    "totalUsdCents" INTEGER,
    "costoTitulosUsdCents" INTEGER,
    "cartaPagoUsdCents" INTEGER,
    "entregaCuentaTitulosUsdCents" INTEGER,
    "seguro" BOOLEAN NOT NULL DEFAULT false,
    "aseguradora" TEXT,
    "cobertura" TEXT,
    "cesionDerechos" BOOLEAN NOT NULL DEFAULT false,
    "cesionANombreDe" TEXT,
    "observaciones" TEXT,
    "permutaMarca" TEXT,
    "permutaModelo" TEXT,
    "permutaTipo" TEXT,
    "permutaColor" TEXT,
    "permutaLlaves" TEXT,
    "permutaAnio" INTEGER,
    "permutaMatricula" TEXT,
    "permutaMotor" TEXT,
    "permutaChasis" TEXT,
    "creadoPorId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromesaCompraventa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromesaCompraventa_numero_key" ON "PromesaCompraventa"("numero");
CREATE INDEX "PromesaCompraventa_clienteId_idx" ON "PromesaCompraventa"("clienteId");
CREATE INDEX "PromesaCompraventa_vehiculoId_idx" ON "PromesaCompraventa"("vehiculoId");

ALTER TABLE "PromesaCompraventa" ADD CONSTRAINT "PromesaCompraventa_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromesaCompraventa" ADD CONSTRAINT "PromesaCompraventa_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromesaCompraventa" ADD CONSTRAINT "PromesaCompraventa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromesaCompraventa" ADD CONSTRAINT "PromesaCompraventa_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
