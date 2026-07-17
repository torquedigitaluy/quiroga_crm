import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

const styles = StyleSheet.create({
  // Página compacta (menos padding que el estándar) para que todo entre en 1 hoja.
  page: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 30, fontSize: 9, fontFamily: "Helvetica", color: "#1A1D29" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  metaItem: { fontSize: 8.5, color: "#667085" },
  metaValue: { fontWeight: 700, color: "#1A1D29" },
  twoCol: { flexDirection: "row", gap: 12 },
  threeCol: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  box: { border: "1 solid #E3E6EC", borderRadius: 3, padding: 6, marginBottom: 4 },
  boxTitle: { fontSize: 8, fontWeight: 700, color: "#0936B3", marginBottom: 3, textTransform: "uppercase" },
  smallRow: { flexDirection: "row", marginBottom: 1.5 },
  smallLabel: { width: 90, fontSize: 8, color: "#667085" },
  smallValue: { flex: 1, fontSize: 8, fontWeight: 700 },
  // Fila apilada (para cajas angostas: evita que label y valor se superpongan).
  stackRow: { marginBottom: 2 },
  stackLabel: { fontSize: 6.5, color: "#667085", textTransform: "uppercase" },
  stackValue: { fontSize: 8.5, fontWeight: 700 },
  siNo: { fontSize: 8, fontWeight: 700, marginBottom: 3 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #1A1D29", paddingBottom: 1.5, marginBottom: 1.5 },
  tableRow: { flexDirection: "row", paddingVertical: 1, borderBottom: "0.5 solid #E3E6EC" },
  th: { fontSize: 7.5, fontWeight: 700, color: "#667085" },
  td: { fontSize: 8 },
  sectionTitle: { marginTop: 5, marginBottom: 2, fontSize: 9, fontWeight: 700, color: "#0936B3" },
  legalClause: { fontSize: 7, lineHeight: 1.25, color: "#1A1D29", marginBottom: 2, textAlign: "justify" },
  signaturesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 20 },
  signatureBox: { flex: 1, alignItems: "center" },
  signatureLine: { borderTop: "1 solid #1A1D29", width: "100%", marginTop: 14, paddingTop: 3 },
  signatureName: { fontSize: 8.5, marginTop: 2 },
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
  conformesCantidadCuotas: number | null;
  conformesCuotaUsdCents: number | null;
  valorTomaAutoUsdCents: number | null;
  totalUsdCents: number | null;
  costoTitulosUsdCents: number | null;
  costoTitulosMoneda: string;
  cartaPagoUsdCents: number | null;
  cartaPagoMoneda: string;
  entregaCuentaTitulosUsdCents: number | null;
  entregaCuentaTitulosMoneda: string;
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

// Texto legal fijo que va SIEMPRE por encima de Observaciones.
const CLAUSULAS_LEGALES: string[] = [
  "Primero: QUIROGA AUTOMOVILES promete vender libre de obligaciones o gravámenes el vehículo arriba detallado a la parte indicada como 'Comprador' o a quien éste designe.",
  "Segundo: El precio de esta promesa es el detallado en 'Condiciones de Pago'.",
  "Tercero: Constituyen domicilios especiales los establecidos en la comparecencia.",
  "Cuarto: Se firman dos ejemplares del mismo tenor.",
  "Quinto: Las partes acuerdan en este acto que para el caso que por motivos ajenos a QUIROGA AUTOMOVILES la presente compraventa no sea efectiva, se acuerda que lo entregado por concepto de seña podrá ser retenido por QUIROGA AUTOMOVILES como multa por el incumplimiento de dicha compraventa.",
  "El cliente asume conformidad al revisar o probar el vehículo previamente a la compraventa, reconociendo que el mismo no cuenta con vicios ocultos idóneos, el kilometraje declarado en tablero, el funcionamiento de los sistemas de seguridad y el estado general actual del vehículo al momento de la venta, deslindando de responsabilidades civiles o penales a quien vende y/o participe de este compromiso de compraventa.",
];

function money(cents: number | null, moneda: string = "USD"): string {
  if (cents == null) return "—";
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "UYU" ? "$" : "U$S"} ${amount}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallRow}>
      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={styles.smallValue}>{value || "—"}</Text>
    </View>
  );
}

