import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

// Réplica digital del formulario físico "Conforme" de Quiroga Automóviles.
// Pensado para imprimir y firmar a mano: las firmas quedan en blanco.

const styles = StyleSheet.create({
  page: { paddingHorizontal: 34, paddingTop: 30, paddingBottom: 30, fontSize: 9, fontFamily: "Helvetica", color: "#111" },

  topRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 },
  porRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  porLabel: { fontSize: 10, fontWeight: 700 },
  montoBox: { border: "1 solid #111", paddingVertical: 2, paddingHorizontal: 10, minWidth: 78, textAlign: "center" },
  montoText: { fontSize: 10, fontWeight: 700 },

  venceWrap: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  venceLabel: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  dmaHeader: { flexDirection: "row" },
  dmaCell: { width: 34, textAlign: "center", fontSize: 7, color: "#444" },
  dmaValues: { flexDirection: "row" },
  dmaValue: { width: 34, textAlign: "center", fontSize: 9, fontWeight: 700, borderBottom: "1 solid #111", marginHorizontal: 1 },

  numeroWrap: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  numeroLabel: { fontSize: 9, fontWeight: 700 },
  numeroValue: { fontSize: 9, fontWeight: 700, borderBottom: "1 solid #111", minWidth: 22, textAlign: "center" },

  conformeRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 6 },
  conformeLabel: { fontSize: 8.5, fontWeight: 700 },
  conformeLetras: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center", backgroundColor: "#E8E8E8", paddingVertical: 2 },

  divider: { borderBottom: "1 solid #111", marginBottom: 6 },

  parrafo: { fontSize: 8.2, lineHeight: 1.45, textAlign: "justify", marginBottom: 5 },
  bold: { fontWeight: 700 },
  inline: { fontWeight: 700, textDecoration: "underline" },

  montevideoLine: { fontSize: 8.2, textAlign: "center", marginTop: 4, marginBottom: 8 },

  deudorCols: { flexDirection: "row", gap: 22, marginTop: 2 },
  col: { flex: 1 },
  fieldRow: { flexDirection: "row", alignItems: "flex-end", gap: 3, marginTop: 7 },
  fieldLabel: { fontSize: 8.2 },
  fieldValue: { flex: 1, fontSize: 8.2, fontWeight: 700, borderBottom: "1 solid #111", minHeight: 11, paddingBottom: 1 },
  caption: { fontSize: 6.8, color: "#444", textAlign: "center", marginTop: 1 },
  blankLine: { borderBottom: "1 solid #111", minHeight: 11, marginTop: 7 },
});

export type ConformePdfData = {
  montoCuotaCents: number;
  montoEnLetras: string | null;
  fechaVencimiento: Date;
  numeroCuota: number | null;
  cantidadCuotas: number;
  acreedorNombre: string;
  acreedorCi: string;
  fechaPago: Date;
  numeroFactura: string | null;
  concepto: string;
  fechaFactura: Date | null;
  deudorNombre: string | null;
  deudorCedula: string | null;
  deudorDomicilio: string | null;
  deudorDepartamentoDireccion: string | null;
  deudorTelefono: string | null;
};

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SETIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

/** "10 DE AGOSTO DEL 2026" — igual que en el documento en papel. */
function fechaLarga(d: Date | null): string {
  if (!d) return "";
  const f = new Date(d);
  return `${f.getUTCDate()} DE ${MESES[f.getUTCMonth()]} DEL ${f.getUTCFullYear()}`;
}

function dosDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function ColumnaDeudor({ data }: { data?: ConformePdfData }) {
  return (
    <View style={styles.col}>
      <FieldRow label="Domicilio" value={data?.deudorDomicilio ?? ""} />
      <View style={styles.blankLine} />
      <Text style={styles.caption}>(Departamento y dirección)</Text>
      <FieldRow label="DEUDOR" value={data?.deudorNombre ?? ""} />
      <Text style={styles.caption}>(Nombre y apellidos)</Text>
      {/* Las firmas van en blanco: se firman a mano sobre el impreso. */}
      <FieldRow label="FIRMA (S)" value="" />
      <FieldRow label="Contrafirma" value="" />
      <FieldRow label="CI" value={data?.deudorCedula ?? ""} />
      <FieldRow label="TEL" value={data?.deudorTelefono ?? ""} />
    </View>
  );
}

