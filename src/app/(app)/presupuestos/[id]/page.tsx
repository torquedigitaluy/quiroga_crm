import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { totalesPresupuesto } from "@/lib/presupuesto";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PresupuestoForm } from "@/components/presupuestos/PresupuestoForm";
import { AceitesTable } from "@/components/presupuestos/AceitesTable";
import { ArticulosTable } from "@/components/presupuestos/ArticulosTable";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { WhatsAppPdfButton } from "@/components/ui/WhatsAppPdfButton";
import {
  updatePresupuesto,
  addAceitePresupuesto,
  deleteAceitePresupuesto,
  addArticuloPresupuesto,
  deleteArticuloPresupuesto,
  archivePresupuesto,
} from "../actions";

export default async function PresupuestoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("presupuestos.view");
  const editable = await can("presupuestos.edit");
  const { id } = await params;

  const [presupuesto, vehiculos, predefinidos] = await Promise.all([
    db.presupuesto.findUnique({
      where: { id },
      include: { vehiculo: true, aceites: { orderBy: { createdAt: "asc" } }, articulos: { orderBy: { createdAt: "asc" } } },
    }),
    db.vehiculo.findMany({ where: { esVehiculo: true, archivedAt: null }, orderBy: { marca: "asc" } }),
    db.aceitePredefinido.findMany({ where: { activo: true }, orderBy: { orden: "asc" } }),
  ]);
  if (!presupuesto) notFound();

  const vehiculoLabelTexto = presupuesto.vehMarca
    ? `${presupuesto.vehMarca} ${presupuesto.vehModelo ?? ""}${presupuesto.vehMatricula ? ` (${presupuesto.vehMatricula})` : ""}`
    : presupuesto.vehiculo
      ? `${presupuesto.vehiculo.marca} ${presupuesto.vehiculo.modelo}${presupuesto.vehiculo.matricula ? ` (${presupuesto.vehiculo.matricula})` : ""}`
      : (presupuesto.vehiculoExterno ?? "Vehículo externo");

  const { uyuCents, usdCents } = totalesPresupuesto(presupuesto.aceites, presupuesto.articulos);

  const boundUpdate = updatePresupuesto.bind(null, id);
  const boundAddAceite = addAceitePresupuesto.bind(null, id);
  const boundDeleteAceite = deleteAceitePresupuesto.bind(null, id);
  const boundAddArticulo = addArticuloPresupuesto.bind(null, id);
  const boundDeleteArticulo = deleteArticuloPresupuesto.bind(null, id);

  const pdfUrl = `/api/documentos/presupuesto/${presupuesto.id}`;
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const pdfAbsoluteUrl = host ? `${protocol}://${host}${pdfUrl}` : pdfUrl;
  const whatsappMensaje = `Hola ${presupuesto.clienteNombre ?? ""}, te enviamos el presupuesto N° ${presupuesto.numero} de tu ${vehiculoLabelTexto} — Quiroga Automóviles. Podés verlo acá: ${pdfAbsoluteUrl}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/presupuestos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a Presupuestos
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              N° {presupuesto.numero} — {vehiculoLabelTexto}
            </h1>
            <p className="text-sm text-muted-foreground">
              Creado el {new Date(presupuesto.createdAt).toLocaleDateString("es-UY")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </a>
            </Button>
            <WhatsAppPdfButton phone={presupuesto.clienteTelefono} message={whatsappMensaje} pdfUrl={pdfUrl} fileName={`presupuesto-${presupuesto.numero}.pdf`} />
            {editable && (
              <ConfirmArchiveButton
                onConfirm={archivePresupuesto.bind(null, presupuesto.id)}
                title="¿Eliminar este presupuesto?"
                description="Va a dejar de aparecer en Presupuestos, pero queda guardado en el histórico y se puede restaurar en cualquier momento."
              />
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total del presupuesto</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Pesos</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(uyuCents, "UYU")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Dólares</span>
            <span className="text-lg font-semibold text-foreground">{formatCents(usdCents, "USD")}</span>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Datos del vehículo y cliente</h2>
        <fieldset disabled={!editable}>
          <PresupuestoForm
            vehiculos={vehiculos.map((v) => ({
              id: v.id,
              label: `${v.marca} ${v.modelo}${v.matricula ? ` — ${v.matricula}` : ""}`,
              marca: v.marca,
              modelo: v.modelo,
              matricula: v.matricula,
            }))}
            initial={{
              vehiculoId: presupuesto.vehiculoId,
              vehiculoExterno: presupuesto.vehiculoExterno,
              vehMarca: presupuesto.vehMarca,
              vehModelo: presupuesto.vehModelo,
              vehMatricula: presupuesto.vehMatricula,
              vehCombustible: presupuesto.vehCombustible,
              clienteNombre: presupuesto.clienteNombre,
              clienteTelefono: presupuesto.clienteTelefono,
              comentarios: presupuesto.comentarios,
            }}
            submitLabel="Guardar cambios"
            action={boundUpdate}
          />
        </fieldset>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Aceites</h2>
        <AceitesTable
          aceites={presupuesto.aceites}
          predefinidos={predefinidos}
          editable={editable}
          onAdd={boundAddAceite}
          onDelete={boundDeleteAceite}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Artículos y repuestos</h2>
        <ArticulosTable articulos={presupuesto.articulos} editable={editable} onAdd={boundAddArticulo} onDelete={boundDeleteArticulo} />
      </section>
    </div>
  );
}
