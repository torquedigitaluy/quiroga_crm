"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GastoTallerForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        const form = document.getElementById("gasto-taller-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form
      id="gasto-taller-form"
      action={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
    >
      <div className="flex w-36 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Fecha</label>
        <Input name="fecha" type="date" required />
      </div>
      <div className="flex flex-1 min-w-40 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Descripción</label>
        <Input name="detalle" placeholder="Ej: repuestos, mano de obra…" required />
      </div>
      <div className="flex w-32 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Monto $ (pesos)</label>
        <Input name="montoPesosCents" type="number" step="0.01" defaultValue={0} />
      </div>
      <div className="flex w-32 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Monto USD</label>
        <Input name="montoUsdCents" type="number" step="0.01" defaultValue={0} />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        Agregar gasto
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
