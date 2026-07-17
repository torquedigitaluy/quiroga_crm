"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

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

export type VehiculoStockOption = {
  id: string;
  label: string;
  vehMarca: string;
  vehModelo: string;
  vehTipo: string | null;
  vehColor: string | null;
  vehAnio: number | null;
  vehMatricula: string | null;
  vehMotor: string | null;
  vehChasis: string | null;
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
  conformesCantidadCuotas: string;
  conformesCuotaUsdCents: string;
  valorTomaAutoUsdCents: string;
  totalUsdCents: string;
  costoTitulosUsdCents: string;
  costoTitulosMoneda: string;
  cartaPagoUsdCents: string;
  cartaPagoMoneda: string;
  entregaCuentaTitulosUsdCents: string;
  entregaCuentaTitulosMoneda: string;
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
  conformesCantidadCuotas: "",
  conformesCuotaUsdCents: "",
  valorTomaAutoUsdCents: "",
  totalUsdCents: "",
  costoTitulosUsdCents: "",
  costoTitulosMoneda: "USD",
  cartaPagoUsdCents: "",
  cartaPagoMoneda: "USD",
  entregaCuentaTitulosUsdCents: "",
  entregaCuentaTitulosMoneda: "USD",
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

function MoneyMonedaField({
  label,
  name,
  monedaName,
  value,
  onChange,
  moneda,
  setMoneda,
}: {
  label: string;
  name: string;
  monedaName: string;
  value: string;
  onChange: (value: string) => void;
  moneda: string;
  setMoneda: (m: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input name={name} type="number" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="hidden" name={monedaName} value={moneda} />
        <Select value={moneda} onValueChange={setMoneda}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UYU">$</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
  vehiculosStock = [],
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
  vehiculosStock?: VehiculoStockOption[];
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
  const [origenVeh, setOrigenVeh] = useState<"stock" | "externo">(initialVehiculoId ? "stock" : "externo");
  const [costoMoneda, setCostoMoneda] = useState(initial?.costoTitulosMoneda ?? "USD");
  const [cartaMoneda, setCartaMoneda] = useState(initial?.cartaPagoMoneda ?? "USD");
  const [entregaMoneda, setEntregaMoneda] = useState(initial?.entregaCuentaTitulosMoneda ?? "USD");
  const [financia, setFinancia] = useState(initialFinancia ?? false);
  const [seguro, setSeguro] = useState(initialSeguro ?? false);
  const [cesion, setCesion] = useState(initialCesion ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (field: keyof PromesaFormValues, value: string) => setValues((v) => ({ ...v, [field]: value }));

  const EMPTY_VEH = { vehMarca: "", vehModelo: "", vehTipo: "", vehColor: "", vehAnio: "", vehMatricula: "", vehMotor: "", vehChasis: "" };

  const handleOrigenVeh = (nuevo: "stock" | "externo") => {
    setOrigenVeh(nuevo);
    setVehiculoId("");
    setValues((prev) => ({ ...prev, ...EMPTY_VEH }));
  };

  const handleSelectVehiculoStock = (id: string) => {
    setVehiculoId(id);
    const v = vehiculosStock.find((x) => x.id === id);
    if (!v) return;
    setValues((prev) => ({
      ...prev,
      vehMarca: v.vehMarca,
      vehModelo: v.vehModelo,
      vehTipo: v.vehTipo ?? "",
      vehColor: v.vehColor ?? "",
      vehAnio: v.vehAnio != null ? String(v.vehAnio) : "",
      vehMatricula: v.vehMatricula ?? "",
      vehMotor: v.vehMotor ?? "",
      vehChasis: v.vehChasis ?? "",
    }));
  };

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
        rethrowIfNextControlFlow(e);
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

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <Label>Vehículo</Label>
        <div className="flex gap-2">
          <Button type="button" variant={origenVeh === "stock" ? "default" : "outline"} onClick={() => handleOrigenVeh("stock")}>
            De stock
          </Button>
          <Button type="button" variant={origenVeh === "externo" ? "default" : "outline"} onClick={() => handleOrigenVeh("externo")}>
            Vehículo externo
          </Button>
        </div>
        {origenVeh === "stock" ? (
          <div className="flex flex-col gap-1.5">
            <Label>Elegí el vehículo de stock</Label>
            <Select value={vehiculoId || undefined} onValueChange={handleSelectVehiculoStock}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehiculosStock.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Cargá los datos del vehículo manualmente en los campos de abajo.</p>
        )}
      </div>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del vehículo</legend>
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
          <div className="flex flex-col gap-1.5 sm:col-span-3">
            <Label>Conformes</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                name="conformesCantidadCuotas"
                type="number"
                min="0"
                placeholder="Cantidad"
                className="w-28"
                value={values.conformesCantidadCuotas}
                onChange={(e) => update("conformesCantidadCuotas", e.target.value)}
              />
              <span className="text-sm text-muted-foreground">cuotas de U$S</span>
              <Input
                name="conformesCuotaUsdCents"
                type="number"
                step="0.01"
                min="0"
                placeholder="Monto por cuota"
                className="w-40"
                value={values.conformesCuotaUsdCents}
                onChange={(e) => update("conformesCuotaUsdCents", e.target.value)}
              />
            </div>
          </div>
          <MoneyField label="Valor toma auto" field="valorTomaAutoUsdCents" values={values} onChange={update} />
          <MoneyField label="Total" field="totalUsdCents" values={values} onChange={update} />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Documentación</legend>
        <MoneyMonedaField
          label="Costo de títulos"
          name="costoTitulosUsdCents"
          monedaName="costoTitulosMoneda"
          value={values.costoTitulosUsdCents}
          onChange={(v) => update("costoTitulosUsdCents", v)}
          moneda={costoMoneda}
          setMoneda={setCostoMoneda}
        />
        <MoneyMonedaField
          label="Carta de pago"
          name="cartaPagoUsdCents"
          monedaName="cartaPagoMoneda"
          value={values.cartaPagoUsdCents}
          onChange={(v) => update("cartaPagoUsdCents", v)}
          moneda={cartaMoneda}
          setMoneda={setCartaMoneda}
        />
        <MoneyMonedaField
          label="Entrega a cuenta de títulos"
          name="entregaCuentaTitulosUsdCents"
          monedaName="entregaCuentaTitulosMoneda"
          value={values.entregaCuentaTitulosUsdCents}
          onChange={(v) => update("entregaCuentaTitulosUsdCents", v)}
          moneda={entregaMoneda}
          setMoneda={setEntregaMoneda}
        />
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
