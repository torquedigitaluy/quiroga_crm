"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestoreButton({ onConfirm }: { onConfirm: () => void | Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await onConfirm();
          router.refresh();
        })
      }
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {pending ? "Restaurando…" : "Restaurar"}
    </Button>
  );
}
