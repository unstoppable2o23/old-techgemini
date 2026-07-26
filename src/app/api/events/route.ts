import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const tenantId =
    request.headers.get("x-tenant-id") ||
    request.nextUrl.searchParams.get("tenantId") ||
    "";
  const userId = request.nextUrl.searchParams.get("userId") || "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sub = redis.duplicate();
      await sub.connect();

      const presenceChannel = `channel:presence:${tenantId}`;
      const notifyChannel = `channel:notify:${userId}`;

      const unsub1 = sub.subscribe(presenceChannel, (message) => {
        const data = `data: ${JSON.stringify({ type: "presence", payload: JSON.parse(message) })}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      const unsub2 = sub.subscribe(notifyChannel, (message) => {
        const data = `data: ${JSON.stringify({ type: "notification", payload: JSON.parse(message) })}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":keepalive\n\n"));
      }, 30000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
