(function(){
  document.documentElement.classList.add('js');
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  var els=document.querySelectorAll('[data-rise]');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{threshold:.2});
  els.forEach(function(e){ io.observe(e); });

  var hero=document.querySelector('.hero');
  if(hero) requestAnimationFrame(function(){ setTimeout(function(){ hero.classList.add('is-loaded'); }, 60); });
})();

(function(){
  var stats=document.querySelector('.stats');
  if(!stats) return;
  var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;

  function fmt(n){
    var s=String(Math.round(n));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  function run(){
    stats.querySelectorAll('.stat__num').forEach(function(el, i){
      var target=+el.dataset.count, suffix=el.dataset.suffix||'';
      if(reduce){ el.textContent=fmt(target)+suffix; return; }
      var delay=i*180, dur=1300, t0;
      function tick(t){
        if(!t0) t0=t;
        var p=Math.min(1,(t-t0-delay)/dur);
        if(p<0){ requestAnimationFrame(tick); return; }
        var eased=1-Math.pow(1-p,3);
        el.textContent=fmt(target*eased)+suffix;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  var done=false;
  var sio=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting && !done){ done=true; run(); sio.disconnect(); } });
  },{threshold:.4});
  sio.observe(stats);
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
