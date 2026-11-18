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
    return { url: supa().storage.from("wa-midia").getPublicUrl(caminho).data.publicUrl, tipo: tipo, mime: mime, nome: file.name, caminho: caminho, tamanho: file.size };
  }
  function prevMidia(url, tipo, nome) {
    const u = esc(url);
    if (tipo === "video") return '<video controls preload="metadata" style="max-width:260px;border-radius:10px" src="' + u + '"></video>';
    if (tipo === "audio") return '<audio controls preload="none" style="max-width:260px" src="' + u + '"></audio>';
    if (tipo === "image") return '<a href="' + u + '" target="_blank" rel="noopener" title="Abrir a foto"><img alt="Foto" style="max-width:200px;border-radius:10px" src="' + u + '"></a>';
    if (tipo === "sticker") return '<img alt="Figurinha" style="max-width:120px" src="' + u + '">';
    return '<a href="' + u + '" target="_blank" rel="noopener">' + (nome ? "Abrir " + esc(nome) : "Abrir o PDF") + "</a>";
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
        '<div class="wa-copia"><input data-midia type="url" placeholder="https://..."><button type="button" class="btn peq contorno" data-escolher-midia>Escolher arquivo</button><button type="button" class="btn peq contorno" data-prontos-midia>Prontos</button></div>' +
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
  function desenharAvisoTpl() {
    const el = $("cfAvisoTpl"); if (!el) return;
    const em = cfg.ultimo_aviso_template_em;
    el.innerHTML = em ? '<span class="selo ok">Funcionando</span> O último aviso de template do Meta chegou ' + esc(quando(em)) + " (" + esc(haQuanto(em)) + ")."
      : '<span class="selo pendente">Nunca recebido</span> Ainda não chegou nenhum aviso de template. Se você já assinou o campo, é porque nenhum template mudou de situação desde então. Enquanto isso, o CRM confere sozinho a cada 15 minutos.';
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
    desenharAvisoTpl();
    $("cfLimite").value = cfg.limite_diario; $("cfHi").value = cfg.disparo_hora_inicio; $("cfHf").value = cfg.disparo_hora_fim;
    if ($("cfDiasMkt")) $("cfDiasMkt").value = cfg.marketing_dias_entre_envios == null ? 3 : cfg.marketing_dias_entre_envios;
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
      await ler(supa().from("wa_config").update({ limite_diario: lim, disparo_hora_inicio: hi, disparo_hora_fim: hf, preco_marketing: pm, preco_utilidade: pu,
        marketing_dias_entre_envios: (function (v) { return isNaN(v) ? 3 : Math.min(60, Math.max(0, v)); })(parseInt(($("cfDiasMkt") || {}).value, 10)) }).eq("id", 1).select("id"));
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
  function horasTemplate(t) {
    const env = t.enviado_em ? new Date(t.enviado_em) : null, res = t.resultado_em ? new Date(t.resultado_em) : null;
    const emAnalise = t.status === "PENDING" || t.status === "IN_APPEAL";
    const ROTR = { APPROVED: "Aprovado", REJECTED: "Reprovado" };
    if (!env) return '<span class="vazio">Hora de envio não registrada</span>' + (res ? "<br>" + (ROTR[t.status] || "Resultado") + " em " + esc(quando(t.resultado_em)) : "");
    let h = "Enviado em " + esc(quando(t.enviado_em));
    if (emAnalise) {
      const ms = Date.now() - env.getTime(), passou = ms >= 24 * 3600000;
      h += "<br>Esperando há <b>" + esc(duracao(ms)) + '</b> <span class="selo ' + (passou ? "off" : "ok") + '">' + (passou ? "Passou de 24 h" : "Dentro das 24 h") + "</span>";
    } else if (res) {
      h += "<br>" + (ROTR[t.status] || "Decidido") + " em " + esc(quando(t.resultado_em)) + "<br>Levou <b>" + esc(duracao(res.getTime() - env.getTime())) + "</b>";
    } else if (ROTR[t.status]) {
      h += '<br><span class="vazio">' + ROTR[t.status] + " (hora exata não registrada)</span>";
    }
    return h;
  }
  /* template que pode ser usado em envio: aprovado e ainda existente no Meta */
  function tplUsavel(t) { return String(t.status).toUpperCase() === "APPROVED" && !t.removido_no_meta; }

  /* ----- sincronização automática (Fase 3, item 3.1): o servidor confere os templates com o Meta a cada 15 min ----- */
  const SIT_SYNC = { APPROVED: "aprovado", PENDING: "em análise", REJECTED: "reprovado", PAUSED: "pausado pelo Meta", DISABLED: "desativado", IN_APPEAL: "em recurso" };
  function haQuanto(iso) { return "há " + duracao(Math.max(0, Date.now() - new Date(iso).getTime())); }
  function desenharSync() {
    const el = $("tpSyncInfo"); if (!el) return;
    const em = cfg.templates_sync_em, okEm = cfg.templates_sync_ok_em;
    if (!em) { el.textContent = "O CRM confere os templates com o Meta sozinho, a cada 15 minutos. A primeira conferência ainda não rodou."; return; }
    let h;
    if (cfg.templates_sync_ok) h = "Última sincronização: <b>" + esc(quando(em)) + "</b> (" + esc(haQuanto(em)) + "). O CRM confere sozinho a cada 15 minutos.";
    else h = '<span class="selo off">Sincronização falhou</span> A última tentativa, em ' + esc(quando(em)) + " (" + esc(haQuanto(em)) + "), não deu certo: " + esc(cfg.templates_sync_msg || "motivo não informado") +
      (okEm ? " A última que deu certo foi em " + esc(quando(okEm)) + "." : "");
    if (Date.now() - new Date(em).getTime() > 3600000) h += ' <span class="selo pendente">Sincronização atrasada</span> Passou de 1 hora sem conferir. Clique em "Sincronizar com o Meta".';
    el.innerHTML = h;
  }
  /* o que mudou desde a última vez que você olhou a aba (guardado só neste navegador) */
  function lerVisto() { try { return localStorage.getItem("wa_tpl_visto") || ""; } catch (e) { return ""; } }
  function gravarVisto() { try { localStorage.setItem("wa_tpl_visto", new Date().toISOString()); } catch (e) {} }
  function novidadesTemplates(lista) {
    const visto = new Date(lerVisto()).getTime(); if (!visto) return [];
    const depois = function (iso) { return !!iso && new Date(iso).getTime() > visto; };
    return (lista || []).filter(function (t) { return t.removido_no_meta ? depois(t.removido_em) : depois(t.resultado_em); }).map(function (t) {
      return { nome: t.nome, txt: t.removido_no_meta ? "não existe mais no Meta" : t.status === "APPROVED" ? "foi aprovado" : t.status === "REJECTED" ? "foi reprovado" : "mudou de situação" };
    });
  }
  function desenharNovidades() {
    const cx = $("tpNovidades"); if (!cx) return;
    const nv = novidadesTemplates(templates);
    if (!lerVisto()) gravarVisto();   // primeira visita: começa a contar daqui
    cx.hidden = !nv.length;
    cx.innerHTML = nv.length ? '<div class="aviso ok" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:0 0 14px"><span>Desde a sua última visita: ' +
      nv.map(function (n) { return "<b>" + esc(n.nome) + "</b> " + n.txt; }).join("; ") + '.</span><button type="button" class="btn peq contorno" id="tpNovOk">Entendi</button></div>' : "";
    const p = $("tpPonto"); if (p) p.hidden = true;
  }
  document.addEventListener("click", function (ev) { if (ev.target.closest("#tpNovOk")) { gravarVisto(); desenharNovidades(); } });
  /* ao abrir o CRM: avisa se algum template foi aprovado, reprovado ou removido desde a última visita */
  async function avisarNovidadesTemplates() {
    try {
      if (!lerVisto()) return gravarVisto();
      const nv = novidadesTemplates(await ler(supa().from("wa_templates").select("nome,status,resultado_em,removido_no_meta,removido_em")));
      if (!nv.length) return;
      const p = $("tpPonto"); if (p) p.hidden = false;
      aviso("Template " + nv[0].nome + " " + nv[0].txt + (nv.length > 1 ? " (e mais " + (nv.length - 1) + ")" : "") + ". Veja na aba Templates.");
    } catch (e) { console.error(e); }
  }

  /* ----- lista de templates: cartões ou tabela, com filtros e busca (Fase 3, itens 3.2 a 3.4) ----- */
  const tpF = { busca: "", sit: "", cat: "", cab: "", botoes: "", ordem: "recentes", modo: "cartoes" };
  try { if (localStorage.getItem("wa_tpl_modo") === "tabela") tpF.modo = "tabela"; } catch (e) {}
  let templateParaDisparo = null;
  function alertaTpl(t) {
    if (t.removido_no_meta) return '<p class="wa-tp-alerta amarelo">Não existe mais na sua conta do Meta. Fica aqui só para consulta e não pode ser enviado.</p>';
    const s = String(t.status).toUpperCase();
    if (s === "REJECTED") return '<p class="wa-tp-alerta vermelho"><b>Reprovado.</b> ' + esc(WaTpl.motivo(t.motivo_recusa) || "O Meta não informou o motivo. Veja no Gerenciador do WhatsApp.") + "</p>";
    if (s === "PAUSED") return '<p class="wa-tp-alerta amarelo"><b>Pausado pelo Meta</b> por baixa qualidade. Não dá para enviar até ele voltar.</p>';
    if (s === "DISABLED") return '<p class="wa-tp-alerta vermelho"><b>Desativado pelo Meta.</b> Crie um novo, com outro nome.</p>';
    if (WaTpl.emAnalise(t) && t.enviado_em && Date.now() - new Date(t.enviado_em).getTime() >= 24 * 3600000)
      return '<p class="wa-tp-alerta amarelo"><b>Em análise há mais de 24 horas.</b> Se continuar assim, confira no Gerenciador do WhatsApp do Meta.</p>';
    return "";
  }
  function selosTpl(t) {
    const st = t.removido_no_meta ? ["Removido no Meta", "off"] : (ROT_ST[t.status] || [t.status || "?", "pendente"]);
    return { st: st, html: '<span class="selo ' + st[1] + '">' + esc(st[0]) + "</span>" };
  }
  function acoesTpl(t) {
    return '<button class="btn peq contorno" type="button" data-tp-previa="' + esc(t.id) + '">Ver prévia</button>' +
      '<button class="btn peq contorno" type="button" data-tp-dup="' + esc(t.id) + '">Duplicar</button>' +
      (tplUsavel(t) ? '<button class="btn peq" type="button" data-tp-usar="' + esc(t.id) + '">Usar em disparo</button>' : "") +
      '<button class="btn peq contorno" type="button" data-tp-horas="' + esc(t.id) + '">Ajustar horas</button>' +
      '<button class="btn peq perigo" type="button" data-tp-apagar="' + esc(t.nome) + '"' + (t.removido_no_meta ? ' data-tp-removido="1"' : "") + ">Apagar</button>";
  }
  /* tipos dos botões do template, em palavras: "resposta, link, ligar" */
  function tiposBotoes(t) {
    const nomes = { QUICK_REPLY: "resposta", URL: "link", PHONE_NUMBER: "ligar" }, vistos = [];
    WaTpl.botoesDe(t.componentes).forEach(function (b) { const k = String(b.type || "").toUpperCase(), n = nomes[k] || k.toLowerCase(); if (n && vistos.indexOf(n) < 0) vistos.push(n); });
    return vistos.join(", ");
  }
  function cartaoTpl(t) {
    const nb = WaTpl.botoesDe(t.componentes).length, sl = selosTpl(t);
    return '<article class="cartao wa-tp-card"><div><h3>' + esc(t.nome) + '</h3><div class="wa-tp-sub"><span class="vazio">' + esc(t.idioma) + '</span><span class="selo">' + esc(ROT_CAT[t.categoria] || t.categoria || "") + "</span>" + sl.html + "</div></div>" +
      '<div class="wa-tp-sub">' + rotuloCab(t) + '<span class="vazio">' + (t.qtd_variaveis || 0) + (t.qtd_variaveis === 1 ? " variável" : " variáveis") + " · " + (nb ? nb + (nb === 1 ? " botão" : " botões") + " (" + esc(tiposBotoes(t)) + ")" : "sem botões") + "</span></div>" +
      alertaTpl(t) + '<div class="wa-tp-txt">' + esc(corpoDe(t)) + '</div><div class="wa-tp-horas">' + horasTemplate(t) + '</div><div class="wa-tp-acoes">' + acoesTpl(t) + "</div></article>";
  }
  function linhaTpl(t) {
    const sl = selosTpl(t), al = alertaTpl(t);
    return "<tr><td><b>" + esc(t.nome) + '</b><br><span class="vazio">' + esc(t.idioma) + "</span></td><td>" + esc(ROT_CAT[t.categoria] || t.categoria || "") + "</td><td>" + sl.html + (al ? al.replace('class="wa-tp-alerta', 'style="margin-top:6px" class="wa-tp-alerta') : "") +
      '</td><td class="tpl-horas">' + horasTemplate(t) + "</td><td>" + (t.qtd_variaveis || 0) + '</td><td class="quebra tpl-texto">' + rotuloCab(t) + esc(corpoDe(t)) + '</td><td><div class="wa-tp-acoes">' + acoesTpl(t) + "</div></td></tr>";
  }
  function desenharTemplates() {
    const todos = templates || [], n = WaTpl.contar(todos);
    ["todos", "APPROVED", "PENDING", "REJECTED", "OUTROS"].forEach(function (k) { const el = $("tpN_" + k); if (el) el.textContent = n[k] || ""; });
    Array.prototype.forEach.call($("tpChips").querySelectorAll("[data-tpsit]"), function (b) { b.setAttribute("aria-pressed", b.dataset.tpsit === tpF.sit ? "true" : "false"); });
    $("tpModoCartoes").setAttribute("aria-pressed", tpF.modo === "cartoes" ? "true" : "false"); $("tpModoTabela").setAttribute("aria-pressed", tpF.modo === "tabela" ? "true" : "false");
    const lista = WaTpl.ordenar(WaTpl.filtrar(todos, tpF), tpF.ordem);
    $("tpCartoes").hidden = tpF.modo !== "cartoes"; $("tpTabelaWrap").hidden = tpF.modo !== "tabela";
    const vazio = !todos.length ? 'Nenhum template ainda. Clique em "Sincronizar com o Meta" ou crie um abaixo.' : "Nenhum template com esses filtros.";
    $("tpCartoes").innerHTML = lista.length ? lista.map(cartaoTpl).join("") : '<p class="vazio">' + vazio + "</p>";
    $("tpLista").innerHTML = lista.length ? lista.map(linhaTpl).join("") : '<tr><td colspan="7" class="vazio">' + vazio + "</td></tr>";
  }
  async function telaTemplates() {
    await carregarConfig(); await carregarTemplates();
    desenharSync(); desenharNovidades(); desenharTemplates(); atualizarEditor();
  }
  $("tpChips").addEventListener("click", function (ev) { const b = ev.target.closest("[data-tpsit]"); if (!b) return; tpF.sit = b.dataset.tpsit; desenharTemplates(); });
  $("tpBusca").addEventListener("input", function () { tpF.busca = this.value; desenharTemplates(); });
  [["tpFCat", "cat"], ["tpFCab", "cab"], ["tpFBot", "botoes"], ["tpOrdem", "ordem"]].forEach(function (x) { $(x[0]).addEventListener("change", function () { tpF[x[1]] = this.value; desenharTemplates(); }); });
  function trocarModoTpl(m) { tpF.modo = m; try { localStorage.setItem("wa_tpl_modo", m); } catch (e) {} desenharTemplates(); }
  $("tpModoCartoes").addEventListener("click", function () { trocarModoTpl("cartoes"); });
  $("tpModoTabela").addEventListener("click", function () { trocarModoTpl("tabela"); });

  /* prévia de um template já criado */
  function abrirPrevia(t) {
    const comps = t.componentes || [], ex = WaTpl.exemplosDe(comps), n = WaTpl.varsDe(corpoDe(t)).length;
    $("jpTitulo").textContent = t.nome; $("jpSub").textContent = (ROT_CAT[t.categoria] || "") + " · " + (selosTpl(t).st[0]);
    let h = "";
    for (let i = 1; i <= n; i++) h += '<div class="wa-linha-var"><b>{{' + i + '}}</b><input data-jp-var="' + i + '" maxlength="100" value="' + esc(ex[i - 1] || "") + '" aria-label="Valor da variável ' + i + '"></div>';
    $("jpVars").innerHTML = n ? '<label>Teste com outros valores</label>' + h : "";
    const redesenhar = function () {
      const vars = Array.prototype.map.call($("jpVars").querySelectorAll("input"), function (i) { return i.value; });
      $("jpCorpo").innerHTML = WaTpl.previaHtml(comps, { vars: vars });
    };
    $("jpVars").oninput = redesenhar; redesenhar(); $("jPrevia").showModal();
  }

  /* duplicar: abre o editor já preenchido */
  function duplicarTpl(t) {
    const p = WaTpl.paraEditor(t, (templates || []).filter(function (x) { return x.idioma === t.idioma; }).map(function (x) { return x.nome; }));
    $("tcNome").value = p.nome; $("tcCat").value = p.cat;
    $("tcCabTipo").value = p.cabTipo; $("tcCabTipo").dispatchEvent(new Event("change"));
    $("tcTitulo").value = p.cabTexto; $("tcCorpo").value = p.corpo; $("tcRodape").value = p.rodape;
    botoesTc = p.botoes; desenharBotoes(); atualizarExemplos();
    Array.prototype.forEach.call($("tcExemplos").querySelectorAll("input"), function (i, k) { i.value = p.exemplos[k] || ""; });
    mostrarAvisoCorpo(); atualizarEditor();
    $("tcNome").scrollIntoView({ behavior: "smooth", block: "center" }); $("tcNome").focus();
    aviso("Cópia de " + t.nome + " pronta para editar." + (p.precisaMidia ? " Anexe o arquivo do cabeçalho de novo: o exemplo do Meta não pode ser reaproveitado." : "") + " Mude alguma coisa: o Meta pode recusar template idêntico a outro.");
  }

  function lerDataBR(txt) {
    const m = String(txt || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/); if (!m) return undefined;
    const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4] + 3, +m[5])); // horário de Brasília (UTC-3)
    return isNaN(d) ? undefined : d.toISOString();
  }
  function dataBRtxt(iso) {
    if (!iso) return ""; const d = new Date(new Date(iso).getTime() - 3 * 3600000), z = function (n) { return String(n).padStart(2, "0"); };
    return z(d.getUTCDate()) + "/" + z(d.getUTCMonth() + 1) + "/" + d.getUTCFullYear() + " " + z(d.getUTCHours()) + ":" + z(d.getUTCMinutes());
  }
  async function ajustarHoras(id) {
    const t = templates.find(function (x) { return x.id === id; }); if (!t) return;
    const a = prompt('Quando "' + t.nome + '" foi enviado ao Meta?\nFormato: dd/mm/aaaa hh:mm (horário de Brasília). Deixe em branco se não sabe.', dataBRtxt(t.enviado_em)); if (a === null) return;
    const env = a.trim() ? lerDataBR(a) : null; if (env === undefined) return aviso("Data inválida. Use dd/mm/aaaa hh:mm.", true);
    let res = null;
    if (t.status === "APPROVED" || t.status === "REJECTED") {
      const b = prompt("Quando foi " + (t.status === "APPROVED" ? "aprovado" : "reprovado") + "? (dd/mm/aaaa hh:mm). Em branco se não sabe.", dataBRtxt(t.resultado_em)); if (b === null) return;
      res = b.trim() ? lerDataBR(b) : null; if (res === undefined) return aviso("Data inválida. Use dd/mm/aaaa hh:mm.", true);
    }
    try { await ler(supa().rpc("wa_template_horas", { p_id: id, p_enviado: env, p_resultado: res })); aviso("Horas salvas."); telaTemplates(); } catch (e) { falha(e); }
  }
  async function acaoTpl(ev) {
    const achar = function (id) { return (templates || []).find(function (x) { return x.id === id; }); };
    const pv = ev.target.closest("[data-tp-previa]"); if (pv) { const t = achar(pv.dataset.tpPrevia); if (t) abrirPrevia(t); return; }
    const dp = ev.target.closest("[data-tp-dup]"); if (dp) { const t = achar(dp.dataset.tpDup); if (t) duplicarTpl(t); return; }
    const us = ev.target.closest("[data-tp-usar]"); if (us) { const t = achar(us.dataset.tpUsar); if (t && tplUsavel(t)) { templateParaDisparo = t.nome + "|" + t.idioma; abrirAba("disparos"); } return; }
    const h = ev.target.closest("[data-tp-horas]"); if (h) return ajustarHoras(h.dataset.tpHoras);
    const b = ev.target.closest("[data-tp-apagar]"); if (!b) return;
    const nome = b.dataset.tpApagar, removido = b.dataset.tpRemovido === "1";
    if (!confirm(removido ? 'Apagar "' + nome + '" do CRM? Ele já não existe no Meta.' : 'Apagar o template "' + nome + '" no Meta? Não dá para desfazer.')) return;
    let r = await wa({ acao: "apagar_template", nome: nome });
    if (!r.ok && r.pode_so_crm && confirm("O Meta não apagou: " + (r.erro || "erro") + "\n\nApagar só do CRM? Se ele ainda existir no Meta, volta na próxima sincronização.")) r = await wa({ acao: "apagar_template", nome: nome, so_crm: true });
    if (!r.ok) return aviso(r.erro || "Não apagou.", true);
    aviso(r.so_crm ? "Template apagado do CRM." : "Template apagado."); telaTemplates();
  }
  $("tpLista").addEventListener("click", acaoTpl); $("tpCartoes").addEventListener("click", acaoTpl);
  $("tpSync").addEventListener("click", async function () {
    const b = this; b.disabled = true; b.textContent = "Sincronizando...";
    const r = await wa({ acao: "sincronizar_templates" });
    b.disabled = false; b.textContent = "Sincronizar com o Meta";
    if (!r.ok) { aviso(r.erro || "Não sincronizou.", true); return telaTemplates(); }
    const mud = (r.mudaram || []).map(function (m) { return m.nome + " agora está " + (SIT_SYNC[m.para] || m.para); });
    aviso(r.total + " template(s) conferidos." + (mud.length ? " " + mud.join("; ") + "." : "") + (r.removidos ? " " + r.removidos + " não existe(m) mais no Meta." : "")); telaTemplates();
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
  /* prévia e checklist do editor, ao vivo */
  function estadoEditor() {
    let amostra = false, midiaUrl = "";
    try { amostra = !!(cabArq && cabArq.handle); midiaUrl = cabArq && cabArq.tipo !== "DOCUMENT" ? cabArq.url : ""; } catch (e) {}
    return { nome: $("tcNome").value.trim(), existentes: (templates || []).filter(function (t) { return t.idioma === "pt_BR"; }).map(function (t) { return t.nome; }),
      cat: $("tcCat").value, corpo: $("tcCorpo").value, exemplos: exemplosAtuais(), rodape: $("tcRodape").value, botoes: botoesTc,
      cabTipo: $("tcCabTipo").value, cabTexto: $("tcTitulo").value, cabAmostra: amostra, midiaUrl: midiaUrl };
  }
  function atualizarEditor() {
    if (!window.WaTpl || !$("tcCheck")) return;
    const e = estadoEditor(), itens = WaTpl.checklist(e);
    $("tcCheck").innerHTML = itens.map(function (i) {
      const cls = i.ok ? "ok" : i.obrigatorio ? "falta" : "aviso-s", mk = i.ok ? "✓" : i.obrigatorio ? "✗" : "!";
      return '<li class="' + cls + '"><span class="m" aria-hidden="true">' + mk + "</span><span>" + esc(i.rotulo) + (i.ok ? "" : "<small>" + esc(i.dica) + "</small>") + (i.obrigatorio || i.ok ? "" : ' <small>(aviso, não bloqueia)</small>') + "</span></li>";
    }).join("");
    $("tcPrevia").innerHTML = WaTpl.previaHtml(WaTpl.compsDoForm(e), { vars: e.exemplos, midiaUrl: e.midiaUrl });
    const c = e.corpo.length;
    $("tcContador").textContent = "Texto: " + c + " de 1.024 · Rodapé: " + e.rodape.length + " de 60";
    const pronto = WaTpl.checklistPronto(itens), primeiro = itens.find(function (i) { return i.obrigatorio && !i.ok; });
    if ($("tcEnviar").dataset.ocupado !== "1") $("tcEnviar").disabled = !pronto;
    $("tcBloqueio").textContent = pronto ? "" : "Falta: " + primeiro.rotulo.toLowerCase() + ".";
  }
  ["tcNome", "tcRodape", "tcTitulo"].forEach(function (id) { $(id).addEventListener("input", atualizarEditor); });
  $("tcCat").addEventListener("change", atualizarEditor); $("tcCabTipo").addEventListener("change", atualizarEditor);
  function mostrarAvisoCorpo() {
    const e = validarCorpo($("tcCorpo").value, $("tcCat").value, exemplosAtuais());
    const a = $("tcAviso");
    a.textContent = e || ($("tcCorpo").value.trim() ? "Texto no formato aceito pelo Meta." : "");
    a.style.color = e ? "#8C2016" : "#15502E";
    atualizarEditor();
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
      // o modelo começa limpo: sem o cabeçalho, o título e o rodapé que tinham ficado no editor
      $("tcCabTipo").value = ""; $("tcCabTipo").dispatchEvent(new Event("change")); $("tcTitulo").value = ""; $("tcRodape").value = "";
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
    atualizarEditor();
  }
  function lerCampoBotao(el, trocou) {
    const cx = el.closest ? el.closest("[data-bt]") : null, campo = el.getAttribute && el.getAttribute("data-bt-campo"); if (!cx || !campo) return;
    const b = botoesTc[Number(cx.dataset.bt)]; if (!b) return;
    if (campo === "perguntar") b.perguntar = el.checked;
    else b[campo] = el.value;
    if (campo === "tipo" && trocou) { b.valor = ""; desenharBotoes(); }
    atualizarEditor();
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
      st.textContent = "Pronto: " + up.nome + " (exemplo aceito pelo Meta)"; $("tcCabPrev").innerHTML = prevMidia(up.url, up.tipo); atualizarEditor();
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
    const bt = this; bt.disabled = true; bt.dataset.ocupado = "1";
    const r = await wa({
      acao: "criar_template", nome: nome, categoria: $("tcCat").value, idioma: "pt_BR", corpo: $("tcCorpo").value.trim(), exemplos: exemplosAtuais(),
      cabecalho_tipo: (cabT === "TEXT" || CAB_TIPO[cabT]) ? cabT : "", cabecalho_texto: cabT === "TEXT" ? $("tcTitulo").value.trim() : "",
      cabecalho_handle: CAB_TIPO[cabT] && cabArq ? cabArq.handle : "", rodape: $("tcRodape").value.trim(), botoes: botoes
    });
    bt.dataset.ocupado = ""; bt.disabled = false; atualizarEditor();
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
      return supa().from("wa_contatos").select("id,nome,telefone,username,etiquetas,optin,optout,ultima_msg_em,notas,perfil_id").order("criado_em").order("id");
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
      if (b && !((c.nome || "").toLowerCase().indexOf(b) > -1 || (bd && (c.telefone || "").indexOf(bd) > -1) || (c.username || "").toLowerCase().indexOf(b.replace(/^@/, "")) > -1)) return false;
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
      return "<tr><td>" + esc(c.nome || "(sem nome)") + "</td><td>" + esc(foneDe(c)) + "</td><td>" + (c.etiquetas || []).map(seloEt).join("") + "</td><td>" + situacao(c) + "</td><td>" + esc(quando(c.ultima_msg_em)) +
        '</td><td><button class="btn peq contorno" data-ct-conversar="' + c.id + '">Conversar</button> <button class="btn peq contorno" data-ct-editar="' + c.id + '">Editar</button></td></tr>';
    }).join("") + (lista.length > 500 ? '<tr><td colspan="6" class="vazio">Mostrando 500 de ' + lista.length + ". Use a busca ou os filtros.</td></tr>" : "");
  }
  async function telaContatos() { await carregarContatos(); desenharListas(); desenharContatos(); }
  ["ctBusca", "ctFiltroEt", "ctFiltroSt"].forEach(function (id) { $(id).addEventListener("input", desenharContatos); });

  /* grava uma lista de pessoas sem nunca tirar autorização nem reativar quem saiu */
  async function salvarContatos(pessoas, aceite, etiquetas) {
    const mapa = {};
    pessoas.forEach(function (p) { mapa[chaveFone(p.telefone)] = p; });   // a chave ignora o 9º dígito
    const fones = Object.keys(mapa);
    const res = { novos: 0, atualizados: 0, saiu: 0 };
    const existentes = {};
    for (let i = 0; i < fones.length; i += 150) {
      const dados = await ler(supa().from("wa_contatos").select("id,telefone,telefone_chave,nome,etiquetas,optin,optout").in("telefone_chave", fones.slice(i, i + 150)));
      dados.forEach(function (c) { existentes[c.telefone_chave] = c; });
    }
    const agora = new Date().toISOString();
    const inserir = [];
    for (const f of fones) {
      const p = mapa[f], c = existentes[f];
      if (!c) { inserir.push({ telefone: p.telefone, nome: p.nome || null, perfil_id: p.perfil_id || null, etiquetas: etiquetas, origem: "painel", optin: !!aceite, optin_em: aceite ? agora : null }); continue; }
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
    abrirContato(contatos.find(function (c) { return c.id === ed.dataset.ctEditar; }));
  });
  function abrirContato(c) {
    if (!c) return;
    editando = c;
    $("jcTitulo").textContent = nomeDe(c);
    $("jcNome").value = c.nome || ""; $("jcTel").value = foneDe(c);
    $("jcEt").value = (c.etiquetas || []).join(", "); $("jcNotas").value = c.notas || "";
    $("jcOptin").checked = !!c.optin; $("jcOptout").checked = !!c.optout;
    $("jContato").showModal();
  }
  /* o contato pode ser editado pela aba Contatos ou pela ficha da conversa */
  function aposContato(apagou) {
    if (abaAtual === "contatos") return telaContatos();
    if (apagou) { fecharConversa(); carregarLista().catch(function () {}); } else abrirConversa();
  }
  $("jcSalvar").addEventListener("click", async function () {
    if (!editando) return;
    const optin = $("jcOptin").checked, optout = $("jcOptout").checked, agora = new Date().toISOString();
    const campos = { nome: $("jcNome").value.trim() || null, etiquetas: listaEt($("jcEt").value), notas: $("jcNotas").value.trim() || null, optin: optin, optout: optout };
    if (optin && !editando.optin) campos.optin_em = agora;
    if (optout && !editando.optout) campos.optout_em = agora;
    try {
      await ler(supa().from("wa_contatos").update(campos).eq("id", editando.id).select("id"));
      if (optout) await supa().from("wa_disparo_itens").update({ status: "pulado", erro: "Saiu da lista" }).eq("contato_id", editando.id).eq("status", "pendente");
      $("jContato").close(); aviso("Salvo."); aposContato(false);
    } catch (e) { falha(e); }
  });
  $("jcApagar").addEventListener("click", async function () {
    if (!editando || !confirm("Apagar este contato e todas as mensagens dele? Não dá para desfazer.")) return;
    try { await ler(supa().from("wa_contatos").delete().eq("id", editando.id).select("id")); $("jContato").close(); aviso("Contato apagado."); aposContato(true); } catch (e) { falha(e); }
  });

  /* ---------- conversas ---------- */
  const ETAPAS = [["novo", "Novo"], ["em_conversa", "Em conversa"], ["interessado", "Interessado"], ["proposta", "Proposta"], ["cliente", "Cliente"], ["perdido", "Perdido"]];
  const PRIORIDADES = [["baixa", "Baixa"], ["normal", "Normal"], ["alta", "Alta"], ["urgente", "Urgente"]];
  const ROT_ORIGEM = { whatsapp: "WhatsApp (a pessoa escreveu primeiro)", painel: "Adicionado por você no painel", site: "Inscrição pelo site", anuncio: "Anúncio com botão de WhatsApp" };
  const PAUSAS = [[30, "30 min"], [60, "1 h"], [120, "2 h"], [240, "4 h"], [480, "8 h"], [720, "12 h"], [1440, "24 h"], [0, "Para sempre"]];
  const SEM_PRAZO = "9999-12-31T00:00:00Z";
  const CAMPOS_LISTA = "id,nome,telefone,username,ultima_msg_em,ultima_msg_texto,nao_lidas,precisa_humano,optout,ultima_entrada_em,prioridade,robo_pausado_ate,sem_resposta,sem_resposta_desde";
  const CAMPOS_MSG = "id,direcao,tipo,texto,status,erro,origem,template_nome,criado_em,midia_url,midia_tipo,midia_caminho,midia_mime,midia_nome,midia_id,reacao";
  let filtroCv = "todas";
  let listaCv = [];
  const busca = { termo: "", seq: 0, timer: null, contatos: [], mensagens: [], pronta: false };
  let fichaAberta = window.matchMedia("(min-width:1181px)").matches;
  let fichaDados = null;
  let respostas = null;
  let anexo = null;
  let ancora = null;
  let limiteMsgs = 150;
  let enviando = false;
  const assinadas = {};
  const rap = { aberta: false, itens: [], sel: 0, ini: -1 };

  function semAcento(t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  /* mesma regra do banco: celular do Brasil com e sem o 9º dígito tem a mesma chave */
  function chaveFone(d) { d = String(d || ""); return /^55[1-9][1-9]9\d{8}$/.test(d) ? d.slice(0, 4) + d.slice(5) : d; }
  function foneDe(c) {
    if (!c.telefone) return c.username ? "@" + c.username : "sem número visível";
    const f = foneBR(c.telefone);
    return /^\d+$/.test(f) ? "+" + f : f;
  }
  function nomeDe(c) { return c.nome || (c.username ? "@" + c.username : "") || (c.telefone ? foneDe(c) : "Sem número visível"); }
  function horaCurta(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (d.toDateString() === new Date().toDateString()) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  function pausado(c) { return !!c.robo_pausado_ate && new Date(c.robo_pausado_ate).getTime() > Date.now(); }
  function semPrazo(c) { return pausado(c) && new Date(c.robo_pausado_ate).getTime() > Date.now() + 50 * 365 * 86400000; }
  function janelaMs(c) { return c && c.ultima_entrada_em ? new Date(c.ultima_entrada_em).getTime() + 86400000 - Date.now() : 0; }
  function duracao(ms) { const m = Math.max(1, Math.round(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : "") : m + " min"; }
  function iconeStatus(m) {
    if (m.direcao !== "saida") return "";
    return { enviando: "…", enviada: "✓", entregue: "✓✓", lida: '<span class="wa-vis">✓✓</span>', falhou: "⚠" }[m.status] || "";
  }

  /* ----- lista, filtros e busca ----- */
  async function contagemCv() {
    try { const r = await supa().rpc("wa_conversas_contagem"); if (!r.error && r.data) return r.data; } catch (e) {}
    return null;
  }
  async function carregarLista() {
    let q = supa().from("wa_contatos").select(CAMPOS_LISTA).not("ultima_msg_em", "is", null).order("ultima_msg_em", { ascending: false }).limit(200);
    if (filtroCv === "sem_resposta") q = supa().from("wa_contatos").select(CAMPOS_LISTA).eq("sem_resposta", true).order("sem_resposta_desde", { ascending: true }).limit(200);
    else if (filtroCv === "nao_lidas") q = q.gt("nao_lidas", 0);
    else if (filtroCv === "lidas") q = q.eq("nao_lidas", 0);
    else if (filtroCv === "pediu") q = q.eq("precisa_humano", true);
    const r = await Promise.all([ler(q), contagemCv()]);
    listaCv = r[0];
    const n = r[1] || {
      nao_lidas: listaCv.filter(function (c) { return c.nao_lidas > 0; }).length,
      msgs_nao_lidas: listaCv.reduce(function (s, c) { return s + (c.nao_lidas || 0); }, 0),
      pediu: listaCv.filter(function (c) { return c.precisa_humano; }).length,
      sem_resposta: listaCv.filter(function (c) { return c.sem_resposta; }).length
    };
    const bd = $("bdNaoLidas"); bd.hidden = !n.msgs_nao_lidas; bd.textContent = n.msgs_nao_lidas;
    $("cvNNaoLidas").textContent = n.nao_lidas ? n.nao_lidas : "";
    $("cvNPediu").textContent = n.pediu ? n.pediu : "";
    $("cvNSemResp").textContent = n.sem_resposta ? n.sem_resposta : "";
    $("cvSemRespAcoes").hidden = filtroCv !== "sem_resposta" || !listaCv.length;
    document.title = (n.msgs_nao_lidas ? "(" + n.msgs_nao_lidas + ") " : "") + "WhatsApp | Ressignificar";
    desenharLista();
  }
  function passaFiltro(c) {
    if (filtroCv === "nao_lidas") return c.nao_lidas > 0;
    if (filtroCv === "lidas") return !c.nao_lidas;
    if (filtroCv === "pediu") return !!c.precisa_humano;
    if (filtroCv === "sem_resposta") return !!c.sem_resposta;
    return true;
  }
  /* "há 40 min", "há 5 h", "há 3 dias" */
  function haEspera(iso) {
    const ms = Math.max(0, Date.now() - new Date(iso).getTime()), min = Math.round(ms / 60000);
    if (min < 60) return "há " + Math.max(1, min) + " min";
    if (min < 48 * 60) return "há " + Math.round(min / 60) + " h";
    return "há " + Math.round(min / 1440) + " dias";
  }
  function itemCv(c) {
    const espera = c.sem_resposta && c.sem_resposta_desde ? '<span class="l3"><span class="selo pendente" title="A pessoa escreveu e você ainda não respondeu">Sem resposta ' + esc(haEspera(c.sem_resposta_desde)) + "</span></span>" : "";
    const selos = (c.nao_lidas ? '<span class="selo ouro" title="Mensagens não lidas">' + c.nao_lidas + "</span>" : "") +
      (c.precisa_humano ? '<span class="selo off" title="Pediu atendimento">!</span>' : "") +
      (pausado(c) ? '<span class="selo wa-tag" title="Robô pausado nesta conversa">robô pausado</span>' : "");
    const pri = c.prioridade === "urgente" || c.prioridade === "alta" ? '<i class="wa-pri ' + c.prioridade + '" title="Prioridade ' + c.prioridade + '"></i>' : "";
    return '<button type="button" class="wa-item' + (c.id === conversaId ? " ativa" : "") + '" data-cv="' + c.id + '"><span class="l1"><b>' + pri + esc(nomeDe(c)) + "</b><time>" + esc(horaCurta(c.ultima_msg_em)) +
      '</time></span><span class="l2"><small>' + esc(c.ultima_msg_texto || "") + "</small>" + selos + "</span>" + espera + "</button>";
  }
  /* pedaço da mensagem em volta do termo buscado, com o termo marcado */
  function trecho(texto, termo) {
    const t = String(texto || ""), alvo = semAcento(termo);
    let norm = "";
    for (let i = 0; i < t.length; i++) { const ch = semAcento(t.charAt(i)); norm += ch.length === 1 ? ch : (ch.charAt(0) || " "); }
    const p = norm.indexOf(alvo);
    if (p < 0) return esc(t.slice(0, 90));
    const ini = Math.max(0, p - 30), fim = Math.min(t.length, p + alvo.length + 50);
    return (ini ? "…" : "") + esc(t.slice(ini, p)) + "<mark>" + esc(t.slice(p, p + alvo.length)) + "</mark>" + esc(t.slice(p + alvo.length, fim)) + (fim < t.length ? "…" : "");
  }
  function desenharLista() {
    const caixa = $("cvLista");
    if (busca.termo.length >= 2) {
      if (!busca.pronta) { caixa.innerHTML = '<p class="vazio">Buscando...</p>'; return; }
      const cs = busca.contatos.filter(passaFiltro);
      let h = "";
      if (cs.length) h += '<p class="wa-sec">Pessoas</p>' + cs.map(itemCv).join("");
      if (busca.mensagens.length) {
        h += '<p class="wa-sec">Mensagens com "' + esc(busca.termo) + '"</p>' + busca.mensagens.map(function (m) {
          return '<button type="button" class="wa-item" data-cv="' + m.contato_id + '" data-msg="' + m.id + '"><span class="l1"><b>' + esc(nomeDe(m)) + "</b><time>" + esc(horaCurta(m.criado_em)) +
            '</time></span><span class="l2"><small>' + (m.direcao === "saida" ? "Você: " : "") + trecho(m.texto, busca.termo) + "</small></span></button>";
        }).join("");
      }
      caixa.innerHTML = h || '<p class="vazio">Nada encontrado para "' + esc(busca.termo) + '".</p>';
      return;
    }
    const vazio = { todas: "Nenhuma conversa ainda. Quando alguém escrever para o número do CRM, aparece aqui.", nao_lidas: "Nenhuma conversa com mensagem não lida.", sem_resposta: "Nenhuma conversa esperando a sua resposta. Tudo em dia!", lidas: "Nenhuma conversa lida.", pediu: "Ninguém está esperando atendimento." }[filtroCv];
    caixa.innerHTML = listaCv.length ? listaCv.map(itemCv).join("") : '<p class="vazio">' + vazio + "</p>";
  }
  function buscar() {
    const termo = $("cvBusca").value.trim();
    busca.termo = termo; busca.pronta = false; clearTimeout(busca.timer);
    const seq = ++busca.seq;
    desenharLista();
    if (termo.length < 2) return;
    busca.timer = setTimeout(async function () {
      try {
        const r = await ler(supa().rpc("wa_buscar_conversas", { p_termo: termo, p_limite: 40 }));
        if (seq !== busca.seq) return;
        busca.contatos = (r && r.contatos) || []; busca.mensagens = (r && r.mensagens) || [];
      } catch (e) { if (seq !== busca.seq) return; busca.contatos = []; busca.mensagens = []; console.error(e); }
      busca.pronta = true; desenharLista();
    }, 300);
  }
  $("cvLista").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-cv]"); if (!b) return;
    conversaId = b.dataset.cv; ancora = b.dataset.msg || null;
    abrirConversa();
  });
  $("cvLimparSemResp").addEventListener("click", async function () {
    const n = listaCv.length;
    if (!n || !confirm("Marcar " + n + (n === 1 ? " conversa" : " conversas") + " como respondidas?\n\nElas saem de Não respondidas. Se a pessoa escrever de novo, a conversa volta para a lista.")) return;
    try {
      await ler(supa().from("wa_contatos").update({ sem_resposta: false, sem_resposta_desde: null }).eq("sem_resposta", true).select("id"));
      aviso("Pronto: nenhuma conversa esperando resposta."); await carregarLista();
    } catch (e) { falha(e); }
  });
  $("cvBusca").addEventListener("input", buscar);
  $("cvFiltros").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-filtro]"); if (!b) return;
    filtroCv = b.dataset.filtro;
    Array.prototype.forEach.call($("cvFiltros").querySelectorAll("[data-filtro]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    carregarLista().catch(falha);
  });

  /* ----- mensagens ----- */
  /* o que a pessoa manda fica numa pasta protegida: cada arquivo abre com um link que vale 1 hora */
  async function assinar(msgs) {
    const faltam = [];
    msgs.forEach(function (m) { if (m.midia_caminho && !(assinadas[m.midia_caminho] && assinadas[m.midia_caminho].exp > Date.now()) && faltam.indexOf(m.midia_caminho) === -1) faltam.push(m.midia_caminho); });
    if (!faltam.length) return;
    try {
      const r = await supa().storage.from("wa-recebidas").createSignedUrls(faltam, 3600);
      (r.data || []).forEach(function (x) { if (x && x.signedUrl && x.path) assinadas[x.path] = { url: x.signedUrl, exp: Date.now() + 50 * 60000 }; });
    } catch (e) { console.error(e); }
  }
  async function msgsDaConversa() {
    const d = await ler(supa().from("wa_mensagens").select(CAMPOS_MSG).eq("contato_id", conversaId).order("criado_em", { ascending: false }).limit(limiteMsgs));
    d.reverse();
    await assinar(d);
    return d;
  }
  function assinaturaDe(msgs) { return msgs.map(function (m) { return m.id + m.status + (m.reacao || "") + (m.midia_caminho ? 1 : 0) + (m.erro ? 1 : 0); }).join("|"); }
  function textoHtml(t) {
    return esc(t).replace(/https?:\/\/[^\s<]+/g, function (u) {
      const fim = (u.match(/[.,:!?)]+$/) || [""])[0], url = fim ? u.slice(0, -fim.length) : u;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + "</a>" + fim;
    });
  }
  function midiaHtml(m) {
    if (m.midia_url) return prevMidia(m.midia_url, m.midia_tipo);
    if (m.midia_caminho) {
      const a = assinadas[m.midia_caminho];
      return a ? prevMidia(a.url, m.midia_tipo, m.midia_nome) : '<span class="vazio">Abrindo o arquivo...</span>';
    }
    if (m.midia_id) {
      if (!m.erro && Date.now() - new Date(m.criado_em).getTime() < 90000) return '<span class="vazio">Baixando o arquivo...</span>';
      return '<span class="vazio">' + esc(m.erro || "O arquivo ainda não foi baixado.") + '</span> <button type="button" class="btn peq contorno" data-baixar="' + m.id + '">Baixar de novo</button>';
    }
    return "";
  }
  function diaRotulo(d) {
    const hoje = new Date();
    if (d.toDateString() === hoje.toDateString()) return "Hoje";
    if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return "Ontem";
    return d.toLocaleDateString("pt-BR", d.getFullYear() === hoje.getFullYear() ? { day: "2-digit", month: "long" } : { day: "2-digit", month: "long", year: "numeric" });
  }
  function desenharMensagens(msgs) {
    const caixa = $("cvMsgs"); if (!caixa) return;
    const noFim = caixa.scrollHeight - caixa.scrollTop - caixa.clientHeight < 80;
    let dia = "", h = "";
    msgs.forEach(function (m) {
      const d = new Date(m.criado_em), chave = d.toDateString();
      if (chave !== dia) { dia = chave; h += '<div class="wa-dia"><span>' + esc(diaRotulo(d)) + "</span></div>"; }
      if (m.tipo === "system") { h += '<div class="wa-aviso" data-msg-id="' + m.id + '">' + esc(m.texto || "") + "</div>"; return; }
      const cls = m.direcao === "saida" ? "saida" + (m.origem === "robo" ? " robo" : "") : "";
      const quem = m.direcao === "saida" ? ({ robo: "Robô", disparo: "Disparo", painel: "Você" }[m.origem] || "") : "";
      const midia = midiaHtml(m);
      let texto = String(m.texto || "");
      if (midia) {
        texto = texto.replace(/^\[(imagem|vídeo|áudio|figurinha)\]\s*/, "");
        if (m.midia_tipo === "document" && m.midia_nome && /^\[documento\]/.test(texto)) texto = "";
      }
      h += '<div class="wa-msg ' + cls + (ancora && ancora === m.id ? " wa-achou" : "") + '" data-msg-id="' + m.id + '">' +
        (midia ? '<div class="wa-midia">' + midia + "</div>" : "") +
        (texto ? '<div class="texto">' + textoHtml(texto) + "</div>" : "") +
        (m.template_nome ? '<div class="meta">template ' + esc(m.template_nome) + "</div>" : "") +
        '<div class="meta"><span>' + esc(d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })) + "</span>" + (quem ? "<span>" + quem + "</span>" : "") + "<span>" + iconeStatus(m) + "</span></div>" +
        (m.direcao === "saida" && m.status === "falhou" && m.erro ? '<div class="erro">' + esc(m.erro) + "</div>" : "") +
        (m.reacao ? '<span class="wa-reacao" title="Reação da pessoa">' + esc(m.reacao) + "</span>" : "") + "</div>";
    });
    caixa.innerHTML = h || '<p class="vazio" style="margin:auto">Sem mensagens.</p>';
    if (noFim) caixa.scrollTop = caixa.scrollHeight;
  }

  /* ----- topo da conversa: janela de 24 h, robô e pedido de atendimento ----- */
  function topoHtml(c) {
    const jm = janelaMs(c);
    const robo = semPrazo(c) ? '<span class="selo pendente">Robô pausado sem prazo</span>'
      : pausado(c) ? '<span class="selo pendente">Robô pausado até ' + esc(quando(c.robo_pausado_ate)) + "</span>"
      : cfg.robo_ativo ? '<span class="selo ok">Robô respondendo</span>' : '<span class="selo" title="Ligue na aba Robô">Robô desligado</span>';
    return '<div class="wa-topo-l"><b>' + esc(nomeDe(c)) + '</b><span class="vazio">' + (c.nome || c.username ? esc(foneDe(c)) : "") + (c.username && c.telefone ? " · @" + esc(c.username) : "") + "</span>" + situacao(c) +
      '<span class="selo ' + (jm > 0 ? "ok" : "pendente") + '" title="Pelo WhatsApp oficial, você responde livremente até 24 h depois da última mensagem da pessoa">' + (jm > 0 ? "Janela aberta: " + duracao(jm) : "Janela de 24 h fechada") + "</span>" +
      '<button type="button" class="btn peq contorno wa-direita" id="cvFichaBtn" aria-expanded="' + (fichaAberta ? "true" : "false") + '">Ficha</button></div>' +
      '<div class="wa-topo-l">' + robo +
      '<details class="wa-menu" id="cvPausaMenu"><summary class="btn peq contorno">Pausar robô</summary><div class="wa-menu-lista">' +
      PAUSAS.map(function (p) { return '<button type="button" data-pausa="' + p[0] + '">' + p[1] + "</button>"; }).join("") + "</div></details>" +
      (pausado(c) ? '<button type="button" class="btn peq" id="cvRoboVoltar">Voltar a responder</button>' : "") +
      (c.precisa_humano ? '<span class="selo off">Pediu atendimento</span>' : "") +
      (c.sem_resposta && c.sem_resposta_desde ? '<span class="selo pendente" title="A pessoa escreveu e você ainda não respondeu">Esperando sua resposta ' + esc(haEspera(c.sem_resposta_desde)) + "</span>" : "") +
      (c.precisa_humano || c.sem_resposta ? '<button type="button" class="btn peq contorno" id="cvAtendido" title="Tira a conversa de Não respondidas e de Pediu atendimento sem mandar mensagem">' + (c.precisa_humano ? "Marcar como atendido" : "Não precisa responder") + "</button>" : "") + "</div>";
  }
  function atualizarTopo() { const t = $("cvTopo"); if (t && conversaCont) t.innerHTML = topoHtml(conversaCont); }
  async function salvarContato(campos, msg) {
    if (!conversaId) return;
    try {
      conversaCont = await ler(supa().from("wa_contatos").update(campos).eq("id", conversaId).select("*").single());
      if (msg) aviso(msg);
      atualizarTopo();
      const q = document.querySelector("#cvFicha .wa-fc-quem b"); if (q) q.textContent = nomeDe(conversaCont);
      carregarLista().catch(function () {}); carregarFicha().catch(function () {});
    } catch (e) { falha(e); }
  }
  function pausar(min) {
    const m = $("cvPausaMenu"); if (m) m.open = false;
    const rot = (PAUSAS.filter(function (p) { return p[0] === min; })[0] || [0, ""])[1];
    salvarContato({ robo_pausado_ate: min ? new Date(Date.now() + min * 60000).toISOString() : SEM_PRAZO },
      min ? "Robô pausado por " + rot + " nesta conversa." : 'Robô pausado sem prazo nesta conversa. Para religar, use "Voltar a responder".');
  }

  /* ----- abrir a conversa ----- */
  function fechadaHtml(c) {
    return '<div class="chat-form" style="flex-wrap:wrap"><p class="vazio" style="flex:1;min-width:220px">' +
      (c.ultima_entrada_em ? "Passaram mais de 24 h desde a última mensagem desta pessoa. Pelo WhatsApp oficial, só dá para enviar um template aprovado."
        : "Esta pessoa ainda não escreveu para este número. Pelo WhatsApp oficial, a primeira mensagem precisa ser um template aprovado.") +
      '</p><button class="btn auto" type="button" id="cvTemplate">Enviar template</button></div>';
  }
  function comporHtml() {
    return '<div class="wa-compor" id="cvCompor">' +
      '<div class="wa-pop" id="cvRapidas" hidden role="listbox" aria-label="Respostas prontas"></div>' +
      '<div class="wa-pop wa-emojis" id="cvEmojis" hidden></div>' +
      '<div class="wa-anexo" id="cvAnexoPrev" hidden></div>' +
      '<div class="wa-ferr">' +
      '<button type="button" id="cvEmojiBtn" title="Emoji" aria-label="Abrir emojis">😊</button>' +
      '<button type="button" id="cvFotoBtn" title="Enviar foto" aria-label="Enviar foto">📷</button>' +
      '<button type="button" id="cvAnexo" title="Anexar vídeo, áudio ou PDF" aria-label="Anexar arquivo">📎</button>' +
      '<button type="button" id="cvProntosBtn" title="Arquivos prontos (vídeos já compactados)" aria-label="Arquivos prontos">📚</button>' +
      '<button type="button" id="cvRapBtn" title="Respostas prontas" aria-label="Respostas prontas">/</button>' +
      '<span class="vazio wa-dica">Digite / para respostas prontas · Ctrl + Enter envia · cole ou arraste uma foto</span>' +
      '<input type="file" id="cvFoto" hidden accept="image/*"><input type="file" id="cvArquivo" hidden accept="' + ACEITA.todos + '"></div>' +
      '<div class="chat-form"><textarea id="cvTexto" rows="2" maxlength="4000" placeholder="Escreva sua resposta..." aria-label="Mensagem"></textarea><button class="btn auto" type="button" id="cvEnviar">Enviar</button></div></div>';
  }
  async function abrirConversa() {
    try {
      const id = conversaId;
      limiteMsgs = 150;
      const c = await ler(supa().from("wa_contatos").select("*").eq("id", id).single());
      let msgs = await msgsDaConversa();
      if (ancora && !msgs.some(function (m) { return m.id === ancora; })) { limiteMsgs = 1000; msgs = await msgsDaConversa(); }
      if (id !== conversaId) return;   // trocou de conversa enquanto carregava
      conversaCont = c;
      descartarAnexo();
      const aberta = janelaMs(c) > 0;
      $("cvThread").innerHTML = '<div class="chat-caixa" id="cvCaixa"><div class="wa-topo" id="cvTopo">' + topoHtml(c) + '</div><div class="chat-lista" id="cvMsgs" style="height:min(52vh,500px)"></div>' + (aberta ? comporHtml() : fechadaHtml(c)) + "</div>";
      desenharMensagens(msgs);
      const caixa = $("cvMsgs"), alvo = ancora ? caixa.querySelector('[data-msg-id="' + ancora + '"]') : null;
      caixa.scrollTop = alvo ? Math.max(0, alvo.offsetTop - caixa.offsetTop - caixa.clientHeight / 2 + alvo.clientHeight / 2) : caixa.scrollHeight;
      ancora = null;
      ultimaAssinatura = assinaturaDe(msgs);
      if (c.nao_lidas) { await supa().from("wa_contatos").update({ nao_lidas: 0 }).eq("id", id); c.nao_lidas = 0; }
      if (aberta) ligarCompor();
      mostrarFicha();
      carregarLista().catch(function () {});
    } catch (e) { falha(e); }
  }
  function fecharConversa() {
    conversaId = null; conversaCont = null; fichaDados = null; descartarAnexo();
    $("cvThread").innerHTML = '<div class="cartao"><p class="vazio">Escolha uma conversa ao lado.</p></div>';
    mostrarFicha();
  }
  async function atualizarConversa(irAoFim) {
    if (!conversaId || !$("cvMsgs") || !conversaCont) return;
    const id = conversaId;
    const r = await Promise.all([msgsDaConversa(), ler(supa().from("wa_contatos").select("*").eq("id", id).single())]);
    if (id !== conversaId || !$("cvMsgs")) return;
    const msgs = r[0], ass = assinaturaDe(msgs), eraAberta = janelaMs(conversaCont) > 0;
    conversaCont = r[1];
    if (ass !== ultimaAssinatura) {
      ultimaAssinatura = ass; desenharMensagens(msgs);
      if (irAoFim) { const cx = $("cvMsgs"); cx.scrollTop = cx.scrollHeight; }
      if (conversaCont.nao_lidas) { await supa().from("wa_contatos").update({ nao_lidas: 0 }).eq("id", id); conversaCont.nao_lidas = 0; }
      carregarFicha().catch(function () {});
    }
    const tx = $("cvTexto");
    if ((janelaMs(conversaCont) > 0) !== eraAberta && !(tx && (tx.value.trim() || anexo))) { abrirConversa(); return; }
    const menu = $("cvPausaMenu");
    if (!(menu && menu.open)) atualizarTopo();
    sincronizarFicha();
  }
  async function telaConversas() {
    await carregarLista();
    if (conversaId) abrirConversa();
  }

  /* ----- caixa de mensagem: foto, anexo, emoji e respostas prontas ----- */
  function ligarCompor() {
    const tx = $("cvTexto"), cx = $("cvCaixa");
    $("cvEnviar").addEventListener("click", enviar);
    $("cvEmojiBtn").addEventListener("click", alternarEmojis);
    $("cvFotoBtn").addEventListener("click", function () { $("cvFoto").click(); });
    $("cvAnexo").addEventListener("click", function () { $("cvArquivo").click(); });
    $("cvProntosBtn").addEventListener("click", function () { abrirProntos("conversa"); });
    $("cvRapBtn").addEventListener("click", function () { if (rap.aberta) return fecharPops(); rap.ini = -1; abrirRapidas(""); tx.focus(); });
    $("cvFoto").addEventListener("change", function () { const f = this.files[0]; this.value = ""; if (f) anexar(f); });
    $("cvArquivo").addEventListener("change", function () { const f = this.files[0]; this.value = ""; if (f) anexar(f); });
    tx.addEventListener("input", conferirBarra);
    tx.addEventListener("keydown", teclaCompor);
    tx.addEventListener("paste", function (e) {
      const fs = e.clipboardData && e.clipboardData.files;
      if (fs && fs.length && /^image\//.test(fs[0].type)) { e.preventDefault(); anexar(fs[0]); }
    });
    cx.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") > -1) { e.preventDefault(); cx.classList.add("wa-solta"); } });
    cx.addEventListener("dragleave", function () { cx.classList.remove("wa-solta"); });
    cx.addEventListener("drop", function (e) { cx.classList.remove("wa-solta"); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) { e.preventDefault(); anexar(f); } });
  }
  function carregarImagem(file) {
    return new Promise(function (ok, erro) {
      const u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); ok(im); };
      im.onerror = function () { URL.revokeObjectURL(u); erro(new Error("imagem")); };
      im.src = u;
    });
  }
  /* o WhatsApp só aceita foto JPG ou PNG de até 5 MB: foto maior ou de outro formato é convertida e reduzida aqui */
  async function prepararImagem(file) {
    if (/^image\/(jpeg|png)$/.test(mimeDoArquivo(file)) && file.size <= 5 * 1024 * 1024) return file;
    let im;
    try { im = await carregarImagem(file); } catch (e) { throw new Error("Não consegui abrir esta imagem. Use uma foto JPG ou PNG."); }
    let escala = Math.min(1, 2560 / Math.max(im.width, im.height, 1)), q = 0.86;
    for (let i = 0; i < 7; i++) {
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(im.width * escala)); cv.height = Math.max(1, Math.round(im.height * escala));
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(im, 0, 0, cv.width, cv.height);
      const blob = await new Promise(function (ok) { cv.toBlob(ok, "image/jpeg", q); });
      if (blob && blob.size <= 5 * 1024 * 1024) return new File([blob], String(file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      escala *= 0.8; q = Math.max(0.6, q - 0.05);
    }
    throw new Error("Não consegui reduzir a imagem para 5 MB.");
  }
  function descartarAnexo() {
    if (anexo && anexo.url && !anexo.pronto) URL.revokeObjectURL(anexo.url);
    anexo = null;
    const p = $("cvAnexoPrev"); if (p) { p.hidden = true; p.innerHTML = ""; }
    const t = $("cvTexto"); if (t) t.placeholder = "Escreva sua resposta...";
  }
  function tamanhoTxt(bytes) { const kb = (bytes || 0) / 1024; return kb >= 1024 ? (kb / 1024).toFixed(1).replace(".", ",") + " MB" : Math.max(1, Math.round(kb)) + " KB"; }
  function desenharAnexo(extra) {
    const p = $("cvAnexoPrev"); if (!p || !anexo) return;
    const tipo = anexo.tipo;
    p.innerHTML = (tipo === "image" ? '<img alt="" src="' + esc(anexo.url) + '">' : '<span class="wa-arq">' + { video: "🎬", audio: "🎤", document: "📄" }[tipo] + "</span>") +
      '<span class="wa-anexo-txt"><b>' + esc(anexo.nome) + "</b><small>" + ROT_TIPO[tipo] + " · " + tamanhoTxt(anexo.bytes) + (extra || "") + (tipo === "audio" ? " · áudio vai sem legenda" : "") +
      '</small></span><button type="button" class="wa-x" id="cvAnexoTirar" aria-label="Tirar o anexo">×</button>';
    p.hidden = false;
    $("cvAnexoTirar").addEventListener("click", descartarAnexo);
    $("cvTexto").placeholder = tipo === "audio" ? "Escreva sua resposta..." : "Legenda (opcional)...";
  }
  const precisaCompactar = function (file) {
    return (/^video\//i.test(file.type || "") || /\.(mp4|mov|m4v|3gp|webm|mkv)$/i.test(file.name || "")) && !!(window.waVideo && window.waVideo.segundoPlano) &&
      (file.size > LIMITE_MB * 1024 * 1024 || !/^video\/(mp4|3gpp)$/.test(mimeDoArquivo(file)));
  };
  async function anexar(file) {
    try {
      /* vídeo grande ou em formato que o WhatsApp não aceita: compacta em segundo plano e guarda nos "Arquivos prontos" */
      if (precisaCompactar(file)) {
        iniciarTarefa(file, { conversa: conversaId, anexar: true });
        aviso("Compactando o vídeo em segundo plano. Pode continuar usando o CRM: aviso quando estiver pronto.");
        return;
      }
      let f = file;
      if (/^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name || "")) f = await prepararImagem(file);
      const tipo = tipoDoArquivo(mimeDoArquivo(f));
      if (!tipo) throw new Error("Formato não aceito pelo WhatsApp. Use foto (JPG ou PNG), vídeo MP4, áudio MP3, M4A ou OGG, ou PDF.");
      if (f.size > LIMITE_MB * 1024 * 1024) throw new Error("O arquivo passa de " + LIMITE_MB + " MB (limite do WhatsApp).");
      if (!$("cvAnexoPrev")) return;
      descartarAnexo();
      anexo = { file: f, tipo: tipo, nome: f.name || "arquivo", url: URL.createObjectURL(f), bytes: f.size };
      desenharAnexo(f !== file ? " · ajustada para o WhatsApp" : "");
      $("cvTexto").focus();
    } catch (e) { aviso(e.message || String(e), true); }
  }

  /* ---------- vídeo em segundo plano e arquivos prontos ---------- */
  const tarefas = [];
  let seqTarefa = 0, prontos = [], modoProntos = "conversa", alvoMidia = null, tipoProntos = "";
  function modoVideo() { try { return localStorage.getItem("wa_video_qualidade") === "1" ? "qualidade" : "rapido"; } catch (e) { return "rapido"; } }
  function desenharTarefas() {
    const cx = $("waTarefas"); if (!cx) return;
    cx.hidden = !tarefas.length;
    cx.innerHTML = tarefas.map(function (t) {
      const pct = Math.min(100, Math.round((t.p || 0) * 100));
      let corpo, acoes = "";
      if (t.estado === "andando") {
        corpo = '<span class="wa-tf-msg">' + esc(t.msg || "Compactando…") + (pct ? " <b>" + pct + "%</b>" : "") + '</span><div class="wa-barra"><i style="width:' + pct + '%"></i></div>';
        acoes = '<button type="button" class="btn peq contorno" data-tf-cancelar="' + t.id + '">Cancelar</button>';
      } else if (t.estado === "pronto") {
        corpo = '<span class="wa-tf-msg"><b>Pronto</b> · ' + esc(tamanhoTxt(t.item && t.item.tamanho)) + ". Guardado em Arquivos prontos.</span>";
        acoes = ($("cvAnexoPrev") && t.item ? '<button type="button" class="btn peq" data-tf-usar="' + t.id + '">Anexar na conversa aberta</button>' : "") + '<button type="button" class="btn peq contorno" data-tf-fechar="' + t.id + '">Fechar</button>';
      } else {
        corpo = '<span class="wa-tf-msg erro">' + esc(t.erro || "Não deu certo.") + "</span>";
        acoes = '<button type="button" class="btn peq contorno" data-tf-fechar="' + t.id + '">Fechar</button>';
      }
      return '<div class="wa-tf"><b class="wa-tf-nome">' + esc(t.nome) + "</b>" + corpo + '<div class="wa-tf-acoes">' + acoes + "</div></div>";
    }).join("");
  }
  async function guardarPronto(arquivo, originalNome) {
    const up = await subirMidia(arquivo, null);
    const linha = await ler(supa().from("wa_arquivos").insert({ nome: arquivo.name, tipo: up.tipo, url: up.url, caminho: up.caminho, mime: up.mime, tamanho: arquivo.size, original_nome: originalNome || arquivo.name }).select("*").single());
    return Object.assign({ id: null, nome: arquivo.name, tipo: up.tipo, url: up.url, caminho: up.caminho, mime: up.mime, tamanho: arquivo.size }, linha || {});
  }
  function iniciarTarefa(file, opc) {
    opc = opc || {};
    const t = { id: ++seqTarefa, nome: file.name || "arquivo", msg: "Na fila…", p: 0, estado: "andando", item: null, erro: "", job: null };
    tarefas.push(t); desenharTarefas();
    (async function () {
      try {
        let arq = file;
        if (precisaCompactar(file)) {
          t.job = window.waVideo.segundoPlano(file, { modo: modoVideo(), aoMudar: function (e) { if (e.msg) t.msg = e.msg; t.p = e.p || 0; desenharTarefas(); } });
          arq = await t.job.promessa;
        }
        t.msg = "Guardando…"; t.p = 0; desenharTarefas();
        t.item = await guardarPronto(arq, file.name);
        t.estado = "pronto"; desenharTarefas();
        if (opc.anexar && opc.conversa && opc.conversa === conversaId && !anexo && $("cvAnexoPrev")) { usarPronto(t.item); aviso("Vídeo pronto e anexado na conversa. É só enviar."); }
        else aviso('Pronto: "' + t.nome + '". Está em Arquivos prontos.');
        if ($("jProntos").open) carregarProntos().then(desenharProntos).catch(function () {});
      } catch (e) {
        t.estado = "erro"; t.erro = /cancelado/i.test(e.message || "") ? "Cancelado." : (e.message || String(e)); desenharTarefas();
        if (t.erro !== "Cancelado.") aviso(t.erro, true);
      }
    })();
    return t;
  }
  $("waTarefas").addEventListener("click", function (ev) {
    const c = ev.target.closest("[data-tf-cancelar]"), u = ev.target.closest("[data-tf-usar]"), f = ev.target.closest("[data-tf-fechar]");
    const acha = function (id) { return tarefas.find(function (x) { return String(x.id) === String(id); }); };
    if (c) { const t = acha(c.dataset.tfCancelar); if (t && t.job) t.job.cancelar(); return; }
    if (u) { const t = acha(u.dataset.tfUsar); if (t && t.item) { usarPronto(t.item); } return; }
    if (f) { const i = tarefas.findIndex(function (x) { return String(x.id) === String(f.dataset.tfFechar); }); if (i > -1) tarefas.splice(i, 1); desenharTarefas(); }
  });
  window.addEventListener("beforeunload", function (ev) { if (tarefas.some(function (t) { return t.estado === "andando"; })) { ev.preventDefault(); ev.returnValue = ""; } });

  function usarPronto(item) {
    if (!$("cvAnexoPrev")) return aviso("Abra uma conversa primeiro.", true);
    descartarAnexo();
    anexo = { file: null, pronto: true, tipo: item.tipo, nome: item.nome, url: item.url, bytes: item.tamanho || 0 };
    desenharAnexo(" · pronto para enviar");
    $("cvTexto").focus();
  }
  async function carregarProntos() { prontos = await ler(supa().from("wa_arquivos").select("*").order("criado_em", { ascending: false }).limit(100)); }
  function desenharProntos() {
    const tipoDisparo = modoProntos === "midia" ? tipoProntos : "";
    const lista = prontos.filter(function (x) { return !tipoDisparo || x.tipo === tipoDisparo; });
    $("prTxt").textContent = modoProntos === "midia" ? "Escolha o arquivo do cabeçalho." + (tipoDisparo ? " Só aparecem arquivos do tipo " + ROT_TIPO[tipoDisparo] + "." : "")
      : "Vídeos e arquivos já compactados e guardados. Escolha um para mandar na conversa, sem esperar a compactação de novo.";
    $("prLista").innerHTML = lista.length ? lista.map(function (x) {
      return "<tr><td><b>" + esc(x.nome) + '</b></td><td>' + esc(ROT_TIPO[x.tipo] || x.tipo) + "</td><td>" + esc(tamanhoTxt(x.tamanho)) + "</td><td>" + esc(quando(x.criado_em)) + '</td><td><div class="wa-tp-acoes">' +
        '<button type="button" class="btn peq" data-pr-usar="' + esc(x.id) + '">' + (modoProntos === "midia" ? "Usar este arquivo" : "Anexar na conversa") + "</button>" +
        '<a class="btn peq contorno" href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">Ver</a>' +
        '<button type="button" class="btn peq perigo" data-pr-apagar="' + esc(x.id) + '">Apagar</button></div></td></tr>';
    }).join("") : '<tr><td colspan="5" class="vazio">' + (prontos.length ? "Nenhum arquivo deste tipo." : 'Nada guardado ainda. Anexe um vídeo grande numa conversa (ele fica aqui depois de compactado) ou use "Adicionar arquivo".') + "</td></tr>";
    $("prQualidade").checked = modoVideo() === "qualidade";
  }
  async function abrirProntos(modo) {
    modoProntos = modo || "conversa";
    try { await carregarProntos(); } catch (e) { return falha(e); }
    desenharProntos(); if (!$("jProntos").open) $("jProntos").showModal();
  }
  $("jProntos").addEventListener("click", async function (ev) {
    const u = ev.target.closest("[data-pr-usar]"), d = ev.target.closest("[data-pr-apagar]");
    if (ev.target.closest("#prAdd")) return $("prArquivo").click();
    if (u) {
      const x = prontos.find(function (y) { return y.id === u.dataset.prUsar; }); if (!x) return;
      if (modoProntos === "midia") {
        if (alvoMidia) {
          alvoMidia.value = x.url; alvoMidia.dispatchEvent(new Event("input", { bubbles: true })); alvoMidia.dispatchEvent(new Event("change", { bubbles: true }));
          const cx = alvoMidia.closest("[data-caixa-midia]"), pv = cx && cx.querySelector("[data-midia-prev]"), st = cx && cx.querySelector("[data-midia-st]");
          if (pv) pv.innerHTML = prevMidia(x.url, x.tipo, x.nome); if (st) st.textContent = "Pronto: " + x.nome;
        }
        $("jProntos").close(); aviso("Arquivo escolhido.");
      }
      else { $("jProntos").close(); usarPronto(x); }
      return;
    }
    if (d) {
      const x = prontos.find(function (y) { return y.id === d.dataset.prApagar; }); if (!x) return;
      if (!confirm('Apagar "' + x.nome + '" dos arquivos prontos? Conversas que já receberam este arquivo não são afetadas.')) return;
      try {
        await supa().storage.from("wa-midia").remove([x.caminho]);
        await ler(supa().from("wa_arquivos").delete().eq("id", x.id).select("id"));
        await carregarProntos(); desenharProntos(); aviso("Apagado.");
      } catch (e) { falha(e); }
    }
  });
  $("prArquivo").addEventListener("change", function () { const f = this.files[0]; this.value = ""; if (f) { iniciarTarefa(f, {}); aviso("Preparando o arquivo em segundo plano."); } });
  $("prQualidade").addEventListener("change", function () { try { localStorage.setItem("wa_video_qualidade", this.checked ? "1" : "0"); } catch (e) {} });
  document.addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-prontos-midia]"); if (!b) return;
    const cx = b.closest("[data-caixa-midia]"); if (!cx) return;
    alvoMidia = cx.querySelector("input[data-midia]"); tipoProntos = { image: "image", video: "video", document: "document" }[cx.dataset.tipo] || "";
    abrirProntos("midia");
  });

  async function enviar() {
    const tx = $("cvTexto"), b = $("cvEnviar");
    if (enviando || !tx || !b) return;
    const t = tx.value.trim();
    if (!anexo && !t) return;
    enviando = true; b.disabled = true; fecharPops();
    try {
      let r;
      if (anexo) {
        b.textContent = "Enviando...";
        const up = anexo.pronto ? { url: anexo.url, tipo: anexo.tipo, nome: anexo.nome } : await subirMidia(anexo.file, null), audio = up.tipo === "audio";
        r = await wa({ acao: "enviar_midia", contato_id: conversaId, url: up.url, tipo: up.tipo, nome: up.nome, legenda: audio ? "" : t });
        if (r.ok) { descartarAnexo(); if (!audio) tx.value = ""; }
      } else {
        r = await wa({ acao: "enviar_texto", contato_id: conversaId, texto: t });
        if (r.ok) tx.value = "";
      }
      if (!r.ok) { aviso(r.erro || "Não enviou.", true); if (r.precisa_template) abrirConversa(); return; }
      ultimaAssinatura = ""; await atualizarConversa(true);
      carregarLista().catch(function () {});
      if ($("cvTexto")) $("cvTexto").focus();
    } catch (e) { aviso(e.message || String(e), true); }
    finally { enviando = false; const x = $("cvEnviar"); if (x) { x.disabled = false; x.textContent = "Enviar"; } }
  }
  function inserirNoCursor(el, txt) {
    if (!el) return;
    const i = el.selectionStart == null ? el.value.length : el.selectionStart, f = el.selectionEnd == null ? i : el.selectionEnd;
    el.value = (el.value.slice(0, i) + txt + el.value.slice(f)).slice(0, 4000);
    const p = Math.min(el.value.length, i + txt.length);
    el.focus(); el.setSelectionRange(p, p);
  }
  function fecharPops() { ["cvEmojis", "cvRapidas"].forEach(function (id) { const e = $(id); if (e) e.hidden = true; }); rap.aberta = false; }

  /* emojis */
  const EMOJIS = [
    ["Rostos", "😀 😃 😄 😁 😆 😅 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😋 😜 🤗 🤔 😌 😔 😴 😎 🥳 😢 😭 😤 😡 😱 😳 🥺 🙄 😬 🤯 😷 🤒"],
    ["Gestos", "👍 👎 👏 🙌 🙏 🤝 💪 👌 ✌️ 🤞 👋 🤙 ☝️ 👇 👉 👈 👆 ✍️ 🤲 👀 🙋 🤷 🤦"],
    ["Corações e festa", "❤️ 🧡 💛 💚 💙 💜 🤍 🖤 💖 💗 💓 💕 💞 💔 💌 ✨ ⭐ 🌟 💫 🔥 🎉 🎊 🎁 🏆 🥇 🌹 🌻 🍀 🌈 ☀️ 🌙"],
    ["Trabalho", "✅ ☑️ ✔️ ❌ ⚠️ ❗ ❓ 📌 📍 📅 🗓️ ⏰ ⌛ 📞 📱 💬 📧 📝 📎 🔗 🔒 🔑 💰 💳 💵 📈 📉 📊 🎯 🚀 💡 🧾 📄 📚 🎓 🎥 🎧 🖥️ ➡️ ⬅️ 🔝 🆗 🆕"]
  ];
  function emojisRecentes() {
    try { return JSON.parse(localStorage.getItem("wa_emojis") || "[]").filter(function (x) { return typeof x === "string" && x.length <= 12 && !/[<>"'&\s]/.test(x); }).slice(0, 16); } catch (e) { return []; }
  }
  function guardarEmoji(e) {
    try { const l = emojisRecentes().filter(function (x) { return x !== e; }); l.unshift(e); localStorage.setItem("wa_emojis", JSON.stringify(l.slice(0, 16))); } catch (x) {}
  }
  function alternarEmojis() {
    const p = $("cvEmojis"); if (!p) return;
    const abrir = p.hidden; fecharPops();
    if (!abrir) return;
    const bloco = function (titulo, lista) { return '<p class="wa-sec">' + titulo + '</p><div class="wa-emo-grade">' + lista.map(function (e) { return '<button type="button" data-emoji="' + e + '">' + e + "</button>"; }).join("") + "</div>"; };
    const rec = emojisRecentes();
    p.innerHTML = (rec.length ? bloco("Usados por último", rec) : "") + EMOJIS.map(function (g) { return bloco(g[0], g[1].split(" ")); }).join("");
    p.hidden = false;
  }

  /* respostas prontas: digitar / na caixa de mensagem */
  async function carregarRespostas(forcar) {
    if (respostas && !forcar) return respostas;
    try { respostas = await ler(supa().from("wa_respostas_prontas").select("*").order("atalho")); } catch (e) { respostas = respostas || []; console.error(e); }
    return respostas;
  }
  function preencherResposta(t) {
    const nome = String((conversaCont && conversaCont.nome) || "").trim(), p = nome.split(/\s+/)[0] || "";
    const prim = p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : "";
    return String(t || "").replace(/\{primeiro_nome\}/gi, prim || "tudo bem").replace(/\{nome\}/gi, nome || prim || "tudo bem");
  }
  function conferirBarra() {
    const tx = $("cvTexto"); if (!tx) return;
    const antes = tx.value.slice(0, tx.selectionStart == null ? tx.value.length : tx.selectionStart);
    const m = antes.match(/(^|\s)\/([^\s\/]{0,30})$/);
    if (!m) { if (rap.aberta) { rap.aberta = false; $("cvRapidas").hidden = true; } return; }
    rap.ini = antes.length - m[2].length - 1;
    abrirRapidas(m[2]);
  }
  async function abrirRapidas(q) {
    const lista = await carregarRespostas(), cx = $("cvRapidas"); if (!cx) return;
    const alvo = semAcento(q);
    rap.itens = lista.filter(function (r) { return !alvo || r.atalho.indexOf(alvo) === 0; })
      .concat(lista.filter(function (r) { return alvo && r.atalho.indexOf(alvo) !== 0 && (r.atalho.indexOf(alvo) > 0 || semAcento(r.texto).indexOf(alvo) > -1); })).slice(0, 8);
    rap.sel = 0; rap.aberta = true;
    $("cvEmojis").hidden = true;
    desenharRapidas(); cx.hidden = false;
  }
  function desenharRapidas() {
    $("cvRapidas").innerHTML = (rap.itens.length ? rap.itens.map(function (r, i) {
      return '<button type="button" role="option" class="wa-rap' + (i === rap.sel ? " sel" : "") + '" aria-selected="' + (i === rap.sel) + '" data-rap="' + i + '"><b>/' + esc(r.atalho) + "</b><span>" + esc(preencherResposta(r.texto)) + "</span></button>";
    }).join("") : '<p class="vazio" style="padding:8px 10px">Nenhuma resposta pronta com esse atalho.</p>') +
      '<button type="button" class="wa-rap wa-rap-ger" id="cvRapGer">Criar ou editar respostas prontas</button>';
  }
  function usarRapida(i) {
    const r = rap.itens[i], tx = $("cvTexto"); if (!r || !tx) return;
    const texto = preencherResposta(r.texto);
    if (rap.ini >= 0 && tx.value.charAt(rap.ini) === "/") {
      const fim = tx.selectionStart == null ? tx.value.length : Math.max(tx.selectionStart, rap.ini + 1);
      tx.value = (tx.value.slice(0, rap.ini) + texto + tx.value.slice(fim)).slice(0, 4000);
      const p = Math.min(tx.value.length, rap.ini + texto.length); tx.focus(); tx.setSelectionRange(p, p);
    } else inserirNoCursor(tx, texto);
    rap.aberta = false; rap.ini = -1; $("cvRapidas").hidden = true;
  }
  function teclaCompor(e) {
    if (rap.aberta && !$("cvRapidas").hidden) {
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && rap.itens.length) { e.preventDefault(); rap.sel = (rap.sel + (e.key === "ArrowDown" ? 1 : rap.itens.length - 1)) % rap.itens.length; desenharRapidas(); return; }
      if ((e.key === "Enter" || e.key === "Tab") && rap.itens.length && !e.ctrlKey && !e.metaKey) { e.preventDefault(); usarRapida(rap.sel); return; }
    }
    if (e.key === "Escape") { fecharPops(); return; }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); enviar(); }
  }
  let respEditando = null;
  function limparResposta() { respEditando = null; $("rpAtalho").value = ""; $("rpTexto").value = ""; }
  function desenharRespostas() {
    $("rpLista").innerHTML = (respostas || []).length ? '<div class="tabela-wrap" style="max-height:230px"><table class="t"><tbody>' + respostas.map(function (r) {
      return "<tr><td><b>/" + esc(r.atalho) + '</b></td><td class="quebra">' + esc(r.texto.slice(0, 110)) + (r.texto.length > 110 ? "…" : "") + '</td><td><button type="button" class="btn peq contorno" data-rp-editar="' + r.id + '">Editar</button> <button type="button" class="btn peq perigo" data-rp-apagar="' + r.id + '">Apagar</button></td></tr>';
    }).join("") + "</tbody></table></div>" : '<p class="vazio">Nenhuma resposta pronta ainda. Crie a primeira abaixo.</p>';
    $("rpTitulo").textContent = respEditando ? "Editar /" + respEditando.atalho : "Nova resposta";
  }
  async function abrirRespostas() { await carregarRespostas(true); limparResposta(); desenharRespostas(); $("jRespostas").showModal(); }
  $("rpLista").addEventListener("click", async function (ev) {
    const ed = ev.target.closest("[data-rp-editar]"), ap = ev.target.closest("[data-rp-apagar]");
    if (ed) {
      respEditando = respostas.filter(function (r) { return r.id === ed.dataset.rpEditar; })[0] || null;
      if (respEditando) { $("rpAtalho").value = respEditando.atalho; $("rpTexto").value = respEditando.texto; desenharRespostas(); $("rpTexto").focus(); }
    } else if (ap) {
      if (!confirm("Apagar esta resposta pronta?")) return;
      try {
        await ler(supa().from("wa_respostas_prontas").delete().eq("id", ap.dataset.rpApagar).select("id"));
        if (respEditando && respEditando.id === ap.dataset.rpApagar) limparResposta();
        await carregarRespostas(true); desenharRespostas();
      } catch (e) { falha(e); }
    }
  });
  $("rpNova").addEventListener("click", function () { limparResposta(); desenharRespostas(); $("rpAtalho").focus(); });
  $("rpAtalho").addEventListener("input", function () {
    const v = semAcento(this.value).replace(/^\/+/, "").replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 30);
    if (v !== this.value) this.value = v;
  });
  $("rpSalvar").addEventListener("click", async function () {
    const atalho = $("rpAtalho").value.trim(), texto = $("rpTexto").value.trim();
    if (!/^[a-z0-9_-]{1,30}$/.test(atalho)) return aviso("Dê um atalho curto, sem espaço. Ex.: pix", true);
    if (!texto) return aviso("Escreva o texto da resposta.", true);
    try {
      const dados = { atalho: atalho, texto: texto, atualizado_em: new Date().toISOString() };
      if (respEditando) await ler(supa().from("wa_respostas_prontas").update(dados).eq("id", respEditando.id).select("id"));
      else await ler(supa().from("wa_respostas_prontas").insert(dados).select("id"));
      limparResposta(); await carregarRespostas(true); desenharRespostas(); aviso("Resposta pronta salva.");
    } catch (e) {
      if ((e && e.code === "23505") || String(e && e.message).indexOf("duplicate") > -1) aviso("Já existe uma resposta com o atalho /" + atalho + ".", true); else falha(e);
    }
  });

  /* ----- ficha do contato (à direita) ----- */
  function mostrarFicha() {
    const f = $("cvFicha"), ver = fichaAberta && !!conversaId && !!conversaCont;
    f.hidden = !ver; $("cvGrade").classList.toggle("com-ficha", ver);
    const b = $("cvFichaBtn"); if (b) b.setAttribute("aria-expanded", ver ? "true" : "false");
    if (ver) { desenharFicha(); carregarFicha().catch(function (e) { console.error(e); }); }
  }
  async function carregarFicha() {
    if (!fichaAberta || !conversaId) return;
    const id = conversaId;
    const d = await ler(supa().rpc("wa_contato_ficha", { p_id: id }));
    if (id !== conversaId || !d) return;
    fichaDados = d; desenharFichaDados();
  }
  function desenharFicha() {
    const c = conversaCont, f = $("cvFicha");
    const ini = nomeDe(c).replace(/[^A-Za-zÀ-ÿ ]/g, "").trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join("") || "?";
    const opc = function (lista, v) { return lista.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + ">" + o[1] + "</option>"; }).join(""); };
    f.innerHTML = '<div class="wa-fc-topo"><span class="wa-avatar">' + esc(ini) + '</span><div class="wa-fc-quem"><b>' + esc(nomeDe(c)) + "</b><span>" + esc(foneDe(c)) + "</span>" + (c.username && c.telefone ? "<span>@" + esc(c.username) + "</span>" : "") +
      '</div><button type="button" class="wa-x" id="fcFechar" aria-label="Fechar a ficha">×</button></div>' +
      '<div class="f wa-fc-form">' +
      '<div><label for="fcNome">Nome</label><input id="fcNome" maxlength="80" value="' + esc(c.nome || "") + '"></div>' +
      '<div class="wa-fc-2"><div><label for="fcEtapa">Etapa</label><select id="fcEtapa">' + opc(ETAPAS, c.etapa) + '</select></div><div><label for="fcPrio">Prioridade</label><select id="fcPrio">' + opc(PRIORIDADES, c.prioridade) + "</select></div></div>" +
      '<div><label for="fcEt">Etiquetas <span class="vazio">(separe por vírgula)</span></label><input id="fcEt" value="' + esc((c.etiquetas || []).join(", ")) + '"></div>' +
      '<div><label for="fcNotas">Anotações</label><textarea id="fcNotas" rows="3" maxlength="2000">' + esc(c.notas || "") + "</textarea></div></div>" +
      '<div id="fcDados"><p class="vazio">Carregando a ficha...</p></div>' +
      '<div class="acoes wa-fc-acoes"><button type="button" class="btn peq contorno" id="fcNaoLida">Marcar como não lida</button><button type="button" class="btn peq contorno" id="fcTemplate">Enviar template</button><button type="button" class="btn peq contorno" id="fcEditar">Editar contato</button></div>';
    if (fichaDados && fichaDados.id === c.id) desenharFichaDados();
  }
  function desenharFichaDados() {
    const cx = $("fcDados"), c = conversaCont, d = fichaDados; if (!cx || !c || !d || d.id !== c.id) return;
    const campo = $("fcNota"), nota = campo ? campo.value : "", focado = !!campo && document.activeElement === campo;
    const pq = cx.querySelector(".wa-porque"), pqAberto = !!(pq && pq.open), tudo = cx.dataset.tudo === c.id;
    const info = c.origem_info || {};
    let origem = ROT_ORIGEM[c.origem] || (c.origem ? "Outra: " + c.origem : "Não informada");
    if (c.origem === "anuncio" && info.titulo) origem += ': "' + info.titulo + '"';
    const pt = d.pontos || { total: c.pontuacao || 0, itens: [] }, rs = d.resumo || {}, hist = d.historico || [];
    cx.innerHTML =
      '<div class="wa-fc-bloco"><span class="rotulo">Origem</span><p>' + esc(origem) + '</p><p class="vazio">No CRM desde ' + esc(dataBR(c.criado_em)) + (d.aluno ? " · tem cadastro na Área de Membros" : "") + "</p></div>" +
      '<div class="wa-fc-bloco"><span class="rotulo">Pontuação</span><div class="wa-pont"><b>' + pt.total + '</b><div class="wa-barra"><i style="width:' + pt.total + '%"></i></div>' +
      '<button type="button" class="btn peq contorno" data-ajuste="-5" aria-label="Tirar 5 pontos">−5</button><button type="button" class="btn peq contorno" data-ajuste="5" aria-label="Dar 5 pontos">+5</button></div>' +
      '<details class="wa-porque"><summary>Como chegou a ' + pt.total + " pontos</summary><ul>" + ((pt.itens || []).length ? pt.itens.map(function (i) { return "<li><span>" + esc(i.rotulo) + "</span><b>" + (i.pontos > 0 ? "+" : "") + i.pontos + "</b></li>"; }).join("") : "<li><span>Ainda sem pontos: a pessoa não interagiu.</span></li>") + "</ul></details></div>" +
      '<div class="wa-fc-bloco"><span class="rotulo">Mensagens</span><p>' + (rs.recebidas || 0) + (rs.recebidas === 1 ? " recebida · " : " recebidas · ") + (rs.enviadas || 0) + (rs.enviadas === 1 ? " enviada" : " enviadas") + (rs.primeira ? "<br>Primeira em " + esc(quando(rs.primeira)) + " · última em " + esc(quando(rs.ultima)) : "") + "</p></div>" +
      '<div class="wa-fc-bloco"><span class="rotulo">Histórico</span><div class="wa-copia"><input id="fcNota" maxlength="500" placeholder="Anotar: liguei, pediu retorno sexta..." aria-label="Anotar no histórico"><button type="button" class="btn peq" id="fcNotaAdd">Anotar</button></div>' +
      (hist.length ? '<ul class="linha-tempo wa-hist">' + (tudo ? hist : hist.slice(0, 8)).map(function (h) { return "<li>" + esc(h.descricao) + "<small>" + esc(quando(h.quando)) + (h.autor ? " · " + esc(h.autor) : "") + "</small></li>"; }).join("") + "</ul>" +
        (hist.length > 8 && !tudo ? '<button type="button" class="btn peq contorno" id="fcHistTudo">Ver os ' + hist.length + " registros</button>" : "") : '<p class="vazio">Nada registrado ainda.</p>') + "</div>";
    if (nota) $("fcNota").value = nota;
    if (focado) $("fcNota").focus();
    if (pqAberto) cx.querySelector(".wa-porque").open = true;
  }
  /* se o robô ou outra aba mudou a etapa, o nome ou as etiquetas, a ficha acompanha (sem mexer no campo que você está editando) */
  function sincronizarFicha() {
    const c = conversaCont; if (!c || $("cvFicha").hidden) return;
    const v = { fcNome: c.nome || "", fcEtapa: c.etapa, fcPrio: c.prioridade, fcEt: (c.etiquetas || []).join(", "), fcNotas: c.notas || "" };
    Object.keys(v).forEach(function (id) { const el = $(id); if (el && document.activeElement !== el && el.value !== v[id]) el.value = v[id]; });
  }
  async function anotar() {
    const i = $("fcNota"), t = i ? i.value.trim() : ""; if (!t || !conversaId) return;
    try {
      await ler(supa().from("wa_contato_eventos").insert({ contato_id: conversaId, tipo: "nota", descricao: t.slice(0, 500), autor: perfil.id }).select("id"));
      i.value = ""; aviso("Anotado no histórico."); await carregarFicha();
    } catch (e) { falha(e); }
  }
  async function marcarNaoLida() {
    try {
      await ler(supa().from("wa_contatos").update({ nao_lidas: Math.max(1, conversaCont.nao_lidas || 0) }).eq("id", conversaId).select("id"));
      fecharConversa(); aviso("Marcada como não lida."); carregarLista().catch(function () {});
    } catch (e) { falha(e); }
  }
  $("cvFicha").addEventListener("change", function (ev) {
    const id = ev.target.id, v = ev.target.value;
    if (id === "fcNome") salvarContato({ nome: v.trim() || null }, "Nome salvo.");
    else if (id === "fcEtapa") salvarContato({ etapa: v }, "Etapa salva.");
    else if (id === "fcPrio") salvarContato({ prioridade: v }, "Prioridade salva.");
    else if (id === "fcEt") salvarContato({ etiquetas: listaEt(v) }, "Etiquetas salvas.");
    else if (id === "fcNotas") salvarContato({ notas: v.trim() || null }, "Anotações salvas.");
  });
  $("cvFicha").addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    if (ev.target.id === "fcNota") { ev.preventDefault(); anotar(); }
    else if (ev.target.id === "fcNome" || ev.target.id === "fcEt") ev.target.blur();
  });
  $("cvFicha").addEventListener("click", function (ev) {
    const t = ev.target, aj = t.closest("[data-ajuste]");
    if (t.closest("#fcFechar")) { fichaAberta = false; mostrarFicha(); return; }
    if (aj) {
      const atual = conversaCont.pontuacao_ajuste || 0, v = Math.max(-50, Math.min(50, atual + Number(aj.dataset.ajuste)));
      if (v === atual) return aviso("O ajuste manual vai de -50 a +50.", true);
      return salvarContato({ pontuacao_ajuste: v });
    }
    if (t.closest("#fcHistTudo")) { $("fcDados").dataset.tudo = conversaCont.id; desenharFichaDados(); return; }
    if (t.closest("#fcNotaAdd")) return anotar();
    if (t.closest("#fcNaoLida")) return marcarNaoLida();
    if (t.closest("#fcTemplate")) return abrirEnvioTemplate(conversaCont);
    if (t.closest("#fcEditar")) return abrirContato(conversaCont);
  });

  /* cliques dentro da conversa (o topo é redesenhado a cada atualização, por isso ficam aqui) */
  $("cvThread").addEventListener("click", async function (ev) {
    const t = ev.target, p = t.closest("[data-pausa]"), em = t.closest("[data-emoji]"), rp = t.closest("[data-rap]"), bx = t.closest("[data-baixar]");
    if (p) return pausar(Number(p.dataset.pausa));
    if (t.closest("#cvRoboVoltar")) return salvarContato({ robo_pausado_ate: null, precisa_humano: false }, "O robô voltou a responder nesta conversa.");
    if (t.closest("#cvAtendido")) return salvarContato({ precisa_humano: false, sem_resposta: false, sem_resposta_desde: null }, "Marcado como atendido.");
    if (t.closest("#cvFichaBtn")) { fichaAberta = !fichaAberta; mostrarFicha(); return; }
    if (t.closest("#cvTemplate")) return abrirEnvioTemplate(conversaCont);
    if (em) { inserirNoCursor($("cvTexto"), em.dataset.emoji); guardarEmoji(em.dataset.emoji); return; }
    if (rp) return usarRapida(Number(rp.dataset.rap));
    if (t.closest("#cvRapGer")) { fecharPops(); return abrirRespostas(); }
    if (bx) {
      bx.disabled = true; bx.textContent = "Baixando...";
      const r = await wa({ acao: "baixar_midia", mensagem_id: bx.dataset.baixar });
      if (!r.ok) aviso(r.erro || "Não baixou.", true);
      ultimaAssinatura = ""; atualizarConversa().catch(function () {});
    }
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest("#cvCompor")) fecharPops();
    const m = $("cvPausaMenu"); if (m && m.open && !ev.target.closest("#cvPausaMenu")) m.open = false;
  });

  /* ---------- enviar template (conversa individual) ---------- */
  let lerVarsJt = function () { return { vars: [], midia: "" }; };
  async function abrirEnvioTemplate(c) {
    await carregarTemplates();
    const ok = templates.filter(tplUsavel);
    if (!ok.length) return aviso("Ainda não há template aprovado. Crie um na aba Templates e espere a aprovação do Meta.", true);
    $("jtPara").textContent = "Para: " + nomeDe(c) + (c.telefone && (c.nome || c.username) ? " · " + foneDe(c) : "");
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
    return templates.find(function (t) { return t.nome === n && t.idioma === i && tplUsavel(t); });
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
    $("dpVars").oninput = prev; prev(); resumoDisparo(); agendarConferencia();
  }
  $("dpTemplate").addEventListener("change", trocarTemplateDp);
  $("dpEtiqueta").addEventListener("change", resumoDisparo);
  async function telaDisparos() {
    await carregarConfig(); await carregarTemplates(); await carregarContatos();
    const ok = templates.filter(tplUsavel);
    const atual = $("dpTemplate").value;
    $("dpTemplate").innerHTML = ok.length ? ok.map(function (t) { return '<option value="' + esc(t.nome) + '|' + esc(t.idioma) + '">' + esc(t.nome) + " (" + esc(ROT_CAT[t.categoria] || "") + ")</option>"; }).join("") : '<option value="">Nenhum template aprovado ainda</option>';
    if (atual) $("dpTemplate").value = atual;
    if (listaParaDisparo) { $("dpEtiqueta").value = listaParaDisparo; listaParaDisparo = null; }
    if (templateParaDisparo) { const v = templateParaDisparo; templateParaDisparo = null; if (Array.prototype.some.call($("dpTemplate").options, function (o) { return o.value === v; })) $("dpTemplate").value = v; }
    trocarTemplateDp();
    const u = await wa({ acao: "uso_hoje" });
    $("dpUso").textContent = u.ok ? "Nas últimas 24 h você já enviou template para " + u.usados + " de " + u.limite + " pessoas permitidas." : "";
    await opcoesFiltroDisparos();
    await desenharDisparos();
  }
  const ROT_DP = { rascunho: ["Rascunho", "pendente"], agendado: ["Na fila", "pendente"], enviando: ["Enviando", "ouro"], pausado: ["Pausado", "off"], concluido: ["Concluído", "ok"], cancelado: ["Cancelado", "off"] };
  /* histórico: 30 por vez, com filtro por situação, template e período */
  const dpHist = { limite: 30 };
  async function opcoesFiltroDisparos() {
    try {
      const nomes = Array.from(new Set((await ler(supa().from("wa_disparos").select("template_nome"))).map(function (d) { return d.template_nome; }).filter(Boolean))).sort();
      const atual = $("dpFTpl").value;
      $("dpFTpl").innerHTML = '<option value="">Todos os templates</option>' + nomes.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "</option>"; }).join("");
      if (nomes.indexOf(atual) > -1) $("dpFTpl").value = atual;
    } catch (e) { console.error(e); }
  }
  ["dpFSit", "dpFTpl", "dpFPer"].forEach(function (id) { $(id).addEventListener("change", function () { dpHist.limite = 30; desenharDisparos().catch(falha); }); });
  $("dpMais").addEventListener("click", function () { dpHist.limite += 30; desenharDisparos().catch(falha); });
  async function desenharDisparos() {
    let q = supa().from("wa_disparos").select("*", { count: "exact" }).order("criado_em", { ascending: false });
    const fSit = $("dpFSit").value, fTpl = $("dpFTpl").value, fPer = Number($("dpFPer").value) || 0;
    if (fSit) q = q.eq("status", fSit);
    if (fTpl) q = q.eq("template_nome", fTpl);
    if (fPer) q = q.gte("criado_em", new Date(Date.now() - fPer * 86400000).toISOString());
    const pg = await q.range(0, dpHist.limite - 1);
    if (pg.error) throw pg.error;
    const ds = pg.data || [], totalHist = pg.count == null ? ds.length : pg.count;
    $("dpMais").hidden = ds.length >= totalHist;
    $("dpContagem").textContent = totalHist ? "Mostrando " + ds.length + " de " + totalHist : "";
    let res = {};
    try { (await ler(supa().rpc("wa_disparos_resumo"))).forEach(function (r) { res[r.disparo_id] = r; }); } catch (e) {}
    const tb = $("dpLista");
    if (!ds.length) { tb.innerHTML = '<tr><td colspan="8" class="vazio">' + (fSit || fTpl || fPer ? "Nenhum disparo com esses filtros." : "Nenhum disparo ainda.") + "</td></tr>"; return; }
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
      return '<tr><td><button type="button" class="cp-abrir" data-dp-painel="' + d.id + '" title="Abrir o painel desta campanha">' + esc(d.nome) + '</button><br><span class="vazio">' + esc(quando(d.criado_em)) + (d.agendado_para ? " · agendado " + esc(quando(d.agendado_para)) : "") + "</span></td><td>" + esc(d.template_nome) + '</td><td><span class="selo ' + st[1] + '">' + esc(st[0]) + "</span></td>" +
        '<td><div class="wa-barra"><i style="width:' + pct + '%"></i></div><span class="vazio">' + feitos + " de " + d.total + "</span></td><td>" + r.entregues + "</td><td>" + r.lidos + "</td><td>" + r.falhas + '</td><td><button class="btn peq contorno" data-dp-painel="' + d.id + '">Painel</button> ' + bt + "</td></tr>";
    }).join("");
  }
  $("dpLista").addEventListener("click", function (ev) {
    const p = ev.target.closest("[data-dp-painel]"); if (p) return abrirPainel(p.dataset.dpPainel);
    const b = ev.target.closest("[data-dp]"); if (!b) return;
    acaoDp(b.dataset.dp, b.dataset.id);
  });
  /* ações de uma campanha (usadas pela lista e pelo painel) */
  async function acaoDp(acao, id) {
    try {
      if (acao === "iniciar") {
        const r = await confirmarRepetida(await wa({ acao: "iniciar_disparo", disparo_id: id }), id);
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
      if (cp.id === id && $("jCampanha").open) {
        if (acao === "apagar") $("jCampanha").close();
        else carregarPainel(false).then(function () { return carregarDestinatarios(true); }).catch(function () {});
      }
    } catch (e) { falha(e); }
  }
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
    let confirmouRepetida = false;
    if (iniciar) {
      // travas de segurança (item 4.3): confere de novo na hora. O servidor repete as obrigatórias ao iniciar.
      const lista = await conferirDisparo(true), rs = WaCamp.resumoTravas(lista);
      if (rs.bloqueia) return aviso(rs.bloqueia.titulo + (rs.bloqueia.detalhe ? " " + rs.bloqueia.detalhe : ""), true);
      if (rs.confirma) {
        if (!confirm(rs.confirma.detalhe.replace(" Ao iniciar, o CRM vai pedir a sua confirmação.", "") + "\n\nQuer enviar de novo mesmo assim?")) return;
        confirmouRepetida = true;
      }
      if (!confirm("Enviar \"" + nome + "\"?\n\n" + $("dpResumo").textContent + (rs.avisos.length ? "\n\nAtenção:\n- " + rs.avisos.map(function (a) { return a.titulo; }).join("\n- ") : ""))) return;
    }
    try {
      const novo = await ler(supa().from("wa_disparos").insert({
        nome: nome, template_nome: t.nome, idioma: t.idioma, categoria: t.categoria, variaveis: v.vars, cabecalho_midia: precisaMidia ? v.midia : null,
        filtro_etiqueta: $("dpEtiqueta").value || null, agendado_para: quando_ ? quando_.toISOString() : null, status: "rascunho", criado_por: perfil.id,
        excluir_recentes: !$("dpExcluirBox").hidden && $("dpExcluirRecentes").checked,
        origem_id: dpOrigem ? dpOrigem.id : null, origem_tipo: dpOrigem ? "copia" : null
      }).select("id").single());
      $("dpNome").value = ""; dpOrigem = null;
      if (iniciar) {
        const r = await confirmarRepetida(await wa({ acao: "iniciar_disparo", disparo_id: novo.id, confirmar_repetido: confirmouRepetida }), novo.id);
        if (!r.ok) { aviso("Salvei como rascunho, mas não iniciou: " + (r.erro || ""), true); return desenharDisparos(); }
        if (!quando_) {
          const p = await wa({ acao: "processar_agora" });
          aviso(p.ok && (p.enviados || p.falhas) ? p.enviados + " enviadas agora." + (p.motivo ? " " + p.motivo : "") : (p.motivo || "Na fila."));
        } else aviso("Agendado.");
      } else aviso("Rascunho salvo.");
      desenharDisparos();
    } catch (e) { falha(e); }
  }
  let dpOrigem = null;   // preenchido quando o formulário foi aberto por "Duplicar" no painel de uma campanha
  $("dpTemplate").addEventListener("change", function () { dpOrigem = null; });
  $("dpTeste").addEventListener("click", function () {
    const t = tplSelecionado(); if (!t) return aviso("Escolha um template aprovado.", true);
    const v = lerVarsDp();
    if (v.vars.some(function (x) { return !String(x || "").trim(); })) return aviso("Preencha todas as variáveis do template antes do teste.", true);
    const precisaMidia = ["IMAGE", "VIDEO", "DOCUMENT"].indexOf(String(t.cabecalho_tipo || "").toUpperCase()) > -1;
    if (precisaMidia && !/^https:\/\//.test(v.midia || "")) return aviso("Informe o link (https://) do arquivo do cabeçalho antes do teste.", true);
    abrirTeste({ template_nome: t.nome, idioma: t.idioma, variaveis: v.vars, midia: precisaMidia ? v.midia : null });
  });
  $("dpCriar").addEventListener("click", function () { criarDisparo(true); });
  $("dpRascunho").addEventListener("click", function () { criarDisparo(false); });

  /* ---------- travas de segurança antes de enviar (Fase 4, item 4.3) ---------- */
  const tvDp = { midia: { url: "", tipo: "", ok: null, erro: "" }, seq: 0, t: null };
  function formTravas() {
    const t = tplSelecionado(), v = t ? lerVarsDp() : { vars: [], midia: "" };
    const cab = t ? String(t.cabecalho_tipo || "").toUpperCase() : "";
    const quando_ = $("dpQuando").value ? new Date($("dpQuando").value) : null;
    return { t: t, vars: v.vars || [], midiaUrl: String(v.midia || "").trim(), midiaTipo: ["IMAGE", "VIDEO", "DOCUMENT"].indexOf(cab) > -1 ? cab : "",
      usaNome: (v.vars || []).some(function (x) { return /\{(primeiro_)?nome\}/i.test(x); }),
      excluirRecentes: !$("dpExcluirBox").hidden && $("dpExcluirRecentes").checked, agendado: quando_ && !isNaN(quando_.getTime()) ? quando_.toISOString() : null };
  }
  /* pede ao banco os números da conferência e, se o template tem arquivo no cabeçalho, pede ao servidor para conferir o link */
  async function conferirDisparo(completo) {
    const f = formTravas(), seq = ++tvDp.seq;
    if (!f.t) return desenharTravas(null, f);
    try {
      const a = await ler(supa().rpc("wa_disparo_conferir", { p_template: f.t.nome, p_idioma: f.t.idioma, p_publico: $("dpEtiqueta").value || null, p_variaveis: f.vars }));
      if (f.midiaTipo && /^https:\/\/\S+$/.test(f.midiaUrl) && (completo || tvDp.midia.url !== f.midiaUrl || tvDp.midia.tipo !== f.midiaTipo)) {
        const r = await wa({ acao: "conferir_midia", url: f.midiaUrl, tipo: f.midiaTipo });
        tvDp.midia = { url: f.midiaUrl, tipo: f.midiaTipo, ok: !!r.ok, erro: r.ok ? "" : (r.erro || "Não consegui conferir o arquivo.") };
      }
      if (seq !== tvDp.seq && !completo) return null;   // o formulário mudou no meio: vale a conferência mais nova
      return desenharTravas(a, f);
    } catch (e) {
      console.error(e);
      $("dpTravas").innerHTML = '<li class="aviso-s"><span class="m" aria-hidden="true">!</span><span>Não consegui carregar a conferência agora.<small>O servidor confere de novo ao iniciar.</small></span></li>';
      return null;
    }
  }
  function desenharTravas(a, f) {
    if (!a) {
      $("dpTravas").innerHTML = '<li class="aviso-s"><span class="m" aria-hidden="true">!</span><span>Escolha um template aprovado para ver a conferência.</span></li>';
      $("dpExcluirBox").hidden = true; return null;
    }
    const rec = a.recentes || {};
    $("dpExcluirBox").hidden = !(rec.vale && Number(rec.pessoas) > 0);
    $("dpExcluirTxt").textContent = "Não enviar para " + (Number(rec.pessoas) === 1 ? "a pessoa que recebeu" : "as " + (Number(rec.pessoas) || 0) + " pessoas que receberam") + " marketing nos últimos " + (Number(rec.dias) || 3) + " dias";
    const m = tvDp.midia, mesma = m.url === f.midiaUrl && m.tipo === f.midiaTipo;
    const lista = WaCamp.travas(a, { usaNome: f.usaNome, midiaTipo: f.midiaTipo, midiaUrl: f.midiaUrl, midiaOk: mesma ? m.ok : null, midiaErro: mesma ? m.erro : "",
      excluirRecentes: !$("dpExcluirBox").hidden && $("dpExcluirRecentes").checked, agendado: f.agendado });
    $("dpTravas").innerHTML = lista.map(function (i) {
      const cls = i.nivel === "ok" ? "ok" : i.nivel === "bloqueia" ? "falta" : "aviso-s", mk = i.nivel === "ok" ? "✓" : i.nivel === "bloqueia" ? "✗" : "!";
      return '<li class="' + cls + '" data-trava="' + i.id + '"><span class="m" aria-hidden="true">' + mk + "</span><span>" + esc(i.titulo) + (i.detalhe ? "<small>" + esc(i.detalhe) + "</small>" : "") + "</span></li>";
    }).join("");
    return lista;
  }
  function agendarConferencia() { clearTimeout(tvDp.t); tvDp.t = setTimeout(function () { if (abaAtual === "disparos") conferirDisparo(false); }, 500); }
  (function () {
    const f = document.querySelector('[data-painel="disparos"] .f'); if (!f) return;
    f.addEventListener("input", agendarConferencia); f.addEventListener("change", agendarConferencia);
  })();
  /* o servidor avisou que já existe campanha igual: pergunta e, se você confirmar, inicia de novo já com a confirmação */
  async function confirmarRepetida(r, id) {
    if (!r || r.ok || !r.precisa_confirmar) return r;
    if (!confirm(WaCamp.textoRepetida(r.repetida) + "\n\nQuer enviar de novo mesmo assim?")) return { ok: false, erro: "Não iniciei. A campanha ficou como rascunho." };
    return await wa({ acao: "iniciar_disparo", disparo_id: id, confirmar_repetido: true });
  }

  /* ---------- envio de teste (Fase 4, item 4.4) ---------- */
  const ts = { dados: null, contato: null, seq: 0 };
  function abrirTeste(dados) {
    ts.dados = dados; ts.seq++;
    let lembrado = ""; try { lembrado = localStorage.getItem("wa_teste_contato") || ""; } catch (e) {}
    const primeiro = WaCamp.candidatosTeste(contatos, "", lembrado)[0];
    ts.contato = primeiro ? primeiro.id : null;
    $("tsResumo").textContent = "Template " + dados.template_nome + (dados.nome ? ", da campanha \"" + dados.nome + "\"" : "") + ". A mensagem sai com as variáveis trocadas pelos dados de quem receber.";
    $("tsBusca").value = ""; $("tsResultado").innerHTML = ""; desenharTeste();
    if (!$("jTeste").open) $("jTeste").showModal();
  }
  function desenharTeste() {
    const q = $("tsBusca").value, lista = WaCamp.candidatosTeste(contatos, q, ts.contato).slice(0, 8);
    $("tsLista").innerHTML = lista.length ? lista.map(function (c) {
      return '<button type="button" class="ts-item" data-ts="' + esc(c.id) + '" aria-pressed="' + (c.id === ts.contato ? "true" : "false") + '"><b>' + esc(nomeDe(c)) + "</b><span>" + esc(foneDe(c)) + "</span></button>";
    }).join("") : '<p class="vazio">' + (q.trim() ? "Nenhum contato com aceite com esse nome ou número." : "Digite o nome ou o número de um contato com aceite. Pode ser o seu.") + "</p>";
    $("tsEnviar").disabled = !ts.contato;
  }
  $("tsBusca").addEventListener("input", desenharTeste);
  $("tsLista").addEventListener("click", function (ev) { const b = ev.target.closest("[data-ts]"); if (!b) return; ts.contato = b.dataset.ts; desenharTeste(); });
  $("tsEnviar").addEventListener("click", async function () {
    const b = this, d = ts.dados; if (!ts.contato || !d) return;
    b.disabled = true; b.textContent = "Enviando...";
    try {
      const r = await wa(d.disparo_id ? { acao: "enviar_teste_disparo", contato_id: ts.contato, disparo_id: d.disparo_id }
        : { acao: "enviar_teste_disparo", contato_id: ts.contato, template_nome: d.template_nome, idioma: d.idioma, variaveis: d.variaveis, midia: d.midia });
      if (!r.ok) { $("tsResultado").innerHTML = '<div class="aviso erro">' + esc(r.erro || "O teste não saiu.") + "</div>"; return; }
      try { localStorage.setItem("wa_teste_contato", ts.contato); } catch (e) {}
      const c = (contatos || []).filter(function (x) { return x.id === ts.contato; })[0] || { telefone: r.para, nome: r.nome };
      $("tsResultado").innerHTML = '<div class="aviso ok">Enviado para ' + esc(nomeDe(c)) + " (" + esc(foneDe(c)) + '). Confira no celular. <span id="tsStatus">Situação: enviado, esperando a entrega.</span> <span class="vazio">Testes nas últimas 24 h: ' + (Number(r.testes_hoje) || 1) + " de 10.</span></div>";
      acompanharTeste(r.wamid);
      if (abaAtual === "disparos") agendarConferencia();   // a conferência passa a mostrar que o teste foi feito
    } catch (e) { falha(e); }
    finally { b.textContent = "Enviar teste"; b.disabled = !ts.contato; }
  });
  /* acompanha a mensagem de teste por até 45 segundos: enviado, entregue, lido */
  function acompanharTeste(wamid) {
    const seq = ++ts.seq; let n = 0; if (!wamid) return;
    const olhar = async function () {
      if (seq !== ts.seq || !$("jTeste").open || ++n > 15) return;
      try {
        const m = await ler(supa().from("wa_mensagens").select("status,erro").eq("wamid", wamid).maybeSingle());
        if (m && $("tsStatus")) $("tsStatus").textContent = "Situação: " + WaCamp.situacaoTeste(m.status, m.erro);
        if (m && (m.status === "lida" || m.status === "falhou")) return;
      } catch (e) { /* tenta de novo */ }
      setTimeout(olhar, 3000);
    };
    setTimeout(olhar, 2500);
  }

  /* ---------- painel: reenviar para quem falhou, duplicar e enviar fora do horário (itens 4.5 e 4.6) ---------- */
  async function extraPainel(qual) {
    const W = window.WaCamp, d = cp.dados, c = d && d.campanha; if (!c) return;
    try {
      if (qual === "teste") return abrirTeste({ disparo_id: c.id, nome: c.nome, template_nome: c.template_nome });
      if (qual === "duplicar") return duplicarCampanha(d);
      if (qual === "fora") {
        if (!confirm(W.textoForaDoHorario(d.horario))) return;
        const r = await ler(supa().rpc("wa_disparo_ignorar_horario", { p_id: c.id, p_ligar: true }));
        if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui liberar.", true);
        const p = await wa({ acao: "processar_agora" });
        aviso(p.ok && (p.enviados || p.falhas) ? p.enviados + " enviadas agora." + (p.motivo ? " " + p.motivo : "") : (p.motivo || "Liberada. O envio começa em até 5 minutos."));
      } else if (qual === "dentro") {
        const r = await ler(supa().rpc("wa_disparo_ignorar_horario", { p_id: c.id, p_ligar: false }));
        if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui alterar.", true);
        aviso("Esta campanha voltou a respeitar o horário de envio.");
      } else if (qual === "reenviar") {
        const pr = await ler(supa().rpc("wa_disparo_reenviar_falhas", { p_id: c.id, p_criar: false }));
        if (!pr || !pr.ok) return aviso((pr && pr.erro) || "Ninguém para reenviar.", true);
        if (!confirm(W.textoReenvio(pr, d.reenvio))) return;
        const r = await ler(supa().rpc("wa_disparo_reenviar_falhas", { p_id: c.id, p_criar: true }));
        if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui criar o reenvio.", true);
        aviso("Rascunho de reenvio criado com " + r.reenviar + (Number(r.reenviar) === 1 ? " pessoa" : " pessoas") + ". Confira e clique em Iniciar.");
        await desenharDisparos();
        return abrirPainel(r.id);
      } else return;
      await desenharDisparos(); await carregarPainel(false);
    } catch (e) { falha(e); }
  }
  /* duplicar: leva template, variáveis, público e arquivo para o formulário, com o nome "(cópia)" e sem data */
  function duplicarCampanha(d) {
    const c = d.campanha, chave = c.template_nome + "|" + c.idioma;
    if (!Array.prototype.some.call($("dpTemplate").options, function (o) { return o.value === chave; })) return aviso("O template desta campanha não está mais aprovado. Não dá para copiar.", true);
    $("jCampanha").close();
    $("dpNome").value = WaCamp.nomeCopia(c.nome); $("dpTemplate").value = chave; $("dpQuando").value = "";
    if (Array.prototype.some.call($("dpEtiqueta").options, function (o) { return o.value === (c.publico || ""); })) $("dpEtiqueta").value = c.publico || "";
    trocarTemplateDp();
    (c.variaveis || []).forEach(function (v, i) { const el = $("dpVars").querySelector('[data-var="' + (i + 1) + '"]'); if (el) el.value = v; });
    const m = $("dpVars").querySelector("[data-midia]"); if (m && c.midia) m.value = c.midia;
    $("dpVars").dispatchEvent(new Event("input", { bubbles: true }));
    dpOrigem = { id: c.id };
    resumoDisparo(); agendarConferencia();
    $("dpNome").scrollIntoView({ block: "center" }); $("dpNome").focus();
    aviso("Cópia de \"" + c.nome + "\" no formulário, sem data. Confira e crie quando quiser.");
  }

  /* ---------- painel da campanha (Fase 4, item 4.1) ---------- */
  const cp = { id: null, dados: null, filtro: "todas", busca: "", itens: [], total: 0, seq: 0, tBusca: null };
  const FILTROS_CP = [["todas", "Todos"], ["respondeu", "Responderam"], ["lido", "Lidos"], ["entregue", "Entregues"], ["enviado", "Enviados"], ["falhou", "Falharam"], ["pulado", "Pulados"], ["pendente", "Pendentes"], ["saiu", "Saíram"]];
  async function abrirPainel(id) {
    cp.id = id; cp.dados = null; cp.filtro = "todas"; cp.busca = ""; cp.itens = []; cp.total = 0;
    $("cpNome").textContent = "Carregando..."; $("cpResumo").innerHTML = '<p class="vazio">Carregando o painel...</p>';
    $("cpBusca").value = ""; $("cpFiltros").innerHTML = ""; $("cpLista").innerHTML = ""; $("cpMais").hidden = true; $("cpContagem").textContent = "";
    if (!$("jCampanha").open) $("jCampanha").showModal();
    await carregarPainel(true);
  }
  async function carregarPainel(comLista) {
    const id = cp.id; if (!id) return;
    try {
      const d = await ler(supa().rpc("wa_disparo_painel", { p_id: id }));
      if (id !== cp.id) return;
      if (!d) { $("cpNome").textContent = "Campanha"; $("cpResumo").innerHTML = '<p class="vazio">Esta campanha não existe mais.</p>'; return; }
      cp.dados = d; desenharPainel();
      if (comLista) await carregarDestinatarios(true);
    } catch (e) { falha(e); }
  }
  function desenharPainel() {
    const W = window.WaCamp, d = cp.dados, c = d.campanha || {}, it = d.itens || {}, f = d.funil || {}, m = d.mensagens || {};
    const st = ROT_DP[c.status] || [c.status || "?", "pendente"];
    const tp = !d.template ? ["Template não encontrado", "off"] : d.template.removido ? ["Removido no Meta", "off"] : (ROT_ST[d.template.status] || [d.template.status || "?", "pendente"]);
    const fato = function (rotulo, valor) { return '<div><span class="rotulo">' + rotulo + "</span><p>" + valor + "</p></div>"; };
    $("cpNome").textContent = c.nome || "Campanha";
    let h = '<div class="cp-fatos">' +
      fato("Situação", '<span class="selo ' + st[1] + '">' + esc(st[0]) + "</span>") +
      fato("Template", esc(c.template_nome || "") + ' <span class="selo ' + tp[1] + '">' + esc(tp[0]) + "</span>") +
      fato("Categoria", esc(ROT_CAT[c.categoria] || c.categoria || "não registrada") + (d.preco != null ? " · " + W.dinheiro(d.preco) + " por mensagem" : "")) +
      fato("Para quem", esc(W.rotuloPublico(c.publico)) + (c.publico_fixo ? " (só quem falhou na campanha de origem)" : "")) +
      (c.objetivo ? fato("Objetivo", esc(c.objetivo)) : "") +
      (c.origem ? fato(c.origem.tipo === "reenvio" ? "Reenvio de" : "Cópia de", '<button type="button" class="cp-abrir" data-cp-abrir="' + esc(c.origem.id) + '">' + esc(c.origem.nome) + "</button>") : "") +
      fato("Criada", esc(quando(c.criado_em)) + (c.criado_por ? " por " + esc(c.criado_por) : "")) +
      fato("Envio", m.primeira ? "De " + esc(quando(m.primeira)) + " até " + esc(quando(m.ultima)) : c.agendado_para ? "Agendada para " + esc(quando(c.agendado_para)) : "Ainda não enviada") +
      (c.concluido_em ? fato("Concluída", esc(quando(c.concluido_em))) : "") +
      (c.midia && /^https:\/\//.test(c.midia) ? fato("Mídia do cabeçalho", '<a href="' + esc(c.midia) + '" target="_blank" rel="noopener noreferrer">Abrir o arquivo</a>') : "") + "</div>";
    h += W.notasPainel(d).map(function (n) { return '<div class="cp-nota' + (n.tipo === "alerta" ? " alerta" : "") + '">' + esc(n.texto) + "</div>"; }).join("");
    if ((d.derivadas || []).length) h += '<p class="ajuda" style="margin-top:8px">Criadas a partir desta: ' + d.derivadas.map(function (x) {
      return '<button type="button" class="cp-abrir" data-cp-abrir="' + esc(x.id) + '">' + esc(x.nome) + "</button> (" + esc((ROT_DP[x.status] || [x.status || "?"])[0]) + ")"; }).join(", ") + "</p>";
    h += '<h3 class="cp-tit">Resultado</h3><div class="cp-funil">' + W.funil(f).map(function (e) {
      return '<div class="cp-etapa" data-etapa="' + e.chave + '"><span>' + e.rotulo + "</span><b>" + e.n + '</b><span class="cp-pct">' + e.pct + '</span><div class="wa-barra"><i style="width:' + e.largura + '%"></i></div></div>';
    }).join("") + '</div><p class="ajuda">Enviados em % do total; as outras etapas em % dos enviados. "Responderam" conta a primeira mensagem da pessoa em até ' + (Number(d.janela_resposta_horas) || 72) +
      " h depois do envio, sem contar pedido de saída. Quem recebeu mais de uma campanha conta só na mais recente.</p>";
    const quadro = function (rotulo, n, classe, filtro) { n = Number(n) || 0; return '<button type="button" class="cp-quadro' + (n ? " " + classe : "") + '" data-cp-filtro="' + filtro + '" data-cp-rolar="1"><b>' + n + "</b><span>" + rotulo + "</span></button>"; };
    h += '<div class="cp-quadros">' + quadro("Pediram para sair", d.saidas, "ruim", "saiu") + quadro("Falharam", it.falhou, "ruim", "falhou") + quadro("Pulados", it.pulado, "atencao", "pulado") + quadro("Pendentes", it.pendente, "atencao", "pendente") + "</div>";
    const repetidas = W.alertaRepetidas(m);
    if (repetidas) h += '<div class="aviso erro">' + esc(repetidas) + "</div>";
    h += '<p class="cp-custo"><b>Custo estimado: ' + W.dinheiro(d.custo_estimado) + "</b> (" + (Number(m.entregues) || 0) + " mensagens entregues × " + W.dinheiro(d.preco) + '). <span class="vazio">É uma estimativa: o valor real vem da Meta.</span></p>';
    const tabela = function (titulo, grupos) {
      if (!grupos.length) return "";
      return '<h3 class="cp-tit">' + titulo + '</h3><div class="tabela-wrap"><table class="t"><thead><tr><th class="quebra">Motivo</th><th>Quantas</th></tr></thead><tbody>' + grupos.map(function (g) {
        return '<tr><td class="quebra"><b>' + esc(g.titulo) + "</b>" + (g.dica ? '<br><span class="vazio">' + esc(g.dica) + "</span>" : "") + "</td><td>" + g.n + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    };
    h += tabela("Falhas por motivo", W.agrupar(d.falhas, W.motivoFalha)) + tabela("Pulados por motivo", W.agrupar(d.pulados, W.motivoPulado));
    let bt = "";
    if (c.status === "rascunho") bt += '<button type="button" class="btn peq" data-cp-acao="iniciar">Iniciar</button>';
    if (c.status === "pausado") bt += '<button type="button" class="btn peq" data-cp-acao="iniciar">Retomar</button>';
    if (c.status === "agendado" || c.status === "enviando") bt += '<button type="button" class="btn peq contorno" data-cp-acao="pausar">Pausar</button>';
    if (["agendado", "enviando", "pausado"].indexOf(c.status) > -1) bt += '<button type="button" class="btn peq perigo" data-cp-acao="cancelar">Cancelar</button>';
    const ativa = ["rascunho", "agendado", "enviando", "pausado"].indexOf(c.status) > -1, rv = d.reenvio || {}, hr = d.horario || {};
    if (ativa) bt += '<button type="button" class="btn peq contorno" data-cp-extra="teste">Enviar teste</button>';
    if ((c.status === "agendado" || c.status === "enviando") && hr.dentro === false && !c.ignorar_horario) bt += '<button type="button" class="btn peq contorno" data-cp-extra="fora">Enviar agora (ignorar horário)</button>';
    if (c.ignorar_horario && ativa) bt += '<button type="button" class="btn peq contorno" data-cp-extra="dentro">Voltar a respeitar o horário</button>';
    if (Number(rv.recuperaveis) > 0 && c.status !== "rascunho") bt += '<button type="button" class="btn peq contorno" data-cp-extra="reenviar">Reenviar para quem falhou (' + Number(rv.recuperaveis) + ")</button>";
    bt += '<button type="button" class="btn peq contorno" data-cp-extra="duplicar">Duplicar</button>';
    h += '<div class="acoes cp-acoes">' + bt + '<button type="button" class="btn peq contorno" id="cpCsv">Exportar resultado (CSV)</button><span class="vazio">O arquivo tem nomes e telefones: guarde com cuidado.</span></div>';
    $("cpResumo").innerHTML = h;
    const cont = { todas: it.total, respondeu: f.responderam, lido: it.lido, entregue: it.entregue, enviado: it.enviado, falhou: it.falhou, pulado: it.pulado, pendente: it.pendente, saiu: d.saidas };
    $("cpFiltros").innerHTML = FILTROS_CP.map(function (x) {
      return '<button type="button" class="wa-chip" data-cp-filtro="' + x[0] + '" aria-pressed="' + (cp.filtro === x[0] ? "true" : "false") + '">' + x[1] + "<b>" + (Number(cont[x[0]]) || "") + "</b></button>";
    }).join("");
  }
  async function carregarDestinatarios(zerar) {
    const id = cp.id, seq = ++cp.seq; if (!id) return;
    const depois = zerar ? 0 : cp.itens.length;
    const r = await ler(supa().rpc("wa_disparo_destinatarios", { p_id: id, p_situacao: cp.filtro, p_busca: cp.busca, p_limite: 50, p_depois: depois }));
    if (id !== cp.id || seq !== cp.seq) return;
    cp.total = (r && Number(r.total)) || 0;
    cp.itens = (zerar ? [] : cp.itens).concat((r && r.itens) || []);
    desenharDestinatarios();
  }
  function desenharDestinatarios() {
    const W = window.WaCamp;
    $("cpLista").innerHTML = cp.itens.length ? cp.itens.map(function (p) {
      const st = W.SIT[p.status] || [p.status || "?", "pendente"];
      const motivo = p.status === "falhou" ? W.motivoFalha(p.erro).titulo : p.status === "pulado" ? W.motivoPulado(p.erro).titulo : "";
      const resposta = p.saiu ? '<span class="selo off">Pediu para sair</span>' + (p.resposta ? " " + esc(p.resposta) : "")
        : p.respondeu ? esc(p.resposta || "") + '<br><span class="vazio">' + esc(quando(p.resposta_em)) + "</span>" : "";
      return '<tr><td><button type="button" class="cp-abrir" data-cp-conversa="' + esc(p.contato_id) + '" title="Abrir a conversa">' + esc(nomeDe(p)) + '</button><br><span class="vazio">' + esc(p.telefone ? foneDe(p) : "sem número visível") + "</span></td>" +
        '<td><span class="selo ' + st[1] + '">' + esc(st[0]) + "</span>" + (Number(p.mensagens) > 1 ? '<br><span class="vazio">' + Number(p.mensagens) + " envios</span>" : "") + '</td><td class="quebra">' + esc(motivo) + "</td><td>" +
        (p.enviado_em ? esc(quando(p.enviado_em)) : '<span class="vazio">não enviado</span>') + '</td><td class="quebra">' + resposta + "</td></tr>";
    }).join("") : '<tr><td colspan="5" class="vazio">' + (cp.busca || cp.filtro !== "todas" ? "Ninguém neste filtro." : "Esta campanha ainda não tem destinatários.") + "</td></tr>";
    $("cpMais").hidden = cp.itens.length >= cp.total;
    $("cpContagem").textContent = cp.total ? "Mostrando " + cp.itens.length + " de " + cp.total : "";
  }
  async function exportarCsv() {
    const W = window.WaCamp, b = $("cpCsv"), id = cp.id; if (!id || !cp.dados || !b) return;
    b.disabled = true; b.textContent = "Preparando...";
    try {
      let todos = [], total = 1;
      while (todos.length < total) {
        const r = await ler(supa().rpc("wa_disparo_destinatarios", { p_id: id, p_situacao: "todas", p_busca: "", p_limite: 1000, p_depois: todos.length }));
        const lote = (r && r.itens) || []; total = (r && Number(r.total)) || 0;
        if (!lote.length) break;
        todos = todos.concat(lote);
      }
      if (!todos.length) { aviso("Esta campanha não tem destinatários para exportar.", true); return; }
      const texto = W.csv(W.CSV_CABECALHO, todos.map(function (p) { return W.linhaCsv(p, p.telefone ? foneDe(p) : ""); }));
      const url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" })), a = document.createElement("a");
      a.href = url; a.download = W.nomeArquivo(cp.dados.campanha.nome); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
      aviso("Arquivo baixado com " + todos.length + (todos.length === 1 ? " pessoa." : " pessoas."));
    } catch (e) { falha(e); }
    finally { const x = $("cpCsv"); if (x) { x.disabled = false; x.textContent = "Exportar resultado (CSV)"; } }
  }
  $("jCampanha").addEventListener("click", function (ev) {
    const t = ev.target, f = t.closest("[data-cp-filtro]"), c = t.closest("[data-cp-conversa]"), a = t.closest("[data-cp-acao]");
    const extra = t.closest("[data-cp-extra]"), outra = t.closest("[data-cp-abrir]");
    if (outra) return abrirPainel(outra.dataset.cpAbrir);
    if (extra) return extraPainel(extra.dataset.cpExtra);
    if (f) {
      cp.filtro = f.dataset.cpFiltro;
      Array.prototype.forEach.call($("cpFiltros").querySelectorAll("[data-cp-filtro]"), function (x) { x.setAttribute("aria-pressed", x.dataset.cpFiltro === cp.filtro ? "true" : "false"); });
      carregarDestinatarios(true).catch(falha);
      if (f.dataset.cpRolar) $("cpDestTitulo").scrollIntoView({ block: "start" });
      return;
    }
    if (c) { conversaId = c.dataset.cpConversa; $("jCampanha").close(); abrirAba("conversas"); return; }
    if (a) return acaoDp(a.dataset.cpAcao, cp.id);
    if (t.closest("#cpMais")) return carregarDestinatarios(false).catch(falha);
    if (t.closest("#cpCsv")) return exportarCsv();
  });
  $("cpBusca").addEventListener("input", function () {
    const v = this.value.trim(); clearTimeout(cp.tBusca);
    cp.tBusca = setTimeout(function () { cp.busca = v; carregarDestinatarios(true).catch(falha); }, 300);
  });
  $("jCampanha").addEventListener("close", function () { cp.id = null; cp.dados = null; });
  /* painel aberto com a campanha na fila ou enviando: atualiza sozinho a cada 30 segundos */
  setInterval(function () {
    if (document.hidden || !cp.id || !cp.dados || !$("jCampanha").open) return;
    if (["agendado", "enviando"].indexOf((cp.dados.campanha || {}).status) === -1) return;
    carregarPainel(false).then(function () { if (cp.itens.length <= 50 && !cp.busca) return carregarDestinatarios(true); }).catch(function () {});
  }, 30000);

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
    sel.innerHTML = '<option value="">Nenhum (só texto)</option>' + (templates || []).filter(tplUsavel).map(function (t) { return '<option value="' + esc(t.nome) + '">' + esc(t.nome) + "</option>"; }).join("");
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

  /* aba Templates aberta: recarrega sozinha a cada minuto (situação e "há quanto tempo") */
  setInterval(function () { if (!document.hidden && abaAtual === "templates") telaTemplates().catch(function () {}); }, 60000);

  try { await carregarConfig(); } catch (e) { falha(e, "Não consegui ler a configuração. Atualize a página."); }
  avisarNovidadesTemplates();
  abrirAba("conversas");
})();
