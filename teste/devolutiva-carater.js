/* ============================================================================
   DEVOLUTIVA DO TESTE DE CARÁTER COMPORTAMENTAL (individual e casal)
   No mesmo formato dos relatórios da Tatiana:
   - Individual: alinhamento, distribuição, picos, complementares, síntese,
     plano de ação (7 áreas), perguntas poderosas e considerações finais.
   - Casal: panorama, os traços, o mapa de cada um, o ciclo interativo,
     orientações individuais, matriz dores x ações, plano e compromisso.
   Os textos ficam todos aqui embaixo: a Tatiana pode ajustar à vontade.
   "(a)" vira "a" ou some, conforme a pessoa escolheu ser tratada no feminino
   ou no masculino; sem escolha, fica "(a)".
   ============================================================================ */
/* Quem assina. No site da Tatiana vale o padrão abaixo; no domínio da Ressignificar vem do cadastro da terapeuta
   (travas_paginas.dados: nome_curto e assinatura, ou nome e título). */
const DV_TERAPEUTA_PADRAO = 'Tati Barbosa';
const DV_ASSINATURA_PADRAO = 'Tati Barbosa — Análise Corporal & Terapeuta';
function dvCad(){ return (window.__T && window.__T.dados) || null; }
function dvTerapeuta(){ const d = dvCad(); return d ? (d.nome_curto || d.nome) : DV_TERAPEUTA_PADRAO; }
function dvAssinatura(){ const d = dvCad(); return d ? (d.assinatura || (d.nome + (d.titulo ? ' — ' + d.titulo : ''))) : DV_ASSINATURA_PADRAO; }
function dvComA(){ return typeof T_A !== 'undefined' ? T_A : 'a ' + PRIM_TER; }
const DV_ORDEM = ['esquizoide', 'oral', 'psicopata', 'masoquista', 'rigido'];

