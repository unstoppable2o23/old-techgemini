import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WebinarsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");
  if (session.user.role !== "COUNSELOR" && session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Webinars</h1>
      <Card>
        <CardHeader><CardTitle>Manage Webinars</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Webinar management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
