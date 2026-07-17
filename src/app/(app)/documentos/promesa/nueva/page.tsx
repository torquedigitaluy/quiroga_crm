import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { PromesaForm, type VentaOption, type VehiculoStockOption } from "@/components/documentos/PromesaForm";
import { createPromesa } from "../actions";

export default async function NuevaPromesaPage() {
  await assertCan("docs.generate");

  const [ventas, vehiculos] = await Promise.all([
    db.venta.findMany({
      where: { archivedAt: null },
      include: { vehiculo: true, cliente: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      orderBy: { marca: "asc" },
    }),
  ]);

  const vehiculoOptions: VehiculoStockOption[] = vehiculos.map((v) => ({
    id: v.id,
    label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
    vehMarca: v.marca,
    vehModelo: v.modelo,
    vehTipo: null,
    vehColor: v.color,
    vehAnio: v.anio,
    vehMatricula: v.matricula,
    vehMotor: v.motor,
    vehChasis: v.chasis,
  }));

  const ventaOptions: VentaOption[] = ventas.map((v) => ({
    id: v.id,
    label: `${vehiculoLabel(v.vehiculo, v.vehiculoExterno)} — ${v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido ?? ""}` : "sin cliente"}`,
    vehMarca: v.vehiculo ? v.vehiculo.marca : v.vehiculoExterno ?? "",
    vehModelo: v.vehiculo ? v.vehiculo.modelo : "",
    vehAnio: v.vehiculo?.anio ?? null,
    vehColor: v.vehiculo?.color ?? null,
    vehMatricula: v.vehiculo?.matricula ?? null,
    vehMotor: v.vehiculo?.motor ?? null,
    vehChasis: v.vehiculo?.chasis ?? null,
    clienteId: v.clienteId,
    clienteNombre: v.cliente?.nombre ?? "",
    clienteApellido: v.cliente?.apellido ?? "",
    clienteCi: v.cliente?.ci ?? "",
    clienteContacto: v.cliente?.contacto ?? "",
    clienteDomicilio: v.cliente?.direccion ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nueva Promesa de Compra-Venta</h1>
        <p className="text-sm text-muted-foreground">Completá los datos y generá el PDF para imprimir y firmar en papel.</p>
      </div>
      <PromesaForm ventas={ventaOptions} vehiculosStock={vehiculoOptions} action={createPromesa} submitLabel="Crear promesa" />
    </div>
  );
}
