"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DeudaForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        const form = document.getElementById("deuda-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al agregar la deuda");
      }
    });
  };

  return (
    <form id="deuda-add-form" action={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
      <div className="flex w-40 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Nombre</label>
        <Input name="nombre" required />
      </div>
      <div className="flex w-36 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Contacto</label>
        <Input name="contacto" />
      </div>
      <div className="flex w-32 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Matrícula</label>
        <Input name="matricula" />
      </div>
      <div className="flex flex-1 min-w-40 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Concepto</label>
        <Input name="concepto" placeholder="Ej: multas, patente y recargos" required />
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
      <div className="flex w-32 flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Monto</label>
        <Input name="montoCents" type="number" step="0.01" required />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        Agregar
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
