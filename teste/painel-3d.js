/* ============================================================================
   PAINEL 3D da área da terapeuta: foto do cliente em cada resposta e código,
   cabeçalho do detalhe com a foto grande (a terapeuta pode adicionar ou trocar),
   gráfico de teia e barras vivos. Só age com a classe .p3d no <html> (dados.painel_3d).
   Fotos: tabela clientes_fotos + bucket privado clientes-fotos (só a própria terapeuta vê).
   ============================================================================ */
(function () {
  var H = document.documentElement, ativo = function () { return H.classList.contains('p3d'); };
  var FOTOS = {}, carregou = false, uid = null;
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var semAcento = function (t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); };
  var ICONE_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>';
  var ICONE_CHAVE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.65-4A6 6 0 1 0 12.65 14H17v3h3v-3h2v-4h-9.35z"/></svg>';

  /* chaves do cliente: WhatsApp, e-mail e nome (a foto salva com uma acha nas outras listas) */
  function chaves(o) {
    var k = [], z = String((o && (o.whatsapp || o.telefone)) || '').replace(/\D/g, '');
    if (z.length >= 10) k.push('w:' + z.slice(-11));
    if (o && o.email && /@/.test(o.email)) k.push('e:' + String(o.email).trim().toLowerCase());
    var n = semAcento(o && o.nome); if (n.length >= 3) k.push('n:' + n);
    return k;
  }
  function fotoDe(ks) { for (var i = 0; i < ks.length; i++) if (FOTOS[ks[i]]) return FOTOS[ks[i]]; return null; }
  function iniciais(nome) { var p = String(nome || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
  function corDe(nome) { var h = 0, s = semAcento(nome); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return 'cor' + (h % 5 || ''); }
  function avatar(nome, ks, on) {
    var f = fotoDe(ks);
    return '<span class="p3-av ' + (f ? '' : corDe(nome)) + '" aria-hidden="true">' + (f ? '<img src="' + esc(f) + '" alt="">' : esc(iniciais(nome))) + (on ? '<span class="p3-on"></span>' : '') + '</span>';
  }
  function cliente() { try { return typeof clienteMembros === 'function' ? clienteMembros() : null; } catch (e) { return null; } }
  function respostas() { try { return typeof respostasCache !== 'undefined' && Array.isArray(respostasCache) ? respostasCache : []; } catch (e) { return []; } }

  /* carrega as fotos (links assinados por 1 hora) */
  async function carregarFotos() {
    var c = cliente(); if (!c) return;
    try {
      var s = await c.auth.getSession(); uid = s && s.data && s.data.session ? s.data.session.user.id : null; if (!uid) return;
      var r = await c.from('clientes_fotos').select('chave,foto_path'); if (r.error || !r.data || !r.data.length) { carregou = true; return; }
      var caminhos = Array.from(new Set(r.data.map(function (x) { return x.foto_path; })));
      var u = await c.storage.from('clientes-fotos').createSignedUrls(caminhos, 3600);
      var porCaminho = {}; (u.data || []).forEach(function (x) { if (x && x.signedUrl) porCaminho[x.path] = x.signedUrl; });
      r.data.forEach(function (x) { if (porCaminho[x.foto_path]) FOTOS[x.chave] = porCaminho[x.foto_path]; });
      carregou = true; decorar(true);
    } catch (e) { carregou = true; }
  }

  /* cada linha das listas da área vira cartão com foto */
  function decorar(refazer) {
    if (!ativo()) return;
    var adm = document.getElementById('tela-admin'); if (!adm) return;
    var rs = respostas(), primeira = true;
    Array.prototype.forEach.call(adm.querySelectorAll('.linha-item'), function (el) {
      if (el.closest('#detalhe-conteudo') && !el.closest('.lista-gerados')) return;
      var ja = el.querySelector(':scope > .p3-av');
      if (ja && !refazer) return;
      if (ja) ja.remove();
      var nomeEl = el.querySelector('.nome'); if (!nomeEl) return;
      var nome = el.getAttribute('data-nome') || nomeEl.textContent.split(/[,·]/)[0].trim();
      var cod = el.getAttribute('data-cod') || '';
      var r = null;
      if (cod || el.getAttribute('data-nome')) r = rs.find(function (x) { return (x.codigo || '') === cod && (x.nome || '') === (el.getAttribute('data-nome') || ''); }) || null;
      var codigoLinha = /^[A-Z0-9]{2,3}-[A-Z0-9]{4}/.test(nomeEl.textContent.trim());
      var html;
      if (codigoLinha) {
        var m = nomeEl.textContent.match(/·\s*([^·]+)/), quem = m ? m[1].replace(/só você vê|cliente vê/g, '').trim() : '';
        var c = nomeEl.textContent.trim().slice(0, 9), rr = rs.find(function (x) { return String(x.codigo || '').indexOf(c) === 0; });
        var ks = rr ? chaves(rr) : (quem ? chaves({ nome: quem }) : []);
        html = (quem || rr) && fotoDe(ks) ? avatar(quem || rr.nome, ks) : (quem ? avatar(quem, ks) : '<span class="p3-av p3-chave" aria-hidden="true">' + ICONE_CHAVE + '</span>');
      } else {
        var ks2 = r ? chaves(r) : chaves({ nome: nome });
        var on = !!(r && String(r.whatsapp || '').replace(/\D/g, '').length >= 10);
        html = avatar(nome, ks2, on);
      }
      el.insertAdjacentHTML('afterbegin', html);
      if (primeira && el.closest('#lista-respostas')) { el.classList.add('p3-foco'); primeira = false; }
    });
    prioridadeDetalhe();
  }

  function prioridadeDetalhe() {
    var box = document.querySelector('#detalhe-conteudo .barras'); if (!box) return;
    var n = 0;
    Array.prototype.forEach.call(box.querySelectorAll('.barra-item'), function (it) {
      var i = it.querySelector('.trilho i'); if (!i || !/#B23A2F/i.test(i.getAttribute('style') || '') || it.querySelector('.tp-prio')) return;
      n++; var s = it.querySelector('.topo span'); if (s) s.insertAdjacentHTML('beforeend', '<span class="tp-prio">Prioridade' + (n > 1 ? ' ' + n : '') + '</span>');
    });
  }

  /* detalhe da resposta: cabeçalho 3D com a foto grande e o botão de foto */
  var atual = null;
  function cabecalho(r) {
    var dc = document.getElementById('detalhe-conteudo'); if (!dc || !r) return;
    var h2 = dc.querySelector(':scope > h2'), p = h2 && h2.nextElementSibling && h2.nextElementSibling.tagName === 'P' ? h2.nextElementSibling : null;
    if (!h2) return;
    var ks = chaves(r), tem = !!fotoDe(ks);
    var cab = document.createElement('div'); cab.className = 'p3-cab';
    cab.innerHTML = avatar(r.nome, ks, String(r.whatsapp || '').replace(/\D/g, '').length >= 10) + '<div class="p3-txt"></div>';
    var txt = cab.querySelector('.p3-txt'); h2.parentNode.insertBefore(cab, h2); txt.appendChild(h2); if (p) txt.appendChild(p);
    txt.insertAdjacentHTML('beforeend', '<button type="button" class="p3-foto-bt">' + ICONE_CAM + (tem ? 'Trocar a foto' : 'Adicionar foto do cliente') + '</button>' +
      (tem ? '<button type="button" class="p3-foto-tira">remover</button>' : '') + '<input type="file" accept="image/*" hidden><p class="p3-aviso" role="status"></p>');
    var bt = txt.querySelector('.p3-foto-bt'), inp = txt.querySelector('input[type=file]'), av = txt.querySelector('.p3-aviso');
    bt.addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () { if (inp.files && inp.files[0]) enviarFoto(r, inp.files[0], bt, av); });
    var tira = txt.querySelector('.p3-foto-tira'); if (tira) tira.addEventListener('click', function () { removerFoto(r, av); });
  }
  function reduzir(arquivo) {
    return new Promise(function (ok, nao) {
      var img = new Image(), url = URL.createObjectURL(arquivo);
      img.onload = function () {
        var lado = Math.min(img.width, img.height), sx = (img.width - lado) / 2, sy = Math.max(0, (img.height - lado) * 0.35), t = Math.min(480, lado);
        var c = document.createElement('canvas'); c.width = t; c.height = t;
        c.getContext('2d').drawImage(img, sx, sy, lado, lado, 0, 0, t, t); URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? ok(b) : nao(new Error('imagem')); }, 'image/jpeg', 0.86);
      };
      img.onerror = function () { nao(new Error('Não consegui abrir essa imagem. Use JPG ou PNG.')); };
      img.src = url;
    });
  }
  async function enviarFoto(r, arquivo, bt, av) {
    var c = cliente(); if (!c) return;
    bt.disabled = true; av.textContent = 'Enviando a foto…';
    try {
      if (!uid) { var s = await c.auth.getSession(); uid = s.data.session.user.id; }
      var blob = await reduzir(arquivo);
      var caminho = uid + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '.jpg';
      var up = await c.storage.from('clientes-fotos').upload(caminho, blob, { contentType: 'image/jpeg', upsert: false });
      if (up.error) throw up.error;
      var ks = chaves(r), linhas = ks.map(function (k) { return { terapeuta_id: uid, chave: k, foto_path: caminho, atualizado_em: new Date().toISOString() }; });
      var ins = await c.from('clientes_fotos').upsert(linhas, { onConflict: 'terapeuta_id,chave' }); if (ins.error) throw ins.error;
      var u = await c.storage.from('clientes-fotos').createSignedUrl(caminho, 3600);
      ks.forEach(function (k) { FOTOS[k] = u.data && u.data.signedUrl; });
      av.textContent = 'Foto salva. Ela aparece em todas as respostas e códigos deste cliente.';
      refazerDetalhe(r); decorar(true);
    } catch (e) {
      av.textContent = 'Não foi possível salvar a foto agora. Tente de novo em instantes.';
      console.log('foto', e);
    }
    bt.disabled = false;
  }
  async function removerFoto(r, av) {
    var c = cliente(); if (!c) return;
    try { await c.from('clientes_fotos').delete().in('chave', chaves(r)); } catch (e) {}
    chaves(r).forEach(function (k) { delete FOTOS[k]; });
    av.textContent = 'Foto removida.'; refazerDetalhe(r); decorar(true);
  }
  function refazerDetalhe(r) {
    var cab = document.querySelector('#detalhe-conteudo .p3-cab'); if (!cab) return;
    var ks = chaves(r), velho = cab.querySelector(':scope > .p3-av');
    velho.insertAdjacentHTML('afterend', avatar(r.nome, ks, String(r.whatsapp || '').replace(/\D/g, '').length >= 10)); velho.remove();
    var bt = cab.querySelector('.p3-foto-bt'), tem = !!fotoDe(ks);
    bt.innerHTML = ICONE_CAM + (tem ? 'Trocar a foto' : 'Adicionar foto do cliente');
    var tira = cab.querySelector('.p3-foto-tira');
    if (tem && !tira) { bt.insertAdjacentHTML('afterend', '<button type="button" class="p3-foto-tira">remover</button>'); cab.querySelector('.p3-foto-tira').addEventListener('click', function () { removerFoto(r, cab.querySelector('.p3-aviso')); }); }
    if (!tem && tira) tira.remove();
  }
  function envolver() {
    if (typeof window.abrirDetalhe !== 'function' || window.abrirDetalhe.__p3) return !!(window.abrirDetalhe && window.abrirDetalhe.__p3);
    var orig = window.abrirDetalhe;
    var novo = function (r) { var x = orig.apply(this, arguments); if (ativo()) { atual = r; try { cabecalho(r); prioridadeDetalhe(); } catch (e) { console.log('p3', e); } } return x; };
    novo.__p3 = true; window.abrirDetalhe = novo; return true;
  }

  function ligar() {
    var t = 0, iv = setInterval(function () { if (envolver() || ++t > 120) clearInterval(iv); }, 150);
    var ag = 0;
    var olhar = function () {
      clearTimeout(ag); ag = setTimeout(function () {
        var adm = document.getElementById('tela-admin');
        if (adm && adm.classList.contains('ativa') && !carregou) { carregou = true; carregarFotos(); }
        decorar(false);
      }, 80);
    };
    if ('MutationObserver' in window) new MutationObserver(olhar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    olhar();
  }
  function esperar() {
    if (ativo()) return ligar();
    var mo = new MutationObserver(function () { if (ativo()) { mo.disconnect(); ligar(); } });
    mo.observe(H, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () { mo.disconnect(); }, 20000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', esperar); else esperar();
})();
