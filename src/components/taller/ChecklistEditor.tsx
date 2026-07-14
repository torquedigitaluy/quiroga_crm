"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

export type ChecklistItemData = { id: string; tarea: string; hecho: boolean };

export function ChecklistEditor({
  items,
  editable,
  onToggle,
  onAdd,
  onDelete,
}: {
  items: ChecklistItemData[];
  editable: boolean;
  onToggle: (itemId: string, hecho: boolean) => Promise<void>;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = (itemId: string, hecho: boolean) => {
    startTransition(async () => {
      try {
        await onToggle(itemId, hecho);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al actualizar");
      }
    });
  };

  const handleAdd = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onAdd(formData);
        router.refresh();
        const form = document.getElementById("checklist-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al agregar la tarea");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
          <label className="flex flex-1 items-center gap-2 text-sm">
            <Checkbox
              checked={item.hecho}
              disabled={!editable || pending}
              onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
            />
            <span className={item.hecho ? "text-muted-foreground line-through" : "text-foreground"}>{item.tarea}</span>
          </label>
          {editable && (
            <ConfirmDeleteButton
              onConfirm={() => onDelete(item.id)}
              title="Eliminar tarea"
              description="¿Estás seguro que querés eliminar esta tarea del checklist?"
            />
          )}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">Sin tareas en el checklist todavía.</p>}

      {editable && (
        <form id="checklist-add-form" action={handleAdd} className="flex items-end gap-2 pt-1">
          <Input name="tarea" placeholder="Agregar tarea…" className="flex-1" />
          <Button type="submit" variant="outline" disabled={pending}>
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </form>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
