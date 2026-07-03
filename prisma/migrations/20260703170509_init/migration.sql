-- CreateEnum
CREATE TYPE "PermissionEffect" AS ENUM ('GRANT', 'REVOKE');

-- CreateEnum
CREATE TYPE "Ubicacion" AS ENUM ('SAN_LUIS', 'ZONAMERICA', 'TALLER', 'PROPIETARIO');

-- CreateEnum
CREATE TYPE "TipoPropiedad" AS ENUM ('PROPIA', 'PARTNER', 'CONSIGNADO');

-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('APRONTANDO', 'SENADO', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('UYU', 'USD');

-- CreateEnum
CREATE TYPE "LocalVenta" AS ENUM ('SAN_LUIS', 'ZONAMERICA');

-- CreateEnum
CREATE TYPE "EstadoCredito" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoDoc" AS ENUM ('CV', 'CP');

-- CreateEnum
CREATE TYPE "Escribano" AS ENUM ('ANALIA', 'CAMILA', 'SU_ESCRIBANO');

-- CreateEnum
CREATE TYPE "CobroCliente" AS ENUM ('FINANCIADO_CASA', 'CONTADO', 'SU_ESCRIBANO', 'OTRO');

-- CreateEnum
CREATE TYPE "UbicacionTitulos" AS ENUM ('CLIENTE', 'CAMILA', 'ANALIA', 'ADM_ZONA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('MENSUAL', 'JORNAL');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'MEDIO_DIA', 'LICENCIA', 'ENFERMO', 'AUSENTE');

-- CreateEnum
CREATE TYPE "TipoComprobante" AS ENUM ('FACTURA', 'NOTA_CREDITO');

-- CreateEnum
CREATE TYPE "IvaRate" AS ENUM ('EXENTO', 'DIEZ', 'VEINTIDOS');

-- CreateEnum
CREATE TYPE "Banco" AS ENUM ('BBVA', 'SANTANDER');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CONFORME', 'PROMESA_COMPRAVENTA', 'ORDEN_TALLER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "effect" "PermissionEffect" NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "version" TEXT,
    "anio" INTEGER,
    "color" TEXT,
    "km" INTEGER,
    "motor" TEXT,
    "transmision" TEXT,
    "ubicacion" "Ubicacion" NOT NULL DEFAULT 'ZONAMERICA',
    "precioVentaUsdCents" INTEGER,
    "matricula" TEXT,
    "padron" TEXT,
    "patenteCuotaCents" INTEGER,
    "patenteAnualCents" INTEGER,
    "propietario" TEXT,
    "tipoPropiedad" "TipoPropiedad" NOT NULL DEFAULT 'PROPIA',
    "segundaLlave" BOOLEAN NOT NULL DEFAULT false,
    "ubicacionLibreta" TEXT,
    "comentarios" TEXT,
    "esVehiculo" BOOLEAN NOT NULL DEFAULT true,
    "estado" "EstadoVehiculo" NOT NULL DEFAULT 'APRONTANDO',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "ci" TEXT,
    "contacto" TEXT,
    "direccion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiculoCosteo" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "tipoCambioMicros" INTEGER NOT NULL DEFAULT 0,
    "fechaCompra" TIMESTAMP(3),
    "fechaPublicacion" TIMESTAMP(3),
    "fechaVenta" TIMESTAMP(3),
    "precioCompraUsdCents" INTEGER NOT NULL DEFAULT 0,
    "valorPatenteUsdCents" INTEGER NOT NULL DEFAULT 0,
    "cantCuotasPatentePagas" INTEGER NOT NULL DEFAULT 0,
    "precioVentaRealUsdCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehiculoCosteo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoLine" (
    "id" TEXT NOT NULL,
    "costeoId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'USD',
    "montoCents" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastoLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "fechaSena" TIMESTAMP(3),
    "senaUsdCents" INTEGER NOT NULL DEFAULT 0,
    "fechaEntrega" TIMESTAMP(3),
    "precioVentaUsdCents" INTEGER NOT NULL,
    "vendedorId" TEXT,
    "localVenta" "LocalVenta" NOT NULL DEFAULT 'ZONAMERICA',
    "propietarioVehiculo" TEXT,
    "comisionVentaUsdCents" INTEGER NOT NULL DEFAULT 0,
    "comisionTituloUsdCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditoBBVA" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT,
    "contacto" TEXT,
    "montoSolicitadoUsdCents" INTEGER NOT NULL,
    "fechaFirma" TIMESTAMP(3),
    "estado" "EstadoCredito" NOT NULL DEFAULT 'PENDIENTE',
    "vehiculoId" TEXT,
    "clienteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditoBBVA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscribaniaTramite" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "fecha" TIMESTAMP(3),
    "tipoDoc" "TipoDoc" NOT NULL,
    "titulosCon" "Escribano" NOT NULL,
    "fechaFirma" TIMESTAMP(3),
    "pagoEscribaniaCents" INTEGER NOT NULL DEFAULT 0,
    "pagoMoneda" "Moneda" NOT NULL DEFAULT 'USD',
    "fechaPago" TIMESTAMP(3),
    "cobroAlCliente" "CobroCliente" NOT NULL DEFAULT 'CONTADO',
    "cobroMontoCents" INTEGER NOT NULL DEFAULT 0,
    "fechaCobro" TIMESTAMP(3),
    "fechaEntregaTitulos" TIMESTAMP(3),
    "ubicacionTitulos" "UbicacionTitulos" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscribaniaTramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanciacionTitulo" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "clienteId" TEXT,
    "contacto" TEXT,
    "fechaVenta" TIMESTAMP(3),
    "fechaFirma" TIMESTAMP(3),
    "costoEscribaniaCents" INTEGER NOT NULL DEFAULT 0,
    "costoMoneda" "Moneda" NOT NULL DEFAULT 'USD',
    "cartaDePago" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanciacionTitulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregaTitulo" (
    "id" TEXT NOT NULL,
    "financiacionTituloId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "montoCents" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3),

    CONSTRAINT "EntregaTitulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "tipoPago" "TipoPago" NOT NULL DEFAULT 'MENSUAL',
    "sueldoMensualCents" INTEGER,
    "jornalDiarioCents" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsistenciaDia" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL DEFAULT 'AUSENTE',

    CONSTRAINT "AsistenciaDia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DescuentoEmpleado" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "concepto" TEXT NOT NULL,
    "montoCents" INTEGER NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DescuentoEmpleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanciacionPropia" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "vehiculoId" TEXT,
    "montoFinanciadoUsdCents" INTEGER NOT NULL,
    "cantidadCuotas" INTEGER NOT NULL,
    "montoCuotaUsdCents" INTEGER NOT NULL,
    "fechaPrimeraCuota" TIMESTAMP(3),
    "diaVencimientoMensual" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanciacionPropia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuotaPropia" (
    "id" TEXT NOT NULL,
    "financiacionPropiaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "montoCents" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "pagada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CuotaPropia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conforme" (
    "id" TEXT NOT NULL,
    "financiacionPropiaId" TEXT NOT NULL,
    "cuotaId" TEXT,
    "montoCuotaCents" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "cantidadCuotas" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conforme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConformeFirmante" (
    "id" TEXT NOT NULL,
    "conformeId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ConformeFirmante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeudaCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "vehiculoId" TEXT,
    "matricula" TEXT,
    "concepto" TEXT NOT NULL,
    "montoCents" INTEGER NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "saldado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeudaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoContadora" (
    "id" TEXT NOT NULL,
    "tipoComprobante" "TipoComprobante" NOT NULL DEFAULT 'FACTURA',
    "fecha" TIMESTAMP(3) NOT NULL,
    "numeroFactura" TEXT,
    "proveedor" TEXT NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'UYU',
    "ivaRate" "IvaRate" NOT NULL DEFAULT 'VEINTIDOS',
    "importeTotalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GastoContadora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuentaBancaria" (
    "id" TEXT NOT NULL,
    "nombre" "Banco" NOT NULL,
    "saldoInicialPesosCents" INTEGER NOT NULL DEFAULT 0,
    "saldoInicialUsdCents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CuentaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoBancario" (
    "id" TEXT NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "detalle" TEXT NOT NULL,
    "comentario" TEXT,
    "tipo" "TipoMovimiento" NOT NULL,
    "montoPesosCents" INTEGER NOT NULL DEFAULT 0,
    "montoUsdCents" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "transferenciaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoBancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferenciaEntreCuentas" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuentaOrigenId" TEXT NOT NULL,
    "cuentaDestinoId" TEXT NOT NULL,
    "montoPesosCents" INTEGER NOT NULL DEFAULT 0,
    "montoUsdCents" INTEGER NOT NULL DEFAULT 0,
    "comisionBancariaCents" INTEGER NOT NULL DEFAULT 0,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferenciaEntreCuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoTemplate" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nombre" TEXT NOT NULL,
    "contenidoBase" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTaller" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "trabajos" TEXT NOT NULL,
    "repuestos" TEXT,
    "responsable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdenTaller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "tipoCambioGlobalMicros" INTEGER NOT NULL DEFAULT 400000,
    "nombreEmpresa" TEXT NOT NULL DEFAULT 'Quiroga Automóviles',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Vehiculo_matricula_idx" ON "Vehiculo"("matricula");

-- CreateIndex
CREATE INDEX "Vehiculo_marca_idx" ON "Vehiculo"("marca");

-- CreateIndex
CREATE INDEX "Vehiculo_estado_idx" ON "Vehiculo"("estado");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_ci_idx" ON "Cliente"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "VehiculoCosteo_vehiculoId_key" ON "VehiculoCosteo"("vehiculoId");

-- CreateIndex
CREATE INDEX "Venta_fechaEntrega_idx" ON "Venta"("fechaEntrega");

-- CreateIndex
CREATE INDEX "Venta_vendedorId_idx" ON "Venta"("vendedorId");

-- CreateIndex
CREATE INDEX "CreditoBBVA_fechaFirma_idx" ON "CreditoBBVA"("fechaFirma");

-- CreateIndex
CREATE INDEX "EscribaniaTramite_fecha_idx" ON "EscribaniaTramite"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "EntregaTitulo_financiacionTituloId_numero_key" ON "EntregaTitulo"("financiacionTituloId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "AsistenciaDia_empleadoId_fecha_key" ON "AsistenciaDia"("empleadoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CuotaPropia_financiacionPropiaId_numero_key" ON "CuotaPropia"("financiacionPropiaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Conforme_cuotaId_key" ON "Conforme"("cuotaId");

-- CreateIndex
CREATE INDEX "GastoContadora_fecha_idx" ON "GastoContadora"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CuentaBancaria_nombre_key" ON "CuentaBancaria"("nombre");

-- CreateIndex
CREATE INDEX "MovimientoBancario_cuentaId_fecha_idx" ON "MovimientoBancario"("cuentaId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoTemplate_tipo_key" ON "DocumentoTemplate"("tipo");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiculoCosteo" ADD CONSTRAINT "VehiculoCosteo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoLine" ADD CONSTRAINT "GastoLine_costeoId_fkey" FOREIGN KEY ("costeoId") REFERENCES "VehiculoCosteo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditoBBVA" ADD CONSTRAINT "CreditoBBVA_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditoBBVA" ADD CONSTRAINT "CreditoBBVA_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscribaniaTramite" ADD CONSTRAINT "EscribaniaTramite_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscribaniaTramite" ADD CONSTRAINT "EscribaniaTramite_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanciacionTitulo" ADD CONSTRAINT "FinanciacionTitulo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanciacionTitulo" ADD CONSTRAINT "FinanciacionTitulo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregaTitulo" ADD CONSTRAINT "EntregaTitulo_financiacionTituloId_fkey" FOREIGN KEY ("financiacionTituloId") REFERENCES "FinanciacionTitulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsistenciaDia" ADD CONSTRAINT "AsistenciaDia_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DescuentoEmpleado" ADD CONSTRAINT "DescuentoEmpleado_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanciacionPropia" ADD CONSTRAINT "FinanciacionPropia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanciacionPropia" ADD CONSTRAINT "FinanciacionPropia_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuotaPropia" ADD CONSTRAINT "CuotaPropia_financiacionPropiaId_fkey" FOREIGN KEY ("financiacionPropiaId") REFERENCES "FinanciacionPropia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conforme" ADD CONSTRAINT "Conforme_financiacionPropiaId_fkey" FOREIGN KEY ("financiacionPropiaId") REFERENCES "FinanciacionPropia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conforme" ADD CONSTRAINT "Conforme_cuotaId_fkey" FOREIGN KEY ("cuotaId") REFERENCES "CuotaPropia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConformeFirmante" ADD CONSTRAINT "ConformeFirmante_conformeId_fkey" FOREIGN KEY ("conformeId") REFERENCES "Conforme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeudaCliente" ADD CONSTRAINT "DeudaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeudaCliente" ADD CONSTRAINT "DeudaCliente_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBancario" ADD CONSTRAINT "MovimientoBancario_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "CuentaBancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoBancario" ADD CONSTRAINT "MovimientoBancario_transferenciaId_fkey" FOREIGN KEY ("transferenciaId") REFERENCES "TransferenciaEntreCuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTaller" ADD CONSTRAINT "OrdenTaller_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
