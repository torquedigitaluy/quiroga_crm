import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { PdfHeader } from "./PdfHeader";
import { pdfStyles } from "./shared";

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  metaItem: { fontSize: 9, color: "#667085" },
  metaValue: { fontWeight: 700, color: "#1A1D29" },
  twoCol: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  box: { border: "1 solid #E3E6EC", borderRadius: 4, padding: 8, marginBottom: 10 },
  boxTitle: { fontSize: 9, fontWeight: 700, color: "#0936B3", marginBottom: 4, textTransform: "uppercase" },
  smallRow: { flexDirection: "row", marginBottom: 3 },
  smallLabel: { width: 90, fontSize: 9, color: "#667085" },
  smallValue: { flex: 1, fontSize: 9, fontWeight: 700 },
  checkRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 4 },
  checkItem: { fontSize: 9 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #1A1D29", paddingBottom: 3, marginBottom: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 2, borderBottom: "0.5 solid #E3E6EC" },
  th: { fontSize: 8, fontWeight: 700, color: "#667085" },
  td: { fontSize: 9 },
  signature: { height: 60, width: 160 },
});

export type OrdenTallerPdfData = {
  numeroOrden: number;
  prioridad: string;
  createdAt: Date;
  vehiculoLabel: string;
  matricula: string | null;
  vehAnio: number | null;
  vehVersion: string | null;
  vehColor: string | null;
  vehKm: number | null;
  vehChasis: string | null;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  clienteDireccion: string | null;
  tiposServicio: string[];
  tipoServicioOtro: string | null;
  estado: string;
  fechaIngreso: Date;
  fechaFinalizacion: Date | null;
  problema: string;
  trabajosRealizados: string | null;
  observaciones: string | null;
  manoDeObraCents: number;
  repuestos: { codigo: string | null; descripcion: string; cantidad: number; precioUnitCents: number; moneda: string }[];
  gastos: { descripcion: string; montoCents: number; moneda: string }[];
  checklist: { tarea: string; hecho: boolean }[];
  tecnicoResponsableNombre: string | null;
  tecnicoResponsableFecha: Date | null;
  revisadoPorNombre: string | null;
  revisadoAprobado: boolean | null;
  revisadoAt: Date | null;
  clienteFirmaDataUrl: string | null;
  clienteFirmaFecha: Date | null;
};

const TIPO_SERVICIO_LABELS: Record<string, string> = {
  MANTENIMIENTO: "Mantenimiento",
  DIAGNOSTICO: "Diagnóstico",
  REPARACION: "Reparación",
  OTRO: "Otros",
};

