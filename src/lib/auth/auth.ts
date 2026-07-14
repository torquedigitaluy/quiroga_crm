import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { consumeLoginTicket } from "@/lib/loginVerification";

const DOCE_HORAS_MS = 12 * 60 * 60 * 1000;
const VEINTICUATRO_HORAS_MS = 24 * 60 * 60 * 1000;

/** Administradores renuevan sesión cada 12hs; el resto de los roles, cada 24hs. */
async function duracionSesionMs(userId: string): Promise<number> {
  const esSuperadmin = await db.userRole.findFirst({
    where: { userId, role: { key: "SUPERADMIN" } },
  });
  return esSuperadmin ? DOCE_HORAS_MS : VEINTICUATRO_HORAS_MS;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: VEINTICUATRO_HORAS_MS / 1000 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otpTicket: { label: "otpTicket", type: "text" },
      },
      // Nunca acepta una contraseña cruda: la contraseña se valida aparte, en
      // el server action que manda el código por email (ver login/actions.ts).
      // Este provider solo emite sesión si recibe un ticket de un solo uso ya
      // consumido tras verificar ese código — así un POST directo a la API de
      // NextAuth con email+password nunca alcanza para loguearse.
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const otpTicket = credentials?.otpTicket as string | undefined;
        if (!email || !otpTicket) return null;

        const consumed = await consumeLoginTicket(otpTicket);
        if (!consumed) return null;

        const user = await db.user.findUnique({ where: { id: consumed.userId } });
        if (!user || !user.activo || user.email.toLowerCase() !== email.toLowerCase()) return null;

        return { id: user.id, name: user.nombre, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.userId = user.id;
        token.expiresAt = Date.now() + (await duracionSesionMs(user.id));
      }
      // Expiración absoluta desde el login (no rolling): al vencer, se limpia
      // el token para que session() la trate como sesión cerrada.
      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : null;
      if (expiresAt !== null && Date.now() > expiresAt) {
        delete token.userId;
        delete token.expiresAt;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
