import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";
import { formatCents } from "@/lib/money";

export type ConformePdfData = {
  montoCuotaCents: number;
  fechaPago: Date;
  formaPago: string;
  cantidadCuotas: number;
  vehiculoLabel: string;
  numeroCuota: number | null;
  cuotasRestantes: number | null;
  firmantes: { nombre: string; ci: string | null }[];
};

const FORMA_PAGO_LABELS: Record<string, string> = { CONTADO: "Contado", TRANSFERENCIA: "Transferencia" };

export function ConformePDF({ data }: { data: ConformePdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Recibo de Pago" />

        <Text style={pdfStyles.paragraph}>
          Se recibe el pago correspondiente a la cuota{" "}
          {data.numeroCuota ? <Text style={{ fontWeight: 700 }}>N° {data.numeroCuota} </Text> : ""}
          de un total de <Text style={{ fontWeight: 700 }}>{data.cantidadCuotas}</Text> cuotas pactadas, por la suma
          de <Text style={{ fontWeight: 700 }}>{formatCents(data.montoCuotaCents, "USD")}</Text>. Luego del presente
          pago restan <Text style={{ fontWeight: 700 }}>{data.cuotasRestantes ?? "—"}</Text> cuotas pendientes. El
          pago fue realizado el día{" "}
          <Text style={{ fontWeight: 700 }}>{new Date(data.fechaPago).toLocaleDateString("es-UY")}</Text> mediante{" "}
          <Text style={{ fontWeight: 700 }}>{FORMA_PAGO_LABELS[data.formaPago] ?? data.formaPago}</Text>, en concepto
          de la financiación del vehículo <Text style={{ fontWeight: 700 }}>{data.vehiculoLabel}</Text>.
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
