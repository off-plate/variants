#!/usr/bin/env python3
"""Page definitions for /variants/c/. Content only; the shell lives in build.py."""
import os
from build import frag, article_page

# ── the rozpis data, defined once and used by the homepage script, the obory
#    page and the trade sections. Task, why, verdict.
NONE, AUTO, AI = "none", "auto", "ai"
VERDICT = {NONE: "Nepotřebujete nic", AUTO: "Automatizace", AI: "Potřebuje AI"}

TRADES = {
    "stavebni-firma": {
        "label": "Stavební firma", "img": "stavba", "ratio": (1200, 901),
        "alt": "Základy stavby, vrtání pilot",
        "lede": "Peníze na&nbsp;stavbě mizí mezi tím, co parta udělá navíc, a&nbsp;tím, co se dostane do&nbsp;faktury. Tam začínáme.",
        "rows": [
            ("Vícepráce z&nbsp;místa do&nbsp;zakázky", "Parta to nadiktuje větou, ne formulářem. Někdo tomu musí rozumět.", AI),
            ("Porovnání víceprací s&nbsp;nabídkou", "Dva různě psané dokumenty a&nbsp;otázka, co v&nbsp;nich nesedí.", AI),
            ("Hlídání termínů revizí", "Datum a&nbsp;upozornění. Model by to jen prodražil.", AUTO),
            ("Připomínka chybějícího zjišťovacího protokolu", "Seznam, termín, e-mail. Nic víc v&nbsp;tom není.", AUTO),
            ("Přeposílání faktur účetní", "Pravidlo v&nbsp;e-mailu to dělá roky a&nbsp;funguje.", NONE),
        ]},
    "e-shop": {
        "label": "E-shop", "img": "sklad", "ratio": (1200, 900),
        "alt": "Sklad s&nbsp;paletami a&nbsp;vysokozdvižným vozíkem",
        "lede": "Marži znáte na&nbsp;konci měsíce z&nbsp;účetnictví. Do&nbsp;té doby prodáváte poslepu.",
        "rows": [
            ("Marže proti nákupní ceně z&nbsp;faktur", "Nákupky chodí v&nbsp;PDF pokaždé jinak. Přečíst je umí model.", AI),
            ("Vyřízení vratky podle e-mailu zákazníka", "Nejdřív je potřeba pochopit, co zákazník vlastně chce.", AI),
            ("Sledování cen konkurence", "Stáhnout čísla a&nbsp;porovnat je. Žádné čtení v&nbsp;tom není.", AUTO),
            ("Vystavení dobropisu", "Šablona a&nbsp;data, která již v&nbsp;systému máte.", AUTO),
            ("Denní report tržeb", "Shoptet ho posílá sám. Nechte to být.", NONE),
        ]},
    "ucetni-kancelar": {
        "label": "Účetní kancelář", "img": "papir", "ratio": (853, 640),
        "alt": "Došlé doklady na&nbsp;stole",
        "lede": "Nejdražší hodina v&nbsp;kanceláři je ta, ve&nbsp;které někdo přepisuje údaje z&nbsp;cizího formuláře.",
        "rows": [
            ("Předkontace došlých dokladů", "Každý dodavatel posílá jiný formát. Přesně ten nepořádek, na&nbsp;který AI je.", AI),
            ("Vytažení údajů z&nbsp;bankovního výpisu", "Strukturovaný soubor. Stačí pravidla.", AUTO),
            ("Připomenutí klientovi, že chybí doklad", "Seznam a&nbsp;termín.", AUTO),
            ("Odpověď na&nbsp;dotaz klienta k&nbsp;DPH", "Za&nbsp;odpověď ručí člověk. Nechte to na&nbsp;sobě.", NONE),
            ("Zveřejnění účetní závěrky", "Jednou ročně. Systém se na&nbsp;to nevyplatí.", NONE),
        ]},
    "autoservis": {
        "label": "Autoservis", "img": "dilna", "ratio": (1200, 1600),
        "alt": "Autoservis, vozy v&nbsp;dílně",
        "lede": "Mechanik najde na&nbsp;voze víc, než bylo v&nbsp;objednávce. Než to sepíše, je konec směny.",
        "rows": [
            ("Zápis nálezu mechanika do&nbsp;zakázky", "Mechanik mluví, nepíše. Přepsat a&nbsp;pochopit to musí model.", AI),
            ("Podklad pro zákazníka z&nbsp;nálezu", "Vysvětlit laikovi, co se našlo a&nbsp;proč to spěchá.", AI),
            ("Připomínka blížící se STK", "Datum, které již v&nbsp;systému je.", AUTO),
            ("Rozpis práce na&nbsp;týden", "Kapacita dílny proti otevřeným zakázkám.", AUTO),
            ("Objednání dílu podle VIN", "Katalog dodavatele to umí lépe než my.", NONE),
        ]},
}


def stamp(v):
    return (f'<span class="verdict verdict--{v}">'
            f'<span class="verdict__sw" aria-hidden="true"><i></i></span>{VERDICT[v]}</span>')


