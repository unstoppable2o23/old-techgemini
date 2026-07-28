"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, UserPlus, IndianRupee, MessageCircle } from "lucide-react";

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("91");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [counsellingPrice, setCounsellingPrice] = useState("2000");
  const [assessmentPrice, setAssessmentPrice] = useState("4000");
  const [indiaPrice, setIndiaPrice] = useState("14000");
  const [internationalPrice, setInternationalPrice] = useState("95000");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/counselors");
      if (res.ok) {
        const data = await res.json();
        setCounselors(data.counselors || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (!firstName || !lastName || !email || !password) {
      setResult({ error: "All fields are required" });
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/counselors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, title, phone, whatsappCountryCode, whatsappNumber, counsellingPrice, assessmentPrice, indiaPrice, internationalPrice }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult({ success: `Counselor ${firstName} ${lastName} created` });
      setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setTitle(""); setPhone("");
      setWhatsappCountryCode("91"); setWhatsappNumber("");
      setCounsellingPrice("2000"); setAssessmentPrice("4000"); setIndiaPrice("14000"); setInternationalPrice("95000");
      setShowForm(false);
      setCounselors((prev) => [...prev, data.user]);
    } else {
      setResult({ error: data.error || "Failed to create counselor" });
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6 p-6 pt-20 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Counselors</h1>
            <p className="text-muted-foreground">Create and manage counselor accounts</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : <><UserPlus className="h-4 w-4 mr-2" /> Add Counselor</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Counselor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title (optional)</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Counselor" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone (optional)</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><MessageCircle className="h-4 w-4" /> WhatsApp</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Country Code</label>
                    <Input value={whatsappCountryCode} onChange={(e) => setWhatsappCountryCode(e.target.value)} placeholder="91" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Phone Number</label>
                    <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="9876543210" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><IndianRupee className="h-4 w-4" /> Service Pricing (defaults)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Counselling</label>
                    <Input type="number" value={counsellingPrice} onChange={(e) => setCounsellingPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Counselling + Assessment</label>
                    <Input type="number" value={assessmentPrice} onChange={(e) => setAssessmentPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">India Admission</label>
                    <Input type="number" value={indiaPrice} onChange={(e) => setIndiaPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">International</label>
                    <Input type="number" value={internationalPrice} onChange={(e) => setInternationalPrice(e.target.value)} />
                  </div>
                </div>
              </div>
              {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
              {result?.success && <p className="text-sm text-green-600">{result.success}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Counselor
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Counselors</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : counselors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No counselors yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-right">Counselling</TableHead>
                  <TableHead className="text-right">+ Assessment</TableHead>
                  <TableHead className="text-right">India</TableHead>
                  <TableHead className="text-right">International</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counselors.map((c: any) => {
                  const wa = c.counselorProfile;
                  const waLink = wa?.whatsappCountryCode && wa?.whatsappNumber
                    ? `https://wa.me/${wa.whatsappCountryCode}${wa.whatsappNumber}`
                    : null;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.counselorProfile?.title || "—"}</TableCell>
                      <TableCell>
                        {waLink ? (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline">
                            <MessageCircle className="h-3 w-3" /> {wa.whatsappCountryCode} {wa.whatsappNumber}
                          </a>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right">Rs {c.counselorProfile?.counsellingPrice?.toLocaleString() || "2,000"}</TableCell>
                      <TableCell className="text-right">Rs {c.counselorProfile?.assessmentPrice?.toLocaleString() || "4,000"}</TableCell>
                      <TableCell className="text-right">Rs {c.counselorProfile?.indiaPrice?.toLocaleString() || "14,000"}</TableCell>
                      <TableCell className="text-right">Rs {c.counselorProfile?.internationalPrice?.toLocaleString() || "95,000"}</TableCell>
                      <TableCell>
                        <Badge variant={c.isActive ? "success" : "secondary"}>
                          {c.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
