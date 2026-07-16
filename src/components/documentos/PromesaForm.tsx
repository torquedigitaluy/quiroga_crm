"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type VentaOption = {
  id: string;
  label: string;
  vehMarca: string;
  vehModelo: string;
  vehAnio: number | null;
  vehColor: string | null;
  vehMatricula: string | null;
  vehMotor: string | null;
  vehChasis: string | null;
  clienteId: string | null;
  clienteNombre: string;
  clienteApellido: string;
  clienteCi: string;
  clienteContacto: string;
  clienteDomicilio: string;
};

export type PromesaFormValues = {
  vendedores: string;
  fecha: string;
  vehMarca: string;
  vehModelo: string;
  vehTipo: string;
  vehColor: string;
  vehAnio: string;
  vehMatricula: string;
  vehMotor: string;
  vehChasis: string;
  clienteNombre: string;
  clienteApellido: string;
  clienteCi: string;
  clienteDomicilio: string;
  clienteCiudad: string;
  clienteContacto: string;
  clienteEstadoCivil: string;
  clienteNombre2: string;
  clienteMail: string;
  financiaCon: string;
  senaUsdCents: string;
  pagoRetiroUnidadUsdCents: string;
  capitalFinanciadoUsdCents: string;
  conformesUsdCents: string;
  valorTomaAutoUsdCents: string;
  totalUsdCents: string;
  costoTitulosUsdCents: string;
  cartaPagoUsdCents: string;
  entregaCuentaTitulosUsdCents: string;
  aseguradora: string;
  cobertura: string;
  cesionANombreDe: string;
  observaciones: string;
  permutaMarca: string;
  permutaModelo: string;
  permutaTipo: string;
  permutaColor: string;
  permutaLlaves: string;
  permutaAnio: string;
  permutaMatricula: string;
  permutaMotor: string;
  permutaChasis: string;
};

const EMPTY: PromesaFormValues = {
  vendedores: "",
  fecha: new Date().toISOString().slice(0, 10),
  vehMarca: "",
  vehModelo: "",
  vehTipo: "",
  vehColor: "",
  vehAnio: "",
  vehMatricula: "",
  vehMotor: "",
  vehChasis: "",
  clienteNombre: "",
  clienteApellido: "",
  clienteCi: "",
  clienteDomicilio: "",
  clienteCiudad: "",
  clienteContacto: "",
  clienteEstadoCivil: "",
  clienteNombre2: "",
  clienteMail: "",
  financiaCon: "",
  senaUsdCents: "",
  pagoRetiroUnidadUsdCents: "",
  capitalFinanciadoUsdCents: "",
  conformesUsdCents: "",
  valorTomaAutoUsdCents: "",
  totalUsdCents: "",
  costoTitulosUsdCents: "",
  cartaPagoUsdCents: "",
  entregaCuentaTitulosUsdCents: "",
  aseguradora: "",
  cobertura: "",
  cesionANombreDe: "",
  observaciones: "",
  permutaMarca: "",
  permutaModelo: "",
  permutaTipo: "",
  permutaColor: "",
  permutaLlaves: "",
  permutaAnio: "",
  permutaMatricula: "",
  permutaMotor: "",
  permutaChasis: "",
};

function MoneyField({
  label,
  field,
  values,
  onChange,
}: {
  label: string;
  field: keyof PromesaFormValues;
  values: PromesaFormValues;
  onChange: (field: keyof PromesaFormValues, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label} (US$)</Label>
      <Input
        name={field}
        type="number"
        step="0.01"
        value={values[field]}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  );
}

