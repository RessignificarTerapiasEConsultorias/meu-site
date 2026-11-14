/* ============================================================================
   OLHINHO DA SENHA — em todo campo de senha do site (Área de Membros, área do teste, compras, contas).
   - O campo sempre abre escondido (bolinhas). Tocar no olhinho mostra o que a pessoa está digitando; tocar de novo esconde.
   - Segurança: a senha que o navegador preenche sozinho (senha salva) nunca é mostrada: só se vê o que a pessoa digita na hora.
   - O olho volta a ficar fechado: ao entrar (enviar), ao apertar Enter, ao sair da aba, ao esvaziar o campo
     e quando a tela do campo some (por exemplo, ao sair da conta). Para ver de novo, é preciso tocar no olhinho outra vez.
   - Nada é guardado: nem no aparelho, nem no servidor.
   - O campo de e-mail/usuário não muda.
   Para valer num campo que não é type="password" (ex.: senha provisória do master), use data-olho-senha no <input>.
   ============================================================================ */
(function () {
  if (window.__senhaOlho) return; window.__senhaOlho = true;
  var CSS = '.so-wrap{position:relative;display:block;width:100%}' +
    '.so-wrap>input{padding-right:50px!important;width:100%;box-sizing:border-box}' +
    '.so-olho{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:44px;height:44px;margin:0;padding:0;border:0;border-radius:10px;background:transparent;cursor:pointer;' +
    'display:grid;place-items:center;color:inherit;opacity:.62;-webkit-tap-highlight-color:transparent;transition:opacity .15s,background .15s}' +
    '.so-olho:hover,.so-olho:focus-visible{opacity:1;background:rgba(127,127,127,.14);outline:none}' +
    '.so-olho[aria-pressed="true"]{opacity:1}' +
    '.so-olho svg{width:22px;height:22px;display:block;pointer-events:none}' +
    '.so-olho .so-aberto{display:none}.so-olho[aria-pressed="true"] .so-aberto{display:block}.so-olho[aria-pressed="true"] .so-fechado{display:none}' +
    '.so-aviso{display:block;margin:6px 2px 0;font-size:13px;line-height:1.4;color:inherit;opacity:.85}' +
    'input::-ms-reveal,input::-ms-clear{display:none}';
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  var FECHADO = '<svg class="so-fechado" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.2A9.7 9.7 0 0 1 12 5c5 0 8.7 3.4 10 7a11 11 0 0 1-2.9 4.2M6.5 6.6A11 11 0 0 0 2 12c1.3 3.6 5 7 10 7a9.8 9.8 0 0 0 4-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  var ABERTO = '<svg class="so-aberto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12c1.3-3.6 5-7 10-7s8.7 3.4 10 7c-1.3 3.6-5 7-10 7S3.3 15.6 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var lista = [];

  function melhorar(inp) {
    if (inp.__olho || inp.closest('.so-wrap')) return;
    inp.__olho = true;
    if (inp.type !== 'password') inp.type = 'password';
    var cs = getComputedStyle(inp), wrap = document.createElement('span'), bt = document.createElement('button');
    wrap.className = 'so-wrap';
    ['marginTop', 'marginBottom'].forEach(function (p) { wrap.style[p] = cs[p]; inp.style[p] = '0'; });
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
    bt.type = 'button'; bt.className = 'so-olho'; bt.setAttribute('aria-pressed', 'false'); bt.setAttribute('aria-label', 'Mostrar a senha'); bt.title = 'Mostrar a senha';
    bt.innerHTML = FECHADO + ABERTO; bt.style.color = cs.color;
    wrap.appendChild(bt);
    var digitou = false, ultimo = '', aviso = null, estado = { inp: inp, bt: bt, wrap: wrap };
    function esconder() { inp.type = 'password'; bt.setAttribute('aria-pressed', 'false'); bt.setAttribute('aria-label', 'Mostrar a senha'); bt.title = 'Mostrar a senha'; }
    function mostrar() { inp.type = 'text'; inp.spellcheck = false; inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off'); bt.setAttribute('aria-pressed', 'true'); bt.setAttribute('aria-label', 'Esconder a senha'); bt.title = 'Esconder a senha'; }
    function dizer(t) { if (!aviso) { aviso = document.createElement('small'); aviso.className = 'so-aviso'; aviso.setAttribute('role', 'status'); wrap.parentNode.insertBefore(aviso, wrap.nextSibling); } aviso.textContent = t; clearTimeout(aviso.__t); aviso.__t = setTimeout(function () { if (aviso) aviso.textContent = ''; }, 5000); }
    estado.esconder = esconder;
    bt.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (inp.type === 'text') { esconder(); inp.focus(); return; }
      /* data-olho-senha: senha gerada pelo sistema (painel do master), que pode ser vista */
      if (!inp.hasAttribute('data-olho-senha') && inp.value && (!digitou || inp.value !== ultimo)) { dizer('Por segurança, a senha salva pelo navegador não é exibida. Para ver o que digita, escreva a senha aqui.'); inp.focus(); return; }
      mostrar(); inp.focus();
    });
    /* só conta como "digitado" o que a pessoa escreve ou cola; o preenchimento automático do navegador não conta */
    inp.addEventListener('beforeinput', function (e) { if (/^(insert|delete)/.test(e.inputType || '') && e.inputType !== 'insertReplacementText') digitou = true; });
    inp.addEventListener('keydown', function (e) {
      if (e.key && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')) digitou = true;
      if (e.key === 'Enter') esconder();
    });
    inp.addEventListener('paste', function () { digitou = true; });
    inp.addEventListener('change', function () { if (inp.value !== ultimo) digitou = false; });
    inp.addEventListener('input', function () { if (!inp.value) { digitou = false; ultimo = ''; esconder(); return; } if (digitou) ultimo = inp.value; });
    var f = inp.form; if (f) f.addEventListener('submit', esconder, true);
    lista.push(estado);
  }

  function varrer(raiz) {
    (raiz || document).querySelectorAll('input[type="password"], input[data-olho-senha]').forEach(melhorar);
  }
  function escondeTodos() { lista.forEach(function (e) { if (e.inp.type === 'text') e.esconder(); }); }

  /* ao entrar/enviar (qualquer botão da mesma tela), ao sair da aba e quando o campo some da tela, o olho fecha */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button,[type="submit"],.btn,a');
    if (!b || b.classList.contains('so-olho')) return;
    lista.forEach(function (x) { var area = x.inp.closest('form,.cartao,.tela,section,main,dialog') || document.body; if (area.contains(b)) x.esconder(); });
  }, true);
  document.addEventListener('visibilitychange', function () { if (document.hidden) escondeTodos(); });
  window.addEventListener('pagehide', escondeTodos);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (!x.isIntersecting) { var e = lista.filter(function (l) { return l.wrap === x.target; })[0]; if (e && e.inp.type === 'text') e.esconder(); } }); });
    var ligaIO = function () { lista.forEach(function (e) { if (!e.__io) { e.__io = true; io.observe(e.wrap); } }); };
    setInterval(ligaIO, 1500);
  }
  /* para o caso de a tela esconder o campo por display:none (não dispara o observador em todos os navegadores) */
  setInterval(function () { lista.forEach(function (e) { if (e.inp.type === 'text' && !e.wrap.offsetParent) e.esconder(); }); }, 800);

  function iniciar() {
    varrer();
    if ('MutationObserver' in window) new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length) { varrer(); break; } }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
