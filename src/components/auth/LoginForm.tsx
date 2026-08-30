"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShadcnButton } from "@/components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card";

const loginSchema = z.object({
 email: z.string().email("Invalid email address"),
 password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const callbackUrl = searchParams.get("callbackUrl") || "/";
 const [error, setError] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(false);

 const {
  register,
  handleSubmit,
  formState: { errors },
 } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
 });

 const onSubmit = async (data: LoginFormData) => {
  setIsLoading(true);
  setError(null);

  try {
   const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
   });

   if (result?.error) {
    setError(result.error);
   } else if (result?.ok) {
    router.push(callbackUrl);
   }
  } catch (err: any) {
   setError(err.message || "Login failed");
  } finally {
   setIsLoading(false);
  }
 };

 return (
  <Card className="w-full max-w-md">
   <CardHeader>
    <CardTitle as="h2">Sign In</CardTitle>
    <CardDescription>Enter your credentials to continue</CardDescription>
   </CardHeader>
   <CardContent>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
     <div>
      <label className="text-sm font-medium text-ink-300">Email</label>
      <input
       {...register("email")}
       type="email"
       placeholder="you@example.com"
       className="w-full mt-1 px-3 py-2 bg-surface-canvas border border-ink-500 rounded-lg text-surface-primary placeholder-ink-500 focus:outline-none focus:ring-2 focus:"
      />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
     </div>

     <div>
      <label className="text-sm font-medium text-ink-300">Password</label>
      <input
       {...register("password")}
       type="password"
       placeholder="••••••"
       className="w-full mt-1 px-3 py-2 bg-surface-canvas border border-ink-500 rounded-lg text-surface-primary placeholder-ink-500 focus:outline-none focus:ring-2 focus:"
      />
      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
     </div>

     {error && <p className="text-red-500 text-sm">{error}</p>}

     <ShadcnButton type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? "Signing in..." : "Sign In"}
     </ShadcnButton>
    </form>
   </CardContent>
  </Card>
 );
}
