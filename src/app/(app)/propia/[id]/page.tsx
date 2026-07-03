import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CuotasGrid } from "@/components/propia/CuotasGrid";

export default async function FinanciacionPropiaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("propia.view");
  const { id } = await params;

  const financiacion = await db.financiacionPropia.findUnique({
    where: { id },
    include: { cliente: true, vehiculo: true, cuotas: { orderBy: { numero: "asc" } } },
  });
  if (!financiacion) notFound();

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("propia.edit");
  const canGenerateConforme = perms.has("conforme.generate");

  const pagadoCents = financiacion.cuotas.filter((c) => c.pagada).reduce((sum, c) => sum + c.montoCents, 0);
  const saldoCents = financiacion.montoFinanciadoUsdCents - pagadoCents;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/propia" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{financiacion.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          {financiacion.vehiculo ? `${financiacion.vehiculo.marca} ${financiacion.vehiculo.modelo}` : "Sin vehículo asociado"}
          {financiacion.contacto ? ` · ${financiacion.contacto}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Monto financiado" value={formatCents(financiacion.montoFinanciadoUsdCents, "USD")} />
          <Stat label="Cuota mensual" value={formatCents(financiacion.montoCuotaUsdCents, "USD")} />
          <Stat label="Pagado" value={formatCents(pagadoCents, "USD")} />
          <Stat label="Saldo pendiente" value={formatCents(saldoCents, "USD")} danger={saldoCents > 0} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Cuotas</h2>
        <CuotasGrid
          financiacionId={financiacion.id}
          cuotas={financiacion.cuotas}
          editable={editable}
          canGenerateConforme={canGenerateConforme}
        />
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
