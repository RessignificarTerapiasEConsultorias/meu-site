/* Painel do produto para a dona dele (ex.: Tatiana no Teste de Traços de Caráter) e para o master.
   Mostra: link de vendas, visitas da página, quem entrou com a conta, tentativas, vendas e repasses. */
(async function () {
  const eu = await protegerPagina(["cliente", "profissional", "suporte", "master"]);
  if (!eu) return;
  const $ = function (id) { return document.getElementById(id); };
  const SITE = "https://ressignificarterapiaseconsultorias.com";
  const chave = (new URLSearchParams(location.search).get("p") || "tracos").replace(/[^a-z_]/g, "");
  const master = eu.papel === "master";
  $("voltar").href = master ? "carrinhos.html" : (PAINEL_DO_PAPEL[eu.papel] || "painel-cliente.html");
  $("voltar").textContent = master ? "← Carrinhos e vendas" : "← Voltar ao painel";

  const r = await supa().rpc("parceiro_resumo", { p_chave: chave });
  const R = r.data || {};
  if (r.error || !R.ok) { $("semAcesso").hidden = false; return; }
  $("area").hidden = false;

  const pct = R.percentual != null ? Number(R.percentual) : null;
  const pctTxt = function (v) { return String(v).replace(".", ",").replace(/,0+$/, "") + "%"; };
  $("titulo").textContent = (master ? "Painel do produto: " : "Seu produto: ") + R.produto;
  $("sub").textContent = master
    ? "Donas do produto: " + (R.parceiros || []).map(function (p) { return p.nome + " (" + pctTxt(p.percentual) + ")"; }).join(", ") + ". Aqui você marca os repasses como pagos."
    : "Você é a dona deste produto e recebe " + pctTxt(pct) + " de cada venda, de forma automática, em 1 a 5 dias úteis.";

  /* link de vendas (com a origem de quem divulga) */
  const origem = master ? "" : (String(eu.nome || "").split(" ")[0].normalize("NFD").replace(/[^A-Za-z]/g, "").toLowerCase() || "parceira");
  const link = SITE + (R.pagina || "/") + (origem ? "?de=" + origem : "");
  $("link").value = link; $("ver").href = link;
  $("zap").href = "https://wa.me/?text=" + encodeURIComponent("Oi! Você já conhece o " + R.produto + "? Ele mostra como a história de cada pessoa moldou o jeito de ser dela, sozinha ou em casal, com uma devolutiva completa pronta para a sua sessão. Você pode ter ele na sua página de teste: " + link);
  $("copiar").addEventListener("click", function () {
    const b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).catch(function () { $("link").select(); document.execCommand("copy"); })
      .then(function () { b.textContent = "Copiado ✓"; setTimeout(function () { b.textContent = "Copiar"; }, 2000); });
  });

  /* pedidos (compras e tentativas) e o passo a passo */
  const rp = await supa().from("travas_pedidos").select("id,nome,email,whatsapp,valor_centavos,valor_pago_centavos,status,checkout_url,capture_method,criado_em,pago_em,ativado_em,contato_status,anotacao").eq("produto_chave", chave).order("criado_em", { ascending: false }).limit(1000);
  const pedidos = rp.data || [];
  const ids = pedidos.map(function (p) { return p.id; });
  const re = ids.length ? await supa().from("travas_pedidos_eventos").select("pedido_id,tipo,detalhe,criado_em").in("pedido_id", ids).order("criado_em") : { data: [] };
  const eventos = {}; (re.data || []).forEach(function (e) { (eventos[e.pedido_id] = eventos[e.pedido_id] || []).push(e); });

  const dataHora = function (iso) { if (!iso) return ""; const d = new Date(iso); return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); };
  const valorDe = function (p) { return (p.valor_pago_centavos != null ? p.valor_pago_centavos : p.valor_centavos) / 100; };
  const zapVisivel = function (d) { d = String(d || ""); if (d.length < 12) return d; const n = d.slice(2), x = n.slice(2); return "(" + n.slice(0, 2) + ") " + (x.length === 9 ? x.slice(0, 5) + "-" + x.slice(5) : x.slice(0, 4) + "-" + x.slice(4)); };
  const SIT = { venda: ["Comprou", "ok"], liberando: ["Pagou, liberando", "pendente"], aguardando: ["Na página de pagamento", "pendente"], abandonado: ["Desistiu no pagamento", "off"], indisponivel: ["Pagamento estava fora do ar", "off"], cancelado: ["Cancelado", ""] };
  const situacao = function (p) {
    if (p.status === "ativado") return "venda";
    if (p.status === "pago" || p.status === "ativando") return "liberando";
    if (p.status === "cancelado") return p.checkout_url ? "cancelado" : "indisponivel";
    return (Date.now() - new Date(p.criado_em)) / 60000 < 30 ? "aguardando" : "abandonado";
  };
  const PASSO = { dados_preenchidos: "Preencheu os dados e foi para o pagamento", voltou_ao_pagamento: "Voltou para o pagamento", pagamento_indisponivel: "O pagamento estava fora do ar",
    voltou_sem_pagar: "Voltou sem ter pago", pagamento_confirmado: "Pagamento confirmado", erro_ativacao: "Erro ao liberar", produto_ativado: "Produto liberado" };

  pedidos.forEach(function (p) { p._sit = situacao(p); });
  const reais = pedidos;
  const vendas = pedidos.filter(function (p) { return p._sit === "venda"; });
  const total = vendas.reduce(function (t, p) { return t + valorDe(p); }, 0);
  const tentaram = new Set(reais.map(function (p) { return String(p.email || "").toLowerCase(); })).size;
  const reps = R.repasses || [];
  const recebido = reps.filter(function (x) { return x.pago_em; }).reduce(function (t, x) { return t + Number(x.valor); }, 0);
  const aReceber = reps.filter(function (x) { return !x.pago_em; }).reduce(function (t, x) { return t + Number(x.valor); }, 0);
  $("kpis").innerHTML =
    '<div class="kpi"><small>Visitaram a página</small><b>' + (R.visitantes || 0) + '</b><span>' + (R.visitas || 0) + ' visitas no total</span></div>' +
    '<div class="kpi"><small>Entraram com a conta</small><b>' + (R.entraram || []).length + '</b><span>terapeutas identificadas</span></div>' +
    '<div class="kpi"><small>Tentaram comprar</small><b>' + tentaram + '</b><span>começaram o pagamento</span></div>' +
    '<div class="kpi"><small>Compraram</small><b>' + vendas.length + '</b><span>' + brl(total) + ' vendidos</span></div>' +
    '<div class="kpi"><small>' + (master ? "Repasses" : "A sua parte") + '</small><b>' + brl(recebido + aReceber) + '</b><span>' + brl(recebido) + " recebidos · " + brl(aReceber) + " a receber</span></div>";
  const ori = R.origens || {};
  $("origens").innerHTML = Object.keys(ori).length ? '<span class="vazio" style="padding:0">De onde vieram as visitas:</span>' + Object.keys(ori).map(function (o) { return '<span class="selo">' + esc(o === "direto" ? "direto" : "link de " + o) + ": " + ori[o] + "</span>"; }).join("") : "";

  /* repasses */
  $("repAjuda").textContent = master ? "Depois de fazer a transferência, toque em “Marcar como pago”: a dona do produto recebe a confirmação por e-mail." : "Cada venda gera o seu repasse automaticamente, pago em 1 a 5 dias úteis.";
  $("repasses").innerHTML = reps.length ? reps.map(function (x) {
    const sit = x.pago_em ? '<span class="pp-repasse-pago">Pago em ' + dataBR(String(x.pago_em).slice(0, 10)) + "</span>"
      : '<span class="pp-repasse-aberto">A receber até ' + dataBR(x.previsto_para) + "</span>" + (master ? ' <button type="button" class="btn peq" data-pagar="' + x.id + '">Marcar como pago</button>' : "");
    return "<tr><td>" + dataBR(String(x.criado_em).slice(0, 10)) + (master && x.parceiro ? "<br><small>" + esc(x.parceiro) + "</small>" : "") + '</td><td class="quebra">' + esc(x.comprador || "") + '</td><td class="n">' + brl(x.valor_venda) + '</td><td class="n"><b>' + brl(x.valor) + "</b><br><small>" + pctTxt(x.percentual) + "</small></td><td>" + sit + "</td></tr>";
  }).join("") : '<tr><td colspan="5" class="vazio">Nenhuma venda ainda. Os repasses aparecem aqui a cada venda.</td></tr>';
  $("repasses").addEventListener("click", async function (e) {
    const b = e.target.closest("[data-pagar]"); if (!b || !master) return;
    if (!confirm("Confirmar que o repasse foi transferido? A dona do produto recebe um e-mail de confirmação.")) return;
    b.disabled = true; b.textContent = "Marcando...";
    const { data: s } = await supa().auth.getSession();
    const resp = await fetch(SUPABASE_URL + "/functions/v1/loja", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (s && s.session ? s.session.access_token : "") }, body: JSON.stringify({ acao: "repasse_pago", repasse_id: b.dataset.pagar }) }).then(function (x) { return x.json(); }).catch(function () { return {}; });
    if (!resp.ok) { b.disabled = false; b.textContent = "Marcar como pago"; aviso(resp.erro || "Não foi possível marcar agora.", true); return; }
    aviso("Repasse marcado como pago. A confirmação foi enviada por e-mail.");
    b.parentElement.innerHTML = '<span class="pp-repasse-pago">Pago em ' + dataBR(hojeISO()) + "</span>";
  });

  /* quem entrou na página com a conta */
  const ent = R.entraram || [];
  $("entraram").innerHTML = ent.length ? ent.map(function (x) {
    const sit = x.comprou ? '<span class="selo ok">Comprou</span>' : x.tentou ? '<span class="selo pendente">Tentou comprar</span>' : '<span class="selo">Só olhou</span>';
    return "<tr><td><b>" + esc(x.nome) + '</b></td><td class="quebra">' + esc(x.email || "") + (x.telefone ? "<br>" + esc(zapVisivel(x.telefone)) : "") + "</td><td>" + x.visitas + "</td><td>" + esc(dataHora(x.ultima)) + '</td><td class="pp-sit">' + sit + "</td></tr>";
  }).join("") : '<tr><td colspan="5" class="vazio">Ninguém entrou com a conta ainda.</td></tr>';

  /* compras e tentativas */
  $("lista").innerHTML = pedidos.length ? pedidos.map(function (p) {
    const s = SIT[p._sit], evs = eventos[p.id] || [];
    const passos = evs.length ? '<ol class="linha-tempo">' + evs.map(function (e) { return "<li><b>" + esc(PASSO[e.tipo] || e.tipo) + "</b><small>" + esc(dataHora(e.criado_em)) + "</small></li>"; }).join("") + "</ol>" : '<p class="vazio">Sem registros detalhados.</p>';
    return '<article class="carrinho"><div class="carrinho-topo"><div><h3>' + esc(p.nome) + '</h3><span class="vazio" style="padding:0">' + esc(dataHora(p.criado_em)) + "</span></div>" +
      '<div class="carrinho-selos"><span class="selo ' + s[1] + '">' + s[0] + "</span></div></div>" +
      '<p class="carrinho-prod">' + esc(R.produto) + " · <b>" + brl(valorDe(p)) + "</b>" + (p._sit === "venda" && pct ? " · sua parte " + brl(valorDe(p) * pct / 100) : "") + "</p>" +
      '<p class="carrinho-contato">' + (p.whatsapp ? "WhatsApp " + esc(zapVisivel(p.whatsapp)) + " · " : "") + esc(p.email || "") + "</p>" +
      (p.contato_status && p.contato_status !== "novo" ? '<p class="vazio" style="padding:0">Retorno do Mauricio: ' + esc({ contatado: "já chamou", recuperado: "recuperado (comprou)", perdido: "perdido" }[p.contato_status] || p.contato_status) + (p.anotacao ? " · " + esc(p.anotacao) : "") + "</p>" : "") +
      "<details><summary>Ver o passo a passo</summary>" + passos + "</details></article>";
  }).join("") : '<p class="vazio">Ninguém começou a compra ainda.</p>';
})();
