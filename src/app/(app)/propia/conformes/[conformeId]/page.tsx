import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FORMA_PAGO_LABELS: Record<string, string> = { CONTADO: "Contado", TRANSFERENCIA: "Transferencia" };

export default async function ConformeViewPage({ params }: { params: Promise<{ conformeId: string }> }) {
  await assertCan("conforme.generate");
  const { conformeId } = await params;

  const conforme = await db.conforme.findUnique({
    where: { id: conformeId },
    include: {
      firmantes: { orderBy: { orden: "asc" } },
      cuota: true,
      financiacionPropia: { include: { cliente: true, vehiculo: true } },
    },
  });
  if (!conforme) notFound();

  const numeroCuota = conforme.cuota?.numero ?? null;
  const cuotasRestantes = numeroCuota !== null ? Math.max(conforme.cantidadCuotas - numeroCuota, 0) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Recibo de pago generado</h1>
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
            Se recibe el pago correspondiente a la cuota{" "}
            {numeroCuota !== null ? (
              <>
                N° <strong>{numeroCuota}</strong>
              </>
            ) : (
              ""
            )}{" "}
            de un total de <strong>{conforme.cantidadCuotas}</strong> cuotas pactadas, por la suma de{" "}
            <strong>{formatCents(conforme.montoCuotaCents, "USD")}</strong>. Luego del presente pago restan{" "}
            <strong>{cuotasRestantes ?? "—"}</strong> cuotas pendientes. El pago fue realizado el día{" "}
            <strong>{new Date(conforme.fechaPago).toLocaleDateString("es-UY")}</strong> mediante{" "}
            <strong>{FORMA_PAGO_LABELS[conforme.formaPago]}</strong>, en concepto de financiación del vehículo{" "}
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
