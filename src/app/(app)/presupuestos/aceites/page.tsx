import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { AceitePredefinidoManager } from "@/components/presupuestos/AceitePredefinidoManager";
import { createAceitePredefinido, updateAceitePredefinido, deleteAceitePredefinido } from "../actions";

export default async function AceitesPredefinidosPage() {
  await assertCan("presupuestos.edit");

  const aceites = await db.aceitePredefinido.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/presupuestos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a Presupuestos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Catálogo de aceites</h1>
        <p className="text-sm text-muted-foreground">
          Precios precargados que aparecen al armar un presupuesto. Se pueden editar en cualquier momento.
        </p>
      </div>

      <AceitePredefinidoManager
        aceites={aceites}
        onCreate={createAceitePredefinido}
        onUpdate={updateAceitePredefinido}
        onDelete={deleteAceitePredefinido}
      />
    </div>
  );
}
