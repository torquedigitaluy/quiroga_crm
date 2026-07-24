"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Botón para enviar un PDF por WhatsApp. En navegadores móviles que soportan
 * Web Share API con archivos (Android Chrome, iOS Safari 15+), adjunta el PDF
 * directamente al compartir. En el resto de los casos (desktop, navegadores
 * sin soporte), cae al link de WhatsApp con el texto + URL del PDF, igual que
 * el resto de la app.
 */
export function WhatsAppPdfButton({
  phone,
  message,
  pdfUrl,
  fileName,
  label = "Enviar por WhatsApp",
}: {
  phone: string | null | undefined;
  message: string;
  pdfUrl: string;
  fileName: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const fallbackHref = buildWhatsAppLink(phone, message);

  const handleClick = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      if (fallbackHref) window.open(fallbackHref, "_blank", "noopener,noreferrer");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
        return;
      }
      if (fallbackHref) window.open(fallbackHref, "_blank", "noopener,noreferrer");
    } catch {
      // El usuario canceló el share, o falló: probamos con el link común.
      if (fallbackHref) window.open(fallbackHref, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  if (!fallbackHref) return null;

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading} className="text-success">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
