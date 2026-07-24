import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCanAny, getEffectivePermissions } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { OrdenEstadoBadge } from "@/components/taller/OrdenEstadoBadge";
import { OrdenDetalleForm } from "@/components/taller/OrdenDetalleForm";
import { ChecklistEditor } from "@/components/taller/ChecklistEditor";
import { RepuestosTable } from "@/components/taller/RepuestosTable";
import { GastosOrdenTable } from "@/components/taller/GastosOrdenTable";
import { ImagenesGallery } from "@/components/taller/ImagenesGallery";
import { ControlCalidadCard } from "@/components/taller/ControlCalidadCard";
import { ConformidadClienteCard } from "@/components/taller/ConformidadClienteCard";
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
  setControlCalidad,
  saveFirmaCliente,
} from "../../actions";

const PRIORIDAD_LABELS: Record<string, string> = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta", URGENTE: "Urgente" };
const PRIORIDAD_VARIANT: Record<string, "neutral" | "default" | "warning" | "danger"> = {
  BAJA: "neutral",
  MEDIA: "default",
  ALTA: "warning",
  URGENTE: "danger",
};

export default async function OrdenTallerDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await assertCanAny(["taller.view", "taller.view_ordenes", "taller.edit_ordenes"]);
  const { id } = await params;
  const perms = await getEffectivePermissions(user.id);
  const fullAccess = perms.has("taller.view");
  const editable = fullAccess || perms.has("taller.edit_ordenes");
  const soloLectura = !fullAccess && !editable;
  const puedeRevisar = perms.has("taller.control_calidad");

  const [orden, tecnicos, historial] = await Promise.all([
    db.ordenTaller.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        repuestos: { orderBy: { createdAt: "asc" } },
        gastos: { orderBy: { createdAt: "asc" } },
        checklist: { orderBy: { orden: "asc" } },
        imagenes: { orderBy: { createdAt: "asc" } },
        tecnicoResponsable: true,
        revisadoPor: true,
        creadoPor: true,
      },
    }),
    db.user.findMany({
      where: { activo: true, roles: { some: { role: { key: "TALLER" } } } },
      orderBy: { nombre: "asc" },
    }),
    db.auditLog.findMany({
      where: { entidad: "Orden de taller", entidadId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!orden) notFound();

  const vehiculoLabel = orden.vehMarca
    ? `${orden.vehMarca} ${orden.vehModelo ?? ""}${orden.vehMatricula ? ` (${orden.vehMatricula})` : ""}`
    : orden.vehiculo
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
  const boundControlCalidad = setControlCalidad.bind(null, id);
  const boundFirmaCliente = saveFirmaCliente.bind(null, id);

  const pdfUrl = `/api/documentos/orden-taller/${orden.id}`;
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const pdfAbsoluteUrl = host ? `${protocol}://${host}${pdfUrl}` : pdfUrl;
  const whatsappMensaje = `Hola ${orden.clienteNombre ?? ""}, te enviamos el detalle de la orden de trabajo N° ${orden.numeroOrden} de tu ${vehiculoLabel} — Quiroga Servicio Automotriz. Podés verla acá: ${pdfAbsoluteUrl}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/taller" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a Taller
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              N° {orden.numeroOrden} — {vehiculoLabel}
            </h1>
            <p className="text-sm text-muted-foreground">
              Creada el {new Date(orden.createdAt).toLocaleDateString("es-UY")}
              {orden.creadoPor ? ` por ${orden.creadoPor.nombre}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={PRIORIDAD_VARIANT[orden.prioridad]}>{PRIORIDAD_LABELS[orden.prioridad]}</Badge>
            <OrdenEstadoBadge estado={orden.estado} />
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </a>
            </Button>
            {!soloLectura && (
              <WhatsAppButton phone={orden.clienteTelefono} message={whatsappMensaje} label="Enviar al cliente" />
            )}
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
            estado: orden.estado,
            prioridad: orden.prioridad,
            tiposServicio: orden.tiposServicio,
            tipoServicioOtro: orden.tipoServicioOtro,
            fechaIngreso: orden.fechaIngreso,
            fechaFinalizacion: orden.fechaFinalizacion,
            responsable: orden.responsable,
            tecnicoResponsableId: orden.tecnicoResponsableId,
            problema: orden.problema,
            trabajosRealizados: orden.trabajosRealizados,
            observaciones: orden.observaciones,
            manoDeObraCents: soloLectura ? 0 : orden.manoDeObraCents,
            costoServicioCents: soloLectura ? 0 : orden.costoServicioCents,
            vehMarca: orden.vehMarca,
            vehModelo: orden.vehModelo,
            vehVersion: orden.vehVersion,
            vehAnio: orden.vehAnio,
            vehColor: orden.vehColor,
            vehMatricula: orden.vehMatricula,
            vehKm: orden.vehKm,
            vehChasis: orden.vehChasis,
            vehCombustible: orden.vehCombustible,
            clienteNombre: orden.clienteNombre,
            clienteTelefono: orden.clienteTelefono,
            clienteDireccion: orden.clienteDireccion,
          }}
          editable={editable}
          tecnicos={tecnicos.map((t) => ({ id: t.id, label: t.nombre }))}
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

      {!soloLectura && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Repuestos</h2>
            <RepuestosTable repuestos={orden.repuestos} editable={editable} onAdd={boundAddRepuesto} onDelete={boundDeleteRepuesto} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Gastos extra</h2>
            <GastosOrdenTable gastos={orden.gastos} editable={editable} onAdd={boundAddGasto} onDelete={boundDeleteGasto} />
          </section>
        </>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Fotos</h2>
        <ImagenesGallery imagenes={orden.imagenes} editable={editable} onUpload={boundAddImagenes} onDelete={boundDeleteImagen} />
      </section>

      {puedeRevisar || orden.revisadoAt ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Control de calidad</h2>
          <ControlCalidadCard
            revisadoPorNombre={orden.revisadoPor?.nombre ?? null}
            revisadoAprobado={orden.revisadoAprobado}
            revisadoAt={orden.revisadoAt}
            puedeRevisar={puedeRevisar}
            onConfirm={boundControlCalidad}
          />
        </section>
      ) : null}

      {!soloLectura && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Conformidad del cliente</h2>
          <ConformidadClienteCard
            clienteNombre={orden.clienteNombre}
            firmaDataUrl={orden.clienteFirmaDataUrl}
            firmaFecha={orden.clienteFirmaFecha}
            editable={editable}
            action={boundFirmaCliente}
          />
        </section>
      )}

      {historial.length > 0 && !soloLectura && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Historial de cambios</h2>
          <div className="flex flex-col gap-2 text-sm">
            {historial.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span className="text-foreground">{h.descripcion}</span>
                <span className="text-xs text-muted-foreground">
                  {h.userNombre} — {new Date(h.createdAt).toLocaleString("es-UY")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
