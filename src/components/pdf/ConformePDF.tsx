import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";
import { formatCents } from "@/lib/money";

export type ConformePdfData = {
  montoCuotaCents: number;
  fechaVencimiento: Date;
  cantidadCuotas: number;
  diaVencimientoMensual: number;
  vehiculoLabel: string;
  numeroCuota: number | null;
  firmantes: { nombre: string; ci: string | null }[];
};

export function ConformePDF({ data }: { data: ConformePdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Conforme de Pago" />

        <Text style={pdfStyles.paragraph}>
          Por el presente documento me/nos obligo/obligamos a pagar a Quiroga Automóviles la suma de{" "}
          <Text style={{ fontWeight: 700 }}>{formatCents(data.montoCuotaCents, "USD")}</Text>
          {data.numeroCuota ? ` correspondiente a la cuota N° ${data.numeroCuota}` : ""}, con vencimiento el día{" "}
          <Text style={{ fontWeight: 700 }}>{data.diaVencimientoMensual}</Text> de cada mes (
          <Text style={{ fontWeight: 700 }}>{new Date(data.fechaVencimiento).toLocaleDateString("es-UY")}</Text>
          ), hasta completar un total de <Text style={{ fontWeight: 700 }}>{data.cantidadCuotas}</Text> cuotas, en
          concepto de la financiación del vehículo <Text style={{ fontWeight: 700 }}>{data.vehiculoLabel}</Text>.
        </Text>

        <Text style={pdfStyles.paragraph}>
          El incumplimiento en el pago de dos o más cuotas consecutivas dará derecho a Quiroga Automóviles a exigir
          el pago del saldo total adeudado.
        </Text>

        <View style={pdfStyles.signaturesRow}>
          {data.firmantes.map((f, i) => (
            <View key={i} style={pdfStyles.signatureBox}>
              <View style={pdfStyles.signatureLine}>
                <Text style={pdfStyles.signatureName}>{f.nombre}</Text>
                {f.ci && <Text style={pdfStyles.signatureName}>CI: {f.ci}</Text>}
              </View>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
