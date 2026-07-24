"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";
import { centsToUnits, formatCents } from "@/lib/money";

export type AceitePredefinidoRow = {
  id: string;
  nombre: string;
  precioCents: number;
  moneda: "UYU" | "USD";
};

function AceiteRow({
  aceite,
  onUpdate,
  onDelete,
}: {
  aceite: AceitePredefinidoRow;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(aceite.nombre);
  const [moneda, setMoneda] = useState<"UYU" | "USD">(aceite.moneda);
  const [precio, setPrecio] = useState(String(centsToUnits(aceite.precioCents)));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onUpdate(aceite.id, formData);
        router.refresh();
        setEditando(false);
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  };

  if (!editando) {
    return (
      <TableRow>
        <TableCell>{aceite.nombre}</TableCell>
        <TableCell>{formatCents(aceite.precioCents, aceite.moneda)}</TableCell>
        <TableCell className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEditando(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDeleteButton
            onConfirm={() => onDelete(aceite.id)}
            title="Eliminar aceite"
            description={`¿Estás seguro que querés eliminar "${aceite.nombre}" del catálogo?`}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={3}>
        <form action={handleSave} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="moneda" value={moneda} />
          <div className="flex flex-1 min-w-32 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="flex w-24 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Moneda</label>
            <Select value={moneda} onValueChange={(v) => setMoneda(v as "UYU" | "USD")}>
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
            <label className="text-xs font-medium text-muted-foreground">Precio</label>
            <Input name="precioCents" type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
          <input type="hidden" name="nombre" value={nombre} />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditando(false)}>
            Cancelar
          </Button>
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </form>
      </TableCell>
    </TableRow>
  );
}

export function AceitePredefinidoManager({
  aceites,
  onCreate,
  onUpdate,
  onDelete,
}: {
  aceites: AceitePredefinidoRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [nombre, setNombre] = useState("");
  const [moneda, setMoneda] = useState<"UYU" | "USD">("UYU");
  const [precio, setPrecio] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onCreate(formData);
        router.refresh();
        setNombre("");
        setMoneda("UYU");
        setPrecio("0");
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al agregar el aceite");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aceite</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {aceites.map((a) => (
            <AceiteRow key={a.id} aceite={a} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
          {aceites.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                Sin aceites en el catálogo todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <form action={handleAdd} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
        <input type="hidden" name="moneda" value={moneda} />
        <div className="flex flex-1 min-w-40 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nombre</label>
          <Input name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Castrol" />
        </div>
        <div className="flex w-24 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Moneda</label>
          <Select value={moneda} onValueChange={(v) => setMoneda(v as "UYU" | "USD")}>
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
          <label className="text-xs font-medium text-muted-foreground">Precio</label>
          <Input name="precioCents" type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
