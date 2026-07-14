import { db } from "@/lib/db";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { VerifyCodeForm } from "./VerifyCodeForm";

export default async function VerifyCodePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const verification = id
    ? await db.loginVerification.findUnique({ where: { id }, include: { user: true } })
    : null;
  const valido = verification && !verification.codeUsedAt && verification.codeExpiresAt > new Date();

  return (
    <div className="relative grid min-h-dvh place-items-center p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <Logo width={180} height={42} />
        </div>
        {valido ? (
          <>
            <h1 className="mb-1 text-xl font-semibold text-foreground">Verificá tu identidad</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Te enviamos un código de 6 dígitos a {verification.user.email}. Ingresalo para continuar.
            </p>
            <VerifyCodeForm verificationId={verification.id} />
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-foreground">Código no válido</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Este código ya venció o ya se usó. Volvé a iniciar sesión para recibir uno nuevo.
            </p>
            <a href="/login" className="text-brand hover:underline">
              Volver a iniciar sesión
            </a>
          </>
        )}
      </div>
    </div>
  );
}
