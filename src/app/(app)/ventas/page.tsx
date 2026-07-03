import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await assertCan("ventas.view_full");
  const { mes } = await searchParams;

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    dateFilter = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }

  const ventas = await db.venta.findMany({
    where: dateFilter ? { fechaEntrega: dateFilter } : {},
    include: { vehiculo: true, cliente: true, vendedor: true },
    orderBy: { fechaEntrega: "desc" },
  });

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

      <form className="flex items-center gap-2">
        <Input name="mes" type="month" defaultValue={mes} className="w-48" />
        <Button type="submit" variant="outline">
          Filtrar por mes
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
              <TableCell>{v.localVenta === "SAN_LUIS" ? "San Luis" : "Zonamérica"}</TableCell>
              <TableCell>{v.propietarioVehiculo ?? "—"}</TableCell>
              <TableCell>{formatCents(v.comisionVentaUsdCents, "USD")}</TableCell>
              <TableCell>{formatCents(v.comisionTituloUsdCents, "USD")}</TableCell>
            </TableRow>
          ))}
          {ventas.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                No hay ventas registradas {mes ? "en ese mes" : "todavía"}.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