def rozpis_block(key, up="", head=True):
    t = TRADES[key]
    rows = "\n".join(
        f'''        <li class="rozpis__row">
          <span class="rozpis__task">{task}</span>
          <span class="rozpis__why">{why}</span>
          {stamp(v)}
        </li>''' for task, why, v in t["rows"])
    n_ai = sum(1 for *_, v in t["rows"] if v == AI)
    n_none = sum(1 for *_, v in t["rows"] if v == NONE)
    h = (f'''      <div class="rozpis__head">
        <span class="rozpis__title"><span aria-hidden="true">▚</span> Rozpis agendy</span>
        <span class="xs mono">{t["label"]}</span>
      </div>
''' if head else "")
    return f'''    <div class="rozpis">
{h}      <ul class="rozpis__rows">
{rows}
      </ul>
      <div class="rozpis__foot">
        <span>Z&nbsp;{len(t["rows"])}&nbsp;úloh potřebují AI&nbsp;{n_ai}. U&nbsp;{n_none} bychom vám neprodali nic.</span>
      </div>
    </div>'''


def trade_section(key, up="../"):
    t = TRADES[key]
    w, h = t["ratio"]
    big = 853 if t["img"] == "papir" else 1200
    return f'''
<section class="section section--tight" id="{key}" aria-labelledby="{key}-h">
  <div class="wrap">
    <h2 class="d2" id="{key}-h">{t["label"]}</h2>
    <p class="lede" style="margin-top:16px">{t["lede"]}</p>
    <div class="trade-detail">
      <figure class="figure">
        <picture>
          <source type="image/webp" srcset="{up}img/{t["img"]}-640.webp 640w, {up}img/{t["img"]}-{big}.webp {big}w" sizes="(max-width:900px) 92vw, 40vw">
          <img src="{up}img/{t["img"]}-640.jpg" width="{w}" height="{h}" alt="{t["alt"]}" loading="lazy" decoding="async">
        </picture>
      </figure>
{rozpis_block(key, up, head=False)}
    </div>
  </div>
</section>'''


