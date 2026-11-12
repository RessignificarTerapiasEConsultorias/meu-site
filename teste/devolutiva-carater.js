/* ============================================================================
   DEVOLUTIVA DO TESTE DE TRAÇOS DE CARÁTER (individual e casal)
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
    <div class="dv-assinaturas">${dvCelAssinatura(o, 1, A.nome)}${dvCelAssinatura(o, 2, B.nome)}</div></div>
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
   AÇÕES DA TERAPEUTA no resultado do Traços de Caráter (iguais às do Teste de Travas):
   WhatsApp, e-mail (para ela e para o cliente), apresentação, copiar a ficha e PDF.
   ============================================================================ */
/* textos da "Gerar apresentação" quando ela vem do Traços de Caráter */
const DV_VOC = { pct:true, teste:'Teste de Traços de Caráter', item:'traço', itens:'traços',
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
   PÁGINA INICIAL com os dois testes (Travas + Traços de Caráter)
   ============================================================================ */
function dvCapaDoisTestes(){
  const capa = document.getElementById('tela-capa'); if(!capa || capa.dataset.doisTestes) return;
  capa.dataset.doisTestes = '1';
  const quem = dvQuem(), lt = capa.querySelector('.lado-texto') || capa;
  const selo = lt.querySelector('.selo'); if(selo) selo.textContent = 'Teste de Travas Mentais · Teste de Traços de Caráter';
  const h1 = lt.querySelector('h1'); if(h1) h1.textContent = 'O que te trava hoje, e como a sua história moldou o seu jeito de ser?';
  const ps = lt.querySelectorAll('.texto-capa');
  if(ps[1]) ps[1].innerHTML = 'Aqui você encontra dois testes. O <b>Teste de Travas Mentais</b> mapeia 10 travas e mostra, em números, quais estão mais ativas em você hoje. O <b>Teste de Traços de Caráter</b> identifica os 5 traços de caráter que se formaram na sua história e como eles aparecem no seu dia a dia. Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d' + escV(quem) + '.';
  const ul = lt.querySelector('.lista-leve');
  if(ul) ul.innerHTML = '<li>Teste de Travas Mentais: 50 perguntas, de 10 a 15 minutos</li><li>Teste de Traços de Caráter: 40 afirmações, de 8 a 12 minutos, individual ou casal</li>' +
    '<li>O código que você recebeu já abre o teste certo</li><li>O resultado vai direto para ' + escV(quem) + ', para vocês conversarem a partir dele</li>';
  document.title = 'Teste de Travas Mentais e Teste de Traços de Caráter' + (window.T_NOME ? ' · ' + T_NOME : '');
}


/* ============================================================================
   ASSINATURA DO ACORDO (casal): cada um assina a sua parte, quando quiser, pelo mesmo link
   o.assin = { 1:{img, em}, 2:{img, em} }   o.podeAssinar = [slots que este aparelho pode assinar]
   ============================================================================ */
function dvCelAssinatura(o, slot, nome){
  const a = (o.assin || {})[slot] || {}, pode = (o.podeAssinar || []).indexOf(slot) > -1;
  const base = a.img ? `<img class="dv-ass-img" src="${escV(a.img)}" alt="Assinatura de ${escV(nome)}">` : '<div class="dv-ass-vazio"></div>';
  const rodape = a.em ? `<small>Assinado em ${escV(dvData(String(a.em).slice(0, 10)))}</small>`
    : pode ? `<button type="button" class="btn btn-argila dv-sem-print dv-ass-btn" data-dv-assinar="${slot}">Assinar</button>`
    : '<small class="dv-sem-print">aguardando assinatura</small>';
  return `<div class="dv-ass-cel">${base}<span>${escV(nome)}</span>${rodape}</div>`;
}
const DV_ACORDO = '"Comprometemo-nos a praticar a escuta empática, respeitar as pausas necessárias e acolher a vulnerabilidade um do outro no processo de renovação da nossa aliança."';
/* tela de assinatura: desenhar com o dedo ou o mouse. aoConfirmar(png) devolve uma promessa */
function dvAbrirAssinatura(nome, aoConfirmar){
  const fundo = document.createElement('div'); fundo.className = 'dv-pad-fundo';
  fundo.setAttribute('role', 'dialog'); fundo.setAttribute('aria-modal', 'true'); fundo.setAttribute('aria-labelledby', 'dv-pad-tit');
  fundo.innerHTML = `<div class="dv-pad">
      <h2 id="dv-pad-tit">Assinatura de ${escV(nome)}</h2>
      <p class="dv-pad-acordo">${escV(DV_ACORDO)}</p>
      <p class="dv-pad-dica">Assine com o dedo (ou com o mouse) no espaço abaixo.</p>
      <div class="dv-pad-area"><canvas class="dv-pad-tela" aria-label="Espaço para assinar"></canvas><span class="dv-pad-x" aria-hidden="true">✕</span></div>
      <div class="dv-pad-nome">${escV(nome)}</div>
      <label class="dv-pad-ok"><input type="checkbox" id="dv-pad-ok"> <span>Li e concordo com o acordo acima.</span></label>
      <p class="dv-pad-aviso" id="dv-pad-aviso" role="alert"></p>
      <div class="dv-pad-acoes">
        <button type="button" class="btn btn-contorno" data-pad="limpar">Limpar</button>
        <button type="button" class="btn btn-contorno" data-pad="cancelar">Cancelar</button>
        <button type="button" class="btn btn-primario" data-pad="ok">Confirmar assinatura</button>
      </div></div>`;
  document.body.appendChild(fundo); document.body.classList.add('dv-pad-aberto');
  const cv = fundo.querySelector('canvas'), ctx = cv.getContext('2d'), aviso = fundo.querySelector('#dv-pad-aviso');
  let tracos = 0, desenhando = false, ult = null;
  const ajustar = () => {
    const r = cv.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.6; ctx.strokeStyle = '#1B1B1B';
    tracos = 0;
  };
  ajustar();
  const pos = e => { const r = cv.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top }; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); desenhando = true; ult = pos(e); ctx.beginPath(); ctx.arc(ult.x, ult.y, 1.2, 0, Math.PI * 2); ctx.fillStyle = '#1B1B1B'; ctx.fill(); tracos++; });
  cv.addEventListener('pointermove', e => { if(!desenhando) return; e.preventDefault(); const p = pos(e); ctx.beginPath(); ctx.moveTo(ult.x, ult.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ult = p; tracos++; });
  const parar = () => { desenhando = false; };
  cv.addEventListener('pointerup', parar); cv.addEventListener('pointercancel', parar); cv.addEventListener('pointerleave', parar);
  const fechar = () => { fundo.remove(); document.body.classList.remove('dv-pad-aberto'); };
  /* recorta só o desenho, com uma pequena margem, e reduz para no máximo 600 px de largura */
  const exportar = () => {
    const w = cv.width, h = cv.height, px = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) if(px[(y * w + x) * 4 + 3] > 10){ if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
    if(x1 < 0) return '';
    const m = 12; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, esc = Math.min(1, 600 / cw);
    const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(cw * esc)); out.height = Math.max(1, Math.round(ch * esc));
    out.getContext('2d').drawImage(cv, x0, y0, cw, ch, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  };
  fundo.addEventListener('click', async e => {
    const b = e.target.closest('[data-pad]'); if(!b) return;
    if(b.dataset.pad === 'limpar'){ ctx.clearRect(0, 0, cv.width, cv.height); tracos = 0; aviso.textContent = ''; return; }
    if(b.dataset.pad === 'cancelar'){ fechar(); return; }
    if(tracos < 6){ aviso.textContent = 'Desenhe a sua assinatura no espaço acima.'; return; }
    if(!fundo.querySelector('#dv-pad-ok').checked){ aviso.textContent = 'Para assinar, marque que você leu e concorda com o acordo.'; return; }
    const png = exportar(); if(!png){ aviso.textContent = 'Desenhe a sua assinatura no espaço acima.'; return; }
    b.disabled = true; b.textContent = 'Salvando...'; aviso.textContent = '';
    try{ await aoConfirmar(png); fechar(); }
    catch(err){ b.disabled = false; b.textContent = 'Confirmar assinatura'; aviso.textContent = (err && err.message) || 'Não consegui salvar agora. Tente de novo.'; }
  });
}


/* ============================================================================
   PÁGINA INICIAL DE VENDAS, conforme os testes da terapeuta:
   'ambos' (Travas + Traços de Caráter, individual e casal) · 'travas' (só o Teste de Travas) · 'tracos' (só o de Traços)
   Ligada para todas as páginas (desliga com travas_paginas.dados.capa_vendas = false). No site da Tatiana, sempre.
   O campo do código continua no topo: quem já recebeu o código entra direto.
   ============================================================================ */
