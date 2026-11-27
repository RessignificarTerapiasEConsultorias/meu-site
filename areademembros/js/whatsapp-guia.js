/* Guia passo a passo do CRM (piloto): roteiros como dados e funções puras, para testar sem a página.
   O guia só OBSERVA a tela e aponta o próximo passo que falta. Ele nunca toca em botão que envia mensagem ou custa dinheiro.
   Cada roteiro enxerga a tela por um adaptador pequeno ("t"): valor(sel), attr(sel, nome), classe(sel, nome), conta(sel), vazios(sel). */
(function (raiz) {
  "use strict";
  function abaAberta(t, aba) { return t.attr('#abas .aba[data-aba="' + aba + '"]', "aria-selected") === "true"; }
  function etapa(t) { return Number(t.attr("#dpForm .wz-etapa.on", "data-etapa")) || 1; }
  function janela(t, id) { return t.attr("#" + id, "open") !== null; }
  function tam(t, sel, n) { return t.valor(sel).length >= n; }
  function abrir(id, alvo, texto) { return { id: "abrir", alvo: alvo, texto: texto, fica: true, feito: function (t) { return janela(t, id); } }; }
  function continuar(n) {
    return { id: "ir" + n, alvo: "#wzContinuar", texto: 'Toque em "Continuar" para ir à etapa ' + n + ".", feito: function (t) { return etapa(t) >= n; } };
  }

  const ROTEIROS = {
    template: {
      id: "template", aba: "templates", titulo: "Criar uma mensagem modelo (template)",
      fim: 'Pronto. A Meta analisa em minutos ou horas. Acompanhe no filtro "Em análise", no alto desta tela. Quando for aprovado, o template aparece em Disparos.',
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="templates"]', texto: 'Abra "Mensagens modelo" no menu (no celular, toque em "Mais"). É ali que ficam as mensagens modelo, também chamadas de templates.', feito: function (t) { return abaAberta(t, "templates"); } },
        { id: "oque", alvo: ".wa-tp-edit", info: true, texto: "Template é uma mensagem que a Meta aprova antes. Com ele você pode escrever para alguém a qualquer hora, mesmo que a pessoa não tenha falado com você nas últimas 24 horas. Vamos criar um agora, campo por campo." },
        { id: "modelo", alvo: '[data-modelo="aula"]', info: true, opcional: true, texto: "Se quiser, comece por um modelo pronto: toque em um destes botões e os campos se preenchem sozinhos. Para escrever do zero, toque em Próximo." },
        { id: "nome", alvo: "#tcNome", texto: "Dê um nome ao template. Só você e a Meta veem este nome.", exemplo: "aviso_aula_quinta",
          erro: "Espaço, acento ou letra maiúscula: a Meta não aceita. Use _ no lugar do espaço.", feito: function (t) { return /^[a-z0-9_]{3,60}$/.test(t.valor("#tcNome")); } },
        { id: "categoria", alvo: "#tcCat", info: true, texto: "Escolha o tipo. Utilidade é aviso sobre algo que a pessoa já contratou, e custa menos. Marketing é convite, oferta ou divulgação: custa mais, e a Meta limita quantas a mesma pessoa recebe.",
          erro: "Marcar como Utilidade uma mensagem que é propaganda: a Meta troca a categoria ou reprova." },
        { id: "cabecalho", alvo: "#tcCabTipo", info: true, opcional: true, texto: 'O cabeçalho é opcional: um título, uma imagem, um vídeo ou um PDF acima do texto. Se não precisar, deixe em "Sem cabeçalho".' },
        { id: "texto", alvo: "#tcCorpo", texto: "Escreva a mensagem. Onde o texto muda de pessoa para pessoa, ponha {{1}}, {{2}} e assim por diante. Na hora de enviar, você diz o que entra em cada um, como o nome.",
          exemplo: "Oi, {{1}}! Sua aula é na {{2}}. Te espero lá!", erro: "Começar ou terminar a mensagem com {{1}}, ou pôr duas dessas partes coladas: a Meta reprova.",
          feito: function (t) { return t.valor("#tcCorpo").length >= 10; } },
        { id: "exemplos", alvo: "#tcExemplos", texto: "A Meta pede um exemplo para cada parte que muda. Escreva um exemplo de verdade, como um nome e um dia da semana.",
          erro: 'Deixar o exemplo vazio ou escrever só "teste".', quando: function (t) { return t.conta("#tcExemplos input") > 0; }, feito: function (t) { return t.vazios("#tcExemplos input") === 0; } },
        { id: "rodape", alvo: "#tcRodape", info: true, opcional: true, texto: "O rodapé é uma linha pequena no fim da mensagem, opcional. Muita gente põe o nome da empresa." },
        { id: "botoes", alvo: "#tcBotaoSair", info: true, opcional: true, texto: 'Botões são opcionais. Em mensagem de marketing, vale tocar em "Sair da lista": quem não quer mais receber sai com um toque, e isso evita denúncia.' },
        { id: "conferir", alvo: "#tcCheck", info: true, texto: 'Confira como a mensagem vai aparecer no celular e a lista "Antes de enviar". Se algum item apontar problema, corrija antes de seguir.' },
        { id: "enviar", alvo: "#tcEnviar", info: true, manual: "Já enviei", aviso: "Ao tocar neste botão, o template vai para a análise da Meta. Isso não custa nada e não envia mensagem para ninguém.",
          texto: 'Quando estiver tudo certo, toque você em "Enviar para aprovação do Meta". O guia não toca neste botão por você.' }
      ]
    },
    disparo: {
      id: "disparo", aba: "disparos", titulo: "Mandar para várias pessoas (disparo)",
      fim: 'Pronto. O disparo aparece na lista "Disparos", logo abaixo, com a situação, os entregues, os lidos e as falhas. O resultado também entra na Visão geral.',
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="disparos"]', texto: 'Abra "Disparos" no menu (no celular, toque em "Mais"). É ali que se manda a mesma mensagem para várias pessoas.', feito: function (t) { return abaAberta(t, "disparos"); } },
        { id: "modo", alvo: "#wzModo", texto: 'Você está no modo rápido, com tudo numa tela só. Para ser guiado etapa por etapa, toque em "Passo a passo".',
          quando: function (t) { return t.classe("#dpForm", "rapido"); }, feito: function (t) { return !t.classe("#dpForm", "rapido"); } },
        { id: "nome", alvo: "#dpNome", texto: "Dê um nome ao disparo. É só para você reconhecer depois na lista.", exemplo: "Aviso da aula de quinta",
          feito: function (t) { return etapa(t) > 1 || t.valor("#dpNome").length >= 3; } },
        continuar(2),
        { id: "semtemplate", alvo: "#dpTemplate", info: true, trocar: "template", texto: "Você ainda não tem template aprovado, e sem ele não dá para disparar. Crie um primeiro: o outro guia mostra como, campo por campo.",
          quando: function (t) { return etapa(t) === 2 && t.valor("#dpTemplate") === ""; }, feito: function () { return false; } },
        { id: "template", alvo: "#dpTemplate", info: true, texto: "Escolha o template que vai ser enviado. Só aparecem os que a Meta aprovou. Logo abaixo aparecem o tipo e o preço de cada mensagem. A partir daqui o CRM salva um rascunho sozinho enquanto você avança: rascunho não envia nada.",
          feito: function (t) { return etapa(t) > 2; } },
        continuar(3),
        { id: "publico", alvo: "#dpEtiqueta", info: true, texto: 'Escolha para quem vai. "Todos que autorizaram" manda para a lista inteira. Você também pode escolher uma etiqueta ou marcar as pessoas uma a uma. Veja logo abaixo quantas vão receber.',
          erro: "Mandar para todo mundo uma mensagem que só interessa a um grupo: mais gente sai da lista.", feito: function (t) { return etapa(t) > 3; } },
        continuar(4),
        { id: "variaveis", alvo: "#dpVars", info: true, texto: "Este template tem partes que mudam de pessoa para pessoa. Diga aqui o que entra em cada uma. Onde estiver {primeiro_nome}, o CRM troca pelo nome de cada pessoa. Nenhuma pode ficar em branco.",
          quando: function (t) { return t.conta("#dpVars [data-var]") > 0; }, feito: function (t) { return etapa(t) > 4 || t.vazios("#dpVars [data-var]") === 0; } },
        { id: "previa", alvo: "#dpPrev", info: true, texto: "Aqui você vê um exemplo de como a mensagem chega no celular da pessoa. Confira o texto com calma antes de seguir.", feito: function (t) { return etapa(t) > 4; } },
        continuar(5),
        { id: "quando", alvo: "#dpQuando", info: true, texto: "Deixe vazio para enviar agora, ou escolha o dia e a hora. O CRM só envia das 8h às 21h, no horário de Brasília. Fora disso, ele espera o horário abrir.",
          feito: function (t) { return etapa(t) > 5; } },
        continuar(6),
        { id: "conferencia", alvo: "#dpTravas", info: true, texto: "Esta é a conferência antes de enviar: quantas pessoas vão receber, o custo estimado e se há algo impedindo. Leia cada linha.", feito: function (t) { return etapa(t) > 6; } },
        { id: "teste", alvo: "#dpTeste", info: true, opcional: true, aviso: "Este botão envia o template de verdade, mas só para o seu número. É a melhor forma de ver como chega antes de mandar para todos.",
          texto: 'Recomendo tocar em "Enviar teste para mim" e conferir no seu WhatsApp. O guia não toca por você. Depois, toque em Próximo.', feito: function (t) { return etapa(t) > 6; } },
        continuar(7),
        { id: "confirmar", alvo: "#dpCriar", info: true, manual: "Já decidi",
          aviso: 'Atenção: "Criar e iniciar" começa a enviar de verdade para as pessoas escolhidas, e a Meta cobra por mensagem. Se você está só treinando, toque em "Salvar como rascunho": nada é enviado.',
          texto: "Revise o resumo acima. A decisão é sua: o guia nunca toca nestes dois botões." }
      ]
    },
    conectar: {
      id: "conectar", aba: "config", titulo: "Conectar o WhatsApp oficial",
      fim: "Pronto: o WhatsApp oficial está ligado ao CRM. O próximo passo é criar a sua primeira mensagem modelo (template), que também tem guia.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="config"]', texto: 'Abra "Configuração" no menu (no celular, toque em "Mais"). É ali que o CRM se liga ao seu WhatsApp oficial.', feito: function (t) { return abaAberta(t, "config"); } },
        { id: "antes", alvo: "#cfNumId", info: true, texto: "Antes de começar, tenha à mão: 1) uma conta no Meta Business (business.facebook.com); 2) um app no Meta for Developers (developers.facebook.com) com o WhatsApp adicionado; 3) um número de celular que não esteja usando o aplicativo WhatsApp comum. Leva uns 20 minutos.",
          aviso: "Os nomes dos menus do Meta mudam de vez em quando. Se algum não bater, procure pela palavra principal." },
        { id: "numero", alvo: "#cfNumId", texto: 'Cole o ID do número de telefone. Onde achar: developers.facebook.com, "Meus apps", o seu app, WhatsApp, "Configuração da API". Ele aparece como "Identificação do número de telefone".',
          exemplo: "123456789012345", erro: "Colar o número de celular no lugar do ID. O ID tem uns 15 números e não começa com 55.", feito: function (t) { return /^\d{10,20}$/.test(t.valor("#cfNumId")); } },
        { id: "conta", alvo: "#cfWaba", texto: 'Cole o ID da conta do WhatsApp Business. Fica na mesma página, como "Identificação da conta do WhatsApp Business".',
          erro: "Trocar os dois IDs de lugar.", feito: function (t) { return /^\d{10,20}$/.test(t.valor("#cfWaba")); } },
        { id: "token", alvo: "#cfToken", info: true, manual: "Já está salvo", texto: 'Cole o token permanente. Onde gerar: business.facebook.com, "Configurações do negócio", "Usuários", "Usuários do sistema". Crie um usuário Admin, toque em "Gerar token", escolha o seu app, validade "Nunca" e marque whatsapp_business_messaging e whatsapp_business_management. Copie e cole aqui.',
          erro: 'Usar o token da página "Configuração da API": ele vence em 24 horas.', aviso: "O token funciona como uma senha: não mande para ninguém. Depois de salvo, ele some da tela e fica só no servidor.",
          feito: function (t) { return /^EA[A-Za-z0-9]{40,}$/.test(t.valor("#cfToken")); } },
        { id: "segredo", alvo: "#cfSegredo", info: true, manual: "Já está salva", texto: 'Cole a chave secreta do app. Onde achar: developers.facebook.com, o seu app, "Configurações do app", "Básico", "Chave secreta do app", "Mostrar".',
          feito: function (t) { return /^[a-f0-9]{32}$/i.test(t.valor("#cfSegredo")); } },
        { id: "app", alvo: "#cfAppId", info: true, opcional: true, texto: 'O ID do app fica no alto da mesma página ("Configurações do app", "Básico"). Ele é preciso para mandar vídeo, imagem ou PDF de exemplo nos templates.',
          feito: function (t) { return /^\d{8,20}$/.test(t.valor("#cfAppId")); } },
        { id: "salvar", alvo: "#cfSalvar", info: true, manual: "Já salvei", texto: 'Toque em "Salvar".' },
        { id: "testar", alvo: "#cfTestar", texto: 'Toque em "Testar conexão". Se der certo, aparece logo abaixo o seu número e o nome da empresa.',
          erro: "Se aparecer erro, confira se o token tem os dois acessos do WhatsApp e se os IDs não estão trocados.", feito: function (t) { return /21,\s*80,\s*46/.test(t.attr("#cfTesteRes", "style") || ""); } },
        { id: "url", alvo: "#cfUrl", info: true, texto: 'Agora o Meta precisa saber para onde mandar as mensagens que chegam. Toque em "Copiar" ao lado deste endereço. Em developers.facebook.com, abra o seu app, WhatsApp, "Configuração", e em Webhook toque em "Editar". Cole no primeiro campo.' },
        { id: "verificar", alvo: "#cfVerify", info: true, texto: 'Copie este token de verificação e cole no segundo campo da mesma janela do Meta. Toque em "Verificar e salvar".',
          erro: 'Se o Meta disser que não conseguiu verificar, toque em "Testar conexão" aqui no CRM e tente de novo.' },
        { id: "assinar", alvo: "#cfAvisoTpl", info: true, texto: 'Ainda na tela de Webhook do Meta, toque em "Gerenciar" e assine dois campos: messages e message_template_status_update. Sem isso, as mensagens não chegam ao CRM.' },
        { id: "limites", alvo: "#cfLimite", info: true, opcional: true, texto: "Confira o limite de pessoas por dia (250 até o Meta verificar a sua empresa) e os horários de envio. Se mudar algo, toque em \"Salvar limites\"." },
        { id: "conferir", alvo: '#abas .aba[data-aba="conversas"]', info: true, manual: "Chegou", texto: "Para conferir, mande uma mensagem do seu celular pessoal para o número do CRM. Ela deve aparecer em Conversas em poucos segundos." }
      ]
    },
    automacao: {
      id: "automacao", aba: "automacoes", titulo: "Criar uma automação",
      fim: "Pronto. A automação aparece na lista com os números dela: quantos entraram, responderam, compraram e saíram. Dá para desligar a qualquer hora.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="automacoes"]', texto: 'Abra "Automações" no menu (no celular, toque em "Mais").', feito: function (t) { return abaAberta(t, "automacoes"); } },
        { id: "oque", alvo: "#auNova", info: true, texto: "Automação é uma sequência que roda sozinha. Quando algo acontece (a pessoa escreve uma palavra, entra numa lista, compra ou some), o CRM faz os passos que você escolher: mandar mensagem, esperar, pôr etiqueta, mover no funil." },
        abrir("jAutomacao", "#auNova", 'Toque em "Nova automação".'),
        { id: "nome", alvo: "#aeNome", fica: true, texto: "Dê um nome. Só você vê.", exemplo: "Boas-vindas da aula gratuita", feito: function (t) { return tam(t, "#aeNome", 3); } },
        { id: "gatilho", alvo: "#aeGatilho", info: true, fica: true, texto: 'Escolha quando ela começa. Os mais usados: "A pessoa escreve uma palavra ou frase", "A pessoa entra numa lista ou ganha uma etiqueta", "Pediu e não pagou" e "Você mandou e a pessoa não respondeu há N dias".' },
        { id: "campos", alvo: "#aeGatilhoCampos", info: true, fica: true, texto: "Complete o que o gatilho pede. Exemplo: em \"escreve uma palavra\", ponha uma palavra por linha.", exemplo: "AULA",
          quando: function (t) { return t.conta("#aeGatilhoCampos input, #aeGatilhoCampos select, #aeGatilhoCampos textarea") > 0; } },
        { id: "quem", alvo: "#aeCEtiq", info: true, opcional: true, fica: true, texto: "Se quiser, limite quem pode entrar: só quem tem uma etiqueta, só de uma etapa do funil, uma vez só por pessoa. Pode deixar como está." },
        { id: "horario", alvo: "#aeCHoraIni", info: true, opcional: true, fica: true, texto: "Escolha o horário e os dias em que ela pode mandar mensagem. Vazio segue o horário geral do CRM." },
        { id: "cuidados", alvo: "#aeCParar", info: true, fica: true, texto: 'Deixe marcado "Parar a sequência se a pessoa responder". Assim ninguém recebe mensagem automática depois de já estar conversando com você.' },
        { id: "passo", alvo: "#aeAddBtn", fica: true, texto: 'Agora os passos. Escolha "Enviar mensagem" na lista ao lado e toque em "Adicionar passo".', feito: function (t) { return t.conta("#aePassos .au-passo") > 0; } },
        { id: "mensagem", alvo: "#aePassos .au-passo", info: true, fica: true, texto: "Escreva a mensagem do passo. {primeiro_nome} vira o nome da pessoa. Depois de 24 horas sem a pessoa escrever, o WhatsApp só aceita template: escolha no passo o que fazer nesse caso.",
          exemplo: "Oi, {primeiro_nome}! Que bom te ver por aqui. O link da aula chega por aqui no dia." },
        { id: "sequencia", alvo: "#aeAddTipo", info: true, opcional: true, fica: true, texto: 'Quer uma sequência? Adicione "Esperar" (por exemplo, 1 dia) e depois outra mensagem. Também dá para pôr etiqueta, mover no funil ou avisar você.' },
        { id: "salvar", alvo: "#aeSalvar", info: true, manual: "Já salvei", fica: true, texto: 'Toque em "Salvar". A automação nasce desligada: nada é enviado ainda.',
          feito: function (t) { return !janela(t, "jAutomacao") && t.conta('#auLista2 [data-au2="ligar"]') > 0; } },
        { id: "simular", alvo: '#auLista2 [data-au2="simular"]', info: true, texto: 'Na linha da automação que você criou, toque em "Simular". Você vê quem entraria e o que receberia, sem enviar nada.' },
        { id: "testar", alvo: '#auLista2 [data-au2="testar"]', info: true, opcional: true, aviso: "Este botão envia de verdade, mas só para o seu número.", texto: 'Depois toque em "Testar no meu número" e veja como chega no seu WhatsApp.' },
        { id: "ligar", alvo: '#auLista2 [data-au2="ligar"]', info: true, manual: "Já decidi", aviso: "Ligada, a automação manda mensagens de verdade, e o Meta cobra pelas mensagens de template.",
          texto: 'Se estiver tudo certo, toque em "Ligar". O guia não toca neste botão por você.' }
      ]
    },
    robo: {
      id: "robo", aba: "robo", titulo: "Configurar o robô de respostas",
      fim: "Pronto. O robô responde sozinho às palavras que você cadastrou. Quando você responde uma conversa, ele fica 2 horas quieto com aquela pessoa.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="robo"]', texto: 'Abra "Robô" no menu (no celular, toque em "Mais").', feito: function (t) { return abaAberta(t, "robo"); } },
        { id: "oque", alvo: "#rbAtivo", info: true, texto: 'O robô responde sozinho quando a pessoa escreve certas palavras, como "link" ou "preço". Ele só responde até 24 horas depois da última mensagem da pessoa, e fica quieto quando você assume a conversa.' },
        { id: "padrao", alvo: "#rbPadrao", info: true, opcional: true, texto: "Escreva a resposta para quando nenhuma regra servir. Deixe vazio para o robô não responder nesses casos.", exemplo: "Oi, {primeiro_nome}! Recebi sua mensagem e já te respondo." },
        abrir("jRegra", "#rgNova", 'Toque em "Nova regra".'),
        { id: "nome", alvo: "#jrNome", fica: true, texto: "Dê um nome à regra.", exemplo: "Link da aula", feito: function (t) { return tam(t, "#jrNome", 3); } },
        { id: "palavras", alvo: "#jrGatilhos", fica: true, texto: "Escreva as palavras que fazem o robô responder, separadas por vírgula. Sem acento vale igual a com acento.", exemplo: "link, aula, horário", feito: function (t) { return tam(t, "#jrGatilhos", 2); } },
        { id: "modo", alvo: "#jrModo", info: true, fica: true, texto: 'Escolha como comparar. "Tem a palavra ou frase" serve para quase tudo.' },
        { id: "acao", alvo: "#jrAcao", info: true, fica: true, texto: 'Escolha o que fazer. Na maioria das vezes é "Só responder".' },
        { id: "resposta", alvo: "#jrResposta", fica: true, texto: "Escreva a resposta. {primeiro_nome} vira o nome da pessoa.", exemplo: "Oi, {primeiro_nome}! O link da aula chega por aqui no dia, uma hora antes.", feito: function (t) { return tam(t, "#jrResposta", 5); } },
        { id: "salvar", alvo: "#jrSalvar", info: true, manual: "Já salvei", fica: true, texto: 'Toque em "Salvar".', feito: function (t) { return !janela(t, "jRegra"); } },
        { id: "testar", alvo: "#rbTesteTxt", texto: 'Teste sem enviar nada: escreva aqui uma mensagem como a pessoa escreveria e toque em "Testar".', exemplo: "quando sai o link?", feito: function (t) { return t.texto("#rbTesteRes").length > 0; } },
        { id: "ligar", alvo: "#rbAtivo", info: true, manual: "Já decidi", aviso: "Ligado, o robô responde as pessoas de verdade.", texto: 'Se o teste respondeu certo, marque "Robô ligado" e toque em "Salvar".' }
      ]
    },
    contatos: {
      id: "contatos", aba: "contatos", titulo: "Trazer os seus contatos",
      fim: "Pronto. A lista aparece no bloco Listas, e as pessoas aparecem em Contatos. Em Disparos você pode mandar mensagem só para esta lista.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="contatos"]', texto: 'Abra "Contatos" no menu (no celular, toque em "Mais").', feito: function (t) { return abaAberta(t, "contatos"); } },
        { id: "oque", alvo: "#ctImpArq", info: true, texto: "Traga as pessoas que você já atende. Serve uma planilha do Excel, um arquivo CSV ou um PDF com nome e telefone. O CRM acha as colunas sozinho.",
          aviso: "Só diga que a pessoa autorizou se ela realmente aceitou receber mensagens suas. Mandar para quem não pediu gera denúncia, e o Meta pode limitar o seu número." },
        abrir("jLista", "#ctImpArq", 'Toque em "Importar lista de arquivo".'),
        { id: "arquivo", alvo: "#lsArquivo", fica: true, texto: "Escolha o arquivo no seu computador ou celular.", feito: function (t) { return t.valor("#lsArquivo").length > 0; } },
        { id: "nome", alvo: "#lsNome", fica: true, texto: "Dê um nome à lista. Ele vira uma etiqueta, e depois dá para mandar um disparo só para ela.", exemplo: "Alunos 2026", feito: function (t) { return tam(t, "#lsNome", 2); } },
        { id: "ddd", alvo: "#lsDdd", info: true, fica: true, texto: "Confira o DDD padrão. Ele só entra nos números que vieram sem DDD." },
        { id: "aceite", alvo: "#lsAceite", info: true, fica: true, texto: "Marque só se todas as pessoas desta lista autorizaram receber mensagens. Sem a marca, a lista é criada, mas ninguém dela entra em disparos." },
        { id: "previa", alvo: "#lsPrev", info: true, fica: true, texto: "Confira a prévia: quantos números estão certos, quantos foram corrigidos e quantos ficaram de fora.", quando: function (t) { return t.conta("#lsPrev *") > 0; } },
        { id: "criar", alvo: "#lsSalvar", info: true, manual: "Já criei", fica: true, texto: 'Toque em "Criar lista". Isso não envia mensagem para ninguém.' }
      ]
    },
    inscricao: {
      id: "inscricao", aba: "inscricoes", titulo: "Criar uma página de inscrição",
      fim: "Pronto. Na lista de páginas, use o botão do link para copiar o endereço e divulgar no Instagram, no status ou na bio. Quem se inscreve recebe uma mensagem para confirmar.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="inscricoes"]', texto: 'Abra "Inscrições" no menu (no celular, toque em "Mais").', feito: function (t) { return abaAberta(t, "inscricoes"); } },
        { id: "oque", alvo: "#inNova", info: true, texto: "A página de inscrição é um link que você divulga. A pessoa põe nome e WhatsApp, autoriza receber mensagens e entra na sua lista, pronta para disparos." },
        abrir("jInscPagina", "#inNova", 'Toque em "Nova página".'),
        { id: "nome", alvo: "#ipNome", fica: true, texto: "Dê um nome à página. Só você vê.", exemplo: "Aula gratuita de dezembro", feito: function (t) { return tam(t, "#ipNome", 3); } },
        { id: "link", alvo: "#ipSlug", info: true, fica: true, texto: "Este é o final do link. Use palavras curtas, sem espaço e sem acento.", exemplo: "aula-dezembro" },
        { id: "titulo", alvo: "#ipTituloPag", fica: true, texto: "Escreva o título que a pessoa vê no alto da página.", exemplo: "Aula gratuita: como sair do piloto automático", feito: function (t) { return tam(t, "#ipTituloPag", 3); } },
        { id: "texto", alvo: "#ipTexto", info: true, fica: true, texto: "Explique em poucas linhas o que a pessoa ganha ao se inscrever." },
        { id: "aceite", alvo: "#ipAceite", info: true, fica: true, texto: "Este é o texto da autorização que a pessoa marca. Ele protege você: deixe claro que ela vai receber mensagens pelo WhatsApp." },
        { id: "etiquetas", alvo: "#ipEtiquetas", info: true, opcional: true, fica: true, texto: "As etiquetas entram em quem se inscrever. Assim você manda disparo só para esta turma." },
        { id: "boasvindas", alvo: "#ipBoasVindas", info: true, opcional: true, fica: true, texto: "A mensagem de boas-vindas chega no WhatsApp depois que a pessoa confirma." },
        { id: "salvar", alvo: "#ipSalvar", info: true, manual: "Já salvei", fica: true, texto: 'Toque em "Salvar".' }
      ]
    },
    email: {
      id: "email", aba: "email", titulo: "Configurar o e-mail",
      fim: "Pronto. Mande um e-mail de teste pela aba Modelos. Quando o primeiro aviso chegar do Resend, o webhook fica confirmado e as campanhas liberam.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="email"]', texto: 'Abra "E-mail" no menu (no celular, toque em "Mais").', feito: function (t) { return abaAberta(t, "email"); } },
        { id: "sub", alvo: '#emSub [data-em-sub="config"]', texto: 'Toque em "Configuração", aqui no alto.', feito: function (t) { return t.attr('#emSub [data-em-sub="config"]', "aria-pressed") === "true"; } },
        { id: "falta", alvo: "#emCfgPend", info: true, texto: "Esta lista mostra o que ainda falta para mandar e-mails. Vamos resolver de cima para baixo." },
        { id: "nome", alvo: "#emCfgNome", texto: "Escreva o nome que aparece para quem recebe.", exemplo: "Ressignificar", feito: function (t) { return tam(t, "#emCfgNome", 2); } },
        { id: "endereco", alvo: "#emCfgLocal", texto: "Escolha o começo do endereço de quem envia.", exemplo: "contato", feito: function (t) { return tam(t, "#emCfgLocal", 2); } },
        { id: "rodape", alvo: "#emCfgRodape", texto: "Escreva o nome da empresa e uma cidade ou endereço de contato. A lei pede essa identificação nos e-mails de novidades.", exemplo: "Ressignificar Terapias & Consultorias · Recife/PE", feito: function (t) { return tam(t, "#emCfgRodape", 10); } },
        { id: "motivo", alvo: "#emCfgMotivo", texto: "Explique por que a pessoa recebe.", exemplo: "Você recebe porque se inscreveu na nossa lista.", feito: function (t) { return tam(t, "#emCfgMotivo", 10); } },
        { id: "salvar", alvo: "#emCfgSalvar", info: true, manual: "Já salvei", texto: 'Toque em "Salvar configuração".' },
        { id: "webhook", alvo: "#emCfgUrl", info: true, texto: 'Agora o aviso de entrega. Toque em "Copiar" ao lado deste endereço. No painel do Resend (resend.com), abra "Webhooks", toque em "Add Webhook" e cole.' },
        { id: "segredo", alvo: "#emCfgSegredo", info: true, manual: "Já está salvo", texto: "No Resend, marque os eventos sent, delivered, delivery_delayed, bounced, complained, clicked, failed e suppressed, e salve. Copie o segredo que começa com whsec_ e cole aqui.",
          aviso: "O segredo funciona como uma senha: não mande para ninguém.", feito: function (t) { return /^whsec_/.test(t.valor("#emCfgSegredo")); } },
        { id: "guardar", alvo: "#emCfgSegredoSalvar", info: true, manual: "Já salvei", texto: "Toque no botão ao lado para guardar o segredo." }
      ]
    },
    avisos: {
      id: "avisos", aba: "config", titulo: "Ligar os avisos no celular",
      fim: "Pronto. Quando alguém escrever, o celular avisa, mesmo com o CRM fechado. Para mudar, volte em Configuração, Avisos no celular.",
      passos: [
        { id: "aba", alvo: '#abas .aba[data-aba="config"]', texto: 'Abra "Configuração" no menu (no celular, toque em "Mais"), no aparelho que vai receber os avisos.', feito: function (t) { return abaAberta(t, "config"); } },
        { id: "modo", alvo: "#avModoTodas", info: true, texto: 'Escolha quando avisar: a cada mensagem nova, ou só quando alguém pedir atendimento.' },
        { id: "instalar", alvo: "#avAjuda", info: true, manual: "Entendi", texto: "Este aparelho ainda não consegue receber avisos. Siga o que aparece aqui e volte a este guia depois.",
          quando: function (t) { return t.attr("#avAjuda", "hidden") === null; } },
        { id: "ligar", alvo: "#avLigar", texto: 'Toque em "Ligar avisos neste aparelho" e aceite a permissão que o celular pedir.', quando: function (t) { return t.attr("#avAjuda", "hidden") !== null; },
          feito: function (t) { return /^Ligados/.test(t.texto("#avSituacao")); } },
        { id: "teste", alvo: "#avTestar", info: true, opcional: true, texto: 'Toque em "Mandar um aviso de teste". Ele chega em alguns segundos.', quando: function (t) { return /^Ligados/.test(t.texto("#avSituacao")); } }
      ]
    }
  };

  /* tarefas da tela "O que você quer fazer?": palavras simples primeiro, o termo técnico entre parênteses */
  const TAREFAS = [
    { id: "conectar", grupo: "Para começar", titulo: "Conectar o WhatsApp oficial", texto: "Ligar o seu número do Meta ao CRM, com o token.", aba: "config", roteiro: "conectar" },
    { id: "contatos", grupo: "Para começar", titulo: "Trazer os seus contatos", texto: "Importar uma planilha ou PDF com nome e telefone.", aba: "contatos", roteiro: "contatos" },
    { id: "template", grupo: "Para começar", titulo: "Criar uma mensagem modelo", texto: "A mensagem que a Meta aprova para você mandar a qualquer hora (template).", aba: "templates", roteiro: "template" },
    { id: "robo", grupo: "Para começar", titulo: "Configurar o robô", texto: "Respostas automáticas para palavras como link e preço.", aba: "robo", roteiro: "robo" },
    { id: "email", grupo: "Para começar", titulo: "Configurar o e-mail", texto: "Quem envia, o rodapé e o aviso de entrega.", aba: "email", filtro: "config", roteiro: "email" },
    { id: "avisos", grupo: "Para começar", titulo: "Ligar avisos no celular", texto: "O celular avisa quando alguém escreve.", aba: "config", roteiro: "avisos" },
    { id: "responder", grupo: "No dia a dia", titulo: "Responder quem escreveu", texto: "Veja as conversas que estão esperando você.", aba: "conversas", filtro: "sem_resposta" },
    { id: "disparo", grupo: "No dia a dia", titulo: "Mandar para várias pessoas", texto: "A mesma mensagem para uma lista, com conferência antes (disparo).", aba: "disparos", roteiro: "disparo" },
    { id: "automacao", grupo: "No dia a dia", titulo: "Criar uma automação", texto: "Mensagens que saem sozinhas quando algo acontece.", aba: "automacoes", roteiro: "automacao" },
    { id: "inscricao", grupo: "No dia a dia", titulo: "Criar uma página de inscrição", texto: "Um link para as pessoas entrarem na sua lista com autorização.", aba: "inscricoes", roteiro: "inscricao" },
    { id: "vendas", grupo: "No dia a dia", titulo: "Ver quanto vendi", texto: "Pedidos pagos, valores e quem começou e não pagou.", aba: "vendas" },
    { id: "funil", grupo: "No dia a dia", titulo: "Ver quem está parado", texto: "As pessoas em cada etapa do atendimento (funil).", aba: "funil" }
  ];

  function aplicaveis(roteiro, t) { return roteiro.passos.filter(function (p) { try { return !p.quando || !!p.quando(t); } catch (e) { return false; } }); }
  function estaFeito(p, t, memo) {
    if (!p.trocar && memo && memo.ok && memo.ok[p.id]) return true;   // passo que trava (ex.: falta template) nunca é pulado
    if (!p.feito) return false;
    try { return !!p.feito(t, memo || {}); } catch (e) { return false; }
  }
  /* o passo da vez: o primeiro, na ordem, que se aplica à tela e ainda não foi feito */
  function passoAtual(roteiro, t, memo) {
    const lista = aplicaveis(roteiro, t);
    for (let i = 0; i < lista.length; i++) if (!estaFeito(lista[i], t, memo)) return { passo: lista[i], n: i + 1, total: lista.length, fim: false };
    return { passo: null, n: lista.length, total: lista.length, fim: true };
  }
  /* o cartão fica do lado oposto ao elemento, para nunca cobri-lo */
  function ladoDoCartao(r, alturaJanela) { return r.top + r.height / 2 > alturaJanela * 0.55 ? "cima" : "baixo"; }
  /* a seta fica acima do elemento quando cabe; senão, embaixo, apontando para cima. Nunca sai da tela. */
  function posicaoDaSeta(r, larguraJanela) {
    const pad = 6, acima = r.top - pad - 50 >= 8;
    return { acima: acima, left: Math.max(6, Math.min(larguraJanela - 52, r.left + r.width / 2 - 23)), top: acima ? r.top - pad - 50 : r.top + r.height + pad + 4 };
  }
  function rotuloDoPasso(info, roteiro) { return info.fim ? "Concluído · " + roteiro.titulo : "Passo " + info.n + " de " + info.total + " · " + roteiro.titulo; }

  raiz.WaGuia = { ROTEIROS: ROTEIROS, TAREFAS: TAREFAS, passoAtual: passoAtual, aplicaveis: aplicaveis, estaFeito: estaFeito, ladoDoCartao: ladoDoCartao, posicaoDaSeta: posicaoDaSeta, rotuloDoPasso: rotuloDoPasso };
})(typeof window !== "undefined" ? window : globalThis);
