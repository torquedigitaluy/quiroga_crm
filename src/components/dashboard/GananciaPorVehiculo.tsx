"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCents } from "@/lib/money";

export type GananciaRow = {
  vehiculoId: string;
  label: string;
  costoTotalCents: number;
  precioVentaCents: number;
  gananciaCents: number;
};

export function GananciaPorVehiculo({ rows }: { rows: GananciaRow[] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Ganancia por Vehículo</CardTitle>
          <CardDescription>Costo total, precio de venta y ganancia de cada unidad vendida.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRevealed((r) => !r)}>
          {revealed ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Ocultar
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Ver detalle
            </>
          )}
        </Button>
      </CardHeader>
      {revealed && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Costo total</TableHead>
                <TableHead>Precio de venta</TableHead>
                <TableHead>Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.vehiculoId}>
                  <TableCell>
                    <Link href={`/costos/${r.vehiculoId}`} className="font-medium text-foreground hover:text-brand">
                      {r.label}
                    </Link>
                  </TableCell>
                  <TableCell>{formatCents(r.costoTotalCents, "USD")}</TableCell>
                  <TableCell>{formatCents(r.precioVentaCents, "USD")}</TableCell>
                  <TableCell className={r.gananciaCents >= 0 ? "text-success" : "text-danger"}>
                    {formatCents(r.gananciaCents, "USD")}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Sin vehículos vendidos todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
