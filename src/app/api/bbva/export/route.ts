import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";

export async function GET() {
  await assertCan("bbva.view");

  const creditos = await db.creditoBBVA.findMany({
    where: { archivedAt: null },
    orderBy: { nombre: "asc" },
    select: { nombre: true, ci: true },
  });

  const rows = creditos.map((c) => ({ "Nombre del cliente": c.nombre, "Cédula de identidad": c.ci ?? "" }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Créditos BBVA");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="creditos-bbva.xlsx"',
    },
  });
}
