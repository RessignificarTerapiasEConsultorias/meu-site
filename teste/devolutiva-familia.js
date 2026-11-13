/* ============================================================================
   TRAVAS EM FAMÍLIA · módulo da página do teste (só para quem tem dados.testes 'familia')
   Quem responde: pai, mãe ou responsável por uma criança de 6 a 12 anos.
   O cálculo é do servidor (familia_salvar / familia_calcular): a página só pergunta e desenha.
   O progresso fica só no celular (localStorage) até o envio final, com o consentimento marcado.
   ============================================================================ */
const FM_F = [['Nunca', 0], ['Raramente', 1], ['Às vezes', 2], ['Frequentemente', 3], ['Sempre', 4]];
const FM = {
  TRAVAS: [
    { k:'cobranca', nome:'Cobrança', txt:{ tranquilo:'Você consegue equilibrar exigência e acolhimento.', atencao:'A cobrança aparece com frequência. Vale observar em que momentos ela pesa mais.', prioridade:'A cobrança está alta: pesa em você e em quem convive com você.' } },
    { k:'explosao', nome:'Explosão', txt:{ tranquilo:'Você costuma manter a calma, mesmo nos dias difíceis.', atencao:'Às vezes a paciência acaba antes do que você gostaria.', prioridade:'A paciência anda curta, e a culpa costuma vir depois.' } },
    { k:'distancia', nome:'Distância', txt:{ tranquilo:'Você encontra espaço para presença e carinho.', atencao:'Nem sempre sobra energia para estar perto.', prioridade:'O cansaço e a dificuldade de demonstrar carinho estão criando distância.' } },
    { k:'controle', nome:'Controle', txt:{ tranquilo:'Você confia e deixa seu filho tentar.', atencao:'Às vezes a preocupação fala mais alto que a confiança.', prioridade:'A preocupação está alta e pode estar tirando espaço da autonomia dele(a).' } },
    { k:'esgotamento', nome:'Esgotamento', txt:{ tranquilo:'Você está conseguindo cuidar de si.', atencao:'O cansaço já dá sinais. Quem cuida também precisa de cuidado.', prioridade:'Você está carregando peso demais. Cuidar de você agora faz diferença para a casa toda.' } }
  ],
  AREAS: [
    { k:'aprendizagem', nome:'Aprendizagem', txt:{ tranquilo:'A leitura e a compreensão parecem acompanhar a idade.', atencao:'Há sinais de atenção na leitura ou na compreensão.', prioridade:'A aprendizagem pede um olhar cuidadoso agora.' },
      plano:'Começar por uma escuta da leitura e da compreensão: como lê, o que entende do que lê e onde trava no enunciado.' },
    { k:'rotina', nome:'Rotina de estudo', txt:{ tranquilo:'A rotina de estudo flui bem.', atencao:'Começar e persistir nas tarefas tem sido um desafio.', prioridade:'A rotina de estudo está pesada e precisa de apoio.' },
      plano:'Montar uma rotina curta e previsível de estudo, com começo, meio e fim, e treinar a autonomia aos poucos.' },
    { k:'emocoes', nome:'Emoções', txt:{ tranquilo:'Ele(a) lida bem com o erro e com as provas.', atencao:'O erro e as provas mexem com as emoções dele(a).', prioridade:'O erro e a pressão estão pesando nas emoções dele(a).' },
      plano:'Trabalhar a relação com o erro: nomear o que sente, reduzir a pressão antes das provas e celebrar o esforço.' },
    { k:'telas', nome:'Telas e relações', txt:{ tranquilo:'Telas e amizades parecem equilibradas.', atencao:'As telas estão ocupando espaço das relações.', prioridade:'As telas estão tomando o lugar do brincar e das amizades.' },
      plano:'Abrir espaço para o brincar e para os vínculos: combinados de tela e atividades em grupo.' }
  ],
  CONEXAO: { tranquilo:'Vocês têm uma boa conexão: conversa, tempo junto e espaço para sentir.', atencao:'A conexão existe, mas pede mais momentos só de vocês.', prioridade:'A conexão está pedindo atenção: mais conversa e mais tempo junto, sem cobrança.' },
  FAIXA: { tranquilo:'Tranquilo', atencao:'Atenção', prioridade:'Prioridade' },
  ELOS: {
    E1:{ tit:'Cobrança e medo de errar', txt:'Você se cobra muito, e seu filho tem sofrido quando erra. As crianças aprendem a lidar com o erro observando os adultos.', a:'cobranca', f:'emocoes' },
    E2:{ tit:'Clima emocional da casa', txt:'Paciência curta em casa e emoções à flor da pele no seu filho. Muitas vezes, a criança devolve o clima que sente.', a:'explosao', f:'emocoes' },
    E3:{ tit:'Presença e telas', txt:'Pouco tempo de conexão e muito tempo de tela. A tela costuma ocupar o espaço que a presença deixa.', a:'distancia', f:'telas' },
    E4:{ tit:'Proteção e autonomia', txt:'Você protege muito, e seu filho tem dificuldade de fazer sozinho. Quando o adulto faz por ela, a criança aprende que não consegue.', a:'controle', f:'rotina' },
    E5:{ tit:'Cansaço e rotina', txt:'O seu cansaço aparece na rotina de estudo do seu filho. Quem cuida também precisa de cuidado.', a:'esgotamento', f:'rotina' },
    E6:{ tit:'Escola em duas gerações', txt:'Dificuldade na escola em duas gerações. O que ninguém percebeu em você pode ser percebido a tempo no seu filho.', a:'h6', f:'aprendizagem' }
  },
  GERACAO:'E isso parece ter raízes na sua história. Não é culpa: é um padrão, e padrão pode ser ressignificado.',
  REPETICAO:'Você mesmo percebeu que repete coisas que não gostava. Perceber é o primeiro passo para mudar.',
  K1:[['tranquilo', 'Tranquilo'], ['algumas', 'Com algumas dificuldades'], ['muitas', 'Com muitas dificuldades'], ['recuperacao', 'Em recuperação ou com risco de repetir'], ['nao_sei', 'Não sei']],
  K2:[['deixar', 'Deixar como está'], ['escola', 'Conversar com a escola'], ['ajuda', 'Buscar ajuda especializada'], ['nao_sei', 'Ainda não sei']],
  R1:[['sim', 'Sim'], ['em_parte', 'Em parte'], ['ainda_nao', 'Ainda não'], ['nunca_pensei', 'Nunca tinha pensado nisso']],
  QUEM:[['pai', 'Pai'], ['mae', 'Mãe'], ['avo', 'Avô ou avó'], ['outro', 'Outro responsável']],
  STATUS:[['novo', 'Novo'], ['contatado', 'Contatado'], ['agendada', 'Avaliação agendada'], ['matriculado', 'Matriculado'], ['nao_seguiu', 'Não seguiu']],
  MOMENTO:{ inicial:'Inicial', meio:'Meio', continuidade:'Continuidade' },
  PRIO:{ alta:'Alta', media:'Média', baixa:'Baixa' },
  AVISO:'Este teste não é um diagnóstico e não substitui uma avaliação profissional. Se você estiver passando por um momento emocional difícil, procure ajuda; o CVV atende 24 horas pelo telefone 188.'
};
/* perguntas: [id, parte, escala, texto] · escalas: F, FN (com "Não sei"), F10, C4, K1, R1, K2 */
const FM_P = [
  ['a1', 1, 'F', 'Fico muito incomodado(a) quando as coisas não saem do jeito que planejei.'],
  ['a2', 1, 'F', 'Cobro de mim e da minha família mais do que consigo elogiar.'],
  ['a3', 1, 'F', 'Perco a paciência e falo mais alto do que gostaria.'],
  ['a4', 1, 'F', 'Depois de perder a paciência, sinto culpa ou arrependimento.'],
  ['a5', 1, 'F', 'Chego em casa sem energia para conversar ou brincar.'],
  ['a6', 1, 'F', 'Tenho dificuldade de demonstrar carinho com palavras ou abraço.'],
  ['a7', 1, 'F', 'Fico ansioso(a) pensando no que pode dar errado com meu filho.'],
  ['a8', 1, 'F', 'Prefiro fazer as coisas pelo meu filho a deixar ele(a) tentar sozinho(a).'],
  ['a9', 1, 'F', 'Durmo mal ou acordo cansado(a).'],
  ['a10', 1, 'F', 'Sinto que carrego peso demais e não tenho com quem dividir.'],
  ['h1', 2, 'F', '…eu era mais cobrado(a) do que elogiado(a).'],
  ['h2', 2, 'F', '…os adultos da casa explodiam ou brigavam na minha frente.'],
  ['h3', 2, 'F', '…eu sentia falta de presença, conversa ou carinho de quem cuidava de mim.'],
  ['h4', 2, 'F', '…eu tinha medo de errar ou de decepcionar.'],
  ['h5', 2, 'F', '…precisei assumir responsabilidades de adulto cedo.'],
  ['h6', 2, 'F', '…tive dificuldade na escola e ninguém percebeu ou me ajudou.'],
  ['h7', 2, 'F', 'Hoje me pego repetindo com meu filho coisas que eu não gostava que fizessem comigo.'],
  ['k1', 3, 'K1', 'Como seu filho está terminando o ano letivo?'],
  ['f1', 3, 'FN', 'Lê com dificuldade ou devagar para a idade dele(a).'],
  ['f2', 3, 'FN', 'Não entende o que leu ou o enunciado da tarefa.'],
  ['f3', 3, 'FN', 'A escola já comentou que ele(a) não acompanha a turma.'],
  ['f4', 3, 'FN', 'Enrola para começar a tarefa ou deixa para depois.'],
  ['f5', 3, 'FN', 'Desiste quando algo fica difícil.'],
  ['f6', 3, 'FN', 'Só faz a lição com um adulto do lado.'],
  ['f7', 3, 'FN', 'Fica irritado(a) ou chora quando erra.'],
  ['f8', 3, 'FN', 'Diz frases como "sou burro(a)" ou "não consigo".'],
  ['f9', 3, 'FN', 'Fica nervoso(a) ou com dor de barriga antes de prova.'],
  ['f10', 3, 'F10', 'Quanto tempo por dia seu filho fica em telas fora da escola?'],
  ['f11', 3, 'FN', 'Prefere a tela a brincar com primos, amigos ou a família.'],
  ['f12', 3, 'FN', 'Tem dificuldade de fazer ou manter amizades.'],
  ['c1', 4, 'F', 'Converso com meu filho sobre a escola sem ser para cobrar.'],
  ['c2', 4, 'F', 'Faço alguma atividade só com ele(a) durante a semana, sem tela.'],
  ['c3', 4, 'F', 'Quando ele(a) erra, minha primeira reação é brigar ou cobrar.'],
  ['c4', 4, 'C4', 'Sei em quais matérias ele(a) tem mais dificuldade.'],
  ['c5', 4, 'F', 'Meu filho me conta o que sente.'],
  ['r1', 5, 'R1', ''],
  ['k2', 5, 'K2', 'E para 2027, o que você pretende fazer pelo seu filho?']
];
const FM_PARTES = { 1:'Parte 1 · Você hoje', 2:'Parte 2 · Sua história', 3:'Parte 3 · Seu filho', 4:'Parte 4 · Vocês dois', 5:'Para fechar' };
const FM_ESCALA = {
  F:FM_F, FN:FM_F.concat([['Não sei', 'ns']]),
  F10:[['Menos de 1h', 0], ['1 a 2h', 1], ['2 a 3h', 2], ['3 a 4h', 3], ['Mais de 4h', 4], ['Não sei', 'ns']],
  C4:[['Sei bem', 0], ['Sei mais ou menos', 2], ['Não sei', 4]],
  K1:FM.K1.map(([v, t]) => [t, v]), R1:FM.R1.map(([v, t]) => [t, v]), K2:FM.K2.map(([v, t]) => [t, v])
};

