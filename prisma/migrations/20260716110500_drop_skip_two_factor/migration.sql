-- Revierte el flag de bypass de 2FA persistido en User: se reemplaza por un
-- mecanismo gateado por variable de entorno, que nunca está seteada en
-- producción (ver src/app/(auth)/login/actions.ts). No hay pérdida de datos
-- de negocio: la única fila que usaba este flag era una cuenta de prueba
-- descartable.

ALTER TABLE "User" DROP COLUMN "skipTwoFactor";
