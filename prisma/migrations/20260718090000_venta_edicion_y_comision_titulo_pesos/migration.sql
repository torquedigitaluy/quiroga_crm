-- La comisión por título de una venta pasa a expresarse en pesos ($) en vez
-- de dólares. Se renombra la columna (sin conversión de valor: es un cambio
-- de política de moneda hacia adelante, no una reinterpretación de importes
-- históricos ya cargados).

ALTER TABLE "Venta" RENAME COLUMN "comisionTituloUsdCents" TO "comisionTituloPesosCents";
