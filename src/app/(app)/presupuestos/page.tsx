import Link from "next/link";
import { Plus, FileDown, Settings } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { totalesPresupuesto } from "@/lib/presupuesto";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { TallerTabs } from "@/components/taller/TallerTabs";
import { archivePresupuesto, restorePresupuesto } from "./actions";

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ archivadas?: string; matricula?: string }>;
}) {
  await assertCan("presupuestos.view");
  const editable = await can("presupuestos.edit");
  const { archivadas, matricula } = await searchParams;
  const verArchivadas = archivadas === "1";

  const where: Prisma.PresupuestoWhereInput = {
    archivedAt: verArchivadas ? { not: null } : null,
    ...(matricula
      ? {
          OR: [
            { vehMatricula: { contains: matricula, mode: "insensitive" } },
            { vehiculo: { matricula: { contains: matricula, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const presupuestos = await db.presupuesto.findMany({
    where,
    include: { vehiculo: true, aceites: true, articulos: true },
    orderBy: { fecha: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {verArchivadas ? "Presupuestos eliminados" : "Presupuestos"}
          </h1>
          <p className="text-sm text-muted-foreground">{presupuestos.length} presupuestos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <Button variant="outline" asChild>
              <Link href="/presupuestos/aceites">
                <Settings className="h-4 w-4" />
                Aceites
              </Link>
            </Button>
          )}
          {editable && (
            <Button variant="outline" asChild>
              <Link href={verArchivadas ? "/presupuestos" : "/presupuestos?archivadas=1"}>
                {verArchivadas ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          )}
          {!verArchivadas && editable && (
            <Button asChild>
              <Link href="/presupuestos/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo presupuesto
              </Link>
            </Button>
          )}
        </div>
      </div>

      <TallerTabs active="presupuestos" />

      <form className="flex flex-wrap items-end gap-2">
        {archivadas && <input type="hidden" name="archivadas" value={archivadas} />}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Matrícula</label>
          <Input name="matricula" placeholder="Ej: ABC 1234" defaultValue={matricula ?? ""} className="w-48" />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
        {matricula && (
          <Button variant="ghost" asChild>
            <Link href={verArchivadas ? "/presupuestos?archivadas=1" : "/presupuestos"}>Limpiar</Link>
          </Button>
        )}
      </form>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {presupuestos.map((p) => {
              const { uyuCents, usdCents } = totalesPresupuesto(p.aceites, p.articulos);
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.numero}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {verArchivadas ? (
                      vehiculoLabel(p.vehiculo, p.vehiculoExterno)
                    ) : (
                      <Link href={`/presupuestos/${p.id}`} className="hover:text-brand">
                        {p.vehiculo ? `${p.vehiculo.marca} ${p.vehiculo.modelo}` : (p.vehMarca ? `${p.vehMarca} ${p.vehModelo ?? ""}` : (p.vehiculoExterno ?? "Vehículo externo"))}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>{p.vehMatricula ?? p.vehiculo?.matricula ?? "—"}</TableCell>
                  <TableCell>{p.clienteNombre ?? "—"}</TableCell>
                  <TableCell>{new Date(p.fecha).toLocaleDateString("es-UY")}</TableCell>
                  <TableCell>
                    {uyuCents === 0 && usdCents === 0
                      ? "—"
                      : [uyuCents > 0 ? formatCents(uyuCents, "UYU") : null, usdCents > 0 ? formatCents(usdCents, "USD") : null]
                          .filter(Boolean)
                          .join(" + ")}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    {verArchivadas ? (
                      editable && <RestoreButton onConfirm={restorePresupuesto.bind(null, p.id)} />
                    ) : (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/api/documentos/presupuesto/${p.id}`} target="_blank" rel="noopener noreferrer">
                            <FileDown className="h-3.5 w-3.5" />
                            PDF
                          </a>
                        </Button>
                        {editable && (
                          <ConfirmArchiveButton
                            onConfirm={archivePresupuesto.bind(null, p.id)}
                            title="¿Eliminar este presupuesto?"
                            description="Va a dejar de aparecer en la lista, pero queda guardado en Presupuestos eliminados y se puede restaurar en cualquier momento."
                          />
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {presupuestos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {verArchivadas ? "No hay presupuestos eliminados." : "No hay presupuestos registrados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
