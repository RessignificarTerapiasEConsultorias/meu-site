/* Ajuste da foto na moldura da página do teste (formato 3:4, arco em cima).
   Uso: FotoMoldura.abrir(arquivo, function (dataUrl) { ... })
   A pessoa arrasta a foto e aproxima com o controle; sai uma foto 720x960 já recortada do jeito que aparece na página. */
(function () {
  var W = 720, H = 960;
  var css = '.fm-fundo{position:fixed;inset:0;z-index:9999;background:rgba(6,20,42,.72);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.fm-caixa{background:#FFFDF8;border-radius:18px;max-width:380px;width:100%;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:Figtree,Arial,sans-serif;color:#16203A}' +
    '.fm-caixa h3{margin:0 0 4px;font-size:19px}.fm-caixa p{margin:0 0 12px;font-size:14px;color:#4C5670;line-height:1.45}' +
    '.fm-janela{position:relative;width:240px;max-width:70vw;aspect-ratio:3/4;margin:0 auto;border-radius:999px 999px 22px 22px;overflow:hidden;background:#E8E0CF;touch-action:none;cursor:grab;box-shadow:0 0 0 3px #C9A24A}' +
    '.fm-janela img{position:absolute;left:0;top:0;transform-origin:0 0;user-select:none;-webkit-user-drag:none;max-width:none}' +
    '.fm-zoom{display:flex;align-items:center;gap:10px;margin:14px 0 4px;font-size:20px;color:#4C5670}.fm-zoom input{flex:1;accent-color:#C9A24A}' +
    '.fm-acoes{display:flex;gap:10px;margin-top:12px}.fm-acoes button{flex:1;border:0;border-radius:12px;padding:13px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}' +
    '.fm-ok{background:#C9A24A;color:#06142A}.fm-nao{background:#EFE7D6;color:#16203A}';
  function estilo() { if (document.getElementById("fm-css")) return; var s = document.createElement("style"); s.id = "fm-css"; s.textContent = css; document.head.appendChild(s); }

  function abrir(arquivo, pronto, falhou) {
    estilo();
    var url = URL.createObjectURL(arquivo), img = new Image();
    img.onerror = function () { URL.revokeObjectURL(url); if (falhou) falhou(); };
    img.onload = function () {
      var fundo = document.createElement("div"); fundo.className = "fm-fundo";
      fundo.innerHTML = '<div class="fm-caixa" role="dialog" aria-modal="true" aria-label="Ajustar a foto">' +
        '<h3>Ajuste a sua foto</h3><p>Arraste a foto com o dedo e use o controle para aproximar. Ela vai aparecer assim na sua página.</p>' +
        '<div class="fm-janela"><img alt="Pré-visualização da foto"></div>' +
        '<div class="fm-zoom"><span aria-hidden="true">−</span><input type="range" min="100" max="300" value="100" aria-label="Aproximar a foto"><span aria-hidden="true">+</span></div>' +
        '<div class="fm-acoes"><button type="button" class="fm-nao">Cancelar</button><button type="button" class="fm-ok">Usar esta foto</button></div></div>';
      document.body.appendChild(fundo);
      var jan = fundo.querySelector(".fm-janela"), el = fundo.querySelector("img"), zoom = fundo.querySelector("input");
      el.src = url;
      var jw = jan.clientWidth, jh = jan.clientHeight;
      var base = Math.max(jw / img.width, jh / img.height);     // menor escala que cobre a moldura toda
      var esc = base, x = (jw - img.width * esc) / 2, y = (jh - img.height * esc) / 2;
      if (img.height * esc > jh) y = Math.min(0, Math.max(jh - img.height * esc, -(img.height * esc - jh) * 0.18));   // rosto costuma ficar no alto
      function limitar() {
        var w = img.width * esc, h = img.height * esc;
        x = Math.min(0, Math.max(jw - w, x)); y = Math.min(0, Math.max(jh - h, y));
      }
      function desenhar() { limitar(); el.style.transform = "translate(" + x + "px," + y + "px) scale(" + esc + ")"; }
      desenhar();
      zoom.addEventListener("input", function () {
        var novo = base * zoom.value / 100, cx = jw / 2, cy = jh / 2;
        x = cx - (cx - x) * novo / esc; y = cy - (cy - y) * novo / esc; esc = novo; desenhar();
      });
      var arrasto = null;
      jan.addEventListener("pointerdown", function (e) { arrasto = { px: e.clientX, py: e.clientY, x: x, y: y }; jan.setPointerCapture(e.pointerId); jan.style.cursor = "grabbing"; });
      jan.addEventListener("pointermove", function (e) { if (!arrasto) return; x = arrasto.x + e.clientX - arrasto.px; y = arrasto.y + e.clientY - arrasto.py; desenhar(); });
      jan.addEventListener("pointerup", function () { arrasto = null; jan.style.cursor = "grab"; });
      jan.addEventListener("pointercancel", function () { arrasto = null; });
      function fechar() { fundo.remove(); URL.revokeObjectURL(url); }
      fundo.querySelector(".fm-nao").addEventListener("click", fechar);
      fundo.querySelector(".fm-ok").addEventListener("click", function () {
        var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        var k = W / jw, ctx = cv.getContext("2d");
        ctx.fillStyle = "#E8E0CF"; ctx.fillRect(0, 0, W, H);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, x * k, y * k, img.width * esc * k, img.height * esc * k);
        var dados = cv.toDataURL("image/jpeg", 0.86);
        fechar(); pronto(dados);
      });
    };
    img.src = url;
  }
  window.FotoMoldura = { abrir: abrir };
})();
