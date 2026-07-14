"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { verifyLoginCode } from "@/lib/loginVerification";

export type VerifyCodeState = { error?: string };

export async function verifyCodeAction(_prevState: VerifyCodeState, formData: FormData): Promise<VerifyCodeState> {
  const verificationId = String(formData.get("verificationId") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  if (!verificationId || !code) return { error: "Ingresá el código que te enviamos." };

  const ticket = await verifyLoginCode(verificationId, code);
  if (!ticket) return { error: "Código incorrecto o vencido. Volvé a iniciar sesión para pedir uno nuevo." };

  const verification = await db.loginVerification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });
  if (!verification) return { error: "No pudimos completar el inicio de sesión. Volvé a intentar." };

  try {
    await signIn("credentials", { email: verification.user.email, otpTicket: ticket, redirectTo: "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "No pudimos completar el inicio de sesión. Volvé a intentar." };
    }
    // NEXT_REDIRECT is thrown on success — rethrow so Next.js can handle the redirect.
    throw error;
  }
}
