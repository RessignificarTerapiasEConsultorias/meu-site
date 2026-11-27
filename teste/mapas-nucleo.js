/* ============================================================================
   MAPAS · NÚCLEO COMPARTILHADO (página do teste, área da terapeuta e página pública do Plano, /plano/)
   Faixas e cores, números em pt-BR, roda da vida, gráfico de reteste (antes e agora)
   e a leitura do Plano de Ressignificação (os 13 campos), igual na área, no PDF e na página do cliente.
   Sem dependências: funciona sozinho (a página /plano/ não carrega o resto do teste).
   ============================================================================ */
const MA_FAIXA = {
  tranquilo:{ rot:'Tranquilo', cor:'#5E9E7A', fundo:'#E3F2E9', tinta:'#24613F' },
  leve:{ rot:'Leve', cor:'#5E9E7A', fundo:'#E3F2E9', tinta:'#24613F' },
  atencao:{ rot:'Atenção', cor:'#D9A93A', fundo:'#FFF1C7', tinta:'#6B4D00' },
  prioridade:{ rot:'Prioridade', cor:'#C8553D', fundo:'#FBE3DE', tinta:'#8A2C22' }
};
const MA_NAO_DIAG = 'Este mapa é de autoconhecimento e não é um diagnóstico.';
const MA_CVV = 'Você não está só. Se precisar conversar agora, ligue 188 (CVV), 24 horas e gratuito, ou acesse cvv.org.br. Procure também um psicólogo ou um médico. Vamos avisar quem te atende para entrar em contato com você.';
const MA_SUBST = 'Vale procurar um médico ou o CAPS AD da sua cidade.';
const MA_TRAT = 'Este mapa trabalha junto com o seu tratamento, nunca no lugar dele.';
const maNum = v => v == null || v === '' || isNaN(+v) ? '–' : (Math.round(+v * 10) / 10).toLocaleString('pt-BR');
const maFaixaDe = (cfg, v) => +v >= 7 ? 'prioridade' : +v >= 4 ? 'atencao' : cfg.baixa;
const maFx = (cfg, k) => MA_FAIXA[k] || MA_FAIXA[cfg.baixa];
const maEsc = t => typeof escV === 'function' ? escV(t) : String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const maChip = (cfg, k, extra) => `<span class="ma-faixa" style="background:${maFx(cfg, k).fundo};color:${maFx(cfg, k).tinta}">${maFx(cfg, k).rot}${extra != null ? ' · ' + extra : ''}</span>`;
function maSeta(dif){
  dif = Math.round(dif * 10) / 10;
  if(!dif) return '<span class="ma-igual">=</span>';
  return dif < 0 ? `<span class="ma-desce">↓ ${maNum(Math.abs(dif))}</span>` : `<span class="ma-sobe">↑ ${maNum(dif)}</span>`;
}
const maNotas = areas => { const o = {}; (areas || []).forEach(a => { o[a.id] = +a.nota; }); return o; };
function maRodaSVG(cfg, areas, antes){
  const n = cfg.AREAS.length, C = 170, R = 118, W = 340, notas = maNotas(areas), passo = 2 * Math.PI / n;
  const ang = i => -Math.PI / 2 + i * passo, pt = (a, r) => [C + Math.cos(a) * r, C + Math.sin(a) * r].map(x => Math.round(x * 10) / 10);
  const fatia = (i, r) => { if(r <= 0.5) return ''; const [x0, y0] = pt(ang(i) + 0.012, r), [x1, y1] = pt(ang(i) + passo - 0.012, r); return `M${C},${C} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`; };
  let s = `<svg viewBox="-46 -6 ${W + 92} ${W + 12}" role="img" aria-label="Roda da vida com as ${n} áreas (0 a 10: quanto maior, mais a área pesa hoje)">`;
  cfg.AREAS.forEach((a, i) => { s += `<path d="${fatia(i, R)}" fill="#F4F0E7" stroke="#fff" stroke-width="1.5" class="ma-svg-fundo"/>`; });
  [4, 7].forEach(v => { s += `<circle cx="${C}" cy="${C}" r="${R * v / 10}" fill="none" stroke="#DDD5C4" stroke-width="1" stroke-dasharray="3 3" class="ma-svg-anel"/>`; });
  cfg.AREAS.forEach((a, i) => { const v = Math.max(0, Math.min(10, +notas[a.id] || 0)), fx = maFx(cfg, maFaixaDe(cfg, v));
    s += `<path d="${fatia(i, R * Math.max(v, 0.25) / 10)}" fill="${fx.cor}" fill-opacity=".88" stroke="#fff" stroke-width="1.5"/>`; });
  if(antes) cfg.AREAS.forEach((a, i) => { const v = +antes[a.id]; if(isNaN(v) || v <= 0) return; const r = R * v / 10, [x0, y0] = pt(ang(i) + 0.05, r), [x1, y1] = pt(ang(i) + passo - 0.05, r);
    s += `<path d="M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}" fill="none" stroke="#16203A" stroke-width="2" stroke-dasharray="4 3" class="ma-svg-antes"/>`; });
  cfg.AREAS.forEach((a, i) => { const m = ang(i) + passo / 2, [lx, ly] = pt(m, R + 14), cx = Math.cos(m);
    s += `<text x="${lx}" y="${ly}" font-size="12" font-weight="700" fill="#4C5670" class="ma-svg-rot" text-anchor="${Math.abs(cx) < 0.3 ? 'middle' : cx > 0 ? 'start' : 'end'}" dominant-baseline="middle">${maEsc(a.curto)}</text>`; });
  return s + '</svg>';
}

