import { NextResponse } from "next/server";
import { demoSessionCookie, demoSessionNameCookie } from "@/lib/demo-session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    role?: unknown;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role;

  if (!name || !email || (role !== "contributor" && role !== "beneficiary")) {
    return NextResponse.json(
      { message: "Enter your details and choose how you want to participate." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ redirectTo: "/resident" });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  };
  response.cookies.set(
    demoSessionCookie,
    role === "contributor" ? "new_contributor" : "new_receiver",
    cookieOptions,
  );
  response.cookies.set(demoSessionNameCookie, name.slice(0, 80), cookieOptions);
  return response;
}
