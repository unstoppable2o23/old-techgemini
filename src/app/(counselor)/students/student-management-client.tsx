"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Search, CheckCircle2, XCircle, MoreHorizontal, Plus, Loader2 } from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  collegeSearch: "College Search",
  collegeFinder: "College Finder",
  aiOddsCalculator: "AI Odds Calculator",
  mockTests: "Mock Tests",
  scholarshipHub: "Scholarship Hub",
  appointments: "Appointments",
  webinars: "Webinars",
  analytics: "Analytics",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "secondary"; dot: string }
> = {
  ONLINE: { label: "Online", variant: "success", dot: "bg-green-500" },
  IN_TEST: { label: "In Test", variant: "warning", dot: "bg-orange-500" },
  OFFLINE: { label: "Offline", variant: "secondary", dot: "bg-gray-400" },
};

function formatLastSeen(date: string | Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function StudentManagementClient({
  students: initialStudents,
}: {
  students: any[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const filteredStudents = students.filter((s) => {
    const nameMatch =
      `${s.firstName} ${s.lastName} ${s.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const statusMatch =
      statusFilter === "all" ||
      s.studentProfile?.status === statusFilter;
    return nameMatch && statusMatch;
  });

  async function toggleFeature(
    studentId: string,
    featureKey: string,
    value: boolean
  ) {
    try {
      const res = await fetch(
        `/api/counselor/students/${studentId}/features`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [featureKey]: value }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentId && s.studentProfile?.featureAccess) {
            return {
              ...s,
              studentProfile: {
                ...s.studentProfile,
                featureAccess: {
                  ...s.studentProfile.featureAccess,
                  [featureKey]: value,
                },
              },
            };
          }
          return s;
        })
      );
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle feature:", err);
    }
  }

  async function toggleAccountStatus(studentId: string, isActive: boolean) {
    try {
      const res = await fetch(
        `/api/counselor/students/${studentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, isActive } : s
        )
      );
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle account status:", err);
    }
  }

  async function addStudent() {
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/counselor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create student");
        return;
      }
      setStudents((prev) => [data.student, ...prev]);
      setAddOpen(false);
      setAddForm({ firstName: "", lastName: "", email: "", password: "" });
      router.refresh();
    } catch {
      setAddError("Failed to create student");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6 p-6 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Manage students, control feature access, and monitor activity.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Student
        </Button>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {addError && (
                <p className="text-sm text-destructive">{addError}</p>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={addForm.firstName}
                  onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={addForm.lastName}
                  onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addStudent} disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Create Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ONLINE">Online</SelectItem>
            <SelectItem value="IN_TEST">In Test</SelectItem>
            <SelectItem value="OFFLINE">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="min-w-[400px]">
                  Feature Access
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student: any) => {
                  const status =
                    student.studentProfile?.status || "OFFLINE";
                  const sConfig =
                    STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;
                  const features =
                    student.studentProfile?.featureAccess || {};

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            fallback={
                              student.firstName[0] + student.lastName[0]
                            }
                          />
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={sConfig.variant}
                          className="gap-1.5"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sConfig.dot}`}
                          />
                          {sConfig.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {student.lastSeen
                            ? formatLastSeen(student.lastSeen)
                            : "Never"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={student.isActive}
                          onCheckedChange={(checked) =>
                            toggleAccountStatus(student.id, checked)
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(FEATURE_LABELS).map(
                            ([key, label]) => (
                              <div
                                key={key}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${
                                  features[key]
                                    ? "bg-accent/10 text-accent border border-accent/20"
                                    : "bg-muted text-muted-foreground border border-transparent"
                                }`}
                                onClick={() =>
                                  toggleFeature(
                                    student.id,
                                    key,
                                    !features[key]
                                  )
                                }
                              >
                                {features[key] ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {label}
                              </div>
                            )
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
