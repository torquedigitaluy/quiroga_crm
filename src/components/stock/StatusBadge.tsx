import { Badge } from "@/components/ui/badge";

const ESTADO_CONFIG = {
  APRONTANDO: { label: "Taller / Aprontando", variant: "warning" as const },
  SENADO: { label: "Señado", variant: "danger" as const },
  PUBLICADO: { label: "Publicado", variant: "default" as const },
};

export function StatusBadge({ estado }: { estado: keyof typeof ESTADO_CONFIG }) {
  const config = ESTADO_CONFIG[estado];
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

const UBICACION_LABELS: Record<string, string> = {
  SAN_LUIS: "San Luis",
  ZONAMERICA: "Zonamérica",
  TALLER: "Taller",
  PROPIETARIO: "Propietario",
};

export function UbicacionBadge({ ubicacion }: { ubicacion: string }) {
  return (
    <Badge variant="outline">{UBICACION_LABELS[ubicacion] ?? ubicacion}</Badge>
  );
}
