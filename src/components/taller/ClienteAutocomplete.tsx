"use client";

import { useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CandidatoClienteTaller } from "@/lib/clienteTaller";

export function ClienteAutocomplete({
  buscarAction,
  onSelect,
}: {
  buscarAction: (query: string) => Promise<CandidatoClienteTaller[]>;
  onSelect: (candidato: CandidatoClienteTaller) => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<CandidatoClienteTaller[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResultados([]);
      setAbierto(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarAction(value);
        setResultados(r);
        setAbierto(r.length > 0);
      });
    }, 300);
  };

  const handleSelect = (c: CandidatoClienteTaller) => {
    onSelect(c);
    setQuery(c.clienteNombre);
    setAbierto(false);
  };

  return (
    <div className="relative flex flex-col gap-1.5">
      <Label>Buscar cliente conocido (nombre o matrícula)</Label>
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Ej: Juan Pérez o ABC 1234"
        onFocus={() => setAbierto(resultados.length > 0)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        autoComplete="off"
      />
      {pending && <p className="text-xs text-muted-foreground">Buscando…</p>}
      {abierto && resultados.length > 0 && (
        <div className="absolute top-full z-20 mt-1 w-full rounded-md border border-border bg-surface shadow-md">
          {resultados.map((c, i) => (
            <button
              key={i}
              type="button"
              className="flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-surface-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(c)}
            >
              <span className="font-medium text-foreground">{c.clienteNombre}</span>
              <span className="text-xs text-muted-foreground">
                {[c.vehMarca, c.vehModelo, c.vehMatricula].filter(Boolean).join(" · ") || "Sin vehículo asociado"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
