"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { numeroALetras } from "@/lib/numeroALetras";

export type FinanciacionPropiaOption = {
  id: string;
  label: string;
  clienteNombre: string;
  clienteContacto: string;
  cantidadCuotas: number;
  diaVencimientoMensual: number;
};

export type ValeFormValues = {
  fecha: string;
  clienteNombre: string;
  clienteContacto: string;
  moneda: string;
  totalPesosCents: string;
  totalEnLetras: string;
  capitalPrestadoPesosCents: string;
  acreedores: string;
  cantidadCuotas: string;
  montoCuotaPesosCents: string;
  montoCuotaEnLetras: string;
  diaVencimientoMensual: string;
  firmante1Nombre: string;
  firmante1Ci: string;
  firmante1Domicilio: string;
  firmante2Nombre: string;
  firmante2Ci: string;
  firmante2Domicilio: string;
  firmante3Nombre: string;
  firmante3Ci: string;
  firmante3Domicilio: string;
};

const ACREEDORES_DEFAULT =
  "Georgina Villegas Castro, CI 4.785.148-0 y Jorge Daniel Quiroga Sanabria, CI 3.283.578-8";

const EMPTY: ValeFormValues = {
  fecha: new Date().toISOString().slice(0, 10),
  clienteNombre: "",
  clienteContacto: "",
  moneda: "UYU",
  totalPesosCents: "",
  totalEnLetras: "",
  capitalPrestadoPesosCents: "",
  acreedores: ACREEDORES_DEFAULT,
  cantidadCuotas: "36",
  montoCuotaPesosCents: "",
  montoCuotaEnLetras: "",
  diaVencimientoMensual: "10",
  firmante1Nombre: "",
  firmante1Ci: "",
  firmante1Domicilio: "",
  firmante2Nombre: "",
  firmante2Ci: "",
  firmante2Domicilio: "",
  firmante3Nombre: "",
  firmante3Ci: "",
  firmante3Domicilio: "",
};

function letras(pesosStr: string): string {
  const n = parseInt(pesosStr, 10);
  return Number.isNaN(n) ? "" : numeroALetras(n).toLowerCase();
}

function Field({
  label,
  field,
  values,
  onChange,
  type = "text",
}: {
  label: string;
  field: keyof ValeFormValues;
  values: ValeFormValues;
  onChange: (field: keyof ValeFormValues, value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input name={field} type={type} value={values[field]} onChange={(e) => onChange(field, e.target.value)} />
    </div>
  );
}

export function ValeForm({
  planes,
  initial,
  initialFinanciacionPropiaId,
  action,
  submitLabel,
}: {
  planes: FinanciacionPropiaOption[];
  initial?: Partial<ValeFormValues>;
  initialFinanciacionPropiaId?: string | null;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<ValeFormValues>({ ...EMPTY, ...initial });
  const [moneda, setMoneda] = useState(initial?.moneda ?? "UYU");
  const [planId, setPlanId] = useState(initialFinanciacionPropiaId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Al cambiar el importe total o el de cuota, se completa el monto en letras.
  const update = (field: keyof ValeFormValues, value: string) =>
    setValues((v) => {
      const next = { ...v, [field]: value };
      if (field === "totalPesosCents") next.totalEnLetras = letras(value);
      if (field === "montoCuotaPesosCents") next.montoCuotaEnLetras = letras(value);
      return next;
    });

  const handleSelectPlan = (id: string) => {
    setPlanId(id);
    const plan = planes.find((p) => p.id === id);
    if (!plan) return;
    setValues((prev) => ({
      ...prev,
      clienteNombre: plan.clienteNombre,
      clienteContacto: plan.clienteContacto,
      cantidadCuotas: String(plan.cantidadCuotas),
      diaVencimientoMensual: String(plan.diaVencimientoMensual),
      firmante1Nombre: prev.firmante1Nombre || plan.clienteNombre,
    }));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="financiacionPropiaId" value={planId} />
      <input type="hidden" name="clienteNombre" value={values.clienteNombre} />
      <input type="hidden" name="clienteContacto" value={values.clienteContacto} />

      {planes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Precargar desde un plan de Financiación Propia (opcional)</Label>
          <Select value={planId} onValueChange={handleSelectPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí un plan para completar cuotas y cliente" />
            </SelectTrigger>
            <SelectContent>
              {planes.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Importes</legend>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Moneda</Label>
          <input type="hidden" name="moneda" value={moneda} />
          <Select value={moneda} onValueChange={setMoneda}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UYU">$ (pesos)</SelectItem>
              <SelectItem value="USD">USD (dólares)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label="Total" field="totalPesosCents" values={values} onChange={update} type="number" />
        <div className="flex flex-col gap-1.5">
          <Label>Total en letras</Label>
          <Input
            name="totalEnLetras"
            value={values.totalEnLetras}
            onChange={(e) => update("totalEnLetras", e.target.value)}
            placeholder="Se completa solo desde el total"
          />
        </div>
        <Field label="Capital prestado" field="capitalPrestadoPesosCents" values={values} onChange={update} type="number" />
        <Field label="Monto de cada cuota" field="montoCuotaPesosCents" values={values} onChange={update} type="number" />
        <div className="flex flex-col gap-1.5">
          <Label>Cuota en letras</Label>
          <Input
            name="montoCuotaEnLetras"
            value={values.montoCuotaEnLetras}
            onChange={(e) => update("montoCuotaEnLetras", e.target.value)}
            placeholder="Se completa solo desde la cuota"
          />
        </div>
        <Field label="Cantidad de cuotas" field="cantidadCuotas" values={values} onChange={update} type="number" />
        <Field label="Día de vencimiento mensual" field="diaVencimientoMensual" values={values} onChange={update} type="number" />
        <Field label="Fecha del documento" field="fecha" values={values} onChange={update} type="date" />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Acreedores</legend>
        <div className="flex flex-col gap-1.5">
          <Label>A la orden de</Label>
          <Textarea name="acreedores" rows={2} value={values.acreedores} onChange={(e) => update("acreedores", e.target.value)} />
        </div>
      </fieldset>

      {([1, 2, 3] as const).map((n) => (
        <fieldset key={n} className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
          <legend className="px-1 text-sm font-semibold text-foreground">Firmante {n} (opcional)</legend>
          <Field label="Nombre" field={`firmante${n}Nombre` as keyof ValeFormValues} values={values} onChange={update} />
          <Field label="C.I / R.U.T" field={`firmante${n}Ci` as keyof ValeFormValues} values={values} onChange={update} />
          <Field label="Domicilio" field={`firmante${n}Domicilio` as keyof ValeFormValues} values={values} onChange={update} />
        </fieldset>
      ))}

      <p className="text-xs text-muted-foreground">
        Las firmas quedan en blanco en el PDF para firmar a mano una vez impreso.
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
