/* ============================================================================
   Meta Pixel (Facebook / Instagram Ads) — Ressignificar
   Carrega o código base uma única vez por página e dispara o PageView.
   Para a conversão, use window.pxLead(chave): dispara o evento "Lead"
   no máximo uma vez por envio (a chave é o que identifica aquele envio).
   ============================================================================ */
(function () {
  var ID = '578112137667601';
  if (window.fbq) return;
  /* código base padrão do Meta */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', ID);
  fbq('track', 'PageView');
})();

/* Conversão: só dispara uma vez por envio.
   Guarda a marca na sessão do navegador; se a pessoa recarregar a tela do resultado, não conta de novo. */
window.pxLead = function (chave) {
  var k = 'px_lead_' + (chave || 'geral');
  try {
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, '1');
  } catch (e) {                                   /* navegador sem armazenamento: usa a memória da página */
    window.__pxLead = window.__pxLead || {};
    if (window.__pxLead[k]) return false;
    window.__pxLead[k] = true;
  }
  if (window.fbq) fbq('track', 'Lead');
  return true;
};
