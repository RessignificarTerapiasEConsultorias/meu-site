/* CRM WhatsApp · Fase 3 (Templates): funções puras, sem acesso à página nem ao banco.
   Prévia no estilo do WhatsApp, checklist do editor, filtros e busca, motivos de recusa em português
   e conversão de um template existente para o editor (duplicar). Exposto em window.WaTpl. */
(function (raiz) {
  "use strict";

  function semAcento(s) { return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function achar(comps, tipo) { return (comps || []).find(function (c) { return String(c && c.type).toUpperCase() === tipo; }) || null; }
  function botoesDe(comps) { const b = achar(comps, "BUTTONS"); return (b && b.buttons) || []; }
  function varsDe(texto) {
    return Array.from(new Set(Array.from(String(texto || "").matchAll(/\{\{(\d+)\}\}/g)).map(function (m) { return Number(m[1]); }))).sort(function (a, b) { return a - b; });
  }

  /* ---------- motivos de recusa do Meta, em português simples ---------- */
  const MOTIVOS = {
    INVALID_FORMAT: "Formato inválido. Confira se o texto não começa nem termina com variável, se as variáveis estão em sequência ({{1}}, {{2}}...) e se cada uma tem exemplo.",
    INCORRECT_CATEGORY: "Categoria errada: o Meta entendeu que o texto é de outro tipo (quase sempre marketing). Crie de novo escolhendo Marketing.",
    TAG_CONTENT_MISMATCH: "A categoria não combina com o texto. Se for convite, oferta ou divulgação, use Marketing.",
    ABUSIVE_CONTENT: "O Meta considerou o conteúdo abusivo ou ofensivo. Reescreva com linguagem neutra.",
    SCAM: "O Meta entendeu o texto como golpe. Evite promessa de ganho fácil, urgência exagerada e pedido de dados pessoais.",
    PROMOTIONAL: "O texto parece promocional demais para a categoria escolhida.",
    NONE: ""
  };
  function motivo(cod) {
    const c = String(cod || "").trim(); if (!c) return "";
    const k = c.toUpperCase();
    return Object.prototype.hasOwnProperty.call(MOTIVOS, k) ? MOTIVOS[k] : "Motivo informado pelo Meta: " + c;
  }

  /* ---------- prévia no estilo do WhatsApp ---------- */
  function zap(txt) {
    let h = esc(txt);
    h = h.replace(/\*([^*\n]+)\*/g, "<b>$1</b>").replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s.,!?)])/g, "$1<i>$2</i>").replace(/~([^~\n]+)~/g, "<s>$1</s>");
    return h.replace(/\n/g, "<br>");
  }
  function trocar(txt, vars) {
    return String(txt || "").replace(/\{\{(\d+)\}\}/g, function (m, n) { const v = vars && vars[Number(n) - 1]; return v ? v : "{{" + n + "}}"; });
  }
  function exemplosDe(comps) {
    const b = achar(comps, "BODY"), e = b && b.example && b.example.body_text && b.example.body_text[0];
    return Array.isArray(e) ? e.map(String) : [];
  }
  const ROT_FORMATO = { IMAGE: "Imagem", VIDEO: "Vídeo", DOCUMENT: "Documento PDF" };
  const ICONE_FORMATO = { IMAGE: "🖼", VIDEO: "▶", DOCUMENT: "📄" };
  /* opts: { vars: [..], midiaUrl: "..." (imagem/vídeo de exemplo, opcional), hora: "14:32" } */
  function previaHtml(comps, opts) {
    opts = opts || {};
    const cab = achar(comps, "HEADER"), corpo = achar(comps, "BODY"), rod = achar(comps, "FOOTER"), bts = botoesDe(comps);
    const vars = (opts.vars && opts.vars.length ? opts.vars : exemplosDe(comps));
    let h = '<div class="wa-zap"><div class="wa-zap-balao">';
    if (cab) {
      const f = String(cab.format || "TEXT").toUpperCase();
      if (f === "TEXT") h += cab.text ? '<div class="wa-zap-tit">' + zap(trocar(cab.text, vars)) + "</div>" : "";
      else if (f === "IMAGE" && opts.midiaUrl) h += '<div class="wa-zap-midia"><img src="' + esc(opts.midiaUrl) + '" alt="Imagem do cabeçalho"></div>';
      else if (f === "VIDEO" && opts.midiaUrl) h += '<div class="wa-zap-midia"><video src="' + esc(opts.midiaUrl) + '" controls muted playsinline></video></div>';
      else h += '<div class="wa-zap-midia wa-zap-vazia"><span aria-hidden="true">' + (ICONE_FORMATO[f] || "▣") + "</span><small>" + esc(ROT_FORMATO[f] || f) + " no cabeçalho</small></div>";
    }
    h += '<div class="wa-zap-txt">' + (corpo && corpo.text ? zap(trocar(corpo.text, vars)) : '<span class="vazio">Escreva o texto da mensagem.</span>') + "</div>";
    if (rod && rod.text) h += '<div class="wa-zap-rod">' + esc(rod.text) + "</div>";
    h += '<div class="wa-zap-hora">' + esc(opts.hora || "14:32") + "</div></div>";
    if (bts.length) {
      h += '<div class="wa-zap-botoes">' + bts.map(function (b) {
        const t = String(b.type).toUpperCase(), ic = t === "URL" ? "↗" : t === "PHONE_NUMBER" ? "✆" : "↩";
        return '<div class="wa-zap-botao"><span aria-hidden="true">' + ic + "</span> " + esc(b.text || "(sem texto)") + "</div>";
      }).join("") + "</div>";
    }
    return h + "</div>";
  }

  /* componentes no formato da Meta, a partir do que está digitado no editor */
  function compsDoForm(c) {
    const comps = [], cabT = String(c.cabTipo || "").toUpperCase();
    if (cabT === "TEXT") comps.push({ type: "HEADER", format: "TEXT", text: String(c.cabTexto || "") });
    else if (cabT && cabT !== "TEXT") comps.push({ type: "HEADER", format: cabT });
    const corpo = { type: "BODY", text: String(c.corpo || "") };
    const ex = (c.exemplos || []).map(function (x) { return String(x || ""); });
    if (varsDe(corpo.text).length && ex.length) corpo.example = { body_text: [ex] };
    comps.push(corpo);
    if (String(c.rodape || "").trim()) comps.push({ type: "FOOTER", text: String(c.rodape).trim() });
    const bs = (c.botoes || []).map(function (b) {
      if (b.tipo === "URL") return { type: "URL", text: b.texto || "", url: b.valor || "" };
      if (b.tipo === "PHONE_NUMBER") return { type: "PHONE_NUMBER", text: b.texto || "", phone_number: b.valor || "" };
      return { type: "QUICK_REPLY", text: b.texto || "" };
    });
    if (bs.length) comps.push({ type: "BUTTONS", buttons: bs });
    return comps;
  }

  /* ---------- duplicar: template existente -> campos do editor ---------- */
  function nomeParaCopia(nome, existentes) {
    const usados = new Set((existentes || []).map(function (n) { return String(n).toLowerCase(); }));
    const base = String(nome || "template").toLowerCase().replace(/_v\d+$/, "").replace(/[^a-z0-9_]/g, "_");
    for (let i = 2; i < 200; i++) {
      const suf = "_v" + i, cand = base.slice(0, 60 - suf.length) + suf;
      if (!usados.has(cand)) return cand;
    }
    return base.slice(0, 50) + "_copia";
  }
  function paraEditor(t, existentes) {
    const comps = (t && t.componentes) || [], cab = achar(comps, "HEADER"), corpo = achar(comps, "BODY"), rod = achar(comps, "FOOTER");
    const f = cab ? String(cab.format || "TEXT").toUpperCase() : "";
    const p = {
      nome: nomeParaCopia(t && t.nome, existentes), cat: (t && t.categoria) === "MARKETING" ? "MARKETING" : "UTILITY",
      cabTipo: f, cabTexto: f === "TEXT" ? String(cab.text || "") : "", corpo: corpo ? String(corpo.text || "") : "",
      exemplos: exemplosDe(comps), rodape: rod ? String(rod.text || "") : "",
      botoes: botoesDe(comps).map(function (b) {
        const tp = String(b.type).toUpperCase();
        if (tp === "URL") return { tipo: "URL", texto: b.text || "", valor: b.url || "" };
        if (tp === "PHONE_NUMBER") return { tipo: "PHONE_NUMBER", texto: b.text || "", valor: b.phone_number || "" };
        return { tipo: "QUICK_REPLY", texto: b.text || "" };
      }).slice(0, 3)
    };
    p.precisaMidia = f === "IMAGE" || f === "VIDEO" || f === "DOCUMENT";
    return p;
  }

  /* ---------- checklist do editor ---------- */
  const RISCO = ["ganhe dinheiro", "dinheiro facil", "renda extra garantida", "resultado garantido", "cura garantida", "100% garantido", "sem risco", "ultima chance", "clique agora", "urgente", "milagre", "enriqueca"];
  const PAL_MKT = ["promo", "desconto", "oferta", "convite", "vagas", "inscri", "lancamento", "garanta", "aproveite", "compre", "ultimas", "bonus", "gratis", "cupom"];
  const PAL_UTIL = ["lembrete", "aviso", "confirma", "pagamento", "vence", "boleto", "acesso liberado", "sua aula", "seu pedido", "agendamento"];
  function contem(txt, lista) { const t = semAcento(txt); return lista.filter(function (p) { return t.indexOf(p) >= 0; }); }

  /* c: { nome, existentes[], cat, corpo, exemplos[], rodape, botoes[{tipo,texto,valor}], cabTipo, cabTexto, cabAmostra } */
  function checklist(c) {
    const itens = [];
    const add = function (id, ok, obrigatorio, rotulo, dica) { itens.push({ id: id, ok: !!ok, obrigatorio: !!obrigatorio, rotulo: rotulo, dica: ok ? "" : dica }); };
    const corpo = String(c.corpo || "").trim(), ns = varsDe(corpo), ex = (c.exemplos || []);
    const nome = String(c.nome || "").trim(), usados = (c.existentes || []).map(function (n) { return String(n).toLowerCase(); });
    add("nome", /^[a-z0-9_]{1,60}$/.test(nome) && usados.indexOf(nome) < 0, true, "Nome válido e livre",
      !nome ? "Dê um nome ao template." : usados.indexOf(nome) >= 0 ? "Já existe um template com este nome. Troque o nome." : "Use só letras minúsculas, números e _ (sem espaço nem acento).");
    add("texto", !!corpo, true, "Texto da mensagem escrito", "Escreva o texto da mensagem.");
    add("comeco", !/^\{\{\d+\}\}/.test(corpo), true, "O texto não começa com variável", 'Comece com uma palavra, por exemplo: "Oi, {{1}}!".');
    add("fim", !/\{\{\d+\}\}[\s.!?…]*$/.test(corpo), true, "O texto não termina com variável", "Termine com uma frase fixa, depois da última variável.");
    let seqOk = true; for (let i = 0; i < ns.length; i++) if (ns[i] !== i + 1) seqOk = false;
    const coladas = /\{\{\d+\}\}\s*\{\{\d+\}\}/.test(corpo);
    add("sequencia", seqOk && !coladas, true, "Variáveis em sequência e separadas", coladas ? "Não deixe duas variáveis coladas: ponha texto entre elas." : "Use {{1}}, {{2}}, {{3}}... sem pular número.");
    add("exemplos", !ns.length || (ex.length >= ns.length && ex.slice(0, ns.length).every(function (x) { return String(x || "").trim(); })), true, "Exemplo preenchido em cada variável", "Preencha o exemplo de cada variável: o Meta usa para aprovar.");
    const palavras = corpo.replace(/\{\{\d+\}\}/g, " ").split(/\s+/).filter(Boolean).length;
    add("fixo", !ns.length || palavras >= ns.length * 3, true, "Texto fixo suficiente", "Tem variável demais para pouco texto fixo. Escreva mais frases fixas.");

    const bts = c.botoes || [];
    const problemas = [];
    if (corpo.length > 1024) problemas.push("o texto passa de 1.024 caracteres");
    if (String(c.rodape || "").length > 60) problemas.push("o rodapé passa de 60 caracteres");
    if (String(c.cabTexto || "").length > 60) problemas.push("o título passa de 60 caracteres");
    const vistos = {};
    bts.forEach(function (b, i) {
      const tx = String(b.texto || "").trim(), vl = String(b.valor || "").trim(), n = "botão " + (i + 1);
      if (!tx) problemas.push("o " + n + " está sem texto");
      else if (tx.length > 25) problemas.push("o " + n + " passa de 25 caracteres");
      if (tx && vistos[tx.toLowerCase()]) problemas.push("dois botões têm o mesmo texto");
      vistos[tx.toLowerCase()] = true;
      if (b.tipo === "URL" && !/^https:\/\/\S+$/.test(vl)) problemas.push("o " + n + " precisa de um link começando com https://");
      if (b.tipo === "PHONE_NUMBER" && !/^\+\d{10,15}$/.test(vl)) problemas.push("o " + n + " precisa do telefone com + e DDI, ex.: +5581999999999");
      if (b.tipo === "ROBO" && !/^https:\/\/\S+$/.test(vl)) problemas.push("o " + n + " precisa do link que o robô entrega (https://)");
    });
    if (bts.filter(function (b) { return b.tipo === "PHONE_NUMBER"; }).length > 1) problemas.push("só pode haver 1 botão de ligar");
    if (bts.length > 3) problemas.push("no máximo 3 botões");
    add("tamanhos", !problemas.length, true, "Tamanhos e botões dentro do limite", "Ajuste: " + problemas.join("; ") + ".");

    const linkVar = bts.some(function (b) { return (b.tipo === "URL" || b.tipo === "ROBO") && /\{\{/.test(String(b.valor || "")); });
    add("linkvar", !linkVar, true, "Link do botão sem variável", "Por enquanto o link do botão não pode ter {{variável}}. Use um endereço fixo.");

    const cabT = String(c.cabTipo || "").toUpperCase();
    let cabOk = true, cabDica = "";
    if (cabT === "TEXT" && !String(c.cabTexto || "").trim()) { cabOk = false; cabDica = 'Escreva o título ou escolha "Sem cabeçalho".'; }
    if ((cabT === "IMAGE" || cabT === "VIDEO" || cabT === "DOCUMENT") && !c.cabAmostra) { cabOk = false; cabDica = 'Escolha o arquivo do cabeçalho e espere o aviso "exemplo aceito pelo Meta".'; }
    add("cabecalho", cabOk, true, "Cabeçalho completo", cabDica);

    const mk = contem(corpo, PAL_MKT), ut = contem(corpo, PAL_UTIL);
    let catOk = true, catDica = "";
    if (c.cat === "UTILITY" && mk.length) { catOk = false; catDica = 'O texto tem cara de divulgação ("' + mk[0] + '"). O Meta pode trocar para Marketing, que custa mais. Se for convite ou oferta, escolha Marketing.'; }
    else if (c.cat === "MARKETING" && !mk.length && ut.length) { catOk = false; catDica = "O texto parece um aviso sobre algo que a pessoa já contratou. Se for esse o caso, Utilidade custa bem menos."; }
    add("categoria", catOk, false, "Categoria combina com o texto", catDica);

    const risco = contem(corpo + " " + String(c.rodape || "") + " " + String(c.cabTexto || ""), RISCO);
    add("risco", !risco.length, false, "Sem palavras que costumam causar recusa", 'Evite expressões como "' + (risco[0] || "") + '": o Meta costuma recusar.');

    return itens;
  }
  function checklistPronto(itens) { return !itens.some(function (i) { return i.obrigatorio && !i.ok; }); }

  /* ---------- filtros, busca e ordem da lista ---------- */
  function emAnalise(t) { const s = String(t.status).toUpperCase(); return s === "PENDING" || s === "IN_APPEAL"; }
  function grupoSituacao(t) {
    if (t.removido_no_meta) return "OUTROS";
    const s = String(t.status).toUpperCase();
    if (s === "APPROVED") return "APPROVED";
    if (s === "PENDING" || s === "IN_APPEAL") return "PENDING";
    if (s === "REJECTED") return "REJECTED";
    return "OUTROS";
  }
  function temMidia(t) { const c = achar(t.componentes, "HEADER"); return !!c && String(c.format || "").toUpperCase() !== "TEXT"; }
  function textoBusca(t) {
    const comps = t.componentes || [], partes = [t.nome];
    ["HEADER", "BODY", "FOOTER"].forEach(function (k) { const c = achar(comps, k); if (c && c.text) partes.push(c.text); });
    botoesDe(comps).forEach(function (b) { partes.push(b.text || ""); });
    return semAcento(partes.join(" "));
  }
  /* f: { busca, sit: ""|APPROVED|PENDING|REJECTED|OUTROS, cat: ""|UTILITY|MARKETING, cab: ""|midia|texto, botoes: ""|com|sem } */
  function filtrar(lista, f) {
    f = f || {};
    const q = semAcento(f.busca || "").trim();
    return (lista || []).filter(function (t) {
      if (f.sit && grupoSituacao(t) !== f.sit) return false;
      if (f.cat && String(t.categoria).toUpperCase() !== f.cat) return false;
      if (f.cab === "midia" && !temMidia(t)) return false;
      if (f.cab === "texto" && temMidia(t)) return false;
      if (f.botoes === "com" && !botoesDe(t.componentes).length) return false;
      if (f.botoes === "sem" && botoesDe(t.componentes).length) return false;
      if (q && textoBusca(t).indexOf(q) < 0) return false;
      return true;
    });
  }
  function contar(lista) {
    const n = { todos: (lista || []).length, APPROVED: 0, PENDING: 0, REJECTED: 0, OUTROS: 0 };
    (lista || []).forEach(function (t) { n[grupoSituacao(t)]++; });
    return n;
  }
  function tempoAnalise(t) {
    if (!t.enviado_em || !t.resultado_em) return -1;
    return new Date(t.resultado_em).getTime() - new Date(t.enviado_em).getTime();
  }
  function ordenar(lista, ordem) {
    const a = (lista || []).slice();
    const data = function (t) { return new Date(t.enviado_em || t.atualizado_em || 0).getTime() || 0; };
    if (ordem === "nome") a.sort(function (x, y) { return String(x.nome).localeCompare(String(y.nome), "pt-BR"); });
    else if (ordem === "tempo") a.sort(function (x, y) { return tempoAnalise(y) - tempoAnalise(x) || data(y) - data(x); });
    else a.sort(function (x, y) { return data(y) - data(x); });
    return a;
  }

  raiz.WaTpl = {
    semAcento: semAcento, motivo: motivo, previaHtml: previaHtml, compsDoForm: compsDoForm, exemplosDe: exemplosDe, varsDe: varsDe,
    paraEditor: paraEditor, nomeParaCopia: nomeParaCopia, checklist: checklist, checklistPronto: checklistPronto,
    filtrar: filtrar, contar: contar, ordenar: ordenar, grupoSituacao: grupoSituacao, temMidia: temMidia, emAnalise: emAnalise, botoesDe: botoesDe
  };
})(typeof window !== "undefined" ? window : globalThis);
