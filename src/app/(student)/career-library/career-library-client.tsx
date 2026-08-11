"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, Briefcase, TrendingUp, IndianRupee } from "lucide-react";

const DEMAND_STYLES: Record<string, string> = {
  High: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-red-100 text-red-700",
};

export default function CareerLibraryClient() {
  const [careers, setCareers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sortBy", sortBy);
    const res = await fetch(`/api/careers?${params}`);
    const data = await res.json();
    setCareers(data.careers || []);
    setLoading(false);
  }, [search, sortBy]);

  useEffect(() => {
    const t = setTimeout(fetchCareers, 250);
    return () => clearTimeout(t);
  }, [fetchCareers]);

  return (
    <div className="space-y-6 p-6 pt-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Career Library</h1>
          <p className="text-muted-foreground">
            Explore {careers.length > 0 ? `${careers.length} ` : ""}careers — pathways, salary, growth &amp; more
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search careers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
                  <Link href={`/career-library/${c.slug}`}>
                    <Button variant="outline" className="w-full">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View Career
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
