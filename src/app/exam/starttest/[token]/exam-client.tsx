"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildReport,
  DOMAIN_META,
  orderedOptions,
  questionsFor,
  type ExamReport,
  type TestKind,
} from "@/lib/tests";
import personalityProfiles from "@/data/personality-profiles.json";

type Props = { token: string; kind: TestKind };

export function ExamClient({ token, kind }: Props) {
  const bank = useMemo(() => questionsFor(kind), [kind]);
  const ordered = useMemo(
    () =>
      Object.values(bank)
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map((q) => ({ id: String(q.id), domain: Number(q.domain_id) })),
    [bank]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [report, setReport] = useState<ExamReport | null>(null);
  const [saving, setSaving] = useState(false);

  const progressKey = `exam_progress_${token}`;
  const resultKey = `exam_result_${token}`;
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let localProgress: Record<string, string> = {};
      try {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          localProgress = JSON.parse(savedProgress);
          if (!cancelled) setAnswers(localProgress);
        }
      } catch {}
      try {
        const savedResult = localStorage.getItem(resultKey);
        if (savedResult && !cancelled) {
          setReport(JSON.parse(savedResult));
          setReady(true);
          return;
        }
      } catch {}
      try {
        const res = await fetch(
          `/api/tests/assignments/complete?token=${encodeURIComponent(token)}`
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.report) {
            setReport(data.report);
            setReady(true);
            return;
          }
          if (!localProgress || Object.keys(localProgress).length === 0) {
            if (data.answers && Object.keys(data.answers).length > 0) {
              setAnswers(data.answers);
            }
          }
        }
      } catch {}
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resultKey, progressKey, token]);

  const saveProgressToDb = useCallback(
    (next: Record<string, string>) => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
      progressTimer.current = setTimeout(() => {
        fetch("/api/tests/assignments/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, answers: next }),
        }).catch(() => {});
      }, 800);
    },
    [token]
  );

  const answeredCount = ordered.filter((q) => answers[q.id]).length;
  const allAnswered = answeredCount === ordered.length;
  const current = bank[ordered[idx]?.id];
  const prevDomain = idx > 0 ? ordered[idx - 1]?.domain : undefined;
  const showIntro =
    current && ordered[idx]?.domain !== prevDomain && idx > 0;
  const meta = current ? DOMAIN_META[kind][Number(current.domain_id)] : undefined;

  function select(qid: string, optId: string) {
    const next = { ...answers, [qid]: optId };
    setAnswers(next);
    localStorage.setItem(progressKey, JSON.stringify(next));
    saveProgressToDb(next);
  }

  async function finish() {
    setSaving(true);
    const localReport = buildReport(kind, answers);
    setReport(localReport);
    localStorage.setItem(resultKey, JSON.stringify(localReport));
    try {
      const res = await fetch("/api/tests/assignments/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
          localStorage.setItem(resultKey, JSON.stringify(data.report));
        }
      }
    } catch {}
    setSaving(false);
  }

  function retake() {
    setAnswers({});
    setReport(null);
    setIdx(0);
    localStorage.removeItem(progressKey);
    localStorage.removeItem(resultKey);
    fetch("/api/tests/assignments/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, answers: {} }),
    }).catch(() => {});
  }

  if (!ready) return null;

  if (report) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              {report.kind === "stream"
                ? "Your Stream Recommendation"
                : report.kind === "personality"
                  ? "Your Personality Type"
                  : report.kind === "intelligences"
                    ? "Your Intelligence Profile"
                    : "Your Ideal Career Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.kind === "stream" && (
              <p className="text-sm text-slate-600">
                Recommended stream:{" "}
                <span className="font-semibold text-primary">
                  {report.recommendedStream}
                </span>
              </p>
            )}
            {report.kind === "intelligences" && (
              <p className="text-sm text-slate-600">
                Emotional Intelligence score:{" "}
                <span className="font-semibold text-primary">
                  {report.emotionalIntelligence} / 42
                </span>
              </p>
            )}
            {report.kind === "intelligences"
              ? report.rows.map((row, i) => {
                  const pct = Math.round((row.score / row.max) * 100);
                  const band =
                    i < 3 ? "Strength" : i < 6 ? "Moderate" : "Developing";
                  return (
                    <div key={row.key}>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>
                          {row.label}{" "}
                          <span className="text-slate-400">({band})</span>
                        </span>
                        <span>
                          {row.score}/{row.max}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              : report.kind === "personality" && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Your personality type:{" "}
                  <span className="text-2xl font-bold tracking-widest text-primary">
                    {report.type}
                  </span>
                </p>
                {(personalityProfiles.profiles as Record<string, string>)[
                  report.type
                ] && (
                  <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {(personalityProfiles.profiles as Record<string, string>)[
                      report.type
                    ]
                      .split(/\n+/)
                      .map((para, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : ""}>
                          {para}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            )}
            {report.kind === "personality"
              ? report.rows.map((row) => {
                  const total = row.first.count + row.second.count || 1;
                  const pct = Math.round((row.first.count / total) * 100);
                  return (
                    <div key={row.key}>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>
                          {row.first.label} {row.first.count}
                        </span>
                        <span>
                          {row.second.label} {row.second.count}
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
                        <div
                          className="h-2 bg-slate-300"
                          style={{ width: `${100 - pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              : report.kind !== "intelligences" &&
                (report.kind === "stream" ? report.rows : report.domains).map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{row.label}</span>
                  <span>
                    {row.score}/{row.max}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.round((row.score / row.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {report.kind === "ideal" && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Top strengths</h3>
                <ul className="list-inside list-disc text-sm text-slate-600">
                  {report.strengths.map((s) => (
                    <li key={s.label}>
                      {s.label} — {s.pct}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="outline" onClick={retake}>
              Retake test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>
            Question {idx + 1} of {ordered.length}
          </span>
          <span>
            {answeredCount}/{ordered.length} answered
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((answeredCount / ordered.length) * 100)}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{meta?.label}</Badge>
          </div>
          {showIntro && meta?.intro && (
            <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-800">
              {meta.intro}
            </p>
          )}
          <CardTitle className="whitespace-pre-line text-lg leading-relaxed">
            {current.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {current.media_path && (
            <img
              src={current.media_path}
              alt={`Question figure`}
              className="max-h-72 rounded-lg border border-slate-200 bg-white object-contain p-2"
            />
          )}
          {orderedOptions(current).length === 7 &&
          kind === "intelligences" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
              {orderedOptions(current).map((o) => {
                const selected = answers[String(current.id)] === String(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => select(String(current.id), String(o.id))}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                    title={o.answer}
                  >
                    {o.marks}
                  </button>
                );
              })}
              <div className="flex w-full justify-between text-[11px] text-slate-400">
                <span>Not at All</span>
                <span>Completely</span>
              </div>
            </div>
          ) : (
            orderedOptions(current).map((o) => {
              const selected = answers[String(current.id)] === String(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => select(String(current.id), String(o.id))}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {o.media_path ? (
                    <img
                      src={o.media_path}
                      alt={`Option`}
                      className="mx-auto max-h-24 object-contain"
                    />
                  ) : (
                    o.answer
                  )}
                </button>
              );
            })
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
            >
              Back
            </Button>
            {idx < ordered.length - 1 ? (
              <Button onClick={() => setIdx((i) => i + 1)}>Next</Button>
            ) : (
              <Button disabled={!allAnswered || saving} onClick={finish}>
                {saving ? "Saving…" : "Finish & see report"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-slate-400">
        Answers are saved automatically to your account — close this page and resume
        on any device with the same link.
      </p>
    </div>
  );
}
