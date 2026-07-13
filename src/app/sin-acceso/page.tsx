import Link from "next/link";

export default function SinAccesoPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Sin secciones habilitadas</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tu usuario no tiene acceso a ninguna sección todavía. Pedile a un administrador que te
        asigne los permisos correspondientes.
      </p>
      <Link href="/login" className="text-sm font-medium text-brand hover:underline">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