const DV = {
  esquizoide: {
    tag:'Mente & Inovação', suporte:'Suporte Criativo', recursoCurto:'Criatividade & Visão',
    formacao:'Formado durante a gestação e os primeiros meses de vida, quando o bebê sentiu o ambiente como ameaçador (por exemplo, em momentos de estresse da mãe) e interpretou que existir incomodava.',
    atencao:'o recolhimento do Esquizoide',
    contrib:'Traz visão criativa, análise profunda e a capacidade de enxergar o todo',
    talento:'uma inteligência criativa que enxerga soluções que quase ninguém consegue ver',
    lembrete:'existir não incomoda: o mundo precisa das suas ideias e da sua presença',
    permissao:'colocar as suas ideias no mundo sem esperar o momento perfeito',
    acoes:[
      { t:'Sair da Cabeça e Entrar no Corpo', p:'O Esquizoide vive muito no pensamento e se desconecta das sensações, o que gera ansiedade e a sensação de não pertencer.', c:'Pratique 10 minutos por dia de atividade corporal consciente (caminhada, alongamento ou respiração profunda), prestando atenção nos pés no chão.', g:'Mais presença, menos ansiedade e a sensação de estar inteiro(a) no próprio corpo.' },
      { t:'Expor as Ideias sem Medo de Incomodar', p:'A dor da rejeição faz o Esquizoide guardar as ideias para não parecer inadequado(a).', c:'Escolha uma ideia por semana e apresente para uma pessoa de confiança, pedindo uma opinião sincera.', g:'As suas ideias ganham vida e você descobre que é bem-vindo(a) do jeito que é.' }
    ],
    recurso:{ t:'Criatividade a Favor da Solução (Esquizoide)', p:'Quando o {P1} e o {P2} insistem no mesmo jeito de resolver, falta uma visão nova.', c:'Antes de uma decisão importante, reserve 15 minutos para listar 3 caminhos diferentes, incluindo um "fora da caixa".', g:'Decisões mais criativas e a sensação de ter escolhas, e não só obrigações.' },
    perguntas:['Em que momento de hoje eu estive realmente presente no meu corpo?', 'O que eu ganharia se deixasse as pessoas me conhecerem de verdade?', 'Eu estou me afastando para me proteger ou porque preciso mesmo de silêncio agora?'],
    casal:{
      gatilho:'Cobrança intensa, invasão do seu espaço ou discussões carregadas de emoção.',
      reacao:'Racionaliza o problema, se cala e se recolhe para o próprio mundo, às vezes saindo de perto.',
      necessidade:'Sentir que a sua presença é bem-vinda e que pode ter o seu espaço sem perder o vínculo.',
      reacaoCurta:'se recolhe para dentro de si', sente:'rejeição',
      busca:'espaço e tranquilidade', defesa:'o recolhimento',
      necessidadeCurta:'ter o seu espaço sem perder o vínculo', gatilhoCurto:'a sensação de invasão ou de cobrança',
      dor:'Medo de ser rejeitado(a) ou de ser um peso para o outro, o que leva ao distanciamento.',
      trabalhar:'Presença emocional: ficar na conversa mesmo quando a emoção do outro parece demais.',
      direcao:'Entender que o pedido de proximidade de {outro} não é invasão, e sim um convite.',
      acao:'Avisar quando precisar de um tempo ("preciso de 20 minutos e já volto") em vez de simplesmente sumir.',
      forca:'profundidade, lealdade silenciosa e um olhar criativo para os problemas'
    },
    areas:{ comunicacao:'pensa muito e fala pouco, e o outro fica sem saber o que se passa', conflitos:'se afasta da discussão antes de ela terminar', intimidade:'precisa de tempo para se abrir e pode parecer distante', papeis:'assume o planejar e o pensar, mas esquece de combinar', validacao:'reconhece por dentro, mas raramente diz em voz alta' }
  },
  oral: {
    tag:'Vínculo & Afeto', suporte:'Suporte Emocional', recursoCurto:'Sensibilidade & Vínculo',
    formacao:'Formado na fase da amamentação, no primeiro ano de vida, quando o bebê sentiu que o alimento, o colo ou a presença afetiva não chegavam na medida em que precisava e interpretou que poderia ficar sem.',
    atencao:'a carência do Oral',
    contrib:'Traz calor humano, empatia e facilidade de comunicação',
    talento:'um coração generoso, com uma facilidade rara de criar vínculos e de acolher',
    lembrete:'você pode se nutrir por dentro: o amor que você dá também é seu',
    permissao:'pedir com clareza o que você precisa',
    acoes:[
      { t:'Autonutrição Emocional', p:'A dor do abandono faz o Oral buscar fora o afeto que ainda não aprendeu a se dar, gerando carência e cansaço.', c:'Crie um ritual diário de autocuidado (15 minutos só seus) e anote, ao final do dia, uma coisa boa que você fez por você.', g:'Mais energia, menos dependência da aprovação do outro e relações mais leves.' },
      { t:'Pedir em vez de Esperar', p:'O Oral espera que o outro adivinhe o que ele sente e se frustra quando isso não acontece.', c:'Troque a indireta pelo pedido claro: "Eu preciso de... você pode...?". Pratique pelo menos uma vez por dia.', g:'As suas necessidades atendidas com menos mágoa e menos desgaste nas relações.' }
    ],
    recurso:{ t:'Comunicação Afetiva (Oral)', p:'Sob pressão, o {P1} e o {P2} podem soar racionais ou duros demais.', c:'Use a sua facilidade de falar para expressar o que sente em frases curtas e calorosas antes de entrar no assunto prático.', g:'Relações mais próximas e conversas difíceis com menos ruído.' },
    perguntas:['O que eu estou esperando que o outro adivinhe, e que eu posso pedir com clareza hoje?', 'Como eu posso cuidar de mim hoje do jeito que eu cuido dos outros?', 'Quando eu fico sozinho(a), do que eu sinto falta de verdade?'],
    casal:{
      gatilho:'Percepção de afastamento emocional, demora nas respostas ou falta de atenção e carinho.',
      reacao:'Cobra presença, insiste na conversa, se queixa ou se entristece e se cansa.',
      necessidade:'Desejo profundo de se sentir ouvido(a), cuidado(a) e seguro(a) no vínculo.',
      reacaoCurta:'busca o outro com mais intensidade', sente:'abandono',
      busca:'proximidade e acolhimento', defesa:'a cobrança por atenção',
      necessidadeCurta:'se sentir cuidado(a) e lembrado(a)', gatilhoCurto:'a sensação de afastamento',
      dor:'Medo de ser deixado(a) de lado, o que gera carência e um estado constante de alerta no vínculo.',
      trabalhar:'Autorregulação emocional: acolher a própria falta antes de cobrar o outro.',
      direcao:'Diferenciar o silêncio de {outro} de falta de amor: nem todo afastamento é abandono.',
      acao:'Comunicar desejos com pedidos claros ("eu gostaria de...") em vez de apontar o que faltou.',
      forca:'afeto, cuidado e uma enorme capacidade de criar intimidade'
    },
    areas:{ comunicacao:'fala muito do que sente e se magoa quando não se sente ouvido(a)', conflitos:'insiste em resolver na hora para não sentir a distância', intimidade:'sente falta de carinho e de tempo de qualidade', papeis:'cuida de tudo e de todos e depois se sente sobrecarregado(a)', validacao:'precisa ouvir com frequência que é amado(a) e importante' }
  },
  psicopata: {
    tag:'Liderança & Estratégia', suporte:'Suporte Estratégico', recursoCurto:'Articulação & Liderança',
    formacao:'Formado entre os 2 e os 4 anos, quando a criança sentiu que promessas eram quebradas ou que era usada para atender às necessidades dos adultos, e aprendeu que precisava estar no controle para não ser enganada.',
    atencao:'a necessidade de controle do Psicopata',
    contrib:'Dá a capacidade de negociar, delegar e liderar com visão estratégica',
    talento:'uma força de liderança e uma visão estratégica que movem pessoas e projetos',
    lembrete:'mostrar a sua fragilidade também é força, e confiar não é perder o controle',
    permissao:'confiar sem precisar controlar tudo',
    acoes:[
      { t:'Confiança sem Controle', p:'A dor da traição faz o Psicopata querer controlar pessoas e situações para não ser enganado(a).', c:'Escolha uma área da vida para delegar de verdade nesta semana: combine o resultado esperado e não interfira no caminho.', g:'Menos tensão, mais tempo livre e relações baseadas em confiança.' },
      { t:'Vulnerabilidade Estratégica', p:'O medo de parecer fraco(a) faz o Psicopata esconder o que sente, o que afasta as pessoas próximas.', c:'Compartilhe com alguém de confiança uma dificuldade real que você está vivendo, sem já trazer a solução pronta.', g:'Vínculos mais verdadeiros e o alívio de não precisar ser forte o tempo todo.' }
    ],
    recurso:{ t:'Delegação Eficiente (Psicopata)', p:'Achar que precisa fazer tudo sozinho(a) sobrecarrega o {P1} e o {P2} e atrasa o crescimento dos seus projetos.', c:'Defina o objetivo, oriente quem vai fazer e acompanhe apenas os pontos de checagem combinados.', g:'Alavancagem, mais tempo livre e um papel mais estratégico.' },
    perguntas:['O que eu estou tentando controlar hoje que, na verdade, não depende de mim?', 'Em quem eu poderia confiar um pouco mais se não tivesse medo de ser enganado(a)?', 'Como seria mostrar o que eu sinto sem perder o meu valor?'],
    casal:{
      gatilho:'Sensação de ser contrariado(a), enganado(a) ou de perder o controle da situação.',
      reacao:'Argumenta para vencer, endurece o tom, testa ou conduz a conversa para onde quer.',
      necessidade:'Sentir que pode confiar e que não vai ser traído(a) nem diminuído(a).',
      reacaoCurta:'endurece e tenta controlar a situação', sente:'desconfiança e traição',
      busca:'confiança e segurança', defesa:'a postura de controle',
      necessidadeCurta:'confiar sem precisar controlar', gatilhoCurto:'a sensação de ser contrariado(a)',
      dor:'Medo de ser traído(a) ou de parecer fraco(a), o que dificulta baixar a guarda.',
      trabalhar:'Confiança e vulnerabilidade: mostrar o que sente sem precisar vencer a discussão.',
      direcao:'Entender que a relação com {outro} não é uma disputa: ceder em um ponto não é perder.',
      acao:'Antes de rebater, repetir com as próprias palavras o que {outro} disse e perguntar se entendeu certo.',
      forca:'proteção, iniciativa e capacidade de liderar a vida a dois'
    },
    areas:{ comunicacao:'quer ter a última palavra e conduzir a conversa', conflitos:'transforma a discussão em disputa de quem tem razão', intimidade:'tem dificuldade de se mostrar frágil e baixar a guarda', papeis:'tende a decidir sozinho(a) e a controlar o planejamento', validacao:'reconhece resultados, mas tem dificuldade de elogiar o esforço' }
  },
  masoquista: {
    tag:'Estrutura & Sustentação', suporte:'Suporte Estrutural', recursoCurto:'Estrutura & Método',
    formacao:'Formado entre 1 e 3 anos, na fase do desfralde e das primeiras regras, quando a criança se sentiu controlada ou envergonhada nas suas vontades e aprendeu a segurar o que sentia para não ser humilhada.',
    atencao:'o peso que o Masoquista carrega',
    contrib:'Fornece a disciplina, a paciência e a constância para transformar intenção em rotina',
    talento:'uma força e uma lealdade que sustentam pessoas e projetos mesmo nos momentos difíceis',
    lembrete:'soltar o peso não é fraqueza: você também merece leveza e prazer',
    permissao:'dizer "não" e soltar o que não é seu',
    acoes:[
      { t:'Aprender a Dizer "Não"', p:'A dor da humilhação faz o Masoquista aceitar mais do que aguenta para não decepcionar ninguém.', c:'Antes de aceitar um novo pedido, responda "vou ver e te falo" e avalie com calma se cabe na sua semana.', g:'Menos sobrecarga, mais respeito por si e tempo para o que importa.' },
      { t:'Soltar o que Está Guardado', p:'O Masoquista engole as emoções para não criar conflito, e o corpo acumula tensão.', c:'Escreva por 10 minutos, todos os dias, o que você sentiu e não disse. Depois, escolha uma coisa para falar com cuidado.', g:'Alívio no corpo, menos ressentimento e relações mais honestas.' }
    ],
    recurso:{ t:'Método e Rotina Amigável (Masoquista)', p:'Sem um trilho seguro de execução, o {P1} e o {P2} gastam energia demais decidindo o que fazer.', c:'Use um aplicativo ou um bloco de notas para registrar os passos do dia e siga uma rotina simples e possível.', g:'Clareza mental diária e menos esforço para decidir o próximo passo.' },
    perguntas:['O que eu estou carregando hoje que não é meu?', 'O que eu deixei de dizer para evitar um conflito, e quanto isso está me custando?', 'Onde eu posso me permitir sentir prazer sem culpa nesta semana?'],
    casal:{
      gatilho:'Críticas, sensação de humilhação ou de estar sendo pressionado(a).',
      reacao:'Engole o que sente, cede para evitar a briga e depois explode ou se fecha, ressentido(a).',
      necessidade:'Sentir-se respeitado(a) e livre para dizer "não" sem ser julgado(a).',
      reacaoCurta:'engole o que sente e cede', sente:'humilhação e sobrecarga',
      busca:'respeito e tempo para processar', defesa:'o silêncio que acumula mágoas',
      necessidadeCurta:'dizer "não" sem culpa', gatilhoCurto:'a sensação de crítica e de pressão',
      dor:'Medo de ser criticado(a) ou humilhado(a), o que faz guardar mágoas até transbordar.',
      trabalhar:'Expressão emocional: falar no momento em que incomoda, e não só quando já explodiu.',
      direcao:'Entender que dizer "não" a {outro} e expor uma necessidade não ameaçam o amor.',
      acao:'Usar a frase "isso me incomodou e eu preciso falar" sempre que perceber que está engolindo algo.',
      forca:'lealdade, paciência e uma enorme capacidade de sustentar a relação'
    },
    areas:{ comunicacao:'guarda o que sente para não brigar', conflitos:'cede no momento e acumula ressentimento', intimidade:'sente culpa ao se permitir prazer e descanso', papeis:'assume mais do que aguenta e não pede ajuda', validacao:'sente que o próprio esforço passa despercebido' }
  },
  rigido: {
    tag:'Ação & Excelência', suporte:'Suporte de Execução', recursoCurto:'Foco & Execução',
    formacao:'Formado entre os 3 e os 5 anos, no surgimento do afeto infantil, ao perceber a relação dos pais e sentir que não era a opção número um, aprendendo que precisava ser perfeita para ser escolhida.',
    atencao:'a autocobrança do Rígido',
    contrib:'Traz foco, agilidade e o impulso de colocar as coisas em prática com qualidade',
    talento:'uma capacidade de realização extraordinária, com foco e alto padrão de qualidade',
    lembrete:'a excelência está na constância, e não na perfeição',
    permissao:'relaxar a cobrança por perfeição',
    acoes:[
      { t:'Flexibilização da Exigência Exagerada', p:'O medo de errar e de ser trocado(a) faz o Rígido se cobrar além da conta, gerando tensão no corpo.', c:'Pratique celebrar 3 pequenas conquistas diárias antes de procurar o que ainda falta ajustar.', g:'Leveza no peito e redução do estresse, mantendo a alta performance.' },
      { t:'Desconexão Programada', p:'O Rígido se mantém sempre em movimento e evita mostrar vulnerabilidade, o que cansa o corpo e afasta o afeto.', c:'Reserve um momento por dia sem produtividade (sem tarefas e sem telas) e conte a alguém próximo como você realmente está.', g:'Sono reparador, prevenção do esgotamento e relações mais íntimas.' }
    ],
    recurso:{ t:'Execução com Foco (Rígido)', p:'O {P1} e o {P2} podem adiar decisões quando falta um empurrão para a ação.', c:'Escolha a tarefa mais importante do dia e dê o primeiro passo nos primeiros 30 minutos da manhã.', g:'Mais resultados concretos e a satisfação de ver as coisas andando.' },
    perguntas:['O que eu posso fazer hoje que seja 80% bom e traga um resultado prático imediato?', 'Se eu não precisar provar nada para ninguém hoje, qual escolha me trará mais leveza e paz?', 'Quando foi a última vez que eu me permiti descansar sem culpa?'],
    casal:{
      gatilho:'Sensação de crítica ao seu desempenho, de comparação ou de não ser a prioridade do outro.',
      reacao:'Se defende, aponta falhas, acelera e se ocupa com tarefas para não sentir.',
      necessidade:'Sentir-se escolhido(a), admirado(a) e reconhecido(a) pelo que faz.',
      reacaoCurta:'se defende e acelera no fazer', sente:'que não é a escolha número um',
      busca:'reconhecimento e admiração', defesa:'a crítica e a pressa',
      necessidadeCurta:'ser amado(a) sem precisar provar nada', gatilhoCurto:'a sensação de comparação ou de não ser prioridade',
      dor:'Medo de não estar à altura ou de ser trocado(a) por alguém "melhor", o que gera cobrança de si e do outro.',
      trabalhar:'Vulnerabilidade: mostrar o que sente, e não só o que faz.',
      direcao:'Entender que o amor de {outro} não precisa ser conquistado com desempenho.',
      acao:'Trocar a crítica por um pedido e reconhecer, todos os dias, um gesto de {outro}.',
      forca:'dedicação, energia e o desejo de construir uma vida a dois bem-feita'
    },
    areas:{ comunicacao:'vai direto ao ponto e pode soar crítico(a)', conflitos:'quer resolver rápido e do jeito "certo"', intimidade:'tem dificuldade de relaxar e se entregar', papeis:'cobra perfeição na divisão das tarefas', validacao:'aponta o que falta antes de reconhecer o que deu certo' }
  }
};

