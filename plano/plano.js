/* ============================================================================
   PLANO DE RESSIGNIFICAÇÃO · página do cliente (/plano/?p=<token>)
   Lê o plano pela função pública plano_publico (sem login), mostra os 13 campos,
   o gráfico de antes e agora (mapas-nucleo.js), "Salvar em PDF" e a confirmação do cliente (plano_ciente).
   ============================================================================ */
(function(){
  /* o mesmo projeto e a mesma chave pública da página do teste (teste/index.html) */
  const MEMBROS_URL = 'https://gobjhepmnijoceirwgow.supabase.co';
  const MEMBROS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYmpoZXBtbmlqb2NlaXJ3Z293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODgyMDQsImV4cCI6MjEwNzg2NDIwNH0.XPGLdSyG9rwg4VD0hlVAFFWdNeiJom86CSsqnMtMgx4';
  const raiz = document.getElementById('pl-pagina');
  const token = (new URLSearchParams(location.search).get('p') || '').trim().toLowerCase();
  const nada = (tit, txt) => { raiz.innerHTML = `<div class="pl-nada"><h1>${maEsc(tit)}</h1><p>${maEsc(txt)}</p></div>`; };
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(token)) return nada('Plano não encontrado', 'Confira o link que você recebeu de quem te atende. Se o problema continuar, peça um link novo.');
  let cliente = null;
  try{ cliente = window.supabase.createClient(MEMBROS_URL, MEMBROS_KEY, { auth:{ persistSession:false, autoRefreshToken:false } }); }
  catch(e){ return nada('Não foi possível abrir o plano agora', 'Verifique a sua internet e tente de novo em instantes.'); }
  let P = null;
  async function carregar(){
    const { data, error } = await cliente.rpc('plano_publico', { p_token:token });
    if(error) return nada('Não foi possível abrir o plano agora', 'Verifique a sua internet e tente de novo em instantes.');
    if(!data || data.ok !== true) return nada('Plano não encontrado', 'Este link não está mais valendo. Fale com quem te atende para receber um link novo.');
    P = data; desenhar();
  }
  function desenhar(){
    const t = P.terapeuta || {}, nomeT = t.nome || '', ini = (nomeT.trim().charAt(0) || 'R').toUpperCase();
    const foto = t.foto_url && /^https:\/\//.test(t.foto_url) ? `<img src="${maEsc(t.foto_url)}" alt="${maEsc(nomeT)}">` : `<span class="pl-ini" aria-hidden="true">${maEsc(ini)}</span>`;
    document.title = 'Plano de Ressignificação · ' + (P.cliente || '');
    const aceito = P.ciente_em ? `<div class="pl-ok-box">Aceito em ${maDataBR(P.ciente_em)}${P.ciente_nome ? ' por ' + maEsc(P.ciente_nome) : ''}. Obrigado pela confiança.</div>` : '';
    raiz.innerHTML = `<header class="pl-topo">${foto}<p><b>${maEsc(nomeT)}</b>${t.titulo ? '<br>' + maEsc(t.titulo) : ''}</p></header>
      <span class="pl-selo">Plano de Ressignificação · ${maEsc(PL_ETAPAS[P.etapa] || '')}</span>
      <h1 class="pl-h1">O plano de ${maEsc(P.cliente || 'você')}</h1>
      <p class="pl-sub">Atualizado em ${maDataBR(P.atualizado_em)}. Leia com calma: é o caminho que vocês combinaram para as próximas sessões.</p>
      <div class="pl-acoes"><button type="button" class="btn btn-contorno" id="pl-imprimir">Salvar em PDF</button>${P.ciente_em ? '' : '<a class="btn" href="#pl-aceite">Ir para a confirmação</a>'}</div>
      ${aceito}
      ${plVerHTML(P, Object.fromEntries(MA_PLANO_TESTES.map(k => [k, Array.isArray(P[k]) ? P[k] : []])), { publico:true })}
      <section class="pl-aceite" id="pl-aceite"><h2>Ciência do cliente</h2><p>${maEsc(PL_CIENCIA)}</p>
        ${P.ciente_em ? aceito : `<form id="pl-form" novalidate>
          <label for="pl-nome">O seu nome completo</label><input id="pl-nome" type="text" autocomplete="name" value="${maEsc(P.cliente || '')}" maxlength="200">
          <label class="check" for="pl-ok"><input id="pl-ok" type="checkbox"><span>Li e estou de acordo</span></label>
          <button type="submit" class="btn" id="pl-enviar">Confirmar</button><p class="pl-erro" id="pl-erro" role="alert"></p></form>`}</section>
      <p class="pl-rodape">Plano de Ressignificação · Mapas Ressignificar</p>`;
    document.getElementById('pl-imprimir').addEventListener('click', () => window.print());
    const f = document.getElementById('pl-form'); if(f) f.addEventListener('submit', confirmar);
  }
  async function confirmar(e){
    e.preventDefault();
    const nome = document.getElementById('pl-nome').value.trim().replace(/\s+/g, ' '), erro = document.getElementById('pl-erro'), b = document.getElementById('pl-enviar');
    if(nome.length < 3) return void (erro.textContent = 'Escreva o seu nome para confirmar.');
    if(!document.getElementById('pl-ok').checked) return void (erro.textContent = 'Marque “Li e estou de acordo” para confirmar.');
    erro.textContent = ''; b.disabled = true; b.textContent = 'Confirmando...';
    const { data, error } = await cliente.rpc('plano_ciente', { p_token:token, p_nome:nome });
    if(error || !data){ b.disabled = false; b.textContent = 'Confirmar'; erro.textContent = 'Não consegui confirmar agora. Verifique a internet e tente de novo.'; return; }
    if(data.ok !== true && data.msg){ b.disabled = false; b.textContent = 'Confirmar'; erro.textContent = data.msg; return; }
    await carregar();   // já confirmado antes (ok:false sem mensagem) ou agora: mostra a data que ficou registrada
    const a = document.getElementById('pl-aceite'); if(a) a.scrollIntoView({ block:'center' });
  }
  carregar().catch(() => nada('Não foi possível abrir o plano agora', 'Verifique a sua internet e tente de novo em instantes.'));
})();
