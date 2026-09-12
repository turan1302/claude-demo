/**
 * Laravel backend adresleri — yalnızca sunucu tarafında (Route Handler'lar)
 * kullanılır. Değerler Hostinger'da hPanel → (frontend sitesi) → Ortam
 * değişkenleri'nden, yerelde frontend/.env.local'dan gelir. Kod deploy'ları
 * bu değerlere dokunmaz; yalnızca hPanel'deki "Depoyu değiştir" sihirbazı
 * sıfırlar (bkz. deploy/HOSTINGER.md).
 *
 * Değerler çağrı anında okunur ve doğrulanır: eksik/hatalı bir değer
 * `undefined/login` gibi anlaşılmaz hatalar yerine ne yapılması gerektiğini
 * söyleyen bir ConfigError üretir. Durumu /api/health gösterir.
 */

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export const UNEXPECTED_RESPONSE = "Backend beklenmeyen bir yanıt döndürdü.";

const WHERE = "Hostinger'da hPanel → Ortam değişkenleri, yerelde frontend/.env.local";

function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/+$/, "");
  return trimmed || undefined;
}

function assertHttp(name: string, url: string) {
  if (!/^https?:\/\//.test(url)) {
    throw new ConfigError(`${name} "http://" ya da "https://" ile başlamalı (${WHERE}).`);
  }
}

/** Örn. https://api.ornek.com/api — sondaki "/" otomatik temizlenir. */
export function laravelApiUrl(): string {
  const url = normalize(process.env.LARAVEL_API_URL);
  if (!url) {
    throw new ConfigError(`LARAVEL_API_URL tanımlı değil (${WHERE}). Örnek: https://api.ornek.com/api`);
  }
  assertHttp("LARAVEL_API_URL", url);
  if (!url.endsWith("/api")) {
    throw new ConfigError(`LARAVEL_API_URL "/api" ile bitmeli, örn. https://api.ornek.com/api (${WHERE}).`);
  }
  return url;
}

/**
 * Örn. https://api.ornek.com — tanımlı değilse LARAVEL_API_URL'in sonundaki
 * "/api" çıkarılarak türetilir; yani zorunlu olan tek değişken LARAVEL_API_URL.
 */
export function laravelBaseUrl(): string {
  const url = normalize(process.env.LARAVEL_BASE_URL);
  if (!url) {
    return laravelApiUrl().slice(0, -"/api".length);
  }
  assertHttp("LARAVEL_BASE_URL", url);
  return url;
}

/**
 * Laravel'e istek atar. Yapılandırma ya da ağ hatasında fırlatmak yerine,
 * çağıranın Laravel yanıtı gibi istemciye aynen iletebileceği JSON hata
 * yanıtı döndürür. Ayrıntılar sunucu log'una yazılır; istemciye yalnızca
 * nereye bakılacağı söylenir.
 */
export async function laravelFetch(path: string, init: RequestInit, baseUrl: () => string = laravelApiUrl): Promise<Response> {
  let url: string;
  try {
    url = `${baseUrl()}${path}`;
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
    console.error(`[config] ${error.message}`);
    return Response.json(
      { message: "Sunucu yapılandırması eksik ya da hatalı. Ayrıntı için /api/health adresine bakın." },
      { status: 500 }
    );
  }

  try {
    return await fetch(url, init);
  } catch (error) {
    console.error(`[laravel] ${path} isteği başarısız:`, error);
    return Response.json({ message: "Backend'e ulaşılamadı. Lütfen biraz sonra tekrar deneyin." }, { status: 502 });
  }
}

/** Yanıtı JSON olarak okur; HTML hata sayfası gibi JSON olmayan bir yanıtta çökmez. */
export async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const data: unknown = await response.json();
    return data !== null && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return { message: UNEXPECTED_RESPONSE };
  }
}
