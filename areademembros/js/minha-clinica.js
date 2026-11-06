/* Minha Clínica: área da terapeuta que comprou a Clínica Otimizada.
   Cada terapeuta só enxerga os próprios clientes (garantido no banco, pela regra de acesso). */
(async function () {
  const eu = await protegerPagina(["cliente", "profissional", "master"]);
  if (!eu) return;
  const $ = function (id) { return document.getElementById(id); };
  if (eu.papel === "master") $("voltar").href = "painel-master.html";
  else if (eu.papel === "profissional") $("voltar").href = "painel-profissional.html";

  /* acesso: comprou a Clínica Otimizada (ou é o master) */
  let liberado = eu.papel === "master";
  if (!liberado) {
    const r = await supa().from("cliente_produtos").select("situacao,catalogo_produtos!inner(chave)").eq("perfil_id", eu.id).eq("situacao", "adquirido").eq("catalogo_produtos.chave", "clinica");
    liberado = !!(r.data && r.data.length);
  }
  if (!liberado) { $("semAcesso").hidden = false; return; }
  $("area").hidden = false;

  const hoje = hojeISO();
  const mesAtual = hoje.slice(0, 7);
  let clientes = [], sessoes = [], filtro = "ativo", aberto = null;
  const STATUS = { ativo: "Ativo", pausado: "Pausado", encerrado: "Encerrado" };
  const SES = { agendada: "Agendada", realizada: "Realizada", faltou: "Faltou", cancelada: "Cancelada" };
  const iniciais = function (n) { const p = String(n || "?").trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase(); };
  const soDig = function (t) { return String(t || "").replace(/\D/g, ""); };
  const zapLink = function (t) { let d = soDig(t); if (d.length === 10 || d.length === 11) d = "55" + d; return d.length >= 12 ? "https://wa.me/" + d : ""; };
  const valorTxt = function (v) { return v == null || v === "" ? "" : brl(v).replace(/^R\$\s?/, "R$ "); };
  const lerV = function (s) { const v = lerValor(s); return isFinite(v) ? v : null; };
  const diaLongo = function (iso) { const t = new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }); return t.charAt(0).toUpperCase() + t.slice(1); };
  const aReceber = function (s) { return s.status === "realizada" && !s.pago && Number(s.valor) > 0; };

  async function carregar() {
    const [rc, rs] = await Promise.all([
      supa().from("consultorio_clientes").select("*").order("nome"),
      supa().from("consultorio_sessoes").select("*").order("data").order("hora")
    ]);
    clientes = rc.data || []; sessoes = rs.data || [];
  }
  const nomeDe = function (id) { const c = clientes.find(function (x) { return x.id === id; }); return c ? c.nome : "—"; };

  function desenharKpis() {
    const ativos = clientes.filter(function (c) { return c.status === "ativo"; }).length;
    const doMes = sessoes.filter(function (s) { return s.data.slice(0, 7) === mesAtual && s.status !== "cancelada"; });
    const receber = sessoes.filter(aReceber).reduce(function (t, s) { return t + Number(s.valor || 0); }, 0);
    const recebido = sessoes.filter(function (s) { return s.pago && (s.pago_em || s.data).slice(0, 7) === mesAtual; }).reduce(function (t, s) { return t + Number(s.valor || 0); }, 0);
    const prox = sessoes.filter(function (s) { return s.status === "agendada" && s.data >= hoje; }).length;
    $("kpis").innerHTML = [
      ["Clientes ativos", ativos, clientes.length + " no total"],
      ["Sessões no mês", doMes.length, prox + " agendadas pela frente"],
      ["A receber", '<span class="' + (receber > 0 ? "desce" : "") + '">' + brl(receber) + "</span>", "sessões feitas e não pagas"],
      ["Recebido no mês", '<span class="sobe">' + brl(recebido) + "</span>", MESES_LONGOS[+mesAtual.slice(5) - 1]]
    ].map(function (k) { return '<div class="kpi"><small>' + k[0] + "</small><b>" + k[1] + "</b><span>" + esc(k[2]) + "</span></div>"; }).join("");
  }

  function desenharClientes() {
    const q = $("busca").value.trim().toLowerCase();
    const lista = clientes.filter(function (c) { return (filtro === "todos" || c.status === filtro) && (!q || c.nome.toLowerCase().indexOf(q) > -1); });
    if (!lista.length) {
      $("listaClientes").innerHTML = '<p class="vazio">' + (clientes.length ? "Ninguém encontrado com esse filtro." : 'Nenhum cliente ainda. Toque em "+ Novo cliente" ou traga quem respondeu o seu teste, na aba "Trazer dos testes".') + "</p>";
      return;
    }
    $("listaClientes").innerHTML = lista.map(function (c) {
      const ses = sessoes.filter(function (s) { return s.cliente_id === c.id; });
      const prox = ses.find(function (s) { return s.status === "agendada" && s.data >= hoje; });
      const dev = ses.filter(aReceber).reduce(function (t, s) { return t + Number(s.valor || 0); }, 0);
      return '<button type="button" class="mc-cli" data-id="' + c.id + '"><span class="mc-ini">' + esc(iniciais(c.nome)) + "</span><span><b>" + esc(c.nome) +
        (c.status !== "ativo" ? '<span class="mc-st ' + c.status + '">' + STATUS[c.status] + "</span>" : "") + (c.origem !== "manual" ? '<span class="mc-st teste">Veio do teste</span>' : "") +
        "</b><small>" + ses.filter(function (s) { return s.status === "realizada"; }).length + " sessões realizadas" + (prox ? " · próxima " + dataBR(prox.data).slice(0, 5) + (prox.hora ? " às " + prox.hora.slice(0, 5) : "") : "") + "</small></span>" +
        '<span class="mc-dir">' + (dev > 0 ? "a receber<br><b class=\"desce\">" + brl(dev) + "</b>" : "") + "</span></button>";
    }).join("");
  }

  function linhaSessao(s, comNome) {
    return '<div class="mc-ses" data-ses="' + s.id + '"><span class="h">' + (s.hora ? s.hora.slice(0, 5) : dataBR(s.data).slice(0, 5)) + '</span><span class="q">' +
      (comNome ? "<b>" + esc(nomeDe(s.cliente_id)) + "</b>" : "<b>" + dataBR(s.data) + "</b>") + "<small>" + SES[s.status] + (Number(s.valor) > 0 ? " · " + valorTxt(s.valor) + (s.pago ? " · paga ✓" : s.status === "realizada" ? " · a receber" : "") : "") + "</small></span>" +
      '<span class="mc-acoes">' +
      (s.status === "agendada" ? '<button class="btn peq" type="button" data-acao="realizada">Realizada</button><button class="btn peq contorno" type="button" data-acao="faltou">Faltou</button>' : "") +
      (!s.pago && Number(s.valor) > 0 && s.status !== "cancelada" ? '<button class="btn peq contorno" type="button" data-acao="pagar">Recebi</button>' : "") +
      (comNome ? '<button class="btn peq contorno" type="button" data-acao="ficha" data-cli="' + s.cliente_id + '">Ficha</button>' : "") +
      "</span>" + (comNome ? "" : '<textarea class="mc-nota" data-nota="' + s.id + '" maxlength="8000" placeholder="Nota privada desta sessão (salva ao sair do campo)">' + esc(s.nota || "") + "</textarea>") + "</div>";
  }

  function desenharAgenda() {
    const pend = sessoes.filter(function (s) { return s.status === "agendada" && s.data < hoje; });
    $("pendentesCartao").hidden = !pend.length;
    $("pendentes").innerHTML = pend.map(function (s) { return linhaSessao(s, true).replace('<span class="h">' + (s.hora ? s.hora.slice(0, 5) : dataBR(s.data).slice(0, 5)), '<span class="h">' + dataBR(s.data).slice(0, 5)); }).join("");
    const prox = sessoes.filter(function (s) { return s.status === "agendada" && s.data >= hoje; });
    if (!prox.length) { $("agenda").innerHTML = '<p class="vazio">Nenhuma sessão agendada. Abra a ficha de um cliente para marcar.</p>'; return; }
    let html = "", dia = "";
    prox.forEach(function (s) { if (s.data !== dia) { dia = s.data; html += '<div class="mc-dia">' + (s.data === hoje ? "Hoje · " : "") + diaLongo(s.data) + "</div>"; } html += linhaSessao(s, true); });
    $("agenda").innerHTML = html;
  }

  /* ---------- testes: quem respondeu ---------- */
  let respostas = [];
  async function carregarTestes() {
    const [rt, ro] = await Promise.all([
      supa().from("travas_respostas").select("id,nome,dados,criado_em").order("criado_em", { ascending: false }).limit(500),
      supa().from("testes_respostas").select("id,nome,teste,dados,criado_em").order("criado_em", { ascending: false }).limit(500)
    ]);
    const ja = new Set(clientes.map(function (c) { return c.resposta_id; }).filter(Boolean));
    respostas = (rt.data || []).map(function (r) { return { id: r.id, origem: "travas", teste: "Teste de Travas", nome: r.nome || (r.dados || {}).nome, d: r.dados || {}, em: r.criado_em }; })
      .concat((ro.data || []).map(function (r) { return { id: r.id, origem: "teste", teste: "Teste " + (r.teste || ""), nome: r.nome || (r.dados || {}).nome, d: r.dados || {}, em: r.criado_em }; }))
      .filter(function (r) { return !ja.has(r.id) && r.nome; });
    $("qtdTestes").hidden = !respostas.length; $("qtdTestes").textContent = respostas.length;
    $("btImportarTodos").hidden = respostas.length < 2;
    $("listaTestes").innerHTML = respostas.length ? respostas.map(function (r) {
      const contato = [r.d.whatsapp, r.d.email].filter(Boolean).join(" · ");
      return '<div class="mc-imp"><span><b>' + esc(r.nome) + "</b><small>" + esc(r.teste) + " · " + dataBR(String(r.em).slice(0, 10)) + (r.d.travaMaisForte ? " · trava mais forte: " + esc(r.d.travaMaisForte) : "") + (contato ? " · " + esc(contato) : "") + "</small></span>" +
        '<button class="btn peq" type="button" data-importar="' + r.id + '">Trazer como cliente ativo</button></div>';
    }).join("") : '<p class="vazio">Ninguém novo por aqui. Quando alguém responder o seu teste, aparece nesta lista.</p>';
  }
  async function importar(ids) {
    const linhas = respostas.filter(function (r) { return ids.indexOf(r.id) > -1; }).map(function (r) {
      return { nome: String(r.nome).slice(0, 120), whatsapp: r.d.whatsapp ? String(r.d.whatsapp).slice(0, 20) : null, email: r.d.email ? String(r.d.email).slice(0, 120) : null,
        origem: r.origem, resposta_id: r.id, status: "ativo", queixa: r.d.dor || r.d.motivo ? String(r.d.dor || r.d.motivo).slice(0, 2000) : null };
    });
    if (!linhas.length) return;
    const { error } = await supa().from("consultorio_clientes").insert(linhas);
    if (error) { aviso("Não foi possível trazer agora. Tente de novo.", true); return; }
    aviso(linhas.length === 1 ? linhas[0].nome + " agora é cliente ativo." : linhas.length + " pessoas agora são clientes ativos.");
    await tudo();
  }

  async function tudo() { await carregar(); desenharKpis(); desenharClientes(); desenharAgenda(); await carregarTestes(); }

  /* ---------- ficha ---------- */
  function abrirFicha(id) {
    const c = clientes.find(function (x) { return x.id === id; }); if (!c) return;
    aberto = c;
    $("fIni").textContent = iniciais(c.nome); $("fNome").textContent = c.nome;
    $("fStatus").value = c.status; $("fZap").value = c.whatsapp || ""; $("fEmail").value = c.email || ""; $("fNasc").value = c.nascimento || "";
    $("fValor").value = c.valor_sessao != null ? String(c.valor_sessao).replace(".", ",") : ""; $("fQueixa").value = c.queixa || ""; $("fAnot").value = c.anotacoes || "";
    const z = zapLink(c.whatsapp); $("fChamar").hidden = !z; $("fChamar").href = z || "#";
    $("sData").value = hoje; $("sHora").value = ""; $("sValor").value = $("fValor").value; $("sStatus").value = "agendada"; $("sPago").checked = false;
    $("fTrava").innerHTML = "";
    if (c.resposta_id && c.origem === "travas") {
      supa().from("travas_respostas").select("dados,criado_em").eq("id", c.resposta_id).maybeSingle().then(function (r) {
        const d = r.data && r.data.dados; if (!d) return;
        $("fTrava").innerHTML = '<div class="mc-trava">Teste de Travas em ' + dataBR(String(r.data.criado_em).slice(0, 10)) + (d.travaMaisForte ? ": trava mais forte <b>" + esc(d.travaMaisForte) + "</b>" : "") + (d.geral != null ? " · índice geral <b>" + esc(d.geral) + "</b>" : "") + "</div>";
      });
    }
    desenharSessoesFicha();
    $("janelaFicha").showModal();
  }
  function desenharSessoesFicha() {
    const ses = sessoes.filter(function (s) { return s.cliente_id === aberto.id; }).slice().reverse();
    $("fSessoes").innerHTML = ses.length ? ses.map(function (s) { return linhaSessao(s, false); }).join("") : '<p class="vazio">Nenhuma sessão registrada ainda.</p>';
  }

  $("formFicha").addEventListener("submit", async function (ev) {
    ev.preventDefault(); if (!aberto) return;
    const upd = { status: $("fStatus").value, whatsapp: $("fZap").value.trim() || null, email: $("fEmail").value.trim() || null, nascimento: $("fNasc").value || null,
      valor_sessao: lerV($("fValor").value), queixa: $("fQueixa").value.trim() || null, anotacoes: $("fAnot").value.trim() || null, atualizado_em: new Date().toISOString() };
    const { error } = await supa().from("consultorio_clientes").update(upd).eq("id", aberto.id);
    if (error) { aviso("Não foi possível salvar.", true); return; }
    Object.assign(aberto, upd); aviso("Ficha salva."); desenharKpis(); desenharClientes();
    const z = zapLink(upd.whatsapp); $("fChamar").hidden = !z; $("fChamar").href = z || "#";
  });

  $("formSessao").addEventListener("submit", async function (ev) {
    ev.preventDefault(); if (!aberto) return;
    const pago = $("sPago").checked;
    const reg = { cliente_id: aberto.id, data: $("sData").value, hora: $("sHora").value || null, valor: lerV($("sValor").value), status: $("sStatus").value, pago: pago, pago_em: pago ? hoje : null };
    if (!reg.data) { aviso("Escolha a data da sessão.", true); return; }
    const { data, error } = await supa().from("consultorio_sessoes").insert(reg).select("*").single();
    if (error) { aviso("Não foi possível adicionar a sessão.", true); return; }
    sessoes.push(data); sessoes.sort(function (a, b) { return (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || "")); });
    aviso("Sessão adicionada."); desenharSessoesFicha(); desenharKpis(); desenharClientes(); desenharAgenda();
  });

  async function acaoSessao(id, acao) {
    const s = sessoes.find(function (x) { return x.id === id; }); if (!s) return;
    const upd = acao === "pagar" ? { pago: true, pago_em: hoje, status: s.status === "agendada" ? "realizada" : s.status } : { status: acao };
    const { error } = await supa().from("consultorio_sessoes").update(upd).eq("id", id);
    if (error) { aviso("Não foi possível atualizar.", true); return; }
    Object.assign(s, upd);
    aviso(acao === "pagar" ? "Pagamento registrado." : "Sessão marcada como " + SES[acao].toLowerCase() + ".");
    if (aberto && $("janelaFicha").open) desenharSessoesFicha();
    desenharKpis(); desenharClientes(); desenharAgenda();
  }

  document.addEventListener("click", function (ev) {
    const cli = ev.target.closest(".mc-cli"); if (cli) { abrirFicha(cli.dataset.id); return; }
    const b = ev.target.closest("[data-acao]");
    if (b) { if (b.dataset.acao === "ficha") abrirFicha(b.dataset.cli); else acaoSessao(b.closest("[data-ses]").dataset.ses, b.dataset.acao); return; }
    const imp = ev.target.closest("[data-importar]"); if (imp) { imp.disabled = true; importar([imp.dataset.importar]); return; }
    const f = ev.target.closest(".mc-filtro");
    if (f) { filtro = f.dataset.f; document.querySelectorAll(".mc-filtro").forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); }); desenharClientes(); return; }
    const fe = ev.target.closest("[data-fechar]"); if (fe) fe.closest("dialog").close();
  });
  document.addEventListener("focusout", async function (ev) {
    const t = ev.target; if (!t.dataset || !t.dataset.nota) return;
    const s = sessoes.find(function (x) { return x.id === t.dataset.nota; }); if (!s || (s.nota || "") === t.value.trim()) return;
    const { error } = await supa().from("consultorio_sessoes").update({ nota: t.value.trim() || null }).eq("id", s.id);
    if (error) { aviso("A nota não foi salva.", true); return; }
    s.nota = t.value.trim() || null; aviso("Nota salva.");
  });
  $("busca").addEventListener("input", desenharClientes);
  $("btImportarTodos").addEventListener("click", function () { this.disabled = true; importar(respostas.map(function (r) { return r.id; })).then(() => { this.disabled = false; }); });
  $("btNovo").addEventListener("click", function () { $("formNovo").reset(); $("janelaNovo").showModal(); $("nNome").focus(); });
  $("formNovo").addEventListener("submit", async function (ev) {
    ev.preventDefault();
    const nome = $("nNome").value.trim(); if (nome.length < 2) { aviso("Escreva o nome do cliente.", true); return; }
    const reg = { nome: nome, whatsapp: $("nZap").value.trim() || null, email: $("nEmail").value.trim() || null, nascimento: $("nNasc").value || null, valor_sessao: lerV($("nValor").value), queixa: $("nQueixa").value.trim() || null };
    const { data, error } = await supa().from("consultorio_clientes").insert(reg).select("*").single();
    if (error) { aviso("Não foi possível salvar o cliente.", true); return; }
    $("janelaNovo").close(); clientes.push(data); clientes.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    aviso(nome + " foi adicionado."); desenharKpis(); desenharClientes(); abrirFicha(data.id);
  });
  $("fExcluir").addEventListener("click", async function () {
    if (!aberto || !confirm("Excluir " + aberto.nome + " e todas as sessões? Isso não pode ser desfeito.")) return;
    const { error } = await supa().from("consultorio_clientes").delete().eq("id", aberto.id);
    if (error) { aviso("Não foi possível excluir.", true); return; }
    $("janelaFicha").close(); aviso("Cliente excluído."); await tudo();
  });
  $("janelaFicha").addEventListener("close", function () { aberto = null; });

  ligarAbas($("abas"));
  await tudo();
  if (location.hash === "#testes") document.querySelector('.aba[data-aba="testes"]').click();
})();
