/* Inscrições (Fase 9): funções puras do painel, para testar sem a página. As regras de telefone e de origem são as mesmas do banco. */
(function (raiz) {
  "use strict";
  function semAcento(t) { return String(t === null || t === undefined ? "" : t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  /* endereço da página: letras minúsculas, números e traço */
  function slugDe(t) { return semAcento(t).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, ""); }
  function slugValido(s) { return /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/.test(String(s || "")); }
  /* celular brasileiro com DDD: devolve 55 + DDD + 9 dígitos, ou null (fixo, estrangeiro ou incompleto) */
  function celularBr(t) {
    let d = String(t === null || t === undefined ? "" : t).replace(/\D/g, "").replace(/^0+/, "");
    if (d.length === 10 || d.length === 11) d = "55" + d;
    if (/^55[1-9][1-9]9\d{8}$/.test(d)) return d;
    if (/^55[1-9][1-9][6-9]\d{7}$/.test(d)) return d.slice(0, 4) + "9" + d.slice(4);
    return null;
  }
  function telefoneBonito(t) {
    const d = String(t || "").replace(/\D/g, "");
    if (/^55\d{11}$/.test(d)) return "(" + d.slice(2, 4) + ") " + d.slice(4, 9) + "-" + d.slice(9);
    if (/^55\d{10}$/.test(d)) return "(" + d.slice(2, 4) + ") " + d.slice(4, 8) + "-" + d.slice(8);
    return String(t || "");
  }
  /* origem do link: mesma limpeza do banco */
  function origemLimpa(o) { return String(o === null || o === undefined ? "" : o).trim().toLowerCase().replace(/[^a-z0-9_]+/g, "-").slice(0, 60).replace(/^-+|-+$/g, ""); }
  function rotuloOrigem(o) { return o ? String(o) : "Não informada"; }
  function linkDaPagina(site, slug, origem) {
    const o = origemLimpa(origem);
    return String(site || "").replace(/\/*$/, "/") + "?p=" + encodeURIComponent(String(slug || "")) + (o ? "&origem=" + encodeURIComponent(o) : "");
  }
  function aceitePadrao(comEmail) {
    return "Autorizo a Ressignificar Terapias & Consultorias a me enviar mensagens pelo WhatsApp" + (comEmail ? " e por e-mail" : "") + ", com avisos, conteúdos e ofertas. Posso sair a qualquer momento respondendo SAIR.";
  }
  /* o texto da autorização precisa dizer quem envia, por onde e como sair */
  function avisosAceite(texto, comEmail) {
    const t = semAcento(texto), out = [];
    if (t.trim().length < 20) { out.push("O texto está curto demais para valer como autorização."); return out; }
    if (t.indexOf("ressignificar") < 0) out.push("Diga quem vai enviar (Ressignificar).");
    if (t.indexOf("whatsapp") < 0) out.push("Diga por onde as mensagens chegam (WhatsApp).");
    if (comEmail && t.indexOf("e-mail") < 0 && t.indexOf("email") < 0) out.push("A página pede e-mail: diga que as mensagens também podem chegar por e-mail.");
    if (t.indexOf("sair") < 0 && t.indexOf("cancelar") < 0 && t.indexOf("parar") < 0) out.push("Diga como a pessoa pode sair (por exemplo, respondendo SAIR).");
    if (String(texto || "").length > 400) out.push("O texto está longo. Quanto mais curto e claro, mais gente lê antes de aceitar.");
    return out;
  }
  const ST = { aguardando_confirmacao: "Aguardando confirmar", confirmada: "Confirmada", revisao: "Esperando a sua decisão", recusada: "Recusada", bloqueada: "Bloqueada", invalida: "Inválida", expirada: "Expirou sem confirmar" };
  function rotuloStatus(s) { return ST[String(s || "")] || String(s || ""); }
  const STP = { rascunho: "Rascunho", no_ar: "No ar", pausada: "Pausada", arquivada: "Arquivada" };
  function rotuloPagina(s) { return STP[String(s || "")] || String(s || ""); }
  function taxa(parte, todo) { const p = Number(parte) || 0, t = Number(todo) || 0; return t > 0 ? String(Math.round((p / t) * 1000) / 10).replace(".", ",") + "%" : "—"; }
  function etiquetasDe(texto) {
    const vistas = {}, out = [];
    String(texto || "").split(/[,;\n]+/).forEach(function (e) { const v = e.trim(); if (v && !vistas[v.toLowerCase()]) { vistas[v.toLowerCase()] = 1; out.push(v.slice(0, 40)); } });
    return out.slice(0, 10);
  }
  raiz.WaInscricao = { slugDe: slugDe, slugValido: slugValido, celularBr: celularBr, telefoneBonito: telefoneBonito, origemLimpa: origemLimpa, rotuloOrigem: rotuloOrigem, linkDaPagina: linkDaPagina,
    aceitePadrao: aceitePadrao, avisosAceite: avisosAceite, rotuloStatus: rotuloStatus, rotuloPagina: rotuloPagina, taxa: taxa, etiquetasDe: etiquetasDe };
})(typeof window !== "undefined" ? window : globalThis);
