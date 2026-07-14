"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPO_SERVICIO_LABELS } from "./OrdenEstadoBadge";

export function OrdenTallerForm({
  vehiculos,
  action,
}: {
  vehiculos: { id: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [origen, setOrigen] = useState<"stock" | "externo">("stock");
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
      <div className="flex flex-col gap-1.5">
        <Label>Vehículo</Label>
        <input type="hidden" name="origenVehiculo" value={origen} />
        <div className="flex gap-2">
          <Button type="button" variant={origen === "stock" ? "default" : "outline"} onClick={() => setOrigen("stock")}>
            De stock
          </Button>
          <Button type="button" variant={origen === "externo" ? "default" : "outline"} onClick={() => setOrigen("externo")}>
            Vehículo externo
          </Button>
        </div>
      </div>

      {origen === "stock" ? (
        <div className="flex flex-col gap-1.5">
          <Label>Elegí el vehículo</Label>
          <Select name="vehiculoId">
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
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>Identificación del vehículo externo</Label>
          <Input name="vehiculoExterno" placeholder="Ej: Toyota Corolla 2015, patente SBC 1234, cliente Juan Pérez" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Tipo de servicio</Label>
          <Select name="tipoServicio" defaultValue="MANTENIMIENTO">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_SERVICIO_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de ingreso</Label>
          <Input name="fechaIngreso" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Responsable</Label>
          <Select name="responsable">
            <SelectTrigger>
              <SelectValue placeholder="Elegí…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marcial">Marcial</SelectItem>
              <SelectItem value="Leandro">Leandro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Problema / lo que tiene</Label>
        <Textarea name="problema" required rows={4} placeholder="Describí lo que reportó el cliente o lo que presenta el vehículo" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Fotos (opcional)</Label>
        <input
          type="file"
          name="imagenes"
          accept="image/*"
          multiple
          className="text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
