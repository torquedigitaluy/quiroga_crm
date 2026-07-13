"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AccesorioForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Categoría</Label>
          <Input name="marca" placeholder="Ej: Cargador, Rastreo…" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input name="modelo" placeholder="Ej: Con cable, Para pared…" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Precio (USD)</Label>
          <Input name="precioVentaUsdCents" type="number" step="0.01" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Comentarios</Label>
          <Textarea name="comentarios" />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Crear accesorio"}
        </Button>
      </div>
    </form>
  );
}
