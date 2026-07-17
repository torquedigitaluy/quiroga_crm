import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ValePDF } from "@/components/pdf/ValePDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate_vale");
  const { id } = await params;

  const vale = await db.vale.findUnique({ where: { id } });

  if (!vale) {
    return new Response("Vale no encontrado", { status: 404 });
  }

  const buffer = await renderToBuffer(<ValePDF data={vale} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="vale-${vale.numero}.pdf"`,
    },
  });
}
