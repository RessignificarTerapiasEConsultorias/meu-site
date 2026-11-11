/* ============================================================================
   DISC · ANÁLISE COMPORTAMENTAL (módulo da página do teste)
   Ferramenta de análise comportamental para o ambiente corporativo. NÃO é ferramenta terapêutica.
   Usa o núcleo /teste/disc-nucleo.js (window.DISC): blocos, algoritmo, laudo e gráficos.

   Telas: capa com código -> cadastro -> 24 blocos (MAIS e MENOS) -> resultado (ou agradecimento)
   Área do dono: avaliações, códigos, detalhe com gráficos e laudo, PDF, apresentação comercial, e-mail.
   O modelo da página chama dcAjustarTestes(ativos) quando o dono tem o DISC.
   ============================================================================ */
const DC = { SIGLA:'DISC', NOME:'Análise Comportamental DISC', AVISO:'O DISC é uma ferramenta de análise comportamental para o ambiente de trabalho. Não é teste psicológico, avaliação clínica nem ferramenta terapêutica, e não deve ser usado como único critério de decisão.' };
const dcPrim = n => String(n || '').trim().split(/\s+/)[0] || '';
const dcEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim());
const dcDig = v => String(v || '').replace(/\D/g, '');
const dcAp = () => typeof T_A !== 'undefined' ? T_A : 'quem enviou o código';
const dcLink = codigo => location.origin + location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&dc=' + encodeURIComponent(codigo);
const dcQuando = iso => iso ? new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
const dcData = iso => iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
const dcZapTer = texto => 'https://wa.me/' + (CONFIG.whatsappNumero || '') + (texto ? '?text=' + encodeURIComponent(texto) : '');
const dcF = f => DISC.FATORES[f];

