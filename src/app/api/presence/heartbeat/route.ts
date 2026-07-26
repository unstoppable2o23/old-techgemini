import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setStudentPresence } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = request.headers.get("x-tenant-id");
  if (!tenantId) {
    return NextResponse.json(
      { error: "Tenant not resolved" },
      { status: 400 }
    );
  }

  const { status, testTitle } = await request.json();

  await setStudentPresence(tenantId, session.user.id, status, testTitle);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeen: new Date() },
  });

  return NextResponse.json({ ok: true });
}
