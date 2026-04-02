document.addEventListener("DOMContentLoaded", () => {
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W, H;
function resizeCanvas(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
 
const GOLD_PALETTE = ['#c9a84c','#e8c97a','#f5e9c8','#8a6a20','#fff8e7','#d4a843'];
 
/* Floating dust particles (always on) */
const dustParticles = Array.from({length:60}, () => createDust());
function createDust(){
  return {
    x: Math.random()*1920, y: Math.random()*1080,
    r: Math.random()*1.5+.3,
    vx:(Math.random()-.5)*.15, vy:-Math.random()*.3-.1,
    alpha:Math.random()*.5+.1,
    color:GOLD_PALETTE[Math.floor(Math.random()*GOLD_PALETTE.length)]
  };
}
 
/* Confetti burst particles */
let confetti = [];
class Confetti {
  constructor(x, y){
    const angle = Math.random()*Math.PI*2;
    const spd   = Math.random()*8+3;
    this.x=x||Math.random()*W; this.y=y||H*-.05;
    this.vx=Math.cos(angle)*spd; this.vy=Math.sin(angle)*spd;
    this.w=Math.random()*14+5; this.h=Math.random()*6+3;
    this.rot=Math.random()*Math.PI*2; this.vrot=(Math.random()-.5)*.15;
    this.color=GOLD_PALETTE[Math.floor(Math.random()*GOLD_PALETTE.length)];
    this.alpha=1; this.life=Math.random()*140+100; this.age=0;
  }
  update(){
    this.x+=this.vx; this.y+=this.vy; this.vy+=.12;
    this.rot+=this.vrot;
    if(this.age>this.life*.6) this.alpha=1-(this.age-this.life*.6)/(this.life*.4);
    this.age++;
    return this.age<this.life;
  }
  draw(){
    ctx.save(); ctx.globalAlpha=Math.max(0,this.alpha);
    ctx.translate(this.x,this.y); ctx.rotate(this.rot);
    ctx.fillStyle=this.color;
    ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);
    ctx.restore();
  }
}
 
function burstConfetti(n=150, cx, cy){
  for(let i=0;i<n;i++) confetti.push(new Confetti(cx,cy));
}
 
function tick(){
  ctx.clearRect(0,0,W,H);
  /* dust */
  dustParticles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.y<-5){ p.y=H+5; p.x=Math.random()*W; }
    if(p.x<0||p.x>W){ p.x=Math.random()*W; }
    ctx.save(); ctx.globalAlpha=p.alpha;
    ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });
  /* confetti */
  confetti=confetti.filter(c=>{ const a=c.update(); if(a) c.draw(); return a; });
  requestAnimationFrame(tick);
}
tick();
 
/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
const cur=document.getElementById('cursor');
const ring=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  cur.style.left=mx+'px'; cur.style.top=my+'px';
});
(function cursorRing(){
  rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(cursorRing);
})();
document.querySelectorAll('a,button,.gallery-item,.cake-svg-el').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.width='20px';cur.style.height='20px';});
  el.addEventListener('mouseleave',()=>{cur.style.width='12px';cur.style.height='12px';});
});
 
/* ══════════════════════════════════════════════════════
   NAME / LANDING
══════════════════════════════════════════════════════ */
let bName = localStorage.getItem('luxBdayName') || 'Jahnavi';
function refreshName(n){
  bName=n;
  document.querySelectorAll('#landing-name,#hero-name,#footer-name').forEach(el=>{
    el.textContent=n; el.dataset.text=n;
  });
  document.getElementById('nav-logo').textContent='✦ '+n;
  document.title='Happy Birthday, '+n+' ✦';
}
refreshName(bName);
 
function setName(){
  const v=document.getElementById('name-inp').value.trim();
  if(v){ localStorage.setItem('luxBdayName',v); refreshName(v); }
}
document.getElementById('name-inp').addEventListener('keydown',e=>{ if(e.key==='Enter') setName(); });
 
function enterSite(){
  document.getElementById('screen-landing').style.opacity='0';
  document.getElementById('screen-landing').style.transition='opacity .8s ease';
  setTimeout(()=>{
    document.getElementById('screen-landing').classList.remove('visible');
    const main=document.getElementById('screen-main');
    main.classList.add('visible');
    main.style.opacity='0'; main.style.transition='opacity .8s ease';
    requestAnimationFrame(()=>{ main.style.opacity='1'; });
    burstConfetti(180);
    setTimeout(tryMusic, 600);
    setTimeout(initReveal, 400);
    initCountdown();
  }, 700);
}
 
/* ══════════════════════════════════════════════════════
   MUSIC
══════════════════════════════════════════════════════ */
const audio=document.getElementById('bg-audio');
const fab=document.getElementById('music-fab');
let playing=false;
function tryMusic(){ audio.volume=.35; audio.play().then(()=>{ playing=true; fab.classList.add('playing'); fab.textContent='⏸'; }).catch(()=>{}); }
function toggleMusic(){
  if(playing){ audio.pause(); playing=false; fab.classList.remove('playing'); fab.textContent='♫'; }
  else { audio.play().then(()=>{ playing=true; fab.classList.add('playing'); fab.textContent='⏸'; }); }
}
 
