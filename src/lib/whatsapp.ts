/** Builds a wa.me deep link that opens WhatsApp with the client's number and a
 * predefined message already typed into the compose box (still editable by the
 * user before sending). Uruguayan local numbers (09XXXXXXX) are normalized to
 * the +598 international format; anything else is passed through digits-only. */
export function buildWhatsAppLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("0") && digits.length === 9) {
    digits = `598${digits.slice(1)}`;
  } else if (!digits.startsWith("598") && digits.length === 8) {
    digits = `598${digits}`;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
