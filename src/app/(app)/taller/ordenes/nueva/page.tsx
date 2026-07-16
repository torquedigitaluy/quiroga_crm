import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { OrdenTallerForm } from "@/components/taller/OrdenTallerForm";
import { createOrdenTaller } from "../../actions";

export default async function NuevaOrdenTallerPage() {
  await assertCan("taller.edit");

  const [vehiculos, tecnicos] = await Promise.all([
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      orderBy: { marca: "asc" },
    }),
    db.user.findMany({
      where: { activo: true, roles: { some: { role: { key: "TALLER" } } } },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nueva orden de trabajo</h1>
      </div>
      <OrdenTallerForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
          marca: v.marca,
          modelo: v.modelo,
          version: v.version,
          anio: v.anio,
          color: v.color,
          matricula: v.matricula,
          km: v.km,
        }))}
        tecnicos={tecnicos.map((t) => ({ id: t.id, label: t.nombre }))}
        action={createOrdenTaller}
      />
    </div>
  );
}
