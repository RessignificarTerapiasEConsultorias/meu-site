/* Área de Membros: cartão "Seu DISC" (análise comportamental liberada pelo Mauricio para esta pessoa)
   e, para quem é dono(a) de uma empresa com DISC liberado na equipe, o atalho "DISC da equipe". */
(async function () {
  try {
    const { data: { session } } = await supa().auth.getSession();
    if (!session) return;
    const main = document.querySelector("main.conteudo-painel"); if (!main) return;
    const escuro = !!document.querySelector(".cartao-escuro");
    const dataBR = iso => iso ? new Date(iso).toLocaleDateString("pt-BR") : "";
    const cartao = (titulo, info, botoes) => {
      const c = document.createElement("div");
      if (escuro) {
        c.className = "cartao cartao-escuro";
        c.innerHTML = '<h2 class="ce-olho">Análise comportamental</h2><p class="ce-titulo"></p><div class="ce-rodape"><span class="ce-info"></span></div>';
        c.querySelector(".ce-titulo").textContent = titulo; c.querySelector(".ce-info").textContent = info;
        botoes.forEach(b => { const a = document.createElement("a"); a.className = "ce-btn" + (b.sec ? " ce-btn-sec" : ""); a.href = b.href; a.textContent = b.txt; c.querySelector(".ce-rodape").appendChild(a); });
      } else {
        c.className = "cartao";
        c.innerHTML = "<h2></h2><p class=\"ajuda\"></p><div class=\"acoes\" style=\"display:flex;flex-wrap:wrap;gap:8px\"></div>";
        c.querySelector("h2").textContent = titulo; c.querySelector("p").textContent = info;
        botoes.forEach(b => { const a = document.createElement("a"); a.className = "btn auto" + (b.sec ? " contorno" : ""); a.href = b.href; a.textContent = b.txt; c.querySelector(".acoes").appendChild(a); });
      }
      return c;
    };
    const ancora = document.getElementById("cartaoOfertas") || document.getElementById("cartaoPag") || main.querySelector(".cartao, .meta-card");
    const por = el => { if (ancora && ancora.parentNode) ancora.parentNode.insertBefore(el, ancora.id === "cartaoOfertas" || ancora.id === "cartaoPag" ? ancora.nextSibling : ancora); else main.appendChild(el); };

    /* 1) o DISC liberado para mim */
    const { data: meus } = await supa().rpc("disc_meus_testes");
    const lista = Array.isArray(meus) ? meus : [];
    const livre = lista.find(x => !x.usado), feito = lista.find(x => x.usado);
    if (livre && livre.slug) {
      por(cartao("Seu DISC: análise comportamental",
        "Liberado para você. São 24 blocos com 4 palavras, de 8 a 12 minutos: em cada um, marque a que MAIS e a que MENOS descreve você no trabalho. Não é terapia nem avaliação psicológica.",
        [{ txt: "Fazer o meu DISC →", href: "/teste/?t=" + encodeURIComponent(livre.slug) + "&dc=" + encodeURIComponent(livre.codigo) }]));
    } else if (feito) {
      por(cartao("Seu DISC: análise comportamental", "Você respondeu em " + dataBR(feito.usado_em) + ". O resultado é conversado na devolutiva com o Mauricio.", []));
    }

    /* 2) dono(a) de empresa com DISC na equipe: atalho para os resultados */
    const { data: emp } = await supa().from("empresa_membros").select("empresa_id,funcao,empresas(nome,tipo)").eq("perfil_id", session.user.id).eq("funcao", "dono");
    for (const m of (emp || [])) {
      if (!m.empresas || m.empresas.tipo !== "empresa") continue;
      const { data: eq } = await supa().rpc("disc_equipe", { p_empresa: m.empresa_id });
      const pessoas = (eq && eq.pessoas) || [];
      if (!pessoas.some(p => p.codigo || p.resultado)) continue;
      const feitos = pessoas.filter(p => p.resultado).length;
      por(cartao("DISC da equipe · " + m.empresas.nome, feitos + " de " + pessoas.filter(p => p.codigo || p.resultado).length + " pessoas já responderam. Veja o perfil comportamental de cada uma, com gráficos e laudo.",
        [{ txt: "Ver o DISC da equipe →", href: "disc-equipe.html?e=" + encodeURIComponent(m.empresa_id) }]));
    }
  } catch (e) { /* sem cartão, sem problema */ }
})();
