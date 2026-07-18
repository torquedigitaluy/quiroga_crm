import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { getLogoBuffer } from "@/lib/pdf/logo";
import { numeroALetras } from "@/lib/numeroALetras";

// Vale / pagaré legal de Quiroga Automóviles, en pesos uruguayos. Réplica del
// documento físico: logo arriba a la izquierda, total arriba a la derecha, el
// texto legal con los datos editables insertados, y tres bloques para firmar a
// mano al pie.

const styles = StyleSheet.create({
  page: { paddingHorizontal: 40, paddingTop: 30, paddingBottom: 36, fontSize: 9.5, fontFamily: "Helvetica", color: "#111" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottom: "2 solid #0936B3",
    paddingBottom: 10,
    marginBottom: 14,
  },
  logo: { width: 150 },
  totalBox: { alignItems: "flex-end" },
  totalLabel: { fontSize: 8, color: "#667085", textTransform: "uppercase" },
  totalValue: { fontSize: 16, fontWeight: 700, color: "#0936B3" },
  meta: { fontSize: 8, color: "#667085", marginTop: 2 },

  parrafo: { fontSize: 9.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 8 },
  bold: { fontWeight: 700 },

  montevideo: { fontSize: 9.5, textAlign: "right", marginTop: 6, marginBottom: 16 },

  firmante: { marginBottom: 16 },
  firmaFila: { flexDirection: "row", alignItems: "flex-end", marginTop: 10 },
  campoLabel: { fontSize: 9, marginRight: 4 },
  campoLinea: { flex: 1, borderBottom: "1 solid #111", minHeight: 12 },
  firmaLabel: { width: 150, fontSize: 9, textAlign: "center" },
  firmaLinea: { width: 150, borderBottom: "1 solid #111", minHeight: 12, marginLeft: 20 },
});

export type ValePdfData = {
  numero: number;
  fecha: Date;
  totalPesosCents: number | null;
  totalEnLetras: string | null;
  capitalPrestadoPesosCents: number | null;
  acreedores: string | null;
  cantidadCuotas: number | null;
  montoCuotaPesosCents: number | null;
  montoCuotaEnLetras: string | null;
  diaVencimientoMensual: number | null;
  firmante1Nombre: string | null;
  firmante1Ci: string | null;
  firmante1Domicilio: string | null;
  firmante2Nombre: string | null;
  firmante2Ci: string | null;
  firmante2Domicilio: string | null;
  firmante3Nombre: string | null;
  firmante3Ci: string | null;
  firmante3Domicilio: string | null;
};

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "setiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function pesos(cents: number | null): string {
  if (cents == null) return "________";
  const n = cents / 100;
  return `$ ${n.toLocaleString("es-UY", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}.-`;
}

function fechaLarga(d: Date): string {
  const f = new Date(d);
  return `${f.getUTCDate()} de ${MESES[f.getUTCMonth()]} de ${f.getUTCFullYear()}`;
}

const ACREEDORES_DEFAULT =
  "Georgina Villegas Castro, CI 4.785.148-0 y Jorge Daniel Quiroga Sanabria, CI 3.283.578-8";

function Firmante({
  nombre,
  ci,
  domicilio,
}: {
  nombre: string | null;
  ci: string | null;
  domicilio: string | null;
}) {
  return (
    <View style={styles.firmante} wrap={false}>
      <View style={styles.firmaFila}>
        <Text style={styles.campoLabel}>Nombre:</Text>
        <View style={styles.campoLinea}>
          <Text> {nombre ?? ""}</Text>
        </View>
        <Text style={styles.firmaLabel}>Firma</Text>
      </View>
      <View style={styles.firmaFila}>
        <Text style={styles.campoLabel}>C.I / R.U.T:</Text>
        <View style={styles.campoLinea}>
          <Text> {ci ?? ""}</Text>
        </View>
        <View style={styles.firmaLinea} />
      </View>
      <View style={styles.firmaFila}>
        <Text style={styles.campoLabel}>Domicilio:</Text>
        <View style={styles.campoLinea}>
          <Text> {domicilio ?? ""}</Text>
        </View>
      </View>
    </View>
  );
}