/* ══════════════════════════════════════════════════════
   COUNTDOWN — fixed to 03 April 2026, 12:00 AM
══════════════════════════════════════════════════════ */
let cdTarget = new Date('2026-04-03T00:00:00');
function initCountdown(){ runCountdown(); }
function pad(n){ return String(n).padStart(2,'0'); }
function runCountdown(){
  setInterval(()=>{
    const diff=cdTarget-new Date();
    if(diff<=0){
      document.getElementById('cd-grid').classList.add('hidden');
      document.getElementById('cd-celebrate').classList.remove('hidden');
      burstConfetti(250); return;
    }
    const d=Math.floor(diff/864e5);
    const h=Math.floor(diff%864e5/36e5);
    const m=Math.floor(diff%36e5/6e4);
    const s=Math.floor(diff%6e4/1e3);
    document.getElementById('cd-d').textContent=pad(d);
    document.getElementById('cd-h').textContent=pad(h);
    document.getElementById('cd-m').textContent=pad(m);
    document.getElementById('cd-s').textContent=pad(s);
  },1000);
}
 
/* ══════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════ */
const LETTER=`Dear Jahnavi,
 
Wishing you a very Happy Birthday!
 
On this special day, I wanted to take a moment to let you know how truly wonderful it is to have you as a friend. Your kindness, your warmth, and your positive spirit make every interaction a pleasure.
 
Over the time I have known you, I have always admired the grace with which you carry yourself and the sincerity you bring to everything you do. You are the kind of person who makes those around you feel valued and at ease — and that is a rare and beautiful quality.
 
I hope this birthday brings you everything you deserve — good health, great joy, and all the success you have worked so hard for. May the year ahead open wonderful new doors for you and be filled with moments worth cherishing.
 
Here's to you, Jahnavi. Have a truly memorable day.
 
With warm wishes,
A Friend ✦`;
 
let twStarted=false;
function startTypewriter(){
  if(twStarted) return; twStarted=true;
  const el=document.getElementById('tw-text');
  const cur=document.getElementById('tw-cursor');
  let i=0;
  function type(){
    if(i<LETTER.length){
      el.textContent+=LETTER[i];
      i++;
      const ch=LETTER[i-1];
      const delay=ch==='\n'?90:/[.,!?✦]/.test(ch)?180:28;
      setTimeout(type,delay);
    } else { cur.style.display='none'; }
  }
  type();
}
 
/* ══════════════════════════════════════════════════════
   CAKE
══════════════════════════════════════════════════════ */
let cakeDone=false;
function doCutCake(){
  if(cakeDone) return; cakeDone=true;
  const ln=document.getElementById('cut-ln');
  const flames=document.getElementById('flames');
  ln.style.opacity='1';
  flames.style.transition='opacity .6s'; flames.style.opacity='0';
  document.getElementById('cut-btn').disabled=true;
  document.getElementById('cake-result').classList.remove('hidden');
  document.getElementById('cake-hint-txt').textContent='✦ Your wish has been made ✦';
  /* confetti burst from cake position */
  const cakeEl=document.getElementById('cake-svg');
  const rect=cakeEl.getBoundingClientRect();
  burstConfetti(200, rect.left+rect.width/2, rect.top+rect.height/2);
}
 
/* ══════════════════════════════════════════════════════
   WISHES
══════════════════════════════════════════════════════ */
const WISHES_KEY='luxBdayWishes';
function loadWishes(){ try{ return JSON.parse(localStorage.getItem(WISHES_KEY))||[]; }catch{ return []; } }
function saveWishes(w){ localStorage.setItem(WISHES_KEY,JSON.stringify(w)); }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function renderWish(w, prepend=false){
  const feed=document.getElementById('wishes-feed');
  const card=document.createElement('div'); card.className='wish-card';
  card.innerHTML=`<div class="wish-card-top"><div class="wish-from">${esc(w.name||'Anonymous')}</div><div class="wish-time">${w.time}</div></div><div class="wish-body">${esc(w.msg)}</div>`;
  prepend?feed.prepend(card):feed.appendChild(card);
}
loadWishes().forEach(w=>renderWish(w));
 
function addWish(){
  const name=document.getElementById('wish-name').value.trim()||'Anonymous';
  const msg=document.getElementById('wish-msg').value.trim();
  if(!msg){ document.getElementById('wish-msg').focus(); return; }
  const now=new Date();
  const time=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const w={name,msg,time};
  const all=loadWishes(); all.unshift(w); saveWishes(all);
  renderWish(w,true);
  document.getElementById('wish-name').value='';
  document.getElementById('wish-msg').value='';
  burstConfetti(50);
}
 
/* ══════════════════════════════════════════════════════
   SCROLL REVEAL + TYPEWRITER TRIGGER
══════════════════════════════════════════════════════ */
function initReveal(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('shown'); io.unobserve(e.target); }
    });
  },{threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
 
  /* Typewriter trigger */
  const msgSec=document.getElementById('s-message');
  const tw=new IntersectionObserver(e=>{ if(e[0].isIntersecting){ startTypewriter(); tw.disconnect(); } },{threshold:.3});
  tw.observe(msgSec);
}
 
/* Hero date */
(function setHeroDate(){
  const now=new Date();
  const opts={weekday:'long',year:'numeric',month:'long',day:'numeric'};
  document.getElementById('hero-date').textContent=now.toLocaleDateString(undefined,opts);
})();
 
/* Midnight fireworks check */
setInterval(()=>{
  const n=new Date();
  if(n.getHours()===0&&n.getMinutes()===0&&n.getSeconds()<4) burstConfetti(350);
},1000);
  });
