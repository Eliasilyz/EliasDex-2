import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { DB_ENABLED } from "@/lib/env";
import { createUser, findUserByEmail, findUserByUsername } from "@/models/user";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
});

// Simple in-memory rate limiter: max 5 registrations per IP per hour
const registrationAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = registrationAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  return true;
}

export async function POST(req: Request) {
  if (!DB_ENABLED) {
    return NextResponse.json(
      { error: "Registration requires a database connection" },
      { status: 503 }
    );
  }

  try {
    // Rate limit check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;

    const [existingEmail, existingUser] = await Promise.all([
      findUserByEmail(email),
      findUserByUsername(username),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const user = await createUser(email, username, passwordHash, false);

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id?.toString(),
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
