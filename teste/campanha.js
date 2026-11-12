/* ============================================================================
   MODO CAMPANHA (link de anúncio) · Teste de Travas Mentais
   Liga sozinho quando o link traz um código marcado como campanha (travas_codigos.campanha).
   - página de chegada curta, que repete a promessa do anúncio, com um único botão
   - nome e sobrenome + WhatsApp logo no começo (quem parar no meio vira contato)
   - instruções em poucas linhas; cronômetro de 30 min e de 60 s continuam
   - perguntas sem número, com uma frase de incentivo a cada 5 (igual para todos: TX_INC em devolutiva-carater.js)
   - idade, gênero e "o que pesa" ficam para depois das perguntas
   - cada passo é registrado (campanha_evento) e aparece na aba "Histórico de campanha" da área
   Funciona com o resultado visível ou não (configuração do código).
   ============================================================================ */
(function(){
  const URL_BD = 'https://gobjhepmnijoceirwgow.supabase.co';
  const CHAVE_BD = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvYmpoZXBtbmlqb2NlaXJ3Z293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODgyMDQsImV4cCI6MjEwNzg2NDIwNH0.XPGLdSyG9rwg4VD0hlVAFFWdNeiJom86CSsqnMtMgx4';
  const q = new URLSearchParams(location.search);
  const COD = (q.get('c') || q.get('codigo') || q.get('code') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9);
  const H = document.documentElement;
  const CAMP = window.CAMP = { codigo:COD, ativo:false, info:null, sessao:null, maior:0, perfilFeito:false, comecou:false, concluiu:false };
  /* Pixel do Meta da terapeuta (travas_paginas.dados.pixel_meta; hoje só a Mônica).
     PageView em toda visita à página dela e, no link de campanha, os passos do funil:
     chegou → ViewContent · Começar → ComecouTeste · nome e WhatsApp → Lead · terminou → CompleteRegistration · WhatsApp no fim → Contact.
     Nenhum dado pessoal (nome, WhatsApp, respostas) vai para o Meta. */
  const PIX = window.PIX = { fila:[], pronto:false, desligado:false };
  PIX.track = (tipo, nome, extra) => { if(PIX.desligado) return; if(PIX.pronto && window.fbq) window.fbq(tipo, nome, extra || {}); else PIX.fila.push([tipo, nome, extra]); };
  (function esperarPagina(n){
    const T = window.__T;
    if(!T){ if(n < 160) setTimeout(() => esperarPagina(n + 1), 125); else { PIX.desligado = true; PIX.fila = []; } return; }
    const id = String((T.dados || {}).pixel_meta || '');
    if(!/^\d{10,20}$/.test(id)){ PIX.desligado = true; PIX.fila = []; return; }
    if(!window.fbq){
      const f = window.fbq = function(){ f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
      if(!window._fbq) window._fbq = f; f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
      const s = document.createElement('script'); s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(s);
    }
    window.fbq('init', id); window.fbq('track', 'PageView');
    PIX.pronto = true; PIX.fila.splice(0).forEach(a => window.fbq(a[0], a[1], a[2] || {}));
  })(0);
  const PIX_MAPA = { chegou:['track', 'ViewContent', { content_name:'Teste de Travas Mentais (campanha)' }], comecar:['trackCustom', 'ComecouTeste'],
    contato:['track', 'Lead', { content_name:'Teste de Travas Mentais' }], concluiu:['track', 'CompleteRegistration', { content_name:'Teste de Travas Mentais' }], whatsapp:['track', 'Contact'] };

  if(!COD) return;
  H.classList.add('camp-espera');
  const soltar = () => H.classList.remove('camp-espera');
  const seguranca = setTimeout(soltar, 8000);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  try{ const k = 'camp_sessao_' + COD; CAMP.sessao = localStorage.getItem(k); if(!CAMP.sessao){ CAMP.sessao = uuid(); localStorage.setItem(k, CAMP.sessao); } }catch(e){ CAMP.sessao = uuid(); }

  const rpc = (nome, corpo, manter) => fetch(URL_BD + '/rest/v1/rpc/' + nome, { method:'POST', keepalive:!!manter,
    headers:{ 'Content-Type':'application/json', apikey:CHAVE_BD, Authorization:'Bearer ' + CHAVE_BD }, body:JSON.stringify(corpo) });
  function evento(e, p, dados){
    if(!CAMP.ativo) return;
    try{ rpc('campanha_evento', { p_codigo:COD, p_sessao:CAMP.sessao, p_evento:e, p_pergunta:p || null, p_dados:dados || {} }, true).catch(() => {}); }catch(err){}
    try{ const m = PIX_MAPA[e]; if(m) PIX.track(m[0], m[1], m[2]); }catch(err){}
  }
  CAMP.evento = evento;
  function origem(){
    const u = (q.get('utm_source') || '').toLowerCase(), r = document.referrer || '';
    if(q.get('fbclid') || /facebook|instagram|meta|fb|ig/.test(u)) return /instagram|ig/.test(u) || /instagram/.test(r) ? 'Instagram (anúncio)' : 'Facebook/Instagram (anúncio)';
    if(u) return u.slice(0, 40);
    if(/instagram/.test(r)) return 'Instagram'; if(/facebook/.test(r)) return 'Facebook'; if(/google/.test(r)) return 'Google'; if(/whatsapp|wa\.me/.test(r)) return 'WhatsApp';
    return r ? (r.replace(/^https?:\/\//, '').split('/')[0]).slice(0, 40) : 'Direto';
  }

  /* 1) o código é de campanha? */
  rpc('travas_validar_codigo', { p_codigo:COD }).then(r => r.json()).then(r => {
    if(!r || !r.campanha || !(r.ok === true || r.valido === true)){ clearTimeout(seguranca); soltar(); return; }
    CAMP.info = { mostrar:r.mostrar_resultado !== false, urgencia:r.urgencia !== false, duracao:r.duracao_min || 30, compartilhado:r.compartilhado === true };
    CAMP.ativo = true; H.classList.add('modo-campanha');
    evento('chegou', null, { origem:origem(), referencia:(document.referrer || '').slice(0, 200), aparelho:matchMedia('(max-width: 820px)').matches ? 'celular' : 'computador' });
    esperarApp(montar);
  }).catch(() => { clearTimeout(seguranca); soltar(); });

  function esperarApp(fn){
    let n = 0; const t = setInterval(() => {
      n++;
      const pronto = typeof estado !== 'undefined' && typeof compIniciar === 'function' && typeof mostrarTela === 'function' && typeof desenharPergunta === 'function' && typeof finalizar === 'function' && document.getElementById('tela-orientacao');
      if(pronto){ clearInterval(t); try{ fn(); }catch(e){ console.log('campanha', e); soltar(); } }
      else if(n > 120){ clearInterval(t); H.classList.remove('modo-campanha'); CAMP.ativo = false; soltar(); }
    }, 100);
  }

  /* 2) telas */
  function dadosPagina(){
    const d = (window.__T && __T.dados) || {};
    const nome = (typeof CONFIG !== 'undefined' && CONFIG.terapeuta) || d.nome || '';
    const prim = (typeof PRIM_TER !== 'undefined' && PRIM_TER) || nome.split(' ')[0] || '';
    const foto = (document.getElementById('t-foto') || {}).src || d.foto_url || '';
    const a = typeof T_A !== 'undefined' ? T_A : ('a ' + prim);
    return { nome, prim, foto, a };
  }
  function montar(){
    const P = dadosPagina(), I = CAMP.info, A = P.a, Amai = A.charAt(0).toUpperCase() + A.slice(1);
    const fotoTag = P.foto ? `<img class="camp-foto" src="${esc(P.foto)}" alt="${esc(P.nome)}">` : '';
    document.getElementById('tela-orientacao').insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-camp"><div class="camp-lp">
  ${fotoTag}
  <span class="camp-selo">Teste gratuito · Travas mentais</span>
  <h1>Não é falta de força de vontade. <em>É uma trava mental.</em></h1>
  <p class="camp-sub">Você sabe o que precisa fazer e não faz? Cuida de todo mundo e se perde no caminho? Descubra quais das <b>10 travas mentais</b> estão mais ativas em você hoje.</p>
  <ul class="camp-chips"><li>100% gratuito</li><li>No celular, cerca de 7 minutos</li><li>Só ${esc(P.prim)} vê as suas respostas</li>${I.mostrar ? '<li>Você vê o seu mapa na hora</li>' : ''}</ul>
  <button type="button" class="btn btn-primario camp-btn" id="camp-comecar">Começar meu teste gratuito</button>
  <p class="camp-quem">${esc(Amai)} analisa o seu resultado pessoalmente e te mostra, em uma conversa online também gratuita, por onde começar.</p>
  <div class="camp-prova"><p>✔ Perguntas rápidas: você toca numa nota de 1 a 10.</p><p>✔ Não existe resposta certa ou errada.</p><p>✔ Pode fazer agora, no seu tempo, de onde estiver.</p></div>
</div></section>
<section class="tela" id="tela-camp-dados"><div class="camp-form">
  <button class="voltar" id="camp-voltar1" type="button">← Voltar</button>
  <h1>Antes de começar</h1>
  <p class="camp-sub">Para ${esc(A)} saber de quem é o resultado e te chamar para a conversa.</p>
  <div class="cartao">
    <div class="campo"><label for="camp-nome">Nome e sobrenome</label><input id="camp-nome" type="text" autocomplete="name" placeholder="Ex.: Ana Souza"></div>
    <div class="campo"><label for="camp-zap">WhatsApp com DDD</label><input id="camp-zap" type="tel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></div>
    <div class="camp-como"><b>Como responder</b><ul>
      <li>Pense em como você está <b>hoje</b>.</li>
      <li>Toque numa nota de <b>1</b> (não tem nada a ver comigo) a <b>10</b> (me descreve totalmente).</li>
      <li>Vá no primeiro impulso. Você tem ${I.duracao} minutos, mas a maioria termina em cerca de 7.</li></ul></div>
    <p class="camp-erro" id="camp-erro" role="alert"></p>
    <button class="btn btn-primario camp-btn" id="camp-ir" type="button">Começar as perguntas</button>
    <p class="camp-quem" style="text-align:center">Ao tocar em “Começar as perguntas”, você concorda que as suas respostas sejam enviadas para ${esc(A)}, que vai mantê-las em sigilo.</p>
  </div>
</div></section>
<section class="tela" id="tela-camp-perfil"><div class="camp-form">
  <h1>Pronto! Só mais um passo</h1>
  <p class="camp-sub">Para ${esc(A)} preparar a sua análise com mais cuidado.</p>
  <div class="cartao">
    <div class="campo"><label for="camp-idade">Sua idade</label><input id="camp-idade" type="number" inputmode="numeric" min="10" max="110" placeholder="Ex.: 34"></div>
    <div class="campo"><label for="camp-genero">Gênero</label><select id="camp-genero"><option value="">Escolha</option><option>Feminino</option><option>Masculino</option><option>Prefiro não informar</option></select></div>
    <div class="campo"><label for="camp-dor">O que mais tem pesado para você hoje? <span class="opc">(opcional)</span></label><textarea id="camp-dor" rows="3" placeholder="Escreva do seu jeito, em poucas palavras"></textarea></div>
    <div class="campo"><label for="camp-email">E-mail <span class="opc">(opcional)</span></label><input id="camp-email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com"></div>
    <p class="camp-erro" id="camp-erro2" role="alert"></p>
    <button class="btn btn-primario camp-btn" id="camp-enviar" type="button">${I.mostrar ? 'Ver o meu resultado' : 'Enviar para ' + esc(A)}</button>
  </div>
</div></section>`);
    const bt = document.getElementById('bt-aviso'); if(bt) bt.textContent = 'Sem pressa: a maioria termina em cerca de 7 minutos.';
    if(typeof mascaraTelefone === 'function') mascaraTelefone(document.getElementById('camp-zap'));
    document.getElementById('camp-comecar').addEventListener('click', () => { evento('comecar'); mostrarTela('#tela-camp-dados'); setTimeout(() => document.getElementById('camp-nome').focus(), 150); });
    document.getElementById('camp-voltar1').addEventListener('click', () => mostrarTela('#tela-camp'));
    document.getElementById('camp-ir').addEventListener('click', entrar);
    document.getElementById('camp-enviar').addEventListener('click', enviarPerfil);
    embrulhar();
    clearTimeout(seguranca);
    mostrarTela('#tela-camp');
    H.classList.remove('camp-espera');
  }

  /* 3) nome + WhatsApp, abre a vaga (cronômetro de 30 min) e vai direto para as perguntas */
  async function entrar(){
    const b = document.getElementById('camp-ir'), erro = document.getElementById('camp-erro');
    const nome = document.getElementById('camp-nome').value.trim().replace(/\s+/g, ' '), zap = document.getElementById('camp-zap').value.trim();
    erro.textContent = '';
    if(nome.split(' ').length < 2 || nome.length < 5){ erro.textContent = 'Escreva o seu nome e sobrenome.'; return; }
    if(zap.replace(/\D/g, '').length < 10){ erro.textContent = 'Escreva o seu WhatsApp com DDD.'; return; }
    evento('contato', null, { nome, whatsapp:zap });
    b.disabled = true; b.textContent = 'Abrindo o teste...';
    estado.codigo = COD; estado.mostrarResultado = CAMP.info.mostrar; estado.urgencia = CAMP.info.urgencia;
    estado.urg = null; estado.acaoToken = null; estado.salvou = undefined; estado.acesso = null;
    let ac = CAMP.info.compartilhado ? await compIniciar(COD) : { ok:true };
    if(!ac.ok && /tempo/i.test(ac.msg || '')){   // voltou depois de o tempo acabar: abre uma vaga nova
      try{ localStorage.removeItem((typeof CHAVE_ACESSO !== 'undefined' ? CHAVE_ACESSO : '') + COD); }catch(e){}
      ac = await compIniciar(COD);
    }
    b.disabled = false; b.textContent = 'Começar as perguntas';
    if(!ac.ok){ erro.textContent = ac.msg || 'Não consegui abrir agora. Confira a internet e tente de novo.'; evento('erro', null, {}); return; }
    estado.nome = nome; estado.whatsapp = zap;
    const cn = document.getElementById('campo-nome'), cz = document.getElementById('campo-whats'), cc = document.getElementById('campo-consent');
    if(cn) cn.value = nome; if(cz) cz.value = zap; if(cc) cc.checked = true;
    estado.indice = 0; estado.inicio = Date.now(); estado.respostas = new Array(PERGUNTAS.length).fill(null);
    CAMP.comecou = true; CAMP.maior = 0;
    evento('perguntas');
    mostrarTela('#tela-teste'); desenharPergunta();
  }

  /* 4) as perguntas já aparecem sem número e com incentivo a cada 5 para todo mundo (TX_INC); aqui só se registra o avanço */
  function embrulhar(){
    const desenhar0 = window.desenharPergunta;
    window.desenharPergunta = function(){
      const r = desenhar0.apply(this, arguments);
      if(CAMP.ativo){
        const i = estado.indice;
        if(i > CAMP.maior){ CAMP.maior = i; evento('pergunta', i); }
      }
      return r;
    };
    const finalizar0 = window.finalizar;
    window.finalizar = async function(){
      if(!CAMP.ativo) return finalizar0.apply(this, arguments);
      if(!CAMP.perfilFeito){ evento('fim_perguntas', PERGUNTAS.length); mostrarTela('#tela-camp-perfil'); return; }
      const r = await finalizar0.apply(this, arguments);
      CAMP.concluiu = true;
      evento('concluiu', PERGUNTAS.length, { exibicao:estado.acesso ? estado.acesso.exibicao : COD });
      return r;
    };
    if(typeof window.compExpirou === 'function'){ const exp0 = window.compExpirou; window.compExpirou = function(){ evento('expirou', CAMP.maior); return exp0.apply(this, arguments); }; }
    /* cliques no WhatsApp depois do teste */
    document.addEventListener('click', ev => {
      const a = ev.target.closest && ev.target.closest('a[href*="wa.me"]'); if(!a || !CAMP.ativo) return;
      const tela = a.closest('.tela'); if(tela && /tela-(obrigada|resultado)/.test(tela.id)) evento('whatsapp', PERGUNTAS.length);
    }, true);
    /* saiu da página (fechou, trocou de app) e voltou */
    let fora = false;
    const sair = () => { if(fora || !CAMP.ativo || CAMP.concluiu) return; fora = true; evento('saiu', CAMP.maior); };
    document.addEventListener('visibilitychange', () => { if(document.hidden) sair(); else if(fora){ fora = false; if(!CAMP.concluiu) evento('voltou', CAMP.maior); } });
    window.addEventListener('pagehide', sair);
  }
  function enviarPerfil(){
    const idade = document.getElementById('camp-idade').value.trim(), genero = document.getElementById('camp-genero').value, erro = document.getElementById('camp-erro2');
    erro.textContent = '';
    if(!(+idade >= 10 && +idade <= 110)){ erro.textContent = 'Escreva a sua idade.'; return; }
    if(!genero){ erro.textContent = 'Escolha uma opção de gênero.'; return; }
    estado.idade = idade; estado.genero = genero;
    estado.dor = document.getElementById('camp-dor').value.trim(); estado.email = document.getElementById('camp-email').value.trim();
    estado.profissao = estado.profissao || ''; estado.renda = estado.renda || ''; estado.motivo = estado.motivo || 'Anúncio (teste gratuito)'; estado.olhar = estado.olhar || '';
    CAMP.perfilFeito = true;
    window.finalizar();
  }
})();

/* ============================================================================
   ÁREA DA TERAPEUTA: aba "Histórico de campanha" (só aparece para quem tem link de campanha)
   ============================================================================ */
(function(){
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const hora = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
  const ROT = { chegou:'Chegou na página', comecar:'Tocou em “Começar”', contato:'Deixou nome e WhatsApp', perguntas:'Começou as perguntas', pergunta:'Respondeu até a pergunta',
    fim_perguntas:'Respondeu as 50 perguntas', concluiu:'Enviou o teste', whatsapp:'Clicou no WhatsApp', saiu:'Saiu da página', voltou:'Voltou para a página', expirou:'O tempo de 30 min acabou', erro:'Erro ao abrir o teste' };
  let montado = false, dados = [], codigos = [], periodo = 'tudo', codSel = '';
  function vigiar(){
    const adm = document.getElementById('painel-admin');
    if(!adm || !('MutationObserver' in window)) return;
    const ver = () => { if(adm.classList.contains('ver') && !montado) montar(adm); };
    new MutationObserver(ver).observe(adm, { attributes:true, attributeFilter:['class'] }); ver();
  }
  async function montar(adm){
    if(typeof clienteMembros !== 'function') return;
    montado = true;
    const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session){ montado = false; return; }
    const rc = await c.from('travas_codigos').select('codigo,cliente,criado_em').eq('terapeuta_id', sess.session.user.id).eq('campanha', true).order('criado_em', { ascending:false });
    codigos = rc.data || []; if(!codigos.length) return;
    const ancora = (document.getElementById('alt-teste') || {}).closest ? document.getElementById('alt-teste').closest('.campo') : null;
    const box = document.createElement('details'); box.className = 'camp-hist'; box.id = 'camp-hist';
    box.innerHTML = '<summary>Histórico de campanha<small>Quem chegou pelo link do anúncio e até onde foi no teste</small></summary><div id="camp-hist-in"><p>Carregando...</p></div>';
    if(ancora) ancora.parentNode.insertBefore(box, ancora); else adm.insertBefore(box, adm.firstChild);
    box.addEventListener('toggle', () => { if(box.open) carregar(); });
  }
  async function carregar(){
    const c = clienteMembros();
    const r = await c.from('campanha_sessoes').select('*').order('chegou_em', { ascending:false }).limit(2000);
    dados = r.data || []; desenhar();
  }
  function filtrados(){
    const agora = Date.now(), lim = periodo === 'hoje' ? new Date(new Date().toDateString()).getTime() : periodo === '7' ? agora - 7 * 864e5 : 0;
    return dados.filter(s => (!codSel || s.codigo === codSel) && new Date(s.chegou_em).getTime() >= lim);
  }
  function status(s){
    if(s.concluiu_em) return ['Terminou o teste', 'ok'];
    if(s.maior_pergunta > 0) return ['Parou depois de ' + s.maior_pergunta + ' de 50 perguntas', 'meio'];
    if(s.perguntas_em) return ['Abriu as perguntas e não respondeu', 'meio'];
    if(s.contato_em) return ['Deixou contato e não começou', 'meio'];
    if(s.comecou_em) return ['Tocou em começar e saiu', 'fora'];
    return ['Saiu na página inicial', 'fora'];
  }
  function desenhar(){
    const el = document.getElementById('camp-hist-in'), L = filtrados(), n = L.length || 1;
    const cnt = f => L.filter(f).length;
    const etapas = [['Chegaram pelo link', L.length], ['Tocaram em “Começar”', cnt(s => s.comecou_em)], ['Deixaram nome e WhatsApp', cnt(s => s.contato_em)],
      ['Responderam 10 ou mais', cnt(s => s.maior_pergunta >= 10)], ['Responderam 25 ou mais', cnt(s => s.maior_pergunta >= 25)], ['Responderam 40 ou mais', cnt(s => s.maior_pergunta >= 40)],
      ['Terminaram o teste', cnt(s => s.concluiu_em)], ['Clicaram no WhatsApp no final', cnt(s => s.whatsapp_em)]];
    const link = cod => location.origin + location.pathname + '?t=' + encodeURIComponent(window.T_SLUG || '') + '&c=' + encodeURIComponent(cod);
    const prim = typeof PRIM_TER !== 'undefined' ? PRIM_TER : '';
    el.innerHTML = `<div class="camp-filtros">
        ${codigos.length > 1 ? `<select id="camp-cod"><option value="">Todos os links</option>${codigos.map(x => `<option value="${esc(x.codigo)}"${x.codigo === codSel ? ' selected' : ''}>${esc(x.codigo)}${x.cliente ? ' · ' + esc(x.cliente) : ''}</option>`).join('')}</select>` : `<span style="font-size:14px;align-self:center">Link ${esc(codigos[0].codigo)}${codigos[0].cliente ? ' · ' + esc(codigos[0].cliente) : ''}</span>`}
        ${['hoje', '7', 'tudo'].map(p => `<button type="button" data-per="${p}" class="${periodo === p ? 'ativa' : ''}">${p === 'hoje' ? 'Hoje' : p === '7' ? '7 dias' : 'Tudo'}</button>`).join('')}
        <button type="button" id="camp-atu">Atualizar</button></div>
      <div class="camp-funil">${etapas.map(e => `<div class="camp-f"><span>${e[0]}</span><b>${e[1]} <small style="font-weight:500;color:#8A97A0">${Math.round(e[1] / n * 100)}%</small></b><span class="tr"><i style="width:${Math.round(e[1] / n * 100)}%"></i></span></div>`).join('')}</div>
      <p style="font-size:13px;color:#6B7486;margin:0 0 10px">O registro começou em ${dados.length ? hora(dados[dados.length - 1].chegou_em) : 'agora'}. Antes disso, o site não guardava esses passos.</p>
      <div class="camp-pess">${L.slice(0, 300).map(s => { const st = status(s), ev = Array.isArray(s.eventos) ? s.eventos : [];
        const resumo = []; let ultimaP = 0;
        ev.forEach(x => { if(x.e === 'pergunta'){ ultimaP = x.p; return; } if(ultimaP){ resumo.push({ e:'pergunta', p:ultimaP, em:x.em }); ultimaP = 0; } resumo.push(x); });
        if(ultimaP) resumo.push({ e:'pergunta', p:ultimaP });
        const msg = 'Oi, ' + String(s.nome || '').split(' ')[0] + '! Aqui é ' + (prim ? 'a ' + prim : '') + '. Vi que você começou o Teste de Travas Mentais e não chegou a terminar. Quer terminar agora? Leva cerca de 7 minutos e eu analiso o seu resultado pessoalmente: ' + link(s.codigo);
        const zap = String(s.whatsapp || '').replace(/\D/g, ''), zapN = zap.length === 10 || zap.length === 11 ? '55' + zap : zap;
        return `<div class="camp-p"><div class="top"><span class="nm">${s.nome ? esc(s.nome) : 'Visitante sem contato'}</span><span class="st ${st[1]}">${esc(st[0])}</span></div>
          <div class="sub">${hora(s.chegou_em)} · ${esc(s.origem || 'origem desconhecida')}${s.aparelho ? ' · ' + esc(s.aparelho) : ''}${s.whatsapp ? ' · ' + esc(s.whatsapp) : ''}${s.exibicao ? ' · ' + esc(s.exibicao) : ''}</div>
          <details><summary>Linha do tempo</summary><ol>${resumo.map(x => `<li>${esc(ROT[x.e] || x.e)}${x.e === 'pergunta' || (x.e === 'saiu' && x.p) ? ' ' + (x.e === 'saiu' ? '(na pergunta ' + x.p + ')' : x.p) : ''}${x.em ? ' · ' + hora(x.em) : ''}</li>`).join('')}</ol></details>
          ${zapN && !s.concluiu_em ? `<div class="acoes"><a class="mini-btn" target="_blank" rel="noopener" href="https://wa.me/${zapN}?text=${encodeURIComponent(msg)}">Chamar para terminar</a></div>` : ''}</div>`; }).join('') || '<p>Ninguém chegou pelo link neste período.</p>'}</div>`;
    el.querySelectorAll('[data-per]').forEach(b => b.addEventListener('click', () => { periodo = b.dataset.per; desenhar(); }));
    const sc = document.getElementById('camp-cod'); if(sc) sc.addEventListener('change', () => { codSel = sc.value; desenhar(); });
    document.getElementById('camp-atu').addEventListener('click', carregar);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vigiar); else vigiar();
})();
