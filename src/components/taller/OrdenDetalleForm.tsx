"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { centsToUnits } from "@/lib/money";
import { ESTADO_ORDEN_CONFIG, TIPO_SERVICIO_LABELS } from "./OrdenEstadoBadge";

export type OrdenDetalleData = {
  tipoServicio: string;
  estado: string;
  fechaIngreso: Date;
  fechaFinalizacion: Date | null;
  responsable: string | null;
  problema: string;
  trabajosRealizados: string | null;
  observaciones: string | null;
  manoDeObraCents: number;
};

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function OrdenDetalleForm({
  initial,
  editable,
  action,
}: {
  initial: OrdenDetalleData;
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
          <Label>Estado</Label>
          <Select name="estado" defaultValue={initial.estado}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ESTADO_ORDEN_CONFIG).map(([value, cfg]) => (
                <SelectItem key={value} value={value}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Tipo de servicio</Label>
          <Select name="tipoServicio" defaultValue={initial.tipoServicio}>
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
          <Label>Responsable</Label>
          <Select name="responsable" defaultValue={initial.responsable ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Marcial">Marcial</SelectItem>
              <SelectItem value="Leandro">Leandro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de ingreso</Label>
          <Input name="fechaIngreso" type="date" defaultValue={toDateInputValue(initial.fechaIngreso)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de finalización</Label>
          <Input name="fechaFinalizacion" type="date" defaultValue={toDateInputValue(initial.fechaFinalizacion)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Mano de obra ($)</Label>
          <Input name="manoDeObraCents" type="number" step="0.01" defaultValue={centsToUnits(initial.manoDeObraCents)} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-3">
          <Label>Problema / lo que tiene</Label>
          <Textarea name="problema" required rows={3} defaultValue={initial.problema} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-3">
          <Label>Trabajos realizados</Label>
          <Textarea name="trabajosRealizados" rows={3} defaultValue={initial.trabajosRealizados ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-3">
          <Label>Observaciones</Label>
          <Textarea name="observaciones" rows={3} defaultValue={initial.observaciones ?? ""} />
        </div>
      </fieldset>
      {error && <p className="text-sm text-danger">{error}</p>}
      {editable && (
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      )}
    </form>
  );
}
