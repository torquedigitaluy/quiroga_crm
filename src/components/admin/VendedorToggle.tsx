"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleUserEsVendedor } from "@/app/(app)/admin/usuarios/actions";

export function VendedorToggle({ userId, esVendedor }: { userId: string; esVendedor: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Checkbox
      checked={esVendedor}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await toggleUserEsVendedor(userId, checked === true);
          router.refresh();
        })
      }
    />
  );
}
