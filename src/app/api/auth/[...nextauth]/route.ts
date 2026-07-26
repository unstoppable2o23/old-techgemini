import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

const GET = (req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) => handler(req, context);
const POST = (req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) => handler(req, context);

export { GET, POST };
