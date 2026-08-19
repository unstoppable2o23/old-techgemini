"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";

const GRADE_OPTIONS = [
  "8th", "9th", "10th", "11th", "12th", "Pursuing UG", "Completed UG",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    mobile: "",
    gender: "",
    gradeLevel: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const loadTime = useRef(Date.now());

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (honeypotRef.current?.value) return;
    if (Date.now() - loadTime.current < 3000) {
      setError("Please wait a moment before submitting");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 60%, hsl(var(--primary)) 100%)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center">
          <BrandLogo className="h-16 w-16" />
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input ref={honeypotRef} type="text" name="_hp" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Doe" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="name@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Create Password</Label>
              <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
            </div>

            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input type="tel" placeholder="9876543210" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger><SelectValue>Select gender</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Choose your status as a student</Label>
              <Select value={form.gradeLevel} onValueChange={(v) => update("gradeLevel", v)}>
                <SelectTrigger><SelectValue>Select your grade</SelectValue></SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
