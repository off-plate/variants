/* Pixel Rise, variant Q. Sticky-bar border, mobile menu, one quiet arrival
   per group. The 3D scene is scene.js, loaded as a module in the page. */
(function(){
  var bar=document.getElementById('topbar');
  function onScroll(){ bar.style.borderBottomColor = scrollY>8 ? 'var(--line)' : 'transparent'; }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
})();
(function(){
  var burger=document.getElementById('burger'), menu=document.getElementById('menu'), lastFocus=null;
  if(!burger) return;
  function focusables(){ return menu.querySelectorAll('a[href]'); }
  function setMenu(v){
    if(v){ lastFocus=document.activeElement; menu.hidden=false; }
    burger.setAttribute('aria-expanded',String(v));
    document.body.classList.toggle('is-locked',v);
    requestAnimationFrame(function(){
      menu.classList.toggle('is-open',v);
      if(v){ var f=focusables()[0]; if(f) f.focus({preventScroll:true}); }
    });
    if(!v){ setTimeout(function(){ menu.hidden=true; },300); if(lastFocus) lastFocus.focus({preventScroll:true}); }
  }
  burger.addEventListener('click',function(){ setMenu(burger.getAttribute('aria-expanded')!=='true'); });
  menu.addEventListener('click',function(e){ if(e.target.closest('[data-close]')) setMenu(false); });
  document.addEventListener('keydown',function(e){
    if(menu.hidden) return;
    if(e.key==='Escape'){ setMenu(false); return; }
    if(e.key!=='Tab') return;
    var f=focusables(); if(!f.length) return;
    var first=f[0], lastEl=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); lastEl.focus(); }
    else if(!e.shiftKey && document.activeElement===lastEl){ e.preventDefault(); first.focus(); }
  });
  addEventListener('resize',function(){ if(innerWidth>760 && !menu.hidden) setMenu(false); });
})();
(function(){
  var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if(reduce){ document.querySelectorAll('[data-rise]').forEach(function(e){ e.classList.add('is-in'); }); return; }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  document.querySelectorAll('[data-rise]').forEach(function(e){ io.observe(e); });
})();
