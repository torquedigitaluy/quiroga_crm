import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

export type OrdenTallerPdfData = {
  vehiculoLabel: string;
  matricula: string | null;
  tipoServicio: string;
  estado: string;
  fechaIngreso: Date;
  fechaFinalizacion: Date | null;
  problema: string;
  trabajosRealizados: string | null;
  observaciones: string | null;
  responsable: string | null;
  manoDeObraCents: number;
  repuestos: { codigo: string | null; descripcion: string; cantidad: number; precioUnitCents: number; moneda: string }[];
  gastos: { descripcion: string; montoCents: number; moneda: string }[];
  checklist: { tarea: string; hecho: boolean }[];
};

function money(cents: number, moneda: string): string {
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "USD" ? "U$S" : "$"} ${amount}`;
}

export function OrdenTallerPDF({ data }: { data: OrdenTallerPdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Orden de Trabajo — Taller" />

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Vehículo</Text>
          <Text style={pdfStyles.value}>{data.vehiculoLabel}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Matrícula</Text>
          <Text style={pdfStyles.value}>{data.matricula ?? "—"}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Tipo de servicio</Text>
          <Text style={pdfStyles.value}>{data.tipoServicio}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Estado</Text>
          <Text style={pdfStyles.value}>{data.estado}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Fecha de ingreso</Text>
          <Text style={pdfStyles.value}>{new Date(data.fechaIngreso).toLocaleDateString("es-UY")}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Fecha de finalización</Text>
          <Text style={pdfStyles.value}>
            {data.fechaFinalizacion ? new Date(data.fechaFinalizacion).toLocaleDateString("es-UY") : "—"}
          </Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Responsable</Text>
          <Text style={pdfStyles.value}>{data.responsable ?? "—"}</Text>
        </View>

        <Text style={pdfStyles.section}>Problema / lo que tiene</Text>
        <Text style={pdfStyles.paragraph}>{data.problema}</Text>

        {data.trabajosRealizados && (
          <>
            <Text style={pdfStyles.section}>Trabajos realizados</Text>
            <Text style={pdfStyles.paragraph}>{data.trabajosRealizados}</Text>
          </>
        )}

        {data.repuestos.length > 0 && (
          <>
            <Text style={pdfStyles.section}>Repuestos</Text>
            {data.repuestos.map((r, i) => (
              <Text key={i} style={pdfStyles.paragraph}>
                {r.codigo ? `[${r.codigo}] ` : ""}
                {r.descripcion} — x{r.cantidad} — {money(r.precioUnitCents * r.cantidad, r.moneda)}
              </Text>
            ))}
          </>
        )}

        {data.gastos.length > 0 && (
          <>
            <Text style={pdfStyles.section}>Gastos extra</Text>
            {data.gastos.map((g, i) => (
              <Text key={i} style={pdfStyles.paragraph}>
                {g.descripcion} — {money(g.montoCents, g.moneda)}
              </Text>
            ))}
          </>
        )}

        {data.manoDeObraCents > 0 && (
          <>
            <Text style={pdfStyles.section}>Mano de obra</Text>
            <Text style={pdfStyles.paragraph}>{money(data.manoDeObraCents, "UYU")}</Text>
          </>
        )}

        {data.checklist.length > 0 && (
          <>
            <Text style={pdfStyles.section}>Checklist</Text>
            {data.checklist.map((c, i) => (
              <Text key={i} style={pdfStyles.paragraph}>
                [{c.hecho ? "X" : " "}] {c.tarea}
              </Text>
            ))}
          </>
        )}

        {data.observaciones && (
          <>
            <Text style={pdfStyles.section}>Observaciones</Text>
            <Text style={pdfStyles.paragraph}>{data.observaciones}</Text>
          </>
        )}

        <View style={pdfStyles.signaturesRow}>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>Responsable de taller</Text>
            </View>
          </View>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
