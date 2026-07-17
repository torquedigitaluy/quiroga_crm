import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiroga Automóviles — Gestión",
  description: "Sistema de gestión de Quiroga Automóviles",
  icons: { icon: "/logo-quiroga.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      {/* suppressHydrationWarning: algunas extensiones del navegador (p.ej.
          ColorZilla) inyectan atributos en el body antes de que cargue React y
          eso dispara un falso error de hidratación. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
