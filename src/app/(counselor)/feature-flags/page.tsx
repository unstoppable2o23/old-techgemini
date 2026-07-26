import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FeatureFlagsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");
  if (session.user.role !== "COUNSELOR" && session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/login");
  }

  redirect("/students");
}
