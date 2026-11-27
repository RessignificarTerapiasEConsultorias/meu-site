/* CRM no celular (etapa 2): cada linha de tabela vira um cartão em telas pequenas.
   Aqui só se copia o título da coluna para cada célula (data-rot); quem transforma em cartão é o css/crm-celular.css.
   Não lê nem muda dado nenhum: só o que já está desenhado na tela. */
(function () {
  "use strict";
  function rotular(tb) {
    const cab = tb.tHead && tb.tHead.rows[0]; if (!cab) return;
    const nomes = Array.prototype.map.call(cab.cells, function (c) { return c.textContent.replace(/\s+/g, " ").trim(); });
    Array.prototype.forEach.call(tb.tBodies, function (corpo) {
      Array.prototype.forEach.call(corpo.rows, function (l) {
        if (l.cells.length !== nomes.length) return;   // linha de aviso ("Nenhum...") ou com células unidas
        let titulo = false;   // o primeiro dado com nome de coluna vira o título do cartão
        for (let i = 0; i < l.cells.length; i++) {
          const r = nomes[i] || "", c = l.cells[i];
          if (c.getAttribute("data-rot") !== r) c.setAttribute("data-rot", r);
          if (r && !titulo) { titulo = true; if (!c.hasAttribute("data-tit")) c.setAttribute("data-tit", ""); }
        }
      });
    });
  }
  let marcado = false;
  function todas() { marcado = false; Array.prototype.forEach.call(document.querySelectorAll("table.t, table.tabela"), rotular); }
  function pedir() { if (marcado) return; marcado = true; (window.requestAnimationFrame || setTimeout)(todas); }
  new MutationObserver(pedir).observe(document.body, { childList: true, subtree: true });
  pedir();
})();
