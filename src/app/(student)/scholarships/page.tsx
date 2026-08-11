import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ScholarshipsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");
  const user = session.user;
  if (user.role !== "STUDENT") redirect("/auth/login");

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: { featureAccess: true },
  });

  if (!studentProfile?.featureAccess?.scholarshipHub) redirect("/dashboard");

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Scholarships</h1>
      <Card>
        <CardHeader><CardTitle>Scholarship Hub</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Scholarship search coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
