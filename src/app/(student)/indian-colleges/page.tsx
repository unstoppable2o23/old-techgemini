"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, Download } from "lucide-react";

type Institution = {
  code: string;
  name: string;
  type: "University" | "College" | "Standalone";
  state: string;
  city: string;
  affiliation: string;
  accreditation: string;
};

const INSTITUTIONS: Institution[] = [
  { code: "U-0015", name: "University of Delhi", type: "University", state: "Delhi", city: "New Delhi", affiliation: "UGC", accreditation: "A+" },
  { code: "U-0150", name: "Jawaharlal Nehru University", type: "University", state: "Delhi", city: "New Delhi", affiliation: "UGC", accreditation: "A++" },
  { code: "U-0071", name: "University of Mumbai", type: "University", state: "Maharashtra", city: "Mumbai", affiliation: "UGC", accreditation: "A" },
  { code: "U-0032", name: "Anna University", type: "University", state: "Tamil Nadu", city: "Chennai", affiliation: "UGC", accreditation: "A+" },
  { code: "U-0208", name: "University of Calcutta", type: "University", state: "West Bengal", city: "Kolkata", affiliation: "UGC", accreditation: "A" },
  { code: "U-0110", name: "Banaras Hindu University", type: "University", state: "Uttar Pradesh", city: "Varanasi", affiliation: "UGC", accreditation: "A++" },
  { code: "U-0044", name: "Osmania University", type: "University", state: "Telangana", city: "Hyderabad", affiliation: "UGC", accreditation: "A+" },
  { code: "U-0173", name: "University of Rajasthan", type: "University", state: "Rajasthan", city: "Jaipur", affiliation: "UGC", accreditation: "A" },
  { code: "C-10891", name: "St. Stephen's College", type: "College", state: "Delhi", city: "New Delhi", affiliation: "University of Delhi", accreditation: "A+" },
  { code: "C-11234", name: "Christ University", type: "College", state: "Karnataka", city: "Bengaluru", affiliation: "UGC", accreditation: "A+" },
  { code: "C-14213", name: "Loyola College", type: "College", state: "Tamil Nadu", city: "Chennai", affiliation: "University of Madras", accreditation: "A++" },
  { code: "C-17123", name: "St. Xavier's College, Mumbai", type: "College", state: "Maharashtra", city: "Mumbai", affiliation: "University of Mumbai", accreditation: "A+" },
  { code: "C-12987", name: "Presidency College, Kolkata", type: "College", state: "West Bengal", city: "Kolkata", affiliation: "University of Calcutta", accreditation: "A" },
  { code: "C-19002", name: "Fergusson College", type: "College", state: "Maharashtra", city: "Pune", affiliation: "Savitribai Phule Pune University", accreditation: "A+" },
  { code: "C-22134", name: "Hansraj College", type: "College", state: "Delhi", city: "New Delhi", affiliation: "University of Delhi", accreditation: "A+" },
  { code: "S-5100", name: "Indian Institute of Technology, Bombay", type: "Standalone", state: "Maharashtra", city: "Mumbai", affiliation: "MHRD", accreditation: "A++" },
  { code: "S-5340", name: "Indian Institute of Technology, Delhi", type: "Standalone", state: "Delhi", city: "New Delhi", affiliation: "MHRD", accreditation: "A++" },
  { code: "S-5201", name: "Indian Institute of Management, Ahmedabad", type: "Standalone", state: "Gujarat", city: "Ahmedabad", affiliation: "MHRD", accreditation: "A++" },
  { code: "S-5001", name: "All India Institute of Medical Sciences, Delhi", type: "Standalone", state: "Delhi", city: "New Delhi", affiliation: "MHRD", accreditation: "A++" },
  { code: "S-5990", name: "National Institute of Technology, Trichy", type: "Standalone", state: "Tamil Nadu", city: "Tiruchirappalli", affiliation: "MHRD", accreditation: "A+" },
];

const STATES = Array.from(new Set(INSTITUTIONS.map((i) => i.state))).sort();
const TYPES = ["All", "University", "College", "Standalone"] as const;
const PAGE_SIZES = [5, 10, 20];

function exportToExcel(rows: Institution[]) {
  const headers = ["AISHE Code", "Institution Name", "Type", "State", "City", "Affiliation", "Accreditation"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [r.code, `"${r.name.replace(/"/g, '""')}"`, r.type, r.state, r.city, `"${r.affiliation.replace(/"/g, '""')}"`, r.accreditation].join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "indian-colleges-universities.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function IndianCollegesPage() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPES)[number]>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INSTITUTIONS.filter((i) => {
      if (q && !i.name.toLowerCase().includes(q) && !i.code.toLowerCase().includes(q) && !i.city.toLowerCase().includes(q)) return false;
      if (stateFilter !== "All" && i.state !== stateFilter) return false;
      if (typeFilter !== "All" && i.type !== typeFilter) return false;
      return true;
    });
  }, [search, stateFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6 p-6 pt-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Indian Colleges &amp; Universities</h1>
            <p className="text-muted-foreground">Browse {filtered.length} institutions across India</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => exportToExcel(filtered)}>
          <Download className="h-4 w-4 mr-1" />
          Export Excel
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, AISHE code or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => { setStateFilter(e.target.value); resetPage(); }}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="All">All States</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as (typeof TYPES)[number]); resetPage(); }}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          {TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">AISHE Code</th>
                <th className="px-4 py-3 font-medium">Institution Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Affiliation</th>
                <th className="px-4 py-3 font-medium">Accreditation</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">No institutions found.</td>
                </tr>
              ) : rows.map((r) => (
                <tr key={r.code} className="border-b last:border-0 hover:bg-accent/5">
                  <td className="px-4 py-3 font-medium">{r.code}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.state}</td>
                  <td className="px-4 py-3">{r.city}</td>
                  <td className="px-4 py-3">{r.affiliation}</td>
                  <td className="px-4 py-3">{r.accreditation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="border rounded-md px-2 py-1 text-sm bg-background"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
