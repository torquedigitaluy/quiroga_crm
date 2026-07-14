"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { centsToUnits } from "@/lib/money";

export type VehiculoFormData = {
  id?: string;
  marca?: string;
  modelo?: string;
  version?: string | null;
  anio?: number | null;
  color?: string | null;
  km?: number | null;
  motor?: string | null;
  transmision?: string | null;
  matricula?: string | null;
  padron?: string | null;
  segundaLlave?: boolean;
  ubicacionLibreta?: string | null;
  comentarios?: string | null;
  precioVentaUsdCents?: number | null;
  patenteCuotaCents?: number | null;
  patenteAnualCents?: number | null;
  ubicacion?: string;
  estado?: string;
  propietario?: string | null;
  tipoPropiedad?: string;
  responsableId?: string | null;
};

export type UsuarioOption = { id: string; nombre: string };

export type VehiculoFormPermissions = {
  editVehicleFields: boolean;
  editPrice: boolean;
  editPatente: boolean;
  moveLocation: boolean;
  editStatus: boolean;
  editOwner: boolean;
};

const ALL_ALLOWED: VehiculoFormPermissions = {
  editVehicleFields: true,
  editPrice: true,
  editPatente: true,
  moveLocation: true,
  editStatus: true,
  editOwner: true,
};

export function VehiculoForm({
  initial,
  permissions = ALL_ALLOWED,
  action,
  submitLabel = "Guardar",
  usuarios = [],
}: {
  initial?: VehiculoFormData;
  permissions?: VehiculoFormPermissions;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  usuarios?: UsuarioOption[];
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
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <fieldset disabled={!permissions.editVehicleFields} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">Datos del vehículo</legend>
        <Field label="Marca" name="marca" defaultValue={initial?.marca} required />
        <Field label="Modelo" name="modelo" defaultValue={initial?.modelo} required />
        <Field label="Versión" name="version" defaultValue={initial?.version ?? ""} />
        <Field label="Año" name="anio" type="number" defaultValue={initial?.anio ?? ""} />
        <Field label="Color" name="color" defaultValue={initial?.color ?? ""} />
        <Field label="Km" name="km" type="number" defaultValue={initial?.km ?? ""} />
        <Field label="Motor" name="motor" defaultValue={initial?.motor ?? ""} />
        <Field label="Transmisión" name="transmision" defaultValue={initial?.transmision ?? ""} />
        <Field label="Matrícula" name="matricula" defaultValue={initial?.matricula ?? ""} />
        <Field label="Padrón" name="padron" defaultValue={initial?.padron ?? ""} />
        <div className="flex flex-col gap-1.5">
          <Label>Ubicación de la libreta</Label>
          <Select name="ubicacionLibreta" defaultValue={initial?.ubicacionLibreta ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zona">Zona</SelectItem>
              <SelectItem value="San Luis">San Luis</SelectItem>
              <SelectItem value="Propietario">Propietario</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox name="segundaLlave" defaultChecked={initial?.segundaLlave} />
          <Label>Segunda llave</Label>
        </div>
        <div className="col-span-full flex flex-col gap-1.5">
          <Label>Comentarios</Label>
          <Textarea name="comentarios" defaultValue={initial?.comentarios ?? ""} />
        </div>
      </fieldset>

      <fieldset disabled={!permissions.editPrice} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">Precio de venta</legend>
        <Field
          label="Precio de venta (USD)"
          name="precioVentaUsdCents"
          type="number"
          step="0.01"
          defaultValue={initial?.precioVentaUsdCents != null ? centsToUnits(initial.precioVentaUsdCents) : ""}
        />
      </fieldset>

      <fieldset disabled={!permissions.editPatente} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">Patente</legend>
        <Field
          label="Patente cuota ($)"
          name="patenteCuotaCents"
          type="number"
          step="0.01"
          defaultValue={initial?.patenteCuotaCents != null ? centsToUnits(initial.patenteCuotaCents) : ""}
        />
        <Field
          label="Patente anual ($)"
          name="patenteAnualCents"
          type="number"
          step="0.01"
          defaultValue={initial?.patenteAnualCents != null ? centsToUnits(initial.patenteAnualCents) : ""}
        />
      </fieldset>

      <fieldset disabled={!permissions.moveLocation && !permissions.editStatus} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">Ubicación y estado</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Ubicación</Label>
          <Select name="ubicacion" defaultValue={initial?.ubicacion ?? "ZONAMERICA"} disabled={!permissions.moveLocation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SAN_LUIS">San Luis</SelectItem>
              <SelectItem value="ZONAMERICA">Zonamérica</SelectItem>
              <SelectItem value="PROPIETARIO">Propietario</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Estado</Label>
          <Select name="estado" defaultValue={initial?.estado ?? "APRONTANDO"} disabled={!permissions.editStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APRONTANDO">Taller / Aprontando (naranja)</SelectItem>
              <SelectItem value="SENADO">Señado (rojo)</SelectItem>
              <SelectItem value="PUBLICADO">Publicado (blanco)</SelectItem>
              <SelectItem value="VENDIDO">Entregado (verde)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      <fieldset disabled={!permissions.editOwner} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <legend className="col-span-full mb-1 text-sm font-semibold text-foreground">Propietario</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Propietario</Label>
          <Select name="propietario" defaultValue={initial?.propietario ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jorge">Jorge</SelectItem>
              <SelectItem value="Pepe">Pepe</SelectItem>
              <SelectItem value="Jorge y Pepe">Jorge y Pepe</SelectItem>
              <SelectItem value="Consignado">Consignado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Responsable (costos)</Label>
          <select
            name="responsableId"
            defaultValue={initial?.responsableId ?? ""}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Sin responsable</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            El responsable puede editar los costos de este vehículo.
          </p>
        </div>
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}