/* As 10 combinações de pico duplo (a ordem dos dois não importa) */
const DV_PARES = {
  'esquizoide+oral': { arquetipo:'Sonhador Sensível',
    texto:'O Esquizoide traz um mundo interno rico, criativo e profundo, enquanto o Oral traz sensibilidade, afeto e o desejo de conexão. Você pensa e sente com intensidade, e tem um dom raro para compreender pessoas e ideias.',
    desafio:'O seu grande desafio acontece quando o Esquizoide se recolhe por medo de incomodar e o Oral, ao mesmo tempo, sente falta de contato: você quer estar perto, mas se afasta, e isso pode gerar solidão e cansaço emocional.',
    acao:{ t:'Conexão sem Invasão', p:'O Esquizoide precisa de espaço e o Oral precisa de vínculo; quando os dois disputam por dentro, você oscila entre se isolar e se sentir só.', c:'Combine encontros curtos e frequentes com pessoas de confiança (um café, uma ligação de 15 minutos), em vez de esperar o "momento ideal".', g:'Vínculos nutritivos sem a sensação de perder o próprio espaço.' },
    pergunta:'Eu estou me afastando por necessidade de silêncio ou por medo de incomodar quem eu amo?' },
  'esquizoide+psicopata': { arquetipo:'Estrategista Visionário',
    texto:'O Esquizoide cria visões e estratégias fora da curva, e o Psicopata tem a força para liderar, negociar e fazer essas ideias acontecerem através das pessoas. Você enxerga longe e sabe conduzir.',
    desafio:'O seu grande desafio aparece quando a desconfiança do Psicopata se soma ao recolhimento do Esquizoide: você pode guardar os planos só para si, controlar tudo de longe e acabar se sentindo só no topo.',
    acao:{ t:'Liderança com Proximidade', p:'A mente estratégica e a necessidade de controle podem criar distância das pessoas que poderiam somar.', c:'Compartilhe a sua visão com a equipe ou com a família antes de decidir e peça uma contribuição concreta de cada pessoa.', g:'Projetos mais fortes e relações de confiança verdadeira.' },
    pergunta:'Quem eu estou deixando de fora dos meus planos por medo de perder o controle?' },
  'esquizoide+masoquista': { arquetipo:'Pensador Resiliente',
    texto:'O Esquizoide traz profundidade, análise e criatividade, e o Masoquista traz resistência, método e lealdade. Você pensa com cuidado e sustenta o que começa, mesmo nos tempos difíceis.',
    desafio:'O seu grande desafio surge quando o Esquizoide guarda as ideias e o Masoquista guarda os sentimentos: tudo fica dentro, o corpo acumula tensão e você carrega sozinho(a) muito mais do que precisa.',
    acao:{ t:'Colocar para Fora', p:'Pensamentos e emoções guardados viram peso no corpo e a sensação de estar travado(a).', c:'Uma vez por semana, converse com alguém de confiança sobre algo que está pesando, ou escreva e leia em voz alta.', g:'Leveza no corpo, clareza mental e a sensação de não estar sozinho(a).' },
    pergunta:'O que eu estou guardando só para mim que ficaria mais leve se fosse dividido?' },
  'esquizoide+rigido': { arquetipo:'Visionário Executor',
    texto:'Enquanto o Esquizoide habita o universo das ideias brilhantes, das estratégias fora da curva e do planejamento lógico, o Rígido traz o impulso de pegar essa visão e colocá-la em prática com velocidade e alto padrão de qualidade.',
    desafio:'O seu grande desafio acontece quando a mente do Esquizoide cria algo inovador, mas a autocobrança do Rígido exige que tudo saia 100% perfeito logo de primeira. Sem equilíbrio, surge um desgaste mental enorme ou o congelamento antes de executar.',
    acao:{ t:'Tirar as Ideias do Papel sem Paralisar', p:'O Esquizoide tem muitas ideias e o Rígido quer executá-las com perfeição, gerando sobrecarga de projetos.', c:'Escolha uma única ideia por ciclo e lance a primeira versão, focando no feito antes de buscar o impecável.', g:'Fim do acúmulo mental e a satisfação de ver os seus projetos rodando no mundo real.' },
    pergunta:'Eu estou guardando esta ideia por medo de não ser aceito(a) ou por medo de que ela não saia perfeita?' },
  'oral+psicopata': { arquetipo:'Comunicador Influente',
    texto:'O Oral traz carisma, calor humano e facilidade de criar vínculos, e o Psicopata traz liderança, persuasão e visão estratégica. Você conecta e mobiliza pessoas como poucos.',
    desafio:'O seu grande desafio aparece quando a carência do Oral encontra o medo de parecer fraco(a) do Psicopata: você precisa muito do outro, mas não mostra, e pode tentar garantir o afeto pelo controle.',
    acao:{ t:'Influência com Verdade', p:'A necessidade de afeto e a necessidade de controle juntas podem levar a jogos nas relações.', c:'Quando precisar de algo, diga diretamente o que sente e o que pede, sem estratégia e sem indiretas.', g:'Relações mais seguras e uma liderança que inspira confiança.' },
    pergunta:'Eu estou pedindo o que preciso de forma direta ou tentando conseguir por outros caminhos?' },
  'oral+masoquista': { arquetipo:'Cuidador Leal',
    texto:'O Oral traz afeto, escuta e sensibilidade, e o Masoquista traz lealdade, paciência e força para sustentar. Você é o porto seguro de muita gente e cuida com dedicação.',
    desafio:'O seu grande desafio surge quando você cuida de todos, engole o que sente e espera ser cuidado(a) de volta sem pedir. O resultado é cansaço, carência e um ressentimento silencioso.',
    acao:{ t:'Cuidar de Quem Cuida', p:'Dar muito (Oral) e não saber dizer "não" (Masoquista) esgotam a sua energia.', c:'Para cada "sim" que você der aos outros nesta semana, reserve um "sim" para você: um descanso, um prazer ou um limite.', g:'Energia renovada e relações mais equilibradas, em que você também recebe.' },
    pergunta:'Quem cuida de mim do jeito que eu cuido dos outros, e eu permito esse cuidado?' },
  'oral+rigido': { arquetipo:'Realizador Afetivo',
    texto:'O Oral traz sensibilidade, vínculo e comunicação, e o Rígido traz foco, energia e excelência na execução. Você realiza muito e coloca o coração em tudo o que faz.',
    desafio:'O seu grande desafio acontece quando o Rígido se cobra para merecer amor e o Oral sente falta de reconhecimento: você faz cada vez mais esperando ser visto(a), e se frustra quando o carinho não vem.',
    acao:{ t:'Ser Amado(a) sem Precisar Provar', p:'O Rígido tenta conquistar o afeto pelo desempenho e o Oral sofre quando o reconhecimento não chega.', c:'Diga às pessoas próximas, com palavras, o que você precisa receber, em vez de fazer mais para ser notado(a).', g:'Menos esgotamento e relações em que você se sente amado(a) pelo que é.' },
    pergunta:'O que eu estou fazendo hoje só para ser notado(a)?' },
  'psicopata+masoquista': { arquetipo:'Líder Sustentador',
    texto:'O Psicopata traz liderança, estratégia e poder de decisão, e o Masoquista traz resistência, método e lealdade. Você comanda e sustenta, e as pessoas confiam na sua força.',
    desafio:'O seu grande desafio aparece quando você controla tudo (Psicopata) e, ao mesmo tempo, carrega tudo sozinho(a) (Masoquista). A tensão se acumula no corpo e falta espaço para descansar e confiar.',
    acao:{ t:'Dividir o Peso', p:'Controlar e carregar ao mesmo tempo gera sobrecarga física e emocional.', c:'Liste as suas responsabilidades e escolha duas para entregar a outra pessoa, combinando apenas o resultado esperado.', g:'Corpo menos tenso, mais tempo e uma liderança sustentável.' },
    pergunta:'O que aconteceria se eu deixasse alguém me ajudar de verdade?' },
  'psicopata+rigido': { arquetipo:'Líder de Alta Performance',
    texto:'O Psicopata traz visão estratégica, liderança e capacidade de negociação, e o Rígido traz velocidade, foco e alto padrão de qualidade. Você é movido(a) a desafios e entrega resultados.',
    desafio:'O seu grande desafio surge quando a necessidade de controle e a exigência de perfeição se juntam: você não relaxa, tem dificuldade de mostrar fragilidade e pode cobrar demais de si e de quem está por perto.',
    acao:{ t:'Performance com Humanidade', p:'Controle e perfeccionismo juntos geram alta pressão em você e nas pessoas ao redor.', c:'Toda semana, reconheça em voz alta o esforço de alguém e compartilhe um erro seu e o que você aprendeu com ele.', g:'Equipes e relações mais leves, sem perder os resultados.' },
    pergunta:'Quanto da minha força hoje é escolha, e quanto é medo de parecer fraco(a)?' },
  'masoquista+rigido': { arquetipo:'Construtor Persistente',
    texto:'O Masoquista traz resistência, método e lealdade, e o Rígido traz foco, agilidade e excelência. Você constrói com consistência e não desiste do que começa.',
    desafio:'O seu grande desafio aparece quando a autocobrança do Rígido se soma à dificuldade do Masoquista de dizer "não": você assume tudo, quer fazer perfeito e se esgota em silêncio.',
    acao:{ t:'Ritmo Sustentável', p:'Assumir demais e exigir perfeição ao mesmo tempo leva ao esgotamento.', c:'Defina um limite claro de horas de trabalho por dia e uma pausa inegociável, e trate os dois como compromissos.', g:'Constância sem esgotamento e mais prazer no caminho.' },
    pergunta:'O que eu continuo carregando só porque acho que ninguém faria tão bem quanto eu?' }
};

