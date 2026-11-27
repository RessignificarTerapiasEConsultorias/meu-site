/* ============================================================================
   MAPAS (módulo da página do teste): Mapa da Vida (check-up) e Mapa da Procrastinação
   - Mapa da Vida: 24 afirmações de 0 a 10 (2 por área, 12 áreas), a área que a pessoa mais quer resolver,
     o quanto isso atrapalha hoje (0 a 10) e 3 perguntas de cuidado (sim ou não).
   - Mapa da Procrastinação: 45 perguntas de 0 a 10 (9 áreas de 5) e a pergunta de impacto (0 a 10).
     As respostas vão cruas: quem inverte as perguntas de rotina e ambiente é o servidor.
   O servidor recalcula tudo (mapa_salvar_resposta). Não é diagnóstico.
   O mesmo código serve para o acompanhamento: a pessoa refaz a cada X dias (30 por padrão).
   Telas: capa com código -> cadastro -> perguntas -> resultado (ou agradecimento)
   Área da terapeuta: acompanhamentos (por pessoa), códigos, detalhe com antes e agora, PDF.
   O modelo da página chama maAjustarTestes(ativos) quando a terapeuta tem um dos Mapas.
   ============================================================================ */
/* faixas, números, roda da vida e gráfico de antes e agora: mapas-nucleo.js (carregado antes deste) */
const MA_TESTES = {
  vida:{
    id:'vida', NOME:'Mapa da Vida', CURTO:'Mapa da Vida', tema:'Mapa da Vida', tabela:'vida_respostas', param:'vi', minutos:5, baixa:'tranquilo',
    selo:'Mapa da Vida · Check-up', h1:'Como está <em>cada área</em> da sua vida hoje?',
    capa:'Um check-up rápido das 12 áreas da vida: emoções, autoestima, amor, família, carreira, energia, foco, dinheiro, saúde, relações, sentido e perdas. No final, você vê a sua roda da vida.',
    lista:['No celular, cerca de 5 minutos', 'Uma afirmação por vez, sem resposta certa ou errada', 'No final, a sua roda com as 12 áreas', 'Autoconhecimento, não é diagnóstico'],
    abertura:'Em uns 5 minutos você vê como está cada área da sua vida hoje. Não existe resposta certa. Este mapa é de autoconhecimento e não é um diagnóstico.',
    escala:['Não me descreve em nada', 'Me descreve completamente'],
    AREAS:[
      { id:'emocoes', nome:'Emoções', curto:'Emoções', itens:['Tenho me sentido ansioso(a), irritado(a) ou triste com frequência.', 'Minhas emoções têm atrapalhado o meu dia a dia.'] },
      { id:'autoestima', nome:'Autoestima', curto:'Autoestima', itens:['Me cobro demais e raramente me acho bom(boa) o suficiente.', 'Deixo de me posicionar por medo do julgamento dos outros.'] },
      { id:'amor', nome:'Relacionamento amoroso', curto:'Amor', itens:['Meu relacionamento, ou a falta dele, tem me trazido sofrimento.', 'Repito nos relacionamentos padrões que eu não queria repetir.'] },
      { id:'familia', nome:'Família e filhos', curto:'Família', itens:['A convivência em casa tem sido pesada.', 'Tenho dificuldade com limites, cobranças ou conflitos na família.'] },
      { id:'carreira', nome:'Carreira', curto:'Carreira', itens:['Não me sinto no lugar certo no trabalho.', 'Tenho dúvida sobre o rumo profissional que quero seguir.'] },
      { id:'energia', nome:'Energia', curto:'Energia', itens:['Termino a semana sem energia, mesmo quando descanso.', 'Sinto que carrego peso demais e não tenho com quem dividir.'] },
      { id:'foco', nome:'Foco e produtividade', curto:'Foco', itens:['Adio coisas importantes mesmo sabendo que vou me prejudicar.', 'Começo muitas coisas e termino poucas.'] },
      { id:'dinheiro', nome:'Dinheiro', curto:'Dinheiro', itens:['Pensar em dinheiro me causa ansiedade ou culpa.', 'Tenho dificuldade de cobrar, guardar ou organizar o meu dinheiro.'] },
      { id:'saude', nome:'Saúde e hábitos', curto:'Saúde', itens:['Meu sono, minha alimentação ou meu corpo têm pedido atenção.', 'Não consigo manter hábitos que sei que me fazem bem.'] },
      { id:'relacoes', nome:'Relações e limites', curto:'Relações', itens:['Tenho dificuldade de dizer não.', 'Me sinto sozinho(a) ou deslocado(a) entre as pessoas.'] },
      { id:'sentido', nome:'Sentido de vida', curto:'Sentido', itens:['Sinto um vazio ou falta de propósito.', 'Vivo no automático, sem saber para onde estou indo.'] },
      { id:'perdas', nome:'Perdas e transições', curto:'Perdas', itens:['Estou passando por uma perda, separação ou mudança que ainda pesa.', 'Algo do passado ainda interfere no meu presente.'] }
    ],
    impacto:'De 0 a 10, o quanto isso atrapalha a sua vida hoje?',
    CUIDADO:[
      { k:'pensamentos', q:'Nas últimas duas semanas, você teve pensamentos de não querer mais viver ou de se machucar?', sim:MA_CVV, forte:true },
      { k:'substancias', q:'O uso de álcool, remédios ou outras substâncias tem saído do seu controle?', sim:MA_SUBST },
      { k:'tratamento', q:'Você está em tratamento médico ou psiquiátrico?', info:MA_TRAT }
    ]
  },
  procrastinacao:{
    id:'procrastinacao', NOME:'Mapa da Procrastinação', CURTO:'Procrastinação', tema:'Procrastinação', tabela:'procrastinacao_respostas', param:'pc', minutos:8, baixa:'leve',
    selo:'Mapa da Procrastinação', h1:'O que está por trás da sua <em>procrastinação</em>?',
    capa:'Um mapa em 9 áreas do que faz você adiar: sintomas, pensamentos, gatilhos, ambiente, rotina, decisões e distrações. No final, você vê onde a procrastinação mais pesa e o seu perfil.',
    lista:['No celular, cerca de 8 minutos', 'Uma pergunta por vez, sem resposta certa ou errada', 'No final, as 9 áreas em barras e o seu perfil', 'Autoconhecimento, não é diagnóstico'],
    abertura:'Em uns 8 minutos você vê o que está por trás da sua procrastinação. Não existe resposta certa. Este mapa é de autoconhecimento e não é um diagnóstico.',
    escala:['Não me identifico em nada', 'Me descreve completamente'],
    AREAS:[
      { id:'comportamentais', nome:'Sintomas comportamentais', curto:'Comportamento', itens:['Você costuma adiar tarefas mesmo sabendo que terá consequências negativas?', 'Você se distrai com atividades menos importantes para evitar o que precisa ser feito?', 'Já deixou de entregar algo importante por falta de tempo causada por adiamento?', 'Você sente dificuldade em iniciar tarefas mesmo quando elas são simples?', 'Você procrastina tarefas que são importantes para seus objetivos pessoais?'] },
      { id:'emocionais', nome:'Sintomas emocionais', curto:'Emoções', itens:['Você sente culpa ou frustração após procrastinar?', 'Você sente ansiedade só de pensar na tarefa que está adiando?', 'Você se sente emocionalmente sobrecarregado(a) antes de começar?', 'Você se sente desmotivado(a) para realizar suas tarefas?', 'Você se culpa excessivamente quando não realiza suas tarefas?'] },
      { id:'fisicos', nome:'Sintomas físicos', curto:'Corpo', itens:['Você sente cansaço excessivo sem esforço?', 'Você sente dores musculares ou de cabeça ao procrastinar?', 'Você tem dificuldade para dormir quando está adiando tarefas?', 'Você sente o corpo travar ou ficar tenso ao pensar em iniciar tarefas?', 'Você percebe alterações no apetite relacionadas à procrastinação?'] },
      { id:'pensamentos', nome:'Pensamentos comuns', curto:'Pensamentos', itens:['Você acha que precisa estar no "clima certo" para agir?', 'Você pensa que, se não for perfeito, não vale a pena começar?', 'Você diz que funciona melhor sob pressão e por isso adia?', 'Você acredita que a tarefa não é tão importante para começar agora?', 'Você acha que precisa de muita energia para iniciar uma tarefa?'] },
      { id:'gatilhos', nome:'Gatilhos emocionais', curto:'Gatilhos', itens:['Você evita começar por medo de fracassar?', 'Você se sente julgado(a) ou pressionado(a)?', 'Você adia tarefas em que pode ser avaliado(a) ou criticado(a)?', 'Você evita tarefas que geram desconforto emocional?', 'Você se sente inseguro(a) sobre suas capacidades?'] },
      { id:'ambiente', nome:'Ambiente e contexto', curto:'Ambiente', itens:['Você tem muitas distrações no ambiente de trabalho ou estudo?', 'Seu local é confortável e organizado?', 'Você mantém o celular longe enquanto tenta focar?', 'O ambiente tem iluminação adequada?', 'Você compartilha o espaço com pessoas que atrapalham seu foco?'] },
      { id:'habitos', nome:'Hábitos e rotina', curto:'Rotina', itens:['Você segue uma rotina diária organizada?', 'Você controla o tempo gasto em atividades?', 'Você mantém hábitos consistentes?', 'Você define metas diárias?', 'Você revisa suas metas regularmente?'] },
      { id:'decisao', nome:'Tomada de decisão', curto:'Decisão', itens:['Você tem muitas tarefas e não sabe por onde começar?', 'Você começa muitas coisas e não conclui?', 'Você se sente perdido(a), sem metas ou plano?', 'Você tem dificuldade em priorizar suas tarefas?', 'Você sente que procrastina por não saber o objetivo final?'] },
      { id:'recompensa', nome:'Recompensa e distração', curto:'Distração', itens:['Você adia principalmente as tarefas chatas ou repetitivas?', 'Você pega o celular sem perceber quando vai começar algo?', 'Você troca a tarefa por algo mais prazeroso naquele momento?', 'Você só se mexe quando o prazo ou a recompensa estão perto?', 'Você passa mais tempo nas redes sociais do que gostaria?'] }
    ],
    impacto:'De 0 a 10, o quanto a procrastinação atrapalha a sua vida hoje?',
    PERFIS:{
      perfeccionista:'Você tende a adiar quando sente que o resultado precisa sair perfeito, e aí começar fica pesado.',
      medo:'O receio de errar ou de ser avaliado(a) costuma pesar na hora de começar.',
      sobrecarga:'As emoções ficam intensas perto da tarefa, e adiar vira um jeito de aliviar esse peso.',
      desorganizado:'A rotina e o ambiente ainda não ajudam: falta uma estrutura que torne o começo mais fácil.',
      sem_direcao:'Quando o objetivo e as prioridades não estão claros, fica difícil saber por onde começar.',
      distraido:'O que é mais prazeroso no momento, como o celular, costuma ganhar da tarefa.'
    },
    CUIDADO:[]
  },
  autoestima:{
    id:'autoestima', NOME:'Mapa da Autoestima', CURTO:'Autoestima', tema:'Autoestima', tabela:'autoestima_respostas', param:'ae', minutos:6, baixa:'leve',
    selo:'Mapa da Autoestima', h1:'Como está a sua relação <em>com você</em>?',
    capa:'Um mapa em 6 áreas da sua relação com você mesmo(a): o seu valor, a autocrítica, a comparação, a necessidade de aprovação, o medo de se expor e o merecimento.',
    lista:['No celular, cerca de 6 minutos', 'Uma afirmação por vez, sem resposta certa ou errada', 'No final, as 6 áreas em barras e por onde começar', 'Autoconhecimento, não é diagnóstico'],
    abertura:'Em uns 6 minutos você vê como está a sua relação com você mesmo(a): o seu valor, a sua autocrítica e os seus limites. Não existe resposta certa. Este mapa é de autoconhecimento e não é um diagnóstico.',
    escala:['Não me descreve em nada', 'Me descreve completamente'],
    AREAS:[
      { id:"autovalor", nome:"Autovalor", curto:"Autovalor", itens:["Sinto que não sou bom(boa) o suficiente.", "Tenho dificuldade de reconhecer minhas qualidades.", "Quando recebo um elogio, acho que não mereço.", "Sinto que valho menos do que as pessoas ao meu redor.", "Meu valor depende do que eu produzo ou entrego."] },
      { id:"autocritica", nome:"Autocrítica", curto:"Autocrítica", itens:["Sou muito duro(a) comigo quando erro.", "Fico remoendo meus erros por muito tempo.", "Falo comigo de um jeito que não falaria com ninguém.", "Raramente fico satisfeito(a) com o que faço.", "Me culpo por coisas que não estavam sob meu controle."] },
      { id:"comparacao", nome:"Comparação", curto:"Comparação", itens:["Me comparo com outras pessoas e saio me sentindo pior.", "Nas redes sociais, sinto que todo mundo está melhor que eu.", "Acho que os outros merecem mais do que eu.", "Me sinto para trás quando vejo o sucesso de pessoas próximas.", "Sinto que estou sempre atrasado(a) em relação aos outros."] },
      { id:"aprovacao", nome:"Necessidade de aprovação", curto:"Aprovação", itens:["Digo sim quando queria dizer não.", "Preciso que os outros aprovem minhas decisões.", "Evito conflitos mesmo quando saio prejudicado(a).", "Fico mal quando alguém está chateado comigo.", "Mudo de opinião para agradar."] },
      { id:"exposicao", nome:"Medo de exposição", curto:"Exposição", itens:["Sinto que, a qualquer momento, vão descobrir que não sou tão capaz.", "Evito me mostrar (gravar vídeos, falar em público, divulgar meu trabalho).", "Atribuo minhas conquistas à sorte.", "Tenho medo de ser julgado(a) quando me posiciono.", "Deixo oportunidades passarem por achar que não estou pronto(a)."] },
      { id:"merecimento", nome:"Merecimento e limites", curto:"Merecimento", itens:["Aceito menos do que mereço no trabalho, no amor ou no dinheiro.", "Tenho dificuldade de cobrar o valor justo pelo que faço.", "Coloco as necessidades dos outros sempre antes das minhas.", "Sinto culpa quando cuido de mim.", "Permaneço em situações que me fazem mal."] }
    ],
    impacto:'De 0 a 10, o quanto isso atrapalha a sua vida hoje?', impactoRot:'O quanto isso atrapalha a sua vida hoje',
    destaqueTit:'Onde vale começar', destaqueRot:'Uma palavra para você',
    DESTAQUE:{
      autovalor:'O seu valor não depende do que você entrega. Começar a se olhar com mais gentileza já é um passo.',
      autocritica:'Você tem sido duro(a) com você. Aprender a falar consigo como falaria com alguém querido muda muita coisa.',
      comparacao:'Cada pessoa tem o próprio tempo. Olhar mais para o seu caminho e menos para o dos outros traz alívio.',
      aprovacao:'Agradar a todo mundo cansa. Dá para cuidar das relações e, ao mesmo tempo, respeitar o que você quer.',
      exposicao:'O que você conquistou também é mérito seu. Dá para se mostrar aos poucos, no seu ritmo.',
      merecimento:'Cuidar de você não é egoísmo. Você também merece receber o que oferece aos outros.'
    },
    CUIDADO:[]
  },
  dinheiro:{
    id:'dinheiro', NOME:'Mapa do Dinheiro', CURTO:'Dinheiro', tema:'Dinheiro', tabela:'dinheiro_respostas', param:'mf', minutos:6, baixa:'leve',
    selo:'Mapa do Dinheiro', h1:'Como está a sua relação com o <em>dinheiro</em>?',
    capa:'Um mapa em 6 áreas da sua relação com o dinheiro: crenças, cobrar e receber, emoções, organização, impulsos e a história da sua família.',
    lista:['No celular, cerca de 6 minutos', 'Uma afirmação por vez, sem resposta certa ou errada', 'No final, as 6 áreas em barras e o primeiro passo', 'Autoconhecimento, não é diagnóstico nem consultoria financeira'],
    abertura:'Em uns 6 minutos você vê como está a sua relação com o dinheiro: crenças, cobrança, emoções e organização. Não existe resposta certa. Este mapa é de autoconhecimento e não é um diagnóstico.',
    escala:['Não me descreve em nada', 'Me descreve completamente'],
    AREAS:[
      { id:"crencas", nome:"Crenças sobre dinheiro", curto:"Crenças", itens:["Acho que dinheiro afasta as pessoas ou muda quem a gente é.", "Cresci ouvindo que dinheiro é difícil, sujo ou perigoso.", "Sinto que ganhar bem não é para pessoas como eu.", "Acho errado querer ganhar mais.", "Acredito que para ganhar dinheiro é preciso sofrer muito."] },
      { id:"cobrar", nome:"Cobrar e receber", curto:"Cobrar", itens:["Tenho dificuldade de dizer o meu preço.", "Dou desconto antes mesmo de a pessoa pedir.", "Fico sem graça de cobrar quem me deve.", "Trabalho mais do que o combinado sem cobrar a diferença.", "Tenho medo de perder o cliente se aumentar o preço."] },
      { id:"emocoes", nome:"Emoções com dinheiro", curto:"Emoções", itens:["Pensar nas minhas contas me causa ansiedade.", "Evito olhar o extrato ou o saldo.", "Sinto culpa quando gasto comigo.", "Fico tenso(a) quando o assunto é dinheiro em casa.", "Perco o sono por causa de dinheiro."] },
      { id:"organizacao", nome:"Organização", curto:"Organização", itens:["Não sei exatamente quanto ganho e quanto gasto por mês.", "Misturo o dinheiro pessoal com o do trabalho.", "Não tenho reserva para imprevistos.", "Pago contas atrasadas com frequência.", "Não planejo os gastos do mês."] },
      { id:"impulsos", nome:"Impulsos e autossabotagem", curto:"Impulsos", itens:["Compro por impulso para aliviar emoções.", "Quando sobra dinheiro, ele some sem eu perceber.", "Faço dívidas para manter um padrão.", "Começo a guardar e logo desisto.", "Quando as coisas melhoram, crio um problema que me faz voltar ao aperto."] },
      { id:"familia", nome:"Família e dinheiro", curto:"Família", itens:["Repito com o dinheiro o que vi meus pais fazerem.", "Me sinto responsável por sustentar ou salvar alguém da família.", "Tenho medo de ganhar mais do que a minha família.", "Dinheiro é motivo de briga na minha família.", "Empresto ou dou dinheiro mesmo quando me faz falta."] }
    ],
    impacto:'De 0 a 10, o quanto a sua relação com o dinheiro atrapalha a sua vida hoje?', impactoRot:'O quanto a sua relação com o dinheiro atrapalha a sua vida hoje',
    destaqueTit:'O primeiro passo', destaqueRot:'Primeiro passo',
    DESTAQUE:{
      crencas:'Primeiro passo: anotar as frases sobre dinheiro que você ouviu na infância e perceber quais ainda guiam você.',
      cobrar:'Primeiro passo: escrever o seu preço e treinar dizê-lo em voz alta, sem se justificar.',
      emocoes:'Primeiro passo: escolher um dia da semana para olhar o saldo com calma, respirando antes de abrir.',
      organizacao:'Primeiro passo: anotar por uma semana tudo o que entra e sai.',
      impulsos:'Primeiro passo: antes de uma compra não planejada, esperar um dia e ver se a vontade continua.',
      familia:'Primeiro passo: perceber, sem culpa, o que você repete do jeito da sua família lidar com dinheiro.'
    },
    notaTerap:'O terapeuta trabalha a relação emocional com o dinheiro, não dá consultoria de investimento.',
    CUIDADO:[]
  },
  profissional:{
    id:'profissional', NOME:'Mapa Profissional', CURTO:'Profissional', tema:'Mapa Profissional', tabela:'profissional_respostas', param:'pf', minutos:10, baixa:'leve',
    selo:'Mapa Profissional', h1:'O que combina com você <em>no trabalho</em>?',
    capa:'Os seus interesses profissionais, o seu jeito de decidir e de trabalhar, os seus talentos e como está a sua energia no trabalho.',
    lista:['No celular, cerca de 10 minutos', 'Notas de 0 a 10 e perguntas de escolher uma opção', 'No final, os seus interesses, estilos, forças e energia', 'Autoconhecimento, não é um teste psicológico'],
    abertura:'Este mapa foi inspirado em teorias públicas sobre interesses profissionais, como o modelo de John Holland, e em estudos sobre estilos de trabalho. Ele ajuda você a identificar seus interesses, seu jeito de decidir e de trabalhar, seus talentos e como está a sua energia. É uma ferramenta de autoconhecimento, não um teste psicológico.',
    escala:['Não me descreve', 'Me descreve completamente'], escalaInt:['Não combina nada', 'Combina muito'],
    INTERESSES:[
      { id:"realista", nome:"Realista", curto:"Realista", itens:["Trabalhar com máquinas e equipamentos.", "Desenvolver projetos técnicos.", "Trabalhar ao ar livre.", "Usar ferramentas e consertar coisas com as mãos."] },
      { id:"investigativo", nome:"Investigativo", curto:"Investigativo", itens:["Entender como os fenômenos funcionam.", "Analisar dados e números para tirar conclusões.", "Estudar o comportamento humano.", "Encontrar jeitos de melhorar sistemas e processos.", "Estudar e pesquisar sozinho(a), no meu ritmo."] },
      { id:"artistico", nome:"Artístico", curto:"Artístico", itens:["Criar coisas visuais (imagens, desenhos, ambientes).", "Escrever textos.", "Apresentar-me em público ou no palco.", "Fazer ou trabalhar com música.", "Criar ideias originais."] },
      { id:"social", nome:"Social", curto:"Social", itens:["Ensinar.", "Ouvir as pessoas com atenção.", "Cuidar de pessoas.", "Orientar e aconselhar."] },
      { id:"empreendedor", nome:"Empreendedor", curto:"Empreendedor", itens:["Organizar e liderar equipes.", "Inspirar e motivar pessoas.", "Negociar e vender.", "Ter o meu próprio negócio."] },
      { id:"convencional", nome:"Convencional", curto:"Convencional", itens:["Trabalhar com números e contas.", "Organizar documentos e registros.", "Seguir normas e procedimentos.", "Montar e cumprir cronogramas."] }
    ],
    ESCOLHAS:[
      { id:"d1", parte:"Decidir", q:"Quando precisa tomar uma decisão importante, você costuma…", ops:[["A", "basear em dados, planilhas e indicadores"], ["B", "pesar prós e contras"]] },
      { id:"d2", parte:"Decidir", q:"Quando não há dados claros, você confia mais…", ops:[["C", "na sensação de que algo \"não bate\""], ["D", "num \"estalo\" que parece certo"]] },
      { id:"d3", parte:"Decidir", q:"Antes de decidir, você ouve mais…", ops:[["E", "pessoas próximas"], ["F", "colegas ou mentores com experiência"]] },
      { id:"d4", parte:"Decidir", q:"O que pesa mais na sua decisão?", ops:[["G", "as perdas e os riscos"], ["H", "os impactos nos resultados futuros"]] },
      { id:"a1", parte:"Agir", q:"Diante de um prazo ou tarefa difícil, você…", ops:[["A", "planeja e divide em partes"], ["B", "prioriza o essencial"], ["C", "faz listas e segue um passo por vez"], ["D", "pede ajuda ou divide com colegas"]] },
      { id:"a2", parte:"Agir", q:"O que mais te move a cumprir?", ops:[["E", "não decepcionar os outros"], ["F", "o compromisso com o que me propus"]] },
      { id:"a3", parte:"Agir", q:"Quando você rende mais?", ops:[["G", "com prazo curto e ação rápida"], ["H", "com desafio de alta performance"]] },
      { id:"t1", parte:"Trabalhar", q:"Seu papel preferido na equipe", ops:[["A", "ajudar e apoiar"], ["B", "coordenar e alinhar"]] },
      { id:"t2", parte:"Trabalhar", q:"Seu ritmo preferido", ops:[["C", "no meu ritmo, concentrado(a)"], ["D", "com liberdade para decidir sozinho(a)"]] },
      { id:"t3", parte:"Trabalhar", q:"A estrutura que te deixa bem", ops:[["E", "tarefas repetitivas e organizadas"], ["F", "normas claras e hierarquia definida"]] },
      { id:"t4", parte:"Trabalhar", q:"Diante do que já existe, você prefere…", ops:[["G", "propor soluções ou produtos novos"], ["H", "otimizar o jeito de fazer"]] },
      { id:"f1", parte:"Talentos", q:"Suas qualidades aparecem mais em…", ops:[["A", "ideias visuais ou artísticas"], ["B", "soluções práticas ou técnicas"], ["C", "planejamento"], ["D", "revisar e corrigir"]] },
      { id:"f2", parte:"Talentos", q:"Com pessoas, você se destaca em…", ops:[["E", "apoio emocional"], ["F", "mediar conflitos e facilitar o diálogo"]] },
      { id:"f3", parte:"Talentos", q:"Sua persistência aparece em…", ops:[["G", "metas que exigem constância"], ["H", "projetos longos e difíceis"]] },
      { id:"f4", parte:"Talentos", q:"Você brilha em…", ops:[["I", "ambientes dinâmicos, com muitas tarefas"], ["J", "papéis novos e aprendizado constante"]] }
    ],
    AREAS:[
      { id:"exaustao", nome:"Exaustão", curto:"Exaustão", itens:["Chego ao fim do dia de trabalho sem energia para mais nada.", "Acordo cansado(a) só de pensar no trabalho.", "Mesmo nas folgas, não consigo me recuperar.", "Sinto que meu corpo está no limite."] },
      { id:"distanciamento", nome:"Distanciamento", curto:"Distanciamento", itens:["Fiquei mais frio(a) ou irônico(a) com o meu trabalho.", "Faço só o mínimo necessário.", "Sinto que o meu trabalho perdeu o sentido.", "Evito pessoas ou tarefas que antes não me incomodavam."] },
      { id:"nao_render", nome:"Sensação de não render", curto:"Não render", itens:["Sinto que não dou conta, por mais que me esforce.", "Duvido da minha capacidade de fazer bem o meu trabalho.", "Erro ou esqueço coisas que antes fazia sem dificuldade.", "Sinto que nada do que faço é reconhecido."] }
    ],
    DECISAO:{ analitico:'Você decide com base em dados e indicadores.', intuitivo:'Você confia na sua percepção quando faltam dados.', relacional:'Você ouve as pessoas antes de decidir.', cauteloso:'Você olha primeiro os riscos.' },
    rotGeral:'Energia (média)',
    CUIDADO:[]
  }
};
const MA_PARTES = { Decidir:'Parte 2 · Decidir', Agir:'Parte 3 · Agir', Trabalhar:'Parte 4 · Trabalhar', Talentos:'Parte 5 · Talentos' };
MA_TESTES.vida.impactoRot = 'O quanto isso atrapalha a sua vida hoje';
MA_TESTES.procrastinacao.impactoRot = 'O quanto a procrastinação atrapalha a sua vida hoje';
/* as listas de notas de cada Mapa: { itens:30 } ou, no Profissional, { interesses:26, energia:12 } */
Object.values(MA_TESTES).forEach(c => { const n = L => L.reduce((s, a) => s + a.itens.length, 0);
  c.LISTAS = c.INTERESSES ? { interesses:n(c.INTERESSES), energia:n(c.AREAS) } : { itens:n(c.AREAS) }; });
