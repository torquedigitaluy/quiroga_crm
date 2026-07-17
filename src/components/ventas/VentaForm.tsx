"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCAL_VENTA_OPTIONS } from "@/lib/venta-labels";

export type VehiculoOption = { id: string; label: string; propietario?: string | null };
export type VendedorOption = { id: string; label: string };

export type VentaInitial = {
  id?: string;
  vehiculoId?: string;
  vehiculoExterno?: string | null;
  clienteNombre?: string;
  clienteApellido?: string;
  clienteCi?: string;
  clienteContacto?: string;
  fechaSena?: string | null;
  senaUsd?: number;
  fechaEntrega?: string | null;
  precioVentaUsd?: number;
  vendedorId?: string | null;
  localVenta?: string;
  comisionVentaUsd?: number;
  comisionTituloUsd?: number;
};

export function VentaForm({
  vehiculos,
  vendedores,
  action,
  initial,
  submitLabel,
  vendedorFijo,
}: {
  vehiculos: VehiculoOption[];
  vendedores: VendedorOption[];
  action: (formData: FormData) => Promise<void>;
  initial?: VentaInitial;
  submitLabel?: string;
  /** Si viene seteado, un vendedor está registrando su propia venta: el campo queda fijo, no editable. */
  vendedorFijo?: { id: string; label: string };
}) {
  const isEdit = Boolean(initial?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [origen, setOrigen] = useState<"stock" | "externo">(
    !initial?.vehiculoId && initial?.vehiculoExterno ? "externo" : "stock",
  );
  const [vehiculoId, setVehiculoId] = useState<string>(initial?.vehiculoId ?? "");
  const [vehiculoExterno, setVehiculoExterno] = useState<string>(initial?.vehiculoExterno ?? "");
  const router = useRouter();

  const propietarioSel = vehiculos.find((v) => v.id === vehiculoId)?.propietario ?? null;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar la venta");
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
              <Input
                value={origen === "stock" ? (vehiculos.find((v) => v.id === vehiculoId)?.label ?? "") : vehiculoExterno}
                disabled
                readOnly
              />
              <input type="hidden" name="vehiculoId" value={vehiculoId} />
              <input type="hidden" name="vehiculoExterno" value={vehiculoExterno} />
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Button type="button" variant={origen === "stock" ? "default" : "outline"} onClick={() => setOrigen("stock")}>
                  De stock
                </Button>
                <Button type="button" variant={origen === "externo" ? "default" : "outline"} onClick={() => setOrigen("externo")}>
                  Vehículo externo
                </Button>
              </div>
              {origen === "stock" ? (
                <Select name="vehiculoId" value={vehiculoId || undefined} onValueChange={setVehiculoId}>
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
              ) : (
                <Input
                  name="vehiculoExterno"
                  placeholder="Ej: Toyota Corolla 2015, matrícula ABC 1234"
                  value={vehiculoExterno}
                  onChange={(e) => setVehiculoExterno(e.target.value)}
                />
              )}
            </>
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
          <Input name="fechaSena" type="date" defaultValue={initial?.fechaSena ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto de la seña (USD)</Label>
          <Input name="senaUsdCents" type="number" step="0.01" defaultValue={initial?.senaUsd ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de entrega</Label>
          <Input name="fechaEntrega" type="date" defaultValue={initial?.fechaEntrega ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Precio de venta (USD)</Label>
          <Input name="precioVentaUsdCents" type="number" step="0.01" defaultValue={initial?.precioVentaUsd ?? ""} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Local donde se vendió</Label>
          <Select name="localVenta" defaultValue={initial?.localVenta ?? "ZONAMERICA"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCAL_VENTA_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Vendedor</Label>
          {vendedorFijo ? (
            <>
              <Input value={vendedorFijo.label} disabled readOnly />
              <input type="hidden" name="vendedorId" value={vendedorFijo.id} />
            </>
          ) : (
            <Select name="vendedorId" defaultValue={initial?.vendedorId ?? undefined}>
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
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Propietario del vehículo</Label>
          {origen === "externo" && !isEdit ? (
            <Input name="propietarioVehiculo" placeholder="Nombre del propietario" />
          ) : (
            <>
              <Input value={propietarioSel ?? "—"} disabled readOnly />
              <p className="text-xs text-muted-foreground">Se toma automáticamente del stock.</p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Comisión de venta (USD)</Label>
          <Input name="comisionVentaUsdCents" type="number" step="0.01" defaultValue={initial?.comisionVentaUsd ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Comisión por título (USD)</Label>
          <Input name="comisionTituloUsdCents" type="number" step="0.01" defaultValue={initial?.comisionTituloUsd ?? 0} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel ?? "Registrar venta"}
        </Button>
      </div>
    </form>
  );
}
