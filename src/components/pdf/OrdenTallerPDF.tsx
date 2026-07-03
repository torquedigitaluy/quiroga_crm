import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

export type OrdenTallerPdfData = {
  vehiculoLabel: string;
  matricula: string | null;
  fechaIngreso: Date;
  trabajos: string;
  repuestos: string | null;
  responsable: string | null;
};

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
          <Text style={pdfStyles.label}>Fecha de ingreso</Text>
          <Text style={pdfStyles.value}>{new Date(data.fechaIngreso).toLocaleDateString("es-UY")}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Responsable</Text>
          <Text style={pdfStyles.value}>{data.responsable ?? "—"}</Text>
        </View>

        <Text style={pdfStyles.section}>Trabajos solicitados</Text>
        <Text style={pdfStyles.paragraph}>{data.trabajos}</Text>

        {data.repuestos && (
          <>
            <Text style={pdfStyles.section}>Repuestos</Text>
            <Text style={pdfStyles.paragraph}>{data.repuestos}</Text>
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
