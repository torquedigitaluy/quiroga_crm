import Link from "next/link";
import type { EstadoVehiculo, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { formatCents } from "@/lib/money";
import { computeCosteo } from "@/lib/costeo";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/stock/StatusBadge";
import { CostosSortSelect } from "@/components/costos/CostosSortSelect";
import { PROPIETARIO_OPTIONS } from "@/lib/propietarios";
import { Card, CardContent } from "@/components/ui/card";

type SearchParams = {
  q?: string;
  sortCombo?: string;
  estado?: string;
  marca?: string;
  modelo?: string;
  propietario?: string;
};

const ESTADO_OPTIONS: { value: string; label: string }[] = [
  { value: "PUBLICADO", label: "Publicado" },
  { value: "SENADO", label: "Señado" },
  { value: "APRONTANDO", label: "Taller" },
  { value: "VENDIDO", label: "Vendido" },
];

const SORT_FIELD_MAP: Record<string, string> = {
  marca: "marca",
  fechaIngreso: "fechaIngreso",
};

function parseSortCombo(sortCombo: string | undefined): { key: string; field: string; dir: "asc" | "desc" } {
  const [key, dir] = (sortCombo ?? "marca_asc").split("_");
  const field = SORT_FIELD_MAP[key] ?? "marca";
  return { key, field, dir: dir === "desc" ? "desc" : "asc" };
}

function StatCard({ label, value, variant = "default" }: { label: string; value: string; variant?: "default" | "success" | "danger" }) {
  const color = variant === "success" ? "text-success" : variant === "danger" ? "text-danger" : "text-foreground";
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`text-lg font-semibold ${color}`}>{value}</span>
      </CardContent>
    </Card>
  );
}

export default async function CostosIndexPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await assertCan("costos.view");
  const sp = await searchParams;
  const sortInfo = parseSortCombo(sp.sortCombo);

  const where: Prisma.VehiculoWhereInput = {
    esVehiculo: true,
    archivedAt: null,
    ...(sp.estado ? { estado: sp.estado as EstadoVehiculo } : {}),
    ...(sp.marca ? { marca: sp.marca } : {}),
    ...(sp.modelo ? { modelo: sp.modelo } : {}),
    ...(sp.propietario ? { propietario: sp.propietario } : {}),
    ...(sp.q
      ? {
          OR: [
            { marca: { contains: sp.q, mode: "insensitive" } },
            { modelo: { contains: sp.q, mode: "insensitive" } },
            { matricula: { contains: sp.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [vehiculos, config, marcasRows, modelosRows] = await Promise.all([
    db.vehiculo.findMany({
      where,
      include: { costeo: { include: { gastos: true } } },
      orderBy: { [sortInfo.field]: sortInfo.dir },
    }),
    db.configuracion.findUnique({ where: { id: 1 } }),
    db.vehiculo.findMany({ where: { esVehiculo: true, archivedAt: null }, distinct: ["marca"], select: { marca: true }, orderBy: { marca: "asc" } }),
    db.vehiculo.findMany({ where: { esVehiculo: true, archivedAt: null }, distinct: ["modelo"], select: { modelo: true }, orderBy: { modelo: "asc" } }),
  ]);
  const configRateMicros = config?.tipoCambioGlobalMicros ?? 400000;

  const marcas = marcasRows.map((m) => m.marca);
  const modelos = modelosRows.map((m) => m.modelo);

  const computados = vehiculos.map((v) =>
    v.costeo
      ? computeCosteo(v.costeo, v.costeo.gastos, configRateMicros, {
          patenteCuotaCents: v.patenteCuotaCents,
          patenteNoSumar: v.patenteNoSumar,
        })
      : null,
  );
  const totalGastos = computados.reduce((sum, c) => sum + (c?.totalGastosUsdCents ?? 0), 0);
  const totalGanancia = computados.reduce((sum, c) => sum + (c?.gananciaFinalUsdCents ?? 0), 0);
  const totalCosto = computados.reduce((sum, c) => sum + (c?.costoTotalUsdCents ?? 0), 0);
  const totalVentaReal = vehiculos.reduce((sum, v) => sum + (v.costeo?.precioVentaRealUsdCents ?? 0), 0);

  const hayFiltros = Boolean(sp.q || sp.estado || sp.marca || sp.modelo || sp.propietario);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Costos de Vehículos</h1>
          <p className="text-sm text-muted-foreground">
            Costo, precio ideal y ganancia por vehículo · {vehiculos.length} vehículo{vehiculos.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard label="Total gastos" value={formatCents(totalGastos, "USD")} />
          <StatCard label="Total ganancia" value={formatCents(totalGanancia, "USD")} variant={totalGanancia < 0 ? "danger" : "success"} />
          <StatCard label="Costo total" value={formatCents(totalCosto, "USD")} />
          <StatCard label="Total venta real" value={formatCents(totalVentaReal, "USD")} />
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-2">
        <Input name="q" placeholder="Buscar por marca, modelo o matrícula…" defaultValue={sp.q} className="w-64" />
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
          name="propietario"
          defaultValue={sp.propietario ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="">Propietario: todos</option>
          {PROPIETARIO_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <CostosSortSelect defaultValue={`${sortInfo.key}_${sortInfo.dir}`} />
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
        {hayFiltros && (
          <Button variant="ghost" asChild>
            <Link href="/costos">Limpiar</Link>
          </Button>
        )}
      </form>

      <Table containerClassName="max-h-[70vh] overflow-y-auto overscroll-contain">
        <TableHeader className="sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Costo total</TableHead>
            <TableHead>Precio venta ideal</TableHead>
            <TableHead>Precio venta real</TableHead>
            <TableHead>Ganancia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((v, i) => {
            const computed = computados[i];
            return (
              <TableRow key={v.id}>
                <TableCell>
                  <Link href={`/costos/${v.id}`} className="font-medium text-foreground hover:text-brand">
                    {v.marca} {v.modelo} {v.matricula ? `(${v.matricula})` : ""}
                  </Link>
                </TableCell>
                <TableCell>{v.propietario ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge estado={v.estado} />
                </TableCell>
                <TableCell>{computed ? formatCents(computed.costoTotalUsdCents, "USD") : "—"}</TableCell>
                <TableCell>{computed ? formatCents(computed.precioVentaIdealUsdCents, "USD") : "—"}</TableCell>
                <TableCell>{v.costeo ? formatCents(v.costeo.precioVentaRealUsdCents, "USD") : "—"}</TableCell>
                <TableCell className={computed && computed.gananciaFinalUsdCents < 0 ? "text-danger" : "text-success"}>
                  {computed ? formatCents(computed.gananciaFinalUsdCents, "USD") : "—"}
                </TableCell>
              </TableRow>
            );
          })}
          {vehiculos.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No hay vehículos que coincidan con los filtros.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
