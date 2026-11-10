(()=>{"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);
let W=0,H=0,dpr=1,raf=0,last=0,elapsed=0,score=0,best=Number(localStorage.getItem("neonRushBest")||0),speed=1,playerLane=1,objects=[],running=false,paused=false,over=false,spawn=0,flash=0;
const lanes=3,colors={cyan:"#51e5ff",pink:"#ff4fd8",gold:"#ffe66d"};
$("best").textContent=best;
function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
new ResizeObserver(resize).observe(canvas);
function laneX(l){return W*(.2+l*.3)}
function playerY(){return H*.79}
function start(){cancelAnimationFrame(raf);score=0;elapsed=0;speed=1;spawn=.5;playerLane=1;objects=[];running=true;paused=false;over=false;$("score").textContent="0";$("speed").textContent="1.0×";$("startScreen").classList.add("hidden");$("overScreen").classList.add("hidden");$("pauseTag").classList.add("hidden");last=performance.now();raf=requestAnimationFrame(loop)}
function move(n){if(!running||paused||over)return;playerLane=Math.max(0,Math.min(2,playerLane+n))}
function addObject(){const lane=Math.floor(Math.random()*3);const gem=Math.random()<.28;objects.push({lane,y:-30,type:gem?"gem":"block",size:gem?10:15,passed:false})}
function loop(t){if(!running||paused||over)return;const dt=Math.min((t-last)/1000,.04);last=t;elapsed+=dt;speed=Math.min(2.8,1+elapsed/45);spawn-=dt;if(spawn<=0){addObject();spawn=Math.max(.34,1.05/speed+Math.random()*.28)}objects.forEach(o=>o.y+=H*.53*speed*dt);objects=objects.filter(o=>o.y<H+40);for(const o of objects){if(!o.passed&&o.y>playerY()-12){o.passed=true;if(o.lane===playerLane){if(o.type==="block"){end();return}else{score+=10;flash=.15}}}}score+=dt*2;const shown=Math.floor(score);$("score").textContent=shown;$("speed").textContent=speed.toFixed(1)+"×";if(flash>0)flash-=dt;draw();raf=requestAnimationFrame(loop)}
function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
function draw(){if(!W||!H)return;ctx.clearRect(0,0,W,H);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0b1b2c");g.addColorStop(1,"#080b14");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.strokeStyle="#17334a";ctx.lineWidth=1;for(let i=0;i<4;i++){const x=W*(.05+i*.3);ctx.beginPath();ctx.moveTo(W/2,H*.12);ctx.lineTo(x,H);ctx.stroke()}for(let y=(elapsed*120)%55;y<H;y+=55){ctx.strokeStyle="#14283a";ctx.beginPath();ctx.moveTo(W*.05,y);ctx.lineTo(W*.95,y);ctx.stroke()}
objects.forEach(o=>{const x=laneX(o.lane);if(o.type==="gem"){ctx.save();ctx.translate(x,o.y);ctx.rotate(Math.PI/4);ctx.shadowBlur=18;ctx.shadowColor=colors.cyan;ctx.fillStyle=colors.cyan;ctx.fillRect(-8,-8,16,16);ctx.restore()}else{ctx.shadowBlur=18;ctx.shadowColor=colors.pink;roundRect(x-16,o.y-16,32,32,7,"#44203f",colors.pink);ctx.shadowBlur=0;roundRect(x-10,o.y-10,20,20,4,"#ff4fd8")}})
const px=laneX(playerLane),py=playerY();ctx.save();ctx.shadowBlur=24;ctx.shadowColor=colors.cyan;ctx.fillStyle=flash>0?"#fff":colors.cyan;ctx.beginPath();ctx.moveTo(px,py-20);ctx.lineTo(px+16,py+13);ctx.lineTo(px,py+7);ctx.lineTo(px-16,py+13);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle="#6c819b";ctx.font="9px system-ui";ctx.textAlign="center";ctx.fillText("DODGE  •  COLLECT  •  SURVIVE",W/2,H-14)}
function end(){running=false;over=true;cancelAnimationFrame(raf);const final=Math.floor(score);if(final>best){best=final;localStorage.setItem("neonRushBest",best);$("best").textContent=best}$("finalScore").textContent=final;$("overScreen").classList.remove("hidden")}
function togglePause(){if(!running||over)return;paused=!paused;$("pauseTag").classList.toggle("hidden",!paused);$("pause").textContent=paused?"▶":"Ⅱ";if(!paused){last=performance.now();raf=requestAnimationFrame(loop)}else cancelAnimationFrame(raf)}
$("play").addEventListener("click",start);$("again").addEventListener("click",start);$("left").addEventListener("click",()=>move(-1));$("right").addEventListener("click",()=>move(1));$("pause").addEventListener("click",togglePause);
window.addEventListener("keydown",e=>{if(["ArrowLeft","a","A"].includes(e.key)){e.preventDefault();move(-1)}if(["ArrowRight","d","D"].includes(e.key)){e.preventDefault();move(1)}if(e.key===" "){e.preventDefault();togglePause()}});
let touchX=null;canvas.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].clientX},{passive:true});canvas.addEventListener("touchend",e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>18)move(dx>0?1:-1);touchX=null},{passive:true});
resize();draw();
})();