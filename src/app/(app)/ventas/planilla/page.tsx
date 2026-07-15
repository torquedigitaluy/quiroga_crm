import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function PlanillaVentaPage() {
  const user = await assertCan("ventas.view_own");
  const now = new Date();

  const [ventas, ventasAccesorio, vendedores, agrupado] = await Promise.all([
    db.venta.findMany({
      where: { vendedorId: user.id, archivedAt: null },
      include: { vehiculo: true },
      orderBy: { fechaEntrega: "desc" },
    }),
    db.ventaAccesorio.findMany({
      where: { vendedorId: user.id },
      include: { accesorio: true },
      orderBy: { fecha: "desc" },
    }),
    db.user.findMany({ where: { esVendedor: true }, orderBy: { nombre: "asc" } }),
    db.venta.groupBy({
      by: ["vendedorId"],
      where: { archivedAt: null },
      _count: { _all: true },
      _sum: { precioVentaUsdCents: true, comisionVentaUsdCents: true },
    }),
  ]);

  const statsByVendedor = new Map(agrupado.map((g) => [g.vendedorId, g]));

  // Ranking de todos los vendedores por cantidad de autos vendidos.
  const ranking = vendedores
    .map((v) => {
      const s = statsByVendedor.get(v.id);
      return {
        id: v.id,
        nombre: v.nombre,
        cantidad: s?._count._all ?? 0,
        totalVendido: s?._sum.precioVentaUsdCents ?? 0,
        esYo: v.id === user.id,
      };
    })
    .sort((a, b) => b.cantidad - a.cantidad);

  // La comisión de vehículos se computa recién cuando el auto se entrega (no
  // cuando se registra la venta/seña). Las ventas de accesorios no tienen esa
  // demora: se cobran y comisionan en el momento.
  const ventasEntregadas = ventas.filter((v) => v.fechaEntrega && new Date(v.fechaEntrega) <= now);
  const totalComisionVehiculos = ventasEntregadas.reduce(
    (sum, v) => sum + v.comisionVentaUsdCents + v.comisionTituloUsdCents,
    0,
  );
  const totalComisionAccesorios = ventasAccesorio.reduce((sum, v) => sum + v.comisionAccesorioUsdCents, 0);
  const totalComisiones = totalComisionVehiculos + totalComisionAccesorios;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Planilla de Venta</h1>
        <p className="text-sm text-muted-foreground">
          {ventas.length} ventas de vehículos · {ventasAccesorio.length} ventas de accesorios · Comisiones
          acumuladas: {formatCents(totalComisiones, "USD")} (vehículos {formatCents(totalComisionVehiculos, "USD")} +
          accesorios {formatCents(totalComisionAccesorios, "USD")})
        </p>
        <p className="text-xs text-muted-foreground">
          La comisión de un vehículo se cuenta recién cuando se entrega, no cuando se registra la venta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Autos vendidos</TableHead>
                <TableHead className="text-right">Total vendido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((r, i) => (
                <TableRow key={r.id} className={r.esYo ? "bg-brand/5" : undefined}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {r.nombre}
                    {r.esYo && <span className="ml-2 text-xs text-brand">(vos)</span>}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{r.cantidad}</TableCell>
                  <TableCell className="text-right">{formatCents(r.totalVendido, "USD")}</TableCell>
                </TableRow>
              ))}
              {ranking.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Todavía no hay vendedores cargados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Fecha seña</TableHead>
                <TableHead>Fecha entrega</TableHead>
                <TableHead>Precio venta</TableHead>
                <TableHead>Comisión venta</TableHead>
                <TableHead>Comisión título</TableHead>
                <TableHead>Estado comisión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((v) => {
                const entregado = v.fechaEntrega && new Date(v.fechaEntrega) <= now;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">
                      {v.vehiculo.marca} {v.vehiculo.modelo}
                    </TableCell>
                    <TableCell>{v.vehiculo.matricula ?? "—"}</TableCell>
                    <TableCell>{v.fechaSena ? new Date(v.fechaSena).toLocaleDateString("es-UY") : "—"}</TableCell>
                    <TableCell>{v.fechaEntrega ? new Date(v.fechaEntrega).toLocaleDateString("es-UY") : "—"}</TableCell>
                    <TableCell>{formatCents(v.precioVentaUsdCents, "USD")}</TableCell>
                    <TableCell>{formatCents(v.comisionVentaUsdCents, "USD")}</TableCell>
                    <TableCell>{formatCents(v.comisionTituloUsdCents, "USD")}</TableCell>
                    <TableCell>
                      {entregado ? (
                        <span className="text-success">Cobrada</span>
                      ) : (
                        <span className="text-muted-foreground">Pendiente de entrega</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {ventas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Todavía no tenés ventas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis ventas de accesorios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Accesorio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio venta</TableHead>
                <TableHead>Comisión accesorio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventasAccesorio.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-foreground">
                    {v.accesorio.marca} {v.accesorio.modelo}
                  </TableCell>
                  <TableCell>{new Date(v.fecha).toLocaleDateString("es-UY")}</TableCell>
                  <TableCell>{formatCents(v.precioVentaUsdCents, "USD")}</TableCell>
                  <TableCell>{formatCents(v.comisionAccesorioUsdCents, "USD")}</TableCell>
                </TableRow>
              ))}
              {ventasAccesorio.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Todavía no tenés ventas de accesorios registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
