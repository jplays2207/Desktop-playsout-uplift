/* PlaysOut mood joystick: a little arcade stick pinned to the left edge.
   Hover/tap it to pick Dark, Light or Neon. Neon is a random colour; pick Neon again to re-roll. */
(function(){
  var KEY='po-mood',CKEY='po-neon',root=document.documentElement;
  var NEONS=['#39FF14','#FF6B00','#B026FF','#FF1744','#FF2E97','#00F0FF','#F5FF00','#2979FF','#00FFA3'];
  function store(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function read(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function hexRgb(h){h=h.replace('#','');return [0,2,4].map(function(i){return parseInt(h.substr(i,2),16)}).join(',')}
  function paint(c){root.style.setProperty('--neon',c);root.style.setProperty('--neon-rgb',hexRgb(c));store(CKEY,c)}
  function roll(){var cur=read(CKEY),c;do{c=NEONS[Math.floor(Math.random()*NEONS.length)]}while(c===cur);paint(c)}
  function set(m){root.setAttribute('data-mood',m);store(KEY,m)}
  var saved=read(KEY);set(saved==='light'||saved==='neon'?saved:'dark');paint(read(CKEY)||NEONS[0]);
  var STICK='<svg viewBox="0 0 40 48" aria-hidden="true"><ellipse cx="20" cy="41" rx="15" ry="5" class="j-base"/><rect x="5" y="36" width="30" height="5" rx="2" class="j-base"/><g class="j-stick"><rect x="18.3" y="14" width="3.4" height="24" rx="1.7" class="j-rod"/><circle cx="20" cy="11" r="8" class="j-ball"/><circle cx="17.2" cy="8.4" r="2.2" fill="#fff" opacity=".55"/></g><circle cx="9" cy="38.5" r="1.6" class="j-btn"/><circle cx="31" cy="38.5" r="1.6" class="j-btn2"/></svg>';
  function build(){
    if(document.querySelector('.po-joy'))return;
    var w=document.createElement('div');w.className='po-joy';
    w.innerHTML='<button type="button" class="po-joy-stick" aria-label="Change theme" aria-expanded="false">'+STICK+'</button>'+
      '<div class="po-joy-menu" role="menu"><button type="button" data-m="dark" role="menuitemradio">Dark</button><button type="button" data-m="light" role="menuitemradio">Light</button><button type="button" data-m="neon" role="menuitemradio">Neon <span class="po-joy-dice">✦</span></button></div>';
    var stick=w.querySelector('.po-joy-stick');
    function sync(){var m=root.getAttribute('data-mood');w.querySelectorAll('[data-m]').forEach(function(b){var on=b.getAttribute('data-m')===m;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});w.setAttribute('data-m',m)}
    function wiggle(dir){w.classList.remove('tilt-l','tilt-r');void w.offsetWidth;w.classList.add(dir)}
    w.querySelectorAll('[data-m]').forEach(function(b){b.addEventListener('click',function(){var m=b.getAttribute('data-m');if(m==='neon')roll();set(m);sync();wiggle(m==='dark'?'tilt-l':'tilt-r')})});
    stick.addEventListener('click',function(){var o=w.classList.toggle('open');stick.setAttribute('aria-expanded',o)});
    document.addEventListener('click',function(e){if(!w.contains(e.target)){w.classList.remove('open');stick.setAttribute('aria-expanded','false')}});
    sync();document.body.appendChild(w);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
