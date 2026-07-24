"use client";

import { useRef } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { ResizeHandle } from "@/components/ui/ResizeHandle";
import { FloatingScrollbar } from "@/components/ui/FloatingScrollbar";
import { useColumnWidths, type ColumnDef } from "@/components/ui/useColumnWidths";
import {
  TITULOS_CON_LABELS,
  TIPO_DOC_LABELS,
  COBRO_CLIENTE_LABELS,
  UBICACION_TITULOS_LABELS,
} from "@/components/escribania/labels";

export type EscribaniaTramiteRow = {
  id: string;
  fecha: string | null;
  vehiculoLabel: string;
  matricula: string;
  titulosCon: string;
  tipoDoc: string;
  clienteNombre: string;
  fechaFirma: string | null;
  costoEscribania: string;
  fechaPago: string | null;
  cobroAlCliente: string;
  fechaEntregaTitulos: string | null;
  ubicacionTitulos: string;
};

const COLUMNS: ColumnDef[] = [
  { key: "fecha", defaultWidth: 110 },
  { key: "vehiculo", defaultWidth: 190 },
  { key: "matricula", defaultWidth: 110 },
  { key: "titulosCon", defaultWidth: 130 },
  { key: "tipo", defaultWidth: 100 },
  { key: "cliente", defaultWidth: 160 },
  { key: "fechaFirma", defaultWidth: 110 },
  { key: "costoEscribania", defaultWidth: 130 },
  { key: "fechaPago", defaultWidth: 110 },
  { key: "cobroCliente", defaultWidth: 150 },
  { key: "entregaTitulos", defaultWidth: 130 },
  { key: "ubicacionTitulos", defaultWidth: 170 },
  { key: "acciones", defaultWidth: 150, minWidth: 110 },
];

export function EscribaniaTable({
  tramites,
  verArchivadas,
  editable,
  onDelete,
  onRestore,
}: {
  tramites: EscribaniaTramiteRow[];
  verArchivadas: boolean;
  editable: boolean;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
}) {
  const columns = editable ? COLUMNS : COLUMNS.filter((c) => c.key !== "acciones");
  const { widths, startResize } = useColumnWidths("quiroga:col-widths:escribania", columns);
  const containerRef = useRef<HTMLDivElement>(null);
  const colCount = columns.length;

  return (
    <div className="flex flex-col gap-2">
      <Table containerRef={containerRef} containerClassName="max-h-[70vh] overflow-y-auto" className="table-fixed">
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: widths[c.key] ?? c.defaultWidth }} />
          ))}
        </colgroup>
        <TableHeader className="sticky top-0 z-10 shadow-sm">
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className="relative overflow-hidden text-ellipsis pr-3">
                {COLUMN_LABELS[c.key]}
                <ResizeHandle onResizeStart={(e) => startResize(c.key, e)} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tramites.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="overflow-hidden text-ellipsis">{t.fecha ?? "—"}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis font-medium text-foreground">{t.vehiculoLabel}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.matricula}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{TITULOS_CON_LABELS[t.titulosCon]}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">
                <Badge variant="outline">{TIPO_DOC_LABELS[t.tipoDoc]}</Badge>
              </TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.clienteNombre}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.fechaFirma ?? "—"}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.costoEscribania}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.fechaPago ?? "—"}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{COBRO_CLIENTE_LABELS[t.cobroAlCliente]}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{t.fechaEntregaTitulos ?? "—"}</TableCell>
              <TableCell className="overflow-hidden text-ellipsis">{UBICACION_TITULOS_LABELS[t.ubicacionTitulos]}</TableCell>
              {editable && (
                <TableCell className="flex justify-end gap-2 text-right">
                  {verArchivadas ? (
                    <RestoreButton onConfirm={() => onRestore(t.id)} />
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/escribania/${t.id}`}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <ConfirmArchiveButton
                        onConfirm={() => onDelete(t.id)}
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
              <TableCell colSpan={colCount} className="py-6 text-center text-muted-foreground">
                No hay trámites registrados todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <FloatingScrollbar targetRef={containerRef} />
    </div>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  fecha: "Fecha de seña",
  vehiculo: "Vehículo",
  matricula: "Matrícula",
  titulosCon: "Títulos con",
  tipo: "Tipo",
  cliente: "Cliente",
  fechaFirma: "Fecha firma",
  costoEscribania: "Costo Escribanía",
  fechaPago: "Fecha de pago",
  cobroCliente: "Cobro al cliente",
  entregaTitulos: "Entrega títulos",
  ubicacionTitulos: "Ubicación títulos",
  acciones: "Acciones",
};
