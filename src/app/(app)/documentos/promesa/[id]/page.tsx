import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { PromesaForm, type VentaOption, type VehiculoStockOption } from "@/components/documentos/PromesaForm";
import { updatePromesa, archivePromesa } from "../actions";

function toDateInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function toUnits(cents: number | null): string {
  return cents != null ? (cents / 100).toFixed(2) : "";
}

export default async function EditarPromesaPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const [promesa, ventas, vehiculos, puedeArchivar] = await Promise.all([
    db.promesaCompraventa.findUnique({ where: { id } }),
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
    can("docs.generate"),
  ]);

  if (!promesa) notFound();

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Promesa de Compra-Venta N° {promesa.numero}</h1>
          <p className="text-sm text-muted-foreground">Se puede editar en cualquier momento, incluso después de generar el PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/documentos/promesa/${promesa.id}`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" />
              Generar PDF
            </a>
          </Button>
          {puedeArchivar && <ConfirmArchiveButton onConfirm={archivePromesa.bind(null, promesa.id)} />}
        </div>
      </div>

      <PromesaForm
        ventas={ventaOptions}
        vehiculosStock={vehiculoOptions}
        initialVentaId={promesa.ventaId}
        initialClienteId={promesa.clienteId}
        initialVehiculoId={promesa.vehiculoId}
        initialFinancia={promesa.financia}
        initialSeguro={promesa.seguro}
        initialCesion={promesa.cesionDerechos}
        initial={{
          vendedores: promesa.vendedores ?? "",
          fecha: toDateInput(promesa.fecha),
          vehMarca: promesa.vehMarca ?? "",
          vehModelo: promesa.vehModelo ?? "",
          vehTipo: promesa.vehTipo ?? "",
          vehColor: promesa.vehColor ?? "",
          vehAnio: promesa.vehAnio != null ? String(promesa.vehAnio) : "",
          vehMatricula: promesa.vehMatricula ?? "",
          vehMotor: promesa.vehMotor ?? "",
          vehChasis: promesa.vehChasis ?? "",
          clienteNombre: promesa.clienteNombre ?? "",
          clienteApellido: promesa.clienteApellido ?? "",
          clienteCi: promesa.clienteCi ?? "",
          clienteDomicilio: promesa.clienteDomicilio ?? "",
          clienteCiudad: promesa.clienteCiudad ?? "",
          clienteContacto: promesa.clienteContacto ?? "",
          clienteEstadoCivil: promesa.clienteEstadoCivil ?? "",
          clienteNombre2: promesa.clienteNombre2 ?? "",
          clienteMail: promesa.clienteMail ?? "",
          financiaCon: promesa.financiaCon ?? "",
          senaUsdCents: toUnits(promesa.senaUsdCents),
          pagoRetiroUnidadUsdCents: toUnits(promesa.pagoRetiroUnidadUsdCents),
          capitalFinanciadoUsdCents: toUnits(promesa.capitalFinanciadoUsdCents),
          conformesCantidadCuotas: promesa.conformesCantidadCuotas != null ? String(promesa.conformesCantidadCuotas) : "",
          conformesCuotaUsdCents: toUnits(promesa.conformesCuotaUsdCents),
          valorTomaAutoUsdCents: toUnits(promesa.valorTomaAutoUsdCents),
          totalUsdCents: toUnits(promesa.totalUsdCents),
          costoTitulosUsdCents: toUnits(promesa.costoTitulosUsdCents),
          costoTitulosMoneda: promesa.costoTitulosMoneda ?? "USD",
          cartaPagoUsdCents: toUnits(promesa.cartaPagoUsdCents),
          cartaPagoMoneda: promesa.cartaPagoMoneda ?? "USD",
          entregaCuentaTitulosUsdCents: toUnits(promesa.entregaCuentaTitulosUsdCents),
          entregaCuentaTitulosMoneda: promesa.entregaCuentaTitulosMoneda ?? "USD",
          aseguradora: promesa.aseguradora ?? "",
          cobertura: promesa.cobertura ?? "",
          cesionANombreDe: promesa.cesionANombreDe ?? "",
          observaciones: promesa.observaciones ?? "",
          permutaMarca: promesa.permutaMarca ?? "",
          permutaModelo: promesa.permutaModelo ?? "",
          permutaTipo: promesa.permutaTipo ?? "",
          permutaColor: promesa.permutaColor ?? "",
          permutaLlaves: promesa.permutaLlaves ?? "",
          permutaAnio: promesa.permutaAnio != null ? String(promesa.permutaAnio) : "",
          permutaMatricula: promesa.permutaMatricula ?? "",
          permutaMotor: promesa.permutaMotor ?? "",
          permutaChasis: promesa.permutaChasis ?? "",
        }}
        action={updatePromesa.bind(null, promesa.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
