const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const errs=[];
 const mk=async()=>{const c=await b.newContext({viewport:{width:1280,height:720}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.goto('http://localhost:8099/');await p.waitForTimeout(500);return p};
 const A=await mk(),B=await mk();
 const ok=(n,c)=>console.log(c?'OK  ':'FAIL',n);
 await A.evaluate(()=>{__eternia.Save.d.set.name='Ana'});await B.evaluate(()=>{__eternia.Save.d.set.name='Beto'});
 await A.evaluate(()=>__eternia.show('mp'));await A.click('#mpCreate');await A.waitForSelector('#mpCodeBig',{timeout:8000});
 const code=await A.textContent('#mpCodeBig');ok('sala criada '+code,/^[A-Z2-9]{5}$/.test(code));
 await B.evaluate(()=>__eternia.show('mp'));await B.fill('#mpCode',code);await B.click('#mpJoin');await B.waitForSelector('#mpCodeBig',{timeout:8000});
 await A.waitForTimeout(600);
 ok('2 jogadores no lobby A',(await A.$$eval('.pslot:not(.off)',e=>e.length))===2);
 await B.click('#mpReady');await A.waitForTimeout(500);
 await A.click('#mpStart');await A.waitForSelector('#cv',{timeout:8000});await B.waitForSelector('#cv',{timeout:8000});
 await A.waitForTimeout(800);
 // build: pick a tower and click a free cell via engine
 const cell=await A.evaluate(()=>{const g=__eternia.G;for(let r=0;r<13;r++)for(let c=0;c<20;c++)if(g.canBuild(c,r))return[c,r]});
 await A.evaluate(()=>{__eternia.G.build=0});
 const box=await A.$eval('#cv',e=>{const r=e.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}});
 await A.mouse.click(box.x+(cell[0]*48+24)*box.w/960,box.y+(cell[1]*48+24)*box.h/624);
 await A.waitForTimeout(800);
 ok('torre aparece em A',await A.evaluate(()=>__eternia.G.towers.length)===1);
 ok('torre sincronizada em B',await B.evaluate(()=>__eternia.G.towers.length)===1);
 await A.keyboard.press(' ');await A.waitForTimeout(3000);
 const eB=await B.evaluate(()=>__eternia.G.enemies.length),wB=await B.evaluate(()=>__eternia.G.wave);
 ok('onda iniciada e inimigos em B (w='+wB+',e='+eB+')',wB===1&&eB>0);
 ok('B (nao host) pausa desabilitada',await B.$eval('#bPause',e=>e.disabled));
 // reconexão B
 await B.evaluate(()=>{__eternia.Net.ws.close()});await B.waitForTimeout(3000);
 ok('B reconectou e continua na partida',await B.evaluate(()=>__eternia.Net.state==='on'&&__eternia.G&&__eternia.G.remote&&__eternia.G.towers.length===1));
 // host sai
 await A.evaluate(()=>__eternia.Net.leave());await B.waitForTimeout(800);
 ok('B virou host',await B.evaluate(()=>__eternia.Net.isHost));
 await B.screenshot({path:'/tmp/eternia/shot_mp.png'});
 console.log('erros:',errs.slice(0,8));
 await b.close();
})();
