"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { centsToUnits } from "@/lib/money";
import { ESTADO_ORDEN_CONFIG, ESTADO_ORDEN_OPTIONS } from "./OrdenEstadoBadge";

const TIPOS_SERVICIO = [
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "DIAGNOSTICO", label: "Diagnóstico" },
  { value: "REPARACION", label: "Reparación" },
  { value: "OTRO", label: "Otros" },
];

export type OrdenDetalleData = {
  estado: string;
  prioridad: string;
  tiposServicio: string[];
  tipoServicioOtro: string | null;
  fechaIngreso: Date;
  fechaFinalizacion: Date | null;
  responsable: string | null;
  tecnicoResponsableId: string | null;
  problema: string;
  trabajosRealizados: string | null;
  observaciones: string | null;
  manoDeObraCents: number;
  vehMarca: string | null;
  vehModelo: string | null;
  vehVersion: string | null;
  vehAnio: number | null;
  vehColor: string | null;
  vehMatricula: string | null;
  vehKm: number | null;
  vehChasis: string | null;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  clienteDireccion: string | null;
};

function toDateTimeInputValue(d: Date | null): string {
  if (!d) return "";
  const date = new Date(d);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function OrdenDetalleForm({
  initial,
  editable,
  tecnicos,
  action,
}: {
  initial: OrdenDetalleData;
  editable: boolean;
  tecnicos: { id: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(initial.tiposServicio);
  const router = useRouter();

  const toggleTipo = (value: string) => {
    setTiposSeleccionados((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

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
      <fieldset disabled={!editable} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select name="estado" defaultValue={initial.estado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_ORDEN_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ESTADO_ORDEN_CONFIG[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Prioridad</Label>
            <Select name="prioridad" defaultValue={initial.prioridad}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAJA">Baja</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Técnico responsable</Label>
            <Select name="tecnicoResponsableId" defaultValue={initial.tecnicoResponsableId ?? undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí…" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Tipo de servicio</Label>
          <div className="flex flex-wrap gap-4">
            {TIPOS_SERVICIO.map((t) => (
              <label key={t.value} className="flex items-center gap-2 text-sm">
                <Checkbox checked={tiposSeleccionados.includes(t.value)} onCheckedChange={() => toggleTipo(t.value)} />
                {t.label}
                {tiposSeleccionados.includes(t.value) && <input type="hidden" name="tiposServicio" value={t.value} />}
              </label>
            ))}
          </div>
          {tiposSeleccionados.includes("OTRO") && (
            <Input name="tipoServicioOtro" placeholder="Especificar servicio" defaultValue={initial.tipoServicioOtro ?? ""} className="mt-2" />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label>Fecha y hora de inicio</Label>
            <Input name="fechaIngreso" type="datetime-local" defaultValue={toDateTimeInputValue(initial.fechaIngreso)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Fecha y hora de finalización</Label>
            <Input name="fechaFinalizacion" type="datetime-local" defaultValue={toDateTimeInputValue(initial.fechaFinalizacion)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Mano de obra ($)</Label>
            <Input name="manoDeObraCents" type="number" step="0.01" defaultValue={centsToUnits(initial.manoDeObraCents)} />
          </div>
        </div>

        <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
          <legend className="px-1 text-sm font-semibold text-foreground">Datos del vehículo</legend>
          <div className="flex flex-col gap-1.5">
            <Label>Marca</Label>
            <Input name="vehMarca" defaultValue={initial.vehMarca ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Modelo</Label>
            <Input name="vehModelo" defaultValue={initial.vehModelo ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Versión</Label>
            <Input name="vehVersion" defaultValue={initial.vehVersion ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Año</Label>
            <Input name="vehAnio" type="number" defaultValue={initial.vehAnio ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <Input name="vehColor" defaultValue={initial.vehColor ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Matrícula / Patente</Label>
            <Input name="vehMatricula" defaultValue={initial.vehMatricula ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Kilómetros</Label>
            <Input name="vehKm" type="number" defaultValue={initial.vehKm ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>N° de Chasis</Label>
            <Input name="vehChasis" defaultValue={initial.vehChasis ?? ""} />
          </div>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
          <legend className="px-1 text-sm font-semibold text-foreground">Datos del cliente</legend>
          <div className="flex flex-col gap-1.5">
            <Label>Cliente</Label>
            <Input name="clienteNombre" defaultValue={initial.clienteNombre ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Teléfono</Label>
            <Input name="clienteTelefono" defaultValue={initial.clienteTelefono ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Dirección</Label>
            <Input name="clienteDireccion" defaultValue={initial.clienteDireccion ?? ""} />
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Label>Problema / lo que tiene</Label>
          <Textarea name="problema" required rows={3} defaultValue={initial.problema} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Trabajos realizados</Label>
          <Textarea name="trabajosRealizados" rows={3} defaultValue={initial.trabajosRealizados ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
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
