import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { PromesaPDF } from "@/components/pdf/PromesaPDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const promesa = await db.promesaCompraventa.findUnique({ where: { id } });

  if (!promesa) {
    return new Response("Promesa de compraventa no encontrada", { status: 404 });
  }

  const buffer = await renderToBuffer(<PromesaPDF data={promesa} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="promesa-${promesa.numero}.pdf"`,
    },
  });
}
