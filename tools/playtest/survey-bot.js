// Bot playtester for prototypes/survey: serve the page on :8766 (wrapped in a doctype), then `node survey-bot.js 30`.
// Plays full runs with random routes and smart filing, and reports which leg each run ends on.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(800);
const runs=+process.argv[2]||20;
const res=await p.evaluate(async(runs)=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
 function bestHand(){const J=__G().journal;let best=null;const n=J.length;
   const idx=[...Array(n).keys()];const combos=[];
   const rec=(start,cur)=>{if(cur.length)combos.push(cur.slice());if(cur.length===5)return;for(let i=start;i<n;i++){cur.push(i);rec(i+1,cur);cur.pop()}};rec(0,[]);
   const need=+((document.body.innerText.match(/Target (\d+)/)||[0,0])[1])-+((document.body.innerText.match(/Filed (\d+)/)||[0,0])[1]);let cheap=null;
   for(const c of combos){const e=__evalHand(c.map(i=>J[i]));if(!best||e.total>best.e.total)best={e,c};if(e.total>=need&&(!cheap||c.length<cheap.c.length||(c.length===cheap.c.length&&e.total<cheap.e.total)))cheap={e,c}}return cheap||best}
 for(let r=0;r<runs;r++){
  while(!document.querySelector('h1'))await sleep(50);document.querySelector('#go').click();await sleep(30);document.querySelector('#go').click();
  let guard=0,info={legs:0,fails:null,filings:[]};
  while(guard++<20000){await sleep(1);
   const h2=document.querySelector('h2')?.textContent||'';const txt=document.body.innerText;
   if(document.querySelector('h1')){break}
   if(/Where next/.test(txt)){const cs=[...document.querySelectorAll('[data-id]')];cs[Math.floor(Math.random()*cs.length)].click();continue}
   if(/On the road/.test(h2)){const cs=[...document.querySelectorAll('[data-i]')];cs[Math.floor(Math.random()*cs.length)].click();continue}
   if(/Choose a keepsake/.test(h2)){const cs=[...document.querySelectorAll('[data-k]')];if(cs.length)cs[0].click();else document.querySelector('#skip').click();continue}
   if(/journal is full/.test(h2)){const J=__G().journal.slice().sort((a,b)=>a.value-b.value);document.querySelector(`[data-s="${J[0].id}"]`).click();continue}
   if(document.querySelector('[data-q]')){ // listening
     const L=txt.match(/Trust\s*(\d+)/);const trust=L?+L[1]:5;const st=(txt.match(/(\d) stories/)||[0,0])[1];
     if(+st>=3||(trust<=2&&+st>=1)){document.querySelector('#stop').click();continue}
     const qs=[...document.querySelectorAll('[data-q]')];const pref=q=>{const t=q.textContent;if(trust<=3)return /Wait|Tell your own|Name/.test(t)?0:1;return /Press/.test(t)?0:/Follow/.test(t)?1:/place/.test(t)?2:3};
     qs.sort((a,b)=>pref(a)-pref(b))[0].click();continue}
   if(document.querySelector('#grid')){const cells=[...document.querySelectorAll('.cell.bar:not(.seen)')];const left=+(txt.match(/\((\d+) looks left\)/)||[0,0])[1];
     if(left>0&&cells.length){cells[Math.floor(Math.random()*cells.length)].click();continue}document.querySelector('#go').click();continue}
   if(/Courthouse|Testimony at the river/.test(h2)){
     if(!info.legs||info.lastLeg!==__G().leg){info.legs=__G().leg;info.lastLeg=__G().leg;const t=+(txt.match(/Target (\d+)/)||[0,0])[1];info.filings.push({leg:__G().leg,target:t,journal:__G().journal.length})}
     const bh=bestHand();if(!bh){break}
     for(const i of bh.c)document.querySelector(`[data-s="${__G().journal[i].id}"]`).click();
     await sleep(1);document.querySelector('#file').click();await sleep(900);continue}
   if(/Not enough/.test(h2)){info.fails=__G().leg;document.querySelector('#go').click();continue}
   if(/Your testimony is taken/.test(h2)){info.done=true;document.querySelector('[data-e="accept"]').click();continue}
   if(/The Missouri/.test(h2)){document.querySelector('#go').click();continue}
   const go=document.querySelector('#go');if(go){go.click();continue}
   if(/^(Filed|Home|Outside|Downriver)/.test(h2)){document.querySelector('#go')?.click();continue}
   await sleep(200)}
  info.score=__G().score;out.push(info)}
 return out},runs);
const legs=res.map(r=>r.done?13:r.fails);console.log('reached/failed legs:',JSON.stringify(legs));
console.log('finished',res.filter(r=>r.done).length,'of',res.length);
console.log('sample filings',JSON.stringify(res[0].filings.slice(0,12)));
console.log('errors',JSON.stringify(errs.slice(0,5)));await b.close()})();
