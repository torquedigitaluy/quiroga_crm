"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/money";
import { cuotasPatentePagasAutomaticas, proximoVencimientoPatente } from "@/lib/patente";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PatenteCard({
  patenteAnualCents,
  patenteCuotaCents,
  patenteNoSumar,
  fechaVenta,
  editable,
  onToggleNoSumar,
}: {
  patenteAnualCents: number | null;
  patenteCuotaCents: number | null;
  patenteNoSumar: boolean;
  fechaVenta: Date | null;
  editable: boolean;
  onToggleNoSumar: (noSumar: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const hoy = new Date();
  const cuotasPagas = cuotasPatentePagasAutomaticas(hoy, fechaVenta);
  const proximoVencimiento = fechaVenta ? null : proximoVencimientoPatente(hoy);

  const handleToggle = () => {
    startTransition(async () => {
      await onToggleNoSumar(!patenteNoSumar);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Patente</CardTitle>
        {editable && (
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handleToggle}>
            {pending ? "Guardando…" : patenteNoSumar ? "Volver a sumar patente" : "No sumar patente"}
          </Button>
        )}
      </CardHeader>
      {patenteNoSumar ? (
        <CardContent className="text-sm text-muted-foreground">
          Esta patente no se suma automáticamente (p.ej. porque ya se pagó el año completo). No se calculan cuotas ni
          próximo vencimiento para este vehículo.
        </CardContent>
      ) : (
        <>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Patente anual" value={patenteAnualCents ? formatCents(patenteAnualCents, "UYU") : "—"} />
            <Stat label="Valor de cuota" value={patenteCuotaCents ? formatCents(patenteCuotaCents, "UYU") : "—"} />
            <Stat label="Cuotas pagas" value={`${cuotasPagas} / 6`} />
            <Stat
              label="Próximo vencimiento"
              value={proximoVencimiento ? proximoVencimiento.toLocaleDateString("es-UY") : fechaVenta ? "—" : "Ninguno este año"}
            />
          </CardContent>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Se calcula solo según el calendario fijo de vencimientos (10/ene, 20/mar, 20/may, 20/jul, 20/sep, 20/nov) —
            no requiere carga manual.
          </CardContent>
        </>
      )}
    </Card>
  );
}
