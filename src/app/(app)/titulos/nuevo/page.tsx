import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { FinanciacionTituloForm } from "@/components/titulos/FinanciacionTituloForm";
import { createFinanciacionTitulo } from "../actions";

export default async function NuevaFinanciacionTituloPage() {
  await assertCan("titulos.edit");

  const vehiculos = await db.vehiculo.findMany({ where: { esVehiculo: true }, orderBy: { marca: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nueva financiación de títulos</h1>
      </div>
      <FinanciacionTituloForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        action={createFinanciacionTitulo}
      />
    </div>
  );
}
