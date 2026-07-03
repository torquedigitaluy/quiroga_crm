import { assertCan } from "@/lib/permissions/engine";
import { VehiculoForm } from "@/components/stock/VehiculoForm";
import { createVehiculo } from "../actions";

export default async function NuevoVehiculoPage() {
  await assertCan("stock.create");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo vehículo</h1>
        <p className="text-sm text-muted-foreground">Cargá los datos del vehículo para agregarlo al stock.</p>
      </div>
      <VehiculoForm action={createVehiculo} submitLabel="Crear vehículo" />
    </div>
  );
}