const CV_IMG = 'https://ressignificarterapiaseconsultorias.com/teste/img/';
/* acesso da terapeuta no topo da página: abre a mesma área do link do rodapé (entrar com a senha) */
const CV_CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zm2 0V8a4 4 0 0 1 8 0v3"/></svg>';
/* área da terapeuta (páginas do domínio Ressignificar): botão para editar a página (textos, foto e cores) */
function dvBotaoEditar(){
  if(!dvCad() || document.getElementById('dv-editar')) return;
  const cab = document.querySelector('#painel-admin .cabecalho-admin'); if(!cab) return;
  cab.insertAdjacentHTML('afterend', '<div class="dv-editar-linha nao-imprimir"><a class="dv-editar" id="dv-editar" href="/teste/editar/">✎ Editar minha página <small>texto, foto e cores</small></a></div>');
}
function dvBotaoArea(capa){
  const la = document.getElementById('link-admin');
  if(!capa || !la || document.getElementById('cv-area')) return;
  const rot = la.textContent.trim() || 'Área da terapeuta';
  capa.insertAdjacentHTML('afterbegin', `<div class="cv-topo"><a href="#" class="cv-area" id="cv-area" aria-label="${escV(rot)}: entrar com a senha">${CV_CADEADO}<span>${escV(rot)}</span><small>Entrar</small></a></div>`);
  document.getElementById('cv-area').addEventListener('click', e => { e.preventDefault(); la.click(); });
}
const CV_ZAP_SVG ='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.8-.7c-3.1-1.3-5.1-4.5-5.3-4.7-.2-.2-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l1 2.3c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2.2 1c.3.2.5.2.6.4.1.1.1.7-.1 1.3z"/></svg>';
const mpJuntar = itens => { itens = itens.filter(Boolean); return itens.length > 1 ? itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1] : (itens[0] || ''); };
function dvCapaVendas(modo){
  /* modo: 'travas', 'tracos', 'mpcc', 'ambos' (travas + traços) ou uma lista com os testes da terapeuta.
     Testes extras (Mente Serena, Esquemas e TDAH da Miralene) chegam em window.CV_EXTRA, cada um com os seus textos. */
  const EX = window.CV_EXTRA || {};
  const lista = Array.isArray(modo) ? modo.filter(k => k === 'travas' || k === 'tracos' || k === 'mpcc' || EX[k])
    : (modo === 'travas' || modo === 'tracos' || modo === 'mpcc') ? [modo] : ['travas', 'tracos'];
  if(!lista.length) return;
  const tem = k => lista.indexOf(k) > -1;
  const extras = lista.filter(k => EX[k]), comExtras = extras.length > 0;
  const NUM = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito'], maius = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ambos = lista.length > 1, soTravas = lista.length === 1 && tem('travas'), soTracos = lista.length === 1 && tem('tracos'), soMpcc = lista.length === 1 && tem('mpcc'), casal = tem('tracos');
  const capa = document.getElementById('tela-capa'); if(!capa || capa.classList.contains('capa-vendas')) return;
  const lt = capa.querySelector('.lado-texto'), cartao = lt && lt.querySelector('.cartao'), rodape = capa.querySelector('.rodape');
  if(!lt || !cartao || !rodape) return;
  if(ambos && tem('travas') && tem('tracos') && !tem('mpcc') && !comExtras) dvCapaDoisTestes();
  capa.classList.add('capa-vendas'); document.body.classList.add('cv-on');
  dvBotaoArea(capa);
  const dd = dvCad(), prim = s => String(s || '').trim().split(' ')[0];
  const quem = dvQuem();
  const apelido = (dd && dd.nome_curto) ? prim(dd.nome_curto) : (typeof T_PRIM !== 'undefined' && T_PRIM) || (dd && (dd.primeiro || prim(dd.nome))) || prim(dvTerapeuta()) || PRIM_TER;
  const comQuem = (/^o /i.test(quem) ? 'o ' : 'a ') + apelido;
  const foto = (capa.querySelector('.moldura img') || {}).src || '';
  const num = typeof CONFIG !== 'undefined' ? (CONFIG.whatsappNumero || '') : '';
  const zap = msg => 'https://wa.me/' + num + '?text=' + encodeURIComponent('Olá, ' + apelido + '! Vim pelo seu site de testes e ' + msg);
  const nomeTeste = soTravas ? 'o Teste de Travas Mentais' : soTracos ? 'o Teste de Traços de Caráter' : soMpcc ? 'o MPCC (Mapa de Perfil Comportamental e Competências)' : 'o meu teste';
  const Z = { ind:zap('quero fazer ' + nomeTeste + '. Como recebo o meu código?'), casal:zap('quero fazer o teste em casal. Como funciona para nós dois?'),
    duvida:zap('tenho uma dúvida sobre o teste.'),
    travas:zap('quero fazer o Teste de Travas Mentais. Como recebo o meu código?'), tracos:zap('quero fazer o Teste de Traços de Caráter. Como recebo o meu código?'),
    mpcc:zap('quero fazer o MPCC, o Mapa de Perfil Comportamental e Competências. Como recebo o meu código?') };
  extras.forEach(k => { Z[k] = zap(EX[k].zap); });
  const ext = 'target="_blank" rel="noopener"';
  const bt = (cls, href, tit, sub, icone) => `<a class="btn ${cls} cv-btn" href="${href}" ${ext}>${icone ? CV_ZAP_SVG : ''}<span class="duas">${tit}<small>${sub}</small></span></a>`;
  const ctas = id => `<div class="cv-ctas" id="${id}">${bt('btn-primario', Z.ind, 'Quero fazer o meu teste', 'fale com ' + escV(comQuem) + ' e receba o seu código', true)}` +
    (casal ? bt('btn-contorno', Z.casal, 'Quero fazer em casal', 'cada um no seu tempo, com o mesmo código') : bt('btn-contorno', Z.duvida, 'Tirar uma dúvida', 'pelo WhatsApp, sem compromisso')) + '</div>';

  /* topo: promessa curta, provas rápidas e as chamadas; o código fica logo abaixo */
  const h1 = lt.querySelector('h1');
  if(h1) h1.innerHTML = soTracos ? 'Você repete os mesmos padrões? <em>Descubra como a sua história moldou o seu jeito de ser.</em>'
                                 : soMpcc ? 'Você sabe do que é capaz? <em>Descubra onde já é forte e onde pode crescer.</em>'
                                 : 'Você sabe o que quer mudar. <em>Então por que algo sempre puxa você de volta?</em>';
  const selo = lt.querySelector('.selo');
  const ROT = { travas:'Teste de Travas Mentais', tracos:'Teste de Traços de Caráter', mpcc:'MPCC' };
  extras.forEach(k => { ROT[k] = EX[k].rot; });
  if(selo) selo.textContent = soMpcc ? 'MPCC · Mapa de Perfil Comportamental e Competências' : lista.length > 3 ? maius(NUM[lista.length] || lista.length) + ' testes de autoconhecimento' : lista.map(k => ROT[k]).join(' · ');
  lt.querySelectorAll('.texto-capa, .lista-leve').forEach(x => x.remove());
  const lead = soTravas
    ? 'Quase sempre é uma trava mental: um padrão antigo que age sem pedir licença no trabalho, nas relações e nas decisões do dia a dia. Em poucos minutos, você descobre <b>quais travas estão mais ativas em você hoje</b>, em números.'
    : soTracos
    ? 'Desde a infância, o corpo e a mente aprendem a se proteger, e esses jeitos de se proteger viram traços que aparecem até hoje nas suas relações e decisões. Em poucos minutos, você descobre <b>como a sua história moldou o seu jeito de ser</b>. Sozinho(a) ou em casal.'
    : soMpcc
    ? 'Iniciativa, comunicação, decisão, adaptação, organização, autoconfiança: cada um de nós é mais forte em algumas áreas e mais travado em outras, quase sempre sem perceber. Em poucos minutos, você descobre <b>onde já é forte</b> e <b>onde pode crescer</b>, em um mapa de 8 dimensões.'
    : 'Quase sempre é um padrão antigo, que age sem pedir licença no trabalho, nas relações e nas decisões do dia a dia. ' + (comExtras ? 'No seu tempo, você descobre ' : 'Em poucos minutos, você descobre ') +
      mpJuntar([tem('travas') ? '<b>o que trava você hoje</b>' : '', tem('tracos') ? '<b>como a sua história moldou o seu jeito de ser</b>' : '', tem('mpcc') ? '<b>onde você já é forte e onde pode crescer</b>' : ''].concat(extras.map(k => EX[k].descobre))) + '.' + (casal ? ' Sozinho(a) ou em casal.' : '');
  const chips = [soTravas || soMpcc ? 'No celular, de 10 a 15 minutos' : soTracos ? 'No celular, de 8 a 12 minutos' : comExtras ? 'No celular, no seu tempo' : 'No celular, de 8 a 15 minutos',
    'Só ' + escV(quem) + ' vê as suas respostas', soTravas ? 'Resultado em números' : soMpcc ? 'Mapa em gráfico radar' : casal ? 'Individual ou em casal' : 'Resultado em números e gráfico'];
  const ass = lt.querySelector('.assinatura');
  (ass || h1).insertAdjacentHTML('afterend', `<p class="cv-lead">${lead}</p><ul class="cv-chips">${chips.map(c => '<li>' + c + '</li>').join('')}</ul>`);
  /* "Sobre você", escrito pela terapeuta na montagem ou em "Editar minha página" */
  const sobre = dd && String(dd.sobre || '').trim();
  if(sobre && ass) ass.insertAdjacentHTML('afterend', `<p class="cv-sobre">${escV(sobre).replace(/\n+/g, '<br>')}</p>`);
  /* opção da página (dados.sobre_separado): a apresentação vira um cartão "Quem sou" e uma linha "Sobre o teste" separa do texto do teste */
  if(sobre && dd && dd.sobre_separado){
    const cs = lt.querySelector('.cv-sobre'), cl = lt.querySelector('.cv-lead');
    if(cs){ cs.classList.add('cv-sobre-cartao'); cs.insertAdjacentHTML('afterbegin', '<span class="cv-sobre-rot">Quem sou</span>'); }
    if(cl) cl.insertAdjacentHTML('beforebegin', '<div class="cv-divisor" role="separator"><span>Sobre o teste</span></div>');
  }
  dvBotaoEditar();
  /* páginas com testes extras (ex.: Miralene): logo no topo, um menu com todos os testes, cada um levando ao seu detalhe */
  const CV_NOME_CURTO = k => k === 'travas' ? 'Travas Mentais' : k === 'tracos' ? 'Traços de Caráter' : k === 'mpcc' ? 'MPCC' : (EX[k].curto || EX[k].rot);
  const CV_PERGUNTA = k => k === 'travas' ? 'O que está travando você hoje?' : k === 'tracos' ? 'Como a sua história moldou o seu jeito de ser?' : k === 'mpcc' ? 'Onde você já é forte e onde pode crescer?' : EX[k].pergunta;
  if(comExtras){
    const chipsEl = lt.querySelector('.cv-chips');
    if(chipsEl) chipsEl.insertAdjacentHTML('afterend', `<nav class="cv-menu" aria-label="Os testes desta página"><p class="cv-menu-tit">Escolha o seu teste e veja os detalhes:</p>
      ${lista.map((k, i) => `<a class="cv-menu-i" href="#cv-t-${k}"><span class="cv-det-n">${i + 1}</span><span class="cv-menu-tx"><b>${escV(CV_NOME_CURTO(k))}</b><small>${escV(CV_PERGUNTA(k))}</small></span><span class="cv-menu-seta" aria-hidden="true">↓</span></a>`).join('')}</nav>`);
  }
  /* introdução desligada pela terapeuta (travas_paginas.dados.capa_intro = false): some o título, o convite e o texto de abertura */
  if(dd && dd.capa_intro === false) [h1, ass, lt.querySelector('.cv-lead'), lt.querySelector('.cv-sobre')].forEach(x => { if(x) x.style.display = 'none'; });
  cartao.insertAdjacentHTML('beforebegin', '<p class="cv-ja" id="cv-ja">Já recebeu o seu código? É só digitar aqui:</p>');
  const temCodigo = /[?&](c|codigo|code)=/.test(location.search) || !!(document.getElementById('campo-codigo') || {}).value;
  if(temCodigo) cartao.insertAdjacentHTML('afterend', ctas('cv-ctas-topo'));
  else document.getElementById('cv-ja').insertAdjacentHTML('beforebegin', ctas('cv-ctas-topo'));

  const passo = (n, t, d) => `<li><span class="cv-n">${n}</span><b>${t}</b><small>${d}</small></li>`;
  const pq = (q, a) => `<details><summary>${q}</summary><p>${a}</p></details>`;
  const primFrase = t => { const m = String(t || '').match(/^.*?[.!?](\s|$)/); return (m ? m[0] : String(t || '')).trim(); };

  /* o que o teste mapeia */
  let meio = '';
  const CARTOES = {
    travas:`<article class="cv-teste">
        <span class="cv-tag">Individual</span>
        <h3>Teste de Travas Mentais</h3>
        <p class="cv-pergunta">O que está travando você hoje?</p>
        <p>Mapeia 10 travas mentais e mostra, em números, quais estão mais ativas em você agora: as que pesam no trabalho, nas relações e nas decisões.</p>
        <p class="cv-meta">50 perguntas · 10 a 15 minutos</p>
        <a class="cv-link" href="${Z.travas}" ${ext}>Quero fazer este teste →</a>
      </article>`,
    tracos:`<article class="cv-teste cv-teste-destaque">
        <span class="cv-tag">Individual ou em casal</span>
        <h3>Teste de Traços de Caráter</h3>
        <p class="cv-pergunta">Como a sua história moldou o seu jeito de ser?</p>
        <p>Identifica os 5 traços de caráter que se formaram na sua história e mostra, em porcentagem, como eles aparecem no seu dia a dia, junto com os talentos que cada um traz.</p>
        <p class="cv-meta">40 afirmações · 8 a 12 minutos</p>
        <a class="cv-link" href="${Z.tracos}" ${ext}>Quero fazer este teste →</a>
      </article>`,
    mpcc:`<article class="cv-teste cv-teste-destaque">
        <span class="cv-tag">Individual · Mapa em 8 dimensões</span>
        <h3>MPCC · Mapa de Perfil Comportamental e Competências</h3>
        <p class="cv-pergunta">Onde você já é forte e onde pode crescer?</p>
        <p>Mostra, em um gráfico radar, 8 dimensões do seu comportamento: iniciativa, comunicação, relacionamento, decisão, adaptação, organização, autoconfiança e equilíbrio emocional.</p>
        <p class="cv-meta">40 afirmações · 10 a 15 minutos</p>
        <a class="cv-link" href="${Z.mpcc}" ${ext}>Quero fazer este teste →</a>
      </article>`
  };
  extras.forEach(k => { const e = EX[k]; CARTOES[k] = `<article class="cv-teste">
        <span class="cv-tag">${escV(e.tag)}</span>
        <h3>${e.tituloHtml || escV(e.titulo)}</h3>
        <p class="cv-pergunta">${escV(e.pergunta)}</p>
        <p>${escV(e.texto)}</p>
        <p class="cv-meta">${escV(e.meta)}</p>
        <a class="cv-link" href="${Z[k]}" ${ext}>Quero fazer este teste →</a>
      </article>`; });
  if(comExtras){
    const listaTravas = (typeof TRAVAS !== 'undefined' && Array.isArray(TRAVAS)) ? TRAVAS : [];
    const DET = Object.assign({ travas:{ tag:'Individual · Resultado em números', titulo:'Teste de Identificação de Travas Mentais', pergunta:'O que está travando você hoje?',
      objetivo:'Identificar os padrões de pensamento e de comportamento que estão segurando você hoje, no trabalho, nas relações e nas decisões, para o acompanhamento começar pelo lugar certo.',
      como:['50 perguntas, de 10 a 15 minutos', 'No celular, uma pergunta de cada vez', 'Você marca o quanto cada frase combina com você hoje'],
      resultado:q => 'O mapa das 10 travas, em números, com as mais ativas em destaque, para você conversar com ' + q + ' a partir dele.',
      mapaTitulo:'As 10 travas que o teste mapeia', itens:listaTravas.map(t => ({ nome:t.nome, desc:primFrase(t.contexto) })) },
      tracos:{ tag:'Individual ou em casal', titulo:'Teste de Traços de Caráter', pergunta:'Como a sua história moldou o seu jeito de ser?',
        objetivo:'Identificar os 5 traços de caráter que se formaram na sua história e mostrar, em porcentagem, como eles aparecem no seu dia a dia, junto com os talentos que cada um traz.',
        como:['40 afirmações, de 8 a 12 minutos', 'Pode ser feito sozinho(a) ou em casal', 'No celular, uma afirmação de cada vez'],
        resultado:q => 'Os seus 5 traços em porcentagem, com o pico primário e o secundário, para você conversar com ' + q + ' a partir deles.' },
      mpcc:{ tag:'Individual · Mapa em 8 dimensões', titulo:'MPCC · Mapa de Perfil Comportamental e Competências', pergunta:'Onde você já é forte e onde pode crescer?',
        objetivo:'Mostrar, em um gráfico radar, 8 dimensões do seu comportamento: iniciativa, comunicação, relacionamento, decisão, adaptação, organização, autoconfiança e equilíbrio emocional.',
        como:['40 afirmações, de 10 a 15 minutos', 'Você responde de 1 a 5', 'No final, gráfico radar e relatório em PDF'],
        resultado:q => 'O seu mapa em 8 dimensões, com pontos fortes e oportunidades de desenvolvimento, para conversar com ' + q + '.' } }, EX);
    const detalhe = (k, i) => { const e = DET[k];
      return `<section class="cv-faixa${i % 2 ? '' : ' cv-areia'} cv-det" id="cv-t-${k}"><div class="cv-in">
      <div class="cv-det-topo"><span class="cv-det-n">${i + 1}</span><div><span class="cv-tag">${escV(e.tag)}</span><h2>${e.tituloHtml || escV(e.titulo)}</h2><p class="cv-pergunta">${escV(e.pergunta)}</p></div></div>
      <div class="cv-det-grade">
        <div class="cv-det-bloco"><h3>Para que serve</h3><p>${escV(e.objetivo || e.texto)}</p></div>
        <div class="cv-det-bloco"><h3>Como funciona</h3><ul>${(e.como || [e.meta]).map(c => '<li>' + escV(c) + '</li>').join('')}</ul></div>
        <div class="cv-det-bloco"><h3>O que você recebe</h3><p>${escV(e.resultado ? e.resultado(comQuem) : e.recebe(comQuem))}</p></div>
      </div>
      ${e.itens && e.itens.length ? `<h3 class="cv-det-mapa">${escV(e.mapaTitulo || 'O que o teste mapeia')}</h3>
      <div class="cv-itens">${e.itens.map((t, j) => `<div class="cv-item"><span class="cv-item-n">${j + 1}</span><b>${escV(t.nome)}</b>${t.desc ? '<small>' + escV(t.desc) + '</small>' : ''}</div>`).join('')}</div>` : ''}
      <div class="cv-det-cta">${bt('btn-primario', Z[k], 'Quero fazer este teste', 'fale com ' + escV(comQuem) + ' e receba o seu código', true)}</div>
    </div></section>`; };
    meio = `<section class="cv-faixa"><div class="cv-in cv-centro"><span class="cv-olho">Aqui você encontra ${NUM[lista.length] || lista.length} testes</span>
      <h2>${maius(NUM[lista.length] || String(lista.length))} olhares que mudam o jeito como você se enxerga</h2>
      <p class="cv-sub">Cada teste responde a uma pergunta diferente. Veja abaixo para que serve cada um, como funciona e o que você recebe. Se tiver dúvida sobre qual fazer primeiro, fale com ${escV(comQuem)}.</p>
      <p class="cv-sigilo">Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d${escV(quem)}.</p></div></section>
    ${lista.map((k, i) => detalhe(k, i)).join('')}`;
  } else if(ambos){
    meio = `<section class="cv-faixa"><div class="cv-in">
    <div class="cv-centro"><span class="cv-olho">Aqui você encontra ${lista.length > 3 ? (NUM[lista.length] || lista.length) + ' testes' : lista.length > 2 ? 'três testes' : 'dois testes'}</span>
    <h2>${lista.length > 3 ? maius(NUM[lista.length] || String(lista.length)) + ' olhares que mudam o jeito como você se enxerga' : lista.length > 2 ? 'Três olhares que mudam o jeito como você se enxerga' : 'Duas perguntas que mudam o jeito como você se enxerga'}</h2></div>
    <div class="cv-testes${lista.length === 3 ? ' cv-testes-3' : ''}">
      ${lista.map(k => CARTOES[k]).join('\n      ')}
    </div>
    <p class="cv-sigilo">Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d${escV(quem)}.</p>
  </div></section>`;
  } else if(soTravas){
    const lista = (typeof TRAVAS !== 'undefined' && Array.isArray(TRAVAS)) ? TRAVAS : [];
    meio = `<section class="cv-faixa"><div class="cv-in">
    <div class="cv-centro"><span class="cv-olho">O que o teste mapeia</span>
    <h2>10 travas mentais. Quais estão mais ativas em você?</h2>
    <p class="cv-sub">O resultado mostra cada uma em números, de 1 a 10, com as mais ativas em destaque.</p></div>
    <div class="cv-itens">${lista.map((t, i) => `<div class="cv-item"><span class="cv-item-n">${i + 1}</span><b>${escV(t.nome)}</b><small>${escV(primFrase(t.contexto))}</small></div>`).join('')}</div>
    <p class="cv-sigilo">Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d${escV(quem)}.</p>
  </div></section>`;
  } else if(soMpcc){
    const dims = (typeof MP_DIM !== 'undefined' && Array.isArray(MP_DIM)) ? MP_DIM : [];
    meio = `<section class="cv-faixa"><div class="cv-in">
    <div class="cv-centro"><span class="cv-olho">O que o mapa mostra</span>
    <h2>8 dimensões do seu comportamento. Em quais você já é forte?</h2>
    <p class="cv-sub">O resultado mostra cada uma em uma escala de 1 a 5, em um gráfico radar, com os seus maiores recursos e as áreas em desenvolvimento.</p></div>
    <div class="cv-itens">${dims.map((t, i) => `<div class="cv-item"><span class="cv-item-n">${i + 1}</span><b>${escV(t.nome)}</b><small>${escV(t.avalia.slice(0, 3).join(', '))}</small></div>`).join('')}</div>
    <p class="cv-sigilo">Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d${escV(quem)}.</p>
  </div></section>`;
  } else {
    const lista = (typeof TC_TRACOS !== 'undefined' && Array.isArray(TC_TRACOS)) ? TC_TRACOS : [];
    meio = `<section class="cv-faixa"><div class="cv-in">
    <div class="cv-centro"><span class="cv-olho">O que o teste mapeia</span>
    <h2>5 traços de caráter. Qual deles comanda o seu jeito de ser?</h2>
    <p class="cv-sub">Os nomes vêm da psicanálise e descrevem estilos de funcionamento, não doenças. Cada traço traz talentos próprios.</p></div>
    <div class="cv-itens">${lista.map((t, i) => `<div class="cv-item"><span class="cv-item-n">${i + 1}</span><b>${escV(t.nome)}</b><small>${escV(t.recurso || '')}</small></div>`).join('')}</div>
    <p class="cv-sigilo">Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d${escV(quem)}.</p>
  </div></section>`;
  }

  const secCasal = !casal ? '' : `<section class="cv-faixa cv-escura"><div class="cv-in">
    <div class="cv-casal-grade">
      <div>
        <span class="cv-olho">Tem um parceiro ou uma parceira?</span>
        <h2>Em casal, isso fica ainda mais interessante</h2>
        <p>O que muita gente não sabe: o teste não serve só para você se conhecer sozinho(a). Ele também pode ser feito em casal. Quando as duas pessoas respondem, dá para cruzar as informações e descobrir:</p>
        <ol class="cv-cruza">
          <li><b>Como cada um funciona</b><span>o que protege, o que trava e o que move cada um de vocês</span></li>
          <li><b>Onde os traços de vocês se encontram</b><span>e onde eles entram em atrito</span></li>
          <li><b>Por que certas discussões se repetem</b><span>quase sempre é o encontro de duas dores antigas, e não uma questão de quem está certo</span></li>
          <li><b>Como cada um reage ao estresse e ao conflito</b><span>e como apoiar um ao outro nesses momentos</span></li>
        </ol>
      </div>
      <figure class="cv-cel cv-cel-casal"><img src="${CV_IMG}vendas-casal.jpg" alt="Devolutiva do casal com o gráfico de teia dos dois" loading="lazy" width="600" height="1200"></figure>
    </div>
    <blockquote class="cv-citacao">“No fundo, um relacionamento é o encontro de duas histórias, e de duas armaduras. Quando você entende a sua e a do outro, para de lutar contra a pessoa e começa a entender o padrão que está ali. É aí que a mudança se torna possível.”</blockquote>
    <div class="cv-como-casal">
      <p><b>Como funciona:</b> cada um responde no próprio celular, quando puder, com o mesmo código (ou juntos, no mesmo aparelho). <b>Cada um recebe a sua devolutiva individual, e vocês recebem a devolutiva do casal</b>, com um acordo para os dois assinarem.</p>
      ${bt('btn-argila', Z.casal, 'Quero fazer em casal', 'fale com ' + escV(comQuem) + ' pelo WhatsApp', true)}
    </div>
  </div></section>`;

  const checks = soTravas
    ? ['O seu mapa das 10 travas, de 1 a 10, com as mais ativas em destaque', 'Um gráfico para ver o seu perfil num relance', 'O que cada trava significa e como ela aparece no seu dia a dia', 'Por onde começar: a trava que mais pesa em você hoje', 'Uma conversa com ' + escV(comQuem) + ' a partir do resultado']
    : soTracos
    ? ['Os seus 5 traços em porcentagem, com os dois mais fortes em destaque', 'Um gráfico de teia para ver o seu perfil num relance', 'O que cada traço significa e os talentos escondidos nele', 'Ações práticas para começar a mudar a partir de hoje', 'Em casal: a devolutiva de cada um e a dos dois juntos']
    : soMpcc
    ? ['O seu mapa em 8 dimensões, de 1 a 5, com o perfil geral', 'Um gráfico radar para ver os seus recursos num relance', 'Os seus 3 maiores recursos e as 3 áreas com mais espaço para crescer', 'Recomendações práticas de desenvolvimento pessoal e profissional', 'Relatório de 6 páginas em PDF e a devolutiva individual com ' + escV(comQuem)]
    : comExtras
    ? (tem('travas') ? ['O seu mapa das 10 travas, de 1 a 10, com as mais ativas em destaque'] : []).concat(extras.map(k => escV(EX[k].recebe(comQuem))), ['Uma conversa com ' + escV(comQuem) + ' a partir dos seus resultados'])
    : ['O seu mapa em números, com o que está mais ativo em destaque', 'Um gráfico de teia para ver o seu perfil num relance', 'O que cada resultado significa e os talentos escondidos nele', 'Ações práticas para começar a mudar a partir de hoje', 'Em casal: a devolutiva de cada um e a dos dois juntos'];
  const imgRecebe = soTravas || (comExtras && tem('travas')) ? `<img src="${CV_IMG}vendas-travas.jpg" alt="Resultado do Teste de Travas com as 10 travas em números" loading="lazy" width="600" height="1200">`
                             : comExtras ? '' : soMpcc ? `<img src="${CV_IMG}vendas-mpcc.jpg" alt="Mapa de perfil do MPCC com o gráfico radar das 8 dimensões" loading="lazy" width="600" height="1200">`
                             : `<img src="${CV_IMG}vendas-individual.jpg" alt="Devolutiva com os traços em porcentagem e o gráfico de teia" loading="lazy" width="600" height="1200">`;
  const faq = soTravas ? [
      pq('Como consigo o meu código?', 'Toque em “Quero fazer o meu teste” e fale com ' + escV(comQuem) + ' pelo WhatsApp. Você recebe o seu código, e o link já abre o teste.'),
      pq('O que é uma trava mental?', 'É um padrão de pensamento e de comportamento que se repete e segura você, mesmo quando você sabe o que precisa fazer. O teste mostra quais estão mais ativas hoje.'),
      pq('Quem vê as minhas respostas?', 'Só ' + escV(quem) + '. O resultado serve para a conversa de vocês, com cuidado e sigilo.'),
      pq('O resultado é um diagnóstico?', 'Não. É uma ferramenta de autoconhecimento que mostra por onde começar. Ela não substitui um acompanhamento profissional.'),
      pq('Quanto tempo leva?', 'De 10 a 15 minutos, no celular ou no computador. Escolha um momento tranquilo para responder de uma vez, com sinceridade.')
    ] : soTracos ? [
      pq('Como consigo o meu código?', 'Toque em “Quero fazer o meu teste” e fale com ' + escV(comQuem) + ' pelo WhatsApp. Você recebe o seu código, e o link já abre o teste.'),
      pq('Como funciona em casal? Precisamos estar juntos?', 'Não precisam. Cada um responde no próprio celular, quando puder, com o mesmo código. Se preferirem, dá para responder juntos, no mesmo aparelho, um de cada vez. Cada um recebe a sua devolutiva individual, e vocês recebem a do casal.'),
      pq('Quem vê as minhas respostas?', 'Só ' + escV(quem) + '. No casal, cada um responde sozinho(a), sem ver as respostas do outro.'),
      pq('Os nomes dos traços são diagnósticos?', 'Não. Os nomes vêm da psicanálise e descrevem estilos de funcionamento. Nenhum deles é doença, e cada um traz talentos próprios.'),
      pq('Quanto tempo leva?', 'De 8 a 12 minutos, no celular ou no computador. Escolha um momento tranquilo para responder de uma vez, com sinceridade.')
    ] : soMpcc ? [
      pq('Como consigo o meu código?', 'Toque em “Quero fazer o meu teste” e fale com ' + escV(comQuem) + ' pelo WhatsApp. Você recebe o seu código, e o link já abre a avaliação.'),
      pq('O MPCC é um teste psicológico?', 'Não. É uma ferramenta de autoconhecimento e desenvolvimento pessoal. Ele mostra tendências de comportamento neste momento e não é diagnóstico nem avaliação clínica.'),
      pq('Existe resposta certa ou errada?', 'Não. Responda pensando em como você normalmente age no seu dia a dia, e não em como gostaria de agir.'),
      pq('Quem vê as minhas respostas?', 'Só ' + escV(quem) + '. Você aceita os termos de privacidade antes de começar, e os seus dados são usados para gerar o seu resultado e para a sua devolutiva.'),
      pq('Eu recebo o resultado?', 'Sim, se ' + escV(comQuem) + ' deixar liberado, você vê o mapa na hora e baixa o relatório em PDF. Depois, é possível agendar a devolutiva individual.'),
      pq('Quanto tempo leva?', 'De 10 a 15 minutos, no celular ou no computador. Escolha um momento tranquilo para responder de uma vez, com sinceridade.')
    ] : [
      pq('Como consigo o meu código?', 'Toque em “Quero fazer o meu teste” e fale com ' + escV(comQuem) + ' pelo WhatsApp. Você recebe o seu código, e o link já abre o teste certo.'),
      pq('Preciso fazer ' + (lista.length > 2 ? 'todos os testes' : 'os dois testes') + '?', 'Não. Você pode fazer ' + (lista.length > 2 ? 'só um deles, ou todos' : 'um deles ou os dois') + '. ' + (tem('travas') && tem('tracos') ? 'Eles se completam: as travas mostram o que pesa em você hoje, e os traços mostram de onde isso vem.' : 'Eles se completam: cada um olha para o seu jeito de funcionar por um ângulo diferente.')),
      casal ? pq('Como funciona em casal? Precisamos estar juntos?', 'Não precisam. Cada um responde no próprio celular, quando puder, com o mesmo código. Se preferirem, dá para responder juntos, no mesmo aparelho, um de cada vez. Cada um recebe a sua devolutiva individual, e vocês recebem a do casal.') : '',
      pq('Quem vê as minhas respostas?', 'Só ' + escV(quem) + '.' + (casal ? ' No casal, cada um responde sozinho(a), sem ver as respostas do outro.' : '')),
      casal ? pq('Os nomes dos traços são diagnósticos?', 'Não. Os nomes vêm da psicanálise e descrevem estilos de funcionamento. Nenhum deles é doença, e cada um traz talentos próprios.') : '',
      tem('mpcc') ? pq('O MPCC é um teste psicológico?', 'Não. É uma ferramenta de autoconhecimento e desenvolvimento pessoal, que mostra tendências de comportamento neste momento. Não é diagnóstico.') : ''
    ].concat(extras.map(k => pq.apply(null, EX[k].faq(escV(comQuem)))), [
      comExtras ? pq('Quanto tempo leva?', 'Depende do teste: ' + (tem('travas') ? ['o Teste de Travas, de 10 a 15 minutos'] : []).concat(extras.map(k => EX[k].tempo)).join('; ') + '. Escolha um momento tranquilo e responda com sinceridade.')
        : pq('Quanto tempo leva?', 'De 8 a 15 minutos por teste, no celular ou no computador. Escolha um momento tranquilo para responder de uma vez, com sinceridade.')
    ]).filter(Boolean);

  rodape.insertAdjacentHTML('beforebegin', `<div class="cv">
  <section class="cv-faixa cv-areia"><div class="cv-in cv-estreito">
    <span class="cv-olho">Talvez você se reconheça</span>
    <h2>${soMpcc ? 'Você sente que poderia render mais, mas não sabe por onde começar' : 'Você começa com vontade e, lá pelo meio do caminho, alguma coisa puxa você de volta'}</h2>
    <ul class="cv-dores">${soMpcc ? `
      <li>Tem facilidade em algumas áreas e trava em outras, sem entender o porquê.</li>
      <li>Decide, se comunica ou se organiza de um jeito que nem sempre combina com o que você quer.</li>
      <li>Quer crescer na vida pessoal ou profissional, mas falta um mapa claro do ponto de partida.</li>
      <li>Reconhece as suas falhas com facilidade, e as suas qualidades com dificuldade.</li>` : `
      <li>Promete que desta vez vai ser diferente e se pega repetindo o mesmo padrão.</li>
      <li>Sabe exatamente o que precisa fazer, mas trava na hora de agir.</li>
      <li>No relacionamento, as mesmas discussões voltam, só com outras palavras.</li>
      <li>Carrega um peso que nem sabe direito de onde vem.</li>`}
    </ul>
    <p class="cv-virada">${soMpcc ? 'Não é falta de capacidade. É falta de um mapa. <b>E o que a gente enxerga, a gente consegue desenvolver.</b>' : 'Não é falta de força de vontade. É um padrão antigo agindo sem pedir licença. <b>E o que a gente enxerga, a gente consegue mudar.</b>'}</p>
  </div></section>

  ${meio}
  ${secCasal}

  <section class="cv-faixa cv-areia"><div class="cv-in">
    <div class="cv-recebe-grade${imgRecebe ? '' : ' cv-sem-img'}">
      ${imgRecebe ? '<figure class="cv-cel">' + imgRecebe + '</figure>' : ''}
      <div>
        <span class="cv-olho">O que você recebe</span>
        <h2>Um resultado claro, para você se enxergar por inteiro</h2>
        <ul class="cv-checks">${checks.map(c => '<li>' + c + '</li>').join('')}</ul>
        ${imgRecebe ? '<p class="cv-nota">' + (comExtras ? 'Tela real do resultado do Teste de Travas, com nome fictício.' : 'Telas reais do resultado, com nomes fictícios.') + '</p>' : ''}
      </div>
    </div>
  </div></section>

  <section class="cv-faixa"><div class="cv-in">
    <div class="cv-centro"><span class="cv-olho">Como funciona</span><h2>Do primeiro toque ao seu próximo passo</h2></div>
    <ol class="cv-passos">
      ${passo(1, 'Fale com ' + escV(comQuem), 'Toque no botão e receba o seu código pelo WhatsApp.')}
      ${passo(2, 'Responda no seu tempo', 'No celular, uma pergunta de cada vez.' + (casal ? ' Em casal, cada um no seu.' : ''))}
      ${comExtras ? passo(3, 'Entenda o seu resultado', 'Alguns testes mostram o resultado na hora; nos demais, a leitura é feita junto com ' + escV(comQuem) + '.') : passo(3, 'Receba o seu resultado', 'O seu mapa, o gráfico e o que ele revela sobre você.')}
      ${passo(4, 'Dê o próximo passo', 'Converse com ' + escV(comQuem) + ' a partir do resultado, com um caminho para você.')}
    </ol>
  </div></section>

  <section class="cv-faixa cv-areia"><div class="cv-in cv-estreito">
    <div class="cv-quem">
      ${foto ? `<img src="${escV(foto)}" alt="" width="120" height="120">` : ''}
      <div><span class="cv-olho">Quem vai ler o seu resultado</span>
        <h2>${escV(dvTerapeuta())}</h2>
        <p class="cv-quem-tit">${escV(String(dvAssinatura()).split('—').slice(1).join('—').trim() || 'Terapeuta')}</p>
        <p>Ninguém vê as suas respostas além d${escV(quem)}. O resultado serve para a conversa de vocês, com todo o cuidado e sigilo, sem julgamento e no seu ritmo.</p></div>
    </div>
  </div></section>

  <section class="cv-faixa cv-escura cv-final"><div class="cv-in cv-estreito cv-centro">
    <h2>${soMpcc ? 'Que tal descobrir hoje onde você já é forte e onde pode crescer?' : 'Que tal descobrir hoje o que está por trás dos seus padrões?'}</h2>
    <p>${soMpcc ? 'Leva poucos minutos. O mapa que você vai receber pode ser o ponto de partida para decidir o seu próximo passo.' : 'Leva poucos minutos. O que você vai enxergar pode mudar o jeito como você vive as suas escolhas e as suas relações.'}</p>
    ${ctas('cv-ctas-fim')}
    <a class="cv-ir-codigo" href="#cv-ja">Já tenho o meu código ↑</a>
  </div></section>

  <section class="cv-faixa"><div class="cv-in cv-estreito cv-faq">
    <h2 class="cv-centro">Perguntas frequentes</h2>
    ${faq.join('')}
  </div></section>
  </div>
  <div class="cv-barra" id="cv-barra">${bt('btn-primario', Z.ind, 'Quero fazer o meu teste', 'receba o seu código pelo WhatsApp', true)}</div>`);

  /* barra fixa no celular: aparece depois do topo e some quando há outra chamada na tela */
  const barra = document.getElementById('cv-barra');
  document.body.appendChild(barra);   // fora da capa: a capa tem animação (transform) que prendia a barra no fim da página, em cima do rodapé
  if('IntersectionObserver' in window){
    const vis = new Map(); const alvos = [document.getElementById('cv-ctas-topo'), cartao, document.getElementById('cv-ctas-fim'), rodape].filter(Boolean);
    let passou = false;   // a pessoa já rolou para além das chamadas do topo
    const io = new IntersectionObserver(es => { es.forEach(e => { vis.set(e.target, e.isIntersecting);
        if(e.target === alvos[0]) passou = !e.isIntersecting && e.boundingClientRect.top < 0; });
      barra.classList.toggle('on', capa.classList.contains('ativa') && passou && ![...vis.values()].some(Boolean)); });
    alvos.forEach(a => io.observe(a));
  }
  new MutationObserver(() => { if(!capa.classList.contains('ativa')) barra.classList.remove('on'); }).observe(capa, { attributes:true, attributeFilter:['class'] });
}

