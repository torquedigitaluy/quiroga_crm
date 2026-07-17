import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { numeroALetras } from "@/lib/numeroALetras";
import { ConformeForm } from "@/components/propia/ConformeForm";
import { generateConforme } from "@/app/(app)/propia/actions";

function toDateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default async function GenerarConformePage({
  params,
}: {
  params: Promise<{ id: string; cuotaId: string }>;
}) {
  await assertCan("conforme.generate");
  const { id, cuotaId } = await params;

  const [financiacion, cuota] = await Promise.all([
    db.financiacionPropia.findUnique({ where: { id }, include: { cliente: true, vehiculo: true } }),
    db.cuotaPropia.findUnique({ where: { id: cuotaId } }),
  ]);
  if (!financiacion || !cuota) notFound();

  // El conforme se completa solo con los datos de la cuota y del cliente.
  const montoUnits = Math.round(cuota.montoCents / 100);
  const cliente = financiacion.cliente;
  const deudorNombre = cliente
    ? `${cliente.nombre} ${cliente.apellido ?? ""}`.trim().toUpperCase()
    : financiacion.nombre.toUpperCase();

  const boundAction = generateConforme.bind(null, id, cuotaId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Generar recibo de pago</h1>
        <p className="text-sm text-muted-foreground">
          Cuota N° {cuota.numero} de {financiacion.cantidadCuotas} — plan de {financiacion.nombre}
          {financiacion.vehiculo ? ` · ${financiacion.vehiculo.marca} ${financiacion.vehiculo.modelo}` : ""}. Los datos
          se completan automáticamente; podés ajustarlos antes de generar el PDF.
        </p>
      </div>
      <ConformeForm
        action={boundAction}
        submitLabel="Generar recibo"
        initial={{
          montoUnits: String(montoUnits),
          montoEnLetras: numeroALetras(montoUnits),
          fechaVencimiento: toDateInput(cuota.fechaVencimiento),
          fechaPago: toDateInput(new Date()),
          deudorNombre,
          estado: "PAGADO",
        }}
      />
    </div>
  );
}
