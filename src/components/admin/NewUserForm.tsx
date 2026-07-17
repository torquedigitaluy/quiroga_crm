"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NewUserForm({
  roles,
  action,
}: {
  roles: { id: string; nombre: string }[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al crear el usuario");
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input name="nombre" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Email</Label>
          <Input name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Contraseña</Label>
          <Input name="password" type="password" required minLength={6} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Rol inicial</Label>
          <Select name="roleId">
            <SelectTrigger>
              <SelectValue placeholder="Sin rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