# ── pages ───────────────────────────────────────────────────────────────────
PAGES = [
    {
        "path": "", "up": "", "current": None,
        "title": "Většinu vaší opakované práce AI nepotřebuje | Off-Plate",
        "desc": "Projdeme vaši agendu a u každé opakované úlohy řekneme jedno ze tří: nepotřebujete nic, stačí obyčejná automatizace, nebo tohle opravdu potřebuje AI. Pak postavíme to, na čem se shodneme.",
        "head_extra": '''<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ProfessionalService","name":"Off-Plate",
 "url":"https://off-plate.github.io/variants/c/","areaServed":"CZ","inLanguage":"cs",
 "description":"Rozpis opakované práce ve firmě a tři verdikty: nepotřebujete nic, obyčejná automatizace, nebo AI.",
 "email":"michael@off-plate.com","address":{"@type":"PostalAddress","addressLocality":"Praha","addressCountry":"CZ"}}
</script>
''',
        "main": frag("index.html"),
    },
    {
        "path": "obory/", "up": "../", "current": "obory/",
        "title": "Obory · Off-Plate",
        "desc": "Čtyři obory, ve kterých nejčastěji začínáme, a u každého konkrétní rozpis úloh s verdiktem: nic, automatizace, nebo AI.",
        "main": f'''
<section class="section section--tight">
  <div class="wrap">
    <h1 class="d1" style="max-width:16ch">Obory, ve&nbsp;kterých začínáme</h1>
    <p class="lede" style="margin-top:22px">Začínáme u&nbsp;jedné konkrétní práce, která se opakuje a&nbsp;stojí peníze. U&nbsp;každého oboru níž je rozpis úloh, se&nbsp;kterými se u&nbsp;něj potkáváme nejčastěji, a&nbsp;verdikt ke&nbsp;každé z&nbsp;nich.</p>
    <p class="xs" style="margin-top:16px;max-width:52ch">Rozpisy níž jsou modelové. U&nbsp;vás vypadají jinak, protože je sestavujeme z&nbsp;vaší agendy, ne z&nbsp;oboru.</p>
  </div>
</section>
{trade_section("stavebni-firma")}
{trade_section("e-shop")}
{trade_section("ucetni-kancelar")}
{trade_section("autoservis")}
<section class="section section--tight">
  <div class="wrap">
    <div class="band">
      <h2 class="d2" style="max-width:18ch">Váš obor tu není?</h2>
      <p class="lede" style="margin-top:16px">Obor nás nezajímá tolik jako to, kde se u&nbsp;vás hromadí papír. Napište, co vás nejvíc zdržuje, a&nbsp;rozpis vám sestavíme na&nbsp;míru.</p>
      <div class="hero__actions">
        <a class="btn btn--onDark" href="../kontakt/">Napsat nám</a>
      </div>
    </div>
  </div>
</section>
''',
    },
    {
        "path": "cenik/", "up": "../", "current": "cenik/",
        "title": "Ceník · Off-Plate",
        "desc": "Rozpis zdarma, jedna automatizace za 12 000 Kč, jeden proces od 25 000 Kč, celý provoz od 40 000 Kč. Co je v ceně a co platíte měsíčně.",
        "main": '''
<section class="section section--tight">
  <div class="wrap">
    <h1 class="d1" style="max-width:14ch">Ceny podle velikosti záběru</h1>
    <p class="lede" style="margin-top:22px">Začněte nejmenším krokem. Když se ukáže, že to u&nbsp;vás funguje, jde se dál. Když ne, nic dalšího neplatíte.</p>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="ptable">
      <div class="prow prow--free">
        <div><h2 class="d3">Rozpis</h2></div>
        <p class="sm">Projdeme vaši agendu a&nbsp;rozdělíme ji na&nbsp;tři kategorie. Dostanete to písemně, včetně toho, co vám stavět nebudeme a&nbsp;proč.</p>
        <span class="prow__amt mono">Zdarma</span>
        <span class="xs">po prvním hovoru, do&nbsp;týdne</span>
      </div>
      <div class="prow">
        <div><h2 class="d3">Jedna automatizace</h2></div>
        <p class="sm">Jedna hotová automatizace na&nbsp;vašich skutečných datech, za&nbsp;pevnou cenu. Nezavazuje k&nbsp;ničemu dalšímu.</p>
        <span class="prow__amt mono">12 000&nbsp;Kč</span>
        <span class="xs">jednorázově</span>
      </div>
      <div class="prow">
        <div><h2 class="d3">Jeden proces</h2></div>
        <p class="sm">Jeden proces, který vám mizí ze&nbsp;stolu úplně. Napojený na&nbsp;to, co již používáte, s&nbsp;předáním a&nbsp;návodem.</p>
        <span class="prow__amt mono">25–60 000&nbsp;Kč</span>
        <span class="xs">a&nbsp;4–8 000&nbsp;Kč měsíčně za&nbsp;provoz</span>
      </div>
      <div class="prow">
        <div><h2 class="d3">Celý provoz</h2></div>
        <p class="sm">Několik procesů spojených do&nbsp;celku, který drží běžnou agendu sám. Vy řešíte jen výjimky, které vám pošle.</p>
        <span class="prow__amt mono">od 40 000&nbsp;Kč</span>
        <span class="xs">a&nbsp;12–20 000&nbsp;Kč měsíčně za&nbsp;provoz</span>
      </div>
    </div>
    <p class="xs" style="margin-top:20px;max-width:56ch">Ceny jsou zástupné a&nbsp;nejsou schválené. Slouží zatím jako řádová představa, ne jako nabídka.</p>
  </div>
</section>

<section class="section section--tight" aria-labelledby="co-h">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="co-h">Co si vyjasníme dříve, než se zeptáte</h2></div>
    <div class="qa">
      <div class="qa__item"><h3 class="d4">Postavíme to, vy to vlastníte</h3><p>Scénáře, prompty, přístupy i&nbsp;dokumentaci máte u&nbsp;sebe. Když odejdete, berete si to s&nbsp;sebou.</p></div>
      <div class="qa__item"><h3 class="d4">Co se stane, když přestanete platit</h3><p>Přestaneme hlídat a&nbsp;opravovat. Systém běží dál, dokud se něco nerozbije, a&nbsp;to se dříve nebo později stane.</p></div>
      <div class="qa__item"><h3 class="d4">Za provoz AI platíte podle spotřeby</h3><p>Modely se platí podle toho, kolik toho zpracují. Dáme na&nbsp;to měsíční strop a&nbsp;napíšeme ho do&nbsp;smlouvy, ať víte, kde to končí.</p></div>
      <div class="qa__item"><h3 class="d4">Kde leží vaše data</h3><p>V&nbsp;Česku nebo v&nbsp;EU. Zpracovatelskou smlouvu podepíšeme dříve, než na&nbsp;data vůbec sáhneme.</p></div>
      <div class="qa__item"><h3 class="d4">Za rozhodnutí ručíte vy</h3><p>Systém připraví podklad a&nbsp;označí, co je sporné. Podepisuje to člověk u&nbsp;vás, ne model.</p></div>
      <div class="qa__item"><h3 class="d4">Nemáme zatím veřejnou referenci</h3><p>Jsme na&nbsp;začátku a&nbsp;nebudeme předstírat opak. Proto začínáme pilotem na&nbsp;vašich datech.</p></div>
    </div>
  </div>
</section>
''',
    },
    {
        "path": "jak-to-funguje/", "up": "../", "current": "jak-to-funguje/",
        "title": "Jak to funguje · Off-Plate",
        "desc": "Pět kroků od prvního hovoru po provoz, a tři verdikty, které dostane každá úloha ve vaší agendě.",
        "main": '''
<section class="section section--tight">
  <div class="wrap">
    <h1 class="d1" style="max-width:15ch">Jak spolupráce probíhá</h1>
    <p class="lede" style="margin-top:22px">Pět kroků. První dva jsou zdarma a&nbsp;končí písemným rozpisem, ze&nbsp;kterého poznáte, jestli se s&nbsp;námi vůbec vyplatí pokračovat.</p>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    <div class="steps steps--tall">
      <div class="step"><span class="step__n mono">01</span><h2 class="d4">Hovor</h2><p class="sm">Kde se práce hromadí, podle jakého čísla poznáte zlepšení, a&nbsp;o&nbsp;kolik. Bez čísla nestavíme, protože bez něj nejde poznat, jestli to fungovalo.</p><span class="step__when">45 minut, zdarma</span></div>
      <div class="step"><span class="step__n mono">02</span><h2 class="d4">Rozpis</h2><p class="sm">Vaši agendu rozdělíme na&nbsp;tři kategorie a&nbsp;pošleme písemně. Je v&nbsp;něm i&nbsp;to, co stavět nebudeme, a&nbsp;důvod.</p><span class="step__when">do týdne</span></div>
      <div class="step"><span class="step__n mono">03</span><h2 class="d4">Pilot</h2><p class="sm">Postavíme jednu úlohu na&nbsp;vaší hotové zakázce, kde znáte správný výsledek. Uvidíte i&nbsp;to, kde se systém plete, protože to uvidět potřebujete.</p><span class="step__when">10 až 14 dní</span></div>
      <div class="step"><span class="step__n mono">04</span><h2 class="d4">Stavba</h2><p class="sm">Postavíme načisto a&nbsp;napojíme na&nbsp;vaše nástroje. Co nejde, řekneme předem, ne v&nbsp;polovině.</p><span class="step__when">3 až 6 týdnů</span></div>
      <div class="step"><span class="step__n mono">05</span><h2 class="d4">Provoz</h2><p class="sm">Hlídáme, že to běží, a&nbsp;opravujeme, když se něco změní. Když skončíte, scénáře i&nbsp;přístupy zůstávají vám.</p><span class="step__when">měsíčně</span></div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="verd-h">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="verd-h">Každá úloha dostane jeden ze tří verdiktů</h2></div>
    <div class="grid-3">
      <div class="card">
        <span class="verdict verdict--none"><span class="verdict__sw" aria-hidden="true"><i></i></span>Nepotřebujete nic</span>
        <h3 class="d4" style="margin-top:16px">Funguje to a&nbsp;stojí to málo</h3>
        <p class="sm" style="margin-top:8px">Systém by tomu jen překážel a&nbsp;přidal by další věc, která se může rozbít. Tohle je nejčastější verdikt, který od nás uslyšíte.</p>
      </div>
      <div class="card">
        <span class="verdict verdict--auto"><span class="verdict__sw" aria-hidden="true"><i></i></span>Automatizace</span>
        <h3 class="d4" style="margin-top:16px">Přeposlat, připomenout, vyplnit</h3>
        <p class="sm" style="margin-top:8px">Pravidla, termíny a&nbsp;data, která již máte. AI tady nemá co dělat a&nbsp;zdražila by provoz o&nbsp;peníze, které se nevrátí.</p>
      </div>
      <div class="card">
        <span class="verdict verdict--ai"><span class="verdict__sw" aria-hidden="true"><i></i></span>Potřebuje AI</span>
        <h3 class="d4" style="margin-top:16px">Někdo musí přečíst nepořádek</h3>
        <p class="sm" style="margin-top:8px">Porozumět tomu, co je napsané pokaždé jinak, a&nbsp;rozhodnout se. Tady se investice vrátí, a&nbsp;jinde ne.</p>
      </div>
    </div>
    <p class="sm" style="margin-top:26px;max-width:58ch">Verdikt není odhad. Ke&nbsp;každé úloze v&nbsp;rozpisu píšeme důvod, proč dostala ten svůj, abyste s&nbsp;ním mohli nesouhlasit.</p>
  </div>
</section>
''',
    },
    {
        "path": "kontakt/", "up": "../", "current": None,
        "title": "Kontakt · Off-Plate",
        "desc": "Napište, co vás nejvíc zdržuje. Odpovídá Michael Florian, obvykle do konce pracovního dne.",
        "main": '''
<section class="section section--tight">
  <div class="wrap contact-grid">
    <div>
      <h1 class="d1" style="max-width:13ch">Napište, co vás nejvíc zdržuje</h1>
      <p class="lede" style="margin-top:22px">Odpovídá Michael Florian, obvykle do&nbsp;konce pracovního dne. Když to nebude něco pro&nbsp;nás, řekneme to rovnou a&nbsp;poradíme, kam se obrátit.</p>
      <div class="qa" style="grid-template-columns:1fr;margin-top:34px">
        <div class="qa__item"><h2 class="d4">První hovor trvá 45&nbsp;minut</h2><p>Ptáme se, kde se práce hromadí a&nbsp;podle jakého čísla poznáte zlepšení. Nic neprodáváme.</p></div>
        <div class="qa__item"><h2 class="d4">Rozpis je zdarma</h2><p>Do&nbsp;týdne po&nbsp;hovoru dostanete písemně, co bychom stavěli, co ne a&nbsp;proč.</p></div>
      </div>
      <p class="sm" style="margin-top:26px">Nebo rovnou e-mailem: <a href="mailto:michael@off-plate.com" style="text-decoration:underline">michael@off-plate.com</a></p>
    </div>

    <form class="form" method="post" action="mailto:michael@off-plate.com" enctype="text/plain">
      <div class="field">
        <label for="f-name">Jméno</label>
        <input id="f-name" name="jmeno" type="text" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="f-firma">Firma</label>
        <input id="f-firma" name="firma" type="text" autocomplete="organization">
      </div>
      <div class="field">
        <label for="f-mail">E-mail</label>
        <input id="f-mail" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" required>
      </div>
      <div class="field">
        <label for="f-tel">Telefon</label>
        <input id="f-tel" name="telefon" type="tel" autocomplete="tel" inputmode="tel" spellcheck="false">
        <span class="hint">Nepovinné. Když ho vyplníte, zavoláme radši než píšeme.</span>
      </div>
      <div class="field field--area">
        <label for="f-text">Co vás nejvíc zdržuje</label>
        <textarea id="f-text" name="zprava" rows="5" required placeholder="Například: každou zakázku přepisujeme ručně z&nbsp;e-mailu do&nbsp;systému…"></textarea>
      </div>
      <button class="btn btn--primary" type="submit">Odeslat</button>
      <p class="xs" style="margin-top:14px">Odesláním nám dáváte jen svůj e-mail a&nbsp;text zprávy. Nic dalšího neukládáme.</p>
    </form>
  </div>
</section>
''',
    },
    {
        "path": "novinky/", "up": "../", "current": "novinky/",
        "title": "Novinky · Off-Plate",
        "desc": "Co se v AI změnilo tak, že to mění rozhodnutí českým firmám. Krátce, s odkazem na zdroj.",
        "main": '''
<section class="section section--tight">
  <div class="wrap">
    <h1 class="d1" style="max-width:14ch">Co se změnilo</h1>
    <p class="lede" style="margin-top:22px">Píšeme jen o&nbsp;tom, co mění rozhodnutí české firmě. Ke&nbsp;každé zprávě patří odkaz na&nbsp;původní zdroj, ať si to můžete ověřit.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    <a class="post" href="ai-act/">
      <span>
        <span class="post__kicker">Regulace</span>
        <h2 class="d4" style="margin-top:5px">Od 2.&nbsp;srpna 2026 musíte označovat, co psala AI</h2>
        <span class="post__date mono">2.&nbsp;srpna 2026</span>
      </span>
      <span class="post__go" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 15L15 5M7 5h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </a>
    <a class="post" href="gema/">
      <span>
        <span class="post__kicker">Právo</span>
        <h2 class="d4" style="margin-top:5px">Mnichovský soud rozhodl, že trénování na&nbsp;cizích textech je porušení práv</h2>
        <span class="post__date mono">11.&nbsp;listopadu 2025</span>
      </span>
      <span class="post__go" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 15L15 5M7 5h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </a>
    <a class="post" href="shoptet/">
      <span>
        <span class="post__kicker">E-shopy</span>
        <h2 class="d4" style="margin-top:5px">Shoptet dal AI popisky do&nbsp;administrace zdarma. Co to znamená pro&nbsp;vaše texty</h2>
        <span class="post__date mono">léto 2026</span>
      </span>
      <span class="post__go" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 15L15 5M7 5h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </a>
  </div>
</section>
''',
    },
]