export function ValePDF({ data }: { data: ValePdfData }) {
  const cuotasNum = data.cantidadCuotas ?? 0;
  const cuotasLetras = cuotasNum > 0 ? numeroALetras(cuotasNum).toLowerCase() : "________";
  const totalLetras = data.totalEnLetras
    ? data.totalEnLetras
    : data.totalPesosCents != null
      ? numeroALetras(Math.round(data.totalPesosCents / 100)).toLowerCase()
      : "________";
  const cuotaLetras = data.montoCuotaEnLetras
    ? data.montoCuotaEnLetras
    : data.montoCuotaPesosCents != null
      ? numeroALetras(Math.round(data.montoCuotaPesosCents / 100)).toLowerCase()
      : "________";
  const acreedores = data.acreedores?.trim() || ACREEDORES_DEFAULT;
  const dia = data.diaVencimientoMensual ?? 10;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={getLogoBuffer()} />
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{pesos(data.totalPesosCents)}</Text>
            <Text style={styles.meta}>Vale N° {data.numero}</Text>
          </View>
        </View>

        <Text style={styles.parrafo}>
          <Text style={styles.bold}>VALE</Text> por la suma de{" "}
          <Text style={styles.bold}>{pesos(data.totalPesosCents)}</Text> (pesos uruguayos {totalLetras}) por concepto de
          capital prestado (<Text style={styles.bold}>{pesos(data.capitalPrestadoPesosCents)}</Text>), conjuntamente con
          los intereses compensatorios, que debo (debemos) y pagaré (pagaremos) en forma incondicional, solidaria,
          indivisible y libre de protesto a <Text style={styles.bold}>{acreedores}</Text> o a su orden, en {cuotasLetras}{" "}
          ({cuotasNum || "__"}) cuotas mensuales, iguales y consecutivas de{" "}
          <Text style={styles.bold}>{pesos(data.montoCuotaPesosCents)}</Text> (pesos uruguayos {cuotaLetras}) cada una,
          venciendo la primera el <Text style={styles.bold}>{dia}</Text> de cada mes, y las restantes los mismos días de
          los meses siguientes. Las cuotas se abonarán en la cuenta bancaria del Banco BBVA: Cuenta Corriente en moneda
          nacional N° 27192059 3697 Motors Zonamerica SAS, siendo los comprobantes de depósitos y/o transferencias
          bancarias como los únicos medios hábiles para acreditar los pagos.
        </Text>

        <Text style={styles.parrafo}>
          La falta de pago de una o más cuotas en la fecha estipulada producirá la incursión en mora automática sin
          necesidad de interpelación judicial ni extrajudicial y se devengarán desde esa fecha intereses moratorios a una
          tasa de interés del 90% (efectiva anual), la que, se aplicará sobre la o las cuotas vencidas e impagas, aun
          cuando el saldo total resulte exigible anticipadamente. Cuando el saldo total resulte exigible anticipadamente,
          dicho saldo continuará devengando intereses compensatorios a la tasa pactada. A partir del momento en que se
          produzca la exigibilidad anticipada, cada vez que llegue el día de pago se generarán intereses moratorios sobre
          el monto de la misma, así como de toda cuota vencida e impaga con anterioridad, mientras que el saldo de capital
          adeudado (excluida la cuota o cuotas vencidas e impagas) seguirá generando intereses compensatorios. Los
          intereses moratorios se capitalizarán diariamente. Los intereses moratorios a la tasa pactada serán aplicables
          sobre el saldo de deuda total, cuando la misma fuere exigible, si la ley vigente así lo admite. - La falta de
          pago de una cuota a su vencimiento hará exigible el saldo total adeudado, caducando todos los plazos aquí
          establecidos.
        </Text>

        <Text style={styles.parrafo}>
          En caso de incumplimiento serán de mí (nuestro) cargo todos los tributos, honorarios y demás gastos que se
          originen por el mero retardo o se generen en la cobranza judicial o extrajudicial, aun los que se derivaren de
          diligencias preparatorias.
        </Text>

        <Text style={styles.parrafo}>
          Serán competentes para entender en los juicios que dé a lugar esta obligación, cualquiera de los Juzgados
          Letrados o de Paz de la República, a elección del tenedor de éste documento.-
        </Text>

        <Text style={styles.parrafo}>Declaro (amos) haber recibido una copia del presente documento (art. 28 Ley 18.212).</Text>

        <Text style={styles.parrafo}>
          Para todos los efectos judiciales y extrajudiciales a que dé lugar ésta obligación, constituyo (constituimos) el
          (los) domicilio(s) que más abajo se indica.-
        </Text>

        <Text style={styles.montevideo}>Montevideo, {fechaLarga(data.fecha)}.-</Text>

        <Firmante nombre={data.firmante1Nombre} ci={data.firmante1Ci} domicilio={data.firmante1Domicilio} />
        <Firmante nombre={data.firmante2Nombre} ci={data.firmante2Ci} domicilio={data.firmante2Domicilio} />
        <Firmante nombre={data.firmante3Nombre} ci={data.firmante3Ci} domicilio={data.firmante3Domicilio} />
      </Page>
    </Document>
  );
}
