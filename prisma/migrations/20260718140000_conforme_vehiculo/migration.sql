-- Conforme (recibo de pago): vehículo asociado, tomado del stock y guardado
-- desnormalizado (marca, modelo, matrícula) para que el comprobante quede fijo.
ALTER TABLE "Conforme" ADD COLUMN     "vehiculoId" TEXT,
ADD COLUMN     "vehMarca" TEXT,
ADD COLUMN     "vehModelo" TEXT,
ADD COLUMN     "vehMatricula" TEXT;