/* ---- 1. O RELATÓRIO (mesmas seções na tela da pessoa, na área do dono e no PDF) ---- */
function dcSecoes(calc){
  const L = DISC.laudoCompleto(calc), p = dcF(calc.pico);
  const topo = `<h2>Seu perfil predominante</h2>
    <div class="dc-pico"><div class="dc-pico-letra" style="background:${p.cor}">${calc.pico}</div>
      <div class="dc-pico-txt"><b>${escV(L.titulo)}</b><p style="margin:4px 0 0">${escV(L['Resumo do Perfil'])}</p>
      <div class="dc-chips">${DISC.ORDEM.map(f => `<span class="dc-chip" style="--c:${dcF(f).cor};--c2:${dcF(f).claro}">${f} ${calc.resultante[f]}% · ${calc.resultante[f] >= 50 ? 'Alto' : 'Baixo'}</span>`).join('')}</div></div></div>
    <p>${escV(L.combinacao)} Estilo: <b>${escV(calc.estilo)}</b>.</p>`;
  const tabela = `<table class="dc-tabela"><thead><tr><th>Fator</th><th>Adaptado</th><th>Natural</th><th>Resultante</th></tr></thead><tbody>
    ${DISC.ORDEM.map(f => `<tr><td><b style="color:${dcF(f).cor}">${f}</b> · ${escV(dcF(f).nome)}<br><small style="color:#6B7486">${escV(dcF(f).eixo)}</small></td>
      ${['adaptado', 'natural', 'resultante'].map(k => `<td class="${calc[k][f] >= 50 ? 'dc-alto' : 'dc-baixo'}">${calc[k][f]}%</td>`).join('')}</tr>`).join('')}</tbody></table>
    <p class="dc-nota-peq">Acima de 50% o traço é <b>Alto</b>; abaixo, <b>Baixo</b>. Adaptado: como age no trabalho (máscara). Natural: como reage sob pressão (essência). Resultante: a média dos dois.</p>
    <p>${escV(L.adaptacao)}</p>`;
  const laudo = `<h2>Laudo</h2>
    <div class="dc-duas">
      <div class="dc-caixa"><h3>Áreas recomendadas</h3><ul class="dc-lista">${L['Áreas Recomendadas'].map(a => '<li>' + escV(a) + '</li>').join('')}</ul></div>
      <div class="dc-caixa"><h3>Estilo de liderança</h3><p style="margin:0">${escV(L['Estilo de Liderança'])}</p></div>
      <div class="dc-caixa"><h3>Pontos fortes</h3><ul class="dc-lista">${L.detalhe.fortes.map(a => '<li>' + escV(a) + '</li>').join('')}</ul></div>
      <div class="dc-caixa"><h3>Pontos de atenção</h3><ul class="dc-lista">${L.detalhe.atencao.map(a => '<li>' + escV(a) + '</li>').join('')}</ul></div>
      <div class="dc-caixa"><h3>Como se comunicar</h3><p style="margin:0">${escV(L.detalhe.comunicar)}</p></div>
      <div class="dc-caixa"><h3>O que motiva</h3><p style="margin:0">${escV(L.detalhe.motiva)}</p></div>
    </div>`;
  return { topo, tabela, laudo };
}
function dcResumoTexto(nome, calc){
  const L = DISC.laudoCompleto(calc);
  return [nome + ' · ' + DC.NOME, 'Perfil predominante: ' + dcF(calc.pico).nome + ' (' + calc.pico + ') · estilo ' + calc.estilo, '',
    'Fator: Adaptado / Natural / Resultante',
    ...DISC.ORDEM.map(f => dcF(f).nome + ' (' + f + '): ' + calc.adaptado[f] + '% / ' + calc.natural[f] + '% / ' + calc.resultante[f] + '% · ' + (calc.resultante[f] >= 50 ? 'alto' : 'baixo')), '',
    'Áreas recomendadas: ' + L['Áreas Recomendadas'].join('; '), 'Estilo de liderança: ' + L['Estilo de Liderança']].join('\n');
}
async function dcImprimir(r){
  let img = {};
  try{ img = await DISC.imagens(r.calc); }catch(e){}
  const s = dcSecoes(r.calc), graf = img.adaptado ? `<div class="dc-graf-img"><img src="${img.adaptado}" alt="Perfil Adaptado"><img src="${img.natural}" alt="Perfil Natural"><img src="${img.resultante}" alt="Perfil Resultante"><img src="${img.radar}" alt="Radar dos 4 fatores"></div>` : '';
  const html = `<div class="dc-rel">
    <section class="dc-pag dc-capa"><div><span class="dc-capa-sigla">DISC</span><h1>Análise Comportamental</h1>
      <p style="font-size:20px;margin-top:18px"><b>${escV(r.nome)}</b></p><p>${escV(r.dataTxt || '')}</p>
      <p style="margin-top:26px">${escV((window.T_NOME || '') + (window.T_NOME ? ' · ' : '') + 'Ressignificar')}</p></div></section>
    <section class="dc-pag">${s.topo}${s.tabela}</section>
    <section class="dc-pag"><h2>Gráficos</h2>${graf}</section>
    <section class="dc-pag">${s.laudo}<p class="dc-nota-peq">${escV(DC.AVISO)}</p></section></div>`;
  const caixa = document.createElement('div'); caixa.id = 'dc-impressao'; caixa.innerHTML = html;
  document.body.appendChild(caixa); document.body.classList.add('dc-imprimindo');
  const fim = () => { document.body.classList.remove('dc-imprimindo'); caixa.remove(); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  setTimeout(() => { window.print(); setTimeout(() => { if(document.getElementById('dc-impressao')) fim(); }, 1500); }, 250);
}

/* ---- 2. TELAS DA PESSOA ---- */
const dc = { codigo:'', mostrar:true, cad:null, resp:[], indice:0, inicio:0 };
const dcChave = c => CHAVE_CODIGOS + '_disc_' + c + '_prog';
function dcErro(msg){ return '<div class="aviso ver">' + escV(msg) + '</div>'; }
function dcMostrar(html){ document.getElementById('dc-conteudo').innerHTML = html; mostrarTela('#tela-dc'); window.scrollTo({ top:0, behavior:'auto' }); }
function dcMontarTelas(){
  if(document.getElementById('tela-dc-capa')) return;
  const ancora = document.getElementById('tela-admin'); if(!ancora) return;
  const rod = escV((window.T_NOME || '') + ' · ' + ((window.__T && __T.dados && __T.dados.titulo) || ''));
  ancora.insertAdjacentHTML('beforebegin', `
<section class="tela" id="tela-dc-capa">
  <div class="capa">
    <div class="moldura"><img id="dc-foto" alt=""></div>
    <div class="lado-texto">
      <span class="selo dc-selo">DISC · Análise Comportamental</span>
      <h1>Análise Comportamental <em>DISC</em></h1>
      <p class="assinatura" id="dc-assinatura"></p>
      <p class="texto-capa">Uma avaliação do seu jeito de agir no trabalho: como você decide, se comunica, lida com ritmo e mudanças e com regras e detalhes.</p>
      <ul class="lista-leve">
        <li>24 blocos com 4 palavras, de 8 a 12 minutos</li>
        <li>Em cada bloco você marca a palavra que MAIS e a que MENOS descreve você</li>
        <li>No final, 3 perfis (Adaptado, Natural e Resultante), gráficos e laudo</li>
        <li>Análise comportamental para o trabalho, não é avaliação psicológica nem terapia</li>
      </ul>
      <div class="cartao">
        <div class="campo" style="margin-bottom:10px">
          <label for="dc-codigo">Digite o código que você recebeu</label>
          <input id="dc-codigo" class="codigo-input" type="text" inputmode="text" autocomplete="off" placeholder="AB-0000" maxlength="9">
          <div class="dica" id="dc-dica">Cada código abre a avaliação uma única vez.</div>
        </div>
        <div class="aviso" id="dc-aviso-codigo"></div>
        <button class="btn btn-primario" id="dc-entrar" disabled>Digite o código</button>
      </div>
    </div>
  </div>
  <div class="rodape"><span class="nome-rodape">${rod}</span><a id="link-zap-dc" href="#" target="_blank" rel="noopener">Falar no WhatsApp</a></div>
</section>
<section class="tela" id="tela-dc"><button class="voltar" id="dc-voltar-capa">← Voltar</button><div id="dc-conteudo"></div></section>
<section class="tela" id="tela-dc-teste">
  <div class="barra-topo"><div class="progresso"><i id="dc-barra"></i></div>
    <div class="linha-progresso"><span id="dc-contador" aria-live="polite"></span><span class="tema">DISC</span></div></div>
  <p class="dc-instrucao">Pense em como você age <b>no trabalho</b>. Toque em <b class="mais">+ MAIS</b> na palavra que mais descreve você e em <b class="menos">− MENOS</b> na que menos descreve.</p>
  <div class="dc-ops" id="dc-ops"></div>
  <p class="dc-falta" id="dc-falta" aria-live="polite"></p>
  <div class="dc-nav"><button class="btn btn-contorno" id="dc-voltar" type="button">← Anterior</button><button class="btn btn-primario" id="dc-prox" type="button" disabled>Próximo →</button></div>
</section>
<section class="tela" id="tela-dc-resultado"><div id="dc-resultado"></div>
  <div class="rodape"><span class="nome-rodape">${rod}</span>Obrigado pela sua participação.</div></section>`);
  const cod = document.getElementById('dc-codigo');
  cod.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''); avisar('#dc-aviso-codigo', ''); dcCampoCodigo(); });
  cod.addEventListener('keydown', e => { if(e.key === 'Enter' && !document.getElementById('dc-entrar').disabled) document.getElementById('dc-entrar').click(); });
  document.getElementById('dc-entrar').addEventListener('click', dcClicarEntrar);
  document.getElementById('link-zap-dc').href = 'https://wa.me/' + (CONFIG.whatsappNumero || '');
  document.getElementById('dc-voltar-capa').addEventListener('click', () => mostrarTela('#tela-dc-capa'));
  document.getElementById('dc-voltar').addEventListener('click', () => { if(dc.indice > 0){ dc.indice--; dcDesenhar(); } });
  document.getElementById('dc-prox').addEventListener('click', dcAvancar);
}
function dcCampoCodigo(){ const v = document.getElementById('dc-codigo').value, b = document.getElementById('dc-entrar'); b.disabled = v.length < 5; b.textContent = b.disabled ? 'Digite o código' : 'Começar a avaliação'; }
function dcAbrirCapa(codigo){
  dcMontarTelas();
  const f = document.querySelector('#tela-capa .moldura img'), tf = document.getElementById('dc-foto');
  if(f && f.src) tf.src = f.src; else { const ini = document.querySelector('#tela-capa .moldura .t-ini'); if(ini && tf) tf.replaceWith(ini.cloneNode(true)); }
  const ta = document.getElementById('dc-assinatura'), oa = document.getElementById('t-assinatura'); if(ta && oa) ta.innerHTML = oa.innerHTML.replace(/convite d[oa] terapeuta /i, 'convite de ');
  const cod = document.getElementById('dc-codigo'); if(window.__T && __T.prefixo) cod.placeholder = __T.prefixo + '-0000';
  if(codigo){ cod.value = codigo; document.getElementById('dc-dica').innerHTML = '<span class="ok-pre" aria-hidden="true">✔</span> Código já preenchido. É só tocar em <b>“Começar a avaliação”</b>.'; }
  dcCampoCodigo(); mostrarTela('#tela-dc-capa');
}
async function dcClicarEntrar(){
  const b = document.getElementById('dc-entrar'), codigo = document.getElementById('dc-codigo').value.trim().toUpperCase();
  b.disabled = true; b.textContent = 'Verificando o código...';
  const r = await validarCodigo(codigo);
  b.disabled = false; b.textContent = 'Começar a avaliação';
  if(!r.ok) return avisar('#dc-aviso-codigo', r.msg);
  if(r.teste === 'disc') return dcEntrar(codigo, r);
  if(r.teste === 'mpcc' && typeof mpEntrar === 'function') return mpEntrar(codigo, r);
  if(r.teste === 'tracos' && typeof tcEntrar === 'function') return tcEntrar(codigo, r);
  location.href = location.pathname + '?t=' + encodeURIComponent(T_SLUG) + '&c=' + encodeURIComponent(codigo);
}
function dcEntrar(codigo, r){
  dcMontarTelas();
  dc.codigo = codigo; dc.mostrar = r.mostrar_resultado !== false && r.mostrar !== false;
  const prog = ler(dcChave(codigo), null);
  if(prog && prog.cad && Array.isArray(prog.resp)){ dc.cad = prog.cad; return dcComecar(prog); }
  dcTelaCadastro(r.cliente || '');
}
function dcTelaCadastro(nomeSugerido){
  dcMostrar(`
    <span class="selo dc-selo">DISC</span>
    <h1 class="tc-h1">Antes de começar</h1>
    <p>Esta é uma análise do seu comportamento <b>no ambiente de trabalho</b>. Não existem respostas certas ou erradas, nem perfil melhor ou pior: cada perfil tem forças diferentes.</p>
    <div class="dc-aviso-corp">${escV(DC.AVISO)}</div>
    <div class="como-responder"><ul>
      <li>São 24 blocos com 4 palavras cada.</li>
      <li>Em cada bloco, marque <b>uma</b> palavra com <b>+ MAIS</b> (a que mais descreve você) e <b>uma</b> com <b>− MENOS</b> (a que menos descreve).</li>
      <li>Responda pensando em como você <b>age de verdade</b> no trabalho, não em como gostaria de agir. Vá pela primeira impressão.</li>
      <li>Se a página fechar, ao abrir o link de novo neste aparelho você continua de onde parou.</li></ul></div>
    <div class="cartao">
      <div class="campo"><label for="dk-nome">Nome completo</label><input id="dk-nome" type="text" autocomplete="name" value="${escV(nomeSugerido || '')}" placeholder="Nome e sobrenome"></div>
      <div class="campo"><label for="dk-email">E-mail</label><input id="dk-email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com"></div>
      <div class="campo"><label for="dk-tel">WhatsApp (com DDD)</label><input id="dk-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000"></div>
      <div class="campo"><label for="dk-emp">Empresa <span class="opc">(opcional)</span></label><input id="dk-emp" type="text" autocomplete="organization" placeholder="Onde você trabalha"></div>
      <div class="campo"><label for="dk-cargo">Cargo ou função</label><input id="dk-cargo" type="text" autocomplete="organization-title" placeholder="Ex.: vendedora, gerente, analista"></div>
      <div class="campo campo-check"><label class="check" for="dk-lgpd"><input id="dk-lgpd" type="checkbox">
        <span>Li e concordo com os <a href="/politica-de-privacidade.html" target="_blank" rel="noopener">termos de utilização e privacidade</a>. Concordo que as minhas respostas sejam usadas para gerar o meu perfil e enviadas para ${escV(dcAp())}, que vai mantê-las em sigilo.</span></label></div>
      <div class="campo campo-check"><label class="check" for="dk-contato"><input id="dk-contato" type="checkbox">
        <span>Autorizo o contato por WhatsApp ou e-mail sobre o meu resultado <span class="opc">(opcional)</span>.</span></label></div>
      <div class="aviso" id="dk-aviso"></div>
      <button class="btn btn-primario" id="dk-ir">Começar os 24 blocos</button>
    </div>`);
  mascaraTelefone(document.getElementById('dk-tel'));
  document.getElementById('dk-ir').addEventListener('click', () => {
    const v = id => document.getElementById(id).value.trim().replace(/\s+/g, ' ');
    const n = v('dk-nome'), em = v('dk-email'), t = document.getElementById('dk-tel').value, cargo = v('dk-cargo');
    const erro = n.split(' ').length < 2 || n.length < 5 ? 'Escreva o seu nome completo (nome e sobrenome).'
      : !dcEmail(em) ? 'Escreva um e-mail válido.' : dcDig(t).length < 10 ? 'Escreva o seu WhatsApp com DDD.'
      : cargo.length < 2 ? 'Escreva o seu cargo ou função.'
      : !document.getElementById('dk-lgpd').checked ? 'Para continuar, marque que você leu e concorda com os termos de utilização e privacidade.' : '';
    if(erro) return avisar('#dk-aviso', erro);
    dc.cad = { nome:n, email:em, whatsapp:t, empresa:v('dk-emp'), cargo, contato:document.getElementById('dk-contato').checked };
    dcComecar(null);
  });
}
function dcComecar(prog){
  const N = DISC.BLOCOS.length;
  dc.resp = (prog && Array.isArray(prog.resp) && prog.resp.length === N) ? prog.resp.map(x => x ? { mais:x.mais, menos:x.menos } : { mais:null, menos:null }) : DISC.BLOCOS.map(() => ({ mais:null, menos:null }));
  const vazia = dc.resp.findIndex(x => x.mais == null || x.menos == null);
  dc.indice = vazia < 0 ? N - 1 : vazia; dc.inicio = Date.now(); dcGuardar();
  mostrarTela('#tela-dc-teste'); dcDesenhar(); window.scrollTo({ top:0, behavior:'auto' });
}
const dcGuardar = () => guardar(dcChave(dc.codigo), { cad:dc.cad, resp:dc.resp });
function dcDesenhar(){
  const i = dc.indice, N = DISC.BLOCOS.length, b = DISC.BLOCOS[i], r = dc.resp[i];
  document.getElementById('dc-contador').textContent = 'Bloco ' + (i + 1) + ' de ' + N;
  document.getElementById('dc-barra').style.width = (i / N * 100) + '%';
  document.getElementById('dc-voltar').style.visibility = i === 0 ? 'hidden' : 'visible';
  const ops = document.getElementById('dc-ops');
  ops.innerHTML = b.opcoes.map((o, k) => `<div class="dc-op${r.mais === k ? ' mais' : r.menos === k ? ' menos' : ''}"><span class="dc-pal">${escV(o.t)}</span>
    <button type="button" class="dc-bt mais${r.mais === k ? ' on' : ''}" data-k="${k}" data-t="mais" aria-pressed="${r.mais === k}" aria-label="${escV(o.t)}: mais me descreve">+<small>MAIS</small></button>
    <button type="button" class="dc-bt menos${r.menos === k ? ' on' : ''}" data-k="${k}" data-t="menos" aria-pressed="${r.menos === k}" aria-label="${escV(o.t)}: menos me descreve">−<small>MENOS</small></button></div>`).join('');
  ops.querySelectorAll('.dc-bt').forEach(x => x.addEventListener('click', () => dcMarcar(+x.dataset.k, x.dataset.t)));
  dcAtualizarNav();
}
function dcAtualizarNav(){
  const r = dc.resp[dc.indice], ok = r.mais != null && r.menos != null, ult = dc.indice === DISC.BLOCOS.length - 1;
  const b = document.getElementById('dc-prox'); b.disabled = !ok; b.textContent = ult ? 'Ver meu resultado' : 'Próximo →';
  document.getElementById('dc-falta').textContent = ok ? '' : r.mais == null && r.menos == null ? 'Marque uma palavra com + MAIS e outra com − MENOS.' : r.mais == null ? 'Agora marque a palavra que MAIS descreve você.' : 'Agora marque a palavra que MENOS descreve você.';
}
function dcMarcar(k, tipo){
  const r = dc.resp[dc.indice], outro = tipo === 'mais' ? 'menos' : 'mais';
  r[tipo] = r[tipo] === k ? null : k;
  if(r[outro] === k) r[outro] = null;          // a mesma palavra não pode ser MAIS e MENOS
  dcGuardar(); dcDesenhar();
  if(r.mais != null && r.menos != null && dc.indice < DISC.BLOCOS.length - 1){
    const ind = dc.indice, rapido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => { if(dc.indice === ind){ dc.indice++; dcDesenhar(); window.scrollTo({ top:0, behavior:'auto' }); } }, rapido ? 0 : 380);
  }
}
function dcAvancar(){
  const r = dc.resp[dc.indice]; if(r.mais == null || r.menos == null) return;
  if(dc.indice < DISC.BLOCOS.length - 1){ dc.indice++; dcDesenhar(); window.scrollTo({ top:0, behavior:'auto' }); }
  else { document.getElementById('dc-barra').style.width = '100%'; dcFinalizar(); }
}
async function dcFinalizar(){
  const falta = dc.resp.findIndex(x => x.mais == null || x.menos == null);
  if(falta > -1){ dc.indice = falta; mostrarTela('#tela-dc-teste'); dcDesenhar(); return; }
  const calc = DISC.calcular(dc.resp);
  const dados = Object.assign({ teste:'disc', versao:1, codigo:dc.codigo, data:hoje(), data_iso:new Date().toISOString(), duracaoMin:dc.inicio ? Math.round((Date.now() - dc.inicio) / 60000) : null,
    consentimento:true, consentimento_contato:!!dc.cad.contato }, dc.cad, { respostas:dc.resp.map((x, i) => ({ bloco:i + 1, mais:x.mais, menos:x.menos })) });
  delete dados.contato;
  dcMostrar('<div class="carregando">Calculando o seu perfil e enviando as respostas...</div>');
  const r = await compRpc('disc_salvar_resposta', { p_dados:dados });
  if(!r || r.ok !== true){
    dcMostrar(`<h1 class="tc-h1">Quase lá</h1>${dcErro((r && r.msg) || 'Não consegui enviar as suas respostas agora. Elas continuam guardadas neste aparelho.')}<button class="btn btn-primario" id="dk-de-novo">Tentar enviar de novo</button>`);
    document.getElementById('dk-de-novo').addEventListener('click', dcFinalizar); return;
  }
  try{ localStorage.removeItem(dcChave(dc.codigo)); }catch(e){}
  const prim = dcPrim(dc.cad.nome);
  if(!dc.mostrar){
    const msg = 'Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + dc.cad.nome + ' e acabei de terminar o DISC (código ' + dc.codigo + '). Fico no aguardo da devolutiva.';
    dcMostrar(`<span class="selo dc-selo">Avaliação concluída</span><h1 class="tc-h1">Obrigado, ${escV(prim)}!</h1>
      <p>As suas respostas foram enviadas para ${escV(dcAp())}, que vai analisar o seu perfil e conversar com você sobre ele.</p>
      <a class="btn btn-zap dc-zap" href="${dcZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Falar agora no WhatsApp<small>abre a conversa com a mensagem pronta</small></span></a>`);
    return;
  }
  dcResultadoPessoa({ nome:dc.cad.nome, whatsapp:dc.cad.whatsapp, email:dc.cad.email, calc, dataTxt:new Date().toLocaleDateString('pt-BR'), codigo:dc.codigo });
}
function dcResultadoPessoa(r){
  const s = dcSecoes(r.calc), prim = dcPrim(r.nome), resumo = dcResumoTexto(r.nome, r.calc);
  const msg = ['Olá, ' + (typeof T_PRIM !== 'undefined' ? T_PRIM : '') + '! Sou ' + r.nome + ' e terminei o DISC (código ' + r.codigo + ').', '', resumo, '', 'Quero conversar sobre o meu perfil.'].join('\n');
  const zapProprio = typeof dvZapNum === 'function' ? dvZapNum(r.whatsapp) : dcDig(r.whatsapp);
  document.getElementById('dc-resultado').innerHTML = `<div class="dc-cliente">
    <span class="selo dc-selo">DISC · Análise Comportamental</span>
    <h1 class="tc-h1">${escV(prim)}, este é o seu perfil comportamental</h1>
    <div class="dc-secao">${s.topo}</div>
    <div class="dc-secao"><h2>Seus 3 perfis</h2><div id="dc-grafs-pessoa"></div>${s.tabela}</div>
    <div class="dc-secao">${s.laudo}</div>
    <div class="dc-secao"><h2>Próximo passo</h2><p>Na devolutiva, ${escV(dcAp())} mostra como usar o seu perfil a seu favor: na sua função, na comunicação com a equipe e no seu desenvolvimento profissional.</p>
      <a class="btn btn-zap dc-zap" href="${dcZapTer(msg)}" target="_blank" rel="noopener"><span class="duas">Quero a minha devolutiva<small>conversa pelo WhatsApp com a mensagem pronta</small></span></a></div>
    <div class="dc-secao"><h2>Guardar o seu resultado</h2><div class="dc-acoes">
      <button type="button" class="btn btn-argila" data-dc-pdf><span class="duas">Baixar relatório em PDF<small>capa, perfis, gráficos e laudo</small></span></button>
      ${zapProprio ? `<a class="btn btn-contorno" href="https://wa.me/${zapProprio}?text=${encodeURIComponent(resumo)}" target="_blank" rel="noopener"><span class="duas">Enviar para o meu WhatsApp<small>o resumo do perfil</small></span></a>` : ''}
      ${dcEmail(r.email) ? `<a class="btn btn-contorno" href="mailto:${escV(r.email)}?subject=${encodeURIComponent('DISC · ' + r.nome)}&body=${encodeURIComponent(resumo)}"><span class="duas">Enviar para o meu e-mail<small>${escV(r.email)}</small></span></a>` : ''}
    </div></div>
    <p class="dc-nota-peq">${escV(DC.AVISO)}</p></div>`;
  mostrarTela('#tela-dc-resultado'); window.scrollTo({ top:0, behavior:'auto' });
  DISC.graficos(document.getElementById('dc-grafs-pessoa'), r.calc).catch(() => {});
  document.querySelectorAll('#dc-resultado [data-dc-pdf]').forEach(b => b.addEventListener('click', () => dcImprimir(r)));
}

