import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");
  const user = session.user;

  return (
    <div className="p-6 pt-20">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Logged in as {user.email} ({user.role})
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
