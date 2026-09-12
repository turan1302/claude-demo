import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: InstanceType<typeof Echo> | null = null;

/**
 * Tekil (singleton) Echo/Reverb bağlantısı. Private kanal doğrulaması
 * `/api/broadcasting-auth` üzerinden yapılır (bkz. o route handler'ın
 * açıklaması) — httpOnly auth cookie'si tarayıcıdan okunamadığı için
 * doğrulama isteği sunucu tarafında Bearer token'a çevrilir.
 */
export function getEcho() {
  if (typeof window === "undefined") {
    throw new Error("Echo yalnızca tarayıcıda kullanılabilir.");
  }

  if (!echoInstance) {
    window.Pusher = Pusher;

    echoInstance = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 80),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/broadcasting-auth",
    });
  }

  return echoInstance;
}
