import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";
import { ConfirmArchiveButton } from "@/components/ui/ConfirmArchiveButton";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { archiveFinanciacionPropia, restoreFinanciacionPropia } from "./actions";

export default async function FinanciacionPropiaPage({
  searchParams,
}: {
  searchParams: Promise<{ archivadas?: string }>;
}) {
  await assertCan("propia.view");
  const editable = await can("propia.edit");
  const { archivadas } = await searchParams;
  const verArchivadas = archivadas === "1";

  const financiaciones = await db.financiacionPropia.findMany({
    where: { archivedAt: verArchivadas ? { not: null } : null },
    include: { cliente: true, vehiculo: true, cuotas: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {verArchivadas ? "Financiaciones propias eliminadas" : "Financiación Propia (Jorge Autos)"}
          </h1>
          <p className="text-sm text-muted-foreground">{financiaciones.length} planes {verArchivadas ? "eliminados" : "activos"}</p>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <Button variant="outline" asChild>
              <Link href={verArchivadas ? "/propia" : "/propia?archivadas=1"}>
                {verArchivadas ? "Ver activos" : "Ver eliminados"}
              </Link>
            </Button>
          )}
          {!verArchivadas && (
            <>
              <Button variant="outline" asChild>
                <Link href="/propia/deudas">
                  <Receipt className="h-4 w-4" />
                  Deudas de clientes
                </Link>
              </Button>
              <Can permission="propia.edit">
                <Button asChild>
                  <Link href="/propia/nueva">
                    <Plus className="h-4 w-4" />
                    Nueva financiación
                  </Link>
                </Button>
              </Can>
            </>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Monto financiado</TableHead>
            <TableHead>Cuotas</TableHead>
            <TableHead>Pagadas</TableHead>
            <TableHead>Atrasadas</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {financiaciones.map((f) => {
            const pagadas = f.cuotas.filter((c) => c.pagada).length;
            const atrasadas = f.cuotas.filter((c) => !c.pagada && new Date(c.fechaVencimiento) < new Date()).length;
            return (
              <TableRow key={f.id}>
                <TableCell>
                  {verArchivadas ? (
                    <span className="font-medium text-foreground">{f.nombre}</span>
                  ) : (
                    <Link href={`/propia/${f.id}`} className="font-medium text-foreground hover:text-brand">
                      {f.nombre}
                    </Link>
                  )}
                </TableCell>
                <TableCell>{f.vehiculo ? `${f.vehiculo.marca} ${f.vehiculo.modelo}` : "—"}</TableCell>
                <TableCell>{formatCents(f.montoFinanciadoUsdCents, "USD")}</TableCell>
                <TableCell>
                  {pagadas} / {f.cantidadCuotas}
                </TableCell>
                <TableCell>{pagadas}</TableCell>
                <TableCell className={atrasadas > 0 ? "text-danger" : "text-muted-foreground"}>{atrasadas}</TableCell>
                <TableCell>
                  {editable &&
                    (verArchivadas ? (
                      <RestoreButton onConfirm={restoreFinanciacionPropia.bind(null, f.id)} />
                    ) : (
                      <ConfirmArchiveButton
                        onConfirm={archiveFinanciacionPropia.bind(null, f.id)}
                        title="¿Eliminar esta financiación?"
                        description="Va a dejar de aparecer en la lista, pero queda guardada en Financiaciones eliminadas y se puede restaurar en cualquier momento."
                      />
                    ))}
                </TableCell>
              </TableRow>
            );
          })}
          {financiaciones.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                {verArchivadas ? "No hay financiaciones eliminadas." : "No hay planes de financiación propia registrados."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
