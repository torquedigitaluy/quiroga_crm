import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { VentaForm } from "@/components/ventas/VentaForm";
import { createVenta } from "../actions";

export default async function NuevaVentaPage() {
  await assertCan("ventas.create");

  const [vehiculos, usuarios] = await Promise.all([
    db.vehiculo.findMany({
      where: { esVehiculo: true, estado: { not: "SENADO" } },
      orderBy: { marca: "asc" },
    }),
    db.user.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrar venta</h1>
        <p className="text-sm text-muted-foreground">
          Al registrar la venta, el vehículo pasa a estado &quot;Señado&quot; en el stock.
        </p>
      </div>
      <VentaForm
        vehiculos={vehiculos.map((v) => ({
          id: v.id,
          label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
        }))}
        vendedores={usuarios.map((u) => ({ id: u.id, label: u.nombre }))}
        action={createVenta}
      />
    </div>
  );
}
