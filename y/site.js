/* Plato, variant Y. Mobile menu only; the city's motion is pure CSS
   (motion-path cars/pedestrians, drifting clouds, swaying trees), so there
   is nothing else on this page that needs a script. */
(function(){
  var burger=document.getElementById('burger'), menu=document.getElementById('menu'), open=false, lastFocus=null;
  if(!burger) return;
  function focusables(){ return menu.querySelectorAll('a[href]'); }
  function setMenu(v){
    open=v;
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
