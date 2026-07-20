import Link from "next/link";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { StatusBadge } from "@/components/stock/StatusBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function MisVehiculosPage() {
  const user = await assertCan("costos.view_own");

  const vehiculos = await db.vehiculo.findMany({
    where: { responsables: { some: { id: user.id } }, esVehiculo: true, archivedAt: null },
    orderBy: { fechaIngreso: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mis Vehículos</h1>
        <p className="text-sm text-muted-foreground">
          Vehículos donde figurás como responsable. Entrá a cada uno para cargar sus costos y gastos.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <Link href={`/costos/${v.id}`} className="font-medium text-foreground hover:text-brand">
                  {v.marca} {v.modelo}
                </Link>
              </TableCell>
              <TableCell>{v.matricula ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge estado={v.estado} />
              </TableCell>
            </TableRow>
          ))}
          {vehiculos.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                No tenés vehículos asignados como responsable todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
