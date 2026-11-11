/* ============================================================================
   DISC · ANÁLISE COMPORTAMENTAL (núcleo, sem dependências)
   Ressignificar Terapias & Consultorias

   Uso no navegador: <script src="/teste/disc-nucleo.js"></script>  ->  window.DISC
   Uso no Node:      const DISC = require('./disc-nucleo.js')

   1. DADOS      DISC.FATORES (D, I, S, C) e DISC.BLOCOS (24 blocos de escolha forçada, 4 opções cada)
   2. ALGORITMO  DISC.calcular(respostas) -> perfis Adaptado, Natural e Resultante (0 a 100%)
   3. LAUDO      DISC.laudo(fator) -> { resumo, areas, lideranca, ... }
   4. GRÁFICOS   DISC.graficos(caixa, calc) -> 3 gráficos de barras com a linha de 50% + radar (Chart.js)

   Ferramenta de análise comportamental para o ambiente corporativo (seleção, desenvolvimento de equipes,
   liderança e vendas). NÃO é instrumento terapêutico, teste psicológico nem diagnóstico.

   Formato de uma resposta (um item por bloco, na ordem dos blocos):
     { bloco: 1, mais: 0..3, menos: 0..3 }   // índices das opções do bloco; "mais" e "menos" diferentes
   ============================================================================ */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.DISC = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------------------------------------------------------- 1. DADOS */
  const FATORES = {
    D: { letra: 'D', nome: 'Dominância', curto: 'Dominância', cor: '#C0392B', claro: '#F6D5D1',
         eixo: 'Como enfrenta problemas e desafios', palavras: 'decisão, resultado, desafio, comando' },
    I: { letra: 'I', nome: 'Influência', curto: 'Influência', cor: '#E0A100', claro: '#FBEFC8',
         eixo: 'Como se relaciona e convence pessoas', palavras: 'comunicação, entusiasmo, persuasão, conexão' },
    S: { letra: 'S', nome: 'Estabilidade', curto: 'Estabilidade', cor: '#2E8B57', claro: '#D3EEDF',
         eixo: 'Como lida com ritmo, mudança e rotina', palavras: 'constância, cooperação, paciência, lealdade' },
    C: { letra: 'C', nome: 'Conformidade', curto: 'Conformidade', cor: '#1F5FA8', claro: '#D3E2F4',
         eixo: 'Como lida com regras, padrões e detalhes', palavras: 'precisão, análise, qualidade, método' }
  };
  const ORDEM = ['D', 'I', 'S', 'C'];

  /* Cada bloco tem exatamente um adjetivo de cada fator. A posição do fator muda de bloco para bloco,
     para que a pessoa não perceba um padrão. Estrutura JSON de um bloco:
       { "n": 1, "opcoes": [ { "t": "Decidido(a)", "f": "D" }, { "t": "Comunicativo(a)", "f": "I" }, ... ] } */
  const PALAVRAS = {
    D: ['Decidido(a)', 'Direto(a)', 'Competitivo(a)', 'Ousado(a)', 'Determinado(a)', 'Assertivo(a)', 'Exigente', 'Independente',
        'Firme', 'Desafiador(a)', 'Objetivo(a)', 'Corajoso(a)', 'Focado(a) em resultados', 'Enérgico(a)', 'Pioneiro(a)', 'Ambicioso(a)',
        'Franco(a)', 'Gosto de comandar', 'Ajo rápido', 'Aceito riscos', 'Autoconfiante', 'Insistente', 'Vigoroso(a)', 'Dominante'],
    I: ['Comunicativo(a)', 'Entusiasmado(a)', 'Persuasivo(a)', 'Sociável', 'Otimista', 'Expressivo(a)', 'Inspirador(a)', 'Carismático(a)',
        'Espontâneo(a)', 'Animado(a)', 'Convincente', 'Extrovertido(a)', 'Divertido(a)', 'Criativo(a)', 'Popular', 'Falante',
        'Influente', 'Envolvente', 'Motivador(a)', 'Bem-humorado(a)', 'Articulado(a)', 'Gosto de novidades', 'Encantador(a)', 'Faço amigos fácil'],
    S: ['Paciente', 'Calmo(a)', 'Leal', 'Prestativo(a)', 'Constante', 'Bom ouvinte', 'Cooperativo(a)', 'Tranquilo(a)',
        'Confiável', 'Tolerante', 'Gentil', 'Estável', 'Conciliador(a)', 'Sereno(a)', 'Atencioso(a)', 'Moderado(a)',
        'Equilibrado(a)', 'Acolhedor(a)', 'Colaborativo(a)', 'Compreensivo(a)', 'Dedicado(a)', 'Gosto de rotina', 'Previsível', 'Apoiador(a)'],
    C: ['Cuidadoso(a)', 'Preciso(a)', 'Analítico(a)', 'Organizado(a)', 'Detalhista', 'Disciplinado(a)', 'Cauteloso(a)', 'Criterioso(a)',
        'Lógico(a)', 'Sistemático(a)', 'Perfeccionista', 'Rigoroso(a)', 'Exato(a)', 'Planejador(a)', 'Reservado(a)', 'Diplomático(a)',
        'Correto(a)', 'Metódico(a)', 'Investigativo(a)', 'Prudente', 'Racional', 'Pontual', 'Ponderado(a)', 'Sigo as regras']
  };
  const POSICOES = ['DISC', 'SCDI', 'ICSD', 'CDIS', 'DSIC', 'IDCS', 'SCID', 'CSDI'];
  const BLOCOS = PALAVRAS.D.map((_, i) => ({
    n: i + 1,
    opcoes: POSICOES[i % POSICOES.length].split('').map(f => ({ t: PALAVRAS[f][i], f }))
  }));

  /* ------------------------------------------------------------ 2. ALGORITMO */
  /* Escala: cada fator aparece uma vez em cada um dos 24 blocos. Quem escolhe ao acaso marca cada fator
     em média 6 vezes (24 ÷ 4), com desvio de cerca de 2,1. Essa média vira 50% (a linha do meio do gráfico):
     cada escolha acima da média soma ~7 pontos; abaixo, tira ~7 pontos. Limites: 0% e 100%. */
  const MEDIA = 6, PASSO = 15 / Math.sqrt(24 * 0.25 * 0.75);   // 15 pontos por desvio padrão = 7,07 por escolha
  const pct = x => Math.max(0, Math.min(100, Math.round(50 + (x - MEDIA) * PASSO)));

  /* confere as 24 respostas; devolve '' quando está tudo certo ou a mensagem do problema */
  function validar(respostas) {
    if (!Array.isArray(respostas) || respostas.length !== BLOCOS.length) return 'É preciso responder os ' + BLOCOS.length + ' blocos.';
    for (let i = 0; i < BLOCOS.length; i++) {
      const r = respostas[i] || {};
      const ok = k => Number.isInteger(r[k]) && r[k] >= 0 && r[k] <= 3;
      if (!ok('mais') || !ok('menos')) return 'Falta marcar o MAIS e o MENOS no bloco ' + (i + 1) + '.';
      if (r.mais === r.menos) return 'No bloco ' + (i + 1) + ', o MAIS e o MENOS precisam ser palavras diferentes.';
    }
    return '';
  }

  /* recebe as 24 respostas e devolve os três perfis
     - Adaptado (máscara, como age no trabalho): conta as escolhas MAIS (+) de cada fator
     - Natural (essência, sob pressão): conta as rejeições MENOS (-) e inverte: quem rejeita menos um fator pontua mais nele
       (6 rejeições = média = 50%; 0 rejeições = 92%; 12 ou mais = 8% ou menos)
     - Resultante: média entre Adaptado e Natural */
  function calcular(respostas) {
    const erro = validar(respostas);
    if (erro) throw new Error(erro);
    const mais = { D: 0, I: 0, S: 0, C: 0 }, menos = { D: 0, I: 0, S: 0, C: 0 };
    respostas.forEach((r, i) => {
      const ops = BLOCOS[i].opcoes;
      mais[ops[r.mais].f]++;
      menos[ops[r.menos].f]++;
    });
    const adaptado = {}, natural = {}, resultante = {};
    ORDEM.forEach(f => {
      adaptado[f] = pct(mais[f]);
      natural[f] = pct(2 * MEDIA - menos[f]);           // inversão: 12 - rejeições
      resultante[f] = Math.round((adaptado[f] + natural[f]) / 2);
    });
    /* pico primário e secundário pelo perfil Resultante (empate: Natural, depois a ordem D, I, S, C) */
    const ord = ORDEM.slice().sort((a, b) => resultante[b] - resultante[a] || natural[b] - natural[a] || ORDEM.indexOf(a) - ORDEM.indexOf(b));
    const altos = ord.filter(f => resultante[f] >= 50);
    const estilo = (altos.length ? altos.slice(0, 2) : [ord[0]]).join('');   // ex.: "DI", "S", "CS"
    /* diferença entre máscara e essência: o quanto a pessoa se adapta ao ambiente (média das diferenças) */
    const adaptacao = Math.round(ORDEM.reduce((s, f) => s + Math.abs(adaptado[f] - natural[f]), 0) / 4);
    return { versao: 1, contagem: { mais, menos }, adaptado, natural, resultante, ordem: ord,
             pico: ord[0], secundario: ord[1], estilo, adaptacao };
  }

  /* recalcula a partir do registro salvo ({ respostas:[...] }) ou usa os números guardados */
  function deRegistro(d) {
    d = d || {};
    if (Array.isArray(d.respostas) && !validar(d.respostas)) return calcular(d.respostas);
    const r = d.resultante || {}, a = d.adaptado || {}, n = d.natural || {};
    const ord = ORDEM.slice().sort((x, y) => (r[y] || 0) - (r[x] || 0));
    return { versao: d.versao || 1, contagem: d.contagem || null, adaptado: a, natural: n, resultante: r, ordem: ord,
             pico: d.pico || ord[0], secundario: d.secundario || ord[1], estilo: d.estilo || ord[0], adaptacao: d.adaptacao || 0 };
  }

  /* ---------------------------------------------------------------- 3. LAUDO */
  const LAUDOS = {
    D: {
      titulo: 'Executor(a) · Dominância',
      resumo: 'Perfil movido a desafios e resultados. Decide rápido, assume riscos calculados e gosta de ter autonomia e controle sobre o que entrega. Rende muito em metas agressivas, prazos curtos e situações de crise, quando alguém precisa tomar a frente.',
      areas: ['Vendas agressivas e prospecção (Hunter)', 'Liderança de crise e de virada (turnaround)', 'Abertura de novos mercados e negócios', 'Gestão de metas e operações sob pressão'],
      lideranca: 'Diretiva e orientada a resultados: define o rumo, cobra metas com clareza e decide sob pressão. Para crescer, precisa ouvir mais a equipe, explicar o porquê das decisões e cuidar do clima.',
      fortes: ['Iniciativa e senso de urgência', 'Foco em metas e números', 'Coragem para decidir e assumir riscos'],
      atencao: ['Impaciência com ritmos mais lentos', 'Pode atropelar pessoas e processos', 'Dificuldade em delegar sem controlar'],
      comunicar: 'Seja direto(a) e objetivo(a): fale de resultado, prazo e autonomia. Evite rodeios e excesso de detalhes.',
      motiva: 'Desafios, metas ousadas, autonomia, reconhecimento por resultado.'
    },
    I: {
      titulo: 'Comunicador(a) · Influência',
      resumo: 'Perfil movido a pessoas e reconhecimento. Comunica com entusiasmo, cria conexão rápido e convence pela emoção e pelo carisma. Rende muito em ambientes de relacionamento, negociação e trabalho em grupo.',
      areas: ['Relacionamento com clientes e parcerias', 'Vendas complexas e consultivas', 'Recursos Humanos, treinamento e cultura', 'Marketing, eventos e comunicação'],
      lideranca: 'Inspiradora e participativa: mobiliza a equipe pelo entusiasmo, valoriza as pessoas e cria clima positivo. Para crescer, precisa de mais método, acompanhamento de metas e foco nos detalhes.',
      fortes: ['Comunicação e persuasão', 'Networking e empatia', 'Energia para engajar pessoas'],
      atencao: ['Pode prometer mais do que entrega', 'Perde o foco em tarefas longas e detalhadas', 'Evita conflitos e conversas duras'],
      comunicar: 'Seja caloroso(a) e aberto(a): converse, dê espaço para ideias e reconheça em público. Registre por escrito os combinados.',
      motiva: 'Reconhecimento, liberdade para se expressar, trabalho com pessoas, ambiente leve.'
    },
    S: {
      titulo: 'Planejador(a) · Estabilidade',
      resumo: 'Perfil movido a segurança e cooperação. Constante, paciente e leal, sustenta a rotina com qualidade e cuida bem de clientes e colegas. Rende muito em processos contínuos, atendimento de longo prazo e trabalho em equipe.',
      areas: ['Sucesso do cliente (Customer Success) e pós-venda', 'Operações e processos contínuos', 'Rotinas administrativas e de suporte', 'Atendimento e relacionamento de longo prazo'],
      lideranca: 'Apoiadora e estável: escuta, dá segurança e mantém o time unido e constante. Para crescer, precisa se posicionar mais, aceitar mudanças com mais rapidez e cobrar com firmeza quando preciso.',
      fortes: ['Constância e confiabilidade', 'Escuta e paciência', 'Trabalho em equipe e lealdade'],
      atencao: ['Resistência a mudanças bruscas', 'Dificuldade em dizer não', 'Ritmo mais lento em decisões'],
      comunicar: 'Seja calmo(a) e previsível: antecipe mudanças, explique o passo a passo e dê tempo para se adaptar.',
      motiva: 'Segurança, ambiente harmonioso, papéis claros, reconhecimento pela lealdade.'
    },
    C: {
      titulo: 'Analista · Conformidade',
      resumo: 'Perfil movido a qualidade e precisão. Analítico, organizado e criterioso, gosta de regras claras, dados e trabalho bem feito. Rende muito em funções técnicas, de controle e de análise, onde o erro custa caro.',
      areas: ['Administração e controles internos', 'Finanças, contabilidade e planejamento', 'Tecnologia, dados e engenharia', 'Qualidade, processos e compliance'],
      lideranca: 'Técnica e criteriosa: lidera pelo exemplo, por padrões claros e por decisões baseadas em dados. Para crescer, precisa ser mais flexível, decidir com informação incompleta e cuidar da comunicação com as pessoas.',
      fortes: ['Precisão e qualidade', 'Análise e planejamento', 'Disciplina e organização'],
      atencao: ['Perfeccionismo que atrasa entregas', 'Críticas excessivas, a si e aos outros', 'Desconforto com improviso e risco'],
      comunicar: 'Seja preciso(a) e lógico(a): traga dados, prazos e critérios por escrito. Evite pressão sem justificativa.',
      motiva: 'Padrões claros, tempo para fazer bem feito, reconhecimento pela qualidade, autonomia técnica.'
    }
  };

  /* função pedida: recebe o fator dominante e devolve o JSON curto do laudo */
  function laudo(fator) {
    const L = LAUDOS[String(fator || '').toUpperCase()];
    if (!L) throw new Error('Fator inválido: use D, I, S ou C.');
    return { 'Resumo do Perfil': L.resumo, 'Áreas Recomendadas': L.areas.slice(), 'Estilo de Liderança': L.lideranca };
  }
  /* laudo completo (pico primário + secundário), usado na tela e no PDF */
  function laudoCompleto(calc) {
    const p = LAUDOS[calc.pico], s = LAUDOS[calc.secundario];
    const intensidade = v => v >= 80 ? 'muito alto' : v >= 65 ? 'alto' : v >= 50 ? 'moderadamente alto' : v >= 35 ? 'moderadamente baixo' : 'baixo';
    const dif = calc.adaptacao;
    return {
      pico: calc.pico, secundario: calc.secundario, estilo: calc.estilo, titulo: p.titulo,
      ...laudo(calc.pico),
      detalhe: { fortes: p.fortes, atencao: p.atencao, comunicar: p.comunicar, motiva: p.motiva },
      combinacao: 'O fator principal é ' + FATORES[calc.pico].nome + ' (' + calc.resultante[calc.pico] + '%), apoiado por ' + FATORES[calc.secundario].nome +
        ' (' + calc.resultante[calc.secundario] + '%). Na prática, isso soma ' + p.fortes[0].toLowerCase() + ' com ' + s.fortes[0].toLowerCase() + '.',
      fatores: ORDEM.map(f => ({ fator: f, nome: FATORES[f].nome, valor: calc.resultante[f], nivel: calc.resultante[f] >= 50 ? 'Alto' : 'Baixo', intensidade: intensidade(calc.resultante[f]) })),
      adaptacao: dif >= 25 ? 'Há uma diferença grande entre o perfil Adaptado e o Natural (' + dif + ' pontos em média): no trabalho, a pessoa está se ajustando bastante ao que o ambiente pede. Vale observar se esse esforço é sustentável.'
               : dif >= 12 ? 'Há uma diferença moderada entre o perfil Adaptado e o Natural (' + dif + ' pontos em média): a pessoa faz alguns ajustes de comportamento no trabalho.'
               : 'O perfil Adaptado e o Natural são parecidos (' + dif + ' pontos em média): no trabalho, a pessoa age de forma próxima ao seu jeito natural.'
    };
  }

  /* ------------------------------------------------------------- 4. GRÁFICOS */
  const CHART_URL = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
  let carregando = null;
  function carregarChart() {
    if (typeof window === 'undefined') return Promise.reject(new Error('sem navegador'));
    if (window.Chart) return Promise.resolve(window.Chart);
    if (!carregando) carregando = new Promise((ok, falha) => {
      const s = document.createElement('script'); s.src = CHART_URL; s.async = true;
      s.onload = () => ok(window.Chart); s.onerror = () => { carregando = null; falha(new Error('Não consegui carregar os gráficos.')); };
      document.head.appendChild(s);
    });
    return carregando;
  }
  /* linha tracejada dos 50% (sem plugin externo) */
  const linhaMedia = {
    id: 'discMedia',
    afterDatasetsDraw(ch) {
      const y = ch.scales.y; if (!y || !ch.options.plugins.discMedia) return;
      const py = y.getPixelForValue(50), c = ch.ctx, a = ch.chartArea;
      c.save(); c.setLineDash([6, 5]); c.strokeStyle = '#5B6475'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(a.left, py); c.lineTo(a.right, py); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#5B6475'; c.font = '600 11px sans-serif'; c.textAlign = 'right'; c.textBaseline = 'bottom';
      const tx = '50% · média', w = c.measureText(tx).width;
      c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(a.right - w - 6, py - 16, w + 6, 14);
      c.fillStyle = '#5B6475'; c.fillText(tx, a.right - 2, py - 3); c.restore();
    }
  };
  /* rótulo do valor em cima de cada barra */
  const rotuloBarra = {
    id: 'discRotulo',
    afterDatasetsDraw(ch) {
      if (!ch.options.plugins.discRotulo) return;
      const c = ch.ctx; c.save(); c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = '#1D2433';
      ch.getDatasetMeta(0).data.forEach((b, i) => { const v = ch.data.datasets[0].data[i]; c.fillText(v + '%', b.x, b.y - 3); });
      c.restore();
    }
  };
  function cfgBarras(titulo, valores, sub, animar, estreito) {
    return {
      type: 'bar',
      data: { labels: ORDEM.map(f => estreito ? f : [f, FATORES[f].curto]),
              datasets: [{ data: ORDEM.map(f => valores[f]), backgroundColor: ORDEM.map(f => valores[f] >= 50 ? FATORES[f].cor : FATORES[f].cor + '80'),
                           borderRadius: 6, maxBarThickness: 46 }] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: animar === false ? false : { duration: 600 },
        layout: { padding: { top: 18 } },
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 25, callback: v => v + '%' }, grid: { color: '#E6E9EF' } },
                  x: { grid: { display: false }, ticks: { font: { weight: '600', size: 11 }, maxRotation: 0, autoSkip: false } } },
        plugins: { legend: { display: false }, discMedia: true, discRotulo: true,
                   title: { display: true, text: titulo, font: { size: 15, weight: '700' }, color: '#1D2433', padding: { bottom: 2 } },
                   subtitle: { display: !!sub, text: sub || '', color: '#5B6475', padding: { bottom: 8 } },
                   tooltip: { callbacks: { label: c => c.parsed.y + '% · ' + (c.parsed.y >= 50 ? 'Alto' : 'Baixo') } } }
      },
      plugins: [linhaMedia, rotuloBarra]
    };
  }
  function cfgRadar(calc, animar, estreito) {
    const ds = (rot, v, cor, fundo, tracejado) => ({ label: rot, data: ORDEM.map(f => v[f]), borderColor: cor, backgroundColor: fundo,
      pointBackgroundColor: cor, borderWidth: 2, borderDash: tracejado ? [5, 4] : [], pointRadius: 3 });
    return {
      type: 'radar',
      data: { labels: ORDEM.map(f => estreito ? f : FATORES[f].nome + ' (' + f + ')'),
              datasets: [ds('Resultante', calc.resultante, '#1D2433', 'rgba(29,36,51,.18)'),
                         ds('Adaptado', calc.adaptado, '#B8913F', 'rgba(184,145,63,.05)', true),
                         ds('Natural', calc.natural, '#4F86A8', 'rgba(79,134,168,.05)', true)] },
      options: { responsive: true, maintainAspectRatio: false, animation: animar === false ? false : { duration: 600 },
                 scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: 'transparent', callback: v => v + '%' },
                                pointLabels: { font: { size: estreito ? 15 : 12, weight: '700' }, color: ORDEM.map(f => FATORES[f].cor) }, grid: { color: '#DDE2EA' } } },
                 plugins: { legend: { position: 'bottom' },
                            title: { display: true, text: 'Intensidade geral nos 4 fatores', font: { size: 15, weight: '700' }, color: '#1D2433' } } }
    };
  }
  const GRAFS = [
    ['adaptado', 'Perfil Adaptado (máscara)', 'Como age no ambiente de trabalho · escolhas MAIS'],
    ['natural', 'Perfil Natural (essência)', 'Como reage sob pressão · rejeições MENOS invertidas'],
    ['resultante', 'Perfil Resultante', 'Média entre o Adaptado e o Natural']
  ];
  /* desenha os 4 gráficos dentro da caixa; devolve as instâncias do Chart.js */
  async function graficos(caixa, calc) {
    const Chart = await carregarChart();
    caixa.innerHTML = '<div class="disc-grafs">' + GRAFS.map(g => '<div class="disc-graf"><canvas data-g="' + g[0] + '" role="img" aria-label="' + g[1] + '"></canvas></div>').join('') +
      '<div class="disc-graf disc-graf-radar"><canvas data-g="radar" role="img" aria-label="Gráfico radar dos 4 fatores"></canvas></div></div>';
    (caixa.__charts || []).forEach(c => c.destroy());
    const larg = sel => { const el = caixa.querySelector(sel); return el ? el.clientWidth : caixa.clientWidth; };
    const estreito = larg('.disc-graf') < 330;
    caixa.__charts = GRAFS.map(g => new Chart(caixa.querySelector('[data-g=' + g[0] + ']'), cfgBarras(g[1], calc[g[0]], g[2], true, estreito)))
      .concat([new Chart(caixa.querySelector('[data-g=radar]'), cfgRadar(calc, true, larg('.disc-graf-radar') < 460))]);
    return caixa.__charts;
  }
  /* as mesmas figuras como imagem (para o PDF) */
  async function imagens(calc) {
    const Chart = await carregarChart();
    const fazer = (cfg, w, h) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.style.width = w + 'px'; cv.style.height = h + 'px';
      const caixa = document.createElement('div'); caixa.style.cssText = 'position:fixed;left:-5000px;top:0;width:' + w + 'px;height:' + h + 'px';
      caixa.appendChild(cv); document.body.appendChild(caixa);
      cfg.options.responsive = false; cfg.options.devicePixelRatio = 2;
      const ch = new Chart(cv, cfg); const url = ch.toBase64Image(); ch.destroy(); caixa.remove(); return url;
    };
    const out = {};
    GRAFS.forEach(g => { out[g[0]] = fazer(cfgBarras(g[1], calc[g[0]], g[2], false), 420, 300); });
    out.radar = fazer(cfgRadar(calc, false), 460, 380);
    return out;
  }

  return { FATORES, ORDEM, BLOCOS, LAUDOS, MEDIA, validar, calcular, deRegistro, laudo, laudoCompleto, graficos, imagens, carregarChart, pct };
});
