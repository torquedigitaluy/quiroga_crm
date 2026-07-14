"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type AccesorioInitial = {
  marca: string;
  modelo: string;
  precioVentaUsdCents: number | null;
  comentarios: string | null;
};

export function AccesorioForm({
  action,
  initial,
  editable = true,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: AccesorioInitial;
  editable?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initial);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="esVehiculo" value="false" />
      <fieldset disabled={!editable} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Input name="marca" placeholder="Ej: Cargador, Rastreo…" defaultValue={initial?.marca} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input name="modelo" placeholder="Ej: Con cable, Para pared…" defaultValue={initial?.modelo} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Precio (USD)</Label>
          <Input
            name="precioVentaUsdCents"
            type="number"
            step="0.01"
            defaultValue={initial?.precioVentaUsdCents ? initial.precioVentaUsdCents / 100 : undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Comentarios</Label>
          <Textarea name="comentarios" defaultValue={initial?.comentarios ?? undefined} />
        </div>
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      {editable && (
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear accesorio"}
          </Button>
        </div>
      )}
    </form>
  );
}
