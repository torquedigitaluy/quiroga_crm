"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { numeroALetras } from "@/lib/numeroALetras";

export type ConformeInitial = {
  montoUnits?: string;
  montoEnLetras?: string;
  fechaVencimiento?: string;
  fechaPago?: string;
  acreedorNombre?: string;
  acreedorCi?: string;
  numeroFactura?: string;
  concepto?: string;
  fechaFactura?: string;
  deudorNombre?: string;
  deudorCedula?: string;
  deudorDomicilio?: string;
  deudorDepartamentoDireccion?: string;
  deudorTelefono?: string;
  estado?: string;
};

export function ConformeForm({
  initial,
  action,
  submitLabel = "Generar conforme",
}: {
  initial?: ConformeInitial;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [monto, setMonto] = useState(initial?.montoUnits ?? "");
  const [montoEnLetras, setMontoEnLetras] = useState(initial?.montoEnLetras ?? "");
  const [estado, setEstado] = useState(initial?.estado ?? "PAGADO");
  const router = useRouter();

  // El monto en letras se completa solo a partir del importe, pero queda editable.
  const handleMonto = (v: string) => {
    setMonto(v);
    const n = parseInt(v, 10);
    setMontoEnLetras(Number.isNaN(n) ? "" : numeroALetras(n));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar el conforme");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Encabezado</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Por U$S</Label>
          <Input name="montoCents" type="number" step="1" value={monto} onChange={(e) => handleMonto(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de vencimiento</Label>
          <Input name="fechaVencimiento" type="date" defaultValue={initial?.fechaVencimiento ?? ""} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Estado</Label>
          <input type="hidden" name="estado" value={estado} />
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="PAGADO">Pagado</SelectItem>
              <SelectItem value="VENCIDO">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-3">
          <Label>Conforme por la cantidad de dólares americanos (monto en letras)</Label>
          <Input
            name="montoEnLetras"
            value={montoEnLetras}
            onChange={(e) => setMontoEnLetras(e.target.value)}
            placeholder="Se completa automáticamente desde el importe"
          />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del texto</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Acreedor — Nombre</Label>
          <Input name="acreedorNombre" defaultValue={initial?.acreedorNombre ?? "JORGE DANIEL QUIROGA SANABRIA"} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Acreedor — CI</Label>
          <Input name="acreedorCi" defaultValue={initial?.acreedorCi ?? "3.283.578-8"} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de pago</Label>
          <Input name="fechaPago" type="date" defaultValue={initial?.fechaPago ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Número de factura</Label>
          <Input name="numeroFactura" defaultValue={initial?.numeroFactura ?? ""} placeholder="Ej: 000123" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Concepto</Label>
          <Input name="concepto" defaultValue={initial?.concepto ?? "COMPRA VENTA AUTOMOTOR"} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de factura</Label>
          <Input name="fechaFactura" type="date" defaultValue={initial?.fechaFactura ?? ""} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del deudor</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Nombre y apellidos</Label>
          <Input name="deudorNombre" defaultValue={initial?.deudorNombre ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cédula</Label>
          <Input name="deudorCedula" defaultValue={initial?.deudorCedula ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Domicilio</Label>
          <Input name="deudorDomicilio" defaultValue={initial?.deudorDomicilio ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Departamento y dirección</Label>
          <Input name="deudorDepartamentoDireccion" defaultValue={initial?.deudorDepartamentoDireccion ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Teléfono</Label>
          <Input name="deudorTelefono" defaultValue={initial?.deudorTelefono ?? ""} />
        </div>
      </fieldset>

      <p className="text-xs text-muted-foreground">
        Las firmas (Firma / Contrafirma) quedan en blanco en el PDF para firmar a mano una vez impreso.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
