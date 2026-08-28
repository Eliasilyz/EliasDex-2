"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShadcnButton } from "@/components/ui/shadcn/button";

export function GuestButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: `guest_${Date.now()}@guests.local`,
        password: `guest_${Date.now()}`,
        isGuest: true,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ShadcnButton
        onClick={handleGuestSignIn}
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating guest session..." : "Continue as Guest"}
      </ShadcnButton>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
