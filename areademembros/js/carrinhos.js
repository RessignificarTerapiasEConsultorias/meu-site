/* Carrinhos e vendas da loja do site (só o master vê).
   Cada compra iniciada vira um pedido (travas_pedidos) com o passo a passo (travas_pedidos_eventos).
   Aqui o master vê o que aconteceu, chama a pessoa no WhatsApp e anota o retorno. */
(async function () {
  const eu = await protegerPagina("master");
  if (!eu) return;

  const SITE = "https://ressignificarterapiaseconsultorias.com";
  const LOJA = SITE + "/teste-de-travas/";
  const MINUTOS_ABANDONO = 30;     // depois disso sem pagar, conta como carrinho abandonado
  const SIT = {
    aguardando: { rot: "Na página de pagamento", cls: "pendente" },
    abandonado: { rot: "Abandonou no pagamento", cls: "off" },
    indisponivel: { rot: "Pagamento estava fora do ar", cls: "off" },
    cancelado: { rot: "Cancelado", cls: "" },
    sem_ativar: { rot: "Pagou e não ativou", cls: "pendente" },
    venda: { rot: "Venda concluída", cls: "ok" }
  };
  const PASSO = {
    dados_preenchidos: "Preencheu os dados e foi para o pagamento",
    voltou_ao_pagamento: "Preencheu de novo e voltou para o pagamento",
    pagamento_indisponivel: "O pagamento estava fora do ar",
    voltou_sem_pagar: "Abriu a página de ativação sem ter pago",
    pagamento_confirmado: "Pagamento confirmado",
    abriu_formulario: "Abriu o formulário para montar o teste",
    erro_ativacao: "Erro ao montar o teste",
    teste_ativado: "Teste ativado",
    produto_ativado: "Produto liberado na Área de Membros"
  };
  const RETORNO = { novo: "Ainda não falei", contatado: "Já chamei", recuperado: "Recuperado (comprou)", perdido: "Perdido" };

  let pedidos = [], eventos = {}, filtro = "contato", busca = "";

  const dataHora = function (iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  const ha = function (iso) {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
    if (m < 60) return "há " + m + " min";
    const h = Math.round(m / 60); if (h < 48) return "há " + h + " h";
    return "há " + Math.round(h / 24) + " dias";
  };
  const zapVisivel = function (d) {
    d = String(d || ""); if (d.length < 12) return d;
    const n = d.slice(2), r = n.slice(2);
    return "(" + n.slice(0, 2) + ") " + (r.length === 9 ? r.slice(0, 5) + "-" + r.slice(5) : r.slice(0, 4) + "-" + r.slice(4));
  };
  const valorDe = function (p) { return (p.valor_pago_centavos != null ? p.valor_pago_centavos : p.valor_centavos) / 100; };
  const forma = function (p, evs) {
    const e = evs.filter(function (x) { return x.tipo === "pagamento_confirmado" && x.detalhe; }).pop();
    if (e) return e.detalhe;
    return p.capture_method === "pix" ? "Pix" : p.capture_method === "credit_card" ? "Cartão" : "";
  };

  function situacao(p) {
    if (p.status === "ativado") return "venda";
    if (p.status === "pago" || p.status === "ativando") return "sem_ativar";
    if (p.status === "cancelado") return p.checkout_url ? "cancelado" : "indisponivel";
    return (Date.now() - new Date(p.criado_em)) / 60000 < MINUTOS_ABANDONO ? "aguardando" : "abandonado";
  }

  async function carregar() {
    const [rp, re] = await Promise.all([
      supa().from("travas_pedidos").select("id,token,produto,nome,email,whatsapp,valor_centavos,valor_pago_centavos,status,checkout_url,capture_method,criado_em,pago_em,ativado_em,contato_status,anotacao,contatado_em,grupo_entrou_em,produto_chave").order("criado_em", { ascending: false }).limit(1000),
      supa().from("travas_pedidos_eventos").select("pedido_id,tipo,detalhe,criado_em").order("criado_em").limit(5000)
    ]);
    if (rp.error) { document.getElementById("lista").innerHTML = '<p class="aviso erro">Não foi possível carregar: ' + esc(rp.error.message) + "</p>"; return; }
    eventos = {};
    (re.data || []).forEach(function (e) { (eventos[e.pedido_id] = eventos[e.pedido_id] || []).push(e); });
    /* quem comprou: e-mail -> data da compra (para não cobrar quem desistiu e depois comprou) */
    const compras = {};
    (rp.data || []).forEach(function (p) { if (p.status === "ativado" || p.status === "pago") { const k = p.email.toLowerCase() + "|" + (p.produto || ""); if (!compras[k] || p.criado_em < compras[k]) compras[k] = p.criado_em; } });
    pedidos = (rp.data || []).map(function (p) {
      const sit = situacao(p);
      const c = compras[p.email.toLowerCase() + "|" + (p.produto || "")];
      p._sit = sit;
      p._comprouDepois = sit !== "venda" && sit !== "sem_ativar" && !!c && c > p.criado_em;
      p._evs = eventos[p.id] || [];
      p._teste = p.valor_centavos < 1000;
      p._contato = (sit === "abandonado" || sit === "indisponivel" || sit === "sem_ativar") && !p._comprouDepois && (p.contato_status === "novo" || p.contato_status === "contatado");
      return p;
    });
    desenharKpis(); desenhar();
  }

  function desenharKpis() {
    const reais = pedidos.filter(function (p) { return !p._teste; });
    const vendas = reais.filter(function (p) { return p._sit === "venda"; });
    const total = vendas.reduce(function (t, p) { return t + valorDe(p); }, 0);
    const abandonos = reais.filter(function (p) { return (p._sit === "abandonado" || p._sit === "indisponivel") && !p._comprouDepois; }).length;
    const semAtivar = reais.filter(function (p) { return p._sit === "sem_ativar"; }).length;
    const pessoas = new Set(reais.map(function (p) { return p.email.toLowerCase(); })).size;
    const compradores = new Set(reais.filter(function (p) { return p._sit === "venda" || p._sit === "sem_ativar"; }).map(function (p) { return p.email.toLowerCase(); })).size;
    const contato = pedidos.filter(function (p) { return p._contato; }).length;
    document.getElementById("nContato").textContent = contato || "";
    document.getElementById("kpis").innerHTML =
      '<div class="kpi"><small>Precisam de contato</small><b>' + contato + '</b><span>abandonos e pagos sem ativar</span></div>' +
      '<div class="kpi"><small>Carrinhos abandonados</small><b>' + abandonos + '</b><span>não pagaram</span></div>' +
      '<div class="kpi"><small>Pagaram e não ativaram</small><b>' + semAtivar + '</b><span>falta montar o teste</span></div>' +
      '<div class="kpi"><small>Vendas concluídas</small><b>' + vendas.length + '</b><span>' + brl(total) + "</span></div>" +
      '<div class="kpi"><small>Conversão</small><b>' + (pessoas ? Math.round(compradores / pessoas * 100) : 0) + '%</b><span>' + compradores + " de " + pessoas + (pessoas === 1 ? " pessoa" : " pessoas") + "</span></div>";
  }

  function resumo(p) {
    const evs = p._evs, v = brl(valorDe(p)), quando = dataHora(p.criado_em);
    const tem = function (t) { return evs.some(function (e) { return e.tipo === t; }); };
    const voltas = evs.filter(function (e) { return e.tipo === "voltou_ao_pagamento"; }).length;
    const erro = evs.filter(function (e) { return e.tipo === "erro_ativacao"; }).pop();
    let t = "";
    switch (p._sit) {
      case "aguardando": t = "Está na página de pagamento agora (começou " + ha(p.criado_em) + "). Espere um pouco antes de chamar."; break;
      case "abandonado":
        t = "Em " + quando + ", preencheu os dados e foi para o pagamento de " + v + ", mas não pagou.";
        if (voltas) t += " Tentou de novo " + voltas + (voltas === 1 ? " vez." : " vezes.");
        if (tem("voltou_sem_pagar")) t += " Depois voltou para a página sem ter pago.";
        break;
      case "indisponivel": t = "Em " + quando + ", tentou comprar, mas o pagamento estava fora do ar (a InfinitePay não gerou o link). A pessoa viu o aviso para chamar no WhatsApp."; break;
      case "cancelado": t = "Pedido de " + quando + " cancelado."; break;
      case "sem_ativar":
        t = "Pagou " + v + (forma(p, evs) ? " (" + forma(p, evs) + ")" : "") + " em " + dataHora(p.pago_em) + (/travas/i.test(p.produto || "") ? ", mas ainda não terminou de montar o teste." : ", mas o acesso ainda não foi liberado. Libere pelo painel ou fale com a pessoa.");
        if (erro) t += " Último erro que apareceu para a pessoa: “" + erro.detalhe + "”.";
        else t += tem("abriu_formulario") ? " Chegou a abrir o formulário." : " Não chegou a abrir o formulário.";
        break;
      case "venda": t = "Comprou em " + dataHora(p.pago_em || p.criado_em) + (forma(p, evs) ? " (" + forma(p, evs) + ")" : "") + (/travas/i.test(p.produto || "") ? " e ativou o teste em " : " e o acesso foi liberado em ") + dataHora(p.ativado_em) + "."; break;
    }
    if ((p._sit === "venda" || p._sit === "sem_ativar") && ["travas", "tracos", "mpcc", "disc"].indexOf(p.produto_chave || "travas") > -1) {
      const lemb = evs.filter(function (e) { return e.tipo === "lembrete_grupo"; }).length;
      t += p.grupo_entrou_em ? " ✅ Entrou no grupo do WhatsApp em " + dataHora(p.grupo_entrou_em) + "." :
        " ⚠️ Ainda não entrou no grupo do WhatsApp" + (lemb ? " (" + lemb + (lemb === 1 ? " lembrete enviado)." : " lembretes enviados).") : "; recebe um lembrete por e-mail todo dia.");
    }
    if (p._comprouDepois) t += " Comprou depois, em outro pedido.";
    if (p._teste) t += " (Pedido do modo teste de R$ 1.)";
    return t;
  }

  function linkDoTeste(p) {
    const e = p._evs.filter(function (x) { return (x.tipo === "teste_ativado" || x.tipo === "produto_ativado") && x.detalhe; }).pop();
    return e ? e.detalhe : "";
  }

  function mensagem(p) {
    const prim = (p.nome || "").split(" ")[0];
    const prod = p.produto || "Teste de Travas Mentais";
    switch (p._sit) {
      case "sem_ativar": return "Oi, " + prim + "! Aqui é o Mauricio, da Ressignificar. Seu pagamento do " + prod + " foi confirmado, obrigado! Falta só montar o seu teste, leva uns 2 minutos: " + SITE + "/teste-de-travas/ativar/?p=" + p.token + " . Se tiver qualquer dificuldade, me chama aqui.";
      case "indisponivel": return "Oi, " + prim + "! Aqui é o Mauricio, da Ressignificar. Você tentou comprar o " + prod + " e o nosso pagamento ficou fora do ar naquele momento, me desculpe! Já está funcionando: " + LOJA + " . Se preferir, te ajudo por aqui.";
      case "venda": return "Oi, " + prim + "! Aqui é o Mauricio, da Ressignificar. Obrigado pela compra do " + prod + "!" + (linkDoTeste(p) ? " O seu teste está no ar: " + linkDoTeste(p) + " ." : "") + " Precisando de ajuda para começar, me chama.";
      default: return "Oi, " + prim + "! Tudo bem? Aqui é o Mauricio, da Ressignificar. Vi que você começou a compra do " + prod + " e não chegou a concluir. Ficou alguma dúvida ou aconteceu algum problema no pagamento? Se quiser concluir: " + LOJA + " . Te ajudo por aqui no que precisar.";
    }
  }

  function passoAPasso(p) {
    if (!p._evs.length) return '<p class="vazio">Sem registros detalhados.</p>';
    return '<ol class="linha-tempo">' + p._evs.map(function (e) {
      return "<li><b>" + esc(PASSO[e.tipo] || e.tipo) + "</b>" + (e.detalhe && e.tipo !== "dados_preenchidos" && e.tipo !== "voltou_sem_pagar" && e.tipo !== "abriu_formulario" ? ': <span class="quebra">' + esc(e.detalhe) + "</span>" : "") + "<small>" + esc(dataHora(e.criado_em)) + "</small></li>";
    }).join("") + "</ol>";
  }

  function cartao(p) {
    const s = SIT[p._sit];
    const zap = p.whatsapp ? "https://wa.me/" + p.whatsapp + "?text=" + encodeURIComponent(mensagem(p)) : "";
    const assunto = encodeURIComponent((p._sit === "venda" ? "Obrigado pela compra" : "Sobre a sua compra") + " · " + (p.produto || "Teste de Travas Mentais"));
    return '<article class="carrinho" data-id="' + p.id + '">' +
      '<div class="carrinho-topo"><div><h3>' + esc(p.nome) + '</h3><span class="vazio" style="padding:0">' + esc(dataHora(p.criado_em)) + " · " + esc(ha(p.criado_em)) + "</span></div>" +
      '<div class="carrinho-selos"><span class="selo ' + s.cls + '">' + s.rot + "</span>" + (p._comprouDepois ? '<span class="selo ok">Comprou depois ✓</span>' : "") + (p._teste ? '<span class="selo">teste R$ 1</span>' : "") + "</div></div>" +
      '<p class="carrinho-prod">' + esc(p.produto || "Teste de Travas Mentais") + " · <b>" + brl(valorDe(p)) + "</b></p>" +
      '<p class="carrinho-resumo"><b>O que aconteceu:</b> ' + esc(resumo(p)) + "</p>" +
      '<p class="carrinho-contato">' + (p.whatsapp ? "WhatsApp " + esc(zapVisivel(p.whatsapp)) + " · " : "") + '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></p>" +
      '<div class="acoes">' +
        (zap ? '<a class="btn auto wa-btn" href="' + esc(zap) + '" target="_blank" rel="noopener" data-chamar="' + p.id + '">Chamar no WhatsApp</a>' : "") +
        '<a class="btn auto contorno" href="mailto:' + esc(p.email) + "?subject=" + assunto + "&body=" + encodeURIComponent(mensagem(p)) + '" data-chamar="' + p.id + '">Enviar e-mail</a>' +
        (p._sit === "venda" && linkDoTeste(p) ? '<a class="btn auto contorno" href="' + esc(linkDoTeste(p)) + '" target="_blank" rel="noopener">Ver o teste</a>' : "") +
      "</div>" +
      '<div class="carrinho-retorno f">' +
        '<label>Retorno<select data-status="' + p.id + '">' + Object.keys(RETORNO).map(function (k) { return '<option value="' + k + '"' + (p.contato_status === k ? " selected" : "") + ">" + RETORNO[k] + "</option>"; }).join("") + "</select></label>" +
        '<label>Anotação<textarea rows="2" data-nota="' + p.id + '" placeholder="Ex.: disse que vai pagar sexta; achou caro; teve problema no Pix">' + esc(p.anotacao || "") + "</textarea></label>" +
        '<div class="acoes" style="margin-top:4px"><button class="btn peq" type="button" data-salvar="' + p.id + '">Salvar retorno</button>' + (p.contatado_em ? '<span class="vazio" style="padding:0">Chamou em ' + esc(dataHora(p.contatado_em)) + "</span>" : "") + "</div>" +
      "</div>" +
      '<button type="button" class="btn peq contorno" data-passos="' + p.id + '" aria-expanded="false">Ver o passo a passo</button>' +
      '<div class="carrinho-passos" id="passos-' + p.id + '" hidden>' + passoAPasso(p) + '<button type="button" class="btn peq contorno" data-recolher="' + p.id + '">Recolher ↑</button></div>' +
    "</article>";
  }

  function desenhar() {
    const q = busca.trim().toLowerCase();
    const lista = pedidos.filter(function (p) {
      if (filtro === "contato" && !p._contato) return false;
      if (filtro === "abandonado" && !(p._sit === "abandonado" || p._sit === "indisponivel" || p._sit === "aguardando")) return false;
      if (filtro === "sem_ativar" && p._sit !== "sem_ativar") return false;
      if (filtro === "venda" && p._sit !== "venda") return false;
      if (q && (p.nome + " " + p.email + " " + (p.whatsapp || "")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    const vazio = { contato: "Ninguém esperando contato agora. 🎉", abandonado: "Nenhum carrinho abandonado.", sem_ativar: "Ninguém pagou sem ativar.", venda: "Nenhuma venda ainda.", todos: "Nenhuma compra iniciada ainda." };
    document.getElementById("lista").innerHTML = lista.length ? lista.map(cartao).join("") : '<p class="vazio">' + (q ? "Nada encontrado para essa busca." : vazio[filtro]) + "</p>";
  }

  async function salvar(id, statusNovo, nota, silencioso) {
    const p = pedidos.find(function (x) { return x.id === id; }); if (!p) return;
    const reg = { contato_status: statusNovo, anotacao: nota != null ? (nota.trim() || null) : p.anotacao };
    if (statusNovo !== "novo" && !p.contatado_em) reg.contatado_em = new Date().toISOString();
    const { error } = await supa().from("travas_pedidos").update(reg).eq("id", id);
    if (error) { aviso("Não foi possível salvar: " + error.message, true); return; }
    Object.assign(p, reg);
    p._contato = (p._sit === "abandonado" || p._sit === "indisponivel" || p._sit === "sem_ativar") && !p._comprouDepois && (p.contato_status === "novo" || p.contato_status === "contatado");
    if (!silencioso) aviso("Retorno salvo.");
    desenharKpis(); desenhar();
  }

  document.getElementById("abas").addEventListener("click", function (e) {
    const b = e.target.closest(".aba"); if (!b) return;
    filtro = b.dataset.filtro;
    this.querySelectorAll(".aba").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
    desenhar();
  });
  document.getElementById("busca").addEventListener("input", function () { busca = this.value; desenhar(); });
  document.getElementById("lista").addEventListener("click", function (e) {
    const t = e.target.closest("[data-salvar],[data-passos],[data-recolher],[data-chamar]"); if (!t) return;
    if (t.dataset.salvar) {
      const id = t.dataset.salvar;
      salvar(id, document.querySelector('[data-status="' + id + '"]').value, document.querySelector('[data-nota="' + id + '"]').value);
    } else if (t.dataset.passos || t.dataset.recolher) {
      const id = t.dataset.passos || t.dataset.recolher, box = document.getElementById("passos-" + id), bt = document.querySelector('[data-passos="' + id + '"]');
      const abrir = box.hidden; box.hidden = !abrir;
      bt.textContent = abrir ? "Recolher o passo a passo" : "Ver o passo a passo"; bt.setAttribute("aria-expanded", String(abrir));
      if (!abrir) bt.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (t.dataset.chamar) {
      /* chamou no WhatsApp ou por e-mail: marca como "Já chamei" sozinho (a lista continua aberta) */
      const p = pedidos.find(function (x) { return x.id === t.dataset.chamar; });
      if (p && p.contato_status === "novo" && p._sit !== "venda") setTimeout(function () { salvar(p.id, "contatado", null, true); aviso("Marcado como “Já chamei”."); }, 400);
    }
  });

  await carregar();
})();