const maDataBR = iso => { if(!iso) return ''; const s = String(iso); const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + 'T12:00:00') : new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('pt-BR'); };
const maDataBRCurta = iso => iso ? new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }) : '';
/* as áreas de cada Mapa (nomes e rótulos curtos da roda); os textos das perguntas ficam em devolutiva-mapas.js */
const MA_BASE = {
  vida:{ id:'vida', NOME:'Mapa da Vida', baixa:'tranquilo', AREAS:[
    { id:'emocoes', nome:'Emoções', curto:'Emoções' }, { id:'autoestima', nome:'Autoestima', curto:'Autoestima' }, { id:'amor', nome:'Relacionamento amoroso', curto:'Amor' },
    { id:'familia', nome:'Família e filhos', curto:'Família' }, { id:'carreira', nome:'Carreira', curto:'Carreira' }, { id:'energia', nome:'Energia', curto:'Energia' },
    { id:'foco', nome:'Foco e produtividade', curto:'Foco' }, { id:'dinheiro', nome:'Dinheiro', curto:'Dinheiro' }, { id:'saude', nome:'Saúde e hábitos', curto:'Saúde' },
    { id:'relacoes', nome:'Relações e limites', curto:'Relações' }, { id:'sentido', nome:'Sentido de vida', curto:'Sentido' }, { id:'perdas', nome:'Perdas e transições', curto:'Perdas' }] },
  procrastinacao:{ id:'procrastinacao', NOME:'Mapa da Procrastinação', baixa:'leve', AREAS:[
    { id:'comportamentais', nome:'Sintomas comportamentais', curto:'Comportamento' }, { id:'emocionais', nome:'Sintomas emocionais', curto:'Emoções' },
    { id:'fisicos', nome:'Sintomas físicos', curto:'Corpo' }, { id:'pensamentos', nome:'Pensamentos comuns', curto:'Pensamentos' },
    { id:'gatilhos', nome:'Gatilhos emocionais', curto:'Gatilhos' }, { id:'ambiente', nome:'Ambiente e contexto', curto:'Ambiente' },
    { id:'habitos', nome:'Hábitos e rotina', curto:'Rotina' }, { id:'decisao', nome:'Tomada de decisão', curto:'Decisão' }, { id:'recompensa', nome:'Recompensa e distração', curto:'Distração' }] },
  profissional:{ id:'profissional', NOME:'Mapa Profissional · energia no trabalho', baixa:'leve', rotGeral:'Energia (média)', AREAS:[
    { id:'exaustao', nome:'Exaustão', curto:'Exaustão' }, { id:'distanciamento', nome:'Distanciamento', curto:'Distanciamento' }, { id:'nao_render', nome:'Sensação de não render', curto:'Não render' }] },
  autoestima:{ id:'autoestima', NOME:'Mapa da Autoestima', baixa:'leve', AREAS:[
    { id:'autovalor', nome:'Autovalor', curto:'Autovalor' }, { id:'autocritica', nome:'Autocrítica', curto:'Autocrítica' }, { id:'comparacao', nome:'Comparação', curto:'Comparação' },
    { id:'aprovacao', nome:'Necessidade de aprovação', curto:'Aprovação' }, { id:'exposicao', nome:'Medo de exposição', curto:'Exposição' }, { id:'merecimento', nome:'Merecimento e limites', curto:'Merecimento' }] },
  dinheiro:{ id:'dinheiro', NOME:'Mapa do Dinheiro', baixa:'leve', AREAS:[
    { id:'crencas', nome:'Crenças sobre dinheiro', curto:'Crenças' }, { id:'cobrar', nome:'Cobrar e receber', curto:'Cobrar' }, { id:'emocoes', nome:'Emoções com dinheiro', curto:'Emoções' },
    { id:'organizacao', nome:'Organização', curto:'Organização' }, { id:'impulsos', nome:'Impulsos e autossabotagem', curto:'Impulsos' }, { id:'familia', nome:'Família e dinheiro', curto:'Família' }] }
};
const MA_PLANO_TESTES = ['vida', 'procrastinacao', 'profissional', 'autoestima', 'dinheiro'];   // os Mapas que um Plano pode vincular

