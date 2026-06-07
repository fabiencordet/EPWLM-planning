import { compareSync } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AppRole = "coach" | "admin";

function dbRoleToAppRole(role: Role): AppRole {
  return role === Role.ADMIN ? "admin" : "coach";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const found = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!found) return null;
        if (!found.isActive) return null;

        if (!compareSync(parsed.data.password, found.passwordHash)) {
          return null;
        }

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          role: dbRoleToAppRole(found.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: AppRole }).role ?? "coach";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as AppRole) ?? "coach";
      }
      return session;
    },
  },
};
