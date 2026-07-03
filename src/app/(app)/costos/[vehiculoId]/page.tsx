import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { CosteoForm } from "@/components/costos/CosteoForm";
import { CosteoSummary } from "@/components/costos/CosteoSummary";
import { GastoLineTable } from "@/components/costos/GastoLineTable";
import { computeCosteo } from "@/lib/costeo";
import { upsertCosteo, addGasto, deleteGasto } from "./actions";

export default async function CosteoVehiculoPage({ params }: { params: Promise<{ vehiculoId: string }> }) {
  await assertCan("costos.view");
  const { vehiculoId } = await params;

  const vehiculo = await db.vehiculo.findUnique({ where: { id: vehiculoId } });
  if (!vehiculo) notFound();

  let costeo = await db.vehiculoCosteo.findUnique({
    where: { vehiculoId },
    include: { gastos: { orderBy: { orden: "asc" } } },
  });
  if (!costeo) {
    costeo = await db.vehiculoCosteo.create({
      data: { vehiculoId },
      include: { gastos: true },
    });
  }

  const config = await db.configuracion.findUnique({ where: { id: 1 } });
  const configRateMicros = config?.tipoCambioGlobalMicros ?? 400000;

  const computed = computeCosteo(costeo, costeo.gastos, configRateMicros);

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("costos.edit");

  const boundUpsert = upsertCosteo.bind(null, vehiculoId);
  const boundAdd = addGasto.bind(null, vehiculoId);
  const boundDelete = deleteGasto.bind(null, vehiculoId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/stock/${vehiculoId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver al vehículo
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Costos — {vehiculo.marca} {vehiculo.modelo} {vehiculo.matricula ? `(${vehiculo.matricula})` : ""}
        </h1>
      </div>

      <CosteoSummary
        rateMicros={computed.rateMicros}
        precioCompraUsdCents={costeo.precioCompraUsdCents}
        totalGastosUsdCents={computed.totalGastosUsdCents}
        costoTotalUsdCents={computed.costoTotalUsdCents}
        gananciaIdealUsdCents={computed.gananciaIdealUsdCents}
        precioVentaIdealUsdCents={computed.precioVentaIdealUsdCents}
        precioVentaRealUsdCents={costeo.precioVentaRealUsdCents}
        gananciaFinalUsdCents={computed.gananciaFinalUsdCents}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Datos del costeo</h2>
        <CosteoForm initial={costeo} configRate={configRateMicros / 10000} editable={editable} action={boundUpsert} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Detalle de gastos</h2>
        <GastoLineTable
          gastos={costeo.gastos}
          rateMicros={computed.rateMicros}
          editable={editable}
          onAdd={boundAdd}
          onDelete={boundDelete}
        />
      </div>

      {!editable && (
        <Button variant="outline" disabled>
          Solo lectura — no tenés permiso para editar costos
        </Button>
      )}
    </div>
  );
}
