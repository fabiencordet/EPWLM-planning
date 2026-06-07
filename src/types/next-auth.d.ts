import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      role: "coach" | "admin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "coach" | "admin";
  }
}
