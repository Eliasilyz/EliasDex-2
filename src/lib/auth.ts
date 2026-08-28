import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DB_ENABLED } from "./env";
import { findUserByEmail } from "@/models/user";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    level: number;
    isGuest: boolean;
    avatarUrl?: string;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    role: string;
    level: number;
    isGuest: boolean;
    avatarUrl?: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!DB_ENABLED) {
          throw new Error("Authentication requires a database connection. Please try Guest mode.");
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await findUserByEmail(credentials.email as string);
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const passwordMatch = await compare(credentials.password as string, user.passwordHash);
        if (!passwordMatch) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user._id?.toString() || "",
          email: user.email,
          username: user.username,
          role: user.role,
          level: user.level,
          isGuest: user.isGuest,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.level = user.level;
        token.isGuest = user.isGuest;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.level = token.level as number;
        session.user.isGuest = token.isGuest as boolean;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "dev-auth-secret-for-build-purposes-only-eliasdex2",
};

export async function auth() {
  return getServerSession(authOptions);
}

