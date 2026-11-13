/* Contratos: documentos em PDF com assinatura dentro do sistema. */
(async function () {
  const eu = await protegerPagina(["master", "suporte", "cliente"]);
  if (!eu) return;
  const gestor = eu.papel !== "cliente";
  document.getElementById("voltar").href = PAINEL_DO_PAPEL[eu.papel];
  if (eu.papel !== "master") document.querySelectorAll(".so-master").forEach(function (el) { el.remove(); });
  if (eu.papel === "suporte") document.getElementById("abaNovo").hidden = true;

  const TIPO_LABEL = { consultor_cliente: "Consultor ↔ Cliente", cliente_prestador: "Cliente ↔ Prestador" };
  let documentos = [], partes = [], perfisTodos = [], minhasEmpresas = [], filtro = "todos";
  let docSelecionadoAssinatura = null;

  function nomeDe(pid) { const p = perfisTodos.find(function (x) { return x.id === pid; }); return p ? p.nome : "?"; }

  async function carregar() {
    const [rd, rp, rf, re] = await Promise.all([
      supa().from("contratos_documentos").select("*").eq("cancelado", false).order("criado_em", { ascending: false }),
      supa().from("contratos_partes").select("*"),
      supa().from("perfis").select("id,nome,papel,ativo").order("nome"),
      supa().from("empresas").select("id,nome,tipo,empresa_membros(perfil_id,funcao)").eq("tipo", "empresa").order("nome")
    ]);
    documentos = rd.data || []; partes = rp.data || []; perfisTodos = rf.data || [];
    minhasEmpresas = (re.data || []).filter(function (e) { return (e.empresa_membros || []).some(function (m) { return m.perfil_id === eu.id && m.funcao === "dono"; }); });
  }

  function statusDe(doc) {
    const ps = partes.filter(function (p) { return p.documento_id === doc.id; });
    if (!ps.length) return "pendente";
    const todasAssinadas = ps.every(function (p) { return p.assinado_em; });
    const algumaAssinada = ps.some(function (p) { return p.assinado_em; });
    return todasAssinadas ? "assinado" : (algumaAssinada ? "parcial" : "pendente");
  }
  const STATUS_LABEL = { assinado: "Assinado por todos", parcial: "Parcialmente assinado", pendente: "Aguardando assinatura" };
  const STATUS_CLS = { assinado: "ok", parcial: "", pendente: "off" };

  function cartaoDocumento(doc) {
    const ps = partes.filter(function (p) { return p.documento_id === doc.id; });
    const status = statusDe(doc);
    const minhaParte = ps.find(function (p) { return p.perfil_id === eu.id; });
    return '<div class="sessao"><div class="sessao-topo"><b>' + esc(doc.titulo) + '</b>' +
      '<span class="selo ' + STATUS_CLS[status] + '">' + STATUS_LABEL[status] + '</span></div>' +
      '<span class="acao-info">' + TIPO_LABEL[doc.tipo_relacao] + (doc.servico ? " · " + ROTULO_SERVICO[doc.servico] : "") + " · criado em " + dataBR(doc.criado_em.slice(0, 10)) + '</span>' +
      (doc.descricao ? "<p>" + esc(doc.descricao) + "</p>" : "") +
      '<div class="tabela-wrap" style="margin-top:8px"><table class="t"><thead><tr><th>Parte</th><th>Papel</th><th>Situação</th></tr></thead><tbody>' +
      ps.map(function (p) {
        return "<tr><td>" + esc(nomeDe(p.perfil_id)) + (p.perfil_id === eu.id ? " <i>(você)</i>" : "") + "</td><td>" + esc(p.papel_label) + "</td><td>" +
          (p.assinado_em ? '<span class="selo ok">Assinado em ' + dataHoraBR(p.assinado_em) + " · " + esc(p.nome_digitado || "") + "</span>" + (p.assinatura_png && /^data:image\/png;base64,/.test(p.assinatura_png) ? '<img class="ass-img" src="' + p.assinatura_png + '" alt="Assinatura de ' + esc(p.nome_digitado || "") + '">' : "") : '<span class="selo off">Pendente</span>') +
          "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="acoes" style="margin-top:8px">' +
      (doc.arquivo_path ? '<button class="btn peq contorno" type="button" data-baixar="' + doc.id + '">Ver documento (PDF)</button>' : '<span class="acao-info">Arquivo ainda não enviado</span>') +
      (minhaParte && !minhaParte.assinado_em ? '<button class="btn peq" type="button" data-assinar="' + doc.id + '">Assinar</button>' : "") +
      (ps.some(function (p) { return p.assinado_em; }) ? '<button class="btn peq contorno" type="button" data-comprovante="' + doc.id + '">Comprovante de assinaturas</button>' : "") +
      (gestor && doc.criado_por === eu.id ? '<button class="btn peq perigo" type="button" data-cancelar="' + doc.id + '">Cancelar contrato</button>' : "") +
      "</div></div>";
  }

  function desenharLista() {
    document.querySelectorAll("#filtroStatus [data-f]").forEach(function (b) { b.style.borderColor = b.dataset.f === filtro ? "#C9A24A" : ""; b.style.background = b.dataset.f === filtro ? "#FBF3DF" : ""; });
    const lista = documentos.filter(function (d) { return filtro === "todos" || statusDe(d) === filtro || (filtro === "pendente" && statusDe(d) === "parcial"); });
    document.getElementById("listaContratos").innerHTML = lista.length ? lista.map(cartaoDocumento).join("") : '<div class="cartao"><p class="vazio">Nenhum contrato encontrado.</p></div>';
  }
  document.getElementById("filtroStatus").addEventListener("click", function (e) { const b = e.target.closest("[data-f]"); if (b) { filtro = b.dataset.f; desenharLista(); } });

  document.getElementById("listaContratos").addEventListener("click", async function (e) {
    const bd = e.target.closest("[data-baixar]"), ba = e.target.closest("[data-assinar]"), bc = e.target.closest("[data-cancelar]"), bp = e.target.closest("[data-comprovante]");
    if (bd) abrirDocumento(documentos.find(function (x) { return x.id === bd.dataset.baixar; }));
    if (bp) comprovante(documentos.find(function (x) { return x.id === bp.dataset.comprovante; }));
    if (ba) {
      docSelecionadoAssinatura = documentos.find(function (x) { return x.id === ba.dataset.assinar; });
      document.getElementById("assinarContexto").textContent = "Você está assinando: " + docSelecionadoAssinatura.titulo;
      document.getElementById("nomeAssinatura").value = eu.nome || "";
      document.getElementById("confirmoLeitura").checked = false;
      document.getElementById("btVerDocAssinar").hidden = !docSelecionadoAssinatura.arquivo_path;
      document.getElementById("janelaAssinar").showModal();
      pad.ligar(); atualizarNomeAss();
    }
    if (bc) {
      if (!confirm("Cancelar este contrato? Ele deixa de aparecer para as partes envolvidas.")) return;
      const { error } = await supa().from("contratos_documentos").update({ cancelado: true }).eq("id", bc.dataset.cancelar);
      if (error) { aviso("Não foi possível cancelar.", true); return; }
      aviso("Contrato cancelado."); await carregar(); desenharLista();
    }
  });

  /* ===== ASSINATURA DESENHADA: dedo no celular, mouse no computador (Pointer Events) ===== */
  const pad = (function () {
    const area = document.getElementById("assArea"), tela = document.getElementById("assTela");
    let ctx = null, desenhando = false, ultimo = null, tracos = 0, comprimento = 0;
    function preparar() {
      const r = area.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
      tela.width = Math.round(r.width * dpr); tela.height = Math.round(r.height * dpr);
      ctx = tela.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0B1F3A"; ctx.lineWidth = 2.6;
      tracos = 0; comprimento = 0; area.classList.remove("tem");
    }
    function ponto(e) { const r = tela.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    tela.addEventListener("pointerdown", function (e) {
      e.preventDefault(); desenhando = true; ultimo = ponto(e); tracos++;
      try { tela.setPointerCapture(e.pointerId); } catch (x) {}
      ctx.beginPath(); ctx.arc(ultimo.x, ultimo.y, 1.2, 0, Math.PI * 2); ctx.fillStyle = "#0B1F3A"; ctx.fill();
      area.classList.add("tem");
    });
    tela.addEventListener("pointermove", function (e) {
      if (!desenhando) return; e.preventDefault();
      const lista = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      lista.forEach(function (ev) {
        const p = ponto(ev);
        ctx.beginPath(); ctx.moveTo(ultimo.x, ultimo.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        comprimento += Math.hypot(p.x - ultimo.x, p.y - ultimo.y); ultimo = p;
      });
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { tela.addEventListener(t, function () { desenhando = false; }); });
    document.getElementById("btLimparAssinatura").addEventListener("click", preparar);
    return {
      ligar: function () { requestAnimationFrame(preparar); },
      valida: function () { return comprimento > 60; },
      png: function () {
        /* recorta a assinatura e põe em fundo branco (fica leve e legível no comprovante) */
        const w = tela.width, h = tela.height, dados = ctx.getImageData(0, 0, w, h).data;
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { if (dados[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
        const m = 12; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w, x1 + m); y1 = Math.min(h, y1 + m);
        const escala = Math.min(1, 900 / Math.max(1, x1 - x0));
        const c = document.createElement("canvas"); c.width = Math.max(1, Math.round((x1 - x0) * escala)); c.height = Math.max(1, Math.round((y1 - y0) * escala));
        const cc = c.getContext("2d"); cc.fillStyle = "#fff"; cc.fillRect(0, 0, c.width, c.height);
        cc.drawImage(tela, x0, y0, x1 - x0, y1 - y0, 0, 0, c.width, c.height);
        return c.toDataURL("image/png");
      }
    };
  })();
  function atualizarNomeAss() { document.getElementById("assNome").textContent = document.getElementById("nomeAssinatura").value.trim(); }
  document.getElementById("nomeAssinatura").addEventListener("input", atualizarNomeAss);
  window.addEventListener("resize", function () { if (document.getElementById("janelaAssinar").open && !pad.valida()) pad.ligar(); });
  document.getElementById("btVerDocAssinar").addEventListener("click", function () { abrirDocumento(docSelecionadoAssinatura); });

  async function abrirDocumento(doc) {
    if (!doc || !doc.arquivo_path) { aviso("O arquivo deste contrato ainda não foi enviado.", true); return; }
    const janela = window.open("", "_blank");
    const r = await supa().storage.from("contratos").createSignedUrl(doc.arquivo_path, 300);
    if (r.error || !r.data) { if (janela) janela.close(); aviso("Não foi possível abrir o documento.", true); return; }
    if (janela) janela.location.href = r.data.signedUrl; else window.location.href = r.data.signedUrl;
  }
  function dataHoraBR(iso) { const d = new Date(iso); return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }

  /* comprovante para imprimir ou salvar em PDF: quem assinou, quando e o desenho de cada assinatura */
  function comprovante(doc) {
    const ps = partes.filter(function (p) { return p.documento_id === doc.id; });
    const linhas = ps.map(function (p) {
      return '<div class="p"><div class="img">' + (p.assinatura_png && /^data:image\/png;base64,/.test(p.assinatura_png) ? '<img src="' + p.assinatura_png + '" alt="">' : "") + '</div><div class="ln"></div>' +
        "<b>" + esc(p.nome_digitado || nomeDe(p.perfil_id)) + "</b><span>" + esc(p.papel_label) + "</span><small>" +
        (p.assinado_em ? "Assinado eletronicamente em " + dataHoraBR(p.assinado_em) + (p.assinatura_aparelho ? " · pelo " + esc(String(p.assinatura_aparelho).split(" · ")[0]) : "") : "Assinatura pendente") + "</small></div>";
    }).join("");
    const w = window.open("", "_blank"); if (!w) { aviso("Permita a abertura de janelas para ver o comprovante.", true); return; }
    w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comprovante de assinaturas</title><style>' +
      'body{font:15px/1.5 Arial,sans-serif;color:#16203A;max-width:760px;margin:24px auto;padding:0 16px}h1{font-size:22px;margin:0 0 4px}.sub{color:#4C5670;margin:0 0 20px}' +
      '.ps{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:26px;margin-top:26px}.p{text-align:center}.img{height:110px;display:flex;align-items:flex-end;justify-content:center}.img img{max-height:110px;max-width:100%}' +
      '.ln{border-top:1.5px solid #16203A;margin:4px 0 6px}.p b,.p span,.p small{display:block}.p small{color:#4C5670;font-size:12.5px;margin-top:4px}.rod{margin-top:36px;font-size:12.5px;color:#4C5670}button{margin-top:20px;padding:10px 18px;border-radius:10px;border:0;background:#0B1F3A;color:#fff;font:600 15px Arial;cursor:pointer}@media print{button{display:none}}' +
      '</style></head><body><h1>Comprovante de assinaturas</h1><p class="sub"><b>' + esc(doc.titulo) + "</b><br>" + TIPO_LABEL[doc.tipo_relacao] + " · criado em " + dataBR(doc.criado_em.slice(0, 10)) +
      (doc.arquivo_nome ? "<br>Documento: " + esc(doc.arquivo_nome) : "") + '</p><div class="ps">' + linhas + '</div><p class="rod">Assinaturas eletrônicas registradas na Área de Membros Ressignificar Terapias &amp; Consultorias. A data e a hora de cada assinatura são as do servidor no momento em que ela foi feita.</p><button onclick="print()">Imprimir ou salvar em PDF</button></body></html>');
    w.document.close();
  }

  document.getElementById("btCancelarAssinatura").addEventListener("click", function () { document.getElementById("janelaAssinar").close(); });
  document.getElementById("btConfirmarAssinatura").addEventListener("click", async function () {
    const nome = document.getElementById("nomeAssinatura").value.trim();
    if (nome.length < 4) { aviso("Digite seu nome completo.", true); return; }
    if (!pad.valida()) { aviso("Desenhe a sua assinatura no quadro, com o dedo ou com o mouse.", true); return; }
    if (!document.getElementById("confirmoLeitura").checked) { aviso("Confirme que leu o documento antes de assinar.", true); return; }
    const b = this; b.disabled = true; b.textContent = "Assinando…";
    const aparelho = (matchMedia("(hover: none)").matches ? "celular/tablet" : "computador") + " · " + (navigator.userAgent || "").slice(0, 160);
    const { error } = await supa().from("contratos_partes").update({ nome_digitado: nome, assinado_em: new Date().toISOString(), assinatura_png: pad.png(), assinatura_aparelho: aparelho })
      .eq("documento_id", docSelecionadoAssinatura.id).eq("perfil_id", eu.id);
    b.disabled = false; b.textContent = "Assinar agora";
    if (error) { aviso("Não foi possível assinar. Tente novamente.", true); return; }
    document.getElementById("janelaAssinar").close();
    aviso("Assinado com sucesso!");
    await carregar(); desenharLista();
  });

  /* ===== NOVO CONTRATO ===== */
  const selCliente = document.getElementById("cCliente"), selEmpresa = document.getElementById("cEmpresa"), selPrestador = document.getElementById("cPrestadorSel");
  function preencherSelects() {
    selCliente.innerHTML = perfisTodos.filter(function (p) { return p.papel === "cliente" && p.ativo; }).map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + "</option>"; }).join("");
    selEmpresa.innerHTML = minhasEmpresas.map(function (e) { return '<option value="' + e.id + '">' + esc(e.nome) + "</option>"; }).join("") || '<option value="">Você não é dono de nenhuma empresa</option>';
    selPrestador.innerHTML = perfisTodos.filter(function (p) { return p.id !== eu.id && p.ativo && (p.papel === "cliente" || p.papel === "master"); }).map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + (p.papel === "master" ? " (consultor)" : "") + "</option>"; }).join("");
  }
  const campoTipo = document.getElementById("cTipo");
  if (campoTipo) {
    campoTipo.addEventListener("change", function () {
      document.getElementById("blocoConsultorCliente").hidden = this.value !== "consultor_cliente";
      document.getElementById("blocoClientePrestador").hidden = this.value !== "cliente_prestador";
    });
  } else {
    // cliente: só pode criar cliente_prestador
    document.getElementById("blocoConsultorCliente").hidden = true;
    document.getElementById("blocoClientePrestador").hidden = false;
  }

  document.getElementById("formContrato").addEventListener("submit", async function (e) {
    e.preventDefault();
    const arquivo = document.getElementById("cArquivo").files[0];
    const titulo = document.getElementById("cTitulo").value.trim();
    if (!arquivo) { aviso("Selecione o arquivo PDF do contrato.", true); return; }
    if (arquivo.type !== "application/pdf") { aviso("O arquivo precisa ser um PDF.", true); return; }
    if (arquivo.size > 15 * 1024 * 1024) { aviso("O arquivo precisa ter até 15 MB.", true); return; }
    if (titulo.length < 4) { aviso("Escreva o título do contrato.", true); return; }

    const tipo = campoTipo ? campoTipo.value : "cliente_prestador";
    let reg = { tipo_relacao: tipo, titulo: titulo, descricao: document.getElementById("cDesc").value.trim() || null, criado_por: eu.id };
    let partesNovas = [];
    if (tipo === "consultor_cliente") {
      const clienteId = selCliente.value;
      if (!clienteId) { aviso("Escolha o cliente.", true); return; }
      reg.servico = document.getElementById("cServico").value || null;
      partesNovas = [{ perfil_id: eu.id, papel_label: "Consultor" }, { perfil_id: clienteId, papel_label: "Cliente" }];
    } else {
      const empresaId = selEmpresa.value, prestadorId = selPrestador.value;
      if (!empresaId) { aviso("Escolha a empresa.", true); return; }
      if (!prestadorId) { aviso("Escolha o prestador.", true); return; }
      reg.empresa_id = empresaId;
      partesNovas = [{ perfil_id: eu.id, papel_label: "Cliente contratante" }, { perfil_id: prestadorId, papel_label: "Prestador" }];
    }

    const b = document.getElementById("cSalvar"); b.disabled = true;
    const rDoc = await supa().from("contratos_documentos").insert(reg).select().single();
    if (rDoc.error) { b.disabled = false; aviso("Não foi possível criar o contrato.", true); return; }
    const docId = rDoc.data.id;

    const rPartes = await supa().from("contratos_partes").insert(partesNovas.map(function (p) { return Object.assign({ documento_id: docId }, p); }));
    if (rPartes.error) { b.disabled = false; aviso("Contrato criado, mas não foi possível registrar as partes.", true); return; }

    const caminho = docId + "/" + arquivo.name.replace(/[^\w.\-]/g, "_");
    const rUp = await supa().storage.from("contratos").upload(caminho, arquivo, { contentType: "application/pdf" });
    b.disabled = false;
    if (rUp.error) { aviso("Contrato criado, mas o arquivo não foi enviado. Tente enviar de novo.", true); return; }
    await supa().from("contratos_documentos").update({ arquivo_path: caminho, arquivo_nome: arquivo.name }).eq("id", docId);

    aviso("Contrato criado e enviado para assinatura!");
    document.getElementById("formContrato").reset();
    document.querySelector('[data-aba="meus"]').click();
    await carregar(); desenharLista();
  });

  function esc(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  ligarAbas(document.getElementById("abas"));
  await carregar();
  preencherSelects();
  desenharLista();
})();
