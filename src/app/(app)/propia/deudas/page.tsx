import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DeudaForm } from "@/components/propia/DeudaForm";
import { SaldadoCheckbox } from "@/components/propia/SaldadoCheckbox";
import { createDeuda } from "../actions";

export default async function DeudasClientesPage() {
  await assertCan("deudas.view");

  const [deudas, user] = await Promise.all([
    db.deudaCliente.findMany({ orderBy: { createdAt: "desc" } }),
    getCurrentUser(),
  ]);
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("deudas.edit");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/propia" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a financiación propia
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Deudas de Clientes</h1>
        <p className="text-sm text-muted-foreground">Multas, patente y otros cargos sueltos no ligados a un plan de cuotas.</p>
      </div>

      {editable && <DeudaForm action={createDeuda} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Saldado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deudas.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-medium text-foreground">{d.nombre}</TableCell>
              <TableCell>{d.contacto ?? "—"}</TableCell>
              <TableCell>{d.matricula ?? "—"}</TableCell>
              <TableCell>{d.concepto}</TableCell>
              <TableCell className={d.saldado ? "text-muted-foreground" : "text-danger"}>
                {formatCents(d.montoCents, d.moneda)}
              </TableCell>
              <TableCell>
                <SaldadoCheckbox id={d.id} saldado={d.saldado} editable={editable} />
              </TableCell>
            </TableRow>
          ))}
          {deudas.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No hay deudas registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
