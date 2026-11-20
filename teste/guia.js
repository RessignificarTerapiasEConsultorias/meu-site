/* ============================================================================
   ORIENTAÇÃO GUIADA da Área da terapeuta (Teste de Travas).
   Um botão abre um menu de roteiros; cada roteiro mostra uma seta e um cartão em cada passo.
   O módulo só OBSERVA a tela (DOM) e nunca mexe na lógica do teste: a cada instante ele olha
   em que ponto a pessoa está e aponta o próximo passo que falta. Se ela clicar em outro lugar,
   a seta se acerta sozinha. Nunca lê a senha (só conta quantos caracteres foram digitados).

   Vale para o Teste de Travas de TODAS as terapeutas (a página precisa oferecer o teste "travas").
   Não aparece nos outros testes (Traços, MPCC, DISC, Ansiedade, Travas em Família).
   Na capa o botão só aparece na página inicial (sem código no endereço): quem chega por código individual não vê nada.
   Links de campanha (estratégia de tráfego, "mesmo código") saem com &guia=paciente: quem entra por eles
   recebe a orientação do paciente automaticamente, em qualquer página de terapeuta. Código individual e
   página inicial não ganham nada novo.
   O botão fica já na capa, antes do login: a primeira pergunta é "terapeuta ou paciente?".
   Roteiros do terapeuta: entrar, criar código, mandar pelo WhatsApp, gerar a apresentação
   (e, dentro do gerador, uma orientação campo a campo). Roteiro do paciente: fazer o teste.
   ============================================================================ */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var SLUG = (Q.get('t') || '').toLowerCase();
  var COM_FLAG = Q.get('guia') === '1';
  var SO_PACIENTE = Q.get('guia') === 'paciente' && !COM_FLAG;          // veio por um link de campanha: só o roteiro do paciente
  /* outros testes usam os mesmos arquivos: o endereço deles traz ct, mp, dc, an ou f */
  if (['ct', 'mp', 'dc', 'an', 'f'].some(function (k) { return Q.get(k); })) return;
  var COM_CODIGO = !!(Q.get('c') || Q.get('codigo') || Q.get('code'));

  var guardaSessao = function (k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* sem armazenamento: segue sem lembrar */ } return null; };
  if (COM_FLAG) guardaSessao('guia_travas', '1');

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var visivel = function (el) { return !!el && el.getClientRects().length > 0; };
  var tem = function (el, c) { return !!el && el.classList.contains(c); };

  /* a página da terapeuta precisa oferecer o Teste de Travas (dados da página vêm de travas_pagina_publica) */
  var paginaTravas = function () { var T = window.__T; if (!T || !T.dados) return false; var ts = T.dados.testes; return !ts || ts.indexOf('travas') >= 0; };

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
  var CAMP_ETAPAS = ['tela-camp', 'tela-camp-dados', 'tela-teste', 'tela-camp-perfil', 'tela-resultado', 'tela-obrigada'];
  var etapaDe = function (lista) { for (var i = 0; i < lista.length; i++) if (telaAtiva(lista[i])) return i; return -1; };
  var etapa = function () { return etapaDe(ETAPAS); };
  var etapaC = function () { return etapaDe(CAMP_ETAPAS); };
  var rotuloDe = function (id) { var e = $('#' + id), c = e && e.closest('.campo'), l = c && c.querySelector('label'); return l ? l.textContent.replace(/\s+/g, ' ').replace(/\(opcional\)/i, '').trim().replace(/[.:]+$/, '') : ''; };
  var tourPaciente = function () { return window.CAMP && window.CAMP.ativo ? 'paciente-camp' : 'paciente'; };
  var rotuloCampo = function (cont) { var l = $(cont + ' label, ' + cont + ' .rot'); return l ? l.textContent.replace(/\s+/g, ' ').replace(/\(opcional\)/i, '').trim().replace(/[.:]+$/, '') : ''; };
  var pontua = function (t) { return /[?!]$/.test(t) ? t : t + '.'; };
  var nomeA = function () { return window.T_A || 'a terapeuta'; };
  var rotuloAdmin = function () { var a = $('#link-admin'); return a ? a.textContent.replace(/\s+/g, ' ').trim() : 'Área da terapeuta'; };

  /* ---------- estado ---------- */
  var S = { tour: null, ack: {}, zap: false, zap2: false, semCodigo: undefined, ultimoId: null, ultimoScroll: 0, aberto: false, frameVisto: null, vista: 'raiz', aviso: null };
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
    if (tour === 'paciente-camp') return PASSOS_PACIENTE_CAMP();
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
      { id: 'p-mapa', so: function () { return etapa() <= 5; }, manual: true, alvo: '#qtd-alta',
        texto: 'Este é o <b>seu mapa em números</b>: quantas travas estão altas (prioridade), médias (atenção) e baixas (os seus pontos fortes).' },
      { id: 'p-barras', so: function () { return etapa() <= 5; }, manual: true, alvo: '#barras',
        texto: 'Aqui estão as <b>suas 10 travas</b>, da mais forte para a mais leve. Mais abaixo, o texto explica o que cada uma faz com você.' },
      { id: 'p-enviar', so: function () { return etapa() <= 5; }, feito: function () { return S.zap2 || etapa() >= 6; }, alvo: '#btn-zap-resultado',
        texto: function () { return 'Toque aqui para <b>enviar o seu resultado para ' + nomeA() + '</b> pelo WhatsApp. É a partir dele que vocês vão conversar.'; } }
    ];
  }

  /* paciente que entrou por um link de campanha: telas próprias (começar, nome e WhatsApp, perguntas, perfil, resultado) */
  var CAMPOS_C1 = [['camp-nome'], ['camp-zap']], CAMPOS_C2 = [['camp-idade'], ['camp-genero']];
  function PASSOS_PACIENTE_CAMP() {
    var depois = function (n) { return function () { return etapaC() > n; }; };
    var quando = function () { return etapaC() <= 4; };
    return [
      { id: 'c-comecar', feito: depois(0), alvo: '#camp-comecar',
        texto: function () { return 'Toque em <b>Começar meu teste gratuito</b>. Leva cerca de 7 minutos e só ' + nomeA() + ' vê as suas respostas.'; } },
      { id: 'c-dados', feito: depois(1),
        alvo: function () { var f = primeiroVazio(CAMPOS_C1); return f ? '#' + f[0] : '#camp-ir'; },
        texto: function () {
          var f = primeiroVazio(CAMPOS_C1), e = ($('#camp-erro') || {}).textContent;
          if (e && e.trim()) return e.trim();
          return f ? 'Preencha: <b>' + rotuloDe(f[0]) + '</b> (é para ' + nomeA() + ' saber de quem é o resultado).' : 'Tudo certo! Toque em <b>Começar as perguntas</b>.';
        } },
      { id: 'c-teste', feito: depois(2), alvo: '#regua', setaBaixo: true,
        texto: 'Responda pensando em <b>HOJE</b>: toque na nota de <b>1 a 10</b> (1 = não representa nada, 10 = representa muito). Não existe resposta certa: vá no primeiro impulso. Para corrigir, use <b>Pergunta anterior</b>.' },
      { id: 'c-perfil', feito: depois(3),
        alvo: function () { var f = primeiroVazio(CAMPOS_C2); return f ? '#' + f[0] : '#camp-enviar'; },
        texto: function () {
          var f = primeiroVazio(CAMPOS_C2);
          return f ? 'Falta só um passo: <b>' + rotuloDe(f[0]) + '</b>. Os campos de “o que pesa” e e-mail são opcionais.'
            : 'Pronto! Se quiser, conte o que mais tem pesado (é opcional). Depois toque no botão para ' + (($('#camp-enviar') || {}).textContent || 'enviar').trim().toLowerCase() + '.';
        } },
      { id: 'p-mapa', so: quando, manual: true, alvo: '#qtd-alta',
        texto: 'Este é o <b>seu mapa em números</b>: quantas travas estão altas (prioridade), médias (atenção) e baixas (os seus pontos fortes).' },
      { id: 'p-barras', so: quando, manual: true, alvo: '#barras',
        texto: 'Aqui estão as <b>suas 10 travas</b>, da mais forte para a mais leve. Mais abaixo, o texto explica o que cada uma faz com você.' },
      { id: 'p-enviar', so: quando, feito: function () { return S.zap2 || etapaC() >= 5; }, alvo: '#btn-zap-resultado',
        texto: function () { return 'Toque aqui para <b>enviar o seu resultado para ' + nomeA() + '</b> pelo WhatsApp. É a partir dele que vocês vão conversar.'; } }
    ];
  }

  /* ---------- orientação DENTRO do gerador de apresentação (campo a campo) ---------- */
  var numF = function (sel) { var e = $f(sel); return e ? parseFloat(String(e.value).replace(',', '.')) || 0 : 0; };
  var checadoF = function (sel) { var e = $f(sel); return !!e && e.checked; };
  /* o gerador só deixa gerar com: (1) quantidade de sessões e (2) valor do contato por WhatsApp, se essa opção estiver marcada */
  function pendencias() {
    var out = [], sel = $f('input[name="sess"]:checked');
    if (!sel || (sel.value === 'x' && !(parseInt(($f('#f-sess-outro') || {}).value, 10) > 0)))
      out.push({ alvo: sel ? '#f-sess-outro' : '#chips-sessoes', msg: 'quantas sessões terá o pacote' });
    if (checadoF('#i-whats') && !(numF('#v-whats') > 0))
      out.push({ alvo: '#v-whats', msg: 'o valor do contato por WhatsApp (ou desmarque essa opção)' });
    return out;
  }
  function PASSOS_APRESFORM() {
    var P = function (id, alvo, texto, extra) { return Object.assign({ id: id, dentro: true, manual: true, alvo: alvo, texto: texto }, extra || {}); };
    return [
      { id: 'af-intro', manual: true, centro: true, manualT: 'Vamos',
        texto: 'Agora você vai receber uma <b>orientação para montar uma apresentação de alta performance</b>: a proposta nasce do resultado da pessoa, usa as palavras dela e mostra com clareza o valor do acompanhamento. <br><br>Dois itens são <span class="guia-req">OBRIGATÓRIOS</span> para gerar: <b>a quantidade de sessões</b> e <b>o valor do contato por WhatsApp</b>. Eu te aviso quando chegarmos neles. Quer que eu te guie, campo a campo?',
        botoes: [{ t: 'Agora não', fn: function () { encerrar(); } }] },
      P('af-quem', '#ap-quem', 'Aqui está <b>de quem é a apresentação</b>. Vem preenchido com o resultado da pessoa: confira se é ela mesma. Tudo o que aparece (travas, notas e pontos de atenção) vem do teste dela.'),
      P('af-pacote', '#f-pacote', 'Dê um <b>nome curto e claro</b> ao acompanhamento, que fale do resultado que a pessoa quer. Ex.: “Jornada Destrava 12”.'),
      P('af-desc', '#f-desc', '<b>Descreva o acompanhamento</b> com as palavras dela, não as da técnica. Uma ideia por linha: cada linha vira um item na apresentação.'),
      P('af-sessoes', '#chips-sessoes', '<span class="guia-req">OBRIGATÓRIO</span> Escolha <b>quantas sessões</b> terá o pacote. Sem isso a apresentação não é gerada. Se não for nenhuma das opções, toque em <b>Outro</b> e digite o número.',
        { exige: function () { var x = pendencias().filter(function (q) { return /sessões/.test(q.msg); }); return !x.length; }, exigeMsg: 'Digite quantas sessões terá o pacote para continuar.',
          alvo: function () { var sel = $f('input[name="sess"]:checked'); return sel && sel.value === 'x' ? '#f-sess-outro' : '#chips-sessoes'; } }),
      P('af-freq', '#f-freq', 'Defina <b>a duração e a frequência</b> das sessões. Quando o caminho está claro, a pessoa consegue se imaginar nele.'),
      P('af-avulsa', '#f-avulsa', 'Quanto vale <b>uma sessão avulsa</b>? Com esse valor o sistema calcula o <b>valor de referência</b> do pacote e mostra quanto a pessoa economiza. É recomendado (se ficar em branco, essa comparação não aparece).'),
      P('af-whats', '#v-whats', '<span class="guia-req">OBRIGATÓRIO</span> <b>Contato por WhatsApp durante a semana</b> é um trabalho à parte, então ele precisa de um <b>valor</b> (ex.: 150) e, em <b>Como funciona</b>, a explicação (ex.: dias úteis, até 18h). <b>Sem o valor, a apresentação não é gerada.</b> Se você não oferece esse contato, desmarque a opção.',
        { exige: function () { return !checadoF('#i-whats') || numF('#v-whats') > 0; }, exigeMsg: 'Coloque o valor do contato por WhatsApp, ou toque em “Não ofereço este contato”.',
          botoes: [{ t: 'Não ofereço este contato', fn: function () { var c = $f('#i-whats'); if (c && c.checked) c.click(); S.ack['af-whats'] = true; guardar(); ultimoHTML = ''; } }] }),
      P('af-incluso', '#i-testes', 'Marque <b>o que mais o pacote entrega</b> e coloque o valor de cada item (ex.: o valor de cada aplicação do teste). É isso que mostra o quanto o pacote vale. Item sem valor aparece como “incluso” e o sistema pergunta antes de gerar.'),
      P('af-final', '#f-final', 'Digite o <b>valor final do pacote</b> à vista, um número redondo (ex.: 1.500). Logo abaixo você vê a <b>prévia</b> de como ele aparece na apresentação.'),
      P('af-pagto', '#p-pix', 'Marque as <b>formas de pagamento</b> que você aceita. Condições claras tiram a dúvida na hora de decidir.'),
      P('af-validade', '#f-validade', 'Se existir uma <b>data limite</b> para a condição, informe. Só coloque prazo que seja verdadeiro: a pessoa confia em quem cumpre o que diz.'),
      P('af-mostrar', '#f-mostrar', 'Prefere falar de valores <b>só na conversa</b>? Desmarque aqui e a apresentação sai sem as páginas de valor.'),
      P('af-voce', '#f-nome', '<b>Sobre você</b>: o seu nome, WhatsApp e como você se apresenta. A pessoa fecha com quem ela confia, então conte também a sua história em poucas linhas.'),
      P('af-ouvi', '#f-ouvi', 'O passo que mais faz diferença: <b>o que você ouviu dela</b>, o que ela quer alcançar e o que mais pesa na decisão. Escreva com as palavras dela: é isso que deixa a apresentação com a cara da pessoa.'),
      P('af-cores', '#paletas', 'Escolha a <b>aparência</b>: as cores da apresentação.'),
      { id: 'af-gerar', dentro: true, feito: deckAberto,
        alvo: function () { var f = pendencias(); return f.length ? f[0].alvo : '#b-gerar'; },
        texto: function () {
          var f = pendencias();
          if (f.length) return '<span class="guia-req">FALTA</span> Para gerar, ainda preciso de: <b>' + f.map(function (q) { return q.msg; }).join('</b> e <b>') + '</b>. Preencha aqui e eu sigo.';
          return '✔ Tudo o que é obrigatório está preenchido. Toque em <b>Gerar apresentação</b>. Se o sistema perguntar sobre itens sem valor ou sobre o valor final, responda como preferir. Dica: antes, use <b>Salvar como meu padrão</b> para não digitar tudo de novo.';
        } }
    ];
  }

  var FIM = {
    entrar: { t: 'Pronto, você já sabe entrar na sua área. 🎉', prox: 'codigo', proxT: 'Criar um código' },
    codigo: { t: 'Código criado! 🎉 Cada código abre o teste uma única vez, e ele fica salvo em <b>Códigos criados</b>, logo abaixo.', prox: 'whats', proxT: 'Mandar pelo WhatsApp' },
    whats: { t: 'Link enviado! 🎉 Quando a pessoa terminar, o resultado chega na aba <b>Respostas</b>. De lá você gera a apresentação.', prox: 'apres', proxT: 'Gerar a apresentação' },
    apres: { t: 'Gerador aberto! 🎉', auto: 'apresform' },
    apresform: { t: 'Apresentação pronta! 🎉 Toque nas laterais (ou use as setas do teclado) para avançar, e gire o celular para ver maior. Para refazer esta orientação, use o botão <b>🧭 Orientar a apresentação</b>.', prox: null },
    paciente: { t: 'Pronto! 🎉 Você chegou ao fim. Obrigado por responder com sinceridade: agora vocês conversam a partir do seu resultado.', prox: null },
    'paciente-camp': { t: 'Pronto! 🎉 Você chegou ao fim. Obrigado por responder com sinceridade: agora vocês conversam a partir do seu resultado.', prox: null }
  };
  var TELAS = { paciente: ETAPAS, 'paciente-camp': CAMP_ETAPAS, apresform: ['tela-admin'] };
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
    botao.addEventListener('click', function () { if (apresentacaoAberta()) iniciar('apresform'); else if (SO_PACIENTE) iniciar(tourPaciente()); else abrirMenu(); });
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
      if (op) { if (op.dataset.tour === '@terapeuta') desenharMenu('terapeuta'); else iniciar(op.dataset.tour === 'paciente' ? tourPaciente() : op.dataset.tour); return; }
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
  function encerrar() { S.tour = null; S.ack = {}; guardar(); raiz.hidden = true; if (SO_PACIENTE) guardaSessao('guia_pac_fechado', '1'); atualizarBotao(); }

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
      if (!SO_PACIENTE) h += '<button type="button" class="guia-btn fraco" data-g="menu">Outro assunto</button>';
    } else {
      var f = FIM[S.tour] || {};
      if (f.prox) h += '<button type="button" class="guia-btn" data-g="seguir">' + f.proxT + '</button>';
      if (!SO_PACIENTE) h += '<button type="button" class="guia-btn ' + (f.prox ? 'sec' : '') + '" data-g="menu">Voltar ao menu</button>';
      h += '<button type="button" class="guia-btn ' + (SO_PACIENTE ? '' : 'fraco') + '" data-g="fechar">Fechar</button>';
    }
    return h;
  }

  var ultimoHTML = '';
  function desenharCartao(info) {
    var topo = info.p ? 'Passo ' + info.n + ' de ' + info.total : 'Concluído';
    var txt = info.p ? textoDe(info.p) : (FIM[S.tour] || {}).t;
    if (info.p && info.p.exige && S.aviso === info.p.id && !info.p.exige()) txt += '<br><span class="guia-erro">⚠ ' + info.p.exigeMsg + '</span>';
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
    /* cartão alto (ex.: com aviso) cobrindo o campo: rola a página só o necessário para o campo ficar livre */
    var agora = Date.now();
    if (agora - (S.ajuste || 0) > 350) {
      var cr = card.getBoundingClientRect(), dy = 0;
      if (card.className === 'baixo' && r.bottom + pad + 12 > cr.top) dy = r.bottom + pad + 16 - cr.top;
      else if (card.className === 'cima' && r.top - pad - 56 < cr.bottom) dy = -(cr.bottom + 60 - (r.top - pad));
      if (Math.abs(dy) > 4) { S.ajuste = agora; try { (el.ownerDocument.defaultView || window).scrollBy(0, dy); } catch (e) { /* sem rolagem */ } }
    }
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
    if (fr && fr !== S.frameVisto && !S.aberto && paginaTravas() && (!S.tour || S.tour === 'apres')) { S.frameVisto = fr; iniciar('apresform'); }
    if (S.tour === 'apresform' && !fr) { encerrar(); return; }
    /* link de campanha: começa sozinho assim que a tela de abertura aparece (uma vez por visita) */
    if (SO_PACIENTE && !S.autoPac && !S.tour && !S.aberto && paginaTravas()) {
      S.t0 = S.t0 || Date.now();
      var camp = window.CAMP && window.CAMP.ativo && telaAtiva('tela-camp'), normal = telaAtiva('tela-capa') && window.T_A && Date.now() - S.t0 > 6000;
      if (camp || normal) { S.autoPac = true; if (!guardaSessao('guia_pac_fechado')) iniciar(camp ? 'paciente-camp' : 'paciente'); }
    }
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
    var capaOk = telaAtiva('tela-capa') && (!COM_CODIGO || COM_FLAG);                // código individual no endereço: sem botão na capa
    var deveVer = paginaTravas() && !S.aberto && !S.tour && (SO_PACIENTE ? ETAPAS.concat(CAMP_ETAPAS).some(telaAtiva) : (ap || telaAtiva('tela-admin') || capaOk));
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
      if (g === 'proximo' && info && info.p) {
        if (info.p.exige && !info.p.exige()) { S.aviso = info.p.id; ultimoHTML = ''; }            // obrigatório ainda não preenchido: não deixa passar
        else { S.ack[info.p.id] = true; S.aviso = null; guardar(); ultimoHTML = ''; }
      }
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
