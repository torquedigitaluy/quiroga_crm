"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmpleadoForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tipoPago, setTipoPago] = useState("MENSUAL");

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input name="nombre" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Apellido</Label>
          <Input name="apellido" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Tipo de pago</Label>
          <Select name="tipoPago" defaultValue="MENSUAL" onValueChange={setTipoPago}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MENSUAL">Sueldo mensual</SelectItem>
              <SelectItem value="JORNAL">Jornalero (por día)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tipoPago === "MENSUAL" ? (
          <div className="flex flex-col gap-1.5">
            <Label>Sueldo mensual ($)</Label>
            <Input name="sueldoMensualCents" type="number" step="0.01" />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label>Jornal diario ($)</Label>
            <Input name="jornalDiarioCents" type="number" step="0.01" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Crear empleado"}
        </Button>
      </div>
    </form>
  );
}