/* ============================================================================
   PÁGINA SÓ COM O TESTE DE TRAÇOS DE CARÁTER (terapeuta que não comprou o Teste de Travas)
   A capa fala só desse teste e a área da terapeuta já abre nele. O Teste de Travas só entra se ela comprar.
   ============================================================================ */
function dvSoTracos(){
  const capa = document.getElementById('tela-capa'); if(!capa || capa.dataset.soTracos) return;
  capa.dataset.soTracos = '1';
  const quem = dvQuem(), lt = capa.querySelector('.lado-texto') || capa;
  const selo = lt.querySelector('.selo'); if(selo) selo.textContent = 'Teste de Traços de Caráter';
  const h1 = lt.querySelector('h1'); if(h1) h1.textContent = 'Como a sua história moldou o seu jeito de ser?';
  const ps = lt.querySelectorAll('.texto-capa');
  if(ps[0]) ps[0].innerHTML = 'Desde a gestação até os primeiros anos de vida, o corpo e a mente aprendem a se proteger. Esses jeitos de se proteger viram traços que aparecem até hoje na sua postura, nas suas relações e nas suas decisões.';
  if(ps[1]) ps[1].innerHTML = 'Este teste identifica os 5 traços de caráter que se formaram na sua história e mostra, em porcentagem, quais predominam em você, junto com os talentos de cada um. Pode ser feito sozinho(a) ou em casal. Responda com sinceridade e no seu tempo: ninguém vê as suas respostas além d' + escV(quem) + '.';
  const ul = lt.querySelector('.lista-leve');
  if(ul) ul.innerHTML = '<li>40 afirmações, de 8 a 12 minutos</li><li>Sozinho(a) ou em casal: no casal, cada um recebe a sua devolutiva e vocês recebem a do casal</li>' +
    '<li>O código que você recebeu já abre o teste</li><li>O resultado vai direto para ' + escV(quem) + ', para vocês conversarem a partir dele</li>';
  document.title = 'Teste de Traços de Caráter' + (window.T_NOME ? ' · ' + T_NOME : '');
  /* área da terapeuta: só o Teste de Traços de Caráter */
  const alt = document.getElementById('alt-teste'); if(alt && alt.closest('.campo')) alt.closest('.campo').style.display = 'none';
  const abrirTracos = () => { const b = document.querySelector('#alt-teste [data-v=tracos]'); if(b && !b.classList.contains('ativa')) b.click(); };
  if(typeof window.entrarNoPainel === 'function'){
    const entrar = window.entrarNoPainel;
    window.entrarNoPainel = function(){ const r = entrar.apply(this, arguments); abrirTracos(); return r; };
  }
  const adm = document.getElementById('painel-admin');
  if(adm && 'MutationObserver' in window) new MutationObserver(() => { if(adm.classList.contains('ver')) abrirTracos(); }).observe(adm, { attributes:true, attributeFilter:['class'] });
}
/* nenhum teste ativo (ex.: assinatura suspensa por falta de pagamento) */
function dvSemTeste(){
  const capa = document.getElementById('tela-capa'); if(!capa || capa.dataset.semTeste) return;
  capa.dataset.semTeste = '1';
  const quem = dvQuem(), lt = capa.querySelector('.lado-texto') || capa;
  const h1 = lt.querySelector('h1'); if(h1) h1.textContent = 'Teste indisponível no momento';
  lt.querySelectorAll('.texto-capa, .lista-leve, .cartao').forEach(x => x.remove());
  const selo = lt.querySelector('.selo'); if(selo) selo.remove();
  (h1 || lt).insertAdjacentHTML('afterend', '<p class="texto-capa">Este teste está temporariamente indisponível. Se você recebeu um código, fale com ' + escV(quem) + ' pelo WhatsApp.</p>');
}

