"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Registration failed");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
      } else {
        setError(result?.error || "Failed to sign in");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to save your watchlist and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-200">Username</label>
            <input
              {...register("username")}
              type="text"
              placeholder="your_username"
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-200">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-200">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••"
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-200">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••"
              className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <ShadcnButton type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </ShadcnButton>
        </form>
      </CardContent>
    </Card>
  );
}
