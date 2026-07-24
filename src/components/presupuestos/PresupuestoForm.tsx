"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClienteAutocomplete } from "@/components/taller/ClienteAutocomplete";
import { buscarClientesPresupuestoAction } from "@/app/(app)/presupuestos/actions";
import type { CandidatoClienteTaller } from "@/lib/clienteTaller";

export type VehiculoStockOption = {
  id: string;
  label: string;
  marca: string;
  modelo: string;
  matricula: string | null;
};

export type PresupuestoInitial = {
  vehiculoId: string | null;
  vehiculoExterno: string | null;
  vehMarca: string | null;
  vehModelo: string | null;
  vehMatricula: string | null;
  vehCombustible: string | null;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  comentarios: string | null;
};

export function PresupuestoForm({
  vehiculos,
  initial,
  submitLabel = "Crear presupuesto",
  action,
}: {
  vehiculos: VehiculoStockOption[];
  initial?: PresupuestoInitial;
  submitLabel?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [origen, setOrigen] = useState<"stock" | "externo">(initial?.vehiculoId ? "stock" : "externo");
  const [vehiculoId, setVehiculoId] = useState(initial?.vehiculoId ?? "");
  const [vehiculoExterno, setVehiculoExterno] = useState(initial?.vehiculoExterno ?? "");
  const EMPTY_VEH = { marca: "", modelo: "", matricula: "", combustible: "" };
  const [vehDatos, setVehDatos] = useState({
    marca: initial?.vehMarca ?? "",
    modelo: initial?.vehModelo ?? "",
    matricula: initial?.vehMatricula ?? "",
    combustible: initial?.vehCombustible ?? "",
  });
  const [clienteDatos, setClienteDatos] = useState({
    nombre: initial?.clienteNombre ?? "",
    telefono: initial?.clienteTelefono ?? "",
  });

  const handleOrigenChange = (nuevo: "stock" | "externo") => {
    setOrigen(nuevo);
    setVehDatos(EMPTY_VEH);
    setVehiculoId("");
    setVehiculoExterno("");
  };

  const handleSelectVehiculo = (id: string) => {
    setVehiculoId(id);
    const v = vehiculos.find((x) => x.id === id);
    if (v) {
      setVehDatos({ marca: v.marca, modelo: v.modelo, matricula: v.matricula ?? "", combustible: "" });
    }
  };

  const handleSelectCliente = (c: CandidatoClienteTaller) => {
    setClienteDatos({ nombre: c.clienteNombre, telefono: c.clienteTelefono ?? "" });
    if (c.vehiculoId && vehiculos.some((v) => v.id === c.vehiculoId)) {
      handleOrigenChange("stock");
      handleSelectVehiculo(c.vehiculoId);
      return;
    }
    handleOrigenChange("externo");
    setVehDatos({
      marca: c.vehMarca ?? "",
      modelo: c.vehModelo ?? "",
      matricula: c.vehMatricula ?? "",
      combustible: c.vehCombustible ?? "",
    });
    setVehiculoExterno([c.vehMarca, c.vehModelo, c.vehMatricula].filter(Boolean).join(" ") || c.clienteNombre);
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
      {!initial && <ClienteAutocomplete buscarAction={buscarClientesPresupuestoAction} onSelect={handleSelectCliente} />}

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
          <Input
            name="vehiculoExterno"
            placeholder="Ej: Toyota Corolla 2015, cliente Juan Pérez"
            value={vehiculoExterno}
            onChange={(e) => setVehiculoExterno(e.target.value)}
          />
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
          <Label>Matrícula</Label>
          <Input
            name="vehMatricula"
            value={vehDatos.matricula}
            onChange={(e) => setVehDatos({ ...vehDatos, matricula: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Combustible</Label>
          <Input
            name="vehCombustible"
            value={vehDatos.combustible}
            onChange={(e) => setVehDatos({ ...vehDatos, combustible: e.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Datos del cliente</legend>
        <div className="flex flex-col gap-1.5">
          <Label>Cliente</Label>
          <Input
            name="clienteNombre"
            value={clienteDatos.nombre}
            onChange={(e) => setClienteDatos({ ...clienteDatos, nombre: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Teléfono</Label>
          <Input
            name="clienteTelefono"
            value={clienteDatos.telefono}
            onChange={(e) => setClienteDatos({ ...clienteDatos, telefono: e.target.value })}
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label>Comentarios</Label>
        <Textarea name="comentarios" rows={3} defaultValue={initial?.comentarios ?? ""} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
