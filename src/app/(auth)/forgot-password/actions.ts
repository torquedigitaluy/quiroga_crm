"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

export type ForgotPasswordState = { sent?: boolean; error?: string };

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Ingresá tu email." };

  const user = await db.user.findUnique({ where: { email } });
  // No revelamos si el email existe o no, para no filtrar qué cuentas son reales.
  if (user && user.activo) {
    const token = await createPasswordResetToken(user.id);
    const h = await headers();
    const host = h.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (e) {
      console.error("Error enviando email de recuperación:", e);
    }
  }

  return { sent: true };
}
