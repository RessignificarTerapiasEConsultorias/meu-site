/* ============================================================================
   PLANO DE RESSIGNIFICAÇÃO (área da terapeuta, no painel dos Mapas)
   - Aba "Planos": a lista dos planos da terapeuta e o "Novo Plano".
   - No detalhe de um Mapa da Vida: "Criar Plano de Ressignificação", já preenchido.
   - Editor com os 13 campos, a etapa (sessão 1, 6 ou 12), salvar, excluir, PDF (A4) e enviar ao cliente.
   Tabela: planos_ressignificacao (a terapeuta só vê e mexe nos próprios). Ao salvar com as datas de reteste,
   o servidor marca a próxima aplicação dos Mapas vinculados.
   O cliente lê e confirma pela página pública /plano/?p=<token> (plano_publico e plano_ciente).
   A leitura do plano e os gráficos ficam em mapas-nucleo.js (os mesmos na área, no PDF e na página do cliente).
   ============================================================================ */
const PL_COLS = 'id,cliente,whatsapp,codigos,dados,etapa,token,ciente_em,ciente_nome,criado_em,atualizado_em';
const PL_TEXTO_CAMPO = {
  queixa:'O que a pessoa trouxe na anamnese da sessão 1, com as palavras dela.',
  motivo:'Por que resolver isso agora (Passo 1).',
  objetivo:'Uma meta mensurável para os 90 dias, combinada com o cliente (Passo 2).',
  bloqueio:'O que trava (Passo 3).',
  causa:'Hipótese da causa raiz (Passo 4). Pistas: Mapa do Caráter, Raízes em Família e a entrevista.',
  passos:'As tarefas da semana, uma por linha.',
  planejamento:'O próximo ciclo (Passo 6): quais áreas vêm depois.',
  indicadores:'A nota de impacto de hoje e a meta, e o que mais for medir a evolução.',
  cuidados:'Alertas que pedem médico, psicólogo ou outro serviço.'
};
const pl = { id:null, cliente:'', whatsapp:'', codigos:{}, dados:{}, etapa:1, token:null, ciente_em:null, ciente_nome:null, atualizado_em:null, H:{}, U:{} };
let plLista = [], plCods = {};

