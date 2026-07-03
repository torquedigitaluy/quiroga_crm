# Quiroga Automóviles — Sistema de Gestión

CRM/ERP a medida para Quiroga Automóviles: stock de vehículos, costos, ventas y comisiones,
créditos BBVA, escribanía, financiación de títulos, personal y asistencia, financiación propia
(Jorge Autos) con conformes digitalizados, gastos administrativos con cálculo de IVA, bancos
(BBVA/Santander) con transferencias, y generación de documentos (Conforme, Promesa de
Compraventa, Orden de Trabajo de Taller) en PDF.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Auth.js (Credentials) con permisos granulares por usuario (roles + overrides)
- Tailwind CSS v4 + Radix UI, tema de marca Quiroga (`#0936B3`)
- `@react-pdf/renderer` para los documentos imprimibles

## Puesta en marcha local

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Usuarios de prueba (creados por el seed)

| Rol | Email | Contraseña |
|---|---|---|
| Super Admin | admin@quiroga.local | Quiroga2026! |
| Vendedor | vendedor@quiroga.local | Vendedor2026! |
| Contadora | contadora@quiroga.local | Contadora2026! |
| Escribanía | escribania@quiroga.local | Escribania2026! |
| Administración | administracion@quiroga.local | Administracion2026! |

Cambiá estas contraseñas desde **Administración → Usuarios** una vez en producción.

## Estructura

- `prisma/schema.prisma` — modelo de datos completo (todos los módulos).
- `prisma/seed.ts` — catálogo de permisos, roles, usuarios y datos de demostración.
- `src/app/(app)/*` — un directorio por módulo (stock, costos, ventas, bbva, escribania,
  titulos, personal, propia, contadora, bancos, documentos, clientes, admin).
- `src/lib/permissions/` — motor de permisos (roles + overrides por usuario).
- `src/components/pdf/` — plantillas de los documentos imprimibles.
- `docs-fuente/` — planillas Excel originales, conservadas como referencia (no se usan en la app).

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` / `npm run start` — build y arranque de producción.
- `npm run seed` — vuelve a aplicar el seed (es idempotente).
- `npx prisma studio` — explorador visual de la base de datos.
