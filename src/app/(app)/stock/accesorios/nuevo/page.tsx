import { assertCan } from "@/lib/permissions/engine";
import { AccesorioForm } from "@/components/stock/AccesorioForm";
import { createVehiculo } from "../../actions";

export default async function NuevoAccesorioPage() {
  await assertCan("stock.create");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo accesorio</h1>
        <p className="text-sm text-muted-foreground">Ej: GPS de rastreo, cargadores, etc.</p>
      </div>
      <AccesorioForm action={createVehiculo} />
    </div>
  );
}
