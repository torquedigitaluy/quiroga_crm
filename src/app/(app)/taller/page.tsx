import Link from "next/link";
import { Plus, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { computeSaldos } from "@/lib/saldos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { GastoTallerForm } from "@/components/taller/GastoTallerForm";
import { createGastoTaller } from "./actions";

export default async function TallerPage() {
  const user = await assertCan("taller.view");
  const perms = await getEffectivePermissions(user.id);
  const editable = perms.has("taller.edit");

  const [cuenta, ordenes] = await Promise.all([
    db.cuentaBancaria.findUnique({
      where: { nombre: "GASTOS_TALLER" },
      include: { movimientos: { orderBy: { fecha: "desc" } } },
    }),
    db.ordenTaller.findMany({ include: { vehiculo: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const movimientos = cuenta?.movimientos ?? [];
  const saldo = cuenta
    ? computeSaldos(cuenta.saldoInicialPesosCents, cuenta.saldoInicialUsdCents, movimientos)
    : { saldoPesosCents: 0, saldoUsdCents: 0 };
  const totalGastadoPesos = movimientos.reduce((sum, m) => sum + m.montoPesosCents, 0);
  const totalGastadoUsd = movimientos.reduce((sum, m) => sum + m.montoUsdCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Taller</h1>
        <p className="text-sm text-muted-foreground">Gastos de taller y órdenes de trabajo.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Órdenes de trabajo</h2>
        <Button asChild>
          <Link href="/taller/ordenes/nueva">
            <Plus className="h-4 w-4" />
            Nueva orden
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            <TableHead>Trabajos</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenes.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium text-foreground">
                {o.vehiculo.marca} {o.vehiculo.modelo}
              </TableCell>
              <TableCell>{new Date(o.fechaIngreso).toLocaleDateString("es-UY")}</TableCell>
              <TableCell className="max-w-xs truncate">{o.trabajos}</TableCell>
              <TableCell>{o.responsable ?? "—"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/documentos/orden-taller/${o.id}`} target="_blank" rel="noopener noreferrer">
                    <FileDown className="h-3.5 w-3.5" />
                    PDF
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {ordenes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No hay órdenes de trabajo registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Card>
        <CardHeader>
          <CardTitle>Gastos de Taller</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Gastado en pesos</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(totalGastadoPesos, "UYU")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Gastado en USD</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(totalGastadoUsd, "USD")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Saldo pesos</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(saldo.saldoPesosCents, "UYU")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Saldo USD</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(saldo.saldoUsdCents, "USD")}</span>
          </div>
        </CardContent>
      </Card>

      {editable && <GastoTallerForm action={createGastoTaller} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Monto $</TableHead>
            <TableHead>Monto USD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{new Date(m.fecha).toLocaleDateString("es-UY")}</TableCell>
              <TableCell className="font-medium text-foreground">{m.detalle}</TableCell>
              <TableCell>{m.montoPesosCents ? formatCents(m.montoPesosCents, "UYU") : "—"}</TableCell>
              <TableCell>{m.montoUsdCents ? formatCents(m.montoUsdCents, "USD") : "—"}</TableCell>
            </TableRow>
          ))}
          {movimientos.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                No hay gastos de taller registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
