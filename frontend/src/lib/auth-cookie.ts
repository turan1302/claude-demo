export const AUTH_COOKIE_NAME = "seo_geo_token";

const isProduction = process.env.NODE_ENV === "production";

interface CookieWriter {
  set(name: string, value: string, options?: Record<string, unknown>): void;
  delete(name: string): void;
}

export function setAuthCookie(cookies: CookieWriter, token: string) {
  cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie(cookies: CookieWriter) {
  cookies.delete(AUTH_COOKIE_NAME);
}
