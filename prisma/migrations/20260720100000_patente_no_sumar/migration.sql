-- Permite marcar un vehículo para que no siga acumulando cuotas de patente
-- automáticamente por calendario (p.ej. cuando se pagó el año completo de
-- una sola vez). Aditivo, default false para no afectar vehículos existentes.

ALTER TABLE "Vehiculo" ADD COLUMN "patenteNoSumar" BOOLEAN NOT NULL DEFAULT false;
