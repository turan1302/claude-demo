import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "@/lib/auth-cookie";
import { laravelFetch } from "@/lib/server-env";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    // Backend'e ulaşılamasa (ya da yapılandırma eksik olsa) bile laravelFetch
    // fırlatmaz; yerel auth cookie'si aşağıda her durumda silinir.
    await laravelFetch("/logout", {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
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
