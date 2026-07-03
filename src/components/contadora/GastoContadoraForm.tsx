"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GastoContadoraForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        const form = document.getElementById("gasto-contadora-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  return (
    <form
      id="gasto-contadora-form"
      action={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
    >
      <div className="flex w-28 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Tipo</label>
        <Select name="tipoComprobante" defaultValue="FACTURA">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FACTURA">Factura</SelectItem>
            <SelectItem value="NOTA_CREDITO">Nota de Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-36 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Fecha</label>
        <Input name="fecha" type="date" required />
      </div>
      <div className="flex w-32 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">N° Factura</label>
        <Input name="numeroFactura" />
      </div>
      <div className="flex flex-1 min-w-40 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Proveedor</label>
        <Input name="proveedor" required />
      </div>
      <div className="flex w-24 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Moneda</label>
        <Select name="moneda" defaultValue="UYU">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UYU">$ (UYU)</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-28 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">IVA</label>
        <Select name="ivaRate" defaultValue="VEINTIDOS">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXENTO">Exento</SelectItem>
            <SelectItem value="DIEZ">10%</SelectItem>
            <SelectItem value="VEINTIDOS">22%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-36 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Importe total</label>
        <Input name="importeTotalCents" type="number" step="0.01" required />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        Agregar
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
