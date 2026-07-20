-- El "responsable de costos" de un vehículo pasa de ser una única persona
-- (responsableId) a poder ser varias (p.ej. cuando el propietario es
-- "Jorge y Pepe", ambos pueden editar los costos). No hay filas con
-- responsableId asignado hoy, así que no hace falta migrar datos.

CREATE TABLE "_VehiculoResponsable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_VehiculoResponsable_AB_unique" ON "_VehiculoResponsable"("A", "B");
CREATE INDEX "_VehiculoResponsable_B_index" ON "_VehiculoResponsable"("B");

ALTER TABLE "_VehiculoResponsable" ADD CONSTRAINT "_VehiculoResponsable_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_VehiculoResponsable" ADD CONSTRAINT "_VehiculoResponsable_B_fkey" FOREIGN KEY ("B") REFERENCES "Vehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vehiculo" DROP CONSTRAINT "Vehiculo_responsableId_fkey";
ALTER TABLE "Vehiculo" DROP COLUMN "responsableId";
