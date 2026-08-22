import { NextResponse } from "next/server";
import { findDemoResident } from "@/lib/data/demo-residents";
import { demoSessionCookie } from "@/lib/demo-session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const account = findDemoResident(email, password);

  if (!account) {
    return NextResponse.json(
      { message: "Those demo credentials do not match an account." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    role: account.role,
    redirectTo: "/resident",
  });
  response.cookies.set(demoSessionCookie, account.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
