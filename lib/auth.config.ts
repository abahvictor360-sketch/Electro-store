import type { NextAuthConfig } from "next-auth";

// Edge-runtime-safe auth config — NO Prisma, NO bcrypt.
// Used by middleware.ts which runs in the Edge Runtime.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [], // Credentials provider added in lib/auth.ts (Node.js only)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
