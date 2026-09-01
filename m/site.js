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
