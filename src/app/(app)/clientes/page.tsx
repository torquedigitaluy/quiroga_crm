import Link from "next/link";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await assertCan("clientes.view");
  const { q } = await searchParams;

  const clientes = q
    ? await db.cliente.findMany({
        where: {
          OR: [
            { nombre: { contains: q } },
            { apellido: { contains: q } },
            { ci: { contains: q } },
            { contacto: { contains: q } },
          ],
        },
        orderBy: { nombre: "asc" },
        take: 50,
      })
    : await db.cliente.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Buscador de Clientes</h1>
        <p className="text-sm text-muted-foreground">Buscá por nombre, apellido, cédula o contacto.</p>
      </div>

      <form action="/clientes" className="flex items-center gap-2">
        <Input name="q" placeholder="Nombre, apellido, CI o contacto…" defaultValue={q} className="w-96" />
        <Button type="submit">Buscar</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Contacto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/clientes/${c.id}`} className="font-medium text-foreground hover:text-brand">
                  {c.nombre} {c.apellido ?? ""}
                </Link>
              </TableCell>
              <TableCell>{c.ci ?? "—"}</TableCell>
              <TableCell>{c.contacto ?? "—"}</TableCell>
            </TableRow>
          ))}
          {clientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                {q ? "No se encontraron clientes." : "No hay clientes cargados todavía."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
