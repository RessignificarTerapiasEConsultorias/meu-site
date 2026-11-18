/* Compacta vídeo no navegador (ffmpeg.wasm, duas passadas) para caber no limite de 16 MB do WhatsApp.
   Uso: const arquivo = await window.waVideo.preparar(file)  -> devolve um File MP4 (H.264 + AAC) já compactado. */
(function () {
  const ALVO_MB = 15.0;              // tamanho que buscamos (o limite é 16 MB)
  const TETO_BYTES = 15.9 * 1024 * 1024;
  const FF = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/";
  const CORE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/";
  let ffmpeg = null, carregando = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mb(b) { return (b / 1048576).toFixed(1).replace(".", ",") + " MB"; }
  function dur(s) { s = Math.round(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function lerScript(url) {
    return new Promise(function (ok, no) {
      if (window.FFmpegWASM) return ok();
      const s = document.createElement("script"); s.src = url; s.onload = ok; s.onerror = function () { no(new Error("Não consegui carregar o compactador (internet).")); };
      document.head.appendChild(s);
    });
  }
  async function blobUrl(url, tipo) {
    const r = await fetch(url); if (!r.ok) throw new Error("Não consegui baixar o compactador.");
    return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type: tipo }));
  }
  async function carregar(msg) {
    if (ffmpeg) return ffmpeg;
    if (!carregando) carregando = (async function () {
      msg("Carregando o compactador (só na primeira vez)…");
      await lerScript(FF + "ffmpeg.js");
      const f = new window.FFmpegWASM.FFmpeg();
      await f.load({
        classWorkerURL: await blobUrl(FF + "814.ffmpeg.js", "text/javascript"),
        coreURL: CORE + "ffmpeg-core.js",
        wasmURL: CORE + "ffmpeg-core.wasm"
      });
      ffmpeg = f; return f;
    })().catch(function (e) { carregando = null; throw e; });
    return carregando;
  }

  function infoVideo(file) {
    return new Promise(function (ok, no) {
      const v = document.createElement("video"), u = URL.createObjectURL(file);
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = function () { const r = { s: v.duration, w: v.videoWidth, h: v.videoHeight }; URL.revokeObjectURL(u); isFinite(r.s) && r.s > 0 ? ok(r) : no(new Error("Não consegui ler a duração do vídeo.")); };
      v.onerror = function () { URL.revokeObjectURL(u); no(new Error("Este navegador não leu o vídeo. Tente um MP4 (H.264).")); };
      v.src = u;
    });
  }

  /* escolhe resolução e taxa de bits para ocupar o máximo possível sem passar de ALVO_MB */
  function planejar(info, alvo) {
    const audio = info.s > 420 ? 48 : 64;                                  // kbps, mono
    const total = (alvo || ALVO_MB) * 1024 * 8 / info.s;                              // kbit/s para o arquivo todo
    const video = Math.floor((total - audio) * 0.97);                       // 3% de folga do contêiner
    const proporcao = info.w / info.h;
    let alt = Math.min(480, info.h), perda = false;
    const bpp = function (a) { const l = Math.round(a * proporcao); return video * 1000 / (l * a * 25); };
    while (alt > 240 && bpp(alt) < 0.05) alt = alt > 360 ? 360 : 240;      // pouca taxa: reduz a imagem, melhor que pixelizar
    if (bpp(alt) < 0.03) perda = true;
    return { audio: audio, video: video, alt: alt, perda: perda, bpp: bpp(alt) };
  }

  function painel() {
    let d = document.getElementById("waVideoDlg");
    if (!d) {
      d = document.createElement("dialog"); d.id = "waVideoDlg"; d.className = "janela";
      d.style.maxWidth = "520px"; d.style.width = "92vw";
      document.body.appendChild(d);
    }
    return d;
  }

  async function compactar(file, info, plano, atualizar, modo) {
    const f = await carregar(atualizar);
    const prog = function (e) { atualizar(null, e.progress); };
    f.on("progress", prog);
    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
      const ent = "entrada." + ext;
      await f.writeFile(ent, new Uint8Array(await file.arrayBuffer()));
      let kbps = plano.video, saida = null;
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        const vf = "scale=-2:" + plano.alt + ",format=yuv420p";
        const rapido = modo === "rapido";
        const base = ["-y", "-i", ent, "-vf", vf, "-c:v", "libx264", "-preset", rapido ? "veryfast" : "medium", "-profile:v", "main", "-b:v", kbps + "k", "-maxrate", Math.round(kbps * 1.6) + "k", "-bufsize", Math.round(kbps * 3) + "k"];
        const audioArgs = ["-c:a", "aac", "-b:a", plano.audio + "k", "-ac", "1", "-ar", "44100", "-movflags", "+faststart", "saida.mp4"];
        if (rapido) {
          atualizar("Compactando…", 0);
          await f.exec(base.concat(audioArgs));
        } else {
          const dois = base.concat(["-passlogfile", "pl"]);
          atualizar("Analisando o vídeo (passo 1 de 2)…", 0);
          await f.exec(dois.concat(["-pass", "1", "-an", "-f", "null", "-"]));
          atualizar("Compactando (passo 2 de 2)…", 0);
          await f.exec(dois.concat(["-pass", "2"]).concat(audioArgs));
        }
        const dados = await f.readFile("saida.mp4");
        await f.deleteFile("saida.mp4").catch(function () {});
        if (dados.length <= TETO_BYTES) { saida = dados; break; }
        kbps = Math.floor(kbps * (TETO_BYTES / dados.length) * 0.94);      // passou: refaz com menos
        atualizar("Ficou um pouco grande, ajustando…", 0);
      }
      await f.deleteFile(ent).catch(function () {});
      if (!saida) throw new Error("Não consegui deixar abaixo de 16 MB. Corte o vídeo ou divida em partes.");
      const nome = file.name.replace(/\.[^.]+$/, "") + "-whatsapp.mp4";
      return new File([saida.buffer], nome, { type: "video/mp4" });
    } finally { f.off("progress", prog); }
  }

  /* ponto de entrada: mostra o painel, compacta, deixa assistir e confirmar */
  function preparar(file) {
    return new Promise(function (ok, no) {
      const d = painel(); let url = null, usado = false;
      const fechar = function () { if (url) URL.revokeObjectURL(url); if (d.open) d.close(); };
      const cancelar = function (msg) { fechar(); no(new Error(msg || "Envio cancelado.")); };
      d.innerHTML = '<h2>Vídeo grande demais para o WhatsApp</h2><p class="ajuda" id="wvTxt">Lendo o vídeo…</p><div id="wvAcoes" class="acoes"></div>';
      d.oncancel = function (e) { e.preventDefault(); if (!usado) cancelar(); };
      if (!d.open) d.showModal();
      const txt = d.querySelector("#wvTxt"), acoes = d.querySelector("#wvAcoes");
      const botao = function (rot, cls, fn) { const b = document.createElement("button"); b.type = "button"; b.className = "btn auto " + cls; b.textContent = rot; b.onclick = fn; acoes.appendChild(b); return b; };
      infoVideo(file).then(function (info) {
        const plano = planejar(info);
        const rot = plano.alt + "p, " + dur(info.s);
        let aviso = "";
        if (plano.perda) aviso = '<br><br><b>Atenção:</b> o vídeo é longo para 16 MB, então a qualidade vai cair de forma visível. Se puder, corte ou divida em duas partes.';
        else if (plano.alt < Math.min(480, info.h)) aviso = "<br><br>Para manter a imagem nítida, vou reduzir para " + plano.alt + "p.";
        txt.innerHTML = "Arquivo de <b>" + mb(file.size) + "</b> (" + dur(info.s) + ", " + info.w + "×" + info.h + "). O WhatsApp só aceita vídeo até 16 MB. Vou compactar para cerca de " + ALVO_MB + " MB em " + rot + ", com o melhor aproveitamento possível. Você assiste antes de enviar." + aviso + "<br><br>Pode levar alguns minutos. Mantenha esta aba aberta.";
        acoes.innerHTML = "";
        botao("Compactar", "", function () {
          acoes.innerHTML = '<div class="wa-barra" style="flex:1"><i id="wvBarra" style="width:0%"></i></div>';
          let msg = "Preparando…";
          const atualizar = function (m, p) {
            if (m) msg = m;
            const pct = p ? Math.min(100, Math.round(p * 100)) : 0;
            txt.innerHTML = msg + (p ? " <b>" + pct + "%</b>" : "");
            const b = d.querySelector("#wvBarra"); if (b) b.style.width = pct + "%";
          };
          compactar(file, info, plano, atualizar).then(function (novo) {
            url = URL.createObjectURL(novo);
            txt.innerHTML = 'Pronto: <b>' + mb(novo.size) + '</b> (era ' + mb(file.size) + '). Confira a qualidade:<br><video controls playsinline style="width:100%;max-height:50vh;margin-top:8px;border-radius:10px" src="' + url + '"></video>';
            acoes.innerHTML = "";
            botao("Enviar este vídeo", "", function () { usado = true; if (url) { /* mantém URL até enviar */ } d.close(); ok(novo); });
            botao("Cancelar", "contorno", function () { cancelar(); });
          }).catch(function (e) { fechar(); no(e); });
        });
        botao("Cancelar", "contorno", function () { cancelar(); });
      }).catch(function (e) { fechar(); no(e); });
    });
  }


  /* compactação em segundo plano: sem janela que prende a tela. Uma de cada vez (o compactador só roda um vídeo por vez).
     opcoes: { modo: "rapido" (padrão, 1 passada, alvo 14 MB) | "qualidade" (2 passadas, alvo 15 MB), aoMudar({msg, p, info}) }
     devolve { promessa, cancelar(), info } */
  let fila = Promise.resolve();
  function segundoPlano(file, opcoes) {
    opcoes = opcoes || {};
    const modo = opcoes.modo === "qualidade" ? "qualidade" : "rapido";
    const job = { cancelado: false, rodando: false, info: null, modo: modo };
    const avisar = function (m, p) { if (!job.cancelado && opcoes.aoMudar) opcoes.aoMudar({ msg: m, p: p || 0, info: job.info }); };
    job.cancelar = function () {
      job.cancelado = true;
      if (job.rodando && ffmpeg) { try { ffmpeg.terminate(); } catch (e) {} ffmpeg = null; carregando = null; }
    };
    job.promessa = new Promise(function (ok, no) {
      fila = fila.then(async function () {
        if (job.cancelado) return no(new Error("Cancelado."));
        job.rodando = true;
        try {
          avisar("Lendo o vídeo…", 0);
          job.info = await infoVideo(file);
          const plano = planejar(job.info, modo === "rapido" ? 14 : ALVO_MB);
          const novo = await compactar(file, job.info, plano, avisar, modo);
          if (job.cancelado) throw new Error("Cancelado.");
          ok(novo);
        } catch (e) { no(job.cancelado ? new Error("Cancelado.") : e); }
        finally { job.rodando = false; }
      });
    });
    return job;
  }

  window.waVideo = { preparar: preparar, planejar: planejar, segundoPlano: segundoPlano };
})();