/* ---- 3. ÁREA DO DONO DO TESTE ---- */
let dcCache = [];
function dcAdminMontar(){
  if(document.getElementById('painel-dc')) return;
  const base = document.getElementById('painel-mp') || document.getElementById('painel-tc'); if(!base) return;
  base.insertAdjacentHTML('afterend', `
    <div id="painel-dc">
      <div id="dc-abas"><button type="button" class="ativa" data-dc-aba="respostas">Avaliações DISC</button><button type="button" data-dc-aba="codigos">Códigos de acesso</button></div>
      <div id="dc-aba-respostas">
        <div class="campo"><input id="dc-busca" type="search" placeholder="Buscar por nome ou empresa"></div>
        <button type="button" class="mini-btn" id="dc-exportar" style="margin-bottom:12px">Exportar resultados (planilha)</button>
        <div id="dc-lista-respostas"><div class="vazio">Nenhuma avaliação por enquanto.</div></div>
      </div>
      <div id="dc-aba-codigos" style="display:none">
        <div class="cartao">
          <div class="campo"><label for="dc-cod-nome">Nome da pessoa <span class="opc">(opcional)</span></label><input id="dc-cod-nome" type="text" placeholder="Ex.: Maria Souza"></div>
          <div class="campo"><label for="dc-cod-whats">WhatsApp de quem vai receber o link <span class="opc">(opcional)</span></label><input id="dc-cod-whats" type="tel" inputmode="tel" placeholder="(00) 00000-0000"></div>
          <div class="campo"><label id="rot-dc-mostrar">A pessoa vê o resultado no final?</label>
            <div class="alternar" id="dc-alt-mostrar" role="radiogroup" aria-labelledby="rot-dc-mostrar">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, vê<small>perfis, gráficos, laudo e PDF</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não, só eu vejo<small>recebe só um agradecimento</small></button>
            </div></div>
          <div class="campo"><label id="rot-dc-urg">Cronômetro de 60 segundos no final?</label>
            <div class="alternar" id="dc-alt-urg" role="radiogroup" aria-labelledby="rot-dc-urg">
              <button type="button" class="ativa" data-v="1" role="radio" aria-checked="true">Sim, ligado<small>60 s para falar no WhatsApp; depois, só notificação</small></button>
              <button type="button" data-v="0" role="radio" aria-checked="false">Não<small>o WhatsApp fica sempre disponível</small></button>
            </div></div>
          <button class="btn btn-argila" id="dc-gerar">Gerar código</button>
        </div>
        <div id="dc-caixa-codigo"></div>
        <h3 style="font-size:19px;margin:26px 0 12px">Códigos criados</h3>
        <div id="dc-lista-codigos"><div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div></div>
      </div>
      <div id="dc-detalhe" style="display:none"><button class="voltar" id="dc-voltar-lista">← Voltar para a lista</button><div id="dc-detalhe-conteudo"></div></div>
    </div>`);
  mascaraTelefone(document.getElementById('dc-cod-whats'));
  document.querySelectorAll('#dc-abas button').forEach(b => b.addEventListener('click', () => dcAdminAba(b.dataset.dcAba)));
  let mostrarSel = true;
  const alternar = (id, cb) => document.querySelectorAll('#' + id + ' button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#' + id + ' button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); }); if(cb) cb(b); }));
  alternar('dc-alt-urg'); alternar('dc-alt-mostrar', b => { mostrarSel = b.dataset.v === '1'; });
  document.getElementById('dc-busca').addEventListener('input', dcDesenharLista);
  document.getElementById('dc-exportar').addEventListener('click', dcExportar);
  document.getElementById('dc-voltar-lista').addEventListener('click', () => { const a = document.querySelector('#dc-abas button.ativa'); dcAdminAba(a ? a.dataset.dcAba : 'respostas'); });
  document.getElementById('dc-gerar').addEventListener('click', () => dcGerar(mostrarSel));
}
function dcAdminAba(q){
  document.querySelectorAll('#dc-abas button').forEach(x => x.classList.toggle('ativa', x.dataset.dcAba === q));
  document.getElementById('dc-aba-codigos').style.display = q === 'codigos' ? '' : 'none';
  document.getElementById('dc-aba-respostas').style.display = q === 'respostas' ? '' : 'none';
  document.getElementById('dc-detalhe').style.display = 'none';
}
function dcConvite(primeiro, codigo, mostrar){
  return [(primeiro ? 'Olá, ' + primeiro + '!' : 'Olá!') + ' Aqui é ' + dcAp() + '.', '',
    'Separei para você a Análise Comportamental DISC. Ela mostra como você age no trabalho: como decide, se comunica, lida com ritmo e mudanças e com regras e detalhes.', '',
    'É só tocar no link abaixo. O código já vai preenchido:', dcLink(codigo), '',
    'Se o link não abrir direto, o código é: *' + codigo + '*', '',
    'São 24 blocos com 4 palavras, de 8 a 12 minutos. Em cada um, você marca a palavra que MAIS e a que MENOS descreve você. Não existe resposta certa ou errada.',
    mostrar ? 'No final, você vê o seu perfil e baixa o relatório em PDF.' : 'Quando terminar, eu preparo a sua devolutiva.'].join('\n');
}
async function dcGerar(mostrar){
  const b = document.getElementById('dc-gerar'), nomeCli = document.getElementById('dc-cod-nome').value.trim(), zapCli = document.getElementById('dc-cod-whats').value.trim(), caixa = document.getElementById('dc-caixa-codigo');
  const c = clienteMembros(), { data:sess } = await c.auth.getSession();
  if(!sess || !sess.session){ caixa.innerHTML = dcErro('A sua sessão expirou. Saia da área e entre de novo.'); return; }
  b.disabled = true; b.textContent = 'Gerando...';
  let codigo = novoCodigo(), erro = null;
  for(let t = 0; t < 6; t++){
    const { error } = await c.from('travas_codigos').insert({ terapeuta_id:sess.session.user.id, codigo, cliente:nomeCli || null, whatsapp:zapCli || null, mostrar_resultado:mostrar, urgencia:(typeof dvUrgSel === 'function' ? dvUrgSel('dc-alt-urg') : true), teste:'disc', tipo:'individual' });
    erro = error; if(!error) break;
    if(error.code === '23505'){ codigo = novoCodigo(); continue; } break;
  }
  b.disabled = false; b.textContent = 'Gerar código';
  if(erro){ caixa.innerHTML = dcErro('Não consegui gerar o código agora. Saia da área, entre de novo e tente outra vez.'); return; }
  const primeiro = dcPrim(nomeCli), destino = zapNumero(zapCli);
  caixa.innerHTML = `<div class="codigo-gerado"><div class="valor">${codigo}</div>
      <div class="para">${nomeCli ? 'Para ' + escV(nomeCli) + ' · ' : ''}DISC · ${mostrar ? 'a pessoa vê o resultado no final' : 'só você vê o resultado'}</div></div>
    <a class="btn btn-zap" href="https://wa.me/${destino}?text=${encodeURIComponent(dcConvite(primeiro, codigo, mostrar))}" target="_blank" rel="noopener"><span class="duas">${primeiro ? 'Enviar o link para ' + escV(primeiro) : 'Enviar o link pelo WhatsApp'}<small>${destino ? 'abre a conversa com a mensagem pronta' : 'você escolhe o contato na hora'}</small></span></a>
    <button class="btn btn-contorno" id="dc-copiar-link">Copiar o link com o código</button>`;
  document.getElementById('dc-copiar-link').addEventListener('click', async e => { try{ await navigator.clipboard.writeText(dcLink(codigo)); e.target.textContent = 'Link copiado!'; }catch(err){ e.target.textContent = 'Não consegui copiar'; } setTimeout(() => { e.target.textContent = 'Copiar o link com o código'; }, 2000); });
  dcCarregarCodigos();
}
async function dcCarregarCodigos(){
  const caixa = document.getElementById('dc-lista-codigos'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('travas_codigos').select('id,codigo,cliente,criado_em,usado,usado_por,usado_em,mostrar_resultado').eq('terapeuta_id', sess.session.user.id).eq('teste', 'disc').order('criado_em', { ascending:false }).limit(300);
  if(error){ caixa.innerHTML = dcErro('Não consegui carregar os códigos agora.'); return; }
  if(!data.length){ caixa.innerHTML = '<div class="vazio">Nenhum código ainda. Gere o primeiro acima.</div>'; return; }
  caixa.innerHTML = data.map(x => `<div class="linha-item" style="flex-wrap:wrap;cursor:default"><span class="esq"><span class="nome" style="white-space:normal">${x.codigo}${x.cliente ? ' · ' + escV(x.cliente) : ''}<span class="tag-vis">${x.mostrar_resultado === false ? 'só você vê' : 'pessoa vê'}</span></span>
      <span class="sub">${x.usado ? 'respondido por ' + escV(x.usado_por || 'alguém') + ' · ' + dcQuando(x.usado_em) : 'criado em ' + dcQuando(x.criado_em)}</span></span>
      <span class="etiqueta ${x.usado ? 'usado' : 'livre'}">${x.usado ? 'usado' : 'disponível'}</span>
      <span style="display:flex;gap:8px;width:100%;margin-top:8px">${x.usado ? '' : `<button type="button" class="mini-btn" data-dc-link="${x.codigo}">Copiar link</button>`}</span></div>`).join('');
  caixa.querySelectorAll('[data-dc-link]').forEach(b => b.addEventListener('click', async () => { try{ await navigator.clipboard.writeText(dcLink(b.dataset.dcLink)); b.textContent = 'Copiado!'; }catch(err){ b.textContent = 'Não consegui'; } setTimeout(() => { b.textContent = 'Copiar link'; }, 1800); }));
}
async function dcCarregarRespostas(){
  const caixa = document.getElementById('dc-lista-respostas'); caixa.innerHTML = '<div class="carregando">Carregando...</div>';
  const c = clienteMembros(), { data:sess } = await c.auth.getSession(); if(!sess || !sess.session) return;
  const { data, error } = await c.from('disc_respostas').select('id,codigo,nome,dados,criado_em').eq('terapeuta_id', sess.session.user.id).order('criado_em', { ascending:false }).limit(500);
  if(error){ caixa.innerHTML = dcErro('Não consegui carregar as avaliações agora.'); return; }
  dcCache = data || []; dcDesenharLista();
}
function dcDesenharLista(){
  const termo = (document.getElementById('dc-busca').value || '').trim().toLowerCase(), caixa = document.getElementById('dc-lista-respostas');
  const lista = dcCache.filter(x => !termo || ((x.nome || '') + ' ' + ((x.dados || {}).empresa || '')).toLowerCase().includes(termo));
  if(!lista.length){ caixa.innerHTML = '<div class="vazio">Nenhuma avaliação por enquanto.</div>'; return; }
  caixa.innerHTML = lista.map(x => { const calc = DISC.deRegistro(x.dados || {}), d = x.dados || {};
    return `<button type="button" class="linha-item" data-dc-i="${dcCache.indexOf(x)}" data-dv-del="disc" data-id="${x.id}"><span class="esq"><span class="nome">${escV(x.nome)}</span><span class="sub">${escV(dcF(calc.pico).nome)} · estilo ${escV(calc.estilo)}${d.cargo ? ' · ' + escV(d.cargo) : ''}${d.empresa ? ' · ' + escV(d.empresa) : ''} · ${dcQuando(x.criado_em)}</span></span><span class="etiqueta livre" style="background:${dcF(calc.pico).cor};color:#fff">${escV(calc.estilo)}</span></button>`; }).join('');
  caixa.querySelectorAll('[data-dc-i]').forEach(b => b.addEventListener('click', () => dcAbrirDetalhe(dcCache[+b.dataset.dcI])));
}
function dcExportar(){
  if(!dcCache.length) return;
  const cab = ['Identificador', 'Data', 'Nome', 'E-mail', 'WhatsApp', 'Empresa', 'Cargo', 'Código', 'Pico', 'Estilo']
    .concat(...['Adaptado', 'Natural', 'Resultante'].map(k => DISC.ORDEM.map(f => k + ' ' + f)));
  const linhas = dcCache.map(x => { const d = x.dados || {}, c = DISC.deRegistro(d);
    return [x.id, dcQuando(x.criado_em), x.nome, d.email, d.whatsapp, d.empresa, d.cargo, x.codigo, c.pico, c.estilo]
      .concat(...['adaptado', 'natural', 'resultante'].map(k => DISC.ORDEM.map(f => c[k][f]))); });
  const csv = [cab].concat(linhas).map(l => l.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type:'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'disc-resultados-' + (window.T_SLUG || 'pagina') + '.csv'; a.click(); URL.revokeObjectURL(url);
}

/* ---- 4. "GERAR APRESENTAÇÃO" (mesmo gerador do Teste de Travas, com textos de análise comportamental) ----
   Público: quem vende serviços de análise comportamental, desenvolvimento profissional e de equipes (não terapia). */
const DC_APRES_VOC = { pct:true, teste:'DISC', item:'fator', itens:'fatores',
  capaTit:'o seu perfil comportamental e o plano para usar cada força no trabalho.', capaSub:'Plano de desenvolvimento profissional a partir da análise DISC.',
  mapaTit:'Intensidade de cada fator no seu perfil', caminhoTit:'Como vamos desenvolver o seu perfil no trabalho',
  fase1:'Começamos pelo seu fator mais forte, para transformar essa força em resultado. Como trabalhamos: ', fase2:'Depois, desenvolvemos os fatores com menos intensidade, que hoje limitam o seu desempenho. Como trabalhamos: ',
  evol:'Uma nova análise DISC mostra, em números, o quanto o seu comportamento no trabalho evoluiu.',
  altoTxt:'fatores altos: as suas forças naturais no trabalho.', baixoTxt:'fatores mais baixos: o que pode ser desenvolvido.',
  destaque:'É o fator predominante do seu perfil: a sua maior força no trabalho.',
  dica:'Tudo o que aparece na apresentação (os fatores e a intensidade de cada um) vem da análise DISC desta pessoa.',
  objDinheiro:'Comportamento desalinhado com a função custa caro: metas perdidas, retrabalho e conflitos na equipe.',
  objTentei:'Trabalhamos com o seu perfil real, um fator de cada vez, com metas práticas no seu dia a dia de trabalho.',
  picoRot:'forças', suporteRot:'a desenvolver', legPico:'Forças: fatores acima de 50%', legSuporte:'A desenvolver: abaixo de 50%' };
const DC_APRES_LIB = {
  D:{ x:'iniciativa e decisão', y:'potencial', resumo:'O seu perfil mostra como você enfrenta problemas, desafios e metas: a velocidade para decidir e a disposição para assumir o comando.', custo:'Decisões adiadas ou impulsivas, metas que escapam e conflitos por falta de alinhamento.', imagine:['Você decide com rapidez e critério.', 'As suas metas saem do papel com mais consistência.'] },
  I:{ x:'comunicação e influência', y:'conhecimento', resumo:'O seu perfil mostra como você se relaciona, comunica ideias e convence pessoas: clientes, equipe e liderança.', custo:'Ideias que não convencem, vendas que não fecham e relacionamentos que não se sustentam.', imagine:['Você apresenta ideias com clareza e convence.', 'As suas negociações rendem mais resultado.'] },
  S:{ x:'constância e cooperação', y:'dedicação', resumo:'O seu perfil mostra como você lida com ritmo, mudanças e trabalho em equipe: a sua capacidade de sustentar a rotina e apoiar as pessoas.', custo:'Desgaste diante de mudanças, sobrecarga por não dizer não e dificuldade de se posicionar.', imagine:['Você se adapta às mudanças sem perder o ritmo.', 'Você se posiciona sem abrir mão da boa relação.'] },
  C:{ x:'método e qualidade', y:'competência técnica', resumo:'O seu perfil mostra como você lida com regras, padrões e detalhes: o seu cuidado com a qualidade e com a precisão.', custo:'Perfeccionismo que atrasa entregas, excesso de análise e desconforto com o improviso.', imagine:['Você entrega com qualidade e no prazo.', 'Você decide mesmo sem ter todas as informações.'] }
};
const DC_APRES_TEC = {
  D:'metas semanais, treino de decisão com critério e escuta ativa para levar a equipe junto.',
  I:'roteiro de comunicação, prática de apresentação e negociação e organização dos combinados por escrito.',
  S:'treino de posicionamento, planejamento de mudanças por etapas e combinados claros de prioridade.',
  C:'critérios de "bom o suficiente", prazos por etapa e prática de decisão com informação incompleta.'
};
function dcApresentar(x){
  if(typeof apresAbrir !== 'function') return alert('A apresentação não está disponível nesta página.');
  const d = x.dados || {}, calc = DISC.deRegistro(d);
  const lista = DISC.ORDEM.map(f => ({ id:f, nome:dcF(f).nome + ' (' + f + ')', nota:calc.resultante[f], nivel:calc.resultante[f] >= 50 ? 'alta' : 'baixa' })).sort((a, b) => b.nota - a.nota);
  const foto = (document.querySelector('.moldura img') || {}).src || null;
  const insta = ((document.querySelector('a[href*="instagram.com/"]') || {}).href || '').replace(/^.*instagram\.com\//, '').replace(/[\/?#].*$/, '');
  apresAbrir({ nome:x.nome || '', prim:dcPrim(x.nome), genero:'', idade:'', motivo:d.cargo ? 'Desenvolvimento profissional · ' + d.cargo : 'Desenvolvimento profissional', dor:'', olhar:'', atencao:0, travas:lista },
    { voc:DC_APRES_VOC, lib:DC_APRES_LIB, tec:DC_APRES_TEC,
      terap:{ nome:CONFIG.terapeuta, zap:CONFIG.whatsappNumero, insta, papel:'analista comportamental', foto } });
}
async function dcEnviarEmail(destino, assunto, corpo, codigo, b){
  const rotulo = b.innerHTML; b.disabled = true; b.textContent = 'Enviando...';
  let ok = false;
  try{ if(typeof modoLocal !== 'function' || !modoLocal()){ const r = await api(ACOES.enviarEmail, { destino, assunto, corpo, codigo }); ok = !!(r && r.ok !== false); } }catch(e){ ok = false; }
  b.disabled = false;
  if(ok){ b.textContent = 'E-mail enviado para ' + destino; setTimeout(() => { b.innerHTML = rotulo; }, 3000); return; }
  b.innerHTML = rotulo;
  location.href = 'mailto:' + encodeURIComponent(destino) + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo.slice(0, 1800));
}
function dcAbrirDetalhe(x){
  const d = x.dados || {}, calc = DISC.deRegistro(d), zap = zapNumero(d.whatsapp), prim = dcPrim(x.nome);
  const r = { nome:x.nome, calc, dataTxt:dcData(x.criado_em), codigo:x.codigo }, resumo = dcResumoTexto(x.nome, calc), s = dcSecoes(calc);
  document.getElementById('dc-aba-codigos').style.display = 'none'; document.getElementById('dc-aba-respostas').style.display = 'none';
  document.getElementById('dc-detalhe').style.display = 'block';
  const msgZap = ['Olá, ' + prim + '! Aqui é ' + dcAp() + '.', '', 'A sua análise DISC está pronta. Perfil predominante: ' + dcF(calc.pico).nome + ' (estilo ' + calc.estilo + ').', '', 'Vamos marcar a sua devolutiva para eu mostrar como usar o seu perfil a seu favor no trabalho?'].join('\n');
  document.getElementById('dc-detalhe-conteudo').innerHTML = `<h2 style="font-size:24px;margin:6px 0 4px">${escV(x.nome)}</h2>
    <p class="secao-sub">${escV(x.codigo)} · ${dcQuando(x.criado_em)}${d.duracaoMin != null ? ' · ' + d.duracaoMin + ' min' : ''}<br>${escV(d.email || '')}${d.whatsapp ? ' · ' + escV(d.whatsapp) : ''}</p>
    <p class="secao-sub">${[d.cargo, d.empresa].filter(Boolean).map(escV).join(' · ')}${d.consentimento_contato ? ' · autorizou o contato' : ''}</p>
    <div class="dc-acoes">
      ${zap ? `<a class="btn btn-zap" href="https://wa.me/${zap}?text=${encodeURIComponent(msgZap)}" target="_blank" rel="noopener"><span class="duas">Falar com ${escV(prim)} no WhatsApp<small>mensagem pronta para a devolutiva</small></span></a>` : ''}
      <button type="button" class="btn btn-argila" data-dc-apres><span class="duas">Gerar apresentação<small>proposta de desenvolvimento para ${escV(prim)}</small></span></button>
      <button type="button" class="btn btn-argila" data-dc-email="eu"><span class="duas">Enviar para o meu e-mail<small>${escV(CONFIG.emailTerapeuta || '')}</small></span></button>
      ${d.email ? `<button type="button" class="btn btn-contorno" data-dc-email="pessoa"><span class="duas">Enviar para ${escV(prim)}<small>${escV(d.email)}</small></span></button>` : ''}
      <button type="button" class="btn btn-contorno" data-dc-pdf><span class="duas">Salvar em PDF ou imprimir<small>capa, perfis, gráficos e laudo</small></span></button>
      <button type="button" class="btn btn-contorno" data-dc-copiar>Copiar a ficha completa</button>
    </div>
    <div class="dc-rel-tela"><div class="dc-secao">${s.topo}</div><div class="dc-secao"><h2>Os 3 perfis</h2><div id="dc-grafs-det"></div>${s.tabela}</div><div class="dc-secao">${s.laudo}</div></div>
    ${Array.isArray(d.respostas) && d.respostas[0] && d.respostas[0].mais_texto ? `<details class="dc-resp tc-respostas"><summary>As 24 respostas</summary><table><thead><tr><th>Bloco</th><th>+ MAIS</th><th>− MENOS</th></tr></thead><tbody>
      ${d.respostas.map(z => `<tr><td>${z.bloco}</td><td>${escV(z.mais_texto)} <small>(${z.mais_fator})</small></td><td>${escV(z.menos_texto)} <small>(${z.menos_fator})</small></td></tr>`).join('')}</tbody></table></details>` : ''}`;
  window.scrollTo({ top:0, behavior:'auto' });
  DISC.graficos(document.getElementById('dc-grafs-det'), calc).catch(() => {});
  const raiz = document.getElementById('dc-detalhe-conteudo');
  raiz.querySelector('[data-dc-pdf]').addEventListener('click', () => dcImprimir(r));
  raiz.querySelector('[data-dc-apres]').addEventListener('click', () => dcApresentar(x));
  raiz.querySelector('[data-dc-copiar]').addEventListener('click', async e => { const b = e.currentTarget; try{ await navigator.clipboard.writeText(resumo); b.textContent = 'Ficha copiada!'; }catch(err){ b.textContent = 'Não consegui copiar'; } setTimeout(() => { b.textContent = 'Copiar a ficha completa'; }, 2200); });
  raiz.querySelectorAll('[data-dc-email]').forEach(b => b.addEventListener('click', () => {
    const eu = b.dataset.dcEmail === 'eu';
    dcEnviarEmail(eu ? CONFIG.emailTerapeuta : d.email, 'DISC — ' + x.nome + ' (' + dcData(x.criado_em) + ')', resumo, x.codigo, b);
  }));
}

/* ---- 5. SELETOR DE TESTES DA ÁREA, CAPA DE VENDAS E LIGAÇÃO COM O MODELO ---- */
function dcSeletor(ativos){
  const alt = document.getElementById('alt-teste'); if(!alt) return;
  const campo = alt.closest('.campo');
  if(!alt.querySelector('[data-v=disc]')){
    alt.insertAdjacentHTML('beforeend', '<button type="button" data-v="disc" role="radio" aria-checked="false">DISC<small>24 blocos · 4 fatores</small></button>');
    const b = alt.querySelector('[data-v=disc]');
    b.addEventListener('click', () => {
      alt.querySelectorAll('button').forEach(x => { const on = x === b; x.classList.toggle('ativa', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
      const adm = document.getElementById('painel-admin'); adm.classList.remove('modo-tc', 'modo-mp'); adm.classList.add('modo-dc');
      dcAdminAba('respostas'); dcCarregarRespostas(); dcCarregarCodigos();
    });
    alt.querySelectorAll('button').forEach(x => { if(x !== b) x.addEventListener('click', () => document.getElementById('painel-admin').classList.remove('modo-dc')); });
  }
  const bd = alt.querySelector('[data-v=disc]'); if(bd) bd.style.display = ativos.indexOf('disc') > -1 ? '' : 'none';
  if(campo && ativos.length > 1) campo.style.display = '';
}
/* textos do DISC na capa de vendas (devolutiva-carater.js: dvCapaVendas lê window.CV_EXTRA) */
window.CV_EXTRA = Object.assign(window.CV_EXTRA || {}, { disc:{
  rot:'Análise Comportamental DISC', curto:'DISC', tag:'Individual · Ambiente corporativo', titulo:'Análise Comportamental DISC',
  objetivo:'Mostrar como você age no trabalho: como decide, se comunica, lida com ritmo e mudanças e com regras e detalhes. É análise comportamental para a vida profissional, não é terapia nem avaliação psicológica.',
  como:['24 blocos com 4 palavras, de 8 a 12 minutos', 'Em cada bloco, você marca a palavra que MAIS e a que MENOS descreve você', 'Feito para o ambiente de trabalho: seleção, equipes, liderança e vendas'],
  resultado:q => 'Os seus 3 perfis (Adaptado, Natural e Resultante) em gráficos, o perfil predominante e um laudo com áreas recomendadas e estilo de liderança. Depois, a devolutiva com ' + q + '.',
  mapaTitulo:'Os 4 fatores que a análise mede',
  itens:['D', 'I', 'S', 'C'].map(f => ({ nome:DISC.FATORES[f].nome + ' (' + f + ')', desc:DISC.FATORES[f].eixo + ': ' + DISC.FATORES[f].palavras + '.' })),
  pergunta:'Como você age no trabalho?',
  texto:'Análise comportamental para o ambiente corporativo: mostra como você decide, se comunica, lida com ritmo e com regras, com 3 perfis em gráficos e um laudo profissional. Não é ferramenta terapêutica.',
  meta:'24 blocos · 8 a 12 minutos',
  zap:'quero fazer a Análise Comportamental DISC. Como recebo o meu código?',
  descobre:'<b>como você age no trabalho e onde rende mais</b>',
  recebe:q => 'Na análise DISC, os seus 3 perfis em gráficos e o laudo com áreas recomendadas e estilo de liderança',
  tempo:'a análise DISC, de 8 a 12 minutos',
  faq:q => ['O DISC é um teste psicológico ou terapêutico?', 'Não. É uma análise comportamental para o ambiente de trabalho: mostra tendências de comportamento em quatro fatores (Dominância, Influência, Estabilidade e Conformidade). Não é diagnóstico nem avaliação clínica, e não deve ser o único critério de uma decisão.']
} });
function dcInit(){
  if(dcInit.feito) return; dcInit.feito = true;
  dcMontarTelas(); dcAdminMontar();
  try{ const c = (new URLSearchParams(location.search).get('dc') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9); if(c) dcAbrirCapa(c); }catch(e){}
}
/* chamado pelo modelo quando o dono tem o DISC: ativos = lista dos testes dele */
function dcAjustarTestes(ativos){
  dcInit(); dcSeletor(ativos);
  const ROT = { travas:'Teste de Travas Mentais', tracos:'Teste de Traços de Caráter', mpcc:'MPCC', disc:'DISC' };
  document.title = ativos.map(k => ROT[k] || k).join(' · ') + (window.T_NOME ? ' · ' + T_NOME : '');
}
window.dcEntrar = dcEntrar; window.dcAjustarTestes = dcAjustarTestes; window.dcAbrirCapa = dcAbrirCapa;
