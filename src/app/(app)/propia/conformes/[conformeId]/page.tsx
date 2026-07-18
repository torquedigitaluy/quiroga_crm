import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConformeForm, type VehiculoStockOption } from "@/components/propia/ConformeForm";
import { updateConforme } from "@/app/(app)/propia/actions";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  VENCIDO: "Vencido",
};

function toDateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default async function ConformeViewPage({ params }: { params: Promise<{ conformeId: string }> }) {
  await assertCan("conforme.generate");
  const { conformeId } = await params;

  const [conforme, vehiculos] = await Promise.all([
    db.conforme.findUnique({
      where: { id: conformeId },
      include: { cuota: true, financiacionPropia: { include: { cliente: true, vehiculo: true } } },
    }),
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      orderBy: { marca: "asc" },
      select: { id: true, marca: true, modelo: true, matricula: true },
    }),
  ]);
  if (!conforme) notFound();

  const fin = conforme.financiacionPropia;
  const vehiculoOptions: VehiculoStockOption[] = vehiculos.map((v) => ({
    id: v.id,
    label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
    marca: v.marca,
    modelo: v.modelo,
    matricula: v.matricula,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/propia/${fin.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al plan
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Recibo de pago {conforme.cuota ? `— cuota N° ${conforme.cuota.numero} de ${conforme.cantidadCuotas}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {fin.nombre}
            {fin.vehiculo ? ` · ${fin.vehiculo.marca} ${fin.vehiculo.modelo}` : ""}
            {" · "}
            <Badge variant="outline">{ESTADO_LABELS[conforme.estado] ?? conforme.estado}</Badge>
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/api/documentos/conforme/${conforme.id}`} target="_blank" rel="noopener noreferrer">
            <FileDown className="h-4 w-4" />
            Ver / imprimir PDF
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Podés editar los datos y volver a generar el PDF cuantas veces necesites, para enviárselo al cliente.
      </p>

      <ConformeForm
        action={updateConforme.bind(null, conforme.id)}
        submitLabel="Guardar cambios"
        vehiculos={vehiculoOptions}
        initial={{
          montoUnits: String(Math.round(conforme.montoCuotaCents / 100)),
          montoEnLetras: conforme.montoEnLetras ?? "",
          fechaVencimiento: toDateInput(conforme.fechaVencimiento),
          fechaPago: toDateInput(conforme.fechaPago),
          deudorNombre: conforme.deudorNombre ?? "",
          estado: conforme.estado,
          vehiculoId: conforme.vehiculoId ?? "",
        }}
      />
    </div>
  );
}
