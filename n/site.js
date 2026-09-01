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
  var services=document.querySelectorAll('[data-service]');
  if(!services.length) return;
  services.forEach(function(item){
    var btn=item.querySelector('.service__row');
    btn.addEventListener('click', function(){
      var opening=!item.classList.contains('is-open');
      services.forEach(function(s){
        s.classList.remove('is-open');
        s.querySelector('.service__row').setAttribute('aria-expanded','false');
      });
      if(opening){ item.classList.add('is-open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
})();

(function(){
  var track=document.getElementById('reviews'), dotsEl=document.getElementById('dots');
  if(!track||!dotsEl) return;
  var dots=Array.prototype.slice.call(dotsEl.children);
  var cards=Array.prototype.slice.call(track.children);

  function syncDots(){
    var mid=track.scrollLeft+track.clientWidth/2;
    var closest=0, best=Infinity;
    cards.forEach(function(c,i){
      var d=Math.abs((c.offsetLeft+c.offsetWidth/2)-mid);
      if(d<best){ best=d; closest=i; }
    });
    var dotIndex=Math.min(dots.length-1, Math.round(closest/(cards.length-1)*(dots.length-1)));
    dots.forEach(function(d,i){ d.classList.toggle('is-active', i===dotIndex); });
  }
  dots[0] && dots[0].classList.add('is-active');
  var ticking=false;
  track.addEventListener('scroll', function(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){ syncDots(); ticking=false; });
  },{passive:true});

  // pointer drag-to-scroll for mouse users; touch keeps native scrolling
  var down=false, startX=0, startLeft=0, moved=false;
  track.addEventListener('pointerdown', function(e){
    if(e.pointerType==='touch') return;
    down=true; moved=false; startX=e.clientX; startLeft=track.scrollLeft;
    track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', function(e){
    if(!down) return;
    var dx=e.clientX-startX;
    if(Math.abs(dx)>4) moved=true;
    track.scrollLeft=startLeft-dx;
  });
  ['pointerup','pointercancel'].forEach(function(t){
    track.addEventListener(t, function(){ down=false; track.classList.remove('is-dragging'); });
  });
  track.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
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
