/* Inscrições (Fase 9): tela das páginas de inscrição, dos inscritos, da fila de revisão e do relatório.
   Usa as utilidades do painel (window.WaPainel, definidas em whatsapp.js) e as funções puras de whatsapp-inscricao.js.
   Nada aqui dá autorização a ninguém: quem confirma é a própria pessoa, pelo WhatsApp dela. */
(function waTelaInicio() {
  "use strict";
  const P = window.WaPainel, WI = window.WaInscricao;
  if (!WI) return;
  /* o painel só fica pronto depois de conferir o login (vai à internet): se ainda não está, espera o aviso dele */
  if (!P) { document.addEventListener("wa-painel-pronto", waTelaInicio, { once: true }); return; }
  const $ = P.$, esc = P.esc, ler = P.ler, supa = P.supa, aviso = P.aviso, falha = P.falha, horaCurta = P.horaCurta;
  const st = { sub: "paginas", paginas: [], site: "", fila: 0, config: {}, paginaId: null, slugMexido: false, lista: [], linkDe: null };

  function rpc(nome, args) { return ler(supa().rpc(nome, args || {})); }
  function paginaPorId(id) { return st.paginas.filter(function (p) { return p.id === id; })[0] || null; }
  function tentar(f, msg) { return function () { Promise.resolve().then(f).catch(function (e) { falha(e, msg || "Não deu certo."); }); }; }

  async function carregarBase() {
    const d = await rpc("crm_inscricao_paginas");
    st.paginas = (d && d.paginas) || []; st.site = (d && d.site) || ""; st.fila = Number(d && d.fila) || 0; st.config = (d && d.config) || {};
    $("inNFila").textContent = st.fila ? String(st.fila) : "";
    const est = Number(d && d.limites_estourados_24h) || 0;
    $("inAlerta").hidden = !est;
    $("inAlerta").textContent = est ? "Nas últimas 24 horas, o limite de inscrições foi atingido " + est + (est === 1 ? " vez" : " vezes") + ". Se você está num dia de divulgação forte, aumente os limites na parte Relatório. Se não, pode ser um robô tentando encher a lista." : "";
    const ops = '<option value="">Todas as páginas</option>' + st.paginas.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nome) + "</option>"; }).join("");
    ["inFPagina", "inRPagina"].forEach(function (id) { const v = $(id).value; $(id).innerHTML = ops; if (paginaPorId(v)) $(id).value = v; });
  }

  /* ---------- sub-partes ---------- */
  const TELAS = { paginas: telaPaginas, inscritos: telaInscritos, revisao: telaRevisao, relatorio: telaRelatorio };
  function abrirSub(nome) {
    st.sub = nome;
    document.querySelectorAll("#inSub [data-in-sub]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.inSub === nome ? "true" : "false"); });
    document.querySelectorAll("[data-in-painel]").forEach(function (p) { p.hidden = p.dataset.inPainel !== nome; });
    return TELAS[nome]();
  }
  async function abrir() { await carregarBase(); return abrirSub(st.sub); }
  $("inSub").addEventListener("click", function (ev) { const b = ev.target.closest("[data-in-sub]"); if (b) tentar(function () { return abrirSub(b.dataset.inSub); }, "Não consegui carregar esta parte.")(); });
  $("inAtualizar").addEventListener("click", tentar(abrir, "Não consegui atualizar."));

  /* ---------- páginas ---------- */
  async function telaPaginas() {
    const mostrarArq = $("inArq").checked, lista = st.paginas.filter(function (p) { return mostrarArq || p.status !== "arquivada"; });
    $("inPaginas").innerHTML = lista.length ? lista.map(function (p) {
      const n = p.numeros || {}, bt = function (acao, rotulo, classe) { return '<button class="btn peq ' + (classe || "contorno") + '" type="button" data-in-pag="' + acao + '" data-id="' + esc(p.id) + '">' + rotulo + "</button>"; };
      const botoes = bt("editar", "Abrir", "") + (p.status !== "arquivada" ? bt("link", "Link") : "")
        + (p.status === "rascunho" ? bt("no_ar", "Publicar") : "") + (p.status === "no_ar" ? bt("pausada", "Pausar") : "") + (p.status === "pausada" ? bt("no_ar", "Voltar ao ar") : "")
        + (p.status === "rascunho" || p.status === "pausada" ? bt("arquivada", "Arquivar") : "") + (p.status === "arquivada" ? bt("pausada", "Desarquivar") : "");
      return "<tr><td><b>" + esc(p.nome) + "</b><br><small>/inscricao/?p=" + esc(p.slug) + "</small></td><td>" + esc(WI.rotuloPagina(p.status)) + "</td><td>" + Number(n.inscritos || 0) + "</td><td>" + Number(n.confirmados || 0) + "</td>"
        + "<td>" + esc(WI.taxa(n.confirmados, n.inscritos)) + "</td><td>" + esc(WI.rotuloOrigem(n.origem_principal)) + '</td><td><div class="acoes" style="margin:0">' + botoes + "</div></td></tr>";
    }).join("") : '<tr><td colspan="7" class="vazio">Nenhuma página ainda. Crie a primeira em "Nova página".</td></tr>';
  }
  $("inArq").addEventListener("change", tentar(telaPaginas));
  $("inNova").addEventListener("click", function () { abrirPagina(null); });
  $("inPaginas").addEventListener("click", function (ev) {
    const b = ev.target.closest("[data-in-pag]"); if (!b) return;
    const p = paginaPorId(b.dataset.id), acao = b.dataset.inPag; if (!p) return;
    if (acao === "editar") return abrirPagina(p);
    if (acao === "link") return abrirLink(p);
    const textos = { no_ar: p.status === "rascunho" ? "Publicar a página \"" + p.nome + "\"?\n\nO link passa a aceitar inscrições." : "Colocar a página \"" + p.nome + "\" de volta no ar?",
      pausada: p.status === "arquivada" ? "Tirar a página \"" + p.nome + "\" do arquivo? Ela volta pausada." : "Pausar a página \"" + p.nome + "\"?\n\nQuem abrir o link vê um aviso e não consegue se inscrever. As inscrições já feitas continuam valendo.",
      arquivada: "Arquivar a página \"" + p.nome + "\"?\n\nEla some da lista. As inscrições e as provas ficam guardadas." };
    if (!confirm(textos[acao])) return;
    tentar(async function () {
      const r = await rpc("crm_inscricao_pagina_status", { p_id: p.id, p_status: acao });
      if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui mudar a situação.", true);
      aviso(acao === "no_ar" ? "Página no ar." : acao === "arquivada" ? "Página arquivada." : "Página pausada.");
      await carregarBase(); await telaPaginas();
    })();
  });

  /* criar e editar página */
  function avisosDoAceite() {
    const av = WI.avisosAceite($("ipAceite").value, $("ipEmail").value !== "nao");
    $("ipAceiteAvisos").innerHTML = av.length ? av.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") : '<li class="ok">O texto diz quem envia, por onde e como sair.</li>';
  }
  function abrirPagina(p) {
    st.paginaId = p ? p.id : null; st.slugMexido = !!p;
    $("ipTitulo2").textContent = p ? "Página: " + p.nome : "Nova página de inscrição";
    $("ipNome").value = p ? p.nome : ""; $("ipSlug").value = p ? p.slug : ""; $("ipTituloPag").value = p ? p.titulo : ""; $("ipTexto").value = p ? (p.texto || "") : "";
    $("ipImagem").value = p ? (p.imagem_url || "") : ""; $("ipEmail").value = p ? p.campo_email : "opcional";
    $("ipAceite").value = p ? p.aceite_texto : WI.aceitePadrao(true);
    $("ipEtiquetas").value = p ? (p.etiquetas || []).join(", ") : ""; $("ipSucesso").value = p ? (p.sucesso_texto || "") : ""; $("ipBoasVindas").value = p ? (p.boas_vindas_texto || "") : "";
    $("ipSlug").disabled = !!p && p.status !== "rascunho";
    $("ipVersao").textContent = p ? "Versão " + p.aceite_versao + " do texto. Se você mudar o texto, nasce uma versão nova; cada inscrição guarda a versão que a pessoa leu." : "";
    avisosDoAceite();
    if (!$("jInscPagina").open) $("jInscPagina").showModal();
  }
  $("ipNome").addEventListener("input", function () { if (!st.slugMexido) $("ipSlug").value = WI.slugDe(this.value); });
  $("ipSlug").addEventListener("input", function () { st.slugMexido = true; });
  $("ipAceite").addEventListener("input", avisosDoAceite);
  $("ipEmail").addEventListener("change", avisosDoAceite);
  $("ipAceitePadrao").addEventListener("click", function () { $("ipAceite").value = WI.aceitePadrao($("ipEmail").value !== "nao"); avisosDoAceite(); });
  $("ipSalvar").addEventListener("click", tentar(async function () {
    const slug = WI.slugDe($("ipSlug").value);
    if (!WI.slugValido(slug)) return aviso("O endereço da página precisa ter de 3 a 60 letras minúsculas, números ou traço. Exemplo: aula-gratuita.", true);
    const r = await rpc("crm_inscricao_pagina_salvar", { p: { id: st.paginaId, slug: slug, nome: $("ipNome").value, titulo: $("ipTituloPag").value, texto: $("ipTexto").value, imagem_url: $("ipImagem").value,
      campo_email: $("ipEmail").value, aceite_texto: $("ipAceite").value, etiquetas: WI.etiquetasDe($("ipEtiquetas").value), sucesso_texto: $("ipSucesso").value, boas_vindas_texto: $("ipBoasVindas").value } });
    if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui salvar a página.", true);
    const nova = !st.paginaId;
    $("jInscPagina").close();
    aviso(nova ? "Página criada como rascunho. Confira e publique quando quiser." : "Página salva.");
    await carregarBase(); await telaPaginas();
  }, "Não consegui salvar a página."));

  /* gerador de links */
  function atualizarLink() { if (st.linkDe) $("ilLink").value = WI.linkDaPagina(st.site, st.linkDe.slug, $("ilOrigem").value); }
  function abrirLink(p) {
    st.linkDe = p; $("ilOrigem").value = "";
    $("ilNome").textContent = p.nome + (p.status === "no_ar" ? "" : " (a página está " + WI.rotuloPagina(p.status).toLowerCase() + ": o link só aceita inscrição com ela no ar)");
    atualizarLink();
    if (!$("jInscLink").open) $("jInscLink").showModal();
  }
  $("ilOrigem").addEventListener("input", atualizarLink);
  $("ilCopiar").addEventListener("click", function () {
    const t = $("ilLink").value;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { aviso("Link copiado."); }, function () { $("ilLink").select(); aviso("Selecione e copie o link.", true); });
    else { $("ilLink").select(); aviso("Selecione e copie o link."); }
  });
  $("ilAbrir").addEventListener("click", function () { window.open($("ilLink").value, "_blank", "noopener"); });

  /* ---------- inscritos ---------- */
  function linhaAcoes(i) {
    const bt = function (acao, rotulo) { return '<button class="btn peq contorno" type="button" data-in-acao="' + acao + '" data-id="' + esc(i.id) + '">' + rotulo + "</button>"; };
    const pendente = i.status === "aguardando_confirmacao" || i.status === "revisao", semConfirmar = pendente && !i.confirmou_em;
    return bt("prova", "Prova") + (i.contato_id ? bt("conversa", "Conversa") : "") + (i.status === "revisao" ? bt("liberar", "Liberar") + bt("recusar", "Recusar") : "")
      + (semConfirmar ? bt("corrigir_numero", "Corrigir número") : "") + (pendente ? bt("invalida", "Inválida") + bt("bloquear", "Bloquear") : "");
  }
  function linhaInscricao(i) {
    return "<tr><td><b>" + esc(i.nome) + "</b><br><small>" + esc(WI.telefoneBonito(i.telefone)) + (i.telefone_original ? " · digitado: " + esc(i.telefone_original) : "") + (i.email ? " · " + esc(i.email) : "") + "</small></td>"
      + "<td>" + esc(i.pagina) + "</td><td>" + esc(WI.rotuloStatus(i.status)) + (i.status === "revisao" && i.confirmou_em ? '<br><small>já confirmou pelo WhatsApp</small>' : "")
      + (i.motivo_revisao ? '<br><small class="vd-aviso">' + esc(i.motivo_revisao) + "</small>" : "") + (i.boas_vindas_erro ? '<br><small class="vd-aviso">Boas-vindas não saiu: ' + esc(i.boas_vindas_erro) + "</small>" : "") + "</td>"
      + "<td>" + esc(WI.rotuloOrigem(i.origem)) + "</td><td>" + esc(horaCurta(i.criado_em)) + '</td><td><div class="acoes" style="margin:0">' + linhaAcoes(i) + "</div></td></tr>";
  }
  async function telaInscritos() {
    const o = $("inFOrigem").value.trim();
    st.lista = (await rpc("crm_inscricoes_lista", { p_pagina: $("inFPagina").value || null, p_filtro: $("inFSituacao").value, p_origem: o ? (/^n[aã]o informada$/i.test(o) ? "(nao informada)" : WI.origemLimpa(o)) : null,
      p_busca: $("inFBusca").value.trim() || null, p_dias: Number($("inFDias").value) || null, p_limite: 500 })) || [];
    $("inLista").innerHTML = st.lista.length ? st.lista.map(linhaInscricao).join("") : '<tr><td colspan="6" class="vazio">Nenhuma inscrição com esses filtros.</td></tr>';
    $("inContagem").textContent = st.lista.length ? "Mostrando " + st.lista.length : "";
  }
  let buscaT = null;
  ["inFPagina", "inFSituacao", "inFDias"].forEach(function (id) { $(id).addEventListener("change", tentar(telaInscritos)); });
  ["inFBusca", "inFOrigem"].forEach(function (id) { $(id).addEventListener("input", function () { clearTimeout(buscaT); buscaT = setTimeout(tentar(telaInscritos), 350); }); });
  $("inExportar").addEventListener("click", function () {
    if (!st.lista.length) return aviso("Não há inscrições nesta lista para exportar.", true);
    const linhas = st.lista.map(function (i) { return { nome: i.nome, telefone: WI.telefoneBonito(i.telefone), email: i.email || "", pagina: i.pagina, situacao: WI.rotuloStatus(i.status), origem: WI.rotuloOrigem(i.origem), quando: horaCurta(i.criado_em), confirmou: (i.confirmou_em || i.confirmada_em) ? horaCurta(i.confirmou_em || i.confirmada_em) : "" }; });
    const texto = window.WaEmail.csv([["nome", "Nome"], ["telefone", "WhatsApp"], ["email", "E-mail"], ["pagina", "Página"], ["situacao", "Situação"], ["origem", "Origem"], ["quando", "Inscreveu-se em"], ["confirmou", "Confirmou em"]], linhas);
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([texto], { type: "text/csv;charset=utf-8" }));
    a.href = url; a.download = "inscricoes.csv"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* decisões sobre uma inscrição (lista e fila de revisão usam o mesmo caminho) */
  async function acaoInscricao(id, acao) {
    const i = st.lista.filter(function (x) { return x.id === id; })[0] || {};
    if (acao === "prova") return abrirProva(id);
    if (acao === "conversa") { if (i.contato_id) P.abrirConversaDe(i.contato_id); return; }
    let valor = null;
    if (acao === "corrigir_numero") {
      valor = prompt("Número certo de " + (i.nome || "esta pessoa") + ", com DDD.\n\nO número digitado na página continua guardado como prova.", "");
      if (valor === null) return;
      if (!WI.celularBr(valor)) return aviso("Digite um celular brasileiro com DDD.", true);
    } else {
      const textos = { liberar: "Liberar " + (i.nome || "esta pessoa") + "?\n\n" + (i.motivo_revisao || "") + "\n\nEla só volta a receber depois de confirmar pelo próprio WhatsApp. A liberação fica registrada no seu nome.",
        recusar: "Recusar esta inscrição?\n\nA pessoa continua como está e a prova fica guardada.", bloquear: "Bloquear esta inscrição?\n\nEla não poderá ser confirmada. A prova fica guardada.",
        invalida: "Marcar como inválida (número errado ou cadastro falso)?\n\nA prova fica guardada." };
      if (!confirm(textos[acao])) return;
    }
    const r = await rpc("crm_inscricao_acao", { p_id: id, p_acao: acao, p_valor: valor });
    if (!r || !r.ok) return aviso((r && r.erro) || "Não deu certo.", true);
    aviso(acao === "liberar" ? "Liberada." + (r.falta_confirmar ? " Agora falta a pessoa confirmar pelo WhatsApp dela." : " A autorização voltou a valer.") + (r.aviso ? " " + r.aviso : "")
      : acao === "corrigir_numero" ? "Número corrigido para " + WI.telefoneBonito(r.telefone) + ". O original continua guardado." : acao === "recusar" ? "Inscrição recusada." : acao === "bloquear" ? "Inscrição bloqueada." : "Marcada como inválida.");
    await carregarBase(); await TELAS[st.sub]();
  }
  ["inLista", "inFila"].forEach(function (id) {
    $(id).addEventListener("click", function (ev) { const b = ev.target.closest("[data-in-acao]"); if (b) tentar(function () { return acaoInscricao(b.dataset.id, b.dataset.inAcao); })(); });
  });

  /* ---------- fila de revisão ---------- */
  async function telaRevisao() {
    st.lista = (await rpc("crm_inscricoes_lista", { p_pagina: null, p_filtro: "revisao", p_origem: null, p_busca: null, p_dias: null, p_limite: 200 })) || [];
    $("inFila").innerHTML = st.lista.length ? st.lista.map(linhaInscricao).join("") : '<tr><td colspan="6" class="vazio">Nada esperando a sua decisão.</td></tr>';
  }

  /* ---------- prova ---------- */
  async function abrirProva(id) {
    $("ivCorpo").innerHTML = '<p class="vazio">Carregando...</p>';
    if (!$("jInscProva").open) $("jInscProva").showModal();
    const d = await rpc("crm_inscricao_prova", { p_id: id });
    if (!d) { $("ivCorpo").innerHTML = '<p class="ajuda">Inscrição não encontrada.</p>'; return; }
    const linha = function (rotulo, valor) { return valor ? "<div><b>" + esc(rotulo) + "</b><p>" + esc(valor) + "</p></div>" : ""; };
    $("ivCorpo").innerHTML = '<div class="grade g2">' + linha("Pessoa", d.nome) + linha("WhatsApp", WI.telefoneBonito(d.telefone) + (d.corrigida_em ? " (digitado na página: " + d.telefone_informado + ")" : "")) + linha("E-mail", d.email)
      + linha("Página", d.pagina) + linha("Inscreveu-se em", horaCurta(d.criado_em)) + linha("Origem do link", WI.rotuloOrigem(d.origem)) + linha("Aparelho", d.agente) + linha("Situação", WI.rotuloStatus(d.status)) + "</div>"
      + '<h3 class="cp-tit">O que a pessoa leu e aceitou (versão ' + Number(d.aceite_versao) + ")</h3><p class=\"in-prova\">" + esc(d.aceite_texto) + "</p>"
      + '<h3 class="cp-tit">Confirmação</h3>' + (d.confirmou_em ? '<p class="ajuda">Confirmou pelo próprio WhatsApp em ' + esc(horaCurta(d.confirmou_em)) + (d.confirmacao_texto ? ', com a mensagem:</p><p class="in-prova">' + esc(d.confirmacao_texto) + "</p>" : ".</p>")
            + '<p class="ajuda">' + (d.confirmada_em ? "A autorização vale desde " + esc(horaCurta(d.confirmada_em)) + "." : d.status === "revisao" ? "A autorização ainda não vale: só passa a valer depois da sua decisão." : "A autorização não está valendo.") + "</p>"
          : '<p class="ajuda">Ainda não confirmou. ' + (d.status === "expirada" ? "O prazo de 7 dias acabou: não recebe nada." : "Enquanto não confirmar, não recebe nada. O prazo vai até " + esc(horaCurta(d.expira_em)) + ".") + "</p>")
      + (d.motivo_revisao ? '<p class="ajuda vd-aviso">' + esc(d.motivo_revisao) + "</p>" : "")
      + (d.liberada_em ? '<p class="ajuda">Liberada por ' + esc(d.liberada_por || "você") + " em " + esc(horaCurta(d.liberada_em)) + ".</p>" : "")
      + (d.decidida_em ? '<p class="ajuda">Decisão de ' + esc(d.decidida_por || "você") + " em " + esc(horaCurta(d.decidida_em)) + ".</p>" : "")
      + (d.corrigida_em ? '<p class="ajuda">Número corrigido por ' + esc(d.corrigida_por || "você") + " em " + esc(horaCurta(d.corrigida_em)) + ".</p>" : "")
      + (d.boas_vindas_em ? '<p class="ajuda">Boas-vindas: ' + esc(d.boas_vindas_erro ? "não saiu (" + d.boas_vindas_erro + ")" : "enviada em " + horaCurta(d.boas_vindas_em)) + ".</p>" : "");
  }

  /* ---------- relatório e limites ---------- */
  async function telaRelatorio() {
    const d = await rpc("crm_inscricao_relatorio", { p_pagina: $("inRPagina").value || null, p_dias: Number($("inRDias").value) || 30 });
    const card = function (t, v, sub) { return '<div class="vd-card"><small>' + esc(t) + "</small><b>" + esc(String(v)) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>"; };
    $("inRCards").innerHTML = card("Inscritos", Number(d.inscritos || 0), "em " + Number(d.dias) + " dias") + card("Confirmaram", Number(d.confirmados || 0), WI.taxa(d.confirmados, d.inscritos) + " dos inscritos")
      + card("Aguardando confirmar", Number(d.aguardando || 0)) + card("Expiraram sem confirmar", Number(d.expiradas || 0)) + card("Compraram depois", Number(d.compraram || 0), "na loja, depois de confirmar");
    const tabela = function (linhas, col) { return linhas.length ? linhas.map(function (x) { return "<tr><td>" + esc(col(x)) + "</td><td>" + Number(x.inscritos) + "</td><td>" + Number(x.confirmados) + "</td><td>" + esc(WI.taxa(x.confirmados, x.inscritos)) + "</td></tr>"; }).join("") : '<tr><td colspan="4" class="vazio">Sem inscrições no período.</td></tr>'; };
    $("inROrigens").innerHTML = tabela(d.por_origem || [], function (x) { return WI.rotuloOrigem(x.origem); });
    $("inRDiasLista").innerHTML = tabela((d.por_dia || []).slice().reverse(), function (x) { return String(x.dia).split("-").reverse().join("/"); });
    $("inLNumero").value = st.config.limite_numero_dia; $("inLIp").value = st.config.limite_ip_hora; $("inLGlobal").value = st.config.limite_global_hora;
  }
  ["inRPagina", "inRDias"].forEach(function (id) { $(id).addEventListener("change", tentar(telaRelatorio)); });
  $("inLSalvar").addEventListener("click", tentar(async function () {
    const r = await rpc("crm_inscricao_config_salvar", { p: { limite_numero_dia: $("inLNumero").value, limite_ip_hora: $("inLIp").value, limite_global_hora: $("inLGlobal").value } });
    if (!r || !r.ok) return aviso((r && r.erro) || "Não consegui salvar os limites.", true);
    aviso("Limites salvos."); await carregarBase();
  }, "Não consegui salvar os limites."));

  window.WaInscricaoTela = { abrir: abrir };
})();