/* ============================================================================
   EXCLUIR CÓDIGOS (Travas, Traços e MPCC): botão "Excluir" em cada código da área da terapeuta.
   O resultado de quem já respondeu continua salvo. Código de casal já começado não pode ser excluído
   (apagaria a devolutiva do casal).
   ============================================================================ */
function dvExcluirCodigos(){
  if(window.__dvExc) return; window.__dvExc = true;
  const LISTAS = ['lista-codigos', 'tc-lista-codigos', 'mp-lista-codigos'];
  const RE = /\b([A-Z0-9]{2}|[A-Z0-9]{4})-[A-Z0-9]{4}\b/;
  function marcar(){
    LISTAS.forEach(id => {
      const box = document.getElementById(id); if(!box) return;
      box.querySelectorAll('.linha-item:not([data-dv-exc])').forEach(l => {
        l.setAttribute('data-dv-exc', '1');
        const nome = l.querySelector('.nome'), m = nome && nome.textContent.match(RE); if(!m) return;
        const etq = (l.querySelector('.etiqueta') || {}).textContent || '';
        const casalComecado = /em andamento|concluído/i.test(etq);
        let barra = Array.from(l.children).find(x => x.tagName === 'SPAN' && /width:\s*100%/.test(x.getAttribute('style') || ''));
        if(!barra){ barra = document.createElement('span'); barra.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;width:100%;margin-top:8px'; l.style.flexWrap = 'wrap'; l.appendChild(barra); }
        const b = document.createElement('button'); b.type = 'button'; b.className = 'mini-btn dv-exc'; b.textContent = 'Excluir';
        if(casalComecado){ b.disabled = true; b.title = 'O casal já começou: excluir apagaria a devolutiva do casal.'; }
        b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); dvExcluirCodigo(m[0], l, b, id); });
        barra.appendChild(b);
      });
    });
  }
  marcar();
  if('MutationObserver' in window) new MutationObserver(() => { clearTimeout(window.__dvExcT); window.__dvExcT = setTimeout(marcar, 60); }).observe(document.body, { childList:true, subtree:true });
}
async function dvExcluirCodigo(codigo, linha, botao, lista){
  const usado = /usado|concluído/i.test(((linha.querySelector('.etiqueta') || {}).textContent || ''));
  if(!confirm('Excluir o código ' + codigo + '?\n\n' + (usado ? 'O resultado de quem já respondeu continua salvo na sua lista de respostas.' : 'O link deste código deixa de funcionar.'))) return;
  if(typeof clienteMembros !== 'function'){ alert('Entre de novo na sua área para excluir.'); return; }
  botao.disabled = true; botao.textContent = 'Excluindo...';
  try{
    const c = clienteMembros(), { data:sess } = await c.auth.getSession();
    if(!sess || !sess.session) throw new Error('sessão');
    const { data, error } = await c.from('travas_codigos').delete().eq('codigo', codigo).eq('terapeuta_id', sess.session.user.id).select('id');
    if(error || !data || !data.length) throw new Error(error ? error.message : 'nada');
    linha.style.transition = 'opacity .25s'; linha.style.opacity = '0';
    setTimeout(() => { const box = document.getElementById(lista); linha.remove(); if(box && !box.querySelector('.linha-item')) box.innerHTML = '<div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div>'; }, 260);
  }catch(e){ botao.disabled = false; botao.textContent = 'Excluir'; alert('Não consegui excluir agora. Tente de novo em instantes.'); }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvExcluirCodigos); else dvExcluirCodigos();

