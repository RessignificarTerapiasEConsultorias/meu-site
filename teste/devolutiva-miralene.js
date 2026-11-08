/* ============================================================================
   TESTES DA MIRALENE SOUTO NA PÁGINA DO DOMÍNIO
   Diagnóstico Mente Serena · Questionário de Esquemas e Necessidades Emocionais (Young) · Escala de TDAH em adultos (ETDAH-AD)

   ARQUIVO GERADO por ferramentas/montar_testes_miralene.py a partir do site antigo da Miralene
   (repositório teste-de-travas-miralene): as perguntas, as instruções, as telas, as contas e os resultados
   vêm de lá, sem ser reescritos. NÃO edite este arquivo à mão: mude o script e gere de novo.

   Tudo roda dentro de uma função fechada e as telas ficam em "Shadow DOM": nada daqui conflita com
   o modelo do teste. Só entra em ação se a página da terapeuta tiver "serena", "esquemas" ou "tdah"
   na lista de testes (travas_paginas.dados.testes).
   Esquemas e TDAH guardam código e respostas em testes_codigos / testes_respostas (as perguntas e as normas
   ficam no banco); o Mente Serena usa as mesmas tabelas, com as perguntas embutidas aqui.
   ============================================================================ */
(function(){
const MI_BASE = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');   // pasta deste arquivo (imagens)
const MI_CSS = "/* ===== temas: as cores vêm da página da terapeuta (as mesmas do site antigo); o Mente Serena mantém o desenho próprio ===== */\n:host{display:block;\n  --fundo:var(--areia); --painel:var(--argila-clara); --marca:var(--ardosia); --acento:var(--argila); --rosa:var(--salvia);\n  --moldura:var(--tinta-suave); --linha:var(--borda); --suave:var(--tinta-suave); --ok:#5E7B4F;\n  --fonte-titulo:'Fraunces',Georgia,serif; --fonte-texto:'Karla',system-ui,-apple-system,'Segoe UI',sans-serif; --peso-titulo:600;\n  color:var(--tinta); font-family:var(--fonte-texto); font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased}\n:host([data-tema=\"serena\"]){\n  --fundo:#DCCAC0; --papel:#FFF9EE; --painel:#F7DEB2; --tinta:#3F2414; --marca:#7B4529;\n  --acento:#A8773F; --rosa:#E9792B; --moldura:#8A5A3A; --linha:#EBD8B8; --suave:#7C5B44;\n  --ok:#6E7F45; --fonte-titulo:'Playfair Display',Georgia,serif; --fonte-texto:'Montserrat',system-ui,sans-serif;\n  --peso-titulo:800}\n*,*::before,*::after{box-sizing:border-box}\n:host([data-tema=\"serena\"]) .assinatura{font-family:'Playfair Display',serif;font-style:italic;font-weight:500;font-size:1.35rem}\n:host([data-tema=\"serena\"]) .citacao{font-family:'Playfair Display',serif;font-size:1.08rem}\n@media print{.nao-imprimir,.topo-teste{display:none!important}.folha{box-shadow:none;padding:0}.respostas-det h3{break-after:avoid}.teia,.barras{break-inside:avoid}}\nimg{max-width:100%;display:block}\nh1,h2,h3{font-family:var(--fonte-titulo);font-weight:var(--peso-titulo);color:var(--marca);line-height:1.2;margin:0 0 .5em}\nh1{font-size:clamp(1.6rem,4.5vw,2.1rem)}\nh2{font-size:clamp(1.35rem,3.6vw,1.65rem)}\nh3{font-size:1.1rem}\np{margin:0 0 1em}\na{color:var(--acento)}\nbutton,input,select,textarea{font:inherit;color:inherit}\n:focus-visible{outline:3px solid var(--rosa);outline-offset:2px}\n.oculto{display:none!important}\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n\n.banner{border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -18px rgba(70,35,15,.55);background:var(--painel)}\n.banner img{width:100%;height:auto}\n.banner .alt{padding:28px 20px;text-align:center}\n.banner .alt b{display:block;font-family:var(--fonte-titulo);font-size:1.8rem;color:var(--marca)}\n.banner .alt span{font-family:'Allura',cursive;font-size:2rem;color:var(--acento)}\n\n.folha{background:var(--papel);border-radius:22px;padding:clamp(22px,5vw,40px);margin-top:18px;\n  box-shadow:0 1px 0 var(--linha), 0 18px 40px -28px rgba(70,35,15,.5)}\n.lead{font-size:1.06rem;color:var(--suave)}\n.assinatura{font-family:'Allura',cursive;font-size:2.1rem;color:var(--acento);line-height:1;margin:.2em 0 .6em}\n:host([data-tema=\"serena\"]) .assinatura{font-family:'Playfair Display',serif;font-style:italic;font-weight:500;font-size:1.35rem}\n.citacao{border-left:3px solid var(--rosa);padding:6px 0 6px 18px;margin:1.4em 0;font-style:italic;color:var(--suave)}\n:host([data-tema=\"serena\"]) .citacao{font-family:'Playfair Display',serif;font-size:1.08rem}\n.destaque{background:var(--painel);border-radius:14px;padding:16px 18px;margin:1.2em 0}\n.destaque p:last-child{margin:0}\n.lista-travas{columns:2;column-gap:24px;padding:0;margin:0;list-style:none}\n.lista-travas li{break-inside:avoid;padding:4px 0 4px 22px;position:relative}\n.lista-travas li::before{content:\"\";position:absolute;left:4px;top:.75em;width:8px;height:8px;border-radius:50%;background:var(--acento)}\n.reflexoes{counter-reset:r;padding:0;list-style:none;margin:1.2em 0}\n.reflexoes li{counter-increment:r;position:relative;padding:0 0 14px 44px;margin-bottom:14px;border-bottom:1px dashed var(--linha)}\n.reflexoes li::before{content:counter(r);position:absolute;left:0;top:0;width:30px;height:30px;border-radius:50%;\n  background:var(--painel);color:var(--marca);font-weight:700;display:grid;place-items:center;font-size:.9rem}\n.reflexoes li:last-child{border-bottom:0}\n\n/* ============ BOTÕES ============ */\n.btn{appearance:none;border:0;cursor:pointer;border-radius:999px;padding:14px 26px;font-weight:700;font-size:1rem;\n  background:var(--marca);color:#fff;transition:transform .15s, background .2s, opacity .2s;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none}\n.btn:hover{background:var(--acento)}\n.btn:active{transform:scale(.98)}\n.btn[disabled]{opacity:.55;cursor:wait}\n.btn.sec{background:transparent;color:var(--marca);box-shadow:inset 0 0 0 2px var(--linha)}\n.btn.sec:hover{box-shadow:inset 0 0 0 2px var(--marca);background:transparent}\n.btn.zap{background:#1F8F55}\n.btn.zap:hover{background:#18764a}\n.btn.peq{padding:8px 14px;font-size:.88rem}\n.acoes{display:flex;gap:12px;justify-content:space-between;align-items:center;margin-top:28px;flex-wrap:wrap}\n.acoes .btn:last-child{margin-left:auto}\n\n/* ============ CAMPOS ============ */\n.campo{margin:0 0 26px;padding:0;border:0;min-width:0}\n.campo>legend,.campo>label.rotulo{display:block;font-weight:600;margin-bottom:10px;padding:0}\n.campo .num{color:var(--acento);font-weight:700;margin-right:6px}\n.obrig{color:var(--acento)}\n.entrada{width:100%;padding:13px 15px;border-radius:12px;border:1.5px solid var(--linha);background:#fff;transition:border-color .2s}\n.entrada:focus{outline:none;border-color:var(--marca)}\ntextarea.entrada{min-height:110px;resize:vertical}\n.campo.faltando .entrada,.campo.faltando .escala,.campo.faltando .opcoes{box-shadow:0 0 0 2px #C0392B33;border-radius:12px}\n.campo .erro{display:none;color:#A5281B;font-size:.88rem;margin-top:6px}\n.campo.faltando .erro{display:block}\n\n.opcoes{display:grid;gap:8px}\n.opcao{display:flex;gap:12px;align-items:flex-start;padding:11px 14px;border:1.5px solid var(--linha);border-radius:12px;cursor:pointer;background:#fff;transition:border-color .15s, background .15s}\n.opcao input{appearance:none;flex:0 0 20px;width:20px;height:20px;margin:2px 0 0;border-radius:50%;border:2px solid var(--moldura);display:grid;place-items:center;cursor:pointer}\n.opcao input::after{content:\"\";width:10px;height:10px;border-radius:50%;background:var(--marca);transform:scale(0);transition:transform .15s}\n.opcao input:checked::after{transform:scale(1)}\n.opcao:has(input:checked){border-color:var(--marca);background:var(--painel)}\n\n.escala{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:6px}\n.escala label{position:relative}\n.escala input{position:absolute;opacity:0;inset:0;cursor:pointer}\n.escala span{display:grid;place-items:center;height:44px;border-radius:12px;border:1.5px solid var(--linha);background:#fff;font-weight:700;color:var(--marca);transition:background .15s,color .15s,border-color .15s;cursor:pointer}\n.escala input:checked+span{background:var(--marca);border-color:var(--marca);color:#fff}\n.escala input:focus-visible+span{outline:3px solid var(--rosa);outline-offset:2px}\n.ancoras{display:flex;justify-content:space-between;gap:16px;font-size:.82rem;color:var(--suave);margin-top:6px}\n.ancoras span:last-child{text-align:right}\n@media (max-width:560px){\n  .escala{grid-template-columns:repeat(var(--nm),1fr)}\n  .lista-travas{columns:1}\n}\n\n/* ============ PROGRESSO ============ */\n.topo-teste{position:sticky;top:0;z-index:5;padding:calc(env(safe-area-inset-top,0px) + 10px) 0 10px;margin:0 -20px;padding-left:20px;padding-right:20px;\n  background:color-mix(in srgb,var(--fundo) 88%,transparent);backdrop-filter:blur(8px)}\n.topo-teste .linha{display:flex;justify-content:space-between;font-size:.82rem;color:var(--suave);margin-bottom:6px;gap:12px}\n.barra{height:6px;border-radius:6px;background:color-mix(in srgb,var(--marca) 14%,transparent);overflow:hidden}\n.barra i{display:block;height:100%;background:var(--marca);width:0;transition:width .45s ease}\n\n/* ============ ACESSO ============ */\n.acesso{display:flex;gap:10px;flex-wrap:wrap}\n.acesso .entrada{flex:1 1 220px;font-size:1.2rem;letter-spacing:.12em;text-transform:uppercase;text-align:center;font-weight:700}\n.msg{border-radius:12px;padding:12px 14px;margin:14px 0 0;font-size:.94rem}\n.msg.erro{background:#F8E1DC;color:#7B1F12}\n.msg.info{background:var(--painel);color:var(--marca)}\n.rodape{text-align:center;margin-top:26px;font-size:.85rem;color:var(--suave)}\n.rodape a{color:var(--suave)}\n\n\n/* ============ CAMPOS ESPECIAIS ============ */\n.ajuda{display:block;font-size:.84rem;color:var(--suave);margin-top:6px}\n.dica-multi{display:block;font-weight:400;font-size:.86rem;color:var(--suave);margin-top:2px}\n.opcao input[type=\"checkbox\"]{border-radius:6px}\n.opcao input[type=\"checkbox\"]::after{border-radius:2px}\n.auto{position:relative}\n.auto-lista{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:20;list-style:none;margin:0;padding:6px;background:#fff;\n  border:1.5px solid var(--linha);border-radius:14px;box-shadow:0 18px 36px -20px rgba(70,35,15,.55);max-height:300px;overflow:auto}\n.auto-lista li{padding:10px 12px;border-radius:10px;cursor:pointer;display:flex;justify-content:space-between;gap:12px}\n.auto-lista li span{font-weight:700;color:var(--suave);font-size:.86rem}\n.auto-lista li:hover,.auto-lista li.ativo{background:var(--painel);color:var(--marca)}\n.auto-lista li.auto-info{cursor:default;color:var(--suave);font-size:.9rem}\n.auto-lista li.auto-info:hover{background:none}\n.auto-alt{display:grid;grid-template-columns:96px 1fr;gap:8px}\n\n.escala.icones{gap:2px}\n.escala.icones label{display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px 0;cursor:pointer;color:var(--moldura)}\n.escala.icones small{font-size:.78rem;font-weight:700;color:var(--suave)}\n.escala.icones svg{width:min(30px,100%);height:auto;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;transition:transform .15s,fill .15s,color .15s}\n.escala.icones label.cheio{color:var(--rosa)}\n.escala.icones label.cheio svg{fill:currentColor}\n.escala.icones label:hover svg{transform:scale(1.15)}\n.escala.icones input:focus-visible ~ svg{outline:3px solid var(--rosa);outline-offset:2px;border-radius:6px}\n\n/* ============ FRASE DOS PILARES ============ */\n.frase-card{position:relative;margin:4px 0 22px;background:#F2D3A2;border-radius:18px;padding:30px clamp(20px,6vw,64px) 64px;text-align:center;overflow:hidden;color:#8A4B2A}\n.frase-card blockquote{margin:0;font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:clamp(1.08rem,2.6vw,1.3rem);line-height:1.45}\n.fc-selo{display:grid;place-items:center;width:46px;height:46px;margin:0 auto 12px;border:1.5px solid #8A5A3A;border-radius:50%;color:#8A5A3A}\n.fc-folha{position:absolute;bottom:-4px;left:-4px;width:84px;height:84px}\n.fc-folha + .fc-folha{left:auto;right:-4px;transform:scaleX(-1)}\n.exemplo-teia{margin:0 0 20px}\n.exemplo-teia figcaption{text-align:center;font-size:.84rem;color:var(--suave);margin-top:6px}\n\n/* ============ RESULTADO DA CLIENTE ============ */\n.contador-trava{font-size:.86rem;font-weight:700;color:var(--acento);margin:0 0 4px}\n.lembrete{color:var(--suave)}\n.resultado{margin-top:34px;padding-top:28px;border-top:2px solid var(--linha)}\n.nota-res{font-size:.9rem;color:var(--suave)}\n.sub-res{margin-top:30px}\n.res-cards{display:grid;gap:12px}\n.res-card{background:#fff;border:1.5px solid var(--linha);border-radius:16px;padding:16px 18px}\n.res-card.destaque-card{border-color:var(--rosa);box-shadow:0 0 0 3px color-mix(in srgb,var(--rosa) 22%,transparent)}\n.res-card header{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}\n.res-card h3{margin:0;font-size:1.08rem;flex:1 1 180px}\n.res-card .pontos{font-size:1.3rem;color:var(--marca);font-family:var(--fonte-titulo)}\n.res-card .pontos small{font-size:.8rem;color:var(--suave);font-weight:600}\n.res-card p{margin:0 0 6px;font-size:.95rem}\n.res-card .leitura{color:var(--suave);font-style:italic;margin:0}\n.nivel{display:inline-block;padding:2px 10px;border-radius:999px;font-size:.78rem;font-weight:700}\n.nivel.forte{background:#F3D5D3;color:#8C2F35}\n.nivel.moderada{background:#F6E1D6;color:#9A5340}\n.nivel.leve{background:#EFE6E1;color:#7A5F55}\n.trilho-mini{height:8px;border-radius:6px;background:#F1E4DA;overflow:hidden;margin:0 0 10px}\n.trilho-mini i{display:block;height:100%;border-radius:6px}\n.trilho-mini i.forte{background:#8C2F35}.trilho-mini i.moderada{background:#C9806C}.trilho-mini i.leve{background:#E6C2B2}\n.caixa-envio{background:var(--painel);border-radius:18px;padding:20px;margin:22px 0;text-align:center}\n.caixa-envio p{margin:10px 0 0;font-size:.9rem;color:var(--suave)}\n.caixa-envio.final{margin-top:30px}\n.btn-envio svg{flex:0 0 24px;width:24px;height:24px}\n.btn-envio{width:100%;max-width:440px;padding:16px 22px;font-size:1.05rem;border-radius:14px;box-shadow:0 12px 26px -16px rgba(20,90,50,.9)}\n\n/* ============ RESULTADOS ============ */\n.cab-res{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:18px}\n.cab-res .meta{color:var(--suave);font-size:.9rem}\n.barras{display:grid;gap:10px;margin:8px 0 6px}\n.barra-trava{display:grid;grid-template-columns:minmax(150px,210px) 1fr 54px;align-items:center;gap:12px}\n.barra-trava .nome{font-weight:600;font-size:.92rem}\n.barra-trava .trilho{height:22px;border-radius:8px;background:#F1E4DA;overflow:hidden}\n.barra-trava .trilho i{display:block;height:100%;border-radius:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.barra-trava .val{font-weight:800;text-align:right;color:var(--marca)}\n.barra-trava.top .nome{color:var(--acento)}\n@media (max-width:560px){.barra-trava{grid-template-columns:1fr 46px}.barra-trava .trilho{grid-column:1/-1;grid-row:2}}\n.legenda{display:flex;gap:16px;flex-wrap:wrap;font-size:.82rem;color:var(--suave);margin:10px 0 0}\n.legenda i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.teia{background:#FEF2CD;border-radius:22px;padding:14px;box-shadow:0 0 0 2px #F3C7A1 inset, 0 10px 24px -18px rgba(120,60,10,.6);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.teia svg{width:100%;height:auto;display:block}\n@media (max-width:560px){.teia{padding:4px;border-radius:16px}}\n.notas{width:100%;border-collapse:collapse;margin-top:16px;font-size:.92rem}\n.notas td{padding:8px 6px;border-bottom:1px solid var(--linha)}\n.notas td:nth-child(2){font-weight:800;color:var(--marca);text-align:right;width:60px}\n.notas td:last-child{text-align:right;width:170px;white-space:nowrap}\n.sinal{display:inline-block;padding:2px 10px;border-radius:999px;font-size:.78rem;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.sinal.verde{background:#E3EED8;color:#3F5A2E}\n.sinal.amarelo{background:#FBEBC8;color:#7A5410}\n.sinal.vermelho{background:#F6DAD3;color:#8C2F1A}\n.respostas-det h3{margin-top:28px;padding-top:16px;border-top:2px solid var(--linha)}\n.par{margin:0 0 12px}\n.par dt{font-size:.86rem;color:var(--suave)}\n.par dd{margin:2px 0 0;font-weight:600;white-space:pre-wrap}\n.notinhas{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px 18px}\n.notinha{display:flex;justify-content:space-between;gap:10px;font-size:.88rem;border-bottom:1px dotted var(--linha);padding:4px 0}\n.notinha b{color:var(--marca)}\n\n.carregando{display:inline-block;width:16px;height:16px;border:2.5px solid currentColor;border-right-color:transparent;border-radius:50%;animation:gira .8s linear infinite}\n@keyframes gira{to{transform:rotate(360deg)}}\n.surge{animation:surge .5s ease both}\n@keyframes surge{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.pulso path{stroke-dashoffset:0}}\n\n/* ===== Testes Esquemas e TDAH ===== */\n.selo.t-esquemas{background:#E3E8F3;color:#2F4A7A}\n.selo.t-tdah{background:#E9E2F3;color:#4B3A7A}\n.legenda-escala{margin:10px 0 14px;font-size:.9rem;color:var(--suave)}\n.legenda-escala summary{cursor:pointer;font-weight:700;color:var(--marca)}\n.legenda-escala ol{margin:8px 0 0;padding-left:22px}\n.legenda-escala li{margin:3px 0}\n.meta-bloco{color:var(--suave);font-size:.9rem;margin:2px 0 10px}\n.nota-bloco{background:#F9EEE6;border-left:4px solid var(--acento);padding:10px 14px;border-radius:8px;margin:10px 0}\n.barra-trava .trilho{position:relative}\n.limiar{position:absolute;top:0;bottom:0;width:2px;background:#3a2a22;opacity:.55;z-index:1;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.dom-t{margin:18px 0 6px;font-size:1rem;color:var(--marca)}\n.duplas{display:grid;gap:12px}\n.barra-dupla{display:grid;grid-template-columns:minmax(150px,230px) 1fr;gap:12px;align-items:center}\n.barra-dupla .nome{font-weight:600;font-size:.92rem;overflow-wrap:anywhere}\n.barra-dupla .uma{display:grid;grid-template-columns:1fr 112px;align-items:center;gap:8px;margin:2px 0}\n.barra-dupla .trilho{height:12px;border-radius:6px;background:#F1E4DA;overflow:hidden;display:block}\n.barra-dupla .trilho i{display:block;height:100%;border-radius:6px;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.barra-dupla em{font-style:normal;font-size:.8rem;color:var(--suave)}\n.barra-dupla .sem{display:block;font-size:.8rem;color:var(--suave);margin:2px 0}\n@media (max-width:560px){.barra-dupla{grid-template-columns:1fr}}\ntable.geral .dom td{text-align:left;background:#F5E1D3;font-weight:800;color:var(--marca);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.mudo{color:#A4978A}\ntable.geral td:not(:first-child),table.geral th:not(:first-child){text-align:center}\ntable.geral .dom td{text-align:left!important}\n.ident{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px 16px;margin:6px 0 12px}\n.rne{margin-top:30px;border-top:2px solid #EAD7CB;padding-top:10px}\n.rne-pessoas{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}\n.rne-pessoa label{display:block;font-weight:600;font-size:.9rem;margin:8px 0}\n.rne-pessoa textarea{min-height:90px}\n.rne-dom{margin:16px 0 4px;color:var(--marca)}\n.rne-linha{display:grid;grid-template-columns:1fr auto;gap:12px;padding:8px 0;border-bottom:1px solid #F1E4DA;align-items:center}\n.rne-linha .amb{font-size:.92rem}\n.rne-linha small{display:block;color:var(--suave);font-weight:700;margin-top:2px}\n.rne-linha .chk{display:flex;gap:12px;flex-wrap:wrap}\n.rne-linha .chk label{white-space:nowrap}\n@media (max-width:560px){.rne-linha{grid-template-columns:1fr}}\n.ok-salvo{color:#3F5A2E;font-weight:700}";

/* ---------- raízes (Shadow DOM) e atalhos ---------- */
const RAIZES = [];
const RAIZ = {
  getElementById(id){ for(const r of RAIZES){ const e = r.getElementById(id); if(e) return e; } return null; },
  querySelector(s){ for(const r of RAIZES){ const e = r.querySelector(s); if(e) return e; } return null; },
  querySelectorAll(s){ const out = []; RAIZES.forEach(r => r.querySelectorAll(s).forEach(e => out.push(e))); return out; }
};
const $ = s => RAIZ.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* nome, WhatsApp e endereço vêm da página da terapeuta (no site antigo eram fixos) */
const CONFIG = {
  get WHATSAPP(){ return String((window.__T && __T.dados && __T.dados.whatsapp) || ''); },
  get NOME(){ return window.T_NOME || ''; },
  get PRIMEIRO_NOME(){ return window.T_PRIM || ''; }
};

/* ---------- utilitários (copiado do site antigo) ---------- */
function msg(alvo, texto, tipo='erro'){ $(alvo).innerHTML = texto ? `<div class="msg ${tipo}" role="${tipo==='erro'?'alert':'status'}">${esc(texto)}</div>` : ''; }
function carregando(btn, sim, texto){
  if(sim){ btn.dataset.txt = btn.textContent; btn.disabled = true; btn.innerHTML = `<span class="carregando" aria-hidden="true"></span> ${texto||'Aguarde'}`; }
  else { btn.disabled = false; btn.textContent = btn.dataset.txt || btn.textContent; }
}
function dataBR(iso){ if(!iso) return ''; const d=new Date(iso); return isNaN(d)?iso:d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
const guardar = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};

/* ---------- mensagens de WhatsApp (copiado do site antigo) ---------- */
const MENSAGENS = {
  envioCodigo: {
    travas: `{saudacao} 🤍

Que alegria ter você aqui. Preparei com carinho o seu acesso ao *Teste de Identificação de Travas Mentais*, o primeiro passo para olharmos com cuidado para aquilo que tem te impedido de avançar.

👉 Acesse: {link}
🔑 Seu código: *{codigo}*

Reserve cerca de 15 minutos só para você, em um lugar tranquilo. Responda com sinceridade, pensando na sua vida hoje. Aqui não existe resposta certa ou errada, só a sua verdade.

Se precisar parar no meio, fique tranquilo(a): seu progresso fica salvo no aparelho. O código é pessoal e vale para um único envio.

Quando terminar, me manda uma mensagem por aqui. Estou te esperando! 🌷
*Miralene Souto*`,
    serena: `{saudacao} 🌿

Que bom ter você comigo. Aqui está o seu acesso ao *Diagnóstico Mente Serena*, a sua primeira pausa consciente dentro da nossa mentoria.

👉 Acesse: {link}
🔑 Seu código: *{codigo}*

Antes de começar, procure um lugar tranquilo, respire fundo três vezes e reserve de 10 a 15 minutos só para você. Responda com o coração, sem pressa e sem julgamentos.

Se precisar parar, seu progresso fica salvo no aparelho. O código é pessoal e vale para um único envio.

Quando finalizar, me avise por aqui para darmos o próximo passo. Vamos juntas! 🤍
*Miralene Souto | Mente Serena*`
  },
  // {resultado}, {fortes} e {cuidado} são preenchidos com o resultado da cliente
  avisarFim: {
    travas: `Oi, Miralene! Aqui é {nome}. 😊

Acabei de finalizar o *Teste de Identificação de Travas Mentais* e já vi o meu resultado. As travas que mais apareceram em mim foram:

{resultado}

Fiquei com vontade de entender o que isso diz sobre a minha história e como posso me destravar. Quando podemos conversar sobre a minha devolutiva? 🤍`,
    serena: `Oi, Miralene! Aqui é {nome}. 🌿

Acabei de finalizar o *Diagnóstico Mente Serena* e já vi o meu Termômetro.

✨ Onde estou mais fortalecida: {fortes}
🌱 O que mais pede cuidado: {cuidado}

Estou pronta para o próximo passo da minha pausa consciente. Quando podemos marcar a minha devolutiva? 🤍`
  },
  pedirCodigo: `Oi, Miralene! Tudo bem? 😊
Gostaria de fazer o teste de autoconhecimento. Pode me enviar o meu código de acesso?`
};
function preencher(modelo, dados){
  return modelo.replace(/\{(\w+)\}/g, (m,k)=> dados[k]!=null ? dados[k] : m);
}

/* ---------- imagens do topo (as duas faixas do site antigo) ---------- */
const BANNERS = { travas: MI_BASE + 'img/miralene-banner.jpg', serena: MI_BASE + 'img/miralene-banner-serena.jpg' };

/* ---------- Diagnóstico Mente Serena: dados e telas (copiado do site antigo) ---------- */
const ANC_INF = { rotMin:'Nunca me senti assim na infância', rotMax:'Eu me sentia totalmente assim na infância' };
const ANC_HOJE = { rotMin:'Preciso resgatar', rotMax:'É uma força muito presente em mim' };
const FOLHAS = '<svg class="fc-folha" viewBox="0 0 80 80" aria-hidden="true"><path d="M4 78 C 28 62, 50 40, 72 8" stroke="#8A5A3A" stroke-width="2" fill="none"/><path d="M26 62c-11-2-19-10-21-23 13 1 22 10 21 23z" fill="#B98A55"/><path d="M45 41c-2-12 3-23 15-28 3 13-3 23-15 28z" fill="#C79A63"/><path d="M38 52c10-7 22-7 32 1-10 7-22 7-32-1z" fill="#A9784A"/></svg>';
function fraseCard(t){
  if(!t) return '';
  return `<figure class="frase-card"><span class="fc-selo" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 21c0-6 3-10 8-12-1 6-4 10-8 12zM12 21c0-5-2.5-8.5-7-10 .7 5 3 8.5 7 10z"/></svg></span><blockquote>${t}</blockquote>${FOLHAS}${FOLHAS}</figure>`;
}
function pilar(prefixo, frases, anc){
  return frases.map((f,i)=>({ id:prefixo+(i+1), num:prefixo+(i+1), label:f, tipo:'escala', min:1, max:5, ...anc }));
}
const PILARES_SERENA = [
  { nome:'Essência Serena', pre:'S', anc:ANC_INF,
    frase:'Respire fundo e faça uma pausa. Conecte-se com a menina que habita em você, aquela que se posicionava com total naturalidade, que era leve, segura e serena por essência. Vá fundo na sua história, responda com o seu coração e permita-se reconhecer a força dessa essência que sempre esteve aí com você.',
    intro:'Olhe para a sua história e para a menina que você foi. Esta etapa nos ajuda a identificar como as suas necessidades emocionais básicas foram acolhidas na sua infância, pois a sua segurança atual começa na sua história. Investigue suas memórias de segurança, quem você era antes das adaptações que a vida exigiu.',
    frases:[
      'Consigo me lembrar de momentos da infância em que me sentia segura, leve e livre para ser quem eu era.',
      'Sentia que a minha casa era um lugar seguro, onde eu recebia afeto, proteção e cuidado constantes.',
      'Sentia-me livre e segura para expressar o que eu sentia, minhas opiniões e minhas vontades dentro de casa.',
      'Sentia que os meus pais ou cuidadores elogiavam e reconheciam o meu valor por quem eu era, e não apenas quando eu tirava notas boas, acertava algo ou fazia algum trabalho.',
      'Sentia que tinha espaço, apoio e incentivo para brincar, errar, descobrir o mundo e desenvolver minha própria independência.',
      'Sentia-me incluída, aceita e pertencente aos ambientes em que eu vivia (na família, na escola e com amigos).',
      'Recebi limites claros, mas amorosos, que me ensinaram desde cedo a lidar com as minhas frustrações e a ter autocontrole.'
    ]},
  { nome:'Mulher Segura', pre:'M', anc:ANC_HOJE,
    frase:'Uma mulher segura não precisa controlar o mundo, ela só precisa governar a si mesma.',
    intro:'Agora iremos avaliar a sua autoconfiança, autonomia e a forma como você se posiciona diante da vida hoje.',
    frases:[
      'Sinto-me segura para tomar decisões importantes sobre a minha vida, confiando na minha própria capacidade de escolha.',
      'Consigo dizer “não” para as pessoas quando necessário, sem carregar a culpa ou o medo.',
      'Reconheço as minhas qualidades e o meu valor real, sem depender do elogio ou da validação constante dos outros para me sentir bem.',
      'Consigo realizar minhas tarefas e projetos de forma independente, sem a necessidade de que alguém aprove tudo o que faço.',
      'Enfrento novos desafios profissionais ou pessoais com coragem, acreditando que sou capaz de lidar com os resultados.',
      'Sinto-me confortável em passar momentos sozinha comigo mesma, encarando a solitude como um momento de paz e descanso.',
      'Sei identificar claramente quando um relacionamento ou ambiente está sendo tóxico e tenho forças para me afastar dele.'
    ]},
  { nome:'Amor-próprio', pre:'A', anc:ANC_HOJE,
    frase:'A vida te trata do jeito que você se ama! Se ame, se cuide.',
    intro:'O amor-próprio não é sobre estética, é sobre o direito de existir sem se culpar. Agora vamos olhar para como você tem tratado a pessoa mais importante da sua vida: você mesma. Avalie com profundidade a sua capacidade de se perdoar, de se priorizar e de acolher a sua história.',
    frases:[
      'Quando cometo um erro ou as coisas não saem como planejei, consigo me perdoar com facilidade em vez de ficar me punindo e me cobrando excessivamente; sou a minha melhor amiga e me trato com gentileza.',
      'Nos últimos 12 meses, reservei um dia ou algumas horas exclusivamente para olhar para minha vida, minhas emoções e minhas necessidades, sem interrupções ou distrações.',
      'Consigo olhar para as minhas imperfeições e para a minha história com carinho e aceitação, sem me comparar constantemente com outras mulheres.',
      'Eu reconheço o meu valor e as minhas vitórias diárias, celebrando quem eu sou, em vez de focar apenas no que ainda falta fazer.',
      'Cuido ativamente do meu templo (meu corpo), mantendo a constância na atividade física, bebendo água adequadamente e garantindo uma rotina de sono que realmente me renova.',
      'Consigo aceitar elogios, sei agradecer e reconhecer minhas qualidades sem me diminuir ou achar que os outros estão apenas tentando ser legais comigo.',
      'Coloco minhas necessidades básicas e emocionais em primeiro plano quando estou exausta, em vez de me deixar sempre por último.'
    ]},
  { nome:'Organização da Mente', pre:'OR', anc:ANC_HOJE,
    frase:'Organizar os pensamentos é construir uma fortaleza invisível. Quando a sua mente está em ordem, o caos do lado de fora perde o poder de te desestruturar.',
    intro:'Uma mente no “modo alerta” consome a sua energia antes mesmo de o dia começar. Nesta seção, vamos avaliar o nível de agitação dos seus pensamentos, a sua presença no aqui e agora e a sua capacidade de fazer pausas conscientes. Responda observando o ritmo da sua mente e do seu descanso.',
    frases:[
      'Consigo silenciar a minha mente e manter o foco no momento presente, sem que meus pensamentos fiquem pulando o tempo todo para as preocupações do futuro.',
      'Identifico quando minha mente entra no “modo alerta” (ansiedade, pressa, irritabilidade) e consigo usar ferramentas para desacelerar e voltar ao equilíbrio.',
      'Pratico pausas conscientes ao longo do meu dia para respirar e me observar, em vez de viver no piloto automático da exaustão.',
      'Meu sono é reparador e eu consigo desligar os problemas da rotina antes de dormir, acordando com a mente limpa e descansada.',
      'Consigo organizar meus pensamentos e prioridades com clareza, sem me sentir sobrecarregada ou paralisada pelo excesso de tarefas na mente.',
      'Sei diferenciar o que é um problema real que posso resolver agora daquilo que é apenas uma paranoia ou um cenário criado pela minha mente ansiosa.',
      'Consigo terminar o que começo sem me perder em distrações ou ser arrastada pela agitação mental que me faz abandonar meus planos pela metade.'
    ]},
  { nome:'Espiritualidade', pre:'ES', anc:ANC_HOJE,
    frase:'', // FRASE DO CARD: cole aqui a frase da imagem de Espiritualidade
    intro:'A espiritualidade é o lugar de descanso da alma feminina. Agora, avaliaremos a sua conexão com o sagrado, a sua capacidade de ouvir a própria intuição e, acima de tudo, o exercício de soltar o controle para descansar em um amparo maior.',
    frases:[
      'Sinto uma conexão profunda com a minha espiritualidade no dia a dia, encontrando nela uma fonte de paz, força e direção.',
      'Consigo silenciar as vozes externas para ouvir e confiar na voz que vem do alto e na sabedoria que vem do meu coração.',
      'Diante dos desafios, consigo soltar a necessidade de controlar tudo e confio que existe um amparo divino guiando os meus passos, porque confio plenamente que a minha vida está alinhada a um propósito maior, onde nada é por acaso.',
      'Sinto clareza sobre o meu propósito e vivo alinhada com os meus valores mais profundos, expressando a minha real identidade no mundo.',
      'Dedico momentos na minha rotina para me conectar com Deus (seja através da oração, da reza, da meditação, da contemplação, da leitura da Bíblia ou de um devocional), sentindo-me abastecida na alma.',
      'Sinto que as minhas decisões são guiadas por princípios nobres e por uma sabedoria interna, e não pelo medo da escassez ou pela opinião dos outros, e sinto o meu espírito fortalecido para fazer escolhas que refletem a luz da minha verdadeira identidade.',
      'Consigo descansar na certeza de que não preciso resolver tudo com as minhas próprias mãos, encontrando sempre amparo espiritual, leveza e a paz que excede todo o meu entendimento.'
    ]},
  { nome:'Regulação Emocional', pre:'R', anc:ANC_HOJE,
    frase:'', // FRASE DO CARD: cole aqui a frase completa ("Uma mulher emocionalmente regulada não é...")
    intro:'Vamos avaliar a sua capacidade de governar a sua mente e o seu corpo diante das tensões e contrariedades do dia a dia. Você vai olhar para dentro e reconhecer como reage à frustração, à raiva e ao estresse, identificando se hoje você domina os seus impulsos ou se acaba sendo arrastada por uma montanha-russa emocional.',
    frases:[
      'Quando sinto uma emoção intensa (como raiva, frustração ou medo), consigo respirar e me acalmar antes de reagir ou falar algo de que possa me arrepender.',
      'Consigo expressar a minha opinião e o que estou sentindo de forma clara e firme, sem precisar gritar, chorar ou usar a agressividade para ser ouvida.',
      'Quando alguém me contraria ou me critica, consigo manter a estabilidade emocional em vez de entrar imediatamente na defensiva ou me sentir atacada.',
      'Sei colocar limites claros nas pessoas quando me sinto desrespeitada, fazendo isso com segurança e sem carregar o peso da culpa depois.',
      'Em momentos de crise ou estresse, consigo governar os meus comportamentos em vez de ser totalmente arrastada pelo desespero ou pelo mau humor.',
      'Consigo sustentar as minhas decisões e escolhas diante dos outros, mesmo que eles não concordem ou fiquem chateados comigo.',
      'Percebo os sinais físicos do meu corpo quando estou prestes a estourar emocionalmente e uso pausas conscientes para recuperar o meu autocontrole.'
    ]},
  { nome:'Posicionamento', pre:'P', anc:ANC_HOJE,
    frase:'Uma mulher posicionada não precisa gritar para ser respeitada; a sua presença e as suas escolhas já falam por ela.',
    intro:'Vamos avaliar o seu posicionamento real diante da vida. Você vai olhar para como se coloca nos seus papéis de profissional, mãe, parceira, e até mesmo na sua relação com o dinheiro. Responda observando se a sua postura tem sido firme, madura e segura, ou se você tem recuado.',
    frases:[
      'No meu trabalho ou carreira, defendo minhas ideias com segurança, cobro o valor justo pelo que faço e não aceito ser diminuída ou sobrecarregada.',
      'Diante da minha família e parceiro(a), consigo expressar minhas vontades e limites de forma firme, sem me anular para tentar manter o ambiente em paz.',
      'No meu papel de mãe (ou na liderança e cuidado com as pessoas ao meu redor), exerço minha autoridade com amor e firmeza, sem ceder à culpa ou deixar que ultrapassem minhas barreiras.',
      'Minha relação com o dinheiro é madura e segura: sei negociar, cobrar, investir em mim e gerenciar minhas finanças sem medo e sem dependência emocional de terceiros.',
      'Tenho um posicionamento firme com os meus próprios objetivos: mantenho o foco nas minhas prioridades e a disciplina para cumprir exatamente o que planejei.',
      'Quando eu digo um “não” ou tomo uma decisão difícil, eu sustento a minha palavra com firmeza até o fim, sem voltar atrás por pena ou manipulação.',
      'Eu me posiciono na vida real como a protagonista da minha história, agindo com a postura de quem sabe exatamente quem é e o que merece.'
    ]}
];
const TERMOMETRO_INICIAL = [
  { id:'t1', icone:'coracao', nome:'Calma e controle emocional', label:'Como você avalia a sua capacidade de manter a calma e controlar as suas reações emocionais diante dos desafios diários?' },
  { id:'t2', icone:'estrela', nome:'Espiritualidade e paz interior', label:'Como você classifica o seu nível de conexão com a sua espiritualidade, paz interior e fé no seu momento atual?' },
  { id:'t3', icone:'joinha', nome:'Mente organizada e presente', label:'O quanto você consegue organizar a sua mente e focar no presente, sem se sentir constantemente sobrecarregada por pensamentos acelerados?' },
  { id:'t4', icone:'coracao', nome:'Limites e posicionamento', label:'O quanto você se sente segura para impor limites saudáveis, dizer “não” e se posicionar com firmeza nos seus relacionamentos e na vida?' }
];

const TESTE_SERENA = {
  chave:'serena',
  nome:'Diagnóstico Mente Serena',
  curto:'Mente Serena',
  passos:[
    { titulo:'Boas-vindas', intro:`
      <h1>Seja muito bem-vinda!</h1>
      <p class="assinatura">A sua pausa consciente começa aqui.</p>
      <h2>Pare a pressa, respire presença.</h2>
      <p class="lead">O que você menos pode ter neste exato momento é pressa.</p>
      <p>Este questionário não é uma tarefa para ser cumprida correndo na sua rotina; ele é o seu primeiro passo para desacelerar. A sua jornada de transformação começa exatamente aqui, agora, nesta pausa consciente.</p>
      <p>Por isso, procure um ambiente tranquilo, confortável e silencioso. Desconecte-se do barulho do mundo lá fora por alguns instantes. Feche os olhos, respire fundo três vezes, soltando o ar devagar, e olhe para você. Permita-se esse momento de auto-observação e acolhimento.</p>
      <p>Este mapa vai olhar para a sua história, seus comportamentos e suas emoções para identificar onde estão as suas maiores forças e quais áreas precisam de mais cuidado, atenção e de ser resgatadas.</p>
      <div class="destaque"><p>Reserve cerca de <b>10 a 15 minutos</b> para responder com total verdade e honestidade, sem julgamentos. Ao responder com sinceridade, você terá uma visão mais clara dos seus padrões emocionais, mentais e comportamentais, permitindo compreender onde estão seus maiores desafios e quais aspectos precisam ser fortalecidos.</p></div>`,
      campos:[] },
    { titulo:'Termômetro Mente Serena', intro:()=>`
      <h2>Termômetro Mente Serena</h2>
      <figure class="exemplo-teia">${graficoTeia(PILARES_SERENA.map((p,i)=>({nome:p.nome, valor:[9,9,7,4,4,6,9][i]})), true)}<figcaption>Exemplo de Gráfico de Teia</figcaption></figure>
      <h3>Entendendo a análise e o Gráfico de Teia</h3>
      <p>Após você enviar as suas respostas, eu irei analisar detalhadamente cada pilar do seu teste para estruturar o seu diagnóstico. Na nossa mentoria, você receberá uma devolutiva exclusiva com o seu relatório completo e o seu Gráfico de Teia, o seu Termômetro Mente Serena.</p>
      <p>A análise funciona através de notas que indicam o seu estado atual em cada área:</p>
      <div class="destaque">
        <p><span class="sinal verde">Perto da nota 10</span> Sinal verde: aquele pilar está fortalecido, equilibrado, e você está muito bem nessa área. No gráfico do seu relatório, a teia estará totalmente expandida até as bordas.</p>
        <p><span class="sinal vermelho">Perto da nota 1</span> Sinal de alerta: a sua mente está em “modo alerta” naquele ponto, mostrando que a área não está bem e precisa de atenção e cuidado.</p>
      </div>
      <h3>Como responder (escala de 1 a 5)</h3>
      <p>Cada afirmação funciona como uma barra de intensidade de 1 a 5. Você só precisa escolher o número que melhor representa a sua realidade:</p>
      <p><b>1</b>: a afirmação não tem nada a ver com você (está em falta ou você ainda precisa resgatar).<br>
      <b>3</b>: o seu meio-termo (você está no processo ou fortalecendo esse ponto).<br>
      <b>5</b>: a afirmação tem tudo a ver com você (já é uma força muito presente e ativa na sua vida).</p>
      <p><b>Importante:</b> no primeiro bloco (Essência Serena), você avaliará o seu passado, na infância. Nos blocos seguintes, avaliará a sua vida adulta hoje.</p>
      <p class="citacao">“Atrás de uma mente que vive no modo alerta e cansada de carregar o mundo, existe uma menina que só precisa de permissão para descansar. Honre a sua história, responda com o coração e seja muito bem-vinda de volta para si mesma.”</p>
      <p class="assinatura">Vamos juntas!</p>`,
      campos:[] },
    { titulo:'Sobre você', intro:'<h2>Sobre você</h2>',
      campos:[
        { id:'chamada', label:'Como você gosta de ser chamada?', tipo:'text', auto:'given-name' },
        { id:'email', label:'Seu e-mail', tipo:'email', auto:'email' },
        { id:'descricao', label:'Em poucas palavras, como você descreveria a mulher que chega aqui neste teste agora?', tipo:'textarea' },
        { id:'idade', label:'Qual sua idade e data de nascimento?', tipo:'text' },
        { id:'profissao', label:'Qual sua profissão?', tipo:'text' },
        { id:'whatsapp', label:'Qual seu WhatsApp?', tipo:'whatsapp' },
        { id:'conheceu', label:'Como conheceu a Mente Serena?', tipo:'text' },
        { id:'dificuldade', label:'Qual é a principal dificuldade emocional que você deseja compreender ou transformar hoje?', tipo:'multi', outro:true, opcoes:[
          'Tenho dificuldade de controlar minhas emoções diante das situações da vida.',
          'Minha mente permanece acelerada e tenho dificuldade de desligar os pensamentos.',
          'Sofro com excesso de preocupação, ansiedade ou antecipação de problemas.',
          'Frequentemente me coloco em último lugar e tenho dificuldade de cuidar de mim mesma.',
          'Me sinto insegura, duvido de mim mesma e tenho dificuldade de confiar nas minhas decisões.',
          'Sinto que me afastei da minha essência e perdi a leveza que gostaria de viver.',
          'Tenho dificuldade de reservar tempo para me olhar, me ouvir e cuidar de mim de forma intencional.' ] },
        { id:'area', label:'Em qual área da sua vida você sente mais dificuldade de se posicionar atualmente?', tipo:'multi', opcoes:['Com você mesma','No relacionamento amoroso','Com os filhos','No trabalho ou profissão','Nas amizades','Espiritualmente','Em várias áreas da minha vida'] },
        { id:'rotina', label:'Como você definiria sua rotina atualmente?', tipo:'multi', opcoes:['Muito tranquila','Equilibrada','Corrida','Muito acelerada','Sobrecarregada','Cada dia é diferente'] }
      ]},
    { titulo:'Como você está hoje', intro:'<h2>Como você está hoje</h2><p class="lead">De 1 a 10, como você se percebe neste momento.</p>',
      campos: TERMOMETRO_INICIAL.map(t=>({ id:t.id, label:t.label, tipo:'escala', icone:t.icone, min:1, max:10, rotMin:'Muito pouco', rotMax:'Plenamente' })) },
    ...PILARES_SERENA.map(p=>({
      titulo:p.nome,
      intro:`<h2>${p.nome}</h2>${fraseCard(p.frase)}<p class="lead">${p.intro}</p>`,
      campos: pilar(p.pre, p.frases, p.anc)
    })),
    { titulo:'Para encerrar', intro:'<h2>Para encerrar</h2>',
      campos:[ { id:'duas_palavras', label:'Duas palavras que definem o seu emocional e o seu posicionamento hoje.', tipo:'text' } ] }
  ],
  fim:`<h1>Obrigada por se dar essa pausa.</h1>
    <p class="lead">Suas respostas chegaram até mim. Abaixo está o seu Termômetro Mente Serena: um primeiro retrato de cada pilar, que vamos aprofundar juntas na sua devolutiva.</p>`,
  msgZap: n => preencher(MENSAGENS.avisarFim.serena, { nome:n })
};

const TESTES = { serena:TESTE_SERENA };   // Esquemas e TDAH entram abaixo, montados com as perguntas do banco

/* ---------- Mente Serena: textos do resultado (copiado do site antigo) ---------- */
const EXPLICA_PILARES = {
  'Essência Serena':'Olha para a menina que você foi: o quanto se sentiu segura, acolhida e livre para ser quem era. É a base emocional sobre a qual a mulher de hoje foi construída.',
  'Mulher Segura':'Mostra a sua autoconfiança e autonomia: decidir por si, dizer não sem culpa, reconhecer o próprio valor e ter força para se afastar do que é tóxico.',
  'Amor-próprio':'Mostra como você tem tratado a si mesma: se perdoar, se priorizar, cuidar do corpo e acolher a própria história sem comparação.',
  'Organização da Mente':'Fala do ritmo dos seus pensamentos: presença, pausas conscientes, sono que renova e clareza para separar o problema real do cenário criado pela ansiedade.',
  'Espiritualidade':'Fala da sua conexão com Deus e com o seu propósito: confiar, soltar o controle e encontrar paz e direção para as suas escolhas.',
  'Regulação Emocional':'Mostra a sua capacidade de governar as reações diante da raiva, da frustração e do estresse, e de se expressar com firmeza sem perder o equilíbrio.',
  'Posicionamento':'Mostra a sua postura nos papéis da vida (profissional, mãe, parceira) e na relação com o dinheiro: firmeza, limites e protagonismo.'
};
const NIVEL_PILAR = v => v>=7 ? {cls:'verde', txt:'Sinal verde', ler:'Este pilar é uma força presente na sua vida.'}
  : v>=4 ? {cls:'amarelo', txt:'Em fortalecimento', ler:'Você já tem recursos aqui, e este pilar pode crescer com atenção.'}
  : {cls:'vermelho', txt:'Sinal de alerta', ler:'Este pilar pede cuidado e será um ponto importante da sua jornada.'};

/* ---------- Mente Serena: pontuação (copiado do site antigo) ---------- */
function pontuarSerena(r){
  return PILARES_SERENA.map(p=>{
    let s=0; for(let i=1;i<=7;i++) s+=Number(r[p.pre+i])||0;
    return { nome:p.nome, valor:Math.round(s/7*2*10)/10, max:10 };
  });
}

/* ============================================================================
   LIGAÇÃO COM A PÁGINA: telas da cliente
   (o resto do arquivo é o código do site antigo; esta parte só o encaixa no modelo da página)
   ============================================================================ */
const MI_TESTES = ['serena', 'esquemas', 'tdah'];
const MI_ROT = { serena:'Diagnóstico Mente Serena', esquemas:'Esquemas e Necessidades Emocionais', tdah:'Escala de TDAH (ETDAH-AD)' };
const MI_SUB = { serena:'7 pilares · mapa em teia', esquemas:'5 partes · modelo de Young', tdah:'69 frases · triagem' };
/* testes deste arquivo que a página da terapeuta tem ligados */
function miLista(){ const d = window.__T && __T.dados; return d && Array.isArray(d.testes) ? MI_TESTES.filter(k => d.testes.indexOf(k) > -1) : []; }

let estado = null;   // { codigo, teste, passo, r:{} }   (guarda o progresso da pessoa neste aparelho)
const chaveRascunho = c => 't_' + (window.T_SLUG || '') + '_mi_' + c;

/* o tema (cores e letras) do Mente Serena é próprio; os outros usam as cores da página */
function tema(t){ const v = t === 'serena' ? 'serena' : 'travas'; RAIZES.forEach(r => { if(r.host) r.host.dataset.tema = v; }); miFundoCorpo(); }
function miFundoCorpo(){
  const ativo = ['tela-mi-teste', 'tela-mi-fim'].some(id => { const t = document.getElementById(id); return t && t.classList.contains('ativa'); });
  document.body.classList.toggle('mi-fundo-serena', !!(ativo && estado && estado.teste === 'serena'));
}
function mostrar(id){ mostrarTela('#tela-mi-' + (id === 'tela-fim' ? 'fim' : 'teste')); }

function miRaiz(host, html){
  const sr = host.attachShadow({ mode:'open' });
  sr.innerHTML = '<style>' + MI_CSS + '</style>' + html;
  RAIZES.push(sr);
  return sr;
}
function miMontarTelas(){
  if(document.getElementById('tela-mi-teste')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-mi-teste"><button class="voltar" id="mi-sair" type="button">← Voltar ao início (o seu progresso fica salvo)</button><div id="mi-host-teste"></div></section>
<section class="tela" id="tela-mi-fim"><div id="mi-host-fim"></div></section>`);
  miRaiz(document.getElementById('mi-host-teste'), `
    <div class="banner"><img id="banner-teste" alt=""></div>
    <div class="topo-teste" id="topo-teste">
      <div class="linha"><span id="nome-teste"></span><span id="passo-teste"></span></div>
      <div class="barra"><i id="barra-teste"></i></div>
    </div>
    <div class="folha" id="folha-teste"></div>`);
  miRaiz(document.getElementById('mi-host-fim'), `
    <div class="banner"><img id="banner-fim" alt=""></div>
    <div class="folha surge" id="folha-fim"></div>`);
  document.getElementById('mi-sair').addEventListener('click', () => { document.title = miTituloPagina(); mostrarTela('#tela-capa'); });
  if('MutationObserver' in window) ['tela-mi-teste', 'tela-mi-fim'].forEach(id => new MutationObserver(miFundoCorpo).observe(document.getElementById(id), { attributes:true, attributeFilter:['class'] }));
}
function miTituloPagina(){ return 'Testes de autoconhecimento' + (window.T_NOME ? ' · ' + T_NOME : ''); }

function iniciarTeste(codigo, chave, cliente){
  const salvo = guardar.get(chaveRascunho(codigo));
  estado = (salvo && salvo.teste===chave) ? salvo : { codigo, teste:chave, passo:0, r:{} };
  if(!salvo && cliente){
    if(ehNovo(chave)) estado.r.nome = cliente; else estado.r.chamada = cliente.split(' ')[0];
  }
  const T = TESTES[chave];
  tema(chave);
  $('#banner-teste').src = BANNERS[chave];
  $('#banner-teste').alt = chave==='serena' ? 'Mente Serena, Mentoria Feminina Neurocomportamental' : 'Consultório Terapêutico ' + CONFIG.NOME;
  $('#nome-teste').textContent = T.nome;
  document.title = T.nome + ' | ' + CONFIG.NOME;
  mostrar('tela-teste');
  renderPasso(!!salvo && salvo.passo>0);
}
/* chamado pela capa quando o código é de um destes testes */
async function miEntrar(codigo, r){
  miMontarTelas();
  try{ if(ehNovo(r.teste)) await prepararTesteNovo(codigo, r.teste); }
  catch(err){ try{ avisar('#aviso-codigo', err.message); }catch(e){} return; }
  iniciarTeste(codigo, r.teste, r.cliente);
}
/* o código digitado na capa não é do Teste de Travas: confere se é de um dos testes desta terapeuta (testes_codigos) */
async function miValidar(codigo){
  const lista = miLista(); if(!lista.length) return null;
  if(!/^[A-Z0-9]{2}-[A-Z0-9]{4}$/.test(codigo)) return null;
  let r; try{ r = await clienteMembros().rpc('testes_validar_codigo', { p_codigo:codigo }); }catch(e){ return null; }
  const d = r && r.data; if(!d || d.ok !== true || lista.indexOf(d.teste) < 0) return null;
  return { ok:true, teste:d.teste, tipo:'individual', mostrar:true, urgencia:false, cliente:d.cliente || '', compartilhado:false, duracao:30 };
}

/* ---------- motor das etapas (campos, validação, envio) (copiado do site antigo) ---------- */
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const DDDS = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,68,69,71,73,74,75,77,79,81,82,83,84,85,86,87,88,89,91,92,93,94,95,96,97,98,99];
const semAcento = t => String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let CIDADES = null, CIDADES_PROMESSA = null;

function carregarCidades(){
  if(CIDADES) return Promise.resolve(CIDADES);
  if(CIDADES_PROMESSA) return CIDADES_PROMESSA;
  CIDADES_PROMESSA = (async ()=>{
    let lista = guardar.get('ibge_cidades_v1');
    if(!Array.isArray(lista) || lista.length < 5000){
      const r = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado');
      if(!r.ok) throw new Error('IBGE indisponível');
      const j = await r.json();
      lista = j.map(m=>{
        const n = m['municipio-nome'] || m.nome;
        const uf = m['UF-sigla'] || (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF.sigla)
          || (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria'].UF.sigla);
        return n && uf ? n + '|' + uf : null;
      }).filter(Boolean);
      if(lista.length < 5000) throw new Error('Lista incompleta');
      guardar.set('ibge_cidades_v1', lista);
    }
    CIDADES = lista.map(x=>{ const [n,uf] = x.split('|'); const rot = n + ' - ' + uf; return { rot, n:semAcento(n), k:semAcento(n + ' ' + uf) }; });
    return CIDADES;
  })();
  CIDADES_PROMESSA.catch(()=>{ CIDADES_PROMESSA = null; });
  return CIDADES_PROMESSA;
}
function buscarCidades(txt){
  const q = semAcento(txt).replace(/[-,\/]/g,' ').replace(/\s+/g,' ').trim();
  if(q.length < 2) return [];
  const comeco = [], palavra = [], meio = [];
  for(const c of CIDADES){
    if(c.n.startsWith(q) || c.k.startsWith(q)) comeco.push(c);
    else if((' ' + c.k).includes(' ' + q)) palavra.push(c);
    else if(c.k.includes(q)) meio.push(c);
  }
  comeco.sort((a,b)=>a.n.length-b.n.length || a.rot.localeCompare(b.rot));
  return comeco.concat(palavra, meio).slice(0, 8);
}
function ligarCidade(campo, c){
  const inp = campo.querySelector('[data-cidade]');
  const ul = campo.querySelector('.auto-lista');
  const alt = campo.querySelector('.auto-alt');
  let itens = [], ativo = -1;
  const fechar = ()=>{ ul.classList.add('oculto'); inp.setAttribute('aria-expanded','false'); ativo = -1; };
  const escolher = rot=>{
    inp.value = rot; estado.r[c.id] = rot; fechar();
    campo.classList.remove('faltando'); salvarRascunho();
  };
  const desenhar = ()=>{
    if(!CIDADES){ ul.innerHTML = '<li class="auto-info">Carregando as cidades…</li>'; ul.classList.remove('oculto'); return; }
    itens = buscarCidades(inp.value);
    if(!itens.length){
      ul.innerHTML = semAcento(inp.value).trim().length>=2 ? '<li class="auto-info">Nenhuma cidade encontrada. Confira a grafia.</li>' : '';
      ul.classList.toggle('oculto', !ul.innerHTML); return;
    }
    ul.innerHTML = itens.map((it,i)=>{ const [n,uf] = it.rot.split(' - '); return `<li role="option" id="op-cid-${i}" data-i="${i}" class="${i===ativo?'ativo':''}" aria-selected="${i===ativo}">${esc(n)} <span>${uf}</span></li>`; }).join('');
    ul.classList.remove('oculto'); inp.setAttribute('aria-expanded','true');
  };
  const ativarFallback = ()=>{
    campo.querySelector('.auto').classList.add('oculto');
    alt.classList.remove('oculto');
    campo.querySelector('.ajuda').textContent = 'Escolha o estado e escreva o nome da sua cidade.';
    const sel = alt.querySelector('select'), txt = alt.querySelector('input');
    const juntar = ()=>{ estado.r[c.id] = (sel.value && txt.value.trim().length>=2) ? txt.value.trim() + ' - ' + sel.value : ''; salvarRascunho(); };
    sel.addEventListener('change', juntar); txt.addEventListener('input', juntar);
  };
  inp.addEventListener('focus', ()=>{
    if(CIDADES) return;
    carregarCidades().then(()=>{ if(inp.getRootNode().activeElement===inp) desenhar(); }).catch(ativarFallback);
  });
  inp.addEventListener('input', ()=>{
    estado.r[c.id] = '';
    if(CIDADES){
      const exato = CIDADES.find(x=>semAcento(x.rot)===semAcento(inp.value).replace(/\s*-\s*/,' - ').trim());
      if(exato) estado.r[c.id] = exato.rot;
    }
    ativo = -1; desenhar(); salvarRascunho();
  });
  inp.addEventListener('keydown', e=>{
    if(ul.classList.contains('oculto') || !itens.length) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); ativo = (ativo+1) % itens.length; desenhar(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); ativo = (ativo-1+itens.length) % itens.length; desenhar(); }
    else if(e.key==='Enter'){ e.preventDefault(); escolher(itens[Math.max(0,ativo)].rot); }
    else if(e.key==='Escape'){ fechar(); }
  });
  ul.addEventListener('mousedown', e=>{ const li = e.target.closest('li[data-i]'); if(li){ e.preventDefault(); escolher(itens[+li.dataset.i].rot); } });
  inp.addEventListener('blur', ()=>setTimeout(fechar, 120));
}

function formatarZap(v){
  const d = String(v||'').replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'').slice(0,11);
  if(d.length <= 2) return d.length ? '(' + d : '';
  if(d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function erroZap(v){
  const d = String(v||'').replace(/\D/g,'');
  if(!d) return 'Responda esta pergunta para continuar.';
  if(d.length < 11) return 'Número incompleto. Digite o DDD e os 9 dígitos do celular, ex.: (98) 98888-7777.';
  if(!DDDS.includes(+d.slice(0,2))) return 'Esse DDD não existe. Confira os dois primeiros números.';
  if(d[2] !== '9') return 'Número de celular começa com 9 depois do DDD, ex.: (98) 98888-7777.';
  return '';
}

const ICONES = {
  coracao:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  estrela:'<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>',
  joinha:'<path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z"/>'
};
function pintarIcones(grupo){
  const v = Number((grupo.querySelector('input:checked')||{}).value||0);
  grupo.querySelectorAll('label').forEach(l=>l.classList.toggle('cheio', Number(l.querySelector('input').value) <= v));
}
function salvarRascunho(){ if(estado) guardar.set(chaveRascunho(estado.codigo), estado); }

function renderCampo(c){
  const v = estado.r[c.id];
  const obrig = c.opcional ? '' : '<span class="obrig" aria-hidden="true"> *</span>';
  const num = c.num ? `<span class="num">${esc(c.num)}.</span>` : '';
  const erro = `<div class="erro" id="erro-${c.id}">Responda esta pergunta para continuar.</div>`;
  if(c.tipo==='escala'){
    const n = c.max-c.min+1, nm = Math.ceil(n/2);
    let bolas='';
    for(let i=c.min;i<=c.max;i++){
      const marcado = String(v)===String(i);
      const cheio = c.icone && v && i<=Number(v);
      bolas += c.icone
        ? `<label class="${cheio?'cheio':''}"><input type="radio" name="${c.id}" value="${i}" ${marcado?'checked':''} aria-label="${i}"><small>${i}</small><svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[c.icone]}</svg></label>`
        : `<label><input type="radio" name="${c.id}" value="${i}" ${marcado?'checked':''} aria-label="${i}"><span>${i}</span></label>`;
    }
    const anc = (c.rotMin||c.rotMax) ? `<div class="ancoras" aria-hidden="true"><span>${c.min} = ${esc(c.rotMin||'')}</span><span>${c.max} = ${esc(c.rotMax||'')}</span></div>` : '';
    return `<fieldset class="campo" data-campo="${c.id}"><legend>${num}${esc(c.label)}${obrig}</legend>
      <div class="escala ${c.icone?'icones':''}" role="radiogroup" style="--n:${n};--nm:${c.icone?n:(n>6?nm:n)}">${bolas}</div>${anc}${erro}</fieldset>`;
  }
  if(c.tipo==='radio' || c.tipo==='multi'){
    const tipo = c.tipo==='multi' ? 'checkbox' : 'radio';
    const marcado = o => c.tipo==='multi' ? (Array.isArray(v) && v.includes(o)) : v===o;
    let ops = c.opcoes.map(o=>`<label class="opcao"><input type="${tipo}" name="${c.id}" value="${esc(o)}" ${marcado(o)?'checked':''}><span>${esc(o)}</span></label>`).join('');
    if(c.outro){
      ops += `<label class="opcao"><input type="${tipo}" name="${c.id}" value="Outro" ${marcado('Outro')?'checked':''}><span>Outro</span></label>
        <input class="entrada ${marcado('Outro')?'':'oculto'}" id="${c.id}_outro" data-outro="${c.id}" placeholder="Escreva aqui" value="${esc(estado.r[c.id+'_outro']||'')}">`;
    }
    const dica = c.tipo==='multi' ? '<span class="dica-multi">Pode marcar mais de uma opção.</span>' : '';
    return `<fieldset class="campo" data-campo="${c.id}"><legend>${num}${esc(c.label)}${obrig}${dica}</legend><div class="opcoes">${ops}</div>${erro}</fieldset>`;
  }
  if(c.tipo==='cidade'){
    return `<div class="campo" data-campo="${c.id}"><label class="rotulo" for="f-${c.id}">${num}${esc(c.label)}${obrig}</label>
      <div class="auto">
        <input class="entrada" id="f-${c.id}" data-cidade role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="lista-${c.id}" autocomplete="off" placeholder="Digite o nome da sua cidade" value="${esc(v||'')}">
        <ul class="auto-lista oculto" id="lista-${c.id}" role="listbox"></ul>
      </div>
      <div class="auto-alt oculto">
        <select class="entrada" aria-label="Estado"><option value="">UF</option>${UFS.map(u=>`<option>${u}</option>`).join('')}</select>
        <input class="entrada" aria-label="Cidade" placeholder="Nome da cidade">
      </div>
      <small class="ajuda">Comece a digitar e toque na sua cidade na lista.</small>${erro}</div>`;
  }
  if(c.tipo==='whatsapp'){
    return `<div class="campo" data-campo="${c.id}"><label class="rotulo" for="f-${c.id}">${num}${esc(c.label)}${obrig}</label>
      <input class="entrada" id="f-${c.id}" name="${c.id}" data-zap type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="(98) 98888-7777" maxlength="15" value="${esc(v||'')}">
      <small class="ajuda">Com DDD, só os números.</small>${erro}</div>`;
  }
  const tipoInput = c.tipo==='email'?'email':c.tipo==='tel'?'tel':'text';
  const ctrl = c.tipo==='textarea'
    ? `<textarea class="entrada" id="f-${c.id}" name="${c.id}">${esc(v||'')}</textarea>`
    : `<input class="entrada" id="f-${c.id}" name="${c.id}" type="${tipoInput}" ${c.auto?`autocomplete="${c.auto}"`:''} value="${esc(v||'')}">`;
  return `<div class="campo" data-campo="${c.id}"><label class="rotulo" for="f-${c.id}">${num}${esc(c.label)}${obrig}</label>${ctrl}${erro}</div>`;
}

function renderPasso(retomando){
  const T = TESTES[estado.teste];
  const P = T.passos[estado.passo];
  const total = T.passos.length;
  const ultimo = estado.passo === total-1;
  $('#passo-teste').textContent = `Etapa ${estado.passo+1} de ${total}`;
  $('#barra-teste').style.width = ((estado.passo)/(total))*100 + '%';
  $('#folha-teste').innerHTML = `
    ${retomando?'<div class="msg info" role="status" style="margin:0 0 18px">Continuando de onde você parou.</div>':''}
    <div class="surge">${typeof P.intro==='function' ? P.intro() : (P.intro||'')}</div>
    <form id="form-passo" novalidate>${P.campos.map(renderCampo).join('')}
      <div class="acoes">
        ${estado.passo>0?'<button type="button" class="btn sec" id="btn-voltar">Voltar</button>':''}
        <button type="submit" class="btn" id="btn-avancar">${ultimo?(T.botaoFim||'Enviar e ver meu resultado'):'Continuar'}</button>
      </div>
      <div id="msg-passo"></div>
    </form>`;
  const form = $('#form-passo');
  P.campos.filter(c=>c.tipo==='cidade').forEach(c=>ligarCidade(form.querySelector(`[data-campo="${c.id}"]`), c));
  form.addEventListener('change', e=>{
    const t = e.target;
    if(t.dataset.outro){ estado.r[t.dataset.outro+'_outro'] = t.value; }
    else if(t.type==='checkbox'){
      const marc = [...form.querySelectorAll(`input[name="${t.name}"]:checked`)].map(i=>i.value);
      estado.r[t.name] = marc;
      const outroInp = RAIZ.getElementById(t.name+'_outro');
      if(outroInp){ outroInp.classList.toggle('oculto', !marc.includes('Outro')); if(t.value==='Outro' && t.checked) outroInp.focus(); }
      if(marc.length) t.closest('.campo').classList.remove('faltando');
    }
    else if(t.name){
      estado.r[t.name] = t.value;
      const outroInp = RAIZ.getElementById(t.name+'_outro');
      if(outroInp){ outroInp.classList.toggle('oculto', t.value!=='Outro'); if(t.value==='Outro') outroInp.focus(); }
      const grupo = t.closest('.escala.icones'); if(grupo) pintarIcones(grupo);
      const campo = t.closest('.campo'); if(campo && !('zap' in t.dataset)) campo.classList.remove('faltando');
    }
    salvarRascunho();
  });
  form.addEventListener('input', e=>{
    const t=e.target;
    if('zap' in t.dataset){
      const pos = t.value.length === t.selectionStart;
      t.value = formatarZap(t.value);
      if(pos) t.setSelectionRange(t.value.length, t.value.length);
      estado.r[t.name] = t.value;
      if(!erroZap(t.value)) t.closest('.campo').classList.remove('faltando');
    }
    else if(t.dataset.outro) estado.r[t.dataset.outro+'_outro']=t.value;
    else if(t.name && (t.tagName==='TEXTAREA' || (t.type!=='radio' && t.type!=='checkbox'))) estado.r[t.name]=t.value;
  });
  form.addEventListener('submit', e=>{ e.preventDefault(); avancar(); });
  const bv = $('#btn-voltar');
  if(bv) bv.addEventListener('click', ()=>{ estado.passo--; salvarRascunho(); renderPasso(); window.scrollTo(0,0); });
}

function validarPasso(){
  const P = TESTES[estado.teste].passos[estado.passo];
  let primeiro = null;
  P.campos.forEach(c=>{
    const v = estado.r[c.id];
    let msgErro = '';
    const vazio = v===undefined || v===null || (Array.isArray(v) ? v.length===0 : String(v).trim()==='');
    if(c.opcional && vazio){ const elo = RAIZ.querySelector(`[data-campo="${c.id}"]`); if(elo) elo.classList.remove('faltando'); return; }
    if(c.tipo==='whatsapp') msgErro = erroZap(v);
    else if(c.tipo==='cidade') msgErro = vazio ? 'Digite e escolha a sua cidade na lista.' : '';
    else if(vazio) msgErro = 'Responda esta pergunta para continuar.';
    else if(c.tipo==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) msgErro = 'Confira o e-mail: ele precisa ter o formato nome@exemplo.com.';
    else if(c.outro){
      const temOutro = Array.isArray(v) ? v.includes('Outro') : v==='Outro';
      if(temOutro && !String(estado.r[c.id+'_outro']||'').trim()) msgErro = 'Você marcou “Outro”: escreva qual é.';
    }
    const el = RAIZ.querySelector(`[data-campo="${c.id}"]`);
    el.classList.toggle('faltando', !!msgErro);
    if(msgErro){ el.querySelector('.erro').textContent = msgErro; if(!primeiro) primeiro = el; }
  });
  if(primeiro){ primeiro.scrollIntoView({behavior:'smooth',block:'center'}); return false; }
  return true;
}

// Junta múltipla escolha e "Outro" em texto antes de enviar para a planilha
function prepararEnvio(T, r){
  const out = { ...r };
  T.passos.forEach(P=>P.campos.forEach(c=>{
    const v = out[c.id];
    if(Array.isArray(v)) out[c.id] = v.map(x=> x==='Outro' ? 'Outro: ' + (r[c.id+'_outro']||'') : x).join(' | ');
    else if(c.outro && v==='Outro') out[c.id] = 'Outro: ' + (r[c.id+'_outro']||'');
    if(c.outro) delete out[c.id+'_outro'];
  }));
  return out;
}

async function avancar(){
  if(!validarPasso()) { msg('#msg-passo','Faltam respostas nesta etapa. Elas estão marcadas acima.'); return; }
  const T = TESTES[estado.teste];
  if(estado.passo < T.passos.length-1){
    estado.passo++;
    salvarRascunho();
    renderPasso(); window.scrollTo(0,0);
    return;
  }
  const btn = $('#btn-avancar');
  carregando(btn,true,'Enviando');
  msg('#msg-passo','');
  try{
    await api('enviarResposta',{ codigo:estado.codigo, teste:estado.teste, respostas:prepararEnvio(T, estado.r) });
    guardar.del(chaveRascunho(estado.codigo));
    telaFim();
  }catch(err){
    carregando(btn,false);
    msg('#msg-passo', err.message + ' Suas respostas continuam salvas neste aparelho.');
  }
}

/* ---------- resultado da cliente (Mente Serena) (copiado do site antigo) ---------- */
const fmt = v => String(v).replace('.',',');
function resultadoCliente(chave, r){
  if(ehNovo(chave)) return { html:'', dados:{} };
  const p = pontuarSerena(r);
  const ord = p.slice().sort((a,b)=>b.valor-a.valor);
  const fortes = ord.slice(0,2), fracos = ord.slice(-2).reverse();
  const cards = p.map(x=>{ const n = NIVEL_PILAR(x.valor); return `
    <article class="res-card">
      <header><h3>${esc(x.nome)}</h3><span class="sinal ${n.cls}">${n.txt}</span><b class="pontos">${fmt(x.valor)}<small>/10</small></b></header>
      <p>${EXPLICA_PILARES[x.nome]}</p><p class="leitura">${n.ler}</p>
    </article>`; }).join('');
  return {
    html:`<section class="resultado">
      <h2>O seu Termômetro Mente Serena</h2>
      <p class="lead">Você está mais fortalecida em <b>${fortes.map(f=>esc(f.nome)).join(' e ')}</b>. Os pilares que mais pedem cuidado agora são <b>${fracos.map(f=>esc(f.nome)).join(' e ')}</b>.</p>
      <p class="nota-res">Perto de 10, o pilar está fortalecido e a teia se expande até as bordas. Perto de 1, a mente está em “modo alerta” naquele ponto.</p>
      ${graficoTeia(p)}
      <h3 class="sub-res">O que cada pilar mostra</h3>
      <div class="res-cards">${cards}</div>
    </section>`,
    dados:{ fortes: fortes.map(f=>`${f.nome} (${fmt(f.valor)})`).join(' e '), cuidado: fracos.map(f=>`${f.nome} (${fmt(f.valor)})`).join(' e ') }
  };
}

/* ---------- tela final (copiado do site antigo) ---------- */
function telaFim(){
  const T = TESTES[estado.teste];
  const nome = (estado.r.nome || estado.r.chamada || '').trim().split(' ')[0] || 'uma cliente';
  const res = resultadoCliente(estado.teste, estado.r);
  const texto = preencher(MENSAGENS.avisarFim[estado.teste], { nome, ...res.dados });
  const link = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(texto)}`;
  const botao = `<a class="btn zap btn-envio" href="${link}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>Enviar meu resultado para a Miralene</a>`;
  $('#banner-fim').src = BANNERS[estado.teste];
  $('#banner-fim').alt = $('#banner-teste').alt;
  $('#folha-fim').innerHTML = `${T.fim}
    <div class="caixa-envio">${botao}<p>Abre o WhatsApp da Miralene com o seu resultado já escrito. É só tocar em enviar.</p></div>
    ${res.html}
    <div class="caixa-envio final"><p class="assinatura" style="margin:0 0 12px">${estado.teste==='serena'?'Vamos juntas!':'Viver e não apenas existir.'}</p>${botao}</div>`;
  mostrar('tela-fim');
}

/* ---------- Esquemas e TDAH: contas, banco, etapas e resultados (copiado do site antigo) ---------- */
/* Cálculo dos resultados dos testes Esquemas e TDAH (igual às fórmulas das planilhas da Miralene) */
const _soma = a => a.reduce((s,v)=>s+(Number(v)||0),0);
const _resp = v => v!==undefined && v!==null && String(v).trim()!=='';

/* ---------- ESQUEMAS ----------
   r: y1..y90 (YSQ), m1..m72 (estilos parentais: mãe), p1..p72 (pai), c1..c48 (YCI, compensação), v1..v40 (YRAI, evitação)
   registro (opcional, preenchido pela terapeuta): { marcas: [ ["Mãe","Pai","Terceiro"] x 18 ] } */
function pontuarEsquemas(r, def, registro){
  const [ysq, par] = def.partes;
  const esquemas = ysq.grupos.map(g=>{
    const soma = _soma(g.itens.map(i=>r['y'+i]));
    const media = soma / g.itens.length;
    return { nome:g.nome, soma, media, ativado: media >= ysq.limiar };
  });
  const media = (g, pre) => g.itens.some(i=>_resp(r[pre+i])) ? _soma(g.itens.map(i=>r[pre+i])) / g.itens.length : null;   // sem resposta = não teve essa figura
  const parentais = par.grupos.map(g=>({ nome:g.nome, mae:media(g,'m'), pai:media(g,'p') }));
  const yci  = _soma(def.partes[2].itens.map((_,k)=>r['c'+(k+1)])) / def.partes[2].itens.length;
  const yrai = _soma(def.partes[3].itens.map((_,k)=>r['v'+(k+1)])) / def.partes[3].itens.length;
  const marcas = (registro && Array.isArray(registro.marcas)) ? registro.marcas : [];
  const rne = def.rne.itens.map((it,k)=>({ ...it, marcas:(marcas[k]||[]).filter(x=>x && x!=='Nenhum') }));
  return { esquemas, parentais, yci, yrai, rne };
}

/* ---------- TDAH ----------
   r: t1..t69 (0 a 5) e escolaridade ('Ensino fundamental' | 'Ensino médio' | 'Ensino superior', ou a chave direta) */
const ESCOLARIDADE_TDAH = { 'Ensino fundamental':'fundamental', 'Ensino médio':'medio', 'Ensino superior':'superior' };
function percentilTdah(bruto, pontos){
  let p = null;
  for(const [lim, perc] of pontos){ if(bruto >= lim) p = perc; }   // maior limite que o resultado alcança
  return p===null ? 0 : p;
}
function classeTdah(p, classes){
  for(const [ate, nome] of classes){ if(p <= ate) return nome; }
  return classes[classes.length-1][1];
}
function pontuarTdah(r, def){
  const esc = ESCOLARIDADE_TDAH[r.escolaridade] || r.escolaridade;
  return def.fatores.map(f=>{
    const valor = i => { const v = Number(r['t'+i]); if(!_resp(r['t'+i]) || isNaN(v)) return 0; return f.inverso ? 5 - v : v; };
    const bruto = _soma(f.itens.map(valor));
    const perc = percentilTdah(bruto, def.normas[esc][f.sigla]);
    return { sigla:f.sigla, nome:f.nome, bruto, maximo:f.itens.length*5, percentil:perc, classe:classeTdah(perc, def.classes), inverso:!!f.inverso };
  });
}


const NOVOS = ['esquemas','tdah'];
const ehNovo = c => NOVOS.indexOf(c) !== -1;
const PREFIXO_NOVO = { esquemas:'ES', tdah:'TD', serena:'SE' };   // o Mente Serena passa a usar o mesmo molde
const LETRAS_COD = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const sorteio4 = () => { let s=''; for(let i=0;i<4;i++) s += LETRAS_COD.charAt(Math.floor(Math.random()*LETRAS_COD.length)); return s; };

TESTES.esquemas = { chave:'esquemas', nome:'Questionário de Esquemas e Necessidades Emocionais', curto:'Esquemas', passos:[] };
TESTES.tdah     = { chave:'tdah',     nome:'Escala de TDAH em adultos (ETDAH-AD)',               curto:'TDAH',     passos:[] };
BANNERS.esquemas = BANNERS.travas; BANNERS.tdah = BANNERS.travas;

MENSAGENS.envioCodigo.esquemas = `{saudacao} 🤍

Preparei o seu acesso ao *Questionário de Esquemas e Necessidades Emocionais*: um mapa mais profundo da sua história, para entendermos de onde vêm alguns padrões que se repetem na sua vida.

👉 Acesse: {link}
🔑 Seu código: *{codigo}*

São 5 partes e leva cerca de 1 hora. Você pode parar e continuar depois: o seu progresso fica salvo no aparelho. Escolha um momento tranquilo, sem pressa. Algumas frases falam de lembranças da infância e podem mexer com você; se precisar, me chame. O código é pessoal e vale para um único envio.

Quando terminar, me avise por aqui. 🌷
*Miralene Souto*`;
MENSAGENS.envioCodigo.tdah = `{saudacao} 🤍

Preparei o seu acesso à *Escala de TDAH em adultos (ETDAH-AD)*, que me ajuda a entender como funcionam a sua atenção, a sua impulsividade e a sua energia no dia a dia.

👉 Acesse: {link}
🔑 Seu código: *{codigo}*

São 69 frases e leva cerca de 15 a 20 minutos. Responda com sinceridade, pensando em como você é. Não existe resposta certa ou errada. Se precisar parar, o progresso fica salvo no aparelho. O código é pessoal e vale para um único envio.

Quando terminar, me avise por aqui. 🌷
*Miralene Souto*`;
MENSAGENS.avisarFim.esquemas = `Oi, Miralene! Aqui é {nome}. 🌷

Acabei de responder o *Questionário de Esquemas e Necessidades Emocionais* e as minhas respostas já chegaram até você. Quando podemos conversar sobre o que apareceu? 🤍`;
MENSAGENS.avisarFim.tdah = `Oi, Miralene! Aqui é {nome}. 🌷

Acabei de responder a *Escala de TDAH em adultos (ETDAH-AD)* e as minhas respostas já chegaram até você. Quando podemos conversar sobre o resultado? 🤍`;

/* ---------- conversa com o Supabase ---------- */
async function rpc(nome, args){
  let r;
  try{ r = await clienteMembros().rpc(nome, args); }
  catch(e){ throw new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.'); }
  if(r.error) throw new Error('Não foi possível concluir. Tente de novo em instantes.');
  return r.data;
}
async function idTerapeuta(){
  const { data } = await clienteMembros().auth.getSession();
  if(!data || !data.session) throw new Error('Sessão expirada. Entre de novo na área da terapeuta.');
  return data.session.user.id;
}
const _t = x => { const v = new Date(x).getTime(); return isNaN(v) ? 0 : v; };

async function apiSupabase(acao, d){
  const c = clienteMembros();
  if(acao==='validarCodigo'){
    const j = await rpc('testes_validar_codigo', { p_codigo:d.codigo });
    if(!j || !j.ok) throw new Error((j && j.erro) || 'Esse código não está valendo.');
    return { ok:true, codigo:j.codigo, teste:j.teste, cliente:j.cliente };
  }
  if(acao==='enviarResposta'){
    const j = await rpc('testes_salvar_resposta', { p_dados:{ codigo:d.codigo, teste:d.teste, respostas:d.respostas } });
    if(!j || !j.ok) throw new Error((j && (j.msg || j.erro)) || 'Não foi possível enviar agora.');
    return { ok:true };
  }
  const uid = await idTerapeuta();
  if(acao==='gerarCodigos'){
    const n = Math.max(1, Math.min(20, parseInt(d.quantidade,10) || 1)), saida = [];
    for(let i=0;i<n;i++){
      let feito = false;
      for(let t=0; t<8 && !feito; t++){
        const cod = PREFIXO_NOVO[d.teste] + '-' + sorteio4();
        const { error } = await c.from('testes_codigos').insert({ terapeuta_id:uid, teste:d.teste, codigo:cod, cliente:d.cliente||null });
        if(!error){ saida.push({ codigo:cod, teste:d.teste, cliente:d.cliente||'' }); feito = true; }
        else if(error.code !== '23505') throw new Error('Não consegui gerar o código agora. Saia da área, entre de novo e tente outra vez.');
      }
      if(!feito) throw new Error('Não consegui gerar o código agora. Tente de novo.');
    }
    return { ok:true, codigos:saida };
  }
  if(acao==='listarCodigos'){
    const { data, error } = await c.from('testes_codigos').select('codigo,teste,cliente,criado_em,usado,usado_em').eq('terapeuta_id', uid).order('criado_em',{ascending:false}).limit(300);
    if(error) throw new Error('Não consegui carregar os códigos dos testes novos.');
    return { ok:true, codigos:(data||[]).map(x=>({ codigo:x.codigo, teste:x.teste, cliente:x.cliente||'', criadoEm:x.criado_em, situacao:x.usado?'Usado':'Disponível', usadoEm:x.usado_em||'' })) };
  }
  if(acao==='listarRespostas'){
    const { data, error } = await c.from('testes_respostas').select('id,teste,codigo,nome,dados,criado_em').eq('terapeuta_id', uid).order('criado_em',{ascending:false}).limit(300);
    if(error) throw new Error('Não consegui carregar as respostas dos testes novos.');
    return { ok:true, respostas:(data||[]).map(x=>({ id:'s-'+x.id, idBanco:x.id, teste:x.teste, codigo:x.codigo, nome:x.nome, data:x.criado_em, respostas:(x.dados&&x.dados.respostas)||{}, whatsapp:(x.dados&&x.dados.respostas&&x.dados.respostas.whatsapp)||'' })) };
  }
  if(acao==='cancelarCodigo'){
    const { error } = await c.from('testes_codigos').delete().eq('codigo', d.codigo).eq('terapeuta_id', uid);
    if(error) throw new Error('Não consegui cancelar o código.');
    return { ok:true };
  }
  throw new Error('Ação desconhecida.');
}

const api = (acao, d={}) => apiSupabase(acao, d);   // tudo vai para o Supabase (testes_codigos, testes_respostas)

/* ---------- definições (perguntas e normas) ---------- */
const DEFS = {};
async function carregarDefinicaoTerapeuta(chave){
  if(DEFS[chave]) return DEFS[chave];
  const j = await rpc('testes_definicao', { p_teste:chave });
  if(!j || !j.ok) throw new Error((j && j.erro) || 'Não consegui carregar o teste.');
  return (DEFS[chave] = j.definicao);
}
async function prepararTesteNovo(codigo, chave){
  const j = await rpc('testes_itens', { p_codigo:codigo });
  if(!j || !j.ok) throw new Error((j && j.erro) || 'Não consegui abrir o teste agora. Tente de novo.');
  TESTES[chave] = chave==='esquemas' ? construirEsquemas(j.definicao) : construirTdah(j.definicao);
}

/* ---------- montagem dos passos da cliente ---------- */
function blocosDe(total, tam){ const out=[]; for(let i=1;i<=total;i+=tam) out.push([i, Math.min(total, i+tam-1)]); return out; }
function camposEscala(prefixo, itens, a, b, min, max, rotMin, rotMax, opcional){
  const cs = [];
  for(let i=a;i<=b;i++) cs.push({ id:prefixo+i, num:String(i), label:itens[i-1], tipo:'escala', min, max, rotMin, rotMax, opcional:!!opcional });
  return cs;
}
function legendaEscala(rotulos, ini, aberta){
  return `<details class="legenda-escala" ${aberta?'open':''}><summary>O que significa cada número</summary><ol start="${ini}">${rotulos.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></details>`;
}
function adaptarInstrucao(t){
  return String(t||'')
    .replace('Escreva o número da resposta no respectivo espaço em branco.', 'Toque no número que corresponde à sua resposta.')
    .replace('colocando o respectivo número no espaço em branco', 'marcando o respectivo número')
    .replace('por favo,', 'por favor,')
    .replace('Se não teve pai ou mãe, deixe a coluna correspondente em branco.', 'Se você não teve pai ou mãe (nem alguém que cumprisse esse papel), pode deixar essa parte em branco: é só tocar em Continuar.')
    .replace(/^INSTRUÇÕES:\s*/, '');
}

function construirEsquemas(def){
  const [ysq, par, yci, yrai] = def.partes;
  const passos = [];
  passos.push({
    titulo:'Boas-vindas',
    intro:`<h1>Questionário de Esquemas e Necessidades Emocionais</h1>
      <p class="lead">Este é um mapa mais profundo da sua história: ele ajuda a entender de onde vêm alguns padrões que se repetem na sua vida e quais necessidades emocionais ficaram sem resposta na infância.</p>
      <p>São <b>5 partes</b> e leva cerca de <b>1 hora</b>. Você pode parar quando quiser e continuar depois: o seu progresso fica salvo neste aparelho.</p>
      <p>Algumas frases falam de lembranças e de relações difíceis. Vá no seu ritmo e responda com sinceridade, sem se julgar. Se alguma coisa mexer muito com você, pare e fale com a Miralene.</p>
      <p>Escolha um lugar tranquilo e, antes de começar, respire fundo três vezes.</p>`,
    campos:[
      { id:'nome', label:'Seu nome completo', tipo:'text', auto:'name' },
      { id:'idade', label:'Sua idade', tipo:'text' },
      { id:'estado_civil', label:'Estado civil', tipo:'radio', opcoes:['Solteiro(a)','Casado(a) ou em união estável','Separado(a) ou divorciado(a)','Viúvo(a)'] },
      { id:'escolaridade', label:'Escolaridade (o que você está cursando ou já concluiu)', tipo:'text' },
      { id:'profissao', label:'Profissão', tipo:'text' }
    ]
  });
  const parte = (num, titulo, p, prefixo, tam, nota, opcional, instrucao) => {
    const bl = blocosDe(p.itens.length, tam);
    bl.forEach(([a,b], k)=>{
      passos.push({
        titulo:`Parte ${num} · ${titulo}`,
        intro:`<h2>Parte ${num} de 5 · ${titulo}</h2><p class="meta-bloco">Bloco ${k+1} de ${bl.length}</p>
          ${k===0 && instrucao ? `<p>${esc(adaptarInstrucao(instrucao))}</p>` : ''}${nota||''}${legendaEscala(p.rotulos, 1, k===0)}`,
        campos:camposEscala(prefixo, p.itens, a, b, 1, 6, 'Completamente falso', 'Descreve-me perfeitamente', opcional)
      });
    });
  };
  parte(1, 'Esquemas (YSQ)', ysq, 'y', 15, '', false, ysq.instrucao);
  parte(2, 'Estilos parentais: a sua MÃE', par, 'm', 12,
        '<p class="nota-bloco">Pense na sua <b>mãe</b> (ou em quem cumpriu esse papel) quando você era criança. Se você não teve essa figura, pode deixar em branco e tocar em Continuar.</p>', true, par.instrucao);
  parte(3, 'Estilos parentais: o seu PAI', par, 'p', 12,
        '<p class="nota-bloco">Agora pense no seu <b>pai</b> (ou em quem cumpriu esse papel) quando você era criança. Se você não teve essa figura, pode deixar em branco e tocar em Continuar.</p>', true, '');
  parte(4, 'Formas de enfrentamento: compensação (YCI)', yci, 'c', 12, '', false, yci.instrucao);
  parte(5, 'Formas de enfrentamento: evitação (YRAI)', yrai, 'v', 10, '', false, yrai.instrucao);
  return {
    chave:'esquemas', nome:TESTES.esquemas.nome, curto:'Esquemas', passos, botaoFim:'Enviar as minhas respostas',
    fim:`<h1>Obrigada por responder com tanta verdade.</h1>
      <p class="lead">As suas respostas chegaram até mim. Vou analisá-las com cuidado e, juntas, vamos conversar sobre o que apareceu e como cuidar disso. Nada aqui é um julgamento: é um mapa para a nossa conversa.</p>`,
    msgZap: n => preencher(MENSAGENS.avisarFim.esquemas, { nome:n })
  };
}

function construirTdah(def){
  const rot = def.rotulos, total = def.itens.length, bl = blocosDe(total, 12), passos = [];
  passos.push({
    titulo:'Boas-vindas',
    intro:`<h1>Escala de TDAH em adultos (ETDAH-AD)</h1>
      <p class="lead">Este questionário me ajuda a entender como funcionam a sua atenção, a sua impulsividade e a sua energia no dia a dia.</p>
      <p>São <b>${total} frases</b> e leva cerca de <b>15 a 20 minutos</b>. Leia cada uma e marque com que frequência ela descreve você. Não existe resposta certa ou errada.</p>
      <p>Ele é uma <b>triagem</b> que apoia a avaliação: <b>não é um diagnóstico</b>. A leitura do resultado é feita por mim, junto com você.</p>`,
    campos:[
      { id:'nome', label:'Seu nome completo', tipo:'text', auto:'name' },
      { id:'idade', label:'Sua idade', tipo:'text' },
      { id:'escolaridade', label:'Escolaridade (marque o que você está cursando ou já concluiu)', tipo:'radio', opcoes:['Ensino fundamental','Ensino médio','Ensino superior'] }
    ]
  });
  bl.forEach(([a,b],k)=>{
    passos.push({
      titulo:`Bloco ${k+1}`,
      intro:`<h2>Bloco ${k+1} de ${bl.length}</h2>${k===0?'<p>Para cada frase, marque com que frequência ela descreve você.</p>':''}${legendaEscala(rot, 0, k===0)}`,
      campos:camposEscala('t', def.itens, a, b, 0, 5, rot[0], rot[5], false)
    });
  });
  return {
    chave:'tdah', nome:TESTES.tdah.nome, curto:'TDAH', passos, botaoFim:'Enviar as minhas respostas',
    fim:`<h1>Obrigada por responder.</h1>
      <p class="lead">As suas respostas chegaram até mim. Vou analisá-las com cuidado e vamos conversar sobre o resultado juntas. Lembre-se: este questionário é uma triagem para apoiar a nossa conversa, não um diagnóstico.</p>`,
    msgZap: n => preencher(MENSAGENS.avisarFim.tdah, { nome:n })
  };
}

/* ---------- resultados na área da terapeuta ---------- */
const PAR_DO_YSQ  = [0,1,2,null,5,6,4,3,12,7,8,14,9,10,11,16,13,15];          // esquema do YSQ -> estilo parental correspondente
const YSQ_DO_RNE  = [1,2,0,4,3,8,7,5,6,13,14,9,10,15,17,11,12,16];            // item do RNE -> esquema do YSQ
const fmtN = v => (Math.round(v*100)/100).toFixed(2).replace('.',',');
const corYsq = v => v>=4 ? '#8C2F35' : v>=3 ? '#C9806C' : '#E6C2B2';
function barraGraf(nome, v, max, cor, txt, limiar, top){
  const pct = Math.max(0, Math.min(100, v/max*100)).toFixed(1);
  return `<div class="barra-trava ${top?'top':''}"><span class="nome">${esc(nome)}</span><span class="trilho">${limiar?`<b class="limiar" style="left:${(limiar/max*100).toFixed(1)}%"></b>`:''}<i style="width:${pct}%;background:${cor}"></i></span><span class="val">${txt}</span></div>`;
}
function barraDupla(nome, mae, pai, semMae, semPai){
  const una = (v, cor, rot, sem) => sem ? '' : (v==null ? `<span class="sem">${rot}: não respondeu</span>`
    : `<span class="uma"><span class="trilho"><i style="width:${(v/6*100).toFixed(1)}%;background:${cor}"></i></span><em>${rot} ${fmtN(v)}</em></span>`);
  return `<div class="barra-dupla"><span class="nome">${esc(nome)}</span><div>${una(mae,'#B5575F','Mãe',semMae)}${una(pai,'#5B7FA6','Pai',semPai)}</div></div>`;
}
function htmlGeral(P, def){
  const rneDoYsq = {}; YSQ_DO_RNE.forEach((yi,k)=>{ rneDoYsq[yi] = P.rne[k]; });
  const linhas = Object.keys(def.dominios).map(d=>
    `<tr class="dom"><td colspan="5">${esc(d)}</td></tr>` + def.dominios[d].map(nome=>{
      const i = P.esquemas.findIndex(e=>e.nome===nome); if(i<0) return '';
      const e = P.esquemas[i], pi = PAR_DO_YSQ[i], pr = pi==null ? null : P.parentais[pi], rn = rneDoYsq[i];
      const cel = v => v==null ? '<td class="mudo">–</td>' : `<td>${fmtN(v)}</td>`;
      return `<tr><td>${esc(nome)}</td><td><b style="color:${e.ativado?'#8C2F35':'inherit'}">${fmtN(e.media)}</b>${e.ativado?' <span class="sinal vermelho">Ativado</span>':''}</td>${cel(pr&&pr.mae)}${cel(pr&&pr.pai)}
        <td>${rn && rn.marcas.length ? `<small>${esc(rn.necessidade)}</small><br><b>${esc(rn.marcas.join(', '))}</b>` : '<span class="mudo">–</span>'}</td></tr>`;
    }).join('')).join('');
  return `<table class="notas geral"><thead><tr><th>Esquema</th><th>YSQ (1 a 6)</th><th>Mãe</th><th>Pai</th><th>Necessidade não atendida (RNE)</th></tr></thead><tbody>${linhas}</tbody></table>`;
}
function formRne(def, registro){
  const pess = (registro && registro.pessoas) || [], marcas = (registro && registro.marcas) || [];
  const cab = [0,1,2].map(i=>{ const p = pess[i]||{}; return `<div class="rne-pessoa"><h4>Pessoa significativa ${i+1}</h4>
      <label>Nome<input class="entrada" id="rne-nome-${i}" value="${esc(p.nome||'')}"></label>
      <label>Idade aproximada<input class="entrada" id="rne-idade-${i}" value="${esc(p.idade||'')}"></label>
      <label>Síntese da cena<textarea class="entrada" id="rne-cena-${i}">${esc(p.cena||'')}</textarea></label></div>`; }).join('');
  let dom = '';
  const linhas = def.rne.itens.map((it,k)=>{
    const m = marcas[k]||[];
    const cab = it.dominio!==dom ? (dom=it.dominio, `<h4 class="rne-dom">Domínio ${it.dominio}</h4>`) : '';
    return `${cab}<div class="rne-linha"><span class="amb">${esc(it.ambiente)}<small>${esc(it.necessidade)}</small></span>
      <span class="chk">${['Mãe','Pai','Terceiro'].map(q=>`<label><input type="checkbox" data-rne="${k}" value="${q}" ${m.includes(q)?'checked':''}> ${q}</label>`).join('')}</span></div>`;
  }).join('');
  return `<section class="rne"><h2>${esc(def.rne.titulo)}</h2><p class="meta-bloco">${esc(def.rne.subtitulo)} · preenchido por você na sessão</p>
    <div class="rne-pessoas">${cab}</div><h3>Necessidades emocionais não atendidas</h3><p class="meta-bloco">Marque quem criou cada tipo de ambiente.</p>${linhas}
    <div class="nao-imprimir" style="margin-top:14px"><button class="btn peq" id="btn-salvar-rne">Salvar registro</button> <span id="msg-rne"></span></div></section>`;
}

let DETALHE_NOVO = null;
async function carregarRegistro(reg){
  try{
    const { data } = await clienteMembros().from('testes_registros').select('dados').eq('resposta_id', reg.idBanco).maybeSingle();
    return data ? data.dados : null;
  }catch(e){ return null; }
}
async function detalheNovo(reg){
  try{
    const def = await carregarDefinicaoTerapeuta(reg.teste);
    return reg.teste==='tdah' ? detalheTdah(reg, def) : detalheEsquemas(reg, def, await carregarRegistro(reg));
  }catch(err){
    DETALHE_NOVO = null;
    return { resumo:`<div class="msg erro" role="alert">${esc(err.message)}</div>`, grafico:'' };
  }
}
function ident(r, campos){
  return `<dl class="ident">${campos.filter(([k])=>r[k]).map(([k,rot])=>`<div class="par"><dt>${rot}</dt><dd>${esc(r[k])}</dd></div>`).join('')}</dl>`;
}
function detalheEsquemas(reg, def, registro){
  const r = reg.respostas||{}, P = pontuarEsquemas(r, def, registro);
  DETALHE_NOVO = { reg, def, P };
  const ativ = P.esquemas.filter(e=>e.ativado);
  const semMae = P.parentais.every(p=>p.mae==null), semPai = P.parentais.every(p=>p.pai==null);
  const resumo = `${ident(r,[['idade','Idade'],['estado_civil','Estado civil'],['escolaridade','Escolaridade'],['profissao','Profissão']])}
    <p class="lead">${ativ.length ? `Esquemas ativados (média 4 ou mais): <b>${ativ.map(e=>esc(e.nome)).join(', ')}</b>.` : 'Nenhum esquema chegou à média 4 (limiar de ativação) neste questionário.'}</p>`;
  const ysq = Object.keys(def.dominios).map(d=>`<h3 class="dom-t">${esc(d)}</h3><div class="barras">${def.dominios[d].map(n=>{ const e = P.esquemas.find(x=>x.nome===n); return e ? barraGraf(n, e.media, 6, corYsq(e.media), fmtN(e.media), 4, e.ativado) : ''; }).join('')}</div>`).join('');
  const grafico = `<h2>Esquemas (YSQ)</h2><p class="meta-bloco">Média das 5 afirmações de cada esquema (de 1 a 6). A linha marca 4: a partir dela o esquema é considerado ativado.</p>${ysq}
    <div class="legenda"><span><i style="background:#8C2F35"></i>4 a 6: ativado</span><span><i style="background:#C9806C"></i>3 a 3,99</span><span><i style="background:#E6C2B2"></i>abaixo de 3</span></div>
    <h2>Estilos parentais</h2><p class="meta-bloco">Média por estilo (de 1 a 6), separado por mãe e pai.${semMae?' <b>Mãe: esta parte foi deixada em branco.</b>':''}${semPai?' <b>Pai: esta parte foi deixada em branco.</b>':''}</p>
    <div class="duplas">${P.parentais.map(p=>barraDupla(p.nome, p.mae, p.pai, semMae, semPai)).join('')}</div>
    <h2>Formas de enfrentamento</h2><p class="meta-bloco">Média geral de cada inventário (de 1 a 6).</p>
    <div class="barras">${barraGraf('YCI · Compensação', P.yci, 6, '#7B4529', fmtN(P.yci))}${barraGraf('YRAI · Evitação', P.yrai, 6, '#5B7FA6', fmtN(P.yrai))}</div>
    <h2>Resultado geral</h2><p class="meta-bloco">Reúne esquema, estilos parentais e necessidades não atendidas (as marcações do RNE abaixo aparecem aqui).</p>
    <div id="geral-esq">${htmlGeral(P, def)}</div>
    ${formRne(def, registro)}`;
  return { resumo, grafico };
}
const corTdah = c => ({ 'Inferior':'#BBD5C3', 'Média Inferior':'#D6E2C8', 'Média':'#EADFC4', 'Média Superior':'#E6A97A', 'Superior':'#B23A2F', '+ Superior':'#7E1F27' }[c] || '#CCC');
function detalheTdah(reg, def){
  const r = reg.respostas||{}, P = pontuarTdah(r, def);
  DETALHE_NOVO = null;
  const resumo = `${ident(r,[['idade','Idade'],['escolaridade','Escolaridade (normas usadas)']])}
    <p class="lead">Resultado de <b>triagem</b>: o percentil compara a pessoa com o grupo de referência da mesma escolaridade. <b>Não é um diagnóstico</b>; a interpretação cabe ao profissional.</p>`;
  const grafico = `<h2>Resultado por fator</h2>
    <div class="barras">${P.map(f=>barraGraf(`${f.sigla} · ${f.nome}`, f.percentil, 100, corTdah(f.classe), 'P'+f.percentil, null, f.percentil>=91)).join('')}</div>
    <div class="legenda">${def.classes.map(([,n])=>`<span><i style="background:${corTdah(n)}"></i>${esc(n)}</span>`).join('')}</div>
    <table class="notas tdah"><thead><tr><th>Fator</th><th>Resultado bruto</th><th>Percentil</th><th>Classificação</th></tr></thead><tbody>
      ${P.map(f=>`<tr><td>${esc(f.sigla)} · ${esc(f.nome)}</td><td>${f.bruto} de ${f.maximo}</td><td>${f.percentil}</td><td><b>${esc(f.classe)}</b></td></tr>`).join('')}</tbody></table>
    <p class="meta-bloco">No fator AAMA as respostas valem de forma invertida na pontuação (padrão da escala). ${esc(def.fonte||'')}</p>`;
  return { resumo, grafico };
}
function ligarDetalheNovo(reg){
  const b = RAIZ.getElementById('btn-salvar-rne'); if(!b || !DETALHE_NOVO) return;
  b.addEventListener('click', async ()=>{
    const msgEl = RAIZ.getElementById('msg-rne'); msgEl.textContent = '';
    const pessoas = [0,1,2].map(i=>({ nome:RAIZ.getElementById('rne-nome-'+i).value.trim(), idade:RAIZ.getElementById('rne-idade-'+i).value.trim(), cena:RAIZ.getElementById('rne-cena-'+i).value.trim() }));
    const marcas = DETALHE_NOVO.def.rne.itens.map((_,k)=>[...RAIZ.querySelectorAll(`input[data-rne="${k}"]:checked`)].map(x=>x.value));
    carregando(b, true, 'Salvando');
    try{
      const uid = await idTerapeuta();
      const { error } = await clienteMembros().from('testes_registros').upsert({ resposta_id:reg.idBanco, terapeuta_id:uid, dados:{ pessoas, marcas }, atualizado_em:new Date().toISOString() });
      if(error) throw new Error('Não consegui salvar agora. Saia da área, entre de novo e tente outra vez.');
      const P2 = pontuarEsquemas(reg.respostas||{}, DETALHE_NOVO.def, { marcas });
      DETALHE_NOVO.P = P2;
      RAIZ.getElementById('geral-esq').innerHTML = htmlGeral(P2, DETALHE_NOVO.def);
      msgEl.innerHTML = '<span class="ok-salvo">Salvo ✓</span>';
    }catch(err){ msgEl.innerHTML = `<span class="msg erro">${esc(err.message)}</span>`; }
    finally{ carregando(b, false); }
  });
}

/* ---------- área da terapeuta: mensagens, links e copiar (copiado do site antigo) ---------- */
function linkCliente(codigo){
  return location.origin + location.pathname + '?t=' + encodeURIComponent(window.T_SLUG || '') + '&c=' + encodeURIComponent(codigo);   // mesmo formato do link do Teste de Travas
}
function mensagemCodigo(c){
  const primeiro = c.cliente ? c.cliente.trim().split(' ')[0] : '';
  return preencher(MENSAGENS.envioCodigo[c.teste], {
    saudacao: primeiro ? `Olá, ${primeiro}!` : 'Olá!',
    nome: primeiro, link: linkCliente(c.codigo), codigo: c.codigo
  });
}
function linkZap(c, numero){
  let n = String(numero||'').replace(/\D/g,'');
  if(n && !n.startsWith('55')) n = '55' + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(mensagemCodigo(c))}`;
}
async function copiar(texto, btn){
  try{ await navigator.clipboard.writeText(texto); }
  catch(e){ const t=document.createElement('textarea'); t.value=texto; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  const orig = btn.textContent; btn.textContent='Copiado!'; setTimeout(()=>btn.textContent=orig,1600);
}

/* ---------- área da terapeuta: gráficos (copiado do site antigo) ---------- */
function graficoTeia(pont, semValores){
  const W=800, H=700, cx=400, cy=350, R=185, n=pont.length;
  const ang = i => -Math.PI/2 + i*2*Math.PI/n;
  const pt = (i,v) => [cx + Math.cos(ang(i))*R*v/10, cy + Math.sin(ang(i))*R*v/10];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de teia do Termômetro Mente Serena">`;
  for(let k=1;k<=10;k++){
    const poli = pont.map((_,i)=>pt(i,k).map(x=>x.toFixed(1)).join(',')).join(' ');
    s += `<polygon points="${poli}" fill="none" stroke="#C8641E" stroke-opacity="${k===10?0.9:0.35}" stroke-width="${k===10?1.6:1}"/>`;
  }
  pont.forEach((_,i)=>{ const [x,y]=pt(i,10); s+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E7B08A" stroke-width="1"/>`; });
  const val = pont.map((p,i)=>pt(i,Math.max(0,Math.min(10,p.valor))).map(x=>x.toFixed(1)).join(',')).join(' ');
  s += `<polygon points="${val}" fill="#F07F2A" fill-opacity=".88" stroke="#C2571A" stroke-width="2" stroke-linejoin="round" style="filter:drop-shadow(0 3px 6px rgba(150,70,10,.35))"/>`;
  for(let k=0;k<=10;k++) s += `<text x="${cx-7}" y="${(cy - R*k/10 + 6).toFixed(1)}" text-anchor="end" font-family="Montserrat,Arial" font-size="17" font-weight="700" fill="#7B4529">${k}</text>`;
  pont.forEach((p,i)=>{
    const a = ang(i), [x,y] = [cx+Math.cos(a)*(R+20), cy+Math.sin(a)*(R+20)];
    const anchor = Math.abs(Math.cos(a))<0.2 ? 'middle' : (Math.cos(a)>0?'start':'end');
    const palavras = p.nome.toUpperCase().split(' ');
    const linhas = palavras.length>2 ? [palavras.slice(0,2).join(' '), palavras.slice(2).join(' ')] : (p.nome.length>10 && palavras.length===2 ? palavras : [palavras.join(' ')]);
    const L = linhas.length + (semValores?0:1);
    const y0 = Math.sin(a)<-0.5 ? y - (L-1)*28 - 6 : Math.sin(a)>0.5 ? y + 22 : y - (L-1)*14 + 8;
    s += `<text x="${x.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="${anchor}" font-family="Montserrat,Arial" font-size="23" font-weight="700" fill="#7B4529">${linhas.map((l,j)=>`<tspan x="${x.toFixed(1)}" dy="${j?27:0}">${esc(l)}</tspan>`).join('')}${semValores?'':`<tspan x="${x.toFixed(1)}" dy="29" font-size="26" font-weight="800" fill="#C2571A">${String(p.valor).replace('.',',')}</tspan>`}</text>`;
  });
  return `<div class="teia">${s}</svg></div>`;
}
const sinal = v => v>=7 ? '<span class="sinal verde">Fortalecido</span>' : v>=4 ? '<span class="sinal amarelo">Em fortalecimento</span>' : '<span class="sinal vermelho">Alerta</span>';

/* ---------- área da terapeuta: resultado de uma resposta (copiado do site antigo) ---------- */
async function abrirDetalhe(id){
  const reg = RESPOSTAS.find(r=>r.id===id); if(!reg) return;
  const T = TESTES[reg.teste], r = reg.respostas||{};
  let grafico='', resumo='';
  if(ehNovo(reg.teste)){
    const dn = await detalheNovo(reg); resumo = dn.resumo; grafico = dn.grafico;
  } else {
    const p = pontuarSerena(r);
    const fracos = p.slice().sort((a,b)=>a.valor-b.valor).slice(0,2);
    resumo = `<p class="lead">Pilares que mais pedem cuidado: <b>${fracos.map(f=>esc(f.nome)).join(' e ')}</b>.</p>`;
    grafico = `<h2>Termômetro Mente Serena</h2><p style="color:var(--suave);font-size:.9rem">Nota de cada pilar: média das 7 afirmações (1 a 5) multiplicada por 2. Perto de 10, pilar fortalecido; perto de 1, sinal de alerta.</p>
      ${graficoTeia(p)}
      <table class="notas">${p.map(x=>`<tr><td>${esc(x.nome)}</td><td>${String(x.valor).replace('.',',')}</td><td>${sinal(x.valor)}</td></tr>`).join('')}</table>
      <h3 style="margin-top:22px">Autoavaliação inicial (1 a 10)</h3>
      <div class="barras">${TERMOMETRO_INICIAL.map(t=>`<div class="barra-trava"><span class="nome">${esc(t.nome)}</span><span class="trilho"><i style="width:${(Number(r[t.id])||0)*10}%;background:#F07F2A"></i></span><span class="val">${esc(r[t.id]||'-')}</span></div>`).join('')}</div>`;
  }
  const blocos = (ehNovo(reg.teste) ? [] : T.passos).filter(P=>P.campos.length).map(P=>{
    const escalas = P.campos.filter(c=>c.tipo==='escala' && c.max<=10 && c.num);
    if(escalas.length===P.campos.length){
      return `<h3>${esc(P.titulo)}</h3><div class="notinhas">${escalas.map(c=>`<div class="notinha" title="${esc(c.label)}"><span>${esc(c.num)}. ${esc(c.label.split(':')[0].slice(0,48))}${c.label.split(':')[0].length>48?'…':''}</span><b>${esc(r[c.id]||'-')}</b></div>`).join('')}</div>`;
    }
    return `<h3>${esc(P.titulo)}</h3><dl>${P.campos.map(c=>{
      let v = r[c.id]; if(c.outro && v==='Outro') v = 'Outro: ' + (r[c.id+'_outro']||'');
      return `<div class="par"><dt>${esc(c.label)}</dt><dd>${esc(v==null||v===''?'-':v)}</dd></div>`;
    }).join('')}</dl>`;
  }).join('');
  $('#detalhe').innerHTML = `
    <div class="nao-imprimir" style="margin-bottom:16px"><button class="btn sec peq" id="btn-fechar">Voltar para a lista</button></div>
    <div class="cab-res">
      <div><h1 style="margin-bottom:4px">${esc(reg.nome||'Sem nome')}</h1>
        <div class="meta">${esc(T.nome)}<br>${dataBR(reg.data)} • código ${esc(reg.codigo)}${reg.whatsapp?' • WhatsApp '+esc(reg.whatsapp):''}</div></div>
      <div class="nao-imprimir" style="display:flex;gap:8px;flex-wrap:wrap">
        ${reg.whatsapp?`<a class="btn zap peq" target="_blank" rel="noopener" href="https://wa.me/${('55'+String(reg.whatsapp).replace(/\D/g,'')).replace(/^5555/,'55')}">Abrir WhatsApp</a>`:''}
        <button class="btn peq" id="btn-imprimir" type="button">Imprimir ou salvar PDF</button>
      </div>
    </div>
    ${resumo}${grafico}
    <div class="respostas-det">${blocos}</div>`;
  $('#btn-fechar').addEventListener('click', ()=>{ fecharDetalhe(); window.scrollTo(0,0); });
  $('#btn-imprimir').addEventListener('click', miImprimir);
  if(ehNovo(reg.teste)) ligarDetalheNovo(reg);
  tema(reg.teste);
  miMostrarDetalhe();
}

/* ============================================================================
   LIGAÇÃO COM A PÁGINA: área da terapeuta
   Painel próprio (#painel-mi), igual ao do MPCC: aparece quando ela escolhe o teste em "Qual teste?".
   Códigos, lista, busca e detalhe são os do site antigo; só o desenho da lista segue a página.
   ============================================================================ */
const mi = { teste:null, codigos:[], respostas:[] };
let RESPOSTAS = [];
const miErro = m => '<div class="aviso ver">' + esc(m) + '</div>';
const miQuando = iso => iso ? dataBR(iso) : '';
function miMontarPainel(){
  if(document.getElementById('painel-mi')) return;
  const base = document.getElementById('painel-mp') || document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-mi">
      <h2 id="mi-titulo" class="mi-titulo"></h2>
      <div id="mi-abas"><button type="button" class="ativa" data-mi-aba="respostas">Respostas</button><button type="button" data-mi-aba="codigos">Códigos de acesso</button></div>
      <div id="mi-aba-respostas">
        <div class="campo"><input id="mi-busca" type="search" placeholder="Buscar por nome ou código"></div>
        <div id="mi-lista-respostas"><div class="vazio">Nenhuma resposta por enquanto.</div></div>
      </div>
      <div id="mi-aba-codigos" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="mi-cod-nome">Nome da cliente <span class="opc">(opcional)</span></label><input id="mi-cod-nome" type="text" placeholder="Ex.: Ana Paula"></div>
          <div class="campo"><label for="mi-cod-whats">WhatsApp da cliente <span class="opc">(opcional)</span></label><input id="mi-cod-whats" type="tel" inputmode="tel" placeholder="(00) 00000-0000">
            <div class="dica">Com o telefone, o botão já abre a conversa com o link e a mensagem prontos.</div></div>
          <div class="campo"><label for="mi-cod-qtd">Quantidade de códigos</label><input id="mi-cod-qtd" type="number" min="1" max="20" value="1" inputmode="numeric">
            <div class="dica">De 1 a 20. Cada código vale para uma pessoa, uma vez só.</div></div>
          <button class="btn btn-argila" id="mi-gerar">Gerar código</button>
        </div>
        <div id="mi-caixa-codigo"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Códigos criados</h3>
        <div class="campo"><select id="mi-filtro-sit" aria-label="Situação"><option value="">Todas as situações</option><option value="Disponível">Disponíveis</option><option value="Usado">Usados</option></select></div>
        <div id="mi-lista-codigos"><div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div></div>
      </div>
      <div id="mi-detalhe" style="display:none"><div id="mi-host-detalhe"></div></div>
    </div>`);
  miRaiz(document.getElementById('mi-host-detalhe'), '<div id="detalhe"></div>');
  mascaraTelefone(document.getElementById('mi-cod-whats'));
  document.querySelectorAll('#mi-abas button').forEach(b => b.addEventListener('click', () => miAba(b.dataset.miAba)));
  document.getElementById('mi-busca').addEventListener('input', miDesenharRespostas);
  document.getElementById('mi-filtro-sit').addEventListener('change', miDesenharCodigos);
  document.getElementById('mi-gerar').addEventListener('click', miGerar);
}
function miAba(q){
  document.querySelectorAll('#mi-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.miAba === q));
  document.getElementById('mi-abas').style.display = '';
  document.getElementById('mi-aba-codigos').style.display = q === 'codigos' ? '' : 'none';
  document.getElementById('mi-aba-respostas').style.display = q === 'respostas' ? '' : 'none';
  document.getElementById('mi-detalhe').style.display = 'none';
}
/* a terapeuta escolheu um destes testes em "Qual teste?" */
function miAbrirTeste(k){
  mi.teste = k; mi.codigos = []; mi.respostas = []; RESPOSTAS = [];
  document.getElementById('mi-titulo').textContent = MI_ROT[k] || '';
  document.getElementById('mi-caixa-codigo').innerHTML = '';
  document.getElementById('mi-lista-respostas').innerHTML = '<div class="carregando">Carregando...</div>';
  document.getElementById('mi-lista-codigos').innerHTML = '<div class="carregando">Carregando...</div>';
  document.getElementById('mi-busca').value = ''; document.getElementById('mi-filtro-sit').value = '';
  miAba('respostas'); miCarregar();
}
/* um erro de sessão (login vencido) vira um aviso claro */
const miMsgErro = err => /Sessão expirada/.test(err.message) ? 'A sua sessão expirou. Saia da área e entre de novo.' : err.message;
async function miCarregar(){
  const k = mi.teste;
  try{
    const [c, r] = await Promise.all([api('listarCodigos'), api('listarRespostas')]);
    if(mi.teste !== k) return;   // trocou de teste no meio do caminho
    mi.codigos = (c.codigos || []).filter(x => x.teste === k);
    mi.respostas = (r.respostas || []).filter(x => x.teste === k);
    RESPOSTAS = mi.respostas;
    miDesenharCodigos(); miDesenharRespostas();
  }catch(err){
    const m = miErro(miMsgErro(err));
    document.getElementById('mi-lista-respostas').innerHTML = m; document.getElementById('mi-lista-codigos').innerHTML = m;
  }
}

/* ----- Respostas ----- */
function miDesenharRespostas(){
  const q = document.getElementById('mi-busca').value.trim().toLowerCase(), caixa = document.getElementById('mi-lista-respostas');
  const lista = mi.respostas.filter(r => !q || (String(r.nome) + ' ' + r.codigo).toLowerCase().includes(q));
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">' + (q ? 'Nenhuma resposta encontrada para essa busca.' : 'Nenhuma resposta ainda. Quando uma cliente enviar o teste, ela aparece aqui.') + '</div>'; return; }
  caixa.innerHTML = lista.map(r => `<button type="button" class="linha-item" data-mi-id="${esc(r.id)}"><span class="esq"><span class="nome">${esc(r.nome || 'Sem nome')}</span><span class="sub">${miQuando(r.data)} · código ${esc(r.codigo)}</span></span><span class="etiqueta livre">Ver resultado</span></button>`).join('');
  caixa.querySelectorAll('[data-mi-id]').forEach(b => b.addEventListener('click', () => abrirDetalhe(b.dataset.miId)));
}
function miMostrarDetalhe(){
  ['mi-abas', 'mi-aba-respostas', 'mi-aba-codigos'].forEach(id => { document.getElementById(id).style.display = 'none'; });
  document.getElementById('mi-detalhe').style.display = 'block'; window.scrollTo({ top:0, behavior:'auto' });
}
function fecharDetalhe(){ tema('travas'); miAba('respostas'); window.scrollTo({ top:0, behavior:'auto' }); }
/* imprimir / salvar em PDF: copia só o resultado para uma área de impressão (o resto da página fica de fora) */
function miImprimir(){
  const orig = $('#detalhe'); if(!orig) return;
  const caixa = document.createElement('div'); caixa.id = 'mi-impressao';
  document.body.appendChild(caixa);
  const sr = miRaiz(caixa, '<div id="detalhe">' + orig.innerHTML + '</div>');
  caixa.dataset.tema = orig.getRootNode().host ? (orig.getRootNode().host.dataset.tema || 'travas') : 'travas';
  const a = orig.querySelectorAll('input,textarea'), b = sr.querySelectorAll('input,textarea');
  a.forEach((el, i) => { const c = b[i]; if(!c) return; if(el.type === 'checkbox' || el.type === 'radio'){ if(el.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else if(el.tagName === 'TEXTAREA') c.textContent = el.value; else c.setAttribute('value', el.value); });
  document.body.classList.add('mi-imprimindo');
  const fim = () => { document.body.classList.remove('mi-imprimindo'); const i = RAIZES.indexOf(sr); if(i > -1) RAIZES.splice(i, 1); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('mi-impressao')) fim(); }, 1500); }, 150);
}

/* ----- Códigos ----- */
const miCopiar = async (texto, b, rot) => { try{ await navigator.clipboard.writeText(texto); b.textContent = 'Copiado!'; }catch(e){ b.textContent = 'Não consegui copiar'; } setTimeout(() => { b.textContent = rot; }, 1800); };
async function miGerar(){
  const b = document.getElementById('mi-gerar'), caixa = document.getElementById('mi-caixa-codigo');
  const nome = document.getElementById('mi-cod-nome').value.trim(), zap = document.getElementById('mi-cod-whats').value.trim();
  const qtd = Math.max(1, Math.min(20, parseInt(document.getElementById('mi-cod-qtd').value, 10) || 1));
  b.disabled = true; b.textContent = 'Gerando...'; caixa.innerHTML = '';
  let j;
  try{ j = await api('gerarCodigos', { teste:mi.teste, cliente:nome, quantidade:qtd }); }
  catch(err){ b.disabled = false; b.textContent = 'Gerar código'; caixa.innerHTML = miErro(miMsgErro(err)); return; }
  b.disabled = false; b.textContent = 'Gerar código';
  caixa.innerHTML = j.codigos.map((c, i) => `
    <div class="codigo-gerado"><div class="valor">${esc(c.codigo)}</div>
      <div class="para">${nome ? 'Para ' + esc(nome) + ' · ' : ''}${esc(MI_ROT[c.teste] || c.teste)}</div></div>
    <a class="btn btn-zap" href="${linkZap(c, zap)}" target="_blank" rel="noopener"><span class="duas">Enviar no WhatsApp<small>${zap ? 'abre a conversa com a mensagem pronta' : 'você escolhe o contato na hora'}</small></span></a>
    <button type="button" class="btn btn-contorno" data-mi-msg="${i}">Copiar mensagem</button>
    <button type="button" class="btn btn-contorno" data-mi-lnk="${i}">Copiar o link com o código</button>
    <button type="button" class="btn btn-contorno" data-mi-cod="${i}">Copiar só o código</button>`).join('<hr class="mi-sep">');
  caixa.querySelectorAll('[data-mi-msg]').forEach(x => x.addEventListener('click', () => miCopiar(mensagemCodigo(j.codigos[x.dataset.miMsg]), x, 'Copiar mensagem')));
  caixa.querySelectorAll('[data-mi-lnk]').forEach(x => x.addEventListener('click', () => miCopiar(linkCliente(j.codigos[x.dataset.miLnk].codigo), x, 'Copiar o link com o código')));
  caixa.querySelectorAll('[data-mi-cod]').forEach(x => x.addEventListener('click', () => miCopiar(j.codigos[x.dataset.miCod].codigo, x, 'Copiar só o código')));
  document.getElementById('mi-cod-nome').value = ''; document.getElementById('mi-cod-whats').value = ''; document.getElementById('mi-cod-qtd').value = 1;
  miCarregar();
}
function miDesenharCodigos(){
  const caixa = document.getElementById('mi-lista-codigos'), fs = document.getElementById('mi-filtro-sit').value;
  const lista = mi.codigos.filter(c => !fs || c.situacao === fs);
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">' + (fs ? 'Nenhum código nesta situação.' : 'Nenhum código ainda. Gere o primeiro acima.') + '</div>'; return; }
  caixa.innerHTML = lista.map(c => { const livre = c.situacao === 'Disponível'; return `
    <div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${esc(c.codigo)}${c.cliente ? ' · ' + esc(c.cliente) : ''}</span>
      <span class="sub">${livre ? 'criado em ' + miQuando(c.criadoEm) : 'respondido em ' + miQuando(c.usadoEm || c.criadoEm)}</span></span>
      <span class="etiqueta ${livre ? 'livre' : 'usado'}">${livre ? 'disponível' : 'usado'}</span>
      ${livre ? `<span class="mi-acoes-cod"><a class="mini-btn" href="${linkZap(c, '')}" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="mini-btn" data-mi-m="${esc(c.codigo)}">Copiar mensagem</button><button type="button" class="mini-btn" data-mi-l="${esc(c.codigo)}">Copiar link</button><button type="button" class="mini-btn" data-mi-x="${esc(c.codigo)}">Cancelar</button></span>` : ''}</div>`; }).join('');
  const achar = cod => mi.codigos.find(c => c.codigo === cod);
  caixa.querySelectorAll('[data-mi-m]').forEach(x => x.addEventListener('click', () => miCopiar(mensagemCodigo(achar(x.dataset.miM)), x, 'Copiar mensagem')));
  caixa.querySelectorAll('[data-mi-l]').forEach(x => x.addEventListener('click', () => miCopiar(linkCliente(x.dataset.miL), x, 'Copiar link')));
  caixa.querySelectorAll('[data-mi-x]').forEach(x => x.addEventListener('click', async () => {
    if(!confirm('Cancelar o código ' + x.dataset.miX + '? Ele não poderá mais ser usado.')) return;
    x.disabled = true;
    try{ await api('cancelarCodigo', { codigo:x.dataset.miX }); miCarregar(); }
    catch(err){ alert(miMsgErro(err)); x.disabled = false; }
  }));
}

/* ----- escolha do teste em "Qual teste?" ----- */
function miSeletor(lista, ativos){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  lista.forEach(k => {
    if(alt.querySelector('[data-v=' + k + ']')) return;
    alt.insertAdjacentHTML('beforeend', `<button type="button" data-v="${k}" role="radio" aria-checked="false">${esc(MI_ROT[k])}<small>${esc(MI_SUB[k])}</small></button>`);
  });
  if(ativos){   // os testes do modelo que ela não tem (ex.: Traços de Caráter) não aparecem
    ['travas', 'tracos', 'mpcc'].forEach(k => { const b = alt.querySelector('[data-v=' + k + ']'); if(b) b.style.display = ativos.indexOf(k) > -1 ? '' : 'none'; });
    if(ativos.indexOf('travas') < 0){   // sem o Teste de Travas: a área já abre no primeiro teste que ela tem
      const primeiro = ativos.concat(lista)[0], adm = document.getElementById('painel-admin');
      let tinha = adm ? adm.classList.contains('ver') : false;
      if(adm && 'MutationObserver' in window) new MutationObserver(() => {
        const tem = adm.classList.contains('ver');
        if(tem && !tinha){ const b = alt.querySelector('[data-v=' + primeiro + ']'); if(b && !b.classList.contains('ativa')) b.click(); }
        tinha = tem;
      }).observe(adm, { attributes:true, attributeFilter:['class'] });
    }
  }
  const campo = alt.closest('.campo'); if(campo) campo.style.display = '';
  if(alt.dataset.mi) return; alt.dataset.mi = '1';
  alt.addEventListener('click', e => {   // roda depois dos botões do modelo e do MPCC (o clique sobe até aqui)
    const b = e.target.closest('button[data-v]'); if(!b) return;
    alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
    const adm = document.getElementById('painel-admin'); if(!adm) return;
    if(MI_TESTES.indexOf(b.dataset.v) > -1){ adm.classList.remove('modo-tc', 'modo-mp'); adm.classList.add('modo-mi'); miAbrirTeste(b.dataset.v); }
    else adm.classList.remove('modo-mi');
  });
}
function miInit(){
  if(miInit.feito) return; miInit.feito = true;
  if(!document.getElementById('mi-fontes')){   // letras do Mente Serena (Playfair Display e Montserrat), só nas páginas que têm estes testes
    const l = document.createElement('link'); l.id = 'mi-fontes'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Allura&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,500&display=swap';
    document.head.appendChild(l);
  }
  miMontarTelas(); miMontarPainel();
}
/* chamado pelo modelo quando a terapeuta tem algum destes testes: lista = os que ela tem aqui; ativos = os do modelo (travas, traços, MPCC) */
function miAjustarTestes(lista, ativos){
  miInit(); miSeletor(lista, ativos);
  document.title = miTituloPagina();
}

/* ============================================================================
   LIGAÇÃO COM A PÁGINA: capa de vendas e entradas que o modelo chama
   ============================================================================ */
/* textos dos três testes na capa de vendas (devolutiva-carater.js: dvCapaVendas lê window.CV_EXTRA) */
const CV_EXTRA = {
  serena:{
    rot:'Diagnóstico Mente Serena', curto:'Mente Serena', tag:'Individual · Mapa em teia', titulo:'Diagnóstico Mente Serena',
    objetivo:'Mostrar como estão os 7 pilares da mulher serena: onde você já tem força e o que pede cuidado agora, para saber por onde começar a cuidar de si com mais calma, segurança e equilíbrio.',
    como:['49 afirmações e um termômetro inicial, de 10 a 15 minutos', 'Feito para mulheres que querem mais calma, segurança e equilíbrio', 'Se precisar parar, o progresso fica salvo no aparelho'],
    resultado:q => 'O seu Termômetro Mente Serena, logo ao terminar: uma nota de 1 a 10 para cada pilar, em um gráfico de teia. Depois, a leitura aprofundada com ' + q + '.',
    mapaTitulo:'Os 7 pilares que o diagnóstico mapeia',
    itens:Object.keys(EXPLICA_PILARES).map(n => ({ nome:n, desc:EXPLICA_PILARES[n] })),
    pergunta:'Onde estão as suas forças e o que pede cuidado?',
    texto:'Mapeia os 7 pilares da mulher serena (essência, segurança, amor-próprio, organização da mente, espiritualidade, regulação emocional e posicionamento) e mostra, em um gráfico de teia, onde estão as suas forças e o que precisa de cuidado.',
    meta:'49 afirmações · 10 a 15 minutos',
    zap:'quero fazer o Diagnóstico Mente Serena. Como recebo o meu código?',
    descobre:'<b>onde estão as suas forças e o que pede cuidado nos 7 pilares da mente serena</b>',
    recebe:() => 'No Diagnóstico Mente Serena, o seu Termômetro: um gráfico de teia com a nota de cada um dos 7 pilares',
    tempo:'o Diagnóstico Mente Serena, de 10 a 15 minutos',
    faq:q => ['O que é o Termômetro Mente Serena?', 'É o resultado do diagnóstico: uma nota de 1 a 10 para cada um dos 7 pilares, em um gráfico de teia. Perto de 10, o pilar está fortalecido; perto de 1, é um sinal de alerta. É um primeiro retrato, que você aprofunda com ' + q + ' na devolutiva.']
  },
  esquemas:{
    rot:'Esquemas e Necessidades Emocionais', curto:'Esquemas e Necessidades Emocionais', tag:'Individual · Mais profundo', titulo:'Questionário de Esquemas e Necessidades Emocionais',
    objetivo:'Entender de onde vêm os padrões que se repetem na sua vida: quais esquemas emocionais se formaram na sua história, como você aprendeu a lidar com eles e quais necessidades emocionais ficaram sem resposta na infância.',
    como:['5 partes, cerca de 1 hora', 'Dá para parar e continuar depois: o progresso fica salvo no aparelho', 'Algumas frases falam da infância e da relação com a mãe e o pai: vá no seu ritmo'],
    resultado:q => 'O mapa dos seus esquemas, das suas formas de enfrentamento e dos estilos parentais que você percebeu, com a leitura feita junto com ' + q + ' na devolutiva.',
    mapaTitulo:'O que o questionário mapeia: 18 esquemas em 5 domínios, e mais',
    itens:[
      { nome:'Desconexão e rejeição', desc:'Privação emocional, abandono, desconfiança e abuso, isolamento social, defectividade e vergonha.' },
      { nome:'Autonomia e desempenho prejudicados', desc:'Fracasso, dependência e incompetência, vulnerabilidade e emaranhamento.' },
      { nome:'Limites prejudicados', desc:'Arrogo e grandiosidade, autocontrole e autodisciplina insuficientes.' },
      { nome:'Orientação para o outro', desc:'Subjugação, autossacrifício e busca de aprovação.' },
      { nome:'Supervigilância e inibição', desc:'Inibição emocional, padrões inflexíveis, negativismo e postura punitiva.' },
      { nome:'Estilos parentais', desc:'Como você percebe a forma como foi cuidado(a) pela mãe e pelo pai.' },
      { nome:'Formas de enfrentamento', desc:'Como você costuma reagir aos esquemas: compensando ou evitando.' }
    ],
    pergunta:'De onde vêm os padrões que se repetem na sua vida?',
    texto:'Um mapa mais profundo da sua história, baseado no modelo de esquemas de Young: ajuda a entender de onde vêm alguns padrões que se repetem na sua vida e quais necessidades emocionais ficaram sem resposta na infância.',
    meta:'5 partes · cerca de 1 hora, com o progresso salvo',
    zap:'quero fazer o Questionário de Esquemas e Necessidades Emocionais. Como recebo o meu código?',
    descobre:'<b>de onde vêm os padrões que se repetem na sua história</b>',
    recebe:q => 'No Questionário de Esquemas, a leitura dos seus padrões e necessidades é feita junto com ' + q,
    tempo:'o Questionário de Esquemas, cerca de 1 hora (dá para parar e continuar depois)',
    faq:q => ['Posso parar no meio do Questionário de Esquemas?', 'Pode. O seu progresso fica salvo no aparelho: ao abrir o link de novo, você continua de onde parou. Algumas frases falam de lembranças e de relações difíceis; vá no seu ritmo e, se algo mexer muito com você, fale com ' + q + '.']
  },
  tdah:{
    rot:'Escala de TDAH em adultos (ETDAH-AD)', curto:'TDAH em adultos (ETDAH-AD)', tag:'Individual · Triagem', titulo:'Escala de TDAH em adultos (ETDAH-AD)',
    objetivo:'Uma triagem que ajuda a entender como funcionam a sua atenção, a sua impulsividade, as suas emoções e a sua energia no dia a dia. Ela apoia a avaliação, mas não é um diagnóstico.',
    como:['69 frases, de 15 a 20 minutos', 'Você marca com que frequência cada frase descreve você', 'O resultado leva em conta a sua escolaridade, como na escala original'],
    resultado:q => 'A pontuação em cada um dos 5 fatores, comparada com a de adultos da mesma escolaridade, com a leitura feita junto com ' + q + ' na devolutiva.',
    mapaTitulo:'Os 5 fatores da escala',
    itens:[
      { nome:'Desatenção', desc:'Foco, esquecimentos e distrações no dia a dia (23 frases).' },
      { nome:'Impulsividade', desc:'Agir ou falar antes de pensar, impaciência e dificuldade de esperar (23 frases).' },
      { nome:'Aspectos emocionais', desc:'Como as emoções e o humor afetam o dia a dia (4 frases).' },
      { nome:'Autorregulação da atenção, da motivação e da ação', desc:'Organizar-se, manter a motivação e levar as tarefas até o fim (12 frases).' },
      { nome:'Hiperatividade', desc:'Inquietação e excesso de energia no corpo e na mente (7 frases).' }
    ],
    tituloHtml:'Escala de TDAH em adultos <span style="white-space:nowrap">(ETDAH-AD)</span>',
    pergunta:'Como funcionam a sua atenção, a sua impulsividade e a sua energia?',
    texto:'Uma triagem que ajuda a entender como funcionam a sua atenção, a sua impulsividade e a sua energia no dia a dia. Apoia a avaliação, mas não é um diagnóstico: a leitura do resultado é feita junto com você.',
    meta:'69 frases · 15 a 20 minutos',
    zap:'quero fazer a Escala de TDAH em adultos (ETDAH-AD). Como recebo o meu código?',
    descobre:'<b>como funcionam a sua atenção, a sua impulsividade e a sua energia</b>',
    recebe:q => 'Na Escala de TDAH, uma triagem que apoia a avaliação, com a leitura feita junto com ' + q,
    tempo:'a Escala de TDAH, de 15 a 20 minutos',
    faq:q => ['A Escala de TDAH é um diagnóstico?', 'Não. É uma triagem que apoia a avaliação. A leitura do resultado é feita junto com ' + q + '.']
  }
};
/* só os testes que a página tem entram na capa (a lista vem do modelo) */
window.CV_EXTRA = CV_EXTRA;

/* o que o modelo e a capa de vendas enxergam */
window.miEntrar = miEntrar;
window.miValidar = miValidar;
window.miLista = miLista;
window.miAjustarTestes = miAjustarTestes;
/* para conferir as contas (testes automáticos): são as mesmas funções do site antigo */
window.MI_TESTE = { pontuarEsquemas, pontuarTdah, pontuarSerena, construirEsquemas, construirTdah, detalheEsquemas, detalheTdah, TESTES, PILARES_SERENA, TERMOMETRO_INICIAL, MENSAGENS, EXPLICA_PILARES, NIVEL_PILAR };
})();
