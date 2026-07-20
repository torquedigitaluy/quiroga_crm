import Link from "next/link";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { computeCosteo } from "@/lib/costeo";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/stock/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ label, value, variant = "default" }: { label: string; value: string; variant?: "default" | "success" | "danger" }) {
  const color = variant === "success" ? "text-success" : variant === "danger" ? "text-danger" : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`text-lg font-semibold ${color}`}>{value}</span>
      </CardContent>
    </Card>
  );
}

export default async function CostosIndexPage() {
  await assertCan("costos.view");

  const [vehiculos, config] = await Promise.all([
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      include: { costeo: { include: { gastos: true } } },
      orderBy: { fechaIngreso: "desc" },
    }),
    db.configuracion.findUnique({ where: { id: 1 } }),
  ]);
  const configRateMicros = config?.tipoCambioGlobalMicros ?? 400000;

  const computados = vehiculos.map((v) => (v.costeo ? computeCosteo(v.costeo, v.costeo.gastos, configRateMicros) : null));
  const totalGastos = computados.reduce((sum, c) => sum + (c?.totalGastosUsdCents ?? 0), 0);
  const totalGanancia = computados.reduce((sum, c) => sum + (c?.gananciaFinalUsdCents ?? 0), 0);
  const totalCosto = computados.reduce((sum, c) => sum + (c?.costoTotalUsdCents ?? 0), 0);
  const totalVentaReal = vehiculos.reduce((sum, v) => sum + (v.costeo?.precioVentaRealUsdCents ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Costos de Vehículos</h1>
          <p className="text-sm text-muted-foreground">Costo, precio ideal y ganancia por vehículo.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard label="Total gastos" value={formatCents(totalGastos, "USD")} />
          <StatCard label="Total ganancia" value={formatCents(totalGanancia, "USD")} variant={totalGanancia < 0 ? "danger" : "success"} />
          <StatCard label="Costo total" value={formatCents(totalCosto, "USD")} />
          <StatCard label="Total venta real" value={formatCents(totalVentaReal, "USD")} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Costo total</TableHead>
            <TableHead>Precio venta ideal</TableHead>
            <TableHead>Precio venta real</TableHead>
            <TableHead>Ganancia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((v) => {
            const costeo = v.costeo;
            const computed = costeo
              ? computeCosteo(costeo, costeo.gastos, configRateMicros)
              : null;
            return (
              <TableRow key={v.id}>
                <TableCell>
                  <Link href={`/costos/${v.id}`} className="font-medium text-foreground hover:text-brand">
                    {v.marca} {v.modelo} {v.matricula ? `(${v.matricula})` : ""}
                  </Link>
                </TableCell>
                <TableCell>
                  <StatusBadge estado={v.estado} />
                </TableCell>
                <TableCell>{computed ? formatCents(computed.costoTotalUsdCents, "USD") : "—"}</TableCell>
                <TableCell>{computed ? formatCents(computed.precioVentaIdealUsdCents, "USD") : "—"}</TableCell>
                <TableCell>{costeo ? formatCents(costeo.precioVentaRealUsdCents, "USD") : "—"}</TableCell>
                <TableCell className={computed && computed.gananciaFinalUsdCents < 0 ? "text-danger" : "text-success"}>
                  {computed ? formatCents(computed.gananciaFinalUsdCents, "USD") : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
