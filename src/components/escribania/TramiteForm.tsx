"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TITULOS_CON_LABELS,
  TIPO_DOC_LABELS,
  COBRO_CLIENTE_LABELS,
  UBICACION_TITULOS_LABELS,
} from "./labels";

export function TramiteForm({
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
        setError(e instanceof Error ? e.message : "Error al guardar el trámite");
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
          <Input name="clienteContacto" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Fecha</Label>
          <Input name="fecha" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de firma</Label>
          <Input name="fechaFirma" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Tipo de documento</Label>
          <Select name="tipoDoc" defaultValue="CV">
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
          <Select name="titulosCon" defaultValue="ANALIA">
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
          <Label>Pago a escribanía</Label>
          <Input name="pagoEscribaniaCents" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Moneda del pago</Label>
          <Select name="pagoMoneda" defaultValue="USD">
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
          <Label>Fecha de pago</Label>
          <Input name="fechaPago" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Cobro al cliente</Label>
          <Select name="cobroAlCliente" defaultValue="CONTADO">
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
          <Input name="cobroMontoCents" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de cobro</Label>
          <Input name="fechaCobro" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Fecha de entrega de títulos</Label>
          <Input name="fechaEntregaTitulos" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Ubicación de títulos</Label>
          <Select name="ubicacionTitulos" defaultValue="CLIENTE">
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
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar trámite"}
        </Button>
      </div>
    </form>
  );
}
