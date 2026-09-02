import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DB_ENABLED } from "./env";
import { findUserByEmail, findUserById } from "@/models/user";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    level: number;
    isGuest: boolean;
    avatarUrl?: string;
    isVerified: boolean;
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
    isVerified: boolean;
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
          isVerified: user.isVerified,
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
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Refresh user claims from DB so role/verified changes apply without re-login
        const uid = token.id as string | undefined;
        if (DB_ENABLED && uid) {
          try {
            const fresh = await findUserById(uid);
            if (fresh) {
              session.user.id = fresh._id ? fresh._id.toString() : uid;
              session.user.email = fresh.email ?? session.user.email;
              session.user.username = fresh.username ?? session.user.username;
              session.user.role = fresh.role ?? (token.role as string);
              session.user.level = fresh.level ?? (token.level as number);
              session.user.isGuest = fresh.isGuest ?? (token.isGuest as boolean);
              session.user.avatarUrl = fresh.avatarUrl ?? (token.avatarUrl as string | undefined);
              session.user.isVerified = fresh.isVerified ?? (token.isVerified as boolean);
              return session;
            }
          } catch {
            // fall through to token values if DB is unavailable
          }
        }
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.level = token.level as number;
        session.user.isGuest = token.isGuest as boolean;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
        session.user.isVerified = token.isVerified as boolean;
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
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  // NOTE: If NEXTAUTH_SECRET is not set, NextAuth will throw at runtime.
  // The previous hardcoded fallback was a critical security risk.
};

export async function auth() {
  return getServerSession(authOptions);
}

