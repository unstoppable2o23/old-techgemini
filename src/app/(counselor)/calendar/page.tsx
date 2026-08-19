"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, MessageSquare, Download, IndianRupee, Eye } from "lucide-react";

interface PaymentProof {
  id: string;
  fileUrl: string;
  fileName: string;
  verified: boolean;
  expiresAt: string;
}

interface Appointment {
  id: string;
  title: string;
  package: string | null;
  description: string | null;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  amount: number | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  student: { user: { firstName: string; lastName: string; email: string } };
  paymentProof: PaymentProof | null;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetLinks, setMeetLinks] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments() }, [fetchAppointments]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, meetLink: meetLinks[id] || null }),
    });
    setMeetLinks((prev) => ({ ...prev, [id]: "" }));
    await fetchAppointments();
    setUpdating(null);
  }

  async function verifyPayment(proofId: string, appointmentId: string) {
    setUpdating(appointmentId);
    await fetch(`/api/payment-proof/${proofId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    await fetchAppointments();
    setUpdating(null);
  }

  function viewProof(url: string) {
    const w = window.open();
    if (w) w.document.write(`<img src="${url}" style="max-width:100%;max-height:100vh" />`);
  }

  const groups: Record<string, Appointment[]> = { PENDING: [], CONFIRMED: [], COMPLETED: [], CANCELLED: [] };
  appointments.forEach((a) => { (groups[a.status] || groups.PENDING).push(a); });

  const statusColors: Record<string, string> = {
    PENDING: "border-l-amber-400",
    CONFIRMED: "border-l-green-400",
    COMPLETED: "border-l-blue-400",
    CANCELLED: "border-l-gray-300",
  };

  return (
    <div className="space-y-6 p-6 pt-20 max-w-5xl mx-auto">
      <PageHeader
        icon={Calendar}
        title="Calendar"
        description="Manage appointment requests from your students"
      />

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments yet.</CardContent></Card>
      ) : (
        ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => {
          const list = groups[status];
          if (list.length === 0) return null;
          return (
            <Card key={status} className="overflow-hidden">
              <CardHeader className={`border-l-4 ${statusColors[status]} pb-3`}>
                <CardTitle className="text-base flex items-center gap-2">
                  {status === "PENDING" && <Clock className="h-4 w-4 text-amber-500" />}
                  {status === "CONFIRMED" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {status === "COMPLETED" && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                  {status === "CANCELLED" && <XCircle className="h-4 w-4 text-gray-400" />}
                  {status.charAt(0) + status.slice(1).toLowerCase()} ({list.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {list.map((appt) => (
                  <div key={appt.id} className={`p-4 ${statusColors[appt.status]} border-l-4`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{appt.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {appt.student.user.firstName} {appt.student.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appt.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
                          {new Date(appt.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          {" — "}
                          {new Date(appt.endTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {appt.amount && (
                          <p className="text-xs font-medium text-accent mt-1 flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> Rs {appt.amount?.toLocaleString()}
                          </p>
                        )}
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

                        {appt.paymentProof && (
                          <div className="mt-2 pt-2 border-t flex items-center gap-3">
                            <button onClick={() => viewProof(appt.paymentProof!.fileUrl)}
                              className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                              <Eye className="h-3 w-3" /> View Payment Proof
                            </button>
                            <a href={appt.paymentProof.fileUrl} download={appt.paymentProof.fileName}
                              className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                              <Download className="h-3 w-3" /> Download
                            </a>
                            {!appt.paymentProof.verified && (
                              <span className="text-[10px] text-muted-foreground">
                                Auto-deletes {new Date(appt.paymentProof.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {appt.status === "PENDING" && (
                          <>
                            <div className="space-y-1">
                              <Input placeholder="Meet link" value={meetLinks[appt.id] || ""}
                                onChange={(e) => setMeetLinks((prev) => ({ ...prev, [appt.id]: e.target.value }))}
                                className="h-8 text-xs w-44" />
                            </div>
                            {appt.paymentProof && !appt.paymentProof.verified ? (
                              <Button size="sm" disabled={updating === appt.id}
                                onClick={() => verifyPayment(appt.paymentProof!.id, appt.id)}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verify & Confirm
                              </Button>
                            ) : (
                              <Button size="sm" variant="default" disabled={updating === appt.id}
                                onClick={() => updateStatus(appt.id, "CONFIRMED")}>
                                {updating === appt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                                Confirm
                              </Button>
                            )}
                            <Button size="sm" variant="outline" disabled={updating === appt.id}
                              onClick={() => updateStatus(appt.id, "CANCELLED")}>
                              Decline
                            </Button>
                          </>
                        )}
                        {appt.status === "CONFIRMED" && (
                          <Button size="sm" variant="outline" disabled={updating === appt.id}
                            onClick={() => updateStatus(appt.id, "COMPLETED")}>
                            {updating === appt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
