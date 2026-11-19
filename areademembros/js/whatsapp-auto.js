/* Automações (Fase 7): funções puras do editor e do painel, para testar sem a página. */
(function (raiz) {
  "use strict";
  var ETAPAS = { novo: "Novo", em_conversa: "Em conversa", interessado: "Interessado", proposta: "Proposta", cliente: "Cliente", perdido: "Perdido" };
  var PRIORIDADES = { baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente" };
  var PRODUTOS = { travas: "Teste de Travas Mentais", tracos: "Teste de Traços de Caráter" };
  /* quando a automação começa: o que cada gatilho pede */
  var GATILHOS = {
    botao_template: { rotulo: "A pessoa toca no botão de um template", campos: [
      { k: "botao_texto", rotulo: "Texto do botão (exatamente como no template)", tipo: "texto" },
      { k: "palavras", rotulo: "Ou escreve uma destas frases (uma por linha)", tipo: "linhas" }] },
    palavra: { rotulo: "A pessoa escreve uma palavra ou frase", campos: [
      { k: "palavras", rotulo: "Frases (uma por linha)", tipo: "linhas" },
      { k: "modo", rotulo: "Como comparar", tipo: "modo" }] },
    etiqueta: { rotulo: "A pessoa entra numa lista ou ganha uma etiqueta", campos: [{ k: "etiqueta", rotulo: "Etiqueta ou lista (ex.: lista:Turma 2)", tipo: "etiqueta" }] },
    etapa: { rotulo: "A pessoa muda de etapa no funil", campos: [{ k: "para", rotulo: "Passou para a etapa", tipo: "etapa" }, { k: "de", rotulo: "Vinda da etapa (opcional)", tipo: "etapa_opc" }] },
    novo_contato: { rotulo: "Aparece um contato novo", campos: [{ k: "origem", rotulo: "Origem (opcional)", tipo: "origem" }] },
    pedido_criado: { rotulo: "Um pedido é criado na loja", campos: [{ k: "produto", rotulo: "Produto (opcional)", tipo: "produto" }] },
    pedido_pago: { rotulo: "Um pedido é pago", campos: [{ k: "produto", rotulo: "Produto (opcional)", tipo: "produto" }] },
    pedido_abandonado: { rotulo: "Pediu e não pagou (30 min depois)", campos: [{ k: "produto", rotulo: "Produto (opcional)", tipo: "produto" }] },
    sem_resposta: { rotulo: "Você mandou e a pessoa não respondeu há N dias", campos: [{ k: "dias", rotulo: "Dias sem resposta", tipo: "num", padrao: 3 }] },
    data_hora: { rotulo: "Numa data e hora, para quem tem uma lista ou etiqueta", campos: [{ k: "quando", rotulo: "Data e hora", tipo: "datahora" }, { k: "etiqueta", rotulo: "Lista ou etiqueta de quem entra", tipo: "etiqueta" }] },
    sem_resposta_sua: { rotulo: "A pessoa escreveu e você não respondeu há N horas", campos: [{ k: "horas", rotulo: "Horas sem resposta sua", tipo: "num", padrao: 4, max: 720 }] },
    dias_na_lista: { rotulo: "N dias depois de entrar numa lista ou etiqueta", campos: [{ k: "etiqueta", rotulo: "Lista ou etiqueta", tipo: "etiqueta" }, { k: "dias", rotulo: "Quantos dias depois de entrar", tipo: "num", padrao: 3 }] },
    inscricao: { rotulo: "A pessoa confirma a inscrição pela página", campos: [{ k: "pagina", rotulo: "Página de inscrição (opcional)", tipo: "pagina" }] },
    coluna: { rotulo: "O cartão chega numa coluna do funil (qualquer quadro)", campos: [{ k: "coluna", rotulo: "Quadro e coluna", tipo: "coluna" }] }
  };
  /* o que cada passo faz */
  var PASSOS = {
    enviar_texto: { rotulo: "Enviar mensagem", icone: "✉", padrao: { texto: "", incluir_link: false, fora_janela: "parar", tipo_envio: "seguimento" } },
    perguntar_botoes: { rotulo: "Perguntar com botões", icone: "?", padrao: { texto: "", botoes: ["Sim", "Não"], ramos: [{ texto: "", etiqueta: "", encerrar: true }, { texto: "", etiqueta: "", encerrar: false }] } },
    esperar: { rotulo: "Esperar", icone: "⏱", padrao: { dias: 1, horas: 0, minutos: 0 } },
    etiquetar: { rotulo: "Etiqueta", icone: "🏷", padrao: { etiqueta: "", remover: false } },
    mover_funil: { rotulo: "Mover no funil", icone: "↦", padrao: { etapa: "interessado" } },
    prioridade: { rotulo: "Mudar prioridade", icone: "!", padrao: { valor: "alta" } },
    pontuacao: { rotulo: "Ajustar pontuação", icone: "★", padrao: { ajuste: 5 } },
    avisar: { rotulo: "Avisar você", icone: "🔔", padrao: { motivo: "" } },
    pausar_robo: { rotulo: "Pausar o robô", icone: "⏸", padrao: { horas: 24 } },
    parar: { rotulo: "Parar a automação", icone: "■", padrao: { escopo: "esta", motivo: "" } },
    chamar_automacao: { rotulo: "Chamar outra automação", icone: "⇢", padrao: { automacao: "" } },
    enviar_email: { rotulo: "Enviar e-mail", icone: "@", padrao: { modelo_id: "", assunto: "", corpo: "", tipo: "marketing" } },
    sms: { rotulo: "SMS (em breve)", icone: "✆", padrao: {}, emBreve: true }
  };
  function n(v) { var x = Number(v); return isFinite(x) ? x : 0; }
  function plural(q, um, varios) { return q + " " + (q === 1 ? um : varios); }
  function recorte(t, max) { t = String(t || "").replace(/\s+/g, " ").trim(); return t.length > max ? t.slice(0, max - 1) + "…" : t; }
  function esperaTexto(c) {
    c = c || {};
    var base;
    if (c.ate_hora !== undefined && c.ate_hora !== null && c.ate_hora !== "") base = "Esperar até as " + n(c.ate_hora) + "h";
    else {
      var p = [];
      if (n(c.dias)) p.push(plural(n(c.dias), "dia", "dias"));
      if (n(c.horas)) p.push(plural(n(c.horas), "hora", "horas"));
      if (n(c.minutos)) p.push(plural(n(c.minutos), "minuto", "minutos"));
      base = "Esperar " + (p.join(" e ") || "0 minuto");
    }
    if (c.dias_uteis) base += " (só dias úteis)";
    if (c.ate_resposta) base += "; se a pessoa responder, " + (c.se_responder === "parar" ? "a sequência para" : "segue na hora");
    return base;
  }
  function passoTexto(p) {
    var c = (p && p.config) || {}, t = p && p.tipo;
    if (t === "esperar") return esperaTexto(c);
    if (t === "enviar_texto") return (c.template_nome ? "Enviar o template " + c.template_nome : "Enviar mensagem") + (c.texto ? ": “" + recorte(c.texto, 70) + "”" : "") + (c.fora_janela === "esperar_resposta" ? " (fora das 24 h, espera a pessoa escrever)" : "");
    if (t === "perguntar_botoes") return "Perguntar “" + recorte(c.texto, 50) + "” com os botões " + (c.botoes || []).join(" / ");
    if (t === "etiquetar") return (c.remover ? "Tirar a etiqueta " : "Colocar a etiqueta ") + (c.etiqueta || "(escolha)");
    if (t === "mover_funil") return "Mover no funil para " + (c.coluna ? (c.coluna_nome || "a coluna escolhida") : (ETAPAS[c.etapa] || c.etapa || "(escolha)"));
    if (t === "enviar_email") return "Enviar e-mail" + (c.modelo_id ? ": modelo " + (c.modelo_nome || "escolhido") : c.assunto ? ": “" + recorte(c.assunto, 60) + "”" : "") + " (só para quem tem e-mail na ficha)";
    if (t === "prioridade") return "Mudar a prioridade para " + (PRIORIDADES[c.valor] || c.valor || "(escolha)");
    if (t === "pontuacao") return "Ajustar a pontuação (" + (n(c.ajuste) > 0 ? "+" : "") + n(c.ajuste) + ")";
    if (t === "avisar") return "Avisar você" + (c.motivo ? ": " + recorte(c.motivo, 60) : "") + " (a conversa aparece em Não respondidas)";
    if (t === "pausar_robo") return "Pausar o robô com a pessoa por " + plural(n(c.horas) || 24, "hora", "horas");
    if (t === "parar") return "Parar " + (c.escopo === "todas" ? "todas as automações desta pessoa" : "esta automação para a pessoa");
    if (t === "chamar_automacao") return "Chamar outra automação";
    if (t === "sms") return "SMS (ainda não disponível: o passo é pulado)";
    return String(t || "");
  }
  function resumoAutomacao(passos) {
    return (passos || []).map(function (p) {
      var t = p.tipo, c = p.config || {};
      if (t === "esperar") return esperaTexto(c).replace(/;.*$/, "");
      if (t === "enviar_texto") return c.template_nome ? "Template " + c.template_nome : "Mensagem";
      if (t === "perguntar_botoes") return "Pergunta";
      if (t === "enviar_email") return "E-mail";
      return (PASSOS[t] && PASSOS[t].rotulo) || t;
    }).join(" → ");
  }
  function gatilhoTexto(tipo, g) {
    g = g || {};
    var q = function (x) { return "“" + x + "”"; };
    if (tipo === "botao_template") return "Toca no botão " + q(g.botao_texto || "?");
    if (tipo === "palavra") return "Escreve " + ((g.palavras || [])[0] ? q(g.palavras[0]) + ((g.palavras || []).length > 1 ? " e mais " + (g.palavras.length - 1) : "") : "uma palavra") + (g.modo === "contem" ? " (contendo)" : "");
    if (tipo === "etiqueta") return "Ganha a etiqueta " + q(String(g.etiqueta || "?").replace(/^lista:/, "lista "));
    if (tipo === "etapa") return "Muda para a etapa " + (ETAPAS[g.para] || g.para || "?");
    if (tipo === "novo_contato") return "Contato novo" + (g.origem ? " (origem " + g.origem + ")" : "");
    if (tipo === "pedido_criado") return "Pedido criado" + (g.produto ? " (" + (PRODUTOS[g.produto] || g.produto) + ")" : "");
    if (tipo === "pedido_pago") return "Pedido pago" + (g.produto ? " (" + (PRODUTOS[g.produto] || g.produto) + ")" : "");
    if (tipo === "pedido_abandonado") return "Pediu e não pagou" + (g.produto ? " (" + (PRODUTOS[g.produto] || g.produto) + ")" : "");
    if (tipo === "sem_resposta") return "Sem resposta há " + plural(n(g.dias) || 3, "dia", "dias");
    if (tipo === "data_hora") return "Em uma data marcada, para quem tem " + q(g.etiqueta || "?");
    if (tipo === "sem_resposta_sua") return "Escreveu e você não respondeu há " + plural(n(g.horas) || 4, "hora", "horas");
    if (tipo === "dias_na_lista") return plural(n(g.dias) || 1, "dia", "dias") + " depois de entrar em " + q(String(g.etiqueta || "?").replace(/^lista:/, "lista "));
    if (tipo === "inscricao") return "Confirmou a inscrição" + (g.pagina_nome ? " em " + q(g.pagina_nome) : " (qualquer página)");
    if (tipo === "coluna") return "Chegou na coluna " + (g.coluna_nome ? q(g.coluna_nome) : "escolhida");
    return String(tipo || "");
  }
  /* devolve o aviso do que falta, ou "" se o passo está pronto */
  function validarPasso(p) {
    var c = (p && p.config) || {}, t = p && p.tipo;
    if (t === "enviar_texto" && !String(c.texto || "").trim() && !c.template_nome) return "Escreva o texto da mensagem ou escolha um template.";
    if (t === "perguntar_botoes") {
      if (!String(c.texto || "").trim()) return "Escreva a pergunta.";
      var bs = (c.botoes || []).map(function (b) { return String(b || "").trim(); });
      while (bs.length && !bs[bs.length - 1]) bs.pop();
      if (bs.length < 2 || bs.some(function (b) { return !b; })) return "Escreva o texto de pelo menos dois botões (sem deixar um vazio no meio).";
      if (bs.some(function (b) { return b.length > 20; })) return "Cada botão aceita até 20 letras.";
      if (new Set(bs.map(function (b) { return b.toLowerCase(); })).size !== bs.length) return "Os botões precisam ter textos diferentes.";
    }
    if (t === "esperar") {
      var vazio = !n(c.dias) && !n(c.horas) && !n(c.minutos) && (c.ate_hora === undefined || c.ate_hora === null || c.ate_hora === "");
      if (vazio) return "Diga quanto tempo esperar.";
      if (c.ate_hora !== undefined && c.ate_hora !== null && c.ate_hora !== "" && (n(c.ate_hora) < 0 || n(c.ate_hora) > 23)) return "A hora vai de 0 a 23.";
    }
    if (t === "etiquetar" && !String(c.etiqueta || "").trim()) return "Escolha a etiqueta.";
    if (t === "mover_funil" && !ETAPAS[c.etapa] && !c.coluna) return "Escolha para onde mover.";
    if (t === "enviar_email") {
      if (!c.modelo_id && (!String(c.assunto || "").trim() || !String(c.corpo || "").trim())) return "Escolha um modelo de e-mail, ou escreva o assunto e o texto.";
      if (!c.modelo_id && String(c.assunto || "").length > 150) return "O assunto aceita até 150 letras.";
    }
    if (t === "prioridade" && !PRIORIDADES[c.valor]) return "Escolha a prioridade.";
    if (t === "pausar_robo" && (n(c.horas) < 1 || n(c.horas) > 720)) return "O robô pode ficar pausado de 1 a 720 horas.";
    if (t === "chamar_automacao" && !c.automacao) return "Escolha qual automação chamar.";
    return "";
  }
  function validarGatilho(tipo, g) {
    g = g || {};
    if (!GATILHOS[tipo]) return "Escolha quando a automação começa.";
    if (tipo === "botao_template" && !String(g.botao_texto || "").trim() && !(g.palavras || []).length) return "Informe o texto do botão ou uma frase.";
    if (tipo === "palavra" && !(g.palavras || []).length) return "Escreva ao menos uma frase.";
    if (tipo === "etiqueta" && !String(g.etiqueta || "").trim()) return "Escolha a etiqueta ou lista.";
    if (tipo === "etapa" && !ETAPAS[g.para]) return "Escolha a etapa.";
    if (tipo === "sem_resposta" && n(g.dias) < 1) return "Informe quantos dias.";
    if (tipo === "data_hora" && (!g.quando || !String(g.etiqueta || "").trim())) return "Informe a data e hora e a lista de quem entra.";
    if (tipo === "sem_resposta_sua" && (n(g.horas) < 1 || n(g.horas) > 720)) return "Informe de 1 a 720 horas.";
    if (tipo === "dias_na_lista" && (!String(g.etiqueta || "").trim() || n(g.dias) < 1)) return "Escolha a lista e quantos dias depois de entrar.";
    if (tipo === "coluna" && !g.coluna) return "Escolha o quadro e a coluna.";
    return "";
  }
  /* frase curta para o histórico da pessoa e para a lista de motivos */
  function resultadoTexto(r, motivo) {
    var m = {
      entrou: "Entrou na automação", enviado: "Recebeu uma mensagem", esperando: "Está esperando", concluida: "Terminou a automação", saiu: "Saiu", parada: "Parou", adiado: "Envio adiado", falhou: "Falhou",
      respondeu: "Respondeu", recusada: "Não entrou", descartado: "Passo descartado (atrasado)", acao: "Ação feita", ignorado: "Passo ignorado", retomada: "Voltou a andar", reenviou: "Recebeu a abertura de novo",
      etiquetou: "Ganhou etiqueta", email: "Recebeu um e-mail", "tirou etiqueta": "Perdeu etiqueta", chamou: "Chamou outra automação"
    };
    return (m[r] || r || "") + (motivo ? " (" + motivo + ")" : "");
  }
  var DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  /* frase do horário próprio da automação: "seg a sex, das 9h às 18h" */
  function horarioTexto(k) {
    k = k || {};
    var temH = k.hora_inicio !== undefined && k.hora_inicio !== null && k.hora_inicio !== "" && k.hora_fim !== undefined && k.hora_fim !== null && k.hora_fim !== "";
    var ds = Array.isArray(k.dias_semana) ? k.dias_semana.map(Number).filter(function (x) { return x >= 0 && x <= 6; }).sort() : [];
    if (!temH && (!ds.length || ds.length === 7)) return "";
    var dt = !ds.length || ds.length === 7 ? "todos os dias" : ds.join() === "1,2,3,4,5" ? "seg a sex" : ds.map(function (x) { return DIAS[x]; }).join(", ");
    return dt + (temH ? ", das " + n(k.hora_inicio) + "h às " + n(k.hora_fim) + "h" : "");
  }
  function validarHorario(k) {
    k = k || {};
    var temI = k.hora_inicio !== undefined && k.hora_inicio !== null && k.hora_inicio !== "", temF = k.hora_fim !== undefined && k.hora_fim !== null && k.hora_fim !== "";
    if (temI !== temF) return "Informe a hora de começo e a de fim (ou deixe as duas vazias).";
    if (temI && (n(k.hora_inicio) < 0 || n(k.hora_inicio) > 23 || n(k.hora_fim) < 1 || n(k.hora_fim) > 24 || n(k.hora_fim) <= n(k.hora_inicio))) return "O horário vai de 0h a 24h, e o fim precisa ser depois do começo.";
    if (Array.isArray(k.dias_semana) && !k.dias_semana.length) return "Marque pelo menos um dia da semana.";
    return "";
  }
  function taxa(parte, todo) { return n(todo) > 0 ? Math.round(n(parte) / n(todo) * 1000) / 10 : null; }
  raiz.WaAuto = { ETAPAS: ETAPAS, PRIORIDADES: PRIORIDADES, PRODUTOS: PRODUTOS, GATILHOS: GATILHOS, PASSOS: PASSOS, esperaTexto: esperaTexto, passoTexto: passoTexto, resumoAutomacao: resumoAutomacao,
    gatilhoTexto: gatilhoTexto, horarioTexto: horarioTexto, validarHorario: validarHorario, validarPasso: validarPasso, validarGatilho: validarGatilho, resultadoTexto: resultadoTexto, taxa: taxa };
})(typeof window !== "undefined" ? window : globalThis);
