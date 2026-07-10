-- El valor GASTOS_TALLER del enum "Banco" se agregó en la migración anterior;
-- ya committeado, ahora sí se puede usar para crear la cuenta.
INSERT INTO "CuentaBancaria" ("id", "nombre", "saldoInicialPesosCents", "saldoInicialUsdCents")
VALUES ('cuenta_gastos_taller', 'GASTOS_TALLER', 0, 0)
ON CONFLICT ("nombre") DO NOTHING;
