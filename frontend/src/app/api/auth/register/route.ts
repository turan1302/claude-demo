import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth-cookie";
import { laravelFetch, readJson, UNEXPECTED_RESPONSE } from "@/lib/server-env";

export async function POST(request: Request) {
  const body = await request.json();

  const laravelResponse = await laravelFetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const data = await readJson(laravelResponse);

  if (!laravelResponse.ok) {
    return NextResponse.json(data, { status: laravelResponse.status });
  }

  if (typeof data.token !== "string") {
    return NextResponse.json({ message: UNEXPECTED_RESPONSE }, { status: 502 });
  }

  const cookieStore = await cookies();
  setAuthCookie(cookieStore, data.token);

  return NextResponse.json({ user: data.user }, { status: 201 });
}
