import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";
import { formatCents } from "@/lib/money";

// El Conforme es un RECIBO DE PAGO simple, para enviar al cliente (p.ej. por
// WhatsApp) como comprobante de la cuota pagada. El compromiso legal completo
// vive en el documento "Vale".

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metaItem: { fontSize: 10, color: "#667085" },
  metaValue: { fontWeight: 700, color: "#1A1D29" },
  cuerpo: { fontSize: 12, lineHeight: 1.7, marginBottom: 20 },
  bold: { fontWeight: 700 },
  resumen: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    border: "1 solid #E3E6EC",
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
  celda: { width: "45%", marginBottom: 4 },
  celdaLabel: { fontSize: 8, color: "#667085", textTransform: "uppercase" },
  celdaValue: { fontSize: 12, fontWeight: 700, color: "#1A1D29" },
  emisor: { marginTop: 8, fontSize: 10, color: "#667085" },
  emisorNombre: { fontSize: 11, fontWeight: 700, color: "#1A1D29" },
});

export type ConformePdfData = {
  numeroRecibo: number;
  montoCuotaCents: number;
  montoEnLetras: string | null;
  numeroCuota: number | null;
  cantidadCuotas: number;
  fechaPago: Date;
  personaNombre: string;
  vehiculoLabel: string | null;
};

export function ConformePDF({ data }: { data: ConformePdfData }) {
  const restantes =
    data.numeroCuota !== null ? Math.max(data.cantidadCuotas - data.numeroCuota, 0) : null;
  const montoTexto = formatCents(data.montoCuotaCents, "USD");
  const letras = data.montoEnLetras ? ` (${data.montoEnLetras} dólares americanos)` : "";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Recibo de Pago" />

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            Recibo N°: <Text style={styles.metaValue}>{data.numeroRecibo}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Fecha: <Text style={styles.metaValue}>{new Date(data.fechaPago).toLocaleDateString("es-UY")}</Text>
          </Text>
        </View>

        <Text style={styles.cuerpo}>
          Se recibe de <Text style={styles.bold}>{data.personaNombre}</Text> la suma de{" "}
          <Text style={styles.bold}>{montoTexto}</Text>
          {letras}, correspondiente a la cuota{" "}
          <Text style={styles.bold}>N° {data.numeroCuota ?? "—"}</Text> de{" "}
          <Text style={styles.bold}>{data.cantidadCuotas}</Text>
          {data.vehiculoLabel ? (
            <>
              {" "}
              de la financiación del vehículo <Text style={styles.bold}>{data.vehiculoLabel}</Text>
            </>
          ) : null}
          .{" "}
          {restantes !== null && (
            <>
              Luego del presente pago restan <Text style={styles.bold}>{restantes}</Text>{" "}
              {restantes === 1 ? "cuota pendiente" : "cuotas pendientes"}.
            </>
          )}
        </Text>

        <View style={styles.resumen}>
          <View style={styles.celda}>
            <Text style={styles.celdaLabel}>Monto pagado</Text>
            <Text style={styles.celdaValue}>{montoTexto}</Text>
          </View>
          <View style={styles.celda}>
            <Text style={styles.celdaLabel}>Cuota</Text>
            <Text style={styles.celdaValue}>
              {data.numeroCuota ?? "—"} de {data.cantidadCuotas}
            </Text>
          </View>
          <View style={styles.celda}>
            <Text style={styles.celdaLabel}>Cuotas restantes</Text>
            <Text style={styles.celdaValue}>{restantes ?? "—"}</Text>
          </View>
          <View style={styles.celda}>
            <Text style={styles.celdaLabel}>Fecha de pago</Text>
            <Text style={styles.celdaValue}>{new Date(data.fechaPago).toLocaleDateString("es-UY")}</Text>
          </View>
        </View>

        <View style={styles.emisor}>
          <Text>Recibí conforme,</Text>
          <Text style={styles.emisorNombre}>Quiroga Automóviles</Text>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Comprobante de pago generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
