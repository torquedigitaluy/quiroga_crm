import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  metaItem: { fontSize: 9, color: "#667085" },
  metaValue: { fontWeight: 700, color: "#1A1D29" },
  twoCol: { flexDirection: "row", gap: 16 },
  threeCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  box: { border: "1 solid #E3E6EC", borderRadius: 4, padding: 8, marginBottom: 10 },
  boxTitle: { fontSize: 9, fontWeight: 700, color: "#0936B3", marginBottom: 4, textTransform: "uppercase" },
  smallRow: { flexDirection: "row", marginBottom: 3 },
  smallLabel: { width: 110, fontSize: 9, color: "#667085" },
  smallValue: { flex: 1, fontSize: 9, fontWeight: 700 },
  siNo: { fontSize: 9, fontWeight: 700, marginBottom: 4 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #1A1D29", paddingBottom: 3, marginBottom: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 2, borderBottom: "0.5 solid #E3E6EC" },
  th: { fontSize: 8, fontWeight: 700, color: "#667085" },
  td: { fontSize: 9 },
  legal: { fontSize: 8, lineHeight: 1.4, color: "#1A1D29", marginBottom: 10 },
});

export type PromesaPdfData = {
  numero: number;
  fecha: Date;
  vendedores: string | null;
  vehMarca: string | null;
  vehModelo: string | null;
  vehTipo: string | null;
  vehColor: string | null;
  vehAnio: number | null;
  vehMatricula: string | null;
  vehMotor: string | null;
  vehChasis: string | null;
  clienteNombre: string | null;
  clienteApellido: string | null;
  clienteCi: string | null;
  clienteDomicilio: string | null;
  clienteCiudad: string | null;
  clienteContacto: string | null;
  clienteEstadoCivil: string | null;
  clienteNombre2: string | null;
  clienteMail: string | null;
  financia: boolean;
  financiaCon: string | null;
  senaUsdCents: number | null;
  pagoRetiroUnidadUsdCents: number | null;
  capitalFinanciadoUsdCents: number | null;
  conformesUsdCents: number | null;
  valorTomaAutoUsdCents: number | null;
  totalUsdCents: number | null;
  costoTitulosUsdCents: number | null;
  cartaPagoUsdCents: number | null;
  entregaCuentaTitulosUsdCents: number | null;
  seguro: boolean;
  aseguradora: string | null;
  cobertura: string | null;
  cesionDerechos: boolean;
  cesionANombreDe: string | null;
  observaciones: string | null;
  permutaMarca: string | null;
  permutaModelo: string | null;
  permutaTipo: string | null;
  permutaColor: string | null;
  permutaLlaves: string | null;
  permutaAnio: number | null;
  permutaMatricula: string | null;
  permutaMotor: string | null;
  permutaChasis: string | null;
};

