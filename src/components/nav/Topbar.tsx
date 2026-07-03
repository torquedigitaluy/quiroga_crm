import { LogOut, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/permissions/engine";
import { signOutAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-surface px-6">
      <form action="/clientes" className="hidden max-w-sm flex-1 items-center md:flex">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" placeholder="Buscar cliente por nombre, CI o matrícula…" className="pl-9" />
        </div>
      </form>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user?.name ?? user?.email}</span>
        <ThemeToggle />
        <form action={signOutAction}>
          <Button variant="ghost" size="icon" type="submit" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