// Fila apilada para cajas angostas (3 columnas), evita superposición.
function StackRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stackRow}>
      <Text style={styles.stackLabel}>{label}</Text>
      <Text style={styles.stackValue}>{value || "—"}</Text>
    </View>
  );
}

export function PromesaPDF({ data }: { data: PromesaPdfData }) {
  const conformesTexto =
    data.conformesCantidadCuotas != null && data.conformesCuotaUsdCents != null
      ? `${data.conformesCantidadCuotas} cuotas de ${money(data.conformesCuotaUsdCents)}`
      : money(data.conformesUsdCents);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            <Text style={[styles.th, { width: 140, textAlign: "right" }]}>Detalle</Text>
          </View>
          {[
            { c: "Seña", v: money(data.senaUsdCents) },
            { c: "Pago retiro unidad", v: money(data.pagoRetiroUnidadUsdCents) },
            { c: "Capital financiado", v: money(data.capitalFinanciadoUsdCents) },
            { c: "Conformes", v: conformesTexto },
            { c: "Valor toma auto", v: money(data.valorTomaAutoUsdCents) },
          ].map((r) => (
            <View style={styles.tableRow} key={r.c}>
              <Text style={[styles.td, { flex: 1 }]}>{r.c}</Text>
              <Text style={[styles.td, { width: 140, textAlign: "right" }]}>{r.v}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.td, { flex: 1, fontWeight: 700 }]}>Total</Text>
            <Text style={[styles.td, { width: 140, textAlign: "right", fontWeight: 700 }]}>{money(data.totalUsdCents)}</Text>
          </View>
        </View>

        <View style={styles.threeCol}>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Documentación</Text>
              <StackRow label="Costo de títulos" value={money(data.costoTitulosUsdCents, data.costoTitulosMoneda)} />
              <StackRow label="Carta de pago" value={money(data.cartaPagoUsdCents, data.cartaPagoMoneda)} />
              <StackRow label="Entrega a cta. títulos" value={money(data.entregaCuentaTitulosUsdCents, data.entregaCuentaTitulosMoneda)} />
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Seguro</Text>
              <Text style={styles.siNo}>{data.seguro ? "Sí" : "No"}</Text>
              {data.seguro && (
                <>
                  <StackRow label="Aseguradora" value={data.aseguradora ?? ""} />
                  <StackRow label="Cobertura" value={data.cobertura ?? ""} />
                </>
              )}
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Cesión de derechos</Text>
              <Text style={styles.siNo}>{data.cesionDerechos ? "Sí" : "No"}</Text>
              {data.cesionDerechos && <StackRow label="A nombre de" value={data.cesionANombreDe ?? ""} />}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Condiciones generales</Text>
        {CLAUSULAS_LEGALES.map((clausula, i) => (
          <Text key={i} style={styles.legalClause}>
            {clausula}
          </Text>
        ))}

        {data.observaciones && (
          <>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={[pdfStyles.paragraph, { fontSize: 9, marginBottom: 6 }]}>{data.observaciones}</Text>
          </>
        )}

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Vehículo que se permuta</Text>
          <View style={styles.threeCol}>
            <View style={styles.col}>
              <StackRow label="Marca" value={data.permutaMarca ?? ""} />
              <StackRow label="Modelo" value={data.permutaModelo ?? ""} />
              <StackRow label="Tipo" value={data.permutaTipo ?? ""} />
            </View>
            <View style={styles.col}>
              <StackRow label="Color" value={data.permutaColor ?? ""} />
              <StackRow label="Llaves" value={data.permutaLlaves ?? ""} />
              <StackRow label="Año" value={data.permutaAnio != null ? String(data.permutaAnio) : ""} />
            </View>
            <View style={styles.col}>
              <StackRow label="Matrícula" value={data.permutaMatricula ?? ""} />
              <StackRow label="Motor" value={data.permutaMotor ?? ""} />
              <StackRow label="Chasis" value={data.permutaChasis ?? ""} />
            </View>
          </View>
          <Text style={[styles.legalClause, { marginTop: 4, marginBottom: 0 }]}>
            En caso de no tener dos llaves se retienen USD 200.
          </Text>
        </View>

        <View style={styles.signaturesRow} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>Firma Vendedor</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>Firma Cliente</Text>
            </View>
          </View>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Automóviles — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
