/* Funil (Fase 5, itens 5.1 e 5.2): funções puras, para testar sem a página. */
(function (raiz) {
  "use strict";
  function classeParado(dias, amarelo, vermelho) {
    const a = Number.isFinite(+amarelo) ? +amarelo : 3, v = Number.isFinite(+vermelho) ? +vermelho : 7;
    const d = Math.max(0, Number(dias) || 0);
    if (d >= v) return "vm";
    if (d >= a) return "am";
    return "";
  }
  function textoParado(dias) {
    const d = Math.max(0, Math.floor(Number(dias) || 0));
    return d === 0 ? "hoje" : d === 1 ? "1 dia" : d + " dias";
  }
  function valorReais(v) {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    const partes = n.toFixed(2).split(".");
    const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return "R$ " + inteiro + "," + partes[1];
  }
  function dataCurta(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    return m ? m[3] + "/" + m[2] : "";
  }
  function prazoRotulo(prazo, vencido) {
    const d = dataCurta(prazo);
    return d ? (vencido ? "venceu " : "vence ") + d : "";
  }
  function contaTexto(n, um, varios) {
    return n + " " + (n === 1 ? um : varios);
  }
  const api = { classeParado: classeParado, textoParado: textoParado, valorReais: valorReais, prazoRotulo: prazoRotulo, contaTexto: contaTexto };
  raiz.WaFunil = api;
})(typeof window !== "undefined" ? window : globalThis);