# ── the three articles, bodies written separately and dropped into _src/ ────
ARTICLES = [
    dict(slug="ai-act", kicker="Regulace", img="beton",
         title="Od 2.&nbsp;srpna 2026 musíte označovat, co psala AI",
         date="2.&nbsp;srpna 2026",
         lede="Povinnost označovat obsah vytvořený AI platí od&nbsp;2.&nbsp;srpna 2026. Přísnější pravidla pro&nbsp;vysoce rizikové systémy se naopak odložila.",
         sources=[("Regulation (EU) 2026/1744, Digital Omnibus on AI, Úřední věstník EU",
                   "https://eur-lex.europa.eu/eli/reg/2026/1744/oj"),
                  ("Gibson Dunn: EU AI Act Omnibus Agreement, Postponed High-Risk Deadlines",
                   "https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/")]),
    dict(slug="gema", kicker="Právo", img="stavba",
         title="Mnichovský soud rozhodl, že trénování na&nbsp;cizích textech je porušení práv",
         date="11.&nbsp;listopadu 2025",
         lede="Zemský soud v&nbsp;Mnichově dal za&nbsp;pravdu GEMA ve&nbsp;sporu s&nbsp;OpenAI. Je to první rozhodnutí svého druhu v&nbsp;Evropě.",
         sources=[("Bird &amp; Bird: Landmark ruling of the Munich Regional Court, GEMA v OpenAI",
                   "https://www.twobirds.com/en/insights/2025/landmark-ruling-of-the-munich-regional-court-(gema-v-openai)-on-copyright-and-ai-training"),
                  ("CMS: GEMA vs. OpenAI, Munich Regional Court I issues landmark copyright decision",
                   "https://cms.law/en/deu/legal-updates/gema-vs.-openai-munich-regional-court-i-issues-landmark-copyright-decision")]),
    dict(slug="shoptet", kicker="E-shopy", img="sklad",
         title="Shoptet dal AI popisky do&nbsp;administrace zdarma. Co to znamená pro&nbsp;vaše texty",
         date="léto 2026",
         lede="AI úpravy popisků jsou nově přímo v&nbsp;administraci a&nbsp;na&nbsp;všech placených tarifech bez příplatku. Pro&nbsp;většinu e-shopů to znamená, že si nemusí kupovat nic dalšího.",
         sources=[("Shoptet Blog: AI funkce, legislativní úpravy i nová Pokladna",
                   "https://blog.shoptet.cz/shoptet-novinky-duben-cerven-2026/"),
                  ("Český statistický úřad: Umělou inteligenci používá již 11 procent firem",
                   "https://csu.gov.cz/produkty/umelou-inteligenci-pouziva-jiz-11-procent-firem")]),
]

