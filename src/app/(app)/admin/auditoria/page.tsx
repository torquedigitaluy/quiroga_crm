import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const ACCION_VARIANT: Record<string, "default" | "outline"> = {
  ELIMINAR: "default",
  EDITAR: "outline",
  CREAR: "outline",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ accion?: string; entidad?: string }>;
}) {
  await assertCan("audit.view");
  const { accion, entidad } = await searchParams;

  const logs = await db.auditLog.findMany({
    where: {
      ...(accion ? { accion } : {}),
      ...(entidad ? { entidad } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Historial de cambios</h1>
        <p className="text-sm text-muted-foreground">
          Registro de creaciones, ediciones y eliminaciones. Se muestran los últimos 500 movimientos.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Acción</label>
          <select
            name="accion"
            defaultValue={accion ?? ""}
            className="h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Todas</option>
            <option value="CREAR">Crear</option>
            <option value="EDITAR">Editar</option>
            <option value="ELIMINAR">Eliminar</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString("es-UY")}
                </TableCell>
                <TableCell className="font-medium text-foreground">{l.userNombre}</TableCell>
                <TableCell>
                  <Badge variant={ACCION_VARIANT[l.accion] ?? "outline"}>{l.accion}</Badge>
                </TableCell>
                <TableCell>{l.entidad}</TableCell>
                <TableCell className="text-muted-foreground">{l.descripcion}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay movimientos registrados {accion ? "con ese filtro" : "todavía"}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
