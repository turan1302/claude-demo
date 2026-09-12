# Hostinger'a Kurulum Rehberi

Bu rehber, projenin Hostinger **Business Web Hosting** (paylaşımlı hosting,
hPanel + SSH erişimi) planında gerçekten nasıl canlıya alındığını anlatır —
aşağıdakilerin hepsi bu proje üzerinde bizzat denenip doğrulandı.

## Mimari Kararlar (neden böyle?)

Paylaşımlı hosting — SSH olsa bile — birkaç temel şeyi desteklemiyor. Bu
projenin özgün mimarisi üç yerde buna dayanıyordu, üçü de bu ortama göre
uyarlandı:

1. **Sürekli açık bir TCP portu yok** → Realtime (Reverb websocket) yerine
   polling. `NEXT_PUBLIC_REVERB_HOST` ortam değişkeni **tanımlanmazsa**,
   frontend otomatik olarak WebSocket yerine kısa aralıklı polling'e düşer
   (bkz. `frontend/src/lib/echo.ts`'teki `isRealtimeConfigured()`). Prod
   `.env`'de bu değişkenleri hiç eklemeyin.

2. **`proc_open` kapalı** → Laravel'in **Scheduler**'ı (`schedule:run`)
   ASLA çalışamaz. Sebep: Laravel'in `$schedule->command(...)` ile
   tanımlanan HER görevi, arka planda çalışsın çalışmasın, Symfony
   `Process` (yani `proc_open`) üzerinden ayrı bir alt-süreç olarak
   spawnlıyor — bu paylaşımlı hostinglerin çoğunda güvenlik gereği kapalı.
   **Çözüm**: `schedule:run`'a hiç güvenmeyin; her artisan komutu için
   **ayrı ayrı direkt cron job** kurun (cron zaten OS seviyesinde process
   açtığı için `proc_open`'a ihtiyaç duymaz). Doğrudan
   `php artisan queue:work`/`php artisan app:...` gibi komutları invoke
   etmek sorunsuz çalışıyor — sadece Laravel'in KENDİ scheduler'ının
   sarmalayıcısı (`schedule:run`) sorunlu.

3. **`symlink()` kapalı** → `php artisan storage:link` çalışmaz. Bu
   projede herkese açık dosya servisi (upload/avatar vb.) olmadığı için
   sorun değil, bu adımı tamamen atlayın.

## 0) Gereken bilgiler

hPanel'de site oluşturduktan sonra **Gelişmiş → SSH Erişimi** sayfasında:
SSH host/IP, port, kullanıcı adı. CLI'da PHP genelde varsayılan olarak
daha yeni bir sürüme (bu ortamda 8.4) alias'lanmış olabilir; web sitesi
için seçtiğiniz PHP sürümünün (8.3) CLI karşılığı genelde
`/opt/alt/php83/usr/bin/php` yolunda bulunur —
`ls -d /opt/alt/php8*` ile kontrol edin.

## 1) hPanel'de site oluşturma

**Web Siteleri → (planınız) → Site ekle → Özel PHP/HTML web sitesi**,
subdomain olarak örn. `api.siteniz.com` girin.

## 2) Native Git ile deploy (webhook dahil)

Hostinger'ın hPanel'inde **Gelişmiş → GIT** bölümü, ayrı bir GitHub
Actions/SSH script kurmadan doğrudan push-tetiklemeli deploy sağlıyor —
bu proje için kullanılan (ve çalışan) yöntem bu:

1. **Repo public olmalı.** Private repo için Hostinger'ın ürettiği SSH
   deploy key'i GitHub'a eklemeniz gerekir, ama bu hesaptaki TEK anahtar
   aynı anda yalnızca BİR repo'ya deploy key olarak eklenebilir (GitHub
   "key already in use" hatası verir) — bu hesapta zaten başka
   projelerde kullanıldığı için repoyu **public** yapmak çok daha az
   sürtünmeli.
2. **Gelişmiş → GIT → Yeni Bir Depo Oluşturun**:
   - **Depo**: `https://github.com/<kullanici>/<repo>.git`
   - **Branch**: `main`
   - **Dizin**: `app` (repo `public_html`'e değil, `public_html/app/`'e
     klonlanır — kök karışmasın diye)
3. **Oluştur**'a basınca ilk deploy (boş) yapılır. Depo satırındaki
   **⋮ → Otomatik Dağıtım** ile bir **Webhook URL** üretilir
   (`https://webhooks.hostinger.com/deploy/...`).
4. O URL'i GitHub'da **repo → Settings → Webhooks → Add webhook**'a,
   Content type `application/json` olarak ekleyin. Artık `main`'e her
   push'ta Hostinger otomatik `git pull` yapıyor.
5. **Not**: Bu native araç yalnızca dosyaları çeker — `composer
   install`/`npm run build`/`migrate` gibi adımları KENDİ BAŞINA
   çalıştırmaz (repo kökünde bir `composer.json` bulursa "farkına
   varıyor" ama monorepo yapısında — `backend/composer.json` gibi bir
   alt klasörde olduğu için — bunu atlıyor). Bu adımları kod
   değiştikten sonra SSH ile elle (ya da bir sonraki deploy'da
   otomatikleştirilecek bir script ile) çalıştırmanız gerekiyor:

   ```bash
   cd ~/domains/api.siteniz.com/public_html/app/backend
   /opt/alt/php83/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
   /opt/alt/php83/usr/bin/php artisan package:discover --ansi   # composer'ın --no-scripts ile atladığı adım
   /opt/alt/php83/usr/bin/php artisan migrate --force
   /opt/alt/php83/usr/bin/php artisan config:cache
   /opt/alt/php83/usr/bin/php artisan route:cache
   ```

   (`composer install`'ı script'siz (`--no-scripts`) çalıştırmak şart —
   aksi halde composer'ın `@php artisan package:discover` post-install
   hook'u yine `proc_open` gerektirdiği için patlar; adımı elle,
   composer'ın DIŞINDA çalıştırmak proc_open'a ihtiyaç duymuyor.)

## 3) Laravel'in `public/` klasörünü web köküne bağlama

Native Git aracı tüm repoyu (`backend/`, `frontend/` dahil)
`public_html/app/`'e indiriyor, ama gerçek web kökü hâlâ `public_html/`.
Laravel'in `index.php`'i normalde `backend/public/`'te oturur; bu
domain'in gerçek document root'unu değiştiremediğimiz için (bu site
türünde böyle bir ayar yok), klasik paylaşımlı-hosting çözümünü
uyguladık: Laravel'in `public/` dosyalarının bir KOPYASINI, yolları
düzeltilmiş şekilde `public_html`'in kendisine koyduk — bu dosyalar
`public_html/app/` DIŞINDA olduğu için gelecekteki `git pull`'lardan
etkilenmiyor, tek seferlik bir kurulum:

```bash
cd ~/domains/api.siteniz.com/public_html
cp app/backend/public/.htaccess .
cp app/backend/public/favicon.ico .
cp app/backend/public/robots.txt .
```

Ve `public_html/index.php`'i şu şekilde oluşturun (orijinal
`backend/public/index.php`'in `../vendor`, `../bootstrap` yollarını
`app/backend/vendor`, `app/backend/bootstrap` olarak günceller):

