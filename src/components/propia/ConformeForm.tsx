"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConformeForm({
  defaultFirmante,
  action,
}: {
  defaultFirmante?: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al generar el recibo");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Firmante 1 — Nombre</Label>
          <Input name="firmante1Nombre" defaultValue={defaultFirmante} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Firmante 1 — Cédula</Label>
          <Input name="firmante1Ci" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Firmante 2 — Nombre (opcional)</Label>
          <Input name="firmante2Nombre" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Firmante 2 — Cédula</Label>
          <Input name="firmante2Ci" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Forma de pago</Label>
          <Select name="formaPago" defaultValue="CONTADO">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CONTADO">Contado</SelectItem>
              <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Generando…" : "Generar recibo"}
        </Button>
      </div>
    </form>
  );
}
