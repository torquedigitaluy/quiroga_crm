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
  deudorNombre?: string;
  estado?: string;
};

export function ConformeForm({
  initial,
  action,
  submitLabel = "Generar recibo",
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
        setError(e instanceof Error ? e.message : "Error al guardar el recibo");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {/* Se conserva el vencimiento original de la cuota aunque no se muestre. */}
      <input type="hidden" name="fechaVencimiento" value={initial?.fechaVencimiento ?? ""} />

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-foreground">Recibo de pago</legend>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Se recibe de (nombre del cliente)</Label>
          <Input name="deudorNombre" defaultValue={initial?.deudorNombre ?? ""} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Monto pagado (U$S)</Label>
          <Input name="montoCents" type="number" step="1" value={monto} onChange={(e) => handleMonto(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha de pago</Label>
          <Input name="fechaPago" type="date" defaultValue={initial?.fechaPago ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Monto en letras</Label>
          <Input
            name="montoEnLetras"
            value={montoEnLetras}
            onChange={(e) => setMontoEnLetras(e.target.value)}
            placeholder="Se completa automáticamente desde el importe"
          />
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
      </fieldset>

      <p className="text-xs text-muted-foreground">
        El recibo es un comprobante simple para enviarle al cliente. El compromiso de pago completo se genera aparte
        como &quot;Vale&quot; en Documentos.
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
