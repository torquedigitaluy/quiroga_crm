import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { localVentaLabel } from "@/lib/venta-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; vendedor?: string }>;
}) {
  await assertCan("ventas.view_full");
  const { mes, vendedor } = await searchParams;
  const puedeEditar = await can("ventas.edit");

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    dateFilter = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }

  const [ventas, vendedores] = await Promise.all([
    db.venta.findMany({
      where: {
        ...(dateFilter ? { fechaEntrega: dateFilter } : {}),
        ...(vendedor ? { vendedorId: vendedor } : {}),
      },
      include: { vehiculo: true, cliente: true, vendedor: true },
      orderBy: { fechaEntrega: "desc" },
    }),
    db.user.findMany({ where: { esVendedor: true }, orderBy: { nombre: "asc" } }),
  ]);

  const totalComisiones = ventas.reduce(
    (sum, v) => sum + v.comisionVentaUsdCents + v.comisionTituloUsdCents,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            {ventas.length} ventas · Comisiones totales: {formatCents(totalComisiones, "USD")}
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

      <form className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Mes</label>
          <Input name="mes" type="month" defaultValue={mes} className="w-48" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Vendedor</label>
          <select
            name="vendedor"
            defaultValue={vendedor ?? ""}
            className="h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Todos</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca / Modelo</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Fecha seña</TableHead>
            <TableHead>Fecha entrega</TableHead>
            <TableHead>Precio venta</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Comisión venta</TableHead>
            <TableHead>Comisión título</TableHead>
            {puedeEditar && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-medium text-foreground">
                {v.vehiculo.marca} {v.vehiculo.modelo}
              </TableCell>
              <TableCell>{v.vehiculo.matricula ?? "—"}</TableCell>
              <TableCell>{v.fechaSena ? new Date(v.fechaSena).toLocaleDateString("es-UY") : "—"}</TableCell>
              <TableCell>{v.fechaEntrega ? new Date(v.fechaEntrega).toLocaleDateString("es-UY") : "—"}</TableCell>
              <TableCell>{formatCents(v.precioVentaUsdCents, "USD")}</TableCell>
              <TableCell>{v.vendedor?.nombre ?? "—"}</TableCell>
              <TableCell>{localVentaLabel(v.localVenta)}</TableCell>
              <TableCell>{v.propietarioVehiculo ?? "—"}</TableCell>
              <TableCell>{formatCents(v.comisionVentaUsdCents, "USD")}</TableCell>
              <TableCell>{formatCents(v.comisionTituloUsdCents, "USD")}</TableCell>
              {puedeEditar && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ventas/${v.id}`}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
          {ventas.length === 0 && (
            <TableRow>
              <TableCell colSpan={puedeEditar ? 11 : 10} className="py-8 text-center text-muted-foreground">
                No hay ventas registradas {mes || vendedor ? "con ese filtro" : "todavía"}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
