"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ControlCalidadCard({
  revisadoPorNombre,
  revisadoAprobado,
  revisadoAt,
  puedeRevisar,
  onConfirm,
}: {
  revisadoPorNombre: string | null;
  revisadoAprobado: boolean | null;
  revisadoAt: Date | null;
  puedeRevisar: boolean;
  onConfirm: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (aprobado: boolean) => {
    const formData = new FormData();
    formData.set("revisadoAprobado", String(aprobado));
    startTransition(async () => {
      await onConfirm(formData);
      router.refresh();
    });
  };

  if (revisadoAt) {
    return (
      <div className="flex flex-col gap-1 text-sm">
        <p>
          Revisado por <strong>{revisadoPorNombre ?? "—"}</strong> el {new Date(revisadoAt).toLocaleString("es-UY")}
        </p>
        <Badge variant={revisadoAprobado ? "success" : "danger"} className="w-fit">
          {revisadoAprobado ? "Aprobado" : "No aprobado"}
        </Badge>
      </div>
    );
  }

  if (!puedeRevisar) {
    return <p className="text-sm text-muted-foreground">Todavía no se completó el control de calidad.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={pending} onClick={() => handleClick(true)}>
        Aprobar
      </Button>
      <Button variant="destructive" size="sm" disabled={pending} onClick={() => handleClick(false)}>
        No aprobar
      </Button>
    </div>
  );
}
