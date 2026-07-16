import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { PromesaForm, type VentaOption } from "@/components/documentos/PromesaForm";
import { createPromesa } from "../actions";

export default async function NuevaPromesaPage() {
  await assertCan("docs.generate");

  const ventas = await db.venta.findMany({
    where: { archivedAt: null },
    include: { vehiculo: true, cliente: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const ventaOptions: VentaOption[] = ventas.map((v) => ({
    id: v.id,
    label: `${v.vehiculo.marca} ${v.vehiculo.modelo} — ${v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido ?? ""}` : "sin cliente"}`,
    vehMarca: v.vehiculo.marca,
    vehModelo: v.vehiculo.modelo,
    vehAnio: v.vehiculo.anio,
    vehColor: v.vehiculo.color,
    vehMatricula: v.vehiculo.matricula,
    vehMotor: v.vehiculo.motor,
    vehChasis: v.vehiculo.chasis,
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
      <PromesaForm ventas={ventaOptions} action={createPromesa} submitLabel="Crear promesa" />
    </div>
  );
}
