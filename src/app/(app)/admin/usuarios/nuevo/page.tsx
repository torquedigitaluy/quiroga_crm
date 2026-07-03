import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { NewUserForm } from "@/components/admin/NewUserForm";
import { createUser } from "../actions";

export default async function NuevoUsuarioPage() {
  await assertCan("admin.users");

  const roles = await db.role.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo usuario</h1>
      </div>
      <NewUserForm roles={roles} action={createUser} />
    </div>
  );
}
