"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleUserActivo } from "@/app/(app)/admin/usuarios/actions";

export function ActivoToggle({ userId, activo }: { userId: string; activo: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Checkbox
      checked={activo}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await toggleUserActivo(userId, checked === true);
          router.refresh();
        })
      }
    />
  );
}