const MA_IDS = Object.keys(MA_TESTES);
const maEh = t => MA_IDS.indexOf(t) > -1;

const maPrim = n => String(n || '').trim().split(/\s+/)[0] || '';
const maEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const maDig = v => String(v || '').replace(/\D/g, '');
const maAp = () => typeof T_A !== 'undefined' ? T_A : 'quem te atende';
const maLink = (teste, codigo) => typeof linkTeste === 'function' ? linkTeste(teste, codigo) : location.origin + '/teste/?t=' + encodeURIComponent(window.T_SLUG || '') + '&' + MA_TESTES[teste].param + '=' + encodeURIComponent(codigo);
const maQuando = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const maData = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
const maDataCurta = iso => iso ? new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }) : '';
const maZapTer = texto => 'https://wa.me/' + ((typeof CONFIG !== 'undefined' && CONFIG.whatsappNumero) || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
/* calc guardado na resposta (dados = respostas + cálculo do servidor) */
function maCalcDe(cfg, d){
  d = d || {};
  const objs = v => Array.isArray(v) && v.length && typeof v[0] === 'object' ? v : [];
  const areas = Array.isArray(d.areas) ? d.areas : objs(d.energia);   // no Profissional, as "áreas" são os 3 sinais de energia
  return { areas, top3:d.top3 || [], top2:d.top2 || [], recomendados:d.recomendados || [], foco:d.foco, foco_nome:d.foco_nome, impacto:d.impacto, geral:d.geral,
    cuidado:d.cuidado || {}, perfis:d.perfis || [], alertas:d.alertas || [], interesses:objs(d.interesses), decisao:d.decisao || null, estilo:d.estilo || [], forcas:d.forcas || [],
    passos:d.passos || [], energia_geral:d.energia_geral };
}

/* ---- 1. GRÁFICOS (SVG, sem biblioteca) ---- */
function maBarras(cfg, areas, antes, neutro, defs){
  const notas = maNotas(areas);
  return `<div class="ma-barras">${(defs || cfg.AREAS).map(a => { const v = +notas[a.id] || 0, fx = maFaixaDe(cfg, v), av = antes ? antes[a.id] : null;
    return `<div class="ma-barra"><b>${maEsc(a.nome)} ${neutro ? '' : maChip(cfg, fx)}</b><span class="ma-v">${av != null ? '<small>' + maNum(av) + ' → </small>' : ''}${maNum(v)}${av != null ? ' ' + maSeta(v - av) : ''}</span>
      <span class="ma-tr"><i style="width:${Math.max(2, v * 10)}%;background:${neutro ? '#3E7C74' : maFx(cfg, fx).cor}"></i></span>
      ${av != null ? `<span class="ma-tr ma-tr-antes" title="Antes"><i style="width:${Math.max(2, av * 10)}%"></i></span>` : ''}</div>`; }).join('')}</div>`;
}
function maEvolTabela(cfg, hist){
  if(!hist || hist.length < 2) return '';
  const cols = hist.map(h => ({ h, n:maNotas(h.areas) }));
  return `<div class="ma-evol"><table><thead><tr><th>Área</th>${cols.map(c => `<th>${c.h.aplicacao || ''}ª<br><small>${maDataCurta(c.h.em)}</small></th>`).join('')}</tr></thead><tbody>
    <tr><td><b>Impacto (0 a 10)</b></td>${cols.map(c => `<td>${maNum(c.h.impacto)}</td>`).join('')}</tr>
    <tr><td><b>Média geral</b></td>${cols.map(c => `<td>${maNum(c.h.geral)}</td>`).join('')}</tr>
    ${cfg.AREAS.map(a => `<tr><td>${maEsc(a.nome)}</td>${cols.map(c => `<td>${maNum(c.n[a.id])}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <p class="ma-nota-peq">Números menores são melhores: significam que a área pesa menos.</p></div>`;
}

/* ---- 2. O RELATÓRIO (mesmas seções na tela da pessoa, na área da terapeuta e no PDF) ---- */
function maSecoes(cfg, calc, hist, terapeuta){
  const ant = hist && hist.length > 1 ? hist[hist.length - 2] : null, antes = ant ? maNotas(ant.areas) : null;
  const ordem = calc.areas.slice().sort((a, b) => b.nota - a.nota);
  const cu = calc.cuidado || {}, out = {};
  out.cuidado = '';
  if(cfg.id === 'vida'){
    if(cu.pensamentos) out.cuidado += `<div class="ma-apoio" role="note"><b>Você não está só.</b> ${maEsc(MA_CVV.replace(/^Você não está só\.\s*/, ''))}</div>`;
    if(cu.substancias) out.cuidado += `<div class="ma-aviso-suave">${maEsc(MA_SUBST)}</div>`;
    if(cu.tratamento) out.cuidado += `<div class="ma-aviso-info">${maEsc(MA_TRAT)}</div>`;
  }
  const impacto = calc.impacto != null ? `<div class="ma-impacto"><span class="ma-imp-num" style="--c:${maFx(cfg, maFaixaDe(cfg, calc.impacto)).cor}"><b>${maNum(calc.impacto)}</b><small>de 10</small></span>
    <span>${cfg.id === 'vida' && calc.foco_nome ? 'A área que você mais quer resolver agora é <b>' + maEsc(calc.foco_nome) + '</b>. ' : ''}${cfg.impactoRot || 'O quanto isso atrapalha a sua vida hoje'}: <b>${maNum(calc.impacto)} de 10</b>${ant && ant.impacto != null ? ' · antes: ' + maNum(ant.impacto) + ' ' + maSeta(calc.impacto - ant.impacto) : ''}.</span></div>` : '';
  if(cfg.id === 'vida'){
    out.mapa = `<h2>A sua roda da vida</h2>
      <div class="ma-graf"><div>${maRodaSVG(cfg, calc.areas, antes)}${ant ? '<p class="ma-nota-peq" style="text-align:center">Linha tracejada: aplicação anterior</p>' : ''}</div>
      <div class="ma-lista">${ordem.map(a => { const av = antes ? antes[a.id] : null;
        return `<div class="ma-li"><span class="ma-pt" style="background:${maFx(cfg, a.faixa).cor}"></span><b>${maEsc(a.nome)}</b><span class="ma-li-v">${av != null ? '<small>' + maNum(av) + ' → </small>' : ''}${maNum(a.nota)}${av != null ? ' ' + maSeta(a.nota - av) : ''}</span>${maChip(cfg, a.faixa)}</div>`; }).join('')}</div></div>
      <p class="ma-nota-peq">De 0 a 10: quanto maior, mais a área pesa hoje. Até 3,9 Tranquilo · de 4 a 6,9 Atenção · de 7 a 10 Prioridade.</p>`;
    out.foco = `<h2>O que você quer resolver agora</h2>${impacto}`;
    if(terapeuta){
      const t3 = (calc.top3 || []).map((a, i) => `<li><b>${i + 1}. ${maEsc(a.nome)}</b> ${maChip(cfg, a.faixa, maNum(a.nota))}<br><small>Mapa recomendado: <b>${maEsc(a.mapa || '')}</b></small></li>`).join('');
      out.terap = `<h2>Para quem atende</h2>
        <h3 class="ma-h3">As 3 áreas mais altas</h3><ol class="ma-top3">${t3}</ol>
        <h3 class="ma-h3">Mapas recomendados</h3><ul class="ma-recom">${(calc.recomendados || []).map(m => '<li>' + maEsc(m) + '</li>').join('')}</ul>
        <p class="ma-nota-peq">O Mapa do Caráter é recomendado para todos, porque alimenta a causa raiz.</p>
        <h3 class="ma-h3">Perguntas de cuidado</h3>
        <ul class="ma-cuid">${cfg.CUIDADO.map(c => `<li class="${cu[c.k] ? (c.k === 'pensamentos' ? 'sim forte' : 'sim') : ''}"><span>${maEsc(c.q)}</span><b>${cu[c.k] ? 'SIM' : 'Não'}</b></li>`).join('')}</ul>`;
    }
  } else if(cfg.id === 'autoestima' || cfg.id === 'dinheiro'){
    const alertas = (calc.alertas || []).filter(a => terapeuta || !a.so_terapeuta);
    const top2 = (calc.top2 && calc.top2.length ? calc.top2 : ordem.slice(0, 2));
    out.mapa = `<h2>As 6 áreas do ${maEsc(cfg.NOME)}</h2>${ant ? '<p class="ma-nota-peq" style="margin:0 0 8px">Barra cinza: aplicação anterior.</p>' : ''}
      ${maBarras(cfg, calc.areas, antes)}
      <p class="ma-nota-peq">De 0 a 10: quanto maior, mais a área pesa hoje. Até 3,9 Leve · de 4 a 6,9 Atenção · de 7 a 10 Prioridade.</p>`;
    out.foco = `<h2>${maEsc(cfg.destaqueTit)}</h2><div class="ma-perfis">${top2.map((a, i) => `<div class="ma-perfil"><span class="ma-perfil-n">${i === 0 ? 'A área mais alta' : 'A segunda'}</span>
        <h3>${maEsc(a.nome)} ${maChip(cfg, a.faixa, maNum(a.nota))}</h3><p>${maEsc(cfg.DESTAQUE[a.id] || '')}</p>${terapeuta && a.foco ? `<p class="ma-perfil-foco"><b>Foco nas sessões:</b> ${maEsc(a.foco)}</p>` : ''}</div>`).join('')}</div>
      ${alertas.map(a => `<div class="ma-aviso-suave">${a.so_terapeuta ? '<b>Só para quem atende:</b> ' : ''}${maEsc(a.texto)}</div>`).join('')}${impacto}`;
    out.terap = terapeuta ? `<h2>Para quem atende</h2><h3 class="ma-h3">Foco nas sessões, por área</h3>
      <ul class="ma-cuid">${ordem.map(a => `<li><span><b>${maEsc(a.nome)}</b> · ${maNum(a.nota)}<br><small>${maEsc(a.foco || '')}</small></span>${maChip(cfg, a.faixa)}</li>`).join('')}</ul>
      ${cfg.notaTerap ? `<p class="ma-nota-peq">${maEsc(cfg.notaTerap)}</p>` : ''}` : '';
  } else if(cfg.id === 'profissional'){
    const ints = calc.interesses || [], t3 = calc.top3 && calc.top3.length ? calc.top3 : ints.slice().sort((a, b) => b.nota - a.nota).slice(0, 3);
    const dec = calc.decisao || {}, cont = dec.contagem || {};
    const alertas = (calc.alertas || []).filter(a => terapeuta || !a.so_terapeuta);
    out.mapa = `<h2>Os seus interesses</h2><p style="margin:0 0 8px">Os 3 tipos que mais combinam com você: <b>${t3.map(a => maEsc(a.nome)).join(' · ')}</b></p>
      <div class="ma-perfis">${t3.map((a, i) => `<div class="ma-perfil"><span class="ma-perfil-n">${['O mais alto', 'O segundo', 'O terceiro'][i] || ''} · nota ${maNum(a.nota)}</span><h3>${maEsc(a.nome)}</h3><p><b>Áreas que costumam combinar:</b> ${maEsc(a.areas || '')}</p></div>`).join('')}</div>
      <h3 class="ma-h3">Os 6 tipos de interesse</h3>${maBarras(cfg, ints, null, true, cfg.INTERESSES)}
      <p class="ma-nota-peq">De 0 a 10: quanto maior, mais o tipo combina com você. Inspirado no modelo público de interesses de John Holland.</p>`;
    out.foco = `<h2>O seu jeito de decidir e de trabalhar</h2>
      ${dec.nome ? `<div class="ma-perfil"><span class="ma-perfil-n">Estilo de decisão</span><h3>${maEsc(dec.nome)}</h3><p>${maEsc(cfg.DECISAO[dec.id] || '')}</p>
        ${terapeuta ? `<p class="ma-nota-peq">Contagem: ${['analitico', 'intuitivo', 'relacional', 'cauteloso'].map(k => k + ' ' + (cont[k] || 0)).join(' · ')}</p>` : ''}</div>` : ''}
      ${(calc.estilo || []).length ? `<h3 class="ma-h3">Estilo de trabalho</h3><ul class="ma-recom ma-estilo">${calc.estilo.map(t => '<li>' + maEsc(t) + '</li>').join('')}</ul>` : ''}
      ${(calc.forcas || []).length ? `<h3 class="ma-h3">As suas forças</h3><div class="ma-chips">${calc.forcas.map(t => '<span>' + maEsc(t) + '</span>').join('')}</div>` : ''}
      <h3 class="ma-h3">Energia no trabalho</h3>${maBarras(cfg, calc.areas, antes)}
      <p class="ma-nota-peq">De 0 a 10: quanto maior, mais o sinal de cansaço pesa hoje. Até 3,9 Leve · de 4 a 6,9 Atenção · de 7 a 10 Prioridade.</p>
      ${alertas.map(a => `<div class="ma-aviso-suave">${maEsc(a.texto)}</div>`).join('')}
      ${(calc.passos || []).length ? `<h3 class="ma-h3">Plano de 3 passos</h3><ol class="ma-passos">${calc.passos.map(t => '<li>' + maEsc(t) + '</li>').join('')}</ol>` : ''}`;
    out.terap = '';
  } else {
    const perfis = (calc.perfis || []).map((p, i) => `<div class="ma-perfil"><span class="ma-perfil-n">${i === 0 ? 'Mais forte' : 'Segundo'}</span><h3>${maEsc(p.nome)}</h3>
      <p>${maEsc(cfg.PERFIS[p.id] || '')}</p>${terapeuta && p.foco ? `<p class="ma-perfil-foco"><b>Foco nas sessões:</b> ${maEsc(p.foco)}</p>` : ''}</div>`).join('');
    out.mapa = `<h2>As 9 áreas da sua procrastinação</h2>${ant ? '<p class="ma-nota-peq" style="margin:0 0 8px">Barra cinza: aplicação anterior.</p>' : ''}
      ${maBarras(cfg, calc.areas, antes)}
      <p class="ma-nota-peq">De 0 a 10: quanto maior, mais a área pesa na procrastinação. Até 3,9 Leve · de 4 a 6,9 Atenção · de 7 a 10 Prioridade.</p>`;
    out.foco = `<h2>O seu perfil</h2>${perfis ? '<div class="ma-perfis">' + perfis + '</div>' : '<p>Nenhum perfil se destacou: a procrastinação aparece de forma mais espalhada entre as áreas. A conversa ajuda a encontrar o ponto de partida.</p>'}
      ${(calc.alertas || []).map(a => `<div class="ma-aviso-suave">${maEsc(a.texto)}</div>`).join('')}${impacto}`;
    out.terap = '';
  }
  out.leitura = cfg.id === 'profissional' ? '' : ordem.length ? `<p style="margin:0 0 6px">A área que mais pesa hoje é <b>${maEsc(ordem[0].nome)}</b>${ordem[1] && ordem[1].nota >= 4 ? ', seguida de <b>' + maEsc(ordem[1].nome) + '</b>' : ''}.</p>` : '';
  out.evol = hist && hist.length > 1 ? '<h2>Antes e agora</h2>' + maRetesteHTML(cfg, hist)
    + (terapeuta ? '<details class="ma-evol-det"><summary>Todas as aplicações, em tabela</summary>' + maEvolTabela(cfg, hist) + '</details>' : '') : '';
  return out;
}
function maResumoTexto(cfg, nome, calc, hist, apl, terapeuta){
  const ant = hist && hist.length > 1 ? hist[hist.length - 2] : null, antes = ant ? maNotas(ant.areas) : null;
  const l = [nome + ' · ' + cfg.NOME + (apl ? ' · ' + apl + 'ª aplicação' : '')];
  if(cfg.id === 'vida' && calc.foco_nome) l.push('Área que mais quer resolver agora: ' + calc.foco_nome);
  if(calc.impacto != null) l.push('Impacto hoje: ' + maNum(calc.impacto) + ' de 10' + (ant && ant.impacto != null ? ' · antes: ' + maNum(ant.impacto) : ''));
  if(cfg.id === 'profissional'){
    const t3 = calc.top3 && calc.top3.length ? calc.top3 : [];
    if(t3.length) l.push('Interesses mais altos: ' + t3.map(a => a.nome + ' (' + maNum(a.nota) + ')').join(' · '));
    if(calc.decisao && calc.decisao.nome) l.push('Estilo de decisão: ' + calc.decisao.nome);
    if(calc.forcas && calc.forcas.length) l.push('Forças: ' + calc.forcas.join(', '));
  }
  if((cfg.id === 'autoestima' || cfg.id === 'dinheiro') && calc.top2 && calc.top2.length) l.push('As 2 áreas mais altas: ' + calc.top2.map(a => a.nome + (terapeuta && a.foco ? ' (foco: ' + a.foco + ')' : '')).join(' · '));
  l.push('', cfg.id === 'profissional' ? 'Energia no trabalho (0 a 10, quanto maior, mais pesa):' : 'Áreas (0 a 10, quanto maior, mais pesa):');
  calc.areas.slice().sort((a, b) => b.nota - a.nota).forEach(a => l.push('- ' + a.nome + ': ' + maNum(a.nota) + ' (' + maFx(cfg, a.faixa).rot.toLowerCase() + ')' + (antes && antes[a.id] != null ? ' · antes: ' + maNum(antes[a.id]) : '')));
  if(cfg.id === 'procrastinacao' && calc.perfis && calc.perfis.length) l.push('', 'Perfil: ' + calc.perfis.map(p => p.nome + (terapeuta && p.foco ? ' (foco: ' + p.foco + ')' : '')).join(' · '));
  if(terapeuta && cfg.id === 'vida'){
    const cu = calc.cuidado || {};
    if(calc.recomendados && calc.recomendados.length) l.push('', 'Mapas recomendados: ' + calc.recomendados.join(', '));
    l.push('', 'Cuidado: pensamentos de não querer viver ou se machucar: ' + (cu.pensamentos ? 'SIM' : 'não') + ' · substâncias fora do controle: ' + (cu.substancias ? 'sim' : 'não') + ' · em tratamento: ' + (cu.tratamento ? 'sim' : 'não'));
  }
  const al = (calc.alertas || []).filter(a => terapeuta || !a.so_terapeuta);
  if(terapeuta && al.length) l.push('', 'Alertas: ' + al.map(a => a.texto).join(' '));
  return l.join('\n');
}
function maImprimir(cfg, r){
  const s = maSecoes(cfg, r.calc, r.hist, r.terapeuta);
  const html = `<div class="ma-rel">
    <section class="ma-pag ma-capa-pdf"><div><p style="letter-spacing:.12em;font-weight:700">AUTOCONHECIMENTO</p><h1>${maEsc(cfg.NOME)}</h1>
      <p style="font-size:20px;margin-top:18px"><b>${maEsc(r.nome)}</b></p><p>${maEsc(r.dataTxt || '')}${r.apl ? ' · ' + r.apl + 'ª aplicação' : ''}</p>
      <p style="margin-top:26px">${maEsc((window.T_NOME || '') + (window.T_NOME ? ' · ' : '') + 'Ressignificar')}</p></div></section>
    <section class="ma-pag">${s.cuidado}${s.mapa}</section>
    <section class="ma-pag">${s.foco}${s.terap || ''}${s.evol}<p class="ma-nota-peq">${MA_NAO_DIAG}</p></section></div>`;
  const caixa = document.createElement('div'); caixa.id = 'ma-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('ma-imprimindo');
  const fim = () => { document.body.classList.remove('ma-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('ma-impressao')) fim(); }, 1500); }, 250);
}

/* ---- 3. TELAS DA PESSOA ---- */
const ma = { teste:'vida', cfg:MA_TESTES.vida, codigo:'', mostrar:true, cad:null, itens:[], foco:null, impacto:null, cuidado:{}, indice:0, inicio:0, status:null, passos:[] };
const maChave = (t, c) => CHAVE_CODIGOS + '_ma_' + t + '_' + c + '_prog';
const maChaveCad = (t, c) => CHAVE_CODIGOS + '_ma_' + t + '_' + c + '_cad';
function maErro(msg){ return '<div class="aviso ver">' + maEsc(msg) + '</div>'; }
function maMostrar(html){ document.getElementById('ma-conteudo').innerHTML = html; mostrarTela('#tela-ma'); window.scrollTo({ top:0, behavior:'auto' }); }
function maUsar(teste){ ma.teste = MA_TESTES[teste] ? teste : 'vida'; ma.cfg = MA_TESTES[ma.teste]; ma.passos = maPassos(ma.cfg); }
/* a ordem das perguntas: afirmações, (foco), impacto, (cuidado) */
function maPassos(cfg){
  const p = [], notas = (lista, grupos, escala, parte) => { let k = 0; grupos.forEach(a => a.itens.forEach(t => p.push({ tipo:'item', lista, k:k++, area:a, texto:t, escala, parte }))); };
  if(cfg.INTERESSES){   // Mapa Profissional: interesses, escolhas e energia
    notas('interesses', cfg.INTERESSES, cfg.escalaInt, 'Parte 1 · Interesses');
    cfg.ESCOLHAS.forEach(e => p.push({ tipo:'escolha', e }));
    notas('energia', cfg.AREAS, cfg.escala, 'Parte 6 · Energia no trabalho');
    return p;
  }
  notas('itens', cfg.AREAS, cfg.escala, '');
  if(cfg.id === 'vida') p.push({ tipo:'foco' });
  if(cfg.impacto) p.push({ tipo:'impacto' });
  cfg.CUIDADO.forEach(c => p.push({ tipo:'sn', c }));
  return p;
}
function maMontarTelas(){
  if(document.getElementById('tela-ma-capa')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  const rod = maEsc((window.T_NOME || '') + ' · ' + ((window.__T && __T.dados && __T.dados.titulo) || ''));
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-ma-capa">
  <div class="capa">
    <div class="moldura"><img id="ma-foto" alt=""></div>
    <div class="lado-texto">
      <span class="selo ma-selo" id="ma-capa-selo"></span>
      <h1 id="ma-capa-h1"></h1>
      <p class="assinatura" id="ma-assinatura"></p>
      <p class="texto-capa" id="ma-capa-texto"></p>
      <ul class="lista-leve" id="ma-capa-lista"></ul>
      <div class="cartao">
        <div class="campo" style="margin-bottom:10px">
          <label for="ma-codigo">Digite o código que você recebeu</label>
          <input id="ma-codigo" class="codigo-input" type="text" inputmode="text" autocomplete="off" placeholder="AB-0000" maxlength="9">
          <div class="dica" id="ma-dica">O mesmo código vale para todas as aplicações do seu acompanhamento.</div>
        </div>
        <div class="aviso" id="ma-aviso-codigo"></div>
        <button class="btn btn-primario" id="ma-entrar" disabled>Digite o código</button>
      </div>
    </div>
  </div>
  <div class="rodape"><span class="nome-rodape">${rod}</span><a id="link-zap-ma" href="#" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
</section>
<section class="tela" id="tela-ma"><button class="voltar" id="ma-voltar-capa">← Voltar</button><div id="ma-conteudo"></div></section>
<section class="tela" id="tela-ma-teste">
  <div class="barra-topo"><div class="progresso"><i id="ma-barra"></i></div>
    <div class="linha-progresso"><span id="ma-contador" aria-live="polite"></span><span class="tema" id="ma-tema"></span></div></div>
  <div id="ma-pergunta-box"></div>
  <div class="ma-nav"><button class="btn btn-contorno" id="ma-voltar" type="button">← Anterior</button><button class="btn btn-primario" id="ma-prox" type="button" disabled>Próxima →</button></div>
</section>
<section class="tela" id="tela-ma-resultado"><div id="ma-resultado"></div>
  <div class="rodape"><span class="nome-rodape">${rod}</span>Obrigado pela sua confiança.</div></section>`);
  const cod = document.getElementById('ma-codigo');
  cod.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); avisar('#ma-aviso-codigo', ''); maCampoCodigo(); });
  cod.addEventListener('keydown', e => { if(e.key === 'Enter' && !document.getElementById('ma-entrar').disabled) document.getElementById('ma-entrar').click(); });
  document.getElementById('ma-entrar').addEventListener('click', maClicarEntrar);
  document.getElementById('link-zap-ma').href = maZapTer('');
  document.getElementById('ma-voltar-capa').addEventListener('click', () => mostrarTela('#tela-ma-capa'));
  document.getElementById('ma-voltar').addEventListener('click', () => { if(ma.indice > 0){ ma.indice--; maDesenhar(); } });
  document.getElementById('ma-prox').addEventListener('click', maAvancar);
}
function maCapaTextos(){
  const c = ma.cfg;
  document.getElementById('ma-capa-selo').textContent = c.selo;
  document.getElementById('ma-capa-h1').innerHTML = c.h1;
  document.getElementById('ma-capa-texto').textContent = c.capa;
  document.getElementById('ma-capa-lista').innerHTML = c.lista.map(t => '<li>' + maEsc(t) + '</li>').join('');
  document.getElementById('ma-tema').textContent = c.tema;
}
function maCampoCodigo(){ const v = document.getElementById('ma-codigo').value, b = document.getElementById('ma-entrar'); b.disabled = v.length < 5; b.textContent = b.disabled ? 'Digite o código' : 'Começar'; }
function maAbrirCapa(teste, codigo){
  maMontarTelas(); maUsar(teste); maCapaTextos();
  const f = document.querySelector('#tela-capa .moldura img'), tf = document.getElementById('ma-foto');
  if(f && f.src && tf) tf.src = f.src; else { const ini = document.querySelector('#tela-capa .moldura .t-ini'); if(ini && tf) tf.replaceWith(ini.cloneNode(true)); }
  const ta = document.getElementById('ma-assinatura'), oa = document.getElementById('t-assinatura'); if(ta && oa) ta.innerHTML = oa.innerHTML;
  const cod = document.getElementById('ma-codigo'); if(window.__T && __T.prefixo) cod.placeholder = __T.prefixo + '-0000';
  if(codigo){ cod.value = codigo; document.getElementById('ma-dica').innerHTML = '<span class="ok-pre" aria-hidden="true">✔</span> Código já preenchido. É só tocar em <b>“Começar”</b>.'; }
  maCampoCodigo(); mostrarTela('#tela-ma-capa');
}
async function maClicarEntrar(){
  const b = document.getElementById('ma-entrar'), codigo = document.getElementById('ma-codigo').value.trim().toUpperCase();
  b.disabled = true; b.textContent = 'Verificando o código...';
  const r = await validarCodigo(codigo);
  b.disabled = false; b.textContent = 'Começar';
  if(!r.ok){
    const st = await compRpc('mapa_status', { p_codigo:codigo, p_teste:ma.teste }).catch(() => null);   // código encerrado
    return avisar('#ma-aviso-codigo', st && st.ok && st.encerrado ? 'Este acompanhamento foi encerrado. Fale com ' + maAp() + '.' : r.msg);
  }
  if(maEh(r.teste)) return maEntrar(codigo, r);
  if(r.teste === 'ansiedade' && typeof anEntrar === 'function') return anEntrar(codigo, r);
  if(r.teste === 'disc' && typeof dcEntrar === 'function') return dcEntrar(codigo, r);
  if(r.teste === 'mpcc' && typeof mpEntrar === 'function') return mpEntrar(codigo, r);
  if(r.teste === 'tracos' && typeof tcEntrar === 'function') return tcEntrar(codigo, r);
  location.href = location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&c=' + encodeURIComponent(codigo);
}
async function maEntrar(codigo, r){
  maMontarTelas(); maUsar(r.teste); maCapaTextos();
  ma.codigo = codigo; ma.mostrar = r.mostrar_resultado !== false && r.mostrar !== false;
  maMostrar('<div class="carregando">Abrindo o seu ' + maEsc(ma.cfg.NOME) + '...</div>');
  const st = await compRpc('mapa_status', { p_codigo:codigo, p_teste:ma.teste }).catch(() => null);
  ma.status = st && st.ok ? st : { aplicacoes:0, liberado:true, historico:[] };
  if(st && st.ok && st.mostrar_resultado === false) ma.mostrar = false;
  if(ma.status.encerrado) return maMostrar(`<h1 class="tc-h1">Acompanhamento encerrado</h1>${maErro('Este acompanhamento foi encerrado. Fale com ' + maAp() + ' se quiser continuar.')}`);
  if(!ma.status.liberado) return maTelaEspera();
  const prog = ler(maChave(ma.teste, codigo), null);
  if(prog && prog.cad && Array.isArray(prog.itens)){ ma.cad = prog.cad; return maComecar(prog); }
  maTelaCadastro(r.cliente || '');
}
function maTelaEspera(){
  const st = ma.status, c = ma.cfg;
  const msg = 'Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Estou no acompanhamento do ' + c.NOME + ' (código ' + ma.codigo + ') e queria conversar com você.';
  maMostrar(`<span class="selo ma-selo">${maEsc(c.NOME)}</span>
    <h1 class="tc-h1">A sua próxima aplicação libera em ${maData(st.proxima_em)}</h1>
    <p>Você já respondeu ${st.aplicacoes || 0} ${st.aplicacoes === 1 ? 'vez' : 'vezes'}. O acompanhamento funciona melhor com um intervalo de ${st.intervalo_dias || 30} dias entre uma aplicação e outra: é o tempo de a mudança aparecer.</p>
    <div class="ma-proxima">Volte por este mesmo link no dia ${maData(st.proxima_em)}. Se você autorizou, também recebe um lembrete por e-mail.</div>
    <a class="btn btn-zap ma-zap" href="${maZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar com ${maEsc(maAp())}<small>pelo WhatsApp</small></span></a>`);
}
function maTelaCadastro(nomeSugerido){
  const c = ma.cfg, salvo = ler(maChaveCad(ma.teste, ma.codigo), null) || {}, volta = (ma.status && ma.status.aplicacoes) || 0;
  maMostrar(`
    <span class="selo ma-selo">${maEsc(c.NOME)}</span>
    <h1 class="tc-h1">${volta ? 'Que bom ter você de volta' : 'Antes de começar'}</h1>
    <p>${maEsc(c.abertura)}</p>
    ${volta ? `<p>Esta é a sua <b>${volta + 1}ª aplicação</b>. No final, você vê o que mudou desde a última vez.</p>` : ''}
    <div class="como-responder"><ul>
      <li>Para cada frase, toque numa nota de <b>0 a 10</b>: 0 é “${maEsc(c.escala[0].toLowerCase())}” e 10 é “${maEsc(c.escala[1].toLowerCase())}”.</li>
      <li>Pense em como você está <b>hoje</b> e vá no primeiro impulso.</li>
      <li>Se a página fechar, ao abrir o link de novo neste aparelho você continua de onde parou.</li></ul></div>
    <div class="cartao">
      <div class="campo"><label for="mk-nome">Nome completo</label><input id="mk-nome" type="text" autocomplete="name" value="${maEsc(salvo.nome || nomeSugerido || '')}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="mk-email">E-mail</label><input id="mk-email" type="email" inputmode="email" autocomplete="email" value="${maEsc(salvo.email || '')}" placeholder="voce@email.com"></div>
      <div class="campo"><label for="mk-tel">WhatsApp (com DDD)</label><input id="mk-tel" type="tel" inputmode="tel" autocomplete="tel" value="${maEsc(salvo.whatsapp || '')}" placeholder="(00) 00000-0000"></div>
      <div class="campo"><label for="mk-idade">Idade</label><input id="mk-idade" type="number" inputmode="numeric" min="10" max="110" value="${maEsc(salvo.idade || '')}" placeholder="Ex.: 34"></div>
      <div class="campo campo-check"><label class="check" for="mk-lgpd"><input id="mk-lgpd" type="checkbox">
        <span>Li e concordo com os <a href="/politica-de-privacidade.html" target="_blank" rel="noopener">termos de utilização e privacidade</a>. Concordo que as minhas respostas sejam usadas para gerar o meu resultado e enviadas para ${maEsc(maAp())}, que vai mantê-las em sigilo.</span></label></div>
      <div class="campo campo-check"><label class="check" for="mk-contato"><input id="mk-contato" type="checkbox"${salvo.contato ? ' checked' : ''}>
        <span>Quero receber por e-mail o <b>lembrete da próxima aplicação</b> e o contato sobre o meu resultado <span class="opc">(opcional)</span>.</span></label></div>
      <div class="aviso" id="mk-aviso"></div>
      <button class="btn btn-primario" id="mk-ir">Começar</button>
    </div>`);
  if(typeof mascaraTelefone === 'function') mascaraTelefone(document.getElementById('mk-tel'));
  document.getElementById('mk-ir').addEventListener('click', () => {
    const v = id => document.getElementById(id).value.trim().replace(/\s+/g, ' ');
    const n = v('mk-nome'), em = v('mk-email'), t = document.getElementById('mk-tel').value, idade = v('mk-idade');
    const erro = n.split(' ').length < 2 || n.length < 5 ? 'Escreva o seu nome completo (nome e sobrenome).'
      : !maEmail(em) ? 'Escreva um e-mail válido.' : maDig(t).length < 10 ? 'Escreva o seu WhatsApp com DDD.'
      : !(+idade >= 10 && +idade <= 110) ? 'Escreva a sua idade.'
      : !document.getElementById('mk-lgpd').checked ? 'Para continuar, marque que você leu e concorda com os termos de utilização e privacidade.' : '';
    if(erro) return avisar('#mk-aviso', erro);
    ma.cad = { nome:n, email:em, whatsapp:t, idade, contato:document.getElementById('mk-contato').checked };
    guardar(maChaveCad(ma.teste, ma.codigo), ma.cad);
    maComecar(null);
  });
}
function maComecar(prog){
  ma.listas = {};
  Object.entries(ma.cfg.LISTAS).forEach(([k, N]) => { const v = prog && prog.listas && prog.listas[k]; ma.listas[k] = Array.isArray(v) && v.length === N ? v.slice() : new Array(N).fill(null); });
  ma.escolhas = (prog && prog.escolhas) || {};
  ma.foco = prog && prog.foco || null; ma.impacto = prog && prog.impacto != null ? prog.impacto : null;
  ma.cuidado = (prog && prog.cuidado) || {};
  const vazio = ma.passos.findIndex((p, i) => maValor(i) == null);
  ma.indice = vazio < 0 ? ma.passos.length - 1 : vazio; ma.inicio = Date.now(); maGuardar();
  mostrarTela('#tela-ma-teste'); maDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
const maGuardar = () => guardar(maChave(ma.teste, ma.codigo), { cad:ma.cad, listas:ma.listas, escolhas:ma.escolhas, foco:ma.foco, impacto:ma.impacto, cuidado:ma.cuidado });
function maValor(i){
  const p = ma.passos[i]; if(!p) return null;
  if(p.tipo === 'item') return ma.listas[p.lista][p.k];
  if(p.tipo === 'escolha') return ma.escolhas[p.e.id] || null;
  if(p.tipo === 'foco') return ma.foco;
  if(p.tipo === 'impacto') return ma.impacto;
  return typeof ma.cuidado[p.c.k] === 'boolean' ? ma.cuidado[p.c.k] : null;
}
function maRegua(valor, rotulo, pontas){
  return `<div class="ma-regua" role="radiogroup" aria-label="${maEsc(rotulo)}">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button type="button" role="radio" aria-checked="${valor === n}" class="${valor === n ? 'on' : ''}" data-v="${n}" aria-label="Nota ${n}">${n}</button>`).join('')}</div>
    <div class="ma-pontas"><span>0 · ${maEsc(pontas[0])}</span><span>10 · ${maEsc(pontas[1])}</span></div>`;
}
function maDesenhar(){
  const i = ma.indice, p = ma.passos[i], tot = ma.passos.length, box = document.getElementById('ma-pergunta-box'), c = ma.cfg;
  if(typeof TX_INC === 'function') TX_INC(document.getElementById('ma-contador'), i, tot, 'ma-' + ma.teste); else document.getElementById('ma-contador').textContent = (i + 1) + ' de ' + tot;
  document.getElementById('ma-barra').style.width = (i / tot * 100) + '%';
  document.getElementById('ma-voltar').style.visibility = i === 0 ? 'hidden' : 'visible';
  const prox = document.getElementById('ma-prox'), ultimo = i === tot - 1;
  if(p.tipo === 'item'){
    box.innerHTML = `<span class="ma-parte">${maEsc((p.parte ? p.parte + ' · ' : '') + p.area.nome)}</span>${p.lista === 'interesses' ? '<p class="ma-enunciado" style="margin-top:0">Quanto cada atividade combina com você?</p>' : ''}<h2 class="ma-pergunta">${maEsc(p.texto)}</h2>${maRegua(ma.listas[p.lista][p.k], 'Nota de 0 a 10', p.escala)}`;
  } else if(p.tipo === 'escolha'){
    const v = ma.escolhas[p.e.id];
    box.innerHTML = `<span class="ma-parte">${maEsc(MA_PARTES[p.e.parte] || p.e.parte)}</span><p class="ma-enunciado" style="margin-top:0">Escolha a opção que mais combina com você.</p><h2 class="ma-pergunta">${maEsc(p.e.q)}</h2>
      <div class="ma-opcoes ma-opcoes-1" role="radiogroup">${p.e.ops.map(([l, t]) => `<button type="button" role="radio" aria-checked="${v === l}" class="${v === l ? 'on' : ''}" data-e="${l}"><span class="ma-letra">${l}</span>${maEsc(t)}</button>`).join('')}</div>`;
  } else if(p.tipo === 'foco'){
    box.innerHTML = `<span class="ma-parte">Para fechar</span><h2 class="ma-pergunta">Qual destas áreas você mais quer resolver agora?</h2>
      <div class="ma-opcoes" role="radiogroup">${c.AREAS.map(a => `<button type="button" role="radio" aria-checked="${ma.foco === a.id}" class="${ma.foco === a.id ? 'on' : ''}" data-f="${a.id}">${maEsc(a.nome)}</button>`).join('')}</div>`;
  } else if(p.tipo === 'impacto'){
    box.innerHTML = `<span class="ma-parte">${c.id === 'vida' ? 'Para fechar' : 'Impacto'}</span><h2 class="ma-pergunta">${maEsc(c.impacto)}</h2>${maRegua(ma.impacto, 'Nota de 0 a 10', ['Não atrapalha', 'Atrapalha muito'])}`;
  } else {
    const v = ma.cuidado[p.c.k];
    box.innerHTML = `<span class="ma-parte">Cuidado com você</span><h2 class="ma-pergunta">${maEsc(p.c.q)}</h2>
      <div class="ma-sn" role="radiogroup"><button type="button" role="radio" aria-checked="${v === true}" class="${v === true ? 'on' : ''}" data-s="1">Sim</button><button type="button" role="radio" aria-checked="${v === false}" class="${v === false ? 'on' : ''}" data-s="0">Não</button></div>
      ${v === true && p.c.forte ? `<div class="ma-apoio" role="alert"><b>Você não está só.</b> ${maEsc(MA_CVV.replace(/^Você não está só\.\s*/, ''))}<a class="ma-apoio-tel" href="tel:188">Ligar 188 agora</a></div>` : ''}
      ${v === true && p.c.sim && !p.c.forte ? `<div class="ma-aviso-suave">${maEsc(p.c.sim)}</div>` : ''}
      ${p.c.info ? `<p class="ma-enunciado">${maEsc(p.c.info)}</p>` : ''}`;
  }
  box.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => maResponder(+b.dataset.v)));
  box.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => maResponder(b.dataset.f)));
  box.querySelectorAll('[data-e]').forEach(b => b.addEventListener('click', () => maResponder(b.dataset.e)));
  box.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => maResponder(b.dataset.s === '1')));
  prox.disabled = maValor(i) == null;
  prox.textContent = ultimo ? (ma.mostrar ? 'Ver o meu resultado' : 'Enviar as respostas') : 'Próxima →';
}
function maResponder(v){
  const i = ma.indice, p = ma.passos[i];
  if(p.tipo === 'item') ma.listas[p.lista][p.k] = v; else if(p.tipo === 'escolha') ma.escolhas[p.e.id] = v; else if(p.tipo === 'foco') ma.foco = v; else if(p.tipo === 'impacto') ma.impacto = v; else ma.cuidado[p.c.k] = v;
  maGuardar(); maDesenhar();
  /* "sim" numa pergunta de cuidado: a pessoa lê a orientação com calma e segue quando quiser */
  if(p.tipo === 'sn' && v === true && p.c.sim) return;
  if(i >= ma.passos.length - 1) return;
  const rapido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => { if(ma.indice === i){ ma.indice++; maDesenhar(); window.scrollTo({ top:0, behavior:'auto' }); } }, rapido ? 0 : 320);
}
function maAvancar(){
  if(maValor(ma.indice) == null) return;
  if(ma.indice >= ma.passos.length - 1){ document.getElementById('ma-barra').style.width = '100%'; return maFinalizar(); }
  ma.indice++; maDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
async function maFinalizar(){
  const falta = ma.passos.findIndex((p, i) => maValor(i) == null);
  if(falta > -1){ ma.indice = falta; mostrarTela('#tela-ma-teste'); maDesenhar(); return; }
  const c = ma.cfg, dados = Object.assign({ teste:ma.teste, versao:1, codigo:ma.codigo, data:hoje(), data_iso:new Date().toISOString(), duracaoMin:ma.inicio ? Math.round((Date.now() - ma.inicio) / 60000) : null,
    consentimento:true, consentimento_contato:!!ma.cad.contato }, ma.cad);
  delete dados.contato;
  if(c.INTERESSES){   /* o servidor troca interesses e energia pelo cálculo: as respostas também vão em respostas_* para ficarem guardadas */
    dados.interesses = ma.listas.interesses.map(Number); dados.energia = ma.listas.energia.map(Number); dados.escolhas = Object.assign({}, ma.escolhas);
    dados.respostas_interesses = dados.interesses.slice(); dados.respostas_energia = dados.energia.slice();
  } else { dados.itens = ma.listas.itens.map(Number); dados.impacto = +ma.impacto; }
  if(c.id === 'vida'){ dados.foco = ma.foco; dados.cuidado = { pensamentos:ma.cuidado.pensamentos === true, substancias:ma.cuidado.substancias === true, tratamento:ma.cuidado.tratamento === true }; }
  maMostrar('<div class="carregando">Calculando o seu resultado e enviando as respostas...</div>');
  const r = await compRpc('mapa_salvar_resposta', { p_dados:dados });
  if(!r || r.ok !== true){
    if(r && r.erro === 'cedo'){ try{ localStorage.removeItem(maChave(ma.teste, ma.codigo)); }catch(e){} ma.status = Object.assign(ma.status || {}, { proxima_em:r.proxima_em, liberado:false }); return maTelaEspera(); }
    maMostrar(`<h1 class="tc-h1">Quase lá</h1>${maErro((r && r.msg) || 'Não consegui enviar as suas respostas agora. Elas continuam guardadas neste aparelho.')}
      ${dados.cuidado && dados.cuidado.pensamentos ? `<div class="ma-apoio" role="note"><b>Você não está só.</b> ${maEsc(MA_CVV.replace(/^Você não está só\.\s*/, ''))}</div>` : ''}
      <button class="btn btn-primario" id="mk-de-novo">Tentar enviar de novo</button>`);
    document.getElementById('mk-de-novo').addEventListener('click', maFinalizar); return;
  }
  try{ localStorage.removeItem(maChave(ma.teste, ma.codigo)); }catch(e){}
  const prim = maPrim(ma.cad.nome);
  if(r.mostrar === false) ma.mostrar = false;
  if(!ma.mostrar){
    const msg = 'Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + ma.cad.nome + ' e acabei de responder o ' + c.NOME + ' (código ' + ma.codigo + ', ' + (r.aplicacao || 1) + 'ª aplicação). Fico no aguardo da nossa conversa.';
    const cu = dados.cuidado || {};
    maMostrar(`<span class="selo ma-selo">Respostas enviadas</span><h1 class="tc-h1">Obrigado, ${maEsc(prim)}!</h1>
      ${cu.pensamentos ? `<div class="ma-apoio" role="note"><b>Você não está só.</b> ${maEsc(MA_CVV.replace(/^Você não está só\.\s*/, ''))}<a class="ma-apoio-tel" href="tel:188">Ligar 188 agora</a></div>` : ''}
      ${cu.substancias ? `<div class="ma-aviso-suave">${maEsc(MA_SUBST)}</div>` : ''}
      <p>As suas respostas foram enviadas para ${maEsc(maAp())}, que vai analisar o seu momento e conversar com você.</p>
      ${r.proxima_em ? `<div class="ma-proxima">A sua próxima aplicação libera em ${maData(r.proxima_em)}, por este mesmo link.</div>` : ''}
      <a class="btn btn-zap ma-zap" href="${maZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar agora no WhatsApp<small>abre a conversa com a mensagem pronta</small></span></a>
      <p class="ma-nota-peq">${MA_NAO_DIAG}</p>`);
    return;
  }
  const calc = r.calc || {}, hist = (r.historico && r.historico.length) ? r.historico : [{ aplicacao:r.aplicacao || 1, em:new Date().toISOString(), geral:calc.geral, impacto:calc.impacto, areas:calc.areas || calc.energia }];
  maResultadoPessoa({ nome:ma.cad.nome, whatsapp:ma.cad.whatsapp, email:ma.cad.email, calc:maCalcDe(c, calc), hist, apl:r.aplicacao || hist.length, proxima:r.proxima_em, dataTxt:new Date().toLocaleDateString('pt-BR'), codigo:ma.codigo });
}
function maResultadoPessoa(r){
  const c = ma.cfg, s = maSecoes(c, r.calc, r.hist, false), prim = maPrim(r.nome), resumo = maResumoTexto(c, r.nome, r.calc, r.hist, r.apl, false);
  const msg = ['Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + r.nome + ' e acabei de responder o ' + c.NOME + ' (código ' + r.codigo + ').', '', resumo, '', 'Quero conversar sobre o meu resultado.'].join('\n');
  const zapProprio = typeof dvZapNum === 'function' ? dvZapNum(r.whatsapp) : maDig(r.whatsapp);
  const link = maLink(ma.teste, r.codigo);
  document.getElementById('ma-resultado').innerHTML = `<div class="ma-cliente">
    <span class="selo ma-selo">${maEsc(c.NOME)} · ${r.apl}ª aplicação</span>
    <h1 class="tc-h1">${maEsc(prim)}, este é o seu momento</h1>
    ${s.cuidado ? `<div class="ma-secao">${s.cuidado}</div>` : ''}
    <div class="ma-secao">${s.mapa}${s.leitura}</div>
    <div class="ma-secao">${s.foco}</div>
    ${s.evol ? `<div class="ma-secao">${s.evol}</div>` : ''}
    <div class="ma-secao"><h2>Próximo passo</h2><p>Na conversa, ${maEsc(maAp())} olha com você o que está por trás deste resultado e qual o melhor caminho para começar.</p>
      <a class="btn btn-zap ma-zap" href="${maZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Quero conversar sobre o meu resultado<small>conversa pelo WhatsApp com a mensagem pronta</small></span></a>
      ${r.proxima ? `<div class="ma-proxima" style="margin-top:12px">A sua próxima aplicação libera em <b>${maData(r.proxima)}</b>, por este mesmo link. É assim que você enxerga o que mudou.</div>` : ''}</div>
    <div class="ma-secao"><h2>Guardar o seu resultado</h2><div class="ma-acoes">
      <button type="button" class="btn btn-argila" data-ma-pdf><span class="duas">Baixar em PDF<small>o seu mapa e o que você quer resolver</small></span></button>
      ${zapProprio ? `<a class="btn btn-contorno" href="https://wa.me/${zapProprio}?text=${encodeURIComponent(resumo + (r.proxima ? '\n\nPróxima aplicação: ' + maData(r.proxima) : '') + '\n' + link)}" target="_blank" rel="noopener"><span class="duas">Enviar para o meu WhatsApp<small>o resumo e o link da próxima aplicação</small></span></a>` : ''}
      ${maEmail(r.email) ? `<a class="btn btn-contorno" href="mailto:${maEsc(r.email)}?subject=${encodeURIComponent(c.NOME + ' · ' + r.nome)}&body=${encodeURIComponent(resumo + '\n\n' + link)}"><span class="duas">Enviar para o meu e-mail<small>${maEsc(r.email)}</small></span></a>` : ''}
    </div></div>
    <p class="ma-nota ma-nota-diag">${MA_NAO_DIAG} Quem lê e interpreta o seu resultado é ${maEsc(maAp())}.</p></div>`;
  mostrarTela('#tela-ma-resultado'); window.scrollTo({ top:0, behavior:'auto' });
  document.querySelectorAll('#ma-resultado [data-ma-pdf]').forEach(b => b.addEventListener('click', () => maImprimir(c, Object.assign({ terapeuta:false }, r))));
}

/* ---- 4. ÁREA DA TERAPEUTA ---- */
const maAdm = { teste:'vida' };
let maCache = [], maCodigos = [];
const maAdmCfg = () => MA_TESTES[maAdm.teste];
function maAdminMontar(){
  if(document.getElementById('painel-ma')) return;
  const base = document.getElementById('painel-an') || document.getElementById('painel-dc') || document.getElementById('painel-mp') || document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-ma">
      <h3 class="ma-adm-tit" id="ma-adm-tit"></h3>
      <div id="ma-abas"><button type="button" class="ativa" data-ma-aba="respostas">Acompanhamentos</button><button type="button" data-ma-aba="codigos">Códigos de acesso</button></div>
      <div id="ma-aba-respostas">
        <div class="campo"><input id="ma-busca" type="search" placeholder="Buscar por nome"></div>
        <button type="button" class="mini-btn" id="ma-exportar" style="margin-bottom:12px">Exportar resultados (planilha)</button>
        <div id="ma-lista-respostas"><div class="vazio">Nenhuma aplicação por enquanto.</div></div>
      </div>
      <div id="ma-aba-codigos" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="ma-cod-nome">Nome da pessoa <span class="opc">(opcional)</span></label><input id="ma-cod-nome" type="text" placeholder="Ex.: Maria Souza"></div>
          <div class="campo"><label for="ma-cod-whats">WhatsApp de quem vai receber o link <span class="opc">(opcional)</span></label><input id="ma-cod-whats" type="tel" inputmode="tel" placeholder="(00) 00000-0000"></div>
          <div class="campo"><label for="ma-cod-int">De quanto em quanto tempo a pessoa refaz?</label>
            <select id="ma-cod-int"><option value="15">A cada 15 dias</option><option value="30" selected>A cada 30 dias (recomendado)</option><option value="60">A cada 60 dias</option><option value="90">A cada 90 dias</option></select></div>
          <div class="campo"><label id="rot-ma-mostrar">A pessoa vê o resultado no final?</label>
            <div class="alternar" id="ma-alt-mostrar" role="radiogroup" aria-labelledby="rot-ma-mostrar">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, vê<small>o mapa e o que mudou</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não, só eu vejo<small>recebe só um agradecimento</small></button>
            </div></div>
          <button class="btn btn-argila" id="ma-gerar">Gerar código</button>
        </div>
        <div id="ma-caixa-codigo"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Códigos criados</h3>
        <div id="ma-lista-codigos"><div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div></div>
      </div>
      <div id="ma-detalhe" style="display:none"><button class="voltar" id="ma-voltar-lista">← Voltar para a lista</button><div id="ma-detalhe-conteudo"></div></div>
    </div>`);
  if(typeof mascaraTelefone === 'function') mascaraTelefone(document.getElementById('ma-cod-whats'));
  document.querySelectorAll('#ma-abas button').forEach(b => b.addEventListener('click', () => maAdminAba(b.dataset.maAba)));
  let mostrarSel = true;
  document.querySelectorAll('#ma-alt-mostrar button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#ma-alt-mostrar button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
    mostrarSel = b.dataset.v === '1'; }));
  document.getElementById('ma-busca').addEventListener('input', maDesenharLista);
  document.getElementById('ma-exportar').addEventListener('click', maExportar);
  document.getElementById('ma-voltar-lista').addEventListener('click', () => { const a = document.querySelector('#ma-abas button.ativa'); maAdminAba(a ? a.dataset.maAba : 'respostas'); });
  document.getElementById('ma-gerar').addEventListener('click', () => maGerar(mostrarSel));
  if(typeof plMontar === 'function') plMontar();   // aba Planos (devolutiva-plano.js)
}
function maAdminTeste(teste){
  maAdm.teste = MA_TESTES[teste] ? teste : 'vida'; maCache = []; maCodigos = [];
  document.getElementById('ma-adm-tit').textContent = maAdmCfg().NOME;
  document.getElementById('ma-gerar').textContent = 'Gerar código do ' + maAdmCfg().NOME;
  document.getElementById('ma-caixa-codigo').innerHTML = '';
}
function maAdminAba(q){
  document.querySelectorAll('#ma-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.maAba === q));
  ['codigos', 'respostas', 'planos'].forEach(k => { const e = document.getElementById('ma-aba-' + k); if(e) e.style.display = q === k ? '' : 'none'; });
  document.getElementById('ma-detalhe').style.display = 'none';
  const ed = document.getElementById('pl-editor'); if(ed) ed.style.display = 'none';
  if(q === 'planos' && typeof plCarregar === 'function') plCarregar();
}
function maConvite(cfg, primeiro, codigo, mostrar, dias){
  const sobre = cfg.id === 'vida' ? 'Separei para você o Mapa da Vida: um check-up rápido que mostra como está cada área da sua vida hoje.'
    : 'Separei para você o Mapa da Procrastinação: ele mostra o que está por trás do adiamento e por onde começar.';
  return [(primeiro ? 'Olá, ' + primeiro + '!' : 'Olá!') + ' Aqui é ' + maAp() + '.', '', sobre, '',
    'É só tocar no link abaixo. O código já vai preenchido:', maLink(cfg.id, codigo), '',
    'Se o link não abrir direto, o código é: *' + codigo + '*', '',
    'Leva cerca de ' + cfg.minutos + ' minutos. Não existe resposta certa ou errada.',
    'A cada ' + dias + ' dias você responde de novo, pelo mesmo link, e a gente acompanha o que mudou.',
    mostrar ? 'No final, você vê o seu resultado.' : 'Quando terminar, eu analiso as suas respostas e a gente conversa.'].join('\n');
}
async function maGerar(mostrar){
  const cfg = maAdmCfg(), b = document.getElementById('ma-gerar'), nomeCli = document.getElementById('ma-cod-nome').value.trim(), zapCli = document.getElementById('ma-cod-whats').value.trim(), caixa = document.getElementById('ma-caixa-codigo');
  const dias = +document.getElementById('ma-cod-int').value || 30;
  const c = clienteMembros(), { data:sess } = await c.auth.getSession();
  if(!sess || !sess.session){ caixa.innerHTML = maErro('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  const rot = b.textContent; b.disabled = true; b.textContent = 'Gerando...';
  let codigo = novoCodigo(), erro = null;
  for(let t = 0; t < 6; t++){
    const { error } = await c.from('travas_codigos').insert({ terapeuta_id:sess.session.user.id, codigo, cliente:nomeCli || null, whatsapp:zapCli || null, mostrar_resultado:mostrar, urgencia:false, teste:cfg.id, tipo:'individual', intervalo_dias:dias });
    erro = error; if(!error) break;
    if(error.code === '23505'){ codigo = novoCodigo(); continue; } break;
  }
  b.disabled = false; b.textContent = rot;
  if(erro){ caixa.innerHTML = maErro('Não consegui gerar o código agora. Saia da área, entre de novo e tente outra vez.'); return; }
  const primeiro = maPrim(nomeCli), destino = zapNumero(zapCli);
  caixa.innerHTML = `<div class="codigo-gerado"><div class="valor">${codigo}</div>
      <div class="para">${nomeCli ? 'Para ' + maEsc(nomeCli) + ' · ' : ''}${maEsc(cfg.NOME)} · a cada ${dias} dias · ${mostrar ? 'a pessoa vê o resultado' : 'só você vê o resultado'}</div></div>
    <a class="btn btn-zap" href="https://wa.me/${destino}?text=${encodeURIComponent(maConvite(cfg, primeiro, codigo, mostrar, dias))}" target="_blank" rel="noopener"><span class="duas">${primeiro ? 'Enviar o link para ' + maEsc(primeiro) : 'Enviar o link pelo WhatsApp'}<small>${destino ? 'abre a conversa com a mensagem pronta' : 'você escolhe o contato na hora'}</small></span></a>
    <button class="btn btn-contorno" id="ma-copiar-link">Copiar o link com o código</button>`;
  document.getElementById('ma-copiar-link').addEventListener('click', async e => { try{ await navigator.clipboard.writeText(maLink(cfg.id, codigo)); e.target.textContent = 'Link copiado!'; }catch(err){ e.target.textContent = 'Não consegui copiar'; } setTimeout(() => { e.target.textContent = 'Copiar o link com o código'; }, 2000); });
  maCarregarCodigos();
}
async function maCarregarCodigos(){
  const cfg = maAdmCfg(), caixa = document.getElementById('ma-lista-codigos'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('travas_codigos').select('id,codigo,cliente,whatsapp,criado_em,usado,usado_por,usado_em,mostrar_resultado,intervalo_dias,proxima_em').eq('terapeuta_id', sess.session.user.id).eq('teste', cfg.id).order('criado_em', { ascending:false }).limit(300);
  if(cfg.id !== maAdm.teste) return;
  if(error){ caixa.innerHTML = maErro('Não consegui carregar os códigos agora.'); return; }
  maCodigos = data || [];
  if(!maCodigos.length){ caixa.innerHTML = '<div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div>'; return; }
  caixa.innerHTML = maCodigos.map(x => `<div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${x.codigo}${x.cliente || x.usado_por ? ' · ' + maEsc(x.usado_por || x.cliente) : ''}<span class="tag-vis">a cada ${x.intervalo_dias || 30} dias</span><span class="tag-vis">${x.mostrar_resultado === false ? 'só você vê' : 'pessoa vê'}</span></span>
      <span class="sub">${x.usado ? 'acompanhamento encerrado' : x.usado_em ? 'última aplicação em ' + maQuando(x.usado_em) + ' · próxima em ' + maData(x.proxima_em) : 'criado em ' + maQuando(x.criado_em) + ' · ainda não respondeu'}</span></span>
      <span class="etiqueta ${x.usado ? 'usado' : 'livre'}">${x.usado ? 'encerrado' : 'ativo'}</span>
      <span style="display:flex;gap:8px;width:100%;margin-top:8px">${x.usado ? '' : `<button type="button" class="mini-btn" data-ma-link="${x.codigo}">Copiar link</button>`}</span></div>`).join('');
  caixa.querySelectorAll('[data-ma-link]').forEach(b => b.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(maLink(cfg.id, b.dataset.maLink)); b.textContent = 'Copiado!'; }catch(err){ b.textContent = 'Não consegui'; } setTimeout(() => { b.textContent = 'Copiar link'; }, 1800); }));
}
async function maCarregarRespostas(){
  const cfg = maAdmCfg(), caixa = document.getElementById('ma-lista-respostas'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const [rr, rc] = await Promise.all([
    c.from(cfg.tabela).select('id,codigo,aplicacao,nome,dados,criado_em,interesse,urgencia').eq('terapeuta_id', sess.session.user.id).order('criado_em', { ascending:true }).limit(2000),
    c.from('travas_codigos').select('codigo,cliente,whatsapp,usado,usado_em,proxima_em,intervalo_dias,mostrar_resultado').eq('terapeuta_id', sess.session.user.id).eq('teste', cfg.id).limit(500)]);
  if(cfg.id !== maAdm.teste) return;
  if(rr.error){ caixa.innerHTML = maErro('Não consegui carregar as aplicações agora.'); return; }
  maCache = rr.data || []; maCodigos = rc.data || maCodigos; maDesenharLista();
}
/* um acompanhamento = um código, com todas as aplicações em ordem */
function maGrupos(){
  const g = {};
  maCache.forEach(x => { (g[x.codigo] = g[x.codigo] || []).push(x); });
  return Object.keys(g).map(cod => ({ codigo:cod, apls:g[cod], ult:g[cod][g[cod].length - 1], info:maCodigos.find(c => c.codigo === cod) || {} }))
    .sort((a, b) => new Date(b.ult.criado_em) - new Date(a.ult.criado_em));
}
function maDesenharLista(){
  const cfg = maAdmCfg(), termo = (document.getElementById('ma-busca').value || '').trim().toLowerCase(), caixa = document.getElementById('ma-lista-respostas');
  const lista = maGrupos().filter(gp => !termo || (gp.ult.nome || '').toLowerCase().includes(termo));
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">Nenhuma aplicação por enquanto.</div>'; return; }
  const agora = Date.now();
  caixa.innerHTML = lista.map(gp => { const c = maCalcDe(cfg, gp.ult.dados), n = gp.apls.length, fx = maFaixaDe(cfg, c.geral);
    const ant = n > 1 ? maCalcDe(cfg, gp.apls[n - 2].dados) : null, dif = ant && ant.impacto != null && c.impacto != null ? Math.round((c.impacto - ant.impacto) * 10) / 10 : null;
    const prox = gp.info.proxima_em, vencida = prox && new Date(prox).getTime() <= agora && !gp.info.usado;
    const alerta = cfg.id === 'vida' && c.cuidado && c.cuidado.pensamentos ? '<span class="tags-int"><span class="tag-int ma-tag-prio">Prioridade: entrar em contato</span></span>' : '';
    const extra = cfg.id === 'vida' ? (c.foco_nome ? ' · foco: ' + maEsc(c.foco_nome) : '') : cfg.id === 'procrastinacao' ? (c.perfis && c.perfis[0] ? ' · perfil: ' + maEsc(c.perfis[0].nome) : '')
      : cfg.id === 'profissional' ? (c.top3 && c.top3.length ? ' · ' + c.top3.map(a => maEsc(a.nome)).join(' · ') : '') : (c.top2 && c.top2[0] ? ' · mais alta: ' + maEsc(c.top2[0].nome) : '');
    return `<button type="button" class="linha-item" data-ma-cod="${maEsc(gp.codigo)}"><span class="esq"><span class="nome">${maEsc(gp.ult.nome)}</span>
      <span class="sub">${n} ${n === 1 ? 'aplicação' : 'aplicações'} · última em ${maData(gp.ult.criado_em)} · ${cfg.id === 'profissional' ? 'energia ' + maNum(c.geral) : 'impacto ' + maNum(c.impacto)}${dif != null ? ' (' + (dif > 0 ? '+' : '') + maNum(dif) + ')' : ''}${extra}${gp.info.usado ? ' · encerrado' : prox ? (vencida ? ' · <b style="color:#B03A2E">nova aplicação liberada desde ' + maData(prox) + '</b>' : ' · próxima em ' + maData(prox)) : ''}</span>${alerta}</span>
      <span class="etiqueta livre" style="background:${maFx(cfg, fx).cor};color:#fff">${maNum(c.geral)}</span></button>`; }).join('');
  caixa.querySelectorAll('[data-ma-cod]').forEach(b => b.addEventListener('click', () => maAbrirDetalhe(b.dataset.maCod)));
}
function maExportar(){
  const cfg = maAdmCfg(); if(!maCache.length) return;
  const cab = ['Identificador', 'Data', 'Nome', 'E-mail', 'WhatsApp', 'Idade', 'Código', 'Aplicação', 'Média geral', 'Impacto'].concat(cfg.id === 'vida' ? ['Área que quer resolver', 'Pensamentos (cuidado)', 'Substâncias', 'Em tratamento'] : cfg.id === 'procrastinacao' ? ['Perfis'] : cfg.id === 'profissional' ? ['Interesses mais altos', 'Estilo de decisão'].concat(cfg.INTERESSES.map(a => 'Interesse: ' + a.nome)) : ['As 2 áreas mais altas']).concat(cfg.AREAS.map(a => a.nome));
  const linhas = maCache.map(x => { const d = x.dados || {}, c = maCalcDe(cfg, d), n = maNotas(c.areas), cu = c.cuidado || {};
    return [x.id, maQuando(x.criado_em), x.nome, d.email, d.whatsapp, d.idade, x.codigo, x.aplicacao, c.geral, c.impacto]
      .concat(cfg.id === 'vida' ? [c.foco_nome, cu.pensamentos ? 'sim' : 'não', cu.substancias ? 'sim' : 'não', cu.tratamento ? 'sim' : 'não'] : cfg.id === 'procrastinacao' ? [(c.perfis || []).map(p => p.nome).join(' · ')]
        : cfg.id === 'profissional' ? [(c.top3 || []).map(a => a.nome).join(' · '), (c.decisao || {}).nome].concat(cfg.INTERESSES.map(a => maNotas(c.interesses)[a.id])) : [(c.top2 || []).map(a => a.nome).join(' · ')])
      .concat(cfg.AREAS.map(a => n[a.id])); });
  const csv = [cab].concat(linhas).map(l => l.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = cfg.id + '-resultados-' + (window.T_SLUG || 'pagina') + '.csv'; a.click(); URL.revokeObjectURL(url);
}
async function maCiclo(codigo, acao, dias){
  try{ const { data, error } = await clienteMembros().rpc('mapa_ciclo', { p_codigo:codigo, p_teste:maAdm.teste, p_acao:acao, p_dias:dias || null }); if(error || !data || !data.ok) throw error || new Error('falhou'); return true; }
  catch(e){ alert('Não consegui fazer isso agora. Saia da área, entre de novo e tente outra vez.'); return false; }
}
function maAbrirDetalhe(codigo, idApl){
  const cfg = maAdmCfg(), gp = maGrupos().find(g => g.codigo === codigo); if(!gp) return;
  const x = idApl ? gp.apls.find(a => a.id === idApl) || gp.ult : gp.ult, pos = gp.apls.indexOf(x);
  const d = x.dados || {}, calc = maCalcDe(cfg, d), zap = zapNumero(d.whatsapp), prim = maPrim(x.nome), info = gp.info || {};
  const hist = gp.apls.slice(0, pos + 1).map(a => { const c = maCalcDe(cfg, a.dados); return { aplicacao:a.aplicacao, em:a.criado_em, geral:c.geral, impacto:c.impacto, areas:c.areas }; });
  const r = { nome:x.nome, calc, hist, apl:x.aplicacao, dataTxt:maData(x.criado_em), codigo, terapeuta:true }, resumo = maResumoTexto(cfg, x.nome, calc, hist, x.aplicacao, true), s = maSecoes(cfg, calc, hist, true);
  const prox = info.proxima_em, liberada = prox && new Date(prox).getTime() <= Date.now();
  document.getElementById('ma-aba-codigos').style.display = 'none'; document.getElementById('ma-aba-respostas').style.display = 'none';
  document.getElementById('ma-detalhe').style.display = 'block';
  const msgZap = ['Olá, ' + prim + '! Aqui é ' + maAp() + '.', '', 'Vi o seu ' + cfg.NOME + ' (' + x.aplicacao + 'ª aplicação).', '', 'Vamos conversar sobre o seu resultado e o próximo passo?'].join('\n');
  const msgLembra = ['Olá, ' + prim + '! Aqui é ' + maAp() + '.', '', 'Chegou a hora da sua nova aplicação do ' + cfg.NOME + '. Leva cerca de ' + cfg.minutos + ' minutos e mostra o que mudou:', maLink(cfg.id, codigo)].join('\n');
  const cu = calc.cuidado || {};
  const prioridade = cfg.id === 'vida' && cu.pensamentos ? '<div class="ma-prioridade" role="alert">PRIORIDADE: respondeu SIM para pensamentos de não querer mais viver ou de se machucar. Entre em contato hoje.</div>' : '';
  const ints = [15, 30, 60, 90]; if(info.intervalo_dias && ints.indexOf(info.intervalo_dias) < 0) ints.push(info.intervalo_dias);
  const lst = { itens:d.itens, interesses:d.respostas_interesses, energia:d.respostas_energia };
  const linhaR = (rot, q, v) => `<tr><td><small>${maEsc(rot)}</small> ${maEsc(q)}</td><td>${v == null ? '' : maEsc(v)}</td></tr>`;
  const respostas = maPassos(cfg).map(p => {
    if(p.tipo === 'item'){ const arr = lst[p.lista], v = Array.isArray(arr) && typeof arr[p.k] !== 'object' ? arr[p.k] : ''; return linhaR(p.area.curto, p.texto, v); }
    if(p.tipo === 'escolha'){ const l = (d.escolhas || {})[p.e.id], op = p.e.ops.find(o => o[0] === l); return linhaR(p.e.parte, p.e.q, l ? l + ') ' + (op ? op[1] : '') : ''); }
    if(p.tipo === 'impacto') return linhaR('Impacto', cfg.impacto, d.impacto);
    if(p.tipo === 'foco') return linhaR('Foco', 'Qual destas áreas você mais quer resolver agora?', calc.foco_nome || d.foco || '');
    return linhaR('Cuidado', p.c.q, cu[p.c.k] ? 'Sim' : 'Não');
  }).join('');
  document.getElementById('ma-detalhe-conteudo').innerHTML = `${prioridade}<h2 style="font-size:24px;margin:6px 0 4px">${maEsc(x.nome)}</h2>
    <p class="secao-sub">${maEsc(cfg.NOME)} · ${maEsc(codigo)} · ${x.aplicacao}ª aplicação em ${maQuando(x.criado_em)}${d.duracaoMin != null ? ' · ' + d.duracaoMin + ' min' : ''}<br>${maEsc(d.email || '')}${d.whatsapp ? ' · ' + maEsc(d.whatsapp) : ''}${d.idade ? ' · ' + maEsc(d.idade) + ' anos' : ''}${d.consentimento_contato ? ' · autorizou o contato e o lembrete' : ''}</p>
    ${gp.apls.length > 1 ? `<div class="ma-apls">${gp.apls.map(a => `<button type="button" class="${a.id === x.id ? 'ativa' : ''}" data-ma-apl="${a.id}">${a.aplicacao}ª · ${maDataCurta(a.criado_em)}</button>`).join('')}</div>` : ''}
    <div class="ma-secao"><h2>Acompanhamento</h2>
      <p style="margin:0">${info.usado ? '<b>Encerrado.</b> A pessoa não consegue mais responder com este código.' : prox ? (liberada ? '<b>Nova aplicação liberada</b> desde ' + maData(prox) + '.' : 'Próxima aplicação em <b>' + maData(prox) + '</b>.') : 'Ainda sem data.'}</p>
      <div class="ma-intervalo"><label for="ma-int-det">Intervalo:</label><select id="ma-int-det">${ints.map(v => `<option value="${v}"${(info.intervalo_dias || 30) === v ? ' selected' : ''}>a cada ${v} dias</option>`).join('')}</select>
        ${info.usado ? '<button type="button" class="mini-btn" data-ma-ciclo="reabrir">Reabrir o acompanhamento</button>' : `${liberada ? '' : '<button type="button" class="mini-btn" data-ma-ciclo="liberar">Liberar nova aplicação agora</button>'}<button type="button" class="mini-btn" data-ma-ciclo="encerrar">Encerrar o acompanhamento</button>`}</div>
      ${zap && !info.usado && liberada ? `<a class="btn btn-contorno" href="https://wa.me/${zap}?text=${encodeURIComponent(msgLembra)}" target="_blank" rel="noopener"><span class="duas">Lembrar ${maEsc(prim)} da nova aplicação<small>mensagem pronta com o link</small></span></a>` : ''}</div>
    <div class="ma-acoes">
      ${zap ? `<a class="btn btn-zap" href="https://wa.me/${zap}?text=${encodeURIComponent(msgZap)}" target="_blank" rel="noopener"><span class="duas">Falar com ${maEsc(prim)} no WhatsApp<small>mensagem pronta para a conversa</small></span></a>` : ''}
      <button type="button" class="btn btn-contorno" data-ma-pdf><span class="duas">Salvar em PDF ou imprimir<small>o mapa, o foco e as recomendações</small></span></button>
      <button type="button" class="btn btn-contorno" data-ma-copiar>Copiar a ficha completa</button>
      ${cfg.id === 'vida' && typeof plNovo === 'function' ? '<button type="button" class="btn btn-argila" data-ma-plano><span class="duas">Criar Plano de Ressignificação<small>já preenchido com este Mapa da Vida</small></span></button>' : ''}
    </div>
    <p style="text-align:right;margin:0 0 8px"><button type="button" class="mini-btn" data-ma-excluir>Excluir esta aplicação (${x.aplicacao}ª)</button></p>
    <div class="ma-rel-tela">${s.terap ? `<div class="ma-secao ma-terap">${s.terap}</div>` : ''}${s.cuidado ? `<div class="ma-secao">${s.cuidado}</div>` : ''}<div class="ma-secao">${s.mapa}${s.leitura}</div><div class="ma-secao">${s.foco}</div>${s.evol ? `<div class="ma-secao">${s.evol}</div>` : ''}</div>
    <p class="ma-nota-peq">${MA_NAO_DIAG}</p>
    <details class="ma-resp tc-respostas"><summary>As respostas desta aplicação</summary><table><thead><tr><th>Pergunta</th><th>Resposta</th></tr></thead><tbody>${respostas}</tbody></table>
      ${cfg.id === 'procrastinacao' ? '<p class="ma-nota-peq">Respostas como a pessoa marcou. No cálculo, as perguntas 27, 28, 29, 31, 32, 33, 34 e 35 são invertidas (10 menos a resposta).</p>' : ''}</details>`;
  window.scrollTo({ top:0, behavior:'auto' });
  const raiz = document.getElementById('ma-detalhe-conteudo');
  raiz.querySelectorAll('[data-ma-apl]').forEach(b => b.addEventListener('click', () => maAbrirDetalhe(codigo, b.dataset.maApl)));
  raiz.querySelector('[data-ma-pdf]').addEventListener('click', () => maImprimir(cfg, r));
  raiz.querySelector('[data-ma-copiar]').addEventListener('click', async e => { const b = e.currentTarget; try{ await navigator.clipboard.writeText(resumo); b.textContent = 'Ficha copiada!'; }catch(err){ b.textContent = 'Não consegui copiar'; } setTimeout(() => { b.textContent = 'Copiar a ficha completa'; }, 2200); });
  const bp = raiz.querySelector('[data-ma-plano]'); if(bp) bp.addEventListener('click', () => plNovo({ cliente:x.nome, whatsapp:d.whatsapp || '', codigos:{ vida:codigo } }));
  const recarregar = async () => { await maCarregarRespostas(); maAbrirDetalhe(codigo, x.id); };
  raiz.querySelector('[data-ma-excluir]').addEventListener('click', async e => {
    if(!confirm('Excluir a ' + x.aplicacao + 'ª aplicação de ' + x.nome + '?\n\nEla some do acompanhamento e não dá para recuperar depois.')) return;
    const b = e.currentTarget; b.disabled = true; b.textContent = 'Excluindo...';
    try{ const c = clienteMembros(), { data:sess } = await c.auth.getSession(); const { data, error } = await c.from(cfg.tabela).delete().eq('terapeuta_id', sess.session.user.id).eq('id', x.id).select('id');
      if(error || !data || !data.length) throw error || new Error('nada'); await maCarregarRespostas();
      if(maGrupos().some(g => g.codigo === codigo)) maAbrirDetalhe(codigo); else maAdminAba('respostas');
    }catch(err){ b.disabled = false; b.textContent = 'Excluir esta aplicação'; alert('Não consegui excluir agora. Tente de novo em instantes.'); }
  });
  raiz.querySelectorAll('[data-ma-ciclo]').forEach(b => b.addEventListener('click', async () => {
    const acao = b.dataset.maCiclo;
    if(acao === 'encerrar' && !confirm('Encerrar o acompanhamento de ' + x.nome + '? A pessoa não vai mais conseguir responder com este código (você pode reabrir depois).')) return;
    b.disabled = true; if(await maCiclo(codigo, acao)) recarregar(); else b.disabled = false;
  }));
  document.getElementById('ma-int-det').addEventListener('change', async e => { if(await maCiclo(codigo, 'intervalo', +e.target.value)) recarregar(); });
}

/* ---- 5. SELETOR DE TESTES DA ÁREA, CAPA DE VENDAS E LIGAÇÃO COM O MODELO ---- */
const MA_SEL = { vida:['Mapa da Vida', 'check-up das 12 áreas'], procrastinacao:['Procrastinação', 'Mapa · 9 áreas'], profissional:['Mapa Profissional', 'interesses e energia'], autoestima:['Autoestima', 'Mapa · 6 áreas'], dinheiro:['Dinheiro', 'Mapa · 6 áreas'] };
function maSeletor(ativos){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  const campo = alt.closest('.campo');
  Object.keys(MA_SEL).forEach(k => {
    if(alt.querySelector('[data-v=' + k + ']')) return;
    alt.insertAdjacentHTML('beforeend', `<button type="button" data-v="${k}" role="radio" aria-checked="false">${MA_SEL[k][0]}<small>${MA_SEL[k][1]}</small></button>`);
    const b = alt.querySelector('[data-v=' + k + ']');
    b.addEventListener('click', () => {
      alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      const adm = document.getElementById('painel-admin'); adm.classList.remove('modo-tc', 'modo-mp', 'modo-dc', 'modo-an'); adm.classList.add('modo-ma');
      maAdminTeste(k); maAdminAba('respostas'); maCarregarRespostas(); maCarregarCodigos();
    });
  });
  if(!alt.__ma){ alt.__ma = true;
    alt.addEventListener('click', e => { const b = e.target.closest('button'); if(b && !MA_SEL[b.dataset.v]) document.getElementById('painel-admin').classList.remove('modo-ma'); }, true); }
  Object.keys(MA_SEL).forEach(k => { const b = alt.querySelector('[data-v=' + k + ']'); if(b) b.style.display = ativos.indexOf(k) > -1 ? '' : 'none'; });
  ['travas', 'tracos'].forEach(k => { const b = alt.querySelector('[data-v=' + k + ']'); if(b && ativos.indexOf(k) < 0) b.style.display = 'none'; });
  if(campo) campo.style.display = ativos.length > 1 ? '' : 'none';
  /* sem o Teste de Travas (e sem o módulo do MPCC para fazer isso): a área já abre no primeiro teste que ela tem */
  if(ativos.indexOf('travas') < 0 && typeof mpAjustarTestes !== 'function' && !maSeletor.ligado){
    maSeletor.ligado = true;
    const abrir = () => { const b = alt.querySelector('[data-v=' + ativos[0] + ']'); if(b && !b.classList.contains('ativa')) b.click(); };
    const adm = document.getElementById('painel-admin');
    if(adm && 'MutationObserver' in window) new MutationObserver(() => { if(adm.classList.contains('ver')) abrir(); }).observe(adm, { attributes:true, attributeFilter:['class'] });
  }
}
/* textos dos Mapas na capa de vendas (devolutiva-carater.js: dvCapaVendas lê window.CV_EXTRA) */
window.CV_EXTRA = Object.assign(window.CV_EXTRA || {}, {
  vida:{
    rot:'Mapa da Vida', curto:'Mapa da Vida', tag:'Individual · Check-up', titulo:'Mapa da Vida',
    objetivo:'Mostrar, em poucos minutos, como está cada uma das 12 áreas da sua vida hoje (das emoções ao dinheiro, da família ao sentido de vida) e por onde vale começar.',
    como:['Cerca de 5 minutos, no celular', '24 afirmações, com notas de 0 a 10', 'Você escolhe a área que mais quer resolver agora'],
    resultado:q => 'A sua roda da vida com as 12 áreas, a área que você quer resolver e o quanto ela pesa hoje. Depois, a conversa com ' + q + '.',
    mapaTitulo:'As 12 áreas que o mapa olha',
    itens:MA_TESTES.vida.AREAS.map(a => ({ nome:a.nome, desc:'' })),
    pergunta:'Como está cada área da sua vida hoje?',
    texto:'Um check-up rápido das 12 áreas da vida, numa roda que mostra o que está tranquilo, o que pede atenção e o que é prioridade.',
    meta:'12 áreas · cerca de 5 minutos',
    zap:'quero fazer o Mapa da Vida. Como recebo o meu código?',
    descobre:'<b>como está cada área da sua vida hoje</b>',
    recebe:q => 'No Mapa da Vida, a sua roda com as 12 áreas e a área que você mais quer resolver',
    tempo:'o Mapa da Vida, cerca de 5 minutos',
    faq:q => ['O Mapa da Vida é um diagnóstico?', 'Não. É um mapa de autoconhecimento: mostra como você percebe cada área da sua vida hoje. Quem lê o resultado com você é ' + q + '.']
  },
  procrastinacao:{
    rot:'Mapa da Procrastinação', curto:'Procrastinação', tag:'Individual · 9 áreas', titulo:'Mapa da Procrastinação',
    objetivo:'Mostrar o que está por trás do adiamento: sintomas, pensamentos, gatilhos emocionais, ambiente, rotina, decisões e distrações, para você saber por onde começar.',
    como:['Cerca de 8 minutos, no celular', 'Perguntas com notas de 0 a 10', 'No final, as 9 áreas em barras e o seu perfil'],
    resultado:q => 'As 9 áreas da sua procrastinação em barras, o seu perfil predominante e o quanto ela atrapalha hoje. Depois, a conversa com ' + q + '.',
    mapaTitulo:'As 9 áreas que o mapa olha',
    itens:MA_TESTES.procrastinacao.AREAS.map(a => ({ nome:a.nome, desc:'' })),
    pergunta:'O que está por trás da sua procrastinação?',
    texto:'Um mapa em 9 áreas do que faz você adiar, com o seu perfil predominante e por onde começar.',
    meta:'9 áreas · cerca de 8 minutos',
    zap:'quero fazer o Mapa da Procrastinação. Como recebo o meu código?',
    descobre:'<b>o que está por trás da sua procrastinação</b>',
    recebe:q => 'No Mapa da Procrastinação, as 9 áreas em barras e o seu perfil predominante',
    tempo:'o Mapa da Procrastinação, cerca de 8 minutos',
    faq:q => ['O Mapa da Procrastinação é um diagnóstico?', 'Não. É um mapa de autoconhecimento: mostra onde a procrastinação mais pesa para você hoje. Quem lê o resultado com você é ' + q + '.']
  },
  profissional:{
    rot:'Mapa Profissional', curto:'Profissional', tag:'Individual · Interesses e energia', titulo:'Mapa Profissional',
    objetivo:'Ajudar você a identificar os seus interesses profissionais, o seu jeito de decidir e de trabalhar, os seus talentos e como está a sua energia no trabalho.',
    como:['Cerca de 10 minutos, no celular', 'Notas de 0 a 10 e perguntas de escolher uma opção', 'Inspirado em teorias públicas sobre interesses profissionais'],
    resultado:q => 'Os 3 tipos de interesse que mais combinam com você, o seu estilo de decisão e de trabalho, as suas forças, a sua energia e um plano de 3 passos. Depois, a conversa com ' + q + '.',
    mapaTitulo:'Os 6 tipos de interesse que o mapa olha',
    itens:MA_TESTES.profissional.INTERESSES.map(a => ({ nome:a.nome, desc:'' })),
    pergunta:'O que combina com você no trabalho?',
    texto:'Os seus interesses, o seu jeito de decidir e de trabalhar, as suas forças e a sua energia no trabalho.',
    meta:'6 tipos de interesse · cerca de 10 minutos',
    zap:'quero fazer o Mapa Profissional. Como recebo o meu código?',
    descobre:'<b>o que combina com você no trabalho</b>',
    recebe:q => 'No Mapa Profissional, os seus interesses, estilos, forças e a sua energia no trabalho',
    tempo:'o Mapa Profissional, cerca de 10 minutos',
    faq:q => ['O Mapa Profissional é um teste psicológico?', 'Não. É uma ferramenta de autoconhecimento, inspirada em teorias públicas sobre interesses profissionais. Quem lê o resultado com você é ' + q + '.']
  },
  autoestima:{
    rot:'Mapa da Autoestima', curto:'Autoestima', tag:'Individual · 6 áreas', titulo:'Mapa da Autoestima',
    objetivo:'Mostrar como está a sua relação com você mesmo(a): o seu valor, a autocrítica, a comparação, a necessidade de aprovação, o medo de se expor e o merecimento.',
    como:['Cerca de 6 minutos, no celular', '30 afirmações, com notas de 0 a 10', 'No final, as 6 áreas em barras e por onde começar'],
    resultado:q => 'As 6 áreas da sua autoestima em barras, as 2 que mais pesam hoje e o quanto isso atrapalha a sua vida. Depois, a conversa com ' + q + '.',
    mapaTitulo:'As 6 áreas que o mapa olha',
    itens:MA_TESTES.autoestima.AREAS.map(a => ({ nome:a.nome, desc:'' })),
    pergunta:'Como está a sua relação com você?',
    texto:'Um mapa em 6 áreas da sua autoestima, com as 2 que mais pesam hoje e por onde começar.',
    meta:'6 áreas · cerca de 6 minutos',
    zap:'quero fazer o Mapa da Autoestima. Como recebo o meu código?',
    descobre:'<b>como está a sua relação com você mesmo(a)</b>',
    recebe:q => 'No Mapa da Autoestima, as 6 áreas em barras e as 2 que mais pesam hoje',
    tempo:'o Mapa da Autoestima, cerca de 6 minutos',
    faq:q => ['O Mapa da Autoestima é um diagnóstico?', 'Não. É um mapa de autoconhecimento. Quem lê o resultado com você é ' + q + '.']
  },
  dinheiro:{
    rot:'Mapa do Dinheiro', curto:'Dinheiro', tag:'Individual · 6 áreas', titulo:'Mapa do Dinheiro',
    objetivo:'Mostrar como está a sua relação emocional com o dinheiro: crenças, cobrar e receber, emoções, organização, impulsos e a história da sua família. Não é consultoria financeira.',
    como:['Cerca de 6 minutos, no celular', '30 afirmações, com notas de 0 a 10', 'No final, as 6 áreas em barras e o primeiro passo'],
    resultado:q => 'As 6 áreas da sua relação com o dinheiro em barras, as 2 que mais pesam hoje e o primeiro passo de cada uma. Depois, a conversa com ' + q + '.',
    mapaTitulo:'As 6 áreas que o mapa olha',
    itens:MA_TESTES.dinheiro.AREAS.map(a => ({ nome:a.nome, desc:'' })),
    pergunta:'Como está a sua relação com o dinheiro?',
    texto:'Um mapa em 6 áreas da sua relação com o dinheiro, com as 2 que mais pesam hoje e o primeiro passo.',
    meta:'6 áreas · cerca de 6 minutos',
    zap:'quero fazer o Mapa do Dinheiro. Como recebo o meu código?',
    descobre:'<b>como está a sua relação com o dinheiro</b>',
    recebe:q => 'No Mapa do Dinheiro, as 6 áreas em barras e o primeiro passo das 2 que mais pesam',
    tempo:'o Mapa do Dinheiro, cerca de 6 minutos',
    faq:q => ['O Mapa do Dinheiro é consultoria financeira?', 'Não. É um mapa de autoconhecimento sobre a sua relação emocional com o dinheiro. Quem lê o resultado com você é ' + q + '.']
  }
});
function maInit(){
  if(maInit.feito) return; maInit.feito = true;
  maMontarTelas(); maAdminMontar();
  try{ const q = new URLSearchParams(location.search), lim = v => (v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9);
    const t = MA_IDS.find(k => lim(q.get(MA_TESTES[k].param)));   // ?vi= ?pc= ?pf= ?ae= ?mf=
    if(t) maAbrirCapa(t, lim(q.get(MA_TESTES[t].param))); }catch(e){}
}
/* chamado pelo modelo quando a terapeuta tem um dos Mapas: ativos = lista dos testes dela */
function maAjustarTestes(ativos){
  maInit(); maSeletor(ativos);
  const ROT = { travas:'Teste de Travas Mentais', tracos:'Teste de Traços de Caráter', mpcc:'MPCC', disc:'DISC', ansiedade:'Teste de Ansiedade', vida:'Mapa da Vida', procrastinacao:'Mapa da Procrastinação', profissional:'Mapa Profissional', autoestima:'Mapa da Autoestima', dinheiro:'Mapa do Dinheiro' };
  document.title = ativos.map(k => ROT[k] || k).join(' · ') + (window.T_NOME ? ' · ' + T_NOME : '');
}
window.maEntrar = maEntrar; window.maEh = maEh; window.maAjustarTestes = maAjustarTestes; window.maAbrirCapa = maAbrirCapa;
