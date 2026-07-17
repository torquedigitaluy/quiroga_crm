import Link from "next/link";
import { FileDown, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { restorePromesa, deletePromesa } from "./promesa/actions";

export default async function DocumentosPage() {
  await assertCan("docs.generate");

  const [promesas, promesasArchivadas, conformes] = await Promise.all([
    db.promesaCompraventa.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    db.promesaCompraventa.findMany({
      where: { archivedAt: { not: null } },
      orderBy: { archivedAt: "desc" },
      take: 30,
    }),
    db.conforme.findMany({
      include: { financiacionPropia: true, cuota: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Documentos</h1>
        <p className="text-sm text-muted-foreground">Generá los documentos imprimibles a partir de los datos ya cargados.</p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Promesa de Compra-Venta</h2>
          <Button asChild>
            <Link href="/documentos/promesa/nueva">
              <Plus className="h-4 w-4" />
              Nueva promesa
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {promesas.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.numero}</TableCell>
                <TableCell className="font-medium text-foreground">
                  <Link href={`/documentos/promesa/${p.id}`} className="hover:text-brand">
                    {p.vehMarca} {p.vehModelo}
                  </Link>
                </TableCell>
                <TableCell>{[p.clienteNombre, p.clienteApellido].filter(Boolean).join(" ") || "—"}</TableCell>
                <TableCell>{new Date(p.fecha).toLocaleDateString("es-UY")}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/documentos/promesa/${p.id}`}>Editar</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/documentos/promesa/${p.id}`} target="_blank" rel="noopener noreferrer">
                      <FileDown className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {promesas.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  No hay promesas de compraventa generadas todavía.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {promesasArchivadas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Promesas archivadas</h2>
          <p className="text-sm text-muted-foreground">
            No aparecen entre las activas. Podés restaurarlas o eliminarlas definitivamente.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Archivada</TableHead>
                <TableHead className="w-48" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {promesasArchivadas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.numero}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {p.vehMarca} {p.vehModelo}
                  </TableCell>
                  <TableCell>{[p.clienteNombre, p.clienteApellido].filter(Boolean).join(" ") || "—"}</TableCell>
                  <TableCell>{p.archivedAt ? new Date(p.archivedAt).toLocaleDateString("es-UY") : "—"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <RestoreButton onConfirm={restorePromesa.bind(null, p.id)} />
                    <ConfirmDeleteButton
                      onConfirm={deletePromesa.bind(null, p.id)}
                      triggerLabel="Eliminar"
                      title="Eliminar promesa definitivamente"
                      description="Esta acción no se puede deshacer. Se eliminará permanentemente la promesa de compraventa."
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Recibos de pago generados</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Cuota</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Fecha de Pago</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {conformes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">{c.financiacionPropia.nombre}</TableCell>
                <TableCell>{c.cuota ? `# ${c.cuota.numero}` : "—"}</TableCell>
                <TableCell>{new Date(c.fechaVencimiento).toLocaleDateString("es-UY")}</TableCell>
                <TableCell>{new Date(c.fechaPago).toLocaleDateString("es-UY")}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/documentos/conforme/${c.id}`} target="_blank" rel="noopener noreferrer">
                      <FileDown className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {conformes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  No hay recibos de pago generados todavía. Se generan desde Financiación Propia → Cuotas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