for a in ARTICLES:
    body = frag(f"article-{a['slug']}.html")
    if body.strip():
        PAGES.append(article_page(body=body, **a))

_en = frag("en.html")
if _en.strip():
    PAGES.append({
        "path": "en/", "up": "../", "current": None, "lang": "en",
        "title": "Off-Plate · Most of your repetitive work does not need AI",
        "desc": "We look at how your business actually runs and give every recurring task one of three verdicts: you need nothing, plain automation is enough, or this genuinely needs AI.",
        "main": f'''
<section class="section section--tight">
  <div class="wrap">
    <div class="article">
      <p class="post__kicker">In English</p>
      <h1 class="d2" style="margin-top:8px">Most of your repetitive work does not need AI</h1>
{_en}
      <p style="margin-top:2.5em"><a href="../">Zpět na českou verzi</a></p>
    </div>
  </div>
</section>
''',
    })


# ── /system/ ────────────────────────────────────────────────────────────────
# Every token and every component in every state, on one page, because that
# adjacency is what makes a duplicate component obvious.
PANGRAM = "Příliš žluťoučký kůň úpěl ďábelské ódy."

def swatches(rows):
    return "\n".join(
        f'      <div class="sw-item"><span class="sw-chip" style="background:{hexv}"></span>'
        f'<span class="d4">{name}</span><span class="xs mono">{hexv}</span>'
        f'<span class="xs">{role}</span></div>' for name, hexv, role in rows)

