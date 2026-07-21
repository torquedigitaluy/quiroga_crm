-- Matrícula propia del trámite/financiación (no depende de tener un
-- vehículo de stock vinculado). Aditivo.

ALTER TABLE "EscribaniaTramite" ADD COLUMN "matricula" TEXT;
ALTER TABLE "FinanciacionTitulo" ADD COLUMN "matricula" TEXT;
