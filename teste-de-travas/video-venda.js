/* Vídeo de apresentação nas páginas de venda (mesmo player da página do Teste de Travas).
   Uso: <figure class="lv" data-drive="ID_DO_DRIVE"> com .lv-caixa, video, .lv-play, .lv-pausa, .lv-cheia, .lv-fim, .lv-barra i.
   O vídeo fica hospedado no site; se o arquivo falhar, entra o player do Google Drive. */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll("figure.lv[data-drive]"), function (fig) {
    var cx = fig.querySelector(".lv-caixa"), vd = cx && cx.querySelector("video"); if (!vd) return;
    var fim = cx.querySelector(".lv-fim"), barra = cx.querySelector(".lv-barra i"), falhou = false, titulo = vd.getAttribute("aria-label") || "Vídeo";
    var drive = function () {
      if (falhou) return; falhou = true;
      cx.innerHTML = '<iframe title="' + titulo.replace(/"/g, "") + '" src="https://drive.google.com/file/d/' + fig.getAttribute("data-drive") + '/preview" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe><div class="lv-bloqueio" aria-hidden="true"></div>';
    };
    vd.addEventListener("error", drive, true);
    var src = vd.querySelector("source"); if (src) src.addEventListener("error", drive);
    cx.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    var tocar = function () { fim.hidden = true; cx.classList.remove("acabou"); cx.classList.add("tocando"); var p = vd.play(); if (p && p.catch) p.catch(function () { cx.classList.remove("tocando"); }); };
    cx.querySelector(".lv-play").addEventListener("click", tocar);
    cx.querySelector(".lv-pausa").addEventListener("click", tocar);
    vd.addEventListener("click", function () { if (vd.paused) tocar(); else vd.pause(); });
    vd.addEventListener("play", function () { cx.classList.add("tocando"); cx.classList.remove("pausado"); });
    vd.addEventListener("pause", function () { if (!vd.ended) cx.classList.add("pausado"); });
    vd.addEventListener("waiting", function () { cx.classList.add("carregando"); });
    vd.addEventListener("playing", function () { cx.classList.remove("carregando"); });
    vd.addEventListener("timeupdate", function () { if (vd.duration && barra) barra.style.width = (vd.currentTime / vd.duration * 100).toFixed(2) + "%"; });
    vd.addEventListener("ended", function () { if (barra) barra.style.width = "100%"; cx.classList.remove("tocando", "pausado"); cx.classList.add("acabou"); fim.hidden = false; try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} });
    cx.querySelector(".lv-denovo").addEventListener("click", function () { vd.currentTime = 0; tocar(); });
    var cta = fim.querySelector("a"); if (cta) cta.addEventListener("click", function () { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {} });
    cx.querySelector(".lv-cheia").addEventListener("click", function () {
      try { if (document.fullscreenElement) return document.exitFullscreen();
        if (cx.requestFullscreen) cx.requestFullscreen(); else if (vd.webkitEnterFullscreen) vd.webkitEnterFullscreen(); } catch (e) {}
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting && !vd.paused && !document.fullscreenElement) vd.pause(); }); }, { threshold: 0.2 }).observe(cx);
  });
})();
