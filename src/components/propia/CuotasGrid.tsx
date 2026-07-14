"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { formatCents } from "@/lib/money";
import { marcarCuotaPagada } from "@/app/(app)/propia/actions";

export type CuotaData = {
  id: string;
  numero: number;
  montoCents: number;
  fechaVencimiento: Date;
  pagada: boolean;
};

export function CuotasGrid({
  financiacionId,
  cuotas,
  editable,
  canGenerateConforme,
  clienteNombre,
  clienteContacto,
  vehiculoLabel,
}: {
  financiacionId: string;
  cuotas: CuotaData[];
  editable: boolean;
  canGenerateConforme: boolean;
  clienteNombre?: string;
  clienteContacto?: string | null;
  vehiculoLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const today = new Date();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cuota</TableHead>
          <TableHead>Vencimiento</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pagada</TableHead>
          {canGenerateConforme && <TableHead>Recibo</TableHead>}
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {cuotas.map((c) => {
          const overdue = !c.pagada && new Date(c.fechaVencimiento) < today;
          const mensaje = `Hola ${clienteNombre ?? ""}, te escribimos de Quiroga Automóviles por la cuota N° ${c.numero} de tu financiación${vehiculoLabel ? ` del ${vehiculoLabel}` : ""}, por ${formatCents(c.montoCents, "USD")}, vencida el ${new Date(c.fechaVencimiento).toLocaleDateString("es-UY")}. ¿Podemos coordinar el pago?`;
          return (
            <TableRow key={c.id}>
              <TableCell>{c.numero}</TableCell>
              <TableCell>{new Date(c.fechaVencimiento).toLocaleDateString("es-UY")}</TableCell>
              <TableCell>{formatCents(c.montoCents, "USD")}</TableCell>
              <TableCell>
                {c.pagada ? (
                  <Badge variant="success">Pagada</Badge>
                ) : overdue ? (
                  <Badge variant="danger">Atrasada</Badge>
                ) : (
                  <Badge variant="neutral">Pendiente</Badge>
                )}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={c.pagada}
                  disabled={!editable || pending}
                  onCheckedChange={(checked) =>
                    startTransition(async () => {
                      await marcarCuotaPagada(financiacionId, c.id, checked === true);
                      router.refresh();
                    })
                  }
                />
              </TableCell>
              {canGenerateConforme && (
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/propia/${financiacionId}/conforme/${c.id}`}>
                      <FileText className="h-3.5 w-3.5" />
                      Generar
                    </a>
                  </Button>
                </TableCell>
              )}
              <TableCell>
                {overdue && <WhatsAppButton phone={clienteContacto} message={mensaje} label="Avisar" />}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
