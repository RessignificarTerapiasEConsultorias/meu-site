/* CRM · casca da Fase B: menu lateral por grupos (computador), barra embaixo (celular), cabeçalho da tela e troca de tema.
   Só arruma a moldura: os botões das abas são os MESMOS de antes (mesmos cliques, mesma lógica do whatsapp.js). Não fala com o servidor. */
(function () {
  "use strict";
  var H = document.documentElement, abas = document.getElementById("abas");
  if (!H.classList.contains("crm") || !abas) return;
  var $ = function (id) { return document.getElementById(id); };
  function svg(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="crm-ic">' + d + "</svg>"; }
  var IC = {
    visao: svg('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    conversas: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
    funil: svg('<path d="M3 4h18l-7 8v7l-4-2v-5z"/>'),
    disparos: svg('<path d="M21 3L3 10l7 3 3 7z"/><path d="M10 13l5-5"/>'),
    templates: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
    inscricoes: svg('<circle cx="9" cy="8" r="4"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M19 7v6M16 10h6"/>'),
    email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    vendas: svg('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
    contatos: svg('<circle cx="9" cy="8" r="4"/><path d="M2 20c0-4 3-6 7-6s7 2 7 6M16 4a4 4 0 0 1 0 8M22 20c0-3-1.5-5-4-5.7"/>'),
    robo: svg('<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M9 13v2M15 13v2"/>'),
    automacoes: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    fluxos: svg('<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10M6 12h10"/>'),
    bloqueio: svg('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'),
    config: svg('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
    relogio: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    mais: svg('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
    busca: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>')
  };
  var GRUPOS = [
    ["Atender", ["visao", "conversas", "funil"]],
    ["Divulgar", ["disparos", "templates", "inscricoes", "email"]],
    ["Vender", ["vendas", "contatos"]],
    ["Automatizar", ["robo", "automacoes", "fluxos"]],
    ["Ajustes", ["bloqueio", "config"]]
  ];
  var TELAS = {
    visao: ["Hoje", "O que precisa de você e como está o mês."],
    conversas: ["Conversas", "Quem escreveu, quem espera resposta e o histórico de cada pessoa."],
    funil: ["Funil", "Em que etapa cada pessoa está, do primeiro contato à venda."],
    disparos: ["Disparos", "A mesma mensagem para várias pessoas, com conferência antes de enviar."],
    templates: ["Mensagens modelo", "As mensagens que a Meta aprova para você mandar a qualquer hora (templates)."],
    inscricoes: ["Inscrições", "Páginas para as pessoas entrarem na sua lista com autorização."],
    email: ["E-mail", "Modelos, campanhas e quem pode receber e-mail."],
    vendas: ["Vendas", "Quanto entrou, por onde, e quem começou e não pagou."],
    contatos: ["Contatos", "Todas as pessoas, listas e etiquetas."],
    robo: ["Robô", "Respostas automáticas por palavra. Fica quieto quando você assume a conversa."],
    automacoes: ["Automações", "Sequências que rodam sozinhas: quando acontece X, faça Y."],
    fluxos: ["Fluxos antigos", "Os fluxos do começo do CRM e a segurança das automações."],
    bloqueio: ["Não enviar", "Quem nunca deve receber mensagem automática."],
    config: ["Configuração", "Conexão com a Meta, limites, horários e preços."]
  };
  function rotulo(aba) { return (TELAS[aba] || [aba])[0]; }
  function grupoDe(aba) { for (var i = 0; i < GRUPOS.length; i++) if (GRUPOS[i][1].indexOf(aba) > -1) return GRUPOS[i][0]; return ""; }
  window.CrmIcone = function (nome) { return IC[nome] || ""; };

  /* ---------- menu lateral: os mesmos botões, agrupados ---------- */
  var botoes = {};
  Array.prototype.forEach.call(abas.querySelectorAll(".aba"), function (b) { botoes[b.dataset.aba] = b; });
  var marca = document.createElement("div"); marca.id = "crmMarca";
  marca.innerHTML = '<img src="img/logo.png" alt="" width="40" height="40"><div><b>Ressignificar</b><small>CRM</small></div><button type="button" id="crmFecharMenu" aria-label="Fechar o menu">×</button>';
  abas.appendChild(marca);
  GRUPOS.forEach(function (g) {
    var t = document.createElement("span"); t.className = "crm-grupo"; t.textContent = g[0]; abas.appendChild(t);
    g[1].forEach(function (aba) {
      var b = botoes[aba]; if (!b) return;
      /* troca só o texto do botão (o selo de não lidas e o ponto de novidade continuam dentro dele) */
      for (var n = b.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = rotulo(aba); break; }
      b.insertAdjacentHTML("afterbegin", IC[aba] || "");
      abas.appendChild(b); delete botoes[aba];
    });
  });
  Object.keys(botoes).forEach(function (k) { abas.appendChild(botoes[k]); });   // aba nova que ainda não tem grupo: fica no fim, nunca some

  var pe = document.createElement("div"); pe.id = "crmPe";
  pe.innerHTML = '<div id="crmAuto"><i></i><span>Automações ligadas</span></div><button type="button" class="crm-pe-btn" id="crmPausar">Pausar tudo</button>'
    + '<button type="button" class="crm-pe-btn" id="crmTema"></button><div id="crmConta"></div>';
  abas.appendChild(pe);
  var conta = $("crmConta"), usuario = document.querySelector(".topo-painel .usuario"), voltar = document.querySelector(".conteudo-painel > .voltar");
  if (voltar) { voltar.textContent = "Painel master"; conta.appendChild(voltar); voltar.classList.remove("voltar"); }
  if (usuario) while (usuario.firstChild) conta.appendChild(usuario.firstChild);

  /* ---------- cabeçalho da tela ---------- */
  var main = document.querySelector(".conteudo-painel");
  var cab = document.createElement("header"); cab.id = "crmCab";
  cab.innerHTML = '<div><small id="crmOlho"></small><h1 id="crmTitulo"></h1><p id="crmDesc"></p></div><div id="crmCabAcoes"><button type="button" id="crmBuscar" aria-label="Buscar uma conversa">' + IC.busca + "</button></div>";
  main.insertBefore(cab, main.firstChild);
  var st = $("selStatus"); if (st) $("crmCabAcoes").insertBefore(st, $("crmBuscar"));

  /* ---------- barra do celular ---------- */
  var barra = document.createElement("nav"); barra.id = "crmBarra"; barra.setAttribute("aria-label", "Atalhos");
  barra.innerHTML = ["visao", "conversas", "funil", "vendas"].map(function (a) {
    return '<button type="button" data-crm-ir="' + a + '">' + IC[a] + "<span>" + rotulo(a) + "</span>" + (a === "conversas" ? '<b class="crm-bd" id="crmBd" hidden></b>' : "") + "</button>";
  }).join("") + '<button type="button" id="crmMais" aria-haspopup="true">' + IC.mais + "<span>Mais</span></button>";
  document.body.appendChild(barra);
  function menu(aberto) { document.body.classList.toggle("crm-menu", !!aberto); }
  barra.addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.id === "crmMais") return menu(!document.body.classList.contains("crm-menu"));
    menu(false); var alvo = abas.querySelector('.aba[data-aba="' + b.dataset.crmIr + '"]'); if (alvo) alvo.click();
  });
  abas.addEventListener("click", function (ev) { if (ev.target.closest(".aba") || ev.target.closest("#crmFecharMenu")) menu(false); });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") menu(false); });
  $("crmBuscar").addEventListener("click", function () {
    var c = abas.querySelector('.aba[data-aba="conversas"]'); if (c) c.click();
    setTimeout(function () { var i = $("cvBusca"); if (i) i.focus(); }, 60);
  });

  /* ---------- "Precisa de você" vira o cartão de destaque da tela Hoje ---------- */
  var hoje = $("vgHoje");
  if (hoje && hoje.previousElementSibling && hoje.previousElementSibling.classList.contains("cp-tit")) {
    var caixa = document.createElement("div"); caixa.className = "crm-precisa";
    hoje.parentNode.insertBefore(caixa, hoje.previousElementSibling);
    caixa.appendChild(caixa.nextElementSibling); caixa.appendChild(hoje);
    /* ordem da tela Hoje: primeiro o que precisa de você, depois as tarefas, depois o período e os números */
    var tarefas = $("cgTarefasBox"), sec = document.querySelector('[data-painel="visao"]'), topo = sec && sec.querySelector(".empresa-titulo");
    if (tarefas) caixa.parentNode.insertBefore(tarefas, caixa.nextSibling);
    if (topo && tarefas) { topo.classList.add("crm-periodo"); tarefas.parentNode.insertBefore(topo, tarefas.nextSibling); }
  }

  /* ---------- manter a moldura em dia com a aba aberta ---------- */
  var DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function atualizar() {
    var b = abas.querySelector('.aba[aria-selected="true"]'), aba = b ? b.dataset.aba : "";
    if (!aba) return;
    var d = new Date(), celular = window.matchMedia("(max-width:1000px)").matches;
    $("crmOlho").textContent = aba === "visao" && celular ? DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()] : grupoDe(aba);
    $("crmTitulo").textContent = rotulo(aba);
    $("crmDesc").textContent = (TELAS[aba] || ["", ""])[1];
    Array.prototype.forEach.call(barra.querySelectorAll("[data-crm-ir]"), function (x) { if (x.dataset.crmIr === aba) x.setAttribute("aria-current", "page"); else x.removeAttribute("aria-current"); });
    if (["visao", "conversas", "funil", "vendas"].indexOf(aba) < 0) $("crmMais").setAttribute("aria-current", "page"); else $("crmMais").removeAttribute("aria-current");
    /* o título grande já diz o nome da tela: o primeiro título do cartão, quando é igual, fica só para leitor de tela */
    var sec = document.querySelector('[data-painel="' + aba + '"]'), h = sec && sec.querySelector(".cartao .empresa-titulo h2, .cartao > h2");
    if (h && !h.dataset.crmVisto) { h.dataset.crmVisto = "1"; var t = h.textContent.trim().toLowerCase(); if (t === rotulo(aba).toLowerCase() || t === "visão geral" || (aba === "templates" && t === "templates")) h.classList.add("crm-oculto"); }
  }
  new MutationObserver(atualizar).observe(abas, { attributes: true, subtree: true, attributeFilter: ["aria-selected"] });
  window.addEventListener("resize", atualizar);
  atualizar();

  /* não lidas na barra do celular: espelha o selo que o CRM já calcula */
  var bd = $("bdNaoLidas"), bd2 = $("crmBd");
  function espelharBd() { if (!bd || !bd2) return; bd2.hidden = bd.hidden || !bd.textContent.trim(); bd2.textContent = bd.textContent; }
  if (bd) { new MutationObserver(espelharBd).observe(bd, { attributes: true, childList: true, characterData: true, subtree: true }); espelharBd(); }

  /* automações: o estado vem do aviso que o CRM já mostra; o botão usa o mesmo caminho (com a mesma confirmação) */
  var selo = $("auSelo"), auto = $("crmAuto");
  function estadoAuto() {
    var pausadas = !!selo && !selo.hidden;
    auto.classList.toggle("pausadas", pausadas); auto.querySelector("span").textContent = pausadas ? "Automações pausadas" : "Automações ligadas";
    $("crmPausar").textContent = pausadas ? "Religar automações" : "Pausar tudo";
  }
  if (selo) { new MutationObserver(estadoAuto).observe(selo, { attributes: true, attributeFilter: ["hidden"] }); }
  estadoAuto();
  $("crmPausar").addEventListener("click", function () { var b = $("auPausar2") || $("auPausar"); if (b) b.click(); });

  /* ---------- tema: Dia ou Noite, lembrado neste aparelho ---------- */
  function tema() { return H.classList.contains("noite") ? "noite" : "dia"; }
  function pintarTema() { $("crmTema").textContent = tema() === "noite" ? "Tema: Noite · mudar para Dia" : "Tema: Dia · mudar para Noite"; }
  $("crmTema").addEventListener("click", function () {
    var novo = tema() === "noite" ? "dia" : "noite";
    H.classList.remove("dia", "noite"); H.classList.add(novo);
    try { localStorage.setItem("crm_tema", novo); } catch (e) { /* sem armazenamento: vale até fechar */ }
    pintarTema();
  });
  pintarTema();
})();
