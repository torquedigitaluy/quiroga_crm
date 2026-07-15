import Link from "next/link";
import { Plus, FileDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";
import { EstadoCreditoSelect } from "@/components/bbva/EstadoCreditoSelect";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { archiveCreditoBBVA, restoreCreditoBBVA } from "./actions";

export default async function BBVAPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; archivadas?: string }>;
}) {
  await assertCan("bbva.view");
  const { mes, archivadas } = await searchParams;
  const verArchivadas = archivadas === "1";

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    dateFilter = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }

  const creditos = await db.creditoBBVA.findMany({
    where: {
      archivedAt: verArchivadas ? { not: null } : null,
      ...(dateFilter ? { fechaFirma: dateFilter } : {}),
    },
    include: { vehiculo: true },
    orderBy: { fechaFirma: "desc" },
  });

  const totalSolicitado = creditos.reduce((sum, c) => sum + c.montoSolicitadoUsdCents, 0);

  const user = await getCurrentUser();
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("bbva.edit");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {verArchivadas ? "Créditos BBVA eliminados" : "Créditos BBVA"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {creditos.length} créditos · Total solicitado: {formatCents(totalSolicitado, "USD")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <Button variant="outline" asChild>
              <Link href={verArchivadas ? "/bbva" : "/bbva?archivadas=1"}>
                {verArchivadas ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          )}
          {!verArchivadas && (
            <>
              <Button variant="outline" asChild>
                <a href="/api/bbva/export">
                  <FileDown className="h-4 w-4" />
                  Exportar Excel
                </a>
              </Button>
              <Can permission="bbva.edit">
                <Button asChild>
                  <Link href="/bbva/nuevo">
                    <Plus className="h-4 w-4" />
                    Nuevo crédito
                  </Link>
                </Button>
              </Can>
            </>
          )}
        </div>
      </div>

      {!verArchivadas && (
        <form className="flex items-center gap-2">
          <Input name="mes" type="month" defaultValue={mes} className="w-48" />
          <Button type="submit" variant="outline">
            Filtrar por mes
          </Button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Monto solicitado</TableHead>
            <TableHead>Fecha de firma</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditos.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium text-foreground">{c.nombre}</TableCell>
              <TableCell>{c.ci ?? "—"}</TableCell>
              <TableCell>{c.vehiculo ? `${c.vehiculo.marca} ${c.vehiculo.modelo}` : "—"}</TableCell>
              <TableCell>{formatCents(c.montoSolicitadoUsdCents, "USD")}</TableCell>
              <TableCell>{c.fechaFirma ? new Date(c.fechaFirma).toLocaleDateString("es-UY") : "—"}</TableCell>
              <TableCell>
                <EstadoCreditoSelect id={c.id} estado={c.estado} editable={editable && !verArchivadas} />
              </TableCell>
              <TableCell>
                {editable &&
                  (verArchivadas ? (
                    <RestoreButton onConfirm={restoreCreditoBBVA.bind(null, c.id)} />
                  ) : (
                    <ConfirmArchiveButton
                      onConfirm={archiveCreditoBBVA.bind(null, c.id)}
                      title="¿Eliminar este crédito?"
                      description="Va a dejar de aparecer en la lista, pero queda guardado en Créditos eliminados y se puede restaurar en cualquier momento."
                    />
                  ))}
              </TableCell>
            </TableRow>
          ))}
          {creditos.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {verArchivadas
                  ? "No hay créditos BBVA eliminados."
                  : `No hay créditos BBVA registrados ${mes ? "en ese mes" : "todavía"}.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
