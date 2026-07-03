"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FinanciacionPropiaForm({
  vehiculos,
  action,
}: {
  vehiculos: { id: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
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
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre del cliente</Label>
          <Input name="clienteNombre" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Apellido</Label>
          <Input name="clienteApellido" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cédula</Label>
          <Input name="clienteCi" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Contacto</Label>
          <Input name="contacto" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Vehículo (opcional)</Label>
          <Select name="vehiculoId">
            <SelectTrigger>
              <SelectValue placeholder="Sin vehículo asociado" />
            </SelectTrigger>
            <SelectContent>
              {vehiculos.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto financiado (USD)</Label>
          <Input name="montoFinanciadoUsdCents" type="number" step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cantidad de cuotas</Label>
          <Input name="cantidadCuotas" type="number" min={1} max={60} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto de la cuota (USD)</Label>
          <Input name="montoCuotaUsdCents" type="number" step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de la 1ª cuota</Label>
          <Input name="fechaPrimeraCuota" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Día de vencimiento mensual</Label>
          <Input name="diaVencimientoMensual" type="number" min={1} max={28} defaultValue={10} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Crear plan de financiación"}
        </Button>
      </div>
    </form>
  );
}
