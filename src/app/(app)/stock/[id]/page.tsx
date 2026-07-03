import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { StatusBadge, UbicacionBadge } from "@/components/stock/StatusBadge";
import { VehiculoForm, type VehiculoFormPermissions } from "@/components/stock/VehiculoForm";
import { DeleteVehiculoButton } from "@/components/stock/DeleteVehiculoButton";
import { updateVehiculo } from "../actions";

export default async function VehiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("stock.view");
  const { id } = await params;

  const vehiculo = await db.vehiculo.findUnique({ where: { id } });
  if (!vehiculo) notFound();

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();

  const formPermissions: VehiculoFormPermissions = {
    editVehicleFields: perms.has("stock.edit_vehicle_fields"),
    editPrice: perms.has("stock.edit_price"),
    editPatente: perms.has("stock.edit_patente"),
    moveLocation: perms.has("stock.move_location"),
    editStatus: perms.has("stock.edit_status"),
    editOwner: perms.has("stock.edit_owner"),
  };

  const boundUpdate = updateVehiculo.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.version}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge estado={vehiculo.estado} />
            <UbicacionBadge ubicacion={vehiculo.ubicacion} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission="costos.view">
            <Button variant="outline" asChild>
              <Link href={`/costos/${vehiculo.id}`}>
                <Calculator className="h-4 w-4" />
                Ver costos
              </Link>
            </Button>
          </Can>
          <Can permission="stock.delete">
            <DeleteVehiculoButton id={vehiculo.id} />
          </Can>
        </div>
      </div>

      <VehiculoForm
        initial={vehiculo}
        permissions={formPermissions}
        action={boundUpdate}
      />
    </div>
  );
}
