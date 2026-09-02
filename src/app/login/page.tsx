import { LoginForm } from "@/components/auth/LoginForm";
import { GuestButton } from "@/components/auth/GuestButton";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-surface-primary mb-2">Welcome Back</h1>
          <p className="text-ink-500">Sign in to your account to continue</p>
        </div>

        <LoginForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface-canvas text-ink-500">Or</span>
          </div>
        </div>

        <GuestButton />

        <p className="text-center text-sm text-ink-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-orange-400 hover:text-orange-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
