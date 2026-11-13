"""Gera sozinho (GitHub Actions, a cada 30 min, ou na mão) as páginas dos links com o nome do teste: site/<terapeuta>/<teste>/?c=CÓDIGO
Cada pasta tem a prévia do WhatsApp (título, descrição e imagem do teste com a foto da terapeuta) e leva para
/teste/?t=<terapeuta>&<parâmetro do teste>=CÓDIGO. A raiz /<terapeuta>/ leva para a página dela.
Também grava o 404.html do site, que faz o mesmo caminho para terapeuta ou teste novo (sem a prévia, até rodar este gerador de novo).
Só para os testes que cada terapeuta tem (travas_paginas.dados.testes, lido pela função pública travas_paginas_links).
Teste que saiu da página perde a pasta; teste ou terapeuta novos ganham a pasta e a imagem da prévia.
uso (na raiz do site): python3 -I .github/links/gerar.py   ->  grava .github/links/plano.json com as imagens a gerar (node .github/links/og.js)"""
import hashlib, html, json, os, re, shutil, sys, urllib.request

SITE = "https://ressignificarterapiaseconsultorias.com"
TESTES = {
    "travas": dict(pasta="teste-de-travas", param="c", nome="Teste de Travas Mentais", selo="Teste de Travas Mentais", h1="O que está <em>travando</em> você?",
                   sub="Descubra, em poucos minutos, quais das 10 travas mentais estão mais ativas em você hoje.", chips=["Cerca de 7 minutos", "Pelo celular", "Resultado em números"]),
    "tracos": dict(pasta="tracos-de-carater", param="ct", nome="Teste de Traços de Caráter", selo="Teste de Traços de Caráter", h1="Os seus <em>traços</em> de caráter",
                   sub="Entenda os traços que moldam o jeito como você sente, reage e se relaciona. Individual ou casal.", chips=["Individual ou casal", "Pelo celular", "Mapa dos traços"]),
    "mpcc": dict(pasta="mpcc", param="mp", nome="MPCC · Mapa de Perfil Comportamental e Competências", selo="MPCC · Perfil e competências", h1="O seu <em>perfil</em> em 8 dimensões",
                 sub="Um mapa das suas competências comportamentais, com radar e relatório completo.", chips=["8 dimensões", "Pelo celular", "Relatório em PDF"]),
    "disc": dict(pasta="disc", param="dc", nome="Análise Comportamental DISC", selo="Análise Comportamental DISC", h1="O seu perfil <em>DISC</em>",
                 sub="Como você age no trabalho: Dominância, Influência, Estabilidade e Conformidade.", chips=["8 a 12 minutos", "Pelo celular", "Relatório completo"]),
    "ansiedade": dict(pasta="teste-de-ansiedade", param="an", nome="Teste de Ansiedade", selo="Teste de Ansiedade · Acompanhamento", h1="Como está a sua <em>ansiedade</em>?",
                      sub="Um retrato em 6 áreas, com escala validada, e o acompanhamento da sua evolução.", chips=["Cerca de 7 minutos", "Pelo celular", "Evolução a cada 15 dias"]),
    "familia": dict(pasta="travas-em-familia", param="c", extra="f=1", nome="Travas em Família", selo="Para pais, mães e responsáveis", h1="Travas em <em>Família</em>",
                    sub="Descubra o que você carrega da sua história e como isso aparece na vida do seu filho.", chips=["Cerca de 8 minutos", "Pelo celular", "Resultado na hora"]),
    "serena": dict(pasta="mente-serena", param="c", nome="Diagnóstico Mente Serena", selo="Diagnóstico Mente Serena", h1="Mente <em>Serena</em>",
                   sub="Um retrato do seu equilíbrio emocional em 7 pilares, num mapa em teia.", chips=["7 pilares", "Pelo celular", "Mapa em teia"]),
    "esquemas": dict(pasta="esquemas", param="c", nome="Esquemas e Necessidades Emocionais", selo="Esquemas e Necessidades Emocionais", h1="Os seus <em>esquemas</em> emocionais",
                     sub="Entenda os padrões emocionais que se repetem na sua vida, a partir do modelo de Young.", chips=["5 partes", "Pelo celular", "Resultado detalhado"]),
    "tdah": dict(pasta="tdah", param="c", nome="Escala de TDAH (ETDAH-AD)", selo="Escala ETDAH-AD · Triagem", h1="Atenção, foco e <em>organização</em>",
                 sub="Uma triagem para adultos sobre atenção, organização e impulsividade. Não é diagnóstico.", chips=["Triagem", "Pelo celular", "Resultado na hora"]),
}
MAPA_JS = json.dumps({t["pasta"]: {"p": t["param"], **({"f": 1} if t.get("extra") else {})} for t in TESTES.values()}, separators=(",", ":"))
REDIRECIONA = ("var M=" + MAPA_JS + ";var p=location.pathname.split('/').filter(Boolean);var q=new URLSearchParams(location.search);"
               "var c=q.get('c')||q.get('codigo')||'';var d=new URLSearchParams();d.set('t',(p[0]||'').toLowerCase());var m=M[(p[1]||'').toLowerCase()];"
               "if(c&&m){d.set(m.p,c);if(m.f)d.set('f','1');}q.forEach(function(v,k){if(k!=='c'&&k!=='codigo'&&k!=='t')d.set(k,v);});"
               "location.replace('/teste/?'+d.toString()+location.hash);")
