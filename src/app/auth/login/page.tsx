"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!email) {
      setLogoUrl(undefined);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/public/logo?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((data) => setLogoUrl(data.logoUrl || undefined))
        .catch(() => setLogoUrl(undefined));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Page background: pink -> indigo (Colorlib Login V1 palette) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(-135deg, #c850c0, #4158d0)" }}
      />
      <div className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row">
        {/* Left: illustration / branding panel */}
        <div className="relative flex flex-col items-center justify-center gap-8 overflow-hidden p-10 lg:flex lg:w-1/2">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, #e9b7f0 0%, #9fb8f5 100%)" }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6">
            <BrandLogo
              override={logoUrl}
              className="max-h-40 max-w-[280px] object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* Right: form panel */}
        <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 lg:w-1/2 lg:px-14">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLogo override={logoUrl} className="max-h-12 max-w-[160px] object-contain" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Member Login</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Email */}
            <div className="group relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="email"
                className="peer w-full border-0 border-b border-gray-300 bg-transparent px-1 pb-2.5 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Mail className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            {/* Password */}
            <div className="group relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="w-full border-0 border-b border-gray-300 bg-transparent px-1 pb-2.5 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Lock className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c850c0] to-[#4158d0] py-3 text-sm font-semibold text-white shadow-lg shadow-[#4158d0]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#4158d0]/40 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 font-semibold text-gray-600 transition-colors hover:text-[#4158d0]"
            >
              Create your Account
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}