async function plSessao(){ const c = clienteMembros(), { data:sess } = await c.auth.getSession(); return sess && sess.session ? { c, uid:sess.session.user.id } : null; }
const plLinkPublico = token => location.origin + '/plano/?p=' + encodeURIComponent(token);
function plMontar(){
  if(document.getElementById('ma-aba-planos')) return;
  const abas = document.getElementById('ma-abas'), det = document.getElementById('ma-detalhe'); if(!abas || !det) return;
  abas.insertAdjacentHTML('beforeend', '<button type="button" data-ma-aba="planos">Planos</button>');
  abas.querySelector('[data-ma-aba=planos]').addEventListener('click', () => maAdminAba('planos'));
  det.insertAdjacentHTML('beforebegin', `<div id="ma-aba-planos" style="display:none">
      <p class="secao-sub">O Plano de Ressignificação reúne, em 13 campos, o caminho das 12 sessões. Ele puxa os dados do Mapa da Vida e do Mapa da Procrastinação, e o cliente lê e confirma por um link.</p>
      <button type="button" class="btn btn-argila" id="pl-novo">Novo Plano</button>
      <h3 style="font-size:19px;margin:22px 0 12px">Planos criados</h3>
      <div id="pl-lista"><div class="vazio">Nenhum plano ainda.</div></div></div>`);
  det.insertAdjacentHTML('afterend', '<div id="pl-editor" style="display:none"></div>');
  document.getElementById('pl-novo').addEventListener('click', () => plNovo({}));
}
async function plCarregarCodigos(s){
  const { data } = await s.c.from('travas_codigos').select('codigo,cliente,usado_por,teste,criado_em').eq('terapeuta_id', s.uid).in('teste', MA_PLANO_TESTES).order('criado_em', { ascending:false }).limit(500);
  plCods = {}; MA_PLANO_TESTES.forEach(t => { plCods[t] = []; }); (data || []).forEach(x => { if(plCods[x.teste]) plCods[x.teste].push(x); });
}
async function plCarregar(){
  const caixa = document.getElementById('pl-lista'); if(!caixa) return;
  caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const s = await plSessao(); if(!s){ caixa.innerHTML = maErro('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  const { data, error } = await s.c.from('planos_ressignificacao').select(PL_COLS).eq('terapeuta_id', s.uid).order('atualizado_em', { ascending:false }).limit(300);
  if(error){ caixa.innerHTML = maErro('Não consegui carregar os planos agora.'); return; }
  plLista = data || [];
  if(!plLista.length){ caixa.innerHTML = '<div class="vazio">Nenhum plano ainda. Crie o primeiro acima ou a partir de um Mapa da Vida.</div>'; return; }
  caixa.innerHTML = plLista.map(p => `<button type="button" class="linha-item" data-pl-id="${maEsc(p.id)}"><span class="esq"><span class="nome">${maEsc(p.cliente || 'Sem nome')}</span>
      <span class="sub">${PL_ETAPAS[p.etapa] || 'Sessão ' + p.etapa} · atualizado em ${maQuando(p.atualizado_em)}${MA_PLANO_TESTES.filter(t => p.codigos && p.codigos[t]).map(t => ' · ' + PL_NOMES[t].replace(/^Mapa (da |do )?/, '') + ' ' + maEsc(p.codigos[t])).join('')}</span>
      <span class="tags-int">${p.ciente_em ? '<span class="tag-int pl-ok">Aceito em ' + maData(p.ciente_em) + '</span>' : '<span class="tag-int pl-pend">Aguardando o aceite</span>'}</span></span></button>`).join('');
  caixa.querySelectorAll('[data-pl-id]').forEach(b => b.addEventListener('click', () => plAbrir(plLista.find(x => x.id === b.dataset.plId))));
}
function plUsar(row, pre){
  row = row || {}; pre = pre || {};
  Object.assign(pl, { id:row.id || null, cliente:row.cliente || pre.cliente || '', whatsapp:row.whatsapp || pre.whatsapp || '', codigos:Object.assign({}, row.codigos || pre.codigos || {}),
    dados:JSON.parse(JSON.stringify(row.dados || {})), etapa:row.etapa || 1, token:row.token || null, ciente_em:row.ciente_em || null, ciente_nome:row.ciente_nome || null, atualizado_em:row.atualizado_em || null,
    H:{}, U:{} });
  if(!Array.isArray(pl.dados.sessoes) || pl.dados.sessoes.length !== 12) pl.dados.sessoes = plSessoesPadrao();
}
async function plAbrir(row){ if(!row) return; plUsar(row); plMostrarEditor('<div class="carregando">Abrindo o plano...</div>'); await plVinculos(); plDesenhar(); }
async function plNovo(pre){
  plUsar(null, pre); plMostrarEditor('<div class="carregando">Preparando o plano...</div>');
  await plVinculos(); plPreencher(); plDesenhar();
}
function plMostrarEditor(html){
  ['codigos', 'respostas', 'planos'].forEach(k => { const e = document.getElementById('ma-aba-' + k); if(e) e.style.display = 'none'; });
  document.getElementById('ma-detalhe').style.display = 'none';
  document.querySelectorAll('#ma-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.maAba === 'planos'));
  const ed = document.getElementById('pl-editor'); ed.style.display = 'block'; ed.innerHTML = html; window.scrollTo({ top:0, behavior:'auto' });
}
/* os Mapas vinculados: o histórico (para o reteste) e a última resposta (para preencher) */
const PL_NOMES = { vida:'Mapa da Vida', procrastinacao:'Mapa da Procrastinação', profissional:'Mapa Profissional', autoestima:'Mapa da Autoestima', dinheiro:'Mapa do Dinheiro' };
async function plVinculos(){
  const s = await plSessao(); if(!s) return;
  if(!MA_PLANO_TESTES.some(t => (plCods[t] || []).length)) await plCarregarCodigos(s);
  const um = async teste => {
    const cod = pl.codigos[teste]; if(!cod) return [[], null];
    const [h, u] = await Promise.all([s.c.rpc('mapa_historico_terapeuta', { p_teste:teste, p_codigo:cod }),
      s.c.from(teste + '_respostas').select('dados,criado_em').eq('terapeuta_id', s.uid).eq('codigo', cod).order('criado_em', { ascending:false }).limit(1)]);
    return [Array.isArray(h.data) ? h.data : [], u.data && u.data[0] ? u.data[0].dados : null];
  };
  const res = await Promise.all(MA_PLANO_TESTES.map(um));
  pl.H = {}; pl.U = {}; MA_PLANO_TESTES.forEach((t, i) => { pl.H[t] = res[i][0]; pl.U[t] = res[i][1]; });
}
/* o que vem dos Mapas: só preenche o que ainda está vazio */
function plSugestoes(){
  const U = pl.U || {}, v = U.vida, p = U.procrastinacao, o = {}, bloq = [], cuid = [];
  if(v){
    if(v.foco_nome || v.impacto != null) o.motivo = [v.foco_nome, v.impacto != null ? 'impacto ' + maNum(v.impacto) + '/10' : ''].filter(Boolean).join(' · ');
    const t3 = v.top3 || []; if(t3.length > 1) o.planejamento = t3.slice(1, 3).map(a => a.nome).join(', depois ');
    if(v.impacto != null) o.indicadores = 'Impacto ' + maNum(v.impacto) + '/10 hoje · meta __/10';
    const cu = v.cuidado || {};
    if(cu.pensamentos) cuid.push('Você não está só. Se precisar conversar agora, ligue 188 (CVV), 24 horas e gratuito, ou acesse cvv.org.br. Procure também um psicólogo ou um médico.');
    if(cu.substancias) cuid.push('Vale procurar um médico ou o CAPS AD da sua cidade.');
    if(cu.tratamento) cuid.push('Este trabalho acontece junto com o seu tratamento médico ou psiquiátrico, nunca no lugar dele.');
  }
  if(p){
    const pf = p.perfis || [];
    if(pf.length) bloq.push(pf.map(x => x.nome).join(' e ') + ' (Mapa da Procrastinação)');
    else { const pr = (p.areas || []).filter(a => a.faixa === 'prioridade').map(a => a.nome); if(pr.length) bloq.push(pr.join(', ') + ' em prioridade (Mapa da Procrastinação)'); }
    if(pf.length) o.sugestao = pf.map(x => 'Sugestão pelo perfil ' + x.nome + ': ' + x.foco).join('\n');
  }
  ['autoestima', 'dinheiro'].forEach(t => { const x = U[t]; if(x && (x.top2 || []).length) bloq.push(x.top2.map(a => a.nome).join(' e ') + ' (' + PL_NOMES[t] + ')'); });
  if(U.profissional){ const en = (U.profissional.energia || []).filter(a => a && typeof a === 'object' && a.faixa === 'prioridade').map(a => a.nome);
    if(en.length) bloq.push(en.join(' e ') + ' em prioridade (Mapa Profissional, energia no trabalho)'); }
  if(bloq.length) o.bloqueio = bloq.join('\n');
  MA_PLANO_TESTES.filter(t => t !== 'vida').forEach(t => (((U[t] || {}).alertas) || []).forEach(a => { if(a && a.texto && !a.so_terapeuta && cuid.indexOf(a.texto) < 0) cuid.push(a.texto); }));
  if(cuid.length) o.cuidados = cuid.join('\n');
  return o;
}
function plPreencher(){
  const o = plSugestoes(); let n = 0;
  Object.keys(o).forEach(k => { if(!String(pl.dados[k] || '').trim()){ pl.dados[k] = o[k]; n++; } });
  return n;
}
function plOpcoes(teste){
  const atual = pl.codigos[teste] || '', lista = (plCods[teste] || []).slice();
  if(atual && !lista.some(x => x.codigo === atual)) lista.unshift({ codigo:atual });
  return `<option value="">Sem ${PL_NOMES[teste]}</option>` + lista.map(x => `<option value="${maEsc(x.codigo)}"${x.codigo === atual ? ' selected' : ''}>${maEsc((x.usado_por || x.cliente || 'Sem nome') + ' · ' + x.codigo)}</option>`).join('');
}
function plDesenhar(msg){
  const d = pl.dados, ta = (k, linhas) => `<textarea data-pl="${k}" rows="${linhas || 3}" placeholder="${maEsc(PL_TEXTO_CAMPO[k] || '')}">${maEsc(d[k] || '')}</textarea>`;
  const campo = c => {
    let corpo;
    if(c.k === 'mapa') corpo = plBloco('mapa', pl, pl.H);
    else if(c.k === 'sessoes') corpo = PL_MESES.map(([m, rot]) => `<p class="pl-sess-n" style="margin:12px 0 2px">${rot}</p>` + d.sessoes.slice((m - 1) * 4, m * 4).map((x, j) => { const i = (m - 1) * 4 + j;
        return `<div class="pl-sess"><span class="pl-sess-n">Sessão ${i + 1}</span><input type="text" data-pl-s="${i}" data-c="titulo" value="${maEsc(x.titulo || '')}" aria-label="Título da sessão ${i + 1}">
          <textarea data-pl-s="${i}" data-c="tecnica" rows="2" placeholder="Objetivo e técnica da sessão" aria-label="Objetivo e técnica da sessão ${i + 1}">${maEsc(x.tecnica || '')}</textarea></div>`; }).join('')).join('')
        + `<label class="pl-dica" for="pl-sug">Sugestões pelo Mapa da Procrastinação (aparecem para o cliente)</label><textarea id="pl-sug" data-pl="sugestao" rows="2">${maEsc(d.sugestao || '')}</textarea>`;
    else if(c.k === 'reteste') corpo = `<div class="pl-duas"><label>Reteste da sessão 6<input type="date" data-pl="reteste6" value="${maEsc(d.reteste6 || '')}"></label><label>Reteste da sessão 12<input type="date" data-pl="reteste12" value="${maEsc(d.reteste12 || '')}"></label></div>
        <p class="pl-dica">Ao salvar, a próxima aplicação dos Mapas vinculados fica marcada para essas datas.</p>
        ${MA_PLANO_TESTES.map(t => maRetesteHTML(MA_BASE[t], pl.H[t], MA_BASE[t].NOME)).join('') || '<p class="pl-vazio">O gráfico de antes e agora aparece a partir da segunda aplicação de um Mapa vinculado.</p>'}`;
    else if(c.k === 'ciencia') corpo = plBloco('ciencia', pl, pl.H);
    else corpo = (PL_TEXTO_CAMPO[c.k] ? `<p class="pl-dica">${maEsc(PL_TEXTO_CAMPO[c.k])}</p>` : '') + ta(c.k, c.k === 'passos' || c.k === 'cuidados' ? 4 : 3);
    return `<div class="ma-secao pl-ed-campo"><h3><span class="pl-n">${c.n}</span>${maEsc(c.t)}</h3>${corpo}</div>`;
  };
  const status = pl.ciente_em ? `<div class="pl-status ok">Aceito por ${maEsc(pl.ciente_nome || '')} em ${maQuando(pl.ciente_em)}.</div>`
    : pl.id ? '<div class="pl-status">Salvo. Ainda aguardando o aceite do cliente.</div>' : '<div class="pl-status">Plano novo: salve para gerar o link do cliente.</div>';
  plMostrarEditor(`<button class="voltar" id="pl-voltar">← Voltar para os planos</button>
    <h2 style="font-size:24px;margin:6px 0 2px">Plano de Ressignificação</h2>
    ${status}<div class="pl-msg" id="pl-msg" role="status">${msg ? maEsc(msg) : ''}</div>
    <div class="ma-secao"><h3 style="margin:0 0 8px">Cliente e Mapas</h3>
      <div class="campo"><label for="pl-cliente">Nome do cliente</label><input id="pl-cliente" type="text" value="${maEsc(pl.cliente)}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="pl-whats">WhatsApp</label><input id="pl-whats" type="tel" value="${maEsc(pl.whatsapp)}" placeholder="(00) 00000-0000"></div>
      ${MA_PLANO_TESTES.map(t => `<div class="campo"><label for="pl-cod-${t}">${PL_NOMES[t]}</label><select id="pl-cod-${t}" data-pl-cod="${t}">${plOpcoes(t)}</select></div>`).join('')}
      <button type="button" class="mini-btn" id="pl-preencher">Preencher pelos Mapas (só os campos vazios)</button>
      <div class="campo" style="margin-top:14px"><label id="rot-pl-etapa">Etapa</label><div class="pl-etapa" role="radiogroup" aria-labelledby="rot-pl-etapa">${[1, 6, 12].map(e => `<button type="button" role="radio" aria-checked="${pl.etapa === e}" class="${pl.etapa === e ? 'ativa' : ''}" data-pl-etapa="${e}">${PL_ETAPAS[e]}</button>`).join('')}</div></div></div>
    ${PL_CAMPOS.map(campo).join('')}
    ${pl.token ? `<div class="ma-secao"><h3 style="margin:0 0 8px">Enviar ao cliente</h3><div class="pl-envio">
      <input type="text" readonly value="${maEsc(plLinkPublico(pl.token))}" aria-label="Link do plano para o cliente">
      ${zapNumero(pl.whatsapp) ? `<a class="btn btn-zap" id="pl-zap" href="#" target="_blank" rel="noopener"><span class="duas">Enviar ao cliente pelo WhatsApp<small>mensagem pronta com o link</small></span></a>` : `<a class="btn btn-zap" id="pl-zap" href="#" target="_blank" rel="noopener"><span class="duas">Enviar pelo WhatsApp<small>você escolhe o contato na hora</small></span></a>`}
      <button type="button" class="btn btn-contorno" id="pl-copiar">Copiar o link do plano</button></div></div>` : ''}
    <div class="pl-barra"><button type="button" class="btn btn-primario" id="pl-salvar">Salvar o plano</button><button type="button" class="btn btn-contorno" id="pl-pdf">Gerar PDF</button>
      ${pl.id ? '<button type="button" class="btn btn-contorno" id="pl-excluir">Excluir</button>' : ''}</div>`);
  const ed = document.getElementById('pl-editor');
  if(typeof mascaraTelefone === 'function') mascaraTelefone(document.getElementById('pl-whats'));
  document.getElementById('pl-voltar').addEventListener('click', () => maAdminAba('planos'));
  ed.querySelectorAll('[data-pl-etapa]').forEach(b => b.addEventListener('click', () => { plLer(); pl.etapa = +b.dataset.plEtapa;
    ed.querySelectorAll('[data-pl-etapa]').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); }));
  const trocar = teste => async e => { plLer(); pl.codigos[teste] = e.target.value || undefined; if(!pl.codigos[teste]) delete pl.codigos[teste];
    plMostrarEditor('<div class="carregando">Buscando o Mapa...</div>'); await plVinculos(); plDesenhar(); };
  ed.querySelectorAll('[data-pl-cod]').forEach(x => x.addEventListener('change', trocar(x.dataset.plCod)));
  document.getElementById('pl-preencher').addEventListener('click', () => { plLer(); const n = plPreencher(); plDesenhar(n ? n + (n === 1 ? ' campo preenchido' : ' campos preenchidos') + ' pelos Mapas. Revise antes de salvar.' : 'Nada para preencher: os campos que vêm dos Mapas já têm texto (ou não há Mapa vinculado).'); });
  document.getElementById('pl-salvar').addEventListener('click', plSalvar);
  document.getElementById('pl-pdf').addEventListener('click', () => { plLer(); plImprimir(); });
  const ex = document.getElementById('pl-excluir'); if(ex) ex.addEventListener('click', plExcluir);
  const zap = document.getElementById('pl-zap');
  if(zap){ zap.addEventListener('click', () => { plLer(); zap.href = 'https://wa.me/' + zapNumero(pl.whatsapp) + '?text=' + encodeURIComponent(plMensagem()); }); zap.href = 'https://wa.me/' + zapNumero(pl.whatsapp) + '?text=' + encodeURIComponent(plMensagem()); }
  const cp = document.getElementById('pl-copiar');
  if(cp) cp.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(plLinkPublico(pl.token)); cp.textContent = 'Link copiado!'; }catch(e){ cp.textContent = 'Não consegui copiar'; } setTimeout(() => { cp.textContent = 'Copiar o link do plano'; }, 2000); });
}
function plMensagem(){
  const prim = maPrim(pl.cliente);
  return [(prim ? 'Olá, ' + prim + '!' : 'Olá!') + ' Aqui é ' + maAp() + '.', '', 'Preparei o seu Plano de Ressignificação: o caminho das nossas sessões, os seus objetivos e como vamos medir a evolução.', '',
    'Leia com calma e, no final, confirme que está de acordo:', plLinkPublico(pl.token)].join('\n');
}
function plLer(){
  const ed = document.getElementById('pl-editor'); if(!ed || !document.getElementById('pl-cliente')) return;
  pl.cliente = document.getElementById('pl-cliente').value.trim().replace(/\s+/g, ' ');
  pl.whatsapp = document.getElementById('pl-whats').value.trim();
  ed.querySelectorAll('[data-pl]').forEach(e => { pl.dados[e.dataset.pl] = e.value; });
  ed.querySelectorAll('[data-pl-s]').forEach(e => { const s = pl.dados.sessoes[+e.dataset.plS]; if(s) s[e.dataset.c] = e.value; });
  ['reteste6', 'reteste12'].forEach(k => { if(!pl.dados[k]) delete pl.dados[k]; });
}
async function plSalvar(){
  plLer();
  const b = document.getElementById('pl-salvar'), msg = document.getElementById('pl-msg');
  if(pl.cliente.length < 2){ msg.textContent = 'Escreva o nome do cliente antes de salvar.'; return; }
  const s = await plSessao(); if(!s){ msg.textContent = 'A sua sessão expirou. Saia da área e entre de novo.'; return; }
  b.disabled = true; b.textContent = 'Salvando...';
  const corpo = { cliente:pl.cliente, whatsapp:pl.whatsapp || null, codigos:pl.codigos, dados:pl.dados, etapa:pl.etapa };
  const q = pl.id ? s.c.from('planos_ressignificacao').update(corpo).eq('terapeuta_id', s.uid).eq('id', pl.id)
                  : s.c.from('planos_ressignificacao').insert(Object.assign({ terapeuta_id:s.uid }, corpo));
  const { data, error } = await q.select(PL_COLS).single();
  b.disabled = false; b.textContent = 'Salvar o plano';
  if(error || !data){ msg.textContent = 'Não consegui salvar agora. Confira a internet e tente de novo.'; return; }
  const H = pl.H, U = pl.U;
  plUsar(data); Object.assign(pl, { H, U });
  plDesenhar('Plano salvo.' + (pl.dados.reteste6 || pl.dados.reteste12 ? ' As datas de reteste foram marcadas nos Mapas vinculados.' : ''));
}
async function plExcluir(){
  if(!pl.id || !confirm('Excluir o plano de ' + (pl.cliente || 'este cliente') + '?\n\nO link do cliente para de funcionar e não dá para recuperar depois.')) return;
  const s = await plSessao(); if(!s) return;
  const { data, error } = await s.c.from('planos_ressignificacao').delete().eq('terapeuta_id', s.uid).eq('id', pl.id).select('id');
  if(error || !data || !data.length){ alert('Não consegui excluir agora. Tente de novo em instantes.'); return; }
  maAdminAba('planos');
}
/* PDF: a mesma leitura da página do cliente, em A4, com a terapeuta no topo */
function plImprimir(){
  const f = document.querySelector('#tela-capa .moldura img'), foto = f && f.src ? `<img src="${maEsc(f.src)}" alt="">` : '';
  const titulo = (window.__T && __T.dados && __T.dados.titulo) || '';
  const html = `<div class="pl-rel"><header class="pl-rel-topo">${foto}<div><h1>Plano de Ressignificação</h1>
      <p><b>${maEsc(pl.cliente || '')}</b> · ${PL_ETAPAS[pl.etapa] || ''} · ${new Date().toLocaleDateString('pt-BR')}</p>
      <p>${maEsc((window.T_NOME || '') + (titulo ? ' · ' + titulo : ''))}</p></div></header>
    ${plVerHTML(pl, pl.H)}
    <p class="ma-nota-peq">${maEsc(PL_CIENCIA)}</p>
    <div class="pl-rel-rodape">Plano de Ressignificação · Mapas Ressignificar</div></div>`;
  const caixa = document.createElement('div'); caixa.id = 'pl-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('pl-imprimindo');
  const fim = () => { document.body.classList.remove('pl-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('pl-impressao')) fim(); }, 1500); }, 250);
}
window.plNovo = plNovo; window.plMontar = plMontar; window.plCarregar = plCarregar;
