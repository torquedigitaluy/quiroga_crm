"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEstadoCredito } from "@/app/(app)/bbva/actions";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

export function EstadoCreditoSelect({ id, estado, editable }: { id: string; estado: string; editable: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!editable) {
    return <span>{ESTADO_LABELS[estado]}</span>;
  }

  return (
    <Select
      defaultValue={estado}
      disabled={pending}
      onValueChange={(value) => startTransition(async () => {
        await updateEstadoCredito(id, value);
        router.refresh();
      })}
    >
      <SelectTrigger className="h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ESTADO_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