/* ---- RETESTE: antes (1ª aplicação) e agora (a última), área por área ---- */
function maRetesteSVG(cfg, hist){
  const a0 = hist[0], a1 = hist[hist.length - 1], n0 = maNotas(a0.areas), n1 = maNotas(a1.areas);
  const W = 360, TOPO = 30, LIN = 48, VAL = 74, BW = W - VAL, H = TOPO + cfg.AREAS.length * LIN + 4;
  const rot0 = 'Antes (' + (a0.aplicacao || 1) + 'ª · ' + maDataBRCurta(a0.em) + ')', rot1 = 'Agora (' + (a1.aplicacao || hist.length) + 'ª · ' + maDataBRCurta(a1.em) + ')';
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Antes e agora em cada área do ${maEsc(cfg.NOME || '')}, de 0 a 10" class="ma-ret-svg">`;
  s += `<rect x="0" y="6" width="22" height="8" rx="4" fill="#D9A93A" fill-opacity=".4"/><text x="28" y="13" font-size="11.5" fill="#4C5670" class="ma-svg-rot">${maEsc(rot0)}</text>`;
  s += `<rect x="178" y="4" width="22" height="12" rx="5" fill="#D9A93A"/><text x="206" y="13" font-size="11.5" font-weight="700" fill="#16203A" class="ma-svg-val">${maEsc(rot1)}</text>`;
  cfg.AREAS.forEach((a, i) => {
    const y = TOPO + i * LIN, v0 = n0[a.id], v1 = n1[a.id], c0 = maFx(cfg, maFaixaDe(cfg, v0)).cor, c1 = maFx(cfg, maFaixaDe(cfg, v1)).cor;
    const w = v => Math.max(3, Math.min(10, +v || 0) / 10 * BW);
    s += `<text x="0" y="${y + 10}" font-size="12.5" font-weight="700" fill="#16203A" class="ma-svg-val">${maEsc(a.nome)}</text>`;
    s += `<rect x="0" y="${y + 16}" width="${BW}" height="9" rx="4.5" fill="#EEE7D8" class="ma-svg-trilho"/>`;
    if(v0 != null && !isNaN(v0)) s += `<rect x="0" y="${y + 16}" width="${w(v0)}" height="9" rx="4.5" fill="${c0}" fill-opacity=".4"/>`;
    s += `<rect x="0" y="${y + 28}" width="${BW}" height="13" rx="6.5" fill="#EEE7D8" class="ma-svg-trilho"/>`;
    if(v1 != null && !isNaN(v1)) s += `<rect x="0" y="${y + 28}" width="${w(v1)}" height="13" rx="6.5" fill="${c1}"/>`;
    s += `<text x="${W}" y="${y + 24}" font-size="11.5" fill="#6B7486" text-anchor="end" class="ma-svg-rot">${maNum(v0)}</text>`;
    s += `<text x="${W}" y="${y + 40}" font-size="14" font-weight="800" fill="#16203A" text-anchor="end" class="ma-svg-val">${maNum(v1)}</text>`;
  });
  return s + '</svg>';
}
function maRetesteDelta(rot, a, b){
  if(a == null || b == null || isNaN(+a) || isNaN(+b)) return '';
  return `<span class="ma-ret-d"><small>${maEsc(rot)}</small><b>${maNum(a)} → ${maNum(b)}</b> ${maSeta(+b - +a)}</span>`;
}
/* hist: a lista de aplicações (aplicacao, em, geral, impacto, areas); com menos de 2, não há o que comparar */
function maRetesteHTML(cfg, hist, titulo){
  if(!hist || hist.length < 2) return '';
  const a0 = hist[0], a1 = hist[hist.length - 1];
  return `<div class="ma-reteste">${titulo ? '<h3 class="ma-ret-tit">' + maEsc(titulo) + '</h3>' : ''}
    <div class="ma-ret-deltas">${maRetesteDelta('Impacto (0 a 10)', a0.impacto, a1.impacto)}${maRetesteDelta(cfg.rotGeral || 'Média geral', a0.geral, a1.geral)}</div>
    ${maRetesteSVG(cfg, hist)}
    <p class="ma-nota-peq">De 0 a 10: números menores são melhores, porque a área pesa menos. Barra clara: antes; barra cheia: agora.</p></div>`;
}

