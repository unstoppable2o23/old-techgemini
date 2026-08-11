"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const TRENDING_BADGES = [
  { label: "In Demand", icon: "🔥", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { label: "New Age", icon: "✨", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { label: "High Pay", icon: "💰", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

// Original page order of all careers (badges cycle by index % 3)
const CAREER_ORDER = [
  "Data Science", "Software Engineering", "Product Management", "Digital Marketing",
  "User Experience Design UX", "Civil Services", "Investment Banking", "Medicine",
  "Law", "Architecture", "Aviation", "Culinary Arts", "Psychology", "Cyber Security",
  "Artificial Intelligence", "Blockchain Technology", "Cloud Computing",
  "Robotics Engineering", "Sustainability", "Drone Technology", "Ethical Hacking",
  "Full Stack Development", "DevOps", "Game Development", "Bioinformatics",
  "Content Creation", "Social Media Management", "Financial Analysis",
  "Interior Design", "Event Management", "Fashion Design", "Journalism",
  "Veterinary Science", "Nutrition and Dietetics", "Sports Management",
  "Supply Chain Management", "Human Resource Management", "Sales Management",
  "Actuarial Science", "Renewable Energy Engineering", "Internet of Things",
  "Mobile Application Development", "Software Testing and Quality Assurance",
  "Hardware and Networking", "Information Technology Business Analysis",
  "User Interface Design", "Graphic Design", "Product Design", "Industrial Design",
  "Visual Merchandising", "Animation", "Multimedia and Gaming", "Photography",
  "Sound Engineering", "Image Consulting", "Fine Arts", "Performing Arts",
  "Public Relations", "Advertising", "Corporate Communication", "Creative Writing",
  "Interpretation and Translation", "Business Management", "Entrepreneurship",
  "Strategy Consulting", "Project Management", "Operations Management",
  "Retail Management", "Growth Marketing", "Performance Marketing",
  "Brand Management", "Chartered Accountancy", "Cost and Management Accounting",
  "Company Secretaryship", "Financial Planning", "Risk Management", "Economics",
  "Biotechnology Research", "Clinical Research", "Biomedical Engineering",
  "Pharmacology", "Genetics", "Environmental Science", "Nanotechnology",
  "Dentistry", "Physiotherapy", "Sports Physiotherapy", "Optometry", "Audiology",
  "Medical Laboratory Sciences", "Radiology Technology", "Nursing",
  "Occupational Therapy", "Mechanical Engineering", "Civil Engineering",
  "Electrical Engineering", "Electronics Engineering", "Aerospace Engineering",
  "Chemical Engineering", "Industrial Quality Engineering", "Urban Planning",
  "Construction Management", "Landscape Design", "Climate Science",
  "Agricultural Engineering", "Agri Business Management", "Food Technology",
  "Dairy Technology", "Forestry", "Wildlife Biology", "Air Traffic Management",
  "Cabin Services", "Maritime Studies", "Logistics and Transportation Management",
  "Hotel Management", "Travel and Tourism Management", "Sports Coaching",
  "Professional Sports", "Physical Training", "School Education",
  "Higher Education and Academia", "Corporate Training", "Education Administration",
  "Library Sciences", "Career Counselling", "Mentoring and Coaching",
  "Forensic Science", "Law Enforcement Studies", "Disaster Management",
  "Defence Services", "Economic Services", "Staff Selection Services",
  "Investment Advisory", "Sustainability Analytics", "Health Informatics",
  "Agriculture Research", "Pilot", "Airforce",
];

export default function CareerLibraryClient() {
  const router = useRouter();
  const [careers, setCareers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/careers?sortBy=name`);
    const data = await res.json();
    setCareers(data.careers || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  // Order careers exactly as the original page (by embedded order list)
  const orderedCareers = useCallback(() => {
    const map = new Map(careers.map((c) => [c.name, c]));
    return CAREER_ORDER.map((name) => map.get(name)).filter(Boolean);
  }, [careers]);

  const trendingCareers = orderedCareers();

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
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToCareer(slug: string) {
    setShowDropdown(false);
    router.push(`/career-library/${slug}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions.length > 0) {
      goToCareer(suggestions[0].slug);
    } else if (trendingCareers.length > 0) {
      goToCareer(trendingCareers[0].slug);
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
  return (
    <div className="space-y-10 p-6 pt-20 max-w-7xl mx-auto">
      {/* HERO */}
      <div className="text-center animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
          Explore <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">{trendingCareers.length || ""} Career Options</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Explore careers with role insights, opportunities, growth scope, and steps to become one.
        </p>

        {/* SEARCH FORM */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white/85 backdrop-blur-md border border-white/50 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 relative z-10 w-full max-w-2xl mx-auto"
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

      {/* EXPLORE NEW AGE CAREERS (same as original Trending Now) */}
      <div>
        <h3 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-center">
          Explore New Age Careers
        </h3>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading careers...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {trendingCareers.map((c, idx) => {
              const badge = TRENDING_BADGES[idx % TRENDING_BADGES.length];
              return (
                <button
                  key={c.id}
                  onClick={() => goToCareer(c.slug)}
                  className="text-left group border rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <Badge className={`${badge.color} mb-3`}>
                    {badge.label} {badge.icon}
                  </Badge>
                  <p className="text-sm font-semibold group-hover:text-accent transition-colors">
                    {c.title}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
