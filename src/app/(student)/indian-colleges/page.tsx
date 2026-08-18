"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, Download } from "lucide-react";

type Institution = {
  id: string;
  aisheCode: string;
  name: string;
  type: string;
  state: string;
  district: string;
  website?: string;
  yearOfEstablishment?: string;
  location?: string;
  institutionType?: string;
  management?: string;
  universityName?: string;
};

const TYPES = ["All", "University", "College", "Standalone", "R&D Institute"];
const PAGE_SIZES = [20, 50, 100];

export default function IndianCollegesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search.trim()) params.set("search", search.trim());
    if (stateFilter !== "All") params.set("state", stateFilter);
    if (typeFilter !== "All") params.set("type", typeFilter);
    const res = await fetch(`/api/institutions?${params}`);
    const data = await res.json();
    setInstitutions(data.institutions || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    if (data.states?.length) setStates(data.states);
    setLoading(false);
  }, [page, pageSize, search, stateFilter, typeFilter]);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  function resetPage() {
    setPage(1);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "csv" });
      if (search.trim()) params.set("search", search.trim());
      if (stateFilter !== "All") params.set("state", stateFilter);
      if (typeFilter !== "All") params.set("type", typeFilter);
      const res = await fetch(`/api/institutions?${params}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indian-institutions.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 pt-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Indian Colleges &amp; Universities</h1>
            <p className="text-muted-foreground">{total.toLocaleString()} institutions across India</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={exporting}>
          <Download className="h-4 w-4 mr-1" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, AISHE code or district..."
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
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
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
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Affiliation</th>
                <th className="px-4 py-3 font-medium">Est.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">No institutions found.</td>
                </tr>
              ) : institutions.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-accent/5">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{r.aisheCode}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.state}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.district || "—"}</td>
                  <td className="px-4 py-3">{r.universityName || r.institutionType || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.yearOfEstablishment || "—"}</td>
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
          <span className="ml-2">
            Showing {institutions.length ? (total === 0 ? 0 : (page - 1) * pageSize + 1) : 0}–
            {Math.min(page * pageSize, total)} of {total.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
