import { assertCan } from "@/lib/permissions/engine";
import { EmpleadoForm } from "@/components/personal/EmpleadoForm";
import { createEmpleado } from "../actions";

export default async function NuevoEmpleadoPage() {
  await assertCan("personal.edit");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nuevo empleado</h1>
      </div>
      <EmpleadoForm action={createEmpleado} />
    </div>
  );
}
