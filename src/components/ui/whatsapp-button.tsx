import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  phone,
  message,
  label = "WhatsApp",
}: {
  phone: string | null | undefined;
  message: string;
  label?: string;
}) {
  const href = buildWhatsAppLink(phone, message);
  if (!href) return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-success">
        <MessageCircle className="h-3.5 w-3.5" />
        {label}
      </a>
    </Button>
  );
}
