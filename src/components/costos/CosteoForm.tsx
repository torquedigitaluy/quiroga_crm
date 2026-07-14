"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToUnits, microsToRate } from "@/lib/money";

export type CosteoFormData = {
  tipoCambioMicros: number;
  fechaCompra: Date | null;
  fechaPublicacion: Date | null;
  fechaVenta: Date | null;
  precioCompraUsdCents: number;
  precioVentaRealUsdCents: number;
};

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function CosteoForm({
  initial,
  configRate,
  editable,
  action,
}: {
  initial: CosteoFormData;
  configRate: number;
  editable: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <fieldset disabled={!editable} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Tipo de cambio (U$D → $)</Label>
          <Input
            name="tipoCambio"
            type="number"
            step="0.01"
            defaultValue={initial.tipoCambioMicros > 0 ? microsToRate(initial.tipoCambioMicros) : ""}
            placeholder={`Global: ${configRate.toFixed(2)}`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de compra</Label>
          <Input name="fechaCompra" type="date" defaultValue={toDateInputValue(initial.fechaCompra)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de publicación</Label>
          <Input name="fechaPublicacion" type="date" defaultValue={toDateInputValue(initial.fechaPublicacion)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de venta</Label>
          <Input name="fechaVenta" type="date" defaultValue={toDateInputValue(initial.fechaVenta)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Precio de compra (USD)</Label>
          <Input
            name="precioCompraUsdCents"
            type="number"
            step="0.01"
            defaultValue={centsToUnits(initial.precioCompraUsdCents)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Precio de venta real (USD)</Label>
          <Input
            name="precioVentaRealUsdCents"
            type="number"
            step="0.01"
            defaultValue={centsToUnits(initial.precioVentaRealUsdCents)}
          />
        </div>
      </fieldset>
      {error && <p className="text-sm text-danger">{error}</p>}
      {editable && (
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar costeo"}
          </Button>
        </div>
      )}
    </form>
  );
}
