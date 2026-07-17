-- Orden manual del stock (drag & drop).
ALTER TABLE "Vehiculo" ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Vehiculo_orden_idx" ON "Vehiculo"("orden");

-- Se siembra un orden inicial distinto para cada vehículo (con huecos de 100),
-- respetando el orden por fecha de ingreso que se mostraba hasta ahora. Es
-- importante que los valores sean únicos: el reordenamiento reasigna estos
-- "slots" entre los vehículos visibles.
UPDATE "Vehiculo" AS v
SET "orden" = sub.rn * 100
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "fechaIngreso" ASC, "createdAt" ASC) AS rn
  FROM "Vehiculo"
) AS sub
WHERE v."id" = sub."id";
