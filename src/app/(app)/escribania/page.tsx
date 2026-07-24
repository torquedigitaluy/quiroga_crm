import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/auth/Can";
import { SeccionTabs } from "@/components/escribania/SeccionTabs";
import { EscribaniaTable } from "@/components/escribania/EscribaniaTable";
import { vehiculoLabel } from "@/lib/vehiculoLabel";
import { deleteTramite, restoreTramite } from "./actions";

export default async function EscribaniaPage({
  searchParams,
}: {
  searchParams: Promise<{ archivadas?: string; matricula?: string }>;
}) {
  await assertCan("escribania.view");
  const editable = await can("escribania.edit");
  const { archivadas, matricula } = await searchParams;
  const verArchivadas = archivadas === "1";

  const where: Prisma.EscribaniaTramiteWhereInput = {
    archivedAt: verArchivadas ? { not: null } : null,
    ...(matricula
      ? {
          OR: [
            { matricula: { contains: matricula, mode: "insensitive" } },
            { vehiculo: { matricula: { contains: matricula, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const tramites = await db.escribaniaTramite.findMany({
    where,
    include: { vehiculo: true, cliente: true },
    orderBy: { fecha: "desc" },
  });

  const filas = tramites.map((t) => ({
    id: t.id,
    fecha: t.fecha ? new Date(t.fecha).toLocaleDateString("es-UY") : null,
    vehiculoLabel: vehiculoLabel(t.vehiculo, t.vehiculoExterno),
    matricula: t.matricula ?? t.vehiculo?.matricula ?? "—",
    titulosCon: t.titulosCon,
    tipoDoc: t.tipoDoc,
    clienteNombre: t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido ?? ""}` : "—",
    fechaFirma: t.fechaFirma ? new Date(t.fechaFirma).toLocaleDateString("es-UY") : null,
    costoEscribania: formatCents(t.pagoEscribaniaCents, t.pagoMoneda),
    fechaPago: t.fechaPago ? new Date(t.fechaPago).toLocaleDateString("es-UY") : null,
    cobroAlCliente: t.cobroAlCliente,
    fechaEntregaTitulos: t.fechaEntregaTitulos ? new Date(t.fechaEntregaTitulos).toLocaleDateString("es-UY") : null,
    ubicacionTitulos: t.ubicacionTitulos,
  }));

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
            <Link href={verArchivadas ? "/escribania?archivadas=1" : "/escribania"}>Limpiar</Link>
          </Button>
        )}
      </form>

      <EscribaniaTable
        tramites={filas}
        verArchivadas={verArchivadas}
        editable={editable}
        onDelete={deleteTramite}
        onRestore={restoreTramite}
      />
    </div>
  );
}
