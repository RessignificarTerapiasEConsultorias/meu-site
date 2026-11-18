/* CRM WhatsApp · Fase 4 (Campanhas): funções puras, sem acesso à página nem ao banco.
   Painel da campanha: porcentagens do funil, motivos de falha e de pulo em português (com dica do que fazer),
   custo estimado, texto do público e exportação em CSV. Exposto em window.WaCamp. */
(function (raiz) {
  "use strict";

  function num(n) { n = Number(n); return isFinite(n) ? n : 0; }
  /* porcentagem de n sobre a base ("88%"); sem base, um traço */
  function pct(n, base) {
    n = num(n); base = num(base);
    if (!base) return "–";
    const p = n / base * 100;
    return (p > 0 && p < 1 ? "<1" : p > 99 && p < 100 ? "99" : String(Math.round(p))) + "%";
  }
  function dinheiro(v) { return "R$ " + num(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function custo(mensagens, preco) { return Math.round(num(mensagens) * num(preco) * 100) / 100; }
  /* código da Meta dentro do texto do erro: "... (código 131049)" */
  function codigoDe(erro) { const m = String(erro || "").match(/c[oó]digo\s+(\d{2,6})/i); return m ? Number(m[1]) : null; }

  /* código da Meta -> [título curto, o que fazer, dá para tentar de novo?] */
  const MOTIVOS = {
    131049: ["A Meta segurou a mensagem (limite de marketing por pessoa)", "Não é falha sua nem do seu número: a pessoa já recebeu muito marketing de empresas. Dá para tentar outro dia.", true],
    130472: ["A pessoa está em um teste da Meta e não recebeu marketing", "Não há o que fazer agora. Dá para tentar outro dia.", true],
    131026: ["Número sem WhatsApp ou que não pode receber", "Confira o número com a pessoa. Reenviar não resolve.", false],
    131050: ["A pessoa bloqueou marketing desta empresa", "Não reenviar.", false],
    131047: ["Fora das 24 h da conversa", "Fora das 24 h só dá para mandar template aprovado.", false],
    131056: ["Muitas mensagens seguidas para o mesmo número", "Espere alguns minutos antes de tentar de novo.", true],
    131048: ["A Meta limitou o envio por suspeita de spam", "Espere algumas horas e envie em quantidade menor.", true],
    130429: ["Envio rápido demais para a Meta", "Espere alguns minutos e tente de novo.", true],
    80007: ["Limite de chamadas à Meta atingido", "Espere alguns minutos e tente de novo.", true],
    131042: ["Pagamento da conta pendente", "Confira a forma de pagamento no Gerenciador do WhatsApp.", false],
    190: ["Token do Meta inválido ou vencido", "Salve um token novo na aba Configuração.", false],
    10: ["Token do Meta sem permissão", "Gere o token com as permissões do WhatsApp e salve na aba Configuração.", false],
    200: ["Token do Meta sem acesso a este número", "Confira o token e o número na aba Configuração.", false],
    131031: ["Conta bloqueada ou restringida pela Meta", "Veja o aviso no Gerenciador do WhatsApp.", false],
    368: ["Conta bloqueada temporariamente pela Meta", "Veja o aviso no Gerenciador do WhatsApp.", false],
    133010: ["Número ainda não registrado na API", "Use \"Registrar número\" na aba Configuração.", false],
    132000: ["Variáveis não batem com o template", "Confira as variáveis da campanha.", false],
    132001: ["Template não existe ou não está aprovado", "Sincronize os templates e escolha um aprovado.", false],
    132005: ["Texto com as variáveis ficou longo demais", "Encurte o conteúdo das variáveis.", false],
    132007: ["O conteúdo violou uma política da Meta", "Revise o texto do template.", false],
    132012: ["Formato de variável ou de mídia errado", "Confira a mídia do cabeçalho e as variáveis.", false],
    131030: ["Número fora da lista de teste", "Com o número de teste da Meta só dá para enviar aos números cadastrados.", false]
  };
  function semCodigo(t) { return String(t || "").replace(/\s*\(c[oó]digo\s+\d+\)\s*$/i, "").trim(); }
  /* motivo de uma falha, a partir do texto gravado no item */
  function motivoFalha(erro) {
    const cod = codigoDe(erro), m = cod != null ? MOTIVOS[cod] : null, txt = semCodigo(erro);
    if (m) return { codigo: cod, titulo: m[0], dica: m[1], recuperavel: m[2] };
    if (/interrompido/i.test(txt)) return { codigo: cod, titulo: "Envio interrompido no meio", dica: "Não dá para saber se chegou. Confira a conversa da pessoa antes de reenviar.", recuperavel: false };
    if (/sem conex[aã]o/i.test(txt)) return { codigo: cod, titulo: "Sem conexão com a Meta na hora do envio", dica: "Foi um problema passageiro. Dá para tentar de novo.", recuperavel: true };
    if (!txt || /n[aã]o registrado/i.test(txt)) return { codigo: cod, titulo: "Motivo não registrado", dica: "", recuperavel: null };
    return { codigo: cod, titulo: txt.slice(0, 140) + (cod != null ? " (código " + cod + ")" : ""), dica: "", recuperavel: null };
  }
  /* motivo de um pulo (a pessoa não recebeu por decisão do CRM, sem custo) */
  function motivoPulado(erro) {
    const t = String(erro || "").trim();
    if (/sa(iu|ir) da lista/i.test(t)) return { titulo: "Saiu da lista", dica: "A pessoa pediu para não receber mais." };
    if (/sem aceite/i.test(t)) return { titulo: "Sem aceite", dica: "A pessoa não autorizou receber mensagens." };
    if (/cancelada/i.test(t)) return { titulo: "Campanha cancelada", dica: "Você cancelou antes de chegar a vez desta pessoa." };
    if (/mesmo template/i.test(t)) return { titulo: "Disparo repetido", dica: "A pessoa tinha recebido este mesmo template há menos de 10 minutos." };
    if (/recebeu marketing/i.test(t)) return { titulo: "Recebeu marketing há pouco", dica: "Você pediu para não enviar a quem recebeu marketing nos últimos dias." };
    return { titulo: t ? t.slice(0, 140) : "Motivo não registrado", dica: "" };
  }
  /* junta os grupos do banco (por texto) pelo título em português, somando as quantidades */
  function agrupar(lista, traduzir) {
    const mapa = {}, ordem = [];
    (lista || []).forEach(function (g) {
      const m = traduzir(g.erro), k = m.titulo;
      if (!mapa[k]) { mapa[k] = { titulo: m.titulo, dica: m.dica || "", n: 0 }; ordem.push(k); }
      mapa[k].n += num(g.n);
    });
    return ordem.map(function (k) { return mapa[k]; }).sort(function (a, b) { return b.n - a.n; });
  }
  function rotuloPublico(filtro) {
    const f = String(filtro || "").trim();
    if (!f) return "Todos que autorizaram receber";
    return /^lista:/i.test(f) ? "Lista: " + f.replace(/^lista:\s*/i, "") : "Etiqueta: " + f;
  }
  /* etapas do funil: total, enviados (% do total) e as demais em % dos enviados */
  function funil(f) {
    f = f || {};
    const total = num(f.total), env = num(f.enviados);
    const larg = function (n) { return total ? Math.max(0, Math.min(100, Math.round(num(n) / total * 100))) : 0; };
    return [
      { chave: "total", rotulo: "Total", n: total, pct: "", largura: total ? 100 : 0 },
      { chave: "enviados", rotulo: "Enviados", n: env, pct: pct(env, total), largura: larg(env) },
      { chave: "entregues", rotulo: "Entregues", n: num(f.entregues), pct: pct(f.entregues, env), largura: larg(f.entregues) },
      { chave: "lidos", rotulo: "Lidos", n: num(f.lidos), pct: pct(f.lidos, env), largura: larg(f.lidos) },
      { chave: "responderam", rotulo: "Responderam", n: num(f.responderam), pct: pct(f.responderam, env), largura: larg(f.responderam) }
    ];
  }
  /* aviso quando a campanha mandou mais mensagens do que pessoas (envio repetido) */
  function alertaRepetidas(m) {
    m = m || {};
    if (num(m.repetidas) <= 0) return "";
    return "Atenção: esta campanha fez " + num(m.tentativas) + " envios para " + num(m.pessoas) + " pessoas, " + num(m.repetidas) + " a mais do que deveria. Algumas pessoas receberam a mesma mensagem mais de uma vez.";
  }
  const SIT = { pendente: ["Pendente", "pendente"], enviado: ["Enviado", ""], entregue: ["Entregue", "ok"], lido: ["Lido", "ok"], falhou: ["Falhou", "off"], pulado: ["Pulado", "pendente"] };

  /* data e hora no horário de Brasília (o banco guarda em UTC) */
  function dataBrasilia(iso) {
    if (!iso) return "";
    const t = new Date(iso).getTime(); if (isNaN(t)) return "";
    const d = new Date(t - 3 * 3600000), z = function (n) { return String(n).padStart(2, "0"); };
    return z(d.getUTCDate()) + "/" + z(d.getUTCMonth() + 1) + "/" + d.getUTCFullYear() + " " + z(d.getUTCHours()) + ":" + z(d.getUTCMinutes());
  }
  /* CSV que abre certo no Excel em português: ponto e vírgula, acentos (marca UTF-8) e sem fórmulas escondidas */
  function celula(v) {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csv(cabecalho, linhas) {
    return "\uFEFF" + [cabecalho].concat(linhas || []).map(function (l) { return l.map(celula).join(";"); }).join("\r\n") + "\r\n";
  }
  const CSV_CABECALHO = ["Nome", "Telefone", "Situação", "Motivo", "Enviado em", "Respondeu", "Resposta", "Respondeu em", "Pediu para sair"];
  function linhaCsv(p, telefoneFormatado) {
    const st = (SIT[p.status] || [p.status || ""])[0];
    const motivo = p.status === "falhou" ? motivoFalha(p.erro).titulo : p.status === "pulado" ? motivoPulado(p.erro).titulo : "";
    return [p.nome || "", telefoneFormatado || "", st, motivo, dataBrasilia(p.enviado_em), p.respondeu ? "Sim" : "Não",
      String(p.resposta || "").replace(/\s+/g, " ").trim(), dataBrasilia(p.resposta_em), p.saiu ? "Sim" : "Não"];
  }
  function nomeArquivo(nome, agoraIso) {
    const base = String(nome || "campanha").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "campanha";
    return "campanha-" + base + "-" + dataBrasilia(agoraIso || new Date().toISOString()).slice(0, 10).split("/").reverse().join("-") + ".csv";
  }

  /* ---------- travas de segurança antes de enviar (item 4.3) ---------- */
  /* previsão pelo limite diário: quantas pessoas saem hoje, quantas ficam para depois e em quantos dias de envio termina */
  function previsao(publico, limiteDiario, livresHoje) {
    publico = Math.max(0, num(publico)); limiteDiario = Math.max(1, num(limiteDiario)); livresHoje = Math.max(0, Math.min(num(livresHoje), limiteDiario));
    if (!publico) return { hoje: 0, depois: 0, dias: 0 };
    const hoje = Math.min(publico, livresHoje), depois = publico - hoje;
    return { hoje: hoje, depois: depois, dias: (hoje ? 1 : 0) + Math.ceil(depois / limiteDiario) };
  }
  function plural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }
  function textoRepetida(rep) {
    rep = rep || {};
    return 'Já existe a campanha "' + (rep.nome || "") + '" igual a esta (mesmo template e mesmo público), de ' + dataBrasilia(rep.criado_em).slice(0, 5) + " às " + dataBrasilia(rep.criado_em).slice(11) +
      (num(rep.enviados) ? ", com " + plural(num(rep.enviados), "envio", "envios") : "") + ".";
  }
  /* as conferências mostradas antes de enviar. a = resposta de wa_disparo_conferir.
     f = { usaNome, midiaTipo, midiaUrl, midiaOk (true, false ou null = ainda não conferido), midiaErro, excluirRecentes, agendado (ISO) }
     nível: ok | aviso | confirma (pede confirmação) | bloqueia */
  function travas(a, f) {
    a = a || {}; f = f || {};
    const L = [], add = function (id, nivel, titulo, detalhe) { L.push({ id: id, nivel: nivel, titulo: titulo, detalhe: detalhe || "" }); };
    const t = a.template, pub = a.publico || {}, rec = a.recentes || {}, lim = a.limite || {}, h = a.horario || {};
    const vao = num(pub.vao_receber), recentes = rec.vale ? num(rec.pessoas) : 0;
    const publicoFinal = Math.max(0, vao - (f.excluirRecentes ? recentes : 0));
    if (!t) add("template", "bloqueia", "Template não encontrado.", "Sincronize os templates e escolha um aprovado.");
    else if (t.removido) add("template", "bloqueia", "Este template não existe mais no Meta.", "Escolha outro ou crie de novo.");
    else if (String(t.status).toUpperCase() !== "APPROVED") add("template", "bloqueia", "O template ainda não está aprovado pelo Meta.", "Só dá para enviar template aprovado.");
    else add("template", "ok", "Template aprovado");
    if (t && num(t.qtd_variaveis) > 0) {
      if ((a.variaveis || {}).ok) add("variaveis", "ok", "Variáveis preenchidas");
      else add("variaveis", "bloqueia", "Preencha todas as variáveis do template.", "");
    }
    if (!vao) add("publico", "bloqueia", "Ninguém deste público autorizou receber mensagens.", "Escolha outra lista ou etiqueta.");
    else add("publico", "ok", plural(vao, "pessoa vai receber", "pessoas vão receber"), (num(pub.sem_aceite) || num(pub.sairam)) ? "Ficam de fora: " + num(pub.sem_aceite) + " sem aceite e " + num(pub.sairam) + " que saíram da lista." : "");
    if (a.repetida) add("repetida", "confirma", "Campanha repetida", textoRepetida(a.repetida) + " Ao iniciar, o CRM vai pedir a sua confirmação.");
    else add("repetida", "ok", "Nenhuma campanha igual nas últimas 24 horas");
    if (rec.vale) {
      if (!recentes) add("recentes", "ok", "Ninguém deste público recebeu marketing nos últimos " + plural(num(rec.dias), "dia", "dias"));
      else if (f.excluirRecentes && publicoFinal === 0) add("recentes", "bloqueia", "Todas as pessoas deste público receberam marketing nos últimos " + plural(num(rec.dias), "dia", "dias") + ".", "Desmarque a opção de não enviar para elas, ou espere.");
      else add("recentes", "aviso", plural(recentes, "pessoa já recebeu", "pessoas já receberam") + " marketing seu nos últimos " + plural(num(rec.dias), "dia", "dias"),
        f.excluirRecentes ? "Elas vão ficar de fora desta campanha. Vão receber: " + publicoFinal + "." : "Se não quiser enviar para elas, marque a opção logo abaixo.");
    }
    const p = previsao(publicoFinal, lim.diario, lim.livres);
    if (publicoFinal) {
      if (p.depois > 0) add("limite", "aviso", "Passa do limite de hoje: leva " + plural(p.dias, "dia", "dias") + " de envio",
        "Limite de " + num(lim.diario) + " pessoas por dia, com " + num(lim.livres) + " livres agora. Hoje " + (p.hoje ? "saem " + p.hoje : "não sai nenhuma") + " e " + p.depois + " ficam para os dias seguintes, sozinhas.");
      else add("limite", "ok", "Cabe no limite de hoje", publicoFinal + " de " + num(lim.livres) + " envios livres agora (limite de " + num(lim.diario) + " pessoas por dia).");
    }
    const faixa = num(h.inicio) + "h às " + num(h.fim) + "h";
    if (f.agendado) {
      const d = dataBrasilia(f.agendado), hora = parseInt(d.slice(11, 13), 10);
      if (hora < num(h.inicio) || hora >= num(h.fim)) add("horario", "aviso", "Agendada para fora do horário de envio", "Marcada para " + d.slice(0, 5) + " às " + d.slice(11) + ". O envio só começa no horário permitido (" + faixa + ").");
      else add("horario", "ok", "Agendada para " + d.slice(0, 5) + " às " + d.slice(11));
    } else if (h.dentro === false) add("horario", "aviso", "Agora está fora do horário de envio", "O envio começa sozinho no próximo horário permitido (" + faixa + ").");
    else add("horario", "ok", "Dentro do horário de envio (" + faixa + ")");
    if (f.midiaTipo) {
      if (!/^https:\/\/\S+$/.test(String(f.midiaUrl || ""))) add("midia", "bloqueia", "Falta o arquivo do cabeçalho.", "Informe o link do arquivo, começando com https://.");
      else if (f.midiaOk === true) add("midia", "ok", "Arquivo do cabeçalho conferido");
      else if (f.midiaOk === false) add("midia", "bloqueia", "Problema no arquivo do cabeçalho.", f.midiaErro || "O link não abre.");
      else add("midia", "aviso", "Arquivo do cabeçalho ainda não conferido", "Ele é conferido ao criar a campanha.");
    }
    if (f.usaNome) {
      if (num(pub.sem_nome) > 0) add("nome", "aviso", plural(num(pub.sem_nome), "pessoa está sem nome", "pessoas estão sem nome"), "Para elas a mensagem sai com um espaço no lugar do nome (por exemplo: \"Oi,  !\").");
      else add("nome", "ok", "Todas as pessoas têm nome");
    }
    if ((a.pagamento || {}).bloqueia) add("pagamento", "bloqueia", "Pagamento pendente na conta do WhatsApp.", "O último envio falhou por isso. Regularize no Gerenciador do WhatsApp e mande um template para o seu número: quando ele sair, o disparo é liberado.");
    else add("pagamento", "ok", "Sem erro de pagamento recente");
    const te = (a.teste || {}).enviado_em;
    if (te) add("teste", "ok", "Você enviou este template para alguém nas últimas 24 horas", "Último envio fora de campanha: " + dataBrasilia(te).slice(0, 5) + " às " + dataBrasilia(te).slice(11) + ".");
    else add("teste", "aviso", "Recomendado: testar antes no seu número", "Abra a sua conversa e use \"Enviar template\" para ver a mensagem no celular antes de disparar.");
    return L;
  }
  function resumoTravas(lista) {
    lista = lista || [];
    return { bloqueia: lista.filter(function (i) { return i.nivel === "bloqueia"; })[0] || null, confirma: lista.filter(function (i) { return i.nivel === "confirma"; })[0] || null,
      avisos: lista.filter(function (i) { return i.nivel === "aviso"; }) };
  }

  raiz.WaCamp = {
    previsao: previsao, travas: travas, resumoTravas: resumoTravas, textoRepetida: textoRepetida,
    pct: pct, dinheiro: dinheiro, custo: custo, codigoDe: codigoDe, motivoFalha: motivoFalha, motivoPulado: motivoPulado, agrupar: agrupar,
    rotuloPublico: rotuloPublico, funil: funil, alertaRepetidas: alertaRepetidas, SIT: SIT, dataBrasilia: dataBrasilia,
    csv: csv, celula: celula, linhaCsv: linhaCsv, CSV_CABECALHO: CSV_CABECALHO, nomeArquivo: nomeArquivo
  };
})(typeof window !== "undefined" ? window : globalThis);
