import { NextResponse } from "next/server";
import { demoSessionCookie } from "@/lib/demo-session";

export function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(demoSessionCookie, "", {
    expires: new Date(0),
    path: "/",
  });
  return response;
}
