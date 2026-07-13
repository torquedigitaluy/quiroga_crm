"use client";

import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { deleteGastoContadora } from "@/app/(app)/contadora/actions";

export function DeleteGastoButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteGastoContadora(id)}
      title="Eliminar gasto"
      description="¿Estás seguro que querés eliminar este gasto? Esta acción no se puede deshacer."
    />
  );
}
