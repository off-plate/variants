(function(){
  document.documentElement.classList.add('js');
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  var els=document.querySelectorAll('[data-rise]');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{threshold:.2});
  els.forEach(function(e){ io.observe(e); });
})();

(function(){
  var burger=document.getElementById('burger'), menu=document.getElementById('menu');
  if(!burger||!menu) return;
  function set(v){
    burger.setAttribute('aria-expanded', String(v));
    menu.hidden=!v;
    document.body.style.overflow=v?'hidden':'';
  }
  burger.addEventListener('click', function(){ set(burger.getAttribute('aria-expanded')!=='true'); });
  menu.addEventListener('click', function(e){ if(e.target.closest('[data-close]')) set(false); });
})();

(function(){
  var row=document.querySelector('.moves__row'); if(!row) return;
})();

(function(){
  var q=document.querySelector('.quote'); if(!q) return;
  document.querySelectorAll('.round').forEach(function(b){
    b.addEventListener('click', function(){
      q.style.transition='opacity .18s ease';
      q.style.opacity='0';
      setTimeout(function(){ q.style.opacity='1'; }, 180);
    });
  });
})();


(function(){
  var el=document.querySelector('[data-count]'); if(!el) return;
  var target=+el.dataset.count;
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches){ el.textContent='$'+target+'M+'; return; }
  var done=false;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting || done) return; done=true; io.disconnect();
      var t0=performance.now(), dur=1100;
      function tick(t){
        var p=Math.min(1,(t-t0)/dur), eased=1-Math.pow(1-p,3);
        el.textContent='$'+Math.round(target*eased)+'M+';
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  },{threshold:.5});
  io.observe(el);
})();
