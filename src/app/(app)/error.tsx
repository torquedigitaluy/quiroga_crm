"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppError({ error }: { error: Error & { digest?: string } }) {
  const isAuthError = error.message?.startsWith("No autorizado");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardHeader className="items-center text-center">
          <ShieldAlert className="mb-2 h-10 w-10 text-warning" />
          <CardTitle>{isAuthError ? "No autorizado" : "Ocurrió un error"}</CardTitle>
          <CardDescription>
            {isAuthError
              ? "No tenés permiso para acceder a esta sección. Si creés que es un error, contactá al administrador."
              : "Algo salió mal al cargar esta página. Podés volver al panel principal e intentar de nuevo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Volver al panel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
