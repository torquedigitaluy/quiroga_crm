import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents, convertCents } from "@/lib/money";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";

export default async function PlanillaVentaPage() {
  const user = await assertCan("ventas.view_own");
  const puedeEditarPropias = await can("ventas.edit_own");
  const now = new Date();

  const [ventas, ventasAccesorio, vendedores, agrupado, config] = await Promise.all([
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
    db.configuracion.findUnique({ where: { id: 1 } }),
  ]);
  const rateMicros = config?.tipoCambioGlobalMicros ?? 405_000;

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
    (sum, v) => sum + v.comisionVentaUsdCents + convertCents(v.comisionTituloPesosCents, "UYU", "USD", rateMicros),
    0,
  );
  const totalComisionAccesorios = ventasAccesorio.reduce(
    (sum, v) => sum + convertCents(v.comisionAccesorioCents, v.comisionAccesorioMoneda, "USD", rateMicros),
    0,
  );
  const totalComisiones = totalComisionVehiculos + totalComisionAccesorios;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
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
        <Can permission="ventas.create">
          <Button asChild>
            <Link href="/ventas/nueva">
              <Plus className="h-4 w-4" />
              Registrar venta
            </Link>
          </Button>
        </Can>
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
                {puedeEditarPropias && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((v) => {
                const entregado = v.fechaEntrega && new Date(v.fechaEntrega) <= now;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">{vehiculoLabel(v.vehiculo, v.vehiculoExterno)}</TableCell>
                    <TableCell>{v.vehiculo?.matricula ?? "—"}</TableCell>
                    <TableCell>{v.fechaSena ? new Date(v.fechaSena).toLocaleDateString("es-UY") : "—"}</TableCell>
                    <TableCell>{v.fechaEntrega ? new Date(v.fechaEntrega).toLocaleDateString("es-UY") : "—"}</TableCell>
                    <TableCell>{formatCents(v.precioVentaUsdCents, "USD")}</TableCell>
                    <TableCell>{formatCents(v.comisionVentaUsdCents, "USD")}</TableCell>
                    <TableCell>{formatCents(v.comisionTituloPesosCents, "UYU")}</TableCell>
                    <TableCell>
                      {entregado ? (
                        <span className="text-success">Cobrada</span>
                      ) : (
                        <span className="text-muted-foreground">Pendiente de entrega</span>
                      )}
                    </TableCell>
                    {puedeEditarPropias && (
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/ventas/${v.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {ventas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={puedeEditarPropias ? 9 : 8} className="py-8 text-center text-muted-foreground">
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
                  <TableCell>{formatCents(v.comisionAccesorioCents, v.comisionAccesorioMoneda)}</TableCell>
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
