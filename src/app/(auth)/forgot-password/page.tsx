import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo width={180} height={42} />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-foreground">Recuperar contraseña</h1>
        <p className="mb-6 text-sm text-muted-foreground">Te mandamos un link para elegir una nueva contraseña.</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
