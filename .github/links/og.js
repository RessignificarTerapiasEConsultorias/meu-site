/* Gera as imagens da prévia do WhatsApp (1200x630) a partir do plano do gerar_links_testes.py.
   uso: node og_imagens.js plano-imagens.json */
const { chromium } = require("playwright");
const fs = require("fs");
const plano = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const html = it => `<!doctype html><html><head><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Karla:wght@500;700;800&display=swap" rel=stylesheet>
<style>*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;overflow:hidden;font-family:Karla,sans-serif;color:#F4ECDD;
background:radial-gradient(90% 90% at 88% 10%,#3a3226 0%,rgba(30,27,24,.6) 40%,transparent 70%),radial-gradient(70% 60% at 0% 100%,rgba(201,162,74,.22),transparent 60%),linear-gradient(160deg,#1E2025,#121317 60%,#0B0C0F);
display:flex;align-items:center;gap:56px;padding:0 70px;position:relative}
.f{flex:none;width:340px;height:340px;border-radius:50%;background:#2a2a2a ${it.foto ? `url("${esc(it.foto)}") center 22%/cover` : ""};box-shadow:0 0 0 5px #E8CB7E,0 0 0 16px rgba(201,162,74,.2),0 30px 60px -20px #000}
.s{display:inline-block;padding:9px 18px;border-radius:999px;border:1.5px solid rgba(232,203,126,.6);color:#F6E3AE;font-weight:800;font-size:21px;letter-spacing:.03em}
h1{font-family:Fraunces,serif;font-weight:500;font-size:72px;line-height:1.02;margin:20px 0 16px;letter-spacing:-.02em}h1 em{font-style:normal;color:#E8CB7E}
p{font-size:27px;line-height:1.35;color:#D8DCE4;max-width:660px}ul{list-style:none;padding:0;display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
li{padding:8px 16px;border-radius:999px;background:rgba(201,162,74,.14);color:#F6E3AE;font-weight:700;font-size:20px}
.b{position:absolute;left:70px;bottom:26px;font-size:19px;font-weight:700;color:#C9A24A;letter-spacing:.06em}</style></head>
<body><div class=f></div><div><span class=s>${esc(it.selo)}</span><h1>${it.h1}</h1><p>${esc(it.sub)}</p><ul>${it.chips.map(c => "<li>" + esc(c) + "</li>").join("")}</ul></div><div class=b>${esc(it.marca)}</div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  let n = 0;
  for (const it of plano) {
    await p.setContent(html(it), { waitUntil: "networkidle" }); await p.waitForTimeout(250);
    await p.screenshot({ path: it.saida, type: "jpeg", quality: 84 }); n++;
  }
  await b.close(); console.log("imagens:", n);
})();
