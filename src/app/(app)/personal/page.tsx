import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Can } from "@/components/auth/Can";

export default async function PersonalPage() {
  await assertCan("personal.view");

  const empleados = await db.empleado.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Personal</h1>
          <p className="text-sm text-muted-foreground">{empleados.length} empleados activos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/personal/asistencia">
              <CalendarDays className="h-4 w-4" />
              Asistencia mensual
            </Link>
          </Button>
          <Can permission="personal.edit">
            <Button asChild>
              <Link href="/personal/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo empleado
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo de pago</TableHead>
            <TableHead>Sueldo / Jornal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empleados.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <Link href={`/personal/${e.id}`} className="font-medium text-foreground hover:text-brand">
                  {e.nombre} {e.apellido ?? ""}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{e.tipoPago === "MENSUAL" ? "Mensual" : "Jornalero"}</Badge>
              </TableCell>
              <TableCell>
                {e.tipoPago === "MENSUAL"
                  ? formatCents(e.sueldoMensualCents ?? 0, "UYU")
                  : `${formatCents(e.jornalDiarioCents ?? 0, "UYU")} / día`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
