"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, Target, TrendingUp, Sparkles, X, Plus } from "lucide-react";

interface University {
  id: string;
  name: string;
  country: string;
  qsRank: number | null;
  overallScore: number | null;
}

function deriveSelectivity(qsRank: number | null): number {
  if (!qsRank) return 0.50;
  return Math.max(0.03, Math.min(0.85, 0.8 * Math.exp(-qsRank / 200) + 0.05));
}

function calculateOdds(gpa: number, sat: number, ecs: number, selectivity: number): number {
  const gpaScore = Math.min(gpa / 4.0, 1) * 40;
  const satScore = Math.min(sat / 1600, 1) * 30;
  const ecScore = Math.min(ecs / 10, 1) * 15;
  const base = gpaScore + satScore + ecScore;
  const adjusted = base * (1 - selectivity * 1.5);
  return Math.max(0, Math.min(100, Math.round(adjusted)));
}

function getCategory(odds: number): { label: string; color: string } {
  if (odds >= 80) return { label: "Strong Match", color: "text-green-600" };
  if (odds >= 50) return { label: "Moderate Chance", color: "text-amber-600" };
  if (odds >= 25) return { label: "Reach", color: "text-orange-600" };
  return { label: "High Reach", color: "text-red-600" };
}

export default function OddsCalculatorPage() {
  const [gpa, setGpa] = useState("3.5");
  const [sat, setSat] = useState("1200");
  const [ecs, setEcs] = useState("5");
  const [results, setResults] = useState<{ name: string; odds: number; category: { label: string; color: string }; qsRank: number | null }[] | null>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [selected, setSelected] = useState<University[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/universities?search=${encodeURIComponent(search)}&limit=20&sortBy=qsRank&sortOrder=asc`);
      const data = await res.json();
      setSearchResults((data.universities || []).filter((u: University) => !selected.find((s) => s.id === u.id)));
      setSearching(false);
    }, 300);
  }, [search, selected]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addUniversity(u: University) {
    setSelected((prev) => [...prev, u]);
    setSearch("");
    setSearchResults([]);
    setShowDropdown(false);
  }

  function removeUniversity(id: string) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  function calculate() {
    const g = parseFloat(gpa) || 0;
    const s = parseInt(sat) || 0;
    const e = parseInt(ecs) || 0;
    const calculated = selected.map((u) => ({
      name: u.name,
      qsRank: u.qsRank,
      odds: calculateOdds(g, s, e, deriveSelectivity(u.qsRank)),
      category: getCategory(calculateOdds(g, s, e, deriveSelectivity(u.qsRank))),
    })).sort((a, b) => b.odds - a.odds);
    setResults(calculated);
  }

  return (
    <div className="space-y-6 p-6 pt-20 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Target className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Odds Calculator</h1>
          <p className="text-muted-foreground">Estimate your admission chances at any university worldwide</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GPA (0-4.0)</label>
              <Input type="number" min="0" max="4" step="0.1" value={gpa} onChange={(e) => setGpa(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SAT Score (400-1600)</label>
              <Input type="number" min="400" max="1600" step="10" value={sat} onChange={(e) => setSat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Extracurriculars (0-10)</label>
              <Input type="number" min="0" max="10" value={ecs} onChange={(e) => setEcs(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Select Universities</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search universities to add..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="pl-9"
              />
            </div>
            {showDropdown && search && (
              <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searching ? (
                  <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No universities found.</div>
                ) : searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addUniversity(u)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between"
                  >
                    <div>
                      <span className="font-medium">{u.name}</span>
                      <span className="text-muted-foreground ml-2">{u.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.qsRank && <span className="text-xs text-muted-foreground">#{u.qsRank}</span>}
                      <Plus className="h-4 w-4 text-accent" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span key={u.id} className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-sm px-3 py-1.5 rounded-full">
                  {u.name}
                  {u.qsRank && <span className="text-xs opacity-70">#{u.qsRank}</span>}
                  <button onClick={() => removeUniversity(u.id)} className="hover:bg-accent/20 rounded-full p-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button onClick={calculate} disabled={selected.length === 0} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Calculate My Odds ({selected.length} universities)
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Admission Odds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.name} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="truncate">
                      <span className="text-sm font-medium">{r.name}</span>
                      {r.qsRank && <span className="text-xs text-muted-foreground ml-1.5">#{r.qsRank}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          r.odds >= 80 ? "bg-green-500" : r.odds >= 50 ? "bg-amber-500" : r.odds >= 25 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${r.odds}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${r.category.color}`}>
                      {r.odds}%
                    </span>
                    <span className={`text-xs w-24 text-right ${r.category.color}`}>
                      {r.category.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
