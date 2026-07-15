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
 * Botón de "eliminar" que en realidad archiva (soft delete): el registro
 * deja de aparecer en las listas normales pero queda recuperable desde el
 * histórico de cada módulo. Misma confirmación previa que un borrado real.
 */
export function ConfirmArchiveButton({
  onConfirm,
  title = "¿Eliminar este registro?",
  description = "Va a dejar de aparecer en la lista, pero no se pierde: queda guardado en el histórico y se puede restaurar en cualquier momento.",
  trigger,
  size = "sm",
}: {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  size?: "sm" | "default" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size={size}>
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
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
                router.refresh();
                setOpen(false);
              })
            }
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
