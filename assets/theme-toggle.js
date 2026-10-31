/* PlaysOut mood switch: dark (default) / light / neon. Neon picks a random colour each time;
   in neon mode a little shuffle button re-rolls it. Tucked bottom-left, barely visible. */
(function(){
  var MODES=['dark','light','neon'],KEY='po-mood',CKEY='po-neon',root=document.documentElement;
  var NEONS=['#39FF14','#FF6B00','#B026FF','#FF1744','#FF2E97','#00F0FF','#F5FF00','#2979FF','#00FFA3'];
  function store(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function read(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function hexRgb(h){h=h.replace('#','');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)}).join(',')}
  function paint(c){root.style.setProperty('--neon',c);root.style.setProperty('--neon-rgb',hexRgb(c));store(CKEY,c)}
  function roll(){var cur=read(CKEY),c;do{c=NEONS[Math.floor(Math.random()*NEONS.length)]}while(c===cur);paint(c)}
  function set(m){root.setAttribute('data-mood',m);store(KEY,m)}
  set(read(KEY)||'dark');paint(read(CKEY)||NEONS[0]);
  function build(){
    if(document.querySelector('.po-mood'))return;
    var wrap=document.createElement('div');wrap.className='po-mood-wrap';
    var b=document.createElement('button');b.type='button';b.className='po-mood';
    b.innerHTML='<span class="po-mood-track"><i></i></span><span class="po-mood-label"></span>';
    var s=document.createElement('button');s.type='button';s.className='po-shuffle';s.setAttribute('aria-label','Random neon colour');s.title='Random neon colour';s.textContent='✦';
    function sync(){var m=root.getAttribute('data-mood');b.setAttribute('data-pos',MODES.indexOf(m));b.querySelector('.po-mood-label').textContent=m;b.setAttribute('aria-label','Theme: '+m+'. Click to switch.');b.title='Theme: '+m}
    b.addEventListener('click',function(){var i=(MODES.indexOf(root.getAttribute('data-mood'))+1)%MODES.length;if(MODES[i]==='neon')roll();set(MODES[i]);sync()});
    s.addEventListener('click',roll);
    sync();wrap.appendChild(b);wrap.appendChild(s);document.body.appendChild(wrap);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
