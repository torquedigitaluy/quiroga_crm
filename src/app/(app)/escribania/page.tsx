import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";
import { SeccionTabs } from "@/components/escribania/SeccionTabs";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { deleteTramite, restoreTramite } from "./actions";
import {
  TITULOS_CON_LABELS,
  TIPO_DOC_LABELS,
  COBRO_CLIENTE_LABELS,
  UBICACION_TITULOS_LABELS,
} from "@/components/escribania/labels";

export default async function EscribaniaPage({
  searchParams,
}: {
  searchParams: Promise<{ archivadas?: string }>;
}) {
  await assertCan("escribania.view");
  const editable = await can("escribania.edit");
  const { archivadas } = await searchParams;
  const verArchivadas = archivadas === "1";

  const tramites = await db.escribaniaTramite.findMany({
    where: { archivedAt: verArchivadas ? { not: null } : null },
    include: { vehiculo: true, cliente: true },
    orderBy: { fecha: "desc" },
  });

  const colCount = 12 + (editable ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {verArchivadas ? "Trámites eliminados" : "Escribanía y Títulos"}
          </h1>
          <p className="text-sm text-muted-foreground">{tramites.length} trámites registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <Button variant="outline" asChild>
              <Link href={verArchivadas ? "/escribania" : "/escribania?archivadas=1"}>
                {verArchivadas ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          )}
          {!verArchivadas && (
            <Can permission="escribania.edit">
              <Button asChild>
                <Link href="/escribania/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo trámite
                </Link>
              </Button>
            </Can>
          )}
        </div>
      </div>

      <SeccionTabs active="escribania" />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha de seña</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Títulos con</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha firma</TableHead>
              <TableHead>Costo Escribanía</TableHead>
              <TableHead>Fecha de pago</TableHead>
              <TableHead>Cobro al cliente</TableHead>
              <TableHead>Entrega títulos</TableHead>
              <TableHead>Ubicación títulos</TableHead>
              {editable && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tramites.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.fecha ? new Date(t.fecha).toLocaleDateString("es-UY") : "—"}</TableCell>
                <TableCell className="font-medium text-foreground">
                  {vehiculoLabel(t.vehiculo, t.vehiculoExterno)}
                </TableCell>
                <TableCell>{t.vehiculo?.matricula ?? "—"}</TableCell>
                <TableCell>{TITULOS_CON_LABELS[t.titulosCon]}</TableCell>
                <TableCell>
                  <Badge variant="outline">{TIPO_DOC_LABELS[t.tipoDoc]}</Badge>
                </TableCell>
                <TableCell>
                  {t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido ?? ""}` : "—"}
                </TableCell>
                <TableCell>{t.fechaFirma ? new Date(t.fechaFirma).toLocaleDateString("es-UY") : "—"}</TableCell>
                <TableCell>{formatCents(t.pagoEscribaniaCents, t.pagoMoneda)}</TableCell>
                <TableCell>{t.fechaPago ? new Date(t.fechaPago).toLocaleDateString("es-UY") : "—"}</TableCell>
                <TableCell>{COBRO_CLIENTE_LABELS[t.cobroAlCliente]}</TableCell>
                <TableCell>
                  {t.fechaEntregaTitulos ? new Date(t.fechaEntregaTitulos).toLocaleDateString("es-UY") : "—"}
                </TableCell>
                <TableCell>{UBICACION_TITULOS_LABELS[t.ubicacionTitulos]}</TableCell>
                {editable && (
                  <TableCell className="flex justify-end gap-2 text-right">
                    {verArchivadas ? (
                      <RestoreButton onConfirm={restoreTramite.bind(null, t.id)} />
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/escribania/${t.id}`}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                        <ConfirmArchiveButton
                          onConfirm={deleteTramite.bind(null, t.id)}
                          title="¿Eliminar este trámite?"
                          description="Va a dejar de aparecer en la lista, pero queda guardado en Trámites eliminados y se puede restaurar en cualquier momento."
                        />
                      </>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {tramites.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} className="py-8 text-center text-muted-foreground">
                  No hay trámites registrados todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
