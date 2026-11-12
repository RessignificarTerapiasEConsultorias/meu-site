/* ============================================================================
   TESTE DE ANSIEDADE · ACOMPANHAMENTO (módulo da página do teste) · autoria: Bárbara Vieira
   - Parte 1: GAD-7 (escala validada, 7 perguntas, últimas 2 semanas, 0 a 3)
   - Parte 2: 30 perguntas de 1 a 10 em 6 áreas (10 = mais peso, sempre)
   - Para fechar: 3 perguntas abertas (opcionais)
   O MESMO código serve para o acompanhamento: a pessoa refaz a cada X dias (15 por padrão) e vê a evolução.
   O servidor recalcula tudo (ansiedade_salvar_resposta). Não é diagnóstico.
   Telas: capa com código -> cadastro -> perguntas -> resultado com evolução (ou agradecimento)
   Área da terapeuta: acompanhamentos (por pessoa), códigos, detalhe com evolução, PDF, apresentação, e-mail.
   O modelo da página chama anAjustarTestes(ativos) quando a terapeuta tem o teste.
   ============================================================================ */
const AN = {
  NOME:'Teste de Ansiedade', CURTO:'Ansiedade',
  AVISO:'O Teste de Ansiedade é uma ferramenta de autoconhecimento e acompanhamento. Não é diagnóstico e não substitui avaliação médica ou psicológica. Quem lê e interpreta o seu resultado é quem te atende.',
  SOS:'Se em algum momento você sentir que não está dando conta, ligue 188 (CVV, gratuito, 24 horas) ou procure o pronto-atendimento mais próximo.',
  GAD_ENUNCIADO:'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por:',
  GAD:['Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)', 'Não ser capaz de impedir ou de controlar as preocupações', 'Preocupar-se muito com diversas coisas',
       'Dificuldade para relaxar', 'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)', 'Ficar facilmente aborrecido(a) ou irritado(a)', 'Sentir medo como se algo horrível fosse acontecer'],
  GAD_OP:['Nenhuma vez', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'],
  CLASSE:{
    minima:{ rot:'Ansiedade mínima', cor:'#3F8A62', faixa:'0 a 4', txt:'Os sinais de ansiedade das últimas 2 semanas estão baixos. É um bom momento para cuidar do que já está funcionando.' },
    leve:{ rot:'Ansiedade leve', cor:'#B8901F', faixa:'5 a 9', txt:'Há sinais de ansiedade que merecem atenção. Cuidar agora evita que eles cresçam e passem a comandar o seu dia a dia.' },
    moderada:{ rot:'Ansiedade moderada', cor:'#C9702F', faixa:'10 a 14', txt:'A ansiedade já está interferindo na sua rotina, no seu corpo ou no seu sono. Um acompanhamento faz muita diferença nesse ponto.' },
    grave:{ rot:'Ansiedade grave', cor:'#B5432E', faixa:'15 a 21', txt:'A ansiedade está muito presente na sua vida. Converse com quem te atende o quanto antes e, se precisar, procure também um médico ou psicólogo.' }
  },
  NIVEL:{ baixo:{ rot:'Baixo', cor:'#5E9E7A' }, moderado:{ rot:'Moderado', cor:'#D9A93A' }, alto:{ rot:'Alto', cor:'#C8553D' } },
  AREAS:[
    { k:'intensidade', nome:'Intensidade e controle', curto:'Intensidade',
      itens:[['Como está o seu nível de ansiedade hoje?', 'Muito calmo(a)', 'Muito ansioso(a)'],
             ['Com que intensidade você tem sentido ansiedade nos últimos dias?', 'Quase nenhuma', 'Extrema'],
             ['O quanto você sente que a ansiedade foge do seu controle?', 'Consigo controlar', 'Não consigo controlar'],
             ['O quanto a ansiedade aparece sem um motivo claro?', 'Nunca', 'Constantemente'],
             ['Quanto espaço as preocupações ocupam na sua mente no dia a dia?', 'Quase nenhum', 'Tomam conta de tudo']],
      txt:{ baixo:'A ansiedade aparece pouco e você sente que tem as rédeas na mão.', moderado:'A ansiedade já ocupa um espaço importante no seu dia e, em alguns momentos, parece tomar a frente.', alto:'A ansiedade está intensa, aparece mesmo sem motivo e você sente que perdeu o controle sobre ela.' },
      dicas:['Dê nome ao que sente: "isto é ansiedade, e ela passa". Nomear já diminui a intensidade.', 'Separe 10 minutos por dia para as preocupações, em vez de deixá-las espalhadas pelo dia todo.'] },
    { k:'corpo', nome:'Corpo', curto:'Corpo',
      itens:[['O quanto você sente sintomas físicos de ansiedade, como palpitação, aperto no peito ou dor de cabeça?', 'Nenhum sintoma', 'Sintomas fortes'],
             ['O quanto o seu corpo fica em estado de alerta, com sensação de perigo?', 'Relaxado', 'Em alerta o tempo todo'],
             ['O quanto você percebe tensão nos músculos no dia a dia (ombros, pescoço, mandíbula)?', 'Músculos relaxados', 'Muito tensos'],
             ['O quanto a sua respiração fica curta ou acelerada?', 'Tranquila', 'Muito acelerada'],
             ['O quanto a ansiedade aparece no seu corpo, como no estômago, no peito ou na garganta?', 'Quase nada', 'Muito']],
      txt:{ baixo:'O seu corpo está conseguindo descansar e voltar ao equilíbrio.', moderado:'O corpo já dá sinais: tensão, respiração curta ou desconfortos que vão e voltam.', alto:'O corpo está em estado de alerta quase constante, como se houvesse um perigo o tempo todo.' },
      dicas:['Respiração 4-6: inspire contando até 4 e solte o ar contando até 6, por 2 minutos. O corpo entende que pode relaxar.', 'Repare onde a tensão aparece (ombros, mandíbula, estômago) e solte essa região algumas vezes por dia.'] },
    { k:'mente', nome:'Mente e pensamentos', curto:'Mente',
      itens:[['O quanto os seus pensamentos ficam acelerados?', 'Calmos', 'Acelerados demais'],
             ['O quanto você se preocupa com o futuro?', 'Vivo o presente', 'Preocupação o tempo todo'],
             ['O quanto você imagina cenários negativos?', 'Raramente', 'Constantemente'],
             ['O quanto é difícil desligar a mente, mesmo quando você quer descansar?', 'Desligo fácil', 'Não consigo desligar'],
             ['O quanto um mesmo pensamento ansioso se repete na sua cabeça?', 'Raramente', 'Sem parar']],
      txt:{ baixo:'A mente consegue desacelerar e você vive mais o presente do que o futuro.', moderado:'Os pensamentos aceleram com frequência e o futuro preocupa mais do que deveria.', alto:'A mente não desliga: pensamentos repetitivos e cenários negativos ocupam boa parte do seu dia.' },
      dicas:['Quando um pensamento se repetir, escreva-o num papel e pergunte: "isso é um fato ou um medo?".', 'Traga a atenção para o agora: 5 coisas que você vê, 4 que você toca, 3 que você ouve.'] },
    { k:'sono', nome:'Sono', curto:'Sono',
      itens:[['Como está a qualidade do seu sono?', 'Excelente', 'Péssima'],
             ['O quanto a ansiedade atrapalha o seu sono?', 'Não atrapalha', 'Atrapalha muito'],
             ['O quanto é difícil pegar no sono?', 'Durmo rápido', 'Muito difícil'],
             ['O quanto você acorda durante a noite?', 'Durmo direto', 'Acordo muitas vezes'],
             ['Como você se sente emocionalmente ao acordar?', 'Bem e disposto(a)', 'Mal e sem energia']],
      txt:{ baixo:'O sono está ajudando você a recuperar as energias.', moderado:'O sono já sente o peso da ansiedade: demora para dormir, acorda à noite ou levanta cansado(a).', alto:'A ansiedade está roubando o seu descanso, e um sono ruim deixa a ansiedade ainda mais forte no dia seguinte.' },
      dicas:['Uma hora antes de dormir, diminua as luzes e deixe o celular longe da cama.', 'Se a mente acelerar na cama, anote o que está pensando e diga a si mesmo(a): "amanhã eu cuido disso".'] },
    { k:'rotina', nome:'Rotina e comportamento', curto:'Rotina',
      itens:[['O quanto a ansiedade atrapalha a sua produtividade?', 'Não atrapalha', 'Me paralisa'],
             ['O quanto você evita situações por causa da ansiedade?', 'Nunca evito', 'Evito sempre'],
             ['O quanto você se sente sobrecarregado(a)?', 'Equilibrado(a)', 'Sobrecarregado(a) demais'],
             ['O quanto você adia tarefas por se sentir ansioso(a)?', 'Nunca adio', 'Adio sempre'],
             ['O quanto a ansiedade mudou a sua alimentação (comer demais, de menos ou sem fome)?', 'Não mudou', 'Mudou muito']],
      txt:{ baixo:'A ansiedade pouco interfere no que você faz, decide e evita.', moderado:'A ansiedade já muda a sua rotina: você adia, evita algumas situações ou se sente sobrecarregado(a).', alto:'A ansiedade está comandando a rotina: paralisa, faz você evitar o que importa e mexe até com a alimentação.' },
      dicas:['Divida a tarefa que você vem adiando em um primeiro passo de 5 minutos e faça só ele hoje.', 'Escolha uma situação pequena que você tem evitado e enfrente-a aos poucos, com apoio.'] },
    { k:'recursos', nome:'Recursos emocionais', curto:'Recursos',
      itens:[['O quanto você se sente emocionalmente esgotado(a)?', 'Com energia', 'Esgotado(a)'],
             ['O quanto você se cobra para dar conta de tudo?', 'Me trato com gentileza', 'Me cobro demais'],
             ['O quanto é difícil se acalmar quando a ansiedade chega?', 'Me acalmo com facilidade', 'Não consigo me acalmar'],
             ['O quanto você sente falta de apoio emocional?', 'Tenho muito apoio', 'Não tenho apoio'],
             ['O quanto você sente que o que faz para lidar com a ansiedade ainda não funciona?', 'Funciona bem', 'Nada funciona']],
      txt:{ baixo:'Você tem energia, apoio e recursos que funcionam para atravessar os momentos difíceis.', moderado:'Os seus recursos estão se esgotando: a cobrança é alta e nem sempre você consegue se acalmar.', alto:'Você está esgotado(a), se cobrando muito e sem recursos que funcionem. É hora de não atravessar isso sozinho(a).' },
      dicas:['Troque o "eu tenho que dar conta de tudo" por "o que é possível hoje?".', 'Escolha uma pessoa de confiança e conte a ela como você realmente está.'] }
  ],
  ABERTAS:[['mente', 'O que mais tem ocupado a sua mente ultimamente?'], ['corpo', 'Em que parte do corpo você mais sente a ansiedade?'], ['ajuda', 'O que costuma te ajudar a se sentir melhor?']]
};
AN.TOTAL = AN.GAD.length + AN.AREAS.length * 5;
const anPrim = n => String(n || '').trim().split(/\s+/)[0] || '';
const anEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const anDig = v => String(v || '').replace(/\D/g, '');
const anAp = () => typeof T_A !== 'undefined' ? T_A : 'quem te atende';
const anLink = codigo => location.origin + location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&an=' + encodeURIComponent(codigo);
const anQuando = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const anData = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
const anDataCurta = iso => iso ? new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }) : '';
const anZapTer = texto => 'https://wa.me/' + (CONFIG.whatsappNumero || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
const anArea = k => AN.AREAS.find(a => a.k === k);

/* o mesmo cálculo do servidor (private.ansiedade_calcular), para mostrar na hora */
function anCalcular(gad, itens){
  const g = gad.reduce((s, v) => s + (+v || 0), 0), areas = {}, niveis = {}; let tot = 0;
  AN.AREAS.forEach((a, i) => { const soma = itens.slice(i * 5, i * 5 + 5).reduce((s, v) => s + (+v || 0), 0), idx = Math.round(((soma / 5) - 1) / 9 * 100);
    areas[a.k] = idx; niveis[a.k] = idx < 30 ? 'baixo' : idx < 60 ? 'moderado' : 'alto'; tot += idx; });
  return { gad_total:g, gad_classe:g <= 4 ? 'minima' : g <= 9 ? 'leve' : g <= 14 ? 'moderada' : 'grave', areas, niveis, geral:Math.round(tot / 6) };
}
const anNivel = v => v < 30 ? 'baixo' : v < 60 ? 'moderado' : 'alto';
function anDeRegistro(d){
  if(d && d.areas && d.gad_total != null) return { gad_total:+d.gad_total, gad_classe:d.gad_classe, areas:d.areas, niveis:d.niveis || Object.fromEntries(Object.entries(d.areas).map(([k, v]) => [k, anNivel(v)])), geral:+d.geral };
  return anCalcular((d && d.gad) || [], (d && d.itens) || []);
}

/* ---- 1. GRÁFICOS (SVG, sem biblioteca: aparecem na tela e no PDF) ---- */
function anRadarSVG(areas, antes){
  const W = 340, C = 170, R = 108, n = AN.AREAS.length, ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  const pt = (i, v) => [C + Math.cos(ang(i)) * R * v / 100, C + Math.sin(ang(i)) * R * v / 100];
  let s = `<svg viewBox="-34 0 ${W + 68} ${W}" role="img" aria-label="Mapa das 6 áreas da ansiedade (0 = tranquilo, 100 = muito peso)">`;
  [25, 50, 75, 100].forEach(v => { s += `<polygon points="${AN.AREAS.map((a, i) => pt(i, v).join(',')).join(' ')}" fill="none" stroke="#E3DCCD" stroke-width="1"/>`; });
  AN.AREAS.forEach((a, i) => { const [x, y] = pt(i, 100), [lx, ly] = pt(i, 128); s += `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" stroke="#E3DCCD"/>`;
    s += `<text x="${lx}" y="${ly}" font-size="12.5" font-weight="700" fill="#4C5670" text-anchor="${Math.abs(lx - C) < 8 ? 'middle' : lx > C ? 'start' : 'end'}" dominant-baseline="middle">${a.curto}</text>`; });
  if(antes) s += `<polygon points="${AN.AREAS.map((a, i) => pt(i, +antes[a.k] || 0).join(',')).join(' ')}" fill="rgba(138,151,160,.12)" stroke="#8A97A0" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  s += `<polygon points="${AN.AREAS.map((a, i) => pt(i, +areas[a.k] || 0).join(',')).join(' ')}" fill="rgba(200,85,61,.18)" stroke="#C8553D" stroke-width="2.4"/>`;
  AN.AREAS.forEach((a, i) => { const [x, y] = pt(i, +areas[a.k] || 0); s += `<circle cx="${x}" cy="${y}" r="4" fill="${AN.NIVEL[anNivel(+areas[a.k] || 0)].cor}" stroke="#fff" stroke-width="1.5"/>`; });
  return s + '</svg>';
}
function anEvolucaoSVG(hist){
  const W = 380, H = 240, E = 34, D = 44, T = 26, B = 46, n = hist.length;
  const x = i => n === 1 ? (E + W - D) / 2 : E + i * (W - E - D) / (n - 1), y = v => T + (100 - v) * (H - T - B) / 100;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do índice geral de ansiedade em cada aplicação">`;
  [[0, 30, '#E3F2E9'], [30, 60, '#FFF6DA'], [60, 100, '#FBE9E5']].forEach(([a, b, c]) => { s += `<rect x="${E}" y="${y(b)}" width="${W - E - D}" height="${y(a) - y(b)}" fill="${c}"/>`; });
  [0, 30, 60, 100].forEach(v => { s += `<text x="${E - 6}" y="${y(v)}" font-size="12" fill="#6B7486" text-anchor="end" dominant-baseline="middle">${v}</text>`; });
  s += `<polyline points="${hist.map((h, i) => x(i) + ',' + y(+h.geral || 0)).join(' ')}" fill="none" stroke="#1E4A45" stroke-width="3" stroke-linejoin="round"/>`;
  hist.forEach((h, i) => { s += `<circle cx="${x(i)}" cy="${y(+h.geral || 0)}" r="6" fill="#1E4A45" stroke="#fff" stroke-width="2"/>`;
    s += `<text x="${x(i)}" y="${y(+h.geral || 0) - 12}" font-size="16" font-weight="800" fill="#16203A" text-anchor="middle">${h.geral}</text>`;
    s += `<text x="${x(i)}" y="${H - 24}" font-size="13" font-weight="700" fill="#4C5670" text-anchor="middle">${h.aplicacao || i + 1}ª · ${anDataCurta(h.em)}</text>`;
    s += `<text x="${x(i)}" y="${H - 6}" font-size="12" fill="#6B7486" text-anchor="middle">GAD-7: ${h.gad_total}</text>`; });
  return s + '</svg>';
}

/* ---- 2. O RELATÓRIO (mesmas seções na tela da pessoa, na área da terapeuta e no PDF) ---- */
function anSecoes(calc, hist){
  const cl = AN.CLASSE[calc.gad_classe] || AN.CLASSE.minima, marca = Math.min(100, calc.gad_total / 21 * 100);
  const ant = hist && hist.length > 1 ? hist[hist.length - 2] : null;
  const ordem = AN.AREAS.slice().sort((a, b) => calc.areas[b.k] - calc.areas[a.k]);
  const gad = `<h2>Nível de ansiedade (GAD-7)</h2>
    <div class="an-gadbox" style="--c:${cl.cor}"><div class="an-gadnum"><b>${calc.gad_total}</b><small>de 21</small></div>
      <div class="an-gadtxt"><h3>${cl.rot}</h3><p style="margin:0">${escV(cl.txt)}</p>
      ${ant ? `<p style="margin:6px 0 0;font-size:14px">Na aplicação anterior: <b>${ant.gad_total}</b> ${anSeta(calc.gad_total - ant.gad_total, 'pontos')}</p>` : ''}</div></div>
    <div class="an-faixa"><i></i><i></i><i></i><i></i><span class="an-marca" style="left:${marca}%"></span></div>
    <div class="an-faixa-rot"><span>Mínima 0-4</span><span>Leve 5-9</span><span>Moderada 10-14</span><span>Grave 15-21</span></div>
    <p class="an-nota-peq">GAD-7: escala de ansiedade validada no Brasil, sobre as últimas 2 semanas.</p>`;
  const mapa = `<h2>As 6 áreas da sua ansiedade</h2>
    <p style="margin:0 0 8px">Índice geral: <b style="font-size:20px">${calc.geral}</b> de 100 <span class="an-nivel ${anNivel(calc.geral)}">${AN.NIVEL[anNivel(calc.geral)].rot}</span>${ant ? ' · antes: ' + ant.geral + ' ' + anSeta(calc.geral - ant.geral) : ''}</p>
    <div class="an-graf"><div>${anRadarSVG(calc.areas, ant && ant.areas)}${ant ? '<p class="an-nota-peq" style="text-align:center">Linha vermelha: hoje · tracejada: aplicação anterior</p>' : ''}</div>
      <div class="an-areas">${AN.AREAS.map(a => { const v = calc.areas[a.k], nv = anNivel(v);
        return `<div class="an-area"><b>${escV(a.nome)}</b><span class="an-v">${v}${ant && ant.areas ? ' ' + anSeta(v - (+ant.areas[a.k] || 0)) : ''}</span><span class="an-tr"><i style="width:${Math.max(3, v)}%;background:${AN.NIVEL[nv].cor}"></i></span></div>`; }).join('')}</div></div>
    <p class="an-nota-peq">0 = tranquilo · 100 = muito peso. Abaixo de 30, baixo; de 30 a 59, moderado; de 60 em diante, alto.</p>`;
  const leitura = `<h2>O que cada área mostra</h2>
    <p style="margin:0 0 10px">A área que mais pesa hoje é <b>${escV(ordem[0].nome)}</b>${calc.areas[ordem[1].k] >= 30 ? ', seguida de <b>' + escV(ordem[1].nome) + '</b>' : ''}. É por onde vale começar.</p>
    <div class="an-cards">${ordem.map(a => { const v = calc.areas[a.k], nv = anNivel(v);
      return `<div class="an-card" style="--c:${AN.NIVEL[nv].cor}"><h3>${escV(a.nome)} <span class="an-nivel ${nv}">${AN.NIVEL[nv].rot} · ${v}</span></h3><p>${escV(a.txt[nv])}</p>
        ${nv !== 'baixo' ? '<ul>' + a.dicas.map(t => '<li>' + escV(t) + '</li>').join('') + '</ul>' : ''}</div>`; }).join('')}</div>`;
  const evol = hist && hist.length > 1 ? `<h2>A sua evolução</h2>
    <div class="an-evol">${anEvolucaoSVG(hist)}
      <table><thead><tr><th>Área</th>${hist.map(h => `<th>${h.aplicacao}ª<br><small>${anDataCurta(h.em)}</small></th>`).join('')}</tr></thead><tbody>
      <tr><td><b>GAD-7</b></td>${hist.map(h => `<td>${h.gad_total}</td>`).join('')}</tr>
      <tr><td><b>Índice geral</b></td>${hist.map(h => `<td>${h.geral}</td>`).join('')}</tr>
      ${AN.AREAS.map(a => `<tr><td>${escV(a.nome)}</td>${hist.map(h => `<td>${h.areas ? h.areas[a.k] : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="an-nota-peq">Números menores são melhores: significam menos peso da ansiedade.</p></div>` : '';
  const sos = calc.gad_classe === 'grave' || calc.gad_classe === 'moderada' && calc.areas.recursos >= 70 ? `<div class="an-alerta">${escV(AN.SOS)}</div>` : '';
  return { gad, mapa, leitura, evol, sos };
}
function anSeta(dif, un){
  if(!dif) return '<span class="an-igual">= igual</span>';
  return dif < 0 ? `<span class="an-desce">↓ ${Math.abs(dif)}${un ? ' ' + un : ''}</span>` : `<span class="an-sobe">↑ ${dif}${un ? ' ' + un : ''}</span>`;
}
function anResumoTexto(nome, calc, hist, apl){
  const cl = AN.CLASSE[calc.gad_classe], ant = hist && hist.length > 1 ? hist[hist.length - 2] : null;
  return [nome + ' · ' + AN.NOME + (apl ? ' · ' + apl + 'ª aplicação' : ''),
    'GAD-7: ' + calc.gad_total + ' de 21 (' + cl.rot.toLowerCase() + ')' + (ant ? ' · antes: ' + ant.gad_total : ''),
    'Índice geral: ' + calc.geral + ' de 100' + (ant ? ' · antes: ' + ant.geral : ''), '',
    'Áreas (0 = tranquilo, 100 = muito peso):',
    ...AN.AREAS.map(a => '- ' + a.nome + ': ' + calc.areas[a.k] + ' (' + AN.NIVEL[anNivel(calc.areas[a.k])].rot.toLowerCase() + ')' + (ant && ant.areas ? ' · antes: ' + ant.areas[a.k] : ''))].join('\n');
}
function anImprimir(r){
  const s = anSecoes(r.calc, r.hist), d = r.dados || {}, ab = d.abertas || {};
  const abertas = AN.ABERTAS.filter(([k]) => ab[k]).map(([k, q]) => `<p><b>${escV(q)}</b>${escV(ab[k])}</p>`).join('');
  const html = `<div class="an-rel">
    <section class="an-pag an-capa"><div><p style="letter-spacing:.12em;font-weight:700">ACOMPANHAMENTO</p><h1>${AN.NOME}</h1>
      <p style="font-size:20px;margin-top:18px"><b>${escV(r.nome)}</b></p><p>${escV(r.dataTxt || '')}${r.apl ? ' · ' + r.apl + 'ª aplicação' : ''}</p>
      <p style="margin-top:26px">${escV((window.T_NOME || '') + (window.T_NOME ? ' · ' : '') + 'Ressignificar')}</p></div></section>
    <section class="an-pag">${s.gad}${s.sos}</section>
    <section class="an-pag">${s.mapa}</section>
    ${s.evol ? `<section class="an-pag">${s.evol}</section>` : ''}
    <section class="an-pag">${s.leitura}${abertas ? '<h2 style="margin-top:16px">Nas suas palavras</h2><div class="an-abertas">' + abertas + '</div>' : ''}<p class="an-nota-peq">${escV(AN.AVISO)}</p></section></div>`;
  const caixa = document.createElement('div'); caixa.id = 'an-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('an-imprimindo');
  const fim = () => { document.body.classList.remove('an-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('an-impressao')) fim(); }, 1500); }, 250);
}

/* ---- 3. TELAS DA PESSOA ---- */
const an = { codigo:'', mostrar:true, cad:null, gad:[], itens:[], abertas:{}, indice:0, inicio:0, status:null };
const anChave = c => CHAVE_CODIGOS + '_an_' + c + '_prog';
const anChaveCad = c => CHAVE_CODIGOS + '_an_' + c + '_cad';
function anErro(msg){ return '<div class="aviso ver">' + escV(msg) + '</div>'; }
function anMostrar(html){ document.getElementById('an-conteudo').innerHTML = html; mostrarTela('#tela-an'); window.scrollTo({ top:0, behavior:'auto' }); }
function anMontarTelas(){
  if(document.getElementById('tela-an-capa')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  const rod = escV((window.T_NOME || '') + ' · ' + ((window.__T && __T.dados && __T.dados.titulo) || ''));
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-an-capa">
  <div class="capa">
    <div class="moldura"><img id="an-foto" alt=""></div>
    <div class="lado-texto">
      <span class="selo an-selo">Teste de Ansiedade · Acompanhamento</span>
      <h1>Como está a sua <em>ansiedade</em> hoje?</h1>
      <p class="assinatura" id="an-assinatura"></p>
      <p class="texto-capa">Um retrato da sua ansiedade em 6 áreas (intensidade, corpo, mente, sono, rotina e recursos emocionais) e uma escala validada. A cada 15 dias você responde de novo e enxerga a sua evolução.</p>
      <ul class="lista-leve">
        <li>No celular, cerca de 7 minutos</li>
        <li>Uma pergunta por vez, sem resposta certa ou errada</li>
        <li>No final, o seu mapa da ansiedade e a sua evolução</li>
        <li>Autoconhecimento e acompanhamento, não é diagnóstico</li>
      </ul>
      <div class="cartao">
        <div class="campo" style="margin-bottom:10px">
          <label for="an-codigo">Digite o código que você recebeu</label>
          <input id="an-codigo" class="codigo-input" type="text" inputmode="text" autocomplete="off" placeholder="AB-0000" maxlength="9">
          <div class="dica" id="an-dica">O mesmo código vale para todas as aplicações do seu acompanhamento.</div>
        </div>
        <div class="aviso" id="an-aviso-codigo"></div>
        <button class="btn btn-primario" id="an-entrar" disabled>Digite o código</button>
      </div>
    </div>
  </div>
  <div class="rodape"><span class="nome-rodape">${rod}</span><a id="link-zap-an" href="#" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
</section>
<section class="tela" id="tela-an"><button class="voltar" id="an-voltar-capa">← Voltar</button><div id="an-conteudo"></div></section>
<section class="tela" id="tela-an-teste">
  <div class="barra-topo"><div class="progresso"><i id="an-barra"></i></div>
    <div class="linha-progresso"><span id="an-contador" aria-live="polite"></span><span class="tema">Ansiedade</span></div></div>
  <div id="an-pergunta-box"></div>
  <div class="an-nav"><button class="btn btn-contorno" id="an-voltar" type="button">← Anterior</button><button class="btn btn-primario" id="an-prox" type="button" disabled>Próxima →</button></div>
</section>
<section class="tela" id="tela-an-resultado"><div id="an-resultado"></div>
  <div class="rodape"><span class="nome-rodape">${rod}</span>Obrigado pela sua confiança.</div></section>`);
  const cod = document.getElementById('an-codigo');
  cod.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); avisar('#an-aviso-codigo', ''); anCampoCodigo(); });
  cod.addEventListener('keydown', e => { if(e.key === 'Enter' && !document.getElementById('an-entrar').disabled) document.getElementById('an-entrar').click(); });
  document.getElementById('an-entrar').addEventListener('click', anClicarEntrar);
  document.getElementById('link-zap-an').href = 'https://wa.me/' + (CONFIG.whatsappNumero || '');
  document.getElementById('an-voltar-capa').addEventListener('click', () => mostrarTela('#tela-an-capa'));
  document.getElementById('an-voltar').addEventListener('click', () => { if(an.indice > 0){ an.indice--; anDesenhar(); } });
  document.getElementById('an-prox').addEventListener('click', anAvancar);
}
function anCampoCodigo(){ const v = document.getElementById('an-codigo').value, b = document.getElementById('an-entrar'); b.disabled = v.length < 5; b.textContent = b.disabled ? 'Digite o código' : 'Começar'; }
function anAbrirCapa(codigo){
  anMontarTelas();
  const f = document.querySelector('#tela-capa .moldura img'), tf = document.getElementById('an-foto');
  if(f && f.src) tf.src = f.src; else { const ini = document.querySelector('#tela-capa .moldura .t-ini'); if(ini && tf) tf.replaceWith(ini.cloneNode(true)); }
  const ta = document.getElementById('an-assinatura'), oa = document.getElementById('t-assinatura'); if(ta && oa) ta.innerHTML = oa.innerHTML;
  const cod = document.getElementById('an-codigo'); if(window.__T && __T.prefixo) cod.placeholder = __T.prefixo + '-0000';
  if(codigo){ cod.value = codigo; document.getElementById('an-dica').innerHTML = '<span class="ok-pre" aria-hidden="true">✔</span> Código já preenchido. É só tocar em <b>“Começar”</b>.'; }
  anCampoCodigo(); mostrarTela('#tela-an-capa');
}
async function anClicarEntrar(){
  const b = document.getElementById('an-entrar'), codigo = document.getElementById('an-codigo').value.trim().toUpperCase();
  b.disabled = true; b.textContent = 'Verificando o código...';
  const r = await validarCodigo(codigo);
  b.disabled = false; b.textContent = 'Começar';
  if(!r.ok){
    const st = await compRpc('ansiedade_status', { p_codigo:codigo }).catch(() => null);   // código encerrado
    return avisar('#an-aviso-codigo', st && st.ok && st.encerrado ? 'Este acompanhamento foi encerrado. Fale com ' + anAp() + '.' : r.msg);
  }
  if(r.teste === 'ansiedade') return anEntrar(codigo, r);
  if(r.teste === 'disc' && typeof dcEntrar === 'function') return dcEntrar(codigo, r);
  if(r.teste === 'mpcc' && typeof mpEntrar === 'function') return mpEntrar(codigo, r);
  if(r.teste === 'tracos' && typeof tcEntrar === 'function') return tcEntrar(codigo, r);
  location.href = location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&c=' + encodeURIComponent(codigo);
}
async function anEntrar(codigo, r){
  anMontarTelas();
  an.codigo = codigo; an.mostrar = r.mostrar_resultado !== false && r.mostrar !== false;
  anMostrar('<div class="carregando">Abrindo o seu acompanhamento...</div>');
  const st = await compRpc('ansiedade_status', { p_codigo:codigo }).catch(() => null);
  an.status = st && st.ok ? st : { aplicacoes:0, liberado:true, historico:[] };
  if(an.status.encerrado) return anMostrar(`<h1 class="tc-h1">Acompanhamento encerrado</h1>${anErro('Este acompanhamento foi encerrado. Fale com ' + anAp() + ' se quiser continuar.')}`);
  if(!an.status.liberado) return anTelaEspera();
  const prog = ler(anChave(codigo), null);
  if(prog && prog.cad && Array.isArray(prog.itens)){ an.cad = prog.cad; return anComecar(prog); }
  anTelaCadastro(r.cliente || '');
}
function anTelaEspera(){
  const st = an.status, h = st.historico || [], ult = h[h.length - 1];
  const msg = 'Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Estou no acompanhamento do Teste de Ansiedade (código ' + an.codigo + ') e queria conversar com você.';
  anMostrar(`<span class="selo an-selo">Acompanhamento</span>
    <h1 class="tc-h1">A sua próxima aplicação libera em ${anData(st.proxima_em)}</h1>
    <p>Você já respondeu ${st.aplicacoes} ${st.aplicacoes === 1 ? 'vez' : 'vezes'}. O acompanhamento funciona melhor com um intervalo de ${st.intervalo_dias} dias entre uma aplicação e outra: é o tempo de a mudança aparecer.</p>
    <div class="an-proxima">Volte por este mesmo link no dia ${anData(st.proxima_em)}. Se você autorizou, também recebe um lembrete por e-mail.</div>
    ${ult && an.mostrar ? `<div class="an-secao" style="margin-top:16px"><h2>A sua última aplicação (${anData(ult.em)})</h2><p>GAD-7: <b>${ult.gad_total}</b> de 21 · ${escV((AN.CLASSE[ult.gad_classe] || {}).rot || '')} · índice geral <b>${ult.geral}</b> de 100</p>${h.length > 1 ? anEvolucaoSVG(h) : anRadarSVG(ult.areas || {})}</div>` : ''}
    <a class="btn btn-zap an-zap" href="${anZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar com ${escV(anAp())}<small>pelo WhatsApp</small></span></a>`);
}
function anTelaCadastro(nomeSugerido){
  const salvo = ler(anChaveCad(an.codigo), null) || {}, volta = (an.status && an.status.aplicacoes) || 0;
  anMostrar(`
    <span class="selo an-selo">Teste de Ansiedade</span>
    <h1 class="tc-h1">${volta ? 'Que bom ter você de volta' : 'Antes de começar'}</h1>
    ${volta ? `<p>Esta é a sua <b>${volta + 1}ª aplicação</b>. No final, você vê como a sua ansiedade mudou desde a última vez.</p>` : '<p>Este teste mostra como a ansiedade está aparecendo na sua vida hoje: na intensidade, no corpo, na mente, no sono, na rotina e nos seus recursos emocionais.</p>'}
    <div class="como-responder"><ul>
      <li>Primeiro, 7 perguntas rápidas sobre as <b>últimas 2 semanas</b>. Depois, perguntas de <b>1 a 10</b>, em que 1 é o lado tranquilo e 10 é o lado de mais peso.</li>
      <li>Pense em como você está <b>hoje</b> e vá no primeiro impulso. Não existe resposta certa ou errada.</li>
      <li>A maioria termina em cerca de 7 minutos. Se a página fechar, ao abrir o link de novo neste aparelho você continua de onde parou.</li></ul></div>
    <div class="cartao">
      <div class="campo"><label for="ak-nome">Nome completo</label><input id="ak-nome" type="text" autocomplete="name" value="${escV(salvo.nome || nomeSugerido || '')}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="ak-email">E-mail</label><input id="ak-email" type="email" inputmode="email" autocomplete="email" value="${escV(salvo.email || '')}" placeholder="voce@email.com"></div>
      <div class="campo"><label for="ak-tel">WhatsApp (com DDD)</label><input id="ak-tel" type="tel" inputmode="tel" autocomplete="tel" value="${escV(salvo.whatsapp || '')}" placeholder="(00) 00000-0000"></div>
      <div class="campo"><label for="ak-idade">Idade</label><input id="ak-idade" type="number" inputmode="numeric" min="10" max="110" value="${escV(salvo.idade || '')}" placeholder="Ex.: 34"></div>
      <div class="campo campo-check"><label class="check" for="ak-lgpd"><input id="ak-lgpd" type="checkbox">
        <span>Li e concordo com os <a href="/politica-de-privacidade.html" target="_blank" rel="noopener">termos de utilização e privacidade</a>. Concordo que as minhas respostas sejam usadas para gerar o meu resultado e enviadas para ${escV(anAp())}, que vai mantê-las em sigilo.</span></label></div>
      <div class="campo campo-check"><label class="check" for="ak-contato"><input id="ak-contato" type="checkbox"${salvo.contato ? ' checked' : ''}>
        <span>Quero receber por e-mail o <b>lembrete da próxima aplicação</b> e o contato sobre o meu resultado <span class="opc">(opcional)</span>.</span></label></div>
      <div class="aviso" id="ak-aviso"></div>
      <button class="btn btn-primario" id="ak-ir">Começar</button>
    </div>`);
  mascaraTelefone(document.getElementById('ak-tel'));
  document.getElementById('ak-ir').addEventListener('click', () => {
    const v = id => document.getElementById(id).value.trim().replace(/\s+/g, ' ');
    const n = v('ak-nome'), em = v('ak-email'), t = document.getElementById('ak-tel').value, idade = v('ak-idade');
    const erro = n.split(' ').length < 2 || n.length < 5 ? 'Escreva o seu nome completo (nome e sobrenome).'
      : !anEmail(em) ? 'Escreva um e-mail válido.' : anDig(t).length < 10 ? 'Escreva o seu WhatsApp com DDD.'
      : !(+idade >= 10 && +idade <= 110) ? 'Escreva a sua idade.'
      : !document.getElementById('ak-lgpd').checked ? 'Para continuar, marque que você leu e concorda com os termos de utilização e privacidade.' : '';
    if(erro) return avisar('#ak-aviso', erro);
    an.cad = { nome:n, email:em, whatsapp:t, idade, contato:document.getElementById('ak-contato').checked };
    guardar(anChaveCad(an.codigo), an.cad);
    anComecar(null);
  });
}
function anComecar(prog){
  const N = AN.AREAS.length * 5;
  an.gad = prog && Array.isArray(prog.gad) && prog.gad.length === 7 ? prog.gad.slice() : new Array(7).fill(null);
  an.itens = prog && Array.isArray(prog.itens) && prog.itens.length === N ? prog.itens.slice() : new Array(N).fill(null);
  an.abertas = (prog && prog.abertas) || {};
  const todas = an.gad.concat(an.itens), vazia = todas.findIndex(x => x == null);
  an.indice = vazia < 0 ? AN.TOTAL : vazia; an.inicio = Date.now(); anGuardar();
  mostrarTela('#tela-an-teste'); anDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
const anGuardar = () => guardar(anChave(an.codigo), { cad:an.cad, gad:an.gad, itens:an.itens, abertas:an.abertas });
const anValor = i => i < 7 ? an.gad[i] : an.itens[i - 7];
function anDesenhar(){
  const i = an.indice, box = document.getElementById('an-pergunta-box');
  if(typeof TX_INC === 'function') TX_INC(document.getElementById('an-contador'), Math.min(i, AN.TOTAL), AN.TOTAL, 'ansiedade'); else document.getElementById('an-contador').textContent = '';
  document.getElementById('an-barra').style.width = (Math.min(i, AN.TOTAL) / (AN.TOTAL + 1) * 100) + '%';
  document.getElementById('an-voltar').style.visibility = i === 0 ? 'hidden' : 'visible';
  const prox = document.getElementById('an-prox');
  if(i >= AN.TOTAL){   // perguntas abertas (opcionais)
    box.innerHTML = `<span class="an-parte">Para fechar</span><h2 class="an-pergunta">Se quiser, conte com as suas palavras</h2>
      <p class="an-enunciado">As três perguntas são opcionais, mas ajudam muito ${escV(anAp())} a entender o seu momento.</p>
      ${AN.ABERTAS.map(([k, q]) => `<div class="campo"><label for="an-ab-${k}">${escV(q)} <span class="opc">(opcional)</span></label><textarea id="an-ab-${k}" rows="2" maxlength="600">${escV(an.abertas[k] || '')}</textarea></div>`).join('')}`;
    AN.ABERTAS.forEach(([k]) => document.getElementById('an-ab-' + k).addEventListener('input', e => { an.abertas[k] = e.target.value; anGuardar(); }));
    prox.disabled = false; prox.textContent = an.mostrar ? 'Ver o meu resultado' : 'Enviar as respostas';
    return;
  }
  if(i < 7){
    box.innerHTML = `<span class="an-parte">Últimas 2 semanas</span><p class="an-enunciado">${escV(AN.GAD_ENUNCIADO)}</p><h2 class="an-pergunta">${escV(AN.GAD[i])}</h2>
      <div class="an-gad" role="radiogroup">${AN.GAD_OP.map((t, v) => `<button type="button" role="radio" aria-checked="${an.gad[i] === v}" class="${an.gad[i] === v ? 'on' : ''}" data-v="${v}"><b>${v}</b>${escV(t)}</button>`).join('')}</div>`;
  } else {
    const k = i - 7, a = AN.AREAS[Math.floor(k / 5)], it = a.itens[k % 5];
    box.innerHTML = `<span class="an-parte">${escV(a.nome)}</span><h2 class="an-pergunta">${escV(it[0])}</h2>
      <div class="an-regua" role="radiogroup" aria-label="Nota de 1 a 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button type="button" role="radio" aria-checked="${an.itens[k] === n}" class="${an.itens[k] === n ? 'on' : ''}" data-v="${n}" aria-label="Nota ${n}">${n}</button>`).join('')}</div>
      <div class="an-pontas"><span>1 · ${escV(it[1])}</span><span>10 · ${escV(it[2])}</span></div>`;
  }
  box.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => anResponder(+b.dataset.v)));
  prox.disabled = anValor(i) == null; prox.textContent = 'Próxima →';
}
function anResponder(v){
  const i = an.indice;
  if(i < 7) an.gad[i] = v; else an.itens[i - 7] = v;
  anGuardar(); anDesenhar();
  const rapido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => { if(an.indice === i){ an.indice++; anDesenhar(); window.scrollTo({ top:0, behavior:'auto' }); } }, rapido ? 0 : 320);
}
function anAvancar(){
  if(an.indice >= AN.TOTAL){ document.getElementById('an-barra').style.width = '100%'; return anFinalizar(); }
  if(anValor(an.indice) == null) return;
  an.indice++; anDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
async function anFinalizar(){
  const todas = an.gad.concat(an.itens), falta = todas.findIndex(x => x == null);
  if(falta > -1){ an.indice = falta; mostrarTela('#tela-an-teste'); anDesenhar(); return; }
  const dados = Object.assign({ teste:'ansiedade', versao:1, codigo:an.codigo, data:hoje(), data_iso:new Date().toISOString(), duracaoMin:an.inicio ? Math.round((Date.now() - an.inicio) / 60000) : null,
    consentimento:true, consentimento_contato:!!an.cad.contato }, an.cad, { gad:an.gad, itens:an.itens, abertas:an.abertas });
  delete dados.contato;
  anMostrar('<div class="carregando">Calculando o seu resultado e enviando as respostas...</div>');
  const r = await compRpc('ansiedade_salvar_resposta', { p_dados:dados });
  if(!r || r.ok !== true){
    if(r && r.erro === 'cedo'){ try{ localStorage.removeItem(anChave(an.codigo)); }catch(e){} an.status = Object.assign(an.status || {}, { proxima_em:r.proxima_em, liberado:false }); return anTelaEspera(); }
    anMostrar(`<h1 class="tc-h1">Quase lá</h1>${anErro((r && r.msg) || 'Não consegui enviar as suas respostas agora. Elas continuam guardadas neste aparelho.')}<button class="btn btn-primario" id="ak-de-novo">Tentar enviar de novo</button>`);
    document.getElementById('ak-de-novo').addEventListener('click', anFinalizar); return;
  }
  try{ localStorage.removeItem(anChave(an.codigo)); }catch(e){}
  const prim = anPrim(an.cad.nome);
  if(!an.mostrar){
    const msg = 'Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + an.cad.nome + ' e acabei de responder o Teste de Ansiedade (código ' + an.codigo + ', ' + r.aplicacao + 'ª aplicação). Fico no aguardo da nossa conversa.';
    anMostrar(`<span class="selo an-selo">Respostas enviadas</span><h1 class="tc-h1">Obrigado, ${escV(prim)}!</h1>
      <p>As suas respostas foram enviadas para ${escV(anAp())}, que vai analisar o seu momento e conversar com você.</p>
      <div class="an-proxima">A sua próxima aplicação libera em ${anData(r.proxima_em)}, por este mesmo link.</div>
      <a class="btn btn-zap an-zap" href="${anZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar agora no WhatsApp<small>abre a conversa com a mensagem pronta</small></span></a>`);
    return;
  }
  const calc = r.calc || anCalcular(an.gad, an.itens), hist = (r.historico && r.historico.length) ? r.historico : [{ aplicacao:r.aplicacao || 1, em:new Date().toISOString(), gad_total:calc.gad_total, geral:calc.geral, areas:calc.areas }];
  anResultadoPessoa({ nome:an.cad.nome, whatsapp:an.cad.whatsapp, email:an.cad.email, calc, hist, apl:r.aplicacao || hist.length, proxima:r.proxima_em, dataTxt:new Date().toLocaleDateString('pt-BR'), codigo:an.codigo, dados });
}
function anResultadoPessoa(r){
  const s = anSecoes(r.calc, r.hist), prim = anPrim(r.nome), resumo = anResumoTexto(r.nome, r.calc, r.hist, r.apl);
  const msg = ['Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + r.nome + ' e acabei de responder o Teste de Ansiedade (código ' + r.codigo + ').', '', resumo, '', 'Quero conversar sobre o meu resultado.'].join('\n');
  const zapProprio = typeof dvZapNum === 'function' ? dvZapNum(r.whatsapp) : anDig(r.whatsapp);
  document.getElementById('an-resultado').innerHTML = `<div class="an-cliente">
    <span class="selo an-selo">Teste de Ansiedade · ${r.apl}ª aplicação</span>
    <h1 class="tc-h1">${escV(prim)}, este é o seu momento</h1>
    <div class="an-secao">${s.gad}${s.sos}</div>
    ${s.evol ? `<div class="an-secao">${s.evol}</div>` : ''}
    <div class="an-secao">${s.mapa}</div>
    <div class="an-secao">${s.leitura}</div>
    <div class="an-secao"><h2>Próximo passo</h2><p>Na conversa, ${escV(anAp())} mostra o que está por trás da sua ansiedade e o caminho para ela perder força, uma área de cada vez.</p>
      <a class="btn btn-zap an-zap" href="${anZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Quero conversar sobre o meu resultado<small>conversa pelo WhatsApp com a mensagem pronta</small></span></a>
      <div class="an-proxima" style="margin-top:12px">A sua próxima aplicação libera em <b>${anData(r.proxima)}</b>, por este mesmo link. É assim que você enxerga a sua evolução.</div></div>
    <div class="an-secao"><h2>Guardar o seu resultado</h2><div class="an-acoes">
      <button type="button" class="btn btn-argila" data-an-pdf><span class="duas">Baixar relatório em PDF<small>nível, mapa, evolução e o que cada área mostra</small></span></button>
      ${zapProprio ? `<a class="btn btn-contorno" href="https://wa.me/${zapProprio}?text=${encodeURIComponent(resumo + '\n\nPróxima aplicação: ' + anData(r.proxima) + '\n' + anLink(r.codigo))}" target="_blank" rel="noopener"><span class="duas">Enviar para o meu WhatsApp<small>o resumo e o link da próxima aplicação</small></span></a>` : ''}
      ${anEmail(r.email) ? `<a class="btn btn-contorno" href="mailto:${escV(r.email)}?subject=${encodeURIComponent('Teste de Ansiedade · ' + r.nome)}&body=${encodeURIComponent(resumo + '\n\nPróxima aplicação: ' + anData(r.proxima) + '\n' + anLink(r.codigo))}"><span class="duas">Enviar para o meu e-mail<small>${escV(r.email)}</small></span></a>` : ''}
    </div></div>
    <p class="an-nota-peq">${escV(AN.AVISO)}</p></div>`;
  mostrarTela('#tela-an-resultado'); window.scrollTo({ top:0, behavior:'auto' });
  document.querySelectorAll('#an-resultado [data-an-pdf]').forEach(b => b.addEventListener('click', () => anImprimir(r)));
}

/* ---- 4. ÁREA DA TERAPEUTA ---- */
let anCache = [], anCodigos = [];
function anAdminMontar(){
  if(document.getElementById('painel-an')) return;
  const base = document.getElementById('painel-dc') || document.getElementById('painel-mp') || document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-an">
      <div id="an-abas"><button type="button" class="ativa" data-an-aba="respostas">Acompanhamentos</button><button type="button" data-an-aba="codigos">Códigos de acesso</button></div>
      <div id="an-aba-respostas">
        <div class="campo"><input id="an-busca" type="search" placeholder="Buscar por nome"></div>
        <button type="button" class="mini-btn" id="an-exportar" style="margin-bottom:12px">Exportar resultados (planilha)</button>
        <div id="an-lista-respostas"><div class="vazio">Nenhuma aplicação por enquanto.</div></div>
      </div>
      <div id="an-aba-codigos" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="an-cod-nome">Nome da pessoa <span class="opc">(opcional)</span></label><input id="an-cod-nome" type="text" placeholder="Ex.: Maria Souza"></div>
          <div class="campo"><label for="an-cod-whats">WhatsApp de quem vai receber o link <span class="opc">(opcional)</span></label><input id="an-cod-whats" type="tel" inputmode="tel" placeholder="(00) 00000-0000"></div>
          <div class="campo"><label for="an-cod-int">De quanto em quanto tempo a pessoa refaz?</label>
            <select id="an-cod-int"><option value="7">A cada 7 dias</option><option value="15" selected>A cada 15 dias (recomendado)</option><option value="30">A cada 30 dias</option></select></div>
          <div class="campo"><label id="rot-an-mostrar">A pessoa vê o resultado no final?</label>
            <div class="alternar" id="an-alt-mostrar" role="radiogroup" aria-labelledby="rot-an-mostrar">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, vê<small>nível, mapa, evolução e PDF</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não, só eu vejo<small>recebe só um agradecimento</small></button>
            </div></div>
          <div class="campo"><label id="rot-an-urg">Cronômetro de 60 segundos no final?</label>
            <div class="alternar" id="an-alt-urg" role="radiogroup" aria-labelledby="rot-an-urg">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, ligado<small>60 s para falar no WhatsApp; depois, só notificação</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não<small>o WhatsApp fica sempre disponível</small></button>
            </div></div>
          <button class="btn btn-argila" id="an-gerar">Gerar código do acompanhamento</button>
        </div>
        <div id="an-caixa-codigo"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Códigos criados</h3>
        <div id="an-lista-codigos"><div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div></div>
      </div>
      <div id="an-detalhe" style="display:none"><button class="voltar" id="an-voltar-lista">← Voltar para a lista</button><div id="an-detalhe-conteudo"></div></div>
    </div>`);
  mascaraTelefone(document.getElementById('an-cod-whats'));
  document.querySelectorAll('#an-abas button').forEach(b => b.addEventListener('click', () => anAdminAba(b.dataset.anAba)));
  let mostrarSel = true;
  const alternar = (id, cb) => document.querySelectorAll('#' + id + ' button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#' + id + ' button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); if(cb) cb(b); }));
  alternar('an-alt-urg'); alternar('an-alt-mostrar', b => { mostrarSel = b.dataset.v === '1'; });
  document.getElementById('an-busca').addEventListener('input', anDesenharLista);
  document.getElementById('an-exportar').addEventListener('click', anExportar);
  document.getElementById('an-voltar-lista').addEventListener('click', () => { const a = document.querySelector('#an-abas button.ativa'); anAdminAba(a ? a.dataset.anAba : 'respostas'); });
  document.getElementById('an-gerar').addEventListener('click', () => anGerar(mostrarSel));
}
function anAdminAba(q){
  document.querySelectorAll('#an-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.anAba === q));
  document.getElementById('an-aba-codigos').style.display = q === 'codigos' ? '' : 'none';
  document.getElementById('an-aba-respostas').style.display = q === 'respostas' ? '' : 'none';
  document.getElementById('an-detalhe').style.display = 'none';
}
function anConvite(primeiro, codigo, mostrar, dias){
  return [(primeiro ? 'Olá, ' + primeiro + '!' : 'Olá!') + ' Aqui é ' + anAp() + '.', '',
    'Separei para você o Teste de Ansiedade. Ele mostra como a ansiedade está aparecendo na sua vida hoje: na intensidade, no corpo, na mente, no sono, na rotina e nos seus recursos emocionais.', '',
    'É só tocar no link abaixo. O código já vai preenchido:', anLink(codigo), '',
    'Se o link não abrir direto, o código é: *' + codigo + '*', '',
    'Leva cerca de 7 minutos. Não existe resposta certa ou errada.',
    'A cada ' + dias + ' dias você responde de novo, pelo mesmo link, e a gente acompanha a sua evolução em números.',
    mostrar ? 'No final, você vê o seu resultado e baixa o relatório em PDF.' : 'Quando terminar, eu analiso as suas respostas e a gente conversa.'].join('\n');
}
async function anGerar(mostrar){
  const b = document.getElementById('an-gerar'), nomeCli = document.getElementById('an-cod-nome').value.trim(), zapCli = document.getElementById('an-cod-whats').value.trim(), caixa = document.getElementById('an-caixa-codigo');
  const dias = +document.getElementById('an-cod-int').value || 15;
  const c = clienteMembros(), { data:sess } = await c.auth.getSession();
  if(!sess || !sess.session){ caixa.innerHTML = anErro('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  b.disabled = true; b.textContent = 'Gerando...';
  let codigo = novoCodigo(), erro = null;
  for(let t = 0; t < 6; t++){
    const { error } = await c.from('travas_codigos').insert({ terapeuta_id:sess.session.user.id, codigo, cliente:nomeCli || null, whatsapp:zapCli || null, mostrar_resultado:mostrar, urgencia:(typeof dvUrgSel === 'function' ? dvUrgSel('an-alt-urg') : true), teste:'ansiedade', tipo:'individual', intervalo_dias:dias });
    erro = error; if(!error) break;
    if(error.code === '23505'){ codigo = novoCodigo(); continue; } break;
  }
  b.disabled = false; b.textContent = 'Gerar código do acompanhamento';
  if(erro){ caixa.innerHTML = anErro('Não consegui gerar o código agora. Saia da área, entre de novo e tente outra vez.'); return; }
  const primeiro = anPrim(nomeCli), destino = zapNumero(zapCli);
  caixa.innerHTML = `<div class="codigo-gerado"><div class="valor">${codigo}</div>
      <div class="para">${nomeCli ? 'Para ' + escV(nomeCli) + ' · ' : ''}Teste de Ansiedade · a cada ${dias} dias · ${mostrar ? 'a pessoa vê o resultado' : 'só você vê o resultado'}</div></div>
    <a class="btn btn-zap" href="https://wa.me/${destino}?text=${encodeURIComponent(anConvite(primeiro, codigo, mostrar, dias))}" target="_blank" rel="noopener"><span class="duas">${primeiro ? 'Enviar o link para ' + escV(primeiro) : 'Enviar o link pelo WhatsApp'}<small>${destino ? 'abre a conversa com a mensagem pronta' : 'você escolhe o contato na hora'}</small></span></a>
    <button class="btn btn-contorno" id="an-copiar-link">Copiar o link com o código</button>`;
  document.getElementById('an-copiar-link').addEventListener('click', async e => { try{ await navigator.clipboard.writeText(anLink(codigo)); e.target.textContent = 'Link copiado!'; }catch(err){ e.target.textContent = 'Não consegui copiar'; } setTimeout(() => { e.target.textContent = 'Copiar o link com o código'; }, 2000); });
  anCarregarCodigos();
}
async function anCarregarCodigos(){
  const caixa = document.getElementById('an-lista-codigos'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('travas_codigos').select('id,codigo,cliente,whatsapp,criado_em,usado,usado_por,usado_em,mostrar_resultado,intervalo_dias,proxima_em').eq('terapeuta_id', sess.session.user.id).eq('teste', 'ansiedade').order('criado_em', { ascending:false }).limit(300);
  if(error){ caixa.innerHTML = anErro('Não consegui carregar os códigos agora.'); return; }
  anCodigos = data || [];
  if(!anCodigos.length){ caixa.innerHTML = '<div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div>'; return; }
  caixa.innerHTML = anCodigos.map(x => `<div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${x.codigo}${x.cliente || x.usado_por ? ' · ' + escV(x.usado_por || x.cliente) : ''}<span class="tag-vis">a cada ${x.intervalo_dias || 15} dias</span><span class="tag-vis">${x.mostrar_resultado === false ? 'só você vê' : 'pessoa vê'}</span></span>
      <span class="sub">${x.usado ? 'acompanhamento encerrado' : x.usado_em ? 'última aplicação em ' + anQuando(x.usado_em) + ' · próxima em ' + anData(x.proxima_em) : 'criado em ' + anQuando(x.criado_em) + ' · ainda não respondeu'}</span></span>
      <span class="etiqueta ${x.usado ? 'usado' : 'livre'}">${x.usado ? 'encerrado' : 'ativo'}</span>
      <span style="display:flex;gap:8px;width:100%;margin-top:8px">${x.usado ? '' : `<button type="button" class="mini-btn" data-an-link="${x.codigo}">Copiar link</button>`}</span></div>`).join('');
  caixa.querySelectorAll('[data-an-link]').forEach(b => b.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(anLink(b.dataset.anLink)); b.textContent = 'Copiado!'; }catch(err){ b.textContent = 'Não consegui'; } setTimeout(() => { b.textContent = 'Copiar link'; }, 1800); }));
}
async function anCarregarRespostas(){
  const caixa = document.getElementById('an-lista-respostas'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const [rr, rc] = await Promise.all([
    c.from('ansiedade_respostas').select('id,codigo,aplicacao,nome,dados,criado_em').eq('terapeuta_id', sess.session.user.id).order('criado_em', { ascending:true }).limit(2000),
    c.from('travas_codigos').select('codigo,cliente,whatsapp,usado,usado_em,proxima_em,intervalo_dias,mostrar_resultado').eq('terapeuta_id', sess.session.user.id).eq('teste', 'ansiedade').limit(500)]);
  if(rr.error){ caixa.innerHTML = anErro('Não consegui carregar as aplicações agora.'); return; }
  anCache = rr.data || []; anCodigos = rc.data || anCodigos; anDesenharLista();
}
/* um acompanhamento = um código, com todas as aplicações em ordem */
function anGrupos(){
  const g = {};
  anCache.forEach(x => { (g[x.codigo] = g[x.codigo] || []).push(x); });
  return Object.keys(g).map(cod => ({ codigo:cod, apls:g[cod], ult:g[cod][g[cod].length - 1], info:anCodigos.find(c => c.codigo === cod) || {} }))
    .sort((a, b) => new Date(b.ult.criado_em) - new Date(a.ult.criado_em));
}
function anDesenharLista(){
  const termo = (document.getElementById('an-busca').value || '').trim().toLowerCase(), caixa = document.getElementById('an-lista-respostas');
  const lista = anGrupos().filter(gp => !termo || (gp.ult.nome || '').toLowerCase().includes(termo));
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">Nenhuma aplicação por enquanto.</div>'; return; }
  const agora = Date.now();
  caixa.innerHTML = lista.map(gp => { const c = anDeRegistro(gp.ult.dados), cl = AN.CLASSE[c.gad_classe] || AN.CLASSE.minima, n = gp.apls.length;
    const ant = n > 1 ? anDeRegistro(gp.apls[n - 2].dados) : null, dif = ant ? c.gad_total - ant.gad_total : null;
    const prox = gp.info.proxima_em, vencida = prox && new Date(prox).getTime() <= agora && !gp.info.usado;
    return `<button type="button" class="linha-item" data-an-cod="${escV(gp.codigo)}" data-dv-del="ansiedade" data-id="${gp.ult.id}"><span class="esq"><span class="nome">${escV(gp.ult.nome)}</span>
      <span class="sub">${n} ${n === 1 ? 'aplicação' : 'aplicações'} · última em ${anData(gp.ult.criado_em)} · GAD-7 ${c.gad_total}${dif != null ? ' (' + (dif > 0 ? '+' : '') + dif + ')' : ''} · índice ${c.geral}${gp.info.usado ? ' · encerrado' : prox ? (vencida ? ' · <b style="color:#B03A2E">nova aplicação liberada desde ' + anData(prox) + '</b>' : ' · próxima em ' + anData(prox)) : ''}</span></span>
      <span class="etiqueta livre" style="background:${cl.cor};color:#fff">${escV(cl.rot.replace('Ansiedade ', ''))}</span></button>`; }).join('');
  caixa.querySelectorAll('[data-an-cod]').forEach(b => b.addEventListener('click', () => anAbrirDetalhe(b.dataset.anCod)));
}
function anExportar(){
  if(!anCache.length) return;
  const cab = ['Identificador', 'Data', 'Nome', 'E-mail', 'WhatsApp', 'Idade', 'Código', 'Aplicação', 'GAD-7', 'Classificação', 'Índice geral'].concat(AN.AREAS.map(a => a.nome));
  const linhas = anCache.map(x => { const d = x.dados || {}, c = anDeRegistro(d);
    return [x.id, anQuando(x.criado_em), x.nome, d.email, d.whatsapp, d.idade, x.codigo, x.aplicacao, c.gad_total, (AN.CLASSE[c.gad_classe] || {}).rot, c.geral].concat(AN.AREAS.map(a => c.areas[a.k])); });
  const csv = [cab].concat(linhas).map(l => l.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'ansiedade-resultados-' + (window.T_SLUG || 'pagina') + '.csv'; a.click(); URL.revokeObjectURL(url);
}

/* "Gerar apresentação": o mesmo gerador do Teste de Travas, com as 6 áreas da ansiedade */
const AN_APRES_VOC = { pct:true, teste:'Teste de Ansiedade', item:'área', itens:'áreas',
  capaTit:'como a ansiedade está aparecendo na sua vida e o plano para ela perder força.', capaSub:'Plano de acompanhamento a partir do seu Teste de Ansiedade.',
  mapaTit:'O peso da ansiedade em cada área', caminhoTit:'Como vamos tirar o peso da ansiedade',
  fase1:'Começamos pela área que mais pesa hoje, para você sentir alívio logo nas primeiras semanas. Como trabalhamos: ', fase2:'Depois, cuidamos das outras áreas que ainda pesam, para o alívio se sustentar. Como trabalhamos: ',
  evol:'A cada 15 dias você refaz o Teste de Ansiedade e vê, em números, a ansiedade perdendo força.',
  altoTxt:'áreas com mais peso: é por elas que começamos.', baixoTxt:'áreas mais tranquilas: os seus pontos de apoio.',
  destaque:'É a área em que a ansiedade mais pesa hoje.',
  dica:'Tudo o que aparece na apresentação (as áreas e o peso de cada uma) vem do Teste de Ansiedade desta pessoa.',
  objDinheiro:'Ansiedade sem cuidado custa caro: noites mal dormidas, produtividade perdida, saúde e relações desgastadas.',
  objTentei:'Aqui você não fica no escuro: a cada 15 dias o teste mostra, em números, o que está mudando.',
  picoRot:'mais peso', suporteRot:'pontos de apoio', legPico:'Mais peso: 60 ou mais', legSuporte:'Pontos de apoio: abaixo de 30' };
const AN_APRES_LIB = {
  intensidade:{ x:'controle', y:'calma', resumo:'A ansiedade aparece com força e, muitas vezes, sem motivo claro, dando a sensação de que ela está no comando.', custo:'Viver em estado de alerta, com a sensação de que a qualquer momento algo vai sair do controle.', imagine:['Você reconhece a ansiedade chegando e sabe o que fazer.', 'A calma volta a ser o seu estado natural.'] },
  corpo:{ x:'alerta do corpo', y:'relaxamento', resumo:'O corpo está em alerta: tensão, respiração curta, aperto no peito ou no estômago.', custo:'Dores, cansaço e sintomas físicos que viram rotina e assustam ainda mais.', imagine:['O seu corpo volta a descansar.', 'Você respira fundo e sente o alívio de verdade.'] },
  mente:{ x:'pensamento acelerado', y:'presença', resumo:'A mente não desliga: pensamentos repetitivos e cenários negativos ocupam o seu dia.', custo:'Viver no futuro e perder o presente, com a cabeça sempre cheia.', imagine:['A sua mente desacelera.', 'Você vive o agora sem o peso do e se.'] },
  sono:{ x:'noites mal dormidas', y:'descanso', resumo:'A ansiedade está roubando o seu sono, e o sono ruim alimenta a ansiedade no dia seguinte.', custo:'Acordar cansado(a), sem energia, num ciclo que só piora.', imagine:['Você deita e dorme.', 'Você acorda com energia para o seu dia.'] },
  rotina:{ x:'paralisia', y:'ação', resumo:'A ansiedade já comanda a rotina: você adia, evita e se sente sobrecarregado(a).', custo:'Oportunidades perdidas e tarefas acumuladas que aumentam a culpa e a ansiedade.', imagine:['Você volta a dar conta do seu dia.', 'O que você evitava deixa de ter poder sobre você.'] },
  recursos:{ x:'esgotamento', y:'força interior', resumo:'Os seus recursos estão no limite: muita cobrança, pouco apoio e estratégias que não funcionam.', custo:'Esgotamento emocional e a sensação de atravessar tudo sozinho(a).', imagine:['Você tem ferramentas que funcionam.', 'Você se trata com mais gentileza.'] }
};
const AN_APRES_TEC = {
  intensidade:'identificação dos gatilhos, técnicas de regulação emocional e um plano para os momentos de crise.',
  corpo:'respiração e relaxamento guiados, consciência corporal e redução do estado de alerta.',
  mente:'reorganização dos pensamentos ansiosos, atenção plena e treino para sair do e se.',
  sono:'rotina do sono, desaceleração noturna e técnicas para a mente desligar.',
  rotina:'enfrentamento gradual, priorização e pequenos passos diários para sair da paralisia.',
  recursos:'autocompaixão, rede de apoio e construção de estratégias que funcionam para você.'
};
function anApresentar(x){
  if(typeof apresAbrir !== 'function') return alert('A apresentação não está disponível nesta página.');
  const d = x.dados || {}, c = anDeRegistro(d);
  const lista = AN.AREAS.map(a => ({ id:a.k, nome:a.nome, nota:c.areas[a.k], nivel:c.areas[a.k] >= 60 ? 'alta' : c.areas[a.k] >= 30 ? 'media' : 'baixa' })).sort((a, b) => b.nota - a.nota);
  const foto = (document.querySelector('.moldura img') || {}).src || null;
  const insta = ((document.querySelector('a[href*="instagram.com/"]') || {}).href || '').replace(/^.*instagram\.com\//, '').replace(/[\/?#].*$/, '');
  const ab = d.abertas || {};
  apresAbrir({ nome:x.nome || '', prim:anPrim(x.nome), genero:'', idade:d.idade || '', motivo:'Ansiedade · ' + (AN.CLASSE[c.gad_classe] || {}).rot, dor:ab.mente || '', olhar:ab.corpo || '', atencao:0, travas:lista },
    { voc:AN_APRES_VOC, lib:AN_APRES_LIB, tec:AN_APRES_TEC, terap:{ nome:CONFIG.terapeuta, zap:CONFIG.whatsappNumero, insta, papel:'terapeuta', foto } });
}
async function anEnviarEmail(destino, assunto, corpo, codigo, b){
  const rotulo = b.innerHTML; b.disabled = true; b.textContent = 'Enviando...';
  let ok = false;
  try{ if(typeof modoLocal !== 'function' || !modoLocal()){ const r = await api(ACOES.enviarEmail, { destino, assunto, corpo, codigo }); ok = !!(r && r.ok !== false); } }catch(e){ ok = false; }
  b.disabled = false;
  if(ok){ b.textContent = 'E-mail enviado para ' + destino; setTimeout(() => { b.innerHTML = rotulo; }, 3000); return; }
  b.innerHTML = rotulo;
  location.href = 'mailto:' + encodeURIComponent(destino) + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo.slice(0, 1800));
}
async function anCiclo(codigo, acao, dias){
  try{ const { data, error } = await clienteMembros().rpc('ansiedade_ciclo', { p_codigo:codigo, p_acao:acao, p_dias:dias || null }); if(error || !data || !data.ok) throw error || new Error('falhou'); return true; }
  catch(e){ alert('Não consegui fazer isso agora. Saia da área, entre de novo e tente outra vez.'); return false; }
}
function anAbrirDetalhe(codigo, idApl){
  const gp = anGrupos().find(g => g.codigo === codigo); if(!gp) return;
  const x = idApl ? gp.apls.find(a => a.id === idApl) || gp.ult : gp.ult, pos = gp.apls.indexOf(x);
  const d = x.dados || {}, calc = anDeRegistro(d), zap = zapNumero(d.whatsapp), prim = anPrim(x.nome), info = gp.info || {};
  const hist = gp.apls.slice(0, pos + 1).map(a => { const c = anDeRegistro(a.dados); return { aplicacao:a.aplicacao, em:a.criado_em, gad_total:c.gad_total, geral:c.geral, areas:c.areas }; });
  const r = { nome:x.nome, calc, hist, apl:x.aplicacao, dataTxt:anData(x.criado_em), codigo, dados:d }, resumo = anResumoTexto(x.nome, calc, hist, x.aplicacao), s = anSecoes(calc, hist);
  const prox = info.proxima_em, liberada = prox && new Date(prox).getTime() <= Date.now();
  document.getElementById('an-aba-codigos').style.display = 'none'; document.getElementById('an-aba-respostas').style.display = 'none';
  document.getElementById('an-detalhe').style.display = 'block';
  const msgZap = ['Olá, ' + prim + '! Aqui é ' + anAp() + '.', '', 'Vi o seu Teste de Ansiedade (' + x.aplicacao + 'ª aplicação): ' + (AN.CLASSE[calc.gad_classe] || {}).rot.toLowerCase() + '.', '', 'Vamos conversar sobre o seu resultado e o próximo passo?'].join('\n');
  const msgLembra = ['Olá, ' + prim + '! Aqui é ' + anAp() + '.', '', 'Chegou a hora da sua nova aplicação do Teste de Ansiedade. Leva cerca de 7 minutos e mostra a sua evolução:', anLink(codigo)].join('\n');
  const ab = d.abertas || {}, abertas = AN.ABERTAS.filter(([k]) => ab[k]).map(([k, q]) => `<p><b>${escV(q)}</b>${escV(ab[k])}</p>`).join('');
  document.getElementById('an-detalhe-conteudo').innerHTML = `<h2 style="font-size:24px;margin:6px 0 4px">${escV(x.nome)}</h2>
    <p class="secao-sub">${escV(codigo)} · ${x.aplicacao}ª aplicação em ${anQuando(x.criado_em)}${d.duracaoMin != null ? ' · ' + d.duracaoMin + ' min' : ''}<br>${escV(d.email || '')}${d.whatsapp ? ' · ' + escV(d.whatsapp) : ''}${d.idade ? ' · ' + escV(d.idade) + ' anos' : ''}${d.consentimento_contato ? ' · autorizou o contato e o lembrete' : ''}</p>
    ${gp.apls.length > 1 ? `<div class="an-apls">${gp.apls.map(a => `<button type="button" class="${a.id === x.id ? 'ativa' : ''}" data-an-apl="${a.id}">${a.aplicacao}ª · ${anDataCurta(a.criado_em)}</button>`).join('')}</div>` : ''}
    <div class="an-secao"><h2>Acompanhamento</h2>
      <p style="margin:0">${info.usado ? '<b>Encerrado.</b> A pessoa não consegue mais responder com este código.' : prox ? (liberada ? '<b>Nova aplicação liberada</b> desde ' + anData(prox) + '.' : 'Próxima aplicação em <b>' + anData(prox) + '</b>.') : 'Ainda sem data.'}</p>
      <div class="an-intervalo"><label for="an-int-det">Intervalo:</label><select id="an-int-det">${[7, 15, 30].map(v => `<option value="${v}"${(info.intervalo_dias || 15) === v ? ' selected' : ''}>a cada ${v} dias</option>`).join('')}</select>
        ${info.usado ? '<button type="button" class="mini-btn" data-an-ciclo="reabrir">Reabrir o acompanhamento</button>' : `${liberada ? '' : '<button type="button" class="mini-btn" data-an-ciclo="liberar">Liberar nova aplicação agora</button>'}<button type="button" class="mini-btn" data-an-ciclo="encerrar">Encerrar o acompanhamento</button>`}</div>
      ${zap && !info.usado && liberada ? `<a class="btn btn-contorno" href="https://wa.me/${zap}?text=${encodeURIComponent(msgLembra)}" target="_blank" rel="noopener"><span class="duas">Lembrar ${escV(prim)} da nova aplicação<small>mensagem pronta com o link</small></span></a>` : ''}</div>
    <div class="an-acoes">
      ${zap ? `<a class="btn btn-zap" href="https://wa.me/${zap}?text=${encodeURIComponent(msgZap)}" target="_blank" rel="noopener"><span class="duas">Falar com ${escV(prim)} no WhatsApp<small>mensagem pronta para a conversa</small></span></a>` : ''}
      <button type="button" class="btn btn-argila" data-an-apres><span class="duas">Gerar apresentação<small>proposta de acompanhamento para ${escV(prim)}</small></span></button>
      <button type="button" class="btn btn-argila" data-an-email="eu"><span class="duas">Enviar para o meu e-mail<small>${escV(CONFIG.emailTerapeuta || '')}</small></span></button>
      ${d.email ? `<button type="button" class="btn btn-contorno" data-an-email="pessoa"><span class="duas">Enviar para ${escV(prim)}<small>${escV(d.email)}</small></span></button>` : ''}
      <button type="button" class="btn btn-contorno" data-an-pdf><span class="duas">Salvar em PDF ou imprimir<small>nível, mapa, evolução e leitura das áreas</small></span></button>
      <button type="button" class="btn btn-contorno" data-an-copiar>Copiar a ficha completa</button>
    </div>
    <div class="an-rel-tela"><div class="an-secao">${s.gad}${s.sos}</div>${s.evol ? `<div class="an-secao">${s.evol}</div>` : ''}<div class="an-secao">${s.mapa}</div><div class="an-secao">${s.leitura}</div>
      ${abertas ? `<div class="an-secao an-abertas"><h2>Nas palavras de ${escV(prim)}</h2>${abertas}</div>` : ''}</div>
    <details class="an-resp tc-respostas"><summary>As 37 respostas desta aplicação</summary><table><thead><tr><th>Pergunta</th><th>Resposta</th></tr></thead><tbody>
      ${AN.GAD.map((q, i) => `<tr><td><small>GAD-7</small> ${escV(q)}</td><td>${Array.isArray(d.gad) && d.gad[i] != null ? escV(AN.GAD_OP[d.gad[i]]) : ''}</td></tr>`).join('')}
      ${AN.AREAS.map((a, j) => a.itens.map((it, k) => `<tr><td><small>${escV(a.curto)}</small> ${escV(it[0])}</td><td>${Array.isArray(d.itens) ? d.itens[j * 5 + k] : ''}</td></tr>`).join('')).join('')}</tbody></table></details>`;
  window.scrollTo({ top:0, behavior:'auto' });
  const raiz = document.getElementById('an-detalhe-conteudo');
  raiz.querySelectorAll('[data-an-apl]').forEach(b => b.addEventListener('click', () => anAbrirDetalhe(codigo, b.dataset.anApl)));
  raiz.querySelector('[data-an-pdf]').addEventListener('click', () => anImprimir(r));
  raiz.querySelector('[data-an-apres]').addEventListener('click', () => anApresentar(x));
  raiz.querySelector('[data-an-copiar]').addEventListener('click', async e => { const b = e.currentTarget; try{ await navigator.clipboard.writeText(resumo); b.textContent = 'Ficha copiada!'; }catch(err){ b.textContent = 'Não consegui copiar'; } setTimeout(() => { b.textContent = 'Copiar a ficha completa'; }, 2200); });
  raiz.querySelectorAll('[data-an-email]').forEach(b => b.addEventListener('click', () => {
    const eu = b.dataset.anEmail === 'eu';
    anEnviarEmail(eu ? CONFIG.emailTerapeuta : d.email, 'Teste de Ansiedade — ' + x.nome + ' (' + x.aplicacao + 'ª aplicação, ' + anData(x.criado_em) + ')', resumo, codigo, b);
  }));
  const recarregar = async () => { await anCarregarRespostas(); anAbrirDetalhe(codigo, x.id); };
  raiz.querySelectorAll('[data-an-ciclo]').forEach(b => b.addEventListener('click', async () => {
    const acao = b.dataset.anCiclo;
    if(acao === 'encerrar' && !confirm('Encerrar o acompanhamento de ' + x.nome + '? A pessoa não vai mais conseguir responder com este código (você pode reabrir depois).')) return;
    b.disabled = true; if(await anCiclo(codigo, acao)) recarregar(); else b.disabled = false;
  }));
  document.getElementById('an-int-det').addEventListener('change', async e => { if(await anCiclo(codigo, 'intervalo', +e.target.value)) recarregar(); });
}

/* ---- 5. SELETOR DE TESTES DA ÁREA, CAPA DE VENDAS E LIGAÇÃO COM O MODELO ---- */
function anSeletor(ativos){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  const campo = alt.closest('.campo');
  if(!alt.querySelector('[data-v=ansiedade]')){
    alt.insertAdjacentHTML('beforeend', '<button type="button" data-v="ansiedade" role="radio" aria-checked="false">Ansiedade<small>acompanhamento</small></button>');
    const b = alt.querySelector('[data-v=ansiedade]');
    b.addEventListener('click', () => {
      alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      const adm = document.getElementById('painel-admin'); adm.classList.remove('modo-tc', 'modo-mp', 'modo-dc'); adm.classList.add('modo-an');
      anAdminAba('respostas'); anCarregarRespostas(); anCarregarCodigos();
    });
    alt.querySelectorAll('button').forEach(x => { if(x !== b) x.addEventListener('click', () => document.getElementById('painel-admin').classList.remove('modo-an')); });
  }
  const ba = alt.querySelector('[data-v=ansiedade]'); if(ba) ba.style.display = ativos.indexOf('ansiedade') > -1 ? '' : 'none';
  if(campo && ativos.length > 1) campo.style.display = '';
}
/* textos do Teste de Ansiedade na capa de vendas (devolutiva-carater.js: dvCapaVendas lê window.CV_EXTRA) */
window.CV_EXTRA = Object.assign(window.CV_EXTRA || {}, { ansiedade:{
  rot:'Teste de Ansiedade', curto:'Ansiedade', tag:'Individual · Acompanhamento a cada 15 dias', titulo:'Teste de Ansiedade',
  objetivo:'Mostrar como a ansiedade está aparecendo na sua vida hoje (na intensidade, no corpo, na mente, no sono, na rotina e nos seus recursos emocionais) e acompanhar, a cada 15 dias, como ela vai perdendo força.',
  como:['A maioria termina em cerca de 7 minutos', 'Uma escala validada (GAD-7) e perguntas de 1 a 10', 'A cada 15 dias você refaz pelo mesmo link e vê a sua evolução'],
  resultado:q => 'O seu nível de ansiedade, o mapa das 6 áreas, o que cada uma mostra e a sua evolução a cada aplicação. Depois, a conversa com ' + q + '.',
  mapaTitulo:'As 6 áreas que o teste acompanha',
  itens:AN.AREAS.map(a => ({ nome:a.nome, desc:a.txt.alto })),
  pergunta:'Como está a sua ansiedade?',
  texto:'Um retrato da sua ansiedade em 6 áreas, com uma escala validada, e o acompanhamento da sua evolução a cada 15 dias, em números.',
  meta:'6 áreas · cerca de 7 minutos',
  zap:'quero fazer o Teste de Ansiedade. Como recebo o meu código?',
  descobre:'<b>como a ansiedade está pesando na sua vida e como ela muda com o cuidado</b>',
  recebe:q => 'No Teste de Ansiedade, o seu nível de ansiedade, o mapa das 6 áreas e a sua evolução a cada 15 dias',
  tempo:'o Teste de Ansiedade, cerca de 7 minutos',
  faq:q => ['O Teste de Ansiedade é um diagnóstico?', 'Não. É uma ferramenta de autoconhecimento e acompanhamento, com uma escala validada (GAD-7) e perguntas sobre o corpo, a mente, o sono, a rotina e os seus recursos. Quem interpreta o resultado é ' + q + '. Se a ansiedade estiver muito forte, procure também um médico ou psicólogo.']
} });
function anInit(){
  if(anInit.feito) return; anInit.feito = true;
  anMontarTelas(); anAdminMontar();
  try{ const c = (new URLSearchParams(location.search).get('an') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9); if(c) anAbrirCapa(c); }catch(e){}
}
/* chamado pelo modelo quando a terapeuta tem o Teste de Ansiedade: ativos = lista dos testes dela */
function anAjustarTestes(ativos){
  anInit(); anSeletor(ativos);
  const ROT = { travas:'Teste de Travas Mentais', tracos:'Teste de Traços de Caráter', mpcc:'MPCC', disc:'DISC', ansiedade:'Teste de Ansiedade' };
  document.title = ativos.map(k => ROT[k] || k).join(' · ') + (window.T_NOME ? ' · ' + T_NOME : '');
}
window.anEntrar = anEntrar; window.anAjustarTestes = anAjustarTestes; window.anAbrirCapa = anAbrirCapa;
