import { Document, Page, View, Text } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";
import { formatCents } from "@/lib/money";

export type PromesaPdfData = {
  clienteNombre: string;
  clienteCi: string | null;
  vehiculoLabel: string;
  matricula: string | null;
  padron: string | null;
  precioVentaUsdCents: number;
  senaUsdCents: number;
  fechaSena: Date | null;
  fechaEntrega: Date | null;
};

export function PromesaPDF({ data }: { data: PromesaPdfData }) {
  const saldoUsdCents = data.precioVentaUsdCents - data.senaUsdCents;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Promesa de Compraventa" />

        <Text style={pdfStyles.paragraph}>
          Entre Quiroga Automóviles, en adelante &quot;la vendedora&quot;, y{" "}
          <Text style={{ fontWeight: 700 }}>
            {data.clienteNombre}
            {data.clienteCi ? `, CI ${data.clienteCi}` : ""}
          </Text>
          , en adelante &quot;el comprador&quot;, se acuerda la promesa de compraventa del siguiente vehículo:
        </Text>

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Vehículo</Text>
          <Text style={pdfStyles.value}>{data.vehiculoLabel}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Matrícula</Text>
          <Text style={pdfStyles.value}>{data.matricula ?? "—"}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Padrón</Text>
          <Text style={pdfStyles.value}>{data.padron ?? "—"}</Text>
        </View>

        <Text style={pdfStyles.section}>Condiciones económicas</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Precio de venta</Text>
          <Text style={pdfStyles.value}>{formatCents(data.precioVentaUsdCents, "USD")}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Seña</Text>
          <Text style={pdfStyles.value}>
            {formatCents(data.senaUsdCents, "USD")}
            {data.fechaSena ? ` (${new Date(data.fechaSena).toLocaleDateString("es-UY")})` : ""}
          </Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Saldo a la entrega</Text>
          <Text style={pdfStyles.value}>{formatCents(saldoUsdCents, "USD")}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.label}>Fecha de entrega</Text>
          <Text style={pdfStyles.value}>
            {data.fechaEntrega ? new Date(data.fechaEntrega).toLocaleDateString("es-UY") : "A convenir"}
          </Text>
        </View>

        <View style={pdfStyles.signaturesRow}>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>Quiroga Automóviles</Text>
            </View>
          </View>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>{data.clienteNombre}</Text>
            </View>
          </View>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
