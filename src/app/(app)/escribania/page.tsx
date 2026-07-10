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
import {
  TITULOS_CON_LABELS,
  TIPO_DOC_LABELS,
  COBRO_CLIENTE_LABELS,
  UBICACION_TITULOS_LABELS,
} from "@/components/escribania/labels";

export default async function EscribaniaPage() {
  await assertCan("escribania.view");
  const editable = await can("escribania.edit");

  const tramites = await db.escribaniaTramite.findMany({
    include: { vehiculo: true, cliente: true },
    orderBy: { fecha: "desc" },
  });

  const colCount = 12 + (editable ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Escribanía y Títulos</h1>
          <p className="text-sm text-muted-foreground">{tramites.length} trámites registrados</p>
        </div>
        <Can permission="escribania.edit">
          <Button asChild>
            <Link href="/escribania/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo trámite
            </Link>
          </Button>
        </Can>
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
              <TableHead>Cobro escribanía</TableHead>
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
                  {t.vehiculo.marca} {t.vehiculo.modelo}
                </TableCell>
                <TableCell>{t.vehiculo.matricula ?? "—"}</TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/escribania/${t.id}`}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
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
