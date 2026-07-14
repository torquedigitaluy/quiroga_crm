import crypto from "crypto";
import { db } from "@/lib/db";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const TICKET_TTL_MS = 2 * 60 * 1000; // 2 minutos — solo lo que tarda el redirect a signIn()

function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/** Genera y guarda el código de 6 dígitos para un usuario ya autenticado por contraseña. */
export async function createLoginCode(userId: string): Promise<{ id: string; code: string }> {
  const code = randomCode();
  const verification = await db.loginVerification.create({
    data: {
      userId,
      codeHash: hash(code),
      codeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });
  return { id: verification.id, code };
}

/**
 * Valida el código ingresado. Si es correcto, emite un ticket de un solo uso
 * y vida muy corta para completar el signIn() real vía el provider Credentials.
 */
export async function verifyLoginCode(verificationId: string, code: string): Promise<string | null> {
  const verification = await db.loginVerification.findUnique({ where: { id: verificationId } });
  if (!verification || verification.codeUsedAt || verification.codeExpiresAt < new Date()) return null;
  if (verification.codeHash !== hash(code)) return null;

  const ticket = crypto.randomBytes(32).toString("base64url");
  await db.loginVerification.update({
    where: { id: verification.id },
    data: {
      codeUsedAt: new Date(),
      otpTicketHash: hash(ticket),
      otpTicketExpiresAt: new Date(Date.now() + TICKET_TTL_MS),
    },
  });
  return ticket;
}

/** Usado exclusivamente por el provider Credentials — nunca acepta una contraseña cruda. */
export async function consumeLoginTicket(ticket: string): Promise<{ userId: string } | null> {
  const ticketHash = hash(ticket);
  const verification = await db.loginVerification.findFirst({
    where: { otpTicketHash: ticketHash, otpTicketUsedAt: null },
  });
  if (!verification || !verification.otpTicketExpiresAt || verification.otpTicketExpiresAt < new Date()) return null;
  await db.loginVerification.update({ where: { id: verification.id }, data: { otpTicketUsedAt: new Date() } });
  return { userId: verification.userId };
}
