/* Funil (Fase 5): funções puras, para testar sem a página. Usadas por whatsapp.js. */
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
  /* onde o cartão cai: ids = cartões da coluna de destino (sem o que está sendo movido); idx = posição desejada (0 = no alto) */
  function posicaoSolta(ids, idMovido, idx) {
    const lista = (ids || []).filter(function (x) { return x !== idMovido; });
    const i = Math.max(0, Math.min(Number(idx) || 0, lista.length));
    return i === 0
      ? { antes: lista.length ? lista[0] : null, depois: null, indice: 0 }
      : { antes: null, depois: lista[i - 1], indice: i };
  }
  /* quantos cartões ficam acima do ponteiro: meios = centro vertical de cada cartão da coluna */
  function indiceNaSolta(meios, y) {
    let n = 0;
    (meios || []).forEach(function (m) { if (m < y) n++; });
    return n;
  }
  function precisaMotivo(tipoOrigem, tipoDestino, mesmaColuna) {
    return !mesmaColuna && tipoDestino === "perdido";
  }
  function precisaValor(tipoOrigem, tipoDestino, mesmaColuna) {
    return !mesmaColuna && tipoDestino === "ganho";
  }
  /* só desfaz movimentos entre colunas normais: voltar de ganho/perdido pede motivo ou valor de novo */
  function podeDesfazer(tipoOrigem, tipoDestino) {
    return tipoOrigem === "normal" && tipoDestino === "normal";
  }
  function filtrosDaTela(f) {
    const o = {};
    f = f || {};
    if (f.busca && String(f.busca).trim()) o.busca = String(f.busca).trim();
    if (f.responsavel) o.responsavel = f.responsavel;
    if (f.prioridade) o.prioridade = f.prioridade;
    if (f.etiqueta && String(f.etiqueta).trim()) o.etiqueta = String(f.etiqueta).trim();
    if (f.origem) o.origem = f.origem;
    ["so_atendimento", "so_nao_lidas", "precisa_de_mim", "prazo_vencido", "encerrados"].forEach(function (k) { if (f[k]) o[k] = true; });
    if (Number(f.parados_dias) > 0) o.parados_dias = Number(f.parados_dias);
    return o;
  }
  /* telefone digitado por gente: aceita com ou sem DDI e com ou sem o 9º dígito. Devolve os 12 ou 13 dígitos ou "". */
  function telefoneValido(t) {
    const d = String(t || "").replace(/\D/g, "");
    const c = d.length === 10 || d.length === 11 ? "55" + d : d;
    return /^55[1-9][1-9]9?[0-9]{8}$/.test(c) ? c : "";
  }
  /* lista de motivos de perda: uma linha por motivo, sem repetição e sem linha vazia */
  function motivosDoTexto(t) {
    const out = [];
    String(t || "").split("\n").forEach(function (x) {
      const m = x.trim();
      if (m && m.length <= 60 && out.indexOf(m) < 0) out.push(m);
    });
    return out;
  }
  const api = {
    classeParado: classeParado, textoParado: textoParado, valorReais: valorReais, prazoRotulo: prazoRotulo, contaTexto: contaTexto,
    posicaoSolta: posicaoSolta, indiceNaSolta: indiceNaSolta, precisaMotivo: precisaMotivo, precisaValor: precisaValor, podeDesfazer: podeDesfazer,
    filtrosDaTela: filtrosDaTela, telefoneValido: telefoneValido, motivosDoTexto: motivosDoTexto
  };
  raiz.WaFunil = api;
})(typeof window !== "undefined" ? window : globalThis);
