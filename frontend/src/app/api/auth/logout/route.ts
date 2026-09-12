import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "@/lib/auth-cookie";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL;

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${LARAVEL_API_URL}/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  clearAuthCookie(cookieStore);

  return NextResponse.json({}, { status: 204 });
}
