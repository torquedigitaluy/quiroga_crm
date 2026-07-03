import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleToggle } from "@/components/admin/RoleToggle";
import { PermissionOverrideSelect } from "@/components/admin/PermissionOverrideSelect";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { resetPassword } from "../actions";

export default async function UsuarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("admin.users");
  const { id } = await params;

  const [usuario, roles, permissions] = await Promise.all([
    db.user.findUnique({ where: { id }, include: { roles: true, permissions: true } }),
    db.role.findMany({ orderBy: { nombre: "asc" } }),
    db.permission.findMany({ orderBy: [{ grupo: "asc" }, { label: "asc" }] }),
  ]);
  if (!usuario) notFound();

  const assignedRoleIds = new Set(usuario.roles.map((r) => r.roleId));
  const overrideByPermission = new Map(usuario.permissions.map((p) => [p.permissionId, p.effect]));

  const grouped = new Map<string, typeof permissions>();
  for (const perm of permissions) {
    if (!grouped.has(perm.grupo)) grouped.set(perm.grupo, []);
    grouped.get(perm.grupo)!.push(perm);
  }

  const boundResetPassword = resetPassword.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/usuarios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{usuario.nombre}</h1>
        <p className="text-sm text-muted-foreground">{usuario.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          {roles.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm">
              <RoleToggle userId={usuario.id} roleId={r.id} assigned={assignedRoleIds.has(r.id)} />
              {r.nombre}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm action={boundResetPassword} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades personalizadas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {[...grouped.entries()].map(([grupo, perms]) => (
            <div key={grupo} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">{grupo}</h3>
              <div className="flex flex-col gap-2">
                {perms.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{p.label}</span>
                    <PermissionOverrideSelect
                      userId={usuario.id}
                      permissionId={p.id}
                      current={(overrideByPermission.get(p.id) as "GRANT" | "REVOKE" | undefined) ?? "INHERIT"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
