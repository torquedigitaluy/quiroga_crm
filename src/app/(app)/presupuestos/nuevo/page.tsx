import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { PresupuestoForm } from "@/components/presupuestos/PresupuestoForm";
import { createPresupuesto } from "../actions";

export default async function NuevoPresupuestoPage() {
  await assertCan("presupuestos.edit");

  const vehiculos = await db.vehiculo.findMany({
    where: { esVehiculo: true, archivedAt: null },
    orderBy: { marca: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo presupuesto</h1>
      </div>
      <PresupuestoForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
          marca: v.marca,
          modelo: v.modelo,
          matricula: v.matricula,
        }))}
        action={createPresupuesto}
      />
    </div>
  );
}
