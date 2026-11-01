const B='http://localhost:8099';
const j=async(m,p,b,tok)=>{const r=await fetch(B+p,{method:m,headers:{'Content-Type':'application/json',...(tok?{Authorization:'Bearer '+tok}:{})},body:b?JSON.stringify(b):undefined});return{s:r.status,b:await r.json().catch(()=>({}))}};
const ok=(c,n)=>console.log((c?'PASS':'FAIL')+' - '+n);
(async()=>{
 const prof={xp:50,level:3,coins:777,owned:{0:1,5:1,10:1,24:1,99:1},mapsWon:{0:true,15:true},stars:{0:3},best:{0:12},upg:{gold:3,hack:99},stats:{kills:10,bestWave:12,wins:1},ach:{first:1,'<script>':1},set:{name:'<b>Zé</b>',master:5},__proto__:{x:1},evil:'x'.repeat(10)};
 let r=await j('POST','/api/register',{user:'Ana_01',pass:'segredo123',profile:prof});ok(r.s===200&&r.b.token&&r.b.token.length===64,'registro ok');
 const tok=r.b.token;ok(r.b.profile.owned[24]===1&&!r.b.profile.owned[99],'sanitiza torres (24 sim, 99 não)');ok(!r.b.profile.mapsWon[15]&&r.b.profile.upg.gold===3&&!r.b.profile.upg.hack,'sanitiza mapas/upgrades');ok(r.b.profile.set.name==='bZéb'&&r.b.profile.set.master===1,'sanitiza nome/volume');ok(!('evil' in r.b.profile)&&!r.b.profile.ach['<script>'],'descarta campos desconhecidos');
 r=await j('POST','/api/register',{user:'ana_01',pass:'outrasenha'});ok(r.s===400&&/existe/.test(r.b.err),'usuário único (case-insensitive)');
 r=await j('POST','/api/register',{user:'x',pass:'123456'});ok(r.s===400,'usuário curto rejeitado');
 r=await j('POST','/api/register',{user:'Beto',pass:'123'});ok(r.s===400,'senha curta rejeitada');
 r=await j('POST','/api/login',{user:'ANA_01',pass:'errada'});ok(r.s===401,'senha errada = 401');
 r=await j('POST','/api/login',{user:'fantasma',pass:'qualquer'});ok(r.s===401&&r.b.err==='Usuário ou senha incorretos.','usuário inexistente = mesma mensagem');
 r=await j('POST','/api/login',{user:'ana_01',pass:'segredo123'});ok(r.s===200&&r.b.profile.coins===777,'login devolve progresso');const tok2=r.b.token,at=r.b.serverAt;
 r=await j('GET','/api/profile',null,'f'.repeat(64));ok(r.s===401,'token inválido = 401');
 r=await j('GET','/api/profile',null,tok);ok(r.s===200&&r.b.profile.level===3&&r.b.name==='Ana_01','GET perfil');
 const p2={...r.b.profile,coins:900};
 r=await j('PUT','/api/profile',{profile:p2,base:at},tok);ok(r.s===200&&r.b.serverAt>at,'PUT com versão atual');const v1=r.b.serverAt;
 r=await j('PUT','/api/profile',{profile:{...p2,coins:1},base:at},tok2);ok(r.s===409&&r.b.profile.coins===900,'PUT com versão antiga = 409 (não sobrescreve)');
 r=await j('PUT','/api/profile',{profile:{...p2,coins:950},base:v1},tok2);ok(r.s===200,'PUT correto de outro dispositivo');
 r=await j('PUT','/api/profile',{profile:'lixo',base:r.b.serverAt},tok);ok(r.s===400||r.s===409,'perfil inválido rejeitado');
 const big={...p2,junk:'y'.repeat(70000)};r=await j('PUT','/api/profile',{profile:big,base:1},tok);ok(r.s===400||r.s===409||r.s===413,'perfil gigante rejeitado');
 r=await j('POST','/api/logout',{},tok);r=await j('GET','/api/profile',null,tok);ok(r.s===401,'logout invalida o token');
 // cadastros simultâneos do mesmo nome: só um vence
 const rs=await Promise.all(Array.from({length:6},()=>j('POST','/api/register',{user:'Corrida',pass:'123456'})));ok(rs.filter(x=>x.s===200).length===1,'corrida de cadastro: exatamente 1 vence');
 // força bruta
 let last;for(let i=0;i<12;i++)last=await j('POST','/api/login',{user:'ana_01',pass:'x'+i});ok(last.s===429,'bloqueio após muitas tentativas');
 r=await j('GET','/health');console.log('health',JSON.stringify(r.b));
})();