function money(cents: number, moneda: string): string {
  const amount = (cents / 100).toLocaleString("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "USD" ? "U$S" : "$"} ${amount}`;
}

function fmtDateTime(d: Date | null): string {
  return d ? new Date(d).toLocaleString("es-UY") : "—";
}

function horasTrabajadas(inicio: Date, fin: Date | null): string {
  if (!fin) return "—";
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  if (ms <= 0) return "—";
  const horas = ms / 1000 / 60 / 60;
  return `${horas.toFixed(1)} hs`;
}

export function OrdenTallerPDF({ data }: { data: OrdenTallerPdfData }) {
  const totalRepuestos = data.repuestos.reduce((sum, r) => sum + r.precioUnitCents * r.cantidad, 0);
  const totalGastos = data.gastos.reduce((sum, g) => sum + g.montoCents, 0);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="Planilla de Tareas" />

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            N° Orden: <Text style={styles.metaValue}>{data.numeroOrden}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Prioridad: <Text style={styles.metaValue}>{data.prioridad}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Fecha de creación: <Text style={styles.metaValue}>{new Date(data.createdAt).toLocaleDateString("es-UY")}</Text>
          </Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Datos del cliente</Text>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Cliente</Text>
                <Text style={styles.smallValue}>{data.clienteNombre ?? "—"}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Teléfono</Text>
                <Text style={styles.smallValue}>{data.clienteTelefono ?? "—"}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Dirección</Text>
                <Text style={styles.smallValue}>{data.clienteDireccion ?? "—"}</Text>
              </View>
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Datos del vehículo</Text>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Vehículo</Text>
                <Text style={styles.smallValue}>{data.vehiculoLabel}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Año / Versión</Text>
                <Text style={styles.smallValue}>{data.vehAnio ?? "—"} {data.vehVersion ?? ""}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Color</Text>
                <Text style={styles.smallValue}>{data.vehColor ?? "—"}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Matrícula</Text>
                <Text style={styles.smallValue}>{data.matricula ?? "—"}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Km</Text>
                <Text style={styles.smallValue}>{data.vehKm != null ? data.vehKm.toLocaleString("es-UY") : "—"}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>N° Chasis</Text>
                <Text style={styles.smallValue}>{data.vehChasis ?? "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Tipo de servicio</Text>
          <View style={styles.checkRow}>
            {Object.entries(TIPO_SERVICIO_LABELS).map(([value, label]) => (
              <Text key={value} style={styles.checkItem}>
                [{data.tiposServicio.includes(value) ? "X" : " "}] {label}
              </Text>
            ))}
          </View>
          {data.tipoServicioOtro && <Text style={pdfStyles.paragraph}>Especificado: {data.tipoServicioOtro}</Text>}
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Tiempos del trabajo</Text>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Inicio</Text>
                <Text style={styles.smallValue}>{fmtDateTime(data.fechaIngreso)}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Finalización</Text>
                <Text style={styles.smallValue}>{fmtDateTime(data.fechaFinalizacion)}</Text>
              </View>
              <View style={styles.smallRow}>
                <Text style={styles.smallLabel}>Horas trabajadas</Text>
                <Text style={styles.smallValue}>{horasTrabajadas(data.fechaIngreso, data.fechaFinalizacion)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Estado</Text>
              <Text style={styles.smallValue}>{data.estado}</Text>
            </View>
          </View>
        </View>

        <Text style={pdfStyles.section}>1. Problema / lo que tiene</Text>
        <Text style={pdfStyles.paragraph}>{data.problema}</Text>

        {data.trabajosRealizados && (
          <>
            <Text style={pdfStyles.section}>2. Trabajos realizados</Text>
            <Text style={pdfStyles.paragraph}>{data.trabajosRealizados}</Text>
          </>
        )}

        {data.checklist.length > 0 && (
          <View style={styles.checkRow}>
            {data.checklist.map((c, i) => (
              <Text key={i} style={styles.checkItem}>
                [{c.hecho ? "X" : " "}] {c.tarea}
              </Text>
            ))}
          </View>
        )}

        {data.repuestos.length > 0 && (
          <>
            <Text style={pdfStyles.section}>3. Repuestos utilizados</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 70 }]}>Código</Text>
              <Text style={[styles.th, { flex: 1 }]}>Descripción</Text>
              <Text style={[styles.th, { width: 40 }]}>Cant.</Text>
              <Text style={[styles.th, { width: 70 }]}>Precio unit.</Text>
              <Text style={[styles.th, { width: 70 }]}>Total</Text>
            </View>
            {data.repuestos.map((r, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { width: 70 }]}>{r.codigo ?? "—"}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{r.descripcion}</Text>
                <Text style={[styles.td, { width: 40 }]}>{r.cantidad}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(r.precioUnitCents, r.moneda)}</Text>
                <Text style={[styles.td, { width: 70 }]}>{money(r.precioUnitCents * r.cantidad, r.moneda)}</Text>
              </View>
            ))}
            <Text style={[pdfStyles.paragraph, { textAlign: "right", marginTop: 4 }]}>
              Total repuestos: {money(totalRepuestos, "UYU")}
            </Text>
          </>
        )}

        {data.gastos.length > 0 && (
          <>
            <Text style={pdfStyles.section}>4. Gastos extra</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>Descripción / motivo</Text>
              <Text style={[styles.th, { width: 80 }]}>Monto</Text>
            </View>
            {data.gastos.map((g, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 1 }]}>{g.descripcion}</Text>
                <Text style={[styles.td, { width: 80 }]}>{money(g.montoCents, g.moneda)}</Text>
              </View>
            ))}
            <Text style={[pdfStyles.paragraph, { textAlign: "right", marginTop: 4 }]}>
              Total gastos extra: {money(totalGastos, "UYU")}
            </Text>
          </>
        )}

        {data.manoDeObraCents > 0 && (
          <Text style={pdfStyles.paragraph}>Mano de obra: {money(data.manoDeObraCents, "UYU")}</Text>
        )}

        {data.observaciones && (
          <>
            <Text style={pdfStyles.section}>Observaciones</Text>
            <Text style={pdfStyles.paragraph}>{data.observaciones}</Text>
          </>
        )}

        <Text style={pdfStyles.section}>Control</Text>
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={{ fontSize: 9 }}>Técnico responsable: {data.tecnicoResponsableNombre ?? "—"}</Text>
            <Text style={{ fontSize: 8, color: "#667085" }}>{fmtDateTime(data.tecnicoResponsableFecha)}</Text>
          </View>
          <View style={styles.col}>
            <Text style={{ fontSize: 9 }}>
              Revisado por: {data.revisadoPorNombre ?? "—"}{" "}
              {data.revisadoAt ? `(${data.revisadoAprobado ? "Aprobado" : "No aprobado"})` : ""}
            </Text>
            <Text style={{ fontSize: 8, color: "#667085" }}>{fmtDateTime(data.revisadoAt)}</Text>
          </View>
        </View>

        <View style={pdfStyles.signaturesRow}>
          <View style={pdfStyles.signatureBox}>
            {data.clienteFirmaDataUrl && <Image style={styles.signature} src={data.clienteFirmaDataUrl} />}
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureName}>Conformidad del cliente — {data.clienteNombre ?? ""}</Text>
              {data.clienteFirmaFecha && (
                <Text style={{ fontSize: 8, color: "#667085" }}>Firmado el {fmtDateTime(data.clienteFirmaFecha)}</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={pdfStyles.footer}>Quiroga Servicio Automotriz — Documento generado por el sistema de gestión</Text>
      </Page>
    </Document>
  );
}
