"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreditoBBVAForm({
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
          <Label>Nombre</Label>
          <Input name="nombre" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cédula</Label>
          <Input name="ci" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto solicitado (USD)</Label>
          <Input name="montoSolicitadoUsdCents" type="number" step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de firma con el banco</Label>
          <Input name="fechaFirma" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Estado</Label>
          <Select name="estado" defaultValue="PENDIENTE">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="APROBADO">Aprobado</SelectItem>
              <SelectItem value="RECHAZADO">Rechazado</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar crédito"}
        </Button>
      </div>
    </form>
  );
}
