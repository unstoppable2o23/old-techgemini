"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  GraduationCap,
  IndianRupee,
  Target,
  TrendingUp,
  Users,
  ChevronDown,
  Sparkles,
  Cpu,
  Youtube,
  HeartHandshake,
} from "lucide-react";

const DEMAND_STYLES: Record<string, string> = {
  High: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-red-100 text-red-700",
};

type OptionItem = { title?: string; description?: string };
type Pathway = { name?: string; steps?: { title?: string; description?: string }[] };
type Video = { title?: string; channelName?: string; description?: string };

function Accordion({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: OptionItem[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/5 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium">
          {icon}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <p className="font-medium text-sm">{item.title}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CareerDetailClient({ career }: { career: any }) {
  const [showAllPathways, setShowAllPathways] = useState(false);

  const faqs: { question?: string; answer?: string }[] = career.faqs || [];
  const pathways: Pathway[] = career.pathways || [];
  const videos: Video[] = career.videoRecommendations || [];
  const visiblePathways = showAllPathways ? pathways : pathways.slice(0, 1);

  return (
    <div className="space-y-6 p-6 pt-20 max-w-4xl mx-auto">
      <div>
        <Link href="/career-library">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Career Library
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">{career.title}</h1>
          {career.demandLevel && (
            <Badge className={`${DEMAND_STYLES[career.demandLevel] || "bg-muted"}`}>
              {career.demandLevel} Demand
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">{career.introduction}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <IndianRupee className="h-3.5 w-3.5" /> Entry Salary
          </p>
          <p className="font-semibold">{career.salaryEntry || "—"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <IndianRupee className="h-3.5 w-3.5" /> Senior Salary
          </p>
          <p className="font-semibold">{career.salarySenior || "—"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <TrendingUp className="h-3.5 w-3.5" /> Job Growth
          </p>
          <p className="font-semibold">{career.jobGrowth || "—"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Users className="h-3.5 w-3.5" /> Top Industries
          </p>
          <div className="flex flex-wrap gap-1">
            {(career.topIndustries || []).slice(0, 2).map((i: string) => (
              <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">{i}</span>
            ))}
            {(career.topIndustries || []).length > 2 && (
              <span className="text-xs text-muted-foreground">+{(career.topIndustries || []).length - 2}</span>
            )}
          </div>
        </div>
      </div>

      {career.futureOutlook && (
        <div className="border rounded-lg p-4 bg-accent/5">
          <p className="text-sm font-medium flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4" /> Market Outlook
          </p>
          <p className="text-sm text-muted-foreground">{career.futureOutlook}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <GraduationCap className="h-5 w-5" /> Eligibility &amp; Requirements
        </h2>
        <ul className="space-y-2">
          {career.eligibility.map((e: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <HeartHandshake className="h-5 w-5" /> Who Should Pursue This?
        </h2>
        <ul className="space-y-2">
          {career.whoShouldPursue.map((w: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Users className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5" /> Work Nature &amp; Reality
        </h2>
        <p className="text-sm text-muted-foreground mb-3">{career.workNatureDesc}</p>
        <ul className="space-y-2">
          {career.workNatureExamples.map((w: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Briefcase className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {pathways.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Target className="h-5 w-5" /> Career Pathways
          </h2>
          <div className="space-y-3">
            {visiblePathways.map((p: Pathway, i: number) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-accent/5 font-medium text-sm">{p.name}</div>
                <div className="px-4 py-3 space-y-3">
                  {p.steps?.map((s, j) => (
                    <div key={j}>
                      <p className="text-sm font-medium">{j + 1}. {s.title}</p>
                      {s.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {pathways.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setShowAllPathways(!showAllPathways)}
            >
              {showAllPathways ? "Show less" : `Show ${pathways.length - 1} more route${pathways.length - 1 > 1 ? "s" : ""}`}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Briefcase className="h-5 w-5" /> Career Options
        </h2>
        {career.conventionalOptions?.length > 0 && (
          <Accordion icon={<Briefcase className="h-4 w-4" />} title="Conventional Options" items={career.conventionalOptions} />
        )}
        {career.newAgeOptions?.length > 0 && (
          <Accordion icon={<Sparkles className="h-4 w-4" />} title="New-Age Options" items={career.newAgeOptions} />
        )}
        {career.aiRelatedOptions?.length > 0 && (
          <Accordion icon={<Cpu className="h-4 w-4" />} title="AI-Related Options" items={career.aiRelatedOptions} />
        )}
      </div>

      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Youtube className="h-5 w-5" /> Video Recommendations
          </h2>
          <div className="space-y-3">
            {videos.map((v: Video, i: number) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-medium text-sm">{v.title}</p>
                {v.channelName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{v.channelName}</p>
                )}
                {v.description && (
                  <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {faqs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">FAQs</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="border rounded-lg p-4">
                <p className="font-medium text-sm">{f.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