/* Áreas da matriz do casal e a intervenção sugerida para cada uma */
const DV_AREAS = [
  { id:'comunicacao', nome:'Comunicação', intervencao:'Uso da Comunicação Não-Violenta (Observar, Sentir, Precisar, Pedir) nas conversas difíceis.' },
  { id:'conflitos', nome:'Resolução de Conflitos', intervencao:'Instituir a "Pausa Estratégica", com o compromisso expresso de retomar o tema em até 24h.' },
  { id:'intimidade', nome:'Intimidade & Afeto', intervencao:'Agendamento intencional de momentos a dois, sem telas e sem pautas domésticas.' },
  { id:'papeis', nome:'Divisão de Papéis', intervencao:'Alinhamento explícito de expectativas e redistribuição equilibrada das responsabilidades.' },
  { id:'validacao', nome:'Validação Mútua', intervencao:'Prática diária do "Agradecimento Específico" ao final de cada dia.' }
];

/* Afirmações que pedem um olhar atento da terapeuta quando a resposta é "Frequentemente" ou "Sempre" */
const DV_SENSIVEIS = [1, 4, 12, 16, 37, 38, 39];

/* ---------------------------------------------------------------------------- */
function dvGen(txt, g){
  const s = String(txt == null ? '' : txt);
  if(g !== 'f' && g !== 'm') return s;
  return s.replace(/([A-Za-zÀ-ÿ]+)\(a\)/g, (m, w) => g === 'm' ? w : (/o$/.test(w) ? w.slice(0, -1) + 'a' : w + 'a'));
}
function dvT(txt, v){ return String(txt).replace(/\{(\w+)\}/g, (m, k) => v[k] != null ? v[k] : m); }
function dvPar(a, b){ return [a, b].sort((x, y) => DV_ORDEM.indexOf(x) - DV_ORDEM.indexOf(y)).join('+'); }
function dvData(iso){ const s = String(iso || '').slice(0, 10); const p = s.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }
function dvQuerido(g){ return g === 'f' ? 'Querida' : g === 'm' ? 'Querido' : 'Querido(a)'; }
function dvAcao(n, a, V){
  return `<div class="dv-acao"><h4>${n}. ${V(a.t)}</h4>
    <p><b>Diagnóstico (por quê):</b> ${V(a.p)}</p><p><b>Passo a passo (como fazer):</b> ${V(a.c)}</p><p><b>Ganho direto:</b> ${V(a.g)}</p></div>`;
}
function dvPico(id, pct, pos, V, nomeQuem){
  const t = tcTraco(id), d = DV[id];
  return `<div class="dv-pico"><div class="dv-pico-topo"><b>${nomeQuem ? escV(nomeQuem) + ' · ' : ''}${pos === 1 ? 'PICO PRIMÁRIO' : 'PICO SECUNDÁRIO'}: ${escV(t.nome).toUpperCase()} (${tcPct(pct)})</b><span>${escV(d.tag)}</span></div>
    <p><b>A dor central:</b> ${V(t.dor)}</p><p><b>Formação na infância:</b> ${V(d.formacao)}</p>
    <p><b>No dia a dia:</b> ${V(t.dia)}</p><p><b>Virada de chave:</b> ${V(t.virada)}</p></div>`;
}
function dvAlinhamento(prim){
  return `<div class="dv-caixa"><h3>O que são traços de caráter? (alinhamento inicial)</h3>
    <p>${prim ? escV(prim) + ', antes' : 'Antes'} de apresentar o resultado e os percentuais, quero fazer um alinhamento muito importante. Os nomes dos traços de caráter que usamos aqui (<i>Esquizoide, Oral, Psicopata, Masoquista e Rígido</i>) foram criados no século passado pelos cientistas e médicos da psicanálise que mapearam a relação entre a mente e o corpo. <b>Eles não têm qualquer relação com doenças mentais, diagnósticos psiquiátricos ou desvios de conduta.</b> Na nossa terapia, encare cada um desses nomes como estilos de funcionamento do sistema nervoso.</p>
    <p>Outro ponto fundamental: quando falarmos da infância, lembre-se de que estamos lidando com a <b>percepção do sistema nervoso quando bebê ou criança</b>, e não com a intenção dos pais. Eles deram o melhor que podiam com os recursos que tinham. O nosso foco aqui não é julgar o passado, mas libertar o presente.</p>
    <p>Os traços de caráter são mapas de como a mente e o corpo se moldaram para responder às experiências da infância. Eles não representam defeitos, mas sim mecanismos de defesa inteligentes que geraram os maiores talentos de cada pessoa. Compreender o perfil é o primeiro passo para relaxar a "armadura" e viver com mais leveza, equilíbrio e autenticidade.</p></div>`;
}
function dvCta(texto){
  return `<div class="dv-cta"><b>Este é um primeiro mapa.</b> ${texto} Para aprofundar cada ponto e transformar este mapa em mudança real, o próximo passo é iniciar o processo terapêutico com ${escV(dvComA())}.
    <span class="dv-so-print"> WhatsApp: ${escV(CONFIG.whatsappVisivel)}</span></div>
    <p class="dv-aviso">Este teste é uma ferramenta de autoconhecimento e não substitui diagnóstico nem acompanhamento profissional.</p>`;
}