function money(cents: number | null): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `US$ ${amount}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallRow}>
      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={styles.smallValue}>{value || "—"}</Text>
    </View>
  );
}

export function PromesaPDF({ data }: { data: PromesaPdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Promesa de Compra-Venta" />

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            N°: <Text style={styles.metaValue}>{data.numero}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Fecha: <Text style={styles.metaValue}>{new Date(data.fecha).toLocaleDateString("es-UY")}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Vendedor/es: <Text style={styles.metaValue}>{data.vendedores || "—"}</Text>
          </Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Vehículo</Text>
              <Row label="Marca" value={data.vehMarca ?? ""} />
              <Row label="Modelo" value={data.vehModelo ?? ""} />
              <Row label="Tipo" value={data.vehTipo ?? ""} />
              <Row label="Color" value={data.vehColor ?? ""} />
              <Row label="Año" value={data.vehAnio != null ? String(data.vehAnio) : ""} />
              <Row label="Matrícula" value={data.vehMatricula ?? ""} />
              <Row label="Motor" value={data.vehMotor ?? ""} />
              <Row label="Chasis" value={data.vehChasis ?? ""} />
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Cliente</Text>
              <Row label="Nombre" value={data.clienteNombre ?? ""} />
              <Row label="Apellido" value={data.clienteApellido ?? ""} />
              <Row label="CI / RUT" value={data.clienteCi ?? ""} />
              <Row label="Domicilio" value={data.clienteDomicilio ?? ""} />
              <Row label="Ciudad" value={data.clienteCiudad ?? ""} />
              <Row label="Contacto" value={data.clienteContacto ?? ""} />
              <Row label="Estado Civil" value={data.clienteEstadoCivil ?? ""} />
              <Row label="Nombre" value={data.clienteNombre2 ?? ""} />
              <Row label="Mail" value={data.clienteMail ?? ""} />
            </View>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Condiciones de pago</Text>
          <Text style={styles.siNo}>
            Financia: {data.financia ? "Sí" : "No"}
            {data.financia && data.financiaCon ? `   —   Con: ${data.financiaCon}` : ""}
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Concepto</Text>
            <Text style={[styles.th, { width: 90, textAlign: "right" }]}>US$</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1 }]}>Seña</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right" }]}>{money(data.senaUsdCents)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1 }]}>Pago retiro unidad</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right" }]}>{money(data.pagoRetiroUnidadUsdCents)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1 }]}>Capital financiado</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right" }]}>{money(data.capitalFinanciadoUsdCents)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1 }]}>Conformes</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right" }]}>{money(data.conformesUsdCents)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1 }]}>Valor toma auto</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right" }]}>{money(data.valorTomaAutoUsdCents)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1, fontWeight: 700 }]}>Total</Text>
            <Text style={[styles.td, { width: 90, textAlign: "right", fontWeight: 700 }]}>{money(data.totalUsdCents)}</Text>
          </View>
        </View>

        <View style={styles.threeCol}>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Documentación</Text>
              <Row label="Costo de títulos" value={money(data.costoTitulosUsdCents)} />
              <Row label="Carta de pago" value={money(data.cartaPagoUsdCents)} />
              <Row label="Entrega a cta. títulos" value={money(data.entregaCuentaTitulosUsdCents)} />
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Seguro</Text>
              <Text style={styles.siNo}>{data.seguro ? "Sí" : "No"}</Text>
              {data.seguro && (
                <>
                  <Row label="Aseguradora" value={data.aseguradora ?? ""} />
                  <Row label="Cobertura" value={data.cobertura ?? ""} />
                </>
              )}
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Cesión de derechos</Text>
              <Text style={styles.siNo}>{data.cesionDerechos ? "Sí" : "No"}</Text>
              {data.cesionDerechos && <Row label="A nombre de" value={data.cesionANombreDe ?? ""} />}
            </View>
          </View>
        </View>

        <Text style={pdfStyles.section}>Condiciones generales</Text>
        <Text style={styles.legal}>
          [Texto legal pendiente — reemplazar por la redacción exacta del formulario físico &quot;Promesa de Compra-Venta&quot;
          de Quiroga Automóviles.]
        </Text>

        {data.observaciones && (
          <>
            <Text style={pdfStyles.section}>Observaciones</Text>
            <Text style={pdfStyles.paragraph}>{data.observaciones}</Text>
          </>
        )}

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Vehículo que se permuta</Text>
          <View style={styles.threeCol}>
            <View style={styles.col}>
              <Row label="Marca" value={data.permutaMarca ?? ""} />
              <Row label="Modelo" value={data.permutaModelo ?? ""} />
              <Row label="Tipo" value={data.permutaTipo ?? ""} />
            </View>
            <View style={styles.col}>
              <Row label="Color" value={data.permutaColor ?? ""} />
              <Row label="Llaves" value={data.permutaLlaves ?? ""} />
              <Row label="Año" value={data.permutaAnio != null ? String(data.permutaAnio) : ""} />
            </View>
            <View style={styles.col}>
              <Row label="Matrícula" value={data.permutaMatricula ?? ""} />
              <Row label="Motor" value={data.permutaMotor ?? ""} />
              <Row label="Chasis" value={data.permutaChasis ?? ""} />
            </View>
          </View>
          <Text style={[styles.legal, { marginTop: 6, marginBottom: 0 }]}>
            En caso de no tener dos llaves se retienen USD 200.
          </Text>
        </View>

        <View style={pdfStyles.signaturesRow}>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>Firma Vendedor</Text>
            </View>
          </View>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>Firma Cliente</Text>
            </View>
          </View>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
