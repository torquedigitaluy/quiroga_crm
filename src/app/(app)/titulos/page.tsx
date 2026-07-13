import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";

export default async function TitulosPage() {
  await assertCan("titulos.view");

  const financiaciones = await db.financiacionTitulo.findMany({
    include: { vehiculo: true, cliente: true, entregas: true },
    orderBy: { fechaVenta: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Financiación de Títulos</h1>
          <p className="text-sm text-muted-foreground">{financiaciones.length} planes registrados</p>
        </div>
        <Can permission="titulos.edit">
          <Button asChild>
            <Link href="/titulos/nuevo">
              <Plus className="h-4 w-4" />
              Nueva financiación
            </Link>
          </Button>
        </Can>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha de venta</TableHead>
            <TableHead>Costo de títulos</TableHead>
            <TableHead>Pagado</TableHead>
            <TableHead>Saldo pendiente</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {financiaciones.map((f) => {
            const pagadoCents = f.entregas.reduce((sum, e) => sum + e.montoCents, 0);
            const saldo = f.costoEscribaniaCents - pagadoCents;
            const clienteNombre = f.cliente ? `${f.cliente.nombre} ${f.cliente.apellido ?? ""}`.trim() : "";
            const mensaje = `Hola ${clienteNombre}, te escribimos de Quiroga Automóviles por el trámite de títulos de tu ${f.vehiculo.marca} ${f.vehiculo.modelo} (${f.vehiculo.matricula ?? "s/matrícula"}). Tenés un saldo pendiente de ${formatCents(saldo, f.costoMoneda)}. ¿Podemos coordinar el pago?`;
            return (
              <TableRow key={f.id}>
                <TableCell>
                  <Link href={`/titulos/${f.id}`} className="font-medium text-foreground hover:text-brand">
                    {f.vehiculo.marca} {f.vehiculo.modelo}
                  </Link>
                </TableCell>
                <TableCell>{f.vehiculo.matricula ?? "—"}</TableCell>
                <TableCell>{f.cliente ? `${f.cliente.nombre} ${f.cliente.apellido ?? ""}` : "—"}</TableCell>
                <TableCell>{f.fechaVenta ? new Date(f.fechaVenta).toLocaleDateString("es-UY") : "—"}</TableCell>
                <TableCell>{formatCents(f.costoEscribaniaCents, f.costoMoneda)}</TableCell>
                <TableCell>{formatCents(pagadoCents, f.costoMoneda)}</TableCell>
                <TableCell className={saldo > 0 ? "text-danger" : "text-success"}>
                  {formatCents(saldo, f.costoMoneda)}
                </TableCell>
                <TableCell>
                  {saldo > 0 && <WhatsAppButton phone={f.cliente?.contacto} message={mensaje} label="Avisar" />}
                </TableCell>
              </TableRow>
            );
          })}
          {financiaciones.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                No hay financiaciones de títulos registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
