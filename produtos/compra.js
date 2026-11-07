/* Caixa de compra das páginas de produto.
   - Quem já está logada (mesma aba da Área de Membros) só confirma.
   - "Já sou cliente": entra com e-mail e senha e o produto vai para a conta dela.
   - "Sou nova": cria o acesso; se os dados já forem de uma cliente, avisa "você já é cliente". */
(function () {
  var FUNCAO = SUPABASE_URL + "/functions/v1/loja";
  var ZAP = "5581992531561";
  var caixa = document.getElementById("comprar");
  var PRODUTO = caixa.getAttribute("data-produto"), NOME = caixa.getAttribute("data-nome"), PRECO = caixa.getAttribute("data-preco");
  var SO_CLIENTE = caixa.getAttribute("data-so-cliente") === "1";   /* produto só para quem já tem conta */
  /* link pessoal de oferta (?oferta=...): mostra o preço especial da pessoa antes mesmo de ela entrar */
  var OFERTA = (new URLSearchParams(location.search).get("oferta") || "").replace(/[^0-9a-f-]/gi, "").slice(0, 36);
  try { if (OFERTA) sessionStorage.setItem("oferta_" + PRODUTO, OFERTA); else OFERTA = sessionStorage.getItem("oferta_" + PRODUTO) || ""; } catch (e) {}
  var $ = function (id) { return document.getElementById(id); };
  var modo = "nova", sessao = null, eu = null;
  var aviso = $("cAviso"), botao = $("cBotao");
  var rotuloBotao = "Assinar agora · " + PRECO;

  function chamar(corpo, token) {
    var cab = { "Content-Type": "application/json" };
    if (token) cab.Authorization = "Bearer " + token;
    return fetch(FUNCAO, { method: "POST", headers: cab, body: JSON.stringify(corpo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.__s = r.status; return j; }); });
  }
  function avisar(msg, ok) { aviso.textContent = msg || ""; aviso.classList.toggle("on", !!msg); aviso.classList.toggle("ok", !!ok); }
  function ocupado(sim, txt) { botao.disabled = sim; botao.textContent = sim ? (txt || "Aguarde…") : rotuloBotao; }
  function mostrarAbas() { $("cAbas").hidden = SO_CLIENTE; }
  /* preço desta pessoa: se houver condição especial, mostra na caixa e no botão */
  function precoDaPessoa(token) {
    chamar({ acao: "preco", produto: PRODUTO, oferta: token ? "" : OFERTA }, token).then(function (j) {
      if (!j || !j.ok) return;
      if (j.precisa_travas) avisar("Esta conta ainda não tem o Teste de Travas. Entre com a conta do seu teste ou fale com o Mauricio pelo WhatsApp.");
      if (!j.especial) return;
      var txt = (j.preco_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + (j.anual ? "/ano" : "/mês");
      rotuloBotao = "Assinar agora · " + txt; if (!botao.disabled) botao.textContent = rotuloBotao;
      var r = document.querySelector("#comprar .resumo-compra span"); if (r) r.innerHTML = "<s>" + r.textContent + "</s> " + txt;
      var e = $("cEspecial"); if (e) { e.textContent = "Condição especial para você: " + txt + "."; e.hidden = false; }
      /* troca o preço normal pelo especial nos outros lugares da página (topo, oferta e barra do celular) */
      var normal = (PRECO.match(/R\$\s?([\d.]+)(,\d{2})?/) || [])[1], valor = txt.replace(/\/(ano|mês)$/, "");
      if (normal) {
        var re = new RegExp("R\\$\\s?" + normal.replace(".", "\\.") + "(,00)?(?!\\d)", "g");
        document.querySelectorAll(".cta-linha small, #barra .btn, .preco-grande, .ancora .nossa").forEach(function (el) { el.innerHTML = el.innerHTML.replace(re, valor); });
        var pd = document.querySelector(".por-dia"); if (pd) pd.textContent = "Condição especial para você";
      }
      /* veio pelo link pessoal e ainda não entrou: abre "Já sou cliente" com o e-mail dela */
      if (!token && j.email && !sessao) {
        trocarModo("cliente"); $("cEmailCli").value = j.email;
        if (e) e.textContent = "Condição especial para você: " + txt + ". Entre com a sua senha para garantir.";
      }
    }).catch(function () {});
  }
  function trocarModo(m) {
    modo = m;
    document.querySelectorAll("#cAbas button").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-modo") === m)); });
    document.querySelectorAll("[data-so]").forEach(function (el) { el.hidden = el.getAttribute("data-so") !== m; });
    avisar("");
  }
  function mostrarJaCliente(j, emailDigitado) {
    $("cJaTxt").textContent = (j.por === "whatsapp" ? "Este WhatsApp já está na sua conta da Ressignificar" : "Este e-mail já está cadastrado na Ressignificar") +
      ". Entre com o seu e-mail (" + j.email_mascarado + ") e a sua senha: o produto entra direto na sua conta, sem criar outra.";
    $("cJaCliente").classList.add("on");
    $("cIrLogin").onclick = function () {
      $("cJaCliente").classList.remove("on"); trocarModo("cliente");
      if (j.por === "email" && emailDigitado) $("cEmailCli").value = emailDigitado;
      ($("cEmailCli").value ? $("cSenhaCli") : $("cEmailCli")).focus();
    };
    $("cJaCliente").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function irParaPagamento(j) {
    try { localStorage.setItem("loja_pedido_" + PRODUTO, j.token); } catch (e) {}
    ocupado(true, "Abrindo o pagamento…");
    location.href = j.url;
  }
  function tratar(j) {
    if (j.ja_cliente) { ocupado(false); mostrarJaCliente(j, $("cEmail").value.trim().toLowerCase()); return false; }
    if (j.ja_tem) {
      ocupado(false);
      $("cJaTem").hidden = false; $("cJaTemLink").href = j.destino; $("cForm").hidden = true; $("cAbas").hidden = true;
      return false;
    }
    if (!j.ok || !j.url) { ocupado(false); avisar(j.erro || "Não foi possível abrir o pagamento. Tente de novo."); return false; }
    return true;
  }

  /* checa e-mail e WhatsApp enquanto ela preenche o cadastro novo */
  var ultimaChecagem = "";
  function checar() {
    if (modo !== "nova" || sessao) return;
    var email = $("cEmail").value.trim().toLowerCase(), zap = $("cZap").value.trim();
    var chave = email + "|" + zap.replace(/\D/g, "");
    if (chave === ultimaChecagem || (!/@.+\./.test(email) && zap.replace(/\D/g, "").length < 10)) return;
    ultimaChecagem = chave;
    chamar({ acao: "checar", email: email, whatsapp: zap }).then(function (j) {
      if (j && j.cliente) mostrarJaCliente(j, email); else $("cJaCliente").classList.remove("on");
    }).catch(function () {});
  }
  $("cEmail").addEventListener("blur", checar);
  $("cZap").addEventListener("blur", checar);
  $("cZap").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 11);
    this.value = d.length > 6 ? "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4) : d.length > 2 ? "(" + d.slice(0, 2) + ") " + d.slice(2) : d;
  });
  document.querySelectorAll("#cAbas button").forEach(function (b) { b.addEventListener("click", function () { trocarModo(b.getAttribute("data-modo")); }); });
  $("cEsqueci").href = "https://wa.me/" + ZAP + "?text=" + encodeURIComponent("Olá, Mauricio! Esqueci a senha da Área de Membros e quero assinar " + NOME + ".");

  /* visita da página (conta uma vez por dia por aparelho; com a conta, identifica quem entrou) */
  function registrarVisita() {
    try {
      var v = localStorage.getItem("rs_visitante");
      if (!v) { v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem("rs_visitante", v); }
      var origem = (new URLSearchParams(location.search).get("de") || "").slice(0, 40);
      supa().rpc("produto_visita", { p_chave: PRODUTO, p_visitante: v, p_origem: origem || null }).then(function () {}, function () {});
    } catch (e) {}
  }
  /* já logada nesta aba? */
  supa().auth.getSession().then(function (r) {
    sessao = r && r.data && r.data.session;
    registrarVisita();
    if (!sessao) { if (OFERTA) precoDaPessoa(null); return; }
    return supa().from("perfis").select("nome,email,ativo").eq("id", sessao.user.id).maybeSingle().then(function (rp) {
      eu = rp.data; if (!eu || !eu.ativo) { sessao = null; return; }
      $("cLogNome").textContent = eu.nome.split(" ")[0];
      $("cLogEmail").textContent = eu.email;
      $("cLogIni").textContent = eu.nome.trim().charAt(0).toUpperCase();
      $("cLogada").hidden = false; $("cAbas").hidden = true; $("cJaCliente").classList.remove("on");
      document.querySelectorAll("[data-so]").forEach(function (el) { el.hidden = true; });
      precoDaPessoa(sessao.access_token);
    });
  }).catch(function () {});
  $("cSair").addEventListener("click", function (ev) {
    ev.preventDefault();
    supa().auth.signOut().then(function () { sessao = null; $("cLogada").hidden = true; mostrarAbas(); trocarModo("cliente"); });
  });

  $("cForm").addEventListener("submit", function (ev) {
    ev.preventDefault(); avisar("");
    if (sessao) {
      ocupado(true, "Preparando o pagamento…");
      chamar({ acao: "iniciar", produto: PRODUTO, modo: "cliente", negocio: $("cNegocioCli") ? $("cNegocioCli").value : "" }, sessao.access_token)
        .then(function (j) { if (j.relogar) { sessao = null; $("cLogada").hidden = true; mostrarAbas(); trocarModo("cliente"); ocupado(false); avisar(j.erro); return; } if (tratar(j)) irParaPagamento(j); })
        .catch(function () { ocupado(false); avisar("Sem conexão. Confira a internet e tente de novo."); });
      return;
    }
    if (modo === "cliente") {
      var email = $("cEmailCli").value.trim().toLowerCase(), senha = $("cSenhaCli").value;
      if (!/@.+\./.test(email)) { avisar("Escreva o e-mail da sua conta."); $("cEmailCli").focus(); return; }
      if (!senha) { avisar("Escreva a sua senha."); $("cSenhaCli").focus(); return; }
      ocupado(true, "Entrando…");
      supa().auth.signInWithPassword({ email: email, password: senha }).then(function (r) {
        if (r.error || !r.data || !r.data.session) { ocupado(false); avisar(/Invalid login/i.test((r.error || {}).message || "") ? "E-mail ou senha incorretos." : "Não foi possível entrar agora. Tente de novo."); return; }
        sessao = r.data.session; registrarVisita(); ocupado(true, "Preparando o pagamento…");
        return chamar({ acao: "iniciar", produto: PRODUTO, modo: "cliente", negocio: $("cNegocioCli") ? $("cNegocioCli").value : "" }, sessao.access_token).then(function (j) { if (tratar(j)) irParaPagamento(j); });
      }).catch(function () { ocupado(false); avisar("Sem conexão. Confira a internet e tente de novo."); });
      return;
    }
    var corpo = { acao: "iniciar", produto: PRODUTO, modo: "nova", nome: $("cNome").value, email: $("cEmail").value.trim().toLowerCase(), whatsapp: $("cZap").value, senha: $("cSenha").value, negocio: $("cNegocio") ? $("cNegocio").value : "" };
    if (corpo.nome.trim().split(/\s+/).length < 2) { avisar("Escreva o seu nome e sobrenome."); $("cNome").focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(corpo.email)) { avisar("Confira o seu e-mail."); $("cEmail").focus(); return; }
    if (corpo.whatsapp.replace(/\D/g, "").length < 10) { avisar("Escreva o seu WhatsApp com DDD."); $("cZap").focus(); return; }
    if (corpo.senha.length < 8) { avisar("Crie uma senha com pelo menos 8 caracteres."); $("cSenha").focus(); return; }
    ocupado(true, "Criando o seu acesso…");
    chamar(corpo).then(function (j) {
      if (!tratar(j)) return;
      ocupado(true, "Abrindo o pagamento…");
      /* já deixa a pessoa logada nesta aba: quando voltar do pagamento, cai direto na conta dela */
      return supa().auth.signInWithPassword({ email: corpo.email, password: corpo.senha }).catch(function () {}).then(function () { irParaPagamento(j); });
    }).catch(function () { ocupado(false); avisar("Sem conexão. Confira a internet e tente de novo."); });
  });

  trocarModo(SO_CLIENTE || /[?&]cliente=1/.test(location.search) ? "cliente" : "nova");
  mostrarAbas();
  ocupado(false);

  /* barra fixa no celular: aparece depois do topo e some quando a caixa de compra está na tela */
  var barra = document.getElementById("barra");
  if (barra && "IntersectionObserver" in window) {
    var heroFora = false, caixaVisivel = false;
    var atualizar = function () { barra.classList.toggle("on", heroFora && !caixaVisivel); };
    new IntersectionObserver(function (e) { heroFora = !e[0].isIntersecting; atualizar(); }).observe(document.querySelector(".hero"));
    new IntersectionObserver(function (e) { caixaVisivel = e[0].isIntersecting; atualizar(); }).observe(caixa);
  }
  document.addEventListener("click", function (ev) {
    var w = ev.target.closest && ev.target.closest("[data-wa]"); if (!w) return;
    ev.preventDefault(); window.open("https://wa.me/" + ZAP + "?text=" + encodeURIComponent(w.getAttribute("data-wa")), "_blank", "noopener");
  });
})();
