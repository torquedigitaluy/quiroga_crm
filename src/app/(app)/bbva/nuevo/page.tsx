import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { CreditoBBVAForm } from "@/components/bbva/CreditoBBVAForm";
import { createCreditoBBVA } from "../actions";

export default async function NuevoCreditoBBVAPage() {
  await assertCan("bbva.edit");

  const vehiculos = await db.vehiculo.findMany({
    where: { esVehiculo: true, archivedAt: null },
    orderBy: { marca: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo crédito BBVA</h1>
      </div>
      <CreditoBBVAForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        action={createCreditoBBVA}
      />
    </div>
  );
}
