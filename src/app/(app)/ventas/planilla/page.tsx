import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function PlanillaVentaPage() {
  const user = await assertCan("ventas.view_own");

  const ventas = await db.venta.findMany({
    where: { vendedorId: user.id },
    include: { vehiculo: true },
    orderBy: { fechaEntrega: "desc" },
  });

  const totalComisiones = ventas.reduce(
    (sum, v) => sum + v.comisionVentaUsdCents + v.comisionTituloUsdCents,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Planilla de Venta</h1>
        <p className="text-sm text-muted-foreground">
          {ventas.length} ventas · Comisiones acumuladas: {formatCents(totalComisiones, "USD")}
        </p>
      </div>

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
              <TableCell>{formatCents(v.comisionVentaUsdCents, "USD")}</TableCell>
              <TableCell>{formatCents(v.comisionTituloUsdCents, "USD")}</TableCell>
            </TableRow>
          ))}
          {ventas.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                Todavía no tenés ventas registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
