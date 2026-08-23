import { NextResponse } from "next/server";
import { demoSessionCookie, demoSessionNameCookie } from "@/lib/demo-session";

export function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.set(demoSessionCookie, "", {
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set(demoSessionNameCookie, "", {
    expires: new Date(0),
    path: "/",
  });
  return response;
}
