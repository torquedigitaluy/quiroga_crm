import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("clientes.view");
  const { id } = await params;

  const cliente = await db.cliente.findUnique({
    where: { id },
    include: {
      ventas: { include: { vehiculo: true } },
      creditosBBVA: true,
      tramitesEscribania: { include: { vehiculo: true } },
      financiacionesTitulo: { include: { vehiculo: true, entregas: true } },
      financiacionesPropia: { include: { vehiculo: true, cuotas: true } },
      deudas: true,
    },
  });
  if (!cliente) notFound();

  const cuotasAtrasadas = cliente.financiacionesPropia.flatMap((f) =>
    f.cuotas.filter((c) => !c.pagada && new Date(c.fechaVencimiento) < new Date()),
  );
  const deudasPendientes = cliente.deudas.filter((d) => !d.saldado);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver al buscador
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {cliente.nombre} {cliente.apellido ?? ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {cliente.ci ? `CI: ${cliente.ci}` : ""} {cliente.contacto ? `· ${cliente.contacto}` : ""}
        </p>
        {(cuotasAtrasadas.length > 0 || deudasPendientes.length > 0) && (
          <div className="mt-2 flex gap-2">
            {cuotasAtrasadas.length > 0 && <Badge variant="danger">{cuotasAtrasadas.length} cuota(s) atrasada(s)</Badge>}
            {deudasPendientes.length > 0 && <Badge variant="warning">{deudasPendientes.length} deuda(s) pendiente(s)</Badge>}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ventas ({cliente.ventas.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {cliente.ventas.map((v) => (
            <div key={v.id} className="flex justify-between text-sm">
              <span>
                {v.vehiculo.marca} {v.vehiculo.modelo} ({v.vehiculo.matricula ?? "—"})
              </span>
              <span className="font-medium">{formatCents(v.precioVentaUsdCents, "USD")}</span>
            </div>
          ))}
          {cliente.ventas.length === 0 && <p className="text-sm text-muted-foreground">Sin ventas registradas.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Créditos BBVA ({cliente.creditosBBVA.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {cliente.creditosBBVA.map((c) => (
            <div key={c.id} className="flex justify-between text-sm">
              <span>Solicitado {formatCents(c.montoSolicitadoUsdCents, "USD")}</span>
              <Badge variant={c.estado === "APROBADO" ? "success" : c.estado === "RECHAZADO" ? "danger" : "neutral"}>
                {c.estado}
              </Badge>
            </div>
          ))}
          {cliente.creditosBBVA.length === 0 && <p className="text-sm text-muted-foreground">Sin créditos BBVA.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financiación de Títulos ({cliente.financiacionesTitulo.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {cliente.financiacionesTitulo.map((f) => {
            const pagado = f.entregas.reduce((sum, e) => sum + e.montoCents, 0);
            const saldo = f.costoEscribaniaCents - pagado;
            return (
              <div key={f.id} className="flex justify-between text-sm">
                <span>
                  {f.vehiculo.marca} {f.vehiculo.modelo}
                </span>
                <span className={saldo > 0 ? "text-danger" : "text-success"}>
                  Saldo: {formatCents(saldo, f.costoMoneda)}
                </span>
              </div>
            );
          })}
          {cliente.financiacionesTitulo.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin financiación de títulos.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financiación Propia ({cliente.financiacionesPropia.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {cliente.financiacionesPropia.map((f) => {
            const pagadas = f.cuotas.filter((c) => c.pagada).length;
            const atrasadas = f.cuotas.filter((c) => !c.pagada && new Date(c.fechaVencimiento) < new Date()).length;
            return (
              <div key={f.id} className="flex justify-between text-sm">
                <Link href={`/propia/${f.id}`} className="hover:text-brand">
                  {formatCents(f.montoFinanciadoUsdCents, "USD")} — {pagadas}/{f.cantidadCuotas} cuotas
                </Link>
                {atrasadas > 0 && <Badge variant="danger">{atrasadas} atrasadas</Badge>}
              </div>
            );
          })}
          {cliente.financiacionesPropia.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin financiación propia.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deudas ({cliente.deudas.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {cliente.deudas.map((d) => (
            <div key={d.id} className="flex justify-between text-sm">
              <span>{d.concepto}</span>
              <span className={d.saldado ? "text-muted-foreground" : "text-danger"}>
                {formatCents(d.montoCents, d.moneda)} {d.saldado ? "(saldado)" : ""}
              </span>
            </div>
          ))}
          {cliente.deudas.length === 0 && <p className="text-sm text-muted-foreground">Sin deudas registradas.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
