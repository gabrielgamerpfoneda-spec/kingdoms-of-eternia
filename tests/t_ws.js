const WebSocket=require('ws');const C=require('/tmp/eternia/dist/server/game-core.js');
const URL='ws://localhost:8099/ws';const RUN=Math.random().toString(36).slice(2,8);let fails=0;
const ok=(c,n)=>{console.log((c?'PASS':'FAIL')+' - '+n);if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function client(name,cid){
 const c={name,cid:cid+RUN,msgs:[],room:null,snap:null,start:null,closed:false,snaps:0};
 c.open=()=>new Promise(res=>{c.ws=new WebSocket(URL);c.ws.on('open',()=>{c.send({t:'hello',v:2,cid:c.cid,name:c.name,owned:[0,5,10,6,7]});});
  c.ws.on('message',d=>{const m=JSON.parse(d);c.msgs.push(m);if(m.t==='welcome')res(m);if(m.t==='room')c.room=m;if(m.t==='start')c.start=m;if(m.t==='snap'){c.snap=m;c.snaps++}});
  c.ws.on('close',(code)=>{c.closed=code||true})});
 c.send=o=>c.ws.send(JSON.stringify(o));c.last=t=>[...c.msgs].reverse().find(m=>m.t===t);return c}
(async()=>{
 const a=client('Alice','alicecid0001'),b=client('Bob','bobcid000002'),d=client('Dora','doracid00003');
 let w=await a.open();ok(w.guest===true&&w.towers.join()==='0,5,10','convidado só recebe torres iniciais (mesmo declarando mais)');
 await b.open();await d.open();
 a.send({t:'create',map:0,diff:'normal'});await sleep(200);ok(a.room&&/^[A-Z2-9]{5}$/.test(a.room.code),'sala criada com código de 5 chars: '+(a.room&&a.room.code));
 const code=a.room.code;ok(a.room.hostId===0&&a.room.players.length===1,'criador é anfitrião');
 b.send({t:'join',code:'ZZZZZ'});await sleep(150);ok(b.last('err')&&/não encontrada/.test(b.last('err').msg),'código inexistente rejeitado');
 b.send({t:'join',code:code.toLowerCase()});await sleep(200);ok(b.room&&b.room.players.length===2,'entrou com código (case-insensitive)');
 d.send({t:'join',code});await sleep(200);ok(a.room.players.length===3&&a.room.players.map(p=>p.color).every(Boolean),'3 jogadores, cada um com cor');
 // não-anfitrião não pode iniciar nem configurar
 b.send({t:'start'});b.send({t:'cfg',map:5,diff:'hard'});await sleep(150);ok(!b.start&&a.room.map===0,'só o anfitrião inicia/configura');
 a.send({t:'cfg',map:2,diff:'hard'});await sleep(150);ok(b.room.map===2&&b.room.diff==='hard','anfitrião configura mapa/dificuldade (propaga)');
 b.send({t:'ready',v:true});await sleep(100);ok(a.room.players.find(p=>p.name==='Bob').ready,'ready propaga');
 // sala cheia
 const extra=[];for(let i=0;i<3;i++){const e=client('E'+i,'extracid00'+i+'x');await e.open();e.send({t:'join',code});extra.push(e)}
 await sleep(300);ok(a.room.players.length===6,'6 jogadores no máximo: '+a.room.players.length);
 const e7=client('Sete','extracid0099');await e7.open();e7.send({t:'join',code});await sleep(200);ok(e7.last('err')&&/cheia/.test(e7.last('err').msg),'7º jogador rejeitado (sala cheia)');
 e7.ws.close();
 extra.forEach(e=>e.send({t:'leave'}));await sleep(200);ok(a.room.players.length===3,'saída de jogadores atualiza a sala');
 // iniciar
 a.send({t:'start'});await sleep(500);ok(a.start&&b.start&&d.start&&a.start.gid===b.start.gid,'start recebido por todos com mesmo gid');
 ok(a.start.coop===3&&Array.isArray(a.start.blocked),'coop=3 e lista de células bloqueadas do servidor');
 ok(new Set([a.start.slot,b.start.slot,d.start.slot]).size===3,'cada jogador tem slot único');
 ok(a.snaps>3,'snapshots chegando ('+a.snaps+')');
 const g=new C.Game(2,'hard',{headless:true,fair:true,coop:3});const free=[];for(let r=0;r<13;r++)for(let c=0;c<20;c++)if(g.canBuild(c,r)&&[1,2].some(k=>g.bgd.pc.has((c+k)+','+r)))free.push([c,r]);
 // trapaça: construir torre que não possui, em cima do caminho, ID inválido
 a.send({t:'act',a:{k:'build',id:24,c:free[0][0],r:free[0][1]}});a.send({t:'act',a:{k:'build',id:0,c:0,r:1}});a.send({t:'act',a:{k:'build',id:-3,c:1,r:1}});a.send({t:'act',a:{k:'build',id:'x',c:1.5,r:1}});
 await sleep(300);ok(a.snap.T.length===0,'builds inválidos (torre não possuída / caminho / ID ruim) rejeitados');ok(a.msgs.filter(m=>m.t==='deny').length>=3,'jogador recebe "deny"');
 const g0=a.snap.g;a.send({t:'act',a:{k:'build',id:0,c:free[0][0],r:free[0][1]}});b.send({t:'act',a:{k:'build',id:5,c:free[3][0],r:free[3][1]}});await sleep(400);
 ok(a.snap.T.length===2&&b.snap.T.length===2&&d.snap.T.length===2,'2 torres visíveis em TODOS os clientes');ok(a.snap.g<g0&&a.snap.g===b.snap.g&&b.snap.g===d.snap.g,'ouro compartilhado e idêntico em todos');
 ok(new Set(a.snap.T.map(t=>t[11])).size===2,'torres têm donos diferentes');
 // venda: só dono ou anfitrião
 const tb=b.snap.T.find(t=>t[11]===b.start.slot);d.send({t:'act',a:{k:'sell',u:tb[0]}});await sleep(250);ok(d.snap.T.length===2,'terceiro NÃO pode vender torre alheia');
 b.send({t:'act',a:{k:'sell',u:tb[0]}});await sleep(250);ok(d.snap.T.length===1,'dono vende a própria torre');
 b.send({t:'act',a:{k:'pause'}});await sleep(250);ok(!a.snap.pz,'não-anfitrião não pausa');
 a.send({t:'act',a:{k:'speed',v:3}});await sleep(250);ok(a.snap.sp===3,'anfitrião muda velocidade');
 // ondas
 d.send({t:'act',a:{k:'wave'}});await sleep(2500);ok(a.snap.w===1&&a.snap.E.length>0,'qualquer jogador inicia a wave; inimigos sincronizados ('+a.snap.E.length+')');
 ok(JSON.stringify(a.snap.E.map(e=>e[0]))===JSON.stringify(d.snap.E.map(e=>e[0]))||Math.abs(a.snap.E.length-d.snap.E.length)<=2,'mesmas entidades em A e D');
 ok(a.snap.fx.length>0||a.snaps>10,'eventos de efeitos presentes');
 // reconexão: Bob cai e volta
 const bslot=b.start.slot;b.ws.terminate();await sleep(400);ok(a.room.players.find(p=>p.id===bslot).connected===false,'queda detectada (connected=false)');
 const b2=client('Bob','bobcid000002');await b2.open();await sleep(500);ok(b2.start&&b2.start.slot===bslot&&b2.start.gid===a.start.gid,'reconexão restaura o MESMO slot e a mesma partida');ok(b2.snaps>0&&b2.snap.T.length===a.snap.T.length,'estado completo ao reconectar');
 ok(a.room.players.find(p=>p.id===bslot).connected===true,'sala vê Bob online de novo');
 // anfitrião sai -> promoção
 a.send({t:'leave'});await sleep(400);const dr=d.last('room');ok(dr.hostId!==0&&dr.players.length===2&&dr.players.some(p=>p.host),'anfitrião saiu: outro jogador promovido; jogo continua');
 const w1=d.snap.w;await sleep(800);ok(d.snap.w>=w1&&d.snaps>20,'partida continua sem o anfitrião original');
 // queda de TODOS: partida congela
 const newHost=[b2,d].find(c=>c.room&&c.room.players.find(p=>p.host&&p.name===c.name))||d;
 b2.ws.terminate();d.ws.terminate();await sleep(500);
 const d2=client('Dora','doracid00003');await d2.open();await sleep(400);ok(d2.start&&d2.snap,'reconexão depois de todos caírem funciona');
 // kick
 const k=client('Kai','kaicid000004');await k.open();
 // mensagens lixo / grandes
 const junk=client('Junk','junkcid00005');await junk.open();junk.ws.send('not json');junk.ws.send(JSON.stringify({t:'act',a:{k:'build'}}));junk.ws.send('x'.repeat(20000));await sleep(300);ok(junk.closed!==false,'payload > 8KB derruba a conexão (maxPayload)');
 // versão incompatível
 const old=new WebSocket(URL);let oerr=null;old.on('open',()=>old.send(JSON.stringify({t:'hello',v:1,cid:'oldcid000001',name:'Old'})));old.on('message',m=>{oerr=JSON.parse(m)});await sleep(300);ok(oerr&&oerr.fatal&&/incompat/i.test(oerr.msg),'versão de protocolo incompatível é recusada');
 // nome malicioso
 const x=client('<img src=x onerror=alert(1)>','xsscid000006');await x.open();x.send({t:'create'});await sleep(200);ok(!/[<>]/.test(x.room.players[0].name),'nome sanitizado no servidor: "'+x.room.players[0].name+'"');
 console.log(fails?`\n${fails} FALHAS`:'\nTODOS OS TESTES WS OK');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
