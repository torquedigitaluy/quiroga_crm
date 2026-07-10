"use client";

import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { deleteMovimiento } from "@/app/(app)/bancos/actions";

export function DeleteMovimientoButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      onConfirm={() => deleteMovimiento(id)}
      title="Eliminar movimiento"
      description="¿Estás seguro que querés eliminar este movimiento bancario? Esta acción no se puede deshacer."
    />
  );
}
