import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  return NextResponse.json({ ok: true });
}
