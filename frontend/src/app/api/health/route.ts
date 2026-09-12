import { NextResponse } from "next/server";
import { ConfigError, laravelApiUrl, laravelBaseUrl } from "@/lib/server-env";

function configStatus(read: () => string): { ok: boolean; status: string } {
  try {
    read();
    return { ok: true, status: "tanımlı" };
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    return { ok: false, status: error.message };
  }
}

/**
 * Deploy sonrası yapılandırma kontrolü (oturum gerektirmez): ortam
 * değişkenlerinin tanımlı ve biçimce doğru olduğunu, backend'e
 * ulaşılabildiğini söyler. Değerlerin kendisini asla döndürmez.
 */
export async function GET() {
  const api = configStatus(laravelApiUrl);
  const base = process.env.LARAVEL_BASE_URL?.trim()
    ? configStatus(laravelBaseUrl)
    : { ok: true, status: "tanımsız — LARAVEL_API_URL'den türetiliyor" };

  let backendOk = false;
  let backend = "kontrol edilmedi (önce LARAVEL_API_URL'i düzeltin)";

  if (api.ok) {
    try {
      // Oturumsuz /user isteğine Laravel 401 döner: backend ayakta ve adres doğru.
      const response = await fetch(`${laravelApiUrl()}/user`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      backendOk = response.status === 401 || response.ok;
      backend = backendOk
        ? "erişilebilir"
        : `beklenmeyen yanıt: HTTP ${response.status} (LARAVEL_API_URL doğru adresi mi gösteriyor?)`;
    } catch {
      backend = "ulaşılamadı (adres yanlış olabilir ya da backend kapalı)";
    }
  }

  const ok = api.ok && base.ok && backendOk;

  return NextResponse.json(
    {
      ok,
      config: { LARAVEL_API_URL: api.status, LARAVEL_BASE_URL: base.status },
      backend,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
