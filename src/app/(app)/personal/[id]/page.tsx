import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { computeMonthlyPay } from "@/lib/nomina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DescuentosPanel } from "@/components/personal/DescuentosPanel";
import { addDescuento, deleteDescuento } from "../actions";

export default async function EmpleadoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("personal.view");
  const { id } = await params;

  const empleado = await db.empleado.findUnique({ where: { id } });
  if (!empleado) notFound();

  const now = new Date();
  const rangeStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const rangeEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));

  const [asistencias, descuentos, user] = await Promise.all([
    db.asistenciaDia.findMany({ where: { empleadoId: id, fecha: { gte: rangeStart, lt: rangeEnd } } }),
    db.descuentoEmpleado.findMany({ where: { empleadoId: id, fecha: { gte: rangeStart, lt: rangeEnd } }, orderBy: { fecha: "desc" } }),
    getCurrentUser(),
  ]);
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("personal.edit");

  // Descuentos may be in UYU or USD; sum in the employee's own pay currency (UYU) by
  // treating USD lines at face value is wrong, so we only total same-currency
  // amounts here and show mixed-currency lines individually in the table below.
  const descuentosCents = descuentos.filter((d) => d.moneda === "UYU").reduce((sum, d) => sum + d.montoCents, 0);

  const pago = computeMonthlyPay(empleado, asistencias, descuentosCents);

  const allDescuentos = await db.descuentoEmpleado.findMany({ where: { empleadoId: id }, orderBy: { fecha: "desc" } });

  const boundAdd = addDescuento.bind(null, id);
  const boundDelete = deleteDescuento.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/personal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {empleado.nombre} {empleado.apellido ?? ""}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sueldo del mes actual</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Días trabajados" value={pago.diasTrabajados.toString()} />
          <Stat label="Sueldo base" value={formatCents(pago.basePayCents, "UYU")} />
          <Stat label="Descuentos ($)" value={formatCents(pago.descuentosCents, "UYU")} danger={pago.descuentosCents > 0} />
          <Stat label="Total a cobrar" value={formatCents(pago.totalCents, "UYU")} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Adelantos y descuentos</h2>
        <DescuentosPanel descuentos={allDescuentos} editable={editable} onAdd={boundAdd} onDelete={boundDelete} />
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${danger ? "text-danger" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
