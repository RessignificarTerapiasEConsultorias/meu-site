/* Visão geral (Fase 10): a tela que junta os números das outras abas. Só lê.
   Todo número vem pronto do banco (wa_visao_geral e wa_visao_hoje), que por sua vez chamam as mesmas funções das abas de origem.
   Aqui não há nome, telefone nem e-mail de ninguém: só contagens. */
(function waTelaInicio() {
  "use strict";
  const P = window.WaPainel, WV = window.WaVisao;
  if (!WV) return;
  /* o painel só fica pronto depois de conferir o login (vai à internet): se ainda não está, espera o aviso dele */
  if (!P) { document.addEventListener("wa-painel-pronto", waTelaInicio, { once: true }); return; }
  const $ = P.$, esc = P.esc, ler = P.ler, supa = P.supa, aviso = P.aviso, falha = P.falha;
  const st = { periodo: "mes", dados: null, hoje: null, novTpl: 0, em: 0, cache: {} };
  const AVISO_CUSTO = "Isto é uma estimativa feita com os preços da sua Configuração. A Meta pode cobrar diferente (descontos, conversas de atendimento gratuitas, câmbio).";

  function rpc(nome, args) { return ler(supa().rpc(nome, args || {})); }
  function tentar(f, msg) { return function () { Promise.resolve().then(f).catch(function (e) { falha(e, msg || "Não deu certo."); }); }; }
  function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
  function preco(v) { return "R$ " + String(num(v)).replace(".", ","); }
  function card(titulo, valor, sub, extra) {
    return '<div class="vd-card"><small>' + esc(titulo) + "</small><b>" + esc(String(valor)) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + (extra ? '<small class="vg-var">' + esc(extra) + "</small>" : "") + "</div>";
  }
  function comparado(atual, anterior, p) {
    const v = WV.variacao(atual, anterior);
    if (v.tipo === "sem") return "";
    if (v.tipo === "novo") return "novo: não havia nada n" + WV.rotuloAnterior(p);
    return v.texto + " contra " + WV.rotuloAnterior(p);
  }
  function linha(rotulo, valor) { return '<p class="vg-linha"><span>' + esc(rotulo) + "</span><b>" + esc(String(valor)) + "</b></p>"; }
  function botaoIr(aba, rotulo, filtro) { return '<button type="button" class="btn peq contorno" data-vg-ir="' + esc(aba) + '"' + (filtro ? ' data-filtro="' + esc(filtro) + '"' : "") + ">" + esc(rotulo) + "</button>"; }

  /* ir para a aba certa, já com o filtro ligado quando houver */
  function irPara(aba, filtro) {
    const b = document.querySelector('#abas .aba[data-aba="' + aba + '"]'); if (!b) return;
    b.click();
    if (!filtro) return;
    setTimeout(function () {
      const alvo = aba === "conversas" ? document.querySelector('#cvFiltros [data-filtro="' + filtro + '"]') : aba === "inscricoes" ? document.querySelector('#inSub [data-in-sub="' + filtro + '"]') : null;
      if (alvo) alvo.click();
    }, 0);
  }

  /* templates aprovados, reprovados ou removidos desde a última visita à aba Templates (mesma regra daquela aba) */
  async function novidadesDeTemplates() {
    try {
      let visto = ""; try { visto = localStorage.getItem("wa_tpl_visto") || ""; } catch (e) { visto = ""; }
      const t0 = new Date(visto).getTime(); if (!t0) return 0;
      const lista = await ler(supa().from("wa_templates").select("nome,status,resultado_em,removido_no_meta,removido_em"));
      return (lista || []).filter(function (t) { const iso = t.removido_no_meta ? t.removido_em : t.resultado_em; return !!iso && new Date(iso).getTime() > t0; }).length;
    } catch (e) { return 0; }
  }

  async function carregar(forcar) {
    const c = st.cache[st.periodo];
    $("vgErro").hidden = true;
    if (!forcar && c && Date.now() - c.em < 60000) { st.dados = c.dados; st.hoje = c.hoje; st.novTpl = c.novTpl; st.em = c.em; desenhar(); return; }
    $("vgCarregando").hidden = false; $("vgCorpo").hidden = true;
    try {
      const r = await Promise.all([rpc("wa_visao_geral", { p_inicio: null, p_fim: null, p_periodo: st.periodo }), rpc("wa_visao_hoje"), novidadesDeTemplates()]);
      if (!r[0] || !r[0].periodo) throw new Error("resposta vazia");
      st.dados = r[0]; st.hoje = r[1] || { itens: [] }; st.novTpl = r[2]; st.em = Date.now();
      st.cache[st.periodo] = { dados: st.dados, hoje: st.hoje, novTpl: st.novTpl, em: st.em };
      desenhar();
    } catch (e) {
      $("vgCarregando").hidden = true; $("vgCorpo").hidden = true; $("vgErro").hidden = false;
      $("vgErro").textContent = "Não consegui carregar os números agora. Confira a internet e toque em Atualizar.";
    }
  }

  /* ---------- precisa de você ---------- */
  function desenharHoje() {
    const itens = ((st.hoje && st.hoje.itens) || []).slice();
    if (st.novTpl > 0) itens.push({ chave: null, n: st.novTpl, titulo: st.novTpl === 1 ? "template com novidade da Meta" : "templates com novidade da Meta", detalhe: "Foi aprovado, reprovado ou removido desde a sua última visita.", aba: "templates", nivel: "info" });
    const sil = num(st.hoje && st.hoje.silenciados);
    $("vgHoje").innerHTML = (itens.length ? itens.map(function (i) {
      return '<div class="vg-item ' + esc(i.nivel || "info") + '"><div class="vg-item-txt">' + (i.n !== null && i.n !== undefined ? '<b class="vg-n">' + esc(WV.inteiro(i.n)) + "</b> " : "") + "<span>" + esc(i.titulo) + "</span>"
        + (i.detalhe ? "<small>" + esc(i.detalhe) + "</small>" : "") + '</div><div class="acoes" style="margin:0">' + botaoIr(i.aba, "Abrir", i.filtro)
        + (i.chave ? '<button type="button" class="btn peq contorno" data-vg-visto="' + esc(i.chave) + '" title="Some desta lista por 24 horas">Já vi</button>' : "") + "</div></div>";
    }).join("") : '<p class="vg-ok">Tudo em dia. Nada esperando você agora.</p>')
      + (sil ? '<p class="vazio">' + sil + (sil === 1 ? " item marcado" : " itens marcados") + ' como "já vi" volta' + (sil === 1 ? "" : "m") + " a aparecer em até 24 horas, se ainda precisar de você.</p>" : "");
  }

  /* ---------- blocos ---------- */
  function desenhar() {
    const d = st.dados, p = d.periodo, c = d.conversas || {}, ca = c.anterior || {}, cu = d.custo || {}, r = d.respostas || {}, s = d.saidas || {}, di = d.disparos || {}, l = d.limite || {};
    $("vgCarregando").hidden = true; $("vgCorpo").hidden = false;
    $("vgQuando").textContent = WV.rotuloPeriodo(p) + (num(p.dias) > 1 ? " (" + p.dias + " dias)" : "") + ". Comparado com " + WV.rotuloAnterior(p) + ". Atualizado às " + new Date(st.em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ".";
    desenharHoje();

    const semMovimento = !num(c.enviadas) && !num(c.recebidas), v = function (n) { return semMovimento ? "—" : WV.inteiro(n); };
    const base = num(s.com_aceite) + num(s.total);
    $("vgCartoes").innerHTML = card("Mensagens recebidas", v(c.recebidas), semMovimento ? "" : WV.inteiro(c.pessoas_escreveram) + (num(c.pessoas_escreveram) === 1 ? " pessoa escreveu" : " pessoas escreveram"), comparado(c.recebidas, ca.recebidas, p))
      + card("Mensagens enviadas", v(c.enviadas), num(c.falhas) ? WV.inteiro(c.falhas) + (num(c.falhas) === 1 ? " falhou" : " falharam") : "", comparado(c.enviadas, ca.enviadas, p))
      + card("Pessoas que responderam", v(r.pessoas), "em até " + num(r.janela_dias) + " dias depois de um template", comparado(r.pessoas, r.anterior, p))
      + card("Saídas da lista", v(s.total), num(s.total) ? WV.pct(s.total, base) + " de quem tinha autorização" : "", comparado(s.total, s.anterior, p))
      + card("Mensagens cobráveis", v(cu.cobraveis), "templates que a Meta cobra")
      + card("Custo estimado", num(cu.cobraveis) ? WV.brl(cu.total) : "—", "estimado, não é a fatura", comparado(cu.total, cu.anterior, p));
    $("vgVazio").hidden = !semMovimento;

    /* custo */
    const caros = (di.lista || []).filter(function (x) { return num(x.custo) > 0; }).sort(function (a, b) { return num(b.custo) - num(a.custo); }).slice(0, 5);
    $("vgCusto").innerHTML = num(cu.cobraveis) ? '<p class="vg-grande">' + esc(WV.brl(cu.total)) + " <small>estimado</small></p>"
      + linha("Marketing: " + WV.inteiro(cu.marketing_n) + " × " + preco(cu.preco_marketing), WV.brl(cu.marketing))
      + linha("Utilidade: " + WV.inteiro(cu.utilidade_n) + " × " + preco(cu.preco_utilidade), WV.brl(cu.utilidade))
      + (num(cu.sem_categoria_n) ? linha("Sem categoria conhecida: " + WV.inteiro(cu.sem_categoria_n) + " (contadas pelo preço de marketing)", WV.brl(cu.sem_categoria)) : "")
      + (cu.por_resposta !== null && cu.por_resposta !== undefined ? linha("Custo por pessoa que respondeu", WV.brl(cu.por_resposta)) : "")
      + (cu.projecao_mes !== null && cu.projecao_mes !== undefined ? linha("Projeção para o mês inteiro (estimativa, pelo ritmo até hoje)", WV.brl(cu.projecao_mes)) : "")
      + (num(c.templates_sem_cobranca) ? '<p class="vazio">' + WV.inteiro(c.templates_sem_cobranca) + " template(s) saíram sem cobrança e ficaram fora desta conta.</p>" : "")
      + (caros.length ? '<p class="vg-sub">Disparos que mais custaram</p>' + caros.map(function (x) { return linha(x.nome, WV.brl(x.custo)); }).join("") : "")
      + '<p class="vazio">' + esc(AVISO_CUSTO) + ' <a href="https://business.facebook.com/billing_hub/" target="_blank" rel="noopener">Conferir no Gerenciador da Meta</a>. Testes e mensagens que falharam não entram.</p>'
      : '<p class="vazio">Nenhuma mensagem cobrável neste período.</p>';

    /* limite das últimas 24 horas e saídas */
    const pl = num(l.limite) > 0 ? Math.min(100, Math.round(num(l.usados) / num(l.limite) * 100)) : 0;
    $("vgLimite").innerHTML = '<div class="vg-barra' + (pl >= num(l.alerta_pct) ? " cheia" : "") + '" role="img" aria-label="' + pl + '% do limite usado"><i style="width:' + pl + '%"></i></div>'
      + "<p><b>" + esc(WV.inteiro(l.usados)) + " de " + esc(WV.inteiro(l.limite)) + "</b> pessoas nas últimas 24 horas (" + pl + "%).</p>"
      + '<p class="vazio">' + (num(l.usados) >= num(l.limite) && num(l.limite) > 0 ? "Limite atingido. O primeiro lugar libera em " + esc(WV.horaBrasilia(l.libera_em)) + "."
        : num(l.usados) > 0 && l.libera_em ? "O primeiro lugar volta a ficar livre em " + esc(WV.horaBrasilia(l.libera_em)) + "." : "Ninguém recebeu template nas últimas 24 horas.") + "</p>";
    $("vgSaidas").innerHTML = num(s.total) ? linha("Depois de um disparo", WV.inteiro(s.depois_de_disparo)) + linha("Depois de outro template (automação ou avulso)", WV.inteiro(s.depois_de_outro_template)) + linha("Sem ter recebido template antes", WV.inteiro(s.espontaneas))
      : '<p class="vazio">Ninguém saiu da lista neste período.</p>';

    /* alertas de saúde */
    const al = d.alertas || [];
    $("vgAlertas").hidden = !al.length;
    $("vgAlertas").innerHTML = al.map(function (a) { return '<div class="vg-item ' + esc(a.nivel || "atencao") + '"><div class="vg-item-txt"><span>' + esc(a.titulo) + "</span><small>" + esc(a.fazer || "") + '</small></div><div class="acoes" style="margin:0">' + botaoIr(a.aba, "Abrir") + "</div></div>"; }).join("");

    /* disparos */
    const tent = num(di.enviados) + num(di.falhas);
    $("vgDisparosResumo").innerHTML = num(di.quantos) ? card("Disparos", WV.inteiro(di.quantos), WV.inteiro(di.enviados) + " mensagens enviadas") + card("Entregues", WV.pct(di.entregues, di.enviados), WV.inteiro(di.entregues) + " mensagens")
      + card("Lidos", WV.pct(di.lidos, di.enviados), WV.inteiro(di.lidos) + " mensagens") + card("Responderam", WV.pct(di.responderam, di.enviados), WV.inteiro(di.responderam) + " pessoas")
      + card("Saíram da lista", WV.pct(di.saidas, di.enviados), WV.inteiro(di.saidas) + " pessoas") + card("Falhas", WV.pct(di.falhas, tent), WV.inteiro(di.falhas) + " mensagens")
      : "";
    $("vgDisparosVazio").hidden = !!num(di.quantos); $("vgDisparosTabela").hidden = !num(di.quantos);
    $("vgDisparos").innerHTML = (di.lista || []).map(function (x) {
      return "<tr><td><b>" + esc(x.nome) + "</b><br><small>" + esc(WV.horaBrasilia(x.primeira)) + "</small></td><td>" + WV.inteiro(x.enviados) + "</td><td>" + esc(WV.pct(x.entregues, x.enviados)) + "</td><td>" + esc(WV.pct(x.lidos, x.enviados)) + "</td><td>"
        + esc(WV.pct(x.responderam, x.enviados)) + "</td><td>" + esc(WV.pct(x.saidas, x.enviados)) + "</td><td>" + WV.inteiro(x.falhas) + "</td><td>" + esc(WV.brl(x.custo)) + "</td></tr>";
    }).join("");
    $("vgMotivos").innerHTML = (di.motivos || []).length ? '<p class="vg-sub">Motivos de falha mais comuns</p>' + di.motivos.map(function (m) { return '<p class="vg-linha"><span>' + esc(m.erro || "Motivo não informado") + "</span><b>" + WV.inteiro(m.n) + "</b></p>"; }).join("") : "";

    desenharOutros(d); desenharGrafico(d);
    $("vgNota").value = (d.nota && d.nota.texto) || ""; $("vgNotaMes").textContent = WV.nomeDoMes(d.nota && d.nota.mes);
    const cf = d.config || {};
    $("vgASaida").value = String(num(cf.alerta_saida_pct)).replace(".", ","); $("vgABloqueio").value = String(num(cf.alerta_bloqueio_pct)).replace(".", ","); $("vgAFalha").value = String(num(cf.alerta_falha_pct)).replace(".", ",");
    $("vgALimite").value = num(cf.alerta_limite_pct); $("vgAJanela").value = num(cf.janela_resposta_dias);
  }

  function desenharOutros(d) {
    const v = d.vendas || {}, va = v.anterior || {}, f = d.funil || {}, ft = f.totais || {}, a = d.automacoes || {}, e = d.email || {}, i = d.inscricoes || {};
    const meta = WV.metaCentavos(v.meta), vr = WV.variacao(v.receita_centavos, va.receita_centavos);
    $("vgVendas").innerHTML = (num(v.pedidos_pagos) ? '<p class="vg-grande">' + esc(WV.brlCentavos(v.receita_centavos)) + "</p>" + linha("Pedidos pagos", WV.inteiro(v.pedidos_pagos)) + linha("Valor médio por pedido", WV.brlCentavos(v.ticket_centavos))
        + linha("Contra o mês anterior", vr.tipo === "novo" ? "novo" : vr.texto) + (meta ? linha("Meta do mês", WV.pct(v.receita_centavos, meta, 0) + " de " + WV.brlCentavos(meta)) : '<p class="vazio">Este mês ainda não tem meta.</p>')
      : '<p class="vazio">Nenhuma venda paga em ' + esc(WV.nomeDoMes(v.mes)) + " ainda.</p>")
      + (num(v.abandonos) ? linha("Começaram e não pagaram", WV.inteiro(v.abandonos)) : "") + '<div class="acoes">' + botaoIr("vendas", "Abrir Vendas") + "</div>";
    $("vgFunil").innerHTML = (num(ft.cartoes) ? linha("Pessoas no funil" + (f.quadro ? " (" + f.quadro + ")" : ""), WV.inteiro(ft.cartoes)) + linha("Precisam de você", WV.inteiro(ft.precisa_de_mim)) + linha("Parados", WV.inteiro(ft.parados)) + linha("Com prazo vencido", WV.inteiro(ft.prazo_vencido))
        + '<p class="vg-sub">Por coluna</p>' + (f.colunas || []).map(function (c) { return linha(c.nome, WV.inteiro(c.total)); }).join("")
      : '<p class="vazio">Ninguém no funil ainda.</p>') + '<div class="acoes">' + botaoIr("funil", "Abrir Funil") + "</div>";
    $("vgAuto").innerHTML = (a.pausadas ? '<p class="aviso">Todas as automações estão pausadas (botão de emergência).</p>' : "")
      + linha("Automações ligadas", WV.inteiro(a.ativas)) + linha("Pessoas dentro agora", WV.inteiro(a.dentro)) + linha("Já entraram", WV.inteiro(a.entraram)) + linha("Mensagens enviadas", WV.inteiro(a.enviados)) + linha("Responderam", WV.inteiro(a.responderam))
      + linha("Paradas", WV.inteiro(a.paradas)) + ((a.motivos_parada || []).length ? '<p class="vazio">Motivo mais comum de parada: ' + esc(a.motivos_parada[0].motivo) + ".</p>" : "") + '<div class="acoes">' + botaoIr("automacoes", "Abrir Automações") + "</div>";
    $("vgEmail").innerHTML = linha("E-mails hoje", WV.inteiro(e.usados_hoje) + " de " + WV.inteiro(e.teto_hoje)) + linha("E-mails no mês", WV.inteiro(e.usados_mes) + " de " + WV.inteiro(e.limite_mes) + " (" + WV.pct(e.usados_mes, e.limite_mes, 0) + ")")
      + linha("Saíram do e-mail", WV.inteiro(e.saidas)) + linha("Endereços com erro", WV.inteiro(e.invalidos)) + (num(e.pendencias) ? '<p class="vazio">' + num(e.pendencias) + " pendência(s) de configuração na aba E-mail.</p>" : "")
      + '<p class="vg-sub">Inscrições no período</p>' + (num(i.inscritos) ? linha("Inscritos", WV.inteiro(i.inscritos)) + linha("Confirmaram", WV.inteiro(i.confirmados) + " (" + WV.pct(i.confirmados, i.inscritos, 0) + ")") + linha("Aguardando confirmar", WV.inteiro(i.aguardando))
        : '<p class="vazio">Nenhuma inscrição neste período.</p>')
      + '<div class="acoes">' + botaoIr("email", "Abrir E-mail") + botaoIr("inscricoes", "Abrir Inscrições") + "</div>";
  }

  /* gráfico por dia: barras cheias (enviadas) e listradas (recebidas), para não depender só da cor. A tabela ao lado traz os mesmos números. */
  function desenharGrafico(d) {
    const serie = d.serie || [], bs = WV.barras(serie), tem = WV.temMovimento(serie);
    $("vgGraficoVazio").hidden = tem; $("vgGraficoCaixa").hidden = !tem;
    const longo = bs.length > 62;
    $("vgGrafico").hidden = longo; $("vgGraficoLongo").hidden = !longo || !tem;
    $("vgGrafico").setAttribute("aria-label", "Mensagens por dia de " + WV.rotuloPeriodo(d.periodo) + ". Os mesmos números estão na tabela abaixo.");
    $("vgGrafico").innerHTML = longo ? "" : bs.map(function (b) {
      const t = WV.dataCurta(b.dia) + ": " + WV.inteiro(b.enviadas) + " enviadas, " + WV.inteiro(b.recebidas) + " recebidas, " + WV.brl(b.custo) + " estimado";
      return '<div class="vg-dia" title="' + esc(t) + '"><i class="vg-b env" style="height:' + b.hEnv + '%"></i><i class="vg-b rec" style="height:' + b.hRec + '%"></i></div>';
    }).join("");
    $("vgEixo").textContent = bs.length ? WV.dataCurta(bs[0].dia) + (bs.length > 1 ? " até " + WV.dataCurta(bs[bs.length - 1].dia) : "") : "";
    $("vgSerie").innerHTML = bs.slice().reverse().map(function (b) { return "<tr><td>" + esc(WV.dataCurta(b.dia)) + "</td><td>" + WV.inteiro(b.enviadas) + "</td><td>" + WV.inteiro(b.recebidas) + "</td><td>" + esc(WV.brl(b.custo)) + "</td></tr>"; }).join("");
  }

  /* ---------- ações ---------- */
  $("vgPeriodo").addEventListener("change", function () { st.periodo = this.value; carregar(false); });
  $("vgAtualizar").addEventListener("click", function () { carregar(true); });
  document.querySelector('[data-painel="visao"]').addEventListener("click", function (ev) {
    const ir = ev.target.closest("[data-vg-ir]"); if (ir) return irPara(ir.dataset.vgIr, ir.dataset.filtro || "");
    const visto = ev.target.closest("[data-vg-visto]");
    if (visto) tentar(async function () {
      const r = await rpc("wa_visao_silenciar", { p_chave: visto.dataset.vgVisto, p_horas: 24 });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui marcar.", true);
      st.hoje = await rpc("wa_visao_hoje"); if (st.cache[st.periodo]) st.cache[st.periodo].hoje = st.hoje;
      desenharHoje(); aviso("Marcado como visto. Volta a aparecer em 24 horas, se ainda precisar de você.");
    }, "Não consegui marcar como visto.")();
  });

  /* planilha do resumo: só contagens e nomes de campanhas */
  $("vgExportar").addEventListener("click", function () {
    const d = st.dados; if (!d) return;
    const resumo = [{ indicador: "Período", valor: WV.rotuloPeriodo(d.periodo), anterior: WV.rotuloAnterior(d.periodo) }].concat(WV.linhasResumo(d));
    const disparos = (d.disparos.lista || []).map(function (x) { return { nome: x.nome, enviados: WV.inteiro(x.enviados), entregues: WV.pct(x.entregues, x.enviados), lidos: WV.pct(x.lidos, x.enviados), responderam: WV.pct(x.responderam, x.enviados), saidas: WV.pct(x.saidas, x.enviados), falhas: WV.inteiro(x.falhas), custo: WV.brl(x.custo) }; });
    const csv = window.WaEmail.csv;
    const texto = csv([["indicador", "Indicador"], ["valor", "No período"], ["anterior", "Período anterior"]], resumo)
      + "\r\n" + csv([["nome", "Disparo"], ["enviados", "Enviados"], ["entregues", "Entregues"], ["lidos", "Lidos"], ["responderam", "Responderam"], ["saidas", "Saíram da lista"], ["falhas", "Falhas"], ["custo", "Custo estimado"]], disparos).replace(/^\ufeff/, "");
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
    a.href = url; a.download = "visao-geral-" + d.periodo.inicio + "-a-" + d.periodo.fim + ".csv"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* resumo para imprimir ou salvar em PDF: página limpa, sem nenhum dado de pessoa */
  function montarImpressao() {
    const d = st.dados; let cx = $("vgImpressao");
    if (!cx) { cx = document.createElement("div"); cx.id = "vgImpressao"; cx.hidden = true; document.body.appendChild(cx); }
    cx.innerHTML = "<h1>Resumo do CRM · " + esc(WV.rotuloPeriodo(d.periodo)) + "</h1><p>Ressignificar Terapias &amp; Consultorias. Gerado em " + esc(new Date().toLocaleDateString("pt-BR")) + ". Comparado com " + esc(WV.rotuloAnterior(d.periodo)) + ".</p>"
      + "<table><thead><tr><th>Indicador</th><th>No período</th><th>Período anterior</th></tr></thead><tbody>" + WV.linhasResumo(d).map(function (x) { return "<tr><td>" + esc(x.indicador) + "</td><td>" + esc(x.valor) + "</td><td>" + esc(x.anterior) + "</td></tr>"; }).join("") + "</tbody></table>"
      + "<p><small>" + esc(AVISO_CUSTO) + " Testes e mensagens que falharam não entram.</small></p>"
      + "<h2>Anotações de " + esc(WV.nomeDoMes(d.nota && d.nota.mes)) + "</h2><p class=\"vg-imp-nota\">" + esc($("vgNota").value.trim() || "Sem anotações.") + "</p>";
    return cx;
  }
  $("vgRelatorio").addEventListener("click", function () {
    if (!st.dados) return;
    montarImpressao();
    document.body.classList.add("vg-imprimindo");
    const fim = function () { document.body.classList.remove("vg-imprimindo"); window.removeEventListener("afterprint", fim); };
    window.addEventListener("afterprint", fim);
    window.print();
    setTimeout(fim, 60000);
  });

  $("vgNotaSalvar").addEventListener("click", tentar(async function () {
    const d = st.dados; if (!d) return;
    const r = await rpc("wa_visao_nota_salvar", { p_mes: d.nota.mes, p_texto: $("vgNota").value });
    if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui salvar a anotação.", true);
    d.nota.texto = $("vgNota").value.trim(); aviso("Anotação de " + WV.nomeDoMes(d.nota.mes) + " salva.");
  }, "Não consegui salvar a anotação."));

  $("vgASalvar").addEventListener("click", tentar(async function () {
    const r = await rpc("wa_visao_config_salvar", { p: { alerta_saida_pct: $("vgASaida").value, alerta_bloqueio_pct: $("vgABloqueio").value, alerta_falha_pct: $("vgAFalha").value, alerta_limite_pct: $("vgALimite").value, janela_resposta_dias: $("vgAJanela").value } });
    if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui salvar os limites.", true);
    st.cache = {}; aviso("Limites salvos."); await carregar(true);
  }, "Não consegui salvar os limites."));

  /* abrir o CRM nesta aba (preferência deste aparelho) */
  const padraoInicial = window.matchMedia("(max-width:760px)").matches ? "conversas" : "visao";   // celular abre nas conversas; computador, na tela Hoje
  function lerInicial() { try { return localStorage.getItem("wa_aba_inicial") || padraoInicial; } catch (e) { return padraoInicial; } }
  $("vgInicial").checked = lerInicial() !== "conversas";
  $("vgInicial").addEventListener("change", function () {
    try { localStorage.setItem("wa_aba_inicial", this.checked ? "visao" : "conversas"); } catch (e) { /* aparelho sem armazenamento: fica o padrão */ }
    aviso(this.checked ? "O CRM vai abrir na Visão geral neste aparelho." : "O CRM vai abrir em Conversas neste aparelho.");
  });

  window.WaVisaoTela = { abrir: function () { return carregar(false); } };
})();
