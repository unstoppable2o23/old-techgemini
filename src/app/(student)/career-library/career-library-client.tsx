"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  GraduationCap,
  Briefcase,
  TrendingUp,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

const DEMAND_STYLES: Record<string, string> = {
  High: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-red-100 text-red-700",
};

export default function CareerLibraryClient() {
  const router = useRouter();
  const [careers, setCareers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    params.set("sortBy", sortBy);
    const res = await fetch(`/api/careers?${params}`);
    const data = await res.json();
    setCareers(data.careers || []);
    setLoading(false);
  }, [query, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchCareers, 250);
    return () => clearTimeout(t);
  }, [fetchCareers]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/careers?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.careers || []);
      setShowDropdown(true);
      setActiveIndex(-1);
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToCareer(slug: string) {
    setShowDropdown(false);
    router.push(`/career-library/${slug}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        goToCareer(suggestions[activeIndex].slug);
      } else if (suggestions.length > 0) {
        e.preventDefault();
        goToCareer(suggestions[0].slug);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div className="space-y-8 p-6 pt-20 max-w-6xl mx-auto">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <GraduationCap className="h-10 w-10 text-accent" />
          <h1 className="text-3xl font-bold tracking-tight">Career Library</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore 138 careers across every field — discover pathways, salary insights,
          eligibility, future outlook and more. Search by career, field, or interest.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search any career, e.g. Data Science, Medicine, Pilot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setShowDropdown(true)}
            className="pl-12 py-7 text-lg rounded-xl shadow-sm"
          />
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-30 mt-2 w-full bg-background border rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToCareer(s.slug)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  activeIndex === i ? "bg-accent/10" : "hover:bg-accent/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    {s.jobGrowth && (
                      <p className="text-xs text-muted-foreground">
                        {s.salaryEntry || ""} · Growth {s.jobGrowth}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="name">Sort by Name</option>
          <option value="demand">Sort by Demand</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading careers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-muted-foreground">
                No careers found matching your search.
              </CardContent>
            </Card>
          ) : careers.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{c.title}</CardTitle>
                  {c.demandLevel && (
                    <Badge className={`shrink-0 ${DEMAND_STYLES[c.demandLevel] || "bg-muted text-muted-foreground"}`}>
                      {c.demandLevel}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-3">
                {c.topIndustries?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.topIndustries.slice(0, 3).map((i: string) => (
                      <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {i}
                      </span>
                    ))}
                    {c.topIndustries.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{c.topIndustries.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {c.salaryEntry && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {c.salaryEntry}
                      </span>
                    )}
                    {c.jobGrowth && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {c.jobGrowth}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => goToCareer(c.slug)}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    View Career
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
