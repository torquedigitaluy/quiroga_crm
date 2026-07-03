import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";

export default async function FinanciacionPropiaPage() {
  await assertCan("propia.view");

  const financiaciones = await db.financiacionPropia.findMany({
    include: { cliente: true, vehiculo: true, cuotas: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financiación Propia (Jorge Autos)</h1>
          <p className="text-sm text-muted-foreground">{financiaciones.length} planes activos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/propia/deudas">
              <Receipt className="h-4 w-4" />
              Deudas de clientes
            </Link>
          </Button>
          <Can permission="propia.edit">
            <Button asChild>
              <Link href="/propia/nueva">
                <Plus className="h-4 w-4" />
                Nueva financiación
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Monto financiado</TableHead>
            <TableHead>Cuotas</TableHead>
            <TableHead>Pagadas</TableHead>
            <TableHead>Atrasadas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {financiaciones.map((f) => {
            const pagadas = f.cuotas.filter((c) => c.pagada).length;
            const atrasadas = f.cuotas.filter((c) => !c.pagada && new Date(c.fechaVencimiento) < new Date()).length;
            return (
              <TableRow key={f.id}>
                <TableCell>
                  <Link href={`/propia/${f.id}`} className="font-medium text-foreground hover:text-brand">
                    {f.nombre}
                  </Link>
                </TableCell>
                <TableCell>{f.vehiculo ? `${f.vehiculo.marca} ${f.vehiculo.modelo}` : "—"}</TableCell>
                <TableCell>{formatCents(f.montoFinanciadoUsdCents, "USD")}</TableCell>
                <TableCell>
                  {pagadas} / {f.cantidadCuotas}
                </TableCell>
                <TableCell>{pagadas}</TableCell>
                <TableCell className={atrasadas > 0 ? "text-danger" : "text-muted-foreground"}>{atrasadas}</TableCell>
              </TableRow>
            );
          })}
          {financiaciones.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No hay planes de financiación propia registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
