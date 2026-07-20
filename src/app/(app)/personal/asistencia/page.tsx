import { db } from "@/lib/db";
import { assertCan, getCurrentUser, getEffectivePermissions } from "@/lib/permissions/engine";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AttendanceGrid } from "@/components/personal/AttendanceGrid";
import { AttendanceComments } from "@/components/personal/AttendanceComments";

function monthDays(year: number, month: number): string[] {
  const days: string[] = [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(Date.UTC(year, month - 1, d)).toISOString().slice(0, 10));
  }
  return days;
}

export default async function AsistenciaPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await assertCan("personal.view");
  const { mes } = await searchParams;

  const now = new Date();
  const [year, month] = mes
    ? mes.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const days = monthDays(year, month);
  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month, 1));

  const [empleados, asistencias, comentarios, user] = await Promise.all([
    db.empleado.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
    db.asistenciaDia.findMany({ where: { fecha: { gte: rangeStart, lt: rangeEnd } } }),
    db.comentarioAsistencia.findMany({ where: { anio: year, mes: month }, orderBy: { createdAt: "desc" } }),
    getCurrentUser(),
  ]);
  const perms = user ? await getEffectivePermissions(user.id) : new Set<string>();
  const editable = perms.has("personal.edit");

  const initialAttendance: Record<string, Record<string, "PRESENTE" | "MEDIO_DIA" | "LICENCIA" | "ENFERMO" | "AUSENTE">> = {};
  for (const a of asistencias) {
    const dayKey = a.fecha.toISOString().slice(0, 10);
    initialAttendance[a.empleadoId] ??= {};
    initialAttendance[a.empleadoId][dayKey] = a.estado;
  }

  const monthValue = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Asistencia</h1>
        <p className="text-sm text-muted-foreground">
          Hacé click en una celda para pasar por presente → medio día → licencia → enfermo → ausente.
        </p>
      </div>

      <form className="flex items-center gap-2">
        <Input name="mes" type="month" defaultValue={monthValue} className="w-48" />
        <Button type="submit" variant="outline">
          Cambiar mes
        </Button>
      </form>

      <AttendanceGrid empleados={empleados} days={days} initialAttendance={initialAttendance} editable={editable} />

      <AttendanceComments
        anio={year}
        mes={month}
        editable={editable}
        comentarios={comentarios.map((c) => ({
          id: c.id,
          texto: c.texto,
          autorNombre: c.autorNombre,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
