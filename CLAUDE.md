# Contexto del Proyecto: CRM Quiroga Automotores

Estás desarrollando un CRM / ERP liviano diseñado específicamente para la operativa integral de una automotora en Uruguay llamada "Quiroga Automotores"[cite: 1].

## Stack Tecnológico
- **Framework:** Next.js (App Router).
- **Estilos:** Tailwind CSS.
- **Componentes UI:** Shadcn/ui (usa estos componentes siempre que sea posible para mantener consistencia).
- **Base de Datos:** PostgreSQL.
- **ORM:** Prisma.
- **Autenticación:** NextAuth.js.

## Reglas de Negocio y Dominio (Uruguay)
- **Monedas:** El sistema maneja tanto Pesos Uruguayos (UYU) como Dólares Estadounidenses (USD). Los gastos en pesos deben convertirse automáticamente a dólares para los cálculos de rentabilidad.
- **Impuestos:** El IVA en Uruguay tiene dos tasas que debes contemplar en el módulo de gastos: 10% (mínimo) y 22% (básico).
- **Vehículos:** Los identificadores clave de un vehículo incluyen: Matrícula, Padrón y Patente.
- **Estados de Stock:** Los vehículos usan un código de colores: Blanco (Publicado/Disponible), Naranja (Taller/Preparación), Rojo (Señado/Vendido).

## Directrices de Desarrollo
- Escribe código modular, limpio y en TypeScript.
- No asumas la estructura de la base de datos; revisa siempre `schema.prisma` antes de escribir consultas.
- Maneja los errores de forma amigable para el usuario en el frontend.
- Procede paso a paso. No intentes implementar múltiples módulos complejos en una sola respuesta.