/* Leitura só para a terapeuta: respostas que pedem atenção, corpo x comportamento e infância */
function dvLeituraClinica(resps, nome, calc){
  if(!Array.isArray(resps) || resps.length !== 40) return '';
  const val = n => (resps.find(x => x.n === n) || {}).valor || 0;
  const sens = DV_SENSIVEIS.filter(n => val(n) >= 4).map(n => `<li>“${escV(TC_PERGUNTAS[n - 1].q)}” <b>${TC_ESCALA[val(n) - 1]}</b></li>`);
  const maior = nums => { let m = null; nums.forEach(n => { if(!m || val(n) > val(m)) m = n; }); return m; };
  const corpo = maior([21, 22, 23, 24, 25]), inf = maior([26, 27, 28, 29, 30]);
  const tCorpo = tcTraco(TC_PERGUNTAS[corpo - 1].t), tInf = tcTraco(TC_PERGUNTAS[inf - 1].t), p1 = calc.ordem[0];
  const corpoTxt = val(corpo) <= 2 ? 'Nenhuma descrição corporal foi muito marcada (todas até “Raramente”): vale observar a postura ao vivo.'
    : tCorpo.id === p1.id ? `A descrição corporal mais marcada (${tCorpo.nome}) confirma o pico primário: corpo e comportamento apontam para o mesmo lugar.`
    : `A descrição corporal mais marcada foi a do ${tCorpo.nome}, enquanto o pico primário é ${p1.nome}: vale observar a postura na sessão e investigar essa diferença.`;
  const infTxt = val(inf) <= 2 ? 'As afirmações sobre a infância tiveram respostas baixas: pode haver pouca lembrança ou resistência ao tema.'
    : `A percepção de infância mais marcada aponta para a ferida do ${tInf.nome} (${tInf.dor.split(':')[0].toLowerCase()}).`;
  const sempre = resps.filter(x => x.valor === 5).length;
  return `<div class="dv-clinica dv-sem-print"><h3>Leitura para a terapeuta <small>(só você vê)</small></h3>
    <p><b>Corpo x comportamento:</b> ${escV(corpoTxt)}</p>
    <p><b>Infância:</b> ${escV(infTxt)}</p>
    ${sens.length ? `<p><b>Pontos de atenção clínica:</b></p><ul>${sens.join('')}</ul>` : '<p><b>Pontos de atenção clínica:</b> nenhuma resposta alta nas afirmações sensíveis.</p>'}
    <p><b>Intensidade:</b> ${sempre} de 40 respostas em “Sempre”${sempre >= 15 ? ' (muitas respostas no máximo: vale conferir se a pessoa entendeu a escala)' : ''}.</p></div>`;
}

/* ---------------------------------------------------------------------------- */
/* DEVOLUTIVA INDIVIDUAL. o = { nome, genero, data, calc, respostas, terapeuta:true|false } */
function dvIndividual(o){
  const g = o.genero, prim = tcPrim(o.nome), c = o.calc, ord = c.ordem, p1 = ord[0], p2 = ord[1];
  const d1 = DV[p1.id], d2 = DV[p2.id], par = DV_PARES[dvPar(p1.id, p2.id)];
  const vars = { P1:p1.nome, P2:p2.nome, nome:prim };
  const V = s => escV(dvGen(dvT(s, vars), g));
  const sup = ord.slice(2);
  const linhas = ord.map((x, i) => `<tr class="${i < 2 ? 'pico' : ''}"><td data-r="Posição">${i + 1}.</td><td data-r="Traço">${escV(x.nome)}</td><td data-r="Porcentagem">${tcPct(x.pct)}</td><td data-r="Classificação">${i === 0 ? 'Pico Primário' : i === 1 ? 'Pico Secundário' : escV(DV[x.id].suporte)}</td><td data-r="Papel no perfil">${escV(tcTraco(x.id).recurso)}</td></tr>`).join('');
  const proximo = ord[2].pct >= p2.pct - 1 ? ` O ${escV(ord[2].nome)} (${tcPct(ord[2].pct)}) aparece muito perto do pico secundário e também pesa bastante no seu jeito de ser.` : '';
  const plano = ord[0].pct - ord[4].pct < 4 ? ' Os seus cinco traços estão bem distribuídos, o que mostra flexibilidade: você transita entre estilos diferentes conforme a situação.' : '';
  const acoes = [par.acao, d1.acoes[0], d2.acoes[0], d1.acoes[1], DV[sup[0].id].recurso, DV[sup[1].id].recurso, DV[sup[2].id].recurso];
  const perguntas = [par.pergunta, d1.perguntas[0], d2.perguntas[0], d1.perguntas[1]];
  return `<article class="dv" data-dv>
  <header class="dv-topo">
    <div><h1>Relatório de Devolutiva Terapêutica</h1><p>Mapeamento de Perfil Corporal &amp; Comportamental</p></div>
    <dl><dt>Cliente:</dt><dd>${escV(o.nome)}</dd><dt>Data:</dt><dd>${escV(dvData(o.data))} · Terapeuta: ${escV(dvTerapeuta())}</dd>
      <dt>Metodologia:</dt><dd>${escV(TC_NOME)} (40 perguntas)</dd><dt>Resumo dos picos:</dt><dd>${escV(p1.nome)} (${tcPct(p1.pct)}) + ${escV(p2.nome)} (${tcPct(p2.pct)})</dd></dl>
  </header>
  ${dvAlinhamento(prim)}
  <h2 class="dv-h2">1. Distribuição geral dos traços</h2>
  <div class="dv-dist">
    <div class="dv-tabela"><table><thead><tr><th>Posição</th><th>Traço de caráter</th><th>Porcentagem</th><th>Classificação</th><th>Papel no perfil</th></tr></thead><tbody>${linhas}</tbody></table></div>
    <div class="teia dv-teia"><canvas class="tc-teia" role="img" aria-label="Gráfico de teia com os cinco traços de caráter"></canvas></div>
  </div>
  <h2 class="dv-h2">2. Análise aprofundada dos picos (pico duplo: ${tcPct(c.pico)})</h2>
  <div class="dv-2col">${dvPico(p1.id, p1.pct, 1, V)}${dvPico(p2.id, p2.pct, 2, V)}</div>
  <h2 class="dv-h2">3. Traços complementares e equilíbrio do perfil</h2>
  <div class="dv-tabela"><table><thead><tr><th>Traço</th><th>Recurso disponível</th><th>Contribuição prática para ${escV(prim)}</th></tr></thead><tbody>
    ${sup.map(x => `<tr><td data-r="Traço"><b>${escV(x.nome)}</b> (${tcPct(x.pct)})</td><td data-r="Recurso">${escV(DV[x.id].recursoCurto)}</td><td data-r="Contribuição">${V(DV[x.id].contrib + ' para equilibrar ' + d1.atencao + ' e ' + d2.atencao + '.')}</td></tr>`).join('')}
  </tbody></table></div>
  <h2 class="dv-h2">4. Síntese integrativa do perfil de ${escV(prim)}</h2>
  <div class="dv-sintese"><p>${escV(prim)}, o seu perfil apresenta uma combinação de <b>Pico Duplo: ${escV(p1.nome)} (${tcPct(p1.pct)}) e ${escV(p2.nome)} (${tcPct(p2.pct)})</b>, somando ${tcPct(c.pico)} da sua energia vital. Isso revela o perfil de <b>${escV(par.arquetipo)}</b>. ${V(par.texto)} ${V(par.desafio)}${proximo}${plano}</p></div>
  <h2 class="dv-h2">5. Direcionamento terapêutico: plano de ação (7 áreas-chave)</h2>
  <div class="dv-plano">${acoes.map((a, i) => dvAcao(i + 1, a, V)).join('')}</div>
  <h2 class="dv-h2">6. Perguntas poderosas para autoinvestigação</h2>
  <ol class="dv-perguntas">${perguntas.map(q => `<li>${V(q)}</li>`).join('')}</ol>
  <h2 class="dv-h2">7. Considerações finais da terapeuta</h2>
  <div class="dv-final"><p><b>${dvQuerido(g)} ${escV(prim)},</b> você possui ${V(d1.talento)} e ${V(d2.talento)}. Lembre-se de que ${V(d1.lembrete)}. Permita-se ${V(d2.permissao)}, confie no valor da sua presença e aproveite a sua jornada com equilíbrio, orgulho e leveza!</p>
    <p class="dv-ass">${escV(dvAssinatura())}</p></div>
  ${dvCta('Esta devolutiva é propositalmente resumida.')}
  ${o.terapeuta ? dvLeituraClinica(o.respostas, o.nome, c) : ''}
</article>`;
}

