/* CRM WhatsApp: leitura de listas de contatos (Excel, CSV, PDF, TXT).
   Acha sozinho as colunas de nome e telefone, confere a quantidade de dígitos, corrige o 9 que falta,
   ignora linhas sem telefone e junta repetidos. Não depende da página (dá para testar no Node). */
(function (raiz) {
  "use strict";

  const DDDS = new Set(("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 " +
    "61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99").split(" "));

  /* mesma regra do servidor (private.wa_fone_chave): celular do Brasil sem o 9º dígito */
  function chaveFone(d) { return /^55[1-9][1-9]9\d{8}$/.test(d) ? d.slice(0, 4) + d.slice(5) : d; }

  function textoDaCelula(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return isFinite(v) ? (Number.isInteger(v) ? String(v) : String(Math.round(v))) : "";
    if (v instanceof Date) return "";
    return String(v).replace(/ /g, " ").trim();
  }
  const temLetra = function (s) { return /[A-Za-zÀ-ÿ]/.test(s); };
  const qtdLetras = function (s) { return (s.match(/[A-Za-zÀ-ÿ]/g) || []).length; };
  const qtdDigitos = function (s) { return (s.match(/\d/g) || []).length; };

  /* ---------- telefone ---------- */
  /* devolve { ok, fone, avisos[] } ou { ok:false, motivo }. fone = 55 + DDD + número (12 ou 13 dígitos) */
  function analisarFone(bruto, dddPadrao) {
    const txt = textoDaCelula(bruto);
    let d = txt.replace(/\D/g, "");
    if (!d) return { ok: false, vazio: true, motivo: "sem telefone" };
    const avisos = [];
    d = d.replace(/^0+/, "");                       // 0 de operadora/tronco: 081 99999-8888
    let nac;
    if ((d.length === 12 || d.length === 13) && d.startsWith("55")) nac = d.slice(2);
    else if (d.length === 10 || d.length === 11) nac = d;
    else if (d.length === 8 || d.length === 9) {
      const ddd = String(dddPadrao || "").replace(/\D/g, "");
      if (!DDDS.has(ddd)) return { ok: false, motivo: "sem DDD (" + d.length + " dígitos) e o DDD padrão não é válido" };
      nac = ddd + d; avisos.push("sem DDD: usei " + ddd);
    } else if (d.length < 8) return { ok: false, motivo: "poucos dígitos (" + d.length + ")" };
    else return { ok: false, motivo: "quantidade de dígitos fora do padrão brasileiro (" + d.length + ")" };

    const ddd = nac.slice(0, 2);
    let num = nac.slice(2);
    if (!DDDS.has(ddd)) return { ok: false, motivo: "DDD inválido (" + ddd + ")" };
    if (num.length === 8) {
      if ("6789".indexOf(num[0]) > -1) { num = "9" + num; avisos.push("faltava o 9: adicionei"); }
      else return { ok: false, motivo: "telefone fixo (8 dígitos começando com " + num[0] + "), não recebe WhatsApp" };
    } else if (num[0] !== "9") return { ok: false, motivo: "celular com 9 dígitos que não começa com 9" };
    if (/^(\d)\1+$/.test(num)) return { ok: false, motivo: "número repetido (" + num + ")" };
    return { ok: true, fone: "55" + ddd + num, avisos: avisos };
  }

  /* uma célula pode ter vários números: "81 99999-8888 / 3333-2222" */
  function primeiroFoneValido(txt, dddPadrao) {
    const partes = String(txt).split(/\s*(?:[\/;|]|\bou\b)\s*/i).filter(function (p) { return qtdDigitos(p); });
    let primeiroErro = null;
    for (const p of partes) {
      const r = analisarFone(p, dddPadrao);
      if (r.ok) return r;
      if (!primeiroErro) primeiroErro = r;
    }
    return primeiroErro || { ok: false, vazio: true, motivo: "sem telefone" };
  }

  /* ---------- nome ---------- */
  function limparNome(v) {
    let n = textoDaCelula(v).replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, "").replace(/\s+/g, " ");
    if (!temLetra(n) || n.indexOf("@") > -1) return "";
    if (/^(sem nome|n\/?a|nulo|null|undefined|-+|\.+)$/i.test(n)) return "";
    return n.slice(0, 80);
  }

  /* célula que mistura texto e número ("Maria Silva - 81 99999-8888") */
  function separarNomeFone(txt) {
    const re = /\+?\(?\d[\d\s().\-]{6,}\d/g;
    let m, achado = null;
    while ((m = re.exec(txt))) { const q = qtdDigitos(m[0]); if (q >= 8 && q <= 15) achado = m; }
    if (!achado) return { nome: txt, tel: "" };
    const resto = (txt.slice(0, achado.index) + " " + txt.slice(achado.index + achado[0].length)).replace(/[\-–—:,;|]+/g, " ").replace(/\s+/g, " ").trim();
    return { nome: resto, tel: achado[0] };
  }

  /* ---------- tabela (linhas de células) ---------- */
  const RE_FONE_COL = /(whats|zap|celular|cel\b|telefone|fone|\btel\b|n[uú]mero|phone|contato)/i;
  const RE_NOME_COL = /(\bnome\b|name|cliente|aluno|paciente|pessoa|respons[aá]vel|\bnome completo\b)/i;
  const RE_SOBRENOME = /sobrenome|last ?name/i;

  function acharCabecalho(linhas) {
    for (let i = 0; i < Math.min(linhas.length, 12); i++) {
      const cel = linhas[i].map(textoDaCelula);
      const fones = [], nomes = [];
      cel.forEach(function (c, j) {
        if (!c || qtdDigitos(c) > 3 || c.length > 40) return;
        if (RE_FONE_COL.test(c) && !RE_NOME_COL.test(c)) fones.push(j);
        else if (RE_NOME_COL.test(c) || RE_SOBRENOME.test(c)) nomes.push(j);
      });
      if (fones.length) {
        /* WhatsApp/celular antes de telefone fixo/contato */
        const prio = function (j) { const c = cel[j]; return /whats|zap/i.test(c) ? 0 : /cel/i.test(c) ? 1 : /telefone|fone|tel\b/i.test(c) ? 2 : 3; };
        fones.sort(function (a, b) { return prio(a) - prio(b) || a - b; });
        return { linha: i, fones: fones, nomes: nomes, cel: cel };
      }
    }
    return null;
  }

  /* procura telefone e nome em qualquer célula da linha (planilha sem cabeçalho, ou PDF com coluna vazia) */
  function varrerLinha(cel, ddd, pular) {
    let fone = null, erro = null, bruto = "", nome = "";
    cel.forEach(function (c, j) {
      if (!c || (pular && pular(j))) return;
      const dig = qtdDigitos(c);
      if (dig >= 8) {
        let txt = c, nomeJunto = "";
        if (qtdLetras(c) >= 2) { const s = separarNomeFone(c); txt = s.tel || c; nomeJunto = s.nome; }
        if (!bruto) bruto = txt;
        const r = primeiroFoneValido(txt, ddd);
        if (r.ok && !fone) { fone = r; bruto = txt; if (!nome) nome = limparNome(nomeJunto); }
        else if (!r.ok && !erro) erro = r;
      } else if (!nome && qtdLetras(c) >= 2 && !dig) nome = limparNome(c);
      else if (!bruto && dig >= 4 && qtdLetras(c) < 2) bruto = c;          // pedaço de telefone: vira aviso de "poucos dígitos"
    });
    if (!fone && !erro && bruto) erro = analisarFone(bruto, ddd);
    return { fone: fone, erro: erro, bruto: bruto, nome: nome };
  }

  /* linhas: array de arrays (células). Devolve o resultado da análise. */
  function processarLinhas(linhas, opcoes) {
    const ddd = (opcoes && opcoes.ddd) || "81";
    const cab = acharCabecalho(linhas);
    const validos = [], ignorados = [];
    let lidas = 0;

    linhas.forEach(function (linha, idx) {
      if (cab && idx <= cab.linha) return;
      const cel = linha.map(textoDaCelula);
      if (!cel.some(Boolean)) return;
      lidas++;
      let nome = "", fone = null, erro = null, bruto = "";

      if (cab) {
        for (const j of cab.fones) {
          const c = cel[j] || ""; if (!c) continue;
          if (!bruto) bruto = c;
          const r = primeiroFoneValido(c, ddd);
          if (r.ok) { fone = r; bruto = c; break; }
          if (!erro) erro = r;
        }
        if (!fone && !erro && !bruto) {
          /* coluna de telefone vazia: no PDF a célula vazia some e o número cai em outra coluna */
          const ignorar = function (j) { return /cpf|cnpj|\bcep\b|\brg\b|matr[ií]cula|c[oó]digo|nasc|data|\bid\b/i.test(cab.cel[j] || ""); };
          const v = varrerLinha(cel, ddd, ignorar);
          if (v.fone) { fone = v.fone; bruto = v.bruto; } else if (v.erro) { erro = v.erro; bruto = v.bruto; }
        }
        nome = limparNome(cab.nomes.map(function (j) { return cel[j] || ""; }).filter(Boolean).join(" "));
        if (!nome && !cab.nomes.length) { /* sem coluna de nome: pega o primeiro texto da linha */
          for (const c of cel) { const n = limparNome(c); if (n && !qtdDigitos(c)) { nome = n; break; } }
        }
      } else {
        /* sem cabeçalho: procura o telefone e o nome em qualquer célula */
        const v = varrerLinha(cel, ddd);
        fone = v.fone; erro = v.erro; bruto = v.bruto; nome = v.nome;
      }

      if (fone) validos.push({ nome: nome, fone: fone.fone, avisos: fone.avisos, linha: idx + 1, bruto: bruto });
      else ignorados.push({ nome: nome, bruto: bruto, linha: idx + 1,
        motivo: erro && !erro.vazio ? erro.motivo : "sem telefone" });
    });

    /* repetidos: mesmo número, ou o mesmo número com e sem o 9 */
    const mapa = {}, unicos = [];
    let duplicados = 0;
    validos.forEach(function (p) {
      const k = chaveFone(p.fone), ja = mapa[k];
      if (!ja) { mapa[k] = p; unicos.push(p); return; }
      duplicados++;
      if (!ja.nome && p.nome) ja.nome = p.nome;
      if (ja.fone.length < p.fone.length) ja.fone = p.fone;      // fica com a versão com 9
    });
    return {
      lidas: lidas, itens: unicos, ignorados: ignorados, duplicados: duplicados, cabecalho: !!cab,
      semNome: unicos.filter(function (p) { return !p.nome; }).length,
      corrigidos: unicos.filter(function (p) { return p.avisos.length; }).length
    };
  }

  /* junta o resultado de vários arquivos (cada um analisado com o seu cabeçalho), sem repetir número */
  function juntarResultados(lista) {
    const mapa = {}, itens = [], ignorados = [];
    let lidas = 0, duplicados = 0, cabecalho = false;
    lista.forEach(function (r) {
      lidas += r.lidas; duplicados += r.duplicados; cabecalho = cabecalho || r.cabecalho;
      r.ignorados.forEach(function (i) { ignorados.push(i); });
      r.itens.forEach(function (p) {
        const k = chaveFone(p.fone), ja = mapa[k];
        if (!ja) { mapa[k] = p; itens.push(p); return; }
        duplicados++;
        if (!ja.nome && p.nome) ja.nome = p.nome;
        if (ja.fone.length < p.fone.length) ja.fone = p.fone;
      });
    });
    return {
      lidas: lidas, itens: itens, ignorados: ignorados, duplicados: duplicados, cabecalho: cabecalho,
      semNome: itens.filter(function (p) { return !p.nome; }).length,
      corrigidos: itens.filter(function (p) { return p.avisos.length; }).length
    };
  }

  /* ---------- e-mails (Fase 8): acha as colunas de e-mail, WhatsApp e nome ---------- */
  const RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
  function emailDaCelula(v) { const m = RE_EMAIL.exec(textoDaCelula(v)); return m ? m[0].toLowerCase() : ""; }
  /* linhas: matriz da planilha. Devolve { itens:[{email,nome,fone}], lidas, semEmail, colunas:{email,fone,nome}, cabecalho } */
  function processarEmails(linhas, opcoes) {
    opcoes = opcoes || {};
    const rows = (linhas || []).filter(function (l) { return Array.isArray(l) && l.some(function (c) { return textoDaCelula(c); }); });
    const largura = rows.reduce(function (m, l) { return Math.max(m, l.length); }, 0);
    const conta = function (fn) { const out = []; for (let j = 0; j < largura; j++) out.push(rows.reduce(function (n, l) { return n + (fn(l[j]) ? 1 : 0); }, 0)); return out; };
    const nEmail = conta(function (c) { return !!emailDaCelula(c); });
    let colEmail = -1; nEmail.forEach(function (n, j) { if (n > 0 && (colEmail < 0 || n > nEmail[colEmail])) colEmail = j; });
    if (colEmail < 0) return { itens: [], lidas: rows.length, semEmail: rows.length, colunas: {}, cabecalho: false, erro: "Não achei nenhuma coluna com e-mail nesta planilha." };
    const cab = rows.length && !emailDaCelula(rows[0][colEmail]) && rows[0].some(function (c) { return temLetra(textoDaCelula(c)); }) ? rows[0].map(function (c) { return semAcentoMin(textoDaCelula(c)); }) : null;
    const corpo = cab ? rows.slice(1) : rows;
    const nFone = conta(function (c) { return qtdDigitos(textoDaCelula(c)) >= 8 && primeiroFoneValido(textoDaCelula(c), opcoes.ddd).ok; });
    let colFone = -1; nFone.forEach(function (n, j) { if (j !== colEmail && n > 0 && (colFone < 0 || n > nFone[colFone])) colFone = j; });
    if (cab) cab.forEach(function (h, j) { if (j !== colEmail && /(whats|celular|telefone|fone|contato)/.test(h) && nFone[j] > 0) colFone = j; });
    let colNome = -1;
    if (cab) cab.forEach(function (h, j) { if (colNome < 0 && j !== colEmail && j !== colFone && /(^|\s)(nome|name|cliente|aluno|paciente)/.test(h)) colNome = j; });
    if (colNome < 0) { const nNome = conta(function (c) { return qtdLetras(textoDaCelula(c)) >= 3 && !emailDaCelula(c) && qtdDigitos(textoDaCelula(c)) < 4; }); nNome.forEach(function (n, j) { if (j !== colEmail && j !== colFone && n > 0 && (colNome < 0 || n > nNome[colNome])) colNome = j; }); }
    const itens = []; let semEmail = 0;
    corpo.forEach(function (l) {
      const bruto = textoDaCelula(l[colEmail]);
      if (!bruto) { semEmail++; return; }
      const email = emailDaCelula(bruto) || bruto.slice(0, 120);
      const f = colFone > -1 ? primeiroFoneValido(textoDaCelula(l[colFone]), opcoes.ddd) : { ok: false };
      itens.push({ email: email, nome: colNome > -1 ? limparNome(l[colNome]) : "", fone: f.ok ? f.fone : "" });
    });
    return { itens: itens, lidas: corpo.length, semEmail: semEmail, colunas: { email: colEmail, fone: colFone, nome: colNome }, cabecalho: !!cab };
  }
  function semAcentoMin(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  /* ---------- leitura de arquivos (só no navegador) ---------- */
  const URL_XLSX = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
  const URL_PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
  const URL_PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  const carregados = {};
  function carregarScript(url) {
    if (!carregados[url]) carregados[url] = new Promise(function (ok, erro) {
      const s = document.createElement("script"); s.src = url; s.onload = ok;
      s.onerror = function () { delete carregados[url]; erro(new Error("Não consegui carregar o leitor de arquivos. Confira a internet e tente de novo.")); };
      document.head.appendChild(s);
    });
    return carregados[url];
  }

  async function linhasDeExcel(file) {
    await carregarScript(URL_XLSX);
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    let linhas = [];
    wb.SheetNames.forEach(function (nome) {
      const ws = wb.Sheets[nome]; if (!ws) return;
      linhas = linhas.concat(XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "", blankrows: false }));
    });
    return linhas;
  }

  async function linhasDePdf(file) {
    await carregarScript(URL_PDFJS);
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const t = await (await fetch(URL_PDFJS_WORKER)).text();
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([t], { type: "text/javascript" }));
    }
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const linhas = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const itens = (await (await pdf.getPage(p)).getTextContent()).items.filter(function (i) { return String(i.str).trim(); });
      const faixas = [];
      itens.sort(function (a, b) { return b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]; }).forEach(function (i) {
        const y = i.transform[5];
        let f = faixas.find(function (x) { return Math.abs(x.y - y) <= 3; });
        if (!f) { f = { y: y, itens: [] }; faixas.push(f); }
        f.itens.push(i);
      });
      faixas.sort(function (a, b) { return b.y - a.y; }).forEach(function (f) {
        f.itens.sort(function (a, b) { return a.transform[4] - b.transform[4]; });
        const cel = []; let atual = "", fim = null;
        f.itens.forEach(function (i) {
          const x = i.transform[4];
          if (fim !== null && x - fim > 10) { cel.push(atual.trim()); atual = ""; }
          atual += (atual && !/\s$/.test(atual) && !/^\s/.test(i.str) ? " " : "") + i.str;
          fim = x + (i.width || 0);
        });
        if (atual.trim()) cel.push(atual.trim());
        linhas.push(cel);
      });
    }
    return linhas;
  }

  async function linhasDoArquivo(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (ext === "pdf") {
      const l = await linhasDePdf(file);
      if (!l.length) throw new Error("O PDF \"" + file.name + "\" não tem texto (parece uma imagem escaneada). Use a planilha ou um PDF gerado no computador.");
      return l;
    }
    if (["xlsx", "xls", "xlsm", "xlsb", "ods", "csv"].indexOf(ext) > -1) return linhasDeExcel(file);
    if (ext === "txt") return (await file.text()).split(/\r?\n/).map(function (l) { return /[;\t]/.test(l) ? l.split(/[;\t]/) : [l]; });
    throw new Error("Formato não aceito (\"." + ext + "\"). Envie Excel (.xlsx, .xls), CSV ou PDF.");
  }

  raiz.WaLista = { processarEmails: processarEmails, analisarFone: analisarFone, processarLinhas: processarLinhas, chaveFone: chaveFone, juntarResultados: juntarResultados, limparNome: limparNome, linhasDoArquivo: linhasDoArquivo };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.WaLista;
})(typeof window !== "undefined" ? window : globalThis);
