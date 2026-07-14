"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyCodeAction, type VerifyCodeState } from "./actions";

const initialState: VerifyCodeState = {};

export function VerifyCodeForm({ verificationId }: { verificationId: string }) {
  const [state, formAction, pending] = useActionState(verifyCodeAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      <input type="hidden" name="verificationId" value={verificationId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          placeholder="123456"
        />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="mt-2">
        {pending ? "Verificando…" : "Verificar e ingresar"}
      </Button>
      <a href="/login" className="text-center text-sm text-muted-foreground hover:text-brand hover:underline">
        Volver a iniciar sesión
      </a>
    </form>
  );
}
