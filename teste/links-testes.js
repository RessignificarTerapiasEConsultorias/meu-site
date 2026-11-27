/* Links com o nome do teste no endereço: site/<terapeuta>/<teste>/?c=CÓDIGO
   (ex.: /bia-barros/teste-de-travas/?c=BB-1234 · /mauricio/disc/?c=MP-0001).
   A pasta de cada terapeuta e teste é uma página fixa com a prévia do WhatsApp que abre /teste/ com o código certo;
   para terapeuta ou teste novo, o 404.html faz o mesmo caminho até as páginas fixas serem geradas. */
(function () {
  var PASTA = { travas:'teste-de-travas', tracos:'tracos-de-carater', mpcc:'mpcc', disc:'disc', ansiedade:'teste-de-ansiedade', vida:'mapa-da-vida', procrastinacao:'mapa-da-procrastinacao',
    profissional:'mapa-profissional', autoestima:'mapa-da-autoestima', dinheiro:'mapa-do-dinheiro',
    familia:'travas-em-familia', serena:'termometro-emocional-feminino', esquemas:'esquemas-emocionais', tdah:'perfil-cognitivo' };
  window.TESTE_PASTA = PASTA;
  window.linkTeste = function (teste, codigo, extra) {
    var slug = window.T_SLUG || '', ov = (window.__T && window.__T.dados && window.__T.dados.og && window.__T.dados.og.pastas) || {}, pasta = ov[teste] || PASTA[teste] || PASTA.travas;   // a terapeuta pode ter o nome próprio da pasta (dados.og.pastas)
    var q = (codigo ? 'c=' + encodeURIComponent(codigo) : '') + (extra ? (codigo ? '&' : '') + extra : '');
    return location.origin + '/' + encodeURIComponent(slug) + '/' + pasta + '/' + (q ? '?' + q : '');
  };
})();
