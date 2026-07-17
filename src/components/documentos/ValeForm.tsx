"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FinanciacionPropiaOption = {
  id: string;
  label: string;
  clienteNombre: string;
  clienteContacto: string;
  montoFinanciadoUsd: number;
  cantidadCuotas: number;
  montoCuotaUsd: number;
  diaVencimientoMensual: number;
  fechaPrimeraCuota: string | null;
};

export type ValeFormValues = {
  fecha: string;
  clienteNombre: string;
  clienteContacto: string;
  condiciones: string;
  montoFinanciadoUsdCents: string;
  cantidadCuotas: string;
  montoCuotaUsdCents: string;
  diaVencimientoMensual: string;
  fechaPrimeraCuota: string;
  observaciones: string;
  firmante1Nombre: string;
  firmante1Ci: string;
  firmante1Domicilio: string;
  firmante2Nombre: string;
  firmante2Ci: string;
  firmante2Domicilio: string;
};

const EMPTY: ValeFormValues = {
  fecha: new Date().toISOString().slice(0, 10),
  clienteNombre: "",
  clienteContacto: "",
  condiciones: "",
  montoFinanciadoUsdCents: "",
  cantidadCuotas: "",
  montoCuotaUsdCents: "",
  diaVencimientoMensual: "10",
  fechaPrimeraCuota: "",
  observaciones: "",
  firmante1Nombre: "",
  firmante1Ci: "",
  firmante1Domicilio: "",
  firmante2Nombre: "",
  firmante2Ci: "",
  firmante2Domicilio: "",
};

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
  const [planId, setPlanId] = useState(initialFinanciacionPropiaId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const update = (field: keyof ValeFormValues, value: string) => setValues((v) => ({ ...v, [field]: value }));

  const handleSelectPlan = (id: string) => {
    setPlanId(id);
    const plan = planes.find((p) => p.id === id);
    if (!plan) return;
    setValues((prev) => ({
      ...prev,
      clienteNombre: plan.clienteNombre,
      clienteContacto: plan.clienteContacto,
      montoFinanciadoUsdCents: String(plan.montoFinanciadoUsd),
      cantidadCuotas: String(plan.cantidadCuotas),
      montoCuotaUsdCents: String(plan.montoCuotaUsd),
      diaVencimientoMensual: String(plan.diaVencimientoMensual),
      fechaPrimeraCuota: plan.fechaPrimeraCuota ?? "",
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

      {planes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Precargar desde un plan de Financiación Propia (opcional)</Label>
          <Select value={planId} onValueChange={handleSelectPlan}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí un plan para completar los datos automáticamente" />
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
        <legend className="px-1 text-sm font-semibold text-foreground">Datos generales</legend>
        <Field label="Fecha" field="fecha" values={values} onChange={update} type="date" />
        <Field label="Cliente" field="clienteNombre" values={values} onChange={update} />
        <Field label="Contacto" field="clienteContacto" values={values} onChange={update} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Condiciones del plan</legend>
        <Field label="Monto financiado (US$)" field="montoFinanciadoUsdCents" values={values} onChange={update} type="number" />
        <Field label="Cantidad de cuotas" field="cantidadCuotas" values={values} onChange={update} type="number" />
        <Field label="Monto de cada cuota (US$)" field="montoCuotaUsdCents" values={values} onChange={update} type="number" />
        <Field label="Día de vencimiento mensual" field="diaVencimientoMensual" values={values} onChange={update} type="number" />
        <Field label="Fecha de la primera cuota" field="fechaPrimeraCuota" values={values} onChange={update} type="date" />
        <div className="flex flex-col gap-1.5 sm:col-span-3">
          <Label>Condiciones (texto libre)</Label>
          <Textarea
            name="condiciones"
            rows={5}
            value={values.condiciones}
            onChange={(e) => update("condiciones", e.target.value)}
            placeholder="Redacción de las condiciones del vale — se completa una sola vez con el texto definitivo."
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label>Observaciones</Label>
        <Textarea name="observaciones" rows={3} value={values.observaciones} onChange={(e) => update("observaciones", e.target.value)} />
      </div>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Responsable del pago 1</legend>
        <Field label="Nombre" field="firmante1Nombre" values={values} onChange={update} />
        <Field label="Cédula" field="firmante1Ci" values={values} onChange={update} />
        <Field label="Domicilio" field="firmante1Domicilio" values={values} onChange={update} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Responsable del pago 2</legend>
        <Field label="Nombre" field="firmante2Nombre" values={values} onChange={update} />
        <Field label="Cédula" field="firmante2Ci" values={values} onChange={update} />
        <Field label="Domicilio" field="firmante2Domicilio" values={values} onChange={update} />
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
