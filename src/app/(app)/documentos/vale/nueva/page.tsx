import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ValeForm, type FinanciacionPropiaOption } from "@/components/documentos/ValeForm";
import { createVale } from "../actions";

export default async function NuevoValePage() {
  await assertCan("docs.generate_vale");

  const planes = await db.financiacionPropia.findMany({
    where: { archivedAt: null },
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const planOptions: FinanciacionPropiaOption[] = planes.map((p) => ({
    id: p.id,
    label: p.nombre,
    clienteNombre: p.nombre,
    clienteContacto: p.contacto ?? p.cliente?.contacto ?? "",
    cantidadCuotas: p.cantidadCuotas,
    diaVencimientoMensual: p.diaVencimientoMensual,
    fechaPrimeraCuota: p.fechaPrimeraCuota ? p.fechaPrimeraCuota.toISOString().slice(0, 10) : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo Vale</h1>
        <p className="text-sm text-muted-foreground">
          Documento único con las condiciones del plan y los responsables del pago, para imprimir y firmar en papel.
        </p>
      </div>
      <ValeForm planes={planOptions} action={createVale} submitLabel="Crear vale" />
    </div>
  );
}
