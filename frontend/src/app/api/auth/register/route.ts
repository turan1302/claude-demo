import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth-cookie";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL;

export async function POST(request: Request) {
  const body = await request.json();

  const laravelResponse = await fetch(`${LARAVEL_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const data = await laravelResponse.json();

  if (!laravelResponse.ok) {
    return NextResponse.json(data, { status: laravelResponse.status });
  }

  const cookieStore = await cookies();
  setAuthCookie(cookieStore, data.token);

  return NextResponse.json({ user: data.user }, { status: 201 });
}
