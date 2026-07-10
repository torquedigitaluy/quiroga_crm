"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";

export async function createUser(formData: FormData) {
  await assertCan("admin.users");

  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleId = String(formData.get("roleId") ?? "");

  if (!nombre || !email || !password) throw new Error("Nombre, email y contraseña son obligatorios");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error("Ya existe un usuario con ese email");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({ data: { nombre, email, passwordHash } });

  if (roleId) {
    await db.userRole.create({ data: { userId: user.id, roleId } });
  }

  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${user.id}`);
}

export async function toggleUserActivo(userId: string, activo: boolean) {
  await assertCan("admin.users");
  await db.user.update({ where: { id: userId }, data: { activo } });
  revalidatePath("/admin/usuarios");
}

export async function toggleUserEsVendedor(userId: string, esVendedor: boolean) {
  await assertCan("admin.users");
  await db.user.update({ where: { id: userId }, data: { esVendedor } });
  revalidatePath(`/admin/usuarios/${userId}`);
}

export async function toggleUserRole(userId: string, roleId: string, assign: boolean) {
  await assertCan("admin.users");
  if (assign) {
    await db.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  } else {
    await db.userRole.deleteMany({ where: { userId, roleId } });
  }
  revalidatePath(`/admin/usuarios/${userId}`);
}

export async function setPermissionOverride(userId: string, permissionId: string, effect: "GRANT" | "REVOKE" | "INHERIT") {
  await assertCan("admin.users");

  if (effect === "INHERIT") {
    await db.userPermission.deleteMany({ where: { userId, permissionId } });
  } else {
    await db.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { effect },
      create: { userId, permissionId, effect },
    });
  }
  revalidatePath(`/admin/usuarios/${userId}`);
}

export async function resetPassword(userId: string, formData: FormData) {
  await assertCan("admin.users");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath(`/admin/usuarios/${userId}`);
}
