/* E-mail (Fase 8): funções puras, para testar sem a página. */
(function (raiz) {
  "use strict";
  function normalizar(e) {
    const v = String(e === null || e === undefined ? "" : e).replace(/\s+/g, "").toLowerCase().replace(/\.+$/, "");
    return v || null;
  }
  /* mesma regra do banco: formato simples, sem dois pontos seguidos, até 254 caracteres */
  function valido(e) {
    const v = normalizar(e);
    return !!v && v.length <= 254 && !/\.\./.test(v) && /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(v);
  }
  const ERROS_DOMINIO = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.com.br": "gmail.com", "gnail.com": "gmail.com",
    "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com", "hotnail.com": "hotmail.com",
    "outlok.com": "outlook.com", "outllok.com": "outlook.com", "outlook.con": "outlook.com", "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "yhaoo.com": "yahoo.com", "iclod.com": "icloud.com", "icloud.con": "icloud.com" };
  /* sugere a correção, sem trocar sozinho */
  function sugestao(e) {
    const v = normalizar(e); if (!v || v.indexOf("@") < 0) return null;
    const partes = v.split("@"), certo = ERROS_DOMINIO[partes[1]];
    return certo ? partes[0] + "@" + certo : null;
  }
  const FUNCAO = ["contato", "info", "admin", "sac", "atendimento", "vendas", "financeiro", "suporte", "noreply", "no-reply", "comercial", "marketing", "rh"];
  function deFuncao(e) { const v = normalizar(e); return !!v && FUNCAO.indexOf(v.split("@")[0]) >= 0; }
  const SITUACAO = { sem_email: "Sem e-mail", so_transacional: "Só transacional (sem autorização de marketing)", aceitou: "Autorizou receber e-mail", saiu: "Saiu dos e-mails", invalido: "Endereço com erro de entrega" };
  function rotuloSituacao(s) { return SITUACAO[String(s || "sem_email")] || "Sem e-mail"; }
  const MOTIVO = { clicou_no_link: "Clicou em sair", reclamou_spam: "Marcou como spam", respondeu_sair: "Respondeu pedindo para sair", bounce_permanente: "Endereço não existe", removido_pelo_dono: "Retirado por você" };
  function rotuloMotivo(m) { return MOTIVO[String(m || "")] || "Saiu"; }
  function usoTexto(usados, limite) {
    const u = Math.max(0, Number(usados) || 0), l = Math.max(0, Number(limite) || 0);
    return u + " de " + l + (l > 0 && u >= l ? " (limite atingido)" : "");
  }
  /* avisos ao digitar o e-mail na ficha: lista de frases curtas */
  function avisos(e) {
    const v = normalizar(e), out = [];
    if (!v) return out;
    if (!valido(v)) { out.push("Este e-mail não parece válido."); return out; }
    const s = sugestao(v); if (s) out.push("Você quis dizer " + s + "?");
    if (deFuncao(v)) out.push("Endereço de setor (como contato@) costuma reclamar mais de e-mails.");
    return out;
  }
  raiz.WaEmail = { normalizar: normalizar, valido: valido, sugestao: sugestao, deFuncao: deFuncao, rotuloSituacao: rotuloSituacao, rotuloMotivo: rotuloMotivo, usoTexto: usoTexto, avisos: avisos };
})(typeof window !== "undefined" ? window : globalThis);
