"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createLoginCode } from "@/lib/loginVerification";
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

  try {
    await sendLoginCodeEmail(user.email, code);
  } catch (e) {
    console.error("Error enviando código de acceso:", e);
    return { error: "No se pudo enviar el código por email. Probá de nuevo en un momento." };
  }

  redirect(`/verify-code?id=${id}`);
}
