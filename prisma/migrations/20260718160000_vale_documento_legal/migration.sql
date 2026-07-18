-- Vale: campos del documento legal en pesos (total, capital, monto de cuota y
-- sus montos en letras, acreedores y un tercer firmante).
ALTER TABLE "Vale" ADD COLUMN     "totalPesosCents" INTEGER,
ADD COLUMN     "totalEnLetras" TEXT,
ADD COLUMN     "capitalPrestadoPesosCents" INTEGER,
ADD COLUMN     "montoCuotaPesosCents" INTEGER,
ADD COLUMN     "montoCuotaEnLetras" TEXT,
ADD COLUMN     "acreedores" TEXT DEFAULT 'Georgina Villegas Castro, CI 4.785.148-0 y Jorge Daniel Quiroga Sanabria, CI 3.283.578-8',
ADD COLUMN     "firmante3Nombre" TEXT,
ADD COLUMN     "firmante3Ci" TEXT,
ADD COLUMN     "firmante3Domicilio" TEXT;
