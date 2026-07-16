import { Badge } from "@/components/ui/badge";

export const ESTADO_ORDEN_CONFIG = {
  PENDIENTE: { label: "Pendiente", variant: "neutral" as const },
  EN_DIAGNOSTICO: { label: "En diagnóstico", variant: "default" as const },
  ESPERANDO_REPUESTOS: { label: "Esperando repuestos", variant: "warning" as const },
  EN_REPARACION: { label: "En reparación", variant: "warning" as const },
  FINALIZADA: { label: "Finalizada", variant: "success" as const },
  ENTREGADA: { label: "Entregada", variant: "success" as const },
  // Estados heredados: ya no se asignan desde la UI, pero se mantienen acá
  // por si quedara alguna orden vieja en ese estado.
  EN_PROCESO: { label: "En proceso", variant: "default" as const },
  ESPERANDO_APROBACION: { label: "Esperando aprobación", variant: "warning" as const },
};

/** Los 6 estados vigentes que se ofrecen al crear/editar una orden. */
export const ESTADO_ORDEN_OPTIONS = [
  "PENDIENTE",
  "EN_DIAGNOSTICO",
  "ESPERANDO_REPUESTOS",
  "EN_REPARACION",
  "FINALIZADA",
  "ENTREGADA",
] as const;

export const TIPO_SERVICIO_LABELS: Record<string, string> = {
  MANTENIMIENTO: "Mantenimiento",
  DIAGNOSTICO: "Diagnóstico",
  REPARACION: "Reparación",
  OTRO: "Otro",
};

export function OrdenEstadoBadge({ estado }: { estado: keyof typeof ESTADO_ORDEN_CONFIG }) {
  const config = ESTADO_ORDEN_CONFIG[estado];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
