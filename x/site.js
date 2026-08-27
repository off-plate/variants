/* Lustra Studio, variant X. Sticky nav, mobile menu, scroll reveal,
   approach-column switching, work tabs, accordion, and the ink canvases:
   see canvasInk below, one shared WebGL2 fluid-noise shader driving four
   independently seeded instances. */

(function(){
  var bar=document.getElementById('topbar'), burger=document.getElementById('burger'),
      menu=document.getElementById('menu'), last=0, ticking=false, open=false;
  function onScroll(){
    var y=Math.max(0,scrollY);
    bar.classList.toggle('is-stuck', y>20);
    if(!open) bar.classList.toggle('is-hidden', y>last && y>220);
    last=y; ticking=false;
    var h=document.documentElement.scrollHeight-innerHeight;
    document.querySelector('.scrollbar-progress').style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
  }
  addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(onScroll);} },{passive:true});
  onScroll();
  function focusables(){ return menu.querySelectorAll('a[href]'); }
  var lastFocus=null;
  function setMenu(v){
    open=v;
    if(v){ lastFocus=document.activeElement; menu.hidden=false; bar.classList.remove('is-hidden'); }
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

/* one quiet arrival per group */
(function(){
  if(!matchMedia('(prefers-reduced-motion: no-preference)').matches){
    document.querySelectorAll('[data-rise],.apcols,.workcard,.acc').forEach(function(e){ e.classList.add('is-in'); });
    return;
  }
  var els=document.querySelectorAll('[data-rise],.apcols,.workcard,.acc,.nextproj');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.12});
  els.forEach(function(e){ io.observe(e); });
})();

/* approach columns: click to switch the active tag + rail position */
(function(){
  var cols=document.querySelectorAll('.apcol'), rail=document.querySelector('.aprail i');
  if(!cols.length) return;
  cols.forEach(function(c,i){
    c.addEventListener('click',function(){
      cols.forEach(function(x){ x.classList.remove('is-active'); });
      c.classList.add('is-active');
      if(rail) rail.style.setProperty('--ap', i);
    });
  });
})();

/* work tabs: swap the caption text between Design / Engineering */
(function(){
  var tabs=document.querySelectorAll('.wtab'), label=document.querySelector('[data-worklabel]'),
      body=document.querySelector('[data-workbody]');
  if(!tabs.length) return;
  var copy=[
    {b:'Marketing', p:"Full-funnel digital marketing services to reach your target audience without the overwhelm. We identify gaps in your current marketing strategy, then consult you on what you need and how we'll make it happen. All before the contract is signed."},
    {b:'Engineering', p:"Product-grade front ends and the systems behind them, shipped fast and kept maintainable. Engineering sits in the same room as design from kickoff to launch, not downstream of it."}
  ];
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){ x.classList.remove('is-active'); x.setAttribute('aria-selected','false'); });
      t.classList.add('is-active'); t.setAttribute('aria-selected','true');
      if(label) label.textContent=copy[i].b;
      if(body) body.textContent=copy[i].p;
    });
  });
})();

/* accordion: one open at a time, height measured instead of fr-tricked.
   Each body's natural height is read via scrollHeight (which reports the
   full content extent even while the element is clipped to height:0) and
   written to --h, so the CSS transition always has a real pixel target on
   both the open row and any row a click is about to open, including the
   very first paint, with no dependency on a prior transition. */
(function(){
  var rows=document.querySelectorAll('.accrow');
  function measure(r){
    var body=r.querySelector('.accrow__body');
    body.style.setProperty('--h', body.scrollHeight+'px');
  }
  rows.forEach(measure);
  addEventListener('resize', function(){ rows.forEach(measure); }, {passive:true});
  rows.forEach(function(r){
    var head=r.querySelector('.accrow__head'), ic=r.querySelector('.accrow__ic');
    head.addEventListener('click',function(){
      var willOpen=!r.classList.contains('is-open');
      rows.forEach(function(x){ measure(x); });
      rows.forEach(function(x){
        x.classList.remove('is-open');
        x.querySelector('.accrow__head').setAttribute('aria-expanded','false');
        x.querySelector('.accrow__ic').textContent='+';
      });
      if(willOpen){ r.classList.add('is-open'); head.setAttribute('aria-expanded','true'); ic.textContent='−'; }
    });
  });
})();