/* ---------- utilidades ---------- */
const fmEsc = t => (typeof escV === 'function' ? escV(t) : String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]));
const fmPrim = n => String(n || '').trim().split(/\s+/)[0] || '';
const fmDig = v => String(v || '').replace(/\D/g, '');
const fmCfg = () => ((window.__T && __T.dados && __T.dados.familia) || {});
const fmNome = () => fmCfg().nome || 'Travas em Família';
const fmEspaco = () => fmCfg().espaco || ('Espaço Terapêutico ' + (window.T_NOME || ''));
const fmServ = k => ((fmCfg().servicos || {})[k]) || ({ pedagogica:'Intervenção Pedagógica e Acolhimento Avaliativo', orientacao:'Orientação para pais', adulto:'Atendimento individual do adulto' })[k] || k;
const fmZap = texto => 'https://wa.me/' + ((typeof CONFIG !== 'undefined' && CONFIG.whatsappNumero) || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
const fmFoto = () => fmCfg().logo || (document.getElementById('t-foto') || {}).src || ((window.__T && __T.dados && __T.dados.foto_url) || '');
const fmData = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
const fmQuando = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const fmUuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
const fmLS = { get:(k, p) => { try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : p; }catch(e){ return p; } }, set:(k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }, del:k => { try{ localStorage.removeItem(k); }catch(e){} } };
const fmChave = (c, s) => 't_' + (window.T_SLUG || '') + '_fm_' + c + (s ? '_' + s : '');
function fmLink(codigo, origem){
  const base = location.origin + '/familia/' + encodeURIComponent(window.T_SLUG || '') + '/';
  return base + '?c=' + encodeURIComponent(codigo) + (origem ? '&origem=' + encodeURIComponent(origem) : '');
}
function fmLinkDireto(codigo, origem){
  return location.origin + '/teste/?t=' + encodeURIComponent(window.T_SLUG || '') + '&c=' + encodeURIComponent(codigo) + '&f=1' + (origem ? '&origem=' + encodeURIComponent(origem) : '');
}
const fmPapel = q => q === 'pai' ? 'o pai' : q === 'mae' ? 'a mãe' : 'o adulto';
function fmTextoR1(quem){ return quem === 'pai' ? 'Hoje, você é o pai que gostaria de ter tido?' : quem === 'mae' ? 'Hoje, você é a mãe que gostaria de ter tido?' : 'Hoje, você é o adulto que gostaria de ter tido ao seu lado?'; }
async function fmRpc(nome, args){ try{ return await compRpc(nome, args); }catch(e){ return { ok:false, erro:'rede' }; } }

/* ---------- estado de quem responde ---------- */
const fm = { codigo:'', link:null, origem:'', cad:null, r:{}, parte2:null, texto:'', passos:[], i:0, outro:null, sessao:null, enviando:false };
function fmPassos(){
  const p = [];
  if(!fm.outro){
    FM_P.filter(x => x[1] === 1).forEach(x => p.push({ t:'q', q:x }));
    p.push({ t:'p2' });
    if(fm.parte2 === true){ FM_P.filter(x => x[1] === 2).forEach(x => p.push({ t:'q', q:x })); p.push({ t:'texto' }); }
  }
  FM_P.filter(x => x[1] >= 3).forEach(x => p.push({ t:'q', q:x }));
  return p;
}
function fmGuardar(){ fmLS.set(fmChave(fm.codigo, 'prog'), { cad:fm.cad, r:fm.r, parte2:fm.parte2, texto:fm.texto, i:fm.i, outro:fm.outro }); }
function fmEvento(e, p, dados){
  if(!fm.link || !fm.link.compartilhado || !fm.sessao) return;
  try{ clienteMembros().rpc('campanha_evento', { p_codigo:fm.codigo, p_sessao:fm.sessao, p_evento:e, p_pergunta:p || null, p_dados:dados || {} }).then(() => {}, () => {}); }catch(err){}
}

