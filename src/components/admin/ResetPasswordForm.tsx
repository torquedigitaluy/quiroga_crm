"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await action(formData);
        setSuccess(true);
        const form = document.getElementById("reset-password-form") as HTMLFormElement | null;
        form?.reset();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cambiar la contraseña");
      }
    });
  };

  return (
    <form id="reset-password-form" action={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
        <Input name="password" type="password" minLength={6} required className="w-56" />
      </div>
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
      {success && <span className="text-sm text-success">Actualizada</span>}
      {error && <span className="text-sm text-danger">{error}</span>}
    </form>
  );
}
