import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConformeViewPage({ params }: { params: Promise<{ conformeId: string }> }) {
  await assertCan("conforme.generate");
  const { conformeId } = await params;

  const conforme = await db.conforme.findUnique({
    where: { id: conformeId },
    include: {
      firmantes: { orderBy: { orden: "asc" } },
      financiacionPropia: { include: { cliente: true, vehiculo: true } },
    },
  });
  if (!conforme) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Conforme generado</h1>
        <p className="text-sm text-muted-foreground">
          La versión imprimible en PDF está disponible desde el módulo Documentos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            Por el presente documento me obligo a pagar la suma de{" "}
            <strong>{formatCents(conforme.montoCuotaCents, "USD")}</strong> el día{" "}
            <strong>{conforme.financiacionPropia.diaVencimientoMensual}</strong> de cada mes, con vencimiento el{" "}
            <strong>{new Date(conforme.fechaVencimiento).toLocaleDateString("es-UY")}</strong>, hasta completar{" "}
            <strong>{conforme.cantidadCuotas}</strong> cuotas, en concepto de financiación del vehículo{" "}
            {conforme.financiacionPropia.vehiculo
              ? `${conforme.financiacionPropia.vehiculo.marca} ${conforme.financiacionPropia.vehiculo.modelo}`
              : "—"}
            .
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {conforme.firmantes.map((f) => (
              <div key={f.id} className="rounded-lg border border-dashed border-border p-4">
                <p className="text-xs uppercase text-muted-foreground">Firmante {f.orden}</p>
                <p className="font-medium text-foreground">{f.nombre}</p>
                {f.ci && <p className="text-sm text-muted-foreground">CI: {f.ci}</p>}
                <div className="mt-6 border-t border-border pt-2 text-center text-xs text-muted-foreground">Firma</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
