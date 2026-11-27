/* Guia passo a passo do CRM (piloto): roteiros como dados e funções puras, para testar sem a página.
   O guia só OBSERVA a tela e aponta o próximo passo que falta. Ele nunca toca em botão que envia mensagem ou custa dinheiro.
   Cada roteiro enxerga a tela por um adaptador pequeno ("t"): valor(sel), attr(sel, nome), classe(sel, nome), conta(sel), vazios(sel). */
(function (raiz) {
  "use strict";
  function abaAberta(t, aba) { return t.attr('#abas .aba[data-aba="' + aba + '"]', "aria-selected") === "true"; }
  function etapa(t) { return Number(t.attr("#dpForm .wz-etapa.on", "data-etapa")) || 1; }
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
    }
  };

  /* tarefas da tela "O que você quer fazer?": palavras simples primeiro, o termo técnico entre parênteses */
  const TAREFAS = [
    { id: "responder", titulo: "Responder quem escreveu", texto: "Veja as conversas que estão esperando você.", aba: "conversas", filtro: "sem_resposta" },
    { id: "template", titulo: "Criar uma mensagem modelo", texto: "A mensagem que a Meta aprova para você mandar a qualquer hora (template).", aba: "templates", roteiro: "template" },
    { id: "disparo", titulo: "Mandar para várias pessoas", texto: "A mesma mensagem para uma lista, com conferência antes (disparo).", aba: "disparos", roteiro: "disparo" },
    { id: "inscricao", titulo: "Criar uma página de inscrição", texto: "Um link para as pessoas entrarem na sua lista com autorização.", aba: "inscricoes" },
    { id: "vendas", titulo: "Ver quanto vendi", texto: "Pedidos pagos, valores e quem começou e não pagou.", aba: "vendas" },
    { id: "funil", titulo: "Ver quem está parado", texto: "As pessoas em cada etapa do atendimento (funil).", aba: "funil" }
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
