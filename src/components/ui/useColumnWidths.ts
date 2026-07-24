"use client";

import { useCallback, useEffect, useState } from "react";

export type ColumnDef = { key: string; defaultWidth: number; minWidth?: number };

function defaultsFor(columns: ColumnDef[]): Record<string, number> {
  return Object.fromEntries(columns.map((c) => [c.key, c.defaultWidth]));
}

/**
 * Anchos de columna redimensionables a mano y persistidos en localStorage
 * (por navegador/dispositivo del usuario), para tablas anchas donde el
 * contenido largo de algunas columnas tapa los botones de acción.
 *
 * El valor guardado se aplica recién después del montaje (mismo patrón que
 * ThemeToggle) para no leer localStorage durante el render del servidor y
 * evitar un desajuste de hidratación.
 */
export function useColumnWidths(storageKey: string, columns: ColumnDef[]) {
  const [widths, setWidths] = useState<Record<string, number>>(() => defaultsFor(columns));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, number>;
      // Sincroniza con localStorage recién tras el montaje, a propósito (evita desajuste de hidratación).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWidths((prev) => ({ ...prev, ...saved }));
    } catch {
      // localStorage no disponible (modo privado, etc.) — se queda con los anchos por defecto.
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: Record<string, number>) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignorar si no se puede persistir.
      }
    },
    [storageKey],
  );

  const startResize = useCallback(
    (key: string, startEvent: React.MouseEvent) => {
      startEvent.preventDefault();
      const startX = startEvent.clientX;
      const column = columns.find((c) => c.key === key);
      const startWidth = widths[key] ?? column?.defaultWidth ?? 100;
      const minWidth = column?.minWidth ?? 60;

      const handleMove = (e: MouseEvent) => {
        const next = Math.max(minWidth, startWidth + (e.clientX - startX));
        setWidths((prev) => ({ ...prev, [key]: next }));
      };
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        setWidths((prev) => {
          persist(prev);
          return prev;
        });
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [widths, columns, persist],
  );

  return { widths, startResize };
}
