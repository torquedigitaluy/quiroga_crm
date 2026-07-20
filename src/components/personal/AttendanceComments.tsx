"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";
import {
  addComentarioAsistencia,
  updateComentarioAsistencia,
  deleteComentarioAsistencia,
} from "@/app/(app)/personal/actions";

export type ComentarioAsistenciaRow = {
  id: string;
  texto: string;
  autorNombre: string | null;
  createdAt: string;
  updatedAt: string;
};

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "setiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fechaHora(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("es-UY")} ${d.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}`;
}

export function AttendanceComments({
  anio,
  mes,
  comentarios,
  editable,
}: {
  anio: number;
  mes: number;
  comentarios: ComentarioAsistenciaRow[];
  editable: boolean;
}) {
  const router = useRouter();
  const [nuevo, setNuevo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const nombreMes = MESES[mes - 1] ?? "";

  const handleAdd = () => {
    if (!nuevo.trim()) return;
    setError(null);
    const fd = new FormData();
    fd.set("texto", nuevo.trim());
    startTransition(async () => {
      try {
        await addComentarioAsistencia(anio, mes, fd);
        setNuevo("");
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar el comentario");
      }
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editTexto.trim()) return;
    setError(null);
    const fd = new FormData();
    fd.set("texto", editTexto.trim());
    startTransition(async () => {
      try {
        await updateComentarioAsistencia(id, fd);
        setEditId(null);
        setEditTexto("");
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al editar el comentario");
      }
    });
  };

  const handleDelete = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteComentarioAsistencia(id);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al eliminar el comentario");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Comentarios de {nombreMes} {anio}</h2>
        <p className="text-sm text-muted-foreground">
          Notas del mes (novedades, licencias, avisos). Quedan guardadas con fecha y se pueden editar.
        </p>
      </div>

      {editable && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            rows={2}
            placeholder="Escribí un comentario para este mes…"
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" disabled={pending || !nuevo.trim()} onClick={handleAdd}>
              {pending ? "Guardando…" : "Agregar comentario"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2">
        {comentarios.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay comentarios para este mes.</p>
        )}
        {comentarios.map((c) => (
          <div key={c.id} className="rounded-md border border-border bg-surface p-3">
            {editId === c.id ? (
              <div className="flex flex-col gap-2">
                <Textarea value={editTexto} onChange={(e) => setEditTexto(e.target.value)} rows={2} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => setEditId(null)}>
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button type="button" size="sm" disabled={pending || !editTexto.trim()} onClick={() => handleSaveEdit(c.id)}>
                    <Check className="h-4 w-4" />
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="whitespace-pre-wrap text-sm text-foreground">{c.texto}</p>
                  <span className="text-xs text-muted-foreground">
                    {fechaHora(c.createdAt)}
                    {c.autorNombre ? ` · ${c.autorNombre}` : ""}
                    {c.updatedAt !== c.createdAt ? " · (editado)" : ""}
                  </span>
                </div>
                {editable && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => {
                        setEditId(c.id);
                        setEditTexto(c.texto);
                      }}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={pending} onClick={() => handleDelete(c.id)} title="Eliminar">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
