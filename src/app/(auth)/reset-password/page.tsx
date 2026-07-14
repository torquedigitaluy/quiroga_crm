import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="relative grid min-h-dvh place-items-center p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo width={180} height={42} />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-foreground">Elegí una nueva contraseña</h1>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="mt-4 text-sm text-danger">Este link no es válido.</p>
        )}
      </div>
    </div>
  );
}
