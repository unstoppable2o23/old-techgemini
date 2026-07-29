"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Loader2, GraduationCap, Globe, Briefcase, Calendar } from "lucide-react";

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "Germany", "France", "India",
  "Singapore", "New Zealand", "Ireland", "Netherlands", "Switzerland",
  "Sweden", "Italy", "Spain", "Japan", "China", "South Korea", "UAE", "Other",
];

const CAREERS = [
  "Engineering", "Medicine", "Business / Management", "Computer Science / IT",
  "Law", "Arts & Humanities", "Design", "Architecture", "Data Science / AI",
  "Finance / Economics", "Psychology", "Biotechnology", "Environmental Science",
  "Education / Teaching", "Media & Communication", "Other",
];

const SESSIONS = [
  "Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027",
];

export default function CareerPreferencesPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<string[]>([]);
  const [collegeInput, setCollegeInput] = useState("");
  const [collegeFinalized, setCollegeFinalized] = useState(false);

  const [countries, setCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [countryFinalized, setCountryFinalized] = useState(false);

  const [career, setCareer] = useState("");
  const [careerFinalized, setCareerFinalized] = useState(false);

  const [sessions, setSessions] = useState<string[]>([]);
  const [sessionInput, setSessionInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addCollege() {
    if (collegeInput.trim() && !colleges.includes(collegeInput.trim())) {
      setColleges((prev) => [...prev, collegeInput.trim()]);
      setCollegeInput("");
    }
  }

  function removeCollege(c: string) {
    setColleges((prev) => prev.filter((x) => x !== c));
  }

  function addCountry() {
    if (countryInput && !countries.includes(countryInput)) {
      setCountries((prev) => [...prev, countryInput]);
      setCountryInput("");
    }
  }

  function removeCountry(c: string) {
    setCountries((prev) => prev.filter((x) => x !== c));
  }

  function addSession() {
    if (sessionInput && !sessions.includes(sessionInput)) {
      setSessions((prev) => [...prev, sessionInput]);
      setSessionInput("");
    }
  }

  function removeSession(s: string) {
    setSessions((prev) => prev.filter((x) => x !== s));
  }

  async function handleSubmit() {
    if (!career && !careerFinalized) { setError("Please select a preferred career"); return; }
    if (countries.length === 0 && !countryFinalized) { setError("Please select at least one country"); return; }
    if (colleges.length === 0 && !collegeFinalized) { setError("Please add at least one college target"); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/student/career-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetColleges: collegeFinalized ? [] : colleges,
        targetCountries: countryFinalized ? [] : countries,
        preferredCareer: careerFinalized ? "" : career,
        prospectiveSessions: sessions,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Tell us about your Career Preferences</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your career preferences help us provide you with the most relevant and updated information!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> What Colleges are you targeting to join? *</Label>
            {colleges.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full mr-2 mb-2">
                {c}
                <button onClick={() => removeCollege(c)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <div className="flex gap-2">
              <Input value={collegeInput} onChange={(e) => setCollegeInput(e.target.value)}
                placeholder="Choose a college..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCollege())} />
              <Button variant="outline" onClick={addCollege} type="button"><Plus className="h-4 w-4" /></Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={collegeFinalized} onChange={(e) => setCollegeFinalized(e.target.checked)} className="rounded" />
              I haven't finalized the college yet
            </label>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> What is your preferred country? *</Label>
            {countries.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full mr-2 mb-2">
                {c}
                <button onClick={() => removeCountry(c)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <div className="flex gap-2">
              <Select value={countryInput} onValueChange={setCountryInput}>
                <SelectTrigger className="flex-1"><SelectValue>Choose a country...</SelectValue></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.filter((c) => !countries.includes(c)).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={addCountry} type="button"><Plus className="h-4 w-4" /></Button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={countryFinalized} onChange={(e) => setCountryFinalized(e.target.checked)} className="rounded" />
              I haven't finalized the country yet
            </label>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> What is your preferred career? *</Label>
            <Select value={career} onValueChange={setCareer}>
              <SelectTrigger><SelectValue>Choose a career...</SelectValue></SelectTrigger>
              <SelectContent>
                {CAREERS.filter((c) => !careerFinalized).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={careerFinalized} onChange={(e) => setCareerFinalized(e.target.checked)} className="rounded" />
              I haven't finalized the career yet
            </label>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Prospective Sessions to join college (optional)</Label>
            {sessions.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full mr-2 mb-2">
                {s}
                <button onClick={() => removeSession(s)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <div className="flex gap-2">
              <Select value={sessionInput} onValueChange={setSessionInput}>
                <SelectTrigger className="flex-1"><SelectValue>Choose a session...</SelectValue></SelectTrigger>
                <SelectContent>
                  {SESSIONS.filter((s) => !sessions.includes(s)).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={addSession} type="button"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Next
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
