/* CRM WhatsApp: tela do master. Usa as tabelas wa_* (RLS: só master) e a função "whatsapp" do servidor.
   Depende de: config.js, auth.js e app.js (esc, aviso, buscarTudo, ligarAbas, foneBR, MOEDA). */
(async function () {
  const perfil = await protegerPagina("master");
  if (!perfil) return;

  const $ = function (id) { return document.getElementById(id); };
  const BR = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 3 });
  let cfg = {};
  let templates = [];
  let contatos = [];
  let regras = [];
  let abaAtual = "conversas";
  let conversaId = null;
  let conversaCont = null;
  let ultimaAssinatura = "";
  const carregadas = {};

  /* ---------- utilidades ---------- */
  async function ler(p) { const r = await p; if (r.error) throw r.error; return r.data; }
  async function wa(corpo) {
    const { data, error } = await supa().functions.invoke("whatsapp", { body: corpo });
    if (error) {
      let msg = "Não foi possível falar com o servidor. Tente de novo.";
      try { const j = await error.context.json(); if (j && j.erro) msg = j.erro; } catch (e) {}
      return { ok: false, erro: msg };
    }
    return data || { ok: false, erro: "Resposta vazia do servidor." };
  }
  function falha(e, msg) { console.error(e); aviso(msg || ("Não deu certo: " + (e && e.message ? e.message : e)), true); }
  function quando(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  function normFone(t) { let d = String(t || "").replace(/\D/g, ""); if (d.length === 10 || d.length === 11) d = "55" + d; return d; }
  function foneValido(d) { return /^\d{12,15}$/.test(d); }
  function listaEt(t) {
    return Array.from(new Set(String(t || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) {
      return /^lista:/i.test(x) ? LISTA + x.slice(LISTA.length).trim() : x.toLowerCase();    // o nome da lista mantém as maiúsculas
    })));
  }
  const LISTA = "lista:";                                  // lista = etiqueta "lista:Nome"; o disparo já filtra por etiqueta
  function seloEt(e) { return e.indexOf(LISTA) === 0 ? '<span class="selo ouro">' + esc(e.slice(LISTA.length)) + "</span>" : '<span class="selo">' + esc(e) + "</span>"; }
  function nomeEt(e) { return e.indexOf(LISTA) === 0 ? "Lista: " + e.slice(LISTA.length) : e; }
  function corpoDe(t) {
    const b = ((t && t.componentes) || []).find(function (c) { return String(c.type).toUpperCase() === "BODY"; });
    return b ? String(b.text || "") : "";
  }
  function amostra(txt) { return String(txt || "").replace(/\{primeiro_nome\}/gi, "Maria").replace(/\{nome\}/gi, "Maria Silva"); }
  function preencherPrev(t, vars) {
    return corpoDe(t).replace(/\{\{(\d+)\}\}/g, function (_m, n) { const v = vars[Number(n) - 1]; return v ? amostra(v) : "{{" + n + "}}"; });
  }
  function copiar(id) {
    const el = $(id);
    el.select();
    try { navigator.clipboard.writeText(el.value).then(function () { aviso("Copiado."); }, function () { document.execCommand("copy"); aviso("Copiado."); }); }
    catch (e) { document.execCommand("copy"); aviso("Copiado."); }
  }
  document.addEventListener("click", function (ev) {
    const c = ev.target.closest("[data-copiar]"); if (c) copiar(c.dataset.copiar);
    const f = ev.target.closest("[data-fechar]"); if (f) $(f.dataset.fechar).close();
  });

  /* ---------- mídia: vídeo, áudio, imagem e PDF (pasta protegida wa-midia) ---------- */
  const LIMITE_MB = 16;
  const ROT_TIPO = { image: "imagem", video: "vídeo", audio: "áudio", document: "PDF" };
  const ACEITA = { image: "image/jpeg,image/png", video: "video/mp4,video/3gpp", document: "application/pdf",
    todos: "video/mp4,video/3gpp,audio/mpeg,audio/mp4,audio/ogg,audio/aac,audio/amr,.m4a,.mp3,.ogg,.opus,image/jpeg,image/png,application/pdf" };
  function mimeDoArquivo(f) {
    let t = String(f.type || "").toLowerCase();
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const porExt = { mp4: "video/mp4", "3gp": "video/3gpp", m4a: "audio/mp4", mp3: "audio/mpeg", ogg: "audio/ogg", opus: "audio/ogg", aac: "audio/aac", amr: "audio/amr", pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png" };
    if (t === "audio/x-m4a" || t === "audio/m4a") t = "audio/mp4";
    if (t === "audio/mp3") t = "audio/mpeg";
    if (!t || t === "application/octet-stream") t = porExt[ext] || t;
    return t;
  }
  function tipoDoArquivo(mime) {
    if (/^image\/(jpeg|png)$/.test(mime)) return "image";
    if (/^video\/(mp4|3gpp)$/.test(mime)) return "video";
    if (/^audio\/(ogg|mpeg|mp4|aac|amr)$/.test(mime)) return "audio";
    if (mime === "application/pdf") return "document";
    return null;
  }
  async function subirMidia(file, esperado) {
    if (/^video\//i.test(file.type || "") || /\.(mp4|mov|m4v|3gp|webm|mkv)$/i.test(file.name)) {
      const ehMp4 = /^video\/(mp4|3gpp)$/.test(mimeDoArquivo(file));
      if ((file.size > LIMITE_MB * 1024 * 1024 || !ehMp4) && window.waVideo) {
        if (esperado && esperado !== "video") throw new Error("Este arquivo é vídeo, mas o campo pede " + ROT_TIPO[esperado] + ".");
        file = await window.waVideo.preparar(file);
      }
    }
    const mime = mimeDoArquivo(file), tipo = tipoDoArquivo(mime);
    if (!tipo) throw new Error("Formato não aceito pelo WhatsApp. Use MP4 (vídeo), JPG ou PNG (imagem), MP3, M4A ou OGG (áudio) ou PDF.");
    if (esperado && tipo !== esperado) throw new Error("Este arquivo é " + ROT_TIPO[tipo] + ", mas o campo pede " + ROT_TIPO[esperado] + ".");
    if (tipo === "image" && file.size > 5 * 1024 * 1024) throw new Error("A imagem passa de 5 MB (limite do WhatsApp).");
    if (file.size > LIMITE_MB * 1024 * 1024) throw new Error("O arquivo passa de " + LIMITE_MB + " MB (limite do WhatsApp).");
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const sorteio = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    const caminho = new Date().toISOString().slice(0, 10) + "/" + sorteio + "." + ext;
    const { error } = await supa().storage.from("wa-midia").upload(caminho, file, { contentType: mime, upsert: false });
    if (error) throw error;
    return { url: supa().storage.from("wa-midia").getPublicUrl(caminho).data.publicUrl, tipo: tipo, mime: mime, nome: file.name };
  }
  function prevMidia(url, tipo) {
    const u = esc(url);
    if (tipo === "video") return '<video controls preload="metadata" style="max-width:260px;border-radius:10px" src="' + u + '"></video>';
    if (tipo === "audio") return '<audio controls preload="none" style="max-width:260px" src="' + u + '"></audio>';
    if (tipo === "image") return '<img alt="" style="max-width:200px;border-radius:10px" src="' + u + '">';
    return '<a href="' + u + '" target="_blank" rel="noopener">Abrir o PDF</a>';
  }
  document.addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-escolher-midia]"); if (!b) return;
    b.closest("[data-caixa-midia]").querySelector("input[data-midia-arquivo]").click();
  });
  document.addEventListener("change", async function (ev) {
    const inp = ev.target.closest ? ev.target.closest("input[data-midia-arquivo]") : null; if (!inp || !inp.files[0]) return;
    const cx = inp.closest("[data-caixa-midia]"), st = cx.querySelector("[data-midia-st]"), arq = inp.files[0];
    inp.value = ""; st.textContent = "Enviando o arquivo...";
    try {
      const r = await subirMidia(arq, cx.dataset.tipo);
      const campo = cx.querySelector("input[data-midia]"); campo.value = r.url; campo.dispatchEvent(new Event("input", { bubbles: true }));
      st.textContent = "Pronto: " + r.nome; cx.querySelector("[data-midia-prev]").innerHTML = prevMidia(r.url, r.tipo);
    } catch (e) { st.textContent = ""; aviso(e.message || String(e), true); }
  });

  /* monta os campos {{1}}, {{2}}... de um template; devolve função que lê os valores */
  function montarVars(caixa, t, valores) {
    const n = t ? Number(t.qtd_variaveis) || 0 : 0;
    let html = "";
    for (let i = 1; i <= n; i++) {
      html += '<div class="wa-linha-var"><b>{{' + i + '}}</b><input data-var="' + i + '" maxlength="120" value="' + esc((valores && valores[i - 1]) || (i === 1 ? "{primeiro_nome}" : "")) + '" placeholder="' + (i === 1 ? "{primeiro_nome} vira o nome da pessoa" : "texto igual para todos") + '"></div>';
    }
    const mid = t && ["IMAGE", "VIDEO", "DOCUMENT"].indexOf(String(t.cabecalho_tipo || "").toUpperCase()) > -1;
    if (mid) {
      const tp = String(t.cabecalho_tipo).toLowerCase();
      html += '<div style="margin-top:8px" data-caixa-midia data-tipo="' + tp + '"><label>Arquivo do cabeçalho: ' + ROT_TIPO[tp] + ' <span class="vazio">(escolha o arquivo ou cole um link https://)</span></label>' +
        '<div class="wa-copia"><input data-midia type="url" placeholder="https://..."><button type="button" class="btn peq contorno" data-escolher-midia>Escolher arquivo</button></div>' +
        '<input type="file" hidden data-midia-arquivo accept="' + ACEITA[tp] + '"><small class="vazio" data-midia-st></small><div data-midia-prev style="margin-top:6px"></div></div>';
    }
    caixa.innerHTML = html || '<p class="vazio">Este template não tem variáveis.</p>';
    return function () {
      return {
        vars: Array.prototype.slice.call(caixa.querySelectorAll("input[data-var]")).map(function (i) { return i.value.trim(); }),
        midia: (caixa.querySelector("input[data-midia]") || {}).value || ""
      };
    };
  }

  /* ---------- configuração ---------- */
  async function carregarConfig() {
    cfg = await ler(supa().from("wa_config").select("*").eq("id", 1).single());
    const ok = cfg.token_configurado && cfg.phone_number_id;
    const s = $("selStatus");
    if (!ok) { s.textContent = "Não conectado"; s.className = "selo pendente"; }
    else if (cfg.ultimo_teste_ok) { s.textContent = "Conectado" + (cfg.numero_exibicao ? " · " + cfg.numero_exibicao : ""); s.className = "selo ok"; }
    else { s.textContent = "Teste a conexão"; s.className = "selo pendente"; }
  }
  async function telaConfig() {
    await carregarConfig();
    $("cfNumId").value = cfg.phone_number_id || "";
    $("cfWaba").value = cfg.waba_id || "";
    $("cfVersao").value = cfg.api_versao || "v23.0";
    $("cfAppId").value = cfg.app_id || "";
    $("cfToken").placeholder = cfg.token_configurado ? "já salvo (cole outro só para trocar)" : "cole aqui o token (começa com EA...)";
    $("cfSegredo").placeholder = cfg.segredo_app_configurado ? "já salva (cole outra só para trocar)" : "32 letras e números";
    $("cfUrl").value = SUPABASE_URL + "/functions/v1/whatsapp";
    $("cfVerify").value = cfg.verify_token || "";
    $("cfLimite").value = cfg.limite_diario; $("cfHi").value = cfg.disparo_hora_inicio; $("cfHf").value = cfg.disparo_hora_fim;
    $("cfPm").value = cfg.preco_marketing; $("cfPu").value = cfg.preco_utilidade;
    let webhook = false, recebidas = 0;
    try {
      const r1 = await supa().from("wa_log").select("id", { count: "exact", head: true }).eq("tipo", "webhook_verificado");
      webhook = (r1.count || 0) > 0;
      const r2 = await supa().from("wa_mensagens").select("id", { count: "exact", head: true }).eq("direcao", "entrada");
      recebidas = r2.count || 0;
    } catch (e) {}
    const lin = function (ok, txt, aviso) { return '<div class="wa-check"><span class="selo ' + (ok ? "ok" : "pendente") + '">' + (ok ? "feito" : "falta") + "</span> " + txt + (!ok && aviso ? ' <span class="vazio">' + aviso + "</span>" : "") + "</div>"; };
    $("cfStatus").innerHTML =
      lin(!!cfg.phone_number_id, "ID do número de telefone") +
      lin(!!cfg.waba_id, "ID da conta do WhatsApp Business") +
      lin(!!cfg.token_configurado, "Token permanente salvo") +
      lin(!!cfg.segredo_app_configurado, "Chave secreta do app salva", "(protege contra mensagens falsas; recomendado)") +
      lin(cfg.ultimo_teste_ok === true, "Teste de conexão" + (cfg.ultimo_teste_em ? " (" + quando(cfg.ultimo_teste_em) + ")" : ""), cfg.ultimo_teste_msg || "") +
      lin(webhook, "Webhook confirmado pelo Meta") +
      lin(recebidas > 0, "Já recebi alguma mensagem de cliente", "(mande uma do seu celular para o número do CRM)") +
      (cfg.ultimo_teste_ok && cfg.ultimo_teste_msg ? '<p class="ajuda" style="margin-top:10px">' + esc(cfg.ultimo_teste_msg) + "</p>" : "");
  }
  $("cfSalvar").addEventListener("click", async function () {
    const b = this; b.disabled = true;
    const r = await wa({
      acao: "salvar_conexao", phone_number_id: $("cfNumId").value, waba_id: $("cfWaba").value, api_versao: $("cfVersao").value, app_id: $("cfAppId").value,
      access_token: $("cfToken").value, app_secret: $("cfSegredo").value
    });
    b.disabled = false;
    if (!r.ok) return aviso(r.erro || "Não salvou.", true);
    $("cfToken").value = ""; $("cfSegredo").value = "";
    aviso("Salvo."); await telaConfig();
  });
  $("cfTestar").addEventListener("click", async function () {
    const b = this; b.disabled = true; $("cfTesteRes").textContent = "Testando...";
    const r = await wa({ acao: "testar" });
    b.disabled = false;
    $("cfTesteRes").textContent = r.ok ? r.msg : (r.erro || "Falhou.");
    $("cfTesteRes").style.color = r.ok ? "#15502E" : "#8C2016";
    await telaConfig();
  });
  $("cfRegistrar").addEventListener("click", async function () {
    if (!confirm("Registrar o número no Meta com este PIN? Anote o PIN: o Meta pede de novo se o número mudar de lugar.")) return;
    const r = await wa({ acao: "registrar_numero", pin: $("cfPin").value });
    if (!r.ok) return aviso(r.erro || "Não registrou.", true);
    $("cfPin").value = ""; aviso("Número registrado.");
  });
  $("cfSalvarLim").addEventListener("click", async function () {
    const lim = parseInt($("cfLimite").value, 10), hi = parseInt($("cfHi").value, 10), hf = parseInt($("cfHf").value, 10);
    const pm = parseFloat($("cfPm").value), pu = parseFloat($("cfPu").value);
    if (!(lim >= 1) || !(hi >= 0 && hi <= 23) || !(hf >= 1 && hf <= 24) || hf <= hi || !(pm >= 0) || !(pu >= 0)) return aviso("Confira os números: o horário final precisa ser depois do inicial.", true);
    try {
      await ler(supa().from("wa_config").update({ limite_diario: lim, disparo_hora_inicio: hi, disparo_hora_fim: hf, preco_marketing: pm, preco_utilidade: pu }).eq("id", 1).select("id"));
      aviso("Limites salvos."); await carregarConfig();
    } catch (e) { falha(e); }
  });

  /* ---------- templates ---------- */
  async function carregarTemplates() {
    templates = await ler(supa().from("wa_templates").select("*").order("nome"));
  }
  const ROT_ST = { APPROVED: ["Aprovado", "ok"], PENDING: ["Em análise", "pendente"], REJECTED: ["Reprovado", "off"], PAUSED: ["Pausado pelo Meta", "off"], DISABLED: ["Desativado", "off"], IN_APPEAL: ["Em recurso", "pendente"] };
  const ROT_CAT = { UTILITY: "Utilidade", MARKETING: "Marketing", AUTHENTICATION: "Autenticação" };
  function rotuloCab(t) {
    const c = String(t.cabecalho_tipo || "").toUpperCase();
    return c && c !== "TEXT" && ROT_TIPO[c.toLowerCase()] ? '<span class="selo ouro">' + esc(ROT_TIPO[c.toLowerCase()]) + "</span> " : "";
  }
  async function telaTemplates() {
    await carregarConfig(); await carregarTemplates();
    const tb = $("tpLista");
    if (!templates.length) { tb.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum template ainda. Clique em "Sincronizar com o Meta" ou crie um abaixo.</td></tr>'; return; }
    tb.innerHTML = templates.map(function (t) {
      const st = ROT_ST[t.status] || [t.status || "?", "pendente"];
      return "<tr><td><b>" + esc(t.nome) + '</b><br><span class="vazio">' + esc(t.idioma) + "</span></td><td>" + esc(ROT_CAT[t.categoria] || t.categoria || "") + '</td><td><span class="selo ' + st[1] + '">' + esc(st[0]) + "</span>" +
        (t.motivo_recusa ? '<br><span class="vazio">' + esc(t.motivo_recusa) + "</span>" : "") + "</td><td>" + t.qtd_variaveis + '</td><td class="quebra tpl-texto">' + rotuloCab(t) + esc(corpoDe(t)) + '</td><td><button class="btn peq perigo" data-tp-apagar="' + esc(t.nome) + '">Apagar</button></td></tr>';
    }).join("");
  }
  $("tpLista").addEventListener("click", async function (ev) {
    const b = ev.target.closest("[data-tp-apagar]"); if (!b) return;
    if (!confirm('Apagar o template "' + b.dataset.tpApagar + '" no Meta? Não dá para desfazer.')) return;
    const r = await wa({ acao: "apagar_template", nome: b.dataset.tpApagar });
    if (!r.ok) return aviso(r.erro || "Não apagou.", true);
    aviso("Template apagado."); telaTemplates();
  });
  $("tpSync").addEventListener("click", async function () {
    const b = this; b.disabled = true; b.textContent = "Sincronizando...";
    const r = await wa({ acao: "sincronizar_templates" });
    b.disabled = false; b.textContent = "Sincronizar com o Meta";
    if (!r.ok) return aviso(r.erro || "Não sincronizou.", true);
    aviso(r.total + " template(s) sincronizados."); telaTemplates();
  });

  /* validação igual à do servidor, para avisar enquanto escreve */
  function validarCorpo(corpo, cat, exemplos) {
    corpo = String(corpo || "").trim();
    if (!corpo) return "Escreva o texto da mensagem.";
    if (/^\{\{\d+\}\}/.test(corpo)) return 'O Meta recusa texto que COMEÇA com variável. Comece com uma palavra, ex.: "Oi, {{1}}!"';
    if (/\{\{\d+\}\}[\s.!?…]*$/.test(corpo)) return "O Meta recusa texto que TERMINA com variável. Termine com uma frase fixa.";
    const ns = Array.from(new Set(Array.from(corpo.matchAll(/\{\{(\d+)\}\}/g)).map(function (x) { return Number(x[1]); }))).sort(function (a, b) { return a - b; });
    for (let i = 0; i < ns.length; i++) if (ns[i] !== i + 1) return "As variáveis precisam ser {{1}}, {{2}}, {{3}}... em sequência.";
    if (/\{\{\d+\}\}\s*\{\{\d+\}\}/.test(corpo)) return "Não deixe duas variáveis coladas.";
    const palavras = corpo.replace(/\{\{\d+\}\}/g, " ").split(/\s+/).filter(Boolean).length;
    if (ns.length && palavras < ns.length * 3) return "Tem variável demais para pouco texto fixo.";
    if (ns.length && exemplos && exemplos.slice(0, ns.length).some(function (x) { return !String(x || "").trim(); })) return "Preencha um exemplo para cada variável.";
    return "";
  }
  function atualizarExemplos() {
    const corpo = $("tcCorpo").value;
    const n = Array.from(new Set(Array.from(corpo.matchAll(/\{\{(\d+)\}\}/g)).map(function (x) { return x[1]; }))).length;
    const caixa = $("tcExemplos");
    const atuais = Array.prototype.slice.call(caixa.querySelectorAll("input")).map(function (i) { return i.value; });
    let h = "";
    if (n) h += '<label>Exemplo de cada variável <span class="vazio">(o Meta usa para aprovar)</span></label>';
    for (let i = 1; i <= n; i++) h += '<div class="wa-linha-var"><b>{{' + i + '}}</b><input data-ex="' + i + '" maxlength="100" value="' + esc(atuais[i - 1] || "") + '" placeholder="ex.: ' + (i === 1 ? "Maria" : "quinta-feira, 20h") + '"></div>';
    caixa.innerHTML = h;
    mostrarAvisoCorpo();
  }
  function exemplosAtuais() { return Array.prototype.slice.call($("tcExemplos").querySelectorAll("input")).map(function (i) { return i.value.trim(); }); }
  function mostrarAvisoCorpo() {
    const e = validarCorpo($("tcCorpo").value, $("tcCat").value, exemplosAtuais());
    const a = $("tcAviso");
    a.textContent = e || ($("tcCorpo").value.trim() ? "Texto no formato aceito pelo Meta." : "");
    a.style.color = e ? "#8C2016" : "#15502E";
  }
  $("tcCorpo").addEventListener("input", atualizarExemplos);
  $("tcExemplos").addEventListener("input", mostrarAvisoCorpo);
  const MODELOS = {
    aula: { nome: "aviso_aula", cat: "UTILITY", corpo: "Oi, {{1}}! Passando para avisar que a nossa próxima aula é {{2}}. O link de acesso chega por aqui, alguns minutos antes de começar. Até lá!", ex: ["Maria", "quinta-feira, às 20h"] },
    lembrete: { nome: "lembrete_pagamento", cat: "UTILITY", corpo: "Oi, {{1}}! Lembrete: o pagamento de {{2}} vence em {{3}}. Se você já pagou, pode ignorar esta mensagem. Qualquer dúvida, é só responder por aqui.", ex: ["Maria", "R$ 150,00", "15/12"] },
    boasvindas: { nome: "boas_vindas_acesso", cat: "UTILITY", corpo: "Oi, {{1}}! Seu acesso ao {{2}} foi liberado. Qualquer dúvida, é só responder esta mensagem que eu te ajudo.", ex: ["Maria", "programa de mentoria"] },
    lancamento: { nome: "convite_nova_turma", cat: "MARKETING", corpo: "Oi, {{1}}! Abri as inscrições para {{2}}. As vagas são limitadas e eu quis te avisar primeiro. Quer saber como funciona?", ex: ["Maria", "a nova turma de mentoria"], botao: "Quero saber mais" }
  };
  document.querySelectorAll("[data-modelo]").forEach(function (b) {
    b.addEventListener("click", function () {
      const m = MODELOS[b.dataset.modelo];
      $("tcNome").value = m.nome; $("tcCat").value = m.cat; $("tcCorpo").value = m.corpo;
      botoesTc = [];
      if (m.botao) botoesTc.push({ tipo: "QUICK_REPLY", texto: m.botao });
      if (m.cat === "MARKETING") botoesTc.push({ tipo: "QUICK_REPLY", texto: "Sair da lista" });
      desenharBotoes();
      atualizarExemplos();
      Array.prototype.slice.call($("tcExemplos").querySelectorAll("input")).forEach(function (i, k) { i.value = m.ex[k] || ""; });
      mostrarAvisoCorpo();
    });
  });
  /* ---------- botões do template: até 3 (resposta rápida, link, ligar ou link entregue pelo robô) ---------- */
  const MAX_BOTOES = 3;
  let botoesTc = [];
  const ROT_BOTAO = { QUICK_REPLY: "Resposta rápida", ROBO: "Resposta rápida + link entregue pelo robô", URL: "Link direto", PHONE_NUMBER: "Ligar" };
  function desenharBotoes() {
    $("tcBotoes").innerHTML = botoesTc.map(function (b, i) {
      const opts = Object.keys(ROT_BOTAO).map(function (k) { return '<option value="' + k + '"' + (b.tipo === k ? " selected" : "") + ">" + ROT_BOTAO[k] + "</option>"; }).join("");
      let extra = "";
      if (b.tipo === "URL") extra = '<div style="margin-top:8px"><label>Endereço do link <span class="vazio">(https://... O Meta bloqueia wa.me e links de grupo)</span></label><input data-bt-campo="valor" value="' + esc(b.valor || "") + '" placeholder="https://..."></div>';
      if (b.tipo === "PHONE_NUMBER") extra = '<div style="margin-top:8px"><label>Telefone com + e DDI</label><input data-bt-campo="valor" value="' + esc(b.valor || "") + '" inputmode="tel" placeholder="+5581999999999"></div>';
      if (b.tipo === "ROBO") extra = '<div style="margin-top:8px"><label>Link que o robô entrega ao tocar no botão <span class="vazio">(serve para grupo do WhatsApp)</span></label><input data-bt-campo="valor" value="' + esc(b.valor || "") + '" placeholder="https://chat.whatsapp.com/..."><div class="checks" style="margin-top:6px"><label><input type="checkbox" data-bt-campo="perguntar"' + (b.perguntar !== false ? " checked" : "") + '> Depois perguntar "Conseguiu entrar?" e fazer follow-up</label></div></div>';
      return '<div class="cartao" style="padding:12px;margin:0 0 8px" data-bt="' + i + '"><div class="grade g2"><div><label>Botão ' + (i + 1) + '</label><select data-bt-campo="tipo">' + opts + '</select></div>' +
        '<div><label>Texto do botão <span class="vazio">(até 25)</span></label><input data-bt-campo="texto" maxlength="25" value="' + esc(b.texto || "") + '" placeholder="Ex.: Quero ver o vídeo"></div></div>' + extra +
        '<div class="acoes" style="margin-top:8px"><button class="btn peq perigo" type="button" data-bt-remover="' + i + '">Remover</button></div></div>';
    }).join("");
    $("tcBotaoAdd").disabled = botoesTc.length >= MAX_BOTOES;
    const tem = botoesTc.some(function (b) { return b.tipo === "QUICK_REPLY" && String(b.texto).trim().toLowerCase() === "sair da lista"; });
    $("tcBotaoSair").disabled = tem || botoesTc.length >= MAX_BOTOES;
    $("tcBotoesAviso").textContent = botoesTc.length >= MAX_BOTOES ? "Limite de 3 botões." : "";
  }
  function lerCampoBotao(el, trocou) {
    const cx = el.closest ? el.closest("[data-bt]") : null, campo = el.getAttribute && el.getAttribute("data-bt-campo"); if (!cx || !campo) return;
    const b = botoesTc[Number(cx.dataset.bt)]; if (!b) return;
    if (campo === "perguntar") b.perguntar = el.checked;
    else b[campo] = el.value;
    if (campo === "tipo" && trocou) { b.valor = ""; desenharBotoes(); }
  }
  $("tcBotoes").addEventListener("input", function (ev) { lerCampoBotao(ev.target, false); });
  $("tcBotoes").addEventListener("change", function (ev) { lerCampoBotao(ev.target, true); });
  $("tcBotoes").addEventListener("click", function (ev) {
    const r = ev.target.closest("[data-bt-remover]"); if (!r) return;
    botoesTc.splice(Number(r.dataset.btRemover), 1); desenharBotoes();
  });
  $("tcBotaoAdd").addEventListener("click", function () { if (botoesTc.length < MAX_BOTOES) { botoesTc.push({ tipo: "QUICK_REPLY", texto: "" }); desenharBotoes(); } });
  $("tcBotaoSair").addEventListener("click", function () { if (botoesTc.length < MAX_BOTOES) { botoesTc.push({ tipo: "QUICK_REPLY", texto: "Sair da lista" }); desenharBotoes(); } });
  desenharBotoes();

  /* ---------- cabeçalho do template: texto, vídeo, imagem ou PDF ---------- */
  const CAB_TIPO = { IMAGE: "image", VIDEO: "video", DOCUMENT: "document" };
  let cabArq = null;
  $("tcCabTipo").addEventListener("change", function () {
    const t = this.value;
    $("tcCabTexto").hidden = t !== "TEXT"; $("tcCabArq").hidden = !CAB_TIPO[t];
    cabArq = null; $("tcCabNome").textContent = "nenhum arquivo"; $("tcCabPrev").innerHTML = "";
    if (CAB_TIPO[t]) $("tcCabArquivo").accept = ACEITA[CAB_TIPO[t]];
  });
  $("tcCabEscolher").addEventListener("click", function () { $("tcCabArquivo").click(); });
  $("tcCabArquivo").addEventListener("change", async function () {
    const f = this.files[0]; this.value = ""; if (!f) return;
    const tipo = $("tcCabTipo").value, st = $("tcCabNome");
    cabArq = null; st.textContent = "Enviando o arquivo..."; $("tcCabPrev").innerHTML = "";
    try {
      const up = await subirMidia(f, CAB_TIPO[tipo]);
      st.textContent = "Mandando o exemplo ao Meta...";
      const r = await wa({ acao: "enviar_exemplo_midia", url: up.url, tipo: tipo });
      if (!r.ok) throw new Error(r.erro || "O Meta não aceitou o arquivo de exemplo.");
      cabArq = { url: up.url, handle: r.handle, tipo: tipo, nome: up.nome };
      st.textContent = "Pronto: " + up.nome + " (exemplo aceito pelo Meta)"; $("tcCabPrev").innerHTML = prevMidia(up.url, up.tipo);
    } catch (e) { st.textContent = "nenhum arquivo"; aviso(e.message || String(e), true); }
  });

  $("tcEnviar").addEventListener("click", async function () {
    const nome = $("tcNome").value.trim();
    if (!/^[a-z0-9_]{1,60}$/.test(nome)) return aviso("Nome só com letras minúsculas, números e _ (sem espaço nem acento).", true);
    const erro = validarCorpo($("tcCorpo").value, $("tcCat").value, exemplosAtuais());
    if (erro) return aviso(erro, true);
    const botoes = [], robos = [], usados = {};
    for (let i = 0; i < botoesTc.length; i++) {
      const b = botoesTc[i], tx = String(b.texto || "").trim(), vl = String(b.valor || "").trim();
      if (!tx) return aviso("Escreva o texto do botão " + (i + 1) + " ou remova o botão.", true);
      if (usados[tx.toLowerCase()]) return aviso("Dois botões têm o mesmo texto: \"" + tx + "\".", true);
      usados[tx.toLowerCase()] = true;
      if (b.tipo === "URL") {
        if (!/^https:\/\//.test(vl)) return aviso("O botão " + (i + 1) + " precisa de um endereço começando com https://", true);
        botoes.push({ tipo: "URL", texto: tx, url: vl });
      } else if (b.tipo === "PHONE_NUMBER") {
        if (!/^\+\d{10,15}$/.test(vl)) return aviso("O botão " + (i + 1) + " precisa do telefone com + e DDI, ex.: +5581999999999", true);
        botoes.push({ tipo: "PHONE_NUMBER", texto: tx, telefone: vl });
      } else {
        if (b.tipo === "ROBO") {
          if (!/^https:\/\//.test(vl)) return aviso("Informe o link (https://) que o robô vai entregar no botão " + (i + 1) + ".", true);
          robos.push({ texto: tx, link: vl, perguntar: b.perguntar !== false });
        }
        botoes.push({ tipo: "QUICK_REPLY", texto: tx });
      }
    }
    if (botoes.filter(function (x) { return x.tipo === "PHONE_NUMBER"; }).length > 1) return aviso("Só pode ter 1 botão de ligar.", true);
    const cabT = $("tcCabTipo").value;
    if (CAB_TIPO[cabT] && !(cabArq && cabArq.handle)) return aviso('Escolha o arquivo do cabeçalho e espere o aviso "exemplo aceito pelo Meta".', true);
    if (cabT === "TEXT" && !$("tcTitulo").value.trim()) return aviso('Escreva o título ou escolha "Sem cabeçalho".', true);
    if (!confirm('Enviar "' + nome + '" para o Meta analisar? Depois de aprovado, o texto não pode ser editado (só criar outro).')) return;
    const bt = this; bt.disabled = true;
    const r = await wa({
      acao: "criar_template", nome: nome, categoria: $("tcCat").value, idioma: "pt_BR", corpo: $("tcCorpo").value.trim(), exemplos: exemplosAtuais(),
      cabecalho_tipo: (cabT === "TEXT" || CAB_TIPO[cabT]) ? cabT : "", cabecalho_texto: cabT === "TEXT" ? $("tcTitulo").value.trim() : "",
      cabecalho_handle: CAB_TIPO[cabT] && cabArq ? cabArq.handle : "", rodape: $("tcRodape").value.trim(), botoes: botoes
    });
    bt.disabled = false;
    if (!r.ok) return aviso(r.erro || "O Meta não aceitou.", true);
    let extra = "";
    for (const rb of robos) {
      try {
        const ex = await ler(supa().from("wa_fluxos").select("id").eq("botao_texto", rb.texto).limit(1));
        const dados = { nome: "Fluxo " + nome, template_nome: nome, botao_texto: rb.texto, link: rb.link, incluir_link: true, perguntar_entrou: rb.perguntar };
        if (ex.length) await ler(supa().from("wa_fluxos").update(dados).eq("id", ex[0].id).select("id"));
        else await ler(supa().from("wa_fluxos").insert(Object.assign({ ativo: true, resposta_texto: "Oi, {primeiro_nome}! Aqui está o link:" }, dados)).select("id"));
        extra += " O robô já está ligado ao botão \"" + rb.texto + "\" (veja na aba Fluxos).";
      } catch (e) { extra += " Mas não consegui criar o fluxo do botão \"" + rb.texto + "\": " + (e.message || e); }
    }
    aviso("Enviado. Situação: " + (r.status || "em análise") + (r.categoria ? " · categoria " + r.categoria : "") + extra);
    telaTemplates();
  });

  /* ---------- contatos ---------- */
  async function carregarContatos() {
    contatos = await buscarTudo(function () {
      return supa().from("wa_contatos").select("id,nome,telefone,etiquetas,optin,optout,ultima_msg_em,notas,perfil_id").order("criado_em").order("id");
    });
    const ets = Array.from(new Set(contatos.reduce(function (a, c) { return a.concat(c.etiquetas || []); }, []))).sort();
    const listas = ets.filter(function (e) { return e.indexOf(LISTA) === 0; }), outras = ets.filter(function (e) { return e.indexOf(LISTA) !== 0; });
    const grupo = function (rot, arr, nome) { return arr.length ? '<optgroup label="' + rot + '">' + arr.map(function (e) { return '<option value="' + esc(e) + '">' + esc(nome(e)) + "</option>"; }).join("") + "</optgroup>" : ""; };
    ["ctFiltroEt", "dpEtiqueta"].forEach(function (id) {
      const sel = $(id), v = sel.value, primeiro = sel.options[0].outerHTML;
      sel.innerHTML = primeiro + grupo("Listas", listas, function (e) { return e.slice(LISTA.length); }) + grupo("Etiquetas", outras, function (e) { return e; });
      sel.value = v;
    });
  }
  function situacao(c) {
    if (c.optout) return '<span class="selo off">Saiu da lista</span>';
    if (c.optin) return '<span class="selo ok">Autorizou</span>';
    return '<span class="selo pendente">Sem autorização</span>';
  }
  function desenharContatos() {
    const b = $("ctBusca").value.trim().toLowerCase(), et = $("ctFiltroEt").value, st = $("ctFiltroSt").value;
    const bd = b.replace(/\D/g, "");
    const lista = contatos.filter(function (c) {
      if (b && !((c.nome || "").toLowerCase().indexOf(b) > -1 || (bd && c.telefone.indexOf(bd) > -1))) return false;
      if (et && (c.etiquetas || []).indexOf(et) === -1) return false;
      if (st === "optin" && !(c.optin && !c.optout)) return false;
      if (st === "sem" && (c.optin || c.optout)) return false;
      if (st === "optout" && !c.optout) return false;
      return true;
    });
    const aut = contatos.filter(function (c) { return c.optin && !c.optout; }).length;
    $("ctConta").textContent = contatos.length + " no total · " + aut + " podem receber";
    const tb = $("ctLista");
    if (!lista.length) { tb.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum contato neste filtro.</td></tr>'; return; }
    tb.innerHTML = lista.slice(0, 500).map(function (c) {
      return "<tr><td>" + esc(c.nome || "(sem nome)") + "</td><td>" + esc(foneBR(c.telefone)) + "</td><td>" + (c.etiquetas || []).map(seloEt).join("") + "</td><td>" + situacao(c) + "</td><td>" + esc(quando(c.ultima_msg_em)) +
        '</td><td><button class="btn peq contorno" data-ct-conversar="' + c.id + '">Conversar</button> <button class="btn peq contorno" data-ct-editar="' + c.id + '">Editar</button></td></tr>';
    }).join("") + (lista.length > 500 ? '<tr><td colspan="6" class="vazio">Mostrando 500 de ' + lista.length + ". Use a busca ou os filtros.</td></tr>" : "");
  }
  async function telaContatos() { await carregarContatos(); desenharListas(); desenharContatos(); }
  ["ctBusca", "ctFiltroEt", "ctFiltroSt"].forEach(function (id) { $(id).addEventListener("input", desenharContatos); });

  /* grava uma lista de pessoas sem nunca tirar autorização nem reativar quem saiu */
  async function salvarContatos(pessoas, aceite, etiquetas) {
    const mapa = {};
    pessoas.forEach(function (p) { mapa[p.telefone] = p; });
    const fones = Object.keys(mapa);
    const res = { novos: 0, atualizados: 0, saiu: 0 };
    const existentes = {};
    /* o mesmo celular pode estar guardado com ou sem o 9: procura as duas formas e liga pela chave */
    const comNove = function (f) { return /^55[1-9][1-9]\d{8}$/.test(f) && "6789".indexOf(f[4]) > -1 ? f.slice(0, 4) + "9" + f.slice(4) : f; };
    const procurar = Array.from(new Set(fones.reduce(function (a, f) { return a.concat([f, WaLista.chaveFone(f), comNove(WaLista.chaveFone(f))]); }, [])));
    for (let i = 0; i < procurar.length; i += 150) {
      const dados = await ler(supa().from("wa_contatos").select("id,telefone,nome,etiquetas,optin,optout").in("telefone", procurar.slice(i, i + 150)));
      dados.forEach(function (c) { existentes[WaLista.chaveFone(c.telefone)] = c; });
    }
    const agora = new Date().toISOString();
    const inserir = [];
    for (const f of fones) {
      const p = mapa[f], c = existentes[WaLista.chaveFone(f)];
      if (!c) { inserir.push({ telefone: f, nome: p.nome || null, perfil_id: p.perfil_id || null, etiquetas: etiquetas, origem: "painel", optin: !!aceite, optin_em: aceite ? agora : null }); continue; }
      const campos = {};
      const et = Array.from(new Set((c.etiquetas || []).concat(etiquetas)));
      if (et.length !== (c.etiquetas || []).length) campos.etiquetas = et;
      if (!c.nome && p.nome) campos.nome = p.nome;
      if (aceite && !c.optin && !c.optout) { campos.optin = true; campos.optin_em = agora; }
      if (c.optout) res.saiu++;
      if (Object.keys(campos).length) { await ler(supa().from("wa_contatos").update(campos).eq("id", c.id).select("id")); res.atualizados++; }
    }
    for (let i = 0; i < inserir.length; i += 200) {
      await ler(supa().from("wa_contatos").insert(inserir.slice(i, i + 200)).select("id"));
      res.novos += Math.min(200, inserir.length - i);
    }
    return res;
  }
  $("ctAdd").addEventListener("click", async function () {
    const tel = normFone($("ctTel").value);
    if (!foneValido(tel)) return aviso("Confira o WhatsApp com DDD.", true);
    try {
      const r = await salvarContatos([{ nome: $("ctNome").value.trim(), telefone: tel }], $("ctAceite").checked, listaEt($("ctEt").value));
      $("ctNome").value = ""; $("ctTel").value = "";
      aviso(r.saiu ? "Esta pessoa tinha saído da lista. Continua fora." : r.novos ? "Contato adicionado." : "Contato já existia; atualizei.");
      telaContatos();
    } catch (e) { falha(e); }
  });
  $("ctImpAbrir").addEventListener("click", function () { $("imRes").textContent = ""; $("jImportar").showModal(); });
  $("imSalvar").addEventListener("click", async function () {
    const linhas = $("imTexto").value.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    const ok = [], erros = [];
    linhas.forEach(function (l) {
      let nome = "", tel = "";
      if (/[;\t]/.test(l)) {
        const p = l.split(/[;\t]/); tel = p[p.length - 1]; nome = p.slice(0, -1).join(" ");
        if (normFone(nome).length >= 10 && normFone(tel).length < 10) { const x = nome; nome = tel; tel = x; }
      } else {
        const m = l.match(/^(.*?)[\s,]*([+(]?\d[\d\s()+-]{8,})$/);
        if (m) { nome = m[1]; tel = m[2]; }
      }
      const f = normFone(tel);
      if (foneValido(f)) ok.push({ nome: nome.trim(), telefone: f }); else erros.push(l);
    });
    if (!ok.length) return ($("imRes").textContent = "Não achei nenhum telefone válido.");
    if (!confirm("Importar " + ok.length + " pessoa(s)" + ($("imAceite").checked ? ", marcadas como AUTORIZADAS a receber mensagens" : ", sem autorização para disparos") + "?")) return;
    try {
      const r = await salvarContatos(ok, $("imAceite").checked, listaEt($("imEt").value));
      $("imRes").textContent = r.novos + " novos, " + r.atualizados + " atualizados" + (r.saiu ? ", " + r.saiu + " continuam fora da lista" : "") + (erros.length ? ". Linhas ignoradas (telefone inválido): " + erros.length : "") + ".";
      $("imTexto").value = ""; telaContatos();
    } catch (e) { falha(e); }
  });
  $("ctImpAlunos").addEventListener("click", async function () {
    try {
      const ps = await ler(supa().from("perfis").select("id,nome,telefone,papel,ativo").eq("papel", "cliente").eq("ativo", true).not("telefone", "is", null));
      const pessoas = [];
      ps.forEach(function (p) { const f = normFone(p.telefone); if (foneValido(f)) pessoas.push({ nome: p.nome, telefone: f, perfil_id: p.id }); });
      if (!pessoas.length) return aviso("Nenhum aluno com WhatsApp cadastrado.", true);
      if (!confirm("Importar " + pessoas.length + " aluno(s) com WhatsApp cadastrado, com a etiqueta \"aluno\"?")) return;
      const aceite = confirm("Eles autorizaram receber mensagens pelo WhatsApp?\n\nOK = sim, entram nos disparos.\nCancelar = não, ficam salvos sem autorização.");
      const r = await salvarContatos(pessoas, aceite, ["aluno"]);
      aviso(r.novos + " novos, " + r.atualizados + " atualizados."); telaContatos();
    } catch (e) { falha(e); }
  });
  /* ---------- listas (importadas de Excel, CSV ou PDF) ---------- */
  let listaParaDisparo = null;
  function listasExistentes() {
    const mapa = {};
    contatos.forEach(function (c) {
      (c.etiquetas || []).forEach(function (e) {
        if (e.indexOf(LISTA) !== 0) return;
        const m = mapa[e] || (mapa[e] = { et: e, nome: e.slice(LISTA.length), total: 0, podem: 0 });
        m.total++; if (c.optin && !c.optout) m.podem++;
      });
    });
    return Object.keys(mapa).map(function (k) { return mapa[k]; }).sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }); });
  }
  function desenharListas() {
    const ls = listasExistentes();
    $("lsConta").textContent = ls.length + (ls.length === 1 ? " lista" : " listas");
    $("lsLista").innerHTML = ls.length ? ls.map(function (l) {
      return "<tr><td><b>" + esc(l.nome) + "</b></td><td>" + l.total + "</td><td>" + l.podem + (l.podem < l.total ? ' <span class="vazio">(' + (l.total - l.podem) + " sem autorização ou fora)</span>" : "") + '</td><td>' +
        '<button class="btn peq contorno" data-ls-ver="' + esc(l.et) + '">Ver contatos</button> <button class="btn peq" data-ls-disparar="' + esc(l.et) + '">Disparar</button> ' +
        '<button class="btn peq perigo" data-ls-apagar="' + esc(l.et) + '">Apagar lista</button></td></tr>';
    }).join("") : '<tr><td colspan="4" class="vazio">Nenhuma lista ainda. Use “Importar lista de arquivo”.</td></tr>';
  }
  $("lsLista").addEventListener("click", async function (ev) {
    const ver = ev.target.closest("[data-ls-ver]"), dis = ev.target.closest("[data-ls-disparar]"), ap = ev.target.closest("[data-ls-apagar]");
    if (ver) { $("ctFiltroEt").value = ver.dataset.lsVer; desenharContatos(); $("ctBusca").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (dis) { listaParaDisparo = dis.dataset.lsDisparar; abrirAba("disparos"); return; }
    if (!ap) return;
    const et = ap.dataset.lsApagar, l = listasExistentes().find(function (x) { return x.et === et; });
    if (!l || !confirm('Apagar a lista "' + l.nome + '"?\n\nOs ' + l.total + " contatos continuam salvos; só sai a marcação da lista.")) return;
    try {
      const alvo = contatos.filter(function (c) { return (c.etiquetas || []).indexOf(et) > -1; });
      for (let i = 0; i < alvo.length; i += 10) {
        await Promise.all(alvo.slice(i, i + 10).map(function (c) {
          return ler(supa().from("wa_contatos").update({ etiquetas: c.etiquetas.filter(function (x) { return x !== et; }) }).eq("id", c.id).select("id"));
        }));
      }
      aviso("Lista apagada."); telaContatos();
    } catch (e) { falha(e); }
  });

  let lsArquivos = [];          // [{ nome, linhas }]
  let lsResultado = null;
  const nomeListaLimpo = function (v) { return String(v || "").replace(/[,;]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40); };
  function proximoNomeLista() {
    const usados = listasExistentes().map(function (l) { return l.nome.toLowerCase(); });
    let n = 1; while (usados.indexOf("lista " + n) > -1) n++;
    return "Lista " + n;
  }
  function avisoAceite() {
    $("lsAviso").textContent = $("lsAceite").checked ? "" : "Sem esta marcação a lista é criada, mas ninguém dela entra nos disparos (só quem autorizou recebe).";
  }
  function previaLista(r) {
    const chip = function (cl, t) { return '<span class="selo ' + cl + '">' + t + "</span>"; };
    let h = '<div class="ls-resumo">' + chip("ok", r.itens.length + " prontos para a lista") +
      (r.corrigidos ? chip("ouro", r.corrigidos + " com o número corrigido") : "") +
      (r.semNome ? chip("pendente", r.semNome + " sem nome (a mensagem sai com um espaço no lugar do nome)") : "") +
      (r.ignorados.length ? chip("off", r.ignorados.length + " ignorados") : "") +
      (r.duplicados ? chip("", r.duplicados + " repetidos juntados") : "") + "</div>";
    if (r.itens.length) {
      h += '<div class="tabela-wrap"><table class="t"><thead><tr><th>Nome</th><th>WhatsApp</th><th>Observação</th></tr></thead><tbody>' +
        r.itens.slice(0, 100).map(function (p) { return "<tr><td>" + (p.nome ? esc(p.nome) : '<span class="vazio">(sem nome)</span>') + "</td><td>" + esc(foneBR(p.fone)) + '</td><td class="quebra">' + esc(p.avisos.join("; ")) + "</td></tr>"; }).join("") +
        (r.itens.length > 100 ? '<tr><td colspan="3" class="vazio">Mostrando 100 de ' + r.itens.length + ".</td></tr>" : "") + "</tbody></table></div>";
    }
    if (r.ignorados.length) {
      h += "<details><summary>Ignorados (" + r.ignorados.length + ')</summary><div class="tabela-wrap"><table class="t"><thead><tr><th>Linha</th><th>Nome</th><th>Telefone no arquivo</th><th>Motivo</th></tr></thead><tbody>' +
        r.ignorados.slice(0, 200).map(function (i) { return "<tr><td>" + i.linha + "</td><td>" + esc(i.nome) + "</td><td>" + esc(i.bruto) + '</td><td class="quebra">' + esc(i.motivo) + "</td></tr>"; }).join("") + "</tbody></table></div></details>";
    }
    $("lsPrev").innerHTML = h;
  }
  function reprocessarLista() {
    if (!lsArquivos.length) { lsResultado = null; $("lsPrev").innerHTML = ""; $("lsSalvar").disabled = true; return; }
    const ddd = $("lsDdd").value.replace(/\D/g, "");
    lsResultado = WaLista.juntarResultados(lsArquivos.map(function (a) { return WaLista.processarLinhas(a.linhas, { ddd: ddd }); }));
    const r = lsResultado;
    $("lsRes").textContent = r.lidas + " linha(s) lidas de " + lsArquivos.length + " arquivo(s)." + (r.itens.length ? "" : " Não achei nenhum telefone válido.");
    previaLista(r);
    $("lsSalvar").disabled = !r.itens.length;
  }
  $("ctImpArq").addEventListener("click", function () {
    lsArquivos = []; lsResultado = null;
    $("lsArquivo").value = ""; $("lsNome").value = proximoNomeLista(); $("lsRes").textContent = ""; $("lsPrev").innerHTML = ""; $("lsSalvar").disabled = true;
    avisoAceite(); $("jLista").showModal();
  });
  $("lsAceite").addEventListener("change", avisoAceite);
  $("lsDdd").addEventListener("input", reprocessarLista);
  $("lsArquivo").addEventListener("change", async function () {
    const arqs = Array.prototype.slice.call(this.files || []);
    lsArquivos = []; $("lsSalvar").disabled = true; $("lsPrev").innerHTML = "";
    if (!arqs.length) { $("lsRes").textContent = ""; return; }
    $("lsRes").textContent = "Lendo o arquivo...";
    try {
      for (const f of arqs) lsArquivos.push({ nome: f.name, linhas: await WaLista.linhasDoArquivo(f) });
      reprocessarLista();
    } catch (e) { lsArquivos = []; $("lsRes").textContent = e.message || String(e); }
  });
  $("lsSalvar").addEventListener("click", async function () {
    const r = lsResultado; if (!r || !r.itens.length) return;
    const digitado = nomeListaLimpo($("lsNome").value) || proximoNomeLista();
    const igual = listasExistentes().find(function (l) { return l.nome.toLowerCase() === digitado.toLowerCase(); });
    const et = LISTA + (igual ? igual.nome : digitado), aceite = $("lsAceite").checked;
    if (!confirm((igual ? 'Já existe a lista "' + igual.nome + '". Estas pessoas serão ACRESCENTADAS a ela.\n\n' : "") + 'Criar a lista "' + (igual ? igual.nome : digitado) + '" com ' + r.itens.length + " pessoa(s)" +
      (aceite ? ", marcadas como AUTORIZADAS a receber mensagens?" : ", sem autorização para disparos?"))) return;
    this.disabled = true;
    try {
      const x = await salvarContatos(r.itens.map(function (p) { return { nome: p.nome, telefone: p.fone }; }), aceite, [et]);
      $("lsRes").textContent = 'Lista "' + (igual ? igual.nome : digitado) + '" pronta: ' + x.novos + " novos, " + x.atualizados + " que já existiam" + (x.saiu ? ", " + x.saiu + " continuam fora da lista de disparos (pediram para sair)" : "") + "." +
        (aceite ? "" : " Como a autorização não foi marcada, ninguém desta lista recebe disparo ainda.");
      $("lsPrev").innerHTML = ""; lsArquivos = []; lsResultado = null; $("lsArquivo").value = "";
      aviso("Lista criada."); telaContatos();
    } catch (e) { falha(e); this.disabled = false; }
  });

  let editando = null;
  $("ctLista").addEventListener("click", function (ev) {
    const cv = ev.target.closest("[data-ct-conversar]");
    if (cv) { conversaId = cv.dataset.ctConversar; abrirAba("conversas"); return; }
    const ed = ev.target.closest("[data-ct-editar]"); if (!ed) return;
    editando = contatos.find(function (c) { return c.id === ed.dataset.ctEditar; }); if (!editando) return;
    $("jcTitulo").textContent = editando.nome || "Contato";
    $("jcNome").value = editando.nome || ""; $("jcTel").value = foneBR(editando.telefone);
    $("jcEt").value = (editando.etiquetas || []).join(", "); $("jcNotas").value = editando.notas || "";
    $("jcOptin").checked = !!editando.optin; $("jcOptout").checked = !!editando.optout;
    $("jContato").showModal();
  });
  $("jcSalvar").addEventListener("click", async function () {
    if (!editando) return;
    const optin = $("jcOptin").checked, optout = $("jcOptout").checked, agora = new Date().toISOString();
    const campos = { nome: $("jcNome").value.trim() || null, etiquetas: listaEt($("jcEt").value), notas: $("jcNotas").value.trim() || null, optin: optin, optout: optout };
    if (optin && !editando.optin) campos.optin_em = agora;
    if (optout && !editando.optout) campos.optout_em = agora;
    try {
      await ler(supa().from("wa_contatos").update(campos).eq("id", editando.id).select("id"));
      if (optout) await supa().from("wa_disparo_itens").update({ status: "pulado", erro: "Saiu da lista" }).eq("contato_id", editando.id).eq("status", "pendente");
      $("jContato").close(); aviso("Salvo."); telaContatos();
    } catch (e) { falha(e); }
  });
  $("jcApagar").addEventListener("click", async function () {
    if (!editando || !confirm("Apagar este contato e todas as mensagens dele? Não dá para desfazer.")) return;
    try { await ler(supa().from("wa_contatos").delete().eq("id", editando.id).select("id")); $("jContato").close(); aviso("Contato apagado."); telaContatos(); } catch (e) { falha(e); }
  });

  /* ---------- conversas ---------- */
  function iconeStatus(m) {
    if (m.direcao !== "saida") return "";
    return { enviando: "…", enviada: "✓", entregue: "✓✓", lida: '<span class="wa-vis">✓✓</span>', falhou: "⚠" }[m.status] || "";
  }
  async function carregarLista() {
    const dados = await ler(supa().from("wa_contatos").select("id,nome,telefone,ultima_msg_em,ultima_msg_texto,nao_lidas,precisa_humano,optout,ultima_entrada_em").not("ultima_msg_em", "is", null).order("ultima_msg_em", { ascending: false }).limit(200));
    const total = dados.reduce(function (s, c) { return s + (c.nao_lidas || 0); }, 0);
    const bd = $("bdNaoLidas"); bd.hidden = !total; bd.textContent = total;
    const b = $("cvBusca").value.trim().toLowerCase(), bdg = b.replace(/\D/g, "");
    const lista = dados.filter(function (c) {
      if ($("cvSoHumano").checked && !c.precisa_humano) return false;
      if (b && !((c.nome || "").toLowerCase().indexOf(b) > -1 || (bdg && c.telefone.indexOf(bdg) > -1))) return false;
      return true;
    });
    $("cvLista").innerHTML = lista.length ? lista.map(function (c) {
      return '<button type="button" class="wa-item' + (c.id === conversaId ? " ativa" : "") + '" data-cv="' + c.id + '"><b>' + esc(c.nome || foneBR(c.telefone)) + "</b><small>" + esc(c.ultima_msg_texto || "") + "</small>" +
        (c.nao_lidas ? '<span class="selo ouro">' + c.nao_lidas + "</span>" : c.precisa_humano ? '<span class="selo off">!</span>' : "") + "</button>";
    }).join("") : '<p class="vazio">Nenhuma conversa ainda. Quando alguém escrever para o número do CRM, aparece aqui.</p>';
  }
  $("cvLista").addEventListener("click", function (ev) { const b = ev.target.closest("[data-cv]"); if (b) { conversaId = b.dataset.cv; abrirConversa(); } });
  $("cvBusca").addEventListener("input", function () { carregarLista().catch(function () {}); });
  $("cvSoHumano").addEventListener("change", function () { carregarLista().catch(function () {}); });

  function desenharMensagens(msgs) {
    const caixa = $("cvMsgs"); if (!caixa) return;
    const noFim = caixa.scrollHeight - caixa.scrollTop - caixa.clientHeight < 80;
    caixa.innerHTML = msgs.length ? msgs.map(function (m) {
      const cls = m.direcao === "saida" ? "saida" + (m.origem === "robo" ? " robo" : "") : "";
      const quem = m.direcao === "saida" ? ({ robo: "Robô", disparo: "Disparo", painel: "Você" }[m.origem] || "") : "";
      const soRotulo = m.midia_url && /^\[(imagem|vídeo|áudio)\]$/.test(String(m.texto || ""));
      return '<div class="wa-msg ' + cls + '">' + (m.midia_url ? '<div style="margin-bottom:4px">' + prevMidia(m.midia_url, m.midia_tipo) + "</div>" : "") + (soRotulo ? "" : '<div class="texto">' + esc(m.texto || "") + "</div>") +
        (m.template_nome ? '<div class="meta">template ' + esc(m.template_nome) + "</div>" : "") +
        '<div class="meta"><span>' + esc(quando(m.criado_em)) + "</span>" + (quem ? "<span>" + quem + "</span>" : "") + "<span>" + iconeStatus(m) + "</span></div>" +
        (m.status === "falhou" && m.erro ? '<div class="erro">' + esc(m.erro) + "</div>" : "") + "</div>";
    }).join("") : '<p class="vazio" style="margin:auto">Sem mensagens.</p>';
    if (noFim) caixa.scrollTop = caixa.scrollHeight;
  }
  async function msgsDaConversa() {
    const d = await ler(supa().from("wa_mensagens").select("id,direcao,texto,status,erro,origem,template_nome,criado_em,midia_url,midia_tipo").eq("contato_id", conversaId).order("criado_em", { ascending: false }).limit(150));
    return d.reverse();
  }
  async function abrirConversa() {
    try {
      conversaCont = await ler(supa().from("wa_contatos").select("*").eq("id", conversaId).single());
      const msgs = await msgsDaConversa();
      const aberta = conversaCont.ultima_entrada_em && Date.now() - new Date(conversaCont.ultima_entrada_em).getTime() < 86400000;
      $("cvThread").innerHTML = '<div class="chat-caixa"><div class="thread-topo" style="padding:12px 14px;border-bottom:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap;align-items:center"><b>' + esc(conversaCont.nome || foneBR(conversaCont.telefone)) + "</b><span class=\"vazio\">" + esc(foneBR(conversaCont.telefone)) + "</span>" + situacao(conversaCont) +
        (conversaCont.precisa_humano ? '<span class="selo off">pediu atendimento</span>' : "") + '</div><div class="chat-lista" id="cvMsgs" style="height:min(52vh,500px)"></div>' +
        (aberta
          ? '<div class="chat-form"><textarea id="cvTexto" rows="2" maxlength="4000" placeholder="Escreva sua resposta..."></textarea><button class="btn peq contorno" type="button" id="cvAnexo" style="min-width:48px;padding:0 12px" title="Anexar vídeo, áudio, foto ou PDF" aria-label="Anexar arquivo">📎</button><input type="file" id="cvArquivo" hidden accept="' + ACEITA.todos + '"><button class="btn auto" type="button" id="cvEnviar">Enviar</button></div>'
          : '<div class="chat-form" style="flex-wrap:wrap"><p class="vazio" style="flex:1;min-width:220px">Passaram mais de 24 h desde a última mensagem desta pessoa. Pelo WhatsApp oficial, só dá para enviar um template aprovado.</p><button class="btn auto" type="button" id="cvTemplate">Enviar template</button></div>') + "</div>";
      desenharMensagens(msgs);
      const caixa = $("cvMsgs"); caixa.scrollTop = caixa.scrollHeight;
      ultimaAssinatura = msgs.length + ":" + (msgs.length ? msgs[msgs.length - 1].id + msgs[msgs.length - 1].status : "");
      if (conversaCont.nao_lidas) { await supa().from("wa_contatos").update({ nao_lidas: 0 }).eq("id", conversaCont.id); }
      if ($("cvEnviar")) {
        $("cvEnviar").addEventListener("click", enviarTexto);
        $("cvAnexo").addEventListener("click", function () { $("cvArquivo").click(); });
        $("cvArquivo").addEventListener("change", enviarArquivoConversa);
        $("cvTexto").addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviarTexto(); });
      }
      if ($("cvTemplate")) $("cvTemplate").addEventListener("click", function () { abrirEnvioTemplate(conversaCont); });
      carregarLista().catch(function () {});
    } catch (e) { falha(e); }
  }
  async function enviarTexto() {
    const t = $("cvTexto").value.trim(); if (!t) return;
    const b = $("cvEnviar"); b.disabled = true;
    const r = await wa({ acao: "enviar_texto", contato_id: conversaId, texto: t });
    b.disabled = false;
    if (!r.ok) { aviso(r.erro || "Não enviou.", true); if (r.precisa_template) abrirConversa(); return; }
    $("cvTexto").value = ""; abrirConversa();
  }
  async function enviarArquivoConversa() {
    const f = this.files[0]; this.value = ""; if (!f) return;
    const b = $("cvAnexo"); b.disabled = true; b.textContent = "…";
    try {
      const up = await subirMidia(f, null);
      const legenda = $("cvTexto").value.trim();
      const r = await wa({ acao: "enviar_midia", contato_id: conversaId, url: up.url, tipo: up.tipo, nome: up.nome, legenda: legenda });
      if (!r.ok) { aviso(r.erro || "Não enviou.", true); if (r.precisa_template) abrirConversa(); return; }
      if (up.tipo !== "audio") $("cvTexto").value = "";
      abrirConversa();
    } catch (e) { aviso(e.message || String(e), true); }
    finally { const x = $("cvAnexo"); if (x) { x.disabled = false; x.textContent = "📎"; } }
  }
  async function atualizarConversa() {
    if (!conversaId || !$("cvMsgs")) return;
    const msgs = await msgsDaConversa();
    const ass = msgs.length + ":" + (msgs.length ? msgs[msgs.length - 1].id + msgs[msgs.length - 1].status : "");
    if (ass !== ultimaAssinatura) {
      ultimaAssinatura = ass; desenharMensagens(msgs);
      const novas = await ler(supa().from("wa_contatos").select("nao_lidas").eq("id", conversaId).single());
      if (novas.nao_lidas) await supa().from("wa_contatos").update({ nao_lidas: 0 }).eq("id", conversaId);
    }
  }
  async function telaConversas() {
    await carregarLista();
    if (conversaId) abrirConversa();
  }

  /* ---------- enviar template (conversa individual) ---------- */
  let lerVarsJt = function () { return { vars: [], midia: "" }; };
  async function abrirEnvioTemplate(c) {
    await carregarTemplates();
    const ok = templates.filter(function (t) { return t.status === "APPROVED"; });
    if (!ok.length) return aviso("Ainda não há template aprovado. Crie um na aba Templates e espere a aprovação do Meta.", true);
    $("jtPara").textContent = "Para: " + (c.nome || "") + " " + foneBR(c.telefone);
    $("jtSel").innerHTML = ok.map(function (t) { return '<option value="' + esc(t.nome) + '|' + esc(t.idioma) + '">' + esc(t.nome) + " (" + esc(ROT_CAT[t.categoria] || "") + ")</option>"; }).join("");
    $("jtRes").textContent = "";
    function trocar() {
      const [n, i] = $("jtSel").value.split("|");
      const t = ok.find(function (x) { return x.nome === n && x.idioma === i; });
      lerVarsJt = montarVars($("jtVars"), t, []);
      const prev = function () { $("jtPrev").textContent = preencherPrev(t, lerVarsJt().vars); };
      $("jtVars").oninput = prev; prev();
    }
    $("jtSel").onchange = trocar; trocar();
    $("jtEnviar").onclick = async function () {
      const [n, i] = $("jtSel").value.split("|"), v = lerVarsJt();
      if (v.vars.some(function (x) { return !x; })) return ($("jtRes").textContent = "Preencha todas as variáveis.");
      this.disabled = true;
      const r = await wa({ acao: "enviar_template", contato_id: c.id, template_nome: n, idioma: i, variaveis: v.vars, midia: v.midia });
      this.disabled = false;
      if (!r.ok) return ($("jtRes").textContent = r.erro || "Não enviou.");
      $("jTemplate").close(); aviso("Template enviado."); conversaId = c.id; abrirConversa();
    };
    $("jTemplate").showModal();
  }

  /* ---------- disparos ---------- */
  let lerVarsDp = function () { return { vars: [], midia: "" }; };
  function tplSelecionado() {
    const [n, i] = ($("dpTemplate").value || "|").split("|");
    return templates.find(function (t) { return t.nome === n && t.idioma === i && t.status === "APPROVED"; });
  }
  async function resumoDisparo() {
    const t = tplSelecionado(); if (!t) return ($("dpResumo").textContent = "");
    try {
      let q = supa().from("wa_contatos").select("id", { count: "exact", head: true }).eq("optin", true).eq("optout", false);
      if ($("dpEtiqueta").value) q = q.contains("etiquetas", [$("dpEtiqueta").value]);
      const r = await q; const n = r.count || 0;
      const preco = t.categoria === "MARKETING" ? Number(cfg.preco_marketing) : t.categoria === "UTILITY" ? Number(cfg.preco_utilidade) : 0;
      const dias = Math.max(1, Math.ceil(n / cfg.limite_diario));
      let semNome = 0;
      try {
        if (t.qtd_variaveis > 0 && lerVarsDp().vars.some(function (v) { return /\{(primeiro_)?nome\}/i.test(v); })) {
          let q2 = supa().from("wa_contatos").select("id", { count: "exact", head: true }).eq("optin", true).eq("optout", false).or("nome.is.null,nome.eq.");
          if ($("dpEtiqueta").value) q2 = q2.contains("etiquetas", [$("dpEtiqueta").value]);
          semNome = (await q2).count || 0;
        }
      } catch (e) {}
      $("dpResumo").textContent = n + " pessoa(s) vão receber." + (semNome ? " " + semNome + " sem nome: nelas a mensagem sai com um espaço no lugar do nome." : "") + " Custo estimado: " + BR.format(n * preco) + " (" + (ROT_CAT[t.categoria] || "") + "). " +
        (n > cfg.limite_diario ? "Por causa do limite de " + cfg.limite_diario + " pessoas por dia, o envio leva " + dias + " dias; continua sozinho a cada dia." : "Cabe em um dia.");
    } catch (e) { $("dpResumo").textContent = ""; }
  }
  function trocarTemplateDp() {
    const t = tplSelecionado();
    lerVarsDp = montarVars($("dpVars"), t, []);
    $("dpMidiaBox").hidden = true;
    const prev = function () { $("dpPrev").textContent = t ? preencherPrev(t, lerVarsDp().vars) : "Escolha um template."; };
    $("dpVars").oninput = prev; prev(); resumoDisparo();
  }
  $("dpTemplate").addEventListener("change", trocarTemplateDp);
  $("dpEtiqueta").addEventListener("change", resumoDisparo);
  async function telaDisparos() {
    await carregarConfig(); await carregarTemplates(); await carregarContatos();
    const ok = templates.filter(function (t) { return t.status === "APPROVED"; });
    const atual = $("dpTemplate").value;
    $("dpTemplate").innerHTML = ok.length ? ok.map(function (t) { return '<option value="' + esc(t.nome) + '|' + esc(t.idioma) + '">' + esc(t.nome) + " (" + esc(ROT_CAT[t.categoria] || "") + ")</option>"; }).join("") : '<option value="">Nenhum template aprovado ainda</option>';
    if (atual) $("dpTemplate").value = atual;
    if (listaParaDisparo) { $("dpEtiqueta").value = listaParaDisparo; listaParaDisparo = null; }
    trocarTemplateDp();
    const u = await wa({ acao: "uso_hoje" });
    $("dpUso").textContent = u.ok ? "Nas últimas 24 h você já enviou template para " + u.usados + " de " + u.limite + " pessoas permitidas." : "";
    await desenharDisparos();
  }
  const ROT_DP = { rascunho: ["Rascunho", "pendente"], agendado: ["Na fila", "pendente"], enviando: ["Enviando", "ouro"], pausado: ["Pausado", "off"], concluido: ["Concluído", "ok"], cancelado: ["Cancelado", "off"] };
  async function desenharDisparos() {
    const ds = await ler(supa().from("wa_disparos").select("*").order("criado_em", { ascending: false }).limit(30));
    let res = {};
    try { (await ler(supa().rpc("wa_disparos_resumo"))).forEach(function (r) { res[r.disparo_id] = r; }); } catch (e) {}
    const tb = $("dpLista");
    if (!ds.length) { tb.innerHTML = '<tr><td colspan="8" class="vazio">Nenhum disparo ainda.</td></tr>'; return; }
    tb.innerHTML = ds.map(function (d) {
      const r = res[d.id] || { enviados: 0, entregues: 0, lidos: 0, falhas: 0, pulados: 0 };
      const feitos = Number(r.enviados) + Number(r.falhas) + Number(r.pulados), pct = d.total ? Math.min(100, Math.round(feitos / d.total * 100)) : 0;
      const st = ROT_DP[d.status] || [d.status, "pendente"];
      let bt = "";
      if (d.status === "rascunho") bt = '<button class="btn peq" data-dp="iniciar" data-id="' + d.id + '">Iniciar</button> ';
      if (d.status === "pausado") bt = '<button class="btn peq" data-dp="iniciar" data-id="' + d.id + '">Retomar</button> ';
      if (d.status === "agendado" || d.status === "enviando") bt = '<button class="btn peq contorno" data-dp="pausar" data-id="' + d.id + '">Pausar</button> ';
      if (["agendado", "enviando", "pausado"].indexOf(d.status) > -1) bt += '<button class="btn peq perigo" data-dp="cancelar" data-id="' + d.id + '">Cancelar</button>';
      if (["rascunho", "concluido", "cancelado"].indexOf(d.status) > -1) bt += '<button class="btn peq perigo" data-dp="apagar" data-id="' + d.id + '">Apagar</button>';
      return "<tr><td><b>" + esc(d.nome) + '</b><br><span class="vazio">' + esc(quando(d.criado_em)) + (d.agendado_para ? " · agendado " + esc(quando(d.agendado_para)) : "") + "</span></td><td>" + esc(d.template_nome) + '</td><td><span class="selo ' + st[1] + '">' + esc(st[0]) + "</span></td>" +
        '<td><div class="wa-barra"><i style="width:' + pct + '%"></i></div><span class="vazio">' + feitos + " de " + d.total + "</span></td><td>" + r.entregues + "</td><td>" + r.lidos + "</td><td>" + r.falhas + "</td><td>" + bt + "</td></tr>";
    }).join("");
  }
  $("dpLista").addEventListener("click", async function (ev) {
    const b = ev.target.closest("[data-dp]"); if (!b) return;
    const id = b.dataset.id, acao = b.dataset.dp;
    try {
      if (acao === "iniciar") {
        const r = await wa({ acao: "iniciar_disparo", disparo_id: id });
        if (!r.ok) return aviso(r.erro || "Não iniciou.", true);
        const p = await wa({ acao: "processar_agora" });
        aviso(p.ok && (p.enviados || p.falhas) ? p.enviados + " enviadas agora." + (p.motivo ? " " + p.motivo : "") : (p.motivo || "Na fila. O envio roda a cada 5 minutos, entre " + cfg.disparo_hora_inicio + "h e " + cfg.disparo_hora_fim + "h."));
      } else if (acao === "pausar") {
        await ler(supa().from("wa_disparos").update({ status: "pausado" }).eq("id", id).select("id")); aviso("Pausado.");
      } else if (acao === "cancelar") {
        if (!confirm("Cancelar este disparo? Quem ainda não recebeu não receberá.")) return;
        await ler(supa().from("wa_disparos").update({ status: "cancelado" }).eq("id", id).select("id")); aviso("Cancelado.");
      } else if (acao === "apagar") {
        if (!confirm("Apagar este disparo e o histórico dele?")) return;
        await ler(supa().from("wa_disparos").delete().eq("id", id).select("id")); aviso("Apagado.");
      }
      desenharDisparos();
    } catch (e) { falha(e); }
  });
  $("dpAtualizar").addEventListener("click", function () { telaDisparos().catch(falha); });
  $("dpProcessar").addEventListener("click", async function () {
    const r = await wa({ acao: "processar_agora" });
    aviso(r.ok ? (r.enviados + " enviadas, " + r.falhas + " falhas." + (r.motivo ? " " + r.motivo : "")) : (r.erro || "Não rodou."), !r.ok);
    desenharDisparos();
  });
  async function criarDisparo(iniciar) {
    const t = tplSelecionado();
    const nome = $("dpNome").value.trim();
    if (!nome) return aviso("Dê um nome ao disparo.", true);
    if (!t) return aviso("Escolha um template aprovado.", true);
    const v = lerVarsDp();
    if (v.vars.some(function (x) { return !x; })) return aviso("Preencha todas as variáveis do template.", true);
    const precisaMidia = ["IMAGE", "VIDEO", "DOCUMENT"].indexOf(String(t.cabecalho_tipo || "").toUpperCase()) > -1;
    if (precisaMidia && !/^https:\/\//.test(v.midia)) return aviso("Informe o link (https://) do arquivo do cabeçalho.", true);
    const quando_ = $("dpQuando").value ? new Date($("dpQuando").value) : null;
    if (quando_ && quando_.getTime() < Date.now() - 60000) return aviso("A data de envio já passou.", true);
    if (iniciar && !confirm("Enviar \"" + nome + "\"?\n\n" + $("dpResumo").textContent)) return;
    try {
      const novo = await ler(supa().from("wa_disparos").insert({
        nome: nome, template_nome: t.nome, idioma: t.idioma, categoria: t.categoria, variaveis: v.vars, cabecalho_midia: precisaMidia ? v.midia : null,
        filtro_etiqueta: $("dpEtiqueta").value || null, agendado_para: quando_ ? quando_.toISOString() : null, status: "rascunho", criado_por: perfil.id
      }).select("id").single());
      $("dpNome").value = "";
      if (iniciar) {
        const r = await wa({ acao: "iniciar_disparo", disparo_id: novo.id });
        if (!r.ok) { aviso("Salvei como rascunho, mas não iniciou: " + (r.erro || ""), true); return desenharDisparos(); }
        if (!quando_) {
          const p = await wa({ acao: "processar_agora" });
          aviso(p.ok && (p.enviados || p.falhas) ? p.enviados + " enviadas agora." + (p.motivo ? " " + p.motivo : "") : (p.motivo || "Na fila."));
        } else aviso("Agendado.");
      } else aviso("Rascunho salvo.");
      desenharDisparos();
    } catch (e) { falha(e); }
  }
  $("dpCriar").addEventListener("click", function () { criarDisparo(true); });
  $("dpRascunho").addEventListener("click", function () { criarDisparo(false); });

  /* ---------- robô ---------- */
  const ROT_ACAO = { responder: "Responde", sair_lista: "Tira da lista", entrar_lista: "Volta para a lista", chamar_humano: "Chama você" };
  const ROT_MODO = { exata: "igual a", palavra: "tem", contem: "contém" };
  async function telaRobo() {
    await carregarConfig();
    $("rbAtivo").checked = !!cfg.robo_ativo; $("rbPadrao").value = cfg.robo_resposta_padrao || "";
    regras = await ler(supa().from("wa_robo_regras").select("*").order("ordem").order("criado_em"));
    $("rgLista").innerHTML = regras.length ? regras.map(function (r) {
      return "<tr><td>" + r.ordem + "</td><td><b>" + esc(r.nome) + '</b></td><td class="quebra">' + esc(ROT_MODO[r.modo]) + ": " + esc((r.gatilhos || []).join(", ")) + "</td><td>" + esc(ROT_ACAO[r.acao]) + (r.resposta ? '<br><span class="vazio">' + esc(r.resposta.slice(0, 80)) + "</span>" : "") +
        '</td><td><input type="checkbox" data-rg-ativo="' + r.id + '" ' + (r.ativo ? "checked" : "") + ' aria-label="Regra ativa" style="width:20px;height:20px;accent-color:var(--navy)"></td><td><button class="btn peq contorno" data-rg-editar="' + r.id + '">Editar</button></td></tr>';
    }).join("") : '<tr><td colspan="6" class="vazio">Nenhuma regra.</td></tr>';
  }
  $("rbSalvar").addEventListener("click", async function () {
    try {
      await ler(supa().from("wa_config").update({ robo_ativo: $("rbAtivo").checked, robo_resposta_padrao: $("rbPadrao").value.trim() || null }).eq("id", 1).select("id"));
      aviso($("rbAtivo").checked ? "Robô ligado." : "Robô desligado."); carregarConfig();
    } catch (e) { falha(e); }
  });
  $("rgLista").addEventListener("change", async function (ev) {
    const c = ev.target.closest("[data-rg-ativo]"); if (!c) return;
    try { await ler(supa().from("wa_robo_regras").update({ ativo: c.checked }).eq("id", c.dataset.rgAtivo).select("id")); } catch (e) { c.checked = !c.checked; falha(e); }
  });
  let regraAtual = null;
  function abrirRegra(r) {
    regraAtual = r;
    $("jrTitulo").textContent = r ? "Editar regra" : "Nova regra";
    $("jrNome").value = r ? r.nome : ""; $("jrOrdem").value = r ? r.ordem : 100; $("jrModo").value = r ? r.modo : "palavra"; $("jrAcao").value = r ? r.acao : "responder";
    $("jrGatilhos").value = r ? (r.gatilhos || []).join(", ") : ""; $("jrResposta").value = r ? (r.resposta || "") : ""; $("jrEtiqueta").value = r ? (r.etiqueta || "") : "";
    $("jrApagar").hidden = !r; $("jRegra").showModal();
  }
  $("rgNova").addEventListener("click", function () { abrirRegra(null); });
  $("rgLista").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-rg-editar]"); if (b) abrirRegra(regras.find(function (r) { return r.id === b.dataset.rgEditar; }));
  });
  $("jrSalvar").addEventListener("click", async function () {
    const gat = $("jrGatilhos").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    const dados = { nome: $("jrNome").value.trim(), ordem: parseInt($("jrOrdem").value, 10) || 100, modo: $("jrModo").value, acao: $("jrAcao").value, gatilhos: gat, resposta: $("jrResposta").value.trim() || null, etiqueta: $("jrEtiqueta").value.trim().toLowerCase() || null };
    if (!dados.nome) return aviso("Dê um nome à regra.", true);
    if (!gat.length) return aviso("Escreva ao menos uma palavra ou frase.", true);
    if (dados.acao === "responder" && !dados.resposta) return aviso("Escreva a resposta.", true);
    try {
      if (regraAtual) await ler(supa().from("wa_robo_regras").update(dados).eq("id", regraAtual.id).select("id"));
      else await ler(supa().from("wa_robo_regras").insert(dados).select("id"));
      $("jRegra").close(); aviso("Regra salva."); telaRobo();
    } catch (e) { falha(e); }
  });
  $("jrApagar").addEventListener("click", async function () {
    if (!regraAtual || !confirm("Apagar esta regra?")) return;
    try { await ler(supa().from("wa_robo_regras").delete().eq("id", regraAtual.id).select("id")); $("jRegra").close(); aviso("Regra apagada."); telaRobo(); } catch (e) { falha(e); }
  });
  $("rbTestar").addEventListener("click", async function () {
    const t = $("rbTesteTxt").value.trim(); if (!t) return;
    const r = await wa({ acao: "testar_robo", texto: t });
    if (!r.ok) return ($("rbTesteRes").textContent = r.erro || "Não testou.");
    $("rbTesteRes").textContent = r.regra
      ? 'Regra "' + r.regra.nome + '" (' + ROT_ACAO[r.regra.acao] + ")." + (r.regra.resposta ? ' Responderia: "' + r.regra.resposta + '"' : " Sem resposta escrita.")
      : (r.padrao ? 'Nenhuma regra serve. Responderia a resposta padrão: "' + amostra(r.padrao.replace(/\{primeiro_nome\}/g, "Maria")) + '"' : "Nenhuma regra serve e não há resposta padrão: o robô não responderia.");
  });
  $("rbTesteTxt").addEventListener("keydown", function (e) { if (e.key === "Enter") $("rbTestar").click(); });

  /* ---------- fluxos ---------- */
  let fluxoAtual = null;
  const SIT_TPL = { APPROVED: "aprovado", PENDING: "em análise", REJECTED: "recusado", PAUSED: "pausado", DISABLED: "desativado" };
  function sitTpl(nome) {
    if (!nome) return "";
    const t = (templates || []).find(function (x) { return x.nome === nome; });
    if (!t) return "template não encontrado (sincronize na aba Templates)";
    return "template " + (SIT_TPL[String(t.status || "").toUpperCase()] || t.status || "?");
  }
  async function telaFluxos() {
    templates = await ler(supa().from("wa_templates").select("*").order("nome"));
    const fl = await ler(supa().from("wa_fluxos").select("*").order("criado_em"));
    const ps = await ler(supa().from("wa_fluxo_passos").select("fluxo_id"));
    const ex = await ler(supa().from("wa_fluxo_execucoes").select("fluxo_id,status"));
    $("flLista").innerHTML = fl.length ? fl.map(function (f) {
      const np = ps.filter(function (p) { return p.fluxo_id === f.id; }).length;
      const e = ex.filter(function (x) { return x.fluxo_id === f.id; });
      const ok = e.filter(function (x) { return x.status === "concluido" || x.status === "entrou"; }).length;
      return "<tr><td><b>" + esc(f.nome) + '</b></td><td class="quebra">' + esc(f.template_nome || "—") + '<br><span class="vazio">botão "' + esc(f.botao_texto || "") + '" · ' + esc(sitTpl(f.template_nome)) + "</span></td><td>" + np + "</td><td>" + e.length + (ok ? " (" + ok + " concluídos)" : "") + "</td><td>" + (f.ativo ? "Sim" : "Não") + '</td><td><button class="btn peq" data-fl="' + f.id + '">Editar</button></td></tr>';
    }).join("") : '<tr><td colspan="6" class="vazio">Nenhum fluxo ainda.</td></tr>';
    window.__fluxos = fl;
  }
  function desenharPasso(p) {
    const d = document.createElement("div"); d.className = "cartao"; d.style.margin = "8px 0"; d.dataset.passo = "1";
    d.innerHTML = '<div class="grade g2"><div><label>Esperar quantas horas depois do anterior</label><input type="number" min="0" max="720" step="0.5" class="fpHoras"></div><div><label>Template (opcional, usado se passou de 24 h)</label><select class="fpTpl"></select></div></div><label style="margin-top:8px">Texto</label><textarea rows="4" maxlength="1604" class="fpTexto"></textarea><div class="checks"><label><input type="checkbox" class="fpLink"> Incluir o link</label></div><button class="btn peq perigo fpDel" type="button">Remover</button>';
    d.querySelector(".fpHoras").value = p ? (p.atraso_min / 60) : 24;
    d.querySelector(".fpTexto").value = p ? p.texto || "" : "";
    d.querySelector(".fpLink").checked = !!(p && p.incluir_link);
    const sel = d.querySelector(".fpTpl");
    sel.innerHTML = '<option value="">Nenhum (só texto)</option>' + (templates || []).filter(function (t) { return String(t.status).toUpperCase() === "APPROVED"; }).map(function (t) { return '<option value="' + esc(t.nome) + '">' + esc(t.nome) + "</option>"; }).join("");
    sel.value = p && p.template_nome ? p.template_nome : "";
    d.querySelector(".fpDel").addEventListener("click", function () { d.remove(); });
    $("jfPassos").appendChild(d);
  }
  async function abrirFluxo(f) {
    fluxoAtual = f;
    $("jfTitulo").textContent = f ? "Editar fluxo" : "Novo fluxo";
    const x = f || { nome: "", template_nome: "", botao_texto: "", link: "", resposta_texto: "Oi, {primeiro_nome}! Aqui está o link:", incluir_link: true, perguntar_entrou: true, pergunta_texto: "Conseguiu entrar?", texto_entrou: "Que bom! Seja bem-vindo(a).", texto_nao_consegui: "Sem problema! Vou te lembrar por aqui.", etiqueta_entrou: "", etiqueta_inicio: "", ativo: true };
    $("jfNome").value = x.nome || ""; $("jfBotao").value = x.botao_texto || ""; $("jfLink").value = x.link || ""; $("jfResp").value = x.resposta_texto || "";
    $("jfInclLink").checked = !!x.incluir_link; $("jfPerg").checked = !!x.perguntar_entrou; $("jfPergTxt").value = x.pergunta_texto || "";
    $("jfTxtEntrou").value = x.texto_entrou || ""; $("jfTxtNao").value = x.texto_nao_consegui || ""; $("jfEtiEntrou").value = x.etiqueta_entrou || ""; $("jfEtiIni").value = x.etiqueta_inicio || ""; $("jfAtivo").checked = x.ativo !== false;
    $("jfTpl").innerHTML = '<option value="">Nenhum</option>' + (templates || []).map(function (t) { return '<option value="' + esc(t.nome) + '">' + esc(t.nome) + "</option>"; }).join("");
    $("jfTpl").value = x.template_nome || ""; $("jfTplSit").textContent = sitTpl(x.template_nome);
    $("jfPassos").innerHTML = "";
    if (f) (await ler(supa().from("wa_fluxo_passos").select("*").eq("fluxo_id", f.id).order("ordem"))).forEach(desenharPasso);
    $("jfApagar").hidden = !f; $("jFluxo").showModal();
  }
  $("jfTpl").addEventListener("change", function () { $("jfTplSit").textContent = sitTpl(this.value); });
  $("jfAddPasso").addEventListener("click", function () { if ($("jfPassos").children.length >= 10) return aviso("Máximo de 10 follow-ups.", true); desenharPasso(null); });
  $("jfFechar").addEventListener("click", function () { $("jFluxo").close(); });
  $("flNovo").addEventListener("click", function () { abrirFluxo(null).catch(falha); });
  $("flLista").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-fl]"); if (!b) return;
    abrirFluxo((window.__fluxos || []).find(function (f) { return f.id === b.dataset.fl; })).catch(falha);
  });
  $("jfSalvar").addEventListener("click", async function () {
    const nome = $("jfNome").value.trim(), botao = $("jfBotao").value.trim(), link = $("jfLink").value.trim();
    if (!nome || !botao) return aviso("Preencha o nome e o texto do botão.", true);
    if (link && !/^https:\/\//.test(link)) return aviso("O link precisa começar com https://", true);
    const dados = { nome: nome, template_nome: $("jfTpl").value || null, botao_texto: botao, link: link || null, resposta_texto: $("jfResp").value.trim() || null, incluir_link: $("jfInclLink").checked, perguntar_entrou: $("jfPerg").checked, pergunta_texto: $("jfPergTxt").value.trim() || null, texto_entrou: $("jfTxtEntrou").value.trim() || null, texto_nao_consegui: $("jfTxtNao").value.trim() || null, etiqueta_entrou: $("jfEtiEntrou").value.trim() || null, etiqueta_inicio: $("jfEtiIni").value.trim() || null, ativo: $("jfAtivo").checked };
    const passos = Array.prototype.slice.call($("jfPassos").children).map(function (d, i) {
      return { ordem: i + 1, atraso_min: Math.round(Number(d.querySelector(".fpHoras").value || 0) * 60), texto: d.querySelector(".fpTexto").value.trim(), incluir_link: d.querySelector(".fpLink").checked, template_nome: d.querySelector(".fpTpl").value || null };
    });
    if (passos.some(function (p) { return !p.texto; })) return aviso("Todo follow-up precisa de texto.", true);
    try {
      let id = fluxoAtual && fluxoAtual.id;
      if (id) await ler(supa().from("wa_fluxos").update(dados).eq("id", id).select("id"));
      else id = (await ler(supa().from("wa_fluxos").insert(dados).select("id").single())).id;
      await ler(supa().from("wa_fluxo_passos").delete().eq("fluxo_id", id).select("id"));
      if (passos.length) await ler(supa().from("wa_fluxo_passos").insert(passos.map(function (p) { p.fluxo_id = id; return p; })).select("id"));
      $("jFluxo").close(); aviso("Fluxo salvo."); telaFluxos();
    } catch (e) { falha(e); }
  });
  $("jfApagar").addEventListener("click", async function () {
    if (!fluxoAtual || !confirm("Apagar este fluxo e o andamento das pessoas nele?")) return;
    try { await ler(supa().from("wa_fluxos").delete().eq("id", fluxoAtual.id).select("id")); $("jFluxo").close(); aviso("Fluxo apagado."); telaFluxos(); } catch (e) { falha(e); }
  });

  /* ---------- abas e atualização automática ---------- */
  const abrirAba = ligarAbas($("abas"), function (nome) {
    abaAtual = nome;
    const f = { conversas: telaConversas, contatos: telaContatos, disparos: telaDisparos, templates: telaTemplates, robo: telaRobo, fluxos: telaFluxos, config: telaConfig }[nome];
    f().catch(function (e) { falha(e); });
  });
  setInterval(function () {
    if (document.hidden || abaAtual !== "conversas") return;
    carregarLista().catch(function () {});
    atualizarConversa().catch(function () {});
  }, 8000);

  try { await carregarConfig(); } catch (e) { falha(e, "Não consegui ler a configuração. Atualize a página."); }
  abrirAba("conversas");
})();
