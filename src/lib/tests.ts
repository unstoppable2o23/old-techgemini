import streamBank from "@/data/stream-selector.json";
import idealBank from "@/data/ideal-career.json";

export type TestKind = "stream" | "ideal";

export type RawOption = {
  id: number;
  answer: string;
  marks: number;
  media_path?: string;
};

export type RawQuestion = {
  id: number;
  question: string;
  domain_id: number;
  subdomain_id: string;
  questionformat?: number;
  mediatype?: number;
  media_path?: string;
  options: Record<string, RawOption>;
};

export const STREAM_QUESTIONS = streamBank as unknown as Record<string, RawQuestion>;
export const IDEAL_QUESTIONS = idealBank as unknown as Record<string, RawQuestion>;

export function questionsFor(kind: TestKind): Record<string, RawQuestion> {
  return kind === "stream" ? STREAM_QUESTIONS : IDEAL_QUESTIONS;
}

export type StudentRef = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

function slugify(name: string): string {
  return name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function tokenFor(student: string, kind: TestKind): string {
  return `${kind === "stream" ? "STREAM" : "IDEAL"}-${slugify(student)}`;
}

export function tokenForStudent(
  student: Pick<StudentRef, "id" | "firstName" | "lastName">,
  kind: TestKind
): string {
  const name = `${student.firstName} ${student.lastName}`;
  return `${kind === "stream" ? "STREAM" : "IDEAL"}-${slugify(name)}-${student.id
    .slice(-6)
    .toUpperCase()}`;
}

export function kindForToken(token: string): TestKind | null {
  const t = decodeURIComponent(token).toUpperCase();
  if (t.startsWith("STREAM")) return "stream";
  if (t.startsWith("IDEAL")) return "ideal";
  return null;
}

export function orderedOptions(q: RawQuestion): RawOption[] {
  return Object.values(q.options ?? {}).sort((a, b) => Number(a.id) - Number(b.id));
}

export type ScoreRow = { key: string; label: string; score: number; max: number };

export type StreamReport = {
  kind: "stream";
  rows: ScoreRow[];
  recommendedStream: string;
};

export type IdealReport = {
  kind: "ideal";
  domains: ScoreRow[];
  strengths: { label: string; pct: number }[];
};

export type ExamReport = StreamReport | IdealReport;

const STREAM_LABELS: Record<string, string> = {
  "1": "Humanities",
  "2": "Science",
  "3": "Commerce",
  "4": "Arts",
};

const IDEAL_DOMAINS: Record<number, string> = {
  166: "Self Identification",
  167: "Work Situations",
  168: "Incomplete Sequence",
  169: "Identical Codes",
  170: "Logical Scenarios",
  171: "Important Factor",
  172: "Situational Exploration",
};

const STREAM_DOMAINS: Record<number, { label: string; intro?: string }> = {
  173: {
    label: "Like / Dislike",
    intro:
      "Your goal to discover your ideal stream has begun. These questions are based on your own liking or disliking — choose the option which most appeals to you.",
  },
  174: {
    label: "Work Situations",
    intro:
      "Imagine yourself in a work-life situation where you need to do the task mentioned in the question for earning your daily bread and butter.",
  },
  175: {
    label: "Understanding Situations",
    intro:
      "This exercise is like solving a visual puzzle. You need to fill out two similar codes as mentioned in the question and choose the correct option.",
  },
  176: {
    label: "Important Information",
    intro:
      "Relax and treat this like playing a game. Read the question carefully — the answer is hidden in the information provided — then hit the correct option.",
  },
  177: {
    label: "Careful Reasoning",
    intro:
      "Read each statement carefully and select the option that you think is right — TRUE, FALSE, or Cannot tell.",
  },
  178: { label: "Words Game" },
  179: {
    label: "Incomplete Sequence",
    intro:
      "Observe the question's diagram carefully and find the shape that completes the sequence.",
  },
};

export const DOMAIN_META: Record<TestKind, Record<number, { label: string; intro?: string }>> = {
  stream: STREAM_DOMAINS,
  ideal: Object.fromEntries(
    Object.entries(IDEAL_DOMAINS).map(([id, label]) => [id, { label }])
  ),
};

export function buildReport(
  kind: TestKind,
  answers: Record<string, string>
): ExamReport {
  const bank = questionsFor(kind);

  if (kind === "stream") {
    const totals: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
    const maxes: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
    for (const q of Object.values(bank)) {
      const sd = String(q.subdomain_id);
      maxes[sd] = (maxes[sd] || 0) + Math.max(...orderedOptions(q).map((o) => o.marks));
      const chosen = answers[String(q.id)];
      if (!chosen) continue;
      const opt = Object.values(q.options).find((o) => String(o.id) === String(chosen));
      if (opt) totals[sd] = (totals[sd] || 0) + opt.marks;
    }
    const rows: ScoreRow[] = Object.keys(totals)
      .map((sd) => ({
        key: sd,
        label: STREAM_LABELS[sd] || `Factor ${sd}`,
        score: totals[sd],
        max: maxes[sd],
      }))
      .sort((a, b) => b.score - a.score);
    return { kind: "stream", rows, recommendedStream: rows[0]?.label || "Undecided" };
  }

  const domTotals: Record<number, number> = {};
  const domMaxes: Record<number, number> = {};
  const sdTotals: Record<string, number> = {};
  const sdMaxes: Record<string, number> = {};
  for (const q of Object.values(bank)) {
    const d = Number(q.domain_id);
    const sd = String(q.subdomain_id);
    domMaxes[d] = (domMaxes[d] || 0) + Math.max(...orderedOptions(q).map((o) => o.marks));
    sdMaxes[sd] = (sdMaxes[sd] || 0) + Math.max(...orderedOptions(q).map((o) => o.marks));
    const chosen = answers[String(q.id)];
    if (!chosen) continue;
    const opt = Object.values(q.options).find((o) => String(o.id) === String(chosen));
    if (!opt) continue;
    domTotals[d] = (domTotals[d] || 0) + opt.marks;
    sdTotals[sd] = (sdTotals[sd] || 0) + opt.marks;
  }
  const domains: ScoreRow[] = Object.keys(domMaxes)
    .map(Number)
    .sort((a, b) => a - b)
    .map((d) => ({
      key: String(d),
      label: IDEAL_DOMAINS[d] || `Section ${d}`,
      score: domTotals[d] || 0,
      max: domMaxes[d],
    }));
  const strengths = Object.keys(sdMaxes)
    .map((sd) => ({
      label: sd,
      pct: sdTotals[sd] ? Math.round(((sdTotals[sd] || 0) / sdMaxes[sd]) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)
    .map((s) => ({ label: `Trait ${s.label}`, pct: s.pct }));

  return { kind: "ideal", domains, strengths };
}