/* DEVOLUTIVA DE CASAL. o = { a:{nome,genero,calc,respostas}, b:{...}, k, data, terapeuta } */
function dvCasal(o){
  const A = o.a, B = o.b, k = o.k, nA = tcPrim(A.nome), nB = tcPrim(B.nome);
  const pa = A.calc.ordem[0], pb = B.calc.ordem[0], da = DV[pa.id], db = DV[pb.id], ca = da.casal, cb = db.casal;
  const VA = s => escV(dvGen(dvT(s, { outro:nB, nome:nA }), A.genero));
  const VB = s => escV(dvGen(dvT(s, { outro:nA, nome:nB }), B.genero));
  const mesmo = pa.id === pb.id;
  const sintese = mesmo
    ? `O casal compartilha o mesmo traço mais forte, o <b>${escV(pa.nome)}</b>, e com ele ${VA(ca.forca)}. Os dois se reconhecem nesse jeito de funcionar; contudo, sob estresse, tendem a reforçar a mesma defesa um no outro: ambos ${VA(ca.reacaoCurta)}, gerando episódios de desgaste emocional e distanciamento.`
    : `O casal reúne ${VA(ca.forca)} (${escV(nA)}) e ${VB(cb.forca)} (${escV(nB)}), uma base valiosa para o projeto de vida a dois. Contudo, tende a viver um ciclo repetitivo em que a busca de ${escV(nA)} por ${VA(ca.busca)} colide com ${VB(cb.defesa)} de ${escV(nB)}, e a busca de ${escV(nB)} por ${VB(cb.busca)} esbarra em ${VA(ca.defesa)} de ${escV(nA)}, gerando episódios de desgaste emocional e distanciamento temporário.`;
  const espiral = mesmo
    ? `Esse circuito se fecha em uma espiral: quando um ${VA(ca.reacaoCurta)}, o outro reconhece a mesma ameaça e reage do mesmo jeito. A distância cresce sem que nenhum dos dois perceba, e cada um sente ${VA(ca.sente)} sozinho(a).`
    : `Esse circuito se fecha em uma espiral: quanto mais ${escV(nA)} ${VA(ca.reacaoCurta)}, mais ${escV(nB)} sente ${VB(cb.sente)} e ${VB(cb.reacaoCurta)}, o que, por sua vez, intensifica em ${escV(nA)} o sentimento de ${VA(ca.sente)}.`;
  const padrao = (n, cs, V) => `<div class="dv-card"><h3>Padrão de ${escV(n)}</h3><ul>
      <li><b>Gatilho:</b> ${V(cs.gatilho)}</li><li><b>Reação:</b> ${V(cs.reacao)}</li><li><b>Necessidade oculta:</b> ${V(cs.necessidade)}</li></ul></div>`;
  const orient = (n, cs, V, cls) => `<div class="dv-card ${cls}"><h3>Orientações para ${escV(n)}</h3><ul>
      <li><b>Dor central:</b> ${V(cs.dor)}</li><li><b>O que trabalhar:</b> ${V(cs.trabalhar)}</li><li><b>Direcionamento:</b> ${V(cs.direcao)}</li><li><b>Ação prática:</b> ${V(cs.acao)}</li></ul></div>`;
  const cmp = k.linhas.map(l => {
    const pkA = A.calc.ordem.slice(0, 2).some(x => x.id === l.id), pkB = B.calc.ordem.slice(0, 2).some(x => x.id === l.id);
    return `<tr><td data-r="Traço"><b>${escV(l.nome)}</b></td><td data-r="${escV(nA)}" class="${pkA ? 'pico' : ''}">${tcPct(l.p1)}</td><td data-r="${escV(nB)}" class="${pkB ? 'pico' : ''}">${tcPct(l.p2)}</td><td data-r="Recurso">${escV(tcTraco(l.id).recurso)}</td></tr>`;
  }).join('');
  const comum = k.emComum.length
    ? `<p><b>Onde vocês se encontram:</b> ${k.emComum.map(l => escV(l.nome)).join(' e ')} ${k.emComum.length > 1 ? 'estão' : 'está'} entre os dois traços mais fortes de cada um. Vocês se reconhecem nesse jeito de funcionar e também tendem a reforçar a mesma defesa um no outro.</p>`
    : '<p><b>Picos diferentes:</b> os dois traços mais fortes de vocês não se repetem. Cada um enxerga e reage ao mundo de um jeito, o que complementa, mas também pede tradução.</p>';
  const dif = `<p><b>Onde vocês mais se diferenciam:</b> ${k.diferencas.map(l => `${escV(l.nome)} (${escV(nA)} ${tcPct(l.p1)}, ${escV(nB)} ${tcPct(l.p2)})`).join('; ')}.</p>`;
  return `<article class="dv dv-casal" data-dv>
  <header class="dv-topo">
    <div><span class="dv-olho">Relatório de avaliação &amp; diagnóstico sistemático</span><h1>Devolutiva Terapêutica de Casal</h1></div>
    <dl><dt>Casal:</dt><dd>${escV(A.nome)} &amp; ${escV(B.nome)}</dd><dt>Data:</dt><dd>${escV(dvData(o.data))} · Terapeuta: ${escV(dvTerapeuta())}</dd>
      <dt>Modalidade:</dt><dd>Terapia Sistêmica de Casal</dd><dt>Metodologia:</dt><dd>${escV(TC_NOME)} (40 perguntas, cada um)</dd></dl>
  </header>
  <h2 class="dv-h2">1. Panorama geral e propósito da devolutiva</h2>
  <p>Esta devolutiva terapêutica sintetiza o mapeamento dos traços de caráter de <b>${escV(A.nome)}</b> e <b>${escV(B.nome)}</b>, a partir do ${escV(TC_NOME)} respondido por cada um. O objetivo central é oferecer uma leitura clara e objetiva sobre a estrutura do relacionamento, identificando as dinâmicas inconscientes que sustentam os conflitos, as dores individuais refletidas no vínculo e as fortalezas que o casal possui para reestruturar a convivência com mais sabedoria, empatia e cumplicidade.</p>
  <div class="dv-destaque"><h3>Síntese do diagnóstico relacional</h3><p>${sintese}</p></div>
  <h2 class="dv-h2">2. Os traços de caráter</h2>
  ${dvAlinhamento('')}
  <div class="dv-tabela"><table><thead><tr><th>Traço</th><th>A dor central</th><th>O recurso que ele traz</th></tr></thead><tbody>
    ${TC_TRACOS.map(t => `<tr><td data-r="Traço"><b>${escV(t.nome)}</b></td><td data-r="Dor central">${escV(t.dor)}</td><td data-r="Recurso">${escV(t.recurso)}</td></tr>`).join('')}
  </tbody></table></div>
  <h2 class="dv-h2">3. O mapa individual de cada um</h2>
  <div class="dv-dist">
    <div class="dv-tabela"><table><thead><tr><th>Traço</th><th>${escV(nA)}</th><th>${escV(nB)}</th><th>Recurso</th></tr></thead><tbody>${cmp}</tbody></table>
      <p class="dv-nota">Em destaque, os dois picos de cada um.</p></div>
    <div class="teia dv-teia"><canvas class="tc-teia" role="img" aria-label="Gráfico de teia com os traços de ${escV(nA)} e de ${escV(nB)} sobrepostos"></canvas>
      <div class="legenda"><span><i style="background:${TC_COR[1].linha};border-radius:3px"></i>${escV(nA)} (linha contínua)</span><span><i style="background:${TC_COR[2].linha};border-radius:3px"></i>${escV(nB)} (linha tracejada)</span></div></div>
  </div>
  <div class="dv-2col">
    <div>${dvPico(A.calc.ordem[0].id, A.calc.ordem[0].pct, 1, VA, nA)}${dvPico(A.calc.ordem[1].id, A.calc.ordem[1].pct, 2, VA, nA)}</div>
    <div>${dvPico(B.calc.ordem[0].id, B.calc.ordem[0].pct, 1, VB, nB)}${dvPico(B.calc.ordem[1].id, B.calc.ordem[1].pct, 2, VB, nB)}</div>
  </div>
  <div class="dv-destaque">${comum}${dif}</div>
  <h2 class="dv-h2">4. A dinâmica relacional: o ciclo interativo</h2>
  <p>Toda relação desenvolve uma "dança" interpessoal. No caso de ${escV(nA)} e ${escV(nB)}, identificamos o seguinte padrão sistêmico de interconexão:</p>
  <div class="dv-2col">${padrao(nA, ca, VA)}${padrao(nB, cb, VB)}</div>
  <p class="dv-nota"><i>Nota da terapeuta: ${espiral}</i></p>
  <h2 class="dv-h2">5. Mapeamento individual de dores e vulnerabilidades</h2>
  <p>Para compreender o casal, é fundamental olhar para cada um. As histórias de vida e as feridas emocionais atuam como lentes através das quais cada um interpreta as atitudes do parceiro.</p>
  <div class="dv-2col">${orient(nA, ca, VA, 'dv-a')}${orient(nB, cb, VB, 'dv-b')}</div>
  <h2 class="dv-h2">6. Matriz de mapeamento de dores x ações de cura</h2>
  <p>O cruzamento dos pontos de tensão mais prováveis no relacionamento e o caminho terapêutico indicado para superá-los:</p>
  <div class="dv-tabela"><table class="dv-matriz"><thead><tr><th>Área de tensão</th><th>Manifestação no casal</th><th>Intervenção sugerida</th></tr></thead><tbody>
    ${DV_AREAS.map(ar => `<tr><td data-r="Área"><b>${ar.nome}</b></td><td data-r="No casal">${escV(nA)} ${VA(da.areas[ar.id])}; ${escV(nB)} ${VB(db.areas[ar.id])}.</td><td data-r="Intervenção">${escV(ar.intervencao)}</td></tr>`).join('')}
  </tbody></table></div>
  <h2 class="dv-h2">7. Plano de direcionamento terapêutico de casal</h2>
  <p>Para os próximos meses do processo terapêutico, o plano de trabalho estará focado na consolidação de novos hábitos relacionais e no fortalecimento da segurança emocional do casal. Estabelecemos três pilares prioritários:</p>
  <div class="dv-caixa"><h3>Pilares do tratamento terapêutico</h3><ol>
    <li><b>Construção do "Lugar Seguro":</b> desenvolver um espaço em que ${escV(nA)} possa ${VA(ca.necessidadeCurta)} e ${escV(nB)} possa ${VB(cb.necessidadeCurta)}, sem receio de retaliação, julgamento ou invalidação.</li>
    <li><b>Desmontagem dos gatilhos de defesa:</b> treinar o reconhecimento precoce dos sinais físicos e emocionais do estresse (em ${escV(nA)}, ${VA(ca.gatilhoCurto)}; em ${escV(nB)}, ${VB(cb.gatilhoCurto)}) para interromper o ciclo de reação automática.</li>
    <li><b>Reconstrução da cumplicidade:</b> cultivar o interesse genuíno pelo mundo interno do outro, valorizando ${VA(ca.forca)} de ${escV(nA)} e ${VB(cb.forca)} de ${escV(nB)}.</li>
  </ol></div>
  <h2 class="dv-h2">8. Considerações finais e compromisso mútuo</h2>
  <p>O prognóstico para o relacionamento de ${escV(nA)} e ${escV(nB)} é favorável quando os dois se dispõem a olhar para os próprios traços. Existe uma base genuína de cuidado e de interesse mútuo. Os obstáculos atuais não derivam da ausência de amor, mas da repetição de padrões de defesa aprendidos ao longo da vida (o ${escV(pa.nome)} de ${escV(nA)}${mesmo ? '' : ' e o ' + escV(pb.nome) + ' de ' + escV(nB)}${mesmo ? ' e de ' + escV(nB) : ''}) e ativados pelo estresse do dia a dia.</p>
  <p>A transformação do casal exigirá a disposição individual de olhar para as próprias vulnerabilidades sem culpar o outro, assumindo a responsabilidade pela parte que cabe a cada um na dinâmica do relacionamento.</p>
  <div class="dv-acordo"><h3>Acordo terapêutico de engajamento</h3>
    <p>"Comprometemo-nos a praticar a escuta empática, respeitar as pausas necessárias e acolher a vulnerabilidade um do outro no processo de renovação da nossa aliança."</p>
    <div class="dv-assinaturas"><span>${escV(A.nome)}</span><span>${escV(B.nome)}</span></div></div>
  <p class="dv-ass">${escV(dvAssinatura())}</p>
  ${dvCta('Esta devolutiva do casal é propositalmente resumida.')}
  ${o.terapeuta ? `<div class="dv-2col dv-sem-print">${dvLeituraClinica(A.respostas, A.nome, A.calc).replace('Leitura para a terapeuta', 'Leitura para a terapeuta · ' + escV(nA))}${dvLeituraClinica(B.respostas, B.nome, B.calc).replace('Leitura para a terapeuta', 'Leitura para a terapeuta · ' + escV(nB))}</div>` : ''}
</article>`;
}