export function ConformePDF({ data }: { data: ConformePdfData }) {
  const venc = new Date(data.fechaVencimiento);
  const montoUnits = Math.round(data.montoCuotaCents / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.porRow}>
            <Text style={styles.porLabel}>Por U$S</Text>
            <View style={styles.montoBox}>
              <Text style={styles.montoText}>{montoUnits.toLocaleString("es-UY")}</Text>
            </View>
          </View>

          <View style={styles.venceWrap}>
            <Text style={styles.venceLabel}>Vence</Text>
            <View>
              <View style={styles.dmaHeader}>
                <Text style={styles.dmaCell}>Día</Text>
                <Text style={styles.dmaCell}>Mes</Text>
                <Text style={styles.dmaCell}>Año</Text>
              </View>
              <View style={styles.dmaValues}>
                <Text style={styles.dmaValue}>{dosDigitos(venc.getUTCDate())}</Text>
                <Text style={styles.dmaValue}>{dosDigitos(venc.getUTCMonth() + 1)}</Text>
                <Text style={styles.dmaValue}>{String(venc.getUTCFullYear()).slice(-2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.numeroWrap}>
            <Text style={styles.numeroLabel}>N°</Text>
            <Text style={styles.numeroValue}>{data.numeroCuota ?? ""}</Text>
            <Text style={styles.numeroLabel}>/</Text>
            <Text style={styles.numeroValue}>{data.cantidadCuotas}</Text>
          </View>
        </View>

        <View style={styles.conformeRow}>
          <Text style={styles.conformeLabel}>CONFORME por la cantidad de dólares americanos</Text>
          <Text style={styles.conformeLetras}>{data.montoEnLetras ?? ""}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.parrafo}>
          Que debo (emos) y pagaré (mos) en forma indivisible y solidaria a{" "}
          <Text style={styles.bold}>{data.acreedorNombre}</Text> CI. <Text style={styles.bold}>{data.acreedorCi}</Text>,
          o a su orden, en el domicilio del acreedor o donde éste indique, en la misma moneda, el día{" "}
          <Text style={styles.inline}>{fechaLarga(data.fechaPago)}</Text>, por igual valor recibido a satisfacción en
          mercadería según factura N° <Text style={styles.inline}>{data.numeroFactura ?? "________"}</Text>{" "}
          <Text style={styles.inline}>{data.concepto}</Text> de fecha{" "}
          <Text style={styles.inline}>{fechaLarga(data.fechaFactura)}</Text>.
        </Text>

        <Text style={styles.parrafo}>
          En caso ser el (los) firmante (s), representante (n) a persona jurídica la sola firma de aquellos importará su
          responsabilidad solidaria.
        </Text>

        <Text style={styles.parrafo}>
          La falta de pago a su vencimiento producirá la mora de pleno derecho sin necesidad de interpretación de clase
          alguna, devengándose por esa sola circunstancia intereses a la tasa del 10.87 % (diez con ochenta y siete por
          ciento) anual, nominal o efectiva.
        </Text>

        <Text style={styles.parrafo}>
          Para el caso de aplicarse la actualización de valor de la LEY N°14.500 y durante el periodo correspondiente a
          dicha actualización, el interés de mora queda pactado en la tasa del 6% (seis por ciento) anual, nominal o
          efectiva.
        </Text>

        <Text style={styles.parrafo}>
          El acreedor a su elección, podrá demandar la ejecución de este título ante los jueces del (de los) domicilio
          (s) del (de los) Deudor (es), ante los del lugar del cumplimiento de la obligación, o ante los de{" "}
          <Text style={styles.bold}>MONTEVIDEO</Text>.
        </Text>

        <Text style={styles.parrafo}>
          Para todos los efectos judiciales o extrajudiciales a que pudiera dar lugar este documento, el (los) deudor
          (es) constituye (n) como domicilio especial el (los) abajo denunciado (s).
        </Text>

        <Text style={styles.montevideoLine}>Montevideo, ............................. de 20 ...........</Text>

        <View style={styles.deudorCols}>
          {/* Deudor principal (con datos) y co-deudor (en blanco), como en el papel. */}
          <ColumnaDeudor data={data} />
          <ColumnaDeudor />
        </View>
      </Page>
    </Document>
  );
}
