"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Globe,
  ChevronDown,
  Sparkles,
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

const LANGUAGES = [
  "English", "Hindi", "Marathi", "Punjabi", "Spanish", "French", "German",
  "Bengali", "Tamil", "Telugu", "Macedonian", "Arabic", "Sinhala", "Manipuri",
];

const COUNTRIES = [
  "India", "United States", "Canada", "United Kingdom", "Australia", "Germany",
  "France", "United Arab Emirates", "Japan", "Singapore", "China", "Brazil",
  "South Africa", "Russia", "Italy", "Spain", "Netherlands", "Sweden",
  "Switzerland", "New Zealand", "Mexico", "Indonesia", "Saudi Arabia", "Turkey",
  "South Korea", "Thailand", "Malaysia", "Vietnam", "Philippines", "Egypt",
  "Nigeria", "Kenya", "Argentina", "Poland", "Ireland", "North Macedonia",
  "Sri Lanka", "Zimbabwe", "Qatar", "Uganda", "Panama",
];

const TRENDING_BADGES = [
  { label: "In Demand", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { label: "New Age", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { label: "High Pay", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

export default function CareerLibraryClient() {
  const router = useRouter();
  const [careers, setCareers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("English");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
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
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToCareer(slug: string) {
    setShowDropdown(false);
    setShowCountryDropdown(false);
    router.push(`/career-library/${slug}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions.length > 0) {
      goToCareer(suggestions[0].slug);
    } else if (careers.length > 0) {
      goToCareer(careers[0].slug);
    }
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
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(country.toLowerCase())
  );

  return (
    <div className="space-y-10 p-6 pt-20 max-w-7xl mx-auto">
      {/* HERO */}
      <div className="text-center animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
          Explore <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">{careers.length || ""} Career Options</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Explore careers with role insights, opportunities, growth scope, and steps to become one.
        </p>

        {/* SEARCH FORM */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white/85 backdrop-blur-md border border-white/50 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 relative z-10 w-full max-w-5xl mx-auto"
        >
          {/* Career Input */}
          <div className="relative group text-left w-full md:flex-1 h-16" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              name="careerName"
              autoComplete="off"
              value={query}
              placeholder="E.g., Data Scientist, Pilot, Chef..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setShowDropdown(true)}
              className="w-full pl-14 pr-4 h-full rounded-xl border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 text-lg font-medium"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-background border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[9999]">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
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
                        {s.salaryEntry && (
                          <p className="text-xs text-muted-foreground">
                            {s.salaryEntry} · Growth {s.jobGrowth || "—"}
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

          {/* Country Input */}
          <div className="w-full md:w-64 h-16 relative group text-left">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <Input
              type="text"
              name="country"
              value={country}
              placeholder="Select Country"
              autoComplete="off"
              onChange={(e) => { setCountry(e.target.value); setShowCountryDropdown(true); }}
              onFocus={() => setShowCountryDropdown(true)}
              className="w-full pl-11 pr-8 h-16 rounded-xl border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 text-lg font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground">
              <ChevronDown className="h-5 w-5" />
            </div>
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-background rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto z-50">
                {filteredCountries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCountry(c); setShowCountryDropdown(false); }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors hover:bg-accent/10 ${
                      c === country ? "bg-accent/10 font-medium" : ""
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Select */}
          <div className="w-full md:w-40 relative group text-left h-16">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
              <Globe className="h-5 w-5" />
            </div>
            <select
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full pl-11 pr-8 h-full rounded-xl border border-slate-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none bg-background font-medium appearance-none cursor-pointer text-lg"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-accent hover:bg-accent/90 text-white font-bold h-16 px-8 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg w-full md:w-auto text-lg"
          >
            <span>Explore</span>
            <Sparkles className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* TRENDING NOW */}
      <div>
        <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">Trending Now</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {careers.slice(0, 10).map((c, idx) => (
            <button
              key={c.id}
              onClick={() => goToCareer(c.slug)}
              className="text-left group border rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Briefcase className="h-4 w-4" />
                </span>
                <Badge className={TRENDING_BADGES[idx % 3].color}>{TRENDING_BADGES[idx % 3].label}</Badge>
              </div>
              <p className="text-sm font-semibold group-hover:text-accent transition-colors">{c.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ALL CAREERS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            All Careers
          </h3>
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
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-semibold leading-tight">{c.title}</h4>
                    {c.demandLevel && (
                      <Badge className={`shrink-0 ${DEMAND_STYLES[c.demandLevel] || "bg-muted text-muted-foreground"}`}>
                        {c.demandLevel}
                      </Badge>
                    )}
                  </div>
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
