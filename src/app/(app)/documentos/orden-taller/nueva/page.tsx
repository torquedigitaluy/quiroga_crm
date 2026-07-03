import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { OrdenTallerForm } from "@/components/documentos/OrdenTallerForm";
import { createOrdenTaller } from "../../actions";

export default async function NuevaOrdenTallerPage() {
  await assertCan("docs.generate");

  const vehiculos = await db.vehiculo.findMany({ where: { esVehiculo: true }, orderBy: { marca: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nueva orden de trabajo — Taller</h1>
      </div>
      <OrdenTallerForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        action={createOrdenTaller}
      />
    </div>
  );
}
