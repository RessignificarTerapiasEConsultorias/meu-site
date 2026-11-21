/* Página pública de inscrição (Fase 9). Só lê a configuração da página e envia a inscrição.
   Não guarda nada no aparelho, não usa rastreador de terceiros e nunca recebe dados de outra pessoa.
   Todo texto vindo do servidor entra como texto (nunca como HTML). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  var slug = (params.get("p") || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  var origem = (params.get("origem") || "").slice(0, 120);
  var pagina = null, inicio = Date.now(), enviando = false;
  var ERROS_EMAIL = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.con": "hotmail.com", "outlok.com": "outlook.com", "yaho.com": "yahoo.com", "iclod.com": "icloud.com" };

  function mostrar(qual) { ["carregando", "aviso", "form", "sucesso"].forEach(function (id) { $(id).hidden = id !== qual; }); }
  function aviso(titulo, texto, tentar) {
    $("avisoTitulo").textContent = titulo; $("avisoTexto").textContent = texto; $("tentar").hidden = !tentar;
    mostrar("aviso"); $("avisoTitulo").focus();
  }
  function erro(texto, campo) {
    $("erro").textContent = texto; $("erro").hidden = !texto;
    ["nome", "telefone", "email"].forEach(function (id) { $(id).removeAttribute("aria-invalid"); });
    if (campo && $(campo)) { $(campo).setAttribute("aria-invalid", "true"); $(campo).focus(); }
  }
  function digitos(t) { return String(t || "").replace(/\D/g, ""); }
  function mascara(t) {
    var d = digitos(t).replace(/^0+/, "");
    if (d.length > 11 && d.indexOf("55") === 0) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  function celularValido(t) {
    var d = digitos(t).replace(/^0+/, "");
    if (d.length === 10 || d.length === 11) d = "55" + d;
    return /^55[1-9][1-9](9\d{8}|[6-9]\d{7})$/.test(d);
  }
  function emailValido(e) { var v = String(e || "").trim().toLowerCase(); return v.length <= 254 && !/\.\./.test(v) && /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(v); }

  function carregar() {
    mostrar("carregando");
    if (!slug) return aviso("Link incompleto", "Este link de inscrição está incompleto. Peça o link de novo a quem enviou para você.", false);
    fetch(SUPABASE_URL + "/rest/v1/rpc/crm_inscricao_pagina_publica", {
      method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_slug: slug })
    }).then(function (r) { if (!r.ok) throw new Error("rede"); return r.json(); }).then(function (p) {
      if (!p || p.situacao === "inexistente") return aviso("Página não encontrada", "Esta página de inscrição não existe ou saiu do ar. Confira o link com quem enviou para você.", false);
      if (p.situacao === "pausada") return aviso(p.titulo || "Inscrições pausadas", "As inscrições desta página estão pausadas no momento. Volte mais tarde.", false);
      pagina = p;
      document.title = (p.titulo || "Inscrição") + " · Ressignificar";
      $("titulo").textContent = p.titulo || "";
      $("texto").textContent = p.texto || ""; $("texto").hidden = !p.texto;
      if (p.imagem_url && /^https:\/\//i.test(p.imagem_url)) { $("imagem").src = p.imagem_url; $("imagem").hidden = false; }
      $("campoEmail").hidden = p.campo_email === "nao";
      $("rotEmail").textContent = p.campo_email === "obrigatorio" ? "Seu e-mail" : "Seu e-mail (opcional)";
      $("aceiteTexto").textContent = p.aceite_texto || "";
      $("aceite").checked = false;
      mostrar("form"); inicio = Date.now();
    }).catch(function () { aviso("Sem conexão", "Não conseguimos carregar a página. Confira a internet e tente de novo.", true); });
  }
  $("tentar").addEventListener("click", carregar);
  $("telefone").addEventListener("input", function () { var m = mascara(this.value); if (m !== this.value) this.value = m; });
  $("email").addEventListener("blur", function () {
    var v = this.value.trim().toLowerCase(), i = v.lastIndexOf("@"), certo = i > 0 ? ERROS_EMAIL[v.slice(i + 1)] : null;
    $("dicaEmail").textContent = certo ? "Você quis dizer " + v.slice(0, i + 1) + certo + "? Confira antes de enviar." : "";
  });

  $("form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (enviando || !pagina) return;
    var nome = $("nome").value.replace(/\s+/g, " ").trim(), tel = $("telefone").value, email = $("email").value.trim();
    if (nome.length < 2) return erro("Escreva o seu nome.", "nome");
    if (!celularValido(tel)) return erro("Digite um celular brasileiro com DDD. Exemplo: (81) 99999-0000.", "telefone");
    if (pagina.campo_email === "obrigatorio" && !email) return erro("Escreva o seu e-mail.", "email");
    if (pagina.campo_email !== "nao" && email && !emailValido(email)) return erro("Confira o e-mail: parece faltar alguma coisa.", "email");
    if (!$("aceite").checked) { erro("Marque a caixa de autorização para se inscrever."); $("aceite").focus(); return; }
    erro("");
    enviando = true; $("enviar").disabled = true; $("enviar").textContent = "Enviando…";
    var pronto = function () { enviando = false; $("enviar").disabled = false; $("enviar").textContent = "Quero me inscrever"; };
    fetch(SUPABASE_URL + "/functions/v1/crm-inscrever", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagina: slug, nome: nome, telefone: tel, email: pagina.campo_email === "nao" ? "" : email, aceite: $("aceite").checked === true, versao: pagina.aceite_versao, origem: origem, site: $("site").value, ms: Date.now() - inicio })
    }).then(function (r) { return r.json(); }).then(function (j) {
      pronto();
      if (!j || j.ok !== true) {
        if (j && j.codigo === "pausada") return aviso("Inscrições pausadas", "As inscrições desta página estão pausadas no momento. Volte mais tarde.", false);
        return erro((j && j.erro) || "Não conseguimos registrar agora. Seus dados continuam na tela: tente de novo.", j && { nome: "nome", telefone: "telefone", email: "email" }[j.codigo]);
      }
      $("sucessoTexto").textContent = j.mensagem || "Recebemos a sua inscrição.";
      var link = String(j.confirmar || ""), num = (/^https:\/\/wa\.me\/(\d{10,15})\?/.exec(link) || [])[1] || "";
      if (num) { $("confirmar").href = link; } else { $("confirmar").hidden = true; }
      $("numero").textContent = num ? "+" + num.slice(0, 2) + " " + num.slice(2, 4) + " " + num.slice(4) : "nosso WhatsApp";
      $("frase").textContent = j.frase || "";
      mostrar("sucesso"); $("sucessoTitulo").focus();
    }).catch(function () { pronto(); erro("Sem conexão. Seus dados continuam na tela: confira a internet e toque em enviar de novo."); });
  });
  carregar();
})();
