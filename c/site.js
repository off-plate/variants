/* Off Plate variant C. One script for every page under /variants/c/.
   Shell behaviour (header, drawer, keyboard mode) plus the rozpis, which
   no-ops on pages that do not contain one. */
(function(){
  var d=document, root=d.documentElement;
  root.classList.add('js');

  /* keyboard-initiated changes are instant (research 40) */
  d.addEventListener('keydown', function(){ root.setAttribute('data-kbd',''); }, true);
  d.addEventListener('pointerdown', function(){ root.removeAttribute('data-kbd'); }, true);

  /* sticky header */
  var header=d.getElementById('header'), stuck=false;
  addEventListener('scroll', function(){
    var s = scrollY > 10;
    if(s!==stuck){ stuck=s; header.classList.toggle('is-stuck', s); }
  }, {passive:true});

  /* drawer, with a real focus trap and focus return (research 13, APG) */
  var burger=d.getElementById('burger'), drawer=d.getElementById('drawer'),
      closeBtn=d.getElementById('burgerClose'), lastFocus=null;
  function focusables(){ return drawer.querySelectorAll('a[href],button:not([disabled])'); }
  function setMenu(open){
    if(open){ lastFocus=d.activeElement; drawer.hidden=false; }
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    d.body.classList.toggle('is-locked', open);
    requestAnimationFrame(function(){
      drawer.classList.toggle('is-open', open);
      if(open){ var f=focusables()[0]; if(f) f.focus({preventScroll:true}); }
    });
    if(!open){
      var hide=function(){ drawer.hidden=true; drawer.removeEventListener('transitionend',hide); };
      drawer.addEventListener('transitionend',hide);
      setTimeout(hide,320);
      if(lastFocus) lastFocus.focus({preventScroll:true});
    }
  }
  burger.addEventListener('click', function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
  closeBtn.addEventListener('click', function(){ setMenu(false); });
  drawer.addEventListener('click', function(e){
    if(e.target===drawer) setMenu(false);
    if(e.target.closest('a')) setMenu(false);
  });
  d.addEventListener('keydown', function(e){
    if(drawer.hidden) return;
    if(e.key==='Escape'){ setMenu(false); return; }
    if(e.key!=='Tab') return;
    var f=focusables(); if(!f.length) return;
    var first=f[0], last=f[f.length-1];
    if(e.shiftKey && d.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && d.activeElement===last){ e.preventDefault(); first.focus(); }
  });
  addEventListener('resize', function(){ if(innerWidth>1060 && !drawer.hidden) setMenu(false); });

  /* the rozpis */
  var TRADES={
    stavba:{label:'Stavební firma',rows:[
      ['Vícepráce z&nbsp;místa do zakázky','Parta to nadiktuje větou, ne formulářem. Někdo tomu musí rozumět.','ai'],
      ['Porovnání víceprací s&nbsp;nabídkou','Dva různě psané dokumenty a&nbsp;otázka, co v&nbsp;nich nesedí.','ai'],
      ['Hlídání termínů revizí','Datum a&nbsp;upozornění. Model by to jen prodražil.','auto'],
      ['Připomínka chybějícího zjišťovacího protokolu','Seznam, termín, e-mail. Nic víc v&nbsp;tom není.','auto'],
      ['Přeposílání faktur účetní','Pravidlo v&nbsp;e-mailu to dělá roky a&nbsp;funguje.','none']
    ]},
    eshop:{label:'E-shop',rows:[
      ['Marže proti nákupní ceně z&nbsp;faktur','Nákupky chodí v&nbsp;PDF pokaždé jinak. Přečíst je umí model.','ai'],
      ['Vyřízení vratky podle e-mailu zákazníka','Nejdřív je potřeba pochopit, co zákazník vlastně chce.','ai'],
      ['Sledování cen konkurence','Stáhnout čísla a&nbsp;porovnat je. Žádné čtení v&nbsp;tom není.','auto'],
      ['Vystavení dobropisu','Šablona a&nbsp;data, která už v&nbsp;systému máte.','auto'],
      ['Denní report tržeb','Shoptet ho posílá sám. Nechte to být.','none']
    ]},
    ucto:{label:'Účetní kancelář',rows:[
      ['Předkontace došlých dokladů','Každý dodavatel posílá jiný formát. Tohle je přesně ten nepořádek, na&nbsp;který AI je.','ai'],
      ['Vytažení údajů z&nbsp;bankovního výpisu','Strukturovaný soubor. Stačí pravidla.','auto'],
      ['Připomenutí klientovi, že chybí doklad','Seznam a&nbsp;termín.','auto'],
      ['Odpověď na&nbsp;dotaz klienta k&nbsp;DPH','Za&nbsp;odpověď ručí člověk. Nechte to na&nbsp;sobě.','none'],
      ['Zveřejnění účetní závěrky','Jednou ročně. Systém se na&nbsp;to nevyplatí.','none']
    ]},
    servis:{label:'Autoservis',rows:[
      ['Zápis nálezu mechanika do&nbsp;zakázky','Mechanik mluví, nepíše. Přepsat a&nbsp;pochopit to musí model.','ai'],
      ['Podklad pro zákazníka z&nbsp;nálezu','Vysvětlit laikovi, co se našlo a&nbsp;proč to spěchá.','ai'],
      ['Připomínka blížící se STK','Datum, které už v&nbsp;systému je.','auto'],
      ['Rozpis práce na&nbsp;týden','Kapacita dílny proti otevřeným zakázkám.','auto'],
      ['Objednání dílu podle VIN','Katalog dodavatele to umí lépe než my.','none']
    ]}
  };
  var NAMES={none:'Nepotřebujete nic',auto:'Automatizace',ai:'Potřebuje AI'};
  var box=d.querySelector('[data-rozpis]');
  if(box){
    var rowsEl=box.querySelector('[data-rozpis-rows]'),
        sumEl=box.querySelector('[data-rozpis-sum]'),
        stampEl=box.querySelector('[data-rozpis-stamp]'),
        btns=box.querySelectorAll('[data-trade]');
    function render(key){
      var t=TRADES[key]; if(!t) return;
      rowsEl.innerHTML=t.rows.map(function(r){
        return '<li class="rozpis__row">'+
          '<span class="rozpis__task">'+r[0]+'</span>'+
          '<span class="rozpis__why">'+r[1]+'</span>'+
          '<span class="verdict verdict--'+r[2]+'"><span class="verdict__sw" aria-hidden="true"><i></i></span>'+NAMES[r[2]]+'</span>'+
        '</li>';
      }).join('');
      var ai=t.rows.filter(function(r){return r[2]==='ai';}).length;
      var none=t.rows.filter(function(r){return r[2]==='none';}).length;
      sumEl.innerHTML='Ze&nbsp;'+t.rows.length+'&nbsp;úloh potřebují AI&nbsp;'+ai+'. U&nbsp;'+none+' bychom vám neprodali nic.';
      stampEl.innerHTML='vzorek, '+t.rows.length+'&nbsp;úloh';
      btns.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.trade===key)); });
    }
    btns.forEach(function(b){ b.addEventListener('click', function(){ render(b.dataset.trade); }); });
    d.querySelectorAll('[data-jump]').forEach(function(a){
      a.addEventListener('click', function(){ render(a.dataset.jump); });
    });
    /* the signature: the stamps sit at "you need nothing" until the rozpis is
       first seen, then settle into their real verdicts, one after another */
    if(matchMedia('(prefers-reduced-motion: no-preference)').matches){
      box.classList.add('is-armed');
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting){
            box.querySelectorAll('.verdict__sw i').forEach(function(el,i){
              el.style.transitionDelay=(i*70)+'ms';
            });
            box.classList.remove('is-armed');
            io.disconnect();
          }
        });
      },{threshold:.35});
      io.observe(box);
    }
  }

})();