/* ============================================================================
   "ESQUECI MINHA SENHA" na entrada da área da terapeuta: leva para a página de criar senha nova
   (o link chega por e-mail) e, depois, de volta para esta área.
   ============================================================================ */
function dvEsqueciSenha(){
  const b = document.getElementById('btn-senha');
  if(!b || document.getElementById('dv-esqueci')) return;
  const RS = 'https://ressignificarterapiaseconsultorias.com/areademembros/nova-senha.html', mesmo = /ressignificarterapiaseconsultorias\.com$/.test(location.hostname);
  b.insertAdjacentHTML('afterend', '<p class="dv-esqueci"><a href="' + RS + '" id="dv-esqueci">Esqueci minha senha</a></p>');
  document.getElementById('dv-esqueci').addEventListener('click', function(){
    const em = typeof EMAIL_MEMBROS !== 'undefined' && EMAIL_MEMBROS ? String(EMAIL_MEMBROS) : '';
    const volta = location.pathname + location.search + '#admin';
    const ps = []; if(mesmo) ps.push('v=' + encodeURIComponent(volta)); if(em) ps.push('email=' + encodeURIComponent(em));
    this.href = RS + (ps.length ? '?' + ps.join('&') : '');
  });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvEsqueciSenha); else dvEsqueciSenha();

/* ============================================================================
   EXCLUIR RESPOSTAS (Travas, Traços individual e MPCC): "Excluir" em cada linha da lista de respostas.
   As linhas vêm marcadas com data-dv-del (tipo do teste) e o id (ou, no Travas, código + nome + data).
   ============================================================================ */
