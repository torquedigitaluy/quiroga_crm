import { Badge } from "@/components/ui/badge";

export const ESTADO_ORDEN_CONFIG = {
  PENDIENTE: { label: "Pendiente", variant: "neutral" as const },
  EN_PROCESO: { label: "En proceso", variant: "default" as const },
  ESPERANDO_REPUESTOS: { label: "Esperando repuestos", variant: "warning" as const },
  ESPERANDO_APROBACION: { label: "Esperando aprobación", variant: "warning" as const },
  FINALIZADA: { label: "Finalizada", variant: "success" as const },
  ENTREGADA: { label: "Entregada", variant: "success" as const },
};

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