/* contact form: no backend here, so acknowledge and stop */
(function(){
  var f=document.querySelector('[data-cform]');
  if(!f) return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    f.querySelectorAll('input').forEach(function(i){ i.disabled=true; });
    f.querySelector('button').hidden=true;
    f.querySelector('.cform__ok').hidden=false;
  });
})();

/* ── canvasInk ──────────────────────────────────────────────────────────
   The reference's recurring liquid-ink/marble motif, rendered live as a
   WebGL2 canvas instead of a static image: one small fragment shader,
   two-pass domain-warped fbm thresholded into ink veins, monochrome,
   seeded per instance so the four slots never look identical. Paused via
   IntersectionObserver when off screen. Frozen on one still frame under
   reduced motion. */
(function(){
  var VERT = "#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0.0,1.0);}";
  var FRAG = "#version 300 es\n" +
    "precision highp float;\n" +
    "uniform vec2 u_res; uniform float u_time; uniform float u_seed;\n" +
    "out vec4 o;\n" +
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\n" +
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);\n" +
    "  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}\n" +
    "float fbm(vec2 p){float v=0.0,a=0.52;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=0.52;}return v;}\n" +
    "void main(){\n" +
    "  vec2 uv=gl_FragCoord.xy/u_res.xy;\n" +
    "  vec2 p=(uv-0.5); p.x*=u_res.x/u_res.y; p*=2.1;\n" +
    "  p+=u_seed*11.0;\n" +
    "  float t=u_time*0.045;\n" +
    "  vec2 q=vec2(fbm(p+vec2(0.0,0.0)+t*0.6), fbm(p+vec2(5.2,1.3)-t*0.4));\n" +
    "  vec2 r=vec2(fbm(p+3.4*q+vec2(1.7,9.2)+t*0.3), fbm(p+3.4*q+vec2(8.3,2.8)-t*0.5));\n" +
    "  float n=fbm(p+3.9*r);\n" +
    "  float veins=smoothstep(0.46,0.5,n)-smoothstep(0.5,0.54,n);\n" +
    "  float base=smoothstep(0.32,0.7,n);\n" +
    "  float ink=clamp(base*0.86+veins*1.4,0.0,1.0);\n" +
    "  vec3 col=mix(vec3(0.02),vec3(0.94),ink);\n" +
    "  o=vec4(col,1.0);\n" +
    "}";

  function compile(gl,type,src){
    var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function mount(canvas){
    var gl=canvas.getContext('webgl2',{antialias:false,alpha:false});
    if(!gl) return;
    var vs=compile(gl,gl.VERTEX_SHADER,VERT), fs=compile(gl,gl.FRAGMENT_SHADER,FRAG);
    if(!vs||!fs) return;
    var prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);
    var uRes=gl.getUniformLocation(prog,'u_res'), uTime=gl.getUniformLocation(prog,'u_time'),
        uSeed=gl.getUniformLocation(prog,'u_seed');
    var seed=parseFloat(canvas.dataset.inkSeed||'0');
    var running=false, raf=null, dpr=Math.min(devicePixelRatio||1,1.6);
    function resize(){
      var w=Math.max(1,Math.round(canvas.clientWidth*dpr)), h=Math.max(1,Math.round(canvas.clientHeight*dpr));
      if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h); }
    }
    function draw(t){
      resize();
      gl.uniform2f(uRes,canvas.width,canvas.height);
      gl.uniform1f(uTime,t/1000);
      gl.uniform1f(uSeed,seed);
      gl.drawArrays(gl.TRIANGLES,0,3);
      if(running) raf=requestAnimationFrame(draw);
    }
    var reduce=!matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if(reduce){ resize(); draw(seed*4000); return; }
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting && !running){ running=true; raf=requestAnimationFrame(draw); }
        else if(!e.isIntersecting && running){ running=false; if(raf) cancelAnimationFrame(raf); }
      });
    },{threshold:.05});
    io.observe(canvas);
    addEventListener('resize', resize, {passive:true});
  }
  document.querySelectorAll('[data-ink]').forEach(mount);
})();
