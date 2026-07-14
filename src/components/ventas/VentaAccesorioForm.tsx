"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AccesorioOption = { id: string; label: string };
export type VendedorOption = { id: string; label: string };

export function VentaAccesorioForm({
  accesorios,
  vendedores,
  defaultAccesorioId,
  action,
}: {
  accesorios: AccesorioOption[];
  vendedores: VendedorOption[];
  defaultAccesorioId?: string;
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
        setError(e instanceof Error ? e.message : "Error al registrar la venta");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Accesorio</Label>
          <Select name="accesorioId" required defaultValue={defaultAccesorioId}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí un accesorio del stock" />
            </SelectTrigger>
            <SelectContent>
              {accesorios.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Nombre del cliente (opcional)</Label>
          <Input name="clienteNombre" />
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
          <Input name="fecha" type="date" required />
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
          <Label>Precio de venta (USD)</Label>
          <Input name="precioVentaUsdCents" type="number" step="0.01" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Comisión por accesorio (USD)</Label>
          <Input name="comisionAccesorioUsdCents" type="number" step="0.01" defaultValue={0} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Registrar venta de accesorio"}
        </Button>
      </div>
    </form>
  );
}
