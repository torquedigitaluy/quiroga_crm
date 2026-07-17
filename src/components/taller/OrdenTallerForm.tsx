"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type VehiculoStockOption = {
  id: string;
  label: string;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number | null;
  color: string | null;
  matricula: string | null;
  km: number | null;
};

export type TecnicoOption = { id: string; label: string };

const TIPOS_SERVICIO = [
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "DIAGNOSTICO", label: "Diagnóstico" },
  { value: "REPARACION", label: "Reparación" },
  { value: "OTRO", label: "Otros" },
];

export function OrdenTallerForm({
  vehiculos,
  tecnicos,
  action,
}: {
  vehiculos: VehiculoStockOption[];
  tecnicos: TecnicoOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [origen, setOrigen] = useState<"stock" | "externo">("stock");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>(["MANTENIMIENTO"]);
  const EMPTY_VEH = { marca: "", modelo: "", version: "", anio: "", color: "", matricula: "", km: "" };
  const [vehDatos, setVehDatos] = useState(EMPTY_VEH);
  const [vehiculoId, setVehiculoId] = useState("");

  // Al cambiar de origen se limpian los datos autocargados. Especialmente al
  // pasar a "Vehículo externo": no deben quedar precargados datos de un auto de
  // stock (evita que se guarde información equivocada).
  const handleOrigenChange = (nuevo: "stock" | "externo") => {
    setOrigen(nuevo);
    setVehDatos(EMPTY_VEH);
    setVehiculoId("");
  };

  const handleSelectVehiculo = (id: string) => {
    setVehiculoId(id);
    const v = vehiculos.find((x) => x.id === id);
    if (v) {
      setVehDatos({
        marca: v.marca,
        modelo: v.modelo,
        version: v.version ?? "",
        anio: v.anio != null ? String(v.anio) : "",
        color: v.color ?? "",
        matricula: v.matricula ?? "",
        km: v.km != null ? String(v.km) : "",
      });
    }
  };

  const toggleTipo = (value: string) => {
    setTiposSeleccionados((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
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
      <div className="flex flex-col gap-1.5">
        <Label>Vehículo</Label>
        <input type="hidden" name="origenVehiculo" value={origen} />
        <div className="flex gap-2">
          <Button type="button" variant={origen === "stock" ? "default" : "outline"} onClick={() => handleOrigenChange("stock")}>
            De stock
          </Button>
          <Button type="button" variant={origen === "externo" ? "default" : "outline"} onClick={() => handleOrigenChange("externo")}>
            Vehículo externo
          </Button>
        </div>
      </div>

      {origen === "stock" ? (
        <div className="flex flex-col gap-1.5">
          <Label>Elegí el vehículo</Label>
          <Select name="vehiculoId" value={vehiculoId || undefined} onValueChange={handleSelectVehiculo}>
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
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>Identificación del vehículo externo</Label>
          <Input name="vehiculoExterno" placeholder="Ej: Toyota Corolla 2015, cliente Juan Pérez" />
        </div>
      )}

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del vehículo</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Marca</Label>
          <Input name="vehMarca" value={vehDatos.marca} onChange={(e) => setVehDatos({ ...vehDatos, marca: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Modelo</Label>
          <Input name="vehModelo" value={vehDatos.modelo} onChange={(e) => setVehDatos({ ...vehDatos, modelo: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Versión</Label>
          <Input name="vehVersion" value={vehDatos.version} onChange={(e) => setVehDatos({ ...vehDatos, version: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Año</Label>
          <Input name="vehAnio" type="number" value={vehDatos.anio} onChange={(e) => setVehDatos({ ...vehDatos, anio: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Color</Label>
          <Input name="vehColor" value={vehDatos.color} onChange={(e) => setVehDatos({ ...vehDatos, color: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Matrícula / Patente</Label>
          <Input
            name="vehMatricula"
            value={vehDatos.matricula}
            onChange={(e) => setVehDatos({ ...vehDatos, matricula: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Kilómetros</Label>
          <Input name="vehKm" type="number" value={vehDatos.km} onChange={(e) => setVehDatos({ ...vehDatos, km: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>N° de Chasis</Label>
          <Input name="vehChasis" />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del cliente</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Cliente</Label>
          <Input name="clienteNombre" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Teléfono</Label>
          <Input name="clienteTelefono" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Dirección</Label>
          <Input name="clienteDireccion" />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label>Tipo de servicio</Label>
        <div className="flex flex-wrap gap-4">
          {TIPOS_SERVICIO.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={tiposSeleccionados.includes(t.value)}
                onCheckedChange={() => toggleTipo(t.value)}
              />
              {t.label}
              {tiposSeleccionados.includes(t.value) && <input type="hidden" name="tiposServicio" value={t.value} />}
            </label>
          ))}
        </div>
        {tiposSeleccionados.includes("OTRO") && (
          <Input name="tipoServicioOtro" placeholder="Especificar servicio" className="mt-2" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label>Prioridad</Label>
          <Select name="prioridad" defaultValue="MEDIA">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">Baja</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="URGENTE">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha y hora de inicio</Label>
          <Input name="fechaIngreso" type="datetime-local" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Técnico responsable</Label>
          <Select name="tecnicoResponsableId">
            <SelectTrigger>
              <SelectValue placeholder="Elegí…" />
            </SelectTrigger>
            <SelectContent>
              {tecnicos.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Problema / lo que tiene</Label>
        <Textarea name="problema" required rows={4} placeholder="Describí lo que reportó el cliente o lo que presenta el vehículo" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Fotos del vehículo al ingresar (opcional)</Label>
        <input
          type="file"
          name="imagenesIngreso"
          accept="image/*"
          multiple
          className="text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear orden"}
        </Button>
      </div>
    </form>
  );
}
