"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildReport,
  orderedOptions,
  questionsFor,
  type ExamReport,
  type TestKind,
} from "@/lib/tests";

type Props = { token: string; kind: TestKind };

export function ExamClient({ token, kind }: Props) {
  const bank = useMemo(() => questionsFor(kind), [kind]);
  const ids = useMemo(
    () =>
      Object.values(bank)
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map((q) => String(q.id)),
    [bank]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [report, setReport] = useState<ExamReport | null>(null);

  const progressKey = `exam_progress_${token}`;
  const resultKey = `exam_result_${token}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress && !cancelled) setAnswers(JSON.parse(savedProgress));
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
          if (data.report) setReport(data.report);
        }
      } catch {}
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resultKey, token, progressKey]);

  const answeredCount = ids.filter((id) => answers[id]).length;
  const allAnswered = answeredCount === ids.length;
  const q = bank[ids[idx]];

  function select(qid: string, optId: string) {
    const next = { ...answers, [qid]: optId };
    setAnswers(next);
    localStorage.setItem(progressKey, JSON.stringify(next));
  }

  function finish() {
    const result = buildReport(kind, answers);
    setReport(result);
    localStorage.setItem(resultKey, JSON.stringify(result));
    fetch("/api/tests/assignments/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, report: result }),
    }).catch(() => {});
  }

  function retake() {
    setAnswers({});
    setReport(null);
    setIdx(0);
    localStorage.removeItem(progressKey);
    localStorage.removeItem(resultKey);
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
            {(report.kind === "stream" ? report.rows : report.domains).map((row) => (
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

  if (!q) return null;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>
            Question {idx + 1} of {ids.length}
          </span>
          <span>
            {answeredCount}/{ids.length} answered
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((answeredCount / ids.length) * 100)}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.media_path && (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
              Figure {q.media_path} (diagram not available)
            </div>
          )}
          {orderedOptions(q).map((o) => {
            const selected = answers[String(q.id)] === String(o.id);
            return (
              <button
                key={o.id}
                onClick={() => select(String(q.id), String(o.id))}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {o.answer}
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
            >
              Back
            </Button>
            {idx < ids.length - 1 ? (
              <Button onClick={() => setIdx((i) => i + 1)}>Next</Button>
            ) : (
              <Button disabled={!allAnswered} onClick={finish}>
                Finish &amp; see report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-slate-400">
        Your answers are saved automatically. You can close this page and resume any
        time with the same link.
      </p>
    </div>
  );
}