e = html.escape


def pagina(titulo, desc, img, url):
    return f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ressignificar Terapias &amp; Consultorias">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{e(img)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(titulo)}">
<meta property="og:url" content="{e(url)}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#121317">
<style>html,body{{margin:0;height:100%;background:#121317;color:#F4ECDD;font-family:system-ui,sans-serif;display:grid;place-items:center;text-align:center}}a{{color:#E8CB7E}}</style>
<script>{REDIRECIONA}</script>
</head><body><p>Abrindo o teste… <a href="/teste/?t={e(url.split('/')[3])}">toque aqui se não abrir</a>.</p></body></html>
'''


PAGINA_404 = '''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ressignificar Terapias &amp; Consultorias</title><meta name="robots" content="noindex">
<style>html,body{margin:0;min-height:100%;background:#121317;color:#F4ECDD;font-family:system-ui,sans-serif}main{max-width:520px;margin:0 auto;padding:22vh 20px;text-align:center}a{color:#E8CB7E}#n{display:none}</style>
<script>
/* link com o nome do teste (site/<terapeuta>/<teste>/?c=CÓDIGO) de terapeuta ou teste novo: confere a página e abre o teste */
(function(){var p=location.pathname.split('/').filter(Boolean);
if(p.length<1||p.length>2||!/^[a-z0-9-]{3,60}$/i.test(p[0])||(p[1]&&!/^[a-z0-9-]{2,40}$/i.test(p[1]))){document.documentElement.className='nao';return;}
fetch('https://gobjhepmnijoceirwgow.supabase.co/rest/v1/rpc/travas_pagina_publica',{method:'POST',headers:{'Content-Type':'application/json',apikey:'__CHAVE__',Authorization:'Bearer __CHAVE__'},body:JSON.stringify({p_slug:p[0].toLowerCase()})})
.then(function(r){return r.json();}).then(function(t){if(!(t&&t.ok)){document.documentElement.className='nao';return;}var K=__CHAVES__,ts=(t.dados&&t.dados.testes)||['travas'];if(p[1]&&ts.indexOf(K[p[1].toLowerCase()])<0){location.replace('/'+p[0].toLowerCase()+'/');return;}__REDIRECIONA__})
.catch(function(){document.documentElement.className='nao';});})();
</script><style>html.nao #n{display:block}html.nao #a{display:none}</style></head>
<body><main><p id="a">Abrindo…</p><div id="n"><h1 style="font-weight:500">Página não encontrada</h1><p>Confira o link que você recebeu ou <a href="/">volte para o início</a>.</p></div></main></body></html>
'''



MARCA = "<!-- gerado por .github/links/gerar.py -->"
RESERVADAS = {"areademembros", "cobranca", "grupo", "img", "midia", "produtos", "teste", "teste-de-travas", "familia", "politica-de-privacidade"}
CHAVES_JS = json.dumps({T["pasta"]: k for k, T in TESTES.items()}, separators=(",", ":"))


def main():
    raiz = os.getcwd()
    aqui = os.path.join(raiz, ".github", "links")
    idx = open(os.path.join(raiz, "teste", "index.html"), encoding="utf-8").read()
    chave = re.search(r'MEMBROS_KEY = "([^"]+)"', idx).group(1)
    req = urllib.request.Request("https://gobjhepmnijoceirwgow.supabase.co/rest/v1/rpc/travas_paginas_links", data=b"{}", method="POST",
                                 headers={"apikey": chave, "Authorization": "Bearer " + chave, "Content-Type": "application/json"})
    paginas = json.load(urllib.request.urlopen(req, timeout=60))
    man_arq = os.path.join(aqui, "manifesto.json")
    manifesto = json.load(open(man_arq, encoding="utf-8")) if os.path.exists(man_arq) else {}
    novo_man, plano = {}, []
    pastas_teste = {T["pasta"] for T in TESTES.values()}
    for pg in paginas:
        slug, nome = pg["slug"], (pg.get("nome") or "").strip()
        testes = [t for t in pg.get("testes") or [] if t in TESTES]
        if not testes or not re.match(r"^[a-z0-9-]{3,60}$", slug):
            continue
        if slug in RESERVADAS:
            continue                                   # pasta do próprio site com o mesmo nome (não mexe)
        marca = pg.get("marca") or nome
        for t in testes:
            T = TESTES[t]
            pasta = os.path.join(raiz, slug, T["pasta"])
            os.makedirs(pasta, exist_ok=True)
            url = f"{SITE}/{slug}/{T['pasta']}/"
            titulo = f"{T['nome']} · {nome}"
            desc = T["sub"] + " Pelo celular, com " + nome.split()[0] + "."
            open(os.path.join(pasta, "index.html"), "w", encoding="utf-8").write(pagina(titulo, desc, url + "og.jpg", url).replace("<!doctype html>", "<!doctype html>\n" + MARCA, 1))
            item = dict(saida=os.path.join(slug, T["pasta"], "og.jpg"), foto=pg.get("foto") or "", selo=T["selo"], h1=T["h1"], sub=T["sub"], chips=T["chips"], marca=marca.upper())
            h = hashlib.sha1(json.dumps(item, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
            novo_man[slug + "/" + T["pasta"]] = h
            if manifesto.get(slug + "/" + T["pasta"]) != h or not os.path.exists(os.path.join(pasta, "og.jpg")):
                plano.append(item)
        # testes que saíram da página: a pasta some
        for d in os.listdir(os.path.join(raiz, slug)):
            if d in pastas_teste and d not in {TESTES[t]["pasta"] for t in testes}:
                shutil.rmtree(os.path.join(raiz, slug, d))
        T0 = TESTES["travas" if "travas" in testes else testes[0]]
        url = f"{SITE}/{slug}/"
        desc = "Testes de autoconhecimento pelo celular, com " + nome.split()[0] + ": " + ", ".join(TESTES[t]["nome"] for t in testes) + "."
        open(os.path.join(raiz, slug, "index.html"), "w", encoding="utf-8").write(pagina(f"Testes com {nome}", desc, f"{SITE}/{slug}/{T0['pasta']}/og.jpg", url).replace("<!doctype html>", "<!doctype html>\n" + MARCA, 1))
        novo_man[slug] = "pagina"
    open(os.path.join(raiz, "404.html"), "w", encoding="utf-8").write(PAGINA_404.replace("__CHAVE__", chave).replace("__CHAVES__", CHAVES_JS).replace("__REDIRECIONA__", REDIRECIONA))
    json.dump(novo_man, open(man_arq, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)
    json.dump(plano, open(os.path.join(aqui, "plano.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("páginas:", len([k for k in novo_man if "/" in k]), "· imagens a gerar:", len(plano))


if __name__ == "__main__":
    main()