const DV_TAB_RESP = { travas:'travas_respostas', tracos:'tracos_respostas', mpcc:'mpcc_respostas', disc:'disc_respostas' };
function dvExcluirRespostas(){
  if(window.__dvExcR) return; window.__dvExcR = true;
  function marcar(){
    document.querySelectorAll('.linha-item[data-dv-del]:not([data-dv-del-ok])').forEach(l => {
      l.setAttribute('data-dv-del-ok', '1');
      const x = document.createElement('span');
      x.className = 'dv-exc-resp'; x.setAttribute('role', 'button'); x.setAttribute('tabindex', '0');
      x.setAttribute('aria-label', 'Excluir esta resposta'); x.textContent = 'Excluir';
      const ir = ev => { ev.preventDefault(); ev.stopPropagation(); dvExcluirResposta(l, x); };
      x.addEventListener('click', ir);
      x.addEventListener('keydown', ev => { if(ev.key === 'Enter' || ev.key === ' ') ir(ev); });
      l.appendChild(x);
    });
  }
  marcar();
  if('MutationObserver' in window) new MutationObserver(() => { clearTimeout(window.__dvExcRT); window.__dvExcRT = setTimeout(marcar, 60); }).observe(document.body, { childList:true, subtree:true });
}
async function dvExcluirResposta(linha, botao){
  const tipo = linha.dataset.dvDel, tab = DV_TAB_RESP[tipo]; if(!tab) return;
  const nome = (linha.querySelector('.nome') || {}).textContent || 'esta pessoa';
  if(!confirm('Excluir a resposta de ' + nome.trim() + '?\n\nO resultado some da sua lista e não dá para recuperar depois.')) return;
  if(typeof clienteMembros !== 'function'){ alert('Entre de novo na sua área para excluir.'); return; }
  botao.textContent = 'Excluindo...';
  try{
    const c = clienteMembros(), { data:sess } = await c.auth.getSession();
    if(!sess || !sess.session) throw new Error('sessão');
    let q = c.from(tab).delete().eq('terapeuta_id', sess.session.user.id);
    if(linha.dataset.id) q = q.eq('id', linha.dataset.id);
    else if(tipo === 'travas' && linha.dataset.cod) q = q.eq('codigo', linha.dataset.cod).eq('dados->>nome', linha.dataset.nome || '').eq('dados->>data', linha.dataset.dt || '');
    else throw new Error('sem identificação');
    const { data, error } = await q.select('id');
    if(error || !data || !data.length) throw new Error(error ? error.message : 'nada');
    /* tira também da memória da lista, para não voltar ao filtrar */
    try{
      if(tipo === 'travas' && typeof respostasCache !== 'undefined') respostasCache = respostasCache.filter(r => !(r.codigo === linha.dataset.cod && (r.nome || '') === (linha.dataset.nome || '') && (r.data || '') === (linha.dataset.dt || '')));
      if(tipo === 'tracos' && typeof tcRespCache !== 'undefined') tcRespCache = tcRespCache.filter(r => r.id !== linha.dataset.id);
      if(tipo === 'mpcc' && typeof mpCache !== 'undefined') mpCache = mpCache.filter(r => r.id !== linha.dataset.id);
      if(tipo === 'disc' && typeof dcCache !== 'undefined') dcCache = dcCache.filter(r => r.id !== linha.dataset.id);
    }catch(e){}
    linha.style.transition = 'opacity .25s'; linha.style.opacity = '0';
    setTimeout(() => { const box = linha.parentNode; linha.remove(); if(box && !box.querySelector('.linha-item')) box.innerHTML = '<div class="vazio">Nenhuma resposta por enquanto.</div>'; }, 260);
  }catch(e){ botao.textContent = 'Excluir'; alert('Não consegui excluir agora. Tente de novo em instantes.'); }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvExcluirRespostas); else dvExcluirRespostas();

/* ============================================================================
   WHATSAPP DAS PÁGINAS DE TESTE (todas as terapeutas, todos os testes)
   1) toda mensagem que sai da página diz que a pessoa veio do site de testes;
   2) cada clique fica registrado (botão, de onde a pessoa veio, teste e código, se já tinha);
   3) na área da terapeuta, o quadro "Quem chamou você no WhatsApp" mostra os cliques.
   ============================================================================ */
const DV_SITE_TXT = 'Vim pelo seu site de testes.';
function dvOrigemVisita(){
  try{
    const salva = sessionStorage.getItem('dv_origem'); if(salva) return JSON.parse(salva);
    const q = new URLSearchParams(location.search), utm = (q.get('utm_source') || q.get('origem') || q.get('de') || '').toLowerCase();
    let host = ''; try{ host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; }catch(e){}
    const base = utm || host;
    const nome = /insta/.test(base) ? 'Instagram' : /facebook|fb\.|^fb$/.test(base) ? 'Facebook' : /whats|wa\.me/.test(base) ? 'WhatsApp' : /google/.test(base) ? 'Google'
      : /tiktok/.test(base) ? 'TikTok' : /youtube|youtu\.be/.test(base) ? 'YouTube' : /ressignificar/.test(base) ? 'Site da Ressignificar' : base ? base : 'Link direto';
    const o = { origem: nome, referencia: (host ? host : '') + (utm ? (host ? ' · ' : '') + 'utm=' + utm : '') };
    sessionStorage.setItem('dv_origem', JSON.stringify(o)); return o;
  }catch(e){ return { origem:'Link direto', referencia:'' }; }
}
function dvCodigoAtual(){
  try{
    if(typeof estado !== 'undefined' && estado && estado.codigo) return estado.codigo;
    if(typeof tc !== 'undefined' && tc && tc.codigo) return tc.codigo;
    const q = new URLSearchParams(location.search), c = q.get('c') || q.get('codigo') || q.get('code') || q.get('mp') || q.get('ct');
    return c || sessionStorage.getItem('dv_ultimo_codigo') || '';
  }catch(e){ return ''; }
}
function dvTesteAtual(tela){
  const id = tela ? tela.id : '';
  if(/^tela-tc/.test(id)) return 'tracos';
  if(/^tela-mp/.test(id)) return 'mpcc';
  if(/^tela-dc/.test(id)) return 'disc';
  if(/^tela-(orientacao|dados|teste|resultado|obrigada|expirou)/.test(id)) return 'travas';
  return '';
}
function dvWhatsSite(){
  if(window.__dvWhats) return; window.__dvWhats = true;
  dvOrigemVisita();
  document.addEventListener('input', e => { if(e.target && e.target.id === 'campo-codigo'){ try{ sessionStorage.setItem('dv_ultimo_codigo', e.target.value.trim().toUpperCase()); }catch(err){} } });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="wa.me/"]'); if(!a) return;
    if(a.closest('#tela-admin')) return;                       // botões da área da terapeuta (falar com o cliente) não entram
    const tela = a.closest('.tela'), id = tela ? tela.id : '';
    const momento = /resultado|obrigada/.test(id) || /^(tf|tr|to)-zap$/.test(a.id) || /resultado/i.test(a.id) ? 'resultado'
      : (!tela || id === 'tela-capa' || id === 'tela-tc-capa' || id === 'tela-mp-capa' || a.closest('.cv-barra, footer, .rodape')) ? 'pagina' : 'durante';
    /* mensagem: sempre dizendo que veio do site de testes */
    try{
      const u = new URL(a.href, location.href); let t = u.searchParams.get('text') || '';
      if(!/site de testes/i.test(t)){
        const prim = (typeof PRIM_TER !== 'undefined' && PRIM_TER) ? PRIM_TER : '';
        t = !t ? 'Olá' + (prim ? ', ' + prim : '') + '! ' + DV_SITE_TXT + ' Queria saber mais.'
          : momento === 'pagina' ? t.replace(/^((?:Olá|Oi)[^!]*!)\s*/i, '$1 ' + DV_SITE_TXT + ' ').replace(/^(?!(?:Olá|Oi))/i, DV_SITE_TXT + ' ') : t;
        u.searchParams.set('text', t); a.href = u.toString();
      }
    }catch(err){}
    /* registro do clique */
    try{
      if(typeof T_SLUG === 'undefined' || !T_SLUG || typeof MEMBROS_URL === 'undefined') return;
      const o = dvOrigemVisita(), cl = a.cloneNode(true); cl.querySelectorAll('small,svg').forEach(x => x.remove()); const botao = (cl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      fetch(MEMBROS_URL + '/rest/v1/rpc/teste_registrar_clique', { method:'POST', keepalive:true,
        headers:{ 'Content-Type':'application/json', apikey:MEMBROS_KEY, Authorization:'Bearer ' + MEMBROS_KEY },
        body: JSON.stringify({ p_slug: T_SLUG, p_dados: { teste: dvTesteAtual(tela), momento, botao, codigo: momento === 'pagina' ? '' : dvCodigoAtual(), origem: o.origem, referencia: o.referencia } }) }).catch(() => {});
    }catch(err){}
  }, true);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvWhatsSite); else dvWhatsSite();

