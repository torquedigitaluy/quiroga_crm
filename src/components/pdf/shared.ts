import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: { padding: 36, fontSize: 10.5, fontFamily: "Helvetica", color: "#1A1D29" },
  paragraph: { marginBottom: 12, lineHeight: 1.5 },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 140, color: "#667085" },
  value: { flex: 1, fontWeight: 700 },
  section: { marginTop: 16, marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#0936B3" },
  signaturesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 60, gap: 20 },
  signatureBox: { flex: 1, alignItems: "center" },
  signatureLine: { borderTop: "1 solid #1A1D29", width: "100%", marginTop: 40, paddingTop: 4 },
  signatureName: { fontSize: 9, marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, fontSize: 8, color: "#667085", textAlign: "center" },
});