/* ---------- telas ---------- */
function fmMontarTelas(){
  if(document.getElementById('tela-fm')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-fm"><div id="fm-conteudo"></div></section>
<section class="tela" id="tela-fm-teste">
  <div class="fm-topo"><div class="progresso"><i id="fm-barra"></i></div><span class="fm-parte" id="fm-parte"></span></div>
  <div id="fm-pergunta" aria-live="polite"></div>
  <div class="fm-nav"><button class="btn btn-contorno" id="fm-voltar" type="button">← Voltar</button></div>
</section>
<section class="tela" id="tela-fm-resultado"><div id="fm-resultado"></div><div class="fm-rodape-fixo" role="note">${fmEsc(FM.AVISO)}</div></section>`);
  document.getElementById('fm-voltar').addEventListener('click', fmVoltar);
}
function fmMostrar(html){ fmMontarTelas(); document.getElementById('fm-conteudo').innerHTML = html; mostrarTela('#tela-fm'); window.scrollTo({ top:0, behavior:'auto' }); }
function fmSoltarTela(){ document.documentElement.classList.remove('camp-espera', 'fm-espera'); }
function fmAssumir(){ document.documentElement.classList.add('fm-ativo'); }

async function fmEntrar(codigo, r){
  fmMontarTelas();
  fm.codigo = String(codigo || '').toUpperCase(); fmAssumir();
  fmMostrar('<div class="carregando">Abrindo o teste...</div>'); fmSoltarTela();
  const info = await fmRpc('familia_link', { p_codigo:fm.codigo });
  if(!info || !info.ok){
    const feitos = fmLS.get(fmChave(fm.codigo, 'feitos'), []);
    if(feitos.length) return fmVoltarResultado(feitos[feitos.length - 1]);
    return fmMostrar(`<h1 class="tc-h1">${fmEsc(fmNome())}</h1><div class="aviso ver">${fmEsc((info && info.msg) || 'Não consegui abrir o teste agora. Confira a internet e tente de novo.')}</div>`);
  }
  fm.link = info;
  try{ const q = new URLSearchParams(location.search); fm.origem = (q.get('origem') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80); }catch(e){}
  if(info.compartilhado){ const k = fmChave(fm.codigo, 'sessao'); fm.sessao = fmLS.get(k, null); if(!fm.sessao){ fm.sessao = fmUuid(); fmLS.set(k, fm.sessao); } fmEvento('chegou', null, { origem:(info.origem || fm.origem || 'link').slice(0, 40), aparelho:matchMedia('(max-width: 820px)').matches ? 'celular' : 'computador' }); }
  const feitos = fmLS.get(fmChave(fm.codigo, 'feitos'), []), prog = fmLS.get(fmChave(fm.codigo, 'prog'), null);
  if(prog && prog.cad) return fmTelaRetomar(prog);
  if(feitos.length) return fmVoltarResultado(feitos[feitos.length - 1]);
  fmTelaAbertura();
}
function fmTelaAbertura(){
  const foto = fmFoto(), I = fm.link || {};
  fmMostrar(`<div class="fm-abertura">
    ${foto ? `<img class="fm-foto" src="${fmEsc(foto)}" alt="">` : ''}
    <span class="selo fm-selo">${fmEsc(fmEspaco())}</span>
    <h1 class="fm-h1">${fmEsc(I.nome_teste || fmNome())}</h1>
    <p class="fm-sub">Descubra o que você carrega da sua história e como isso aparece na vida do seu filho.</p>
    <ul class="fm-chips"><li>Leva cerca de 8 minutos</li><li>Uma pergunta por vez</li><li>${I.mostrar === false ? (fmEsc(window.T_PRIM || '') + ' te devolve o resultado') : 'Resultado na hora'}</li><li>Não é diagnóstico</li></ul>
    <button class="btn btn-primario fm-btn" id="fm-comecar" type="button">Começar</button>
    <p class="fm-txt" style="margin-top:18px">Para pais, mães e responsáveis por crianças de 6 a 12 anos (do 1º ao 6º ano). Não existe resposta certa ou errada: responda pensando nas últimas semanas.</p>
  </div>`);
  document.getElementById('fm-comecar').addEventListener('click', () => { fmEvento('comecar'); fmTelaCadastro(); });
}
function fmTelaRetomar(prog){
  fmMostrar(`<div class="fm-abertura"><h1 class="fm-h1">Bem-vindo(a) de volta</h1>
    <p class="fm-sub">Você parou no meio do ${fmEsc(fmNome())}${prog.cad && prog.cad.filho ? ' sobre ' + fmEsc(prog.cad.filho) : ''}. Quer continuar de onde parou?</p>
    <button class="btn btn-primario fm-btn" id="fm-continuar" type="button">Continuar de onde parei</button>
    <button class="btn btn-contorno fm-btn" id="fm-recomecar" type="button">Começar de novo</button></div>`);
  document.getElementById('fm-continuar').addEventListener('click', () => { Object.assign(fm, { cad:prog.cad, r:prog.r || {}, parte2:prog.parte2, texto:prog.texto || '', outro:prog.outro || null }); fm.passos = fmPassos(); fm.i = Math.min(prog.i || 0, fm.passos.length - 1); fmDesenhar(); });
  document.getElementById('fm-recomecar').addEventListener('click', () => { fmLS.del(fmChave(fm.codigo, 'prog')); Object.assign(fm, { cad:null, r:{}, parte2:null, texto:'', outro:null, i:0 }); fmTelaAbertura(); });
}
function fmTelaCadastro(){
  const pre = (fm.link && fm.link.prefill) || {}, c = fm.cad || {}, so = !!fm.outro;
  const v = (k, d) => fmEsc(c[k] != null ? c[k] : (pre[k] || d || ''));
  const quemSel = c.quem || pre.quem || '', anoSel = c.ano || pre.ano || '';
  fmMostrar(`<div class="fm-form">
    <button class="voltar" id="fm-cad-voltar" type="button">← Voltar</button>
    <h1 class="fm-h1 fm-h1-p">${so ? 'Agora, sobre o outro filho' : 'Antes de começar'}</h1>
    <p class="fm-sub">${so ? 'Suas respostas sobre você e sua história continuam valendo. Agora é só sobre ele(a).' : 'Rápido: é para o resultado sair no seu nome e no nome do seu filho.'}</p>
    <div class="cartao">
      ${so ? '' : `<div class="campo"><label for="fm-nome">Seu nome</label><input id="fm-nome" type="text" autocomplete="name" value="${v('nome')}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="fm-zap">Seu WhatsApp (com DDD)</label><input id="fm-zap" type="tel" inputmode="tel" autocomplete="tel" value="${v('whatsapp')}" placeholder="(00) 00000-0000"></div>
      <div class="campo"><label for="fm-email">Seu e-mail <span class="opc">(opcional)</span></label><input id="fm-email" type="email" inputmode="email" autocomplete="email" value="${v('email')}" placeholder="voce@email.com"></div>
      <div class="campo"><label id="fm-rot-quem">Quem está respondendo?</label><div class="fm-escolha" id="fm-quem" role="radiogroup" aria-labelledby="fm-rot-quem">${FM.QUEM.map(([k, t]) => `<button type="button" role="radio" data-v="${k}" aria-checked="${quemSel === k}" class="${quemSel === k ? 'ativa' : ''}">${t}</button>`).join('')}</div></div>`}
      <div class="campo"><label for="fm-filho">Nome do seu filho ou filha</label><input id="fm-filho" type="text" autocomplete="off" value="${so ? '' : v('filho')}" placeholder="Como você chama ele(a)"></div>
      <div class="campo"><label for="fm-ano">Ano escolar</label><select id="fm-ano"><option value="">Escolha</option>${['1', '2', '3', '4', '5', '6'].map(a => `<option value="${a}" ${!so && anoSel === a ? 'selected' : ''}>${a}º ano</option>`).join('')}<option value="outro" ${!so && anoSel === 'outro' ? 'selected' : ''}>Outro</option></select></div>
      <div class="campo"><label for="fm-escola">Escola <span class="opc">(opcional)</span></label><input id="fm-escola" type="text" value="${so ? '' : v('escola')}" placeholder="Nome da escola"></div>
      ${so ? '' : `<label class="fm-consent"><input type="checkbox" id="fm-ok" ${c.consent ? 'checked' : ''}><span>Autorizo o ${fmEsc(fmEspaco())} a usar estas respostas para me dar um retorno e entrar em contato comigo. Sei que este teste não é diagnóstico e que minhas respostas não serão compartilhadas com a escola sem a minha autorização.</span></label>`}
      <div class="aviso" id="fm-aviso-cad"></div>
      <button class="btn btn-primario fm-btn" id="fm-cad-ok" type="button">${so ? 'Continuar' : 'Começar o teste'}</button>
    </div></div>`);
  const zap = document.getElementById('fm-zap'); if(zap && typeof mascaraTelefone === 'function') mascaraTelefone(zap);
  document.querySelectorAll('#fm-quem button').forEach(b => b.addEventListener('click', () => document.querySelectorAll('#fm-quem button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on); })));
  document.getElementById('fm-cad-voltar').addEventListener('click', () => so ? fmVoltarResultado(fm.outro.ultimo) : fmTelaAbertura());
  document.getElementById('fm-cad-ok').addEventListener('click', () => {
    const val = id => (document.getElementById(id) || {}).value || '';
    const aviso = t => { const a = document.getElementById('fm-aviso-cad'); a.textContent = t; a.classList.add('ver'); };
    const filho = val('fm-filho').trim(), ano = val('fm-ano'), escola = val('fm-escola').trim();
    if(so){
      if(!filho) return aviso('Escreva o nome do seu filho ou filha.');
      if(!ano) return aviso('Escolha o ano escolar.');
      fm.cad = Object.assign({}, fm.cad, { filho, ano, escola });
    } else {
      const nome = val('fm-nome').trim(), whatsapp = val('fm-zap').trim(), email = val('fm-email').trim();
      const qb = document.querySelector('#fm-quem button.ativa'), quem = qb ? qb.dataset.v : '';
      if(nome.length < 2) return aviso('Escreva o seu nome.');
      if(fmDig(whatsapp).length < 10) return aviso('Confira o seu WhatsApp com DDD.');
      if(email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return aviso('Confira o e-mail ou deixe em branco.');
      if(!quem) return aviso('Diga quem está respondendo.');
      if(!filho) return aviso('Escreva o nome do seu filho ou filha.');
      if(!ano) return aviso('Escolha o ano escolar.');
      if(!document.getElementById('fm-ok').checked) return aviso('Para seguir, marque a autorização.');
      fm.cad = { nome, whatsapp, email, quem, filho, ano, escola, consent:true };
      fmEvento('contato', null, { nome, whatsapp });
    }
    fm.passos = fmPassos(); fm.i = 0; fmGuardar(); fmEvento('perguntas'); fmDesenhar();
  });
}
function fmDesenhar(){
  fmMontarTelas();
  const passo = fm.passos[fm.i]; if(!passo) return fmEnviar();
  const total = fm.passos.length, box = document.getElementById('fm-pergunta');
  document.getElementById('fm-barra').style.width = Math.round(fm.i / total * 100) + '%';
  document.getElementById('fm-voltar').style.visibility = 'visible';
  const filho = fmEsc((fm.cad && fm.cad.filho) || 'seu filho');
  if(passo.t === 'p2'){
    document.getElementById('fm-parte').textContent = FM_PARTES[2];
    box.innerHTML = `<div class="fm-card fm-p2"><h2 class="fm-q">Sua história</h2>
      <p class="fm-intro">Esta parte é opcional. Ela ajuda a entender de onde vêm alguns padrões. Responda só se fizer sentido para você.</p>
      <div class="fm-opcoes"><button type="button" class="fm-op ${fm.parte2 === true ? 'sel' : ''}" data-p2="1">Quero responder</button><button type="button" class="fm-op ${fm.parte2 === false ? 'sel' : ''}" data-p2="0">Pular esta parte</button></div></div>`;
    box.querySelectorAll('[data-p2]').forEach(b => b.addEventListener('click', () => {
      fm.parte2 = b.dataset.p2 === '1'; if(!fm.parte2){ for(let i = 1; i <= 7; i++) delete fm.r['h' + i]; fm.texto = ''; }
      fm.passos = fmPassos(); fm.i++; fmGuardar(); fmDesenhar(); }));
  } else if(passo.t === 'texto'){
    document.getElementById('fm-parte').textContent = FM_PARTES[2];
    box.innerHTML = `<div class="fm-card"><h2 class="fm-q">Se quiser, escreva algo da sua infância que você não quer repetir com seu filho.</h2>
      <p class="fm-intro">Opcional. Só ${fmEsc(window.T_PRIM || 'a terapeuta')} vê: não aparece no resultado e nunca vai para a escola.</p>
      <textarea id="fm-texto" rows="4" maxlength="1500" placeholder="Escreva aqui, se quiser">${fmEsc(fm.texto)}</textarea>
      <div class="fm-opcoes fm-duas"><button type="button" class="btn btn-primario" id="fm-texto-ok">Continuar</button><button type="button" class="btn btn-contorno" id="fm-texto-pular">Pular</button></div></div>`;
    const t = document.getElementById('fm-texto');
    t.addEventListener('input', () => { fm.texto = t.value.slice(0, 1500); fmGuardar(); });
    document.getElementById('fm-texto-ok').addEventListener('click', () => { fm.texto = t.value.slice(0, 1500); fm.i++; fmGuardar(); fmDesenhar(); });
    document.getElementById('fm-texto-pular').addEventListener('click', () => { fm.texto = ''; fm.i++; fmGuardar(); fmDesenhar(); });
  } else {
    const [id, parte, esc] = passo.q; let texto = passo.q[3];
    if(id === 'r1') texto = fmTextoR1(fm.cad && fm.cad.quem);
    document.getElementById('fm-parte').textContent = FM_PARTES[parte] + (parte === 3 || parte === 4 ? ' · ' + (fm.cad && fm.cad.filho ? fm.cad.filho : '') : '');
    const lead = parte === 2 && id !== 'h7' ? '<p class="fm-lead">Na minha infância…</p>' : '';
    const atual = fm.r[id];
    box.innerHTML = `<div class="fm-card">${lead}<h2 class="fm-q">${fmEsc(texto)}</h2>
      <div class="fm-opcoes ${FM_ESCALA[esc].length > 5 ? 'fm-seis' : ''}">${FM_ESCALA[esc].map(([t, v]) => `<button type="button" class="fm-op ${atual !== undefined && String(atual) === String(v) ? 'sel' : ''} ${v === 'ns' || (esc === 'C4' && v === 4) || v === 'nao_sei' ? 'fm-ns' : ''}" data-v="${v}">${fmEsc(t)}</button>`).join('')}</div></div>`;
    box.querySelectorAll('.fm-op').forEach(b => b.addEventListener('click', () => {
      const raw = b.dataset.v, val = /^\d$/.test(raw) ? +raw : raw;
      fm.r[id] = val; box.querySelectorAll('.fm-op').forEach(x => x.classList.toggle('sel', x === b));
      fmGuardar(); if(fm.i % 5 === 4) fmEvento('pergunta', fm.i + 1);
      setTimeout(() => { fm.i++; fmGuardar(); fmDesenhar(); }, 220);
    }));
  }
  if(!document.getElementById('tela-fm-teste').classList.contains('ativa')) mostrarTela('#tela-fm-teste');
  window.scrollTo({ top:0, behavior:'auto' });
  const foco = box.querySelector('.fm-op.sel') || box.querySelector('h2'); if(foco){ foco.setAttribute('tabindex', '-1'); try{ foco.focus({ preventScroll:true }); }catch(e){} }
}
function fmVoltar(){
  if(fm.i > 0){ fm.i--; fmGuardar(); fmDesenhar(); }
  else fmTelaCadastro();
}
async function fmEnviar(){
  if(fm.enviando) return; fm.enviando = true;
  document.getElementById('fm-barra').style.width = '100%';
  fmMostrar('<div class="fm-abertura"><div class="t-girar" aria-hidden="true"></div><h1 class="fm-h1 fm-h1-p">Montando o seu resultado...</h1></div>');
  fmEvento('fim_perguntas', fm.passos.length);
  if(!fm.cad.adulto_ref){ fm.cad.adulto_ref = fmLS.get(fmChave('adulto'), null) || fmUuid(); fmLS.set(fmChave('adulto'), fm.cad.adulto_ref); }
  const r = await fmRpc('familia_salvar', { p_dados:{ codigo:fm.codigo, origem:fm.origem, consentimento:true, parte2:fm.parte2 === true, r:fm.r, texto:fm.texto,
    cadastro:{ nome:fm.cad.nome, whatsapp:fm.cad.whatsapp, email:fm.cad.email, quem:fm.cad.quem, filho:fm.cad.filho, ano:fm.cad.ano, escola:fm.cad.escola },
    anterior:fm.outro ? fm.outro.token : null, adulto_ref:fm.cad.adulto_ref } });
  fm.enviando = false;
  if(!r || !r.ok){
    return fmMostrar(`<div class="fm-abertura"><h1 class="fm-h1 fm-h1-p">Quase lá</h1><div class="aviso ver">${fmEsc((r && r.msg) || 'Não consegui enviar agora. Confira a internet e toque em tentar de novo. Suas respostas estão guardadas neste celular.')}</div>
      <button class="btn btn-primario fm-btn" id="fm-tentar" type="button">Tentar de novo</button>${r && r.erro === 'respostas' ? '<button class="btn btn-contorno fm-btn" id="fm-rever" type="button">Rever as respostas</button>' : ''}</div>`),
      document.getElementById('fm-tentar').addEventListener('click', fmEnviar),
      document.getElementById('fm-rever') && document.getElementById('fm-rever').addEventListener('click', () => { fm.i = 0; fmDesenhar(); });
  }
  const feito = { token:r.token, filho:fm.cad.filho, quem:fm.cad.quem, nome:fm.cad.nome, em:new Date().toISOString(),
    base:{ cad:Object.assign({}, fm.cad, { filho:'', ano:'', escola:'' }), r:Object.fromEntries(Object.entries(fm.r).filter(([k]) => /^(a\d+|h\d)$/.test(k))), parte2:fm.parte2, texto:fm.texto } };
  const feitos = fmLS.get(fmChave(fm.codigo, 'feitos'), []); feitos.push(feito); fmLS.set(fmChave(fm.codigo, 'feitos'), feitos.slice(-6));
  fmLS.del(fmChave(fm.codigo, 'prog'));
  fmEvento('concluiu', fm.passos.length);
  if(r.mostrar && r.calc) return fmMostrarResultado(r.calc, { nome:fm.cad.nome, quem:fm.cad.quem, filho:fm.cad.filho }, feito);
  fmTelaEspera(feito);
}
function fmTelaEspera(feito){
  fmMostrar(`<div class="fm-abertura">
    <span class="selo fm-selo">Respostas enviadas</span>
    <h1 class="fm-h1 fm-h1-p">${fmEsc(fmPrim(feito.nome))}, obrigado por olhar para você e para ${fmEsc(feito.filho)}.</h1>
    <p class="fm-sub">Suas respostas chegaram para ${fmEsc(window.T_A || 'a terapeuta')}. Assim que o resultado for liberado, você vê tudo abrindo este mesmo link, neste celular.</p>
    <a class="btn btn-zap fm-btn" href="${fmZap('Olá, fiz o ' + fmNome() + ' sobre ' + feito.filho + ' e queria conversar sobre o resultado.')}" target="_blank" rel="noopener" data-fm-zap><span class="duas">Falar com ${fmEsc(window.T_PRIM || 'a terapeuta')}<small>pelo WhatsApp</small></span></a>
    <button class="btn btn-contorno fm-btn" id="fm-outro" type="button">Fazer para outro filho</button>
    <p class="fm-nota">${fmEsc(FM.AVISO)}</p></div>`);
  document.getElementById('fm-outro').addEventListener('click', () => fmOutroFilho(feito));
  const z = document.querySelector('[data-fm-zap]'); if(z) z.addEventListener('click', () => fmEvento('whatsapp'));
}
async function fmVoltarResultado(feito){
  fmMostrar('<div class="carregando">Buscando o seu resultado...</div>'); fmSoltarTela();
  const r = await fmRpc('familia_resultado', { p_token:feito.token });
  if(r && r.ok && r.liberado && r.calc) return fmMostrarResultado(r.calc, r.cadastro || feito, feito);
  fmTelaEspera(feito);
}
function fmOutroFilho(feito){
  const b = feito.base || {};
  Object.assign(fm, { cad:Object.assign({}, b.cad || {}, { nome:feito.nome, quem:feito.quem }), r:Object.assign({}, b.r || {}), parte2:b.parte2, texto:b.texto || '', outro:{ token:feito.token, ultimo:feito }, i:0 });
  fmTelaCadastro();
}

/* ---------- resultado (o mesmo desenho para quem respondeu, para a ficha e para o PDF) ---------- */
function fmBarra(nome, nota, faixa, frase){
  if(nota == null) return `<div class="fm-barra fm-insuf"><div class="fm-barra-topo"><span>${fmEsc(nome)}</span><b>Sem informação suficiente</b></div><div class="fm-trilho"><i style="width:0"></i></div><p>Muitas respostas ficaram em "Não sei".</p></div>`;
  return `<div class="fm-barra fm-${faixa}"><div class="fm-barra-topo"><span>${fmEsc(nome)}</span><b><em>${FM.FAIXA[faixa]}</em> ${nota}</b></div>
    <div class="fm-trilho" role="img" aria-label="${fmEsc(nome)}: ${nota} de 100, ${FM.FAIXA[faixa]}"><i style="width:${Math.max(3, nota)}%"></i></div>${frase ? `<p>${fmEsc(frase)}</p>` : ''}</div>`;
}
function fmElosHTML(elos, calc, max){
  const lista = (elos || []).slice(0, max || 3); if(!lista.length) return '';
  let repUsada = false;
  return lista.map((e, n) => { const d = FM.ELOS[e.id] || {}, nomeA = e.id === 'E6' ? 'Sua história escolar' : (FM.TRAVAS.find(t => t.k === d.a) || {}).nome, nomeF = (FM.AREAS.find(a => a.k === d.f) || {}).nome;
    const rep = e.geracao && calc.repeticao && !repUsada; if(rep) repUsada = true;
    return `<div class="fm-elo"><div class="fm-elo-num">${n + 1}</div><div><h3>${fmEsc(d.tit)}</h3><p>${fmEsc(d.txt)}</p>
      ${e.geracao ? `<p class="fm-geracao">${fmEsc(FM.GERACAO)}</p>` : ''}${rep ? `<p class="fm-geracao">${fmEsc(FM.REPETICAO)}</p>` : ''}
      <p class="fm-elo-par"><span>Você · ${fmEsc(nomeA)} <b>${e.adulto}</b></span><span>Seu filho · ${fmEsc(nomeF)} <b>${e.filho}</b></span></p></div></div>`; }).join('');
}
function fmHistoriaTexto(calc, quem){
  const p = fmPapel(quem), h = calc.historia || {}, altos = Object.keys(h).filter(k => h[k] >= 3).length;
  const r1 = { sim:'Você disse que hoje é ' + p + ' que gostaria de ter tido. Isso é uma conquista: continue cuidando dessa história.',
    em_parte:'Você disse que, em parte, é ' + p + ' que gostaria de ter tido. Olhar para a sua história ajuda a escolher o que levar adiante e o que deixar para trás.',
    ainda_nao:'Você disse que ainda não é ' + p + ' que gostaria de ter tido. Perceber isso é corajoso, e é o primeiro passo para mudar.',
    nunca_pensei:'Você nunca tinha pensado nisso, e agora pensou. Às vezes, a mudança começa com uma pergunta.' }[calc.r1] || '';
  return (altos ? `<p>${altos} ${altos === 1 ? 'lembrança da sua infância apareceu' : 'lembranças da sua infância apareceram'} com frequência. O que a gente viveu costuma aparecer no jeito de cuidar, e pode ser ressignificado.</p>` : '<p>A sua história traz bases importantes para o jeito como você cuida hoje.</p>')
    + (r1 ? `<p><b>${fmEsc(r1)}</b></p>` : '');
}
function fmResultadoHTML(calc, cad, opts){
  opts = opts || {};
  const filho = cad.filho || 'seu filho', nome = fmPrim(cad.nome);
  const travas = FM.TRAVAS.map(t => fmBarra(t.nome, calc.travas[t.k], calc.travas_faixa[t.k], t.txt[calc.travas_faixa[t.k]])).join('');
  const areas = FM.AREAS.map(a => fmBarra(a.nome, calc.areas[a.k], calc.areas_faixa[a.k], calc.areas[a.k] == null ? '' : a.txt[calc.areas_faixa[a.k]])).join('');
  const k1forte = calc.k1 === 'muitas' || calc.k1 === 'recuperacao';
  const elos = fmElosHTML(calc.elos, calc, opts.todos ? 6 : 3);
  return `<div class="fm-res">
    <header class="fm-res-cab"><span class="selo fm-selo">${fmEsc(fmNome())}</span>
      <h1 class="fm-h1">${fmEsc(nome)}, obrigado por olhar para você e para ${fmEsc(filho)}.</h1>
      <p class="fm-sub">Este é um retrato de agora. Ele não define ninguém: mostra por onde vale começar a cuidar.</p></header>
    <section class="fm-secao"><h2>Você hoje</h2><p class="fm-leg"><span class="fm-dot tranquilo"></span>Tranquilo <span class="fm-dot atencao"></span>Atenção <span class="fm-dot prioridade"></span>Prioridade</p>${travas}</section>
    <section class="fm-secao"><h2>${fmEsc(filho)} hoje</h2>
      ${k1forte ? `<div class="fm-destaque">Você contou que ${fmEsc(filho)} está terminando o ano ${calc.k1 === 'muitas' ? 'com muitas dificuldades' : 'em recuperação ou com risco de repetir'}. Isso pede atenção agora, sem esperar o próximo ano.</div>` : ''}
      ${areas}</section>
    <section class="fm-secao"><h2>Os elos entre vocês</h2>
      ${elos || '<div class="fm-elo fm-elo-vazio"><div><h3>Nenhum elo forte apareceu agora</h3><p>Que bom. Continue cuidando do que está funcionando entre vocês.</p></div></div>'}
      ${elos ? '<p class="fm-nota">Elos são padrões que costumam aparecer juntos. Não são causa nem culpa: são um bom lugar para começar a olhar com cuidado.</p>' : ''}</section>
    ${calc.parte2 ? `<section class="fm-secao"><h2>Sua história</h2>${fmHistoriaTexto(calc, cad.quem)}</section>` : ''}
    <section class="fm-secao"><h2>Conexão entre vocês</h2>${fmBarra('Conexão', calc.conexao, calc.conexao_faixa, FM.CONEXAO[calc.conexao_faixa])}
      ${calc.nao_sei >= 3 ? `<div class="fm-ns-card"><h3>Você conhece a rotina do seu filho?</h3><p>Algumas respostas ficaram em "Não sei". Isso não é um erro: é um convite para chegar mais perto.</p></div>` : ''}</section>
    ${opts.semAcoes ? '' : `<section class="fm-secao fm-passo"><h2>Próximo passo</h2>
      <p>${fmEsc(window.T_A ? (window.T_A.charAt(0).toUpperCase() + window.T_A.slice(1)) : 'A terapeuta')} pode olhar com você, com calma, por onde começar.</p>
      <a class="btn btn-primario fm-btn" data-fm-zap href="${fmZap('Olá, fiz o ' + fmNome() + ' e quero agendar o Acolhimento Avaliativo do ' + filho + '.')}" target="_blank" rel="noopener">Quero o Acolhimento Avaliativo do ${fmEsc(filho)}</a>
      <a class="btn btn-contorno fm-btn" data-fm-zap href="${fmZap('Olá, fiz o ' + fmNome() + ' e quero saber da orientação para pais.')}" target="_blank" rel="noopener">Quero saber da orientação para pais</a>
      <div class="fm-acoes"><button type="button" class="btn btn-contorno" data-fm-pdf>Baixar o resultado em PDF</button>${opts.outro ? '<button type="button" class="btn btn-contorno" data-fm-outro>Fazer para outro filho</button>' : ''}</div></section>`}
  </div>`;
}
function fmMostrarResultado(calc, cad, feito){
  fmMontarTelas();
  const caixa = document.getElementById('fm-resultado');
  caixa.innerHTML = fmResultadoHTML(calc, cad, { outro:!!feito });
  mostrarTela('#tela-fm-resultado'); window.scrollTo({ top:0, behavior:'auto' }); fmSoltarTela();
  caixa.querySelectorAll('[data-fm-zap]').forEach(a => a.addEventListener('click', () => fmEvento('whatsapp')));
  const pdf = caixa.querySelector('[data-fm-pdf]'); if(pdf) pdf.addEventListener('click', () => fmImprimir(fmResultadoHTML(calc, cad, { semAcoes:true }), cad));
  const o = caixa.querySelector('[data-fm-outro]'); if(o) o.addEventListener('click', () => fmOutroFilho(feito));
}
function fmImprimir(miolo, cad, titulo){
  const foto = fmFoto();
  const html = `<div class="fm-doc"><div class="fm-doc-cab">${foto ? `<img src="${fmEsc(foto)}" alt="">` : ''}<div><b>${fmEsc(fmEspaco())}</b><span>${fmEsc(titulo || fmNome())} · ${fmEsc(new Date().toLocaleDateString('pt-BR'))}</span></div></div>
    ${miolo}<p class="fm-doc-rod">${fmEsc(FM.AVISO)}</p></div>`;
  const caixa = document.createElement('div'); caixa.id = 'fm-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('fm-imprimindo'); document.documentElement.classList.add('fm-imprimindo');
  const fim = () => { document.body.classList.remove('fm-imprimindo'); document.documentElement.classList.remove('fm-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('fm-impressao')) fim(); }, 1500); }, 300);
}

/* ============================================================================
   ÁREA DA TERAPEUTA
   ============================================================================ */
let fmCache = [], fmLinks = [];
function fmAdminMontar(){
  if(document.getElementById('painel-fm')) return;
  const base = document.getElementById('painel-an') || document.getElementById('painel-dc') || document.getElementById('painel-mp') || document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-fm">
      <div id="fm-abas"><button type="button" class="ativa" data-fm-aba="respostas">Respostas</button><button type="button" data-fm-aba="links">Links e QR code</button><button type="button" data-fm-aba="ajustes">Ajustes</button></div>
      <div id="fm-aba-respostas">
        <div id="fm-resumo"></div>
        <div class="fm-filtros">
          <input id="fm-busca" type="search" placeholder="Buscar por nome, filho ou WhatsApp">
          <select id="fm-f-origem" aria-label="Origem"><option value="">Todas as origens</option></select>
          <select id="fm-f-escola" aria-label="Escola"><option value="">Todas as escolas</option></select>
          <select id="fm-f-prio" aria-label="Prioridade"><option value="">Toda prioridade</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select>
          <select id="fm-f-status" aria-label="Status"><option value="">Todo status</option>${FM.STATUS.map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select>
          <label class="fm-f-data">De <input id="fm-f-de" type="date"></label><label class="fm-f-data">Até <input id="fm-f-ate" type="date"></label>
        </div>
        <button type="button" class="mini-btn" id="fm-exportar" style="margin-bottom:12px">Exportar em CSV (planilha)</button>
        <div id="fm-lista"><div class="vazio">Nenhuma resposta por enquanto.</div></div>
      </div>
      <div id="fm-aba-links" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="fm-l-nome">Nome do link</label><input id="fm-l-nome" type="text" placeholder="Ex.: Palestra Novembro Azul"></div>
          <div class="campo"><label for="fm-l-origem">Origem <span class="opc">(aparece em cada resposta e no CSV)</span></label><input id="fm-l-origem" type="text" placeholder="Ex.: palestra-enel-23-11 ou captacao-joana"></div>
          <div class="campo"><label id="fm-rot-mostrar">Quando a pessoa vê o resultado?</label>
            <div class="alternar" id="fm-alt-mostrar" role="radiogroup" aria-labelledby="fm-rot-mostrar">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Na hora<small>assim que termina</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Depois<small>só quando você liberar</small></button>
            </div></div>
          <button class="btn btn-argila" id="fm-gerar">Criar link com QR code</button>
        </div>
        <div id="fm-caixa-link"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Links criados</h3>
        <div id="fm-lista-links"><div class="vazio">Nenhum link ainda. Crie o primeiro acima.</div></div>
      </div>
      <div id="fm-aba-ajustes" style="display:none"><div class="cartao" id="fm-ajustes"></div></div>
      <div id="fm-detalhe" style="display:none"><button class="voltar" id="fm-voltar-lista">← Voltar para a lista</button><div id="fm-detalhe-conteudo"></div></div>
    </div>`);
  document.querySelectorAll('#fm-abas button').forEach(b => b.addEventListener('click', () => fmAdminAba(b.dataset.fmAba)));
  ['fm-busca', 'fm-f-origem', 'fm-f-escola', 'fm-f-prio', 'fm-f-status', 'fm-f-de', 'fm-f-ate'].forEach(id => document.getElementById(id).addEventListener(id === 'fm-busca' ? 'input' : 'change', fmDesenharLista));
  document.getElementById('fm-exportar').addEventListener('click', fmExportar);
  document.getElementById('fm-voltar-lista').addEventListener('click', () => fmAdminAba('respostas'));
  document.querySelectorAll('#fm-alt-mostrar button').forEach(b => b.addEventListener('click', () => document.querySelectorAll('#fm-alt-mostrar button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on); })));
  document.getElementById('fm-gerar').addEventListener('click', fmGerarLink);
}
function fmAdminAba(q){
  document.querySelectorAll('#fm-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.fmAba === q));
  ['respostas', 'links', 'ajustes'].forEach(k => { document.getElementById('fm-aba-' + k).style.display = k === q ? '' : 'none'; });
  document.getElementById('fm-detalhe').style.display = 'none';
  if(q === 'links') fmCarregarLinks();
  if(q === 'ajustes') fmDesenharAjustes();
}
async function fmSessao(){ const c = clienteMembros(), { data } = await c.auth.getSession(); return data && data.session ? { c, uid:data.session.user.id } : null; }
async function fmCarregar(){
  const caixa = document.getElementById('fm-lista'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const s = await fmSessao(); if(!s){ caixa.innerHTML = '<div class="aviso ver">A sua sessão expirou. Saia da área e entre de novo.</div>'; return; }
  const { data, error } = await s.c.from('familia_respostas').select('*').eq('terapeuta_id', s.uid).order('criado_em', { ascending:false }).limit(3000);
  if(error){ caixa.innerHTML = '<div class="aviso ver">Não consegui carregar as respostas agora.</div>'; return; }
  fmCache = data || [];
  const lk = await s.c.from('travas_codigos').select('codigo,compartilhado').eq('terapeuta_id', s.uid).eq('teste', 'familia').limit(1000);
  if(!lk.error && lk.data) fmLinks = lk.data.map(l => Object.assign({}, fmLinks.find(z => z.codigo === l.codigo) || {}, l));
  const opts = (sel, vals) => { const el = document.getElementById(sel), atual = el.value; el.length = 1; vals.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; el.appendChild(o); }); el.value = vals.indexOf(atual) > -1 ? atual : ''; };
  opts('fm-f-origem', Array.from(new Set(fmCache.map(x => x.origem || 'sem origem'))).sort());
  opts('fm-f-escola', Array.from(new Set(fmCache.map(x => (x.cadastro && x.cadastro.escola) || 'sem escola'))).sort());
  fmDesenharLista();
}
/* cada criança aparece uma vez (o momento mais recente); a ficha mostra todos */
function fmCriancas(){
  const g = {}; fmCache.forEach(x => { (g[x.crianca_id] = g[x.crianca_id] || []).push(x); });
  return Object.values(g).map(l => { l.sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em)); return { ult:l[l.length - 1], momentos:l }; })
    .sort((a, b) => new Date(b.ult.criado_em) - new Date(a.ult.criado_em));
}
function fmFiltradas(){
  const val = id => document.getElementById(id).value;
  const termo = val('fm-busca').trim().toLowerCase(), o = val('fm-f-origem'), e = val('fm-f-escola'), p = val('fm-f-prio'), st = val('fm-f-status'), de = val('fm-f-de'), ate = val('fm-f-ate');
  return fmCriancas().filter(({ ult:x }) => {
    if(termo && !((x.nome + ' ' + x.filho + ' ' + x.whatsapp).toLowerCase().includes(termo))) return false;
    if(o && (x.origem || 'sem origem') !== o) return false;
    if(e && ((x.cadastro && x.cadastro.escola) || 'sem escola') !== e) return false;
    if(p && x.prioridade !== p) return false;
    if(st && x.status !== st) return false;
    const d = x.criado_em.slice(0, 10); if(de && d < de) return false; if(ate && d > ate) return false;
    return true;
  });
}
const fmAno = a => a === 'outro' ? 'outro ano' : a ? a + 'º ano' : '';
function fmDesenharLista(){
  const caixa = document.getElementById('fm-lista'), lista = fmFiltradas(), todas = fmCriancas();
  const n = k => todas.filter(x => x.ult.prioridade === k).length;
  document.getElementById('fm-resumo').innerHTML = todas.length ? `<div class="resumo-interesse"><div class="ri-titulo">${fmEsc(fmNome())} · prioridade do contato</div><div class="ri-grade">
    <div><b>${n('alta')}</b>alta<small>filho com sinais fortes e pais buscando ajuda</small></div><div><b>${n('media')}</b>média<small>sinais de atenção ou elos ativos</small></div><div><b>${n('baixa')}</b>baixa<small>o restante</small></div></div>
    <p class="ri-base">${todas.length} ${todas.length === 1 ? 'criança' : 'crianças'} · ${todas.filter(x => x.ult.status === 'matriculado').length} matriculadas</p></div>` : '';
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">' + (fmCache.length ? 'Nada com esses filtros.' : 'Nenhuma resposta por enquanto.') + '</div>'; return; }
  caixa.innerHTML = lista.map(({ ult:x, momentos }) => { const c = x.notas || {}, ofs = (x.ofertas || []).map(k => '<span class="tag-vis">' + fmEsc(fmServ(k)) + '</span>').join('');
    const indiv = fmLinks.some(l => l.codigo === x.codigo && !l.compartilhado);   // link de palestra é de muita gente: a bolinha online só vale no link individual
    return `<div role="button" tabindex="0" class="linha-item fm-linha" data-fm-id="${x.id}" ${indiv ? 'data-cod="' + fmEsc(x.codigo) + '"' : ''} data-nome="${fmEsc(x.nome)}"><span class="esq">
      <span class="nome">${fmEsc(x.nome)}<span class="tag-vis">${fmEsc(x.filho)}${x.cadastro && x.cadastro.ano ? ' · ' + fmAno(x.cadastro.ano) : ''}</span></span>
      <span class="sub">${fmQuando(x.criado_em)} · ${fmEsc(x.origem || 'sem origem')} · Índice do filho ${c.indice_filho == null ? '—' : c.indice_filho}${momentos.length > 1 ? ' · ' + momentos.length + ' momentos' : ''} · ${fmEsc((FM.STATUS.find(s => s[0] === x.status) || [])[1] || '')}${x.liberado ? '' : ' · <b>resultado não liberado</b>'}</span>
      ${ofs ? '<span class="fm-ofs">' + ofs + '</span>' : ''}</span>
      <span class="etiqueta fm-prio-${x.prioridade}">${FM.PRIO[x.prioridade]}</span>
      <a class="fm-zap-mini" href="https://wa.me/${zapNumero(x.whatsapp)}" target="_blank" rel="noopener" data-fm-stop aria-label="WhatsApp de ${fmEsc(x.nome)}">WhatsApp</a></div>`; }).join('');
  caixa.querySelectorAll('[data-fm-stop]').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
  caixa.querySelectorAll('[data-fm-id]').forEach(b => { b.addEventListener('click', () => fmAbrirFicha(b.dataset.fmId)); b.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fmAbrirFicha(b.dataset.fmId); } }); });
}
function fmPlano(calc){
  const ord = FM.AREAS.filter(a => calc.areas[a.k] != null).sort((a, b) => calc.areas[b.k] - calc.areas[a.k]), duas = ord.slice(0, 2);
  const ativos = (calc.elos || []).map(e => e.id), clima = ativos.indexOf('E2') > -1 || ativos.indexOf('E3') > -1;
  const insuf = (calc.insuficiente || []).map(k => (FM.AREAS.find(a => a.k === k) || {}).nome).filter(Boolean);
  return `<div class="fm-plano"><h3>Plano inicial para as pedagogas</h3>
    ${duas.length ? `<p><b>Por onde começar:</b> ${fmEsc(duas[0].nome)} (${calc.areas[duas[0].k]}). ${fmEsc(duas[0].plano)}</p>` : '<p>As áreas ficaram sem informação suficiente: comece pela escuta da família e da criança.</p>'}
    ${duas[1] ? `<p><b>Em seguida:</b> ${fmEsc(duas[1].nome)} (${calc.areas[duas[1].k]}). ${fmEsc(duas[1].plano)}</p>` : ''}
    ${insuf.length ? `<p><b>Para conhecer melhor:</b> ${fmEsc(insuf.join(' e '))} ficaram sem informação suficiente na resposta da família.</p>` : ''}
    ${clima ? '<p><b>Cuidado com o clima de casa:</b> o teste mostrou sinais no clima emocional ou na presença em casa. Acolha a criança sem expor a família e alinhe com os pais o que for observado.</p>' : ''}</div>`;
}
function fmEvolucaoSVG(momentos){
  if(momentos.length < 2) return '';
  const W = 560, Hh = 220, pl = 34, pr = 16, pt = 16, pb = 40, cores = { aprendizagem:'#E8CB7E', rotina:'#7FC8F8', emocoes:'#FF8A75', telas:'#9BE6B8' };
  const x = i => pl + i * (W - pl - pr) / (momentos.length - 1), y = v => pt + (100 - v) / 100 * (Hh - pt - pb);
  let s = `<svg viewBox="0 0 ${W} ${Hh}" class="fm-evol" role="img" aria-label="Evolução das áreas entre os momentos">`;
  [0, 35, 65, 100].forEach(v => { s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".15"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity=".7">${v}</text>`; });
  momentos.forEach((m, i) => { s += `<text x="${x(i)}" y="${Hh - 14}" text-anchor="${i === 0 ? 'start' : i === momentos.length - 1 ? 'end' : 'middle'}" font-size="11" fill="currentColor">${FM.MOMENTO[m.momento] || m.momento} · ${fmData(m.criado_em).slice(0, 5)}</text>`; });
  FM.AREAS.forEach(a => { const pts = momentos.map((m, i) => (m.notas.areas || {})[a.k] == null ? null : [x(i), y(m.notas.areas[a.k])]).filter(Boolean);
    if(pts.length > 1) s += `<polyline fill="none" stroke="${cores[a.k]}" stroke-width="2.6" points="${pts.map(p => p.join(',')).join(' ')}"/>`;
    pts.forEach(p => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${cores[a.k]}"/>`; }); });
  s += '</svg><p class="fm-leg">' + FM.AREAS.map(a => `<span class="fm-dot" style="background:${cores[a.k]}"></span>${fmEsc(a.nome)} `).join('') + ' · quanto mais baixo, melhor</p>';
  return s;
}
function fmAbrirFicha(id){
  const x = fmCache.find(r => r.id === id); if(!x) return;
  const momentos = fmCache.filter(r => r.crianca_id === x.crianca_id).sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
  const c = x.notas || {}, cad = x.cadastro || {}, outros = fmCache.filter(r => r.adulto_ref && r.adulto_ref === x.adulto_ref && r.crianca_id !== x.crianca_id);
  ['respostas', 'links', 'ajustes'].forEach(k => { document.getElementById('fm-aba-' + k).style.display = 'none'; });
  document.getElementById('fm-detalhe').style.display = '';
  const proxMom = ['meio', 'continuidade'].filter(m => !momentos.some(r => r.momento === m));
  const dc = document.getElementById('fm-detalhe-conteudo');
  dc.innerHTML = `
    <div class="fm-ficha-cab"><div><h2>${fmEsc(x.nome)}</h2><p>${fmEsc(({ pai:'Pai', mae:'Mãe', avo:'Avô ou avó', outro:'Responsável' })[cad.quem] || '')} de <b>${fmEsc(x.filho)}</b>${cad.ano ? ' · ' + fmAno(cad.ano) : ''}${cad.escola ? ' · ' + fmEsc(cad.escola) : ''}</p>
      <p>${fmQuando(x.criado_em)} · momento ${fmEsc(FM.MOMENTO[x.momento] || x.momento)} · origem ${fmEsc(x.origem || 'sem origem')} · WhatsApp ${fmEsc(x.whatsapp)}${cad.email ? ' · ' + fmEsc(cad.email) : ''}</p>
      <p>Consentimento em ${fmQuando(x.consentimento_em)} · ${x.nao_sei} ${x.nao_sei === 1 ? 'resposta' : 'respostas'} "Não sei"${x.parte2 ? ' · respondeu a Parte 2' : ' · pulou a Parte 2'}</p></div>
      <span class="etiqueta fm-prio-${x.prioridade}">Prioridade ${FM.PRIO[x.prioridade]}</span></div>
    <div class="fm-ficha-grade">
      <div class="cartao"><h3>Contato</h3>
        <a class="btn btn-zap" href="https://wa.me/${zapNumero(x.whatsapp)}?text=${encodeURIComponent('Olá, ' + fmPrim(x.nome) + '! Aqui é ' + (window.T_A || '') + '. Vi as suas respostas no ' + fmNome() + ' sobre ' + x.filho + ' e queria conversar com você.')}" target="_blank" rel="noopener"><span class="duas">Falar com ${fmEsc(fmPrim(x.nome))}<small>mensagem pronta no WhatsApp</small></span></a>
        <div class="campo"><label for="fm-status">Status</label><select id="fm-status">${FM.STATUS.map(([k, t]) => `<option value="${k}" ${x.status === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${x.liberado ? '<p class="fm-ok">✔ O resultado está liberado para a família.</p>' : '<button class="btn btn-argila" id="fm-liberar" type="button">Liberar o resultado para a família</button><p class="fm-nota">Depois de liberar, a família vê o resultado abrindo o mesmo link no mesmo celular. Avise pelo WhatsApp.</p>'}
        <p><b>Ofertas sugeridas:</b> ${(x.ofertas || []).length ? x.ofertas.map(k => '<span class="tag-vis">' + fmEsc(fmServ(k)) + '</span>').join(' ') : 'nenhuma por enquanto'}</p>
        <p><b>Índices:</b> adulto ${c.indice_adulto} · filho ${c.indice_filho == null ? '—' : c.indice_filho} · conexão ${c.conexao}</p>
        <p><b>Fechamento:</b> ${fmEsc((FM.K1.find(k => k[0] === c.k1) || [])[1] || '')} · 2027: ${fmEsc((FM.K2.find(k => k[0] === c.k2) || [])[1] || '')} · ${fmEsc(fmTextoR1(cad.quem))} ${fmEsc((FM.R1.find(k => k[0] === c.r1) || [])[1] || '')}</p>
        ${outros.length ? `<p><b>Outros filhos:</b> ${outros.map(o => `<button type="button" class="mini-btn" data-fm-abrir="${o.id}">${fmEsc(o.filho)}</button>`).join(' ')}</p>` : ''}
        <div class="campo"><label for="fm-obs">Anotações (só você vê)</label><textarea id="fm-obs" rows="3">${fmEsc(x.observacao || '')}</textarea><button class="mini-btn" id="fm-obs-salvar" type="button">Salvar anotação</button></div>
      </div>
      <div class="cartao">${fmPlano(c)}</div>
    </div>
    ${x.texto_livre ? `<div class="cartao fm-livre"><h3>Nas palavras de ${fmEsc(fmPrim(x.nome))} <span class="tag-vis">só você vê · nunca vai para a escola</span></h3><p>${fmEsc(x.texto_livre)}</p></div>` : ''}
    <div class="cartao"><h3>Todos os elos (${(c.elos || []).length})</h3>${(c.elos || []).length ? fmElosHTML(c.elos, c, 6) : '<p>Nenhum elo ativo.</p>'}</div>
    <div class="cartao"><h3>Momentos de ${fmEsc(x.filho)}</h3>
      <p>${momentos.map(m => `<button type="button" class="mini-btn ${m.id === x.id ? 'fm-atual' : ''}" data-fm-abrir="${m.id}">${FM.MOMENTO[m.momento]} · ${fmData(m.criado_em)}</button>`).join(' ')}</p>
      ${fmEvolucaoSVG(momentos)}
      ${proxMom.length ? `<div class="fm-momento-novo"><label for="fm-mom">Gerar link para o próximo momento</label><select id="fm-mom">${proxMom.map(m => `<option value="${m}">${FM.MOMENTO[m]}</option>`).join('')}</select><button class="btn btn-argila" id="fm-mom-gerar" type="button">Gerar link e enviar</button><div id="fm-mom-caixa"></div></div>` : ''}</div>
    <div class="cartao fm-escola"><h3>Relatório para a escola</h3>
      <p class="fm-nota">Contém só as áreas do filho e o plano. Nunca leva as respostas sobre o adulto, a história ou a conexão. Só pode ser gerado com a autorização específica da família, pedida na avaliação.</p>
      <label class="fm-consent"><input type="checkbox" id="fm-aut-escola" ${x.autoriza_escola ? 'checked' : ''}><span>A família autorizou o envio do relatório para a escola${x.autoriza_escola_em ? ' (marcado em ' + fmQuando(x.autoriza_escola_em) + ')' : ''}.</span></label>
      <button class="btn btn-contorno" id="fm-rel-escola" type="button" ${x.autoriza_escola ? '' : 'disabled'}>Gerar relatório para a escola (PDF)</button></div>
    <div class="cartao"><h3>O que a família viu</h3>${fmResultadoHTML(c, cad, { semAcoes:true })}</div>
    <div class="fm-acoes"><button class="btn btn-contorno" id="fm-pdf-ficha" type="button">Baixar a ficha em PDF</button>${typeof apresAbrir === 'function' ? '<button class="btn btn-argila" id="fm-apres" type="button">Gerar apresentação (sessões e bônus)</button>' : ''}</div>`;
  dc.querySelectorAll('[data-fm-abrir]').forEach(b => b.addEventListener('click', () => fmAbrirFicha(b.dataset.fmAbrir)));
  const atualizar = async (campos, msgOk) => {
    const { data, error } = await clienteMembros().rpc('familia_atualizar', { p_id:x.id, p_campos:campos });
    if(error || !data || !data.ok){ alert('Não consegui salvar agora. Saia da área, entre de novo e tente outra vez.'); return false; }
    Object.assign(x, campos); if('autoriza_escola' in campos) x.autoriza_escola_em = campos.autoriza_escola ? new Date().toISOString() : null; return true;
  };
  document.getElementById('fm-status').addEventListener('change', async e => { if(await atualizar({ status:e.target.value })) fmDesenharLista(); });
  const lib = document.getElementById('fm-liberar'); if(lib) lib.addEventListener('click', async () => { if(await atualizar({ liberado:true })){ fmAbrirFicha(x.id); fmDesenharLista(); } });
  document.getElementById('fm-obs-salvar').addEventListener('click', async e => { if(await atualizar({ observacao:document.getElementById('fm-obs').value })){ e.target.textContent = 'Salvo!'; setTimeout(() => { e.target.textContent = 'Salvar anotação'; }, 1800); } });
  document.getElementById('fm-aut-escola').addEventListener('change', async e => { if(await atualizar({ autoriza_escola:e.target.checked })) fmAbrirFicha(x.id); else e.target.checked = !e.target.checked; });
  document.getElementById('fm-rel-escola').addEventListener('click', () => { if(!x.autoriza_escola) return; fmImprimir(fmRelatorioEscola(x), cad, 'Relatório para a escola'); });
  document.getElementById('fm-pdf-ficha').addEventListener('click', () => fmImprimir(`<h2 class="fm-doc-tit">Ficha de ${fmEsc(x.nome)} · ${fmEsc(x.filho)}</h2>${fmPlano(c)}<h3>Todos os elos</h3>${fmElosHTML(c.elos, c, 6) || '<p>Nenhum elo ativo.</p>'}${fmResultadoHTML(c, cad, { semAcoes:true })}`, cad, 'Ficha da terapeuta'));
  const mg = document.getElementById('fm-mom-gerar'); if(mg) mg.addEventListener('click', () => fmNovoMomento(x, document.getElementById('fm-mom').value));
  const ap = document.getElementById('fm-apres'); if(ap) ap.addEventListener('click', () => fmApresentar(x));
  window.scrollTo({ top:0, behavior:'auto' });
}
function fmRelatorioEscola(x){
  const c = x.notas || {}, cad = x.cadastro || {};
  return `<h2 class="fm-doc-tit">${fmEsc(x.filho)}${cad.ano ? ' · ' + fmAno(cad.ano) : ''}${cad.escola ? ' · ' + fmEsc(cad.escola) : ''}</h2>
    <p>Relatório de apoio pedagógico, com autorização da família. Mostra sinais de atenção observados pela família em casa. Não é diagnóstico.</p>
    <section class="fm-secao"><h2>Áreas observadas</h2>${FM.AREAS.map(a => fmBarra(a.nome, c.areas[a.k], c.areas_faixa[a.k], c.areas[a.k] == null ? '' : a.txt[c.areas_faixa[a.k]])).join('')}</section>
    ${fmPlano(c).replace('Plano inicial para as pedagogas', 'Plano de apoio')}`;
}
async function fmNovoMomento(x, momento){
  const caixa = document.getElementById('fm-mom-caixa'); caixa.innerHTML = '<div class="carregando">Gerando...</div>';
  let codigo = novoCodigo(), res = null;
  for(let t = 0; t < 6; t++){
    const { data, error } = await clienteMembros().rpc('familia_novo_momento', { p_id:x.id, p_momento:momento, p_codigo:codigo, p_mostrar:true });
    if(!error && data && data.ok){ res = data; break; } codigo = novoCodigo();
  }
  if(!res){ caixa.innerHTML = '<div class="aviso ver">Não consegui gerar o link agora. Saia da área, entre de novo e tente outra vez.</div>'; return; }
  const link = fmLink(codigo), msg = 'Olá, ' + fmPrim(x.nome) + '! Aqui é ' + (window.T_A || '') + '. Chegou a hora de refazer o ' + fmNome() + ' sobre ' + x.filho + ' (momento ' + FM.MOMENTO[momento] + '), para a gente ver a evolução. Leva cerca de 8 minutos:\n' + link;
  caixa.innerHTML = `<div class="codigo-gerado"><div class="valor">${codigo}</div><div class="para">${fmEsc(x.filho)} · momento ${FM.MOMENTO[momento]}</div></div>
    <a class="btn btn-zap" href="https://wa.me/${zapNumero(x.whatsapp)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener"><span class="duas">Enviar para ${fmEsc(fmPrim(x.nome))}<small>mensagem pronta com o link</small></span></a>`;
}
function fmApresentar(x){
  const c = x.notas || {}, cad = x.cadastro || {};
  const itens = FM.AREAS.filter(a => c.areas[a.k] != null).map(a => ({ id:a.k, nome:a.nome, nota:c.areas[a.k], nivel:c.areas[a.k] >= 65 ? 'alta' : c.areas[a.k] >= 35 ? 'media' : 'baixa' }))
    .concat([{ id:'conexao', nome:'Conexão', nota:c.conexao, nivel:c.conexao >= 65 ? 'alta' : c.conexao >= 35 ? 'media' : 'baixa' }]).sort((a, b) => b.nota - a.nota);
  const VOC = { pct:true, teste:fmNome(), item:'área', itens:'áreas', capaTit:'o que a família mostrou e o plano para ' + x.filho + '.', capaSub:'Plano de acompanhamento a partir do ' + fmNome() + '.',
    mapaTit:'Como ' + x.filho + ' está hoje', caminhoTit:'Como vamos cuidar', fase1:'Começamos pela área que mais pede cuidado hoje. Como trabalhamos: ', fase2:'Depois, cuidamos das outras áreas e da família. Como trabalhamos: ',
    evol:'No meio e na continuidade do acompanhamento, a família refaz o teste e vê a evolução em números.', altoTxt:'áreas que mais pedem cuidado: é por elas que começamos.', baixoTxt:'áreas tranquilas: os pontos de apoio.',
    destaque:'É a área que mais pede cuidado hoje.', dica:'Tudo o que aparece vem das respostas da família no ' + fmNome() + '.', objDinheiro:'Esperar o próximo ano custa caro: a dificuldade cresce e a confiança da criança diminui.',
    objTentei:'Aqui a família acompanha, em números, o que está mudando em cada momento.', picoRot:'mais cuidado', suporteRot:'pontos de apoio', legPico:'Prioridade: 65 ou mais', legSuporte:'Tranquilo: abaixo de 35' };
  const LIB = {}, TEC = {};
  FM.AREAS.forEach(a => { LIB[a.k] = { x:'dificuldade', y:'confiança', resumo:a.txt.prioridade, custo:'A dificuldade cresce e a criança passa a acreditar que não consegue.', imagine:['Ele(a) volta a acreditar que consegue.', 'A escola deixa de ser um peso.'] }; TEC[a.k] = a.plano; });
  LIB.conexao = { x:'distância', y:'presença', resumo:FM.CONEXAO.prioridade, custo:'A criança se fecha e a família perde a chance de ajudar no começo.', imagine:['Vocês conversam sem cobrança.', 'Ele(a) conta o que sente.'] }; TEC.conexao = 'orientação para pais, combinados de rotina e momentos de qualidade sem tela.';
  apresAbrir({ nome:x.nome, prim:fmPrim(x.nome), genero:'', idade:'', motivo:fmNome() + ' · ' + x.filho, dor:x.texto_livre || '', olhar:'', atencao:0, travas:itens },
    { voc:VOC, lib:LIB, tec:TEC, terap:{ nome:CONFIG.terapeuta, zap:CONFIG.whatsappNumero, insta:'', papel:'terapeuta', foto:fmFoto() } });
}
function fmCSV(v){ const s = String(v == null ? '' : v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function fmExportar(){
  const linhas = fmFiltradas().flatMap(g => g.momentos.slice().reverse());
  const cab = ['data', 'momento', 'origem', 'nome', 'whatsapp', 'email', 'quem', 'filho', 'ano', 'escola', 'indice_adulto', 'indice_filho', 'conexao', 'aprendizagem', 'rotina', 'emocoes', 'telas', 'cobranca', 'explosao', 'distancia', 'controle', 'esgotamento', 'elos', 'nao_sei', 'k1', 'k2', 'prioridade', 'ofertas', 'status', 'resultado_liberado'];
  const rows = linhas.map(x => { const c = x.notas || {}, cad = x.cadastro || {}, a = c.areas || {}, t = c.travas || {};
    return [fmQuando(x.criado_em), FM.MOMENTO[x.momento], x.origem || '', x.nome, x.whatsapp, cad.email || '', cad.quem || '', x.filho, cad.ano || '', cad.escola || '', c.indice_adulto, c.indice_filho == null ? '' : c.indice_filho, c.conexao,
      a.aprendizagem == null ? 'sem info' : a.aprendizagem, a.rotina == null ? 'sem info' : a.rotina, a.emocoes == null ? 'sem info' : a.emocoes, a.telas == null ? 'sem info' : a.telas,
      t.cobranca, t.explosao, t.distancia, t.controle, t.esgotamento, (c.elos || []).map(e => e.id).join(' '), x.nao_sei, c.k1, c.k2, x.prioridade, (x.ofertas || []).map(fmServ).join(' | '), x.status, x.liberado ? 'sim' : 'não'].map(fmCSV).join(';'); });
  const blob = new Blob(['﻿' + [cab.join(';')].concat(rows).join('\n')], { type:'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'travas-em-familia-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- links com origem + QR code ---------- */
function fmQR(texto, cb){
  const fazer = () => { try{ const q = qrcode(0, 'M'); q.addData(texto); q.make(); cb(q.createDataURL(8, 2)); }catch(e){ cb(null); } };
  if(window.qrcode) return fazer();
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; s.onload = fazer; s.onerror = () => cb(null); document.head.appendChild(s);
}
function fmBaixarQR(url, nome){ const a = document.createElement('a'); a.href = url; a.download = 'qr-' + (nome || 'travas-em-familia') + '.png'; document.body.appendChild(a); a.click(); a.remove(); }
function fmCaixaLink(codigo, origem, nome, mostrar){
  const link = fmLink(codigo, origem), caixa = document.getElementById('fm-caixa-link');
  caixa.innerHTML = `<div class="codigo-gerado fm-link-gerado"><div class="fm-qr" id="fm-qr"><div class="carregando">Gerando o QR code...</div></div>
    <div><div class="para">${fmEsc(nome || 'Link do ' + fmNome())} · origem <b>${fmEsc(origem || 'sem origem')}</b> · ${mostrar ? 'resultado na hora' : 'resultado depois da sua liberação'}</div>
    <p class="fm-url">${fmEsc(link)}</p>
    <div class="fm-acoes"><button class="btn btn-argila" id="fm-copiar" type="button">Copiar o link</button><button class="btn btn-contorno" id="fm-baixar-qr" type="button" disabled>Baixar o QR code</button></div></div></div>`;
  document.getElementById('fm-copiar').addEventListener('click', async e => { try{ await navigator.clipboard.writeText(link); e.target.textContent = 'Link copiado!'; }catch(err){ e.target.textContent = 'Não consegui copiar'; } setTimeout(() => { e.target.textContent = 'Copiar o link'; }, 2000); });
  fmQR(link, url => { const q = document.getElementById('fm-qr'); if(!q) return;
    if(!url){ q.innerHTML = '<p class="fm-nota">Não consegui gerar o QR code agora.</p>'; return; }
    q.innerHTML = `<img src="${url}" alt="QR code do link ${fmEsc(origem || '')}">`;
    const b = document.getElementById('fm-baixar-qr'); b.disabled = false; b.addEventListener('click', () => fmBaixarQR(url, origem || codigo)); });
  caixa.scrollIntoView({ behavior:'smooth', block:'start' });
}
async function fmGerarLink(){
  const b = document.getElementById('fm-gerar'), nome = document.getElementById('fm-l-nome').value.trim();
  const origem = document.getElementById('fm-l-origem').value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s\/.]+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  const mostrar = (document.querySelector('#fm-alt-mostrar button.ativa') || {}).dataset ? document.querySelector('#fm-alt-mostrar button.ativa').dataset.v === '1' : true;
  const s = await fmSessao(); if(!s){ alert('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  b.disabled = true; b.textContent = 'Criando...';
  let codigo = novoCodigo(), erro = null;
  for(let t = 0; t < 6; t++){
    const { error } = await s.c.from('travas_codigos').insert({ terapeuta_id:s.uid, codigo, cliente:nome || null, teste:'familia', tipo:'individual', compartilhado:true, mostrar_resultado:mostrar, urgencia:false, origem:origem || null });
    erro = error; if(!error) break; if(error.code === '23505'){ codigo = novoCodigo(); continue; } break;
  }
  b.disabled = false; b.textContent = 'Criar link com QR code';
  if(erro){ alert('Não consegui criar o link agora. Saia da área, entre de novo e tente outra vez.'); return; }
  fmCaixaLink(codigo, origem, nome, mostrar); fmCarregarLinks();
}
async function fmCarregarLinks(){
  const caixa = document.getElementById('fm-lista-links'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const s = await fmSessao(); if(!s) return;
  const { data, error } = await s.c.from('travas_codigos').select('codigo,cliente,origem,criado_em,usos,mostrar_resultado,compartilhado,momento,usado').eq('terapeuta_id', s.uid).eq('teste', 'familia').order('criado_em', { ascending:false }).limit(300);
  if(error){ caixa.innerHTML = '<div class="aviso ver">Não consegui carregar os links agora.</div>'; return; }
  fmLinks = data || [];
  if(!fmLinks.length){ caixa.innerHTML = '<div class="vazio">Nenhum link ainda. Crie o primeiro acima.</div>'; return; }
  caixa.innerHTML = fmLinks.map(l => `<div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${fmEsc(l.cliente || 'Link')}<span class="tag-vis">${fmEsc(l.origem || 'sem origem')}</span><span class="tag-vis">${l.mostrar_resultado ? 'resultado na hora' : 'resultado depois'}</span>${l.momento ? '<span class="tag-vis">momento ' + FM.MOMENTO[l.momento] + '</span>' : ''}</span>
      <span class="sub">${l.codigo} · criado em ${fmQuando(l.criado_em)} · ${l.compartilhado ? (l.usos || 0) + ' ' + ((l.usos || 0) === 1 ? 'resposta' : 'respostas') : (l.usado ? 'já respondido' : 'aguardando resposta')}</span></span>
      <span class="etiqueta ${l.compartilhado ? 'livre' : 'usado'}">${l.compartilhado ? 'aberto' : 'individual'}</span>
      <span style="display:flex;gap:8px;width:100%;margin-top:8px;flex-wrap:wrap"><button type="button" class="mini-btn" data-fm-ver="${l.codigo}">QR code e link</button></span></div>`).join('');
  caixa.querySelectorAll('[data-fm-ver]').forEach(b => b.addEventListener('click', () => { const l = fmLinks.find(z => z.codigo === b.dataset.fmVer); fmCaixaLink(l.codigo, l.origem, l.cliente, l.mostrar_resultado); }));
}
function fmDesenharAjustes(){
  const cfg = fmCfg(), s = cfg.servicos || {}, pub = (cfg.adulto_publico || []).join(', ');
  const box = document.getElementById('fm-ajustes');
  box.innerHTML = `<h3>Ajustes do teste</h3>
    <div class="campo"><label for="fm-cfg-nome">Nome do teste</label><input id="fm-cfg-nome" type="text" maxlength="60" value="${fmEsc(cfg.nome || 'Travas em Família')}"></div>
    <div class="campo"><label for="fm-cfg-ped">Serviço: aprendizagem e rotina</label><input id="fm-cfg-ped" type="text" maxlength="80" value="${fmEsc(s.pedagogica || 'Intervenção Pedagógica e Acolhimento Avaliativo')}"></div>
    <div class="campo"><label for="fm-cfg-ori">Serviço: pais</label><input id="fm-cfg-ori" type="text" maxlength="80" value="${fmEsc(s.orientacao || 'Orientação para pais')}"></div>
    <div class="campo"><label for="fm-cfg-adu">Serviço: adulto</label><input id="fm-cfg-adu" type="text" maxlength="80" value="${fmEsc(s.adulto || 'Atendimento individual do adulto')}"></div>
    <div class="campo"><label for="fm-cfg-pub">Para quais origens sugerir o atendimento do adulto?</label><input id="fm-cfg-pub" type="text" value="${fmEsc(pub)}" placeholder="Ex.: palestra-enel-23-11 (separe por vírgula; * vale para todas)">
      <div class="dica">Aparece como oferta quando o Índice do adulto for 50 ou mais e a resposta vier de uma dessas origens. Vale para as próximas respostas.</div></div>
    <div class="aviso" id="fm-cfg-aviso"></div>
    <button class="btn btn-argila" id="fm-cfg-salvar" type="button">Salvar ajustes</button>`;
  document.getElementById('fm-cfg-salvar').addEventListener('click', async e => {
    const v = id => document.getElementById(id).value.trim();
    const novo = { nome:v('fm-cfg-nome') || 'Travas em Família', servicos:{ pedagogica:v('fm-cfg-ped'), orientacao:v('fm-cfg-ori'), adulto:v('fm-cfg-adu') },
      adulto_publico:v('fm-cfg-pub').split(',').map(x => x.trim().toLowerCase()).filter(Boolean) };
    e.target.disabled = true;
    const { data, error } = await clienteMembros().rpc('familia_config', { p_cfg:novo });
    e.target.disabled = false;
    const a = document.getElementById('fm-cfg-aviso');
    if(error || !data || !data.ok){ a.textContent = 'Não consegui salvar agora. Tente de novo.'; a.classList.add('ver'); return; }
    if(window.__T && __T.dados) __T.dados.familia = data.familia;
    a.textContent = 'Ajustes salvos.'; a.classList.add('ver'); fmDesenharLista();
  });
}
function fmSeletor(){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  const campo = alt.closest('.campo');
  if(!alt.querySelector('[data-v=familia]')){
    alt.insertAdjacentHTML('beforeend', `<button type="button" data-v="familia" role="radio" aria-checked="false">${fmEsc(fmNome())}<small>pais e filhos</small></button>`);
    const b = alt.querySelector('[data-v=familia]');
    b.addEventListener('click', () => {
      alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      const adm = document.getElementById('painel-admin'); adm.classList.remove('modo-tc', 'modo-mp', 'modo-dc', 'modo-an'); adm.classList.add('modo-fm');
      fmAdminAba('respostas'); fmCarregar();
    });
    alt.querySelectorAll('button').forEach(x => { if(x !== b) x.addEventListener('click', () => document.getElementById('painel-admin').classList.remove('modo-fm')); });
  }
  /* mostra só os testes que a terapeuta tem */
  const tst = (window.__T && __T.dados && Array.isArray(__T.dados.testes)) ? __T.dados.testes : ['travas', 'familia'];
  alt.querySelectorAll('button[data-v]').forEach(x => { if(x.dataset.v !== 'familia' && tst.indexOf(x.dataset.v) < 0) x.style.display = 'none'; });
  if(campo) campo.style.display = '';
}

/* ---------- liga o módulo ---------- */
function fmInit(){
  if(fmInit.feito) return; fmInit.feito = true;
  if(!document.querySelector('link[href^="devolutiva-familia.css"]')){ const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'devolutiva-familia.css?v=' + ((document.querySelector('meta[name="versao-site"]') || {}).content || '1'); document.head.appendChild(l); }
  fmMontarTelas(); fmAdminMontar(); fmSeletor();
  /* link do teste (?c=CÓDIGO): o Família assume a página */
  try{
    const q = new URLSearchParams(location.search), c = (q.get('c') || q.get('codigo') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9);
    if(!c) return fmSoltarTela();
    const decidir = r => { if(r && r.teste === 'familia' && (r.ok || r.valido)) fmEntrar(c, r); else if(q.get('f') === '1') fmSoltarTela(); };
    if(window.FM_LINK_VALIDO) return decidir(window.FM_LINK_VALIDO);
    if(q.get('f') === '1') return fmEntrar(c, { teste:'familia' });
    if(typeof validarCodigo === 'function') validarCodigo(c).then(decidir, () => {});
  }catch(e){ fmSoltarTela(); }
}
(function esperar(n){
  const pronto = typeof mostrarTela === 'function' && typeof clienteMembros === 'function' && typeof compRpc === 'function' && document.getElementById('tela-admin') && document.getElementById('alt-teste') && window.__T;
  if(pronto) return fmInit();
  if(n < 200) setTimeout(() => esperar(n + 1), 60);
})(0);
/* com ?f=1 (link do Família), a capa do Travas nem aparece enquanto o teste abre */
try{ if(/[?&]f=1\b/.test(location.search)) document.documentElement.classList.add('fm-espera'); }catch(e){}
window.fmEntrar = fmEntrar; window.FM_CALC_TEXTOS = FM;
