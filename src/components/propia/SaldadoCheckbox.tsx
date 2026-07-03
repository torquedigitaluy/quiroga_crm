"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { marcarDeudaSaldada } from "@/app/(app)/propia/actions";

export function SaldadoCheckbox({ id, saldado, editable }: { id: string; saldado: boolean; editable: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Checkbox
      checked={saldado}
      disabled={!editable || pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await marcarDeudaSaldada(id, checked === true);
          router.refresh();
        })
      }
    />
  );
}
