import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { assertCan, getEffectivePermissions } from "@/lib/permissions/engine";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/money";
import { computeCosteo } from "@/lib/costeo";
import { computeSaldos } from "@/lib/saldos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VentasChart, type VentasMes } from "@/components/dashboard/VentasChart";
import { RevealableStat } from "@/components/dashboard/RevealableStat";
import { GananciaPorVehiculo, type GananciaRow } from "@/components/dashboard/GananciaPorVehiculo";
import { ClickableStatCard } from "@/components/dashboard/ClickableStatCard";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default async function DashboardPage() {
  const user = await assertCan("dashboard.view");
  const perms = await getEffectivePermissions(user.id);

  // Company-wide money (ganancia, saldos bancarios, deudas de otros clientes) is only
  // for back-office roles. A vendedor only ever sees figures about their own sales, and
  // taller-only staff (sin acceso a costos/ventas) get a taller-scoped summary instead.
  const puedeVerFinanzasDeLaEmpresa =
    perms.has("costos.view") || perms.has("bancos.view") || perms.has("ventas.view_full");
  const esSoloTaller = !puedeVerFinanzasDeLaEmpresa && !perms.has("ventas.view_own") && perms.has("taller.view");
  const esSoloCostosPropios =
    !puedeVerFinanzasDeLaEmpresa && !esSoloTaller && !perms.has("ventas.view_own") && perms.has("costos.view_own");

  const vehiculos = await db.vehiculo.groupBy({
    by: ["estado"],
    where: { esVehiculo: true, archivedAt: null },
    _count: true,
  });
  const stockPorEstado = { APRONTANDO: 0, SENADO: 0, PUBLICADO: 0, VENDIDO: 0 } as Record<string, number>;
  for (const v of vehiculos) stockPorEstado[v.estado] = v._count;

  // Detalle para los popups de las cards de Taller y Señados.
  const [tallerVehiculos, senadoVehiculos] = await Promise.all([
    db.vehiculo.findMany({
      where: { esVehiculo: true, estado: "APRONTANDO", archivedAt: null },
      include: { ordenesTaller: { orderBy: { fechaIngreso: "desc" }, take: 1 } },
      orderBy: { fechaIngreso: "desc" },
    }),
    db.vehiculo.findMany({
      where: { esVehiculo: true, estado: "SENADO", archivedAt: null },
      include: { ventas: { orderBy: { createdAt: "desc" }, take: 1, include: { cliente: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Hola, {user.name ?? user.email}</h1>
        <p className="text-sm text-muted-foreground">
          {puedeVerFinanzasDeLaEmpresa
            ? "Resumen general de Quiroga Automóviles."
            : esSoloTaller
              ? "Resumen de taller."
              : esSoloCostosPropios
                ? "Tus vehículos asignados."
                : "Tu resumen de ventas."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <ClickableStatCard
          label="Taller / Aprontando"
          value={stockPorEstado.APRONTANDO.toString()}
          variant="warning"
          title="Vehículos en taller / aprontando"
          description="Autos en preparación y su orden de taller (ingreso y trabajos)."
        >
          <TallerDetalle vehiculos={tallerVehiculos} />
        </ClickableStatCard>
        <ClickableStatCard
          label="Señados"
          value={stockPorEstado.SENADO.toString()}
          variant="danger"
          title="Vehículos señados"
          description="Autos con seña registrada y su venta."
        >
          <SenadosDetalle vehiculos={senadoVehiculos} />
        </ClickableStatCard>
        <StatCard label="Publicados" value={stockPorEstado.PUBLICADO.toString()} variant="default" />
        <StatCard label="Entregados" value={stockPorEstado.VENDIDO.toString()} variant="success" />
      </div>

      {puedeVerFinanzasDeLaEmpresa ? (
        <DashboardEmpresa />
      ) : esSoloTaller ? (
        <DashboardTaller />
      ) : esSoloCostosPropios ? (
        <DashboardCostosPropios responsableId={user.id} />
      ) : (
        <DashboardVendedor vendedorId={user.id} />
      )}
    </div>
  );
}

async function DashboardEmpresa() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [ventasDelMes, ventasUltimos6Meses, costeos, cuentas, config, cuotasAtrasadas, financiacionesTitulo, deudasPendientes] =
    await Promise.all([
      db.venta.findMany({ where: { fechaEntrega: { gte: monthStart } } }),
      db.venta.findMany({ where: { fechaEntrega: { gte: sixMonthsAgo } } }),
      db.vehiculoCosteo.findMany({
        include: { gastos: true, vehiculo: true },
        where: { precioVentaRealUsdCents: { gt: 0 } },
      }),
      db.cuentaBancaria.findMany({ include: { movimientos: true } }),
      db.configuracion.findUnique({ where: { id: 1 } }),
      db.cuotaPropia.findMany({
        where: { pagada: false, fechaVencimiento: { lt: now } },
        include: { financiacionPropia: { include: { cliente: true } } },
      }),
      db.financiacionTitulo.findMany({ include: { cliente: true, entregas: true } }),
      db.deudaCliente.findMany({ where: { saldado: false }, include: { cliente: true } }),
    ]);

  const configRateMicros = config?.tipoCambioGlobalMicros ?? 400000;
  const totalVentasMes = ventasDelMes.reduce((sum, v) => sum + v.precioVentaUsdCents, 0);

  const gananciaPorVehiculo: GananciaRow[] = costeos
    .map((c) => {
      const computed = computeCosteo(c, c.gastos, configRateMicros);
      return {
        vehiculoId: c.vehiculoId,
        label: `${c.vehiculo.marca} ${c.vehiculo.modelo}${c.vehiculo.matricula ? ` (${c.vehiculo.matricula})` : ""}`,
        costoTotalCents: computed.costoTotalUsdCents,
        precioVentaCents: c.precioVentaRealUsdCents,
        gananciaCents: c.precioVentaRealUsdCents - computed.costoTotalUsdCents,
      };
    })
    .sort((a, b) => b.gananciaCents - a.gananciaCents);

  const gananciaAcumuladaCents = gananciaPorVehiculo.reduce((sum, r) => sum + r.gananciaCents, 0);

  const bbva = cuentas.find((c) => c.nombre === "BBVA");
  const santander = cuentas.find((c) => c.nombre === "SANTANDER");
  const saldoBbva = bbva ? computeSaldos(bbva.saldoInicialPesosCents, bbva.saldoInicialUsdCents, bbva.movimientos) : null;
  const saldoSantander = santander
    ? computeSaldos(santander.saldoInicialPesosCents, santander.saldoInicialUsdCents, santander.movimientos)
    : null;

  const chartData = buildChartData(ventasUltimos6Meses, now);

  const financiacionTituloAtrasadas = financiacionesTitulo
    .map((f) => ({ f, saldo: f.costoEscribaniaCents - f.entregas.reduce((sum, e) => sum + e.montoCents, 0) }))
    .filter((x) => x.saldo > 0);

  type AtrasoRow = { clienteId: string | null; clienteNombre: string; tipo: string; detalle: string; montoCents: number; moneda: "UYU" | "USD" };
  const atrasos: AtrasoRow[] = [
    ...cuotasAtrasadas.map((c) => ({
      clienteId: c.financiacionPropia.clienteId,
      clienteNombre: c.financiacionPropia.nombre,
      tipo: "Cuota propia",
      detalle: `Vencida el ${new Date(c.fechaVencimiento).toLocaleDateString("es-UY")}`,
      montoCents: c.montoCents,
      moneda: "USD" as const,
    })),
    ...financiacionTituloAtrasadas.map(({ f, saldo }) => ({
      clienteId: f.clienteId,
      clienteNombre: f.cliente ? `${f.cliente.nombre} ${f.cliente.apellido ?? ""}` : "—",
      tipo: "Título pendiente",
      detalle: "Saldo de títulos sin cobrar",
      montoCents: saldo,
      moneda: f.costoMoneda,
    })),
    ...deudasPendientes.map((d) => ({
      clienteId: d.clienteId,
      clienteNombre: d.nombre,
      tipo: "Deuda",
      detalle: d.concepto,
      montoCents: d.montoCents,
      moneda: d.moneda,
    })),
  ].sort((a, b) => b.montoCents - a.montoCents);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <RevealableStat label="Ventas del mes" value={`${ventasDelMes.length} · ${formatCents(totalVentasMes, "USD")}`} />
        <RevealableStat label="Ganancia acumulada" value={formatCents(gananciaAcumuladaCents, "USD")} />
        <RevealableStat
          label="Saldo BBVA"
          value={saldoBbva ? `${formatCents(saldoBbva.saldoPesosCents, "UYU")} / ${formatCents(saldoBbva.saldoUsdCents, "USD")}` : "—"}
        />
        <RevealableStat
          label="Saldo Santander"
          value={saldoSantander ? `${formatCents(saldoSantander.saldoPesosCents, "UYU")} / ${formatCents(saldoSantander.saldoUsdCents, "USD")}` : "—"}
        />
        <StatCard label="Atrasos abiertos" value={atrasos.length.toString()} variant={atrasos.length > 0 ? "danger" : "default"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas — últimos 6 meses</CardTitle>
          <CardDescription>Precio de venta total (USD) por mes de entrega.</CardDescription>
        </CardHeader>
        <CardContent>
          <VentasChart data={chartData} />
        </CardContent>
      </Card>

      <GananciaPorVehiculo rows={gananciaPorVehiculo} />

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Atrasados</CardTitle>
          <CardDescription>Cuotas propias vencidas, saldos de títulos pendientes y deudas de clientes sin saldar.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {atrasos.slice(0, 25).map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{a.tipo}</Badge>
                {a.clienteId ? (
                  <Link href={`/clientes/${a.clienteId}`} className="font-medium text-foreground hover:text-brand">
                    {a.clienteNombre}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{a.clienteNombre}</span>
                )}
                <span className="text-muted-foreground">{a.detalle}</span>
              </div>
              <span className="font-semibold text-danger">{formatCents(a.montoCents, a.moneda)}</span>
            </div>
          ))}
          {atrasos.length === 0 && <p className="text-sm text-muted-foreground">No hay atrasos registrados. 🎉</p>}
        </CardContent>
      </Card>
    </>
  );
}

async function DashboardTaller() {
  const [ordenesAbiertas, gastosCuenta] = await Promise.all([
    db.ordenTaller.count(),
    db.cuentaBancaria.findUnique({
      where: { nombre: "GASTOS_TALLER" },
      include: { movimientos: { where: { fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } } },
    }),
  ]);

  const gastoDelMesPesos = gastosCuenta?.movimientos.reduce((sum, m) => sum + m.montoPesosCents, 0) ?? 0;
  const gastoDelMesUsd = gastosCuenta?.movimientos.reduce((sum, m) => sum + m.montoUsdCents, 0) ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Órdenes de trabajo totales" value={ordenesAbiertas.toString()} />
        <StatCard label="Gasto de taller del mes" value={`${formatCents(gastoDelMesPesos, "UYU")} + ${formatCents(gastoDelMesUsd, "USD")}`} />
      </div>
      <p className="text-sm text-muted-foreground">
        Cargá gastos y órdenes de trabajo desde{" "}
        <Link href="/taller" className="text-brand hover:underline">
          Taller
        </Link>
        .
      </p>
    </>
  );
}

async function DashboardCostosPropios({ responsableId }: { responsableId: string }) {
  const vehiculos = await db.vehiculo.findMany({
    where: { responsableId, esVehiculo: true, archivedAt: null },
    include: { costeo: true },
  });

  const conCosteoCargado = vehiculos.filter((v) => v.costeo && v.costeo.precioCompraUsdCents > 0).length;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Mis vehículos asignados" value={vehiculos.length.toString()} />
        <StatCard label="Con costeo cargado" value={conCosteoCargado.toString()} />
      </div>
      <p className="text-sm text-muted-foreground">
        Cargá los costos de tus vehículos desde{" "}
        <Link href="/mis-vehiculos" className="text-brand hover:underline">
          Mis Vehículos
        </Link>
        .
      </p>
    </>
  );
}

async function DashboardVendedor({ vendedorId }: { vendedorId: string }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [ventasDelMes, ventasUltimos6Meses, accesoriosDelMes] = await Promise.all([
    db.venta.findMany({ where: { vendedorId, fechaEntrega: { gte: monthStart } } }),
    db.venta.findMany({ where: { vendedorId, fechaEntrega: { gte: sixMonthsAgo } } }),
    db.ventaAccesorio.findMany({ where: { vendedorId, fecha: { gte: monthStart } } }),
  ]);

  const comisionVehiculosDelMes = ventasDelMes.reduce(
    (sum, v) => sum + v.comisionVentaUsdCents + v.comisionTituloUsdCents,
    0,
  );
  const comisionAccesoriosDelMes = accesoriosDelMes.reduce((sum, v) => sum + v.comisionAccesorioUsdCents, 0);
  const chartData = buildChartData(
    ventasUltimos6Meses,
    now,
    (v) => (v.comisionVentaUsdCents ?? 0) + (v.comisionTituloUsdCents ?? 0),
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Mis ventas del mes" value={ventasDelMes.length.toString()} />
        <StatCard label="Comisión vehículos del mes" value={formatCents(comisionVehiculosDelMes, "USD")} />
        <StatCard label="Comisión accesorios del mes" value={formatCents(comisionAccesoriosDelMes, "USD")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis comisiones — últimos 6 meses</CardTitle>
          <CardDescription>Comisión de venta + comisión de título por mes de entrega.</CardDescription>
        </CardHeader>
        <CardContent>
          <VentasChart data={chartData} />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Para el detalle de cada venta, mirá tu{" "}
        <Link href="/ventas/planilla" className="text-brand hover:underline">
          Planilla de Venta
        </Link>
        .
      </p>
    </>
  );
}

function buildChartData(
  ventas: { fechaEntrega: Date | null; precioVentaUsdCents: number; comisionVentaUsdCents?: number; comisionTituloUsdCents?: number }[],
  now: Date,
  valueFn?: (v: { precioVentaUsdCents: number; comisionVentaUsdCents?: number; comisionTituloUsdCents?: number }) => number,
): VentasMes[] {
  const ventasPorMes = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    ventasPorMes.set(MESES_CORTOS[d.getMonth()], 0);
  }
  for (const v of ventas) {
    if (!v.fechaEntrega) continue;
    const key = MESES_CORTOS[new Date(v.fechaEntrega).getMonth()];
    const value = valueFn ? valueFn(v) : v.precioVentaUsdCents;
    if (ventasPorMes.has(key)) ventasPorMes.set(key, (ventasPorMes.get(key) ?? 0) + value / 100);
  }
  return [...ventasPorMes.entries()].map(([mes, total]) => ({ mes, total: Math.round(total) }));
}

type TallerVehiculo = Prisma.VehiculoGetPayload<{ include: { ordenesTaller: true } }>;
type SenadoVehiculo = Prisma.VehiculoGetPayload<{ include: { ventas: { include: { cliente: true } } } }>;

function TallerDetalle({ vehiculos }: { vehiculos: TallerVehiculo[] }) {
  if (vehiculos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay vehículos en taller en este momento.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {vehiculos.map((v) => {
        const orden = v.ordenesTaller[0];
        return (
          <div key={v.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/stock/${v.id}`} className="font-medium text-foreground hover:text-brand">
                {v.marca} {v.modelo} {v.matricula ? `· ${v.matricula}` : ""}
              </Link>
              <span className="text-xs text-muted-foreground">
                Ingreso: {new Date(orden?.fechaIngreso ?? v.fechaIngreso).toLocaleDateString("es-UY")}
              </span>
            </div>
            {orden ? (
              <div className="mt-2 text-sm">
                <p className="text-foreground">
                  <span className="text-muted-foreground">Problema: </span>
                  {orden.problema}
                </p>
                {orden.responsable && (
                  <p className="text-muted-foreground">Responsable: {orden.responsable}</p>
                )}
                <Link href={`/taller/ordenes/${orden.id}`} className="text-brand hover:underline">
                  Ver orden completa
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Sin orden de taller cargada todavía.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SenadosDetalle({ vehiculos }: { vehiculos: SenadoVehiculo[] }) {
  if (vehiculos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay vehículos señados en este momento.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {vehiculos.map((v) => {
        const venta = v.ventas[0];
        return (
          <div key={v.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/stock/${v.id}`} className="font-medium text-foreground hover:text-brand">
                {v.marca} {v.modelo} {v.matricula ? `· ${v.matricula}` : ""}
              </Link>
              {venta?.fechaSena && (
                <span className="text-xs text-muted-foreground">
                  Seña: {new Date(venta.fechaSena).toLocaleDateString("es-UY")}
                </span>
              )}
            </div>
            {venta ? (
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span>
                  <span className="text-muted-foreground">Cliente: </span>
                  {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido ?? ""}` : "—"}
                </span>
                <span>
                  <span className="text-muted-foreground">Precio: </span>
                  {formatCents(venta.precioVentaUsdCents, "USD")}
                </span>
                <span>
                  <span className="text-muted-foreground">Seña: </span>
                  {formatCents(venta.senaUsdCents, "USD")}
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Señado sin venta asociada.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const color =
    variant === "warning"
      ? "text-warning-foreground"
      : variant === "danger"
        ? "text-danger"
        : variant === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`text-lg font-semibold ${color}`}>{value}</span>
      </CardContent>
    </Card>
  );
}
