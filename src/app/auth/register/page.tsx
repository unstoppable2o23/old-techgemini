"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Calendar, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandLogo } from "@/components/brand-logo";

const GRADE_OPTIONS = [
  "8th", "9th", "10th", "11th", "12th", "Pursuing UG", "Completed UG",
];

const STUDY_LEVEL_OPTIONS = [
  "Bachelor's (Undergraduate)", "Master's (Postgraduate)",
  "PhD / Doctorate", "Diploma / Foundation", "Other",
];

const EXAM_OPTIONS = [
  "IELTS", "TOEFL", "SAT", "ACT", "GRE", "GMAT",
  "A-Levels", "IB Diploma", "CELPIP", "PTE", "None yet",
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
    studyLevel: "",
    exams: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const loadTime = useRef(Date.now());

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleExam(exam: string) {
    setForm((prev) => ({
      ...prev,
      exams: prev.exams.includes(exam)
        ? prev.exams.filter((e) => e !== exam)
        : [...prev.exams, exam],
    }));
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(-135deg, #c850c0, #4158d0)" }}
      />
      <div className="pointer-events-none absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row">
        {/* Left: brand logo panel */}
        <div className="relative hidden flex-col items-center justify-center overflow-hidden p-10 lg:flex lg:w-1/2">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, #e9b7f0 0%, #9fb8f5 100%)" }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />

          <div className="relative">
            <BrandLogo className="max-h-40 max-w-[280px] object-contain drop-shadow-lg" />
          </div>
        </div>

        {/* Right: form panel */}
        <div className="flex w-full flex-col justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12">
          <div className="mb-4 flex justify-center lg:hidden">
            <BrandLogo className="max-h-12 max-w-[160px] object-contain" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in your details to get started</p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 max-h-[62vh] space-y-4 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <input ref={honeypotRef} type="text" name="_hp" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} />
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="group relative">
                <Label className="mb-1 block text-xs font-semibold text-gray-500">First Name</Label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="John"
                  required
                  className="w-full border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
                <User className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
              </div>
              {/* Last Name */}
              <div className="group relative">
                <Label className="mb-1 block text-xs font-semibold text-gray-500">Last Name</Label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
                <User className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
              </div>
            </div>

            <div className="group relative">
              <Label className="mb-1 block text-xs font-semibold text-gray-500">Date of Birth</Label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                required
                className="w-full cursor-pointer border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors focus:border-b-transparent [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Calendar className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            <div className="group relative">
              <Label className="mb-1 block text-xs font-semibold text-gray-500">Email</Label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Mail className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            <div className="group relative">
              <Label className="mb-1 block text-xs font-semibold text-gray-500">Create Password</Label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Lock className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            <div className="group relative">
              <Label className="mb-1 block text-xs font-semibold text-gray-500">Mobile</Label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                placeholder="9876543210"
                required
                className="w-full border-0 border-b border-gray-300 bg-transparent pb-2 pl-0 pr-9 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-b-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#c850c0] to-[#4158d0] transition-transform duration-300 group-focus-within:scale-x-100" />
              <Phone className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4158d0]" />
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <Label className="mb-1 block text-xs font-semibold text-gray-500">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0"><SelectValue>Select gender</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-gray-500">Choose your status as a student</Label>
                <Select value={form.gradeLevel} onValueChange={(v) => update("gradeLevel", v)}>
                  <SelectTrigger className="border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0"><SelectValue>Select your grade</SelectValue></SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-gray-500">What study level are you planning? *</Label>
                <Select value={form.studyLevel} onValueChange={(v) => update("studyLevel", v)}>
                  <SelectTrigger className="border-0 border-b border-gray-300 rounded-none bg-transparent focus:ring-0"><SelectValue>Select study level</SelectValue></SelectTrigger>
                  <SelectContent>
                    {STUDY_LEVEL_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <Label className="mb-2 block text-xs font-semibold text-gray-500">Which entrance exams are you preparing for?</Label>
              <div className="flex flex-wrap gap-2">
                {EXAM_OPTIONS.map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      form.exams.includes(exam)
                        ? "border-transparent bg-gradient-to-r from-[#c850c0] to-[#4158d0] text-white shadow-sm"
                        : "border-gray-300 text-gray-500 hover:border-[#4158d0] hover:text-[#4158d0]"
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c850c0] to-[#4158d0] py-3 text-sm font-semibold text-white shadow-lg shadow-[#4158d0]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#4158d0]/40 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-1 font-semibold text-gray-600 transition-colors hover:text-[#4158d0]"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
