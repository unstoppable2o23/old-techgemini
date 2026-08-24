"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STUDENTS, tokenFor, type TestKind } from "@/lib/tests";

type Assignment = { student: string; kind: TestKind; token: string; created: string };

const STORE_KEY = "assignments_v1";

export default function AssignTestsPage() {
  const [student, setStudent] = useState<string>("");
  const [kind, setKind] = useState<TestKind>("stream");
  const [items, setItems] = useState<Assignment[]>([]);
  const [lastToken, setLastToken] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next: Assignment[]) {
    setItems(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  }

  function assign() {
    if (!student) return;
    const token = tokenFor(student, kind);
    const next = [
      { student, kind, token, created: new Date().toISOString() },
      ...items.filter((a) => a.token !== token),
    ];
    persist(next);
    setLastToken(token);
  }

  const startUrl =
    typeof window !== "undefined" && lastToken
      ? `${window.location.origin}/exam/starttest/${lastToken}`
      : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Assign a test to a student</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Student</label>
              <Select value={student} onValueChange={setStudent}>
                <SelectTrigger>
                  <SelectValue>{student || "Select student"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STUDENTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Test</label>
              <Select value={kind} onValueChange={(v) => setKind(v as TestKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stream">Stream Selector (76 questions)</SelectItem>
                  <SelectItem value="ideal">Ideal Career (182 questions)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={assign} disabled={!student}>
            Generate assignment
          </Button>

          {lastToken && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm">
              <p className="font-medium text-blue-700">Permanent link (never expires):</p>
              <p className="mt-1 break-all font-mono text-xs text-blue-700">{startUrl}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => navigator.clipboard.writeText(startUrl)}
              >
                Copy link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned students</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">No assignments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((a) => (
                <li key={a.token} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{a.student}</p>
                    <p className="text-xs text-slate-500">
                      {a.kind === "stream" ? "Stream Selector" : "Ideal Career"} ·{" "}
                      {new Date(a.created).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`/exam/starttest/${a.token}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Open link
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
