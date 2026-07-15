import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { FinanciacionPropiaForm } from "@/components/propia/FinanciacionPropiaForm";
import { createFinanciacionPropia } from "../actions";

export default async function NuevaFinanciacionPropiaPage() {
  await assertCan("propia.edit");

  const vehiculos = await db.vehiculo.findMany({
    where: { esVehiculo: true, archivedAt: null },
    orderBy: { marca: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nueva financiación propia</h1>
        <p className="text-sm text-muted-foreground">
          Se generan automáticamente las cuotas mensuales según la cantidad indicada.
        </p>
      </div>
      <FinanciacionPropiaForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        action={createFinanciacionPropia}
      />
    </div>
  );
}
