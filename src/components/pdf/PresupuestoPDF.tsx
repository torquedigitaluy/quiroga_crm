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
  smallLabel: { width: 90, fontSize: 9, color: "#667085" },
  smallValue: { flex: 1, fontSize: 9, fontWeight: 700 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #1A1D29", paddingBottom: 3, marginBottom: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 2, borderBottom: "0.5 solid #E3E6EC" },
  th: { fontSize: 8, fontWeight: 700, color: "#667085" },
  td: { fontSize: 9 },
  totalsBox: { marginTop: 14, alignSelf: "flex-end", minWidth: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 10, color: "#667085" },
  totalValue: { fontSize: 11, fontWeight: 700, color: "#0936B3" },
  footerBox: { marginTop: 30, borderTop: "1 solid #E3E6EC", paddingTop: 10 },
});

export type PresupuestoPdfData = {
  numero: number;
  fecha: Date;
  vehiculoLabel: string;
  vehMatricula: string | null;
  vehCombustible: string | null;
  esVehiculoExterno: boolean;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  comentarios: string | null;
  aceites: { nombre: string; precioCents: number; moneda: string; cantidad: number }[];
  articulos: { nombre: string; precioCents: number; moneda: string; cantidad: number }[];
};

function money(cents: number, moneda: string): string {
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "USD" ? "U$S" : "$"} ${amount}`;
}

export function PresupuestoPDF({ data }: { data: PresupuestoPdfData }) {
  let totalUyu = 0;
  let totalUsd = 0;
  for (const item of [...data.aceites, ...data.articulos]) {
    const total = item.precioCents * item.cantidad;
    if (item.moneda === "USD") totalUsd += total;
    else totalUyu += total;
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Presupuesto" />

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            N° Presupuesto: <Text style={styles.metaValue}>{data.numero}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Fecha: <Text style={styles.metaValue}>{new Date(data.fecha).toLocaleDateString("es-UY")}</Text>
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Datos del vehículo</Text>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Vehículo</Text>
            <Text style={styles.smallValue}>
              {data.vehiculoLabel} {data.esVehiculoExterno ? "(externo)" : ""}
            </Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Matrícula</Text>
            <Text style={styles.smallValue}>{data.vehMatricula ?? "—"}</Text>
          </View>
          <View style={styles.smallRow}>
            <Text style={styles.smallLabel}>Combustible</Text>
            <Text style={styles.smallValue}>{data.vehCombustible ?? "—"}</Text>
          </View>
          {(data.clienteNombre || data.clienteTelefono) && (
            <View style={styles.smallRow}>
              <Text style={styles.smallLabel}>Cliente</Text>
              <Text style={styles.smallValue}>
                {data.clienteNombre ?? "—"} {data.clienteTelefono ? `— ${data.clienteTelefono}` : ""}
              </Text>
            </View>
          )}
        </View>

        {data.aceites.length > 0 && (
          <>
            <Text style={pdfStyles.section}>Aceites</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>Producto</Text>
              <Text style={[styles.th, { width: 40 }]}>Cant.</Text>
              <Text style={[styles.th, { width: 70 }]}>Precio unit.</Text>
              <Text style={[styles.th, { width: 70 }]}>Total</Text>
            </View>
            {data.aceites.map((a, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1 }]}>{a.nombre}</Text>
                <Text style={[styles.td, { width: 40 }]}>{a.cantidad}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(a.precioCents, a.moneda)}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(a.precioCents * a.cantidad, a.moneda)}</Text>
              </View>
            ))}
          </>
        )}

        {data.articulos.length > 0 && (
          <>
            <Text style={pdfStyles.section}>Artículos y repuestos</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>Artículo</Text>
              <Text style={[styles.th, { width: 40 }]}>Cant.</Text>
              <Text style={[styles.th, { width: 70 }]}>Precio unit.</Text>
              <Text style={[styles.th, { width: 70 }]}>Total</Text>
            </View>
            {data.articulos.map((a, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1 }]}>{a.nombre}</Text>
                <Text style={[styles.td, { width: 40 }]}>{a.cantidad}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(a.precioCents, a.moneda)}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(a.precioCents * a.cantidad, a.moneda)}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.totalsBox}>
          {totalUyu > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total en pesos</Text>
              <Text style={styles.totalValue}>{money(totalUyu, "UYU")}</Text>
            </View>
          )}
          {totalUsd > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total en dólares</Text>
              <Text style={styles.totalValue}>{money(totalUsd, "USD")}</Text>
            </View>
          )}
        </View>

        {data.comentarios && (
          <>
            <Text style={pdfStyles.section}>Comentarios</Text>
            <Text style={pdfStyles.paragraph}>{data.comentarios}</Text>
          </>
        )}

        <View style={styles.footerBox}>
          <Text style={{ fontSize: 8, color: "#667085", lineHeight: 1.4 }}>
            Podes financiar tu servicio o reparación con todas las tarjetas de crédito, abonar con efectivo o
            transferencia bancaria BBVA Cuenta Corriente pesos o dólares (27192059) a nombre de 3697 Motors
            Zonamerica SAS.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
