/* Ajuste da foto na moldura da página do teste (formato 3:4, arco em cima).
   Uso: FotoMoldura.abrir(arquivo, function (dataUrl) { ... })
   A pessoa arrasta a foto e aproxima com o controle; sai uma foto 720x960 já recortada do jeito que aparece na página.

   ENQUADRAMENTO AUTOMÁTICO (padrão): ao abrir, o rosto é localizado (MediaPipe, carregado só nesta hora) e a foto já
   vem posicionada com respiro acima da cabeça (o alto do cabelo fica a ~10% do topo da moldura, longe da curva do arco).
   Se a foto original não tem espaço acima da cabeça, o fundo é completado para cima com as cores da própria foto.
   Sem rosto encontrado (ou sem internet para o detector), fica como antes: a pessoa ajusta à mão. */
(function () {
  var W = 720, H = 960, ALVO = 0.10, MAX_FAIXA = 0.18, CABELO = 0.62;
  var VISAO = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  var MODELO = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
  var css = '.fm-fundo{position:fixed;inset:0;z-index:9999;background:rgba(6,20,42,.72);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.fm-caixa{background:#FFFDF8;border-radius:18px;max-width:380px;width:100%;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:Figtree,Arial,sans-serif;color:#16203A}' +
    '.fm-caixa h3{margin:0 0 4px;font-size:19px}.fm-caixa p{margin:0 0 12px;font-size:14px;color:#4C5670;line-height:1.45}' +
    '.fm-janela{position:relative;width:240px;max-width:70vw;aspect-ratio:3/4;margin:0 auto;border-radius:999px 999px 22px 22px;overflow:hidden;background:#E8E0CF;touch-action:none;cursor:grab;box-shadow:0 0 0 3px #C9A24A}' +
    '.fm-janela img{position:absolute;left:0;top:0;transform-origin:0 0;user-select:none;-webkit-user-drag:none;max-width:none}' +
    '.fm-janela .fm-busca{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,253,248,.7);font-size:13px;font-weight:700;color:#4C5670;text-align:center;padding:12px}' +
    '.fm-zoom{display:flex;align-items:center;gap:10px;margin:14px 0 4px;font-size:20px;color:#4C5670}.fm-zoom input{flex:1;accent-color:#C9A24A}' +
    '.fm-acoes{display:flex;gap:10px;margin-top:12px}.fm-acoes button{flex:1;border:0;border-radius:12px;padding:13px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}' +
    '.fm-ok{background:#C9A24A;color:#06142A}.fm-ok[disabled]{opacity:.5;cursor:wait}.fm-nao{background:#EFE7D6;color:#16203A}';
  function estilo() { if (document.getElementById("fm-css")) return; var s = document.createElement("style"); s.id = "fm-css"; s.textContent = css; document.head.appendChild(s); }

  /* ---------- 1) onde está o rosto e onde está a pessoa (null se não achar) ---------- */
  var SEGMENTO = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
  var ferramentas = null;
  function carregar() {
    if (ferramentas) return ferramentas;
    ferramentas = import(VISAO + "/vision_bundle.mjs").then(function (v) {
      return v.FilesetResolver.forVisionTasks(VISAO + "/wasm").then(function (fs) {
        return Promise.all([
          v.FaceDetector.createFromOptions(fs, { baseOptions: { modelAssetPath: MODELO, delegate: "CPU" }, runningMode: "IMAGE", minDetectionConfidence: 0.5 }),
          v.ImageSegmenter.createFromOptions(fs, { baseOptions: { modelAssetPath: SEGMENTO, delegate: "CPU" }, runningMode: "IMAGE", outputCategoryMask: false, outputConfidenceMasks: true }).catch(function () { return null; })
        ]);
      });
    });
    ferramentas.catch(function () { ferramentas = null; });
    return ferramentas;
  }
  function analisar(fonte, limiteMs) {
    var tempo = new Promise(function (ok) { setTimeout(function () { ok(null); }, limiteMs || 9000); });
    var busca = carregar().then(function (f) {
      var w = fonte.naturalWidth || fonte.width, h = fonte.naturalHeight || fonte.height;
      var k = Math.min(1, 1000 / Math.max(w, h)), c = document.createElement("canvas");
      c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext("2d").drawImage(fonte, 0, 0, c.width, c.height);
      var r = f[0].detect(c), lista = (r && r.detections) || [];
      if (!lista.length) return null;
      lista.sort(function (a, b) { return b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height; });
      var b = lista[0].boundingBox, out = { rosto: { x: b.originX / k, y: b.originY / k, w: b.width / k, h: b.height / k }, mascara: null };
      try {
        if (f[1]) {
          var sr = f[1].segment(c), ms = sr.confidenceMasks || [], m = ms[ms.length - 1];
          if (m) out.mascara = { w: m.width, h: m.height, d: m.getAsFloat32Array().slice(), k: m.width / w };
          if (sr.close) sr.close();
        }
      } catch (e) { out.mascara = null; }
      return out;
    }).catch(function () { return null; });
    return Promise.race([busca, tempo]);
  }
  function acharRosto(fonte, limiteMs) { return analisar(fonte, limiteMs).then(function (a) { return a && a.rosto; }); }

  /* ---------- 2) plano: quanto completar em cima e onde fica a janela 3:4 (em pixels da foto original) ----------
     A cabeça (com o cabelo) precisa caber inteira dentro do arco, com folga: o alto do cabelo a ~8-10% do topo
     e as laterais do cabelo longe da curva. Se para isso a janela tiver de subir além do topo da foto, completa o fundo. */
  function plano(w, h, an) {
    var rosto = an && an.rosto ? an.rosto : (an && an.x !== undefined ? an : null), M = an && an.mascara;
    var p = { faixa: 0, x: 0, y: 0, janW: 0, janH: 0, rosto: rosto, topo: null, cortada: false };
    if (w / h <= 3 / 4) { p.janW = w; p.janH = w * 4 / 3; p.y = (h - p.janH) * 0.18; }   // sem rosto: como sempre foi
    else { p.janH = h; p.janW = h * 3 / 4; p.x = (w - p.janW) / 2; }
    if (!rosto) return p;
    var cx = rosto.x + rosto.w / 2;
    p.janW = Math.min(w, h * 3 / 4); p.janH = p.janW * 4 / 3;                      // janela 3:4 na escala da foto
    p.x = Math.min(Math.max(0, cx - p.janW / 2), w - p.janW);
    /* pontos da cabeça (máscara da pessoa acima da boca) */
    var pts = [], topo = Math.max(0, rosto.y - CABELO * rosto.h);
    if (M) {
      var lim = Math.min(M.h, Math.round((rosto.y + rosto.h * 0.6) * M.k)), passo = Math.max(1, Math.round(M.w / 160)), t = -1;
      for (var yy = 0; yy < lim; yy += passo) for (var xx = 0; xx < M.w; xx += passo) if (M.d[yy * M.w + xx] > 0.5) { pts.push([xx / M.k, yy / M.k]); if (t < 0) t = yy / M.k; }
      /* o alto da cabeça pela máscara (se ela concorda com o rosto) */
      if (t >= 0 && t < rosto.y) topo = t;
    }
    p.topo = topo;
    if (topo <= h * 0.012) { p.cortada = true; p.y = 0; return arred(p); }        // a própria foto corta a cabeça: completar o fundo não ajuda
    var r = p.janW / 2, folga = p.janW * 0.03;
    function cabe(T) {
      if (topo - T < 0.08 * p.janH) return false;
      var ruins = 0;
      for (var i = 0; i < pts.length; i++) {
        var yv = pts[i][1] - T, xv = pts[i][0] - p.x; if (yv >= r) continue;
        if (xv < 0 || xv > p.janW) continue;
        var meia = Math.sqrt(Math.max(0, r * r - (r - yv) * (r - yv)));
        if (Math.abs(xv - r) > meia - folga) ruins++;
      }
      return ruins <= Math.max(2, pts.length * 0.004);
    }
    var T = Math.min(topo - ALVO * p.janH, h - p.janH), minimo = -MAX_FAIXA * p.janH;
    while (T > minimo && !cabe(T)) T -= p.janH * 0.01;
    T = Math.max(T, minimo);
    if (T < 0) { p.faixa = -T; p.y = 0; } else p.y = T;
    return arred(p);
  }
  function arred(p) { p.faixa = Math.round(p.faixa); return p; }

  /* ---------- 3) foto com o fundo completado para cima (faixa em px) ---------- */
  function estender(img, faixa) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var c = document.createElement("canvas"); c.width = w; c.height = h + faixa;
    var ctx = c.getContext("2d"); ctx.drawImage(img, 0, faixa, w, h);
    if (!faixa) return c;
    var k = Math.max(2, Math.round(h * 0.012)), px = ctx.getImageData(0, faixa, w, k).data, col = [];
    for (var x = 0; x < w; x++) { var r = 0, g = 0, b = 0; for (var y = 0; y < k; y++) { var i = (y * w + x) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; } col.push([r / k, g / k, b / k]); }
    /* referência de fundo: média das laterais, ligadas por uma reta (onde a pessoa encosta no topo, usa a referência) */
    function media(a, z) { var s = [0, 0, 0], n = 0; for (var x = a; x < z; x++) { s[0] += col[x][0]; s[1] += col[x][1]; s[2] += col[x][2]; n++; } return [s[0] / n, s[1] / n, s[2] / n]; }
    var q = Math.max(1, Math.round(w * 0.22)), esq = media(0, q), dir = media(w - q, w);
    for (x = 0; x < w; x++) {
      var t = x / (w - 1), ref = [esq[0] + (dir[0] - esq[0]) * t, esq[1] + (dir[1] - esq[1]) * t, esq[2] + (dir[2] - esq[2]) * t];
      var d = Math.hypot(col[x][0] - ref[0], col[x][1] - ref[1], col[x][2] - ref[2]);
      if (d > 38) col[x] = ref;
    }
    var raio = Math.max(2, Math.round(w * 0.03));
    for (var volta = 0; volta < 3; volta++) {
      var nova = [];
      for (x = 0; x < w; x++) { var s = [0, 0, 0], n = 0; for (var j = Math.max(0, x - raio); j <= Math.min(w - 1, x + raio); j++) { s[0] += col[j][0]; s[1] += col[j][1]; s[2] += col[j][2]; n++; } nova.push([s[0] / n, s[1] / n, s[2] / n]); }
      col = nova;
    }
    var linha = ctx.createImageData(w, 1);
    for (x = 0; x < w; x++) { linha.data[x * 4] = col[x][0]; linha.data[x * 4 + 1] = col[x][1]; linha.data[x * 4 + 2] = col[x][2]; linha.data[x * 4 + 3] = 255; }
    var l = document.createElement("canvas"); l.width = w; l.height = 1; l.getContext("2d").putImageData(linha, 0, 0);
    ctx.drawImage(l, 0, 0, w, 1, 0, 0, w, faixa);
    var emenda = Math.max(2, Math.round(Math.min(faixa * 0.6, h * 0.025)));    // emenda suave entre o fundo novo e a foto
    for (var e = 0; e < emenda; e++) { ctx.globalAlpha = 1 - (e + 1) / (emenda + 1); ctx.drawImage(l, 0, 0, w, 1, 0, faixa + e, w, 1); }
    ctx.globalAlpha = 1;
    return c;
  }

  /* ---------- 4) foto pronta 720x960 sem a pessoa mexer (usado para corrigir fotos já enviadas) ---------- */
  function automatico(img) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    return analisar(img, 20000).then(function (an) {
      var p = plano(w, h, an), fonte = estender(img, p.faixa);
      var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      var ctx = cv.getContext("2d"); ctx.fillStyle = "#E8E0CF"; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingQuality = "high";
      ctx.drawImage(fonte, p.x, p.y, p.janW, p.janH, 0, 0, W, H);
      return { dados: cv.toDataURL("image/jpeg", 0.88), plano: p };
    });
  }

  function abrir(arquivo, pronto, falhou) {
    estilo();
    var url = URL.createObjectURL(arquivo), img = new Image();
    img.onerror = function () { URL.revokeObjectURL(url); if (falhou) falhou(); };
    img.onload = function () {
      var fundo = document.createElement("div"); fundo.className = "fm-fundo";
      fundo.innerHTML = '<div class="fm-caixa" role="dialog" aria-modal="true" aria-label="Ajustar a foto">' +
        '<h3>Ajuste a sua foto</h3><p>Já deixamos o rosto centralizado na moldura. Se quiser, arraste a foto com o dedo e use o controle para aproximar. Ela vai aparecer assim na sua página.</p>' +
        '<div class="fm-janela"><img alt="Pré-visualização da foto"><div class="fm-busca">Enquadrando o seu rosto…</div></div>' +
        '<div class="fm-zoom"><span aria-hidden="true">−</span><input type="range" min="100" max="300" value="100" aria-label="Aproximar a foto"><span aria-hidden="true">+</span></div>' +
        '<div class="fm-acoes"><button type="button" class="fm-nao">Cancelar</button><button type="button" class="fm-ok" disabled>Usar esta foto</button></div></div>';
      document.body.appendChild(fundo);
      var jan = fundo.querySelector(".fm-janela"), el = fundo.querySelector("img"), zoom = fundo.querySelector("input"), ok = fundo.querySelector(".fm-ok");
      var jw = jan.clientWidth, jh = jan.clientHeight, fonte = null, base, esc, x, y, fechado = false;
      function limitar() {
        var w = fonte.width * esc, h = fonte.height * esc;
        x = Math.min(0, Math.max(jw - w, x)); y = Math.min(0, Math.max(jh - h, y));
      }
      function desenhar() { limitar(); el.style.transform = "translate(" + x + "px," + y + "px) scale(" + esc + ")"; }
      function montar(an) {
        if (fechado) return;
        var p = plano(img.naturalWidth, img.naturalHeight, an);
        if (p.cortada) { var dica = fundo.querySelector(".fm-caixa p"); if (dica) dica.innerHTML = "Esta foto corta o alto da sua cabeça. Para ficar melhor na moldura, use uma foto com um pouco de espaço acima do cabelo. Se preferir usar esta, arraste e aproxime para ajustar."; }
        fonte = estender(img, p.faixa);
        el.src = p.faixa ? fonte.toDataURL("image/jpeg", 0.92) : url;
        base = Math.max(jw / fonte.width, jh / fonte.height);
        esc = Math.max(base, jw / p.janW); zoom.value = Math.min(300, Math.round(esc / base * 100)); x = -p.x * esc; y = -p.y * esc;
        desenhar();
        var b = jan.querySelector(".fm-busca"); if (b) b.remove();
        ok.disabled = false;
      }
      analisar(img, 12000).then(montar);
      zoom.addEventListener("input", function () {
        if (!fonte) return;
        var novo = base * zoom.value / 100, cx = jw / 2, cy = jh / 2;
        x = cx - (cx - x) * novo / esc; y = cy - (cy - y) * novo / esc; esc = novo; desenhar();
      });
      var arrasto = null;
      jan.addEventListener("pointerdown", function (e) { if (!fonte) return; arrasto = { px: e.clientX, py: e.clientY, x: x, y: y }; jan.setPointerCapture(e.pointerId); jan.style.cursor = "grabbing"; });
      jan.addEventListener("pointermove", function (e) { if (!arrasto) return; x = arrasto.x + e.clientX - arrasto.px; y = arrasto.y + e.clientY - arrasto.py; desenhar(); });
      jan.addEventListener("pointerup", function () { arrasto = null; jan.style.cursor = "grab"; });
      jan.addEventListener("pointercancel", function () { arrasto = null; });
      function fechar() { fechado = true; fundo.remove(); URL.revokeObjectURL(url); }
      fundo.querySelector(".fm-nao").addEventListener("click", fechar);
      ok.addEventListener("click", function () {
        if (!fonte) return;
        var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        var k = W / jw, ctx = cv.getContext("2d");
        ctx.fillStyle = "#E8E0CF"; ctx.fillRect(0, 0, W, H);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(fonte, x * k, y * k, fonte.width * esc * k, fonte.height * esc * k);
        var dados = cv.toDataURL("image/jpeg", 0.86);
        fechar(); pronto(dados);
      });
    };
    img.src = url;
  }
  window.FotoMoldura = { abrir: abrir, automatico: automatico, plano: plano, analisar: analisar, acharRosto: acharRosto, estender: estender };
})();
