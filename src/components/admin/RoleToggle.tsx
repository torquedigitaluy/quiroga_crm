"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleUserRole } from "@/app/(app)/admin/usuarios/actions";

export function RoleToggle({ userId, roleId, assigned }: { userId: string; roleId: string; assigned: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Checkbox
      checked={assigned}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await toggleUserRole(userId, roleId, checked === true);
          router.refresh();
        })
      }
    />
  );
}
