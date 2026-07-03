"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type VehiculoOption = { id: string; label: string };
export type VendedorOption = { id: string; label: string };

export function VentaForm({
  vehiculos,
  vendedores,
  action,
}: {
  vehiculos: VehiculoOption[];
  vendedores: VendedorOption[];
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
        setError(e instanceof Error ? e.message : "Error al guardar la venta");
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
              <SelectValue placeholder="Elegí un vehículo del stock" />
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
          <Label>Fecha de seña</Label>
          <Input name="fechaSena" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto de la seña (USD)</Label>
          <Input name="senaUsdCents" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de entrega</Label>
          <Input name="fechaEntrega" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Precio de venta (USD)</Label>
          <Input name="precioVentaUsdCents" type="number" step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Local donde se vendió</Label>
          <Select name="localVenta" defaultValue="ZONAMERICA">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAN_LUIS">San Luis</SelectItem>
              <SelectItem value="ZONAMERICA">Zonamérica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Vendedor</Label>
          <Select name="vendedorId">
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              {vendedores.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Propietario del vehículo</Label>
          <Input name="propietarioVehiculo" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Comisión de venta (USD)</Label>
          <Input name="comisionVentaUsdCents" type="number" step="0.01" defaultValue={0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Comisión por título (USD)</Label>
          <Input name="comisionTituloUsdCents" type="number" step="0.01" defaultValue={0} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Registrar venta"}
        </Button>
      </div>
    </form>
  );
}
