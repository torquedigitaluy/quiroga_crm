import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getEffectivePermissions } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { OrdenEstadoBadge } from "@/components/taller/OrdenEstadoBadge";
import { OrdenDetalleForm } from "@/components/taller/OrdenDetalleForm";
import { ChecklistEditor } from "@/components/taller/ChecklistEditor";
import { RepuestosTable } from "@/components/taller/RepuestosTable";
import { GastosOrdenTable } from "@/components/taller/GastosOrdenTable";
import { ImagenesGallery } from "@/components/taller/ImagenesGallery";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import {
  updateOrdenTaller,
  addRepuesto,
  deleteRepuesto,
  addGastoOrden,
  deleteGastoOrden,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  addImagenes,
  deleteImagen,
  archiveOrdenTaller,
} from "../../actions";

export default async function OrdenTallerDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await assertCan("taller.view");
  const { id } = await params;
  const perms = await getEffectivePermissions(user.id);
  const editable = perms.has("taller.edit");

  const orden = await db.ordenTaller.findUnique({
    where: { id },
    include: {
      vehiculo: true,
      repuestos: { orderBy: { createdAt: "asc" } },
      gastos: { orderBy: { createdAt: "asc" } },
      checklist: { orderBy: { orden: "asc" } },
      imagenes: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!orden) notFound();

  const vehiculoLabel = orden.vehiculo
    ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo}${orden.vehiculo.matricula ? ` (${orden.vehiculo.matricula})` : ""}`
    : (orden.vehiculoExterno ?? "Vehículo externo");

  const boundUpdate = updateOrdenTaller.bind(null, id);
  const boundAddRepuesto = addRepuesto.bind(null, id);
  const boundDeleteRepuesto = deleteRepuesto.bind(null, id);
  const boundAddGasto = addGastoOrden.bind(null, id);
  const boundDeleteGasto = deleteGastoOrden.bind(null, id);
  const boundToggleChecklist = toggleChecklistItem.bind(null, id);
  const boundAddChecklist = addChecklistItem.bind(null, id);
  const boundDeleteChecklist = deleteChecklistItem.bind(null, id);
  const boundAddImagenes = addImagenes.bind(null, id);
  const boundDeleteImagen = deleteImagen.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/taller" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a Taller
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{vehiculoLabel}</h1>
            <p className="text-sm text-muted-foreground">
              Ingresó el {new Date(orden.fechaIngreso).toLocaleDateString("es-UY")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrdenEstadoBadge estado={orden.estado} />
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/documentos/orden-taller/${orden.id}`} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </a>
            </Button>
            {editable && (
              <ConfirmArchiveButton
                onConfirm={archiveOrdenTaller.bind(null, orden.id)}
                title="¿Eliminar esta orden de trabajo?"
                description="Va a dejar de aparecer en Taller, pero queda guardada en el histórico y se puede restaurar en cualquier momento."
              />
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Datos de la orden</h2>
        <OrdenDetalleForm
          initial={{
            tipoServicio: orden.tipoServicio,
            estado: orden.estado,
            fechaIngreso: orden.fechaIngreso,
            fechaFinalizacion: orden.fechaFinalizacion,
            responsable: orden.responsable,
            problema: orden.problema,
            trabajosRealizados: orden.trabajosRealizados,
            observaciones: orden.observaciones,
            manoDeObraCents: orden.manoDeObraCents,
          }}
          editable={editable}
          action={boundUpdate}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Checklist</h2>
        <ChecklistEditor
          items={orden.checklist}
          editable={editable}
          onToggle={boundToggleChecklist}
          onAdd={boundAddChecklist}
          onDelete={boundDeleteChecklist}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Repuestos</h2>
        <RepuestosTable repuestos={orden.repuestos} editable={editable} onAdd={boundAddRepuesto} onDelete={boundDeleteRepuesto} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Gastos extra</h2>
        <GastosOrdenTable gastos={orden.gastos} editable={editable} onAdd={boundAddGasto} onDelete={boundDeleteGasto} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Fotos</h2>
        <ImagenesGallery imagenes={orden.imagenes} editable={editable} onUpload={boundAddImagenes} onDelete={boundDeleteImagen} />
      </section>
    </div>
  );
}
