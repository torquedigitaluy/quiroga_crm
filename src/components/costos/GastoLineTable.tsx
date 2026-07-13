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
import { gastoLineUsdCents } from "@/lib/costeo";

export type GastoLineData = {
  id: string;
  descripcion: string;
  moneda: "UYU" | "USD";
  montoCents: number;
};

export function GastoLineTable({
  gastos,
  rateMicros,
  editable,
  onAdd,
  onDelete,
}: {
  gastos: GastoLineData[];
  rateMicros: number;
  editable: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (gastoId: string) => Promise<void>;
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
        const form = document.getElementById("gasto-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al agregar el gasto");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Moneda</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Equivalente USD</TableHead>
            {editable && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.map((g) => (
            <TableRow key={g.id}>
              <TableCell>{g.descripcion}</TableCell>
              <TableCell>{g.moneda}</TableCell>
              <TableCell>{formatCents(g.montoCents, g.moneda)}</TableCell>
              <TableCell>{formatCents(gastoLineUsdCents(g, rateMicros), "USD")}</TableCell>
              {editable && (
                <TableCell>
                  <ConfirmDeleteButton
                    onConfirm={() => onDelete(g.id)}
                    title="Eliminar gasto"
                    description="¿Estás seguro que querés eliminar este gasto? Esta acción no se puede deshacer."
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {gastos.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                Sin gastos cargados todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {editable && (
        <form id="gasto-add-form" action={handleAdd} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
          <div className="flex flex-1 min-w-48 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción</label>
            <Input name="descripcion" placeholder="Ej: Escribanía, chapa y pintura…" required />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Moneda</label>
            <Select name="moneda" defaultValue="USD">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="UYU">$ (UYU)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-36 flex-col gap-1.5">
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
