import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { VentaForm } from "@/components/ventas/VentaForm";
import { createVenta } from "../actions";

export default async function NuevaVentaPage() {
  const user = await assertCan("ventas.create");
  // Quien no tiene acceso al listado completo de ventas es un vendedor
  // registrando su propia venta: el campo "vendedor" queda fijo en sí mismo,
  // no puede asignarla a otro vendedor.
  const esAdmin = await can("ventas.view_full");

  const [vehiculos, usuarios] = await Promise.all([
    // El estado del vehículo en Stock (incl. "Señado") no debe impedir crear
    // la venta — solo se excluyen los ya entregados/vendidos.
    db.vehiculo.findMany({
      where: { esVehiculo: true, estado: { not: "VENDIDO" }, archivedAt: null },
      orderBy: { marca: "asc" },
    }),
    esAdmin
      ? db.user.findMany({ where: { activo: true, esVendedor: true }, orderBy: { nombre: "asc" } })
      : Promise.resolve([]),
  ]);

  const vendedorFijo = esAdmin ? undefined : { id: user.id, label: user.name ?? user.email ?? "Yo" };

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
          propietario: v.propietario,
        }))}
        vendedores={usuarios.map((u) => ({ id: u.id, label: u.nombre }))}
        vendedorFijo={vendedorFijo}
        action={createVenta}
      />
    </div>
  );
}