/* área da terapeuta: "Quem chamou você no WhatsApp" (últimos 60 dias) */
async function dvQuadroCliques(){
  const adm = document.getElementById('painel-admin'); if(!adm || typeof clienteMembros !== 'function') return;
  let box = document.getElementById('dv-cliques');
  try{
    const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
    const uid = sess.session.user.id, desde = new Date(Date.now() - 60 * 86400000).toISOString();
    const { data, error } = await c.from('teste_cliques').select('teste,momento,botao,codigo,origem,criado_em').eq('terapeuta_id', uid).gte('criado_em', desde).order('criado_em', { ascending:false }).limit(300);
    if(error || !data || !data.length){ if(box) box.remove(); return; }
    /* quem é cada código (das respostas dos três testes) */
    const cods = Array.from(new Set(data.filter(x => x.codigo).map(x => x.codigo)));
    const nomes = {};
    if(cods.length){
      const rs = await Promise.all(['travas_respostas', 'tracos_respostas', 'mpcc_respostas', 'disc_respostas'].map(t => c.from(t).select('codigo,nome').eq('terapeuta_id', uid).in('codigo', cods)));
      rs.forEach(r => (r.data || []).forEach(x => { if(x.nome) nomes[x.codigo] = x.nome; }));
    }
    const ROT = { travas:'Travas', tracos:'Traços', mpcc:'MPCC', disc:'DISC' }, MOM = { pagina:'pela página, sem teste', durante:'durante o teste', resultado:'depois do resultado' };
    const quando = iso => new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
    const pag = data.filter(x => x.momento === 'pagina'), teste = data.filter(x => x.momento !== 'pagina');
    const porOrigem = {}; pag.forEach(x => { porOrigem[x.origem || 'Link direto'] = (porOrigem[x.origem || 'Link direto'] || 0) + 1; });
    const linha = x => '<li><b>' + escV(x.codigo ? (nomes[x.codigo] || 'Código ' + x.codigo) : (x.origem || 'Link direto')) + '</b><span>' + quando(x.criado_em) + ' · ' + MOM[x.momento] + (x.teste ? ' · ' + ROT[x.teste] : '') + (x.botao ? ' · botão “' + escV(x.botao.slice(0, 40)) + '”' : '') + (x.codigo && x.origem ? ' · veio de ' + escV(x.origem) : '') + '</span></li>';
    const html = '<span class="dv-cl-olho">Quem chamou você no WhatsApp</span><p class="dv-cl-tit">' + data.length + (data.length === 1 ? ' clique' : ' cliques') + ' nos últimos 60 dias</p>' +
      '<div class="dv-cl-rodape"><span>' + pag.length + ' pela página, sem teste · ' + teste.length + ' de quem estava no teste</span>' +
      '<button type="button" class="vit-alerta" data-vit-abrir="dvClCorpo" data-txt="Ver quem chamou" aria-expanded="false" aria-controls="dvClCorpo"><span class="vit-ponto" aria-hidden="true"></span><span class="vit-alerta-txt">Ver quem chamou</span></button></div>' +
      '<div class="dv-cl-corpo" id="dvClCorpo" hidden>' +
        (teste.length ? '<h4>De quem estava fazendo o teste</h4><ul>' + teste.map(linha).join('') + '</ul>' : '') +
        (pag.length ? '<h4>Pela página, sem fazer teste</h4><p class="dv-cl-orig">De onde vieram: ' + Object.keys(porOrigem).sort((a, b) => porOrigem[b] - porOrigem[a]).map(k => escV(k) + ' (' + porOrigem[k] + ')').join(' · ') + '</p><ul>' + pag.slice(0, 60).map(linha).join('') + '</ul>' : '') +
        '<p class="dv-cl-nota">Só você vê isto. Quem clicou pela página ainda não fez o teste: a pessoa abre o WhatsApp com a mensagem pronta e você recebe a conversa.</p>' +
        '<button type="button" class="vit-fechar" data-vit-fechar="dvClCorpo">Recolher ↑</button></div>';
    if(!box){
      box = document.createElement('div'); box.id = 'dv-cliques'; box.className = 'dv-cliques nao-imprimir';
      const ref = document.getElementById('financeiroRessignificar') || document.getElementById('vitrineRessignificar') || adm.querySelector('.cabecalho-admin');
      if(ref) ref.insertAdjacentElement('afterend', box); else adm.prepend(box);
    }
    box.innerHTML = html;
  }catch(e){ if(box) box.remove(); }
}
(function(){
  const ligar = () => {
    const adm = document.getElementById('painel-admin'); if(!adm || !('MutationObserver' in window)) return;
    let ultima = 0;
    const ver = () => { if(adm.classList.contains('ver') && Date.now() - ultima > 20000){ ultima = Date.now(); setTimeout(dvQuadroCliques, 900); } };
    new MutationObserver(ver).observe(adm, { attributes:true, attributeFilter:['class'] }); ver();
  };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();

/* ============================================================================
   CRONÔMETRO DE 60 s NO FIM DO TRAÇOS E DO MPCC (igual ao Teste de Travas)
   O código diz se o cronômetro está ligado (travas_codigos.urgencia). Ao salvar, a resposta devolve um token;
   o clique no WhatsApp e a notificação ficam anotados na resposta (teste_registrar_acao).
   ============================================================================ */
const DV_URG = { seg:60, adiarMax:600, cod:null, tok:null, teste:'', u:null, timer:null, btn:null };
function dvUrgTextos(){
  const A = typeof URG_A !== 'undefined' ? URG_A : 'a terapeuta', ELA = typeof URG_ELA !== 'undefined' ? URG_ELA : 'ela', DELA = typeof URG_DELA !== 'undefined' ? URG_DELA : 'dela';
  const DA = typeof URG_DA !== 'undefined' ? URG_DA : 'da terapeuta', ELE = typeof URG_ELE !== 'undefined' && URG_ELE, AM = A.charAt(0).toUpperCase() + A.slice(1);
  return { A, rot:{ janela:'Fale com ' + A + ' agora', encerrada:'Seu tempo acabou', zap:'Conversa aberta', notificada:'Notificação enviada' },
    janela:'<b>Este é o momento de falar com ' + A + '.</b> O que você sentiu ao responder está vivo agora. Toque no botão verde e fale com ' + ELA + ' pelo WhatsApp <b>nos próximos 60 segundos</b>. Passado esse tempo, o atalho direto se fecha e você precisará aguardar o retorno ' + DELA + '.',
    encerrada:'<b>O atalho direto para o WhatsApp ' + DA + ' foi encerrado.</b> Você ainda pode avisá-' + (ELE ? 'lo' : 'la') + ' de que quer conversar: ao enviar uma notificação, ' + ELA + ' vê o seu interesse no sistema ' + DELA + '. <b>Atenção: uma notificação não é uma conversa no WhatsApp.</b> ' + AM + ' responderá assim que puder.',
    zap:'<b>Ótimo, você agiu a tempo.</b> A conversa com ' + A + ' está aberta no WhatsApp: é só enviar a mensagem que já está pronta.',
    notificada:'<b>Pronto, ' + A + ' foi ' + (ELE ? 'avisado' : 'avisada') + ' do seu interesse.</b> Lembre-se: uma notificação não abre uma conversa no WhatsApp. ' + (ELE ? 'Ele' : 'Ela') + ' retornará assim que puder.' };
}
const dvUrgFmt = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const dvUrgDec = () => DV_URG.u && DV_URG.u.inicio ? (Date.now() - DV_URG.u.inicio) / 1000 : 0;
const dvUrgAdiou = () => DV_URG.u && DV_URG.u.fim ? Math.max(0, Math.floor((Date.now() - DV_URG.u.fim) / 1000)) : 0;
/* escuta a validação do código e o salvamento das respostas (sem mexer no modelo da página) */
function dvUrgEscutar(){
  if(window.__dvUrgEsc) return; window.__dvUrgEsc = true;
  /* o programa da página entra depois de carregar os dados da terapeuta: espera ele existir */
  let n = 0; const espera = setInterval(() => { n++; if(dvUrgEmbrulhar() || n > 240) clearInterval(espera); }, 250);
  /* o botão verde do fim do teste aparece: monta o cronômetro antes dele */
  if('MutationObserver' in window) new MutationObserver(() => { clearTimeout(DV_URG.t); DV_URG.t = setTimeout(dvUrgProcurar, 80); }).observe(document.body, { childList:true, subtree:true });
}
function dvUrgEmbrulhar(){
  if(typeof window.api !== 'function' || typeof window.compRpc !== 'function') return false;
  if(window.api.__dv) return true;
  {
    const api0 = window.api;
    window.api = async function(acao, dados){ const r = await api0.apply(this, arguments);
      try{ if(typeof ACOES !== 'undefined' && acao === ACOES.validarCodigo && r && (r.valido === true || r.ok === true)) DV_URG.cod = { codigo:String(dados.codigo || '').toUpperCase(), teste:r.teste || 'travas', urgencia:r.urgencia !== false }; }catch(e){}
      return r; }; window.api.__dv = true;
  }
  {
    const rpc0 = window.compRpc;
    window.compRpc = async function(nome, args){ const r = await rpc0.apply(this, arguments);
      try{ if((nome === 'tracos_salvar_resposta' || nome === 'mpcc_salvar_resposta' || nome === 'disc_salvar_resposta') && r && r.ok === true){
        DV_URG.tok = r.acao_token || null; DV_URG.teste = nome.indexOf('tracos') === 0 ? 'tracos' : nome.indexOf('disc') === 0 ? 'disc' : 'mpcc';
        if(r.urgencia === false && DV_URG.cod) DV_URG.cod.urgencia = false;
        DV_URG.u = null; clearInterval(DV_URG.timer); DV_URG.montado = false;
      } }catch(e){}
      return r; };
  }
  return true;
}
function dvUrgProcurar(){
  if(!DV_URG.tok || DV_URG.montado) return;
  const btn = DV_URG.teste === 'tracos' ? document.querySelector('#tr-zap, #tf-zap') : DV_URG.teste === 'disc' ? document.querySelector('#tela-dc-resultado .dc-zap, #tela-dc .dc-zap') : document.querySelector('#tela-mp-resultado .mp-devolutiva .mp-zap, #tela-mp .mp-zap');
  if(!btn || btn.closest('#tela-admin')) return;
  DV_URG.montado = true; dvUrgIniciarEm(btn);
}
function dvUrgIniciarEm(btn){
  const T = dvUrgTextos(), ligado = !(DV_URG.cod && DV_URG.cod.urgencia === false);
  ['#urg-card', '#urg-notif'].forEach(s => { const e = document.querySelector(s); if(e) e.remove(); });
  DV_URG.btn = btn; btn.style.position = btn.style.position || 'relative'; btn.style.overflow = 'hidden';
  if(!btn.querySelector('.zap-linha')) btn.insertAdjacentHTML('beforeend', '<span class="zap-linha" aria-hidden="true"><i></i></span>');
  btn.addEventListener('click', dvUrgCliqueZap);
  DV_URG.u = { fase: ligado ? 'espera' : 'livre', inicio:0, fim:0 };
  if(ligado){
    const card = document.createElement('div'); card.id = 'urg-card'; card.className = 'urg'; card.setAttribute('role', 'group'); card.setAttribute('aria-label', 'Convite para falar agora');
    card.innerHTML = '<div class="urg-topo"><span class="urg-rot" id="urg-rot"></span><span><b class="urg-num" id="urg-num">01:00</b><small class="urg-legenda" id="urg-legenda"></small></span></div>'
      + '<div class="urg-barra" aria-hidden="true"><i id="urg-barra"></i></div><p class="urg-msg" id="urg-msg" aria-live="polite"></p>';
    const SINO = typeof URG_SINO !== 'undefined' ? URG_SINO : '';
    const notif = document.createElement('div'); notif.id = 'urg-notif'; notif.className = 'notif-bloco'; notif.hidden = true;
    notif.innerHTML = '<button type="button" id="btn-notif">' + SINO + '<span class="duas">Enviar notificação para ' + escV(T.A) + '<small>avisa que você quer conversar · não abre o WhatsApp</small></span><span class="notif-linha" aria-hidden="true"><i id="notif-linha"></i></span></button>'
      + '<div class="notif-caixa" id="notif-caixa" hidden><label for="notif-texto">Quer deixar um recado para ' + escV(T.A) + '? <span>(opcional)</span></label>'
      + '<textarea id="notif-texto" maxlength="500" rows="3" placeholder="Ex.: Quero entender melhor o meu resultado."></textarea>'
      + '<p class="notif-aviso">Ao enviar, ' + escV(T.A) + ' recebe a sua notificação e o seu recado no sistema. <b>Isto não abre uma conversa no WhatsApp.</b></p><p class="notif-erro" id="notif-erro" role="alert"></p>'
      + '<div class="notif-acoes"><button type="button" class="btn btn-primario" id="notif-enviar">Enviar notificação</button><button type="button" class="btn btn-contorno" id="notif-voltar">Voltar</button></div></div>';
    btn.insertAdjacentElement('beforebegin', card); card.insertAdjacentElement('afterend', notif);
    document.getElementById('btn-notif').onclick = () => { const c = document.getElementById('notif-caixa'); c.hidden = !c.hidden; if(!c.hidden) document.getElementById('notif-texto').focus(); };
    document.getElementById('notif-voltar').onclick = () => { document.getElementById('notif-caixa').hidden = true; };
    document.getElementById('notif-enviar').onclick = dvUrgNotificar;
    const comecar = () => { const u = DV_URG.u; if(!u || u.inicio) return; u.inicio = Date.now(); if(u.fase === 'espera') u.fase = 'janela'; clearInterval(DV_URG.timer); DV_URG.timer = setInterval(dvUrgTick, 250); dvUrgRender(); };
    if('IntersectionObserver' in window){ const io = new IntersectionObserver(es => { if(es.some(e => e.isIntersecting)){ io.disconnect(); comecar(); } }, { threshold:0.6 }); io.observe(card); } else comecar();
  }
  dvUrgRender();
}
function dvUrgRender(){
  const u = DV_URG.u, btn = DV_URG.btn, T = dvUrgTextos(); if(!u) return;
  const fechado = u.fase === 'encerrada' || u.fase === 'notificada';
  if(btn){ btn.style.display = fechado ? 'none' : ''; btn.classList.toggle('calmo', u.fase === 'zap'); }
  const card = document.getElementById('urg-card'); if(!card) return;
  card.className = 'urg' + (u.fase === 'encerrada' ? ' encerrada' : u.fase === 'zap' ? ' zap' : u.fase === 'notificada' ? ' notificada' : '');
  document.getElementById('urg-notif').hidden = u.fase !== 'encerrada';
  const ch = (u.fase === 'espera' || u.fase === 'janela') ? 'janela' : u.fase;
  document.getElementById('urg-rot').textContent = T.rot[ch] || '';
  document.getElementById('urg-msg').innerHTML = T[ch] || T.janela;
  dvUrgAtualizar();
}
function dvUrgAtualizar(){
  const u = DV_URG.u, num = document.getElementById('urg-num'); if(!u || !num) return;
  const leg = document.getElementById('urg-legenda'), barra = document.getElementById('urg-barra'), linha = DV_URG.btn && DV_URG.btn.querySelector('.zap-linha i');
  if(u.fase === 'espera'){ num.textContent = dvUrgFmt(DV_URG.seg); leg.textContent = 'restantes'; barra.style.width = '100%'; }
  else if(u.fase === 'janela'){ const dec = Math.min(DV_URG.seg, dvUrgDec()), resta = Math.max(0, Math.ceil(DV_URG.seg - dec)); num.textContent = dvUrgFmt(resta); leg.textContent = 'restantes'; barra.style.width = ((DV_URG.seg - dec) / DV_URG.seg * 100) + '%'; if(linha) linha.style.width = (dec / DV_URG.seg * 100) + '%'; }
  else if(u.fase === 'encerrada'){ const ad = dvUrgAdiou(), m = Math.min(ad, DV_URG.adiarMax), pct = (m / DV_URG.adiarMax * 100) + '%'; num.textContent = dvUrgFmt(m); leg.textContent = ad >= DV_URG.adiarMax ? 'adiando há mais de' : 'você está adiando há'; barra.style.width = pct; const nl = document.getElementById('notif-linha'); if(nl) nl.style.width = pct; }
  else if(u.fase === 'zap'){ num.textContent = '✔'; leg.textContent = 'você chegou a tempo'; barra.style.width = '100%'; }
  else if(u.fase === 'notificada'){ num.textContent = dvUrgFmt(u.adiouFinal || 0); leg.textContent = 'até decidir'; barra.style.width = '100%'; }
}
function dvUrgTick(){
  const u = DV_URG.u; if(!u || !document.getElementById('urg-card')){ clearInterval(DV_URG.timer); return; }
  if(u.fase === 'janela' && dvUrgDec() >= DV_URG.seg){ u.fim = u.inicio + DV_URG.seg * 1000; u.fase = 'encerrada'; dvUrgRender(); return; }
  if(u.fase === 'janela' || u.fase === 'encerrada') dvUrgAtualizar();
}
function dvUrgCliqueZap(ev){
  const u = DV_URG.u; if(!u) return;
  if(u.fase === 'encerrada' || u.fase === 'notificada'){ ev.preventDefault(); return; }
  const seg = Math.round(dvUrgDec());
  dvUrgRegistrar('whatsapp', { segundos:seg });
  if(u.fase === 'janela' || u.fase === 'espera'){ u.fase = 'zap'; clearInterval(DV_URG.timer); dvUrgRender(); }
}
async function dvUrgNotificar(){
  const u = DV_URG.u, b = document.getElementById('notif-enviar'); if(!u || u.fase !== 'encerrada') return;
  const adiou = dvUrgAdiou(), texto = document.getElementById('notif-texto').value.trim().slice(0, 500);
  b.disabled = true; b.textContent = 'Enviando...'; document.getElementById('notif-erro').textContent = '';
  const r = await dvUrgRegistrar('notificacao', { segundos:DV_URG.seg + adiou, adiou_segundos:adiou, mensagem:texto });
  if(!r || r.ok !== true){ b.disabled = false; b.textContent = 'Enviar notificação'; document.getElementById('notif-erro').textContent = 'Não consegui enviar agora. Confira a sua internet e tente de novo.'; return; }
  u.fase = 'notificada'; u.adiouFinal = Math.min(adiou, DV_URG.adiarMax); clearInterval(DV_URG.timer); dvUrgRender();
}
async function dvUrgRegistrar(tipo, dados){
  try{ if(!DV_URG.tok || typeof clienteMembros !== 'function') return { ok:false };
    const { data, error } = await clienteMembros().rpc('teste_registrar_acao', { p_teste:DV_URG.teste, p_token:DV_URG.tok, p_tipo:tipo, p_dados:dados });
    return error ? { ok:false } : data;
  }catch(e){ return { ok:false }; }
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvUrgEscutar); else dvUrgEscutar();

/* escolha do cronômetro ao gerar o código do Traços (o do MPCC está no módulo do MPCC) */
function dvUrgEscolhaTracos(){
  const b = document.getElementById('tc-gerar'); if(!b || document.getElementById('tc-alt-urg')) return;
  b.insertAdjacentHTML('beforebegin', '<div class="campo"><label id="rot-tc-urg">Cronômetro de urgência de 60 segundos no final?</label>'
    + '<div class="alternar" id="tc-alt-urg" role="radiogroup" aria-labelledby="rot-tc-urg"><button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, ligado<small>60 s para falar no WhatsApp; depois, só notificação</small></button>'
    + '<button type="button" data-v="0" role="radio" aria-checked="false">Não<small>o WhatsApp fica sempre disponível</small></button></div>'
    + '<div class="dica">Vale para o teste individual. O que a pessoa fizer fica anotado na resposta dela.</div></div>');
  document.querySelectorAll('#tc-alt-urg button').forEach(x => x.addEventListener('click', () => {
    document.querySelectorAll('#tc-alt-urg button').forEach(y => { const on = y === x; y.classList.toggle('ativa', on); y.setAttribute('aria-checked', on ? 'true' : 'false'); });
  }));
}
function dvUrgSel(id){ const b = document.querySelector('#' + id + ' button.ativa'); return !b || b.dataset.v !== '0'; }
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dvUrgEscolhaTracos); else dvUrgEscolhaTracos();

/* área da terapeuta: o que a pessoa fez no fim do Traços e do MPCC aparece em cada resposta da lista */
async function dvUrgTagsLista(){
  try{
    if(typeof clienteMembros !== 'function') return;
    const linhas = Array.from(document.querySelectorAll('.linha-item[data-dv-del="tracos"]:not([data-urg-ok]), .linha-item[data-dv-del="mpcc"]:not([data-urg-ok]), .linha-item[data-dv-del="disc"]:not([data-urg-ok])'));
    if(!linhas.length) return;
    linhas.forEach(l => l.setAttribute('data-urg-ok', '1'));
    const porTab = { tracos:[], mpcc:[], disc:[] }; linhas.forEach(l => porTab[l.dataset.dvDel].push(l.dataset.id));
    const c = clienteMembros(), mapa = {};
    for(const t of ['tracos', 'mpcc', 'disc']){ if(!porTab[t].length) continue;
      const { data } = await c.from(t + '_respostas').select('id,interesse,urgencia').in('id', porTab[t]); (data || []).forEach(x => { mapa[x.id] = x; }); }
    const dur = s => s == null ? '' : s < 60 ? Math.round(s) + ' s' : Math.floor(s / 60) + ' min';
    linhas.forEach(l => { const x = mapa[l.dataset.id]; if(!x) return; const i = x.interesse || {}, t = [];
      if(i.whatsapp) t.push('<span class="tag-int zap">WhatsApp · ' + dur(i.whatsapp.segundos) + '</span>');
      if(i.notificacao) t.push('<span class="tag-int notif">Notificação · ' + dur(i.notificacao.adiou_segundos) + ' depois</span>' + (i.notificacao.mensagem ? '' : ''));
      if(!t.length && x.urgencia === true) t.push('<span class="tag-int nada">Sem ação no fim</span>');
      if(t.length){ const esq = l.querySelector('.esq') || l; esq.insertAdjacentHTML('beforeend', '<span class="tags-int">' + t.join('') + '</span>'); }
    });
  }catch(e){}
}
if('MutationObserver' in window) (function(){ const go = () => new MutationObserver(() => { clearTimeout(window.__dvUrgTg); window.__dvUrgTg = setTimeout(dvUrgTagsLista, 150); }).observe(document.body, { childList:true, subtree:true });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); })();

