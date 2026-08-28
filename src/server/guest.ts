import { randomUUID } from "crypto";
import { createUser, findUserById, updateUser, User } from "@/models/user";
import { DB_ENABLED } from "@/lib/env";

function generateGuestUsername(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Guest${num}`;
}

export async function createGuestSession(): Promise<
  | { success: true; userId: string; username: string }
  | { success: false; error: string }
> {
  if (!DB_ENABLED) {
    return createStatelessGuestSession();
  }

  const username = generateGuestUsername();
  const guest = await createUser(
    `${username.toLowerCase()}@guests.local`,
    username,
    undefined,
    true
  );

  if (!guest || !guest._id) {
    return { success: false, error: "Failed to create guest session" };
  }

  return {
    success: true,
    userId: guest._id.toString(),
    username: guest.username,
  };
}

export async function createStatelessGuestSession(): Promise<
  | { success: true; userId: string; username: string }
  | { success: false; error: string }
> {
  return {
    success: true,
    userId: `guest_${randomUUID()}`,
    username: generateGuestUsername(),
  };
}

export async function upgradeGuestToMember(
  guestUserId: string,
  email: string,
  password: string,
  username: string
): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  if (!DB_ENABLED) {
    return { success: false, error: "Database required to upgrade guest account" };
  }

  const guest = await findUserById(guestUserId);
  if (!guest || !guest.isGuest) {
    return { success: false, error: "Guest session not found" };
  }

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(password, 12);

  const updated = await updateUser(guestUserId, {
    email,
    username,
    passwordHash,
    role: "member",
    isGuest: false,
    guestExpiresAt: undefined,
  });

  if (!updated || !updated._id) {
    return { success: false, error: "Failed to upgrade account" };
  }

  return {
    success: true,
    userId: updated._id.toString(),
  };
}
