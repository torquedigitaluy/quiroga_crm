import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  metaItem: { fontSize: 9, color: "#667085" },
  metaValue: { fontWeight: 700, color: "#1A1D29" },
  box: { border: "1 solid #E3E6EC", borderRadius: 4, padding: 8, marginBottom: 10 },
  boxTitle: { fontSize: 9, fontWeight: 700, color: "#0936B3", marginBottom: 4, textTransform: "uppercase" },
  smallRow: { flexDirection: "row", marginBottom: 3 },
  smallLabel: { width: 150, fontSize: 9, color: "#667085" },
  smallValue: { flex: 1, fontSize: 9, fontWeight: 700 },
  legal: { fontSize: 8.5, lineHeight: 1.5, color: "#1A1D29", marginBottom: 10, textAlign: "justify" },
  firmanteRow: { flexDirection: "row", border: "1 solid #1A1D29", marginBottom: 14 },
  firmanteDatos: { flex: 1, padding: 8, borderRight: "1 solid #1A1D29" },
  firmanteLabel: { fontSize: 8, color: "#667085", marginTop: 6 },
  firmanteValue: { fontSize: 9, fontWeight: 700, borderBottom: "1 solid #667085", minHeight: 13, paddingBottom: 1 },
  firmaBox: { width: 180, alignItems: "center", justifyContent: "flex-end", padding: 8 },
  firmaLabel: { fontSize: 8, color: "#667085" },
});

export type ValePdfData = {
  numero: number;
  fecha: Date;
  condiciones: string | null;
  montoFinanciadoUsdCents: number | null;
  cantidadCuotas: number | null;
  montoCuotaUsdCents: number | null;
  diaVencimientoMensual: number | null;
  fechaPrimeraCuota: Date | null;
  observaciones: string | null;
  firmante1Nombre: string | null;
  firmante1Ci: string | null;
  firmante1Domicilio: string | null;
  firmante2Nombre: string | null;
  firmante2Ci: string | null;
  firmante2Domicilio: string | null;
};

function money(cents: number | null): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `US$ ${amount}`;
}

function Firmante({ nombre, ci, domicilio }: { nombre: string | null; ci: string | null; domicilio: string | null }) {
  return (
    <View style={styles.firmanteRow}>
      <View style={styles.firmanteDatos}>
        <Text style={styles.firmanteLabel}>Nombre</Text>
        <Text style={styles.firmanteValue}>{nombre || " "}</Text>
        <Text style={styles.firmanteLabel}>Cédula</Text>
        <Text style={styles.firmanteValue}>{ci || " "}</Text>
        <Text style={styles.firmanteLabel}>Domicilio</Text>
        <Text style={styles.firmanteValue}>{domicilio || " "}</Text>
      </View>
      <View style={styles.firmaBox}>
        <Text style={styles.firmaLabel}>Firma</Text>
      </View>
    </View>
  );
}

export function ValePDF({ data }: { data: ValePdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Vale" />

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            N°: <Text style={styles.metaValue}>{data.numero}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Fecha: <Text style={styles.metaValue}>{new Date(data.fecha).toLocaleDateString("es-UY")}</Text>
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Condiciones del plan</Text>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Monto financiado</Text>
            <Text style={styles.smallValue}>{money(data.montoFinanciadoUsdCents)}</Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Cantidad de cuotas</Text>
            <Text style={styles.smallValue}>{data.cantidadCuotas ?? "—"}</Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Monto de cada cuota</Text>
            <Text style={styles.smallValue}>{money(data.montoCuotaUsdCents)}</Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Día de vencimiento mensual</Text>
            <Text style={styles.smallValue}>{data.diaVencimientoMensual ?? "—"}</Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Fecha de la primera cuota</Text>
            <Text style={styles.smallValue}>
              {data.fechaPrimeraCuota ? new Date(data.fechaPrimeraCuota).toLocaleDateString("es-UY") : "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.legal}>
          {data.condiciones ||
            "[Texto de condiciones pendiente — reemplazar por la redacción exacta del vale físico de Quiroga Automóviles.]"}
        </Text>

        {data.observaciones && (
          <>
            <Text style={pdfStyles.section}>Observaciones</Text>
            <Text style={pdfStyles.paragraph}>{data.observaciones}</Text>
          </>
        )}

        <Text style={pdfStyles.section}>Personas responsables del pago</Text>
        <Firmante nombre={data.firmante1Nombre} ci={data.firmante1Ci} domicilio={data.firmante1Domicilio} />
        <Firmante nombre={data.firmante2Nombre} ci={data.firmante2Ci} domicilio={data.firmante2Domicilio} />

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
