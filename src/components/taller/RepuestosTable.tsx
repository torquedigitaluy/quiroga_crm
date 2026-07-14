"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { formatCents } from "@/lib/money";

export type RepuestoData = {
  id: string;
  codigo: string | null;
  descripcion: string;
  cantidad: number;
  precioUnitCents: number;
  moneda: "UYU" | "USD";
};

export function RepuestosTable({
  repuestos,
  editable,
  onAdd,
  onDelete,
}: {
  repuestos: RepuestoData[];
  editable: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (repuestoId: string) => Promise<void>;
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
        const form = document.getElementById("repuesto-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al agregar el repuesto");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cant.</TableHead>
            <TableHead>Precio unit.</TableHead>
            <TableHead>Total</TableHead>
            {editable && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {repuestos.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.codigo ?? "—"}</TableCell>
              <TableCell>{r.descripcion}</TableCell>
              <TableCell>{r.cantidad}</TableCell>
              <TableCell>{formatCents(r.precioUnitCents, r.moneda)}</TableCell>
              <TableCell>{formatCents(r.precioUnitCents * r.cantidad, r.moneda)}</TableCell>
              {editable && (
                <TableCell>
                  <ConfirmDeleteButton
                    onConfirm={() => onDelete(r.id)}
                    title="Eliminar repuesto"
                    description="¿Estás seguro que querés eliminar este repuesto?"
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {repuestos.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                Sin repuestos cargados todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {editable && (
        <form
          id="repuesto-add-form"
          action={handleAdd}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
        >
          <div className="flex w-28 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Código</label>
            <Input name="codigo" />
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input name="descripcion" required />
          </div>
          <div className="flex w-20 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cant.</label>
            <Input name="cantidad" type="number" defaultValue={1} min={1} />
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
            <label className="text-xs font-medium text-muted-foreground">Precio unit.</label>
            <Input name="precioUnitCents" type="number" step="0.01" />
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
