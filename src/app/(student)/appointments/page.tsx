"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MessageSquare, CheckCircle2, XCircle, Loader2, ExternalLink, Plus } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  counselor: { firstName: string; lastName: string; email: string };
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counselor, setCounselor] = useState<{ user: { firstName: string; lastName: string; email: string }; title: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []);
    setCounselor(data.counselor);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData() }, [fetchData]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !date || !startTime || !endTime) {
      setError("Please fill in all required fields");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
      setError("End time must be after start time");
      return;
    }

    if (start <= new Date()) {
      setError("Please pick a future date and time");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, startTime: start.toISOString(), endTime: end.toISOString() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to book appointment");
      setSubmitting(false);
      return;
    }

    setSuccess("Appointment requested! Your counselor will confirm shortly.");
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setShowForm(false);
    setSubmitting(false);
    await fetchData();
  }

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      PENDING: { label: "Pending", variant: "outline" },
      CONFIRMED: { label: "Confirmed", variant: "default" },
      COMPLETED: { label: "Completed", variant: "secondary" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
    };
    const c = config[status] || config.PENDING;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6 pt-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">Book one-on-one sessions with your counselor</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Book Session"}
        </Button>
      </div>

      {counselor && (
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <User className="h-10 w-10 text-accent bg-accent/10 rounded-full p-2" />
            <div>
              <p className="font-medium">{counselor.user.firstName} {counselor.user.lastName}</p>
              <p className="text-sm text-muted-foreground">{counselor.title || "Counselor"}</p>
              <p className="text-xs text-muted-foreground">{counselor.user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Book a Session</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. College application review" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What would you like to discuss?" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time *</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time *</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Request Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Your Appointments</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No appointments yet. Click "Book Session" to schedule one.
            </div>
          ) : (
            <div className="divide-y">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{appt.title}</p>
                      {statusBadge(appt.status)}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(appt.startTime).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", year: "numeric",
                      })}
                      <Clock className="h-3 w-3 ml-2" />
                      {new Date(appt.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      {" — "}
                      {new Date(appt.endTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {appt.description && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {appt.description}
                      </p>
                    )}
                    {appt.meetLink && (
                      <a href={appt.meetLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-1 mt-1">
                        <ExternalLink className="h-3 w-3" /> Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