```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define("LARAVEL_START", microtime(true));

if (file_exists($maintenance = __DIR__."/app/backend/storage/framework/maintenance.php")) {
    require $maintenance;
}

require __DIR__."/app/backend/vendor/autoload.php";

$app = require_once __DIR__."/app/backend/bootstrap/app.php";

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

## 4) `.env` ve veritabanı

```bash
cd ~/domains/api.siteniz.com/public_html/app/backend
cp .env.example .env
php artisan key:generate --force   # doğru PHP sürümüyle (bkz. 0. adım)
chmod -R 775 storage bootstrap/cache
```

**Gelişmiş → Veritabanları**'ndan bir MySQL DB + kullanıcı oluşturup
`.env`'e şunları yazın (host genelde `127.0.0.1`):

```
DB_DATABASE=<hpanel'in verdigi isim>
DB_USERNAME=<hpanel'in verdigi isim>
DB_PASSWORD=<belirlediginiz sifre>
BROADCAST_DRIVER=null
QUEUE_CONNECTION=database
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.siteniz.com
```

Sonra: `php artisan migrate --force`.

## 5) Cron Jobs — `schedule:run` DEĞİL, 3 ayrı direkt komut

Yukarıda açıklanan `proc_open` kısıtı yüzünden, **Gelişmiş → Cron
İşleri**'nde `schedule:run` çağıran TEK bir cron KURMAYIN — bunun yerine
her komut için ayrı bir cron job ekleyin (tam yolu kendi kullanıcı
adınıza göre güncelleyin):

| Komut | Zamanlama |
|---|---|
| `/opt/alt/php83/usr/bin/php /home/<kullanici>/domains/api.siteniz.com/public_html/app/backend/artisan queue:work --stop-when-empty --tries=1 >> /dev/null 2>&1` | Her dakika (`* * * * *`) |
| `/opt/alt/php83/usr/bin/php /home/<kullanici>/domains/api.siteniz.com/public_html/app/backend/artisan app:check-keyword-rankings >> /dev/null 2>&1` | Günde 1 (örn. 03:00) |
| `/opt/alt/php83/usr/bin/php /home/<kullanici>/domains/api.siteniz.com/public_html/app/backend/artisan app:send-periodic-reports >> /dev/null 2>&1` | Günde 1 (örn. 04:00) |

Doğrulama: bir site oluşturup (`POST /api/sites`) HİÇBİR ŞEY çalıştırmadan
~1 dakika bekleyin; `GET /api/sites/{id}` `"status": "analyzed"`
dönüyorsa cron'un kendiliğinden kuyruğu işlediği kanıtlanmış olur.

## 6) Frontend (Next.js)

**Web Siteleri → Site ekle → Web uygulamasını dağıtın (Node.js)**:

1. **Public repository URL**: `https://github.com/<kullanici>/<repo>` (backend'de
   olduğu gibi public repo).
