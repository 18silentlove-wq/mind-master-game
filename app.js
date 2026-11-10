(()=>{"use strict";
const layout=["#######","#S....#","###.#.#","#...#D#","#.###.#","#.....#","#####E#"];
const $=id=>document.getElementById(id);const maze=$("maze");let player={r:1,c:1},doorOpen=false,score=0,moves=0,level=1,question=null,locked=false;
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function makeQuestion(){
 let a,b,answer,op,q;
 if(level<=2){
   a=rand(2,15);b=rand(2,12);op=Math.random()<.5?"+":"−";answer=op==="+"?a+b:a-b;
 }else if(level<=4){
   a=rand(2,12);b=rand(2,10);op=Math.random()<.5?"×":"+";answer=op==="×"?a*b:a+b;
 }else if(level<=6){
   if(Math.random()<.5){b=rand(2,12);answer=rand(2,12);a=b*answer;op="÷"}else{a=rand(10,60);b=rand(2,20);op="−";answer=a-b}
 }else if(level<=8){
   a=rand(10,40);b=rand(2,12);const c=rand(2,15);op=Math.random()<.5?"×":"+";
   answer=op==="×"?a*b+c:a+b*c;q=op==="×"?a+" × "+b+" + "+c:a+" + "+b+" × "+c;
 }else{
   a=rand(3,15);b=rand(2,12);const c=rand(2,10);op=Math.random()<.5?"×":"+";answer=op==="×"?(a+b)*c:a*b+c;q=op==="×"?"("+a+" + "+b+") × "+c:a+" × "+b+" + "+c;
 }
 if(!q)q=a+" "+op+" "+b;
 const choices=new Set([answer]);while(choices.size<4){let wrong=answer+rand(-Math.max(5,level*2),Math.max(5,level*2));if(wrong!==answer&&wrong>=0)choices.add(wrong)}
 return {q:q+" = ?",a:answer,o:[...choices]};
}
function tileAt(r,c){return layout[r]?.[c]||"#"}
function draw(){maze.replaceChildren();layout.forEach((row,r)=>[...row].forEach((ch,c)=>{const el=document.createElement("div");el.className="tile "+(ch==="#"?"wall":ch==="D"&&!doorOpen?"door":ch==="E"?"exit":"path");if(player.r===r&&player.c===c){el.className="tile player";el.textContent="🧍"}else if(ch==="D"&&!doorOpen)el.textContent="🔒";else if(ch==="E")el.textContent="🏁";else if(ch==="#")el.textContent="";maze.append(el)}))}
function ask(){if(question)return;question=makeQuestion();$("question-text").textContent=question.q;const box=$("answers");box.replaceChildren();question.o.sort(()=>Math.random()-.5).forEach(n=>{const b=document.createElement("button");b.className="answer";b.textContent=n;b.addEventListener("click",()=>answer(n));box.append(b)});$("feedback").textContent="इस सवाल का सही जवाब चुनो। गलत होने पर यही सवाल रहेगा।";$("feedback").className="feedback"}
function answer(n){if(locked||doorOpen||!question)return;if(n===question.a){doorOpen=true;score+=20;$("score").textContent=score;$("feedback").textContent="बिल्कुल सही! दरवाज़ा खुल गया। अब Exit तक जाओ।";$("feedback").className="feedback good";[...$("answers").children].forEach(b=>b.disabled=true);draw()}else{$("feedback").textContent="यह जवाब सही नहीं है। उसी सवाल को फिर से हल करो!";$("feedback").className="feedback bad"}}
function move(dir){if(locked)return;const delta={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[dir];if(!delta)return;const r=player.r+delta[0],c=player.c+delta[1],ch=tileAt(r,c);if(ch==="#"||(!doorOpen&&ch==="D")){if(ch==="D"&&!doorOpen)ask();return}player={r,c};moves++;$("moves").textContent=moves;draw();if(ch==="E")win()}
function win(){locked=true;$("win-text").textContent="लेवल "+level+" पूरा! तुम्हें "+moves+" चालें लगीं। अगले लेवल में सवाल और कठिन होंगे।";$("win").hidden=false}
function reset(){player={r:1,c:1};doorOpen=false;moves=0;locked=false;question=null;$("level").textContent=level;$("moves").textContent="0";$("win").hidden=true;$("question-text").textContent="तैयार हो?";$("answers").replaceChildren();$("feedback").textContent="दरवाज़े तक पहुँचो और सवाल हल करो।";$("feedback").className="feedback";draw()}
document.querySelectorAll("[data-move]").forEach(b=>b.addEventListener("click",()=>move(b.dataset.move)));$("restart").addEventListener("click",()=>{score=0;level=1;$("score").textContent="0";reset()});$("next").addEventListener("click",()=>{level++;score+=30;$("score").textContent=score;reset()});window.addEventListener("keydown",e=>{const k={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.key];if(k){e.preventDefault();move(k)}});reset();
})();