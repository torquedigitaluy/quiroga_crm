import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.activo) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

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
