import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  FileText,
  Calendar,
  Activity,
  GraduationCap,
  Calculator,
  Trophy,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");
  const user = session.user;
  const isCounselor = user.role === "COUNSELOR" || user.role === "SUPER_ADMIN";

  if (isCounselor) {
    const studentCount = await prisma.user.count({
      where: {
        role: "STUDENT",
        tenantId: user.tenantId,
        ...(user.role === "COUNSELOR"
          ? { studentProfile: { counselor: { userId: user.id } } }
          : {}),
      },
    });

    const testCount = await prisma.testResult.count({
      where: { student: { userId: user.id } },
    });

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        counselorId: user.id,
        status: "CONFIRMED",
        startTime: { gte: new Date() },
      },
    });

    const stats = [
      { title: "Total Students", value: studentCount, icon: Users, color: "text-blue-600" },
      { title: "Tests Completed", value: testCount, icon: FileText, color: "text-green-600" },
      { title: "Upcoming Appointments", value: upcomingAppointments, icon: Calendar, color: "text-purple-600" },
      { title: "Active Students", value: studentCount, icon: Activity, color: "text-orange-600" },
    ];

    return (
      <div className="space-y-6 p-6 pt-20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Counselor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.firstName}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <a href="/students" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Manage Students</p>
                <p className="text-xs text-muted-foreground">View and configure student access</p>
              </div>
            </a>
            <a href="/feature-flags" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Feature Flags</p>
                <p className="text-xs text-muted-foreground">Toggle features per student</p>
              </div>
            </a>
            <a href="/calendar" className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Calendar</p>
                <p className="text-xs text-muted-foreground">Manage appointments</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Student view
  const featureAccess = await prisma.studentFeatureAccess.findUnique({
    where: { studentProfileId: user.id },
  });

  const recentResults = await prisma.testResult.findMany({
    where: { studentId: user.id },
    orderBy: { submittedAt: "desc" },
    take: 5,
    include: { test: true },
  });

  const featureCards = [
    { label: "College Finder", icon: GraduationCap, enabled: featureAccess?.collegeFinder, href: "/college-finder" },
    { label: "AI Odds Calculator", icon: Calculator, enabled: featureAccess?.aiOddsCalculator, href: "/odds-calculator" },
    { label: "Mock Tests", icon: FileText, enabled: featureAccess?.mockTests, href: "/mock-tests" },
    { label: "Scholarships", icon: Trophy, enabled: featureAccess?.scholarshipHub, href: "/scholarships" },
  ];

  return (
    <div className="space-y-6 p-6 pt-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.firstName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((f) => (
          <Card key={f.label} className={!f.enabled ? "opacity-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{f.label}</CardTitle>
              <f.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {f.enabled ? `Access your ${f.label.toLowerCase()}` : "Contact your counselor to enable"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentResults.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Test Results</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{result.test.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(result.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{result.score}/{result.totalMarks}</p>
                    <p className="text-xs text-muted-foreground">{result.percentage.toFixed(1)}%</p>
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
