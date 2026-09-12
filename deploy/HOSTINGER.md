# Hostinger'a Kurulum Rehberi

Bu rehber, projeyi Hostinger **Business** (paylaşımlı hosting, hPanel + SSH
erişimi) planında canlıya almak ve `main`'e her `git push`'ta otomatik
deploy olmasını sağlamak için izlenecek adımları anlatır.

## Mimari Kararlar (neden böyle?)

Paylaşımlı hosting — SSH olsa bile — **sürekli açık bir TCP portu dışarıya
veremez** ve **systemd/supervisor gibi bir servis yöneticisi sunmaz**. Bu
projenin özgün mimarisi iki yerde buna dayanıyordu, ikisi de bu kurulumda
uyarlandı:

1. **Realtime (Reverb websocket) → polling.** `NEXT_PUBLIC_REVERB_HOST`
   ortam değişkeni **tanımlanmazsa**, frontend otomatik olarak WebSocket
   yerine kısa aralıklı polling'e düşer (bkz.
   `frontend/src/lib/echo.ts`'teki `isRealtimeConfigured()` ve onu kullanan
   `use-notifications.ts` / `use-analysis-status.ts`). Yani prod `.env`'de
   bu değişkenleri **hiç eklemeyin** — kod otomatik uyum sağlıyor, ekstra
   iş yok.
2. **Kalıcı `queue:work` daemonu → her dakika kısa çalışan cron.**
   `app/Console/Kernel.php`'e `queue:work --stop-when-empty` her dakika
   çalışacak şekilde eklendi; kuyrukta ne varsa işleyip kendiliğinden
   kapanıyor. Bunun çalışması için hPanel'de bir Cron Job (aşağıda) şart.

Sonuç: **tek bir git reposu**, sunucuda **tek bir klasöre** clone'lanıyor;
`backend/` alt klasörü bir subdomain'in (`api.siteniz.com`) belge kökü,
`frontend/` alt klasörü ise hPanel'in Node.js App özelliğiyle çalıştırılan
ayrı bir uygulama oluyor.

## 0) Gereken bilgiler

