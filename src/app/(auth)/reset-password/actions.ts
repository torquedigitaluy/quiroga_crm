"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { consumePasswordResetToken } from "@/lib/passwordReset";

export type ResetPasswordState = { error?: string; success?: boolean };

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!token) return { error: "Link inválido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== passwordConfirm) return { error: "Las contraseñas no coinciden." };

  const record = await consumePasswordResetToken(token);
  if (!record) return { error: "Este link venció o ya se usó. Pedí uno nuevo desde \"¿Olvidaste tu contraseña?\"." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({ where: { id: record.userId }, data: { passwordHash } });

  return { success: true };
}
