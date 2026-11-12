/* ============================================================================
   MPCC · MAPA DE PERFIL COMPORTAMENTAL E COMPETÊNCIAS
   Instrumento autoral de Meire Transformação Emocional. Ferramenta de autoconhecimento e desenvolvimento:
   NÃO é teste psicológico, instrumento psicométrico validado nem diagnóstico.

   40 afirmações, escala de 1 a 5, 8 dimensões com 5 afirmações cada.
   Afirmações invertidas (4, 9, 14, 19, 24, 29, 34 e 39): 1↔5, 2↔4.
   Dimensão = soma dos 5 pontos corrigidos ÷ 5.   Perfil geral = média das 8 dimensões.
   Faixas: 1,0–1,9 baixo · 2,0–2,9 em desenvolvimento · 3,0–3,9 moderado · 4,0–4,5 bom · 4,6–5,0 elevado.

   Este arquivo só define funções e dados; o modelo do teste chama mpInit() quando a terapeuta tem o MPCC liberado.
   ============================================================================ */
const MP = { NOME:'Mapa de Perfil Comportamental e Competências', SIGLA:'MPCC', AUTORIA:'Meire Transformação Emocional' };
const MP_ESCALA = ['Nunca me identifico', 'Raramente me identifico', 'Às vezes me identifico', 'Frequentemente me identifico', 'Sempre me identifico'];
const MP_FAIXAS = [
  { id:'baixo',    nome:'Baixo desenvolvimento',     cor:'#A8542B', texto:'Indica uma área que pode representar maior oportunidade de desenvolvimento no momento.' },
  { id:'emdesen',  nome:'Em desenvolvimento',        cor:'#B8793A', texto:'Indica recursos presentes, mas que podem ser fortalecidos.' },
  { id:'moderado', nome:'Desenvolvimento moderado',  cor:'#4F86A8', texto:'Indica presença razoável do recurso avaliado, com possibilidades de aprimoramento.' },
  { id:'bom',      nome:'Bom desenvolvimento',       cor:'#2F7D6B', texto:'Indica um recurso pessoal relativamente consolidado.' },
  { id:'elevado',  nome:'Desenvolvimento elevado',   cor:'#1F6E54', texto:'Indica forte presença da característica avaliada.' }
];
const MP_GERAL = [
  'Este retrato mostra várias dimensões como oportunidades de desenvolvimento neste momento, o que pode ser um bom ponto de partida para escolher por onde começar.',
  'Há recursos presentes em diferentes áreas, que podem ser fortalecidos com prática e acompanhamento.',
  'Há uma presença razoável dos recursos avaliados, com boas possibilidades de aprimoramento.',
  'Os recursos avaliados aparecem relativamente consolidados, com espaço para refinar pontos específicos.',
  'Os recursos avaliados aparecem com forte presença. O desafio passa a ser sustentá-los e usá-los com consciência.'
];
/* as 8 dimensões: o que avalia, e a leitura para cada nível (alto: 4,0 ou mais · medio: 3,0 a 3,9 · baixo: abaixo de 3,0) */
const MP_DIM = [
  { id:'autonomia', nome:'Autonomia e Iniciativa', curto:'Autonomia', rotulo:['Autonomia e', 'Iniciativa'],
    avalia:['iniciativa', 'independência', 'capacidade de começar', 'responsabilidade', 'tomada de iniciativa'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a tomar a frente, buscar alternativas e colocar as próprias ideias em prática sem esperar que alguém conduza.',
    medio:'Foi identificada uma tendência intermediária: a iniciativa aparece em vários momentos, mas pode oscilar quando faltam clareza, segurança ou condições ideais para começar.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica uma tendência a esperar orientação, ou o momento ideal, antes de começar.',
    dicas:['Escolha uma ação pequena que você vem adiando e defina o primeiro passo para esta semana.', 'Diante de um problema, anote duas alternativas antes de pedir ajuda a alguém.', 'Comece sem esperar as condições ideais e vá ajustando o caminho enquanto anda.'] },
  { id:'comunicacao', nome:'Comunicação e Expressão', curto:'Comunicação', rotulo:['Comunicação e', 'Expressão'],
    avalia:['comunicação', 'capacidade de expressar opiniões', 'clareza', 'escuta', 'expressão emocional'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a expressar o que pensa e sente com clareza e a abrir espaço para ouvir o ponto de vista do outro.',
    medio:'Foi identificada uma tendência intermediária: a comunicação aparece como recurso em boa parte das situações, mas pode haver momentos em que guardar o que incomoda fala mais alto.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica uma tendência a evitar falar do que pensa ou sente, talvez por receio de desagradar ou de ser julgado(a).',
    dicas:['Pratique dizer, em uma frase, o que você pensa ou precisa em uma conversa do dia a dia.', 'Antes de responder, repita com as suas palavras o que a outra pessoa disse, para confirmar que entendeu.', 'Peça ajuda ou esclareça uma dúvida logo que ela surgir, sem esperar acumular.'] },
  { id:'relacionamento', nome:'Relacionamento e Cooperação', curto:'Relacionamento', rotulo:['Relacionamento', 'e Cooperação'],
    avalia:['empatia', 'cooperação', 'relacionamento interpessoal', 'trabalho em equipe', 'capacidade de estabelecer vínculos'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a cooperar, compreender as necessidades dos outros e manter boas relações mesmo diante de diferenças.',
    medio:'Foi identificada uma tendência intermediária: a cooperação e a empatia aparecem com frequência, mas as diferenças de opinião podem, em alguns momentos, tornar a convivência mais difícil.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica que pensar diferente do outro pode pesar na relação, e que há espaço para fortalecer a cooperação e os vínculos.',
    dicas:['Em uma conversa difícil, pergunte primeiro o que a outra pessoa precisa, antes de explicar o seu lado.', 'Em um trabalho em grupo, combine papéis e expectativas logo no início.', 'Cultive um vínculo por semana com um gesto simples: uma mensagem, um convite, uma escuta atenta.'] },
  { id:'decisao', nome:'Tomada de Decisão', curto:'Decisão', rotulo:['Tomada de', 'Decisão'],
    avalia:['segurança para decidir', 'análise de situações', 'responsabilidade pelas escolhas', 'tendência à dúvida', 'capacidade de assumir posicionamentos'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a avaliar as opções, assumir uma posição e responder pelas consequências das próprias escolhas.',
    medio:'Foi identificada uma tendência intermediária: decidir costuma ser possível, mas a dúvida ou a incerteza podem alongar o processo em algumas situações.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica uma tendência à dúvida e à busca de que outra pessoa escolha, o que pode ser trabalhado com prática.',
    dicas:['Defina um prazo para decidir e liste no máximo três critérios que importam de verdade.', 'Depois de decidir, registre o que aprendeu com o resultado, sem se punir.', 'Em decisões pequenas, treine escolher sozinho(a) antes de consultar alguém.'] },
  { id:'flexibilidade', nome:'Flexibilidade e Adaptação', curto:'Flexibilidade', rotulo:['Flexibilidade e', 'Adaptação'],
    avalia:['reação às mudanças', 'capacidade de adaptação', 'abertura para novas possibilidades', 'tolerância à mudança', 'capacidade de reorganização'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a se adaptar às mudanças, aprender com o novo e reorganizar os planos quando preciso.',
    medio:'Foi identificada uma tendência intermediária: a adaptação costuma acontecer, mas mudanças inesperadas podem causar desconforto antes de a reorganização vir.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica que mudar os planos pode ser difícil, e que há espaço para ampliar a abertura ao novo.',
    dicas:['Diante de uma mudança, pergunte: o que continua possível? Liste três alternativas.', 'Experimente fazer uma tarefa de rotina de um jeito diferente esta semana.', 'Quando o plano não sair como esperado, reorganize em etapas curtas, em vez de refazer tudo de uma vez.'] },
  { id:'organizacao', nome:'Organização e Responsabilidade', curto:'Organização', rotulo:['Organização e', 'Responsabilidade'],
    avalia:['planejamento', 'organização', 'cumprimento de compromissos', 'disciplina', 'gerenciamento de tarefas'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a planejar, priorizar e cumprir os compromissos assumidos até a conclusão.',
    medio:'Foi identificada uma tendência intermediária: a organização aparece em várias situações, mas manter a rotina e antecipar tarefas pode oscilar.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica que manter uma rotina organizada e acompanhar as tarefas até o fim pode ser um desafio no momento.',
    dicas:['Ao começar o dia, escolha as três prioridades e deixe o resto para depois.', 'Divida compromissos grandes em etapas com datas e acompanhe até o fim.', 'Monte uma rotina mínima (horário, lugar e duração) e mantenha por duas semanas antes de ampliar.'] },
  { id:'autoconfianca', nome:'Autoconfiança', curto:'Autoconfiança', rotulo:['', 'Autoconfiança'],
    avalia:['confiança nas próprias capacidades', 'reconhecimento das próprias competências', 'segurança', 'iniciativa diante de desafios', 'percepção de capacidade'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a reconhecer as próprias qualidades, aprender com os erros e enfrentar desafios mesmo com algum receio.',
    medio:'Foi identificada uma tendência intermediária: a confiança aparece, mas pode vacilar diante de erros ou quando a pessoa se compara aos outros.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica uma tendência a duvidar da própria capacidade, mesmo quando há preparo, e há espaço para reconhecer melhor as próprias conquistas.',
    dicas:['Anote, no fim do dia, uma coisa que você fez bem e o que isso mostra sobre você.', 'Diante de um erro, pergunte: o que aprendi? Em vez de: o que isso diz sobre mim?', 'Aceite um desafio pequeno por semana, mesmo com receio, e observe como você lida.'] },
  { id:'regulacao', nome:'Regulação Emocional', curto:'Regulação emocional', rotulo:['Regulação', 'Emocional'],
    avalia:['percepção das próprias emoções', 'reação diante de situações difíceis', 'capacidade de se recuperar de frustrações', 'impulsividade', 'capacidade de manter equilíbrio diante de pressão'],
    alto:'Esta dimensão aparece como um recurso: o resultado indica uma tendência a perceber as próprias emoções, fazer uma pausa antes de reagir e recuperar o equilíbrio depois de situações difíceis.',
    medio:'Foi identificada uma tendência intermediária: o equilíbrio emocional costuma voltar, mas sob pressão ou frustração as reações podem ficar mais intensas.',
    baixo:'Esta dimensão representa uma oportunidade de desenvolvimento: o resultado indica que, em momentos de pressão ou frustração, pode ser difícil conter as reações, o que pode ser trabalhado com estratégias simples.',
    dicas:['Antes de reagir a algo que irritou, faça uma pausa de três respirações profundas.', 'Nomeie a emoção em voz baixa ("estou sentindo frustração") antes de decidir o que fazer.', 'Depois de um dia difícil, reserve dez minutos para algo que restaure o equilíbrio: uma caminhada, uma música, a escrita.'] }
];
/* as 40 afirmações (d = índice da dimensão; inv = afirmação invertida) */
const MP_PERGUNTAS = [
  { d:0, q:'Quando percebo que algo precisa ser feito, procuro tomar a iniciativa sem esperar que outra pessoa me conduza.' },
  { d:0, q:'Diante de um problema, procuro alternativas antes de esperar que alguém resolva por mim.' },
  { d:0, q:'Consigo começar uma tarefa mesmo quando ainda não tenho todas as condições ideais.' },
  { d:0, q:'Frequentemente preciso que alguém me diga exatamente o que fazer antes de começar uma tarefa.', inv:true },
  { d:0, q:'Quando tenho uma ideia que considero importante, procuro colocá-la em prática.' },
  { d:1, q:'Consigo explicar aquilo que penso de maneira clara.' },
  { d:1, q:'Consigo expressar quando algo me incomoda sem precisar guardar tudo para mim.' },
  { d:1, q:'Tenho facilidade para ouvir o ponto de vista de outra pessoa mesmo quando penso diferente.' },
  { d:1, q:'Evito falar sobre o que penso porque tenho medo de desagradar ou de ser julgado(a).', inv:true },
  { d:1, q:'Consigo pedir ajuda ou esclarecer uma dúvida quando preciso.' },
  { d:2, q:'Consigo trabalhar em conjunto com outras pessoas para alcançar um objetivo.' },
  { d:2, q:'Procuro compreender as necessidades das pessoas com quem convivo.' },
  { d:2, q:'Consigo respeitar opiniões diferentes das minhas.' },
  { d:2, q:'Quando alguém pensa diferente de mim, tenho dificuldade para manter uma relação tranquila.', inv:true },
  { d:2, q:'Consigo contribuir para um ambiente de cooperação mesmo quando existem diferenças entre as pessoas.' },
  { d:3, q:'Quando preciso tomar uma decisão, consigo avaliar as opções disponíveis.' },
  { d:3, q:'Depois de analisar uma situação, consigo assumir uma posição.' },
  { d:3, q:'Consigo tomar decisões mesmo quando existe algum grau de incerteza.' },
  { d:3, q:'Tenho dificuldade para decidir e frequentemente preciso que outra pessoa escolha por mim.', inv:true },
  { d:3, q:'Quando tomo uma decisão, procuro assumir responsabilidade pelas consequências.' },
  { d:4, q:'Consigo me adaptar quando meus planos precisam ser modificados.' },
  { d:4, q:'Quando surge uma mudança inesperada, procuro entender a situação antes de reagir.' },
  { d:4, q:'Consigo experimentar maneiras diferentes de fazer uma tarefa.' },
  { d:4, q:'Quando algo não acontece como eu esperava, tenho muita dificuldade para reorganizar meus planos.', inv:true },
  { d:4, q:'Consigo aprender com situações novas, mesmo quando inicialmente me sinto desconfortável.' },
  { d:5, q:'Costumo organizar minhas tarefas de acordo com prioridades.' },
  { d:5, q:'Procuro cumprir os compromissos que assumo.' },
  { d:5, q:'Consigo planejar minhas atividades para evitar deixar tudo para a última hora.' },
  { d:5, q:'Tenho dificuldade para manter uma rotina organizada.', inv:true },
  { d:5, q:'Quando assumo uma responsabilidade, procuro acompanhar sua execução até a conclusão.' },
  { d:6, q:'Reconheço habilidades e qualidades que possuo.' },
  { d:6, q:'Consigo enfrentar desafios mesmo quando sinto algum receio.' },
  { d:6, q:'Quando cometo um erro, consigo aprender com ele sem concluir que sou incapaz.' },
  { d:6, q:'Frequentemente duvido da minha capacidade mesmo quando tenho conhecimento ou preparo para realizar algo.', inv:true },
  { d:6, q:'Consigo reconhecer minhas conquistas sem diminuir o que fiz.' },
  { d:7, q:'Consigo perceber quando minhas emoções estão influenciando minhas atitudes.' },
  { d:7, q:'Quando passo por uma situação difícil, consigo recuperar gradualmente meu equilíbrio.' },
  { d:7, q:'Consigo fazer uma pausa antes de reagir impulsivamente quando estou emocionalmente ativado(a).' },
  { d:7, q:'Quando fico muito preocupado(a) ou frustrado(a), tenho dificuldade para controlar minhas reações.', inv:true },
  { d:7, q:'Consigo reconhecer o que estou sentindo e buscar uma maneira construtiva de lidar com isso.' }
];

/* ---- 1. O CÁLCULO ---- */
const mpNum = (v, c) => (Math.round(v * Math.pow(10, c == null ? 1 : c)) / Math.pow(10, c == null ? 1 : c)).toFixed(c == null ? 1 : c).replace('.', ',');
const mpPrim = n => String(n || '').trim().split(/\s+/)[0] || '';
const mpEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const mpDig = v => String(v || '').replace(/\D/g, '');
function mpFaixa(m){ m = Math.round(m * 1000) / 1000; return m >= 4.6 ? MP_FAIXAS[4] : m >= 4 ? MP_FAIXAS[3] : m >= 3 ? MP_FAIXAS[2] : m >= 2 ? MP_FAIXAS[1] : MP_FAIXAS[0]; }
function mpNivel(m){ return m >= 4 ? 'alto' : m >= 3 ? 'medio' : 'baixo'; }
function mpMontar(medias){
  const dims = MP_DIM.map((d, i) => { const m = Math.round(medias[i] * 1000) / 1000; return { i, id:d.id, nome:d.nome, curto:d.curto, media:m, faixa:mpFaixa(m) }; });
  const mg = Math.round(dims.reduce((s, x) => s + x.media, 0) / dims.length * 1000) / 1000;
  const ordem = dims.slice().sort((a, b) => b.media - a.media || a.i - b.i);
  return { dims, geral:{ media:mg, faixa:mpFaixa(mg) }, ordem, topo:ordem.slice(0, 3), meio:ordem.slice(3, 5), baixo:ordem.slice(5, 8) };
}
function mpCalcular(respostas){
  const soma = MP_DIM.map(() => 0), qtd = MP_DIM.map(() => 0);
  MP_PERGUNTAS.forEach((p, i) => {
    const r = respostas[i], v = Math.min(5, Math.max(1, +((r && typeof r === 'object') ? r.valor : r) || 1));
    soma[p.d] += p.inv ? 6 - v : v; qtd[p.d]++;
  });
  const c = mpMontar(soma.map((s, i) => s / qtd[i])); c.pontos = soma; return c;
}
/* a partir das médias já salvas ([{id, media}]) */
function mpDeDimensoes(dimensoes){
  return mpMontar(MP_DIM.map(d => { const x = (dimensoes || []).find(z => z.id === d.id); return x ? +x.media : 1; }));
}
function mpDeRegistro(d){ return Array.isArray(d.respostas) && d.respostas.length === MP_PERGUNTAS.length ? mpCalcular(d.respostas) : mpDeDimensoes(d.dimensoes); }
function mpPacote(calc, resp, cad, codigo, inicio){
  return { teste:'mpcc', versao:1, codigo, data:hoje(), data_iso:new Date().toISOString(), duracaoMin:inicio ? Math.round((Date.now() - inicio) / 60000) : null,
    nome:cad.nome, email:cad.email, whatsapp:cad.whatsapp, idade:cad.idade, profissao:cad.profissao, area:cad.area, objetivo:cad.objetivo, expectativa:cad.expectativa,
    consentimento:true, consentimento_contato:!!cad.contato,
    dimensoes:calc.dims.map(x => ({ id:x.id, nome:x.nome, media:x.media, pontos:calc.pontos ? calc.pontos[x.i] : null })),
    geral:{ media:calc.geral.media, faixa:calc.geral.faixa.nome },
    respostas:MP_PERGUNTAS.map((p, i) => { const v = resp[i] || 1; return { n:i + 1, afirmacao:p.q, dimensao:MP_DIM[p.d].id, invertida:!!p.inv, valor:v, pontos:p.inv ? 6 - v : v }; }) };
}

/* ---- 2. QUEM APLICA (a marca do instrumento e o nome da profissional na devolutiva) ---- */
const mpEhMeire = () => /^meire/i.test(window.T_SLUG || '');
const mpComQuem = () => mpEhMeire() ? MP.AUTORIA : (window.T_NOME || (typeof T_A !== 'undefined' ? T_A : 'a terapeuta'));
const mpAp = () => typeof T_A !== 'undefined' ? T_A : 'a terapeuta';
const mpZapTer = texto => 'https://wa.me/' + (CONFIG.whatsappNumero || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
const mpLink = codigo => location.origin + location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&mp=' + encodeURIComponent(codigo);
const mpQuando = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const mpDataCurta = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';

/* ---- 3. O GRÁFICO RADAR (8 dimensões, escala de 1 a 5) ---- */
const mpRadares = [];
function mpCores(){
  const g = n => (getComputedStyle(document.documentElement).getPropertyValue(n) || '').trim();
  return { linha:g('--ardosia') || '#1F4B6B', fundo:g('--argila') || '#34769C', suave:g('--borda') || '#CEDEE7', tinta:g('--tinta') || '#132D40', ouro:'#B8913F' };
}
function mpRadar(canvas, dims, ladoFixo, dprFixo){
  const dpr = dprFixo || window.devicePixelRatio || 1;
  const lado = ladoFixo || Math.max(280, Math.min((canvas.parentElement ? canvas.parentElement.clientWidth : 360) - 8, 560));
  canvas.style.width = lado + 'px'; canvas.style.height = lado + 'px'; canvas.width = Math.round(lado * dpr); canvas.height = Math.round(lado * dpr);
  const c = canvas.getContext('2d'), k = mpCores(), n = dims.length, largo = lado >= 440;
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, lado, lado);
  const cx = lado / 2, cy = lado / 2, raio = largo ? lado * 0.27 : lado * 0.34;
  const ponto = (i, f) => { const a = Math.PI * 2 * i / n - Math.PI / 2; return [cx + Math.cos(a) * raio * f, cy + Math.sin(a) * raio * f]; };
  for(let anel = 1; anel <= 5; anel++){
    c.beginPath(); for(let i = 0; i < n; i++){ const [x, y] = ponto(i, anel / 5); i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.closePath(); c.strokeStyle = anel === 5 ? k.ouro : k.suave; c.lineWidth = anel === 5 ? 1.6 : 1; c.stroke();
  }
  for(let i = 0; i < n; i++){ const [x, y] = ponto(i, 1); c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.strokeStyle = k.suave; c.lineWidth = 1; c.stroke(); }
  c.font = '600 ' + (largo ? 11 : 10) + 'px Karla, sans-serif'; c.fillStyle = '#8A97A0'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for(let anel = 1; anel <= 5; anel++){ const [x, y] = ponto(0, anel / 5); c.fillText(String(anel), x + 4, y); }
  c.beginPath(); dims.forEach((d, i) => { const [x, y] = ponto(i, d.media / 5); i ? c.lineTo(x, y) : c.moveTo(x, y); });
  c.closePath(); c.globalAlpha = .22; c.fillStyle = k.fundo; c.fill(); c.globalAlpha = 1; c.strokeStyle = k.linha; c.lineWidth = 2.4; c.stroke();
  dims.forEach((d, i) => { const [x, y] = ponto(i, d.media / 5); c.beginPath(); c.arc(x, y, 4.6, 0, Math.PI * 2); c.fillStyle = k.linha; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); });
  dims.forEach((d, i) => {
    const a = Math.PI * 2 * i / n - Math.PI / 2, folga = largo ? 16 : 17, x = cx + Math.cos(a) * (raio + folga), y = cy + Math.sin(a) * (raio + folga);
    if(!largo){
      c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.fillStyle = k.linha; c.fill();
      c.fillStyle = '#fff'; c.font = '700 11px Karla, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), x, y + .5); return;
    }
    const alinh = Math.abs(Math.cos(a)) < .3 ? 'center' : (Math.cos(a) > 0 ? 'left' : 'right'), rot = MP_DIM[d.i != null ? d.i : i].rotulo.filter(Boolean);
    const topo = Math.sin(a) < -.9, base = Math.sin(a) > .9, h = rot.length * 15 + 16, y0 = topo ? y - h + 6 : base ? y - 2 : y - h / 2 + 8;
    c.textAlign = alinh; c.textBaseline = 'middle'; c.font = '700 13px Karla, sans-serif'; c.fillStyle = k.tinta;
    rot.forEach((t, j) => c.fillText(t, x, y0 + j * 15));
    c.font = '700 12px Karla, sans-serif'; c.fillStyle = k.linha; c.fillText(mpNum(d.media), x, y0 + rot.length * 15 + 1);
  });
}
function mpLigarRadar(raiz, dims){
  const cv = raiz.querySelector('.mp-radar'); if(!cv) return;
  mpRadares.push({ cv, dims }); mpRedesenhar();
}
function mpRedesenhar(){
  for(let i = mpRadares.length - 1; i >= 0; i--){ const r = mpRadares[i]; if(!r.cv.isConnected){ mpRadares.splice(i, 1); continue; } if(r.cv.offsetParent) mpRadar(r.cv, r.dims); }
}
window.addEventListener('resize', () => { clearTimeout(mpRedesenhar.t); mpRedesenhar.t = setTimeout(mpRedesenhar, 150); });
function mpRadarImagem(dims){ const cv = document.createElement('canvas'); mpRadar(cv, dims, 600, 2); return cv.toDataURL('image/png'); }

/* ---- 4. O RELATÓRIO (as mesmas seções aparecem na tela do cliente, na área da terapeuta e no PDF) ---- */
const MP_AVISO = 'Este resultado não representa uma limitação ou diagnóstico. Indica apenas uma área que pode ser trabalhada e desenvolvida.';
const MP_TEXTO_FINAL = 'Este resultado representa um retrato das tendências identificadas a partir das suas respostas neste momento. Ele não define quem você é e não deve ser interpretado como diagnóstico psicológico. As características humanas são dinâmicas e podem ser desenvolvidas ao longo do tempo. Use este resultado como ponto de partida para compreender seus recursos, reconhecer seus desafios e identificar possibilidades de crescimento.';
const MP_OBS = 'O MPCC é uma ferramenta autoral de autoconhecimento e desenvolvimento pessoal. Não é um teste psicológico, nem um instrumento psicométrico validado, e não substitui avaliação ou acompanhamento profissional.';
function mpLista(nomes){ return nomes.length > 1 ? nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1] : (nomes[0] || ''); }
function mpCartaoDim(x, rot){
  const d = MP_DIM[x.i];
  return `<div class="mp-card"><div class="mp-card-topo"><h3>${escV(d.nome)}</h3><span class="mp-nota" style="--c:${x.faixa.cor}"><b>${mpNum(x.media)}</b> / 5</span></div>
    <span class="mp-faixa" style="--c:${x.faixa.cor}">${escV(x.faixa.nome)}</span>
    <p>${escV(d[mpNivel(x.media)])}</p>
    <p class="mp-avalia"><b>O que esta dimensão considera:</b> ${escV(d.avalia.join(', '))}.</p></div>`;
}
function mpSecoes(calc, img){
  const g = calc.geral, graf = img ? `<img class="mp-radar-img" src="${img}" alt="Gráfico radar com as oito dimensões">` : '<canvas class="mp-radar" role="img" aria-label="Gráfico radar com as oito dimensões do perfil"></canvas>';
  const visao = `<h2>Visão geral</h2>
    <div class="mp-geral"><div class="mp-geral-nota" style="--c:${g.faixa.cor}"><span>Perfil geral</span><b>${mpNum(g.media, 2)}</b><small>em uma escala de 1 a 5</small></div>
      <div><span class="mp-faixa" style="--c:${g.faixa.cor}">${escV(g.faixa.nome)}</span>
      <p>Seu resultado geral indica <b>${escV(g.faixa.nome.toLowerCase())}</b>. ${escV(MP_GERAL[MP_FAIXAS.indexOf(g.faixa)])}</p></div></div>
    <p>Entre as oito dimensões, os maiores resultados aparecem em <b>${escV(mpLista(calc.topo.map(x => x.nome)))}</b>. As dimensões com maior oportunidade de desenvolvimento neste momento são <b>${escV(mpLista(calc.baixo.map(x => x.nome)))}</b>.</p>
    <p class="mp-nota-peq">As classificações são indicadores de desenvolvimento neste momento, não um diagnóstico.</p>`;
  const grafico = `<h2>Gráfico do perfil</h2>
    <div class="mp-grafico">${graf}</div>
    <ol class="mp-legenda">${calc.dims.map(x => `<li><span class="mp-leg-n">${x.i + 1}</span><span class="mp-leg-t">${escV(x.nome)}</span><b style="color:${x.faixa.cor}">${mpNum(x.media)}</b><span class="mp-barra"><i style="width:${Math.round(x.media / 5 * 100)}%;background:${x.faixa.cor}"></i></span></li>`).join('')}</ol>
    <p class="mp-nota-peq">Escala de 1 a 5. Quanto mais afastado do centro, maior o desenvolvimento da dimensão neste momento.</p>`;
  const destaques = `<h2>Pontos de destaque</h2>
    <p>Os três maiores resultados mostram os seus principais recursos neste momento.</p>${calc.topo.map(x => mpCartaoDim(x)).join('')}`;
  const desen = `<h2>Aspectos em desenvolvimento</h2>
    <p class="mp-aviso">${escV(MP_AVISO)}</p>
    <p>Estas são as três dimensões com maior oportunidade de desenvolvimento neste momento.</p>${calc.baixo.map(x => mpCartaoDim(x)).join('')}
    <h3 class="mp-sub">Recursos em desenvolvimento</h3>
    <p>As duas dimensões intermediárias aparecem como recursos já presentes, que seguem em desenvolvimento.</p>
    <ul class="mp-meio">${calc.meio.map(x => `<li><b>${escV(x.nome)}</b> <span class="mp-faixa" style="--c:${x.faixa.cor}">${mpNum(x.media)} · ${escV(x.faixa.nome)}</span></li>`).join('')}</ul>`;
  const reco = `<h2>Recomendações</h2>
    <p>Sugestões gerais de desenvolvimento pessoal e profissional a partir do seu resultado. Escolha uma ou duas para começar e pratique por algumas semanas.</p>
    ${calc.baixo.map(x => `<div class="mp-reco"><h3>${escV(x.nome)}</h3><ul>${MP_DIM[x.i].dicas.slice(0, 2).map(t => '<li>' + escV(t) + '</li>').join('')}</ul></div>`).join('')}
    <div class="mp-reco mp-reco-forte"><h3>Como usar os seus recursos</h3><ul>${calc.topo.slice(0, 2).map(x => `<li>Use ${escV(x.nome)} a seu favor: ${escV(MP_DIM[x.i].dicas[0].charAt(0).toLowerCase() + MP_DIM[x.i].dicas[0].slice(1))}</li>`).join('')}</ul></div>`;
  return { visao, grafico, destaques, desen, reco };
}
/* devolutiva: convite no fim do relatório e da tela do cliente */
function mpBlocoDevolutiva(href){
  return `<div class="mp-devolutiva"><h2>Quer compreender seu resultado de forma mais profunda?</h2>
    <p>A devolutiva individual permite explorar seus resultados, compreender padrões de comportamento e identificar possibilidades de desenvolvimento de acordo com seus objetivos pessoais e profissionais.</p>
    ${href ? `<a class="btn btn-zap mp-zap" href="${href}" target="_blank" rel="noopener"><span class="duas">Quero agendar minha devolutiva<small>conversa com ${escV(mpComQuem())} pelo WhatsApp</small></span></a>` : ''}</div>`;
}
function mpHtmlRelatorio(r, img, href){
  const calc = r.calc, s = mpSecoes(calc, img), pag = h => `<section class="mp-pag">${h}</section>`;
  const brand = mpEhMeire() ? MP.AUTORIA : MP.AUTORIA + ' · aplicação de ' + (window.T_NOME || '');
  return `<div class="mp-rel" data-mp-rel>
    <section class="mp-pag mp-capa"><div class="mp-capa-in"><span class="mp-capa-sigla">${MP.SIGLA}</span><h1>${MP.NOME}</h1>
      <div class="mp-capa-linha"></div><p class="mp-capa-nome">${escV(r.nome)}</p><p class="mp-capa-data">Data da avaliação: ${escV(r.dataTxt)}</p><p class="mp-capa-marca">${escV(brand)}</p></div></section>
    ${pag(s.visao)}${pag(s.grafico)}${pag(s.destaques)}${pag(s.desen)}
    ${pag(s.reco + `<div class="mp-final"><h3>Seu mapa de perfil</h3><p>${escV(MP_TEXTO_FINAL)}</p></div>` + mpBlocoDevolutiva(href) + `<p class="mp-nota-peq">${escV(MP_OBS)}</p>`)}
  </div>`;
}
function mpResumoTexto(nome, calc){
  return [nome + ' · ' + MP.SIGLA + ' (' + MP.NOME + ')', 'Perfil geral: ' + mpNum(calc.geral.media, 2) + ' / 5 · ' + calc.geral.faixa.nome, '',
    ...calc.dims.map(x => x.nome + ': ' + mpNum(x.media) + ' · ' + x.faixa.nome), '',
    'Principais recursos: ' + mpLista(calc.topo.map(x => x.nome)), 'Oportunidades de desenvolvimento: ' + mpLista(calc.baixo.map(x => x.nome))].join('\n');
}
function mpImprimir(r, href){
  const html = mpHtmlRelatorio(r, mpRadarImagem(r.calc.dims), href);
  const caixa = document.createElement('div'); caixa.id = 'mp-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('mp-imprimindo');
  const fim = () => { document.body.classList.remove('mp-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  const img = caixa.querySelector('img.mp-radar-img'), rodar = () => setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('mp-impressao')) fim(); }, 1500); }, 150);
  if(img && !img.complete) img.addEventListener('load', rodar); else rodar();
}

/* ---- 5. TELAS DO CLIENTE ---- */
const mp = { codigo:'', mostrar:true, cad:null, resp:[], indice:0, inicio:0, onde:null };
const mpChave = c => CHAVE_CODIGOS + '_mpcc_' + c + '_prog';
function mpErro(msg){ return '<div class="aviso ver">' + escV(msg) + '</div>'; }
function mpMostrar(html){ document.getElementById('mp-conteudo').innerHTML = html; mostrarTela('#tela-mp'); window.scrollTo({ top:0, behavior:'auto' }); }
function mpMontarTelas(){
  if(document.getElementById('tela-mp-capa')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-mp-capa">
  <div class="capa">
    <div class="moldura"><img id="mp-foto" alt=""></div>
    <div class="lado-texto">
      <span class="selo mp-selo">${MP.SIGLA} · Meire Transformação Emocional</span>
      <h1>${MP.NOME} <em>${MP.SIGLA}</em></h1>
      <p class="assinatura" id="mp-assinatura"></p>
      <p class="texto-capa">Este instrumento foi desenvolvido para proporcionar uma visão mais clara sobre características comportamentais, formas de relacionamento, tomada de decisão, comunicação e competências que podem ser desenvolvidas.</p>
      <p class="texto-capa"><b>Não existem respostas certas ou erradas.</b> Responda considerando como você normalmente age no seu dia a dia.</p>
      <ul class="lista-leve">
        <li>A maioria termina em cerca de 7 minutos, no celular ou no computador</li>
        <li>Você responde de 1 (nunca me identifico) a 5 (sempre me identifico)</li>
        <li>No final, o seu mapa em 8 dimensões, com gráfico e relatório em PDF</li>
        <li>Ferramenta de autoconhecimento e desenvolvimento, não é diagnóstico</li>
      </ul>
      <div class="cartao">
        <div class="campo" style="margin-bottom:10px">
          <label for="mp-codigo">Digite o código que ${mpAp()} te enviou</label>
          <input id="mp-codigo" class="codigo-input" type="text" inputmode="text" autocomplete="off" placeholder="AB-0000" maxlength="9">
          <div class="dica" id="mp-dica">Cada código abre a avaliação uma única vez.</div>
        </div>
        <div class="aviso" id="mp-aviso-codigo"></div>
        <button class="btn btn-primario" id="mp-entrar" disabled>Digite o código</button>
      </div>
    </div>
  </div>
  <div class="rodape"><span class="nome-rodape">${escV((window.T_NOME || '') + ' · ' + ((window.__T && __T.dados && __T.dados.titulo) || 'Terapeuta'))}</span><a id="link-zap-mp" href="#" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
</section>
<section class="tela" id="tela-mp"><button class="voltar" id="mp-voltar-capa">← Voltar</button><div id="mp-conteudo"></div></section>
<section class="tela" id="tela-mp-teste">
  <div class="barra-topo"><div class="progresso"><i id="mp-barra"></i></div>
    <div class="linha-progresso"><span id="mp-contador" aria-live="polite"></span><span class="tema">${MP.SIGLA}</span></div></div>
  <p class="pergunta" id="mp-texto"></p>
  <div class="tc-opcoes" id="mp-opcoes"></div>
  <button class="voltar" id="mp-voltar">← Afirmação anterior</button>
</section>
<section class="tela" id="tela-mp-resultado"><div id="mp-resultado"></div>
  <div class="rodape"><span class="nome-rodape">${escV((window.T_NOME || '') + ' · ' + ((window.__T && __T.dados && __T.dados.titulo) || 'Terapeuta'))}</span>${typeof T_OBRIGADA !== 'undefined' ? T_OBRIGADA : 'Obrigado'} pela sua sinceridade. O próximo passo é a devolutiva.</div></section>`);
  const cod = document.getElementById('mp-codigo');
  cod.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); avisar('#mp-aviso-codigo', ''); mpCampoCodigo(); });
  cod.addEventListener('keydown', e => { if(e.key === 'Enter' && !document.getElementById('mp-entrar').disabled) document.getElementById('mp-entrar').click(); });
  document.getElementById('mp-entrar').addEventListener('click', mpClicarEntrar);
  document.getElementById('link-zap-mp').href = 'https://wa.me/' + (CONFIG.whatsappNumero || '');
  document.getElementById('mp-voltar-capa').addEventListener('click', () => mostrarTela('#tela-mp-capa'));
  document.getElementById('mp-voltar').addEventListener('click', () => { if(mp.indice > 0){ mp.indice--; mpDesenhar(); } });
}
function mpCampoCodigo(){ const v = document.getElementById('mp-codigo').value, b = document.getElementById('mp-entrar'); b.disabled = v.length < 5; b.textContent = b.disabled ? 'Digite o código' : 'Começar a avaliação'; }
function mpAbrirCapa(codigo){
  mpMontarTelas();
  const f = document.querySelector('#tela-capa .moldura img'), tf = document.getElementById('mp-foto');
  if(f && f.src) tf.src = f.src; else { const ini = document.querySelector('#tela-capa .moldura .t-ini'); if(ini && tf) tf.replaceWith(ini.cloneNode(true)); }
  const ta = document.getElementById('mp-assinatura'), oa = document.getElementById('t-assinatura'); if(ta && oa) ta.innerHTML = oa.innerHTML;
  const cod = document.getElementById('mp-codigo'); if(window.__T && __T.prefixo) cod.placeholder = __T.prefixo + '-0000';
  if(codigo){ cod.value = codigo; document.getElementById('mp-dica').innerHTML = '<span class="ok-pre" aria-hidden="true">✔</span> Código já preenchido. É só tocar em <b>“Começar a avaliação”</b>.'; }
  mpCampoCodigo(); mostrarTela('#tela-mp-capa');
}
async function mpClicarEntrar(){
  const b = document.getElementById('mp-entrar'), codigo = document.getElementById('mp-codigo').value.trim().toUpperCase();
  b.disabled = true; b.textContent = 'Verificando o código...';
  const r = await validarCodigo(codigo);
  b.disabled = false; b.textContent = 'Começar a avaliação';
  if(!r.ok) return avisar('#mp-aviso-codigo', r.msg);
  if(r.teste === 'tracos' && typeof tcEntrar === 'function') return tcEntrar(codigo, r);
  if(r.teste !== 'mpcc'){ location.href = location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&c=' + encodeURIComponent(codigo); return; }
  mpEntrar(codigo, r);
}
function mpEntrar(codigo, r){
  mpMontarTelas();
  mp.codigo = codigo; mp.mostrar = r.mostrar !== false;
  const prog = ler(mpChave(codigo), null);
  if(prog && prog.cad && Array.isArray(prog.resp)){ mp.cad = prog.cad; return mpComecar(prog); }
  mpTelaCadastro(r.cliente || '');
}
function mpComoResponder(){
  return `<div class="como-responder"><ul>
    <li><b>Não existem respostas certas ou erradas.</b> Responda pensando em como você normalmente age, e não em como gostaria de agir.</li>
    <li>Para cada afirmação, escolha de 1 a 5:</li></ul>
    <table class="mp-escala"><tbody>${MP_ESCALA.map((t, i) => `<tr><td><b>${i + 1}</b></td><td>${t}</td></tr>`).join('')}</tbody></table>
    <ul><li>A maioria termina em cerca de 7 minutos. Se a página fechar, ao abrir o link de novo neste aparelho você continua de onde parou.</li></ul></div>`;
}
function mpTelaCadastro(nomeSugerido){
  mpMostrar(`
    <span class="selo mp-selo">${MP.SIGLA}</span>
    <h1 class="tc-h1">Antes de começar</h1>
    <p>Este questionário foi desenvolvido para favorecer o autoconhecimento e identificar tendências comportamentais e áreas de desenvolvimento.</p>
    ${mpComoResponder()}
    <div class="cartao">
      <div class="campo"><label for="mc-nome">Nome completo</label><input id="mc-nome" type="text" autocomplete="name" value="${escV(nomeSugerido || '')}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="mc-email">E-mail</label><input id="mc-email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com"></div>
      <div class="campo"><label for="mc-tel">WhatsApp (com DDD)</label><input id="mc-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></div>
      <div class="campo"><label for="mc-idade">Idade</label><input id="mc-idade" type="number" inputmode="numeric" min="10" max="120" placeholder="Ex.: 35"></div>
      <div class="campo"><label for="mc-prof">Profissão</label><input id="mc-prof" type="text" autocomplete="organization-title" placeholder="Ex.: professora, empresário, estudante"></div>
      <div class="campo"><label for="mc-area">Área de atuação</label><input id="mc-area" type="text" placeholder="Ex.: educação, saúde, comércio"></div>
      <div class="campo"><label for="mc-obj">Objetivo ao realizar o questionário <span class="opc">(opcional)</span></label><input id="mc-obj" type="text" placeholder="Ex.: me conhecer melhor, mudar de carreira"></div>
      <div class="campo"><label for="mc-esp">O que você espera compreender ou desenvolver através desta avaliação? <span class="opc">(opcional)</span></label><textarea id="mc-esp" rows="3" placeholder="Escreva do seu jeito"></textarea></div>
      <div class="campo campo-check"><label class="check" for="mc-lgpd"><input id="mc-lgpd" type="checkbox">
        <span>Li e concordo com os <a href="/politica-de-privacidade.html" target="_blank" rel="noopener">termos de utilização e privacidade</a>. Concordo que as minhas respostas e os meus dados sejam tratados para gerar o meu resultado e enviados para ${escV(mpAp())}, que vai mantê-los em sigilo.</span></label></div>
      <div class="campo campo-check"><label class="check" for="mc-contato"><input id="mc-contato" type="checkbox">
        <span>Autorizo ${escV(mpAp())} a entrar em contato comigo, por WhatsApp ou e-mail, sobre o meu resultado e a devolutiva <span class="opc">(opcional)</span>.</span></label></div>
      <div class="aviso" id="mc-aviso"></div>
      <button class="btn btn-primario" id="mc-ir">Continuar</button>
    </div>
    <p class="mp-nota-peq">${escV(MP_OBS)}</p>`);
  mascaraTelefone(document.getElementById('mc-tel'));
  document.getElementById('mc-ir').addEventListener('click', () => {
    const v = id => document.getElementById(id).value.trim().replace(/\s+/g, ' ');
    const n = v('mc-nome'), em = v('mc-email'), t = document.getElementById('mc-tel').value, idade = parseInt(v('mc-idade'), 10), prof = v('mc-prof'), area = v('mc-area');
    const erro = n.split(' ').length < 2 || n.length < 5 ? 'Escreva o seu nome completo (nome e sobrenome).'
      : !mpEmail(em) ? 'Escreva um e-mail válido.' : mpDig(t).length < 10 ? 'Escreva o seu WhatsApp com DDD.'
      : !(idade >= 10 && idade <= 120) ? 'Escreva a sua idade.' : prof.length < 2 ? 'Escreva a sua profissão.' : area.length < 2 ? 'Escreva a sua área de atuação.'
      : !document.getElementById('mc-lgpd').checked ? 'Para continuar, marque que você leu e concorda com os termos de utilização e privacidade.' : '';
    if(erro) return avisar('#mc-aviso', erro);
    mp.cad = { nome:n, email:em, whatsapp:t, idade, profissao:prof, area, objetivo:v('mc-obj'), expectativa:document.getElementById('mc-esp').value.trim().slice(0, 1500), contato:document.getElementById('mc-contato').checked };
    mpComecar(null);
  });
}
function mpComecar(prog){
  mp.resp = (prog && Array.isArray(prog.resp) && prog.resp.length === MP_PERGUNTAS.length) ? prog.resp.slice() : new Array(MP_PERGUNTAS.length).fill(null);
  const vazia = mp.resp.findIndex(v => !v);
  mp.indice = vazia < 0 ? MP_PERGUNTAS.length - 1 : vazia; mp.inicio = Date.now(); mpGuardar();
  mostrarTela('#tela-mp-teste'); mpDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
const mpGuardar = () => guardar(mpChave(mp.codigo), { cad:mp.cad, resp:mp.resp });
function mpDesenhar(){
  const i = mp.indice, total = MP_PERGUNTAS.length;
  document.getElementById('mp-texto').textContent = MP_PERGUNTAS[i].q;
  (typeof TX_INC === 'function' ? TX_INC(document.getElementById('mp-contador'), i, total, 'mpcc') : (document.getElementById('mp-contador').textContent = ''));
  document.getElementById('mp-barra').style.width = (i / total * 100) + '%';
  document.getElementById('mp-voltar').style.visibility = i === 0 ? 'hidden' : 'visible';
  const ops = document.getElementById('mp-opcoes');
  ops.innerHTML = MP_ESCALA.map((txt, k) => `<button type="button" class="tc-op${mp.resp[i] === k + 1 ? ' escolhida' : ''}" data-v="${k + 1}"><b>${k + 1}</b>${txt}</button>`).join('');
  ops.querySelectorAll('.tc-op').forEach(b => b.addEventListener('click', () => mpResponder(+b.dataset.v, b)));
}
function mpResponder(v, botao){
  mp.resp[mp.indice] = v; mpGuardar();
  document.querySelectorAll('#mp-opcoes .tc-op').forEach(o => o.classList.remove('escolhida')); botao.classList.add('escolhida');
  const rapido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    if(mp.indice < MP_PERGUNTAS.length - 1){ mp.indice++; mpDesenhar(); window.scrollTo({ top:0, behavior:'auto' }); }
    else{ document.getElementById('mp-barra').style.width = '100%'; mpFinalizar(); }
  }, rapido ? 0 : 220);
}
async function mpFinalizar(){
  const calc = mpCalcular(mp.resp), dados = mpPacote(calc, mp.resp, mp.cad, mp.codigo, mp.inicio);
  mpMostrar('<div class="carregando">Calculando o seu mapa e enviando as respostas...</div>');
  const r = await compRpc('mpcc_salvar_resposta', { p_dados:dados });
  if(!r || r.ok !== true){
    mpMostrar(`<h1 class="tc-h1">Quase lá</h1>${mpErro((r && r.msg) || 'Não consegui enviar as suas respostas agora. Elas continuam guardadas neste aparelho.')}<button class="btn btn-primario" id="mf-de-novo">Tentar enviar de novo</button>`);
    document.getElementById('mf-de-novo').addEventListener('click', mpFinalizar); return;
  }
  try{ localStorage.removeItem(mpChave(mp.codigo)); }catch(e){}
  const prim = mpPrim(mp.cad.nome);
  if(!mp.mostrar){
    const msg = 'Oi, ' + T_PRIM + '! Sou ' + mp.cad.nome + ' e acabei de terminar o ' + MP.SIGLA + ' (código ' + mp.codigo + '). Fico no aguardo da minha devolutiva.';
    mpMostrar(`<span class="selo mp-selo">Avaliação concluída</span><h1 class="tc-h1">${typeof T_OBRIGADA !== 'undefined' ? T_OBRIGADA : 'Obrigado'}, ${escV(prim)}!</h1>
      <p>As suas respostas foram enviadas para ${escV(mpAp())}. ${typeof T_ELA !== 'undefined' ? T_ELA : 'Ela'} vai analisar o seu resultado com atenção e preparar a sua devolutiva.</p>
      <a class="btn btn-zap mp-zap" href="${mpZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar com ${escV(T_PRIM)} no WhatsApp<small>abre a conversa com a mensagem pronta</small></span></a>`);
    return;
  }
  mpResultadoCliente({ nome:mp.cad.nome, whatsapp:mp.cad.whatsapp, email:mp.cad.email, calc, dataTxt:new Date().toLocaleDateString('pt-BR'), codigo:mp.codigo });
}
function mpResultadoCliente(r){
  const s = mpSecoes(r.calc), prim = mpPrim(r.nome);
  const msgDev = ['Oi, ' + T_PRIM + '! Sou ' + r.nome + ' e terminei o ' + MP.SIGLA + ' (código ' + r.codigo + ').', '', mpResumoTexto(r.nome, r.calc), '', 'Quero agendar a minha devolutiva.'].join('\n');
  const zapProprio = mpZapTerNum(r.whatsapp), resumo = mpResumoTexto(r.nome, r.calc);
  const href = mpZapTer(msgDev);
  document.getElementById('mp-resultado').innerHTML = `<div class="mp-cliente">
    <span class="selo mp-selo">${MP.SIGLA} · ${escV(MP.AUTORIA)}</span>
    <h1 class="tc-h1">Seu mapa de perfil</h1>
    <p class="mp-intro">${escV(prim)}, o seu resultado apresenta características que podem ajudar você a compreender melhor seus comportamentos, seus recursos pessoais e os aspectos que podem ser desenvolvidos.</p>
    <div class="mp-barra-acoes mp-sem-print"><button type="button" class="mini-btn" data-mp-pdf>Baixar relatório em PDF</button></div>
    <div class="mp-secao">${s.visao}</div><div class="mp-secao">${s.grafico}</div><div class="mp-secao">${s.destaques}</div><div class="mp-secao">${s.desen}</div><div class="mp-secao">${s.reco}</div>
    <div class="mp-secao mp-final"><h2>Seu mapa de perfil</h2><p>${escV(MP_TEXTO_FINAL)}</p></div>
    ${mpBlocoDevolutiva(href)}
    <div class="mp-secao mp-compartilhar mp-sem-print"><h2>Guardar o seu resultado</h2>
      <div class="mp-acoes">
        <button type="button" class="btn btn-argila" data-mp-pdf><span class="duas">Baixar relatório em PDF<small>6 páginas, para guardar ou imprimir</small></span></button>
        ${zapProprio ? `<a class="btn btn-contorno" href="https://wa.me/${zapProprio}?text=${encodeURIComponent(resumo)}" target="_blank" rel="noopener"><span class="duas">Enviar para o meu WhatsApp<small>${escV(dvFone ? dvFone(r.whatsapp) : r.whatsapp)}</small></span></a>` : ''}
        ${mpEmail(r.email) ? `<a class="btn btn-contorno" href="mailto:${escV(r.email)}?subject=${encodeURIComponent(MP.SIGLA + ' · ' + r.nome)}&body=${encodeURIComponent(resumo)}"><span class="duas">Enviar para o meu e-mail<small>${escV(r.email)}</small></span></a>` : ''}
      </div></div>
    <p class="mp-nota-peq">${escV(MP_OBS)}</p></div>`;
  mostrarTela('#tela-mp-resultado'); window.scrollTo({ top:0, behavior:'auto' });
  const raiz = document.getElementById('mp-resultado'); mpLigarRadar(raiz, r.calc.dims);
  raiz.querySelectorAll('[data-mp-pdf]').forEach(b => b.addEventListener('click', () => mpImprimir(r, href)));
}
function mpZapTerNum(t){ return typeof dvZapNum === 'function' ? dvZapNum(t) : mpDig(t); }

/* ---- 6. ÁREA DA TERAPEUTA ---- */
let mpCache = [];
function mpAdminMontar(){
  if(document.getElementById('painel-mp')) return;
  const base = document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-mp">
      <div id="mp-abas"><button type="button" class="ativa" data-mp-aba="respostas">Avaliações</button><button type="button" data-mp-aba="codigos">Códigos de acesso</button></div>
      <div id="mp-aba-respostas">
        <div class="campo"><input id="mp-busca" type="search" placeholder="Buscar por nome"></div>
        <button type="button" class="mini-btn" id="mp-exportar" style="margin-bottom:12px">Exportar resultados (planilha)</button>
        <div id="mp-lista-respostas"><div class="vazio">Nenhuma avaliação por enquanto.</div></div>
      </div>
      <div id="mp-aba-codigos" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="mp-cod-nome">Nome da pessoa <span class="opc">(opcional)</span></label><input id="mp-cod-nome" type="text" placeholder="Ex.: Maria Souza"></div>
          <div class="campo"><label for="mp-cod-whats">WhatsApp de quem vai receber o link <span class="opc">(opcional)</span></label><input id="mp-cod-whats" type="tel" inputmode="tel" placeholder="(00) 00000-0000">
            <div class="dica">Com o telefone, o botão já abre a conversa com o link e a mensagem prontos.</div></div>
          <div class="campo"><label id="rot-mp-mostrar">Quem responde vê o resultado no final?</label>
            <div class="alternar" id="mp-alt-mostrar" role="radiogroup" aria-labelledby="rot-mp-mostrar">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, vê<small>o mapa, o gráfico e o relatório em PDF</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não, só eu vejo<small>recebe só um agradecimento</small></button>
            </div></div>
          <div class="campo"><label id="rot-mp-urg">Cronômetro de urgência de 60 segundos no final?</label>
            <div class="alternar" id="mp-alt-urg" role="radiogroup" aria-labelledby="rot-mp-urg">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, ligado<small>60 s para falar no WhatsApp; depois, só notificação</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não<small>o WhatsApp fica sempre disponível</small></button>
            </div><div class="dica">O que a pessoa fizer no fim fica anotado na resposta dela.</div></div>
          <button class="btn btn-argila" id="mp-gerar">Gerar código</button>
        </div>
        <div id="mp-caixa-codigo"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Códigos criados</h3>
        <div id="mp-lista-codigos"><div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div></div>
      </div>
      <div id="mp-detalhe" style="display:none"><button class="voltar" id="mp-voltar-lista">← Voltar para a lista</button><div id="mp-detalhe-conteudo"></div></div>
    </div>`);
  mascaraTelefone(document.getElementById('mp-cod-whats'));
  document.querySelectorAll('#mp-abas button').forEach(b => b.addEventListener('click', () => mpAdminAba(b.dataset.mpAba)));
  let mostrarSel = true;
  document.querySelectorAll('#mp-alt-urg button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#mp-alt-urg button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
  }));
  document.querySelectorAll('#mp-alt-mostrar button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#mp-alt-mostrar button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); mostrarSel = b.dataset.v === '1';
  }));
  document.getElementById('mp-busca').addEventListener('input', mpDesenharLista);
  document.getElementById('mp-exportar').addEventListener('click', mpExportar);
  document.getElementById('mp-voltar-lista').addEventListener('click', () => { const a = document.querySelector('#mp-abas button.ativa'); mpAdminAba(a ? a.dataset.mpAba : 'respostas'); });
  document.getElementById('mp-gerar').addEventListener('click', () => mpGerar(mostrarSel));
}
function mpAdminAba(q){
  document.querySelectorAll('#mp-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.mpAba === q));
  document.getElementById('mp-aba-codigos').style.display = q === 'codigos' ? '' : 'none';
  document.getElementById('mp-aba-respostas').style.display = q === 'respostas' ? '' : 'none';
  document.getElementById('mp-detalhe').style.display = 'none';
}
function mpConvite(primeiro, codigo, mostrar){
  return [(primeiro ? 'Oi, ' + primeiro + '!' : 'Oi!') + ' Aqui é ' + T_A + '.', '',
    'Separei para você o ' + MP.SIGLA + ' · ' + MP.NOME + '. Ele mostra, em um gráfico, as suas características de comportamento e as competências que você já tem e pode desenvolver: iniciativa, comunicação, relacionamento, decisão, adaptação, organização, autoconfiança e equilíbrio emocional.', '',
    'É só tocar no link abaixo. Ao abrir, o código já vai preenchido: é só tocar em “Começar a avaliação”:', mpLink(codigo), '',
    'Se o link não abrir direto, o código é: *' + codigo + '*', '',
    'Leva cerca de 7 minutos. Não existem respostas certas ou erradas: responda pensando em como você normalmente age.',
    mostrar ? 'No final, você vê o seu mapa e baixa o seu relatório em PDF. Depois a gente conversa sobre ele.' : 'Quando você terminar, eu preparo a sua devolutiva com carinho.'].join('\n');
}
async function mpGerar(mostrar){
  const b = document.getElementById('mp-gerar'), nomeCli = document.getElementById('mp-cod-nome').value.trim(), zapCli = document.getElementById('mp-cod-whats').value.trim(), caixa = document.getElementById('mp-caixa-codigo');
  const c = clienteMembros(), { data:sess } = await c.auth.getSession();
  if(!sess || !sess.session){ caixa.innerHTML = mpErro('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  b.disabled = true; b.textContent = 'Gerando...';
  let codigo = novoCodigo(), erro = null;
  for(let t = 0; t < 6; t++){
    const { error } = await c.from('travas_codigos').insert({ terapeuta_id:sess.session.user.id, codigo, cliente:nomeCli || null, whatsapp:zapCli || null, mostrar_resultado:mostrar, urgencia:(typeof dvUrgSel === 'function' ? dvUrgSel('mp-alt-urg') : false), teste:'mpcc', tipo:'individual' });
    erro = error; if(!error) break;
    if(error.code === '23505'){ codigo = novoCodigo(); continue; } break;
  }
  b.disabled = false; b.textContent = 'Gerar código';
  if(erro){ caixa.innerHTML = mpErro('Não consegui gerar o código agora. Saia da área, entre de novo e tente outra vez.'); return; }
  const primeiro = mpPrim(nomeCli), destino = zapNumero(zapCli);
  caixa.innerHTML = `<div class="codigo-gerado"><div class="valor">${codigo}</div>
      <div class="para">${nomeCli ? 'Para ' + escV(nomeCli) + ' · ' : ''}${MP.SIGLA} · ${mostrar ? 'a pessoa vê o resultado no final' : 'só você vê o resultado'}</div></div>
    <a class="btn btn-zap" href="https://wa.me/${destino}?text=${encodeURIComponent(mpConvite(primeiro, codigo, mostrar))}" target="_blank" rel="noopener"><span class="duas">${primeiro ? 'Enviar o link para ' + escV(primeiro) : 'Enviar o link pelo WhatsApp'}<small>${destino ? 'abre a conversa com a mensagem pronta' : 'você escolhe o contato na hora'}</small></span></a>
    <button class="btn btn-contorno" id="mp-copiar-link">Copiar o link com o código</button>`;
  document.getElementById('mp-copiar-link').addEventListener('click', async e => { try{ await navigator.clipboard.writeText(mpLink(codigo)); e.target.textContent = 'Link copiado!'; }catch(err){ e.target.textContent = 'Não consegui copiar'; } setTimeout(() => { e.target.textContent = 'Copiar o link com o código'; }, 2000); });
  mpCarregarCodigos();
}
async function mpCarregarCodigos(){
  const caixa = document.getElementById('mp-lista-codigos'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('travas_codigos').select('id,codigo,cliente,criado_em,usado,usado_por,usado_em,mostrar_resultado').eq('terapeuta_id', sess.session.user.id).eq('teste', 'mpcc').order('criado_em', { ascending:false }).limit(300);
  if(error){ caixa.innerHTML = mpErro('Não consegui carregar os códigos agora.'); return; }
  if(!data.length){ caixa.innerHTML = '<div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div>'; return; }
  caixa.innerHTML = data.map(x => `<div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${x.codigo}${x.cliente ? ' · ' + escV(x.cliente) : ''}<span class="tag-vis">${x.mostrar_resultado === false ? 'só você vê' : 'pessoa vê'}</span></span>
      <span class="sub">${x.usado ? 'respondido por ' + escV(x.usado_por || 'alguém') + ' · ' + mpQuando(x.usado_em) : 'criado em ' + mpQuando(x.criado_em)}</span></span>
      <span class="etiqueta ${x.usado ? 'usado' : 'livre'}">${x.usado ? 'usado' : 'disponível'}</span>
      <span style="display:flex;gap:8px;width:100%;margin-top:8px">${x.usado ? '' : `<button type="button" class="mini-btn" data-mp-link="${x.codigo}">Copiar link</button>`}</span></div>`).join('');
  caixa.querySelectorAll('[data-mp-link]').forEach(b => b.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(mpLink(b.dataset.mpLink)); b.textContent = 'Copiado!'; }catch(err){ b.textContent = 'Não consegui'; } setTimeout(() => { b.textContent = 'Copiar link'; }, 1800); }));
}
async function mpCarregarRespostas(){
  const caixa = document.getElementById('mp-lista-respostas'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('mpcc_respostas').select('id,codigo,nome,dados,criado_em').eq('terapeuta_id', sess.session.user.id).order('criado_em', { ascending:false }).limit(500);
  if(error){ caixa.innerHTML = mpErro('Não consegui carregar as avaliações agora.'); return; }
  mpCache = data || []; mpDesenharLista();
}
function mpDesenharLista(){
  const termo = (document.getElementById('mp-busca').value || '').trim().toLowerCase(), caixa = document.getElementById('mp-lista-respostas');
  const lista = mpCache.filter(x => !termo || (x.nome || '').toLowerCase().includes(termo));
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">Nenhuma avaliação por enquanto.</div>'; return; }
  caixa.innerHTML = lista.map(x => { const calc = mpDeRegistro(x.dados || {});
    return `<button type="button" class="linha-item" data-mp-i="${mpCache.indexOf(x)}" data-dv-del="mpcc" data-id="${x.id}"><span class="esq"><span class="nome">${escV(x.nome)}</span><span class="sub">Perfil geral ${mpNum(calc.geral.media, 2)} · ${escV(calc.geral.faixa.nome)} · ${mpQuando(x.criado_em)}</span></span><span class="etiqueta livre">${mpNum(calc.geral.media, 1)}</span></button>`; }).join('');
  caixa.querySelectorAll('[data-mp-i]').forEach(b => b.addEventListener('click', () => mpAbrirDetalhe(mpCache[+b.dataset.mpI])));
}
function mpExportar(){
  if(!mpCache.length) return;
  const cab = ['Identificador', 'Data', 'Nome', 'E-mail', 'WhatsApp', 'Idade', 'Profissão', 'Área de atuação', 'Objetivo', 'O que espera', 'Contato autorizado', 'Código', 'Média geral', 'Classificação']
    .concat(MP_DIM.map(d => d.nome)).concat(MP_PERGUNTAS.map((p, i) => 'Afirmação ' + (i + 1)));
  const linhas = mpCache.map(x => { const d = x.dados || {}, calc = mpDeRegistro(d);
    return [x.id, mpQuando(x.criado_em), x.nome, d.email, d.whatsapp, d.idade, d.profissao, d.area, d.objetivo, d.expectativa, d.consentimento_contato ? 'sim' : 'não', x.codigo, mpNum(calc.geral.media, 2), calc.geral.faixa.nome]
      .concat(calc.dims.map(z => mpNum(z.media))).concat(MP_PERGUNTAS.map((p, i) => (d.respostas && d.respostas[i]) ? d.respostas[i].valor : '')); });
  const csv = [cab].concat(linhas).map(l => l.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'mpcc-resultados-' + (window.T_SLUG || 'terapeuta') + '.csv'; a.click(); URL.revokeObjectURL(url);
}
/* ---- 6b. "GERAR APRESENTAÇÃO" A PARTIR DO MPCC (mesmo gerador do Teste de Travas) ----
   Cada dimensão entra com o "espaço para crescer": quanto falta para 5 (100% = tudo a desenvolver, 0% = já no máximo). */
const MP_APRES_VOC = { pct:true, teste:'MPCC', item:'dimensão', itens:'dimensões',
  capaTit:'o seu mapa de competências e o caminho para crescer.', capaSub:'Plano para desenvolver as dimensões com mais espaço para crescer.',
  mapaTit:'Espaço para crescer em cada dimensão', caminhoTit:'Como vamos desenvolver as suas competências',
  fase1:'Começamos pela dimensão com mais espaço para crescer. Como trabalhamos: ', fase2:'Seguimos para as próximas dimensões em foco, apoiados nos seus recursos. Como trabalhamos: ',
  evol:'Cada nova aplicação do MPCC mostra, em números, o quanto você cresceu.',
  altoTxt:'com mais espaço para crescer: o foco do nosso trabalho.', baixoTxt:'dimensões que já são recursos em você.',
  destaque:'É a dimensão com mais espaço para crescer, a primeira a ser trabalhada.',
  dica:'Tudo o que aparece na apresentação (as dimensões e o espaço para crescer em cada uma) vem do MPCC desta pessoa.',
  objDinheiro:'O que se perde por não desenvolver uma competência costuma custar mais, todos os dias.',
  objTentei:'Trabalhamos as dimensões com mais espaço para crescer, uma de cada vez.',
  picoRot:'em foco', suporteRot:'recursos', legPico:'Em foco: as 3 com mais espaço para crescer', legSuporte:'Recursos: as demais' };
const MP_APRES_LIB = {
  autonomia:{ x:'segurança para começar', y:'capacidade', resumo:'Você tem ideias e competência, mas costuma esperar orientação ou o momento ideal antes de dar o primeiro passo.', custo:'Projetos adiados, oportunidades que passam e a sensação de depender dos outros para agir.', imagine:['Você começa sem esperar as condições perfeitas.', 'As suas ideias saem do papel com mais frequência.'] },
  comunicacao:{ x:'expressão', y:'conteúdo', resumo:'Você sabe o que pensa e sente, mas muitas vezes guarda para si por receio de desagradar ou de ser julgado(a).', custo:'Mal-entendidos, incômodos acumulados e a sensação de não ser ouvido(a).', imagine:['Você diz o que precisa com clareza e tranquilidade.', 'As conversas difíceis deixam de ser evitadas.'] },
  relacionamento:{ x:'troca', y:'boa vontade', resumo:'Você se importa com as pessoas, mas cooperar e confiar no grupo nem sempre acontece com leveza.', custo:'Sobrecarga por fazer tudo sozinho(a) e vínculos mais frágeis do que você gostaria.', imagine:['Você divide tarefas e confia no outro.', 'As relações passam a somar, e não a cansar.'] },
  decisao:{ x:'confiança no próprio critério', y:'inteligência', resumo:'Você analisa bem as situações, mas decidir costuma vir com dúvida, adiamento ou necessidade de aprovação.', custo:'Decisões que demoram, energia gasta em ruminação e oportunidades perdidas.', imagine:['Você decide com mais clareza e menos culpa.', 'Errar vira aprendizado, não ameaça.'] },
  flexibilidade:{ x:'adaptação', y:'firmeza', resumo:'Você gosta do que é previsível; quando o plano muda, a tensão e a resistência aparecem.', custo:'Estresse diante de mudanças e dificuldade de aproveitar o novo.', imagine:['Você ajusta a rota sem perder o rumo.', 'O imprevisto deixa de tirar o seu chão.'] },
  organizacao:{ x:'método', y:'vontade', resumo:'Você quer dar conta de tudo, mas falta um jeito simples de organizar prioridades, prazos e compromissos.', custo:'Correria, tarefas esquecidas e a sensação de estar sempre atrasado(a).', imagine:['A sua rotina passa a ter começo, meio e fim.', 'Você cumpre o que promete sem se esgotar.'] },
  autoconfianca:{ x:'reconhecimento do próprio valor', y:'competência', resumo:'Você tem mais recursos do que acredita, mas a autocrítica e a comparação diminuem o que você já construiu.', custo:'Oportunidades recusadas, insegurança para se posicionar e cansaço de se provar.', imagine:['Você reconhece o seu valor sem precisar de aprovação.', 'Você se posiciona com mais firmeza.'] },
  regulacao:{ x:'equilíbrio emocional', y:'força', resumo:'Você sente muito e com intensidade; sob pressão, as emoções tomam a frente e fica difícil voltar ao centro.', custo:'Reações das quais se arrepende, desgaste nas relações e cansaço emocional.', imagine:['Você percebe a emoção antes que ela te leve.', 'Voltar à calma fica mais rápido e mais leve.'] }
};
const MP_APRES_TEC = {
  autonomia:'metas pequenas e semanais, o primeiro passo sempre definido e revisão do que travou a iniciativa.',
  comunicacao:'treino de conversas reais, escuta ativa e frases para dizer o que você pensa e precisa.',
  relacionamento:'mapa das suas relações, combinados claros e prática de pedir e oferecer ajuda.',
  decisao:'critérios simples para decidir, prazos para as escolhas e o trabalho com o medo de errar.',
  flexibilidade:'exposição gradual a mudanças, planos com alternativas e o cuidado com a tensão que elas trazem.',
  organizacao:'rotina semanal enxuta, prioridades do dia e acompanhamento dos compromissos.',
  autoconfianca:'registro das suas conquistas, trabalho com a autocrítica e situações reais para se posicionar.',
  regulacao:'reconhecer os sinais do corpo, técnicas para voltar à calma e o trabalho com o que dispara as emoções.'
};
function mpApresentar(x){
  if(typeof apresAbrir !== 'function') return alert('A apresentação não está disponível nesta página.');
  const d = x.dados || {}, calc = mpDeRegistro(d), foco = calc.baixo.map(z => z.id);
  const lista = calc.dims.map(z => ({ id:z.id, nome:z.nome, nota:Math.round(Math.max(0, Math.min(4, 5 - z.media)) / 4 * 100), nivel:foco.indexOf(z.id) > -1 ? 'alta' : 'baixa' }))
    .sort((a, b) => b.nota - a.nota);
  apresAbrir({ nome:x.nome || '', prim:mpPrim(x.nome), genero:'', idade:d.idade || '', motivo:d.objetivo || '', dor:d.expectativa || '', olhar:'', atencao:0, travas:lista },
    { voc:MP_APRES_VOC, lib:MP_APRES_LIB, tec:MP_APRES_TEC });
}
async function mpEnviarEmail(destino, assunto, corpo, codigo, b){
  const rotulo = b.innerHTML; b.disabled = true; b.textContent = 'Enviando...';
  let ok = false;
  try{ if(typeof modoLocal !== 'function' || !modoLocal()){ const r = await api(ACOES.enviarEmail, { destino, assunto, corpo, codigo }); ok = !!(r && r.ok !== false); } }catch(e){ ok = false; }
  b.disabled = false;
  if(ok){ b.textContent = 'E-mail enviado para ' + destino; setTimeout(() => { b.innerHTML = rotulo; }, 3000); return; }
  b.innerHTML = rotulo;
  location.href = 'mailto:' + encodeURIComponent(destino) + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo.slice(0, 1800));
}

function mpAbrirDetalhe(x){
  const d = x.dados || {}, calc = mpDeRegistro(d), zap = zapNumero(d.whatsapp), prim = mpPrim(x.nome);
  const r = { nome:x.nome, calc, dataTxt:mpDataCurta(x.criado_em), codigo:x.codigo }, resumo = mpResumoTexto(x.nome, calc);
  document.getElementById('mp-aba-codigos').style.display = 'none'; document.getElementById('mp-aba-respostas').style.display = 'none';
  const det = document.getElementById('mp-detalhe'); det.style.display = 'block';
  const outras = mpCache.filter(o => o !== x && ((o.dados || {}).email || '').toLowerCase() === (d.email || '').toLowerCase() && d.email).sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
  const anterior = outras.filter(o => new Date(o.criado_em) < new Date(x.criado_em)).pop();
  const hist = outras.length ? `<h2 class="secao-titulo">Histórico desta pessoa</h2><div class="mp-hist">${outras.concat([x]).sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em)).map(o => `<div class="mp-hist-i${o === x ? ' atual' : ''}"><span>${mpQuando(o.criado_em)}</span><b>${mpNum(mpDeRegistro(o.dados || {}).geral.media, 2)}</b></div>`).join('')}</div>` +
    (anterior ? (() => { const ant = mpDeRegistro(anterior.dados || {}); return `<table class="mp-comp"><thead><tr><th>Dimensão</th><th>${mpDataCurta(anterior.criado_em)}</th><th>${mpDataCurta(x.criado_em)}</th><th>Mudança</th></tr></thead><tbody>${calc.dims.map((z, i) => { const dif = z.media - ant.dims[i].media; return `<tr><td>${escV(z.nome)}</td><td>${mpNum(ant.dims[i].media)}</td><td>${mpNum(z.media)}</td><td class="${dif > 0.05 ? 'sobe' : dif < -0.05 ? 'desce' : ''}">${dif > 0.05 ? '▲ +' : dif < -0.05 ? '▼ ' : '= '}${mpNum(dif)}</td></tr>`; }).join('')}</tbody></table>`; })() : '') : '';
  const msgZap = ['Oi, ' + prim + '! Aqui é ' + T_A + '.', '', 'O seu ' + MP.SIGLA + ' está pronto. ' + 'Perfil geral: ' + mpNum(calc.geral.media, 2) + ' / 5 (' + calc.geral.faixa.nome.toLowerCase() + ').', 'Principais recursos: ' + mpLista(calc.topo.map(z => z.nome)) + '.', 'Oportunidades de desenvolvimento: ' + mpLista(calc.baixo.map(z => z.nome)) + '.', '', 'Vamos conversar sobre o seu resultado e agendar a sua devolutiva?'].join('\n');
  document.getElementById('mp-detalhe-conteudo').innerHTML = `<h2 style="font-size:24px;margin:6px 0 4px">${escV(x.nome)}</h2>
    <p class="secao-sub">${escV(x.codigo)} · ${mpQuando(x.criado_em)}${d.duracaoMin != null ? ' · ' + d.duracaoMin + ' min' : ''}<br>${escV(d.email || '')}${d.whatsapp ? ' · ' + escV(d.whatsapp) : ''}</p>
    <p class="secao-sub">${[d.idade ? d.idade + ' anos' : '', d.profissao, d.area].filter(Boolean).map(escV).join(' · ')}</p>
    ${d.objetivo ? `<p class="mp-resp"><b>Objetivo:</b> ${escV(d.objetivo)}</p>` : ''}${d.expectativa ? `<p class="mp-resp"><b>O que espera compreender ou desenvolver:</b> ${escV(d.expectativa)}</p>` : ''}
    <p class="secao-sub">${d.consentimento_contato ? 'Autorizou o contato profissional.' : 'Não marcou a autorização de contato profissional.'}</p>
    <div class="mp-acoes mp-sem-print">
      ${zap ? `<a class="btn btn-zap mp-zap" href="https://wa.me/${zap}?text=${encodeURIComponent(msgZap)}" target="_blank" rel="noopener"><span class="duas">Falar com ${escV(prim)} no WhatsApp<small>mensagem já escrita com o resultado</small></span></a>` : ''}
      <button type="button" class="btn btn-argila" data-mp-email="eu"><span class="duas">Enviar para o meu e-mail<small>${escV(CONFIG.emailTerapeuta || '')}</small></span></button>
      ${d.email ? `<button type="button" class="btn btn-contorno" data-mp-email="cliente"><span class="duas">Enviar para ${escV(prim)}<small>${escV(d.email)}</small></span></button>` : ''}
      <button type="button" class="btn btn-argila" data-mp-apres><span class="duas">Gerar apresentação<small>plano de acompanhamento para ${escV(prim)}</small></span></button>
      <button type="button" class="btn btn-contorno" data-mp-copiar>Copiar a ficha completa</button>
      <button type="button" class="btn btn-contorno" data-mp-pdf><span class="duas">Salvar em PDF ou imprimir<small>relatório com capa + 5 páginas</small></span></button>
    </div>
    <div class="mp-rel-tela">${(() => { const s = mpSecoes(calc); return `<div class="mp-secao">${s.visao}</div><div class="mp-secao">${s.grafico}</div><div class="mp-secao">${s.destaques}</div><div class="mp-secao">${s.desen}</div><div class="mp-secao">${s.reco}</div>`; })()}</div>
    ${hist}
    <details class="tc-respostas"><summary>As 40 respostas</summary><table><thead><tr><th>Nº</th><th>Afirmação</th><th>Dimensão</th><th>Resposta</th><th>Pontos</th></tr></thead><tbody>
      ${(d.respostas || []).map(z => `<tr><td>${z.n}</td><td>${escV(z.afirmacao)}</td><td>${escV((MP_DIM.find(m => m.id === z.dimensao) || {}).nome || z.dimensao)}</td><td>${z.valor} · ${escV(MP_ESCALA[z.valor - 1] || '')}</td><td>${z.pontos}${z.invertida ? ' <small>(invertida)</small>' : ''}</td></tr>`).join('')}
    </tbody></table></details>`;
  const raiz = document.getElementById('mp-detalhe-conteudo'); mpLigarRadar(raiz, calc.dims); window.scrollTo({ top:0, behavior:'auto' });
  raiz.querySelector('[data-mp-pdf]').addEventListener('click', () => mpImprimir(r, zap ? 'https://wa.me/' + (CONFIG.whatsappNumero || '') + '?text=' + encodeURIComponent('Oi, ' + T_PRIM + '! Quero agendar a minha devolutiva do ' + MP.SIGLA + '.') : mpZapTer('Quero agendar a minha devolutiva do ' + MP.SIGLA + '.')));
  raiz.querySelector('[data-mp-copiar]').addEventListener('click', async e => { const b = e.currentTarget; try{ await navigator.clipboard.writeText(resumo); b.textContent = 'Ficha copiada!'; }catch(err){ b.textContent = 'Não consegui copiar'; } setTimeout(() => { b.textContent = 'Copiar a ficha completa'; }, 2200); });
  raiz.querySelector('[data-mp-apres]').addEventListener('click', () => mpApresentar(x));
  raiz.querySelectorAll('[data-mp-email]').forEach(b => b.addEventListener('click', () => {
    const eu = b.dataset.mpEmail === 'eu';
    mpEnviarEmail(eu ? CONFIG.emailTerapeuta : d.email, MP.SIGLA + ' — ' + x.nome + ' (' + mpDataCurta(x.criado_em) + ')', resumo, x.codigo, b);
  }));
}

/* ---- 7. SELETOR DE TESTES DA ÁREA E LIGAÇÃO COM O MODELO ---- */
const MP_ROTULOS = { travas:'Teste de Travas Mentais', tracos:'Teste de Traços de Caráter', mpcc:'MPCC' };
function mpSeletor(ativos){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  const campo = alt.closest('.campo');
  if(!alt.querySelector('[data-v=mpcc]')){
    alt.insertAdjacentHTML('beforeend', '<button type="button" data-v="mpcc" role="radio" aria-checked="false">MPCC<small>8 dimensões</small></button>');
    const b = alt.querySelector('[data-v=mpcc]');
    b.addEventListener('click', () => {
      alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      document.getElementById('painel-admin').classList.remove('modo-tc'); document.getElementById('painel-admin').classList.add('modo-mp');
      mpAdminAba('respostas'); mpCarregarRespostas(); mpCarregarCodigos();
    });
    alt.querySelectorAll('button').forEach(x => { if(x !== b) x.addEventListener('click', () => document.getElementById('painel-admin').classList.remove('modo-mp')); });
  }
  ['travas', 'tracos', 'mpcc'].forEach(k => { const b = alt.querySelector('[data-v=' + k + ']'); if(b) b.style.display = ativos.indexOf(k) > -1 ? '' : 'none'; });
  if(campo) campo.style.display = ativos.length > 1 ? '' : 'none';
  const primeiro = ativos[0], abrir = () => { const b = alt.querySelector('[data-v=' + primeiro + ']'); if(b && !b.classList.contains('ativa')) b.click(); };
  if(ativos.indexOf('travas') < 0){   // sem o Teste de Travas: a área já abre no primeiro teste que ela tem
    if(typeof window.entrarNoPainel === 'function' && !window.entrarNoPainel.__mp){
      const entrar = window.entrarNoPainel; window.entrarNoPainel = function(){ const r = entrar.apply(this, arguments); abrir(); return r; }; window.entrarNoPainel.__mp = true;
    }
    const adm = document.getElementById('painel-admin');
    if(adm && 'MutationObserver' in window) new MutationObserver(() => { if(adm.classList.contains('ver')) abrir(); }).observe(adm, { attributes:true, attributeFilter:['class'] });
  }
}
function mpInit(){
  if(mpInit.feito) return; mpInit.feito = true;
  mpMontarTelas(); mpAdminMontar();
  try{ const c = (new URLSearchParams(location.search).get('mp') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9); if(c) mpAbrirCapa(c); }catch(e){}
}
/* chamado pelo modelo quando a terapeuta tem o MPCC: ativos = lista dos testes dela */
function mpAjustarTestes(ativos){
  mpInit();
  document.title = ativos.map(k => MP_ROTULOS[k]).join(' · ') + (window.T_NOME ? ' · ' + T_NOME : '');
  mpSeletor(ativos);
}
