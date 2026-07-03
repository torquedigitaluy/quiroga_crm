import Link from "next/link";
import { Plus, ArrowUpDown } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge, UbicacionBadge } from "@/components/stock/StatusBadge";
import { Can } from "@/components/auth/Can";

type SearchParams = { q?: string; sort?: string; dir?: string };

function sortLink(current: SearchParams, sort: string, label: string) {
  const nextDir = current.sort === sort && current.dir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (current.q) params.set("q", current.q);
  params.set("sort", sort);
  params.set("dir", nextDir);
  const active = current.sort === sort || (!current.sort && sort === "fechaIngreso");
  return (
    <Link
      href={`/stock?${params.toString()}`}
      className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-brand" : ""}`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </Link>
  );
}

export default async function StockPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await assertCan("stock.view");
  const sp = await searchParams;

  const sortField = sp.sort === "precio" ? "precioVentaUsdCents" : sp.sort === "marca" ? "marca" : "fechaIngreso";
  const dir = sp.dir === "desc" ? "desc" : sp.sort ? "asc" : "asc";

  const vehiculos = await db.vehiculo.findMany({
    where: {
      esVehiculo: true,
      ...(sp.q
        ? {
            OR: [
              { marca: { contains: sp.q } },
              { modelo: { contains: sp.q } },
              { matricula: { contains: sp.q } },
            ],
          }
        : {}),
    },
    orderBy: { [sortField]: dir },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Stock</h1>
          <p className="text-sm text-muted-foreground">{vehiculos.length} vehículos en stock</p>
        </div>
        <Can permission="stock.create">
          <Button asChild>
            <Link href="/stock/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo vehículo
            </Link>
          </Button>
        </Can>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex items-center gap-2">
          <input type="hidden" name="sort" value={sp.sort ?? ""} />
          <input type="hidden" name="dir" value={sp.dir ?? ""} />
          <Input name="q" placeholder="Buscar por marca, modelo o matrícula…" defaultValue={sp.q} className="w-72" />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{sortLink(sp, "marca", "Marca / Modelo")}</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Km</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>{sortLink(sp, "precio", "Precio")}</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>{sortLink(sp, "fechaIngreso", "Ingreso")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((v) => (
            <TableRow key={v.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/stock/${v.id}`} className="font-medium text-foreground hover:text-brand">
                  {v.marca} {v.modelo}
                </Link>
                {v.version && <div className="text-xs text-muted-foreground">{v.version}</div>}
              </TableCell>
              <TableCell>{v.anio ?? "—"}</TableCell>
              <TableCell>{v.color ?? "—"}</TableCell>
              <TableCell>{v.km?.toLocaleString("es-UY") ?? "—"}</TableCell>
              <TableCell>
                <UbicacionBadge ubicacion={v.ubicacion} />
              </TableCell>
              <TableCell>
                <StatusBadge estado={v.estado} />
              </TableCell>
              <TableCell>{v.precioVentaUsdCents ? formatCents(v.precioVentaUsdCents, "USD") : "—"}</TableCell>
              <TableCell>{v.matricula ?? "—"}</TableCell>
              <TableCell>{new Date(v.fechaIngreso).toLocaleDateString("es-UY")}</TableCell>
            </TableRow>
          ))}
          {vehiculos.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                No hay vehículos que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
