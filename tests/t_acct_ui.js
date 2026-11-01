const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();const errs=[];const ok=(n,c)=>console.log(c?'OK  ':'FAIL',n);
 const mk=async()=>{const c=await b.newContext({viewport:{width:1280,height:720}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.goto('http://localhost:8099/');await p.waitForTimeout(500);return p};
 const user='u'+Date.now().toString(36).slice(-7);
 const A=await mk();
 await A.evaluate(()=>{const S=__eternia.Save.d;S.coins=777;S.owned[3]=1;S.owned[7]=1;S.stats.bestWave=9;S.best={0:9};__eternia.Save.save()});
 await A.click('#acctchip');await A.click('#tR');await A.fill('#aU',user);await A.fill('#aP','segredo123');await A.fill('#aP2','outra');await A.click('#aOk');
 ok('senhas diferentes bloqueadas',(await A.textContent('#aE')).includes('conferem'));
 await A.fill('#aP2','segredo123');await A.click('#aOk');await A.waitForTimeout(800);
 ok('chip mostra usuário',(await A.textContent('#acctchip')).includes(user));
 await A.waitForTimeout(3500);
 ok('status Salvo na conta',(await A.textContent('#acctchip')).includes('Salvo'));
 // outro computador
 const B=await mk();
 ok('B começa com 100 moedas',await B.evaluate(()=>__eternia.Save.d.coins)===100);
 await B.click('#acctchip');await B.fill('#aU',user);await B.fill('#aP','errada1');await B.click('#aOk');await B.waitForTimeout(600);
 ok('senha errada rejeitada',(await B.textContent('#aE')).includes('incorretos'));
 await B.fill('#aP','segredo123');await B.click('#aOk');await B.waitForTimeout(1000);
 const r=await B.evaluate(()=>({c:__eternia.Save.d.coins,o:Object.keys(__eternia.Save.d.owned).length,bw:__eternia.Save.d.stats.bestWave}));
 ok('progresso carregado em B '+JSON.stringify(r),r.c===777&&r.o===5&&r.bw===9);
 // B compra/gasta e sincroniza para A
 await B.evaluate(()=>{__eternia.Save.d.coins=500;__eternia.Save.d.owned[12]=1;__eternia.Save.save()});await B.waitForTimeout(3500);
 await A.evaluate(()=>__eternia.show('prof'));await A.click('#pfNow');await A.waitForTimeout(1500);
 ok('A recebeu mudança de B',await A.evaluate(()=>__eternia.Save.d.owned[12]===1));
 // perfil renderiza
 await B.evaluate(()=>__eternia.show('prof'));await B.screenshot({path:'/tmp/eternia/shot_prof.png'});
 // logout+wipe
 await B.click('#pfOut');await B.waitForTimeout(500);
 ok('logout mantém local',await B.evaluate(()=>__eternia.Save.d.coins)===500);
 // backup
 await B.click('#pfIn').catch(()=>{});
 console.log('erros:',errs.slice(0,6));await b.close();
})();
