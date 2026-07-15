import Link from "next/link";
import { Plus, ArrowUpDown, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge, UbicacionBadge } from "@/components/stock/StatusBadge";
import { StockSortSelect } from "@/components/stock/StockSortSelect";
import { Can } from "@/components/auth/Can";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { restoreVehiculo } from "./actions";

type SearchParams = { q?: string; sortCombo?: string; tab?: string };

const SORT_FIELD_MAP: Record<string, string> = {
  fechaIngreso: "fechaIngreso",
  precio: "precioVentaUsdCents",
  marca: "marca",
};

function parseSortCombo(sortCombo: string | undefined): { key: string; field: string; dir: "asc" | "desc" } {
  const [key, dir] = (sortCombo ?? "fechaIngreso_asc").split("_");
  const field = SORT_FIELD_MAP[key] ?? "fechaIngreso";
  return { key, field, dir: dir === "desc" ? "desc" : "asc" };
}

function sortLink(sp: SearchParams, current: ReturnType<typeof parseSortCombo>, key: string, label: string) {
  const nextDir = current.key === key && current.dir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  params.set("sortCombo", `${key}_${nextDir}`);
  const active = current.key === key;
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
  const sortInfo = parseSortCombo(sp.sortCombo);
  const puedeVender = await can("ventas.create");
  const puedeArchivar = await can("stock.delete");

  const [vehiculos, accesorios, archivados] = await Promise.all([
    db.vehiculo.findMany({
      where: {
        esVehiculo: true,
        archivedAt: null,
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
      orderBy: { [sortInfo.field]: sortInfo.dir },
    }),
    db.vehiculo.findMany({ where: { esVehiculo: false, archivedAt: null }, orderBy: { marca: "asc" } }),
    db.vehiculo.findMany({ where: { archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Stock</h1>
          <p className="text-sm text-muted-foreground">{vehiculos.length} vehículos en stock</p>
        </div>
      </div>

      <Tabs defaultValue={sp.tab === "accesorios" ? "accesorios" : sp.tab === "archivo" ? "archivo" : "vehiculos"}>
        <TabsList>
          <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
          <TabsTrigger value="accesorios">Accesorios</TabsTrigger>
          {puedeArchivar && <TabsTrigger value="archivo">Archivo ({archivados.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="vehiculos" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <form className="flex flex-wrap items-center gap-2">
              <Input name="q" placeholder="Buscar por marca, modelo o matrícula…" defaultValue={sp.q} className="w-64" />
              <StockSortSelect defaultValue={`${sortInfo.key}_${sortInfo.dir}`} />
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </form>
            <Can permission="stock.create">
              <Button asChild>
                <Link href="/stock/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo vehículo
                </Link>
              </Button>
            </Can>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{sortLink(sp, sortInfo, "marca", "Marca / Modelo")}</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Km</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>{sortLink(sp, sortInfo, "precio", "Precio")}</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>{sortLink(sp, sortInfo, "fechaIngreso", "Ingreso")}</TableHead>
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
        </TabsContent>

        <TabsContent value="accesorios" className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <Can permission="stock.create">
              <Button asChild>
                <Link href="/stock/accesorios/nuevo">
                  <Plus className="h-4 w-4" />
                  Nuevo accesorio
                </Link>
              </Button>
            </Can>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comentarios</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accesorios.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link href={`/stock/${a.id}`} className="hover:text-brand">
                      {a.marca}
                    </Link>
                  </TableCell>
                  <TableCell>{a.modelo}</TableCell>
                  <TableCell>{a.precioVentaUsdCents ? formatCents(a.precioVentaUsdCents, "USD") : "—"}</TableCell>
                  <TableCell>
                    <StatusBadge estado={a.estado} />
                  </TableCell>
                  <TableCell>{a.comentarios ?? "—"}</TableCell>
                  <TableCell>
                    {puedeVender && a.estado !== "VENDIDO" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/ventas/accesorios/nueva?accesorioId=${a.id}`}>
                          <Tag className="h-3.5 w-3.5" />
                          Vender
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {accesorios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No hay accesorios cargados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {puedeArchivar && (
          <TabsContent value="archivo" className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Vehículos y accesorios eliminados. Se pueden restaurar en cualquier momento.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Eliminado</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivados.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-foreground">
                      {v.marca} {v.modelo}
                    </TableCell>
                    <TableCell>{v.matricula ?? "—"}</TableCell>
                    <TableCell>{v.esVehiculo ? "Vehículo" : "Accesorio"}</TableCell>
                    <TableCell>{v.archivedAt ? new Date(v.archivedAt).toLocaleDateString("es-UY") : "—"}</TableCell>
                    <TableCell>
                      <RestoreButton onConfirm={restoreVehiculo.bind(null, v.id)} />
                    </TableCell>
                  </TableRow>
                ))}
                {archivados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No hay vehículos ni accesorios eliminados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
