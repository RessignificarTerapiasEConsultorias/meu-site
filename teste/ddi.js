/* DDI (código do país) nos campos de WhatsApp.
   - Todo <input type="tel"> ganha, ao lado, a lista de países. Brasil (+55) é o padrão e nada muda para quem é do Brasil.
   - Em outro país, o campo passa a devolver o número completo com "+" na frente (ex.: "+351 912345678"),
     para o resto do sistema saber que já traz o código do país e não somar o 55.
   - window.ddiAtivar(input)  liga o seletor em um campo (os campos type=tel são ligados sozinhos)
   - window.ddiDigitos(valor) devolve só os números com o código do país (55 + número, se for do Brasil)
   - window.ddiEstrangeiro(el) diz se o campo está com outro país escolhido
   Para um campo que não deve ter a lista: data-sem-ddi */
(function () {
  if (window.ddiAtivar) return;
  var PAISES = [
    ["55", "Brasil"], ["351", "Portugal"], ["1", "Estados Unidos / Canadá"], ["54", "Argentina"], ["595", "Paraguai"], ["598", "Uruguai"],
    ["56", "Chile"], ["57", "Colômbia"], ["51", "Peru"], ["591", "Bolívia"], ["593", "Equador"], ["58", "Venezuela"], ["52", "México"],
    ["507", "Panamá"], ["506", "Costa Rica"], ["1809", "República Dominicana"], ["594", "Guiana Francesa"], ["597", "Suriname"],
    ["34", "Espanha"], ["39", "Itália"], ["33", "França"], ["49", "Alemanha"], ["44", "Reino Unido"], ["353", "Irlanda"], ["41", "Suíça"],
    ["31", "Países Baixos"], ["32", "Bélgica"], ["352", "Luxemburgo"], ["43", "Áustria"], ["46", "Suécia"], ["47", "Noruega"], ["45", "Dinamarca"],
    ["244", "Angola"], ["258", "Moçambique"], ["238", "Cabo Verde"], ["245", "Guiné-Bissau"], ["239", "São Tomé e Príncipe"], ["670", "Timor-Leste"],
    ["81", "Japão"], ["86", "China"], ["61", "Austrália"], ["64", "Nova Zelândia"], ["971", "Emirados Árabes"], ["972", "Israel"], ["27", "África do Sul"]
  ];
  var ORDENADOS = PAISES.map(function (p) { return p[0]; }).sort(function (a, b) { return b.length - a.length; });
  var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  var cru = function (el) { return desc.get.call(el); };
  var setCru = function (el, v) { desc.set.call(el, v); };
  var soDig = function (s) { return String(s || "").replace(/\D/g, ""); };

  /* separa "+351 912345678" em código do país e número; sem "+" devolve null */
  function separar(texto) {
    var t = String(texto || "").trim();
    if (t.charAt(0) !== "+") return null;
    var d = soDig(t);
    for (var i = 0; i < ORDENADOS.length; i++) if (d.indexOf(ORDENADOS[i]) === 0 && d.length > ORDENADOS[i].length) return { ddi: ORDENADOS[i], num: d.slice(ORDENADOS[i].length) };
    return { ddi: d.slice(0, 2), num: d.slice(2), novo: true };
  }
  function opcao(sel, ddi, nome) {
    var o = document.createElement("option"); o.value = ddi; o.textContent = "+" + ddi + " " + nome; sel.appendChild(o); return o;
  }
  function escolher(el, ddi) {
    var sel = el.__ddiSel; if (!sel) return;
    if (!Array.prototype.some.call(sel.options, function (o) { return o.value === ddi; })) {
      var outro = sel.querySelector('option[data-outro]'); var o = document.createElement("option"); o.value = ddi; o.textContent = "+" + ddi;
      sel.insertBefore(o, outro);
    }
    sel.value = ddi; el.dataset.ddi = ddi; atualizaDica(el);
  }
  function atualizaDica(el) {
    var br = el.dataset.ddi === "55";
    if (!el.__phOrig) el.__phOrig = el.getAttribute("placeholder") || "";
    el.setAttribute("placeholder", br ? el.__phOrig : "Número com o código da cidade");
    el.setAttribute("inputmode", "tel");
  }

  function ddiAtivar(el) {
    if (!el || el.__ddiSel || el.hasAttribute("data-sem-ddi") || !el.parentNode) return;
    var cs = getComputedStyle(el);
    if (el.maxLength > 0 && el.maxLength < 20) el.maxLength = 20;
    var wrap = document.createElement("div"); wrap.className = "ddi-wrap"; wrap.style.cssText = "display:flex;gap:8px;align-items:stretch;width:100%";
    var sel = document.createElement("select"); sel.className = "ddi-sel"; sel.setAttribute("aria-label", "País do telefone (DDI)");
    PAISES.forEach(function (p) { opcao(sel, p[0], p[1]); });
    var outro = document.createElement("option"); outro.value = "__outro"; outro.textContent = "Outro código…"; outro.setAttribute("data-outro", "1"); sel.appendChild(outro);
    sel.style.cssText = "flex:0 0 auto;width:" + (window.innerWidth < 420 ? "104px" : "132px") + ";max-width:40%;min-height:" + (cs.minHeight !== "0px" ? cs.minHeight : cs.height) +
      ";box-sizing:border-box;padding:0 6px;border:" + cs.border + ";border-radius:" + cs.borderRadius + ";background:" + cs.backgroundColor + ";color:" + cs.color +
      ";font:" + cs.font + ";text-overflow:ellipsis";
    el.parentNode.insertBefore(wrap, el); wrap.appendChild(sel); wrap.appendChild(el);
    el.style.flex = "1 1 auto"; el.style.minWidth = "0"; el.style.width = "auto";
    el.__ddiSel = sel; el.dataset.ddi = "55"; sel.value = "55";

    /* o resto do sistema lê .value: no Brasil continua igual; em outro país devolve "+código número" */
    Object.defineProperty(el, "value", {
      configurable: true,
      get: function () {
        var r = cru(el).trim(); if (el.dataset.ddi === "55" || !r) return el.dataset.ddi === "55" ? cru(el) : "";
        return "+" + el.dataset.ddi + " " + r;
      },
      set: function (v) {
        var s = separar(v);
        if (s) { escolher(el, s.ddi); setCru(el, s.num); }
        else { if (v && String(v).trim().charAt(0) === "(" && el.dataset.ddi !== "55") escolher(el, "55"); setCru(el, v == null ? "" : v); }   // número do Brasil gravado pelo sistema: volta para +55
      }
    });
    sel.addEventListener("change", function () {
      if (sel.value === "__outro") {
        var c = soDig(window.prompt("Digite o código do país (só números, sem o +). Ex.: 351", ""));
        if (c) escolher(el, c); else sel.value = el.dataset.ddi;
      } else { el.dataset.ddi = sel.value; atualizaDica(el); }
      setCru(el, ""); el.dispatchEvent(new Event("input", { bubbles: true })); el.focus();
    });
  }

  /* número colado ou preenchido pelo navegador já com "+código": separa o país sozinho (antes das máscaras do campo) */
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el || !el.__ddiSel) return;
    var s = separar(cru(el)); if (!s) return;
    escolher(el, s.ddi); setCru(el, s.num);
  }, true);

  /* em outros países o campo aceita só números, espaço e traço (a máscara do Brasil não roda: cada máscara confere window.ddiEstrangeiro) */
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el || !el.__ddiSel || el.dataset.ddi === "55") return;
    var limpo = cru(el).replace(/[^\d\s-]/g, "").slice(0, 18);
    if (limpo !== cru(el)) setCru(el, limpo);
  }, true);

  function varrer(raiz) {
    Array.prototype.forEach.call((raiz || document).querySelectorAll ? (raiz || document).querySelectorAll('input[type="tel"]') : [], ddiAtivar);
  }
  function iniciar() {
    varrer(document);
    if ("MutationObserver" in window) new MutationObserver(function (ms) {
      ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches('input[type="tel"]')) ddiAtivar(n); else if (n.querySelectorAll) varrer(n);
      }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();

  window.ddiAtivar = ddiAtivar;
  window.ddiEstrangeiro = function (el) { return !!(el && el.dataset && el.dataset.ddi && el.dataset.ddi !== "55"); };
  /* só os números, já com o código do país. "+351 912345678" -> 351912345678 · "(81) 99999-9999" -> 5581999999999 */
  window.ddiDigitos = function (v) {
    var t = String(v || "").trim(), d = soDig(t);
    if (!d) return "";
    if (t.charAt(0) === "+") return d;
    if (d.length === 10 || d.length === 11) return "55" + d;
    return d;
  };
})();
