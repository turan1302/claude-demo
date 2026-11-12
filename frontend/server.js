// Hostinger'ın (ve benzeri paylaşımlı hosting panellerinin) "Node.js App"
// yöneticileri genelde `npm start`/`next start` komutunu değil, `process.env.PORT`
// üzerinde dinleyen TEK bir başlangıç dosyası bekler. Bu dosya Next.js'in resmi
// custom server deseniyle (https://nextjs.org/docs/app/guides/custom-server)
// tam da bu ihtiyacı karşılar. hPanel'in Node.js App ekranında "Başlangıç
// Dosyası" alanına bu dosyayı (server.js) göster; komut satırı özelleştirmesi
// destekleniyorsa `npm start` de yeterlidir, bu dosyaya gerek kalmaz.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Next.js hazır: http://localhost:${port}`);
  });
});
