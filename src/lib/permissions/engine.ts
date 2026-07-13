import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { PERMISSION_KEYS } from "./catalog";

const SUPERADMIN_KEY = "SUPERADMIN";

/** Resolves role permissions + per-user GRANT/REVOKE overrides into the final effective set. Cached per request. */
export const getEffectivePermissions = cache(async (userId: string): Promise<Set<string>> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      permissions: { include: { permission: true } },
    },
  });
  if (!user || !user.activo) return new Set();

  const isSuperadmin = user.roles.some((ur) => ur.role.key === SUPERADMIN_KEY);
  if (isSuperadmin) return new Set(PERMISSION_KEYS);

  const effective = new Set<string>();
  for (const ur of user.roles) {
    for (const rp of ur.role.permissions) {
      effective.add(rp.permission.key);
    }
  }
  for (const up of user.permissions) {
    if (up.effect === "GRANT") effective.add(up.permission.key);
    else effective.delete(up.permission.key);
  }
  return effective;
});

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
});

export async function can(permissionKey: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const perms = await getEffectivePermissions(user.id);
  return perms.has(permissionKey);
}

/** Throws if the current user lacks the permission. Use at the top of every server action / route handler that mutates or reads gated data. */
export async function assertCan(permissionKey: string): Promise<{ id: string; name?: string | null; email?: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const perms = await getEffectivePermissions(user.id);
  if (!perms.has(permissionKey)) {
    throw new Error(`No autorizado: falta el permiso "${permissionKey}"`);
  }
  return user;
}

/** Like assertCan, but passes if the user holds ANY of the given permissions. */
export async function assertCanAny(permissionKeys: string[]): Promise<{ id: string; name?: string | null; email?: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const perms = await getEffectivePermissions(user.id);
  if (!permissionKeys.some((key) => perms.has(key))) {
    throw new Error(`No autorizado: falta alguno de los permisos "${permissionKeys.join(", ")}"`);
  }
  return user;
}

/** For server components that should redirect to login rather than throw. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
