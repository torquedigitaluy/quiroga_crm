"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-foreground">Tu contraseña se actualizó correctamente.</p>
        <a href="/login" className="text-brand hover:underline">
          Ir a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={8} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="mt-2">
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
