"use client";
import { rethrowIfNextControlFlow } from "@/lib/nextControlFlow";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "./SignaturePad";

export function ConformidadClienteCard({
  clienteNombre,
  firmaDataUrl,
  firmaFecha,
  editable,
  action,
}: {
  clienteNombre: string | null;
  firmaDataUrl: string | null;
  firmaFecha: Date | null;
  editable: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (e) {
        rethrowIfNextControlFlow(e);
        setError(e instanceof Error ? e.message : "Error al guardar la firma");
      }
    });
  };

  if (firmaDataUrl) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground">
          Firmado por <strong>{clienteNombre ?? "el cliente"}</strong>
          {firmaFecha ? ` el ${new Date(firmaFecha).toLocaleString("es-UY")}` : ""}.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={firmaDataUrl} alt="Firma del cliente" className="h-32 w-64 rounded-md border border-border bg-white" />
      </div>
    );
  }

  if (!editable) {
    return <p className="text-sm text-muted-foreground">El cliente todavía no firmó la conformidad.</p>;
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <SignaturePad name="firma" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar firma"}
        </Button>
      </div>
    </form>
  );
}
