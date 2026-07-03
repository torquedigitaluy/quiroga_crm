"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGastoContadora } from "@/app/(app)/contadora/actions";

export function DeleteGastoButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      onClick={() => startTransition(async () => {
        await deleteGastoContadora(id);
        router.refresh();
      })}
    >
      <Trash2 className="h-4 w-4 text-danger" />
    </Button>
  );
}
