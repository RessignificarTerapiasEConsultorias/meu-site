/* Avisos no celular (etapa 3): liga, desliga e escolhe quando este aparelho recebe aviso do CRM.
   A escolha é por aparelho. O servidor (função crm-push) é quem entrega; aqui só se pede a permissão e se guarda a assinatura. */
(function waTelaInicio() {
  "use strict";
  const P = window.WaPainel;
  if (!P) { document.addEventListener("wa-painel-pronto", waTelaInicio, { once: true }); return; }
  const $ = P.$, ler = P.ler, supa = P.supa, aviso = P.aviso, falha = P.falha;
  if (!$("avCartao")) return;
  const suporta = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  let reg = null, ass = null;

  function rpc(nome, args) { return ler(supa().rpc(nome, args || {})); }
  async function servidor(acao) {
    const r = await supa().functions.invoke("crm-push", { body: { acao: acao } });
    if (r.error) { let m = "Não consegui falar com o servidor. Tente de novo."; try { const j = await r.error.context.json(); if (j && j.erro) m = j.erro; } catch (e) { /* fica a mensagem padrão */ } throw new Error(m); }
    return r.data || {};
  }
  function deB64u(t) { const s = atob(String(t).replace(/-/g, "+").replace(/_/g, "/")); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function b64u(buf) { const b = new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function nomeAparelho() { const u = navigator.userAgent; return (/iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : "Aparelho") + (instalado ? " (aplicativo)" : " (navegador)"); }
  function modoEscolhido() { return $("avModoPediu").checked ? "pediu" : "todas"; }

  function mostrar(estado, modo) {
    const ligado = estado === "ligado";
    $("avSituacao").className = "selo " + (ligado ? "ok" : estado === "bloqueado" ? "off" : "");
    $("avSituacao").textContent = ligado ? "Ligados neste aparelho" : estado === "bloqueado" ? "Bloqueados neste aparelho" : "Desligados neste aparelho";
    $("avLigar").hidden = ligado || estado === "bloqueado" || estado === "instalar" || estado === "sem";
    $("avDesligar").hidden = !ligado; $("avTestar").hidden = !ligado;
    $("avAjuda").hidden = !(estado === "instalar" || estado === "bloqueado" || estado === "sem");
    $("avAjuda").textContent = estado === "instalar" ? "No iPhone, os avisos só funcionam com o CRM instalado. No Safari, toque em Compartilhar, depois em “Adicionar à Tela de Início”. Abra o CRM pelo ícone novo e volte aqui."
      : estado === "bloqueado" ? "Os avisos estão bloqueados nos ajustes deste aparelho. Libere as notificações do Ressignificar CRM nos ajustes do celular e volte aqui."
      : estado === "sem" ? "Este navegador não consegue receber avisos. No iPhone use o Safari; no Android, o Chrome." : "";
    if (modo) { $("avModoTodas").checked = modo !== "pediu"; $("avModoPediu").checked = modo === "pediu"; }
  }
  async function conferir() {
    if (!suporta) return mostrar(ios && !instalado ? "instalar" : "sem");
    if (Notification.permission === "denied") return mostrar("bloqueado");
    reg = await navigator.serviceWorker.register("crm-sw.js");
    ass = await reg.pushManager.getSubscription();
    if (!ass) return mostrar("desligado");
    const e = await rpc("crm_push_estado", { p_endpoint: ass.endpoint });
    if (e && e.ativo) mostrar("ligado", e.modo); else mostrar("desligado");
  }
  async function ligar() {
    if (!suporta) return mostrar(ios && !instalado ? "instalar" : "sem");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { mostrar(perm === "denied" ? "bloqueado" : "desligado"); return aviso("Sem a sua permissão o celular não avisa.", true); }
    reg = reg || await navigator.serviceWorker.register("crm-sw.js"); await navigator.serviceWorker.ready;
    const ch = await servidor("chave");
    ass = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: deB64u(ch.chave) });
    await rpc("crm_push_registrar", { p_endpoint: ass.endpoint, p_p256dh: b64u(ass.getKey("p256dh")), p_auth: b64u(ass.getKey("auth")), p_modo: modoEscolhido(), p_aparelho: nomeAparelho() });
    mostrar("ligado", modoEscolhido()); aviso("Avisos ligados neste aparelho.");
  }
  async function desligar() {
    if (ass) { await rpc("crm_push_remover", { p_endpoint: ass.endpoint }); try { await ass.unsubscribe(); } catch (e) { /* já estava cancelada */ } ass = null; }
    mostrar("desligado"); aviso("Avisos desligados neste aparelho.");
  }
  async function trocarModo() {
    if (!ass) return;
    await rpc("crm_push_modo", { p_endpoint: ass.endpoint, p_modo: modoEscolhido() });
    aviso(modoEscolhido() === "pediu" ? "Este aparelho avisa só quando alguém pedir atendimento." : "Este aparelho avisa a cada mensagem nova.");
  }
  async function testar() {
    const r = await servidor("teste");
    if (r.ok) aviso("Aviso de teste enviado. Ele chega em alguns segundos."); else aviso("O aviso de teste não saiu. Desligue e ligue os avisos de novo.", true);
  }
  function seguro(f, msg) { return function () { const b = this; if (b && "disabled" in b) b.disabled = true; Promise.resolve().then(f).catch(function (e) { falha(e, msg); }).then(function () { if (b && "disabled" in b) b.disabled = false; }); }; }
  $("avLigar").addEventListener("click", seguro(ligar, "Não consegui ligar os avisos."));
  $("avDesligar").addEventListener("click", seguro(desligar, "Não consegui desligar os avisos."));
  $("avTestar").addEventListener("click", seguro(testar, "Não consegui mandar o aviso de teste."));
  $("avModoTodas").addEventListener("change", seguro(trocarModo, "Não consegui salvar a escolha."));
  $("avModoPediu").addEventListener("change", seguro(trocarModo, "Não consegui salvar a escolha."));
  conferir().catch(function () { mostrar("desligado"); });

  /* tocar no aviso com o CRM já aberto: vai para a conversa. E quando o CRM abre pelo aviso (?cv=...) */
  function abrirDoEndereco(u) { try { const id = new URL(u, location.href).searchParams.get("cv"); if (id && /^[0-9a-f-]{36}$/.test(id) && P.abrirConversaDe) P.abrirConversaDe(id); } catch (e) { /* endereço estranho: ignora */ } }
  if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", function (ev) { if (ev.data && ev.data.crmAbrir) abrirDoEndereco(ev.data.crmAbrir); });
  if (/[?&]cv=/.test(location.search)) setTimeout(function () { abrirDoEndereco(location.href); }, 600);
})();
