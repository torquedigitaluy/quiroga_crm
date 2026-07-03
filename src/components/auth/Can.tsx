import type { ReactNode } from "react";
import { can } from "@/lib/permissions/engine";

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Server component that renders children only if the current user holds the permission. */
export async function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = await can(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
