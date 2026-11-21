/* Visão geral (Fase 10): funções puras, para testar sem a página. Nenhuma conta de negócio é refeita aqui:
   os números vêm prontos do banco (wa_visao_geral). Aqui só se formata, compara com o período anterior e monta gráfico e resumo. */
(function (raiz) {
  "use strict";
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
  function inteiro(v) { return String(Math.round(num(v))).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function brl(v) {
    const n = num(v), neg = n < 0, c = Math.round(Math.abs(n) * 100), r = Math.floor(c / 100), ce = c % 100;
    return (neg ? "-" : "") + "R$ " + String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + (ce < 10 ? "0" : "") + ce;
  }
  function brlCentavos(c) { return brl(num(c) / 100); }
  /* parte de um todo, em %. Sem base (todo zero), devolve travessão: nunca NaN nem infinito */
  function pct(parte, todo, casas) {
    const t = num(todo); if (!(t > 0)) return "—";
    const f = Math.pow(10, casas === undefined ? 1 : casas);
    return String(Math.round(num(parte) / t * 100 * f) / f).replace(".", ",") + "%";
  }
  /* comparação com o período anterior: sobe, desce, igual, novo (antes era zero) ou sem dados */
  function variacao(atual, anterior) {
    const a = num(atual), b = num(anterior);
    if (a === 0 && b === 0) return { tipo: "sem", texto: "—" };
    if (b === 0) return { tipo: "novo", texto: "novo" };
    if (a === b) return { tipo: "igual", texto: "igual" };
    const p = Math.abs((a - b) / b * 100), seta = a > b ? "▲" : "▼";
    return { tipo: a > b ? "sobe" : "desce", texto: seta + " " + (p < 1 ? "menos de 1%" : inteiro(p) + "%") };
  }
  function partes(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || "")); return m ? { a: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null; }
  function dataCurta(iso) { const p = partes(iso); return p ? (p.d < 10 ? "0" : "") + p.d + "/" + (p.m < 10 ? "0" : "") + p.m : ""; }
  function rotuloPeriodo(p) {
    const i = partes(p && p.inicio), f = partes(p && p.fim); if (!i || !f) return "";
    if (i.a === f.a && i.m === f.m && i.d === f.d) return f.d + " de " + MESES[f.m - 1];
    if (i.a === f.a && i.m === f.m) return i.d + " a " + f.d + " de " + MESES[f.m - 1];
    return i.d + " de " + MESES[i.m - 1] + " a " + f.d + " de " + MESES[f.m - 1];
  }
  function rotuloAnterior(p) { const d = num(p && p.dias); return d <= 1 ? "o dia anterior" : "os " + d + " dias anteriores"; }
  function nomeDoMes(iso) { const p = partes(iso); return p ? MESES[p.m - 1] + " de " + p.a : ""; }
  /* horário de Brasília, escrito por extenso */
  function horaBrasilia(iso) {
    const d = new Date(iso); if (isNaN(d.getTime())) return "";
    const t = new Date(d.getTime() - 3 * 3600 * 1000), dd = t.getUTCDate(), mm = t.getUTCMonth() + 1, hh = t.getUTCHours(), mi = t.getUTCMinutes();
    return (dd < 10 ? "0" : "") + dd + "/" + (mm < 10 ? "0" : "") + mm + " às " + (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi;
  }
  /* barras do gráfico: altura de 0 a 100 na mesma escala para enviadas e recebidas; barra com valor nunca some */
  function barras(serie) {
    const s = Array.isArray(serie) ? serie : [];
    const max = s.reduce(function (m, x) { return Math.max(m, num(x.enviadas), num(x.recebidas)); }, 0);
    const alt = function (v) { const n = num(v); return max > 0 && n > 0 ? Math.max(2, Math.round(n / max * 100)) : 0; };
    return s.map(function (x) { return { dia: x.dia, enviadas: num(x.enviadas), recebidas: num(x.recebidas), custo: num(x.custo), hEnv: alt(x.enviadas), hRec: alt(x.recebidas) }; });
  }
  function temMovimento(serie) { return (Array.isArray(serie) ? serie : []).some(function (x) { return num(x.enviadas) > 0 || num(x.recebidas) > 0; }); }
  /* meta de vendas: a aba Vendas guarda em centavos; aqui só se lê */
  function metaCentavos(meta) {
    if (meta === null || meta === undefined) return null;
    if (typeof meta === "number") return meta > 0 ? meta : null;
    const v = num(meta.valor_centavos || meta.meta_centavos || meta.centavos);
    return v > 0 ? v : null;
  }
  /* linhas do resumo (planilha e página de impressão): só contagens, nenhum dado de pessoa */
  function linhasResumo(d) {
    const c = d.conversas || {}, ca = c.anterior || {}, cu = d.custo || {}, r = d.respostas || {}, s = d.saidas || {}, di = d.disparos || {}, v = d.vendas || {}, va = v.anterior || {}, l = d.limite || {}, e = d.email || {}, i = d.inscricoes || {};
    const L = [];
    const linha = function (nome, atual, ant) { L.push({ indicador: nome, valor: atual, anterior: ant === undefined || ant === null ? "" : ant }); };
    linha("Mensagens recebidas", inteiro(c.recebidas), inteiro(ca.recebidas));
    linha("Mensagens enviadas", inteiro(c.enviadas), inteiro(ca.enviadas));
    linha("Pessoas que escreveram", inteiro(c.pessoas_escreveram), inteiro(ca.pessoas_escreveram));
    linha("Pessoas que responderam a um template", inteiro(r.pessoas), inteiro(r.anterior));
    linha("Saídas da lista", inteiro(s.total), inteiro(s.anterior));
    linha("Mensagens que falharam", inteiro(c.falhas), inteiro(ca.falhas));
    linha("Mensagens cobráveis", inteiro(cu.cobraveis), "");
    linha("Custo estimado do WhatsApp", brl(cu.total), brl(cu.anterior));
    linha("Custo estimado: marketing", brl(cu.marketing), "");
    linha("Custo estimado: utilidade", brl(cu.utilidade), "");
    linha("Disparos", inteiro(di.quantos), "");
    linha("Disparos: enviados", inteiro(di.enviados), "");
    linha("Disparos: entregues", pct(di.entregues, di.enviados), "");
    linha("Disparos: lidos", pct(di.lidos, di.enviados), "");
    linha("Disparos: responderam", pct(di.responderam, di.enviados), "");
    linha("Disparos: saíram da lista", pct(di.saidas, di.enviados), "");
    linha("Vendas do mês: receita", brlCentavos(v.receita_centavos), brlCentavos(va.receita_centavos));
    linha("Vendas do mês: pedidos pagos", inteiro(v.pedidos_pagos), inteiro(va.pedidos_pagos));
    linha("Limite de 24 horas: pessoas usadas", inteiro(l.usados) + " de " + inteiro(l.limite), "");
    linha("E-mails enviados no mês", inteiro(e.usados_mes) + " de " + inteiro(e.limite_mes), "");
    linha("Inscrições no período", inteiro(i.inscritos), "");
    linha("Inscrições confirmadas", inteiro(i.confirmados), "");
    return L;
  }
  raiz.WaVisao = { inteiro: inteiro, brl: brl, brlCentavos: brlCentavos, pct: pct, variacao: variacao, dataCurta: dataCurta, rotuloPeriodo: rotuloPeriodo, rotuloAnterior: rotuloAnterior, nomeDoMes: nomeDoMes,
    horaBrasilia: horaBrasilia, barras: barras, temMovimento: temMovimento, metaCentavos: metaCentavos, linhasResumo: linhasResumo };
})(typeof window !== "undefined" ? window : globalThis);
