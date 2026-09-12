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

  // 204 (No Content) yanıtları spesifikasyon gereği body içeremez;
  // NextResponse.json(..., {status:204}) production'da (Node'un native
  // fetch/Response'unda) "Invalid response status code 204" ile çöküyordu
  // — bu çökme clearAuthCookie'nin Set-Cookie header'ının yanıta hiç
  // yazılmamasına, yani tarayıcıdaki auth cookie'sinin asla silinmemesine
  // yol açıyordu.
  return new NextResponse(null, { status: 204 });
}
