"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCents } from "@/lib/money";

export type EntregaData = { id: string; numero: number; montoCents: number; fecha: Date | null };

export function EntregasEditor({
  entregas,
  moneda,
  onAdd,
  onDelete,
}: {
  entregas: EntregaData[];
  moneda: "UYU" | "USD";
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (entregaId: string) => Promise<void>;
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
        const form = document.getElementById("entrega-add-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al agregar la entrega");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await onDelete(id);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entrega #</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.numero}</TableCell>
              <TableCell>{e.fecha ? new Date(e.fecha).toLocaleDateString("es-UY") : "—"}</TableCell>
              <TableCell>{formatCents(e.montoCents, moneda)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" disabled={pending} onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {entregas.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                Sin entregas registradas todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <form
        id="entrega-add-form"
        action={handleAdd}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3"
      >
        <div className="flex w-40 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Fecha</label>
          <Input name="fecha" type="date" />
        </div>
        <div className="flex w-36 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Monto</label>
          <Input name="montoCents" type="number" step="0.01" required />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          Agregar entrega
        </Button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