/* ---- barra de ações: PDF, editar o texto e tratamento ---- */
function dvBarra(terapeuta, genero){
  return `<div class="dv-barra dv-sem-print">
    <button type="button" class="mini-btn" data-dv-pdf>Baixar em PDF</button>
    ${terapeuta ? `<button type="button" class="mini-btn" data-dv-editar>Editar o texto</button>
    <label class="dv-trat">Tratamento <select data-dv-genero><option value="">neutro</option><option value="f"${genero === 'f' ? ' selected' : ''}>feminino</option><option value="m"${genero === 'm' ? ' selected' : ''}>masculino</option></select></label>` : ''}
  </div>`;
}
function dvImprimir(raiz){
  const dv = raiz.querySelector('[data-dv]'); if(!dv) return;
  const copia = dv.cloneNode(true);
  const orig = dv.querySelectorAll('canvas'), cop = copia.querySelectorAll('canvas');
  cop.forEach((cv, i) => { try{ const img = new Image(); img.src = orig[i].toDataURL('image/png'); img.className = 'dv-teia-img'; cv.replaceWith(img); }catch(e){} });
  copia.removeAttribute('contenteditable'); copia.querySelectorAll('[contenteditable]').forEach(x => x.removeAttribute('contenteditable'));
  const caixa = document.createElement('div'); caixa.id = 'dv-impressao'; caixa.appendChild(copia);
  document.body.appendChild(caixa); document.body.classList.add('dv-imprimindo');
  const fim = () => { document.body.classList.remove('dv-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('dv-impressao')) fim(); }, 1500); }, 150);
}
/* liga os botões da barra; aoTrocarGenero(g) redesenha a devolutiva com o novo tratamento */
function dvLigar(raiz, aoTrocarGenero){
  const pdf = raiz.querySelector('[data-dv-pdf]'); if(pdf) pdf.addEventListener('click', () => dvImprimir(raiz));
  const ed = raiz.querySelector('[data-dv-editar]');
  if(ed) ed.addEventListener('click', () => {
    const dv = raiz.querySelector('[data-dv]'), on = dv.getAttribute('contenteditable') !== 'true';
    dv.setAttribute('contenteditable', on ? 'true' : 'false'); dv.classList.toggle('dv-editando', on);
    ed.textContent = on ? 'Terminar a edição' : 'Editar o texto'; if(on) dv.focus();
  });
  const gs = raiz.querySelector('[data-dv-genero]'); if(gs && aoTrocarGenero) gs.addEventListener('change', () => aoTrocarGenero(gs.value));
}

/* ============================================================================
   AÇÕES DA TERAPEUTA no resultado do Caráter Comportamental (iguais às do Teste de Travas):
   WhatsApp, e-mail (para ela e para o cliente), apresentação, copiar a ficha e PDF.
   ============================================================================ */
/* textos da "Gerar apresentação" quando ela vem do Caráter Comportamental */
const DV_VOC = { pct:true, teste:'Teste de Caráter Comportamental', item:'traço', itens:'traços',
  capaTit:'o seu mapa de caráter e o caminho para o equilíbrio.', capaSub:'Plano para trabalhar os traços que mais pesam em você hoje.',
  mapaTit:'Os seus 5 traços de caráter', caminhoTit:'Como vamos trabalhar os seus traços',
  fase1:'Começamos pelo seu pico primário. Como trabalhamos: ', fase2:'Seguimos para o pico secundário, integrando os dois. Como trabalhamos: ',
  evol:'Cada teste mostra, em números, como os seus traços estão se equilibrando.',
  altoTxt:'em pico: os traços que mais comandam o seu jeito de ser hoje.', baixoTxt:'traços de suporte: recursos que já sustentam você.',
  destaque:'É o seu pico primário, o primeiro a ser trabalhado.',
  dica:'Tudo o que aparece na apresentação (os traços, as porcentagens e os picos) vem do teste desta pessoa.',
  objDinheiro:'O que se paga em padrões que se repetem costuma custar mais, todos os dias.',
  objTentei:'Trabalhamos os traços que mais pesam em você, um de cada vez.' };
const DV_LIB = {
  esquizoide:{ x:'pertencimento', y:'capacidade', resumo:'A sua mente cria e enxerga longe, mas o medo de incomodar faz você se recolher e guardar as ideias.', custo:'Ideias que não saem do papel e a sensação de não pertencer, mesmo perto de quem você ama.', imagine:['Você coloca as suas ideias no mundo sem pedir licença.', 'Estar com as pessoas deixa de cansar e passa a nutrir.'] },
  oral:{ x:'nutrição interna', y:'força', resumo:'Você cuida de todos com o coração, mas busca fora o afeto que ainda não aprendeu a se dar.', custo:'Cansaço, carência e a sensação de dar muito e receber pouco.', imagine:['Você pede o que precisa, com clareza e sem culpa.', 'A sua energia volta, porque você também se cuida.'] },
  psicopata:{ x:'confiança', y:'competência', resumo:'Você lidera e resolve, mas o medo de ser passado para trás faz você controlar tudo e esconder a fragilidade.', custo:'Tensão constante, sobrecarga e relações em que é difícil baixar a guarda.', imagine:['Você delega sem perder o sono.', 'Mostrar o que sente deixa de parecer fraqueza.'] },
  masoquista:{ x:'leveza', y:'força', resumo:'Você sustenta tudo com lealdade e resistência, mas engole o que sente e carrega o peso dos outros.', custo:'Corpo tenso, mágoas guardadas e dificuldade de dizer "não".', imagine:['Você diz "não" sem culpa, e o corpo agradece.', 'O prazer volta a ter espaço na sua rotina.'] },
  rigido:{ x:'permissão', y:'desempenho', resumo:'Você realiza muito e com qualidade, mas se cobra perfeição e tem dificuldade de relaxar.', custo:'Exaustão, autocrítica constante e a sensação de nunca ser suficiente.', imagine:['Você celebra o que fez antes de olhar o que falta.', 'Descansar deixa de ser culpa e vira parte do resultado.'] }
};
const DV_TEC = {
  esquizoide:'trazer você de volta para o corpo e para as relações, com segurança, para que as suas ideias ganhem o mundo.',
  oral:'fortalecer a sua nutrição interna e o pedido claro, para você receber sem precisar se esvaziar.',
  psicopata:'construir confiança sem controle e espaço para a vulnerabilidade, sem perder a sua força.',
  masoquista:'soltar o que está guardado no corpo, aprender a dizer "não" e abrir espaço para o prazer.',
  rigido:'flexibilizar a autocobrança e ensinar o corpo a descansar, mantendo a sua excelência.'
};
function dvQuem(){ return typeof T_A !== 'undefined' ? T_A : 'a ' + PRIM_TER; }
/* a devolutiva em texto, para e-mail e para copiar (tudo = inclui a leitura da terapeuta) */
function dvTexto(raiz, tudo){
  const dv = raiz && raiz.querySelector('[data-dv]'); if(!dv) return '';
  const c = dv.cloneNode(true);
  if(!tudo) c.querySelectorAll('.dv-sem-print').forEach(x => x.remove());
  c.querySelectorAll('canvas,.teia,.legenda,.dv-so-print').forEach(x => x.remove());
  c.querySelectorAll('h2').forEach(x => x.insertAdjacentText('beforebegin', '\n'));
  c.querySelectorAll('li').forEach(x => x.insertAdjacentText('afterbegin', '• '));
  c.querySelectorAll('td,th').forEach(x => x.insertAdjacentText('afterend', ' | '));
  c.querySelectorAll('h1,h2,h3,h4,p,li,tr,dt,dd,.dv-pico-topo,.dv-assinaturas span').forEach(x => x.insertAdjacentText('afterend', '\n'));
  return c.textContent.replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function dvZapNum(t){ let d = String(t || '').replace(/\D/g, ''); if(d.length === 10 || d.length === 11) d = '55' + d; return d.length >= 12 && d.length <= 13 ? d : ''; }
function dvFone(t){ const d = String(t || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''); return d.length >= 10 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4) : ''; }
/* o = { pessoas:[{nome, whatsapp, email, genero, calc}], codigo, data, casal, area (onde está a devolutiva) } */
function dvAcoes(el, o){
  if(!el) return;
  const ps = o.pessoas, prim = p => tcPrim(p.nome), casal = !!o.casal;
  const svg = (document.querySelector('#btn-zap-resultado svg, .btn-zap svg') || {}).outerHTML || '';
  let h = '<div class="dv-acoes dv-sem-print">';
  ps.forEach((p, i) => { h += `<a class="btn btn-zap" data-dv-zap="${i}" href="#" target="_blank" rel="noopener">${svg}<span class="duas">Falar com ${escV(prim(p))} no WhatsApp<small>${escV(dvFone(p.whatsapp) || 'escolher contato')} · mensagem já escrita</small></span></a>`; });
  h += `<button type="button" class="btn btn-argila" data-dv-email="eu"><span class="duas">Enviar para o meu e-mail<small>${escV(CONFIG.emailTerapeuta || '')}</small></span></button>`;
  ps.forEach((p, i) => { if(p.email) h += `<button type="button" class="btn btn-contorno" data-dv-email="${i}"><span class="duas">Enviar para ${escV(prim(p))}<small>${escV(p.email)}</small></span></button>`; });
  ps.forEach((p, i) => { h += `<button type="button" class="btn btn-argila" data-dv-apres="${i}"><span class="duas">Gerar apresentação<small>plano de acompanhamento para ${escV(prim(p))}</small></span></button>`; });
  h += '<button type="button" class="btn btn-contorno" data-dv-copiar>Copiar a ficha completa</button><button type="button" class="btn btn-contorno" data-dv-imprimir>Salvar em PDF ou imprimir</button></div>';
  el.innerHTML = h;
  const nomes = ps.map(p => p.nome).join(' e ');
  el.querySelectorAll('[data-dv-zap]').forEach(a => {
    const p = ps[+a.dataset.dvZap], c = p.calc, par = DV_PARES[dvPar(c.ordem[0].id, c.ordem[1].id)];
    const msg = casal
      ? ['Oi, ' + prim(p) + '! Aqui é ' + dvQuem() + '.', '', 'A devolutiva de vocês dois do ' + TC_NOME + ' está pronta. Ela mostra como os traços de cada um se encontram na relação e o caminho para vocês se entenderem melhor.', '', 'Quero apresentar com calma o que ela mostra. Qual o melhor horário para conversarmos?'].join('\n')
      : ['Oi, ' + prim(p) + '! Aqui é ' + dvQuem() + '.', '', 'A sua devolutiva do ' + TC_NOME + ' está pronta. Os seus dois picos são ' + c.ordem[0].nome + ' (' + tcPct(c.ordem[0].pct) + ') e ' + c.ordem[1].nome + ' (' + tcPct(c.ordem[1].pct) + '): um perfil de ' + par.arquetipo + '.', '', 'Quero te apresentar com calma o que isso significa e os próximos passos. Qual o melhor horário para conversarmos?'].join('\n');
    a.href = 'https://wa.me/' + dvZapNum(p.whatsapp) + '?text=' + encodeURIComponent(msg);
  });
  el.querySelectorAll('[data-dv-email]').forEach(b => b.addEventListener('click', async () => {
    const eu = b.dataset.dvEmail === 'eu', destino = eu ? CONFIG.emailTerapeuta : ps[+b.dataset.dvEmail].email;
    const corpo = dvTexto(o.area, eu), assunto = TC_NOME + ' — ' + nomes + (o.data ? ' (' + dvData(o.data) + ')' : '');
    const rotulo = b.innerHTML; b.disabled = true; b.textContent = 'Enviando...';
    let ok = false;
    try{ if(typeof modoLocal !== 'function' || !modoLocal()){ const r = await api(ACOES.enviarEmail, { destino, assunto, corpo, codigo:o.codigo }); ok = !!(r && r.ok !== false); } }catch(e){ ok = false; }
    b.disabled = false;
    if(ok){ b.textContent = 'E-mail enviado para ' + destino; setTimeout(() => { b.innerHTML = rotulo; }, 3000); return; }
    b.innerHTML = rotulo;
    location.href = 'mailto:' + encodeURIComponent(destino) + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo.slice(0, 1800));
  }));
  el.querySelectorAll('[data-dv-apres]').forEach(b => b.addEventListener('click', () => {
    const p = ps[+b.dataset.dvApres];
    apresAbrir({ nome:p.nome, prim:prim(p), genero:p.genero || '', idade:'', motivo:'', dor:'', olhar:'', atencao:0,
      travas:p.calc.ordem.map((x, i) => ({ id:x.id, nome:x.nome, nota:x.pct, nivel:i < 2 ? 'alta' : 'baixa' })) }, { lib:DV_LIB, tec:DV_TEC, voc:DV_VOC });
  }));
  const cp = el.querySelector('[data-dv-copiar]');
  cp.addEventListener('click', async () => {
    try{ await navigator.clipboard.writeText(dvTexto(o.area, true)); cp.textContent = 'Ficha copiada!'; }catch(e){ cp.textContent = 'Não consegui copiar'; }
    setTimeout(() => { cp.textContent = 'Copiar a ficha completa'; }, 2200);
  });
  el.querySelector('[data-dv-imprimir]').addEventListener('click', () => dvImprimir(o.area));
}

/* ============================================================================
   PÁGINA INICIAL com os dois testes (Travas + Caráter Comportamental)
   ============================================================================ */
function dvCapaDoisTestes(){
  const capa = document.getElementById('tela-capa'); if(!capa || capa.dataset.doisTestes) return;
  capa.dataset.doisTestes = '1';
  const quem = dvQuem(), lt = capa.querySelector('.lado-texto') || capa;
  const selo = lt.querySelector('.selo'); if(selo) selo.textContent = 'Teste de Travas Mentais · Teste de Caráter Comportamental';
  const h1 = lt.querySelector('h1'); if(h1) h1.textContent = 'O que te trava hoje, e como a sua história moldou o seu jeito de ser?';
  const ps = lt.querySelectorAll('.texto-capa');
  if(ps[1]) ps[1].innerHTML = 'Aqui você encontra dois testes. O <b>Teste de Travas Mentais</b> mapeia 10 travas e mostra, em números, quais estão mais ativas em você hoje. O <b>Teste de Caráter Comportamental</b> identifica os 5 traços de caráter que se formaram na sua história e como eles aparecem no seu dia a dia. Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d' + escV(quem) + '.';
  const ul = lt.querySelector('.lista-leve');
  if(ul) ul.innerHTML = '<li>Teste de Travas Mentais: 50 perguntas, de 10 a 15 minutos</li><li>Teste de Caráter Comportamental: 40 afirmações, de 8 a 12 minutos, individual ou casal</li>' +
    '<li>O código que você recebeu já abre o teste certo</li><li>O resultado vai direto para ' + escV(quem) + ', para vocês conversarem a partir dele</li>';
  document.title = 'Teste de Travas Mentais e Teste de Caráter Comportamental' + (window.T_NOME ? ' · ' + T_NOME : '');
}