/* ============================================================================
   NOME DO TESTE POR TERAPEUTA (travas_paginas.dados.nome_teste, ex.: "Teste de Padrões Mentais").
   Sem o campo, continua "Teste de Travas Mentais". Troca na página, no resultado, na área, no PDF,
   nas mensagens de WhatsApp e e-mail e na apresentação.
   ============================================================================ */
function dvNomeTeste(){ const d = dvCad(); const n = d && String(d.nome_teste || '').trim(); return n && !/^teste de travas mentais$/i.test(n) ? n : ''; }
function dvTrocarNomeTexto(t){
  const novo = dvNomeTeste(); if(!novo || !t || !/travas mentais/i.test(t)) return t;
  const resto = novo.replace(/^teste\s+(de\s+)?/i, '');            // "Padrões Mentais"
  const caso = (m, s) => m === m.toUpperCase() ? s.toUpperCase() : m.charAt(0) === m.charAt(0).toLowerCase() ? s.toLowerCase() : s;
  return t.replace(/teste de identifica[çc][ãa]o de travas mentais/gi, m => caso(m, novo))
          .replace(/teste de travas mentais/gi, m => caso(m, novo))
          .replace(/travas mentais/gi, m => caso(m, resto));
}
function dvNomeTesteAplicar(raiz){
  if(!dvNomeTeste()) return;
  const andar = document.createTreeWalker(raiz || document.body, NodeFilter.SHOW_TEXT, null); let no; const lista = [];
  while((no = andar.nextNode())){ if(/travas mentais/i.test(no.nodeValue) && !(no.parentNode && no.parentNode.closest('script,style'))) lista.push(no); }
  lista.forEach(n => { n.nodeValue = dvTrocarNomeTexto(n.nodeValue); });
  (raiz || document).querySelectorAll && (raiz || document).querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach(el => ['placeholder','title','aria-label','alt'].forEach(a => { const v = el.getAttribute(a); if(v && /travas mentais/i.test(v)) el.setAttribute(a, dvTrocarNomeTexto(v)); }));
  if(/travas mentais/i.test(document.title)) document.title = dvTrocarNomeTexto(document.title);
}
(function(){
  let feito = false;
  const ligar = () => {
    if(feito || !dvNomeTeste()) return false; feito = true;
    dvNomeTesteAplicar(document.body);
    if('MutationObserver' in window) new MutationObserver(ms => { ms.forEach(m => m.addedNodes.forEach(n => { if(n.nodeType === 1) dvNomeTesteAplicar(n); else if(n.nodeType === 3 && /travas mentais/i.test(n.nodeValue)) n.nodeValue = dvTrocarNomeTexto(n.nodeValue); })); }).observe(document.body, { childList:true, subtree:true });
    /* links de WhatsApp e e-mail: a mensagem também leva o nome novo */
    document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href*="wa.me/"], a[href^="mailto:"]'); if(!a) return;
      try{ const h = decodeURIComponent(a.getAttribute('href')); if(/travas mentais/i.test(h)){ const u = a.getAttribute('href'); a.setAttribute('href', u.replace(/(text=|body=|subject=)([^&]*)/g, (m, k, v) => k + encodeURIComponent(dvTrocarNomeTexto(decodeURIComponent(v))))); } }catch(err){} }, true);
    /* textos montados pelo programa (ficha, e-mail, mensagens) e a apresentação */
    const embrulhar = () => {
      ['textoFicha', 'mensagemCliente'].forEach(f => { if(typeof window[f] === 'function' && !window[f].__dvNome){ const o = window[f]; window[f] = function(){ return dvTrocarNomeTexto(o.apply(this, arguments)); }; window[f].__dvNome = true; } });
      if(typeof window.apresAbrir === 'function' && !window.apresAbrir.__dvNome){ const o = window.apresAbrir; window.apresAbrir = function(lead, extra){ if(!extra) extra = { voc: { teste: dvNomeTeste() } }; return o.call(this, lead, extra); }; window.apresAbrir.__dvNome = true; }
      if(typeof window.api === 'function' && !window.api.__dvNomeE){ const o = window.api; window.api = function(acao, dados){ try{ if(dados && typeof dados === 'object'){ ['assunto', 'corpo'].forEach(k => { if(typeof dados[k] === 'string') dados[k] = dvTrocarNomeTexto(dados[k]); }); } }catch(err){} return o.apply(this, arguments); }; Object.assign(window.api, o); window.api.__dvNomeE = true; }
    };
    embrulhar(); let n = 0; const t = setInterval(() => { embrulhar(); if(++n > 60) clearInterval(t); }, 500);
    return true;
  };
  let n = 0; const t = setInterval(() => { if(ligar() || ++n > 120) clearInterval(t); }, 250);
})();
