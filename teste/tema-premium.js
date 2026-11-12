/* ============================================================================
   TEMA PREMIUM: os detalhes que o CSS sozinho não faz.
   - selo PRIORIDADE nas barras das travas altas
   - anel de luz em volta dos 60 segundos
   - gráfico de teia em dourado sobre o azul-noite
   - fundo claro de volta quando a terapeuta abre a área dela
   Só age quando o <html> tem a classe .tp (dados.tema = 'premium').
   ============================================================================ */
(function () {
  var ativo = function () { return document.documentElement.classList.contains('tp'); };
  var NS = 'http://www.w3.org/2000/svg';

  function prioridade() {
    var box = document.getElementById('barras'); if (!box) return;
    var n = 0;
    Array.prototype.forEach.call(box.querySelectorAll('.barra-item'), function (it) {
      var i = it.querySelector('.trilho i'), alta = i && /#B23A2F/i.test(i.getAttribute('style') || '');
      if (!alta || it.querySelector('.tp-prio')) return;
      n++;
      var nome = it.querySelector('.topo span'); if (!nome) return;
      var s = document.createElement('span'); s.className = 'tp-prio'; s.textContent = 'Prioridade' + (n > 1 ? ' ' + n : '');
      nome.appendChild(s);
    });
  }

  function anel() {
    var card = document.getElementById('urg-card'), num = document.getElementById('urg-num');
    if (!card || !num || card.querySelector('.tp-anel')) return;
    var leg = document.getElementById('urg-legenda'), caixa = num.parentNode;
    var w = document.createElement('span'); w.className = 'tp-anel';
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><linearGradient id="tpAnelCor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FE3FF"/><stop offset=".55" stop-color="#3FB6FF"/><stop offset="1" stop-color="#FF5A6E"/></linearGradient></defs>'
      + '<circle class="fundo" cx="50" cy="50" r="44"/><circle class="luz" cx="50" cy="50" r="44"/>';
    w.appendChild(svg); caixa.parentNode.insertBefore(w, caixa); w.appendChild(num); if (leg) w.appendChild(leg);
    caixa.remove(); card.classList.add('tp-com-anel');
    var luz = svg.querySelector('.luz'), C = 2 * Math.PI * 44; luz.style.strokeDasharray = C; luz.style.strokeDashoffset = 0;
    var barra = document.getElementById('urg-barra');
    var atualizar = function () {
      var p = barra ? parseFloat(barra.style.width) : NaN; if (isNaN(p)) p = 100;
      luz.style.strokeDashoffset = (C * (1 - Math.max(0, Math.min(100, p)) / 100)).toFixed(1);
    };
    atualizar();
    if (barra && 'MutationObserver' in window) new MutationObserver(atualizar).observe(barra, { attributes: true, attributeFilter: ['style'] });
  }

  /* teia em dourado: mesmo desenho do teste, com as cores do tema */
  function teiaPremium(canvas, linhas) {
    var dpr = window.devicePixelRatio || 1;
    var lado = Math.max(280, Math.min(canvas.parentElement.clientWidth - 8, 560));
    canvas.style.width = lado + 'px'; canvas.style.height = lado + 'px'; canvas.width = lado * dpr; canvas.height = lado * dpr;
    var c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, lado, lado);
    var corN = function (n) { return n === 'alta' ? '#FF7A64' : n === 'media' ? '#F4BE4F' : '#62CC8E'; };
    var fonte = '700 ' + Math.max(10, Math.round(lado * 0.028)) + 'px Karla, sans-serif'; c.font = fonte;
    var maior = 0;
    linhas.forEach(function (l) { var p = l.curto.split(' '); var lg = p.length > 1 ? Math.max.apply(null, p.map(function (x) { return c.measureText(x).width; })) : c.measureText(l.curto).width; if (lg > maior) maior = lg; });
    var cx = lado / 2, cy = lado / 2, folga = 14, raio = Math.max(lado * 0.20, Math.min(lado * 0.30, lado / 2 - folga - maior - 10)), n = linhas.length;
    var ponto = function (i, f) { var a = (Math.PI * 2 * i / n) - Math.PI / 2; return [cx + Math.cos(a) * raio * f, cy + Math.sin(a) * raio * f]; };
    var brilho = c.createRadialGradient(cx, cy, 0, cx, cy, raio * 1.1); brilho.addColorStop(0, 'rgba(201,162,74,.10)'); brilho.addColorStop(1, 'rgba(201,162,74,0)');
    c.fillStyle = brilho; c.beginPath(); c.arc(cx, cy, raio * 1.1, 0, Math.PI * 2); c.fill();
    for (var anel = 1; anel <= 5; anel++) { c.beginPath(); for (var i = 0; i < n; i++) { var p = ponto(i, anel / 5); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.closePath(); c.strokeStyle = anel === 5 ? 'rgba(232,203,126,.38)' : 'rgba(232,203,126,.14)'; c.lineWidth = 1; c.stroke(); }
    for (var j = 0; j < n; j++) { var q = ponto(j, 1); c.beginPath(); c.moveTo(cx, cy); c.lineTo(q[0], q[1]); c.strokeStyle = 'rgba(232,203,126,.14)'; c.lineWidth = 1; c.stroke(); }
    var g = c.createLinearGradient(0, cy - raio, 0, cy + raio); g.addColorStop(0, 'rgba(246,227,174,.36)'); g.addColorStop(1, 'rgba(201,162,74,.10)');
    c.beginPath(); linhas.forEach(function (l, i) { var p = ponto(i, Math.max(l.nota, 1) / 10); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath();
    c.fillStyle = g; c.fill(); c.shadowColor = 'rgba(232,203,126,.8)'; c.shadowBlur = 12; c.strokeStyle = '#E8CB7E'; c.lineWidth = 2.2; c.stroke(); c.shadowBlur = 0;
    linhas.forEach(function (l, i) { var p = ponto(i, Math.max(l.nota, 1) / 10); c.beginPath(); c.arc(p[0], p[1], 5.5, 0, Math.PI * 2); c.shadowColor = corN(l.nivel); c.shadowBlur = 10; c.fillStyle = corN(l.nivel); c.fill(); c.shadowBlur = 0; c.strokeStyle = '#0A1426'; c.lineWidth = 2; c.stroke(); });
    linhas.forEach(function (l, i) {
      var a = (Math.PI * 2 * i / n) - Math.PI / 2, x = cx + Math.cos(a) * (raio + folga), y = cy + Math.sin(a) * (raio + folga);
      c.textAlign = Math.abs(Math.cos(a)) < 0.3 ? 'center' : (Math.cos(a) > 0 ? 'left' : 'right'); c.textBaseline = 'middle';
      var partes = l.curto.split(' '), duas = partes.length > 1;
      c.fillStyle = '#EDE3CF'; c.font = fonte;
      if (duas) { c.fillText(partes[0], x, y - 9); c.fillText(partes.slice(1).join(' '), x, y + 9); } else c.fillText(l.curto, x, y);
      c.fillStyle = corN(l.nivel); c.font = '700 ' + Math.max(10, Math.round(lado * 0.026)) + 'px Karla, sans-serif';
      c.fillText(String(l.nota.toFixed(1)).replace('.', ','), x, y + (duas ? 26 : 17));
    });
  }
  function trocarTeia() {
    if (typeof window.desenharTeia !== 'function' || window.desenharTeia.__tp) return !!(window.desenharTeia && window.desenharTeia.__tp);
    var orig = window.desenharTeia;
    var nova = function (canvas, linhas) {
      /* na área da terapeuta (fundo claro) fica o desenho original */
      if (!ativo() || (canvas && canvas.closest && canvas.closest('#tela-admin'))) return orig(canvas, linhas);
      return teiaPremium(canvas, linhas);
    };
    nova.__tp = true; window.desenharTeia = nova; return true;
  }

  function admin() {
    var a = document.getElementById('tela-admin');
    document.body.classList.toggle('tp-admin', !!(a && a.classList.contains('ativa')));
  }

  /* "premium nas cores da terapeuta" (dados.tema_cor = 'terapeuta'): o azul-noite do tema ganha o tom da cor principal dela.
     Mantém a luz (claro/escuro) de cada tom e o dourado; só troca o matiz e a intensidade. */
  function hexRgb(h) { h = String(h || '').trim().replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); if (!/^[0-9a-f]{6}$/i.test(h)) return null; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgbHsl(r, g, b) { r /= 255; g /= 255; b /= 255; var M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2, h = 0, s = 0;
    if (M !== m) { var d = M - m; s = l > .5 ? d / (2 - M - m) : d / (M + m); h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
  function hslRgb(h, s, l) { if (!s) { var v = Math.round(l * 255); return [v, v, v]; } var q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    var f = function (t) { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)]; }
  function tingir() {
    var raiz = getComputedStyle(document.documentElement), base = hexRgb(raiz.getPropertyValue('--ardosia')) || hexRgb(raiz.getPropertyValue('--ardosia-escura'));
    if (!base) return;
    var alvo = rgbHsl(base[0], base[1], base[2]), H = alvo[0], S = Math.min(.62, Math.max(.18, alvo[1]));
    var troca = function (r, g, b) { var x = rgbHsl(r, g, b), hg = x[0] * 360;
      if (!(b > r && b >= g && x[2] < .4 && hg > 198 && hg < 260)) return null;      // só os azuis-noite do tema
      return hslRgb(H, Math.min(x[1], S), x[2]); };
    var mexer = function (txt) {
      return txt.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g, function (t, r, g, b) { var n = troca(+r, +g, +b); return n ? t.slice(0, t.indexOf('(') + 1) + n.join(', ') : t; })
                .replace(/#([0-9a-f]{6})\b/gi, function (t, h) { var c = hexRgb(h), n = c && troca(c[0], c[1], c[2]); return n ? 'rgb(' + n.join(', ') + ')' : t; });
    };
    var folha = Array.prototype.filter.call(document.styleSheets, function (f) { return /tema-premium\.css/.test(f.href || ''); })[0]; if (!folha) return;
    var regras; try { regras = folha.cssRules; } catch (e) { return; }
    var andar = function (lista) {
      Array.prototype.forEach.call(lista, function (r) {
        if (r.cssRules && !r.style) return andar(r.cssRules);
        if (!r.style) return;
        for (var i = 0; i < r.style.length; i++) { var p = r.style[i], v = r.style.getPropertyValue(p); if (!/rgb|#/.test(v)) continue;
          var nv = mexer(v); if (nv !== v) r.style.setProperty(p, nv, r.style.getPropertyPriority(p)); }
      });
    };
    andar(regras);
    var meta = document.querySelector('meta[name="theme-color"]'), fundo = troca(5, 11, 23); if (meta && fundo) meta.content = 'rgb(' + fundo.join(',') + ')';
  }

  function ligar() {
    if (!ativo()) return;
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = '#050B17';
    if (document.documentElement.classList.contains('tp-cor')) tingir();
    var tentativas = 0, t = setInterval(function () { if (trocarTeia() || ++tentativas > 80) clearInterval(t); }, 150);
    var agendado = 0;
    var olhar = function () { clearTimeout(agendado); agendado = setTimeout(function () { prioridade(); anel(); admin(); }, 60); };
    if ('MutationObserver' in window) new MutationObserver(olhar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    olhar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { esperar(); }); else esperar();
  /* a classe .tp chega quando os dados da página carregam */
  function esperar() {
    if (ativo()) return ligar();
    var mo = new MutationObserver(function () { if (ativo()) { mo.disconnect(); ligar(); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () { mo.disconnect(); }, 20000);
  }
})();
