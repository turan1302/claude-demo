import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const LARAVEL_BASE_URL = process.env.LARAVEL_BASE_URL;

/**
 * Laravel Echo private kanal doğrulaması için köprü. Echo tarayıcıda
 * çalıştığından httpOnly auth cookie'sine erişemez; bu route handler
 * cookie'yi burada (sunucu tarafında) okuyup Laravel'in
 * `/broadcasting/auth` uç noktasına Bearer token ile iletir.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.text();

  const laravelResponse = await fetch(`${LARAVEL_BASE_URL}/broadcasting/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const data = await laravelResponse.text();

  return new NextResponse(data, {
    status: laravelResponse.status,
    headers: { "Content-Type": laravelResponse.headers.get("Content-Type") ?? "application/json" },
  });
}
