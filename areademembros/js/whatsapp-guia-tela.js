/* Guia passo a passo do CRM (piloto): o motor que desenha o foco, a seta e o cartão em cima da tela de verdade.
   Regras: o guia só observa e aponta; quem preenche e quem toca é a pessoa. Ele nunca toca em botão que envia mensagem
   ou custa dinheiro. Os únicos toques que faz são nas abas e nos filtros, quando a pessoa escolhe "Ir para lá".
   A medição guarda só o roteiro, o passo e o que aconteceu: nada do que foi digitado e nada de quem usou. */
(function () {
  "use strict";
  const P = window.WaPainel, G = window.WaGuia;
  if (!P || !G) return;
  const $ = P.$, esc = P.esc, supa = P.supa;
  const CHAVE = "wa_guia", VALIDADE = 12 * 3600 * 1000;
  const S = { roteiro: null, ok: {}, ultimoId: null, ultimoHtml: "", fim: false, perguntou: false };

  /* ---------- como o guia enxerga a tela ---------- */
  function q(sel) { try { return document.querySelector(sel); } catch (e) { return null; } }
  function visivel(el) { return !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  const T = {
    valor: function (sel) { const e = q(sel); return e ? String(e.value === undefined || e.value === null ? "" : e.value).trim() : ""; },
    attr: function (sel, nome) { const e = q(sel); return e ? e.getAttribute(nome) : null; },
    classe: function (sel, nome) { const e = q(sel); return !!e && e.classList.contains(nome); },
    conta: function (sel) { try { return document.querySelectorAll(sel).length; } catch (e) { return 0; } },
    vazios: function (sel) { let n = 0; try { document.querySelectorAll(sel).forEach(function (e) { if (!String(e.value || "").trim()) n += 1; }); } catch (e) { n = 0; } return n; }
  };

  /* ---------- peças na tela ---------- */
  const raiz = document.createElement("div"); raiz.id = "cgRaiz"; raiz.hidden = true;
  raiz.innerHTML = '<div id="cgFoco" class="sem"></div><div id="cgSeta" class="sem" aria-hidden="true"><svg viewBox="0 0 46 46"><path d="M23 4v30M23 40L9 24h28z" fill="#E3C477" stroke="#06142A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg></div>'
    + '<div id="cgCard" class="baixo" role="dialog" aria-live="polite" aria-label="Guia passo a passo"></div>';
  document.body.appendChild(raiz);
  const foco = $("cgFoco"), seta = $("cgSeta"), card = $("cgCard");

  function guardar() { try { if (S.roteiro) localStorage.setItem(CHAVE, JSON.stringify({ roteiro: S.roteiro, ok: S.ok, em: Date.now() })); else localStorage.removeItem(CHAVE); } catch (e) { /* sem armazenamento: o guia só não lembra onde parou */ } }
  function registrar(evento, passo) { try { supa().rpc("crm_guia_registrar", { p_roteiro: S.roteiro, p_passo: passo || null, p_evento: evento }).then(function () {}, function () {}); } catch (e) { /* medição nunca atrapalha */ } }
  function roteiro() { return S.roteiro ? G.ROTEIROS[S.roteiro] : null; }

  function iniciar(id, retomando) {
    if (!G.ROTEIROS[id]) return;
    if (S.roteiro && S.roteiro !== id && !S.fim) registrar("saiu", S.ultimoId);
    const mesmo = retomando && S.roteiro === id;
    S.roteiro = id; if (!mesmo) S.ok = retomando ? S.ok : {}; S.fim = false; S.perguntou = false; S.ultimoId = null; S.ultimoHtml = "";
    if (!retomando) registrar("comecou");
    guardar(); raiz.hidden = false; ligarLaco();
  }
  function encerrar(motivo) {
    if (S.roteiro && !S.fim && motivo !== "silencio") registrar("saiu", S.ultimoId);
    S.roteiro = null; S.ok = {}; S.fim = false; S.ultimoHtml = ""; guardar();
    raiz.hidden = true; foco.className = "sem"; seta.className = "sem"; card.innerHTML = "";
  }

  /* ---------- cartão ---------- */
  function desenharCartao(info) {
    const r = roteiro(), p = info.passo;
    let html = '<div class="cg-topo"><span class="cg-passo">' + esc(G.rotuloDoPasso(info, r)) + '</span><button type="button" class="cg-x" data-cg="sair" aria-label="Sair do guia">×</button></div>';
    if (info.fim) {
      html += '<p class="cg-txt">' + esc(r.fim) + "</p>"
        + (S.perguntou ? '<p class="cg-ex">Obrigado. A sua resposta ajuda a melhorar este guia.</p><div class="cg-acoes"><button type="button" class="cg-btn" data-cg="fechar">Fechar</button></div>'
          : '<p class="cg-ex">Este guia ajudou?</p><div class="cg-acoes"><button type="button" class="cg-btn" data-cg="sim">Sim, ajudou</button><button type="button" class="cg-btn sec" data-cg="nao">Não muito</button><button type="button" class="cg-btn fraco" data-cg="fechar">Fechar</button></div>');
    } else {
      html += '<p class="cg-txt">' + esc(p.texto) + "</p>"
        + (p.exemplo ? '<p class="cg-ex"><b>Exemplo:</b> ' + esc(p.exemplo) + "</p>" : "")
        + (p.erro ? '<p class="cg-ex cg-erro"><b>Erro comum:</b> ' + esc(p.erro) + "</p>" : "")
        + (p.aviso ? '<p class="cg-aviso">' + esc(p.aviso) + "</p>" : "")
        + '<div class="cg-acoes">'
        + (p.trocar ? '<button type="button" class="cg-btn" data-cg="trocar" data-para="' + esc(p.trocar) + '">Ir para esse guia</button>' : "")
        + (p.info && !p.trocar ? '<button type="button" class="cg-btn" data-cg="ok">' + esc(p.manual || "Próximo") + "</button>" : "")
        + (!p.info ? '<span class="cg-espera">O guia segue sozinho quando você fizer isto.</span>' : "")
        + '<button type="button" class="cg-btn fraco" data-cg="sair">Sair do guia</button></div>';
    }
    if (html !== S.ultimoHtml) { card.innerHTML = html; S.ultimoHtml = html; }
  }
  card.addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-cg]"); if (!b || !S.roteiro) return;
    const acao = b.dataset.cg;
    if (acao === "ok" && S.ultimoId) { S.ok[S.ultimoId] = true; guardar(); }
    else if (acao === "trocar") iniciar(b.dataset.para, false);
    else if (acao === "sim" || acao === "nao") { registrar(acao === "sim" ? "ajudou_sim" : "ajudou_nao"); S.perguntou = true; S.ultimoHtml = ""; }
    else if (acao === "sair") encerrar();
    else if (acao === "fechar") encerrar("silencio");
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && S.roteiro && !document.querySelector("dialog[open]")) encerrar(S.fim ? "silencio" : ""); });

  /* ---------- foco, seta e posição do cartão ---------- */
  function posicionar(el) {
    if (!visivel(el)) { foco.className = "sem"; seta.className = "sem"; card.className = "baixo"; return; }
    const r = el.getBoundingClientRect(), pad = 6, W = window.innerWidth, H = window.innerHeight;
    foco.className = ""; foco.style.left = (r.left - pad) + "px"; foco.style.top = (r.top - pad) + "px"; foco.style.width = (r.width + pad * 2) + "px"; foco.style.height = (r.height + pad * 2) + "px";
    const s = G.posicaoDaSeta(r, W);
    seta.className = s.acima ? "" : "sobe"; seta.style.left = s.left + "px"; seta.style.top = s.top + "px";
    card.className = G.ladoDoCartao(r, H);
  }
  function levarAte(el, id) {
    if (!visivel(el)) { S.ultimoRolado = null; return; }
    const r = el.getBoundingClientRect(), fora = r.bottom < 70 || r.top > window.innerHeight - 150 || r.left < 0 || r.right > window.innerWidth;
    if (id !== S.ultimoRolado || (fora && Date.now() - (S.rolouEm || 0) > 1200)) {
      try { el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }); } catch (e) { el.scrollIntoView(); }
      S.ultimoRolado = id; S.rolouEm = Date.now();
    }
  }

  /* ---------- o laço: a cada instante, olha a tela e aponta o passo que falta ---------- */
  let rodando = false, tNum = 0;
  function ligarLaco() { if (!rodando) { rodando = true; requestAnimationFrame(laco); } }
  function laco(ts) {
    if (!S.roteiro) { rodando = false; return; }
    requestAnimationFrame(laco);
    if (document.querySelector("dialog[open]")) { raiz.hidden = true; return; }   // janela aberta por cima: o guia espera
    raiz.hidden = false;
    if (ts - tNum < 150 && card.innerHTML) { if (S.alvoAtual) posicionar(S.alvoAtual); return; }
    tNum = ts;
    const info = G.passoAtual(roteiro(), T, { ok: S.ok });
    if (info.fim && !S.fim) { S.fim = true; registrar("concluiu"); guardar(); }
    S.ultimoId = info.passo ? info.passo.id : null;
    desenharCartao(info);
    const el = info.passo ? q(info.passo.alvo) : null;
    S.alvoAtual = el;
    if (info.passo) levarAte(el, info.passo.id);
    posicionar(el);
  }

  /* ---------- ir para uma aba, já com o filtro (toques só em aba e filtro) ---------- */
  function irPara(aba, filtro) {
    const b = q('#abas .aba[data-aba="' + aba + '"]'); if (!b) return;
    b.click();
    if (!filtro) return;
    setTimeout(function () {
      const alvo = aba === "conversas" ? q('#cvFiltros [data-filtro="' + filtro + '"]') : aba === "inscricoes" ? q('#inSub [data-in-sub="' + filtro + '"]') : null;
      if (alvo) alvo.click();
    }, 0);
  }

  /* ---------- tela "O que você quer fazer?" ---------- */
  const ICONE = { responder: "conversas", template: "templates", disparo: "disparos", inscricao: "inscricoes", vendas: "vendas", funil: "relogio" };
  function desenharTarefas() {
    const cx = $("cgTarefas"); if (!cx) return;
    cx.innerHTML = G.TAREFAS.map(function (t) {
      return '<div class="cg-tarefa" role="button" tabindex="0" data-cg-ir="' + esc(t.aba) + '"' + (t.filtro ? ' data-filtro="' + esc(t.filtro) + '"' : "") + ">" + (window.CrmIcone ? window.CrmIcone(ICONE[t.id] || "") : "")
        + (t.roteiro ? '<button type="button" class="cg-comguia" data-cg-mostrar="' + esc(t.roteiro) + '" aria-label="Guia passo a passo: ' + esc(t.titulo) + '">Com guia</button>' : "")
        + '<div class="cg-tarefa-txt"><b>' + esc(t.titulo) + "</b><small>" + esc(t.texto) + "</small></div></div>";
    }).join("");
  }
  document.addEventListener("click", function (ev) {
    const m = ev.target.closest("[data-cg-mostrar]"); if (m) return iniciar(m.dataset.cgMostrar, false);
    const ir = ev.target.closest("[data-cg-ir]"); if (ir) return irPara(ir.dataset.cgIr, ir.dataset.filtro || "");
  });
  document.addEventListener("keydown", function (ev) { if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches && ev.target.matches(".cg-tarefa")) { ev.preventDefault(); irPara(ev.target.dataset.cgIr, ev.target.dataset.filtro || ""); } });
  desenharTarefas();
  /* quem já conhece o CRM pode recolher o bloco de tarefas; o aparelho lembra */
  const box = $("cgTarefasBox");
  if (box) {
    try { if (localStorage.getItem("wa_guia_tarefas") === "fechado") box.open = false; } catch (e) { /* fica aberto */ }
    box.addEventListener("toggle", function () { try { localStorage.setItem("wa_guia_tarefas", box.open ? "aberto" : "fechado"); } catch (e) { /* sem armazenamento */ } });
  }

  /* resumo de uso (em Ajustes da Visão geral): onde as pessoas mais saem de cada guia */
  async function resumoDeUso() {
    const cx = $("cgUso"); if (!cx) return;
    try {
      const r = await supa().rpc("crm_guia_resumo", { p_dias: 90 }); const lista = (r && r.data) || [];
      cx.innerHTML = lista.length ? lista.map(function (x) {
        const titulo = (G.ROTEIROS[x.roteiro] || {}).titulo || x.roteiro, sai = (x.onde_saem || [])[0];
        return '<p class="vg-linha"><span>' + esc(titulo) + "</span><b>" + Number(x.concluiu || 0) + " de " + Number(x.comecou || 0) + " concluíram</b></p>"
          + '<p class="vazio">Ajudou: ' + Number(x.ajudou_sim || 0) + " sim, " + Number(x.ajudou_nao || 0) + " não." + (sai ? " Onde mais saem: passo \"" + esc(sai.passo) + "\" (" + Number(sai.n) + ")." : "") + "</p>";
      }).join("") : '<p class="vazio">Ninguém usou o guia ainda.</p>';
    } catch (e) { cx.innerHTML = '<p class="vazio">Não consegui ler o uso do guia agora.</p>'; }
  }
  const aj = $("vgAjustes"); if (aj) aj.addEventListener("toggle", function () { if (aj.open) resumoDeUso(); });

  /* voltar de onde parou: se havia um guia em andamento há menos de 12 horas, ele continua */
  try {
    const g = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (g && G.ROTEIROS[g.roteiro] && Date.now() - Number(g.em) < VALIDADE) { S.roteiro = g.roteiro; S.ok = g.ok || {}; iniciar(g.roteiro, true); }
  } catch (e) { /* nada guardado */ }

  window.WaGuiaTela = { iniciar: function (id) { iniciar(id, false); }, sair: function () { encerrar(); }, ativo: function () { return S.roteiro; }, passo: function () { return S.fim ? "fim" : S.ultimoId; } };
})();
