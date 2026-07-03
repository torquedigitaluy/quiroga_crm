import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ConformeForm } from "@/components/propia/ConformeForm";
import { generateConforme } from "@/app/(app)/propia/actions";

export default async function GenerarConformePage({
  params,
}: {
  params: Promise<{ id: string; cuotaId: string }>;
}) {
  await assertCan("conforme.generate");
  const { id, cuotaId } = await params;

  const financiacion = await db.financiacionPropia.findUnique({ where: { id }, include: { cliente: true } });
  if (!financiacion) notFound();

  const boundAction = generateConforme.bind(null, id, cuotaId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Generar conforme</h1>
        <p className="text-sm text-muted-foreground">
          Plan de {financiacion.nombre} — cuota a firmar por el/los firmante(s).
        </p>
      </div>
      <ConformeForm defaultFirmante={financiacion.nombre} action={boundAction} />
    </div>
  );
}
