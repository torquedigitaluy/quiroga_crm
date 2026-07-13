"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Botón de eliminar con confirmación ("¿Estás seguro?"). Recibe la acción ya
 * ligada a su id. Por defecto es un ícono; con `triggerLabel` muestra texto.
 */
export function ConfirmDeleteButton({
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  triggerLabel,
  confirmLabel = "Eliminar",
  refresh = true,
  trigger,
}: {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  triggerLabel?: string;
  confirmLabel?: string;
  refresh?: boolean;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          triggerLabel ? (
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
              {triggerLabel}
            </Button>
          ) : (
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
                if (refresh) router.refresh();
                setOpen(false);
              })
            }
          >
            {pending ? "Eliminando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
