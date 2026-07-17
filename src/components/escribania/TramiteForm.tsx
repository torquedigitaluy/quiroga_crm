"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TITULOS_CON_LABELS,
  TIPO_DOC_LABELS,
  COBRO_CLIENTE_LABELS,
  UBICACION_TITULOS_LABELS,
} from "./labels";

export type TramiteInitial = {
  id?: string;
  vehiculoId?: string;
  clienteNombre?: string;
  clienteApellido?: string;
  clienteCi?: string;
  clienteContacto?: string;
  fecha?: string | null;
  fechaFirma?: string | null;
  tipoDoc?: string;
  titulosCon?: string;
  pagoEscribaniaUnits?: number;
  pagoMoneda?: string;
  fechaPago?: string | null;
  cobroAlCliente?: string;
  cobroMontoUnits?: number;
  fechaCobro?: string | null;
  fechaEntregaTitulos?: string | null;
  ubicacionTitulos?: string;
  comentarios?: string | null;
};

export function TramiteForm({
  vehiculos,
  action,
  initial,
  submitLabel,
}: {
  vehiculos: { id: string; label: string }[];
  action: (formData: FormData) => Promise<void>;
  initial?: TramiteInitial;
  submitLabel?: string;
}) {
  const isEdit = Boolean(initial?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [vehiculoId, setVehiculoId] = useState<string>(initial?.vehiculoId ?? "");
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar el trámite");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Vehículo</Label>
          {isEdit ? (
            <>
              <Input value={vehiculos.find((v) => v.id === vehiculoId)?.label ?? ""} disabled readOnly />
              <input type="hidden" name="vehiculoId" value={vehiculoId} />
            </>
          ) : (
            <Select name="vehiculoId" required value={vehiculoId || undefined} onValueChange={setVehiculoId}>
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
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Nombre del cliente</Label>
          <Input name="clienteNombre" defaultValue={initial?.clienteNombre ?? ""} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Apellido</Label>
          <Input name="clienteApellido" defaultValue={initial?.clienteApellido ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cédula</Label>
          <Input name="clienteCi" defaultValue={initial?.clienteCi ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Contacto</Label>
          <Input name="clienteContacto" defaultValue={initial?.clienteContacto ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Fecha de seña</Label>
          <Input name="fecha" type="date" defaultValue={initial?.fecha ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de firma</Label>
          <Input name="fechaFirma" type="date" defaultValue={initial?.fechaFirma ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Tipo de documento</Label>
          <Select name="tipoDoc" defaultValue={initial?.tipoDoc ?? "CV"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_DOC_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Títulos con</Label>
          <Select name="titulosCon" defaultValue={initial?.titulosCon ?? "ANALIA"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TITULOS_CON_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Costo Escribanía</Label>
          <Input name="pagoEscribaniaCents" type="number" step="0.01" defaultValue={initial?.pagoEscribaniaUnits ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Moneda del cobro</Label>
          <Select name="pagoMoneda" defaultValue={initial?.pagoMoneda ?? "USD"}>
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
          <Label>Fecha de pago (opcional)</Label>
          <Input name="fechaPago" type="date" defaultValue={initial?.fechaPago ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Cobro al cliente</Label>
          <Select name="cobroAlCliente" defaultValue={initial?.cobroAlCliente ?? "CONTADO"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COBRO_CLIENTE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto cobrado</Label>
          <Input name="cobroMontoCents" type="number" step="0.01" defaultValue={initial?.cobroMontoUnits ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de cobro</Label>
          <Input name="fechaCobro" type="date" defaultValue={initial?.fechaCobro ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Fecha de entrega de títulos</Label>
          <Input name="fechaEntregaTitulos" type="date" defaultValue={initial?.fechaEntregaTitulos ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Ubicación de títulos</Label>
          <Select name="ubicacionTitulos" defaultValue={initial?.ubicacionTitulos ?? "CLIENTE"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UBICACION_TITULOS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Comentarios</Label>
          <Textarea name="comentarios" defaultValue={initial?.comentarios ?? ""} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel ?? "Guardar trámite"}
        </Button>
      </div>
    </form>
  );
}
