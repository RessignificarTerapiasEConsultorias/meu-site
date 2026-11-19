/* E-mail (Fase 8): funções puras, para testar sem a página.
   ATENÇÃO: este mesmo arquivo é enviado junto com a função de servidor crm-email, para que a prévia do painel
   e o e-mail de verdade sejam montados pelo mesmo código. Mudou aqui? Publique a função de novo. */
(function (raiz) {
  "use strict";
  /* ---------- endereço (itens 8.1 e 8.2) ---------- */
  function normalizar(e) {
    const v = String(e === null || e === undefined ? "" : e).replace(/\s+/g, "").toLowerCase().replace(/\.+$/, "");
    return v || null;
  }
  /* mesma regra do banco: formato simples, sem dois pontos seguidos, até 254 caracteres */
  function valido(e) {
    const v = normalizar(e);
    return !!v && v.length <= 254 && !/\.\./.test(v) && /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(v);
  }
  const ERROS_DOMINIO = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.com.br": "gmail.com", "gnail.com": "gmail.com",
    "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com", "hotnail.com": "hotmail.com",
    "outlok.com": "outlook.com", "outllok.com": "outlook.com", "outlook.con": "outlook.com", "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "yhaoo.com": "yahoo.com", "iclod.com": "icloud.com", "icloud.con": "icloud.com" };
  /* sugere a correção, sem trocar sozinho */
  function sugestao(e) {
    const v = normalizar(e); if (!v || v.indexOf("@") < 0) return null;
    const partes = v.split("@"), certo = ERROS_DOMINIO[partes[1]];
    return certo ? partes[0] + "@" + certo : null;
  }
  const FUNCAO = ["contato", "info", "admin", "sac", "atendimento", "vendas", "financeiro", "suporte", "noreply", "no-reply", "comercial", "marketing", "rh"];
  function deFuncao(e) { const v = normalizar(e); return !!v && FUNCAO.indexOf(v.split("@")[0]) >= 0; }
  const SITUACAO = { sem_email: "Sem e-mail", so_transacional: "Só transacional (sem autorização de marketing)", aceitou: "Autorizou receber e-mail", saiu: "Saiu dos e-mails", invalido: "Endereço com erro de entrega" };
  function rotuloSituacao(s) { return SITUACAO[String(s || "sem_email")] || "Sem e-mail"; }
  const MOTIVO = { clicou_no_link: "Clicou em sair", reclamou_spam: "Marcou como spam", respondeu_sair: "Respondeu pedindo para sair", bounce_permanente: "Endereço não existe", removido_pelo_dono: "Retirado por você" };
  function rotuloMotivo(m) { return MOTIVO[String(m || "")] || "Saiu"; }
  function usoTexto(usados, limite) {
    const u = Math.max(0, Number(usados) || 0), l = Math.max(0, Number(limite) || 0);
    return u + " de " + l + (l > 0 && u >= l ? " (limite atingido)" : "");
  }
  /* avisos ao digitar o e-mail na ficha: lista de frases curtas */
  function avisos(e) {
    const v = normalizar(e), out = [];
    if (!v) return out;
    if (!valido(v)) { out.push("Este e-mail não parece válido."); return out; }
    const s = sugestao(v); if (s) out.push("Você quis dizer " + s + "?");
    if (deFuncao(v)) out.push("Endereço de setor (como contato@) costuma reclamar mais de e-mails.");
    return out;
  }

  /* ---------- montagem do e-mail (item 8.3): sem HTML livre; tudo que vem de pessoa é escapado ---------- */
  const LOGO = "https://ressignificarterapiaseconsultorias.com/img/logo.png";
  const VARS = ["primeiro_nome", "nome", "email", "produto", "link_do_pedido"];
  const M_A = "\uE000", M_F = "\uE001", RE_MARCA = /\uE000(\d)\uE001/g;
  function escHtml(t) {
    return String(t === null || t === undefined ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function primeiroNome(n) {
    const p = String(n || "").trim().split(/\s+/)[0] || "";
    return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : "";
  }
  function urlSegura(u) {
    const v = String(u || "").trim();
    return v.length <= 2000 && /^https?:\/\/[^\s<>"'`\\]+$/i.test(v) ? v : null;
  }
  function valores(d) {
    d = d || {};
    return { primeiro_nome: primeiroNome(d.nome), nome: String(d.nome || "").trim(), email: String(d.email || "").trim(), produto: String(d.produto || "").trim(), link_do_pedido: String(d.link_do_pedido || "").trim() };
  }
  /* troca as variáveis por marcas internas; se o nome faltar, "Olá, {primeiro_nome}!" vira "Olá!" */
  function preparar(modelo, val) {
    let t = String(modelo === null || modelo === undefined ? "" : modelo).replace(/\r/g, "").replace(/[\uE000\uE001]/g, "");
    ["primeiro_nome", "nome"].forEach(function (v) {
      if (val[v]) return;
      const re = new RegExp("\\{" + v + "\\}", "i");
      t = t.split("\n").map(function (linha) {
        if (!re.test(linha)) return linha;
        let l = linha.replace(new RegExp(",[ \\t]*\\{" + v + "\\}", "gi"), "").replace(new RegExp("[ \\t]*\\{" + v + "\\}", "gi"), "");
        l = l.replace(/^[ \t]*[,;:][ \t]*/, "").replace(/[ \t]{2,}/g, " ");
        return l.charAt(0).toUpperCase() + l.slice(1);
      }).join("\n");
    });
    VARS.forEach(function (v, i) { t = t.replace(new RegExp("\\{" + v + "\\}", "gi"), M_A + i + M_F); });
    return t;
  }
  function resolver(t, val) { return String(t).replace(RE_MARCA, function (x, i) { return String(val[VARS[Number(i)]] || ""); }); }
  /* negrito e itálico; os valores das variáveis entram só depois, já escapados (um nome nunca vira formatação) */
  function enfase(bruto, val) {
    let h = escHtml(bruto);
    h = h.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    return h.replace(RE_MARCA, function (x, i) { return escHtml(val[VARS[Number(i)]] || ""); });
  }
  const RE_LINK = /\[([^\]\n]{1,300})\]\(([^)\s]{1,2000})\)/;
  function linhaHtml(bruto, val) {
    let out = "", resto = bruto, m;
    while ((m = RE_LINK.exec(resto))) {
      out += enfase(resto.slice(0, m.index), val);
      const u = urlSegura(resolver(m[2], val));
      out += u ? '<a href="' + escHtml(u) + '" style="color:#0B4A8F;word-break:break-word">' + enfase(m[1], val) + "</a>" : enfase(m[1], val);
      resto = resto.slice(m.index + m[0].length);
    }
    return out + enfase(resto, val);
  }
  function semMarcacao(t) { return String(t).replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2"); }
  function linhaTexto(bruto, val) {
    let out = "", resto = bruto, m;
    while ((m = RE_LINK.exec(resto))) {
      const u = urlSegura(resolver(m[2], val));
      out += semMarcacao(resolver(resto.slice(0, m.index), val)) + semMarcacao(resolver(m[1], val)) + (u ? " (" + u + ")" : "");
      resto = resto.slice(m.index + m[0].length);
    }
    return out + semMarcacao(resolver(resto, val));
  }
  const RE_BOTAO = /^\[\[([^|\]\n]{1,80})\|([^\]\s]{0,2000})\]\]$/, RE_IMG = /^!\[([^\]\n]{0,200})\]\(([^)\s]{1,2000})\)$/;
  /* divide o texto em blocos: parágrafo, botão ([[Texto|link]]) e imagem (![descrição](link)) */
  function blocos(preparado) {
    const out = []; let par = [];
    const fecha = function () { if (par.length) { out.push({ t: "p", linhas: par }); par = []; } };
    String(preparado).split("\n").forEach(function (linha) {
      const l = linha.trim(); let m;
      if (!l) return fecha();
      if ((m = RE_BOTAO.exec(l))) { fecha(); out.push({ t: "botao", rotulo: m[1].trim(), url: m[2] }); }
      else if ((m = RE_IMG.exec(l))) { fecha(); out.push({ t: "img", alt: m[1].trim(), url: m[2] }); }
      else par.push(l);
    });
    fecha();
    return out;
  }
  function rodapeHtml(cfg, tipo) {
    const site = urlSegura(cfg.site_url) || "https://ressignificarterapiaseconsultorias.com";
    const ident = "Ressignificar Terapias &amp; Consultorias" + (cfg.rodape_texto ? "<br>" + escHtml(cfg.rodape_texto).replace(/\n/g, "<br>") : "")
      + '<br><a href="' + escHtml(site) + '" style="color:#4C5670">' + escHtml(site.replace(/^https?:\/\//, "")) + "</a>";
    const fim = tipo === "transacional"
      ? "Você recebeu este e-mail por causa de um pedido, cadastro ou atendimento seu."
      : escHtml(cfg.rodape_motivo || "Você recebeu este e-mail porque se inscreveu para receber nossas novidades.") + ' <a href="' + escHtml(urlSegura(cfg.link_sair) || "#") + '" style="color:#4C5670;text-decoration:underline">Sair desta lista</a>';
    return '<div style="padding:14px 22px;font-size:12px;line-height:1.5;color:#4C5670;border-top:1px solid #E3DCCD">' + ident + "<br><br>" + fim + "</div>";
  }
  function rodapeTexto(cfg, tipo) {
    const site = urlSegura(cfg.site_url) || "https://ressignificarterapiaseconsultorias.com";
    return "Ressignificar Terapias & Consultorias" + (cfg.rodape_texto ? "\n" + cfg.rodape_texto : "") + "\n" + site + "\n\n" + (tipo === "transacional"
      ? "Você recebeu este e-mail por causa de um pedido, cadastro ou atendimento seu."
      : (cfg.rodape_motivo || "Você recebeu este e-mail porque se inscreveu para receber nossas novidades.") + "\nPara sair desta lista: " + (urlSegura(cfg.link_sair) || ""));
  }
  /* monta assunto, HTML e texto puro. conteudo: {assunto, pre_cabecalho, corpo}; dados: {nome, email, produto, link_do_pedido};
     cfg: {tipo, rodape_texto, rodape_motivo, site_url, link_sair} */
  function montar(conteudo, dados, cfg) {
    conteudo = conteudo || {}; cfg = cfg || {};
    const val = valores(dados), tipo = cfg.tipo === "transacional" ? "transacional" : "marketing", avisosMontagem = [];
    const umaLinha = function (t) { return resolver(preparar(t, val), val).replace(/\s+/g, " ").trim(); };
    const assunto = umaLinha(conteudo.assunto).slice(0, 200), pre = umaLinha(conteudo.pre_cabecalho).slice(0, 150);
    const bl = blocos(preparar(conteudo.corpo, val));
    let miolo = "", texto = [];
    bl.forEach(function (b) {
      if (b.t === "p") {
        miolo += '<p style="margin:0 0 16px">' + b.linhas.map(function (l) { return linhaHtml(l, val); }).join("<br>") + "</p>";
        texto.push(b.linhas.map(function (l) { return linhaTexto(l, val); }).join("\n"));
      } else if (b.t === "botao") {
        const u = urlSegura(resolver(b.url, val)), rot = resolver(b.rotulo, val);
        if (!u) { avisosMontagem.push("O botão \"" + rot + "\" ficou de fora porque não tem um link válido."); return; }
        miolo += '<p style="margin:8px 0 22px"><a href="' + escHtml(u) + '" style="display:inline-block;background:#06142A;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">' + escHtml(rot) + "</a></p>";
        texto.push(rot + ": " + u);
      } else {
        const u = urlSegura(resolver(b.url, val)), alt = resolver(b.alt, val);
        if (!u) { avisosMontagem.push("Uma imagem ficou de fora porque o endereço não é válido."); return; }
        miolo += '<p style="margin:0 0 16px"><img src="' + escHtml(u) + '" alt="' + escHtml(alt) + '" style="display:block;max-width:100%;height:auto;border:0;border-radius:8px"></p>';
        texto.push("[imagem" + (alt ? ": " + alt : "") + "]");
      }
    });
    const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escHtml(assunto) + "</title></head>"
      + '<body style="margin:0;padding:0;background:#F4EFE5">'
      + (pre ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">' + escHtml(pre) + "</div>" : "")
      + '<div style="background:#F4EFE5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#16203A">'
      + '<div style="max-width:600px;margin:0 auto;background:#FFFDF8;border-radius:14px;overflow:hidden;border:1px solid #E3DCCD">'
      + '<div style="background:#06142A;padding:14px 22px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>'
      + '<td style="padding-right:12px"><img src="' + LOGO + '" width="42" height="42" alt="Ressignificar" style="display:block;border-radius:50%"></td>'
      + '<td style="color:#ffffff;font-size:18px;font-weight:bold">Ressignificar<br><span style="color:#E3C477;font-weight:normal;font-size:13px">Terapias &amp; Consultorias</span></td>'
      + "</tr></table></div>"
      + '<div style="padding:22px;font-size:15px;line-height:1.6;word-break:break-word">' + miolo + "</div>"
      + rodapeHtml(cfg, tipo) + "</div></div></body></html>";
    return { assunto: assunto, pre_cabecalho: pre, html: html, texto: texto.join("\n\n") + "\n\n--\n" + rodapeTexto(cfg, tipo), avisos: avisosMontagem, tipo: tipo };
  }

  /* ---------- avisos de qualidade (regras fixas, sem IA) ---------- */
  const SPAM = ["gratis", "promocao", "imperdivel", "urgente", "ganhe", "dinheiro", "clique aqui", "garantido", "100%", "oferta", "desconto", "ultima chance", "compre agora", "renda extra", "milagre"];
  const ENCURTADORES = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "encurtador.com.br", "ow.ly", "rebrand.ly", "shorturl.at"];
  function semAcento(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function bytes(t) { let n = 0; const s = String(t || ""); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); n += c < 0x80 ? 1 : c < 0x800 ? 2 : (c >= 0xD800 && c <= 0xDBFF) ? (i++, 4) : 3; } return n; }
  function qualidade(conteudo, tipo) {
    conteudo = conteudo || {};
    const out = [], assunto = String(conteudo.assunto || "").trim(), corpo = String(conteudo.corpo || "").replace(/\r/g, "");
    if (!assunto) out.push("O assunto está vazio.");
    else if (assunto.length > 60) out.push("O assunto tem " + assunto.length + " letras. Acima de 60 costuma ser cortado no celular.");
    const letras = assunto.replace(/[^A-Za-zÀ-ÿ]/g, "");
    if (letras.length >= 6 && letras.replace(/[^A-ZÀ-Þ]/g, "").length / letras.length > 0.7) out.push("O assunto está quase todo em MAIÚSCULAS.");
    if ((assunto.match(/!/g) || []).length > 1 || (corpo.match(/!/g) || []).length > 3) out.push("Há muitos pontos de exclamação.");
    const base = semAcento(assunto + "\n" + corpo), achadas = SPAM.filter(function (p) { return base.indexOf(p) >= 0; });
    let vezes = 0; achadas.forEach(function (p) { vezes += base.split(p).length - 1; });
    if (vezes >= 3) out.push("Várias palavras que costumam levar ao spam: " + achadas.join(", ") + ".");
    if (!corpo.trim()) { out.push("O texto do e-mail está vazio."); return out; }
    const bl = blocos(corpo);
    if (bl.some(function (b) { return b.t === "img" && !b.alt; })) out.push("Há imagem sem descrição (texto alternativo).");
    if (!bl.some(function (b) { return b.t === "p"; })) out.push("O e-mail não tem texto, só botão ou imagem. Inclua pelo menos uma frase.");
    const links = (corpo.match(/https?:\/\/[^\s)\]|]+/gi) || []);
    const enc = ENCURTADORES.filter(function (e) { return links.some(function (l) { return l.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").indexOf(e + "/") === 0; }); });
    if (enc.length) out.push("Há link encurtado (" + enc.join(", ") + "). Use o endereço completo.");
    if (/SEU-LINK/i.test(corpo)) out.push("Há um link de exemplo (SEU-LINK). Troque pelo endereço de verdade.");
    if (/\(Escreva aqui/i.test(corpo)) out.push("Ainda há um texto de exemplo entre parênteses.");
    if (bl.some(function (b) { return b.t === "botao" && !/^\{link_do_pedido\}$/i.test(b.url) && !urlSegura(b.url); })) out.push("Há um botão sem link válido (o link precisa começar com https://).");
    if (bl.some(function (b) { return b.t === "img" && !urlSegura(b.url); })) out.push("Há uma imagem com endereço inválido.");
    if (tipo !== "transacional" && /\{(produto|link_do_pedido)\}/i.test(assunto + corpo)) out.push("As variáveis {produto} e {link_do_pedido} só funcionam em e-mail sobre um pedido (modelo transacional).");
    const pronto = montar(conteudo, { nome: "Maria Exemplo", email: "maria@exemplo.com", produto: "Produto", link_do_pedido: "https://exemplo.com" }, { tipo: tipo, link_sair: "https://exemplo.com/sair" });
    if (bytes(pronto.html) > 100 * 1024) out.push("O e-mail passou de 100 KB e pode ser cortado pelo Gmail.");
    return out;
  }

  /* ---------- campanhas (item 8.4): divisão em dias pelo limite e pelo aquecimento ---------- */
  function tetoDoDia(base, diasJa, limite) { return Math.min(Number(limite) || 0, Math.ceil((Number(base) || 0) * Math.pow(1.5, Math.min(Math.max(0, diasJa | 0), 20)))); }
  /* o: {tipo, limiteDia, usadosHoje, base, diasJa, mktHoje}. Devolve quantos e-mails saem em cada dia, a partir de hoje. */
  function planoDeDias(total, o) {
    o = o || {};
    const limite = Math.max(0, Number(o.limiteDia) || 0), dias = []; let resta = Math.max(0, Math.floor(Number(total) || 0));
    for (let d = 0; d < 400 && resta > 0; d++) {
      let cabe = d === 0 ? Math.max(0, limite - (Number(o.usadosHoje) || 0)) : limite;
      if (o.tipo !== "transacional") cabe = Math.min(cabe, Math.max(0, tetoDoDia(o.base, (o.diasJa | 0) + d, limite) - (d === 0 ? (Number(o.mktHoje) || 0) : 0)));
      if (cabe <= 0 && d > 0) return dias.concat([NaN]);
      const q = Math.min(resta, cabe); dias.push(q); resta -= q;
    }
    return dias;
  }
  function planoTexto(dias) {
    if (!dias.length) return "Ninguém para receber.";
    if (dias.some(function (n) { return n !== n; })) return "O limite configurado não deixa esta campanha andar. Confira a Configuração.";
    const n = dias.length;
    if (n === 1) return "Sai tudo hoje (" + dias[0] + ").";
    return "Leva " + n + " dias: hoje " + dias[0] + ", depois " + dias.slice(1, 6).join(", ") + (n > 6 ? "..." : "") + ".";
  }
  const ST_ENVIO = { pendente: "Na fila", reservado: "Enviando", enviado: "Enviado", entregue: "Entregue", falhou: "Falhou", pulado: "Ficou de fora", bounce: "Voltou", reclamou: "Marcou como spam", cancelado: "Cancelado" };
  function rotuloEnvio(s) { return ST_ENVIO[String(s || "")] || String(s || ""); }
  const ST_CAMP = { rascunho: "Rascunho", agendada: "Agendada", enviando: "Enviando", pausada: "Pausada", concluida: "Concluída", cancelada: "Cancelada" };
  function rotuloCampanha(s) { return ST_CAMP[String(s || "")] || String(s || ""); }
  function rotuloTipo(t) { return t === "transacional" ? "Transacional (sobre um pedido ou cadastro)" : "Marketing (novidades)"; }
  function rotuloPublico(p) {
    p = p || {};
    return p.tipo === "aceitaram" ? "Todos que autorizaram e-mail" : p.tipo === "etiqueta" ? "Etiqueta: " + (p.valor || "") : p.tipo === "etapa" ? "Etapa: " + (p.valor || "") : p.tipo === "abandonados" ? "Pediram e não pagaram" : "Não definido";
  }
  /* planilha para abrir no Excel: separador ; com marca de UTF-8, e proteção contra célula que vira fórmula */
  function csv(colunas, linhas) {
    const cel = function (v) { let s = String(v === null || v === undefined ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return "\uFEFF" + [colunas.map(function (c) { return cel(c[1]); }).join(";")].concat((linhas || []).map(function (l) { return colunas.map(function (c) { return cel(l[c[0]]); }).join(";"); })).join("\r\n");
  }

  raiz.WaEmail = { normalizar: normalizar, valido: valido, sugestao: sugestao, deFuncao: deFuncao, rotuloSituacao: rotuloSituacao, rotuloMotivo: rotuloMotivo, usoTexto: usoTexto, avisos: avisos,
    escHtml: escHtml, primeiroNome: primeiroNome, urlSegura: urlSegura, montar: montar, qualidade: qualidade, tetoDoDia: tetoDoDia, planoDeDias: planoDeDias, planoTexto: planoTexto,
    rotuloEnvio: rotuloEnvio, rotuloCampanha: rotuloCampanha, rotuloTipo: rotuloTipo, rotuloPublico: rotuloPublico, csv: csv, bytes: bytes };
})(typeof window !== "undefined" ? window : globalThis);