/* ---- PLANO DE RESSIGNIFICAÇÃO: os 13 campos ---- */
const PL_CIENCIA = 'Este trabalho é de desenvolvimento humano e não substitui tratamento médico ou psicológico.';
const PL_ETAPAS = { 1:'Sessão 1', 6:'Sessão 6', 12:'Sessão 12' };
const PL_MESES = [[1, 'Mês 1 · Mapeamento'], [2, 'Mês 2 · Intervenção'], [3, 'Mês 3 · Planejamento de vida']];
const PL_SESSOES = ['Motivo e objetivo', 'Bloqueios e ganhos secundários', 'Ponte afetiva (causa raiz)', 'Fechamento do mapeamento',
  'Swish dissociado', 'Criança interior + Reteste', 'Lealdades invisíveis', 'Ponte ao futuro',
  'Ambiente e frequência', 'Rotina e corpo', 'Mapa da próxima área', 'Contrato de autoliderança + Reteste'];
const PL_CAMPOS = [
  { n:1, k:'queixa', t:'Queixa', d:'O que trouxe você até aqui, nas suas palavras.' },
  { n:2, k:'motivo', t:'Motivo', d:'Por que resolver isso agora.' },
  { n:3, k:'objetivo', t:'Objetivo (90 dias)', d:'Uma meta que dá para medir.' },
  { n:4, k:'mapa', t:'Mapa da Vida', d:'As 12 áreas e a nota de cada uma.', auto:true },
  { n:5, k:'bloqueio', t:'Bloqueio', d:'O que trava.' },
  { n:6, k:'causa', t:'Causa raiz (hipótese)', d:'De onde isso pode vir.' },
  { n:7, k:'sessoes', t:'Sessões e técnicas', d:'As 12 sessões, com o objetivo e a técnica de cada uma.' },
  { n:8, k:'passos', t:'Próximos passos', d:'As tarefas da semana.' },
  { n:9, k:'planejamento', t:'Planejamento por área', d:'O próximo ciclo.' },
  { n:10, k:'indicadores', t:'Indicadores', d:'Como medimos a evolução.' },
  { n:11, k:'reteste', t:'Reteste', d:'Nas sessões 6 e 12, os Mapas são refeitos para comparar antes e agora.' },
  { n:12, k:'cuidados', t:'Cuidados', d:'Quando vale procurar também um médico, um psicólogo ou outro serviço.' },
  { n:13, k:'ciencia', t:'Ciência do cliente', d:'' }
];
const plSessoesPadrao = () => PL_SESSOES.map(t => ({ titulo:t, tecnica:'' }));
const plTexto = v => maEsc(String(v || '').trim()).replace(/\n/g, '<br>');
/* leitura do Plano (área, PDF e página do cliente). p: { cliente, etapa, dados, ciente_em, ciente_nome }; H: { vida:[histórico], procrastinacao:[...], ... } */
function plBloco(k, p, H, op){
  op = op || {}; H = H || {};
  const d = p.dados || {}, hv = H.vida || [], ult = hv.length ? hv[hv.length - 1] : null, cv = MA_BASE.vida;
  const corpo = {
    mapa:() => ult && ult.areas && ult.areas.length ? `<div class="pl-mapa"><div class="pl-roda">${maRodaSVG(cv, ult.areas)}</div>
        <ul class="pl-notas">${ult.areas.slice().sort((a, b) => b.nota - a.nota).map(a => `<li><i style="background:${maFx(cv, a.faixa || maFaixaDe(cv, a.nota)).cor}"></i><span>${maEsc(a.nome)}</span><b>${maNum(a.nota)}</b></li>`).join('')}</ul></div>
        <p class="ma-nota-peq">Mapa da Vida de ${maDataBR(ult.em)}. De 0 a 10: quanto maior, mais a área pesa hoje.</p>` : '<p class="pl-vazio">Ainda sem Mapa da Vida respondido.</p>',
    sessoes:() => { const ss = Array.isArray(d.sessoes) && d.sessoes.length ? d.sessoes : plSessoesPadrao();
      return PL_MESES.map(([m, rot]) => `<div class="pl-mes"><h4>${rot}</h4><ol start="${(m - 1) * 4 + 1}">${ss.slice((m - 1) * 4, m * 4).map(x => `<li><b>${maEsc(x.titulo || '')}</b>${String(x.tecnica || '').trim() ? '<span>' + plTexto(x.tecnica) + '</span>' : ''}</li>`).join('')}</ol></div>`).join('')
        + (String(d.sugestao || '').trim() ? `<p class="pl-sug">${plTexto(d.sugestao)}</p>` : ''); },
    reteste:() => { const datas = `<ul class="pl-datas"><li><span>Reteste da sessão 6</span><b>${d.reteste6 ? maDataBR(d.reteste6) : 'a definir'}</b></li><li><span>Reteste da sessão 12</span><b>${d.reteste12 ? maDataBR(d.reteste12) : 'a definir'}</b></li></ul>`;
      const g = MA_PLANO_TESTES.map(t => maRetesteHTML(MA_BASE[t], H[t], MA_BASE[t].NOME)).join('');
      return datas + (g || '<p class="pl-vazio">O gráfico de antes e agora aparece depois do primeiro reteste.</p>'); },
    ciencia:() => `<p class="pl-txt"><b>${maEsc(PL_CIENCIA)}</b></p>` + (p.ciente_em ? `<p class="pl-aceito">Aceito por ${maEsc(p.ciente_nome || '')} em ${maDataBR(p.ciente_em)}.</p>` : `<p class="pl-vazio">${op.publico ? 'Confirme logo abaixo que você leu e está de acordo.' : 'Ainda não confirmado pelo cliente.'}</p>`)
  };
  return corpo[k] ? corpo[k]() : null;
}
function plVerHTML(p, H, op){
  const d = p.dados || {}, vazio = '<p class="pl-vazio">A definir com quem te atende.</p>';
  const txt = k => String(d[k] || '').trim() ? `<p class="pl-txt">${plTexto(d[k])}</p>` : vazio;
  return PL_CAMPOS.map(c => { const b = plBloco(c.k, p, H, op);
    return `<section class="pl-campo"><h3><span class="pl-n">${c.n}</span>${maEsc(c.t)}</h3>${c.d ? `<p class="pl-desc">${maEsc(c.d)}</p>` : ''}${b != null ? b : txt(c.k)}</section>`; }).join('');
}
