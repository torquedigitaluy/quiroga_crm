import { View, Image, Text, StyleSheet } from "@react-pdf/renderer";
import { getLogoBuffer } from "@/lib/pdf/logo";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2 solid #0936B3",
    paddingBottom: 10,
    marginBottom: 20,
  },
  logo: { width: 130 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 14, fontWeight: 700, color: "#0936B3" },
  subtitle: { fontSize: 9, color: "#667085", marginTop: 2 },
});

export function PdfHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Image style={styles.logo} src={getLogoBuffer()} />
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Quiroga Automóviles</Text>
      </View>
    </View>
  );
}
