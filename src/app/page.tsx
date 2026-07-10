import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions/engine";
import { getVisibleNavItems } from "@/components/nav/getVisibleNavItems";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Land the user on the first section they actually have access to, so roles
  // without dashboard access (p.ej. Contadora) no caen en una página vedada.
  const items = await getVisibleNavItems();
  redirect(items[0]?.href ?? "/sin-acceso");
}