hPanel'den şunları not edin (Hesap > SSH Erişimi bölümünde genelde hepsi
yazar):
- SSH host adresi, SSH portu (paylaşımlı hostinglerde genelde standart
  22 değil, hPanel'de yazan özel bir port olur), SSH kullanıcı adı.

## 1) Deploy'a özel bir SSH anahtarı oluşturun

Kişisel SSH anahtarınızı GitHub Actions'a **vermeyin** — sadece bu iş için
ayrı bir anahtar çifti oluşturup public kısmını Hostinger'a, private
kısmını GitHub Secrets'a koyacağız.

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./hostinger_deploy_key -N ""
```

- **Public anahtarı** (`hostinger_deploy_key.pub`) hPanel'de
  **Gelişmiş > SSH Erişimi > SSH Anahtarları** kısmından ekleyin (ya da
  sunucuda `~/.ssh/authorized_keys`'e elle ekleyin).
- **Private anahtarı** (`hostinger_deploy_key`, `.pub` OLMAYAN dosya) bir
  sonraki adımda GitHub Secret olarak kullanılacak — kimseyle paylaşmayın,
  local'de test ettikten sonra silin.

## 2) GitHub repo'sunda Secrets ekleyin

Repo → **Settings → Secrets and variables → Actions → New repository
secret**:

| Secret adı | Değer |
|---|---|
| `HOSTINGER_SSH_HOST` | hPanel'deki SSH host adresi |
| `HOSTINGER_SSH_PORT` | hPanel'deki SSH portu |
| `HOSTINGER_SSH_USER` | hPanel'deki SSH kullanıcı adı |
| `HOSTINGER_SSH_KEY` | 1. adımda oluşturduğunuz **private** anahtarın TAM içeriği (`-----BEGIN OPENSSH PRIVATE KEY-----` dahil) |
| `HOSTINGER_APP_PATH` | Reponun sunucuda clone'lanacağı tam yol, örn. `/home/kullanici/claude-demo` |

`.github/workflows/deploy.yml` bu secret'ları kullanıyor — dosyada elle
bir şey değiştirmenize gerek yok.

## 3) Sunucuda ilk kurulum (tek seferlik, SSH ile elle)

```bash
ssh -p <SSH_PORT> <SSH_USER>@<SSH_HOST>

cd ~
git clone git@github.com:turan1302/claude-demo.git claude-demo
# Not: bu clone GitHub'a kendi SSH erişiminizi gerektirir; hPanel'in
# "Git" aracı varsa (hPanel > Gelişmiş > Git) onunla da klonlayabilirsiniz.

cd claude-demo/backend
cp .env.example .env
# .env'i düzenleyip GERÇEK bilgileri girin:
#   APP_ENV=production, APP_DEBUG=false, APP_URL=https://api.siteniz.com
#   DB_* -> hPanel'de oluşturduğunuz MySQL veritabanı bilgileri
#   MAIL_* -> gerçek SMTP bilgileriniz
#   BROADCAST_CONNECTION=null   <-- Reverb sunucusu prod'da ÇALIŞMIYOR,
#                                    bu satır broadcast() çağrılarının
#                                    sessizce no-op olmasını sağlar.
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link

cd ../frontend
cp .env.example .env.production
# .env.production'ı düzenleyin:
#   LARAVEL_API_URL=https://api.siteniz.com/api
#   LARAVEL_BASE_URL=https://api.siteniz.com
#   NEXT_PUBLIC_REVERB_* satırlarını EKLEMEYİN/BOŞ BIRAKIN (polling devreye girsin)
npm ci
npm run build
```

## 4) hPanel: backend subdomain'i

**Websiteler → siteniz.com → Subdomains** üzerinden `api.siteniz.com`
oluşturun; belge kökünü (**document root**) şuraya işaret ettirin:

```
/home/<kullanici>/claude-demo/backend/public
```

Ardından o subdomain için **PHP yapılandırması**nda PHP **8.3** seçin.

**Veritabanları → MySQL Veritabanları** kısmından yeni bir DB + kullanıcı
oluşturup `.env`'e yazdığınızdan emin olun (3. adım).

## 5) hPanel: Cron Jobs (scheduler + queue)

**Gelişmiş → Cron Jobs**'tan, her dakika çalışacak şekilde:

```
* * * * * php /home/<kullanici>/claude-demo/backend/artisan schedule:run >> /dev/null 2>&1
```

Bu TEK satır hem `app:check-keyword-rankings` / `app:send-periodic-reports`
(günlük) hem de yeni eklenen `queue:work --stop-when-empty` (her dakika)
görevlerini tetikler — `app/Console/Kernel.php`'deki tanımlara bakılır.

`php` yolunun doğru sürümü (8.3) gösterdiğinden emin olun; hPanel bazen
`/usr/bin/php` yerine `/opt/alt/php83/usr/bin/php` gibi bir yol ister —
Cron Jobs ekranında genelde hazır bir "PHP sürümü seç" alanı vardır.

## 6) hPanel: frontend için Node.js App

**Gelişmiş → Node.js** (bu bölüm yalnızca Business ve üzeri planlarda
görünür — yoksa aşağıdaki "Alternatif" kısmına bakın):

- **Uygulama kök dizini**: `claude-demo/frontend`
- **Node sürümü**: 20.x veya üzeri
- **Başlangıç dosyası**: `server.js` (bu repo'da hazır — Passenger/LiteSpeed
  tarzı Node App yöneticileri genelde `npm start` değil, `process.env.PORT`
  üzerinde dinleyen tek bir dosya bekler). Panel özel bir komut girmenize
  izin veriyorsa `npm run start:server` (ya da düz `next start` destekleniyorsa
  `npm start`) de kullanılabilir.
- Subdomain'i (örn. `app.siteniz.com` ya da kök domain) bu Node uygulamasına
  bağlayın.
- **Bu ekranın tam alan adları ve "restart" mekanizması Hostinger'ın
  kendi arayüzüne göre değişebilir** — `.github/workflows/deploy.yml`
  içinde `touch tmp/restart.txt` satırı en yaygın (Passenger) konvansiyonu
  varsayıyor; hPanel'de farklı bir "Restart" API/dosyası belirtilmişse
  o satırı buna göre güncelleyin.

**Alternatif — Node.js App bölümü yoksa/çalışmıyorsa:** Next.js'i (route
handler'lar içerdiği için statik export edilemiyor) [Vercel](https://vercel.com)'e
ücretsiz deploy edip yalnızca DNS'i (CNAME) Hostinger'da kalan domain'e
yönlendirmek çok daha az sürtünmeli bir yoldur — GitHub reposunu bağladığınızda
push'ta otomatik deploy, hiçbir Actions/SSH kurulumu gerekmeden çalışır.

## 7) Otomatik deploy nasıl işliyor artık

`main` dalına her `git push`'ta `.github/workflows/deploy.yml` tetiklenir:

1. SSH ile sunucuya bağlanır, `git pull` yapar.
2. Backend için `composer install`, `migrate --force`, config/route/event
   cache'lerini yeniler.
3. Frontend için `npm ci && npm run build` çalıştırır, Node App'i
   yeniden başlatır.

GitHub reposunda **Actions** sekmesinden her deploy'un loglarını
görebilirsiniz. Bir adım başarısız olursa (örn. migration hatası) sonraki
adımlar `set -e` sayesinde çalışmaz — hatayı loglardan görüp düzeltip
tekrar push edersiniz.

## 8) Sık karşılaşılan sorunlar

- **"Permission denied (publickey)"**: `HOSTINGER_SSH_KEY` secret'ının
  private anahtarın TAM içeriği olduğundan (boşluk/satır sonu bozulmamış)
  ve public anahtarın hPanel'e doğru eklendiğinden emin olun.
- **`composer`/`php` bulunamadı hatası**: Hostinger SSH oturumunda bazen
  `php`/`composer` PATH'te değildir; gerekirse workflow'daki script'te
  tam yolları (`/usr/bin/php8.3`, `~/bin/composer` gibi) kullanın — tam
  yolları `which php` / `which composer` ile SSH'tan elle bulabilirsiniz.
- **500 hatası / boş sayfa**: `backend/storage` ve `backend/bootstrap/cache`
  klasörlerinin yazılabilir olduğundan (`chmod -R 775`) ve `.env`'de
  `APP_KEY`'in dolu olduğundan emin olun.
