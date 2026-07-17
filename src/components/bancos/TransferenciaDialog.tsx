"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TransferenciaDialog({
  cuentas,
  action,
}: {
  cuentas: { id: string; nombre: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        setOpen(false);
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al crear la transferencia");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowLeftRight className="h-4 w-4" />
          Transferencia entre cuentas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferencia entre cuentas</DialogTitle>
          <DialogDescription>Genera un egreso en origen y un ingreso en destino, con comisión opcional.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Fecha</Label>
            <Input name="fecha" type="date" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Cuenta origen</Label>
              <Select name="cuentaOrigenId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí" />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cuenta destino</Label>
              <Select name="cuentaDestinoId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí" />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Monto $ (pesos)</Label>
              <Input name="montoPesosCents" type="number" step="0.01" defaultValue={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Monto USD</Label>
              <Input name="montoUsdCents" type="number" step="0.01" defaultValue={0} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Comisión bancaria ($)</Label>
            <Input name="comisionBancariaCents" type="number" step="0.01" defaultValue={0} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Comentario</Label>
            <Input name="comentario" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Registrar transferencia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
