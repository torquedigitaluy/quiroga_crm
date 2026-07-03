import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 md:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="hidden flex-col items-center justify-center gap-8 bg-brand p-10 text-brand-foreground md:flex">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-lg">
          <Logo width={220} height={52} />
        </div>
        <p className="max-w-xs text-center text-sm text-white/80">
          Sistema de gestión de Quiroga Automóviles: stock, ventas, financiación, escribanía, personal y más en un
          solo lugar.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-8 p-8">
        <div className="mb-2 md:hidden">
          <Logo width={180} height={42} />
        </div>
        <div className="w-full max-w-sm">
          <h1 className="mb-1 text-xl font-semibold text-foreground">Iniciar sesión</h1>
          <p className="mb-6 text-sm text-muted-foreground">Ingresá con tu usuario para continuar.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
