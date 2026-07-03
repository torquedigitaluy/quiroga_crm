"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setAsistencia } from "@/app/(app)/personal/actions";

type Estado = "PRESENTE" | "MEDIO_DIA" | "LICENCIA" | "ENFERMO" | "AUSENTE";

const CYCLE: Estado[] = ["AUSENTE", "PRESENTE", "MEDIO_DIA", "LICENCIA", "ENFERMO"];

const ESTADO_STYLE: Record<Estado, string> = {
  AUSENTE: "bg-surface-muted text-muted-foreground",
  PRESENTE: "bg-success-tint text-success",
  MEDIO_DIA: "bg-warning-tint text-warning-foreground",
  LICENCIA: "bg-brand-tint text-brand",
  ENFERMO: "bg-danger-tint text-danger-foreground",
};

const ESTADO_ABBR: Record<Estado, string> = {
  AUSENTE: "–",
  PRESENTE: "P",
  MEDIO_DIA: "½",
  LICENCIA: "L",
  ENFERMO: "E",
};

export type EmpleadoRow = { id: string; nombre: string; apellido: string | null };

export function AttendanceGrid({
  empleados,
  days,
  initialAttendance,
  editable,
}: {
  empleados: EmpleadoRow[];
  days: string[];
  initialAttendance: Record<string, Record<string, Estado>>;
  editable: boolean;
}) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (empleadoId: string, day: string) => {
    if (!editable) return;
    const current = attendance[empleadoId]?.[day] ?? "AUSENTE";
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

    setAttendance((prev) => ({ ...prev, [empleadoId]: { ...prev[empleadoId], [day]: next } }));
    startTransition(async () => {
      await setAsistencia(empleadoId, day, next);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(Object.keys(ESTADO_ABBR) as Estado[]).map((estado) => (
          <span key={estado} className="inline-flex items-center gap-1.5">
            <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded", ESTADO_STYLE[estado])}>
              {ESTADO_ABBR[estado]}
            </span>
            {estado === "AUSENTE"
              ? "Ausente"
              : estado === "PRESENTE"
                ? "Presente"
                : estado === "MEDIO_DIA"
                  ? "Medio día"
                  : estado === "LICENCIA"
                    ? "Licencia"
                    : "Enfermo"}
          </span>
        ))}
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-border">
        <table className="border-collapse text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="sticky left-0 z-10 bg-surface-muted px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                Empleado
              </th>
              {days.map((day) => (
                <th key={day} className="px-1 py-2 text-center text-xs font-medium text-muted-foreground">
                  {new Date(day).getUTCDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className="border-t border-border">
                <td className="sticky left-0 z-10 whitespace-nowrap bg-surface px-3 py-1.5 font-medium text-foreground">
                  {emp.nombre} {emp.apellido ?? ""}
                </td>
                {days.map((day) => {
                  const estado = attendance[emp.id]?.[day] ?? "AUSENTE";
                  return (
                    <td key={day} className="p-0.5 text-center">
                      <button
                        type="button"
                        disabled={!editable}
                        onClick={() => handleClick(emp.id, day)}
                        title={estado}
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded text-xs font-semibold transition-colors",
                          ESTADO_STYLE[estado],
                          editable && "cursor-pointer hover:opacity-80",
                        )}
                      >
                        {ESTADO_ABBR[estado]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