function TextField({
  label,
  field,
  values,
  onChange,
  type = "text",
}: {
  label: string;
  field: keyof PromesaFormValues;
  values: PromesaFormValues;
  onChange: (field: keyof PromesaFormValues, value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input name={field} type={type} value={values[field]} onChange={(e) => onChange(field, e.target.value)} />
    </div>
  );
}

export function PromesaForm({
  ventas,
  initial,
  initialVentaId,
  initialClienteId,
  initialVehiculoId,
  initialFinancia,
  initialSeguro,
  initialCesion,
  action,
  submitLabel,
}: {
  ventas: VentaOption[];
  initial?: Partial<PromesaFormValues>;
  initialVentaId?: string | null;
  initialClienteId?: string | null;
  initialVehiculoId?: string | null;
  initialFinancia?: boolean;
  initialSeguro?: boolean;
  initialCesion?: boolean;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<PromesaFormValues>({ ...EMPTY, ...initial });
  const [ventaId, setVentaId] = useState(initialVentaId ?? "");
  const [clienteId, setClienteId] = useState(initialClienteId ?? "");
  const [vehiculoId, setVehiculoId] = useState(initialVehiculoId ?? "");
  const [financia, setFinancia] = useState(initialFinancia ?? false);
  const [seguro, setSeguro] = useState(initialSeguro ?? false);
  const [cesion, setCesion] = useState(initialCesion ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (field: keyof PromesaFormValues, value: string) => setValues((v) => ({ ...v, [field]: value }));

  const handleSelectVenta = (id: string) => {
    setVentaId(id);
    const v = ventas.find((x) => x.id === id);
    if (!v) return;
    setClienteId(v.clienteId ?? "");
    setVehiculoId(id !== v.id ? "" : v.id);
    setValues((prev) => ({
      ...prev,
      vehMarca: v.vehMarca,
      vehModelo: v.vehModelo,
      vehColor: v.vehColor ?? "",
      vehAnio: v.vehAnio != null ? String(v.vehAnio) : "",
      vehMatricula: v.vehMatricula ?? "",
      vehMotor: v.vehMotor ?? "",
      vehChasis: v.vehChasis ?? "",
      clienteNombre: v.clienteNombre,
      clienteApellido: v.clienteApellido,
      clienteCi: v.clienteCi,
      clienteContacto: v.clienteContacto,
      clienteDomicilio: v.clienteDomicilio,
    }));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="vehiculoId" value={vehiculoId} />

      {ventas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Precargar desde una venta (opcional)</Label>
          <Select value={ventaId} onValueChange={handleSelectVenta}>
            <SelectTrigger>
              <SelectValue placeholder="Elegí una venta para completar los datos automáticamente" />
            </SelectTrigger>
            <SelectContent>
              {ventas.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="ventaId" value={ventaId} />
        </div>
      )}

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Encabezado</legend>
        <TextField label="Fecha" field="fecha" values={values} onChange={update} type="date" />
        <TextField label="Vendedor/es" field="vendedores" values={values} onChange={update} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Promesa de Compra-Venta — Vehículo</legend>
        <TextField label="Marca" field="vehMarca" values={values} onChange={update} />
        <TextField label="Modelo" field="vehModelo" values={values} onChange={update} />
        <TextField label="Tipo" field="vehTipo" values={values} onChange={update} />
        <TextField label="Color" field="vehColor" values={values} onChange={update} />
        <TextField label="Año" field="vehAnio" values={values} onChange={update} type="number" />
        <TextField label="Matrícula" field="vehMatricula" values={values} onChange={update} />
        <TextField label="Motor" field="vehMotor" values={values} onChange={update} />
        <TextField label="Chasis" field="vehChasis" values={values} onChange={update} />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Cliente</legend>
        <TextField label="Nombre" field="clienteNombre" values={values} onChange={update} />
        <TextField label="Apellido" field="clienteApellido" values={values} onChange={update} />
        <TextField label="CI / RUT" field="clienteCi" values={values} onChange={update} />
        <TextField label="Domicilio" field="clienteDomicilio" values={values} onChange={update} />
        <TextField label="Ciudad" field="clienteCiudad" values={values} onChange={update} />
        <TextField label="Contacto" field="clienteContacto" values={values} onChange={update} />
        <TextField label="Estado Civil" field="clienteEstadoCivil" values={values} onChange={update} />
        <TextField label="Nombre" field="clienteNombre2" values={values} onChange={update} />
        <TextField label="Mail" field="clienteMail" values={values} onChange={update} type="email" />
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Condiciones de pago</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Financia</Label>
          <input type="hidden" name="financia" value={financia ? "true" : "false"} />
          <div className="flex gap-2">
            <Button type="button" variant={financia ? "default" : "outline"} onClick={() => setFinancia(true)}>
              Sí
            </Button>
            <Button type="button" variant={!financia ? "default" : "outline"} onClick={() => setFinancia(false)}>
              No
            </Button>
          </div>
        </div>
        {financia && <TextField label="Con" field="financiaCon" values={values} onChange={update} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MoneyField label="Seña" field="senaUsdCents" values={values} onChange={update} />
          <MoneyField label="Pago retiro unidad" field="pagoRetiroUnidadUsdCents" values={values} onChange={update} />
          <MoneyField label="Capital financiado" field="capitalFinanciadoUsdCents" values={values} onChange={update} />
          <MoneyField label="Conformes" field="conformesUsdCents" values={values} onChange={update} />
          <MoneyField label="Valor toma auto" field="valorTomaAutoUsdCents" values={values} onChange={update} />
          <MoneyField label="Total" field="totalUsdCents" values={values} onChange={update} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Documentación</legend>
        <MoneyField label="Costo de títulos" field="costoTitulosUsdCents" values={values} onChange={update} />
        <MoneyField label="Carta de pago" field="cartaPagoUsdCents" values={values} onChange={update} />
        <MoneyField label="Entrega a cuenta de títulos" field="entregaCuentaTitulosUsdCents" values={values} onChange={update} />
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Seguro</legend>
        <input type="hidden" name="seguro" value={seguro ? "true" : "false"} />
        <div className="flex gap-2">
          <Button type="button" variant={seguro ? "default" : "outline"} onClick={() => setSeguro(true)}>
            Sí
          </Button>
          <Button type="button" variant={!seguro ? "default" : "outline"} onClick={() => setSeguro(false)}>
            No
          </Button>
        </div>
        {seguro && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Aseguradora" field="aseguradora" values={values} onChange={update} />
            <TextField label="Cobertura" field="cobertura" values={values} onChange={update} />
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Cesión de derechos</legend>
        <input type="hidden" name="cesionDerechos" value={cesion ? "true" : "false"} />
        <div className="flex gap-2">
          <Button type="button" variant={cesion ? "default" : "outline"} onClick={() => setCesion(true)}>
            Sí
          </Button>
          <Button type="button" variant={!cesion ? "default" : "outline"} onClick={() => setCesion(false)}>
            No
          </Button>
        </div>
        {cesion && <TextField label="A nombre de" field="cesionANombreDe" values={values} onChange={update} />}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label>Observaciones</Label>
        <Textarea name="observaciones" rows={5} value={values.observaciones} onChange={(e) => update("observaciones", e.target.value)} />
      </div>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Vehículo que se permuta</legend>
        <TextField label="Marca" field="permutaMarca" values={values} onChange={update} />
        <TextField label="Modelo" field="permutaModelo" values={values} onChange={update} />
        <TextField label="Tipo" field="permutaTipo" values={values} onChange={update} />
        <TextField label="Color" field="permutaColor" values={values} onChange={update} />
        <TextField label="Llaves" field="permutaLlaves" values={values} onChange={update} />
        <TextField label="Año" field="permutaAnio" values={values} onChange={update} type="number" />
        <TextField label="Matrícula" field="permutaMatricula" values={values} onChange={update} />
        <TextField label="Motor" field="permutaMotor" values={values} onChange={update} />
        <TextField label="Chasis" field="permutaChasis" values={values} onChange={update} />
        <p className="text-xs text-muted-foreground sm:col-span-4">En caso de no tener dos llaves se retienen USD 200.</p>
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
