import "dotenv/config";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_DEFS, ROLE_PERMISSIONS, type RoleKey } from "../src/lib/permissions/catalog";

const db = new PrismaClient();

function randomPassword(): string {
  return crypto.randomBytes(12).toString("base64url") + "!1";
}

async function main() {
  console.log("Seeding permission catalog…");
  for (const perm of PERMISSIONS) {
    await db.permission.upsert({
      where: { key: perm.key },
      update: { label: perm.label, grupo: perm.grupo },
      create: perm,
    });
  }

  console.log("Seeding roles…");
  for (const [key, def] of Object.entries(ROLE_DEFS) as [RoleKey, (typeof ROLE_DEFS)[RoleKey]][]) {
    const role = await db.role.upsert({
      where: { key },
      update: { nombre: def.nombre, descripcion: def.descripcion },
      create: { key, nombre: def.nombre, descripcion: def.descripcion },
    });

    const permKeys = ROLE_PERMISSIONS[key];
    const perms = await db.permission.findMany({ where: { key: { in: permKeys } } });
    const permIds = perms.map((p) => p.id);
    for (const perm of perms) {
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
    // Poda: quitar del rol cualquier permiso que ya no esté en su lista, así
    // re-correr el seed deja los roles exactamente como los define el catálogo.
    await db.rolePermission.deleteMany({
      where: { roleId: role.id, permissionId: { notIn: permIds } },
    });
  }

  console.log("Seeding configuración…");
  await db.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, tipoCambioGlobalMicros: 405000, nombreEmpresa: "Quiroga Automóviles" },
  });

  console.log("Seeding usuarios…");
  const seedUsers: {
    email: string;
    nombre: string;
    password: string;
    role?: RoleKey;
    esVendedor?: boolean;
  }[] = [
    {
      email: (process.env.SEED_ADMIN_EMAIL ?? "quirogaautomoviles@gmail.com").toLowerCase(),
      nombre: "Administrador",
      password: process.env.SEED_ADMIN_PASSWORD ?? randomPassword(),
      role: "SUPERADMIN",
    },
    { email: "quirogajorge095@gmail.com", nombre: "Jorge", password: randomPassword(), role: "SUPERADMIN", esVendedor: true },
    { email: "pepe@quiroga.local", nombre: "Pepe", password: randomPassword(), role: "COSTOS_VEHICULOS" },
    { email: "taller@quiroga.local", nombre: "Taller", password: randomPassword(), role: "TALLER" },
    { email: "3697motors.sanluis@gmail.com", nombre: "Ventas San Luis", password: randomPassword(), role: "VENDEDOR", esVendedor: true },
    { email: "ventaszonamerica@gmail.com", nombre: "Ventas Zonamérica", password: randomPassword(), role: "VENDEDOR", esVendedor: true },
  ];

  for (const su of seedUsers) {
    const passwordHash = await bcrypt.hash(su.password, 10);
    const user = await db.user.upsert({
      where: { email: su.email },
      update: { nombre: su.nombre, esVendedor: su.esVendedor ?? false },
      create: { email: su.email, nombre: su.nombre, passwordHash, esVendedor: su.esVendedor ?? false },
    });
    if (su.role) {
      const role = await db.role.findUniqueOrThrow({ where: { key: su.role } });
      await db.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
  }

  console.log("Seeding empleados…");
  const empleados: {
    nombre: string;
    apellido: string;
    tipoPago: "MENSUAL" | "JORNAL";
    sueldoMensualCents?: number;
    jornalDiarioCents?: number;
  }[] = [
    { nombre: "Patricio", apellido: "Piñeyro", tipoPago: "MENSUAL", sueldoMensualCents: 4_000_000 },
    { nombre: "Matias", apellido: "Soria", tipoPago: "MENSUAL", sueldoMensualCents: 3_500_000 },
    { nombre: "Marcial", apellido: "Hidalgo", tipoPago: "MENSUAL", sueldoMensualCents: 4_000_000 },
    { nombre: "Leandro", apellido: "Luzardo", tipoPago: "MENSUAL", sueldoMensualCents: 3_000_000 },
    { nombre: "Lucas", apellido: "", tipoPago: "JORNAL", jornalDiarioCents: 100_000 },
  ];

  for (const emp of empleados) {
    const existing = await db.empleado.findFirst({ where: { nombre: emp.nombre, apellido: emp.apellido } });
    if (!existing) {
      await db.empleado.create({ data: emp });
    }
  }

  console.log("Seeding cuentas bancarias…");
  for (const banco of ["BBVA", "SANTANDER", "GASTOS_TALLER"] as const) {
    await db.cuentaBancaria.upsert({
      where: { nombre: banco },
      update: {},
      create: { nombre: banco },
    });
  }

  console.log("Seeding plantillas de documentos…");
  const templates = [
    {
      tipo: "CONFORME" as const,
      nombre: "Conforme de pago en cuotas",
      contenidoBase:
        "Por el presente documento me obligo a pagar la suma de {{montoCuota}} el día {{diaVencimiento}} de cada mes, hasta completar {{cantidadCuotas}} cuotas, en concepto de financiación del vehículo {{vehiculo}}.",
    },
    {
      tipo: "PROMESA_COMPRAVENTA" as const,
      nombre: "Promesa de Compraventa",
      contenidoBase:
        "Entre Quiroga Automóviles y {{cliente}} se acuerda la compraventa del vehículo {{vehiculo}}, matrícula {{matricula}}, por un precio de {{precio}}, con una seña de {{sena}} y saldo de {{saldo}}.",
    },
    {
      tipo: "ORDEN_TALLER" as const,
      nombre: "Orden de Trabajo de Taller",
      contenidoBase:
        "Vehículo {{vehiculo}}, matrícula {{matricula}}. Ingreso: {{fechaIngreso}}. Trabajos solicitados: {{trabajos}}. Responsable: {{responsable}}.",
    },
  ];
  for (const tpl of templates) {
    await db.documentoTemplate.upsert({
      where: { tipo: tpl.tipo },
      update: {},
      create: tpl,
    });
  }

  console.log("Seeding vehículos de stock (demo)…");
  const vehiculos: {
    marca: string;
    modelo: string;
    version?: string;
    anio?: number;
    color?: string;
    km?: number;
    motor?: string;
    transmision?: string;
    ubicacion: "SAN_LUIS" | "ZONAMERICA" | "TALLER" | "PROPIETARIO";
    precioVentaUsdCents?: number;
    matricula?: string;
    padron?: string;
    patenteCuotaCents?: number;
    patenteAnualCents?: number;
    propietario?: string;
    tipoPropiedad?: "PROPIA" | "PARTNER" | "CONSIGNADO";
    segundaLlave?: boolean;
    ubicacionLibreta?: string;
    estado: "APRONTANDO" | "SENADO" | "PUBLICADO";
  }[] = [
    {
      marca: "Chevrolet",
      modelo: "Onix LT",
      version: "Sedan 5P",
      anio: 2014,
      color: "Blanco",
      km: 140000,
      motor: "1.4",
      transmision: "MT",
      ubicacion: "ZONAMERICA",
      precioVentaUsdCents: 949_000,
      matricula: "BFA 0343",
      padron: "902789149",
      patenteCuotaCents: 293_600,
      patenteAnualCents: 1_566_000,
      propietario: "Jorge",
      tipoPropiedad: "PROPIA",
      segundaLlave: false,
      ubicacionLibreta: "Zonamérica",
      estado: "PUBLICADO",
    },
    {
      marca: "Peugeot",
      modelo: "208",
      version: "Active",
      anio: 2015,
      color: "Gris",
      km: 126000,
      motor: "1.2",
      transmision: "MT",
      ubicacion: "SAN_LUIS",
      precioVentaUsdCents: 990_000,
      matricula: "SBY 3022",
      padron: "902882175",
      patenteCuotaCents: 314_200,
      patenteAnualCents: 2_094_400,
      propietario: "Jorge",
      tipoPropiedad: "PROPIA",
      segundaLlave: true,
      ubicacionLibreta: "San Luis",
      estado: "SENADO",
    },
    {
      marca: "Volkswagen",
      modelo: "Vento",
      version: "A5",
      anio: 2008,
      color: "Negro",
      km: 220000,
      motor: "2.0",
      transmision: "AT",
      ubicacion: "ZONAMERICA",
      precioVentaUsdCents: 1_890_000,
      matricula: "AAK 5558",
      padron: "900108667",
      patenteCuotaCents: 417_800,
      patenteAnualCents: 2_228_500,
      propietario: "Consignado",
      tipoPropiedad: "CONSIGNADO",
      segundaLlave: false,
      ubicacionLibreta: "Zonamérica",
      estado: "PUBLICADO",
    },
    {
      marca: "Chery",
      modelo: "Tiggo 8 Pro",
      version: "SUV",
      anio: 2022,
      color: "Blanco",
      km: 85000,
      motor: "1.6",
      transmision: "AT",
      ubicacion: "ZONAMERICA",
      precioVentaUsdCents: 2_690_000,
      matricula: "FRF 7564",
      padron: "903576867",
      patenteAnualCents: 4_500_000,
      propietario: "Jorge",
      tipoPropiedad: "PROPIA",
      segundaLlave: false,
      ubicacionLibreta: "Zonamérica",
      estado: "PUBLICADO",
    },
    {
      marca: "Fiat",
      modelo: "Fiorino Forte",
      anio: 2020,
      color: "Blanco",
      motor: "1.3",
      transmision: "MT",
      ubicacion: "TALLER",
      precioVentaUsdCents: 950_000,
      matricula: "ABJ 2305",
      propietario: "Maxi, Jorge",
      tipoPropiedad: "PARTNER",
      segundaLlave: false,
      estado: "APRONTANDO",
    },
    {
      marca: "Mazda",
      modelo: "3",
      anio: 2017,
      color: "Gris",
      motor: "2.0",
      transmision: "AT",
      ubicacion: "TALLER",
      precioVentaUsdCents: 1_599_000,
      matricula: "SCV 8791",
      propietario: "Maxi, Jorge",
      tipoPropiedad: "PARTNER",
      segundaLlave: false,
      estado: "APRONTANDO",
    },
  ];

  const createdVehiculos: Record<string, string> = {};
  for (const v of vehiculos) {
    const existing = v.matricula ? await db.vehiculo.findFirst({ where: { matricula: v.matricula } }) : null;
    const record = existing ?? (await db.vehiculo.create({ data: v }));
    createdVehiculos[v.matricula ?? v.marca] = record.id;
  }

  console.log("Seeding costeo de ejemplo (Peugeot 208 Active)…");
  const peugeotId = createdVehiculos["SBY 3022"];
  if (peugeotId) {
    const costeo = await db.vehiculoCosteo.upsert({
      where: { vehiculoId: peugeotId },
      update: {},
      create: {
        vehiculoId: peugeotId,
        tipoCambioMicros: 405_000,
        fechaCompra: new Date("2025-11-21"),
        precioCompraUsdCents: 770_000,
        precioVentaRealUsdCents: 990_000,
      },
    });
    const gastosExistentes = await db.gastoLine.count({ where: { costeoId: costeo.id } });
    if (gastosExistentes === 0) {
      await db.gastoLine.createMany({
        data: [
          { costeoId: costeo.id, descripcion: "Escribanía", moneda: "UYU", montoCents: 500_000, orden: 1 },
          { costeoId: costeo.id, descripcion: "Comisión venta", moneda: "USD", montoCents: 50_000, orden: 2 },
          { costeoId: costeo.id, descripcion: "Radio multimedia y cámara", moneda: "UYU", montoCents: 650_000, orden: 3 },
          { costeoId: costeo.id, descripcion: "Volante", moneda: "UYU", montoCents: 400_000, orden: 4 },
        ],
      });
    }
  }

  console.log("Seeding venta de ejemplo…");
  const vendedorUser = await db.user.findUnique({ where: { email: "3697motors.sanluis@gmail.com" } });
  const tiggoId = createdVehiculos["FRF 7564"];
  let clienteVentaDemo = await db.cliente.findFirst({ where: { ci: "1234567-8" } });
  if (!clienteVentaDemo) {
    clienteVentaDemo = await db.cliente.create({
      data: { nombre: "Cliente", apellido: "De Ejemplo", ci: "1234567-8", contacto: "099123456" },
    });
  }
  if (tiggoId && vendedorUser) {
    const ventaExistente = await db.venta.findFirst({ where: { vehiculoId: tiggoId } });
    if (!ventaExistente) {
      await db.venta.create({
        data: {
          vehiculoId: tiggoId,
          clienteId: clienteVentaDemo.id,
          fechaSena: new Date("2026-06-01"),
          senaUsdCents: 500_000,
          fechaEntrega: new Date("2026-06-15"),
          precioVentaUsdCents: 2_650_000,
          vendedorId: vendedorUser.id,
          localVenta: "ZONAMERICA",
          propietarioVehiculo: "Jorge",
          comisionVentaUsdCents: 50_000,
          comisionTituloPesosCents: 20_000,
        },
      });
      await db.vehiculo.update({ where: { id: tiggoId }, data: { estado: "SENADO" } });
    }
  }

  console.log("Seeding escribanía de ejemplo…");
  if (peugeotId) {
    const tramiteExistente = await db.escribaniaTramite.findFirst({ where: { vehiculoId: peugeotId } });
    if (!tramiteExistente) {
      await db.escribaniaTramite.create({
        data: {
          vehiculoId: peugeotId,
          clienteId: clienteVentaDemo.id,
          fecha: new Date("2026-03-14"),
          tipoDoc: "CV",
          titulosCon: "CAMILA",
          fechaFirma: new Date("2026-03-18"),
          pagoEscribaniaCents: 1_550_000,
          pagoMoneda: "UYU",
          fechaPago: new Date("2026-03-19"),
          cobroAlCliente: "CONTADO",
          fechaEntregaTitulos: new Date("2026-05-06"),
          ubicacionTitulos: "CLIENTE",
        },
      });
    }
  }

  console.log("Seeding financiación de títulos de ejemplo…");
  const fiorinoId = createdVehiculos["ABJ 2305"];
  let clienteAlexis = await db.cliente.findFirst({ where: { ci: "7654321-0" } });
  if (!clienteAlexis) {
    clienteAlexis = await db.cliente.create({
      data: { nombre: "Alexis", apellido: "Ferreira", ci: "7654321-0", contacto: "099888777" },
    });
  }
  if (fiorinoId) {
    const finTituloExistente = await db.financiacionTitulo.findFirst({ where: { vehiculoId: fiorinoId } });
    if (!finTituloExistente) {
      const finTitulo = await db.financiacionTitulo.create({
        data: {
          vehiculoId: fiorinoId,
          clienteId: clienteAlexis.id,
          contacto: "099888777",
          fechaVenta: new Date("2026-05-07"),
          fechaFirma: new Date("2026-05-11"),
          costoEscribaniaCents: 2_400_000,
          costoMoneda: "USD",
        },
      });
      await db.entregaTitulo.create({
        data: { financiacionTituloId: finTitulo.id, numero: 1, montoCents: 1_200_000, fecha: new Date("2026-05-11") },
      });
    }
  }

  console.log("Seeding crédito BBVA de ejemplo…");
  const creditoExistente = await db.creditoBBVA.findFirst({ where: { ci: "4905829-6" } });
  if (!creditoExistente) {
    await db.creditoBBVA.create({
      data: {
        nombre: "Fabricio Rene Reclade Paez",
        ci: "4905829-6",
        contacto: "91933064",
        montoSolicitadoUsdCents: 1_304_000,
        fechaFirma: new Date("2026-03-02"),
        estado: "APROBADO",
      },
    });
  }

  console.log("Seeding financiación propia de ejemplo (Jorge Autos)…");
  let clienteMaria = await db.cliente.findFirst({ where: { ci: "9198133-3" } });
  if (!clienteMaria) {
    clienteMaria = await db.cliente.create({
      data: { nombre: "Maria", apellido: "Chiva Olivera", ci: "9198133-3", contacto: "091981333" },
    });
  }
  const finPropiaExistente = await db.financiacionPropia.findFirst({ where: { clienteId: clienteMaria.id } });
  if (!finPropiaExistente && peugeotId) {
    const fechaPrimeraCuota = new Date("2026-07-10");
    const finPropia = await db.financiacionPropia.create({
      data: {
        clienteId: clienteMaria.id,
        nombre: "Maria Chiva Olivera",
        contacto: "091981333",
        vehiculoId: peugeotId,
        montoFinanciadoUsdCents: 1_600_000,
        cantidadCuotas: 12,
        montoCuotaUsdCents: 17_500,
        fechaPrimeraCuota,
        diaVencimientoMensual: 10,
      },
    });
    await db.cuotaPropia.createMany({
      data: Array.from({ length: 12 }, (_, i) => {
        const d = new Date(fechaPrimeraCuota);
        d.setUTCMonth(d.getUTCMonth() + i);
        return { financiacionPropiaId: finPropia.id, numero: i + 1, montoCents: 17_500, fechaVencimiento: d };
      }),
    });
  }

  console.log("Seeding deuda de cliente de ejemplo…");
  const deudaExistente = await db.deudaCliente.findFirst({ where: { concepto: { contains: "MULTAS, PATENTE" } } });
  if (!deudaExistente) {
    await db.deudaCliente.create({
      data: {
        nombre: "Jose Serrudo",
        concepto: "Multas, patente y recargos",
        montoCents: 30_000,
        moneda: "UYU",
      },
    });
  }

  console.log("Seeding gasto contadora de ejemplo…");
  const gastoContadoraExistente = await db.gastoContadora.findFirst({ where: { numeroFactura: "A 646511" } });
  if (!gastoContadoraExistente) {
    await db.gastoContadora.create({
      data: {
        tipoComprobante: "FACTURA",
        fecha: new Date("2026-06-01"),
        numeroFactura: "A 646511",
        proveedor: "FIXED SAS",
        moneda: "UYU",
        ivaRate: "VEINTIDOS",
        importeTotalCents: 62_700,
      },
    });
  }

  console.log("Seeding movimientos bancarios y transferencia de ejemplo…");
  const bbvaCuenta = await db.cuentaBancaria.findUnique({ where: { nombre: "BBVA" } });
  const santanderCuenta = await db.cuentaBancaria.findUnique({ where: { nombre: "SANTANDER" } });
  if (bbvaCuenta && santanderCuenta) {
    const transferenciaExistente = await db.transferenciaEntreCuentas.findFirst({
      where: { comentario: "Venta de Chevrolet Aveo" },
    });
    if (!transferenciaExistente) {
      const transferencia = await db.transferenciaEntreCuentas.create({
        data: {
          fecha: new Date("2026-06-01"),
          cuentaOrigenId: santanderCuenta.id,
          cuentaDestinoId: bbvaCuenta.id,
          montoUsdCents: 500_000,
          comisionBancariaCents: 190,
          comentario: "Venta de Chevrolet Aveo",
        },
      });
      await db.movimientoBancario.create({
        data: {
          cuentaId: santanderCuenta.id,
          fecha: new Date("2026-06-01"),
          detalle: "Transferencia enviada",
          tipo: "EGRESO",
          montoUsdCents: 500_000,
          transferenciaId: transferencia.id,
          categoria: "transferencia",
        },
      });
      await db.movimientoBancario.create({
        data: {
          cuentaId: bbvaCuenta.id,
          fecha: new Date("2026-06-01"),
          detalle: "Transferencia recibida",
          tipo: "INGRESO",
          montoUsdCents: 500_000,
          transferenciaId: transferencia.id,
          categoria: "transferencia",
        },
      });
      await db.movimientoBancario.create({
        data: {
          cuentaId: santanderCuenta.id,
          fecha: new Date("2026-06-01"),
          detalle: "Comisión bancaria",
          tipo: "EGRESO",
          montoPesosCents: 190,
          transferenciaId: transferencia.id,
          categoria: "transferencia",
        },
      });
    }
  }

  console.log("Seeding orden de taller de ejemplo…");
  if (fiorinoId) {
    const ordenExistente = await db.ordenTaller.findFirst({ where: { vehiculoId: fiorinoId } });
    if (!ordenExistente) {
      await db.ordenTaller.create({
        data: {
          vehiculoId: fiorinoId,
          fechaIngreso: new Date("2026-07-01"),
          problema: "Cambio de embrague, revisión de frenos delanteros",
          responsable: "Marcial",
          checklist: { create: [{ tarea: "Mecánica", orden: 0 }, { tarea: "Entrega", orden: 1 }] },
          repuestos: {
            create: [{ descripcion: "Kit de embrague, pastillas de freno", cantidad: 1, moneda: "UYU", precioUnitCents: 0 }],
          },
        },
      });
    }
  }

  console.log("Seed completo.");
  console.log("——————————————————————————————————————————");
  console.log("Usuarios de prueba (email / contraseña):");
  for (const su of seedUsers) {
    console.log(`  ${(su.role ?? "—").padEnd(14)} ${su.email} / ${su.password}`);
  }
  console.log("——————————————————————————————————————————");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
