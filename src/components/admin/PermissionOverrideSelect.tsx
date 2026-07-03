"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setPermissionOverride } from "@/app/(app)/admin/usuarios/actions";

export function PermissionOverrideSelect({
  userId,
  permissionId,
  current,
}: {
  userId: string;
  permissionId: string;
  current: "GRANT" | "REVOKE" | "INHERIT";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      defaultValue={current}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          await setPermissionOverride(userId, permissionId, value as "GRANT" | "REVOKE" | "INHERIT");
          router.refresh();
        })
      }
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="INHERIT">Heredado del rol</SelectItem>
        <SelectItem value="GRANT">Otorgado</SelectItem>
        <SelectItem value="REVOKE">Denegado</SelectItem>
      </SelectContent>
    </Select>
  );
}
