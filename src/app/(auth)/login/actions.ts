"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth/auth";
import { createLoginCode, verifyLoginCode } from "@/lib/loginVerification";
import { sendLoginCodeEmail } from "@/lib/email";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Ingresá tu email y contraseña." };

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.activo) return { error: "Email o contraseña incorrectos." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Email o contraseña incorrectos." };

  const { id, code } = await createLoginCode(user.id);

  // Bypass de 2FA únicamente para desarrollo local: requiere una variable de
  // entorno que jamás se configura en Vercel (solo en .env.local, que no se
  // versiona), y además solo aplica al email exacto configurado ahí. En
  // producción esta rama nunca se ejecuta — el login siempre exige el código
  // por email, sin excepciones.
  const bypassEmail = process.env.LOCAL_TWO_FACTOR_BYPASS_EMAIL?.toLowerCase();
  if (process.env.NODE_ENV !== "production" && bypassEmail && bypassEmail === email) {
    const ticket = await verifyLoginCode(id, code);
    if (!ticket) return { error: "No se pudo completar el inicio de sesión. Probá de nuevo." };
    try {
      await signIn("credentials", { email: user.email, otpTicket: ticket, redirectTo: "/dashboard" });
      return {};
    } catch (error) {
      if (error instanceof AuthError) return { error: "No se pudo completar el inicio de sesión. Probá de nuevo." };
      throw error;
    }
  }

  try {
    await sendLoginCodeEmail(user.email, code);
  } catch (e) {
    console.error("Error enviando código de acceso:", e);
    return { error: "No se pudo enviar el código por email. Probá de nuevo en un momento." };
  }

  redirect(`/verify-code?id=${id}`);
}
