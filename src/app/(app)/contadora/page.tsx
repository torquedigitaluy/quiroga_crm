import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { calcularIva, IVA_RATE_LABELS, type IvaRate } from "@/lib/iva";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { GastoContadoraForm } from "@/components/contadora/GastoContadoraForm";
import { DeleteGastoButton } from "@/components/contadora/DeleteGastoButton";
import { createGastoContadora } from "./actions";

export default async function ContadoraPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await assertCan("contadora.view");
  const { mes } = await searchParams;

  const now = new Date();
  const [year, month] = mes ? mes.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));
  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  const [gastos, user] = await Promise.all([
    db.gastoContadora.findMany({
      where: { fecha: { gte: rangeStart, lt: rangeEnd } },
      orderBy: { fecha: "asc" },
    }),
    getCurrentUser(),
  ]);
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("contadora.edit");

  const totalPesos = gastos.filter((g) => g.moneda === "UYU").reduce((sum, g) => sum + g.importeTotalCents, 0);
  const totalUsd = gastos.filter((g) => g.moneda === "USD").reduce((sum, g) => sum + g.importeTotalCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Contadora — Gastos administrativos</h1>
        <p className="text-sm text-muted-foreground">
          {gastos.length} comprobantes · Total: {formatCents(totalPesos, "UYU")} + {formatCents(totalUsd, "USD")}
        </p>
      </div>

      <form className="flex items-center gap-2">
        <Input name="mes" type="month" defaultValue={monthValue} className="w-48" />
        <Button type="submit" variant="outline">
          Cambiar mes
        </Button>
      </form>

      {editable && <GastoContadoraForm action={createGastoContadora} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>N° Factura</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead>Neto</TableHead>
            <TableHead>Importe total</TableHead>
            {editable && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.map((g) => {
            const { netoCents, ivaCents } = calcularIva(g.importeTotalCents, g.ivaRate as IvaRate);
            return (
              <TableRow key={g.id}>
                <TableCell>
                  <Badge variant={g.tipoComprobante === "NOTA_CREDITO" ? "warning" : "outline"}>
                    {g.tipoComprobante === "NOTA_CREDITO" ? "NC" : "Factura"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(g.fecha).toLocaleDateString("es-UY")}</TableCell>
                <TableCell>{g.numeroFactura ?? "—"}</TableCell>
                <TableCell className="font-medium text-foreground">{g.proveedor}</TableCell>
                <TableCell>
                  {IVA_RATE_LABELS[g.ivaRate as IvaRate]} ({formatCents(ivaCents, g.moneda)})
                </TableCell>
                <TableCell>{formatCents(netoCents, g.moneda)}</TableCell>
                <TableCell>{formatCents(g.importeTotalCents, g.moneda)}</TableCell>
                {editable && (
                  <TableCell>
                    <DeleteGastoButton id={g.id} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {gastos.length === 0 && (
            <TableRow>
              <TableCell colSpan={editable ? 8 : 7} className="py-8 text-center text-muted-foreground">
                No hay gastos registrados en ese mes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
