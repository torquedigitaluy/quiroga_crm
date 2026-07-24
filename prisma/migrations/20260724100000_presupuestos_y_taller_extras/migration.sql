-- Aditivo. Agrega:
-- 1) Combustible, costo interno de servicio (no se imprime en el PDF) y
--    vínculo a Cliente en OrdenTaller.
-- 2) Módulo de Presupuestos (catálogo de aceites + presupuesto + items).

ALTER TABLE "OrdenTaller" ADD COLUMN "vehCombustible" TEXT;
ALTER TABLE "OrdenTaller" ADD COLUMN "costoServicioCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrdenTaller" ADD COLUMN "clienteId" TEXT;

CREATE INDEX "OrdenTaller_clienteId_idx" ON "OrdenTaller"("clienteId");

ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AceitePredefinido" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioCents" INTEGER NOT NULL DEFAULT 0,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AceitePredefinido_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Presupuesto" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "vehiculoId" TEXT,
    "vehiculoExterno" TEXT,
    "vehMarca" TEXT,
    "vehModelo" TEXT,
    "vehMatricula" TEXT,
    "vehCombustible" TEXT,
    "clienteId" TEXT,
    "clienteNombre" TEXT,
    "clienteTelefono" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentarios" TEXT,
    "creadoPorId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Presupuesto_numero_key" ON "Presupuesto"("numero");
CREATE INDEX "Presupuesto_clienteId_idx" ON "Presupuesto"("clienteId");
CREATE INDEX "Presupuesto_vehiculoId_idx" ON "Presupuesto"("vehiculoId");

ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "PresupuestoAceite" (
    "id" TEXT NOT NULL,
    "presupuestoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioCents" INTEGER NOT NULL DEFAULT 0,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresupuestoAceite_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PresupuestoAceite" ADD CONSTRAINT "PresupuestoAceite_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PresupuestoArticulo" (
    "id" TEXT NOT NULL,
    "presupuestoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioCents" INTEGER NOT NULL DEFAULT 0,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PresupuestoArticulo_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PresupuestoArticulo" ADD CONSTRAINT "PresupuestoArticulo_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "AceitePredefinido" ("id", "nombre", "precioCents", "moneda", "activo", "orden", "updatedAt") VALUES
    ('aceite-seed-motul', 'Motul', 75000, 'UYU', true, 0, CURRENT_TIMESTAMP),
    ('aceite-seed-petronas', 'Petronas', 48000, 'UYU', true, 1, CURRENT_TIMESTAMP),
    ('aceite-seed-eurorepar', 'Eurorepar', 40000, 'UYU', true, 2, CURRENT_TIMESTAMP);
