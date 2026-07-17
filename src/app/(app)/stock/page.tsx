import Link from "next/link";
import type { Ubicacion, EstadoVehiculo } from "@prisma/client";
import { Plus, ArrowUpDown, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan, can } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/stock/StatusBadge";
import { StockSortSelect } from "@/components/stock/StockSortSelect";
import { StockDraggableBody } from "@/components/stock/StockDraggableBody";
import { Can } from "@/components/auth/Can";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { restoreVehiculo } from "./actions";

type SearchParams = {
  q?: string;
  sortCombo?: string;
  tab?: string;
  ubicacion?: string;
  estado?: string;
  marca?: string;
  modelo?: string;
};

const UBICACION_OPTIONS: { value: string; label: string }[] = [
  { value: "SAN_LUIS", label: "San Luis" },
  { value: "ZONAMERICA", label: "Zonamérica" },
  { value: "PROPIETARIO", label: "Propietario" },
  { value: "TALLER", label: "Taller" },
];

const ESTADO_OPTIONS: { value: string; label: string }[] = [
  { value: "PUBLICADO", label: "Publicado" },
  { value: "SENADO", label: "Señado" },
  { value: "APRONTANDO", label: "Taller" },
];

const SORT_FIELD_MAP: Record<string, string> = {
  manual: "orden",
  fechaIngreso: "fechaIngreso",
  precio: "precioVentaUsdCents",
  marca: "marca",
};

// Por defecto se muestra el orden manual (el que se arma con drag & drop).
function parseSortCombo(sortCombo: string | undefined): { key: string; field: string; dir: "asc" | "desc" } {
  const [key, dir] = (sortCombo ?? "manual_asc").split("_");
  const field = SORT_FIELD_MAP[key] ?? "orden";
  return { key, field, dir: dir === "desc" ? "desc" : "asc" };
}

function sortLink(sp: SearchParams, current: ReturnType<typeof parseSortCombo>, key: string, label: string) {
  const nextDir = current.key === key && current.dir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.ubicacion) params.set("ubicacion", sp.ubicacion);
  if (sp.estado) params.set("estado", sp.estado);
  if (sp.marca) params.set("marca", sp.marca);
  if (sp.modelo) params.set("modelo", sp.modelo);
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
  // El drag & drop solo tiene sentido cuando el listado está en orden manual.
  const puedeOrdenar = (await can("stock.edit_vehicle_fields")) && sortInfo.key === "manual";

  const [vehiculos, accesorios, archivados, marcasRows, modelosRows] = await Promise.all([
    db.vehiculo.findMany({
      where: {
        esVehiculo: true,
        archivedAt: null,
        ...(sp.ubicacion ? { ubicacion: sp.ubicacion as Ubicacion } : {}),
        ...(sp.estado ? { estado: sp.estado as EstadoVehiculo } : {}),
        ...(sp.marca ? { marca: sp.marca } : {}),
        ...(sp.modelo ? { modelo: sp.modelo } : {}),
        ...(sp.q
          ? {
              OR: [
                { marca: { contains: sp.q, mode: "insensitive" } },
                { modelo: { contains: sp.q, mode: "insensitive" } },
                { matricula: { contains: sp.q, mode: "insensitive" } },
                { motor: { contains: sp.q, mode: "insensitive" } },
                { chasis: { contains: sp.q, mode: "insensitive" } },
                { ventas: { some: { cliente: { OR: [{ nombre: { contains: sp.q, mode: "insensitive" } }, { apellido: { contains: sp.q, mode: "insensitive" } }] } } } },
              ],
            }
          : {}),
      },
      orderBy: { [sortInfo.field]: sortInfo.dir },
    }),
    db.vehiculo.findMany({ where: { esVehiculo: false, archivedAt: null }, orderBy: { marca: "asc" } }),
    db.vehiculo.findMany({ where: { archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      distinct: ["marca"],
      select: { marca: true },
      orderBy: { marca: "asc" },
    }),
    db.vehiculo.findMany({
      where: { esVehiculo: true, archivedAt: null },
      distinct: ["modelo"],
      select: { modelo: true },
      orderBy: { modelo: "asc" },
    }),
  ]);

  const marcas = marcasRows.map((m) => m.marca);
  const modelos = modelosRows.map((m) => m.modelo);
  const hayFiltros = Boolean(sp.ubicacion || sp.estado || sp.marca || sp.modelo);

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
            <form className="flex flex-wrap items-end gap-2">
              <Input
                name="q"
                placeholder="Buscar por matrícula, marca/modelo, cliente, motor o chasis…"
                defaultValue={sp.q}
                className="w-72"
              />
              <select
                name="ubicacion"
                defaultValue={sp.ubicacion ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Ubicación: todas</option>
                {UBICACION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                name="estado"
                defaultValue={sp.estado ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Estado: todos</option>
                {ESTADO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                name="marca"
                defaultValue={sp.marca ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Marca: todas</option>
                {marcas.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                name="modelo"
                defaultValue={sp.modelo ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Modelo: todos</option>
                {modelos.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <StockSortSelect defaultValue={`${sortInfo.key}_${sortInfo.dir}`} />
              <Button type="submit" variant="outline">
                Filtrar
              </Button>
              {(hayFiltros || sp.q) && (
                <Button variant="ghost" asChild>
                  <Link href="/stock">Limpiar</Link>
                </Button>
              )}
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

          {puedeOrdenar && (
            <p className="text-xs text-muted-foreground">
              Arrastrá las filas desde el ícono <span className="font-medium">⠿</span> para ordenar los vehículos como
              quieras. El orden se guarda y se mantiene aunque cambies los filtros.
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {puedeOrdenar && <TableHead className="w-8" />}
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
            <StockDraggableBody
              draggable={puedeOrdenar}
              colSpan={puedeOrdenar ? 10 : 9}
              rows={vehiculos.map((v) => ({
                id: v.id,
                marca: v.marca,
                modelo: v.modelo,
                version: v.version,
                anio: v.anio,
                color: v.color,
                km: v.km,
                ubicacion: v.ubicacion,
                estado: v.estado,
                precioVentaUsdCents: v.precioVentaUsdCents,
                matricula: v.matricula,
                fechaIngreso: v.fechaIngreso.toISOString(),
              }))}
            />
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
