/* E-mail (Fase 8, itens 8.3 a 8.8): tela de configuração, modelos, campanhas, painel da campanha e envio individual.
   Usa as utilidades do painel (window.WaPainel, definidas em whatsapp.js) e as funções puras de whatsapp-email.js.
   Nada aqui envia e-mail sozinho: quem envia é a função de servidor crm-email, e quem decide cada envio é o portão do banco. */
(function () {
  "use strict";
  const P = window.WaPainel, WE = window.WaEmail;
  if (!P || !WE) return;
  const $ = P.$, esc = P.esc, ler = P.ler, supa = P.supa, aviso = P.aviso, falha = P.falha, horaCurta = P.horaCurta;
  const EXEMPLO = { nome: "Maria Silva", email: "maria@exemplo.com", produto: "Teste de Travas Mentais", link_do_pedido: "https://ressignificarterapiaseconsultorias.com" };
  const em = { sub: "visao", cfg: null, modelos: [], campanhas: [], modeloId: null, painelId: null, pessoas: [], painelNome: "", conferido: null, envio: null, visao: null, ocupado: false };

  function rpc(nome, args) { return ler(supa().rpc(nome, args || {})); }
  async function servidor(corpo) {
    const { data, error } = await supa().functions.invoke("crm-email", { body: corpo });
    if (error) {
      let msg = "Não foi possível falar com o servidor. Nada foi enviado.";
      try { const j = await error.context.json(); if (j && j.erro) msg = j.erro; } catch (e) { /* fica a mensagem padrão */ }
      return { ok: false, erro: msg };
    }
    return data || { ok: false, erro: "Resposta vazia do servidor." };
  }
  function tipoCurto(t) { return t === "transacional" ? "Transacional" : "Marketing"; }
  function pct(parte, todo) { return todo > 0 ? String(Math.round((parte / todo) * 1000) / 10).replace(".", ",") + "%" : "—"; }
  function cfgPrevia(tipo) {
    const c = em.cfg || {};
    return { tipo: tipo, rodape_texto: c.rodape_texto, rodape_motivo: c.rodape_motivo, site_url: c.site_url, link_sair: "#" };
  }
  /* a prévia usa o mesmo montador do servidor; o iframe não roda scripts */
  function mostrarPrevia(iframe, conteudo, tipo, dados) {
    const r = WE.montar(conteudo, dados || EXEMPLO, cfgPrevia(tipo));
    iframe.srcdoc = r.html;
    return r;
  }
  async function garantirBase() {
    if (!em.cfg) em.cfg = await rpc("crm_email_config_ler");
    if (!em.modelos.length) em.modelos = (await rpc("crm_email_modelos", { p_arquivados: false })) || [];
  }
  function abertos() { return document.querySelector("dialog[open]"); }

  /* ---------- sub-abas ---------- */
  function abrirSub(nome) {
    em.sub = nome;
    document.querySelectorAll("#emSub [data-em-sub]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.emSub === nome ? "true" : "false"); });
    document.querySelectorAll("[data-em-painel]").forEach(function (p) { p.hidden = p.dataset.emPainel !== nome; });
    const f = { modelos: telaModelos, campanhas: telaCampanhas, config: telaConfig }[nome];
    if (f) f().catch(function (e) { falha(e, "Não consegui carregar esta parte."); });
  }
  $("emSub").addEventListener("click", function (ev) { const b = ev.target.closest("[data-em-sub]"); if (b) abrirSub(b.dataset.emSub); });
  $("emAtualizar").addEventListener("click", function () {
    const f = { modelos: telaModelos, campanhas: telaCampanhas, config: telaConfig }[em.sub];
    if (f) f().catch(function (e) { falha(e, "Não consegui atualizar."); });
  });

  /* ---------- visão: saúde dos envios e o que falta configurar (os dados vêm da leitura que o whatsapp.js já faz) ---------- */
  function visao(p) {
    em.visao = p || {};
    const pend = em.visao.pendencias || [], s = em.visao.saude || {};
    $("emNPend").textContent = pend.length ? String(pend.length) : "";
    let topo = pend.length ? "<b>Campanhas bloqueadas até configurar.</b> " + pend.map(esc).join(" ") : "";
    if (em.visao.resend_recusou_em && Date.now() - new Date(em.visao.resend_recusou_em).getTime() < 24 * 3600e3) {
      topo += (topo ? "<br>" : "") + "O Resend recusou um envio em " + esc(horaCurta(em.visao.resend_recusou_em)) + ": " + esc(em.visao.resend_recusou_msg || "sem detalhe") + ".";
    }
    $("emPend").hidden = !topo; $("emPend").innerHTML = topo;
    const cores = { verde: "Verde: tudo dentro do esperado.", amarelo: "Amarelo: atenção, perto do limite.", vermelho: "Vermelho: acima do limite. As campanhas param sozinhas nesse nível." };
    $("emSaude").innerHTML = (s.cor === "cinza" || !s.cor ? "Ainda não houve envios pelo CRM."
      : "<b>" + esc(cores[s.cor] || "") + "</b> " + Number(s.enviados) + " enviados, " + Number(s.bounces) + " voltaram (" + esc(String(s.bounce_pct).replace(".", ",")) + "%; limite " + esc(String(s.limite_bounce).replace(".", ",")) + "%), "
        + Number(s.reclamacoes) + " marcados como spam (" + esc(String(s.reclamacao_pct).replace(".", ",")) + "%; limite " + esc(String(s.limite_reclamacao).replace(".", ",")) + "%).")
      + (em.visao.aquecendo ? " Teto das campanhas hoje: " + Number(em.visao.teto_hoje) + " e-mails (aquecendo: sobe a cada dia de envio)." : "");
  }

  /* ---------- configuração ---------- */
  async function telaConfig() {
    const c = em.cfg = await rpc("crm_email_config_ler"), w = c.webhook || {};
    $("emCfgNome").value = c.remetente_nome || ""; $("emCfgLocal").value = c.remetente_local || ""; $("emCfgResp").value = c.responder_para || "";
    $("emCfgRodape").value = c.rodape_texto || ""; $("emCfgMotivo").value = c.rodape_motivo || "";
    $("emCfgDia").value = c.limite_dia; $("emCfgMes").value = c.limite_mes; $("emCfgAquec").value = c.aquecimento_teto;
    $("emCfgBounce").value = c.pausa_bounce_pct; $("emCfgRecl").value = c.pausa_reclamacao_pct; $("emCfgHi").value = c.hora_inicio; $("emCfgHf").value = c.hora_fim;
    $("emCfgUrl").value = (typeof SUPABASE_URL === "string" ? SUPABASE_URL : "") + "/functions/v1/crm-email-eventos";
    const item = function (feito, sim, nao) { return '<li class="' + (feito ? "feito" : "") + '">' + (feito ? "Feito: " : "Falta: ") + esc(feito ? sim : nao) + "</li>"; };
    $("emCfgPend").innerHTML =
      item(!!c.chave_resend_ok, "a chave do Resend está guardada no banco.", "a chave do Resend não está no banco. Sem ela, nenhum e-mail sai.")
      + item(!!(c.rodape_texto || "").trim(), "rodapé com o nome e o endereço de contato.", "preencher o rodapé (nome e endereço de contato). Obrigatório em e-mail de novidades.")
      + item(!!w.segredo_salvo, "segredo do webhook guardado" + (w.salvo_em ? " em " + horaCurta(w.salvo_em) : "") + ".", "colar o segredo do webhook do Resend (mais abaixo).")
      + item(!!w.ultimo_evento_em, "o Resend já avisou o CRM (último aviso: " + horaCurta(w.ultimo_evento_em) + ").", "receber o primeiro aviso do Resend. Depois de guardar o segredo, envie um e-mail de teste.");
    $("emCfgWebhook").textContent = w.segredo_salvo
      ? (w.ultimo_evento_em ? "Webhook confirmado. Avisos nos últimos 7 dias: " + Number(w.eventos_7d) + "." : "Segredo guardado. Ainda não chegou nenhum aviso: envie um teste pela aba Modelos e volte aqui.")
      : "Nenhum segredo guardado ainda.";
    $("emNPend").textContent = (c.pendencias_marketing || []).length ? String(c.pendencias_marketing.length) : "";
  }
  $("emCfgSalvar").addEventListener("click", async function () {
    try {
      const r = await rpc("crm_email_config_salvar", { p: { remetente_nome: $("emCfgNome").value, remetente_local: $("emCfgLocal").value, responder_para: $("emCfgResp").value,
        rodape_texto: $("emCfgRodape").value, rodape_motivo: $("emCfgMotivo").value, limite_dia: $("emCfgDia").value, limite_mes: $("emCfgMes").value, aquecimento_teto: $("emCfgAquec").value,
        pausa_bounce_pct: String($("emCfgBounce").value).replace(",", "."), pausa_reclamacao_pct: String($("emCfgRecl").value).replace(",", "."), hora_inicio: $("emCfgHi").value, hora_fim: $("emCfgHf").value } });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui salvar.", true);
      aviso("Configuração salva."); await telaConfig(); P.recarregarVisao().catch(function () {});
    } catch (e) { falha(e, "Não consegui salvar a configuração."); }
  });
  $("emCfgSegredoSalvar").addEventListener("click", async function () {
    const v = $("emCfgSegredo").value.trim();
    if (!v) return aviso("Cole o segredo que o Resend mostrou (começa com whsec_).", true);
    try {
      const r = await rpc("crm_email_webhook_salvar", { p_segredo: v });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui guardar o segredo.", true);
      $("emCfgSegredo").value = ""; aviso("Segredo guardado. Agora envie um e-mail de teste para confirmar."); await telaConfig(); P.recarregarVisao().catch(function () {});
    } catch (e) { falha(e, "Não consegui guardar o segredo."); }
  });
  $("emCfgUrlCopiar").addEventListener("click", function () {
    const t = $("emCfgUrl").value;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { aviso("Endereço copiado."); }, function () { $("emCfgUrl").select(); aviso("Selecione e copie o endereço.", true); });
    else { $("emCfgUrl").select(); aviso("Selecione e copie o endereço."); }
  });

  /* ---------- modelos ---------- */
  async function telaModelos() {
    const todos = (await rpc("crm_email_modelos", { p_arquivados: $("emModArq").checked })) || [];
    em.modelos = todos.filter(function (m) { return !m.arquivado; });
    $("emModLista").innerHTML = todos.length ? todos.map(function (m) {
      return "<tr><td><b>" + esc(m.nome) + "</b>" + (m.arquivado ? ' <small class="vd-aviso">arquivado</small>' : "") + "</td><td>" + esc(tipoCurto(m.tipo)) + "</td><td>" + esc(m.assunto) + "</td><td>" + esc(horaCurta(m.atualizado_em)) + "</td>"
        + '<td><div class="acoes" style="margin:0"><button class="btn peq" type="button" data-em-mod="editar" data-id="' + esc(m.id) + '">Abrir</button><button class="btn peq contorno" type="button" data-em-mod="duplicar" data-id="' + esc(m.id) + '">Duplicar</button>'
        + '<button class="btn peq contorno" type="button" data-em-mod="' + (m.arquivado ? "desarquivar" : "arquivar") + '" data-id="' + esc(m.id) + '">' + (m.arquivado ? "Desarquivar" : "Arquivar") + "</button></div></td></tr>";
    }).join("") : '<tr><td colspan="5" class="vazio">Nenhum modelo.</td></tr>';
    em.todosModelos = todos;
  }
  $("emModArq").addEventListener("change", function () { telaModelos().catch(function (e) { falha(e); }); });
  $("emModNovo").addEventListener("click", function () { garantirBase().then(function () { abrirModelo(null); }, function (e) { falha(e); }); });
  $("emModLista").addEventListener("click", async function (ev) {
    const b = ev.target.closest("[data-em-mod]"); if (!b) return;
    const id = b.dataset.id, acao = b.dataset.emMod;
    try {
      if (acao === "editar") { await garantirBase(); return abrirModelo((em.todosModelos || []).filter(function (m) { return m.id === id; })[0]); }
      const r = await rpc("crm_email_modelo_acao", { p_id: id, p_acao: acao });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não deu certo.", true);
      aviso(acao === "duplicar" ? "Cópia criada." : acao === "arquivar" ? "Modelo arquivado." : "Modelo de volta à lista.");
      await telaModelos();
    } catch (e) { falha(e, "Não deu certo."); }
  });
  function abrirModelo(m) {
    em.modeloId = m ? m.id : null;
    $("emMTitulo").textContent = m ? "Modelo: " + m.nome : "Novo modelo de e-mail";
    $("emMNome").value = m ? m.nome : ""; $("emMTipo").value = m ? m.tipo : "marketing"; $("emMAssunto").value = m ? m.assunto : "";
    $("emMPre").value = m ? (m.pre_cabecalho || "") : ""; $("emMCorpo").value = m ? m.corpo : "Olá, {primeiro_nome}!\n\n";
    $("emMRestaurar").hidden = !(m && m.tem_versao_anterior);
    atualizarPrevia();
    if (!$("jEmailModelo").open) $("jEmailModelo").showModal();
  }
  function conteudoDoEditor() { return { assunto: $("emMAssunto").value, pre_cabecalho: $("emMPre").value, corpo: $("emMCorpo").value }; }
  function atualizarPrevia() {
    const c = conteudoDoEditor(), tipo = $("emMTipo").value, r = mostrarPrevia($("emMPrev"), c, tipo);
    $("emMConta").textContent = "(" + c.assunto.trim().length + " letras; até 60 aparece inteiro no celular)";
    $("emMPrevAssunto").textContent = r.assunto ? "Assunto: " + r.assunto : "";
    const av = WE.qualidade(c, tipo).concat(r.avisos);
    $("emMAvisos").innerHTML = av.length ? av.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") : '<li class="ok">Nenhum aviso de qualidade.</li>';
  }
  let previaT = null;
  ["emMNome", "emMTipo", "emMAssunto", "emMPre", "emMCorpo"].forEach(function (id) {
    $(id).addEventListener("input", function () { clearTimeout(previaT); previaT = setTimeout(atualizarPrevia, 200); });
    $(id).addEventListener("change", atualizarPrevia);
  });
  /* botões que inserem a marcação no ponto do cursor (sem HTML livre) */
  $("emMBarra").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-em-ins]"); if (!b) return;
    const t = $("emMCorpo"), ini = t.selectionStart, fim = t.selectionEnd, sel = t.value.slice(ini, fim);
    const novo = { negrito: "**" + (sel || "texto em negrito") + "**", italico: "*" + (sel || "texto em itálico") + "*", link: "[" + (sel || "texto do link") + "](https://)",
      botao: "\n\n[[" + (sel || "Texto do botão") + "|https://]]\n\n", imagem: "\n\n![descrição da imagem](https://)\n\n", nome: "{primeiro_nome}" }[b.dataset.emIns];
    t.value = t.value.slice(0, ini) + novo + t.value.slice(fim);
    t.focus(); t.selectionStart = t.selectionEnd = ini + novo.length;
    atualizarPrevia();
  });
  function modoPrevia(celular) {
    $("emMPrevBox").classList.toggle("cel", celular);
    $("emMPrevDesk").setAttribute("aria-pressed", celular ? "false" : "true"); $("emMPrevCel").setAttribute("aria-pressed", celular ? "true" : "false");
  }
  $("emMPrevDesk").addEventListener("click", function () { modoPrevia(false); });
  $("emMPrevCel").addEventListener("click", function () { modoPrevia(true); });
  async function salvarModelo() {
    const r = await rpc("crm_email_modelo_salvar", { p_id: em.modeloId, p_nome: $("emMNome").value, p_tipo: $("emMTipo").value, p_assunto: $("emMAssunto").value, p_pre: $("emMPre").value, p_corpo: $("emMCorpo").value });
    if (!r || !r.ok) { aviso((r && r.erro) || "Não consegui salvar o modelo.", true); return null; }
    em.modeloId = r.id;
    await telaModelos();
    const m = (em.todosModelos || []).filter(function (x) { return x.id === r.id; })[0];
    $("emMRestaurar").hidden = !(m && m.tem_versao_anterior);
    if (m) $("emMTitulo").textContent = "Modelo: " + m.nome;
    return r.id;
  }
  $("emMSalvar").addEventListener("click", function () { salvarModelo().then(function (id) { if (id) aviso("Modelo salvo."); }, function (e) { falha(e, "Não consegui salvar o modelo."); }); });
  $("emMTeste").addEventListener("click", async function () {
    if (em.ocupado) return;
    try {
      const id = await salvarModelo(); if (!id) return;
      if (!confirm("Enviar um teste deste modelo para o e-mail do seu login?\n\nO assunto sai marcado com [TESTE]. O teste conta no limite do dia.")) return;
      em.ocupado = true; $("emMTeste").disabled = true;
      const r = await servidor({ acao: "teste", modelo_id: id });
      aviso(r.ok ? "Teste enviado para " + r.para + ". Confira a caixa de entrada e também o spam." : (r.erro || "O teste não saiu."), !r.ok);
    } catch (e) { falha(e, "Não consegui enviar o teste."); }
    finally { em.ocupado = false; $("emMTeste").disabled = false; }
  });
  $("emMRestaurar").addEventListener("click", async function () {
    if (!em.modeloId || !confirm("Voltar este modelo para a versão anterior?\n\nA versão de agora fica guardada no lugar dela.")) return;
    try {
      const r = await rpc("crm_email_modelo_acao", { p_id: em.modeloId, p_acao: "restaurar" });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui voltar a versão.", true);
      await telaModelos();
      abrirModelo((em.todosModelos || []).filter(function (m) { return m.id === em.modeloId; })[0]);
      aviso("Versão anterior de volta.");
    } catch (e) { falha(e, "Não consegui voltar a versão."); }
  });

  /* ---------- campanhas ---------- */
  function numerosDe(c) { return c.numeros || {}; }
  async function telaCampanhas() {
    await garantirBase();
    em.campanhas = (await rpc("crm_email_campanhas")) || [];
    const v = em.visao;
    $("emCampTeto").textContent = v ? "Uso de hoje: " + WE.usoTexto(v.usados_hoje, v.limite_dia) + (v.aquecendo ? " · teto das campanhas hoje: " + v.teto_hoje + " (aquecendo)" : "") : "";
    $("emCampLista").innerHTML = em.campanhas.length ? em.campanhas.map(function (c) {
      const n = numerosDe(c), bt = function (acao, rotulo, classe) { return '<button class="btn peq ' + (classe || "contorno") + '" type="button" data-em-camp="' + acao + '" data-id="' + esc(c.id) + '">' + rotulo + "</button>"; };
      let sit = esc(WE.rotuloCampanha(c.status));
      if (c.status === "agendada" && c.agendada_para) sit += "<br><small>para " + esc(horaCurta(c.agendada_para)) + "</small>";
      if (c.status === "pausada" && c.pausa_motivo) sit += '<br><small class="vd-aviso">' + esc(c.pausa_automatica ? "Parou sozinha: " : "") + esc(c.pausa_motivo) + "</small>";
      const botoes = bt("painel", "Painel", "")
        + (c.status === "rascunho" ? bt("iniciar", "Enviar agora") : "")
        + (c.status === "enviando" || c.status === "agendada" ? bt("pausar", "Pausar") : "")
        + (c.status === "pausada" ? bt("retomar", "Continuar") : "")
        + (c.status !== "concluida" && c.status !== "cancelada" ? bt("cancelar", "Cancelar") : "");
      return "<tr><td><b>" + esc(c.nome) + "</b><br><small>" + esc(tipoCurto(c.tipo)) + (c.modelo ? " · " + esc(c.modelo) : "") + "</small></td><td>" + esc(WE.rotuloPublico(c.publico)) + "</td><td>" + sit + "</td>"
        + "<td>" + Number(n.enviados || 0) + " de " + Number(n.total || 0) + "</td><td>" + Number(n.entregues || 0) + "</td><td>" + Number(n.bounces || 0) + (n.reclamacoes ? " · " + Number(n.reclamacoes) + " spam" : "") + "</td><td>" + Number(n.clicaram || 0) + "</td>"
        + '<td><div class="acoes" style="margin:0">' + botoes + "</div></td></tr>";
    }).join("") : '<tr><td colspan="8" class="vazio">Nenhuma campanha ainda.</td></tr>';
  }
  function textoPendencias(r) { return (r && r.erro ? r.erro : "Não deu certo.") + ((r && r.pendencias || []).length ? " " + r.pendencias.join(" ") : ""); }
  async function acaoCampanha(id, acao) {
    const c = em.campanhas.filter(function (x) { return x.id === id; })[0] || { nome: em.painelNome };
    if (acao === "painel") return abrirPainel(id);
    let r;
    if (acao === "iniciar") {
      if (!confirm("Enviar agora a campanha \"" + c.nome + "\"?\n\nO público é conferido de novo neste momento. Quem saiu, não autorizou ou está em Não enviar fica de fora.")) return;
      r = await rpc("crm_email_campanha_iniciar", { p_id: id, p_agendada_para: null });
      if (!r || !r.ok) return aviso(textoPendencias(r), true);
      aviso("Campanha iniciada para " + r.vao_receber + (r.vao_receber === 1 ? " pessoa." : " pessoas."));
    } else if (acao === "pausar") {
      r = await rpc("crm_email_campanha_acao", { p_id: id, p_acao: "pausar", p_confirmar: false });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui pausar.", true);
      aviso("Campanha pausada. Os que já saíram não voltam.");
    } else if (acao === "retomar") {
      r = await rpc("crm_email_campanha_acao", { p_id: id, p_acao: "retomar", p_confirmar: false });
      if (r && r.precisa_confirmar) {
        if (!confirm(r.erro + "\n\nContinuar pode piorar a entrega dos próximos e-mails.")) return;
        r = await rpc("crm_email_campanha_acao", { p_id: id, p_acao: "retomar", p_confirmar: true });
      }
      if (!r || !r.ok) return aviso(textoPendencias(r), true);
      aviso("Campanha continuando.");
    } else if (acao === "cancelar") {
      if (!confirm("Cancelar a campanha \"" + c.nome + "\"?\n\nQuem ainda está na fila não recebe. Os e-mails que já saíram não voltam.")) return;
      r = await rpc("crm_email_campanha_acao", { p_id: id, p_acao: "cancelar", p_confirmar: false });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui cancelar.", true);
      aviso("Campanha cancelada." + (r.cancelados ? " " + r.cancelados + " da fila não vão receber." : ""));
    }
    await telaCampanhas();
    if ($("jEmailPainel").open && em.painelId === id) await carregarPainel();
  }
  $("emCampLista").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-em-camp]"); if (!b) return;
    acaoCampanha(b.dataset.id, b.dataset.emCamp).catch(function (e) { falha(e, "Não deu certo."); });
  });

  /* nova campanha */
  function modeloEscolhido() { const id = $("emCModelo").value; return em.modelos.filter(function (m) { return m.id === id; })[0] || null; }
  function publicoEscolhido() {
    const t = $("emCPublico").value;
    return { tipo: t, valor: t === "etiqueta" ? $("emCValor").value.trim() : t === "etapa" ? $("emCEtapa").value : null };
  }
  function limparConferencia() {
    em.conferido = null; $("emCResumo").innerHTML = ""; $("emCIniciar").disabled = true;
    $("emCIniciar").textContent = $("emCQuando").value ? "Agendar" : "Enviar agora";
  }
  function atualizarPublicos() {
    const m = modeloEscolhido(), ant = $("emCPublico").value;
    const op = !m ? [] : m.tipo === "transacional"
      ? [["abandonados", "Quem pediu e não pagou"], ["etiqueta", "Uma etiqueta"]]
      : [["aceitaram", "Todos que autorizaram e-mail"], ["etiqueta", "Uma etiqueta"], ["etapa", "Uma etapa do funil"]];
    $("emCPublico").innerHTML = op.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("");
    if (op.some(function (o) { return o[0] === ant; })) $("emCPublico").value = ant;
    atualizarValor();
  }
  function atualizarValor() {
    const t = $("emCPublico").value;
    $("emCValorBox").hidden = !(t === "etiqueta" || t === "etapa");
    $("emCValor").hidden = t !== "etiqueta"; $("emCEtapa").hidden = t !== "etapa";
    $("emCValorRot").textContent = t === "etapa" ? "Etapa" : "Etiqueta";
    limparConferencia();
  }
  $("emCampNova").addEventListener("click", async function () {
    try {
      await garantirBase();
      if (!em.modelos.length) return aviso("Crie um modelo de e-mail primeiro (aba Modelos).", true);
      $("emCNome").value = ""; $("emCQuando").value = ""; $("emCValor").value = "";
      $("emCModelo").innerHTML = em.modelos.map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.nome) + " (" + esc(tipoCurto(m.tipo)) + ")</option>"; }).join("");
      $("emCValorLista").innerHTML = P.etiquetas().map(function (e) { return '<option value="' + esc(e) + '">'; }).join("");
      $("emCEtapa").innerHTML = (P.etapas || []).map(function (e) { return '<option value="' + esc(e[0]) + '">' + esc(e[1]) + "</option>"; }).join("");
      atualizarPublicos();
      if (!$("jEmailCampanha").open) $("jEmailCampanha").showModal();
    } catch (e) { falha(e, "Não consegui abrir a campanha."); }
  });
  $("emCModelo").addEventListener("change", atualizarPublicos);
  $("emCPublico").addEventListener("change", atualizarValor);
  ["emCValor", "emCEtapa", "emCQuando"].forEach(function (id) { $(id).addEventListener("input", limparConferencia); $(id).addEventListener("change", limparConferencia); });
  $("emCConferir").addEventListener("click", async function () {
    const m = modeloEscolhido(), pub = publicoEscolhido();
    if (!m) return aviso("Escolha um modelo.", true);
    try {
      const r = await rpc("crm_email_campanha_conferir", { p_publico: pub, p_tipo: m.tipo });
      if (!r || !r.ok) { limparConferencia(); return aviso((r && r.erro) || "Não consegui conferir.", true); }
      const fora = [[r.sem_aceite, "sem autorização para novidades"], [r.sairam, "pediram para sair"], [r.erro_entrega, "com erro de entrega ou reclamação"], [r.nao_enviar, "em lista de Não enviar"], [r.duplicados, "repetidos (um e-mail conta uma vez)"], [r.invalidos, "com e-mail inválido"]]
        .filter(function (x) { return Number(x[0]) > 0; }).map(function (x) { return "<li>" + Number(x[0]) + " " + esc(x[1]) + "</li>"; }).join("");
      const plano = WE.planoTexto(WE.planoDeDias(r.vao_receber, { tipo: m.tipo, limiteDia: r.limite_dia, usadosHoje: r.usados_hoje, base: r.aquecimento_base, diasJa: r.dias_ja, mktHoje: r.mkt_hoje }));
      const pend = r.pendencias || [];
      $("emCResumo").innerHTML = '<div class="vd-bloco" style="margin-top:8px"><p><b id="emCVao">' + Number(r.vao_receber) + "</b> de " + Number(r.com_email) + " com e-mail vão receber.</p>"
        + (fora ? '<p class="ajuda" style="margin:6px 0 0">Ficam de fora:</p><ul class="em-lista" id="emCFora">' + fora + "</ul>" : "")
        + (Number(r.vao_receber) > 0 ? '<p class="ajuda" id="emCPlano">' + esc(plano) + " Uso de hoje: " + esc(WE.usoTexto(r.usados_hoje, r.limite_dia)) + "."
            + (m.tipo === "marketing" && r.teto_hoje < r.limite_dia ? " Teto de hoje: " + Number(r.teto_hoje) + " (aquecendo)." : "") + " Envia só das " + Number(r.hora_inicio) + "h às " + Number(r.hora_fim) + "h.</p>" : "")
        + (m.tipo === "transacional" && pub.tipo === "etiqueta" ? '<p class="vd-aviso">E-mail transacional vai também para quem não autorizou novidades. Use só para avisar de algo que essas pessoas contrataram (aula, acesso, pedido).</p>' : "")
        + (pend.length ? '<p class="vd-aviso" id="emCPend"><b>Falta configurar antes de enviar:</b> ' + pend.map(esc).join(" ") + "</p>" : "") + "</div>";
      em.conferido = { publico: pub, tipo: m.tipo, modelo: m.id, vao: Number(r.vao_receber) };
      $("emCIniciar").disabled = !(Number(r.vao_receber) > 0 && !pend.length);
    } catch (e) { falha(e, "Não consegui conferir."); }
  });
  $("emCIniciar").addEventListener("click", async function () {
    const cf = em.conferido, nome = $("emCNome").value.trim(), quandoTxt = $("emCQuando").value;
    if (!cf) return aviso("Confira quem vai receber antes de enviar.", true);
    if (!nome) return aviso("Dê um nome à campanha.", true);
    let quando = null;
    if (quandoTxt) {
      const d = new Date(quandoTxt);
      if (isNaN(d.getTime()) || d.getTime() < Date.now() + 60000) return aviso("Escolha um horário no futuro, ou deixe vazio para enviar agora.", true);
      quando = d.toISOString();
    }
    if (!confirm((quando ? "Agendar" : "Enviar agora") + " a campanha \"" + nome + "\" para " + cf.vao + (cf.vao === 1 ? " pessoa" : " pessoas") + "?\n\n" + (quando ? "Ela começa no horário escolhido." : "Os e-mails começam a sair em até 2 minutos.") + " Você pode pausar ou cancelar pelo painel.")) return;
    if (em.ocupado) return;
    em.ocupado = true; $("emCIniciar").disabled = true;
    try {
      const r1 = await rpc("crm_email_campanha_criar", { p_nome: nome, p_modelo: cf.modelo, p_publico: cf.publico });
      if (!r1 || !r1.ok) { $("emCIniciar").disabled = false; return aviso((r1 && r1.erro) || "Não consegui criar a campanha.", true); }
      const r2 = await rpc("crm_email_campanha_iniciar", { p_id: r1.id, p_agendada_para: quando });
      $("jEmailCampanha").close();
      if (!r2 || !r2.ok) aviso("A campanha ficou como rascunho. " + textoPendencias(r2), true);
      else aviso(r2.status === "agendada" ? "Campanha agendada para " + r2.vao_receber + (r2.vao_receber === 1 ? " pessoa." : " pessoas.") : "Campanha iniciada para " + r2.vao_receber + (r2.vao_receber === 1 ? " pessoa." : " pessoas."));
      await telaCampanhas();
    } catch (e) { falha(e, "Não consegui iniciar a campanha."); }
    finally { em.ocupado = false; }
  });

  /* painel da campanha */
  async function abrirPainel(id) {
    em.painelId = id; $("emPFiltro").value = "todos"; $("emPBusca").value = "";
    if (!$("jEmailPainel").open) $("jEmailPainel").showModal();
    await carregarPainel();
  }
  async function carregarPainel() {
    const id = em.painelId;
    const d = await rpc("crm_email_campanha_painel", { p_id: id, p_filtro: $("emPFiltro").value, p_busca: $("emPBusca").value.trim() || null, p_limite: 500 });
    if (id !== em.painelId) return;
    if (!d || !d.campanha) { $("emPInfo").textContent = "Campanha não encontrada."; return; }
    const c = d.campanha, n = d.numeros || {}; em.pessoas = d.pessoas || []; em.painelNome = c.nome;
    $("emPTitulo").textContent = c.nome;
    $("emPInfo").textContent = tipoCurto(c.tipo) + " · " + WE.rotuloPublico(c.publico) + " · " + WE.rotuloCampanha(c.status)
      + (c.status === "agendada" && c.agendada_para ? " para " + horaCurta(c.agendada_para) : "") + (c.status === "pausada" && c.pausa_motivo ? " (" + (c.pausa_automatica ? "parou sozinha: " : "") + c.pausa_motivo + ")" : "") + " · Assunto: " + c.assunto;
    const card = function (t, v, sub) { return '<div class="vd-card"><small>' + esc(t) + "</small><b>" + esc(String(v)) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>"; };
    $("emPNumeros").innerHTML = card("Enviados", Number(n.enviados || 0), "de " + Number(n.total || 0)) + card("Na fila", Number(n.pendentes || 0)) + card("Entregues", Number(n.entregues || 0), pct(n.entregues, n.enviados) + " dos enviados")
      + card("Voltaram", Number(n.bounces || 0), pct(n.bounces, n.enviados)) + card("Marcaram como spam", Number(n.reclamacoes || 0), pct(n.reclamacoes, n.enviados)) + card("Clicaram", Number(n.clicaram || 0), pct(n.clicaram, n.entregues) + " dos entregues")
      + card("Saíram por esta campanha", Number(n.saidas || 0)) + card("Ficaram de fora", Number(n.pulados || 0) + Number(n.cancelados || 0)) + card("Falharam", Number(n.falhas || 0));
    $("emPConfere").textContent = !Number(n.enviados) ? "" : d.confere && d.confere.ok ? "Conferido: os números batem com os avisos recebidos do Resend." : "Atenção: os números não batem com os avisos recebidos do Resend. Pode haver avisos atrasados; atualize em alguns minutos.";
    $("emPPausar").hidden = !(c.status === "enviando" || c.status === "agendada"); $("emPRetomar").hidden = c.status !== "pausada"; $("emPCancelar").hidden = c.status === "concluida" || c.status === "cancelada";
    $("emPPessoas").innerHTML = em.pessoas.length ? em.pessoas.map(function (p) {
      return "<tr><td><b>" + esc(p.nome || p.email) + "</b>" + (p.nome ? "<br><small>" + esc(p.email) + "</small>" : "") + "</td><td>" + esc(WE.rotuloEnvio(p.status)) + (p.saiu ? ' <small class="vd-aviso">· saiu da lista</small>' : "") + "</td>"
        + "<td>" + esc(p.detalhe || "") + "</td><td>" + (p.clicou_em ? esc(horaCurta(p.clicou_em)) + (p.ultimo_link ? "<br><small>" + esc(p.ultimo_link) + "</small>" : "") : "") + "</td></tr>";
    }).join("") : '<tr><td colspan="4" class="vazio">Ninguém com esse filtro.</td></tr>';
  }
  $("emPFiltro").addEventListener("change", function () { carregarPainel().catch(function (e) { falha(e); }); });
  let buscaT = null;
  $("emPBusca").addEventListener("input", function () { clearTimeout(buscaT); buscaT = setTimeout(function () { carregarPainel().catch(function (e) { falha(e); }); }, 350); });
  $("emPPausar").addEventListener("click", function () { acaoCampanha(em.painelId, "pausar").catch(function (e) { falha(e); }); });
  $("emPRetomar").addEventListener("click", function () { acaoCampanha(em.painelId, "retomar").catch(function (e) { falha(e); }); });
  $("emPCancelar").addEventListener("click", function () { acaoCampanha(em.painelId, "cancelar").catch(function (e) { falha(e); }); });
  $("emPExportar").addEventListener("click", function () {
    if (!em.pessoas.length) return aviso("Não há pessoas nesta lista para exportar.", true);
    const linhas = em.pessoas.map(function (p) { return { email: p.email, nome: p.nome || "", situacao: WE.rotuloEnvio(p.status) + (p.saiu ? " (saiu da lista)" : ""), detalhe: p.detalhe || "", clicou: p.clicou_em ? horaCurta(p.clicou_em) : "", link: p.ultimo_link || "" }; });
    const texto = WE.csv([["email", "E-mail"], ["nome", "Nome"], ["situacao", "Situação"], ["detalhe", "Detalhe"], ["clicou", "Clicou em"], ["link", "Link clicado"]], linhas);
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
    a.href = url; a.download = "campanha-" + String(em.painelNome || "email").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });
  setInterval(function () {
    if (document.hidden || em.sub !== "campanhas" || abertos()) return;
    const sec = document.querySelector('[data-painel="email"]');
    if (sec && !sec.hidden) telaCampanhas().catch(function () { /* tenta de novo na próxima volta */ });
  }, 30000);

  /* ---------- envio individual (ficha, funil e pedido não pago) ---------- */
  const AVISO_SITUACAO = { so_transacional: "Esta pessoa não autorizou novidades por e-mail: um e-mail de novidades será recusado.", saiu: "Esta pessoa pediu para sair dos e-mails: um e-mail de novidades será recusado.",
    invalido: "O endereço desta pessoa deu erro de entrega. Corrija o e-mail na ficha antes de enviar." };
  async function enviarPara(o) {
    try {
      await garantirBase();
      const d = await rpc("crm_email_do_contato", { p_contato: o.contato_id });
      if (!d || !d.email) return aviso("Esta pessoa não tem e-mail na ficha. Cadastre o e-mail antes de enviar.", true);
      em.envio = { contato_id: o.contato_id, email: d.email, nome: d.nome || o.nome || "", situacao: d.situacao };
      abrirEnvio();
    } catch (e) { falha(e, "Não consegui abrir o envio."); }
  }
  async function enviarPedido(p) {
    if (!p || !p.email) return aviso("Este pedido não tem e-mail.", true);
    try {
      await garantirBase();
      const m = em.modelos.filter(function (x) { return x.chave === "recuperacao_carrinho"; })[0];
      if (!m) return aviso("O modelo \"Pedido não concluído\" está arquivado. Desarquive em E-mail, na parte Modelos.", true);
      em.envio = { pedido_id: p.id, email: p.email, nome: p.nome || "", produto: p.produto || "", modeloFixo: m.id, situacao: "pedido" };
      abrirEnvio();
    } catch (e) { falha(e, "Não consegui abrir o envio."); }
  }
  function abrirEnvio() {
    const e = em.envio;
    $("emEPara").textContent = "Para: " + (e.nome ? e.nome + " · " : "") + e.email + (e.pedido_id ? " · sobre o pedido de " + (e.produto || "um produto") : "");
    $("emEModelo").innerHTML = e.pedido_id
      ? em.modelos.filter(function (m) { return m.id === e.modeloFixo; }).map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.nome) + "</option>"; }).join("")
      : '<option value="">Escrever agora</option>' + em.modelos.filter(function (m) { return !/\{(produto|link_do_pedido)\}/i.test(m.assunto + m.corpo); })
          .map(function (m) { return '<option value="' + esc(m.id) + '">Modelo: ' + esc(m.nome) + " (" + esc(tipoCurto(m.tipo)) + ")</option>"; }).join("");
    $("emETipo").value = e.situacao === "aceitou" ? "marketing" : "transacional"; $("emEAssunto").value = ""; $("emECorpo").value = "Olá, {primeiro_nome}!\n\n";
    $("emEEnviar").disabled = false;
    atualizarEnvio();
    if (!$("jEmailEnviar").open) $("jEmailEnviar").showModal();
  }
  function atualizarEnvio() {
    const e = em.envio; if (!e) return;
    const m = em.modelos.filter(function (x) { return x.id === $("emEModelo").value; })[0] || null;
    $("emELivre").hidden = !!m;
    const tipo = m ? m.tipo : $("emETipo").value, conteudo = m || { assunto: $("emEAssunto").value, corpo: $("emECorpo").value };
    mostrarPrevia($("emEPrev"), conteudo, tipo, { nome: e.nome, email: e.email, produto: e.produto || EXEMPLO.produto, link_do_pedido: EXEMPLO.link_do_pedido });
    $("emEAviso").textContent = tipo === "marketing" ? (AVISO_SITUACAO[e.situacao] || "")
      : e.situacao === "invalido" ? AVISO_SITUACAO.invalido : e.pedido_id ? "Este e-mail fala só do pedido. O link do botão é o do pagamento desta pessoa." : "Use este tipo só para um assunto que a própria pessoa pediu (pedido, cadastro, atendimento).";
  }
  let envioT = null;
  ["emEModelo", "emETipo", "emEAssunto", "emECorpo"].forEach(function (id) {
    $(id).addEventListener("input", function () { clearTimeout(envioT); envioT = setTimeout(atualizarEnvio, 200); });
    $(id).addEventListener("change", atualizarEnvio);
  });
  $("emEEnviar").addEventListener("click", async function () {
    const e = em.envio; if (!e || em.ocupado) return;
    const mid = $("emEModelo").value;
    let corpo;
    if (e.pedido_id) corpo = { acao: "avulso", pedido_id: e.pedido_id, modelo_id: mid };
    else if (mid) corpo = { acao: "avulso", contato_id: e.contato_id, modelo_id: mid };
    else {
      if (!$("emEAssunto").value.trim()) return aviso("Escreva o assunto.", true);
      if (!$("emECorpo").value.trim()) return aviso("Escreva o texto do e-mail.", true);
      corpo = { acao: "avulso", contato_id: e.contato_id, tipo: $("emETipo").value, assunto: $("emEAssunto").value, corpo: $("emECorpo").value };
    }
    if (!confirm("Enviar este e-mail para " + e.email + "?")) return;
    em.ocupado = true; $("emEEnviar").disabled = true;
    try {
      const r = await servidor(corpo);
      if (!r.ok) return aviso(r.erro || "O e-mail não saiu.", true);
      aviso("E-mail enviado para " + (r.para || e.email) + ".");
      $("jEmailEnviar").close();
      P.recarregarEmailDaFicha();
    } catch (err) { falha(err, "Não consegui enviar o e-mail."); }
    finally { em.ocupado = false; $("emEEnviar").disabled = false; }
  });

  window.WaEmailTela = { visao: visao, enviarPara: enviarPara, enviarPedido: enviarPedido };
})();
