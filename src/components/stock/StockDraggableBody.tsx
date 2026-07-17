"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { StatusBadge, UbicacionBadge } from "@/components/stock/StatusBadge";
import { formatCents } from "@/lib/money";
import { reordenarVehiculos } from "@/app/(app)/stock/actions";

export type StockRow = {
  id: string;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number | null;
  color: string | null;
  km: number | null;
  ubicacion: string;
  estado: string;
  precioVentaUsdCents: number | null;
  matricula: string | null;
  fechaIngreso: string;
};

export function StockDraggableBody({
  rows,
  draggable,
  colSpan,
}: {
  rows: StockRow[];
  /** Solo se puede arrastrar cuando el listado está en "Orden manual". */
  draggable: boolean;
  colSpan: number;
}) {
  const [items, setItems] = useState(rows);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Mantiene la lista sincronizada si cambian los filtros/orden del servidor.
  const [prevRows, setPrevRows] = useState(rows);
  if (prevRows !== rows) {
    setPrevRows(rows);
    setItems(rows);
  }

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    setItems(next); // optimista: se ve el cambio al instante
    setDragIndex(null);
    setOverIndex(null);
    startTransition(async () => {
      await reordenarVehiculos(next.map((r) => r.id));
      router.refresh();
    });
  };

  if (items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
            No hay vehículos que coincidan con la búsqueda.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {items.map((v, i) => (
        <TableRow
          key={v.id}
          draggable={draggable}
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => {
            if (!draggable) return;
            e.preventDefault();
            setOverIndex(i);
          }}
          onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(i);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={[
            dragIndex === i ? "opacity-50" : "",
            overIndex === i && dragIndex !== i ? "border-t-2 border-brand" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {draggable && (
            <TableCell className="w-8 cursor-grab text-muted-foreground active:cursor-grabbing">
              <GripVertical className="h-4 w-4" />
            </TableCell>
          )}
          <TableCell>
            <Link href={`/stock/${v.id}`} className="font-medium text-foreground hover:text-brand">
              {v.marca} {v.modelo}
            </Link>
            {v.version && <div className="text-xs text-muted-foreground">{v.version}</div>}
          </TableCell>
          <TableCell>{v.anio ?? "—"}</TableCell>
          <TableCell>{v.color ?? "—"}</TableCell>
          <TableCell>{v.km?.toLocaleString("es-UY") ?? "—"}</TableCell>
          <TableCell>
            <UbicacionBadge ubicacion={v.ubicacion as never} />
          </TableCell>
          <TableCell>
            <StatusBadge estado={v.estado as never} />
          </TableCell>
          <TableCell>{v.precioVentaUsdCents ? formatCents(v.precioVentaUsdCents, "USD") : "—"}</TableCell>
          <TableCell>{v.matricula ?? "—"}</TableCell>
          <TableCell>{new Date(v.fechaIngreso).toLocaleDateString("es-UY")}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
