/* Painel "Avisos por e-mail" (Financeiro → aba Avisos por e-mail). Só o master vê.
   Mostra o que saiu para cada cobrança (enviado, entregue, aberto, clicou, erro), as respostas dos clientes
   e deixa corrigir e-mail, pausar, reenviar, mandar prévia e dar baixa. */
(function () {
  const TIPO = { lembrete: "Lembrete (faltam até 5 dias)", vence_hoje: "Vence hoje", atraso: "Atraso", obrigado: "Obrigado", manual: "Prévia para você" };
  const RESP = { ja_paguei: "Disse que já pagou", nova_data: "Vai pagar em outra data", ajuda: "Pediu ajuda" };
  let dados = { cobs: [], perfis: {}, prefs: {}, envios: [], respostas: [] }, busca = "", carregando = false;
  const $ = function (s) { return document.getElementById(s); };
  const hojeLocal = function () { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const mais = function (iso, n) { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const dias = function (a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000); };
  const quando = function (iso) { if (!iso) return ""; const d = new Date(iso); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); };
  const SERV = { consultoria_empresarial: "Consultoria empresarial", terapia: "Terapia", mentoria: "Mentoria" };

  async function funcao(corpo) {
    const { data, error } = await supa().functions.invoke("cobrancas", { body: corpo });
    if (error) { let m = "Não foi possível concluir."; try { const j = await error.context.json(); if (j && j.erro) m = j.erro; } catch (e) {} return { ok: false, erro: m }; }
    return data || {};
  }

  async function carregar(silencioso) {
    if (carregando) return; carregando = true;
    try {
      const hoje = hojeLocal();
      const [rc, rp, rf, re, rr] = await Promise.all([
        supa().from("cobrancas").select("id,token,perfil_id,contrato_id,descricao,vencimento,valor,pago_em,link_pagamento,avisos_pausados_ate,contratos(servico,produto,link_pagamento)").is("pago_em", null).lte("vencimento", mais(hoje, 5)).order("vencimento"),
        supa().from("perfis").select("id,nome,email,ativo"),
        supa().from("cobrancas_preferencias").select("perfil_id,avisos,motivo"),
        supa().from("cobrancas_envios").select("id,cobranca_id,perfil_id,tipo,para,status,erro,dia,enviado_em,entregue_em,aberto_em,clicado_em").order("enviado_em", { ascending: false }).limit(500),
        supa().from("cobrancas_respostas").select("id,cobranca_id,perfil_id,tipo,nova_data,mensagem,criado_em,lida_em,cobrancas(descricao,valor,vencimento,pago_em)").order("criado_em", { ascending: false }).limit(200)
      ]);
      dados.cobs = rc.data || [];
      dados.perfis = {}; (rp.data || []).forEach(function (p) { dados.perfis[p.id] = p; });
      dados.prefs = {}; (rf.data || []).forEach(function (p) { dados.prefs[p.perfil_id] = p; });
      dados.envios = re.data || [];
      dados.respostas = rr.data || [];
      badge();
      if (!silencioso) desenhar();
    } finally { carregando = false; }
  }
  window.carregarAvisos = function () { carregar(false); };

  function badge() {
    const novas = dados.respostas.filter(function (r) { return !r.lida_em && !(r.cobrancas && r.cobrancas.pago_em); }).length;
    const ultimo = {}; dados.envios.forEach(function (e) { if (e.tipo !== "manual" && !ultimo[e.cobranca_id]) ultimo[e.cobranca_id] = e; });
    const erros = dados.cobs.filter(function (c) { const u = ultimo[c.id]; return u && (u.status === "erro" || u.status === "bloqueado"); }).length;
    const b = $("avisosBadge"); if (b) { b.textContent = (novas + erros) || ""; b.hidden = !(novas + erros); }
  }

  function nomeDe(id) { return (dados.perfis[id] || {}).nome || "Cliente"; }
  function statusEnvio(e) {
    if (!e) return '<span class="selo">Ainda não enviado</span>';
    const t = (TIPO[e.tipo] || e.tipo) + " · " + quando(e.enviado_em);
    if (e.status === "bloqueado") return '<span class="selo off">Não enviado</span> <span class="av-erro">' + esc(e.erro || "") + "</span>";
    if (e.status === "erro") return '<span class="selo off">Erro</span> <span class="av-erro">' + esc(e.erro || "Falha no envio") + "</span><br><small>" + esc(t) + "</small>";
    const marcas = ['<span class="selo">Enviado</span>'];
    if (e.status === "atrasando") marcas.push('<span class="selo pendente">Entrega atrasada</span>');
    if (e.entregue_em || e.status === "entregue" || e.status === "aberto") marcas.push('<span class="selo ok">Entregue</span>');
    if (e.aberto_em || e.status === "aberto") marcas.push('<span class="selo ok">Abriu ' + esc(quando(e.aberto_em)) + "</span>");
    if (e.clicado_em) marcas.push('<span class="selo ouro">Clicou ' + esc(quando(e.clicado_em)) + "</span>");
    return marcas.join(" ") + "<br><small>" + esc(t) + " · para " + esc(e.para || "") + "</small>";
  }

  function desenhar() {
    const hoje = hojeLocal();
    // KPIs
    const enviadosHoje = dados.envios.filter(function (e) { return e.dia === hoje && e.tipo !== "manual"; });
    const semana = dados.envios.filter(function (e) { return e.dia >= mais(hoje, -7) && e.tipo !== "manual" && e.status !== "bloqueado"; });
    const abertos = semana.filter(function (e) { return e.aberto_em || e.status === "aberto"; }).length;
    const novas = dados.respostas.filter(function (r) { return !r.lida_em && !(r.cobrancas && r.cobrancas.pago_em); }).length;
    const ultimo = {}; dados.envios.forEach(function (e) { if (e.tipo !== "manual" && !ultimo[e.cobranca_id]) ultimo[e.cobranca_id] = e; });
    const comErro = dados.cobs.filter(function (c) { const u = ultimo[c.id]; return u && (u.status === "erro" || u.status === "bloqueado"); }).length;
    $("avKpis").innerHTML =
      '<div class="kpi"><small>Respostas novas</small><b>' + novas + "</b><span>dos clientes</span></div>" +
      '<div class="kpi"><small>E-mails com problema</small><b>' + comErro + "</b><span>corrija abaixo</span></div>" +
      '<div class="kpi"><small>Enviados hoje</small><b>' + enviadosHoje.filter(function (e) { return e.status !== "bloqueado"; }).length + "</b><span>" + dados.cobs.length + " cobranças na lista</span></div>" +
      '<div class="kpi"><small>Abertos (7 dias)</small><b>' + abertos + " de " + semana.length + "</b><span>e-mails enviados</span></div>";

    // respostas
    const resp = dados.respostas.filter(function (r) { return r.cobrancas && !r.cobrancas.pago_em || !r.lida_em; }).slice(0, 40);
    $("avRespostas").innerHTML = resp.length ? resp.map(function (r) {
      const c = r.cobrancas || {}, paga = !!c.pago_em;
      return '<div class="av-resp' + (r.lida_em ? " lida" : "") + '">' +
        '<div><b>' + esc(nomeDe(r.perfil_id)) + '</b> <span class="selo ' + (r.tipo === "ajuda" ? "off" : r.tipo === "ja_paguei" ? "ok" : "pendente") + '">' + RESP[r.tipo] + (r.nova_data ? ": " + dataBR(r.nova_data) : "") + "</span>" + (paga ? ' <span class="selo ok">Já dei baixa</span>' : "") +
        '<br><small>' + esc(c.descricao || "") + " · " + brl(c.valor) + " · vencimento " + dataBR(c.vencimento || "") + " · respondeu " + esc(quando(r.criado_em)) + "</small>" +
        (r.mensagem ? '<p class="av-msg">“' + esc(r.mensagem) + "”</p>" : "") + "</div>" +
        '<div class="acoes" style="margin-top:8px">' + (!paga ? '<button class="btn peq" type="button" data-baixa="' + r.cobranca_id + '">Dar baixa</button>' : "") +
        (!r.lida_em ? '<button class="btn peq contorno" type="button" data-lida="' + r.id + '">Marcar como visto</button>' : '<span class="vazio" style="padding:0">Visto</span>') + "</div></div>";
    }).join("") : '<p class="vazio">Nenhuma resposta ainda.</p>';

    // cobranças
    const q = busca.trim().toLowerCase();
    const lista = dados.cobs.filter(function (c) { return !q || (nomeDe(c.perfil_id) + " " + ((dados.perfis[c.perfil_id] || {}).email || "")).toLowerCase().indexOf(q) > -1; });
    $("avCobrancas").innerHTML = lista.length ? lista.map(function (c) {
      const p = dados.perfis[c.perfil_id] || {}, k = c.contratos || {}, pref = dados.prefs[c.perfil_id];
      const desligado = pref && pref.avisos === false;
      const pausado = c.avisos_pausados_ate && c.avisos_pausados_ate >= hoje;
      const d = dias(c.vencimento, hoje);
      const sit = d > 0 ? '<span class="selo off">Atrasada há ' + d + (d === 1 ? " dia" : " dias") + "</span>" : d === 0 ? '<span class="selo pendente">Vence hoje</span>' : '<span class="selo">Vence em ' + (-d) + (d === -1 ? " dia" : " dias") + "</span>";
      const u = ultimo[c.id];
      const linkAtual = c.link_pagamento || k.link_pagamento || "";
      const ultResp = dados.respostas.find(function (r) { return r.cobranca_id === c.id; });
      return '<article class="carrinho" data-cob="' + c.id + '">' +
        '<div class="carrinho-topo"><div><h3>' + esc(p.nome || "Cliente") + '</h3><span class="vazio" style="padding:0">' + esc(c.descricao) + (SERV[k.servico] || k.produto ? " · " + esc(SERV[k.servico] || k.produto) : "") + "</span></div>" +
        '<div class="carrinho-selos">' + sit + (desligado ? '<span class="selo">Avisos desligados</span>' : "") + (pausado && !desligado ? '<span class="selo pendente">Pausado até ' + dataBR(c.avisos_pausados_ate) + "</span>" : "") + "</div></div>" +
        '<p class="carrinho-prod"><b>' + brl(c.valor) + "</b> · vencimento " + dataBR(c.vencimento) + "</p>" +
        '<div class="carrinho-resumo"><b>Último aviso:</b> ' + statusEnvio(u) + (ultResp ? '<br><b>Resposta:</b> ' + RESP[ultResp.tipo] + (ultResp.nova_data ? " (" + dataBR(ultResp.nova_data) + ")" : "") + " · " + esc(quando(ultResp.criado_em)) : "") + "</div>" +
        '<div class="carrinho-retorno f">' +
          '<label>E-mail do cliente<div class="av-linha"><input type="email" value="' + esc(p.email || "") + '" data-email="' + c.perfil_id + '"><button class="btn peq contorno" type="button" data-salvar-email="' + c.perfil_id + '">Corrigir</button></div></label>' +
          '<label>Link de pagamento desta cobrança <small style="display:inline;font-weight:400">(opcional; aparece no botão “Pagar agora”)</small><div class="av-linha"><input type="url" placeholder="https://link.infinitepay.io/..." value="' + esc(c.link_pagamento || "") + '" data-link="' + c.id + '"><button class="btn peq contorno" type="button" data-salvar-link="' + c.id + '">Salvar</button></div>' + (!c.link_pagamento && k.link_pagamento ? '<small>Usando o link do contrato.</small>' : "") + (!linkAtual ? "<small>Sem link: o e-mail vai sem o botão “Pagar agora”.</small>" : "") + "</label>" +
        "</div>" +
        '<div class="acoes">' +
          '<button class="btn peq" type="button" data-baixa="' + c.id + '">Dar baixa</button>' +
          (!desligado ? '<button class="btn peq contorno" type="button" data-reenviar="' + c.id + '">Reenviar agora</button>' : "") +
          '<button class="btn peq contorno" type="button" data-previa="' + c.id + '">Prévia no meu e-mail</button>' +
          (pausado ? '<button class="btn peq contorno" type="button" data-retomar="' + c.id + '">Retomar avisos</button>' : '<button class="btn peq contorno" type="button" data-pausar="' + c.id + '">Pausar 7 dias</button>') +
          '<button class="btn peq contorno" type="button" data-pref="' + c.perfil_id + '" data-valor="' + (desligado ? "1" : "0") + '">' + (desligado ? "Ligar avisos deste cliente" : "Desligar avisos deste cliente") + "</button>" +
        "</div></article>";
    }).join("") : '<p class="vazio">' + (q ? "Nada encontrado." : "Nenhuma cobrança atrasada ou vencendo nos próximos 5 dias. 🎉") + "</p>";

    // histórico
    $("avHistorico").innerHTML = dados.envios.slice(0, 80).map(function (e) {
      const st = e.status === "bloqueado" ? '<span class="selo off">Não enviado</span> ' + esc(e.erro || "") : e.status === "erro" ? '<span class="selo off">Erro</span> ' + esc(e.erro || "") :
        (e.aberto_em || e.status === "aberto") ? '<span class="selo ok">Aberto</span>' : (e.entregue_em || e.status === "entregue") ? '<span class="selo ok">Entregue</span>' : '<span class="selo">Enviado</span>';
      return "<tr><td>" + esc(quando(e.enviado_em)) + "</td><td>" + esc(nomeDe(e.perfil_id)) + "</td><td>" + esc(TIPO[e.tipo] || e.tipo) + '</td><td class="quebra">' + esc(e.para || "") + '</td><td class="quebra">' + st + "</td></tr>";
    }).join("") || '<tr><td colspan="5" class="vazio">Nenhum envio ainda.</td></tr>';
  }

  async function acao(b, fn, okMsg) {
    b.disabled = true; const t = b.textContent; b.textContent = "Aguarde...";
    try { const r = await fn(); if (r && r.ok === false) throw new Error(r.erro || "Não foi possível."); if (okMsg) aviso(typeof okMsg === "function" ? okMsg(r) : okMsg); await carregar(false); }
    catch (e) { aviso(e.message || "Não foi possível.", true); b.disabled = false; b.textContent = t; }
  }

  document.addEventListener("click", function (ev) {
    const b = ev.target.closest && ev.target.closest("[data-baixa],[data-lida],[data-reenviar],[data-previa],[data-pausar],[data-retomar],[data-pref],[data-salvar-email],[data-salvar-link]");
    if (!b || !b.closest("[data-painel=avisos]")) return;
    if (b.dataset.baixa) {
      if (window.financeiroAbrirPagar) window.financeiroAbrirPagar(b.dataset.baixa); else aviso("Recarregue a página e tente de novo.", true);
      return;
    }
    if (b.dataset.lida) return acao(b, async function () { const { error } = await supa().from("cobrancas_respostas").update({ lida_em: new Date().toISOString() }).eq("id", b.dataset.lida); return error ? { ok: false, erro: error.message } : { ok: true }; });
    if (b.dataset.reenviar) return acao(b, function () { return funcao({ acao: "reenviar", cobranca_id: b.dataset.reenviar }); }, function (r) { return r.bloqueado ? "Não enviado: " + r.erro : "Aviso enviado."; });
    if (b.dataset.previa) return acao(b, function () { return funcao({ acao: "previa", cobranca_id: b.dataset.previa }); }, "Prévia enviada para o contato@. Confira sua caixa de entrada.");
    if (b.dataset.pausar) return acao(b, async function () { const { error } = await supa().from("cobrancas").update({ avisos_pausados_ate: mais(hojeLocal(), 7) }).eq("id", b.dataset.pausar); return error ? { ok: false, erro: error.message } : { ok: true }; }, "Avisos pausados por 7 dias.");
    if (b.dataset.retomar) return acao(b, async function () { const { error } = await supa().from("cobrancas").update({ avisos_pausados_ate: null }).eq("id", b.dataset.retomar); return error ? { ok: false, erro: error.message } : { ok: true }; }, "Avisos retomados. O próximo sai amanhã às 9h.");
    if (b.dataset.pref) return acao(b, async function () { const { error } = await supa().from("cobrancas_preferencias").upsert({ perfil_id: b.dataset.pref, avisos: b.dataset.valor === "1", motivo: b.dataset.valor === "1" ? null : "Desligado pelo Mauricio", atualizado_em: new Date().toISOString() }, { onConflict: "perfil_id" }); return error ? { ok: false, erro: error.message } : { ok: true }; }, "Preferência salva.");
    if (b.dataset.salvarEmail) {
      const inp = document.querySelector('[data-email="' + b.dataset.salvarEmail + '"]');
      return acao(b, function () { return funcao({ acao: "trocar_email", perfil_id: b.dataset.salvarEmail, email: inp.value }); }, "E-mail corrigido. O próximo aviso já vai para o endereço novo.");
    }
    if (b.dataset.salvarLink) {
      const inp = document.querySelector('[data-link="' + b.dataset.salvarLink + '"]'), v = inp.value.trim();
      if (v && !/^https:\/\//.test(v)) { aviso("O link precisa começar com https://", true); return; }
      return acao(b, async function () { const { error } = await supa().from("cobrancas").update({ link_pagamento: v || null }).eq("id", b.dataset.salvarLink); return error ? { ok: false, erro: error.message } : { ok: true }; }, "Link salvo.");
    }
  });

  function ligar() {
    const enviar = $("avEnviarAgora"); if (!enviar || enviar.dataset.ok) return; enviar.dataset.ok = "1";
    enviar.addEventListener("click", function () {
      if (!confirm("Enviar agora os avisos de hoje? Quem já recebeu hoje não recebe de novo.")) return;
      acao(enviar, function () { return funcao({ acao: "enviar_agora" }); }, function (r) { return "Pronto: " + (r.enviados || 0) + " enviados, " + (r.bloqueados || 0) + " com e-mail de teste/inválido, " + (r.erros || 0) + " com erro."; });
    });
    $("avAtualizar").addEventListener("click", function () { carregar(false); });
    $("avBusca").addEventListener("input", function () { busca = this.value; desenhar(); });
    const jp = $("janelaPagar"); if (jp) jp.addEventListener("close", function () { setTimeout(function () { carregar(false); }, 800); });
  }
  /* contador na aba assim que o financeiro terminar de carregar */
  const espera = setInterval(function () { if (window.financeiroAbrirPagar) { clearInterval(espera); ligar(); carregar(true); } }, 400);
})();
