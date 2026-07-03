import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntregasEditor } from "@/components/titulos/EntregasEditor";
import { addEntrega, deleteEntrega } from "../actions";

export default async function FinanciacionTituloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("titulos.view");
  const { id } = await params;

  const financiacion = await db.financiacionTitulo.findUnique({
    where: { id },
    include: { vehiculo: true, cliente: true, entregas: { orderBy: { numero: "asc" } } },
  });
  if (!financiacion) notFound();

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("titulos.edit");

  const pagadoCents = financiacion.entregas.reduce((sum, e) => sum + e.montoCents, 0);
  const saldo = financiacion.costoEscribaniaCents - pagadoCents;

  const boundAdd = addEntrega.bind(null, id);
  const boundDelete = deleteEntrega.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/titulos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {financiacion.vehiculo.marca} {financiacion.vehiculo.modelo}{" "}
          {financiacion.vehiculo.matricula ? `(${financiacion.vehiculo.matricula})` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Cliente: {financiacion.cliente ? `${financiacion.cliente.nombre} ${financiacion.cliente.apellido ?? ""}` : "—"}
          {financiacion.contacto ? ` · ${financiacion.contacto}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Costo de títulos" value={formatCents(financiacion.costoEscribaniaCents, financiacion.costoMoneda)} />
          <Stat label="Pagado" value={formatCents(pagadoCents, financiacion.costoMoneda)} />
          <Stat
            label="Saldo pendiente"
            value={formatCents(saldo, financiacion.costoMoneda)}
            danger={saldo > 0}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Entregas</h2>
        {editable ? (
          <EntregasEditor entregas={financiacion.entregas} moneda={financiacion.costoMoneda} onAdd={boundAdd} onDelete={boundDelete} />
        ) : (
          <p className="text-sm text-muted-foreground">No tenés permiso para editar las entregas.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${danger ? "text-danger" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
