"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  if (state.sent) {
    return (
      <p className="text-sm text-foreground">
        Si el email existe en el sistema, te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de
        entrada (y la carpeta de spam).
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="mt-2">
        {pending ? "Enviando…" : "Enviar link de recuperación"}
      </Button>
      <a href="/login" className="text-center text-sm text-muted-foreground hover:text-brand hover:underline">
        Volver a iniciar sesión
      </a>
    </form>
  );
}
