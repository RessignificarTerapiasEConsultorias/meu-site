/* Gestão de produtos e ofertas: interesses (contatos quentes), catálogo e produtos por cliente. */
(async function () {
  const eu = await protegerPagina(["master", "suporte"]);
  if (!eu) return;
  const master = eu.papel === "master";
  document.getElementById("voltar").href = PAINEL_DO_PAPEL[eu.papel];
  if (!master) document.querySelectorAll(".so-master").forEach(function (el) { el.remove(); });

  const STATUS = { novo: "Novo", em_conversa: "Em conversa", fechado: "Fechado", perdido: "Perdido" };
  let produtos = [], perfis = [], vinculos = [], interesses = [], filtro = "abertos", editId = null;
  const pessoa = function (id) { return perfis.find(function (p) { return p.id === id; }) || { nome: "?", id: id }; };
  const produto = function (id) { return produtos.find(function (p) { return p.id === id; }) || { nome: "Produto removido" }; };
  const SITE = "https://ressignificarterapiaseconsultorias.com";
  /* o link que vai para o cliente: a página de vendas (se houver) ou o link de pagamento */
  const linkVenda = function (p) {
    const pg = String(p.pagina || "").trim();
    if (pg) return /^https?:\/\//i.test(pg) ? pg : SITE + (pg.charAt(0) === "/" ? "" : "/") + pg;
    return p.link_pagamento || "";
  };

  async function carregar() {
    const [rp, rf, rv, ri] = await Promise.all([
      supa().from("catalogo_produtos").select("*").order("ordem").order("nome"),
      supa().from("perfis").select("id,nome,email,papel,telefone,ativo").order("nome"),
      supa().from("cliente_produtos").select("perfil_id,produto_id,situacao,desde,preco_centavos,oferta_token"),
      supa().from("interesses").select("id,perfil_id,produto_id,mensagem,status,criado_em").order("criado_em", { ascending: false })
    ]);
    produtos = rp.data || []; perfis = rf.data || []; vinculos = rv.data || []; interesses = ri.data || [];
  }

  /* ================= INTERESSES ================= */
  function desenharInteresses() {
    document.querySelectorAll("#filtroInt [data-f]").forEach(function (b) { b.style.borderColor = b.dataset.f === filtro ? "#C9A24A" : ""; b.style.background = b.dataset.f === filtro ? "#FBF3DF" : ""; });
    const novos = interesses.filter(function (i) { return i.status === "novo"; }).length;
    const cn = document.getElementById("contaNovos");
    cn.hidden = !novos; cn.textContent = novos;
    const lista = interesses.filter(function (i) {
      return filtro === "todos" || (filtro === "abertos" ? (i.status === "novo" || i.status === "em_conversa") : i.status === filtro);
    });
    document.getElementById("listaInt").innerHTML = lista.length ? lista.map(function (i) {
      const p = pessoa(i.perfil_id), pr = produto(i.produto_id);
      const msg = "Olá, " + p.nome.split(" ")[0] + "! Vi que você se interessou por " + pr.nome + ". Quer conversar sobre isso?";
      const wa = p.telefone ? '<a class="btn peq" style="background:#1FA855;color:#fff" target="_blank" rel="noopener" href="https://wa.me/' + p.telefone + "?text=" + encodeURIComponent(msg) + '">Chamar no WhatsApp</a>' : '<span class="acao-info">sem WhatsApp no cadastro · ' + esc(p.email || "") + "</span>";
      return '<li class="acao' + (i.status === "novo" ? " atrasada" : "") + '"><div class="acao-linha"><b>' + esc(p.nome) + " · " + esc(pr.nome) + "</b>" +
        '<select data-status="' + i.id + '" aria-label="Situação">' + Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (i.status === k ? " selected" : "") + ">" + STATUS[k] + "</option>"; }).join("") + "</select></div>" +
        (i.mensagem ? '<div style="font-size:14.5px">“' + esc(i.mensagem) + "”</div>" : "") +
        '<div class="acao-info">Em ' + dataBR(i.criado_em) + "</div><div>" + wa + "</div></li>";
    }).join("") : '<li class="vazio">Nenhum interesse nesta lista.</li>';
  }
  document.getElementById("filtroInt").addEventListener("click", function (e) { const b = e.target.closest("[data-f]"); if (b) { filtro = b.dataset.f; desenharInteresses(); } });
  document.getElementById("listaInt").addEventListener("change", async function (e) {
    const s = e.target.closest("[data-status]"); if (!s) return;
    const { error } = await supa().from("interesses").update({ status: s.value, atualizado_em: new Date().toISOString() }).eq("id", s.dataset.status);
    if (error) { aviso("Não foi possível atualizar.", true); return; }
    const i = interesses.find(function (x) { return x.id === s.dataset.status; });
    if (s.value === "fechado" && i && master && confirm("Marcar " + produto(i.produto_id).nome + " como produto adquirido por " + pessoa(i.perfil_id).nome + "?")) {
      await supa().from("cliente_produtos").upsert({ perfil_id: i.perfil_id, produto_id: i.produto_id, situacao: "adquirido", desde: hojeISO() }, { onConflict: "perfil_id,produto_id" });
    }
    aviso("Situação atualizada.");
    await carregar(); desenharTudo();
  });

  /* ================= CATÁLOGO ================= */
  const fP = document.getElementById("formProd");
  function limparProd() {
    editId = null; fP.reset(); document.getElementById("pAtivo").checked = true; document.getElementById("pOrdem").value = 0;
    document.getElementById("tituloProd").textContent = "Novo produto"; document.getElementById("pSalvar").textContent = "Salvar produto"; document.getElementById("pCancelar").hidden = true;
  }
  if (fP) {
    document.getElementById("pCancelar").addEventListener("click", limparProd);
    fP.addEventListener("submit", async function (e) {
      e.preventDefault();
      const nome = document.getElementById("pNome").value.trim();
      const link = document.getElementById("pLink").value.trim();
      if (nome.length < 2) { aviso("Escreva o nome do produto.", true); return; }
      if (link && !/^https:\/\//i.test(link)) { aviso("O link de pagamento precisa começar com https://", true); return; }
      const pag = document.getElementById("pPagina").value.trim();
      if (pag && !/^(https:\/\/|\/)/i.test(pag)) { aviso("A página de vendas precisa começar com https:// ou com /", true); return; }
      const reg = { nome: nome, servico: document.getElementById("pServ").value || null, preco_texto: document.getElementById("pPreco").value.trim() || null,
        chamada: document.getElementById("pChamada").value.trim() || null, pagina: document.getElementById("pPagina").value.trim() || null, descricao: document.getElementById("pDesc").value.trim() || null, inclui: document.getElementById("pInclui").value.trim() || null, link_pagamento: link || null,
        publico: document.getElementById("pPub").value, ordem: parseInt(document.getElementById("pOrdem").value, 10) || 0,
        destaque: document.getElementById("pDestaque").checked, ativo: document.getElementById("pAtivo").checked };
      const r = editId ? await supa().from("catalogo_produtos").update(reg).eq("id", editId) : await supa().from("catalogo_produtos").insert(reg);
      if (r.error) { aviso("Não foi possível salvar o produto.", true); return; }
      aviso(editId ? "Produto atualizado." : "Produto criado.");
      limparProd();
      await carregar(); desenharTudo();
    });
  }
  /* preço especial por cliente: cada um tem o seu link pessoal, que já abre a página com o valor dele */
  function linkEspecial(p, v) { const base = linkVenda(p); return base + (base.indexOf("?") > -1 ? "&" : "?") + "oferta=" + v.oferta_token; }
  function condicoesEspeciais(p) {
    const lista = vinculos.filter(function (v) { return v.produto_id === p.id && v.preco_centavos && v.situacao !== "adquirido"; });
    if (!lista.length || !linkVenda(p)) return "";
    return '<div class="link-venda"><span class="rotulo">Condição especial · link pessoal</span>' + lista.map(function (v) {
      const pe = pessoa(v.perfil_id), url = linkEspecial(p, v), prim = String(pe.nome || "").split(" ")[0];
      const msg = "Olá, " + prim + "! Separei uma condição especial para você no " + p.nome + ": " + brl(v.preco_centavos / 100) + (/ano/i.test(p.preco_texto || "") ? " por ano" : /m[eê]s/i.test(p.preco_texto || "") ? " por mês" : "") + ".\n\nVeja como funciona e garanta o seu acesso por este link (é só seu):\n" + url + "\n\nMauricio Pinho · Ressignificar";
      return '<p style="margin:10px 0 4px"><b>' + esc(pe.nome) + "</b>: " + brl(v.preco_centavos / 100) + "</p>" +
        '<div class="link-teste"><input type="text" readonly value="' + esc(url) + '" aria-label="Link especial de ' + esc(pe.nome) + '"><button type="button" class="btn peq" data-copiar-url="' + esc(url) + '">Copiar</button></div>' +
        '<div class="acoes" style="margin-top:6px"><a class="btn peq" style="background:#1FA855;color:#fff" target="_blank" rel="noopener" href="https://wa.me/' + esc(String(pe.telefone || "").replace(/\D/g, "")) + "?text=" + encodeURIComponent(msg) + '">Enviar no WhatsApp</a>' +
        '<a class="btn peq contorno" href="' + esc(url) + '" target="_blank" rel="noopener">Ver como fica</a></div>';
    }).join("") + "</div>";
  }
  function cartaoProduto(p) {
    const tem = vinculos.filter(function (v) { return v.produto_id === p.id && v.situacao === "adquirido"; }).length;
    const of = vinculos.filter(function (v) { return v.produto_id === p.id && v.situacao === "oferecido"; }).length;
    const ints = interesses.filter(function (i) { return i.produto_id === p.id; }).length;
    return '<div class="sessao"><div class="sessao-topo"><b>' + esc(p.nome) + "</b><span>" +
      (p.destaque ? '<span class="selo ouro">Destaque</span>' : "") + (p.ativo ? "" : '<span class="selo off">Inativo</span>') +
      '<span class="selo">' + (p.publico === "todos" ? "Todos veem" : "Só oferecidos") + "</span></span></div>" +
      (p.preco_texto ? "<b>" + esc(p.preco_texto) + "</b>" : "") + (p.descricao ? "<p>" + esc(p.descricao) + "</p>" : "") +
      '<span class="acao-info">' + tem + (tem === 1 ? " cliente tem" : " clientes têm") + " · oferecido a " + of + " · " + ints + (ints === 1 ? " interesse" : " interesses") + (p.link_pagamento ? " · com link de pagamento" : "") + "</span>" +
      (linkVenda(p) ? '<div class="link-venda"><span class="rotulo">' + (p.pagina ? "Link de vendas" : "Link de pagamento") + ' para enviar</span>' +
        '<div class="link-teste"><input type="text" readonly value="' + esc(linkVenda(p)) + '" aria-label="Link de vendas de ' + esc(p.nome) + '"><button type="button" class="btn peq" data-copiar="' + p.id + '">Copiar</button></div>' +
        '<div class="acoes" style="margin-top:8px"><button type="button" class="btn peq" style="background:#1FA855;color:#fff" data-enviar="' + p.id + '">Enviar no WhatsApp ou e-mail</button>' +
        (p.pagina ? '<a class="btn peq contorno" href="' + esc(linkVenda(p)) + '" target="_blank" rel="noopener">Ver a página de vendas</a>' : "") + "</div></div>" : "") +
      condicoesEspeciais(p) +
      (master ? '<div class="acoes" style="margin-top:4px"><button class="btn peq contorno" type="button" data-ed="' + p.id + '">Editar</button><button class="btn peq perigo" type="button" data-del="' + p.id + '">Apagar</button></div>' : "") + "</div>";
  }
  function desenharCatalogo() {
    document.getElementById("listaProd").innerHTML = produtos.length ? produtos.map(cartaoProduto).join("") : '<div class="cartao"><p class="vazio">Nenhum produto no catálogo ainda.</p></div>';
  }
  document.getElementById("listaProd").addEventListener("click", async function (e) {
    const be = e.target.closest("[data-ed]"), bd = e.target.closest("[data-del]"), bc = e.target.closest("[data-copiar]"), bv = e.target.closest("[data-enviar]");
    const bu = e.target.closest("[data-copiar-url]");
    if (bu) {
      const inp = bu.parentNode.querySelector("input");
      try { await navigator.clipboard.writeText(bu.dataset.copiarUrl); } catch (err) { inp.select(); document.execCommand("copy"); }
      bu.textContent = "Copiado ✓"; setTimeout(function () { bu.textContent = "Copiar"; }, 2000); return;
    }
    if (bc) {
      const url = linkVenda(produto(bc.dataset.copiar)), inp = bc.parentNode.querySelector("input");
      try { await navigator.clipboard.writeText(url); } catch (err) { inp.select(); document.execCommand("copy"); }
      bc.textContent = "Copiado ✓"; setTimeout(function () { bc.textContent = "Copiar"; }, 2000); return;
    }
    if (bv) { abrirEnvio(produto(bv.dataset.enviar)); return; }
    if (be) {
      const p = produto(be.dataset.ed); editId = p.id;
      document.getElementById("pNome").value = p.nome; document.getElementById("pServ").value = p.servico || "";
      document.getElementById("pPreco").value = p.preco_texto || ""; document.getElementById("pDesc").value = p.descricao || ""; document.getElementById("pChamada").value = p.chamada || "";
      document.getElementById("pInclui").value = p.inclui || ""; document.getElementById("pLink").value = p.link_pagamento || ""; document.getElementById("pPagina").value = p.pagina || "";
      document.getElementById("pPub").value = p.publico; document.getElementById("pOrdem").value = p.ordem;
      document.getElementById("pDestaque").checked = p.destaque; document.getElementById("pAtivo").checked = p.ativo;
      document.getElementById("tituloProd").textContent = "Editando: " + p.nome; document.getElementById("pSalvar").textContent = "Salvar alteração";
      document.getElementById("pCancelar").hidden = false; fP.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (bd) {
      const p = produto(bd.dataset.del);
      if (!confirm("Apagar \"" + p.nome + "\"? Os interesses e marcações ligados a ele também serão apagados. Se quiser só tirar da vitrine, edite e desmarque \"Ativo\".")) return;
      const { error } = await supa().from("catalogo_produtos").delete().eq("id", p.id);
      if (error) { aviso("Não foi possível apagar.", true); return; }
      await carregar(); desenharTudo();
    }
  });

  /* ================= ENVIAR O LINK (WhatsApp ou e-mail) ================= */
  const jEnv = document.getElementById("janelaEnviar");
  let envProd = null, msgEditada = false;
  const soDig = function (t) { return String(t || "").replace(/\D/g, ""); };
  function mensagemPadrao() {
    const cli = pessoa(document.getElementById("envCliente").value), prim = document.getElementById("envCliente").value ? cli.nome.split(" ")[0] : "";
    return (prim ? "Olá, " + prim + "! Tudo bem?" : "Olá! Tudo bem?") + "\n\nSeparei para você: " + envProd.nome + "." +
      (envProd.chamada ? "\n\n" + envProd.chamada : "") + "\n\nVeja como funciona e garanta o seu acesso aqui:\n" + linkVenda(envProd) + "\n\nMauricio Pinho · Ressignificar";
  }
  function abrirEnvio(p) {
    envProd = p; msgEditada = false;
    document.getElementById("envTitulo").textContent = "Enviar: " + p.nome;
    document.getElementById("envCliente").innerHTML = '<option value="">Digitar o contato abaixo</option>' + perfis.filter(function (x) { return x.ativo && x.papel !== "master"; })
      .map(function (x) { return '<option value="' + x.id + '">' + esc(x.nome) + "</option>"; }).join("");
    document.getElementById("envZap").value = ""; document.getElementById("envEmail").value = "";
    document.getElementById("envMsg").value = mensagemPadrao();
    jEnv.showModal();
  }
  document.getElementById("envMsg").addEventListener("input", function () { msgEditada = true; });
  document.getElementById("envCliente").addEventListener("change", function () {
    const cli = this.value ? pessoa(this.value) : null;
    document.getElementById("envZap").value = cli && cli.telefone ? cli.telefone : "";
    document.getElementById("envEmail").value = cli && cli.email ? cli.email : "";
    if (!msgEditada) document.getElementById("envMsg").value = mensagemPadrao();
  });
  document.getElementById("envFechar").addEventListener("click", function () { jEnv.close(); });
  function registrarEnvio(canal) {
    const pid = document.getElementById("envCliente").value; if (!pid || !envProd) return;
    supa().from("interesses").insert({ perfil_id: pid, produto_id: envProd.id, status: "em_conversa", mensagem: "Link de vendas enviado por " + canal + " pelo Mauricio" }).then(function () {});
  }
  document.getElementById("envZapBtn").addEventListener("click", function () {
    let d = soDig(document.getElementById("envZap").value);
    if (d.length === 10 || d.length === 11) d = "55" + d;
    if (d && (d.length < 12 || d.length > 13)) { aviso("Confira o WhatsApp: escreva com DDD.", true); return; }
    window.open("https://wa.me/" + d + "?text=" + encodeURIComponent(document.getElementById("envMsg").value), "_blank", "noopener");
    registrarEnvio("WhatsApp");
  });
  document.getElementById("envEmailBtn").addEventListener("click", async function () {
    const para = document.getElementById("envEmail").value.trim().toLowerCase(), msg = document.getElementById("envMsg").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(para)) { aviso("Escreva um e-mail válido.", true); return; }
    const assunto = envProd.nome + " · Ressignificar", b = this;
    b.disabled = true; b.textContent = "Enviando...";
    const r = await supa().functions.invoke("catalogo-enviar", { body: { produto_id: envProd.id, para: para, mensagem: msg } });
    b.disabled = false; b.textContent = "Enviar por e-mail";
    if (r.data && r.data.ok) { aviso("E-mail enviado pelo contato@ para " + para + "."); registrarEnvio("e-mail"); return; }
    if (!confirm("Não consegui enviar pelo contato@ agora. Quer abrir o e-mail já escrito no seu programa de e-mail?")) return;
    /* sem envio automático: abre o e-mail já escrito no programa de e-mail */
    location.href = "mailto:" + encodeURIComponent(para) + "?subject=" + encodeURIComponent(assunto) + "&body=" + encodeURIComponent(msg);
    registrarEnvio("e-mail");
  });

  /* ================= POR CLIENTE ================= */
  const selCli = document.getElementById("selCli");
  function preencherClientes() {
    const v = selCli.value;
    selCli.innerHTML = '<option value="">Escolha o cliente</option>' + perfis.filter(function (p) { return p.papel === "cliente" && p.ativo; })
      .map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + "</option>"; }).join("");
    selCli.value = v;
  }
  function desenharPorCliente() {
    const pid = selCli.value, tb = document.getElementById("listaCliProd");
    if (!pid) { tb.innerHTML = '<tr><td colspan="3" class="vazio">Escolha um cliente acima.</td></tr>'; return; }
    tb.innerHTML = produtos.length ? produtos.map(function (p) {
      const v = vinculos.find(function (x) { return x.perfil_id === pid && x.produto_id === p.id; });
      const sit = v ? v.situacao : "";
      return "<tr><td><b>" + esc(p.nome) + "</b>" + (p.ativo ? "" : ' <span class="selo off">Inativo</span>') + "</td><td>" + (p.publico === "todos" ? "Todos" : "Só oferecidos") + "</td>" +
        '<td><select data-vinc="' + p.id + '"><option value=""' + (sit ? "" : " selected") + '>—</option><option value="oferecido"' + (sit === "oferecido" ? " selected" : "") + '>Oferecer a este cliente</option><option value="adquirido"' + (sit === "adquirido" ? " selected" : "") + ">Já tem</option></select>" +
        (v ? ' <span class="acao-info">desde ' + dataBR(v.desde) + "</span>" : "") + "</td></tr>";
    }).join("") : '<tr><td colspan="3" class="vazio">Cadastre produtos no catálogo primeiro.</td></tr>';
  }
  selCli.addEventListener("change", desenharPorCliente);
  document.getElementById("listaCliProd").addEventListener("change", async function (e) {
    const s = e.target.closest("[data-vinc]"); if (!s) return;
    const pid = selCli.value, prod = s.dataset.vinc;
    const r = s.value
      ? await supa().from("cliente_produtos").upsert({ perfil_id: pid, produto_id: prod, situacao: s.value, desde: hojeISO() }, { onConflict: "perfil_id,produto_id" })
      : await supa().from("cliente_produtos").delete().eq("perfil_id", pid).eq("produto_id", prod);
    if (r.error) { aviso("Não foi possível salvar.", true); return; }
    aviso(s.value === "adquirido" ? "Marcado como produto do cliente." : (s.value === "oferecido" ? "Oferta liberada para o cliente." : "Removido."));
    await carregar(); desenharTudo();
  });

  /* ================= LIBERAR TESTE MANUALMENTE ================= */
  const fLib = document.getElementById("formLib");
  if (fLib) {
    const PRECO = { travas: { v: "147", per: "anual" }, tracos: { v: "97", per: "anual" }, mpcc: { v: "97", per: "anual" }, disc: { v: "97", per: "anual" } };
    const libModo = document.getElementById("libModo"), libTeste = document.getElementById("libTeste");
    function ajustarLib() {
      const m = libModo.value;
      document.getElementById("libPagamento").hidden = m === "cortesia";
      document.getElementById("libPer").disabled = m === "cortesia";
      document.getElementById("libDataRot").textContent = m === "a_pagar" ? "Data do pagamento (vencimento)" : "Data em que pagou";
      if (!document.getElementById("libData").value) document.getElementById("libData").value = hojeISO();
    }
    libTeste.addEventListener("change", function () { const p = PRECO[libTeste.value]; document.getElementById("libValor").value = p.v; document.getElementById("libPer").value = p.per; });
    libModo.addEventListener("change", ajustarLib);
    document.getElementById("libValor").value = PRECO.travas.v; document.getElementById("libPer").value = PRECO.travas.per; ajustarLib();
    fLib.addEventListener("submit", async function (e) {
      e.preventDefault();
      const pid = selCli.value, modo = libModo.value;
      if (!pid) { aviso("Escolha o cliente lá em cima.", true); selCli.focus(); return; }
      const valor = modo === "cortesia" ? 0 : lerValor(document.getElementById("libValor").value);
      const data = document.getElementById("libData").value;
      if (modo !== "cortesia" && (!(valor > 0) || !data)) { aviso("Informe o valor e a data.", true); return; }
      const p = pessoa(pid), nomeTeste = libTeste.options[libTeste.selectedIndex].text;
      if (!confirm("Liberar " + nomeTeste + " para " + p.nome + "?")) return;
      const b = document.getElementById("libBtn"); b.disabled = true; b.textContent = "Liberando...";
      const r = await supa().rpc("master_liberar_teste", { p_perfil: pid, p_chave: libTeste.value, p_modo: modo, p_valor: valor, p_data: modo === "cortesia" ? null : data,
        p_forma: modo === "cortesia" ? null : document.getElementById("libForma").value, p_periodicidade: modo === "cortesia" ? "unico" : document.getElementById("libPer").value });
      b.disabled = false; b.textContent = "Liberar teste";
      if (r.error || !r.data || !r.data.ok) { aviso((r.data && r.data.erro) || "Não foi possível liberar.", true); return; }
      const d = r.data, prim = (p.nome || "").split(" ")[0];
      const msg = d.montar
        ? "Olá, " + prim + "! Liberei o seu " + nomeTeste + ". Agora é só montar a sua página (leva 2 minutos): " + d.montar + "\n\nE entre no grupo de terapeutas no WhatsApp: " + d.grupo
        : "Olá, " + prim + "! Liberei o " + nomeTeste + " na sua página: " + SITE + "/teste/?t=" + d.slug + " . Entre na Área do terapeuta com o seu e-mail e senha.\n\nE entre no grupo de terapeutas no WhatsApp: " + d.grupo;
      const box = document.getElementById("libResultado");
      box.hidden = false;
      box.innerHTML = '<div class="aviso-sigilo" style="display:block">✅ <b>' + esc(nomeTeste) + "</b> liberado para <b>" + esc(p.nome) + "</b>. " +
        (modo === "pago" ? "O pagamento entrou como pago no Financeiro dela e na sua DRE." : modo === "a_pagar" ? "A cobrança ficou no Financeiro dela com vencimento em " + dataBR(data) + ", com os avisos por e-mail." : "Cortesia: sem cobrança.") +
        (d.montar ? "<br>Ela ainda não tem página de teste: mande o link para ela montar." : "<br>O teste já está na página dela.") + "</div>" +
        '<label for="libMsg" style="margin-top:10px">Mensagem para enviar</label><textarea id="libMsg" rows="5">' + esc(msg) + "</textarea>" +
        '<div class="acoes">' + (p.telefone ? '<a class="btn auto" style="background:#1FA855;color:#fff" target="_blank" rel="noopener" href="https://wa.me/' + soDig(p.telefone) + "?text=" + encodeURIComponent(msg) + '">Enviar no WhatsApp</a>' : "") +
        '<button class="btn auto contorno" type="button" id="libCopiar">Copiar mensagem</button></div>';
      document.getElementById("libCopiar").addEventListener("click", function () { navigator.clipboard.writeText(document.getElementById("libMsg").value).then(function () { aviso("Mensagem copiada."); }); });
      aviso("Teste liberado.");
      await carregar(); desenharTudo();
    });
  }

  function desenharTudo() { desenharInteresses(); desenharCatalogo(); preencherClientes(); desenharPorCliente(); }
  ligarAbas(document.getElementById("abas"));
  await carregar();
  desenharTudo();
})();
