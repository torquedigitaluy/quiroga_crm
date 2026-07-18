import { notFound } from "next/navigation";
import { FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { ValeForm, type FinanciacionPropiaOption } from "@/components/documentos/ValeForm";
import { centsToUnits } from "@/lib/money";
import { updateVale, archiveVale } from "../actions";

function pesosUnits(cents: number | null): string {
  return cents != null ? String(centsToUnits(cents)) : "";
}

function toDateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default async function EditarValePage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate_vale");
  const { id } = await params;

  const [vale, planes] = await Promise.all([
    db.vale.findUnique({ where: { id }, include: { cliente: true } }),
    db.financiacionPropia.findMany({
      where: { archivedAt: null },
      include: { cliente: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  if (!vale) notFound();

  const planOptions: FinanciacionPropiaOption[] = planes.map((p) => ({
    id: p.id,
    label: p.nombre,
    clienteNombre: p.nombre,
    clienteContacto: p.contacto ?? p.cliente?.contacto ?? "",
    cantidadCuotas: p.cantidadCuotas,
    diaVencimientoMensual: p.diaVencimientoMensual,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vale N° {vale.numero}</h1>
          <p className="text-sm text-muted-foreground">Se puede editar en cualquier momento, incluso después de generar el PDF.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/documentos/vale/${vale.id}`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4" />
              Generar PDF
            </a>
          </Button>
          <ConfirmArchiveButton onConfirm={archiveVale.bind(null, vale.id)} />
        </div>
      </div>

      <ValeForm
        planes={planOptions}
        initialFinanciacionPropiaId={vale.financiacionPropiaId}
        initial={{
          fecha: toDateInput(vale.fecha),
          clienteNombre: vale.cliente?.nombre ?? "",
          clienteContacto: vale.cliente?.contacto ?? "",
          moneda: vale.moneda ?? "UYU",
          totalPesosCents: pesosUnits(vale.totalPesosCents),
          totalEnLetras: vale.totalEnLetras ?? "",
          capitalPrestadoPesosCents: pesosUnits(vale.capitalPrestadoPesosCents),
          montoCuotaPesosCents: pesosUnits(vale.montoCuotaPesosCents),
          montoCuotaEnLetras: vale.montoCuotaEnLetras ?? "",
          acreedores: vale.acreedores ?? "",
          cantidadCuotas: vale.cantidadCuotas != null ? String(vale.cantidadCuotas) : "",
          diaVencimientoMensual: vale.diaVencimientoMensual != null ? String(vale.diaVencimientoMensual) : "",
          firmante1Nombre: vale.firmante1Nombre ?? "",
          firmante1Ci: vale.firmante1Ci ?? "",
          firmante1Domicilio: vale.firmante1Domicilio ?? "",
          firmante2Nombre: vale.firmante2Nombre ?? "",
          firmante2Ci: vale.firmante2Ci ?? "",
          firmante2Domicilio: vale.firmante2Domicilio ?? "",
          firmante3Nombre: vale.firmante3Nombre ?? "",
          firmante3Ci: vale.firmante3Ci ?? "",
          firmante3Domicilio: vale.firmante3Domicilio ?? "",
        }}
        action={updateVale.bind(null, vale.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
