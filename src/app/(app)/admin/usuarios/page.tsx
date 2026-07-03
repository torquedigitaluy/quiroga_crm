import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ActivoToggle } from "@/components/admin/ActivoToggle";

export default async function UsuariosPage() {
  await assertCan("admin.users");

  const usuarios = await db.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Administración de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Creá usuarios, asigná roles y personalizá permisos.</p>
        </div>
        <Button asChild>
          <Link href="/admin/usuarios/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Activo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Link href={`/admin/usuarios/${u.id}`} className="font-medium text-foreground hover:text-brand">
                  {u.nombre}
                </Link>
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {u.roles.map((r) => (
                    <Badge key={r.roleId} variant="outline">
                      {r.role.nombre}
                    </Badge>
                  ))}
                  {u.roles.length === 0 && <span className="text-muted-foreground">Sin rol</span>}
                </div>
              </TableCell>
              <TableCell>
                <ActivoToggle userId={u.id} activo={u.activo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
