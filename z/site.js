/* JustDo, variant Z. Mobile menu, one quiet arrival per group, the hero
   image's own load-in scale settle, and a slow pointer parallax on the
   bust: transform-only, capped travel, off under reduced motion. */

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
    if(!v){ setTimeout(function(){ menu.hidden=true; },400); if(lastFocus) lastFocus.focus({preventScroll:true}); }
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

/* one quiet arrival per group */
(function(){
  var frame=document.querySelector('.frame');
  var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if(reduce){
    document.querySelectorAll('[data-rise]').forEach(function(e){ e.classList.add('is-in'); });
    if(frame) frame.classList.add('is-loaded');
    return;
  }
  var els=document.querySelectorAll('[data-rise]');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  els.forEach(function(e){ io.observe(e); });
  // the hero settles as soon as the frame paints, not gated on scroll
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    document.querySelector('.hero__copy').classList.add('is-in');
  }); });
  var img=document.querySelector('.hero__bust img');
  function loaded(){ if(frame) frame.classList.add('is-loaded'); }
  if(img.complete) loaded(); else img.addEventListener('load', loaded, {once:true});
})();

/* bust parallax: slow, small, pointer-driven, transform only */
(function(){
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var bust=document.querySelector('.hero__bust img');
  var hero=document.querySelector('.hero');
  if(!bust||!hero) return;
  var tx=0,ty=0,cx=0,cy=0, raf=null;
  hero.addEventListener('pointermove',function(e){
    var r=hero.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5)*14;
    ty=((e.clientY-r.top)/r.height-.5)*10;
    if(!raf) raf=requestAnimationFrame(tick);
  });
  hero.addEventListener('pointerleave',function(){ tx=0; ty=0; if(!raf) raf=requestAnimationFrame(tick); });
  function tick(){
    cx+=(tx-cx)*.06; cy+=(ty-cy)*.06;
    bust.style.transform='translate('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px)';
    if(Math.abs(tx-cx)>.05||Math.abs(ty-cy)>.05) raf=requestAnimationFrame(tick);
    else raf=null;
  }
})();
