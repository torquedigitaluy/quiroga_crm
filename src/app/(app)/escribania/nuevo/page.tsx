import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { TramiteForm } from "@/components/escribania/TramiteForm";
import { createTramite } from "../actions";

export default async function NuevoTramitePage() {
  await assertCan("escribania.edit");

  const vehiculos = await db.vehiculo.findMany({ where: { esVehiculo: true }, orderBy: { marca: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo trámite de escribanía</h1>
      </div>
      <TramiteForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        action={createTramite}
      />
    </div>
  );
}
