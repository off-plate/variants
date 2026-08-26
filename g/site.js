/* theme: resolve before first paint via the inline head script, then this
   file only handles the toggle. */
(function(){
  var root=document.documentElement;
  root.classList.add('js');
  var btn=document.getElementById('themer');
  if(!btn) return;
  function label(){
    var light=root.getAttribute('data-theme')==='light';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('aria-pressed', String(light));
  }
  label();
  btn.addEventListener('click', function(){
    var light=root.getAttribute('data-theme')==='light';
    root.setAttribute('data-theme', light ? 'dark' : 'light');
    try{ localStorage.setItem('g-theme', light ? 'dark' : 'light'); }catch(e){}
    label();
  });
})();

/* scroll progress hairline */
(function(){
  var bar=document.querySelector('.scrollbar-progress');
  if(!bar) return;
  var t=false;
  function draw(){
    var h=document.documentElement.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
    t=false;
  }
  addEventListener('scroll',function(){ if(!t){t=true;requestAnimationFrame(draw);} },{passive:true});
  draw();
})();

/* one arrival per group */
(function(){
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  var els=document.querySelectorAll('[data-rise]');
  if(!els.length) return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  els.forEach(function(e){ io.observe(e); });
})();

/* Off Plate, variant G. Sticky bar + mobile menu, the card-grid load
   sequence, and the sector slider. Each block no-ops if its markup is
   absent, so /g/system/ can load the same file. */
(function(){
  var grid=document.querySelector('.cards');
  if(grid && matchMedia('(prefers-reduced-motion: no-preference)').matches){
    grid.classList.add('is-armed');           // hide only now that JS is alive
    var gio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){
        grid.classList.remove('is-armed'); grid.classList.add('is-live'); gio.disconnect(); } });
    },{threshold:.18});
    gio.observe(grid);
  } else if(grid){ grid.classList.add('is-live'); }
})();
(function(){
  var row=document.querySelector('.work'); if(!row) return;
  var fill=document.querySelector('.workbar .rail i');
  function step(){ var c=row.querySelector('a'); return c ? c.offsetWidth+22 : 320; }
  document.querySelectorAll('[data-work]').forEach(function(b){
    b.addEventListener('click',function(){ row.scrollBy({left:step()*(+b.dataset.work),behavior:'smooth'}); });
  });
  function bar(){
    var max=row.scrollWidth-row.clientWidth;
    var f=max>0 ? row.scrollLeft/max : 0;
    if(fill) fill.style.width=(32+f*68)+'%';
  }
  row.addEventListener('scroll',bar,{passive:true}); bar();
  var down=false,x0=0,l0=0;
  row.addEventListener('pointerdown',function(e){ down=true;x0=e.clientX;l0=row.scrollLeft;row.classList.add('is-drag');row.setPointerCapture(e.pointerId); });
  row.addEventListener('pointermove',function(e){ if(down){ row.scrollLeft=l0-(e.clientX-x0); } });
  ['pointerup','pointercancel'].forEach(function(t){ row.addEventListener(t,function(){ down=false;row.classList.remove('is-drag'); }); });
})();

(function(){
  var bar=document.getElementById('topbar');
  var burger=document.getElementById('burger');
  var menu=document.getElementById('menu');
  var last=0, ticking=false, open=false;

  function onScroll(){
    var y=Math.max(0, window.scrollY);
    bar.classList.toggle('is-stuck', y>28);
    // get out of the way going down, come straight back coming up
    if(!open){
      var down = y>last && y>240;
      bar.classList.toggle('is-hidden', down);
    }
    last=y; ticking=false;
  }
  addEventListener('scroll', function(){
    if(!ticking){ ticking=true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();

  function focusables(){ return menu.querySelectorAll('a[href]'); }
  var lastFocus=null;
  function setMenu(v){
    open=v;
    if(v){ lastFocus=document.activeElement; menu.hidden=false; bar.classList.remove('is-hidden'); }
    burger.setAttribute('aria-expanded', String(v));
    burger.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', v);
    requestAnimationFrame(function(){
      menu.classList.toggle('is-open', v);
      if(v){ var f=focusables()[0]; if(f) f.focus({preventScroll:true}); }
    });
    if(!v){
      setTimeout(function(){ menu.hidden=true; }, 300);
      if(lastFocus) lastFocus.focus({preventScroll:true});
    }
  }
  burger.addEventListener('click', function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
  menu.addEventListener('click', function(e){ if(e.target.closest('[data-close]')) setMenu(false); });
  document.addEventListener('keydown', function(e){
    if(menu.hidden) return;
    if(e.key==='Escape'){ setMenu(false); return; }
    if(e.key!=='Tab') return;
    var f=focusables(); if(!f.length) return;
    var first=f[0], lastEl=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); lastEl.focus(); }
    else if(!e.shiftKey && document.activeElement===lastEl){ e.preventDefault(); first.focus(); }
  });
  addEventListener('resize', function(){ if(innerWidth>900 && !menu.hidden) setMenu(false); });
})();

/* ── ambient loops: armed on screen, bounded, and preference-aware ────────
   Every loop in site.css attaches through the `.mo` class rather than from
   CSS alone. Two things follow: nothing animates while it is scrolled off
   screen, and no loop runs forever in one sitting, because each has a
   bounded iteration count and leaving the viewport removes the class so a
   later re-entry restarts it.

   The reduced-motion preference is read live. Toggling it in the OS fires no
   page reload, so a page loaded before the switch would otherwise keep its
   stale state for the whole session. */
(function(){
  var SEL='.circles,.trust,.tl';
  var mq=matchMedia('(prefers-reduced-motion: reduce)');
  var io=null;
  function each(fn){ document.querySelectorAll(SEL).forEach(fn); }
  function disarm(){
    if(io){ io.disconnect(); io=null; }
    each(function(el){ el.classList.remove('mo'); });
  }
  function arm(){
    disarm();
    if(mq.matches) return;                    // Tier 1: never attach at all
    // Two thresholds on purpose. Arm the motion once a quarter of the block is
    // in view, but only stand it down once the block is fully gone: a single
    // .25 threshold would strip the class, and with it the hero group's
    // visibility, while a fifth of the row was still on screen.
    io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.intersectionRatio>=.25) e.target.classList.add('mo');
        else if(e.intersectionRatio===0) e.target.classList.remove('mo');
      });
    },{threshold:[0,.25]});
    each(function(el){ io.observe(el); });
  }
  arm();
  mq.addEventListener('change', arm);
})();
