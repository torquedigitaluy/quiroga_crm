import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { computeSaldos } from "@/lib/saldos";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MovimientoForm } from "@/components/bancos/MovimientoForm";
import { TransferenciaDialog } from "@/components/bancos/TransferenciaDialog";
import { DeleteMovimientoButton } from "@/components/bancos/DeleteMovimientoButton";
import { createMovimiento, createTransferencia } from "./actions";

const BANCO_LABELS: Record<string, string> = { BBVA: "BBVA", SANTANDER: "Santander" };

export default async function BancosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await assertCan("bancos.view");
  const { mes } = await searchParams;

  const now = new Date();
  const [year, month] = mes ? mes.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));
  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  const [cuentas, user] = await Promise.all([
    db.cuentaBancaria.findMany({
      include: { movimientos: { orderBy: { fecha: "asc" } } },
      orderBy: { nombre: "asc" },
    }),
    getCurrentUser(),
  ]);
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("bancos.edit");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bancos</h1>
          <p className="text-sm text-muted-foreground">Movimientos y saldos de BBVA y Santander.</p>
        </div>
        {editable && (
          <TransferenciaDialog
            cuentas={cuentas.map((c) => ({ id: c.id, nombre: BANCO_LABELS[c.nombre] }))}
            action={createTransferencia}
          />
        )}
      </div>

      <form className="flex items-center gap-2">
        <Input name="mes" type="month" defaultValue={monthValue} className="w-48" />
        <Button type="submit" variant="outline">
          Cambiar mes
        </Button>
      </form>

      <Tabs defaultValue={cuentas[0]?.id}>
        <TabsList>
          {cuentas.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {BANCO_LABELS[c.nombre]}
            </TabsTrigger>
          ))}
        </TabsList>
        {cuentas.map((cuenta) => {
          const saldoTotal = computeSaldos(cuenta.saldoInicialPesosCents, cuenta.saldoInicialUsdCents, cuenta.movimientos);
          const movimientosDelMes = cuenta.movimientos.filter(
            (m) => m.fecha >= rangeStart && m.fecha < rangeEnd,
          );
          const boundCreateMovimiento = createMovimiento.bind(null, cuenta.id);

          return (
            <TabsContent key={cuenta.id} value={cuenta.id} className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saldo actual — {BANCO_LABELS[cuenta.nombre]}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Pesos</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCents(saldoTotal.saldoPesosCents, "UYU")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Dólares</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCents(saldoTotal.saldoUsdCents, "USD")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {editable && <MovimientoForm cuentaId={cuenta.id} action={boundCreateMovimiento} />}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Comentario</TableHead>
                    <TableHead>Ingreso $</TableHead>
                    <TableHead>Ingreso USD</TableHead>
                    <TableHead>Egreso $</TableHead>
                    <TableHead>Egreso USD</TableHead>
                    {editable && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosDelMes.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{new Date(m.fecha).toLocaleDateString("es-UY")}</TableCell>
                      <TableCell className="font-medium text-foreground">{m.detalle}</TableCell>
                      <TableCell>{m.comentario ?? "—"}</TableCell>
                      <TableCell>{m.tipo === "INGRESO" && m.montoPesosCents ? formatCents(m.montoPesosCents, "UYU") : "—"}</TableCell>
                      <TableCell>{m.tipo === "INGRESO" && m.montoUsdCents ? formatCents(m.montoUsdCents, "USD") : "—"}</TableCell>
                      <TableCell>{m.tipo === "EGRESO" && m.montoPesosCents ? formatCents(m.montoPesosCents, "UYU") : "—"}</TableCell>
                      <TableCell>{m.tipo === "EGRESO" && m.montoUsdCents ? formatCents(m.montoUsdCents, "USD") : "—"}</TableCell>
                      {editable && (
                        <TableCell>
                          <DeleteMovimientoButton id={m.id} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {movimientosDelMes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={editable ? 8 : 7} className="py-8 text-center text-muted-foreground">
                        No hay movimientos en ese mes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
