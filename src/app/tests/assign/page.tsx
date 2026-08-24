import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AssignClient } from "./assign-client";

export default async function AssignTestsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  const user = session.user;
  if (user.role !== "COUNSELOR" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      tenantId: user.tenantId,
      isActive: true,
      ...(user.role === "COUNSELOR"
        ? { studentProfile: { counselor: { userId: user.id } } }
        : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return <AssignClient students={students} />;
}
