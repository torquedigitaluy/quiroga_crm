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
import { formatCents, centsToUnits } from "@/lib/money";

export type AceiteLineaData = {
  id: string;
  nombre: string;
  precioCents: number;
  moneda: "UYU" | "USD";
  cantidad: number;
};

export type AceitePredefinidoOption = {
  id: string;
  nombre: string;
  precioCents: number;
  moneda: "UYU" | "USD";
};

export function AceitesTable({
  aceites,
  predefinidos,
  editable,
  onAdd,
  onDelete,
}: {
  aceites: AceiteLineaData[];
  predefinidos: AceitePredefinidoOption[];
  editable: boolean;
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [moneda, setMoneda] = useState<"UYU" | "USD">("UYU");
  const [precio, setPrecio] = useState("0");
  const [cantidad, setCantidad] = useState("1");
  const [predefinidoId, setPredefinidoId] = useState("");

  const handleSelectPredefinido = (id: string) => {
    setPredefinidoId(id);
    const p = predefinidos.find((x) => x.id === id);
    if (p) {
      setNombre(p.nombre);
      setMoneda(p.moneda);
      setPrecio(String(centsToUnits(p.precioCents)));
    }
  };

  const reset = () => {
    setNombre("");
    setMoneda("UYU");
    setPrecio("0");
    setCantidad("1");
    setPredefinidoId("");
  };

  const handleAdd = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await onAdd(formData);
        router.refresh();
        reset();
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
            <TableHead>Cant.</TableHead>
            <TableHead>Precio unit.</TableHead>
            <TableHead>Total</TableHead>
            {editable && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {aceites.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.nombre}</TableCell>
              <TableCell>{a.cantidad}</TableCell>
              <TableCell>{formatCents(a.precioCents, a.moneda)}</TableCell>
              <TableCell>{formatCents(a.precioCents * a.cantidad, a.moneda)}</TableCell>
              {editable && (
                <TableCell>
                  <ConfirmDeleteButton
                    onConfirm={() => onDelete(a.id)}
                    title="Eliminar aceite"
                    description="¿Estás seguro que querés eliminar este aceite del presupuesto?"
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {aceites.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                Sin aceites agregados todavía.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {editable && (
        <form action={handleAdd} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
          <input type="hidden" name="nombre" value={nombre} />
          <input type="hidden" name="moneda" value={moneda} />
          <input type="hidden" name="precioCents" value={precio} />
          <div className="flex w-52 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Aceite predefinido</label>
            <Select value={predefinidoId || undefined} onValueChange={handleSelectPredefinido}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí o escribí abajo" />
              </SelectTrigger>
              <SelectContent>
                {predefinidos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} — {formatCents(p.precioCents, p.moneda)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 min-w-40 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Motul" />
          </div>
          <div className="flex w-20 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cant.</label>
            <Input name="cantidad" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
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
            <label className="text-xs font-medium text-muted-foreground">Precio unit.</label>
            <Input type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} />
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
