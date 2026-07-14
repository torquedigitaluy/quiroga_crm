import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { StatusBadge, UbicacionBadge } from "@/components/stock/StatusBadge";
import { VehiculoForm, type VehiculoFormPermissions } from "@/components/stock/VehiculoForm";
import { AccesorioForm } from "@/components/stock/AccesorioForm";
import { DeleteVehiculoButton } from "@/components/stock/DeleteVehiculoButton";
import { updateVehiculo } from "../actions";

export default async function VehiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("stock.view");
  const { id } = await params;

  const [vehiculo, usuarios] = await Promise.all([
    db.vehiculo.findUnique({ where: { id } }),
    db.user.findMany({ where: { activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  if (!vehiculo) notFound();

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();

  if (!vehiculo.esVehiculo) {
    const boundUpdate = updateVehiculo.bind(null, id);
    const editable = perms.has("stock.edit_vehicle_fields") || perms.has("stock.edit_price");
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {vehiculo.marca} {vehiculo.modelo}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge estado={vehiculo.estado} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vehiculo.estado !== "VENDIDO" && (
              <Can permission="ventas.create">
                <Button variant="outline" asChild>
                  <Link href={`/ventas/accesorios/nueva?accesorioId=${vehiculo.id}`}>
                    <Tag className="h-4 w-4" />
                    Vender
                  </Link>
                </Button>
              </Can>
            )}
            <Can permission="stock.delete">
              <DeleteVehiculoButton id={vehiculo.id} />
            </Can>
          </div>
        </div>
        <AccesorioForm
          initial={{
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            precioVentaUsdCents: vehiculo.precioVentaUsdCents,
            comentarios: vehiculo.comentarios,
          }}
          editable={editable}
          action={boundUpdate}
        />
      </div>
    );
  }

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
          {(perms.has("costos.view") || vehiculo.responsableId === user?.id) && (
            <Button variant="outline" asChild>
              <Link href={`/costos/${vehiculo.id}`}>
                <Calculator className="h-4 w-4" />
                Ver costos
              </Link>
            </Button>
          )}
          <Can permission="stock.delete">
            <DeleteVehiculoButton id={vehiculo.id} />
          </Can>
        </div>
      </div>

      <VehiculoForm
        initial={vehiculo}
        permissions={formPermissions}
        action={boundUpdate}
        usuarios={usuarios}
      />
    </div>
  );
}
