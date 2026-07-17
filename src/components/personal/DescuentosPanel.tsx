"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { formatCents } from "@/lib/money";

export type DescuentoData = {
  id: string;
  fecha: Date;
  concepto: string;
  montoCents: number;
  moneda: "UYU" | "USD";
};

export function DescuentosPanel({
  descuentos,
  editable,
  onAdd,
  onDelete,
}: {
  descuentos: DescuentoData[];
  editable: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onAdd(formData);
        router.refresh();
        const form = document.getElementById("descuento-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al agregar el descuento");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Monto</TableHead>
            {editable && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {descuentos.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{new Date(d.fecha).toLocaleDateString("es-UY")}</TableCell>
              <TableCell>{d.concepto}</TableCell>
              <TableCell>{formatCents(d.montoCents, d.moneda)}</TableCell>
              {editable && (
                <TableCell>
                  <ConfirmDeleteButton
                    onConfirm={() => onDelete(d.id)}
                    title="Eliminar descuento"
                    description="¿Estás seguro que querés eliminar este descuento? Esta acción no se puede deshacer."
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {descuentos.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                Sin adelantos ni descuentos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {editable && (
        <form
          id="descuento-add-form"
          action={handleAdd}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
        >
          <div className="flex w-40 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fecha</label>
            <Input name="fecha" type="date" />
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Concepto</label>
            <Input name="concepto" placeholder="Ej: adelanto, multa, celular…" required />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
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
        </form>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