_COLOURS = [
    ("navy", "#002B59", "Značka, tmavý pás"),
    ("teal", "#1F7A7A", "Značka, verdikt AI, fokus"),
    ("amber", "#D08C2E", "Značka, verdikt automatizace"),
    ("paper", "#F2EFEB", "Značka, papír"),
    ("ink", "#10161C", "Text"),
    ("ink-2", "#4A5561", "Text druhé úrovně"),
    ("ink-3", "#5E6A77", "Popisky"),
    ("surface", "#F7F5F2", "Plocha 1"),
    ("surface-2", "#EFEBE5", "Plocha 2"),
]
_VERDICT_C = [
    ("v-none-bg", "#E8ECF1", "Nepotřebujete nic"),
    ("v-auto-bg", "#F8EEDC", "Automatizace"),
    ("v-ai-bg", "#DDECEA", "Potřebuje AI"),
]

def _type_row(cls, label, note):
    return (f'      <div class="sys-type"><span class="xs mono">{label}</span>'
            f'<p class="{cls}">{PANGRAM}</p><span class="xs">{note}</span></div>')

PAGES.append({
    "path": "system/", "up": "../", "current": None,
    "title": "Systém · Off-Plate",
    "desc": "Tokeny a komponenty varianty C, každá ve všech stavech, na jedné stránce.",
    "main": f'''
<section class="section section--tight">
  <div class="wrap">
    <h1 class="d1" style="max-width:12ch">C, systém</h1>
    <p class="lede" style="margin-top:22px">Rozvržení, které je tady jednou, unese jakýkoli obsah. Rozvržení, které tu není, se sem doplní dřív, než se použije na&nbsp;stránce. Stránka nikdy nevlastní komponentu.</p>
    <p class="xs" style="margin-top:14px">Vše níž čte ze&nbsp;stejného <a href="../site.css" style="text-decoration:underline">site.css</a>, jaký používají všechny stránky.</p>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-col">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-col">Barva jako role</h2></div>
    <div class="sw-grid">
{swatches(_COLOURS)}
    </div>
    <p class="sm" style="margin:26px 0 14px">Tři odstíny níž nejsou dekorace. Odstín na&nbsp;tomto webu vždy znamená verdikt.</p>
    <div class="sw-grid">
{swatches(_VERDICT_C)}
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-type">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-type">Písmo jako role</h2></div>
{_type_row("d1", "d1 / Sora 600 / 34→76px", "Nadpis stránky. Prokládání −0,028em, řádkování 1,08.")}
{_type_row("d2", "d2 / Sora 600 / 28→48px", "Nadpis sekce. Prokládání −0,024em.")}
{_type_row("d3", "d3 / Sora 600 / 22→30px", "Nadpis bloku.")}
{_type_row("d4", "d4 / Inter 600 / 17px", "Nadpis karty. Jediný nadpis, který není Sora.")}
{_type_row("lede", "lede / Inter 400 / 17→19px", "Úvodní odstavec, maximálně 46 znaků na řádek.")}
{_type_row("sm", "sm / Inter 400 / 15→16px", "Běžný text v kartě.")}
{_type_row("xs", "xs / Inter 400 / 13→14px", "Popisek, datum, poznámka.")}
    <div class="sys-type"><span class="xs mono">mono</span><p class="mono">12 000 Kč · 25–60 000 Kč · 2. srpna 2026 · 0123456789</p><span class="xs">Nikoli třetí písmo. Inter s tabulkovými číslicemi, protože jen ty ceny potřebovaly.</span></div>
    <p class="xs" style="margin-top:20px;max-width:62ch">Vzorník je vždy česká pangramová věta, ne lorem ipsum. Prochází ř&nbsp;ž&nbsp;ť&nbsp;č&nbsp;ů&nbsp;ň&nbsp;ď&nbsp;ó a&nbsp;kolizí ascenderů, na&nbsp;kterých se pozná, jestli řádkování stačí.</p>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-scale">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-scale">Rádius, mezery, pohyb</h2></div>
    <div class="grid-3">
      <div class="card">
        <h3 class="d4">Rádius</h3>
        <ul class="sys-list">
          <li><span class="mono">4px</span> štítek</li>
          <li><span class="mono">8px</span> tlačítko, pole</li>
          <li><span class="mono">12px</span> karta</li>
          <li><span class="mono">16px</span> panel</li>
          <li><span class="mono">24px</span> pás</li>
          <li><span class="mono">999px</span> jen přepínač, protože je to logo</li>
        </ul>
      </div>
      <div class="card">
        <h3 class="d4">Trvání</h3>
        <ul class="sys-list">
          <li><span class="mono">100ms</span> barva, fokus</li>
          <li><span class="mono">150ms</span> malý vstup</li>
          <li><span class="mono">200ms</span> panel, hlavička</li>
          <li><span class="mono">300ms</span> zásuvka, verdikt</li>
        </ul>
        <p class="xs" style="margin-top:10px">Strop je 300&nbsp;ms. Pátý stupeň neexistuje.</p>
      </div>
      <div class="card">
        <h3 class="d4">Křivky</h3>
        <ul class="sys-list">
          <li><span class="mono">out</span> .05,.7,.1,1</li>
          <li><span class="mono">in</span> .3,0,.8,.15</li>
          <li><span class="mono">emph</span> .2,0,0,1</li>
        </ul>
        <p class="xs" style="margin-top:10px">Animuje se jen transform a&nbsp;opacity. Žádná vlastnost, která mění rozvržení.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-ctl">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-ctl">Ovládací prvky, ve všech stavech</h2></div>
    <div class="sys-row">
      <a class="btn btn--primary" href="#s-ctl">Hlavní</a>
      <a class="btn btn--ghost" href="#s-ctl">Vedlejší</a>
      <a class="btn btn--primary btn--sm" href="#s-ctl">Hlavní, malé</a>
      <button class="btn btn--ghost" type="button" disabled style="opacity:.45;cursor:not-allowed">Nedostupné</button>
    </div>
    <p class="xs" style="margin-top:12px">Jedno tlačítko, jedna třída. Změnit barvu všech hlavních tlačítek je jedna úprava v&nbsp;<span class="mono">.btn--primary</span>.</p>
    <div class="band" style="margin-top:24px">
      <p class="sm" style="color:rgba(255,255,255,.86);margin-bottom:16px">Na tmavém pásu tytéž prvky, jiné proměnné:</p>
      <div class="sys-row">
        <a class="btn btn--onDark" href="#s-ctl">Hlavní</a>
        <a class="btn btn--clearOnDark" href="#s-ctl">Vedlejší</a>
      </div>
    </div>
    <div class="sys-row" style="margin-top:24px">
      <span class="tag">Štítek</span>
      <span class="verdict verdict--none"><span class="verdict__sw" aria-hidden="true"><i></i></span>Nepotřebujete nic</span>
      <span class="verdict verdict--auto"><span class="verdict__sw" aria-hidden="true"><i></i></span>Automatizace</span>
      <span class="verdict verdict--ai"><span class="verdict__sw" aria-hidden="true"><i></i></span>Potřebuje AI</span>
    </div>
    <p class="xs" style="margin-top:12px">Razítko verdiktu je jedna komponenta se&nbsp;třemi stavy. Knoflík je ve&nbsp;třech polohách, stejně jako přepínač v&nbsp;logu.</p>
    <div style="max-width:420px;margin-top:26px">
      <div class="field"><label for="s-in">Pole</label><input id="s-in" type="text" placeholder="Výchozí stav…"></div>
      <div class="field" style="margin-top:14px"><label for="s-in2">Pole s&nbsp;nápovědou</label><input id="s-in2" type="email" placeholder="jmeno@firma.cz"><span class="hint">Nápověda sedí pod polem, nikdy nad nadpisem.</span></div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-surf">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-surf">Plochy</h2></div>
    <div class="grid-3">
      <div class="card"><h3 class="d4">card</h3><p class="sm" style="margin-top:8px">Vlasová linka, rádius 12. Bez stínu.</p></div>
      <div class="panel"><h3 class="d4">panel</h3><p class="sm" style="margin-top:8px">Plocha 1, rádius 16.</p></div>
      <div class="band" style="padding:24px"><h3 class="d4" style="color:#fff">band</h3><p class="sm" style="margin-top:8px;color:rgba(255,255,255,.86)">Navy, rádius 24. Na webu je právě jeden na stránku.</p></div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-roz">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-roz">Rozpis</h2></div>
{rozpis_block("e-shop")}
    <p class="xs" style="margin-top:14px">Jedna komponenta. Na&nbsp;úvodní stránce je přepínatelná, na&nbsp;stránce oboru statická.</p>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-inv">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-inv">Soupis komponent</h2></div>
    <div class="qa">
      <div class="qa__item"><h3 class="d4">btn</h3><p>Vyvolá jednu akci. Varianty primary, ghost, onDark, clearOnDark, sm.</p></div>
      <div class="qa__item"><h3 class="d4">verdict</h3><p>Ukáže verdikt jedné úlohy ve třech stavech.</p></div>
      <div class="qa__item"><h3 class="d4">rozpis</h3><p>Ukáže agendu jako seznam úloh s verdiktem.</p></div>
      <div class="qa__item"><h3 class="d4">card / panel / band</h3><p>Ohraničí obsah na třech úrovních hloubky. Rozdíl je plocha a rádius, ne stín.</p></div>
      <div class="qa__item"><h3 class="d4">trade</h3><p>Odkáže na obor jedním obrázkem a dvěma větami.</p></div>
      <div class="qa__item"><h3 class="d4">prow</h3><p>Jeden řádek ceníku.</p></div>
      <div class="qa__item"><h3 class="d4">step</h3><p>Jeden krok očíslované posloupnosti.</p></div>
      <div class="qa__item"><h3 class="d4">qa__item</h3><p>Otázka a odpověď na vlasové lince.</p></div>
      <div class="qa__item"><h3 class="d4">post</h3><p>Odkáže na jeden článek.</p></div>
      <div class="qa__item"><h3 class="d4">field</h3><p>Jeden vstup formuláře s popiskem a nápovědou.</p></div>
    </div>
    <p class="sm" style="margin-top:26px;max-width:62ch">Deset komponent, deset různých vět. Kde by dvě věty byly stejné, jsou to dvě varianty jedné komponenty, ne dvě komponenty. Kulaté šipky v&nbsp;kartě a&nbsp;v&nbsp;řádku novinek byly dřív dvě, teď je to <span class="mono">post__go</span>.</p>
  </div>
</section>

<section class="section section--tight" aria-labelledby="s-no">
  <div class="wrap">
    <div class="sec-head"><h2 class="d2" id="s-no">Co se sem nesmí vrátit</h2></div>
    <div class="qa">
      <div class="qa__item"><h3 class="d4">Podnadpis pod nadpisem</h3><p>Nadpis nedostane vysvětlující řádek. Pod nadpisem smí stát jen údaj, který nikde jinde není.</p></div>
      <div class="qa__item"><h3 class="d4">Rozostřený přechod</h3><p>Mesh a aurora pozadí. Jeden tmavý pás na stránku, plná barva.</p></div>
      <div class="qa__item"><h3 class="d4">Odhalování při rolování</h3><p>Karty, které vyjedou zdola. Na webu je jeden pohyb, a je jím razítko verdiktu.</p></div>
      <div class="qa__item"><h3 class="d4">Pilulková tlačítka</h3><p>Rádius 999 patří jen přepínači v logu.</p></div>
      <div class="qa__item"><h3 class="d4">Vymyšlená čísla</h3><p>Žádná metrika bez zdroje a bez jednotky. Žádné reference, které neexistují.</p></div>
      <div class="qa__item"><h3 class="d4">Třetí písmo</h3><p>Sora a Inter. Číslice řeší tabulkové číslice, ne další rodina.</p></div>
    </div>
  </div>
</section>
''',
})