2. Sonraki ekranda **"Kök dizin"**i **`frontend`** olarak değiştirin (repo
   köküne değil, monorepo'nun frontend alt klasörüne kurulur). Framework
   ön ayarında Next.js seçeneği yoksa "Express" seçilebilir — sonucu
   etkilemiyor, gerçek ayarları biz elle veriyoruz.
3. **"Derleme ve çıktı ayarları"**: Paket yöneticisi `npm`, **Giriş
   dosyası: `server.js`** (bu repo'daki `frontend/server.js`, tam da bu
   amaçla — Passenger/LiteSpeed tarzı Node App yöneticilerinin beklediği
   tek-dosya giriş noktası — hazırlanmış durumda).
4. **Ortam değişkenleri**: `LARAVEL_API_URL=https://api.siteniz.com/api`,
   `LARAVEL_BASE_URL=https://api.siteniz.com`. `NEXT_PUBLIC_REVERB_*`
   değişkenlerini **eklemeyin** (polling fallback'in devreye girmesi için).
5. **"Dağıt"**.

**Kritik nokta — build adımı otomatik ÇALIŞMIYOR.** Hostinger'ın Node.js
App aracı yalnızca `npm install` yapıyor, `npm run build`'i (Next.js'in
derleme adımı) KENDİSİ çalıştırmıyor — `server.js` `.next` klasörünü
bulamadığı için "Could not find a production build" hatasıyla
başlayamıyor. Daha da kötüsü, bu hesapta `next build`'in kendisi de
**sunucuda çalışmıyor** — Turbopack (ve webpack'e geçilince de
TypeScript'in `tsc` alt-süreci) bu hesabın thread/process kotasını aşıp
`EAGAIN`/`proc_open`-benzeri hatalarla çöküyor (bkz. aşağıdaki sorunlar
listesi). **Çözüm**: build'i YEREL makinenizde çalıştırıp yalnızca
`.next` klasörünü sunucuya kopyalayın:

```bash
# yerel makinede
cd frontend && npm run build

# sunucuya yükle (SSH ile deploy edilen gerçek dizin, "hbuilds/current"
# bir symlink'tir; frontend kodunu her değiştirdiğinizde bu adımı tekrarlayın)
rsync -az -e "ssh -p <PORT>" .next/ <kullanici>@<host>:~/domains/app.siteniz.com/hbuilds/current/nodejs/.next/

# uygulamayı yeniden başlat (Passenger konvansiyonu)
ssh -p <PORT> <kullanici>@<host> \
  'touch ~/domains/app.siteniz.com/hbuilds/current/nodejs/tmp/restart.txt'
```

Bu proje için gerçek deploy dizini `hbuilds/current/nodejs/` şeklindeydi
(Hostinger'ın kendi build/versiyonlama sistemi — `hbuilds/versions/<uuid>/`
altında tutulup `current` bir symlink olarak gösteriliyor). Kendi
hesabınızda `~/domains/<subdomain>/hbuilds/` altına bakarak doğrulayın.

## 7) Sık karşılaşılan sorunlar

- **"could not read Username for 'https://github.com'"** (Git deploy
  log'unda): repo private kalmış demektir — GitHub'da repo →
  Settings → Danger Zone → Change visibility → public yapın.
- **"Call to undefined function ...symlink()"**: `storage:link` bu
  hosting'de çalışmaz, atlayın (bkz. yukarıda).
- **"The Process class relies on proc_open"**: `schedule:run`
  kullanmayı bırakıp 5. adımdaki gibi doğrudan cron'lara geçin.
- **"cURL error 6: getaddrinfo() thread failed to start"** (analiz
  bulguları/log'da) ya da build sırasında **"Resource temporarily
  unavailable" / EAGAIN / "spawn ... EAGAIN"**: hepsi aynı kök nedene
  (bu hesabın LVE thread/process kotası) işaret ediyor. cURL'ün DNS
  çözümü için ayrı bir thread açması gerektiğinde (Guzzle'ın kullandığı
  `curl_multi` arayüzü bunu gerektiriyor), hesap o an kotanın sınırında
  olabiliyor ve arıza **geçici** oluyor — hemen ardından tekrar denemek
  genelde başarılı oluyor. `FetchSiteContentJob`'a bu yüzden birkaç
  saniye aralıklı otomatik yeniden deneme (`$tries` + `backoff()`)
  eklendi; kendi ortamınızda benzer ağ hataları görürseniz aynı deseni
  (deneme sayısını artırıp aralara bekleme koymak) diğer dış API'ye
  bağımlı job'lara da uygulayabilirsiniz.
- **"Route [login] not defined"** (log'da, zararsız): `Accept:
  application/json` header'ı olmayan bir isteğin 401 yerine login
  sayfasına yönlendirilmeye çalışılmasından kaynaklanır — gerçek
  frontend istekleri zaten bu header'ı gönderir, göz ardı edebilirsiniz.
- **500 hatası / boş sayfa**: `backend/storage` ve
  `backend/bootstrap/cache`'in yazılabilir (`chmod -R 775`) olduğundan
  ve `.env`'de `APP_KEY`'in dolu olduğundan emin olun.
