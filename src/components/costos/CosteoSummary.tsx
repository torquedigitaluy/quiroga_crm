import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents, formatRate } from "@/lib/money";

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: "positive" | "negative" | "muted" }) {
  const color =
    emphasis === "positive" ? "text-success" : emphasis === "negative" ? "text-danger" : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export function CosteoSummary({
  rateMicros,
  precioCompraUsdCents,
  totalGastosUsdCents,
  costoTotalUsdCents,
  gananciaIdealUsdCents,
  precioVentaIdealUsdCents,
  precioVentaRealUsdCents,
  gananciaFinalUsdCents,
}: {
  rateMicros: number;
  precioCompraUsdCents: number;
  totalGastosUsdCents: number;
  costoTotalUsdCents: number;
  gananciaIdealUsdCents: number;
  precioVentaIdealUsdCents: number;
  precioVentaRealUsdCents: number;
  gananciaFinalUsdCents: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de costos (tipo de cambio: $ {formatRate(rateMicros)} por USD)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Precio de compra" value={formatCents(precioCompraUsdCents, "USD")} />
        <Stat label="Total de gastos" value={formatCents(totalGastosUsdCents, "USD")} />
        <Stat label="Costo total" value={formatCents(costoTotalUsdCents, "USD")} emphasis="muted" />
        <Stat label="Ganancia ideal (15%)" value={formatCents(gananciaIdealUsdCents, "USD")} />
        <Stat label="Precio de venta ideal" value={formatCents(precioVentaIdealUsdCents, "USD")} />
        <Stat label="Precio de venta real" value={formatCents(precioVentaRealUsdCents, "USD")} />
        <Stat
          label="Ganancia final"
          value={formatCents(gananciaFinalUsdCents, "USD")}
          emphasis={gananciaFinalUsdCents >= 0 ? "positive" : "negative"}
        />
      </CardContent>
    </Card>
  );
}
