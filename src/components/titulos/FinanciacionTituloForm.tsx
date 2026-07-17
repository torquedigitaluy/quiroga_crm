"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FinanciacionTituloForm({
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
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Vehículo</Label>
          <Select name="vehiculoId" required>
            <SelectTrigger>
              <SelectValue placeholder="Elegí un vehículo" />
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
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de venta</Label>
          <Input name="fechaVenta" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de firma escribanía</Label>
          <Input name="fechaFirma" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Costo de títulos</Label>
          <Input name="costoEscribaniaCents" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Moneda</Label>
          <Select name="costoMoneda" defaultValue="USD">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="UYU">$ (UYU)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Forma de pago</Label>
          <Select name="formaPago" defaultValue="CONTADO">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONTADO">Contado</SelectItem>
              <SelectItem value="FINANCIADO">Financiado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 pt-6 sm:col-span-2">
          <div className="flex items-center gap-2">
            <Checkbox name="cartaDePago" />
            <Label>Carta de pago</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Si tiene carta de pago, se suman automáticamente $4.000 (pesos) al costo de los títulos.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Crear financiación de títulos"}
        </Button>
      </div>
    </form>
  );
}
