/* ============================================================================
   ORIENTAÇÃO GUIADA da Área da terapeuta (Teste de Travas).
   Um botão abre um menu de roteiros; cada roteiro mostra uma seta e um cartão em cada passo.
   O módulo só OBSERVA a tela (DOM) e nunca mexe na lógica do teste: a cada instante ele olha
   em que ponto a pessoa está e aponta o próximo passo que falta. Se ela clicar em outro lugar,
   a seta se acerta sozinha. Nunca lê a senha (só conta quantos caracteres foram digitados).

   Por enquanto só aparece na página do Mauricio (?t=mauricio) ou com ?guia=1 no endereço.
   O botão fica já na capa, antes do login: a primeira pergunta é "terapeuta ou paciente?".
   Roteiros do terapeuta: entrar, criar código, mandar pelo WhatsApp, gerar a apresentação
   (e, dentro do gerador, uma orientação campo a campo). Roteiro do paciente: fazer o teste.
   ============================================================================ */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var SLUG = (Q.get('t') || '').toLowerCase();
  var COM_FLAG = Q.get('guia') === '1';
  if (SLUG !== 'mauricio' && !COM_FLAG) return;

  var guardaSessao = function (k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* sem armazenamento: segue sem lembrar */ } return null; };
  if (COM_FLAG) guardaSessao('guia_travas', '1');

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var visivel = function (el) { return !!el && el.getClientRects().length > 0; };
  var tem = function (el, c) { return !!el && el.classList.contains(c); };

  /* ---------- como está a tela agora ---------- */
  var telaAtiva = function (id) { return tem($('#' + id), 'ativa'); };
  var logado = function () { return tem($('#painel-admin'), 'ver'); };
  var abaCodigos = function () { return tem($('#aba-codigos'), 'ver'); };
  var abaRespostas = function () { return tem($('#aba-respostas'), 'ver'); };
  var travasEscolhido = function () { var b = $('#alt-teste button[data-v="travas"]'); return !b || tem(b, 'ativa') || !visivel(b); };
  var modoCompartilhado = function () { return tem($('#alt-modo button[data-v="comp"]'), 'ativa'); };
  var listaPronta = function (sel) { var l = $(sel); return !!l && !l.querySelector('.carregando'); };
  var temCodigoNaLista = function () { return !!$('#lista-codigos .linha-item'); };
  var temRespostaNaLista = function () { return !!$('#lista-respostas .linha-item'); };
  var codigoGerado = function () { return !!$('#caixa-codigo .codigo-gerado'); };
  var detalheAberto = function () { var d = $('#detalhe-resposta'); return !!d && d.style.display !== 'none' && visivel(d); };
  var apresentacaoAberta = function () { return !!document.getElementById('ap-frame'); };
  var valor = function (sel) { var e = $(sel); return e ? String(e.value || '') : ''; };
  var digitos = function (sel) { return valor(sel).replace(/\D/g, '').length; };
  /* o gerador de apresentação roda num iframe da mesma origem: dá para ler e apontar os campos dele */
  var quadroAp = function () { var f = document.getElementById('ap-frame'); try { return f && f.contentDocument && f.contentDocument.body ? f.contentDocument : null; } catch (e) { return null; } };
  var $f = function (sel) { var d = quadroAp(); return d ? d.querySelector(sel) : null; };
  var deckAberto = function () { var d = $f('#tela-deck'); return !!d && d.classList.contains('ativo'); };
  var rectDe = function (el) {
    var r = el.getBoundingClientRect(), w = el.ownerDocument && el.ownerDocument.defaultView;
    if (w && w.frameElement) { var o = w.frameElement.getBoundingClientRect(); return { left: r.left + o.left, right: r.right + o.left, top: r.top + o.top, bottom: r.bottom + o.top, width: r.width, height: r.height }; }
    return r;
  };
  var ETAPAS = ['tela-capa', 'tela-orientacao', 'tela-dados1', 'tela-dados2', 'tela-teste', 'tela-resultado', 'tela-obrigada'];
  var etapa = function () { for (var i = 0; i < ETAPAS.length; i++) if (telaAtiva(ETAPAS[i])) return i; return -1; };
  var rotuloCampo = function (cont) { var l = $(cont + ' label, ' + cont + ' .rot'); return l ? l.textContent.replace(/\s+/g, ' ').replace(/\(opcional\)/i, '').trim().replace(/[.:]+$/, '') : ''; };
  var pontua = function (t) { return /[?!]$/.test(t) ? t : t + '.'; };
  var nomeA = function () { return window.T_A || 'a terapeuta'; };
  var rotuloAdmin = function () { var a = $('#link-admin'); return a ? a.textContent.replace(/\s+/g, ' ').trim() : 'Área da terapeuta'; };

  /* ---------- estado ---------- */
  var S = { tour: null, ack: {}, zap: false, zap2: false, semCodigo: undefined, ultimoId: null, ultimoScroll: 0, aberto: false, frameVisto: null, vista: 'raiz' };
  var guardar = function () { guardaSessao('guia_estado', S.tour ? JSON.stringify({ tour: S.tour, ack: S.ack, zap: S.zap, semCodigo: S.semCodigo }) : null); };

  /* quem ainda não tem nenhum código precisa criar um antes de seguir (decidido uma vez e mantido durante o roteiro) */
  function semCodigo() {
    if (S.semCodigo === undefined && logado() && listaPronta('#lista-codigos')) { S.semCodigo = !temCodigoNaLista(); guardar(); }
    return S.semCodigo === undefined ? true : S.semCodigo;
  }
  var criarSe = function (forcar) { return function () { return forcar || semCodigo(); }; };

  /* ---------- passos (cada um diz quando já está feito, para onde apontar e o que falar) ---------- */
  function PASSO_IR_ADMIN() {
    return { id: 'ir-admin', feito: function () { return telaAtiva('tela-admin'); }, alvo: '#link-admin',
      texto: function () { return 'Comece por aqui: toque em <b>“' + rotuloAdmin() + '”</b>. É a porta da sua área, onde você cria códigos e vê as respostas.'; } };
  }
  function PASSO_SENHA() {
    return { id: 'senha', feito: logado,
      alvo: function () { return valor('#campo-senha').length < 4 ? '#campo-senha' : '#btn-senha'; },
      texto: function () {
        var erro = ($('#aviso-senha') || {}).textContent;
        if (erro && erro.trim()) return 'Não deu certo. Confira a senha e tente de novo. É a mesma da sua Área de Membros.';
        return valor('#campo-senha').length < 4
          ? 'Digite aqui a <b>sua senha</b> (a mesma da sua Área de Membros). O ícone de olho mostra o que você digitou. Eu não vejo a sua senha.'
          : 'Agora toque em <b>Entrar</b>.';
      } };
  }
  function PASSO_TESTE() {
    return { id: 'teste', so: function () { return logado(); }, feito: travasEscolhido, alvo: '#alt-teste button[data-v="travas"]',
      texto: 'Confirme que está em <b>Teste de Travas Mentais</b>. Toque nele.' };
  }
  function PASSO_ABA_CODIGOS() {
    return { id: 'aba-codigos', fixo: true, feito: abaCodigos, alvo: '#aba-codigos-btn',
      texto: 'Toque em <b>Códigos de acesso</b>. É aqui que cada pessoa ganha o código para fazer o teste.' };
  }
  function PASSOS_CRIAR(forcar, completo) {
    var so = criarSe(forcar);
    var lista = [
      Object.assign(PASSO_ABA_CODIGOS(), { so: so }),
      { id: 'individual', fixo: true, so: function () { return so() && modoCompartilhado(); }, feito: function () { return !modoCompartilhado(); }, alvo: '#alt-modo button[data-v="uni"]',
        texto: 'Escolha <b>Individual</b>: um código para uma pessoa.' },
      { id: 'nome', so: so, manual: true, alvo: '#cod-nome',
        texto: 'Escreva o <b>nome</b> de quem vai fazer o teste. É opcional, mas ajuda a reconhecer o resultado depois. Escreveu? Toque em <b>Próximo</b>.' },
      { id: 'whats', so: so, manual: true, alvo: '#cod-whats',
        texto: 'Coloque o <b>WhatsApp da pessoa</b>, com DDD. Com o número, o botão de envio já abre a conversa com o link e a mensagem prontos. Toque em <b>Próximo</b> quando terminar.' }
    ];
    if (completo) {
      lista.push(
        { id: 'resultado', so: so, manual: true, alvo: '#alt-resultado',
          texto: 'Aqui você decide se a pessoa <b>vê o resultado</b> no final ou se só você vê. Se só você vê, ela recebe um agradecimento e você apresenta o resultado na conversa.' },
        { id: 'urgencia', so: so, manual: true, alvo: '#alt-urgencia',
          texto: 'O <b>cronômetro de 60 segundos</b> no final convida a pessoa a falar com você no WhatsApp assim que termina. Pode deixar ligado.' },
        { id: 'modo', so: so, manual: true, alvo: '#alt-modo',
          texto: '<b>Individual</b>: um código para uma pessoa. <b>Mesmo código</b>: um único link para várias pessoas (bom para divulgar). Para o primeiro, deixe em Individual.' }
      );
    }
    lista.push({ id: 'gerar', fixo: true, so: so, feito: codigoGerado, alvo: '#btn-gerar',
      texto: 'Agora toque em <b>Gerar código</b>.' });
    return lista;
  }
  function PASSO_ZAP(forcar) {
    return { id: 'zap', so: criarSe(forcar), feito: function () { return S.zap; }, alvo: '#caixa-codigo .btn-zap',
      texto: 'Pronto, o código foi criado! Toque no <b>botão verde</b>: o WhatsApp abre com o link e a mensagem acolhedora já escritos. É só enviar. Se preferir, use os botões de copiar logo abaixo.' };
  }

  function montarPassos(tour) {
    var base = [PASSO_IR_ADMIN(), PASSO_SENHA()];
    if (tour === 'entrar') return base.concat([
      { id: 'boas-vindas', manual: true, alvo: '#alt-teste',
        texto: 'Você entrou! Aqui em cima escolhe o teste. Logo abaixo ficam as abas <b>Respostas</b> (o que as pessoas responderam) e <b>Códigos de acesso</b> (onde você cria os códigos).' }]);
    if (tour === 'codigo') return base.concat([PASSO_TESTE()], PASSOS_CRIAR(true, true));
    if (tour === 'whats') return base.concat([PASSO_TESTE()], PASSOS_CRIAR(true, false), [PASSO_ZAP(true)]);
    if (tour === 'apres') return base.concat([PASSO_TESTE()], PASSOS_CRIAR(false, false), [PASSO_ZAP(false),
      { id: 'resposta', feito: function () { return temRespostaNaLista(); },
        alvo: function () { return abaRespostas() ? '#lista-respostas' : '.abas button[data-aba="respostas"]'; },
        texto: 'Falta a <b>resposta de alguém</b>: a apresentação nasce do resultado de uma pessoa. Quando ela terminar o teste, a resposta aparece na aba <b>Respostas</b>. Se já terminou, toque em <b>Atualizar</b>.',
        botoes: [{ t: 'Atualizar', fn: function () { if (typeof window.carregarRespostas === 'function') window.carregarRespostas(); } }] },
      { id: 'aba-resp', feito: abaRespostas, alvo: '.abas button[data-aba="respostas"]', texto: 'Toque em <b>Respostas</b>.' },
      { id: 'abrir', feito: detalheAberto, alvo: '#lista-respostas .linha-item', texto: 'Toque na <b>resposta da pessoa</b> para abrir o resultado completo.' },
      { id: 'apres', feito: apresentacaoAberta, alvo: '#btn-apresentacao',
        texto: 'Toque em <b>Gerar apresentação</b>: o sistema monta a proposta de acompanhamento a partir do resultado dela.' },
      ]);
    if (tour === 'paciente') return PASSOS_PACIENTE();
    if (tour === 'apresform') return PASSOS_APRESFORM();
    return base;
  }

  /* ---------- roteiro do paciente: acompanha a pessoa pelas telas do teste ---------- */
  function primeiroVazio(lista) {
    for (var i = 0; i < lista.length; i++) {
      var e = $('#' + lista[i][0]); if (!e || !visivel(e)) continue;
      if (e.type === 'checkbox' ? !e.checked : !String(e.value || '').trim()) return lista[i];
    }
    return null;
  }
  var CAMPOS1 = [['campo-nome', '#c-nome'], ['campo-idade', '#c-idade'], ['campo-genero', '#c-genero'], ['campo-whats', '#c-whats'], ['campo-email', '#c-email'], ['campo-profissao', '#c-profissao'], ['campo-renda', '#c-renda']];
  var CAMPOS2 = [['campo-motivo', '#c-motivo'], ['campo-dor', '#c-dor'], ['campo-olhar', '#c-olhar'], ['campo-consent', '#c-consent']];
  function PASSOS_PACIENTE() {
    var depois = function (n) { return function () { return etapa() > n; }; };
    return [
      { id: 'p-codigo', feito: depois(0),
        alvo: function () { var b = $('#btn-entrar'); return b && !b.disabled ? '#btn-entrar' : '#campo-codigo'; },
        texto: function () {
          var b = $('#btn-entrar'), aviso = (($('#aviso-codigo') || {}).textContent || '').trim();
          if (aviso) return aviso + ' Confira o código com ' + nomeA() + ' e tente de novo.';
          return b && !b.disabled ? 'Ótimo! Agora toque em <b>Entrar</b>.'
            : 'Digite aqui o <b>código</b> que ' + nomeA() + ' te enviou (algo como <b>AB-0000</b>). Cada código abre o teste uma única vez.';
        } },
      { id: 'p-orient', feito: depois(1), alvo: '#btn-orient',
        texto: 'Aqui você vê <b>como o teste funciona</b>: leva cerca de 7 minutos, a escala vai de 1 a 10 e não existe resposta certa. Leia com calma e toque em <b>Entendi, vamos começar</b>.' },
      { id: 'p-dados1', feito: depois(2),
        alvo: function () { var f = primeiroVazio(CAMPOS1); return f ? f[1] : '#btn-etapa1'; },
        texto: function () {
          var f = primeiroVazio(CAMPOS1);
          return f ? 'Preencha: <b>' + rotuloCampo(f[1]) + '</b> ' + '(todos os campos desta etapa são obrigatórios).' : 'Tudo preenchido! Toque em <b>Continuar</b>.';
        } },
      { id: 'p-dados2', feito: depois(3),
        alvo: function () { var f = primeiroVazio(CAMPOS2); return f ? f[1] : '#btn-etapa2'; },
        texto: function () {
          var f = primeiroVazio(CAMPOS2);
          if (!f) return 'Pronto! Toque em <b>Continuar</b> para começar as perguntas.';
          return f[0] === 'campo-consent' ? 'Leia e marque a <b>autorização</b> para ' + nomeA() + ' ver o seu resultado.' : 'Escreva à vontade: <b>' + rotuloCampo(f[1]) + '</b> Pode ser com as suas palavras, sem filtro.';
        } },
      { id: 'p-teste', feito: depois(4), alvo: '#regua', setaBaixo: true,
        texto: 'Responda pensando em <b>HOJE</b>: toque na nota de <b>1 a 10</b> (1 = não representa nada, 10 = representa muito). Não existe resposta certa: vá no primeiro impulso. Para corrigir, use <b>Pergunta anterior</b>.' },
      { id: 'p-mapa', manual: true, alvo: '#qtd-alta',
        texto: 'Este é o <b>seu mapa em números</b>: quantas travas estão altas (prioridade), médias (atenção) e baixas (os seus pontos fortes).' },
      { id: 'p-barras', manual: true, alvo: '#barras',
        texto: 'Aqui estão as <b>suas 10 travas</b>, da mais forte para a mais leve. Mais abaixo, o texto explica o que cada uma faz com você.' },
      { id: 'p-enviar', feito: function () { return S.zap2 || etapa() >= 6; }, alvo: '#btn-zap-resultado',
        texto: function () { return 'Toque aqui para <b>enviar o seu resultado para ' + nomeA() + '</b> pelo WhatsApp. É a partir dele que vocês vão conversar.'; } }
    ];
  }

  /* ---------- orientação DENTRO do gerador de apresentação (campo a campo) ---------- */
  function PASSOS_APRESFORM() {
    var P = function (id, alvo, texto, extra) { return Object.assign({ id: id, dentro: true, manual: true, alvo: alvo, texto: texto }, extra || {}); };
    return [
      { id: 'af-intro', manual: true, centro: true, manualT: 'Vamos',
        texto: 'Agora você vai receber uma <b>orientação para montar uma apresentação de alta performance</b>: a proposta nasce do resultado da pessoa, usa as palavras dela e mostra com clareza o valor do acompanhamento. Quer que eu te guie, campo a campo?',
        botoes: [{ t: 'Agora não', fn: function () { encerrar(); } }] },
      P('af-quem', '#ap-quem', 'Aqui está <b>de quem é a apresentação</b>. Vem preenchido com o resultado da pessoa: confira se é ela mesma. Tudo o que aparece (travas, notas e pontos de atenção) vem do teste dela.'),
      P('af-pacote', '#f-pacote', 'Dê um <b>nome curto e claro</b> ao acompanhamento, que fale do resultado que a pessoa quer. Ex.: “Jornada Destrava 12”.'),
      P('af-desc', '#f-desc', '<b>Descreva o acompanhamento</b> com as palavras dela, não as da técnica. Uma ideia por linha: cada linha vira um item na apresentação.'),
      P('af-sessoes', '#f-freq', 'Defina <b>quantas sessões, a duração e a frequência</b>. Quando o caminho está claro, a pessoa consegue se imaginar nele.'),
      P('af-incluso', '#i-sess', 'Marque <b>tudo o que o pacote entrega</b> e coloque o valor de cada item. É isso que mostra, na apresentação, o quanto o pacote vale. Item sem valor aparece como “incluso”.'),
      P('af-final', '#f-final', 'Digite o <b>valor final do pacote</b> à vista, um número redondo (ex.: 1.500). Logo abaixo você vê a <b>prévia</b> de como ele aparece na apresentação.'),
      P('af-pagto', '#p-pix', 'Marque as <b>formas de pagamento</b> que você aceita. Condições claras tiram a dúvida na hora de decidir.'),
      P('af-validade', '#f-validade', 'Se existir uma <b>data limite</b> para a condição, informe. Só coloque prazo que seja verdadeiro: a pessoa confia em quem cumpre o que diz.'),
      P('af-mostrar', '#f-mostrar', 'Prefere falar de valores <b>só na conversa</b>? Desmarque aqui e a apresentação sai sem as páginas de valor.'),
      P('af-voce', '#f-nome', '<b>Sobre você</b>: o seu nome, WhatsApp e como você se apresenta. A pessoa fecha com quem ela confia, então conte também a sua história em poucas linhas.'),
      P('af-ouvi', '#f-ouvi', 'O passo que mais faz diferença: <b>o que você ouviu dela</b>, o que ela quer alcançar e o que mais pesa na decisão. Escreva com as palavras dela: é isso que deixa a apresentação com a cara da pessoa.'),
      P('af-cores', '#paletas', 'Escolha a <b>aparência</b>: as cores da apresentação.'),
      { id: 'af-gerar', dentro: true, feito: deckAberto, alvo: '#b-gerar',
        texto: 'Tudo pronto! Toque em <b>Gerar apresentação</b>. Dica: antes, use <b>Salvar como meu padrão</b> para não digitar tudo de novo na próxima vez.' }
    ];
  }

  var FIM = {
    entrar: { t: 'Pronto, você já sabe entrar na sua área. 🎉', prox: 'codigo', proxT: 'Criar um código' },
    codigo: { t: 'Código criado! 🎉 Cada código abre o teste uma única vez, e ele fica salvo em <b>Códigos criados</b>, logo abaixo.', prox: 'whats', proxT: 'Mandar pelo WhatsApp' },
    whats: { t: 'Link enviado! 🎉 Quando a pessoa terminar, o resultado chega na aba <b>Respostas</b>. De lá você gera a apresentação.', prox: 'apres', proxT: 'Gerar a apresentação' },
    apres: { t: 'Gerador aberto! 🎉', auto: 'apresform' },
    apresform: { t: 'Apresentação pronta! 🎉 Toque nas laterais (ou use as setas do teclado) para avançar, e gire o celular para ver maior. Para refazer esta orientação, use o botão <b>🧭 Orientar a apresentação</b>.', prox: null },
    paciente: { t: 'Pronto! 🎉 Você chegou ao fim. Obrigado por responder com sinceridade: agora vocês conversam a partir do seu resultado.', prox: null }
  };
  var TELAS = { paciente: ETAPAS, apresform: ['tela-admin'] };
  var telasDe = function (t) { return TELAS[t] || ['tela-admin', 'tela-capa']; };
  var MENU_RAIZ = [
    { id: '@terapeuta', i: '🩺', t: 'Sou terapeuta', s: 'Entrar, criar códigos, enviar e gerar a apresentação' },
    { id: 'paciente', i: '🙋', t: 'Sou paciente', s: 'Como fazer o teste, passo a passo' }
  ];
  var MENU = [
    { id: 'entrar', i: '🔑', t: 'Entrar na minha área', s: 'Abrir a área e fazer o login' },
    { id: 'codigo', i: '🆕', t: 'Criar um código de acesso', s: 'O código que a pessoa usa para fazer o teste' },
    { id: 'whats', i: '💬', t: 'Mandar o código pelo WhatsApp', s: 'Enviar o link com a mensagem pronta' },
    { id: 'apres', i: '📊', t: 'Ver o resultado e gerar a apresentação', s: 'Transformar a resposta em proposta de acompanhamento' }
  ];

  /* ---------- peças da tela ---------- */
  var raiz, foco, seta, card, menu, botao;
  var SETA_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 4h14v20h9L24 44 8 24h9z" fill="#FFC93C" stroke="#152D2E" stroke-width="3" stroke-linejoin="round"/></svg>';

  function montar() {
    botao = document.createElement('button');
    botao.id = 'guia-abrir'; botao.type = 'button'; botao.innerHTML = '🧭 Orientação guiada';
    botao.addEventListener('click', function () { if (apresentacaoAberta()) iniciar('apresform'); else abrirMenu(); });
    document.body.appendChild(botao);

    raiz = document.createElement('div'); raiz.id = 'guia-raiz'; raiz.hidden = true;
    foco = document.createElement('div'); foco.id = 'guia-foco';
    seta = document.createElement('div'); seta.id = 'guia-seta'; seta.innerHTML = SETA_SVG;
    card = document.createElement('div'); card.id = 'guia-card'; card.className = 'baixo'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-live', 'polite');
    raiz.appendChild(foco); raiz.appendChild(seta); raiz.appendChild(card);
    document.body.appendChild(raiz);

    menu = document.createElement('div'); menu.id = 'guia-menu'; menu.setAttribute('role', 'dialog');
    var mw = document.createElement('div'); mw.id = 'guia-menu-raiz'; mw.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none';
    mw.hidden = true; mw.appendChild(menu); document.body.appendChild(mw);
    menu.addEventListener('click', function (e) {
      var op = e.target.closest && e.target.closest('.guia-op');
      if (op) { if (op.dataset.tour === '@terapeuta') desenharMenu('terapeuta'); else iniciar(op.dataset.tour); return; }
      if (e.target.closest && e.target.closest('.guia-volta')) { desenharMenu('raiz'); return; }
      if (e.target.closest && e.target.closest('.guia-x')) fecharMenu();
    });
    menu.style.display = 'none';

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (S.aberto) fecharMenu(); else if (S.tour) encerrar(); } });
    /* o toque no botão verde do WhatsApp conta como "mandei" */
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      if (e.target.closest('.btn-zap')) { S.zap = true; guardar(); }
      if (e.target.closest('#btn-zap-resultado, #btn-zap-obrigada')) S.zap2 = true;          // paciente: enviou o resultado
    }, true);
    /* o botão da aba "Códigos de acesso" não tem id: marca para a seta achar */
    var ab = $('.abas button[data-aba="codigos"]'); if (ab) ab.id = 'aba-codigos-btn';
  }

  function desenharMenu(vista) {
    var terap = vista === 'terapeuta', lista = terap ? MENU : MENU_RAIZ;
    menu.innerHTML = '<div class="guia-topo"><h2>' + (terap ? 'Orientação para terapeutas' : 'Orientação guiada') + '</h2><button type="button" class="guia-x" aria-label="Fechar">×</button></div>' +
      '<p class="sub">' + (terap ? 'O que você quer aprender agora? Eu te mostro passo a passo, com uma seta.' : 'Para te orientar melhor: você é terapeuta ou paciente?') + '</p>' +
      lista.map(function (m) { return '<button type="button" class="guia-op" data-tour="' + m.id + '"><span class="i">' + m.i + '</span><span><b>' + m.t + '</b><small>' + m.s + '</small></span></button>'; }).join('') +
      (terap ? '<button type="button" class="guia-btn fraco guia-volta">← Voltar</button>' : '');
  }
  function abrirMenu(vista) { desenharMenu(vista === 'terapeuta' ? 'terapeuta' : 'raiz'); S.aberto = true; $('#guia-menu-raiz').hidden = false; menu.style.display = 'block'; botao.classList.remove('ver'); raiz.hidden = true; }
  function fecharMenu() { S.aberto = false; $('#guia-menu-raiz').hidden = true; menu.style.display = 'none'; }

  function iniciar(tour) {
    fecharMenu(); botao.classList.remove('ver');
    S.tour = tour; S.ack = {}; S.zap = false; S.zap2 = false; S.semCodigo = undefined; S.ultimoId = null; ultimoHTML = ''; guardar();
    if (tour === 'codigo' || tour === 'whats' || tour === 'apres') { var c = $('#caixa-codigo'); if (c) c.innerHTML = ''; }      // cada roteiro de código começa pedindo um código novo
    raiz.hidden = false;
  }
  function encerrar() { S.tour = null; S.ack = {}; guardar(); raiz.hidden = true; atualizarBotao(); }

  /* ---------- o passo da vez ---------- */
  function resolver(p) { if (!p) return null; var s = typeof p.alvo === 'function' ? p.alvo() : p.alvo; return s ? (p.dentro ? $f(s) : $(s)) : null; }
  function textoDe(p) { return typeof p.texto === 'function' ? p.texto() : p.texto; }

  function passoAtual() {
    var todos = montarPassos(S.tour).filter(function (p) { return !p.so || p.so(); });
    for (var i = 0; i < todos.length; i++) {
      var p = todos[i];
      if (S.ack[p.id]) continue;
      if (p.feito && p.feito()) { if (p.fixo) { S.ack[p.id] = true; guardar(); } continue; }      // passos "fixos" não voltam se a pessoa mudar de aba
      return { p: p, n: i + 1, total: todos.length };
    }
    return { p: null, n: todos.length, total: todos.length };
  }

  function botoesHTML(info) {
    var h = '';
    if (info.p) {
      if (info.p.manual) h += '<button type="button" class="guia-btn" data-g="proximo">' + (info.p.manualT || (info.p.centro ? 'Entendi' : 'Próximo')) + '</button>';
      (info.p.botoes || []).forEach(function (b, i) { h += '<button type="button" class="guia-btn sec" data-g="extra" data-i="' + i + '">' + b.t + '</button>'; });
      h += '<button type="button" class="guia-btn fraco" data-g="menu">Outro assunto</button>';
    } else {
      var f = FIM[S.tour] || {};
      if (f.prox) h += '<button type="button" class="guia-btn" data-g="seguir">' + f.proxT + '</button>';
      h += '<button type="button" class="guia-btn ' + (f.prox ? 'sec' : '') + '" data-g="menu">Voltar ao menu</button><button type="button" class="guia-btn fraco" data-g="fechar">Fechar</button>';
    }
    return h;
  }

  var ultimoHTML = '';
  function desenharCartao(info) {
    var topo = info.p ? 'Passo ' + info.n + ' de ' + info.total : 'Concluído';
    var txt = info.p ? textoDe(info.p) : (FIM[S.tour] || {}).t;
    var html = '<div class="guia-topo"><span class="guia-passo">' + topo + '</span><button type="button" class="guia-x" data-g="fechar" aria-label="Fechar a orientação">×</button></div>' +
      '<p class="guia-txt">' + txt + '</p><div class="guia-acoes">' + botoesHTML(info) + '</div>';
    if (html !== ultimoHTML) { card.innerHTML = html; ultimoHTML = html; }
  }

  function posicionar(el, centro, baixo) {
    if (!el || centro || !visivel(el)) { foco.className = 'sem'; seta.className = 'sem'; card.className = 'baixo'; return; }
    var r = rectDe(el), pad = 6, W = window.innerWidth, H = window.innerHeight;
    foco.className = '';
    foco.style.left = (r.left - pad) + 'px'; foco.style.top = (r.top - pad) + 'px';
    foco.style.width = (r.width + pad * 2) + 'px'; foco.style.height = (r.height + pad * 2) + 'px';
    var acima = !baixo && r.top - pad - 50 >= 8;
    seta.className = acima ? '' : 'sobe';
    seta.style.left = Math.max(6, Math.min(W - 52, r.left + r.width / 2 - 23)) + 'px';
    seta.style.top = (acima ? r.top - pad - 50 : r.bottom + pad + 4) + 'px';
    /* o cartão fica do lado oposto ao elemento, para nunca cobri-lo */
    card.className = (r.top + r.height / 2 > H * 0.55) ? 'cima' : 'baixo';
  }

  function passarPara(el, id) {
    var agora = Date.now();
    var rr = el && rectDe(el), fora = rr && (rr.bottom < 60 || rr.top > window.innerHeight - 140);
    if (el && visivel(el) && (id !== S.ultimoId || (fora && agora - S.ultimoScroll > 1200))) {
      var dist = Math.abs(rr.top - window.innerHeight / 2);        // longe (página comprida): vai direto; perto: rola suave
      try { el.scrollIntoView({ block: 'center', behavior: (id !== S.ultimoId && dist < window.innerHeight * 1.5) ? 'smooth' : 'auto' }); } catch (e) { el.scrollIntoView(); }
      S.ultimoScroll = agora;
    }
    S.ultimoId = id;
  }

  /* ---------- laço principal ---------- */
  var tNum = 0;
  function laco(ts) {
    requestAnimationFrame(laco);
    var fr = document.getElementById('ap-frame');
    /* o gerador de apresentação abriu sozinho (por qualquer caminho): oferece a orientação uma vez por abertura */
    if (fr && fr !== S.frameVisto && !S.aberto && (!S.tour || S.tour === 'apres')) { S.frameVisto = fr; iniciar('apresform'); }
    if (S.tour === 'apresform' && !fr) { encerrar(); return; }
    var naTela = telasDe(S.tour).some(telaAtiva);
    if (!S.tour) { atualizarBotao(); return; }
    if (!naTela) { raiz.hidden = true; return; }              // fez outra coisa: pausa
    raiz.hidden = false;
    if (ts - tNum < 120 && card.innerHTML) { posicionar(resolver(ultimoPasso), ultimoCentro, ultimoPasso && ultimoPasso.setaBaixo); return; }
    tNum = ts;
    var info = passoAtual();
    ultimoPasso = info.p; ultimoCentro = !info.p || !!info.p.centro;
    desenharCartao(info);
    var el = resolver(info.p);
    if (info.p && !ultimoCentro) passarPara(el, info.p.id);
    posicionar(el, ultimoCentro, info.p && info.p.setaBaixo);
  }
  var ultimoPasso = null, ultimoCentro = true;

  function atualizarBotao() {
    var ap = apresentacaoAberta();
    var deveVer = !S.aberto && !S.tour && (ap || telaAtiva('tela-admin') || telaAtiva('tela-capa'));
    botao.classList.toggle('ver', !!deveVer); botao.classList.toggle('topo', ap);
    var rot = ap ? '🧭 Orientar a apresentação' : '🧭 Orientação guiada';
    if (botao.textContent !== rot) botao.textContent = rot;
  }

  var pronto = function (fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); };
  pronto(function () {
    montar();
    card.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-g]'); if (!b) return;
      var g = b.dataset.g, info = S.tour ? passoAtual() : null;
      if (g === 'proximo' && info && info.p) { S.ack[info.p.id] = true; guardar(); ultimoHTML = ''; }
      else if (g === 'extra' && info && info.p) { var x = (info.p.botoes || [])[+b.dataset.i]; if (x) x.fn(); }
      else if (g === 'menu') { encerrar(); abrirMenu(); }
      else if (g === 'seguir') { iniciar((FIM[S.tour] || {}).prox); }
      else if (g === 'fechar') { encerrar(); }
    });
    /* depois de recarregar a página no meio de um roteiro, continua de onde estava */
    try { var salvo = JSON.parse(guardaSessao('guia_estado') || 'null'); if (salvo && salvo.tour && FIM[salvo.tour]) { S.tour = salvo.tour; S.ack = salvo.ack || {}; S.zap = !!salvo.zap; S.semCodigo = salvo.semCodigo; } } catch (e) { /* estado ilegível: ignora */ }
    requestAnimationFrame(laco);
  });
})();
