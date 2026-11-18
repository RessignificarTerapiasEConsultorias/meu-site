/* Vendas (Fase 6): funções puras, para testar sem a página. Valores em centavos (inteiro); a tela formata. */
(function (raiz) {
  "use strict";
  function reais(centavos) {
    if (centavos === null || centavos === undefined || centavos === "") return "";
    const n = Math.round(Number(centavos));
    if (!Number.isFinite(n)) return "";
    const neg = n < 0, a = Math.abs(n);
    const reaisInt = Math.floor(a / 100), cent = String(a % 100).padStart(2, "0");
    return (neg ? "-" : "") + "R$ " + String(reaisInt).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + cent;
  }
  function pct(parte, todo) {
    if (!Number.isFinite(parte) || !Number.isFinite(todo) || todo <= 0) return null;
    return Math.round((parte / todo) * 1000) / 10;
  }
  /* variação contra o período anterior; null quando não há base (anterior zero) */
  function variacaoPct(atual, anterior) {
    if (!Number.isFinite(atual) || !Number.isFinite(anterior) || anterior <= 0) return null;
    return Math.round(((atual - anterior) / anterior) * 1000) / 10;
  }
  /* ritmo e projeção do mês. Só projeta com dias passados (nunca divide por zero); a projeção é estimativa. */
  function projecao(acumuladoCent, diasPassados, diasNoMes, metaCent) {
    const acum = Math.max(0, Number(acumuladoCent) || 0), passados = Math.max(0, Number(diasPassados) || 0), total = Math.max(1, Number(diasNoMes) || 30);
    const meta = Number(metaCent) > 0 ? Number(metaCent) : null;
    const restantes = Math.max(0, total - passados);
    const ritmo = passados > 0 ? acum / passados : null;
    const projetado = ritmo === null ? null : Math.round(ritmo * total);
    const faltaHoje = meta === null ? null : Math.max(0, meta - acum);
    const porDia = meta === null || restantes === 0 ? null : Math.ceil(faltaHoje / restantes);
    return {
      percentual: meta === null ? null : Math.min(100, Math.round((acum / meta) * 1000) / 10),
      falta: faltaHoje, diasRestantes: restantes, precisaPorDia: porDia,
      ritmoPorDia: ritmo === null ? null : Math.round(ritmo), projetado: projetado,
      projetadoBate: meta === null || projetado === null ? null : projetado >= meta,
      semDados: passados === 0
    };
  }
  const FORMAS = { pix: "Pix", credit_card: "Cartão", cartao: "Cartão", manual: "Manual", nao_informada: "Não informada" };
  function rotuloForma(f) { return FORMAS[String(f || "nao_informada")] || "Não informada"; }
  const STATUS = { aguardando: "Aguardando pagamento", pago: "Pago", ativando: "Ativando", ativado: "Ativado", cancelado: "Cancelado" };
  function rotuloStatus(s) { return STATUS[String(s || "")] || String(s || ""); }
  function primeiroNome(n) {
    const p = String(n || "").trim().split(/\s+/)[0] || "";
    return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : "";
  }
  /* resposta pronta para quem começou a compra e não pagou (utilidade: fala do pedido, sem oferta) */
  function textoCarrinho(nome, produto) {
    const p = primeiroNome(nome);
    return "Oi" + (p ? ", " + p : "") + "! Vi que você começou a compra do " + (produto || "produto") + ". Posso ajudar com alguma dúvida?";
  }
  function minutosDesde(iso, agoraMs) {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return null;
    return Math.max(0, Math.floor(((agoraMs || Date.now()) - t) / 60000));
  }
  function tempoTexto(min) {
    if (min === null || min === undefined) return "";
    if (min < 60) return "há " + min + " min";
    const h = Math.floor(min / 60);
    if (h < 48) return "há " + h + " h";
    return "há " + Math.floor(h / 24) + " dias";
  }
  /* nunca trata a origem como conhecida quando não veio: "Não informada" */
  function rotuloOrigem(o) {
    const m = { instagram: "Instagram", anuncio: "Anúncio", indicacao: "Indicação", grupo: "Grupo de WhatsApp", email: "Lista de e-mail" };
    return m[String(o || "")] || "Não informada";
  }
  raiz.WaVendas = { reais: reais, pct: pct, variacaoPct: variacaoPct, projecao: projecao, rotuloForma: rotuloForma, rotuloStatus: rotuloStatus,
    textoCarrinho: textoCarrinho, minutosDesde: minutosDesde, tempoTexto: tempoTexto, rotuloOrigem: rotuloOrigem, primeiroNome: primeiroNome };
})(typeof window !== "undefined" ? window : globalThis);
