import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { centsToUnits } from "@/lib/money";
import { TramiteForm } from "@/components/escribania/TramiteForm";
import { updateTramite } from "../actions";

function toDateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default async function EditarTramitePage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("escribania.edit");
  const { id } = await params;

  const tramite = await db.escribaniaTramite.findUnique({
    where: { id },
    include: { vehiculo: true, cliente: true },
  });
  if (!tramite) notFound();

  const boundUpdate = updateTramite.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/escribania" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a escribanía
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Editar trámite de escribanía</h1>
      </div>

      <TramiteForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        vehiculos={[
          {
            id: tramite.vehiculo.id,
            label: `${tramite.vehiculo.marca} ${tramite.vehiculo.modelo}${tramite.vehiculo.matricula ? ` — ${tramite.vehiculo.matricula}` : ""}`,
          },
        ]}
        initial={{
          id: tramite.id,
          vehiculoId: tramite.vehiculoId,
          clienteNombre: tramite.cliente?.nombre ?? "",
          clienteApellido: tramite.cliente?.apellido ?? "",
          clienteCi: tramite.cliente?.ci ?? "",
          clienteContacto: tramite.cliente?.contacto ?? "",
          fecha: toDateInput(tramite.fecha),
          fechaFirma: toDateInput(tramite.fechaFirma),
          tipoDoc: tramite.tipoDoc,
          titulosCon: tramite.titulosCon,
          pagoEscribaniaUnits: centsToUnits(tramite.pagoEscribaniaCents),
          pagoMoneda: tramite.pagoMoneda,
          fechaPago: toDateInput(tramite.fechaPago),
          cobroAlCliente: tramite.cobroAlCliente,
          cobroMontoUnits: centsToUnits(tramite.cobroMontoCents),
          fechaCobro: toDateInput(tramite.fechaCobro),
          fechaEntregaTitulos: toDateInput(tramite.fechaEntregaTitulos),
          ubicacionTitulos: tramite.ubicacionTitulos,
          comentarios: tramite.comentarios,
        }}
      />
    </div>
  );
}
