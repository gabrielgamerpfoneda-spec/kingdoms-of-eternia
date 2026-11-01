/* AUTO-GERADO por build.py a partir do mesmo código do cliente. NÃO edite à mão.
   Motor do jogo (dados + simulação) rodando no Node, sem navegador. */
'use strict';
const Save={d:{set:{auto:false,unlockAll:false,range:true,shake:true},owned:{},upg:{}},upg(){return 0}};
const Sound={game:null,sfx(n){if(this.game&&n!=='err'&&n!=='click')this.game.fx.push(['s',n])},music(n){if(this.game)this.game.fx.push(['m',n])},init(){},vol(){}};
let curScr='game';
/* =====================================================================
   KINGDOMS OF ETERNIA — arquivo único. Módulos: Core, Dados, Sprites,
   Motor (Game), Interface (UI), Rede (Net).
   Versão do protocolo online: cliente e servidor precisam ter o mesmo PROTOCOL.
   ===================================================================== */
/* ============================ CORE ================================== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const TILE=48,COLS=20,ROWS=13,MW=COLS*TILE,MH=ROWS*TILE;
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round(r+(f-r)*t);g=Math.round(g+(f-g)*t);b=Math.round(b+(f-b)*t);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function mk(w,h){const c={width:w,height:h};const x=new Proxy({},{get:(t,k)=>k in t?t[k]:(k==='createRadialGradient'||k==='createLinearGradient')?()=>({addColorStop(){}}):()=>{},set:(t,k,v)=>{t[k]=v;return true}});return[c,x]}
const fmt=n=>n>=10000?(n/1000).toFixed(1)+'k':String(Math.floor(n));
const VERSION='2.0.0',PROTOCOL=2;
/* ============================ DADOS ================================== */
const CATS=[{id:'arch',name:'Arqueiros',col:'#7cc04a'},{id:'mag',name:'Magia',col:'#7a8cff'},{id:'art',name:'Artilharia',col:'#e0954a'},{id:'sup',name:'Suporte',col:'#4ad6a8'},{id:'esp',name:'Especiais',col:'#e05ad0'}];
const LV={dmg:[1,1.8,3.1],range:[1,1.08,1.16],rate:[1,1.15,1.3]};
const TGT=[['first','Primeiro'],['last','Último'],['strong','Mais forte'],['weak','Mais fraco'],['close','Mais perto']];
const STONE=['#8f8a80','#6a6a9a','#7a7a7a','#b8a888','#3b3040'];
/* T(id,name,cat,unlockLevel,price,dmg,range(tiles),rate(/s),dmgType,attack,extra) */
function T(id,name,cat,unl,price,dmg,range,rate,dt,atk,o){return Object.assign({id,name,cat,unl,price,dmg,range,rate,dt,atk,tgt:'first',stone:STONE[cat],acc:CATS[cat].col,glow:'#fff',proj:'bolt',spd:360,up:[{},{}]},o)}
const TOWERS=[
 // ---- ARQUEIROS ----
 T(0,'Archer Tower',0,1,50,8,3.2,1.6,'phys','proj',{proj:'arrow',spd:460,head:'archer',glow:'#9bff7a',look:{robe:'#3f7a3a',hood:'#2d5a2a',bow:'#8a5a2a',quiver:1},
  desc:'Torre básica de arqueiros. Disparos rápidos e baratos, ótima para começar.',abil:'Flechas rápidas.',u2:'+80% dano, alcance e cadência.',u3:'Dispara 2 flechas por ataque.',up:[{},{shots:2}]}),
 T(1,'Sniper Tower',0,2,120,55,6.5,.45,'phys','proj',{proj:'arrow',spd:1100,tgt:'strong',head:'archer',glow:'#c8ff9a',look:{robe:'#3a4a3a',hood:'#22301f',bow:'#555',gun:1,len:9,scope:1},
  desc:'Alcance enorme e dano elevado. Prioriza o alvo mais forte.',abil:'Tiro de precisão de longo alcance.',u2:'+80% dano e alcance maior.',u3:'25% de chance de tiro crítico (x3).',up:[{},{crit:[.25,3]}]}),
 T(2,'Ranger Tower',0,3,150,7,3.6,1.2,'phys','multi',{proj:'arrow',spd:460,shots:3,head:'archer',glow:'#9bff7a',look:{robe:'#6a5a2a',hood:'#4a3a1a',bow:'#6a3a1a',quiver:1,wide:1},
  desc:'Dispara várias flechas ao mesmo tempo contra alvos diferentes.',abil:'Rajada multi-alvo.',u2:'Dispara 4 flechas.',u3:'Dispara 6 flechas.',up:[{shots:4},{shots:6}]}),
 T(3,'Poison Ranger',0,4,140,6,3.4,1.3,'phys','proj',{proj:'arrow',spd:440,head:'archer',glow:'#7cff4a',poison:[7,4],look:{robe:'#5a3a6a',hood:'#3a2250',bow:'#4a7a2a',quiver:1,drops:1},
  desc:'Flechas envenenadas causam dano contínuo ao longo do tempo.',abil:'Veneno (dano por segundo).',u2:'Veneno mais forte e duradouro.',u3:'Veneno letal que também desacelera 15%.',up:[{poison:[12,5]},{poison:[22,6],slow:[.15,2]}]}),
 T(4,'Royal Archer',0,7,300,28,4.2,1.5,'phys','proj',{proj:'arrow',spd:620,head:'archer',glow:'#ffd35a',crit:[.2,2.5],look:{robe:'#9a2a2a',hood:'#6a1a1a',bow:'#e8b830',cape:'#9a2a2a',crown:1,quiver:1},
  desc:'Arqueiro de elite com alta chance de dano crítico.',abil:'Dano crítico.',u2:'30% de crítico (x3).',u3:'40% de crítico (x4) e dispara 2 flechas.',up:[{crit:[.3,3]},{crit:[.4,4],shots:2}]}),
 // ---- MAGIA ----
 T(5,'Apprentice Tower',1,1,70,14,3,1,'magic','proj',{proj:'bolt',spd:320,head:'mage',glow:'#8ab0ff',look:{robe:'#3a5ab0',hat:'#2a3a80',orb:'plain',oc:'#8ab0ff'},
  desc:'Projéteis mágicos básicos que ignoram armaduras físicas.',abil:'Dano mágico.',u2:'+80% dano e cadência.',u3:'Lança 2 projéteis mágicos.',up:[{},{shots:2}]}),
 T(6,'Fire Mage',1,3,160,18,3.3,.8,'fire','splash',{proj:'fire',spd:300,splash:.9,burn:[5,3],head:'mage',glow:'#ff8a3a',look:{robe:'#b03a1a',hat:'#7a1a0a',orb:'fire',oc:'#ff8a2a'},
  desc:'Bolas de fogo explodem em área e incendeiam os inimigos.',abil:'Dano em área + queimadura.',u2:'Explosão e queimadura maiores.',u3:'Inferno: grande área e queimadura intensa.',up:[{splash:1.1,burn:[9,3]},{splash:1.35,burn:[16,4]}]}),
 T(7,'Ice Mage',1,4,150,10,3.4,1,'ice','proj',{proj:'ice',spd:340,slow:[.4,2],head:'mage',glow:'#8af0ff',look:{robe:'#4a8ab0',hat:'#d8f0ff',orb:'ice',oc:'#8af0ff'},
  desc:'Estilhaços de gelo desaceleram e congelam os inimigos.',abil:'Lentidão e congelamento.',u2:'Lentidão de 50%.',u3:'Lentidão de 55% e 20% de chance de congelar.',up:[{slow:[.5,2.5]},{slow:[.55,3],freeze:.2}]}),
 T(8,'Lightning Mage',1,6,220,20,3.5,.9,'magic','chain',{proj:'spark',chain:3,head:'mage',glow:'#fff08a',look:{robe:'#b09a1a',hat:'#6a5a10',orb:'bolt',oc:'#fff08a'},
  desc:'Raios saltam entre múltiplos inimigos.',abil:'Corrente de raios.',u2:'Raio salta em 4 inimigos.',u3:'Raio salta em 6 inimigos.',up:[{chain:4},{chain:6}]}),
 T(9,'Arcane Wizard',1,9,350,60,5,.7,'magic','pierce',{proj:'arc',hits:3,head:'mage',glow:'#d08aff',look:{robe:'#6a2a9a',hat:'#3a1060',orb:'arc',oc:'#d08aff',big:1},
  desc:'Feixe arcano de grande alcance que atravessa vários inimigos.',abil:'Feixe perfurante.',u2:'Atravessa até 5 inimigos.',u3:'Atravessa todos os inimigos na linha.',up:[{hits:5},{hits:99}]}),
 // ---- ARTILHARIA ----
 T(10,'Cannon Tower',2,2,100,30,3.3,.55,'phys','splash',{proj:'ball',spd:380,splash:.6,head:'cannon',glow:'#ffb060',look:{len:20,th:6,carriage:'#4a3a2a'},
  desc:'Canhão básico com pequena explosão ao impacto.',abil:'Tiro explosivo.',u2:'+80% dano.',u3:'Dispara 2 balas.',up:[{},{shots:2}]}),
 T(11,'Mortar Tower',2,5,200,45,6,.35,'phys','splash',{proj:'shell',spd:260,splash:1.3,minr:1.5,arc:1,head:'cannon',glow:'#ffb060',look:{len:16,th:9,fixed:-1.15,carriage:'#3a3a3a'},
  desc:'Morteiro de longo alcance. Não atinge alvos muito próximos.',abil:'Bomba em arco (alcance mínimo).',u2:'Maior alcance e dano.',u3:'Explosão maior e bombas em cacho (+2 explosões).',up:[{},{splash:1.6,cluster:2}]}),
 T(12,'Bombard Tower',2,8,320,70,4,.3,'phys','splash',{proj:'ball',spd:300,splash:2,head:'cannon',glow:'#ff8a3a',look:{len:24,th:10,ring:'#c06a20',carriage:'#2a2a2a'},
  desc:'Explosões de enorme área. Lenta, mas devastadora contra grupos.',abil:'Explosão de grande área.',u2:'+80% dano.',u3:'Munição incendiária: queimadura na área.',up:[{},{burn:[18,4]}]}),
 T(13,'Crystal Cannon',2,10,380,55,4.5,.5,'magic','splash',{proj:'crystal',spd:340,splash:1.5,head:'cannon',glow:'#8affff',look:{len:22,th:7,crystal:'#8affff',carriage:'#2a4a5a'},
  desc:'Projéteis de cristal mágico explodem e causam dano mágico.',abil:'Explosão mágica.',u2:'+80% dano.',u3:'Estilhaços: explosões secundárias em até 3 inimigos.',up:[{},{echo:3}]}),
 T(14,'Royal Artillery',2,14,600,150,5.5,.3,'phys','splash',{proj:'ball',spd:420,splash:1.8,head:'cannon',glow:'#ffd35a',look:{len:28,th:8,twin:1,ring:'#ffd35a',carriage:'#6a1a1a'},
  desc:'Artilharia pesada real. Dano colossal em área.',abil:'Tiro pesado.',u2:'+80% dano; atordoa 0,4s.',u3:'Atordoa os inimigos atingidos por 1s.',up:[{stun:.4},{stun:1}]}),
 // ---- SUPORTE ----
 T(15,'Healing Tower',3,5,180,0,3,1,'magic','heal',{head:'heal',glow:'#7affb0',heal:{every:14,amt:1,cap:4},
  desc:'Restaura vidas da base: apenas quando faltam vidas e até um limite por wave.',abil:'Cura a base (limitada por wave).',u2:'Cura a cada 10s (até 5 por wave).',u3:'Cura 2 vidas a cada 7s (até 6 por wave).',up:[{heal:{every:10,amt:1,cap:5}},{heal:{every:7,amt:2,cap:6}}]}),
 T(16,'Gold Mine',3,2,150,0,3,1,'magic','mine',{head:'mine',glow:'#ffd35a',gold:12,every:6,
  desc:'Produz ouro periodicamente. Um investimento para o longo prazo.',abil:'Gera ouro.',u2:'20 de ouro a cada 6s.',u3:'34 de ouro a cada 5,5s.',up:[{gold:20},{gold:34,every:5.5}]}),
 T(17,'War Banner',3,6,200,0,2.6,1,'magic','aura',{head:'banner',glow:'#ff6a4a',buffDmg:.2,
  desc:'Estandarte de guerra: aumenta o dano das torres próximas.',abil:'+20% de dano nas torres em volta.',u2:'+30% de dano.',u3:'+45% de dano e +15% de cadência.',up:[{buffDmg:.3},{buffDmg:.45,buffRate:.15}]}),
 T(18,'Frost Totem',3,5,170,0,2.8,1,'ice','aura',{head:'totem',glow:'#8af0ff',slowAura:.25,
  desc:'Totem de gelo: reduz a velocidade de todos os inimigos na área.',abil:'Aura de lentidão.',u2:'Lentidão de 35%.',u3:'Lentidão de 45% e pulso de congelamento.',up:[{slowAura:.35},{slowAura:.45,freezePulse:1}]}),
 T(19,'Arcane Shrine',3,8,220,0,2.6,1,'magic','aura',{head:'shrine',glow:'#d08aff',buffRange:.15,
  desc:'Santuário arcano: aumenta o alcance das torres próximas.',abil:'+15% de alcance nas torres em volta.',u2:'+25% de alcance.',u3:'+35% de alcance e +10% de dano.',up:[{buffRange:.25},{buffRange:.35,buffDmg:.1}]}),
 // ---- ESPECIAIS ----
 T(20,'Dragon Tower',4,12,700,12,3.6,3,'fire','breath',{proj:'fire',cone:.5,burn:[8,3],head:'dragon',glow:'#ff6a2a',
  desc:'Um dragão cospe fogo em cone, queimando todos à frente.',abil:'Sopro de fogo em cone.',u2:'+80% dano, queimadura maior.',u3:'Cone mais largo e queimadura infernal.',up:[{burn:[14,3]},{burn:[26,4],cone:.75}]}),
 T(21,'Necromancer Tower',4,11,450,0,3.6,1,'magic','summon',{minion:'skel',max:2,every:4,mhp:45,mdmg:6,head:'necro',glow:'#7aff7a',
  desc:'Invoca esqueletos aliados que bloqueiam e atacam os inimigos.',abil:'Invoca esqueletos.',u2:'Até 3 esqueletos, mais fortes.',u3:'Até 5 esqueletos; explodem ao morrer.',up:[{max:3,mhp:80,mdmg:10},{max:5,mhp:120,mdmg:16,explode:1}]}),
 T(22,'Paladin Tower',4,10,420,0,3.2,1,'phys','summon',{minion:'knight',max:2,every:8,mhp:160,mdmg:9,head:'paladin',glow:'#fff0a0',
  desc:'Invoca cavaleiros defensores que seguram o caminho.',abil:'Invoca cavaleiros bloqueadores.',u2:'Até 3 cavaleiros mais resistentes.',u3:'Cavaleiros sagrados: cura e +dano.',up:[{max:3,mhp:300,mdmg:14},{max:3,mhp:520,mdmg:22,aura:1}]}),
 T(23,'Shadow Tower',4,13,380,22,3.6,3,'magic','proj',{proj:'shadow',spd:640,head:'shadow',glow:'#b060ff',crit:[.35,2.5],
  desc:'Ataques rapidíssimos e críticos vindos das sombras.',abil:'Críticos frequentes.',u2:'45% de crítico.',u3:'Executa inimigos com menos de 20% de vida.',up:[{crit:[.45,2.5]},{crit:[.45,3],execute:.2}]}),
 T(24,'Celestial Tower',4,15,1000,200,5,.4,'magic','sky',{proj:'sky',splash:1,head:'celestial',glow:'#fff6b0',
  desc:'Raios celestiais extremamente poderosos caem sobre os inimigos.',abil:'Pilar de luz sagrada.',u2:'+80% dano.',u3:'Dois pilares de luz por ataque.',up:[{},{shots:2}]})
];
/* stats efetivos de uma torre num nível */
function statsFor(def,lvl){
 const s=Object.assign({},def);s.dmg=def.dmg*LV.dmg[lvl-1];s.range=def.range*LV.range[lvl-1];s.rate=def.rate*LV.rate[lvl-1];
 for(let i=0;i<lvl-1;i++)Object.assign(s,def.up[i]);return s;
}
const upCost=(def,lvl)=>Math.round(def.price*(lvl===1?.8:1.4));

/* ---------- Inimigos ---------- */
const DEFTYPES=['phys','magic','fire','ice','poison'];
function E(id,name,tier,hp,spd,gold,shape,c,s,e,o,x){return Object.assign({key:'e'+id,id,name,tier,hp,spd,gold,shape,c,s,e,o:o||{},res:{},imm:[],life:1,atk:4+tier*3,px:2,k:1},x||{})}
const ENEMIES=[
 E(0,'Slime',1,40,40,4,'blob','#5fd35f','#5fd35f','#fff',{},{ab:'split',info:'Divide-se em dois slimes menores ao morrer.'}),
 E(1,'Goblin',1,60,50,5,'hum','#6a4a2a','#6fae3a','#ffec6b',{ears:1,weapon:'dagger'},{info:'Rápido e numeroso.'}),
 E(2,'Goblin Archer',2,75,48,7,'hum','#3b6a3b','#6fae3a','#ffec6b',{ears:1,weapon:'bow',hood:'#2f4f2f'},{ab:'disable',info:'Atira nas torres e as atordoa por 2s.'}),
 E(3,'Skeleton',2,100,45,7,'hum','#d8d4c0','#e8e4d2','#ff4040',{skel:1,weapon:'sword'},{imm:['poison'],info:'Imune a veneno.'}),
 E(4,'Skeleton Knight',3,300,38,14,'hum','#8a96a8','#d8d4c0','#ff4040',{skel:1,helmet:'#8a96a8',shield:'#555e70',weapon:'sword'},{imm:['poison'],res:{phys:.45},info:'Armadura pesada: resiste a dano físico.'}),
 E(5,'Orc',3,220,38,10,'hum','#7a5a3a','#4f8a3a','#ffec6b',{tusks:1,wide:1,weapon:'club'},{info:'Resistente e forte.'}),
 E(6,'Orc Warrior',4,520,40,18,'hum','#8a3a2a','#3f7a30','#ffec6b',{tusks:1,wide:1,helmet:'#6a6a6a',weapon:'axe'},{ab:'rage',res:{phys:.2},info:'Enfurece abaixo de 50% de vida (+40% velocidade).'}),
 E(7,'Dark Mage',3,180,45,14,'hum','#4a2a6a','#d9b08a','#c07aff',{hood:'#3a1a5a',weapon:'staff'},{ab:'healaura',info:'Cura os inimigos próximos.'}),
 E(8,'Spider',2,80,55,6,'spider','#3a2a3a','#3a2a3a','#ff3030',{},{imm:['poison'],info:'Imune a veneno.'}),
 E(9,'Wolf',1,50,82,5,'quad','#8a8a90','#8a8a90','#ffec6b',{},{info:'Muito veloz.'}),
 E(10,'Ice Wolf',3,130,85,10,'quad','#cfe8ff','#cfe8ff','#4ac8ff',{},{imm:['ice'],res:{ice:.8,fire:-.3},info:'Imune a gelo, vulnerável a fogo.'}),
 E(11,'Fire Elemental',4,380,55,18,'flame','#ff7a1a','#ffd35a','#fff',{},{imm:['fire'],res:{fire:1,ice:-.4},info:'Imune a fogo, vulnerável a gelo.'}),
 E(12,'Stone Golem',4,1100,28,30,'golem','#8a8a80','#8a8a80','#ffec6b',{},{res:{phys:.6,magic:.1},life:2,px:3,info:'Extremamente resistente a dano físico. Custa 2 vidas.'}),
 E(13,'Dark Knight',5,1000,42,30,'hum','#2a2a3a','#8a8a9a','#ff4040',{helmet:'#2a2a3a',shield:'#3a3a55',weapon:'sword',wide:1},{ab:'shield',res:{phys:.35,magic:.35},px:3,info:'Escudo mágico absorve 30% da vida; resiste a tudo.'}),
 E(14,'Vampire',4,600,62,24,'hum','#5a1a2a','#e8d8d0','#ff3030',{cape:'#7a1020',fangs:1,wings:1},{ab:'regen',info:'Regenera vida continuamente.'}),
 E(15,'Ghost',3,140,60,11,'ghost','#cfe0ff','#cfe0ff','#223',{},{fly:1,res:{phys:.5},info:'Voa e resiste a dano físico.'}),
 E(16,'Demon',5,1300,55,40,'hum','#a02a2a','#c83a30','#ffe040',{horns:1,wings:1,weapon:'axe'},{imm:['fire'],res:{fire:.8,magic:.2},px:3,info:'Imune a fogo.'}),
 E(17,'Dragon Hatchling',5,700,75,30,'dragon','#3a9a5a','#8affaa','#ffec6b',{},{fly:1,res:{fire:.7},info:'Voa rápido e resiste a fogo.'}),
 E(18,'Ancient Guardian',6,2800,26,70,'golem','#6a7a6a','#6a7a6a','#7affd0',{runes:1},{res:{phys:.4,magic:.4,fire:.4,ice:.4},life:3,px:3,info:'Colosso rúnico resistente a todos os elementos.'}),
 E(19,'Corrupted King',6,4000,34,120,'hum','#3a2a4a','#b8a8c8','#c07aff',{crown:1,cape:'#5a2a7a',wide:1,weapon:'sword'},{ab:'guards',life:5,px:3,info:'Invoca cavaleiros-esqueleto a cada 9s.'})
];
/* ---------- Chefões ---------- */
function B(i,name,title,hp,spd,shape,c,s,e,o,abil,x){return Object.assign({key:'b'+i,id:i,boss:1,name,title,hp,spd,gold:300+i*150,tier:7,shape,c,s,e,o:o||{},res:{},imm:[],life:10,atk:40,px:3,k:2,abil},x||{})}
const BOSSES=[
 B(0,'Elder Treant','Guardião da Floresta',9000,26,'treant','#4a6a2a','#7a5a2a','#ffec6b',{},[{t:'summon',every:8,type:0,n:3}],{res:{fire:-.3},info:'Invoca slimes a cada 8s.'}),
 B(1,'Ogre Warlord','Senhor da Guerra',14000,28,'hum','#7a4a2a','#8a9a4a','#ff4040',{tusks:1,wide:1,horns:1,weapon:'club',big:1},[{t:'charge',every:10,dur:2.2,mul:2.2}],{info:'Avança com velocidade dobrada a cada 10s.'}),
 B(2,'Frost Queen','Rainha do Gelo',17000,26,'hum','#7ab8e8','#e8f4ff','#4ac8ff',{hood:'#cfe8ff',crown:1,cape:'#4a8ac8',weapon:'staff',big:1},[{t:'disable',every:9,n:3,dur:3.5}],{imm:['ice'],info:'Congela até 3 torres a cada 9s.'}),
 B(3,'Magma Titan','Titã de Magma',22000,22,'golem','#5a2a1a','#ff6a1a','#ffec6b',{lava:1},[{t:'shield',every:15,pct:.18}],{imm:['fire'],res:{fire:1,phys:.2,ice:-.3},info:'Escudo de lava (18% da vida) a cada 15s.'}),
 B(4,'Lich Lord','Lorde dos Mortos',24000,28,'hum','#3a2a5a','#d8d4c0','#7aff7a',{skel:1,hood:'#2a1a4a',crown:1,weapon:'staff',big:1},[{t:'summon',every:7,type:3,n:4}],{imm:['poison'],info:'Ressuscita esqueletos a cada 7s.'}),
 B(5,'Pharaoh Ra-Khet','Faraó Eterno',30000,26,'hum','#c8a030','#c89a60','#7affff',{pharaoh:1,cape:'#2a4a8a',weapon:'staff',big:1},[{t:'curse',every:11,n:4,dur:4}],{info:'Amaldiçoa torres: cadência reduzida pela metade.'}),
 B(6,'Swamp Hydra','Hidra do Pântano',34000,24,'hydra','#3a7a4a','#6ab870','#ffec6b',{},[{t:'regen',pct:.012},{t:'split',at:[.66,.33],type:17,n:2}],{imm:['poison'],info:'Regenera e se divide em filhotes aos 66% e 33%.'}),
 B(7,'Crystal Spider Queen','Rainha das Teias',38000,30,'spider','#4a3a8a','#b8a0ff','#ff4ad0',{big:1},[{t:'summon',every:9,type:8,n:5},{t:'disable',every:12,n:2,dur:3}],{imm:['poison'],info:'Enxame de aranhas e teia que prende torres.'}),
 B(8,'Elder Dragon','Dragão Ancestral',46000,34,'dragon','#a02a1a','#ff8a3a','#ffec6b',{big:1},[{t:'disable',every:8,n:2,dur:4},{t:'enrage',at:.5,mul:1.6}],{fly:1,imm:['fire'],res:{fire:1},info:'Voa, queima torres e fica mais rápido abaixo de 50%.'}),
 B(9,'Shadow Sovereign','Soberano das Sombras',60000,30,'hum','#1a1a2a','#4a3a6a','#c040ff',{horns:1,cape:'#2a1a4a',hood:'#14101e',weapon:'sword',big:1,aura:1},[{t:'blink',every:10,dist:230},{t:'phase',every:13,dur:2}],{res:{magic:.3},info:'Teleporta pelo caminho e fica invulnerável por 2s.'})
];
const ED={};ENEMIES.forEach(e=>ED[e.key]=e);BOSSES.forEach(b=>ED[b.key]=b);

/* ---------- Dificuldades ---------- */
const DIFFS={
 easy:{name:'Fácil',hp:.8,spd:.92,cnt:.8,rew:1.2,boss:.75,lives:30,gold:300,xp:.6,col:'#8ae26a'},
 normal:{name:'Normal',hp:1,spd:1,cnt:1,rew:1,boss:1,lives:20,gold:250,xp:1,col:'#ffd86b'},
 hard:{name:'Difícil',hp:1.3,spd:1.06,cnt:1.2,rew:.9,boss:1.4,lives:15,gold:225,xp:1.6,col:'#ff9a4a'},
 extreme:{name:'Extremo',hp:1.7,spd:1.14,cnt:1.45,rew:.8,boss:1.9,lives:10,gold:200,xp:2.6,col:'#ff4a4a'}
};
/* ---------- Mapas ---------- */
/* paths: lista de caminhos (waypoints em células [col,row]); pool: ids de inimigos do mais fraco ao mais forte */
const MAPS=[
 {name:'Forgotten Forest',desc:'Uma floresta medieval esquecida onde goblins e lobos rondam entre as árvores antigas.',waves:12,boss:0,hpM:1,pool:[0,1,9,2,8,5,6],
  paths:[[[0,2],[16,2],[16,6],[3,6],[3,10],[19,10]]],env:'leaves',amb:['#102a10',.18],mus:{root:50,scale:'dorian',bpm:96,seed:1},
  g:['#3f7a32','#356a2a','#4f8e3c'],p:['#9a7a4a','#7a5a32','#b8955e'],pstyle:'dirt',gd:'grass',decor:[['tree',5,1],['bush',3,0],['flower',3,0],['rock',2,1],['mushroom',1,0],['stump',1,1]]},
 {name:"Kingdom's Valley",desc:'O verdejante vale do reino, com vilarejos, rios e campos dourados.',waves:14,boss:1,hpM:1.1,pool:[1,9,2,3,5,6,7,4],
  paths:[[[0,6],[5,6],[5,2],[10,2],[10,10],[15,10],[15,5],[19,5]]],env:'petals',amb:['#fff0a0',.06],mus:{root:55,scale:'major',bpm:104,seed:2},
  g:['#5a9a3a','#4e8a32','#6aae48'],p:['#b8a070','#988058','#d0b888'],pstyle:'cobble',gd:'grass',decor:[['tree',3,1],['house',1,1],['fence',2,1],['flower',5,0],['bush',2,0],['haystack',2,1],['pond',1,1]]},
 {name:'Frozen Kingdom',desc:'Um reino congelado sob a aurora, onde lobos de gelo uivam na nevasca.',waves:16,boss:2,hpM:1.2,pool:[9,10,3,2,4,7,5,6],
  paths:[[[0,1],[8,1],[8,4],[2,4],[2,7],[12,7],[12,11],[19,11]]],env:'snow',amb:['#a0d0ff',.10],mus:{root:52,scale:'minor',bpm:90,seed:3},
  g:['#dce8f4','#c8d8ea','#f0f6fc'],p:['#8aa4c0','#6a84a0','#a8c0d8'],pstyle:'ice',gd:'snow',decor:[['snowpine',5,1],['icecrystal',2,1],['snowrock',3,1],['snowman',1,1],['iceberg',1,1]]},
 {name:'Volcanic Lands',desc:'Terras vulcânicas cortadas por rios de lava e cinzas ardentes.',waves:18,boss:3,hpM:1.3,pool:[5,11,6,12,16,13,17],
  paths:[[[0,11],[17,11],[17,1],[3,1],[3,8],[13,8],[13,4],[9,4]]],env:'embers',amb:['#ff4a10',.12],mus:{root:45,scale:'phryg',bpm:108,seed:4},
  g:['#3a2a28','#2e201e','#4a3632'],p:['#5a4a44','#3a2c28','#7a6258'],pstyle:'basalt',gd:'lava',decor:[['lavarock',4,1],['obsidian',3,1],['vent',3,0],['deadtree',2,1],['lavapool',1,1]]},
 {name:'Dark Cemetery',desc:'Um cemitério sombrio sob a lua: os mortos não descansam em paz.',waves:20,boss:4,hpM:1.4,pool:[3,15,4,7,14,13,18],
  paths:[[[19,1],[3,1],[3,5],[16,5],[16,9],[0,9]]],env:'wisps',amb:['#101040',.30],mus:{root:47,scale:'hmin',bpm:84,seed:5},
  g:['#2e3a34','#26302c','#3a463e'],p:['#5a5248','#403a32','#746a5c'],pstyle:'cobble',gd:'grave',decor:[['grave',5,1],['cross',3,1],['deadtree',3,1],['crypt',1,1],['bones',2,0],['iron',2,1]]},
 {name:'Desert of Kings',desc:'Um deserto antigo repleto de ruínas e tesouros dos faraós esquecidos.',waves:20,boss:5,hpM:1.5,pool:[8,1,5,2,6,12,17,13],
  paths:[[[0,2],[10,2],[10,6],[19,6]],[[0,10],[10,10],[10,6],[19,6]]],env:'sand',amb:['#ffb040',.10],mus:{root:50,scale:'hmin',bpm:100,seed:6},
  g:['#d8b878','#c8a666','#e6c88a'],p:['#a88a58','#8a6c40','#c4a870'],pstyle:'sand',gd:'desert',decor:[['cactus',4,1],['palm',2,1],['pillar',3,1],['ruin',2,1],['dune',3,0],['skullrock',1,0],['obelisk',1,1]]},
 {name:'Enchanted Swamp',desc:'Um pântano encantado e nebuloso, cheio de vaga-lumes e criaturas ocultas.',waves:22,boss:6,hpM:1.6,pool:[0,8,5,7,15,14,6,12],
  paths:[[[0,6],[4,6],[4,2],[8,2],[8,10],[12,10],[12,2],[16,2],[16,6],[19,6]]],env:'fireflies',amb:['#0a3a2a',.22],mus:{root:48,scale:'dorian',bpm:92,seed:7},
  g:['#2e5a3a','#244a30','#3a6e46'],p:['#6a5030','#4a3820','#86683e'],pstyle:'planks',gd:'swamp',decor:[['willow',3,1],['lily',4,0],['reed',4,0],['mushroom',3,0],['stump',2,1],['bog',2,0],['swamplamp',1,1]]},
 {name:'Crystal Caverns',desc:'Cavernas profundas iluminadas por cristais que pulsam em mil cores.',waves:24,boss:7,hpM:1.7,pool:[8,12,7,10,4,15,16,18],
  paths:[[[9,0],[9,3],[2,3],[2,9],[9,9],[9,12]]],env:'sparkles',amb:['#2020a0',.22],mus:{root:52,scale:'lyd',bpm:98,seed:8},
  g:['#3a4458','#2e384a','#485470'],p:['#6a5a7a','#4a3e5a','#8a7a9a'],pstyle:'cobble',gd:'cave',decor:[['crystal',5,1],['stalag',3,1],['boulder',2,1],['glowshroom',3,0],['crystalbig',2,1]]},
 {name:"Dragon's Mountain",desc:'A montanha dos dragões: pedra fria, cinzas e o rugido de feras ancestrais.',waves:25,boss:8,hpM:1.8,pool:[5,6,11,17,12,16,13,19],
  paths:[[[0,2],[6,2],[6,6],[13,6],[13,10],[19,10]],[[19,1],[16,1],[16,6],[13,6],[13,10],[19,10]]],env:'ash',amb:['#601808',.18],mus:{root:43,scale:'phryg',bpm:112,seed:9},
  g:['#6a625c','#58504a','#7c746c'],p:['#4a3e38','#322a26','#6a5a50'],pstyle:'basalt',gd:'mountain',decor:[['peak',4,1],['boulder',3,1],['deadtree',2,1],['dragonbones',1,1],['lavapool',1,1],['snowrock',2,1]]},
 {name:'Shadow Realm',desc:'O reino das sombras: um vazio flutuante onde nem a luz ousa entrar.',waves:30,boss:9,hpM:2,pool:[15,14,13,16,7,18,19,17],
  paths:[[[0,6],[3,6],[3,1],[7,1],[7,11],[11,11],[11,1],[15,1],[15,11],[19,11]]],env:'void',amb:['#300050',.30],mus:{root:41,scale:'hmin',bpm:100,seed:10},
  g:['#1c1630','#16102a','#2a2044'],p:['#4a3a6a','#2e2248','#6a5a90'],pstyle:'void',gd:'void',decor:[['voidspike',4,1],['floatrock',3,1],['rune',3,0],['voidtree',2,1],['darkorb',1,1]]}
];
/* ---------- Conquistas ---------- */
const ACH=[
 ['first','Primeira Vitória','Vença uma partida.',s=>s.stats.wins>=1,50],
 ['k100','Caçador','Derrote 100 inimigos.',s=>s.stats.kills>=100,40],
 ['k1000','Exterminador','Derrote 1.000 inimigos.',s=>s.stats.kills>=1000,150],
 ['k5000','Flagelo dos Monstros','Derrote 5.000 inimigos.',s=>s.stats.kills>=5000,400],
 ['boss1','Matador de Chefões','Derrote um chefão.',s=>s.stats.bosses>=1,80],
 ['boss10','Lenda de Eternia','Derrote 10 chefões.',s=>s.stats.bosses>=10,300],
 ['b50','Construtor','Construa 50 torres.',s=>s.stats.built>=50,40],
 ['b300','Mestre de Obras','Construa 300 torres.',s=>s.stats.built>=300,150],
 ['up25','Ferreiro Real','Melhore torres 25 vezes.',s=>s.stats.upgrades>=25,60],
 ['maps3','Explorador','Vença 3 mapas diferentes.',s=>Object.keys(s.mapsWon).length>=3,100],
 ['maps10','Conquistador','Vença todos os 10 mapas.',s=>Object.keys(s.mapsWon).length>=10,500],
 ['hard','Desafiante','Vença no modo Difícil.',s=>s.hardWin,120],
 ['ext','Impossível?','Vença no modo Extremo.',s=>s.extWin,400],
 ['lv10','Veterano','Alcance o nível 10.',s=>s.level>=10,100],
 ['lv20','Herói do Reino','Alcance o nível 20.',s=>s.level>=20,300],
 ['gold','Magnata','Ganhe 20.000 de ouro no total.',s=>s.stats.gold>=20000,80],
 ['perfect','Defesa Perfeita','Vença sem perder nenhuma vida.',s=>s.perfectWin,150],
 ['games','Dedicado','Jogue 25 partidas.',s=>s.stats.games>=25,100]
];
/* ---------- Melhorias permanentes ---------- */
const UPGS=[
 ['gold','Tesouro Real','+25 de ouro inicial por nível.',10,60],
 ['lives','Muralhas Reforçadas','+1 vida inicial por nível.',10,80],
 ['dmg','Forja dos Anões','+2% de dano das torres por nível.',10,100],
 ['range','Óculo do Vigia','+2% de alcance das torres por nível.',5,120],
 ['loot','Rotas Comerciais','+3% de ouro por inimigo por nível.',10,90],
 ['disc','Guilda dos Construtores','-2% no custo das torres por nível.',8,110],
 ['xp','Sabedoria Antiga','+5% de experiência por nível.',10,70]
];
const upgCost=(u,l)=>Math.round(u[4]*Math.pow(l+1,1.5));

/* ---------- Raridades do sorteio de torres ---------- */
const RARITY=[
 {name:'Comum',col:'#c8c8c8',w:55,refund:10},
 {name:'Incomum',col:'#6ae04a',w:28,refund:15},
 {name:'Raro',col:'#4aa8ff',w:12,refund:25},
 {name:'Épico',col:'#c070ff',w:4,refund:50},
 {name:'Lendário',col:'#ffb830',w:1,refund:100}
];
const RAR_LISTS=[[0,5,10,16,15,18,3],[1,2,6,7,11,17,19],[4,8,9,12,13,21,22],[14,20,23],[24]];
const TOWER_RAR=[];RAR_LISTS.forEach((l,r)=>l.forEach(id=>TOWER_RAR[id]=r));
const GACHA={single:50,multi:500,epicPity:50};
const owns=d=>!!(Save.d.set.unlockAll||Save.d.owned[d.id]);
const ownedCount=s=>Object.keys(s.owned).length;
ACH.push(['col10','Colecionador','Obtenha 10 torres diferentes.',s=>ownedCount(s)>=10,80],
 ['col25','Mestre das Torres','Obtenha as 25 torres.',s=>ownedCount(s)>=25,500],
 ['legend','Sorte Lendária','Obtenha a torre lendária.',s=>!!s.owned[24],200],
 ['pull50','Apostador','Faça 50 sorteios.',s=>s.gacha.pulls>=50,60]);

/* índice numérico dos inimigos (protocolo de rede compacto) */
const KEYS=[...ENEMIES.map(e=>e.key),...BOSSES.map(b=>b.key)],KEYI={};KEYS.forEach((k,i)=>KEYI[k]=i);
const PLAYER_COLORS=['#4aa8ff','#ff6a4a','#6ae04a','#ffd35a','#c070ff','#4af0d8'];
/* ============================ SPRITES ================================ */
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
function ell(g,cx,cy,rx,ry,col,u=3){g.fillStyle=col;for(let y=-ry;y<=ry;y+=u){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y/ry)*(y/ry)))/u)*u;if(w>0)g.fillRect(cx-w,cy+y,2*w,u)}}
function glowAt(g,x,y,r,col,a=.5){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
const SK='#f2c9a0';
const Spr={bodies:{},enemies:{},flash:{}};

/* ---------- Corpo das torres (24x34, desenhado em 2x) ---------- */
function towerBody(d,lvl){
 const key=d.id*4+lvl;if(Spr.bodies[key])return Spr.bodies[key];
 const[c,x]=mk(24,34),S=d.stone,dk=shade(S,-.35),lt=shade(S,.22),W=[14,16,18][lvl-1],H=[10,13,16][lvl-1];
 const x0=12-W/2,yb=30,yt=yb-H,cat=d.cat;
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(x0-3,31,W+6,3);
 R(x,x0-2,28,W+4,3,dk);R(x,x0-1,27,W+2,1,lt);
 R(x,x0,yt,W,yb-yt,S);R(x,x0,yt,2,yb-yt,lt);R(x,x0+W-3,yt,3,yb-yt,dk);
 for(let y=yt+3;y<yb;y+=4){R(x,x0,y,W,1,dk);const off=(((y-yt)/4)|0)%2*3;for(let bx=x0+off+3;bx<x0+W-3;bx+=6)R(x,bx,y-3,1,3,dk)}
 const cr=shade(S,.05);R(x,x0-1,yt-3,W+2,3,cr);R(x,x0-1,yt-3,W+2,1,lt);
 for(let bx=x0-1;bx<x0+W+1;bx+=4)R(x,bx,yt-5,2,2,cr);
 // categoria: detalhes
 if(cat===0){R(x,x0,yt+2,W,2,'#6a4a2a');R(x,x0,yt+2,W,1,'#8a6a3a')}           // vigas de madeira
 if(cat===1){for(let i=0;i<lvl+1;i++){R(x,x0+3+i*4,yt+4+(i%2)*3,1,2,d.glow)}}     // runas
 if(cat===2){for(let bx=x0+2;bx<x0+W-2;bx+=4){R(x,bx,yb-3,1,1,'#bbb');R(x,bx,yt+3,1,1,'#bbb')}} // rebites
 if(cat===3){R(x,x0,yt+2,W,3,d.acc);R(x,x0,yt+2,W,1,shade(d.acc,.3))}            // faixa
 if(cat===4){R(x,x0,yt+2,W,2,d.acc);R(x,x0+2,yt+6,1,2,d.glow);R(x,x0+W-3,yt+6,1,2,d.glow)}
 // porta e fresta
 R(x,10,yb-6,4,6,'#1b1210');R(x,11,yb-7,2,1,'#1b1210');R(x,12,yb-2,1,2,'#3a2a22');
 R(x,11,yt+5,2,3,'#14101a');
 // nível 2: faixa colorida + bandeirola
 if(lvl>=2){R(x,x0,yt+(cat===0?5:2),W,1,d.acc);const px=x0+W-1;R(x,px,yt-13,1,9,'#5a4028');R(x,px+1,yt-13,5,3,d.acc);R(x,px+1,yt-13,5,1,shade(d.acc,.35));R(x,px+4,yt-12,2,1,shade(d.acc,-.3))}
 // nível 3: dourado e gema
 if(lvl>=3){const gold='#ffd35a';R(x,x0-1,yt-3,W+2,1,gold);for(let bx=x0-1;bx<x0+W+1;bx+=4)R(x,bx,yt-5,2,1,gold);R(x,x0,yb-9,W,1,gold);R(x,11,yb-9,2,2,d.glow);R(x,x0-2,yb-9,2,6,'#3a2a1a');R(x,x0-2,yb-10,2,1,d.glow);R(x,x0+W,yb-9,2,6,'#3a2a1a');R(x,x0+W,yb-10,2,1,d.glow)}
 return Spr.bodies[key]={c,top:yt-3};
}
/* ---------- Cabeças animadas das torres ---------- */
function orbDraw(c,x,y,kind,col,sz,tm,rec){
 const{g,P}=c;P(x,y,sz,sz,col);P(x,y,1,1,'#fff');
 if(kind==='fire'){P(x+(Math.sin(tm*9)>0?0:1),y-2,1,2,'#ffd35a');P(x,y-3+(Math.sin(tm*11)>0?0:1),1,1,'#ff8a2a')}
 if(kind==='ice'){P(x,y-2,1,2,'#fff');P(x-1,y+1,1,1,'#8af0ff');P(x+2,y+1,1,1,'#8af0ff')}
 if(kind==='bolt'){const f=Math.sin(tm*20)>0;P(x-2,y+(f?0:1),1,1,'#fff');P(x+sz+1,y+(f?1:0),1,1,'#fff');P(x,y-2,1,1,'#fff')}
 if(kind==='arc'){for(let i=0;i<3;i++){const a=tm*3+i*2.09;P(x+1+Math.cos(a)*4,y+1+Math.sin(a)*2.5,1,1,'#fff')}}
 glowAt(g,c.ox+(x+sz/2)*2,c.oy+(y+sz/2)*2,14+(rec?10:0),col,.45)
}
const HEADS={
 archer(c){
  const{t,P,F,tm,f}=c,L=t.def.look,rec=t.rec>.35;
  if(L.cape)P(-f*3,-9,2,7,L.cape);
  P(-2,-7,5,6,L.robe);P(-2,-7,1,6,shade(L.robe,.25));P(-1,-10,3,3,SK);P(-2,-11,5,2,L.hood);P(-2,-10,1,2,L.hood);F(1,-9,1,1,'#2a1a10');
  if(L.crown){P(-2,-13,5,1,'#ffd35a');P(-2,-14,1,1,'#ffd35a');P(0,-14,1,1,'#ffd35a');P(2,-14,1,1,'#ffd35a')}
  if(L.quiver){F(-3,-10,1,5,'#6b4a2a');F(-3,-11,1,1,'#ddd');F(-4,-11,1,1,'#ddd')}
  if(L.gun){F(1,-8,L.len,1,L.bow);F(L.len+1,-9,1,3,'#999');F(2,-9,3,1,'#222');if(L.scope)F(3,-10,2,1,'#6af')}
  else{const bx=L.wide?3:3;F(bx,-12,1,1,L.bow);F(bx+1,-11,1,5,L.bow);F(bx,-6,1,1,L.bow);F(rec?1:bx-1,-10,1,3,'#e8e8e8');
   if(!rec)F(bx-1,-9,3,1,'#c8a060');if(L.wide){F(bx+2,-12,1,1,L.bow);F(bx+2,-6,1,1,L.bow)}}
  if(L.drops)F(5,-4+((tm*4)|0)%3,1,1,'#7cff4a');
  if(t.lvl>=2)P(-2,-12,5,1,t.def.acc);
 },
 mage(c){
  const{t,P,F,tm,f,g}=c,L=t.def.look,rec=t.rec>.3,bob=Math.round(Math.sin(tm*3)*.6);
  P(-2,-7,5,6,L.robe);P(-2,-7,1,6,shade(L.robe,.25));P(-1,-10,3,3,SK);F(1,-9,1,1,'#2a1a10');
  P(-3,-11,7,1,L.hat);P(-2,-14,5,3,L.hat);P(-1,-16,3,2,L.hat);P(0,-17,1,1,L.hat);if(t.lvl>=2)P(-2,-11,5,1,'#ffd35a');
  F(4,-12,1,11,'#7a5a2a');
  orbDraw(c,f>0?3:-5+(f<0?-1:0),-16+bob,L.orb,L.oc,L.big?3:2,tm,rec);
 },
 cannon(c){
  const{t,P,g,tm,ox,oy,f}=c,L=t.def.look;
  P(-6,-3,12,3,L.carriage||'#4a3a2a');P(-6,-4,12,1,shade(L.carriage||'#4a3a2a',.3));P(-6,-1,3,3,'#1a1410');P(3,-1,3,3,'#1a1410');P(-5,0,1,1,'#777');P(4,0,1,1,'#777');
  const ang=L.fixed!==undefined?(f>0?L.fixed:-Math.PI-L.fixed):(t.angle||-.5);
  g.save();g.translate(ox,oy-8);g.rotate(ang);const rc=-t.rec*5,len=L.len,th=L.th;
  g.fillStyle='#5a5a62';g.fillRect(rc,-th/2,len,th);g.fillStyle='#8a8a94';g.fillRect(rc,-th/2,len,2);g.fillStyle='#34343a';g.fillRect(rc,th/2-2,len,2);
  g.fillStyle='#22222a';g.fillRect(rc+len-2,-th/2-2,4,th+4);
  if(L.ring){g.fillStyle=L.ring;g.fillRect(rc+len*.3,-th/2-1,3,th+2);g.fillRect(rc+len*.6,-th/2-1,3,th+2)}
  if(L.twin){g.fillStyle='#8a8a94';g.fillRect(rc,-th/2-5,len*.9,3)}
  if(L.crystal){g.fillStyle=L.crystal;g.fillRect(rc+len*.4,-th/2-5,5,5);g.fillStyle='#fff';g.fillRect(rc+len*.4,-th/2-5,2,2)}
  g.restore();
  if(L.crystal)glowAt(g,ox+Math.cos(ang)*len*.4,oy-8+Math.sin(ang)*len*.4,16,L.crystal,.4);
  if(t.rec>.5){glowAt(g,ox+Math.cos(ang)*(len+4),oy-8+Math.sin(ang)*(len+4),18,'#ffcc66',.8)}
 },
 heal(c){
  const{t,P,g,tm,ox,oy}=c,p=.6+.4*Math.sin(tm*3);
  P(-4,-3,8,3,'#cfc8b0');P(-3,-5,6,2,'#e8e0c8');P(-1,-12,3,8,'#fff');P(-3,-10,7,3,'#fff');P(-1,-11,1,6,'#a8ffc8');P(-2,-9,5,1,'#a8ffc8');
  glowAt(g,ox,oy-16,16+p*8,'#7affb0',.5);
  for(let i=0;i<3;i++){const a=((tm*.6+i/3)%1);P(-3+i*3,-13-a*6,1,1,'rgba(180,255,200,'+(1-a)+')')}
  if(t.lvl>=3)glowAt(g,ox,oy-16,34,'#7affb0',.25);
 },
 mine(c){
  const{t,P,F,tm}=c;
  P(-6,-2,12,2,'#5a4028');P(-5,-8,1,6,'#6a4a2a');P(4,-8,1,6,'#6a4a2a');P(-5,-9,10,1,'#6a4a2a');
  P(-4,-5,8,3,'#8a6a3a');const n=t.lvl+2;for(let i=0;i<n+3;i++)P(-3+(i%5)*1.5,-6-((i/5)|0)-(i%2),1.5,1.5,i%2?'#ffd35a':'#e8a820');
  F(-4,-12,1,5,'#8a5a2a');F(-5,-13,4,1,'#aaa');
  if((tm*2)%1<.15)P(-1+Math.sin(tm*5)*2,-9,1,1,'#fff');
  if(t.lvl>=3)P(0,-11,2,2,'#7aff9a');
 },
 banner(c){
  const{t,P,F,tm}=c,col=t.lvl>=3?'#ffd35a':'#d83a3a';
  P(-1,-18,1,17,'#7a5a2a');P(-1,-19,3,1,'#ffd35a');
  for(let i=0;i<7;i++){const w=Math.round(Math.sin(tm*4+i*.7)*1.2);P(i,-17+w,1,8,i<2?shade(col,.2):i>5?shade(col,-.2):col)}
  P(2,-14,2,3,'#ffd35a');P(3,-15,1,1,'#ffd35a');if(t.lvl>=2)P(0,-9,7,1,'#ffd35a');
  P(-4,-3,9,3,'#6a5a48');
 },
 totem(c){
  const{t,P,g,tm,ox,oy}=c,p=.5+.5*Math.sin(tm*2.5);
  P(-3,-3,7,3,'#6a7a8a');P(-2,-9,5,6,'#a8d8f0');P(-2,-9,1,6,'#d8f4ff');P(-1,-14,3,5,'#8ac8e8');P(0,-17,1,3,'#d8f4ff');
  P(-1,-7,1,1,'#14284a');P(1,-7,1,1,'#14284a');P(-1,-5,3,1,'#14284a');P(-4,-8,2,3,'#8ac8e8');P(3,-8,2,3,'#8ac8e8');
  glowAt(g,ox,oy-24,18+p*8,'#8af0ff',.45);
  if(t.lvl>=3)glowAt(g,ox,oy-24,40,'#8af0ff',.2*p);
 },
 shrine(c){
  const{t,P,g,tm,ox,oy}=c;
  P(-4,-3,9,3,'#5a4a7a');P(-2,-14,5,11,'#7a5aa8');P(-2,-14,1,11,'#9a7ac8');P(-1,-17,3,3,'#9a7ac8');P(0,-19,1,2,'#c8a8ff');
  P(0,-11,1,3,'#e0c8ff');P(-1,-8,3,1,'#e0c8ff');
  for(let i=0;i<3;i++){const a=tm*1.6+i*2.09;P(Math.cos(a)*6-.5,-12+Math.sin(a)*2,1.5,1.5,'#e0c8ff')}
  glowAt(g,ox,oy-22,22,'#d08aff',.4);
 },
 dragon(c){
  const{t,P,F,g,tm,f,ox,oy}=c,rec=t.rec>.2,lv=t.lvl;
  P(-5,-3,10,3,'#4a2a2a');P(-3,-8,6,5,'#a02a1a');P(-3,-8,2,5,'#c8402a');
  F(2,-12,4,3,'#c0301a');F(5,-11,3,2,'#c0301a');F(5,-10,2,1,rec?'#4a0a0a':'#a02a1a');F(3,-14,1,2,'#ffd35a');F(5,-14,1,2,'#ffd35a');F(4,-11,1,1,'#ffec6b');
  P(-4,-14+Math.round(Math.sin(tm*5)),2,6,'#7a1a10');P(3*-f-1,-13,2,5,'#7a1a10');
  if(lv>=2){F(1,-8,1,1,'#ffd35a');P(-2,-6,4,1,'#ffd35a')}
  if(rec||t.firing){for(let i=0;i<4;i++)F(8+i*2,-11+(i%2),2,2+i%2,i%2?'#ffd35a':'#ff6a2a');glowAt(g,ox+f*30,oy-20,22,'#ff8a2a',.7)}
  else glowAt(g,ox+f*14,oy-20,10,'#ff8a2a',.3);
 },
 necro(c){
  const{t,P,F,g,tm,ox,oy}=c;
  P(-3,-7,6,6,'#1e3a2a');P(-3,-7,1,6,'#2e5a3a');P(-2,-11,4,4,'#14281c');P(-1,-10,2,2,'#cfd8c0');P(-1,-9,1,1,'#7aff7a');P(1,-9,1,1,'#7aff7a');
  F(4,-14,1,12,'#4a3a2a');P(f(c)*4-1,-17,3,3,'#e8e4d0');P(f(c)*4-1,-16,1,1,'#111');P(f(c)*4+1,-16,1,1,'#111');
  for(let i=0;i<3;i++){const a=tm*2+i*2.09;P(Math.cos(a)*6,-9+Math.sin(a)*3,1,1,'#7aff7a')}
  glowAt(g,ox,oy-18,24,'#7aff7a',.3+.15*Math.sin(tm*3));
  function f(c){return c.f>0?1:-1}
 },
 paladin(c){
  const{t,P,F,g,tm,ox,oy}=c;
  P(-3,-8,6,7,'#c8c8d4');P(-3,-8,2,7,'#e8e8f4');P(-2,-12,4,4,'#d8d8e4');P(-2,-11,4,1,'#2a2a3a');P(-1,-14,2,2,'#ffd35a');
  F(-5,-8,3,6,t.def.acc);F(-5,-8,3,1,'#ffd35a');F(-4,-6,1,2,'#ffd35a');
  F(3,-16,1,10,'#e8e8f4');F(2,-8,3,1,'#ffd35a');
  ctx_halo(g,ox,oy-30,tm,t.lvl);
  glowAt(g,ox,oy-20,22,'#fff0a0',.3);
  function ctx_halo(g,x,y,tm,l){g.save();g.strokeStyle='rgba(255,240,150,'+(.6+.3*Math.sin(tm*3))+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y,9,3,0,0,7);g.stroke();g.restore()}
 },
 shadow(c){
  const{t,P,F,g,tm,ox,oy}=c;
  P(-3,-8,6,7,'#14101e');P(-3,-8,1,7,'#2a1e3a');P(-2,-13,4,5,'#14101e');P(-1,-12,2,2,'#050308');P(-1,-12,1,1,'#c040ff');P(1,-12,1,1,'#c040ff');
  F(3,-9,1,4,'#cfd0e0');F(2,-10,3,1,'#6a4a9a');F(-4,-9,1,4,'#cfd0e0');
  for(let i=0;i<4;i++){const a=(tm*.8+i/4)%1;P(-3+i*2+Math.sin(tm*3+i)*1,-6-a*10,1.5,1.5,'rgba(160,80,255,'+(.8-a*.8)+')')}
  glowAt(g,ox,oy-18,22,'#a050ff',.35);if(t.lvl>=3)glowAt(g,ox,oy-18,34,'#ff40c0',.18);
 },
 celestial(c){
  const{t,P,g,tm,ox,oy}=c,fl=Math.sin(tm*4)*2;
  P(-4,-3,9,3,'#e8e0c0');P(-1,-6,3,3,'#ffd35a');
  P(-7,-13+fl*.3,5,3,'#fff');P(-9,-12,3,2,'#e8f0ff');P(-8,-10,4,1,'#cfe0ff');P(3,-13+fl*.3,5,3,'#fff');P(6,-12,3,2,'#e8f0ff');P(4,-10,4,1,'#cfe0ff');
  P(-3,-16,6,6,'#fff6b0');P(-2,-17,4,1,'#fff6b0');P(-2,-10,4,1,'#fff6b0');P(-1,-15,2,2,'#fff');
  g.save();g.strokeStyle='rgba(255,240,160,'+(.7+.3*Math.sin(tm*3))+')';g.lineWidth=2;g.beginPath();g.ellipse(ox,oy-38,10,3,0,0,7);g.stroke();g.restore();
  g.save();g.translate(ox,oy-26);g.rotate(tm*.6);g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){g.rotate(1.047);g.fillStyle='rgba(255,230,140,.18)';g.fillRect(0,-1,26+t.lvl*4,2)}g.restore();
  glowAt(g,ox,oy-26,28+(t.rec>.3?14:0),'#fff6b0',.5);
 }
};
function drawTower(g,t,x,y,tm){
 const d=t.def,B=towerBody(d,t.lvl);g.imageSmoothingEnabled=false;
 g.drawImage(B.c,x,y-16,48,68);
 const ox=x+24,oy=y-16+B.top*2,f=(t.face||1)>0?1:-1;
 const P=(dx,dy,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(ox+dx*2),Math.round(oy+dy*2),Math.max(1,Math.round(w*2)),Math.max(1,Math.round(h*2)))};
 const F=(dx,dy,w,h,col)=>P(f>0?dx:-dx-w,dy,w,h,col);
 if(t.lvl>=3&&d.cat!==3)glowAt(g,ox,oy-14,26,d.glow,.18+.08*Math.sin(tm*3));
 if(t.rec===undefined)t.rec=0;
 HEADS[d.head]({g,t,P,F,tm,f,ox,oy});
 if(t.dis>0){g.fillStyle='rgba(120,200,255,.45)';g.fillRect(x+6,y-14,36,60)}
}
function towerPreview(def,lvl,scale=1){
 const[c,g]=mk(48,72);g.translate(0,16);drawTower(g,{def,lvl,face:1,rec:0,angle:-.6},0,0,1.3);
 if(scale===1)return c;const[c2,g2]=mk(48*scale,72*scale);g2.imageSmoothingEnabled=false;g2.drawImage(c,0,0,48*scale,72*scale);return c2;
}

/* ---------- Inimigos ---------- */
function genEnemy(def,frame){
 const k=def.k,S=16*k,[c,g]=mk(S,S);g.scale(k,k);const p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 const C=def.c,D=shade(C,-.3),Lc=shade(C,.25),SKc=def.s,SKd=shade(def.s,-.25),o=def.o,f=frame,big=o.big?1:0,bob=f?1:0;
 const eye=(x,y)=>p(x,y,1,1,def.e);
 switch(def.shape){
 case'blob':{const sq=f?1:0;p(3,8+sq,10,6-sq,D);p(2,9+sq,12,5-sq,C);p(4,6+sq,8,3,C);p(5,5+sq,6,2,Lc);p(5,6+sq,2,1,'#fff');p(5,10,2,2,'#fff');p(9,10,2,2,'#fff');p(6,11,1,1,'#111');p(10,11,1,1,'#111');p(2,13,12,1,D);if(def.name!=='Slime')p(7,3,2,2,C);break}
 case'hum':{
  const lg=f?1:0;p(5,12,3,3+lg-1,D);p(9,12,3,3-lg+1,D);p(5,15-(1-lg),3,1,'#222');p(9,15-lg,3,1,'#222');
  if(o.cape){p(3,6,2,8,o.cape);p(11,6,2,8,o.cape)}
  if(o.wings){p(0,4,3,6,D);p(13,4,3,6,D);p(1,3+bob,2,2,Lc);p(13,3+bob,2,2,Lc)}
  const bw=o.wide?10:8,bx=o.wide?3:4;p(bx,7,bw,6,C);p(bx,7,2,6,Lc);p(bx+bw-2,7,2,6,D);p(bx,12,bw,1,D);
  if(o.skel){for(let i=8;i<12;i+=2)p(bx+2,i,bw-4,1,D)}
  p(5,2,6,6,SKc);p(5,2,2,6,shade(SKc,.15));p(9,3,2,5,SKd);
  if(o.ears){p(3,3,2,2,SKc);p(11,3,2,2,SKc);p(2,3,1,1,SKc);p(13,3,1,1,SKc)}
  if(o.horns){p(4,0,2,3,'#e8e0c0');p(10,0,2,3,'#e8e0c0');p(3,0,1,1,'#e8e0c0');p(12,0,1,1,'#e8e0c0')}
  if(o.hood){p(4,1,8,3,o.hood);p(4,2,2,5,o.hood);p(10,2,2,5,o.hood)}
  if(o.helmet){p(4,1,8,3,o.helmet);p(7,0,2,1,o.helmet);p(4,3,1,3,o.helmet);p(11,3,1,3,o.helmet);p(5,1,6,1,shade(o.helmet,.3))}
  if(o.pharaoh){p(3,0,10,3,'#ffd35a');p(3,3,2,5,'#2a4a8a');p(11,3,2,5,'#2a4a8a');p(7,0,2,1,'#2a4a8a');p(5,1,6,1,'#2a4a8a')}
  if(o.crown){p(5,0,6,2,'#ffd35a');p(5,-0,1,1,'#ffd35a');p(7,-0.5,2,1,'#ffd35a');p(10,0,1,1,'#ffd35a')}
  eye(6,4);eye(9,4);
  if(o.tusks){p(6,6,1,2,'#fff');p(9,6,1,2,'#fff')}if(o.fangs){p(6,6,1,1,'#fff');p(9,6,1,1,'#fff')}
  if(o.skel)p(6,6,4,1,'#222');
  if(o.shield){p(1,7,4,6,o.shield);p(1,7,4,1,shade(o.shield,.3));p(2,9,2,2,'#c9a050')}
  const W=o.weapon;
  if(W==='sword'){p(12,2+f,1,8,'#cfd4e0');p(11,10+f,3,1,'#8a6a2a');p(12,11+f,1,2,'#5a3a1a')}
  if(W==='dagger'){p(12,8+f,1,4,'#cfd4e0');p(12,12+f,1,1,'#5a3a1a')}
  if(W==='bow'){p(12,4,1,1,'#8a5a2a');p(13,5,1,5,'#8a5a2a');p(12,10,1,1,'#8a5a2a');p(12,5,1,5,'#ddd')}
  if(W==='staff'){p(13,1,1,13,'#6a4a2a');p(12,0,3,3,def.e);p(13,-0.5,1,1,'#fff')}
  if(W==='axe'){p(13,3,1,10,'#6a4a2a');p(11,2,4,3,'#aab');p(11,2,1,3,'#fff')}
  if(W==='club'){p(13,5,2,8,'#6a4a2a');p(12,4,4,4,'#8a6a3a')}
  if(o.aura){g.globalAlpha=.25;p(-2,-2,20,20,def.e);g.globalAlpha=1}
  break}
 case'quad':{const lg=f?1:0;p(2,6,10,5,C);p(2,6,10,2,Lc);p(10,4,5,5,C);p(14,6,2,3,D);p(11,2,2,3,C);p(14,2,1,2,C);p(13,5,1,1,def.e);p(15,7,1,1,'#111');
  p(3,11,2,3+lg,D);p(5,11,2,3-lg+1,D);p(8,11,2,3+1-lg,D);p(10,11,2,3+lg,D);p(0,5+bob,3,2,D);p(1,7,2,1,D);if(def.name==='Ice Wolf'){p(4,5,1,1,'#fff');p(7,5,2,1,'#8ae8ff')}break}
 case'spider':{const lg=f?1:0;g.fillStyle=D;for(let i=0;i<4;i++){const y=5+i*2;p(0+(i%2?lg:0),y,5,1,D);p(11-(i%2?lg:0),y,5,1,D);p(0,y+1-(i%2),1,2,D);p(15,y+1-(i%2),1,2,D)}
  p(5,6,6,6,C);p(6,4,4,3,C);p(5,6,2,6,Lc);p(7,8,2,2,'#c0302a');p(6,5,1,1,def.e);p(9,5,1,1,def.e);if(def.k>1){p(7,7,2,2,def.e)}break}
 case'flame':{const w=f?1:0;p(4,10,8,4,'#c03a10');p(3,8,10,4,'#ff6a1a');p(4,5+w,8,4,'#ff8a2a');p(5,3+w,6,3,'#ffb030');p(7,1+(1-w),2,3,'#ffd35a');p(6,6,4,5,'#ffd35a');p(7,7,2,3,'#fff');p(5,6,1,1,'#111');p(10,6,1,1,'#111');p(2,6+w,2,3,'#ff6a1a');p(12,6+(1-w),2,3,'#ff6a1a');break}
 case'ghost':{const w=f?1:0;g.globalAlpha=.88;p(4,3,8,9,C);p(3,5,10,6,C);p(5,2,6,2,Lc);for(let i=0;i<4;i++)p(3+i*3,11+((i+w)%2),3,2+((i+w)%2),C);p(5,5,2,3,'#223');p(9,5,2,3,'#223');p(6,9,4,1,'#445');p(2,7+w,2,3,C);p(12,7+(1-w),2,3,C);g.globalAlpha=1;break}
 case'golem':{const lg=f?1:0;p(3,11,4,4-lg+lg,D);p(9,11,4,4,D);p(2,4,12,8,C);p(2,4,12,2,Lc);p(2,10,12,2,D);p(5,0+bob,6,5,C);p(5,0+bob,6,1,Lc);p(0,5,3,7+lg,D);p(13,5,3,7+(1-lg),D);p(0,12+lg,3,2,C);p(13,12+(1-lg),3,2,C);
  p(6,2+bob,1,1,def.e);p(9,2+bob,1,1,def.e);p(4,7,2,1,D);p(9,8,3,1,D);p(7,6,1,3,D);
  if(o.lava){for(const[x,y]of[[4,6],[10,5],[7,9],[11,9],[5,11]])p(x,y,2,1,'#ff8a1a');p(5,3+bob,1,1,'#ffd35a')}
  if(o.runes){p(6,6,1,3,def.e);p(5,7,3,1,def.e);p(10,6,1,2,def.e);p(3,9,2,1,def.e);p(11,10,2,1,def.e)}break}
 case'dragon':{const w=f?-1:1;p(3,8,9,5,C);p(3,8,9,2,Lc);p(10,5,5,4,C);p(14,6,2,2,C);p(14,7,2,1,'#c03a1a');p(11,3,1,3,'#ffd35a');p(13,3,1,2,'#ffd35a');p(13,6,1,1,def.e);
  p(1,10,3,2,D);p(0,11,2,1,D);p(5,3+w,5,5-w,shade(C,-.15));p(3,2+w*2,3,3,shade(C,-.15));p(4,2+w*2,1,1,Lc);p(4,12,2,3,D);p(8,12,2,3,D);p(5,9,5,1,def.s);if(o.big)p(6,1,2,2,'#ffd35a');break}
 case'treant':{const lg=f?1:0;p(4,10,3,5,'#3a2a14');p(9,10,3,5,'#3a2a14');p(3,5,10,7,'#5a3a1a');p(3,5,3,7,'#7a5028');p(10,5,3,7,'#3a2410');
  p(7,7,1,2,'#ffec6b');p(10,7,1,2,'#ffec6b');p(7,10,3,1,'#2a1a0a');p(0,4+lg,4,2,'#5a3a1a');p(12,4+(1-lg),4,2,'#5a3a1a');p(0,3+lg,2,2,'#4a7a2a');p(14,3+(1-lg),2,2,'#4a7a2a');
  p(2,0,6,4,'#3a7a2a');p(7,0,6,4,'#4a8a32');p(0,2,5,3,'#2e6a22');p(11,1,5,4,'#3a7a2a');p(4,2,8,3,'#4a8a32');p(5,0,2,1,'#6ab04a');p(10,1,2,1,'#6ab04a');p(1,2,1,1,'#6ab04a');
  p(3,1,2,2,'#c03a3a');p(12,2,1,1,'#c03a3a');break}
 case'hydra':{const w=f?1:0;p(3,9,10,5,C);p(3,9,10,2,Lc);p(2,12,3,3,D);p(11,12,3,3,D);
  for(let i=0;i<3;i++){const nx=2+i*5;p(nx+1,3+(i===1?-1:1)*0+w*(i%2),2,7,C);p(nx+1,3,2,2,Lc);p(nx,1+(i===1?-1:0)+w*(i%2),4,3,C);p(nx,1+(i===1?-1:0)+w*(i%2),1,1,def.e);p(nx+3,1+(i===1?-1:0)+w*(i%2),1,1,def.e);p(nx+1,3+(i===1?-1:0)+w*(i%2),2,1,'#c0302a')}
  p(7,11,2,2,def.s);break}
 }
 return c;
}
function enemySprite(def,frame,flash){
 const key=def.key+'_'+frame+(flash?'f':'');if(Spr.enemies[key])return Spr.enemies[key];
 const base=Spr.enemies[def.key+'_'+frame+'b']||(Spr.enemies[def.key+'_'+frame+'b']=genEnemy(def,frame));
 if(!flash)return Spr.enemies[key]=base;
 const[c,g]=mk(base.width,base.height);g.drawImage(base,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.75)';g.fillRect(0,0,c.width,c.height);return Spr.enemies[key]=c;
}
function drawEnemyIcon(def,size=32){const[c,g]=mk(size,size);g.imageSmoothingEnabled=false;const s=enemySprite(def,0);g.drawImage(s,0,0,size,size);return c}

/* ---------- Decoração dos mapas ---------- */
const DECOR={
 tree(g,x,y,r){R(g,x-3,y-18,6,18,'#5a3a1a');R(g,x-3,y-18,2,18,'#7a5028');ell(g,x,y-34,18,15,'#2e6a22');ell(g,x-3,y-38,14,11,'#3a7a2a');ell(g,x-6,y-41,8,6,'#5aa03a');R(g,x+6,y-30,3,3,'#c03a3a')},
 pine(g,x,y){R(g,x-3,y-10,6,10,'#4a2e14');for(let i=0;i<4;i++)ell(g,x,y-14-i*9,17-i*3,6,i%2?'#2a5a2a':'#23502a')},
 snowpine(g,x,y){R(g,x-3,y-10,6,10,'#4a2e14');for(let i=0;i<4;i++){ell(g,x,y-14-i*9,17-i*3,6,'#2a5a3a');ell(g,x,y-17-i*9,13-i*3,3,'#f4faff')}},
 bush(g,x,y){ell(g,x,y-8,13,8,'#2e6a22');ell(g,x-3,y-11,9,6,'#4a8a32');R(g,x+5,y-8,3,3,'#e04a6a')},
 flower(g,x,y,r){for(let i=0;i<4;i++){const fx=x-9+i*6+(r()*3|0),c=pick(['#ff7aa8','#ffe05a','#fff','#9ab8ff']);R(g,fx,y-9,3,6,'#2e6a22');R(g,fx-3,y-12,9,3,c);R(g,fx,y-15,3,9,c);R(g,fx,y-12,3,3,'#ffd35a')}},
 rock(g,x,y){ell(g,x,y-8,14,9,'#6a6a72');ell(g,x-3,y-11,10,6,'#8a8a94');R(g,x-9,y-6,3,3,'#555')},
 boulder(g,x,y){ell(g,x,y-10,16,11,'#5a5a64');ell(g,x-3,y-14,11,7,'#7a7a86');R(g,x+3,y-7,6,3,'#444')},
 mushroom(g,x,y){R(g,x-3,y-8,6,8,'#e8e0c8');ell(g,x,y-12,12,8,'#c03a3a');R(g,x-6,y-14,3,3,'#fff');R(g,x+3,y-11,3,3,'#fff')},
 stump(g,x,y){R(g,x-9,y-12,18,12,'#6a4a2a');ell(g,x,y-12,9,4,'#9a7a4a');R(g,x-3,y-13,6,2,'#6a4a2a')},
 house(g,x,y){R(g,x-18,y-24,36,24,'#c8b088');R(g,x-18,y-24,6,24,'#d8c098');R(g,x-18,y-6,36,6,'#8a6a48');for(let i=0;i<5;i++)R(g,x-21+i*3,y-33+i*3,42-i*6,3,i%2?'#a03a2a':'#b84a3a');R(g,x-12,y-42,24,6,'#b84a3a');R(g,x-6,y-45,12,3,'#a03a2a');R(g,x-4,y-14,8,14,'#4a2e14');R(g,x+9,y-20,6,6,'#8ac8e8');R(g,x-15,y-20,6,6,'#8ac8e8');R(g,x+10,y-48,5,8,'#7a7a7a')},
 fence(g,x,y){R(g,x-18,y-12,36,3,'#8a6a3a');R(g,x-18,y-6,36,3,'#8a6a3a');for(let i=0;i<4;i++)R(g,x-18+i*12,y-15,3,15,'#6a4a2a')},
 haystack(g,x,y){ell(g,x,y-9,15,10,'#d8b848');ell(g,x-3,y-13,10,6,'#e8cc60');R(g,x-6,y-7,12,2,'#b89830')},
 pond(g,x,y){ell(g,x,y-8,20,10,'#2a5a8a');ell(g,x,y-9,16,8,'#3a7ab0');R(g,x-8,y-11,9,2,'#8ac8e8');R(g,x+6,y-6,3,3,'#4a8a32')},
 icecrystal(g,x,y){for(const[dx,h,w]of[[-8,20,6],[0,30,8],[8,16,5]]){R(g,x+dx-w/2,y-h,w,h,'#9ad8f8');R(g,x+dx-w/2,y-h,w/2,h,'#dff4ff');R(g,x+dx-w/2+1,y-h-3,w-2,3,'#cfeeff')}},
 snowrock(g,x,y){ell(g,x,y-8,14,9,'#7a8498');ell(g,x,y-14,12,5,'#f4faff')},
 snowman(g,x,y){ell(g,x,y-8,11,9,'#f4faff');ell(g,x,y-22,8,7,'#f4faff');R(g,x-3,y-24,2,2,'#222');R(g,x+2,y-24,2,2,'#222');R(g,x-1,y-21,5,2,'#ff7a1a');R(g,x-8,y-20,16,2,'#c03a3a');R(g,x-6,y-33,12,3,'#222');R(g,x-4,y-38,8,6,'#222')},
 iceberg(g,x,y){ell(g,x,y-10,19,11,'#8ac8e8');ell(g,x-3,y-18,13,9,'#b8e4ff');ell(g,x-6,y-22,7,4,'#f4faff');R(g,x+6,y-12,6,3,'#5aa0c8')},
 lavarock(g,x,y){ell(g,x,y-10,15,10,'#3a2a2a');ell(g,x-3,y-13,10,7,'#5a4442');R(g,x-6,y-8,2,5,'#ff6a1a');R(g,x+3,y-12,2,6,'#ff8a2a')},
 obsidian(g,x,y){for(const[dx,h,w]of[[-7,18,7],[1,32,9],[9,14,6]]){R(g,x+dx-w/2,y-h,w,h,'#1c1624');R(g,x+dx-w/2,y-h,w/2,h,'#3a2c4a');R(g,x+dx-w/2+2,y-h-3,w-4,3,'#1c1624')}},
 vent(g,x,y){ell(g,x,y-5,14,6,'#2a1a18');ell(g,x,y-6,9,4,'#ff6a1a');ell(g,x,y-6,5,2,'#ffd35a')},
 lavapool(g,x,y){ell(g,x,y-9,21,11,'#2a1a18');ell(g,x,y-9,17,8,'#d8400a');ell(g,x-3,y-10,10,5,'#ff8a2a');ell(g,x-5,y-11,4,2,'#ffd35a')},
 deadtree(g,x,y){R(g,x-3,y-30,6,30,'#3a2a22');R(g,x-12,y-26,9,3,'#3a2a22');R(g,x-15,y-32,3,9,'#3a2a22');R(g,x+3,y-20,12,3,'#3a2a22');R(g,x+12,y-27,3,9,'#3a2a22');R(g,x-3,y-30,2,30,'#5a443a')},
 grave(g,x,y,r){const h=18+(r()*10|0);R(g,x-9,y-h,18,h,'#7a7a82');R(g,x-9,y-h,18,3,'#9a9aa4');ell(g,x,y-h,9,6,'#7a7a82');R(g,x-6,y-h+6,12,2,'#555');R(g,x-4,y-h+10,8,2,'#555');R(g,x-12,y-3,24,3,'#3a2a22')},
 cross(g,x,y){R(g,x-3,y-30,6,30,'#8a8a92');R(g,x-10,y-24,20,6,'#8a8a92');R(g,x-3,y-30,2,30,'#aaaab4');R(g,x-12,y-3,24,3,'#3a2a22')},
 crypt(g,x,y){R(g,x-20,y-30,40,30,'#6a6a74');R(g,x-20,y-30,40,4,'#8a8a94');R(g,x-22,y-36,44,6,'#555560');R(g,x-8,y-20,16,20,'#14101a');R(g,x-5,y-46,10,10,'#6a6a74');R(g,x-1,y-44,2,6,'#222');R(g,x-6,y-50,12,4,'#555560')},
 bones(g,x,y){R(g,x-12,y-4,24,3,'#e0d8c0');R(g,x-14,y-6,4,4,'#e0d8c0');R(g,x+10,y-2,4,4,'#e0d8c0');ell(g,x+3,y-8,6,5,'#e8e0c8');R(g,x,y-9,2,2,'#222');R(g,x+4,y-9,2,2,'#222')},
 iron(g,x,y){for(let i=0;i<4;i++){R(g,x-15+i*10,y-24,3,24,'#2a2a32');R(g,x-16+i*10,y-28,5,5,'#2a2a32')}R(g,x-15,y-18,32,3,'#2a2a32')},
 cactus(g,x,y){R(g,x-5,y-34,10,34,'#3a8a4a');R(g,x-5,y-34,3,34,'#5aae6a');R(g,x-14,y-24,9,4,'#3a8a4a');R(g,x-14,y-30,4,10,'#3a8a4a');R(g,x+5,y-20,9,4,'#3a8a4a');R(g,x+11,y-27,4,11,'#3a8a4a');R(g,x-1,y-36,2,3,'#ff7aa8')},
 palm(g,x,y){for(let i=0;i<8;i++)R(g,x-3+Math.round(i*.6),y-i*5,6,5,i%2?'#8a6a3a':'#6a4a2a');for(const[dx,dy,w]of[[-22,-44,16],[-14,-50,14],[6,-50,14],[8,-44,18],[-4,-54,8]])R(g,x+dx,y+dy,w,5,'#3a8a3a');R(g,x-2,y-44,6,5,'#5aae4a')},
 pillar(g,x,y){R(g,x-9,y-6,18,6,'#c8b890');R(g,x-6,y-36,12,30,'#d8c8a0');R(g,x-6,y-36,3,30,'#e8dcb8');R(g,x-9,y-42,18,6,'#c8b890');for(let i=0;i<3;i++)R(g,x-6,y-30+i*9,12,1,'#a89868')},
 ruin(g,x,y){R(g,x-18,y-12,36,12,'#b8a878');R(g,x-18,y-24,12,12,'#b8a878');R(g,x+8,y-18,10,6,'#b8a878');R(g,x-18,y-24,12,3,'#d8c898');R(g,x-12,y-8,3,3,'#8a7a50');R(g,x+2,y-9,3,3,'#8a7a50')},
 dune(g,x,y){ell(g,x,y-5,22,7,'#e6c88a');ell(g,x-6,y-8,14,4,'#f2dca4')},
 skullrock(g,x,y){ell(g,x,y-7,11,7,'#d8cfae');R(g,x-5,y-9,3,3,'#222');R(g,x+2,y-9,3,3,'#222');R(g,x-1,y-4,2,3,'#222')},
 obelisk(g,x,y){R(g,x-7,y-4,14,4,'#a89868');R(g,x-5,y-44,10,40,'#c8b078');R(g,x-5,y-44,3,40,'#e0c890');R(g,x-3,y-50,6,6,'#e0c890');R(g,x-1,y-30,2,6,'#3a8a9a');R(g,x-2,y-22,4,2,'#3a8a9a')},
 willow(g,x,y){R(g,x-4,y-30,8,30,'#4a3a22');ell(g,x,y-36,19,12,'#3a6a3a');for(let i=0;i<8;i++)R(g,x-18+i*5,y-34,3,14+(i*7%12),i%2?'#4a8a4a':'#3a7a3a')},
 lily(g,x,y,r){ell(g,x,y-5,18,8,'#1a4a3a');ell(g,x-6,y-6,6,3,'#4aa85a');ell(g,x+7,y-4,5,3,'#4aa85a');R(g,x+5,y-8,3,3,'#ff9ad0')},
 reed(g,x,y){for(let i=0;i<5;i++){R(g,x-9+i*4,y-20-(i%3)*5,2,20+(i%3)*5,'#6a8a3a');R(g,x-10+i*4,y-24-(i%3)*5,4,6,'#6a4a2a')}},
 bog(g,x,y){ell(g,x,y-5,20,7,'#1e3a2a');ell(g,x-5,y-6,10,3,'#2e5a3e');R(g,x+6,y-8,2,2,'#7aff9a')},
 swamplamp(g,x,y){R(g,x-2,y-30,4,30,'#4a3a22');R(g,x-6,y-38,12,10,'#2a2a2a');R(g,x-4,y-36,8,6,'#9aff7a')},
 crystal(g,x,y,r){const cs=['#6af0ff','#ff6ad0','#9a7aff','#7aff9a'],c1=pick(cs);for(const[dx,h,w]of[[-8,18,6],[0,28,8],[8,14,5]]){R(g,x+dx-w/2,y-h,w,h,c1);R(g,x+dx-w/2,y-h,w/2,h,shade(c1,.5));R(g,x+dx-w/2+1,y-h-3,w-2,3,shade(c1,.4))}},
 crystalbig(g,x,y){const c1='#8a7aff';R(g,x-10,y-52,20,52,c1);R(g,x-10,y-52,7,52,'#c8c0ff');R(g,x-6,y-60,12,8,'#c8c0ff');R(g,x+10,y-30,10,30,'#6aa0ff');R(g,x-22,y-24,10,24,'#ff7ad0');R(g,x-4,y-40,2,26,'#fff')},
 stalag(g,x,y){R(g,x-9,y-6,18,6,'#5a5a72');R(g,x-6,y-16,12,10,'#6a6a84');R(g,x-3,y-26,6,10,'#7a7a96');R(g,x-1,y-32,2,6,'#8a8aa8')},
 glowshroom(g,x,y){R(g,x-2,y-8,4,8,'#aaffee');ell(g,x,y-10,9,6,'#3affc8');R(g,x-4,y-12,3,3,'#fff')},
 peak(g,x,y){for(let i=0;i<7;i++)R(g,x-20+i*3,y-i*6,40-i*6,6,i<5?'#6a6460':'#f4faff');R(g,x-20,y-4,40,4,'#4a4440')},
 dragonbones(g,x,y){R(g,x-22,y-6,44,5,'#e0d8c0');for(let i=0;i<5;i++){R(g,x-16+i*8,y-18,3,13,'#e0d8c0');R(g,x-14+i*8,y-18,3,3,'#e0d8c0')}ell(g,x+22,y-9,9,7,'#e8e0c8');R(g,x+20,y-11,3,3,'#222')},
 voidspike(g,x,y){for(const[dx,h,w]of[[-8,22,6],[0,40,9],[8,16,5]]){R(g,x+dx-w/2,y-h,w,h,'#1a1030');R(g,x+dx-w/2,y-h,w/2,h,'#4a2a7a');R(g,x+dx-1,y-h-4,2,4,'#c040ff')}},
 floatrock(g,x,y){ell(g,x,y-8,14,6,'#2a2040');ell(g,x,y-12,10,4,'#4a3a6a');R(g,x-3,y-4,6,3,'#1a1030');R(g,x-1,y-1,2,5,'#c040ff')},
 rune(g,x,y){g.save();g.globalAlpha=.8;R(g,x-10,y-3,20,2,'#a040ff');R(g,x-1,y-12,2,12,'#a040ff');R(g,x-6,y-8,12,2,'#c070ff');g.restore()},
 voidtree(g,x,y){R(g,x-3,y-34,6,34,'#1a1030');R(g,x-14,y-30,12,3,'#1a1030');R(g,x+2,y-24,14,3,'#1a1030');R(g,x-14,y-38,3,10,'#1a1030');R(g,x+13,y-32,3,10,'#1a1030');R(g,x-1,y-36,2,3,'#c040ff')},
 darkorb(g,x,y){ell(g,x,y-14,10,10,'#0a0414');ell(g,x,y-14,6,6,'#5a1a9a');R(g,x-2,y-16,3,3,'#e0a0ff');R(g,x-2,y-3,4,3,'#2a2040')}
};
const DECOR_BLOCKS_BIG=new Set(['house','crypt','pond','iceberg','lavapool','peak','crystalbig','dragonbones']);

/* ---------- Fundo do mapa ---------- */
function groundDetail(g,gd,gx,gy,r,pal,amb){
 const u=3,n=(c,w=1,h=1)=>{const x=(r()*16|0)*u,y=(r()*16|0)*u;R(g,gx+x,gy+y,u*w,u*h,c)};
 for(let i=0;i<7;i++)n(r()<.5?pal[1]:pal[2]);
 switch(gd){
  case'grass':if(r()<.6){const x=gx+(r()*14|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u,u*2,shade(pal[0],.28));R(g,x+u,y+u,u,u,shade(pal[0],.28))}break;
  case'snow':if(r()<.5)n('#ffffff');if(r()<.3){n('#b8d4ee',2,1)}break;
  case'lava':if(r()<.35){const x=gx+(r()*12|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u*3,u,'#c8400a');R(g,x+u*2,y+u,u,u*2,'#ff6a1a');R(g,x+u*2,y+u,u,u,'#ffd35a')}break;
  case'grave':if(r()<.3)n('#4a3e30',2,1);if(r()<.4)n('#4e6a52');break;
  case'desert':if(r()<.5){const x=gx+(r()*12|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u*3,u,shade(pal[0],.18));R(g,x+u,y+u,u*2,u,shade(pal[0],-.12))}break;
  case'swamp':if(r()<.35){const x=gx+(r()*12|0)*u,y=gy+(r()*13|0)*u;R(g,x,y,u*3,u*2,'#1e4a40');R(g,x+u,y,u,u,'#3a7a6a')}if(r()<.3)n('#5a8a3a');break;
  case'cave':if(r()<.3)n('#5a6890',2,1);if(r()<.12){const x=gx+(r()*14|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u,u,pick(['#6af0ff','#ff6ad0','#9a7aff']))}break;
  case'mountain':if(r()<.4){const x=gx+(r()*10|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u*4,u,shade(pal[0],-.3));R(g,x+u*3,y+u,u,u*2,shade(pal[0],-.3))}break;
  case'void':if(r()<.3)n('#c070ff');if(r()<.2)n('#6a40aa',3,1);if(r()<.25){const x=gx+(r()*14|0)*u,y=gy+(r()*14|0)*u;R(g,x,y,u,u,'#fff')}break;
 }
}
function drawKeep(g,cx,cy,col){ // base do jogador (castelo)
 R(g,cx-30,cy-8,60,34,'#6a6a78');R(g,cx-30,cy-8,60,5,'#9a9aa8');R(g,cx-30,cy+14,60,12,'#4a4a58');
 for(const dx of[-34,22]){R(g,cx+dx,cy-34,14,60,'#7a7a88');R(g,cx+dx,cy-34,4,60,'#a0a0b0');R(g,cx+dx-2,cy-40,18,8,'#8a8a98');for(let i=0;i<3;i++)R(g,cx+dx-2+i*7,cy-46,4,6,'#8a8a98');R(g,cx+dx+5,cy-24,4,8,'#14101a');R(g,cx+dx+6,cy-62,2,16,'#4a3a22');R(g,cx+dx+8,cy-62,12,8,col||'#2a5ad0')}
 R(g,cx-10,cy,20,26,'#2a1c14');R(g,cx-10,cy,20,3,'#5a3a22');R(g,cx-8,cy-3,16,3,'#2a1c14');for(let i=0;i<5;i++)R(g,cx-8+i*4,cy+3,1,23,'#1a1008');
 for(let i=0;i<3;i++)R(g,cx-24+i*20,cy-18,5,5,'#ffcc66');
}
function drawGate(g,cx,cy,col){ // portal/entrada dos inimigos
 R(g,cx-20,cy-26,10,48,'#2a2430');R(g,cx+10,cy-26,10,48,'#2a2430');R(g,cx-22,cy-32,44,8,'#3a3040');
 g.save();g.globalAlpha=.8;ell(g,cx,cy-2,10,22,col);ell(g,cx,cy-2,6,16,shade(col,.4));g.restore();
 R(g,cx-20,cy-26,3,48,'#4a4258');
}
const BGCACHE={};
function getMapBG(mi){
 if(BGCACHE[mi])return BGCACHE[mi];
 const M=MAPS[mi],r=mulberry(mi*977+13),[c,g]=mk(MW,MH);
 // caminhos -> células
 const pc=new Set();
 M.paths.forEach(p=>{for(let i=0;i<p.length-1;i++){let[a,b]=p[i],[c2,d]=p[i+1];const sx=Math.sign(c2-a),sy=Math.sign(d-b);let x=a,y=b;pc.add(x+','+y);while(x!==c2||y!==d){if(x!==c2)x+=sx;else y+=sy;pc.add(x+','+y)}}});
 const isP=(x,y)=>pc.has(x+','+y);
 // terreno
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const px=x*TILE,py=y*TILE;R(g,px,py,TILE,TILE,M.g[0]);if(M.gd==='snow'&&(x+y)%2)R(g,px,py,TILE,TILE,'rgba(255,255,255,.12)');groundDetail(g,M.gd,px,py,r,M.g,M.amb);
  if(M.gd==='void'&&((x*7+y*3)%5===0))R(g,px,py,TILE,TILE,'rgba(90,40,160,.12)');
 }
 // caminho
 const pst=M.pstyle;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  if(!isP(x,y))continue;const px=x*TILE,py=y*TILE;R(g,px,py,TILE,TILE,M.p[0]);
  for(let i=0;i<10;i++){const sx=(r()*16|0)*3,sy=(r()*16|0)*3;R(g,px+sx,py+sy,3,3,r()<.5?M.p[1]:M.p[2])}
  if(pst==='cobble'||pst==='basalt'){for(let by=0;by<TILE;by+=12){R(g,px,py+by,TILE,2,M.p[1]);const off=(by/12|0)%2?12:0;for(let bx=off;bx<TILE;bx+=24)R(g,px+bx,py+by,2,12,M.p[1])}}
  if(pst==='planks'){for(let by=0;by<TILE;by+=12)R(g,px,py+by,TILE,2,M.p[1]);R(g,px+4,py+3,2,2,'#2a1c10');R(g,px+42,py+27,2,2,'#2a1c10')}
  if(pst==='ice'){R(g,px+6,py+6,12,3,'#d8f0ff');R(g,px+30,py+30,9,3,'#d8f0ff');R(g,px+18,py+20,3,12,'#c0e0f8')}
  if(pst==='void'){R(g,px+6,py+22,36,2,'#a040ff');R(g,px+22,py+6,2,36,'#6a3aaa')}
  if(pst==='sand'){for(let i=0;i<3;i++)R(g,px+(r()*30|0),py+(r()*40|0),12,3,M.p[2])}
  const B=[[0,-1,px,py,TILE,4],[0,1,px,py+TILE-4,TILE,4],[-1,0,px,py,4,TILE],[1,0,px+TILE-4,py,4,TILE]];
  for(const[dx,dy,rx,ry,rw,rh]of B)if(!isP(x+dx,y+dy)){R(g,rx,ry,rw,rh,shade(M.p[1],-.25));R(g,dx?rx+(dx<0?4:-3):rx,dy?ry+(dy<0?4:-3):ry,dx?3:rw,dy?3:rh,shade(M.p[2],.1))}
 }
 // lava/água animáveis no vulcão: brilho nas bordas
 // decoração
 const wsum=M.decor.reduce((a,d)=>a+d[1],0),blocked=new Set(),anim=[],items=[];
 const near=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(isP(x+dx,y+dy))return true;return false};
 const endCells=M.paths.map(p=>p[p.length-1]),startCells=M.paths.map(p=>p[0]);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  if(isP(x,y))continue;let near2=near(x,y);
  if(endCells.some(e=>Math.abs(e[0]-x)<=1&&Math.abs(e[1]-y)<=1)||startCells.some(e=>Math.abs(e[0]-x)<=1&&Math.abs(e[1]-y)<=1))continue;
  const prob=near2?.035:.14;if(r()>prob)continue;
  let t=r()*wsum,dec=M.decor[0];for(const d of M.decor){t-=d[1];if(t<=0){dec=d;break}}
  if(DECOR_BLOCKS_BIG.has(dec[0])&&near2)continue;
  items.push({type:dec[0],x,y,blocks:!!dec[2]});
 }
 items.sort((a,b)=>a.y-b.y||a.x-b.x);
 const occ=new Set();
 for(const it of items){
  if(occ.has(it.x+','+it.y))continue;occ.add(it.x+','+it.y);
  const bx=it.x*TILE+TILE/2+((r()*10|0)-5),by=it.y*TILE+TILE-4;
  g.save();g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(bx,by-1,14,5,0,0,7);g.fill();g.restore();
  DECOR[it.type](g,bx,by,r);
  if(it.blocks)blocked.add(it.x+','+it.y);
 }
 // entrada e saída
 const gateCol={forest:'#7affb0'}[M.gd]||'#c070ff';
 M.paths.forEach(p=>{const[sc,sr]=p[0];const sx=sc*TILE+TILE/2,sy=sr*TILE+TILE/2;drawGate(g,sx,sy,['#7affb0','#ffe08a','#8af0ff','#ff6a2a','#9aff9a','#ffd35a','#9affb0','#8affff','#ff8a3a','#c070ff'][mi]);anim.push({k:'gate',x:sx,y:sy,col:['#7affb0','#ffe08a','#8af0ff','#ff6a2a','#9aff9a','#ffd35a','#9affb0','#8affff','#ff8a3a','#c070ff'][mi]})});
 const last=M.paths[0][M.paths[0].length-1];drawKeep(g,last[0]*TILE+TILE/2,last[1]*TILE+TILE/2-6,'#2a5ad0');
 // iluminação: vinheta + luz ambiente
 const vg=g.createRadialGradient(MW/2,MH/2,MH*.35,MW/2,MH/2,MW*.65);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=vg;g.fillRect(0,0,MW,MH);
 g.globalAlpha=M.amb[1];g.fillStyle=M.amb[0];g.fillRect(0,0,MW,MH);g.globalAlpha=1;
 // luzes de lava/cristais (aditivas)
 if(['lava','cave','void'].includes(M.gd)){for(const it of items){if(['lavapool','vent','lavarock','crystal','crystalbig','glowshroom','darkorb','rune'].includes(it.type)){const col={lavapool:'#ff6a1a',vent:'#ff6a1a',lavarock:'#ff6a1a',crystal:'#6af0ff',crystalbig:'#a09aff',glowshroom:'#3affc8',darkorb:'#a040ff',rune:'#a040ff'}[it.type];glowAt(g,it.x*TILE+TILE/2,it.y*TILE+TILE-14,46,col,.5)}}}
 return BGCACHE[mi]={c,pc,blocked,anim,isP};
}
/* ============================ MOTOR ================================== */
function buildPaths(M){
 return M.paths.map(p=>{
  const pts=p.map(([c,r])=>[c*TILE+TILE/2,r*TILE+TILE/2]);
  const[c0,r0]=p[0],s=pts[0].slice();
  if(c0===0)s[0]=-30;else if(c0===COLS-1)s[0]=MW+30;
  if(r0===0)s[1]=-30;else if(r0===ROWS-1)s[1]=MH+30;
  if(s[0]!==pts[0][0]||s[1]!==pts[0][1])pts.unshift(s);
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return{pts,cum,total:cum[cum.length-1]};
 });
}
function posAtD(p,d){
 d=clamp(d,0,p.total);let s=0;while(s<p.pts.length-2&&d>p.cum[s+1])s++;
 const a=p.pts[s],b=p.pts[s+1],l=(p.cum[s+1]-p.cum[s])||1,t=(d-p.cum[s])/l;return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}
class Game{
 up(k){return this.fair?0:Save.upg(k)}
 constructor(mi,diff,o={}){
  this.headless=!!o.headless;this.fair=!!(o.fair||o.remote||o.headless);this.coop=Math.max(1,o.coop||1);this.fx=[];this.players=o.players||[];this.mySlot=o.slot===undefined?-1:o.slot;this.pendingSel=null;
  this.mi=mi;this.M=MAPS[mi];this.diff=diff;this.D=DIFFS[diff];this.bgd=getMapBG(mi);this.blk=this.bgd.blocked;this.paths=buildPaths(this.M);
  this.remote=!!o.remote;this.net=o.net||null;this.N=this.M.waves;
  this.maxLives=this.D.lives+this.up('lives');this.lives=this.maxLives;this.gold=this.D.gold+25*this.up('gold')+mi*70+120*(this.coop-1);
  this.wave=0;this.queue=[];this.qt=0;this.waveHp=1;this.uid=1;this.time=0;this.anim=0;
  this.towers=[];this.enemies=[];this.proj=[];this.parts=[];this.allies=[];this.floats=[];this.bolts=[];this.strikes=[];
  this.speed=1;this.paused=false;this.over=null;this.sel=null;this.build=null;this.hover=null;this.shake=0;this.banner=null;
  this.stats={kills:0,leaks:0,gold:0,built:0,bosses:0,upgrades:0,livesLost:0};this.acc=0;this.snapT=0;this.auto=!this.fair&&!!Save.d.set.auto;
  this.waveDone=0;this.waveTotal=0;this.bossAlive=null;this.cellT=new Map();this.stations=null;this.pendingEnd=false;
  this.envp=[];if(!this.headless){for(let i=0;i<80;i++)this.envp.push(this.mkEnv(true))}else this.parts={push(){},length:0};
  this.mclock=0;this.wavesCleared=0;this.cleared=false;
 }
 /* ---------- ondas ---------- */
 genWave(w){
  const M=this.M,N=this.N,D=this.D,pool=M.pool,L=pool.length,prog=N>1?(w-1)/(N-1):1;
  const mi=Math.min(L-1,Math.floor(prog*(L-1)+.0001)),ts=t=>1/(1+(t-1)*.3),base=(5+w*1.3)*D.cnt*(1+.3*(this.coop-1));
  const G=[[pool[Math.max(0,mi-2)],.22],[pool[Math.max(0,mi-1)],.3],[pool[mi],.45]];
  if(w%3===0&&mi<L-1)G.push([pool[mi+1],.18]);
  const hpm=(1+.09*(w-1)+.003*(w-1)*(w-1))*(1+(M.hpM-1)*.5)*D.hp;this.waveHp=hpm;
  const q=[];let t=0,pi=0;
  const seen=new Set();
  for(const[id,sh]of G){
   const def=ENEMIES[id],n=Math.max(1,Math.round(base*sh*ts(def.tier)*(seen.has(id)?.6:1)));seen.add(id);
   const iv=clamp(1.2-w*.025,.42,1.2)*(def.spd>70?.7:1);
   for(let i=0;i<n;i++){q.push({t:t+i*iv,key:def.key,pi:pi++,hpm});}
   t+=n*iv+1.5;
  }
  if(w===N)q.push({t:3,key:BOSSES[M.boss].key,pi:0,hpm:1+.01*(N-1),boss:1});
  q.sort((a,b)=>a.t-b.t);return q;
 }
 waveInfo(w){const q=this.genWave(w),c={};q.forEach(e=>c[e.key]=(c[e.key]||0)+1);return c}
 startWave(){
  if(this.over||this.wave>=this.N||this.queue.length)return false;
  if(this.enemies.some(e=>!e.dying)&&this.wave>0)this.addGold(10+this.wave);
  this.wave++;this.queue=this.genWave(this.wave);this.qt=0;this.waveTotal=this.queue.length;this.waveDone=0;this.towers.forEach(t=>t.healed=0);
  this.cleared=false;Sound.sfx('wave');
  this.banner={txt:'WAVE '+this.wave+(this.wave===this.N?' — CHEFÃO!':''),t:2.2,col:this.wave===this.N?'#ff6a4a':'#ffd86b'};return true;
 }
 spawn(key,pi,hpm,d0=0,child=false){
  const def=ED[key],path=this.paths[pi%this.paths.length];
  const e={uid:this.uid++,def,key,path,pi,d:d0,x:0,y:0,seg:0,hp:def.hp*hpm*(def.boss?this.D.boss:1),maxhp:0,spdM:1,slowT:0,slow:0,aura:0,stun:0,poison:null,burn:null,blocker:null,anim:Math.random()*2,dir:1,flash:0,dying:false,dt:0,abT:{},shield:0,phase:0,hpm,charge:0,vuln:1,child,atkT:1,rage:false,splitDone:{},enr:false,curseTick:0};
  if(child)e.hp=def.hp*hpm*.35;e.maxhp=e.hp;if(def.ab==='shield')e.shield=e.maxhp*.3;
  if(def.abil)def.abil.forEach((a,i)=>e.abT[i]=a.every||0);
  e.abT.d=3;e.abT.h=1;e.abT.g=5;this.place(e);this.enemies.push(e);
  if(def.boss){this.bossAlive=e;this.banner={txt:def.name+' — '+def.title,t:3.5,col:'#ff6a4a'};Sound.sfx('boss');Sound.music('boss',this.M.mus);this.shake=.6}
  return e;
 }
 place(e){
  const p=e.path;let d=clamp(e.d,0,p.total);while(e.seg<p.pts.length-2&&d>p.cum[e.seg+1])e.seg++;while(e.seg>0&&d<p.cum[e.seg])e.seg--;
  const a=p.pts[e.seg],b=p.pts[e.seg+1],l=(p.cum[e.seg+1]-p.cum[e.seg])||1,t=(d-p.cum[e.seg])/l;
  e.x=a[0]+(b[0]-a[0])*t;e.y=a[1]+(b[1]-a[1])*t;const dx=b[0]-a[0];if(Math.abs(dx)>.5)e.dir=dx>0?1:-1;
 }
 /* ---------- economia / torres ---------- */
 addGold(n){this.gold+=n}
 cost(def){return Math.round(def.price*(1-.02*this.up('disc')))}
 canBuild(c,r){return c>=0&&r>=0&&c<COLS&&r<ROWS&&!this.bgd.pc.has(c+','+r)&&!this.blk.has(c+','+r)&&!this.cellT.has(c+','+r)}
 unlocked(def){return owns(def)}
 buildTower(id,c,r,free,lvl=1,tgt,owner){
  const def=TOWERS[id];if(!this.canBuild(c,r))return null;const cost=this.cost(def);
  if(!free){if(this.gold<cost){Sound.sfx('err');return null}this.gold-=cost}
  const t={uid:this.uid++,owner:owner===undefined?-1:owner,def,id,lvl:1,col:c,row:r,x:c*TILE,y:r*TILE,cx:c*TILE+24,cy:r*TILE+24,st:statsFor(def,1),cd:.3,rec:0,face:1,angle:-.5,invested:free?cost:cost,tgt:tgt||def.tgt,dis:0,curse:0,buffDmg:0,buffRange:0,buffRate:0,timer:0,sT:1,healed:0,minions:[],fire:0,pulse:0,born:0};
  this.towers.push(t);this.cellT.set(c+','+r,t);this.stats.built++;this.sel=t;
  if(!free){Sound.sfx('build');this.burst(t.cx,t.cy+10,'#cdbb9a',10,60,.5,3)}
  for(let k=1;k<lvl;k++)this.upgradeTower(t,true);
  this.computeStations(t);return t;
 }
 upgradeCost(t){return t.lvl>=3?0:Math.round(upCost(t.def,t.lvl)*(1-.02*this.up('disc')))}
 upgradeTower(t,free){
  if(t.lvl>=3)return false;const c=this.upgradeCost(t);if(!free){if(this.gold<c){Sound.sfx('err');return false}this.gold-=c;t.invested+=c}
  t.lvl++;t.st=statsFor(t.def,t.lvl);this.stats.upgrades++;if(!free){Sound.sfx('upgrade');this.burst(t.cx,t.cy-20,t.def.glow,18,90,.8,3);this.floatTxt(t.cx,t.cy-40,'Nível '+t.lvl,'#ffd86b')}
  return true;
 }
 sellValue(t){return Math.floor(t.invested*.7)}
 sellTower(t){
  this.gold+=this.sellValue(t);this.towers=this.towers.filter(x=>x!==t);this.cellT.delete(t.col+','+t.row);
  this.allies.forEach(a=>{if(a.t===t)a.hp=0;});if(this.sel===t)this.sel=null;Sound.sfx('sell');this.burst(t.cx,t.cy,'#ffd35a',12,70,.6,3);
 }
 rng(t){return t.st.range*(1+t.buffRange+this.up('range')*.02)*TILE}
 dmgOf(t){return t.st.dmg*(1+t.buffDmg+this.up('dmg')*.02)}
 rateOf(t){return t.st.rate*(1+t.buffRate)*(t.curse>0?.5:1)}
 computeStations(t){
  if(t.def.atk!=='summon')return;const pts=[],R=this.rng(t)*.95;
  for(const p of this.paths)for(let d=0;d<p.total;d+=22){const[x,y]=posAtD(p,d);if(Math.hypot(x-t.cx,y-t.cy)<=R)pts.push({x,y,d})}
  pts.sort((a,b)=>b.d-a.d);t.stations=pts;
 }
 /* ---------- alvos ---------- */
 targets(t,rng,n=1,minr=0){
  const c=[],r2=rng*rng,m2=minr*minr;
  for(const e of this.enemies){if(e.dying||e.phase>0)continue;const dx=e.x-t.cx,dy=e.y-t.cy,d=dx*dx+dy*dy;if(d<=r2&&d>=m2){e._d2=d;c.push(e)}}
  if(c.length<2)return c;const m=t.tgt;
  const cmp=m==='first'?(a,b)=>b.d-a.d:m==='last'?(a,b)=>a.d-b.d:m==='strong'?(a,b)=>b.hp-a.hp:m==='weak'?(a,b)=>a.hp-b.hp:(a,b)=>a._d2-b._d2;
  if(n===1){let b=c[0];for(const e of c)if(cmp(e,b)<0)b=e;return[b]}
  c.sort(cmp);return c.slice(0,n);
 }
 /* ---------- status e dano ---------- */
 addSlow(e,pct,dur){if(e.def.imm.includes('ice')||e.charge>0)return;if(pct>=e.slow||e.slowT<=.1)e.slow=pct;e.slowT=Math.max(e.slowT,dur)}
 addPoison(e,dps,dur){if(e.def.imm.includes('poison'))return;if(!e.poison||dps>=e.poison.dps)e.poison={dps,t:dur};else e.poison.t=Math.max(e.poison.t,dur)}
 addBurn(e,dps,dur){if(e.def.imm.includes('fire'))return;if(!e.burn||dps>=e.burn.dps)e.burn={dps,t:dur};else e.burn.t=Math.max(e.burn.t,dur)}
 stunE(e,t){if(e.def.boss)t*=.3;e.stun=Math.max(e.stun,t)}
 hurt(e,dmg,type='phys',tw=null){
  if(e.dying||e.phase>0||dmg<=0)return 0;
  let r=e.def.res[type]||0;if(e.def.imm.includes(type))r=Math.max(r,.9);let d=dmg*(1-r)*e.vuln;if(d<=0)return 0;
  if(tw&&tw.st.execute&&e.hp/e.maxhp<tw.st.execute&&!e.def.boss)d=e.hp+e.shield+1;
  if(e.shield>0){const a=Math.min(e.shield,d);e.shield-=a;d-=a}
  e.hp-=d;e.flash=.07;if(e.hp<=0)this.kill(e);return d;
 }
 kill(e){
  if(e.dying)return;e.dying=true;e.dt=0;e.blocker=null;e.hp=0;
  const g=Math.round(e.def.gold*this.D.rew*(1+.03*this.up('loot'))*(1+this.mi*.1)*(e.child?.5:1));this.addGold(g);this.stats.kills++;this.stats.gold+=g;this.waveDone++;
  this.floatTxt(e.x,e.y-24,'+'+g,'#ffd35a');Sound.sfx(e.def.boss?'roar':'die');
  const col=e.def.c;this.burst(e.x,e.y-8,col,e.def.boss?60:12,e.def.boss?200:90,.8,3);this.burst(e.x,e.y-8,'#fff',e.def.boss?20:4,80,.4,2);
  if(e.def.boss){this.stats.bosses++;this.shake=1;this.bossAlive=null;this.floatTxt(e.x,e.y-60,'CHEFÃO DERROTADO!','#ff9a4a');Sound.music('battle',this.M.mus)}
  if(e.def.ab==='split'&&!e.child){for(let i=0;i<2;i++)this.spawn('e0',e.pi,e.hpm,e.d+(i?-10:10),true)}
 }
 /* ---------- partículas ---------- */
 burst(x,y,col,n,sp,life,size){if(this.headless){if(this.fx.length<300)this.fx.push(['b',Math.round(x),Math.round(y),col,n,Math.round(sp),+life.toFixed(2),size]);return}if(this.parts.length>650)return;for(let i=0;i<n;i++){const a=Math.random()*6.283,s=Math.random()*sp;this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-sp*.3,life:life*(.5+Math.random()*.5),max:life,col,size,g:120})}}
 floatTxt(x,y,txt,col){if(this.headless){if(this.fx.length<300)this.fx.push(['f',Math.round(x),Math.round(y),txt,col]);return}if(this.floats.length<40)this.floats.push({x,y,txt,col,t:1})}
 trail(x,y,col){if(this.headless)return;if(this.parts.length<650&&Math.random()<.5)this.parts.push({x:x+rnd(-2,2),y:y+rnd(-2,2),vx:0,vy:-10,life:.3,max:.3,col,size:2,g:0})}
 /* ---------- projéteis / ataques ---------- */
 mkProj(t,e,o={}){
  const st=t.st,ground=(t.def.atk==='splash'),sx=t.cx+(t.face>0?6:-6),sy=t.cy-28;
  let crit=1;if(st.crit&&Math.random()<st.crit[0])crit=st.crit[1];
  const p={x:sx,y:sy,sx,sy,t0:0,tw:t,tgt:e,kind:st.proj,spd:st.spd,dmg:this.dmgOf(t)*(o.mul||1)*crit,dt:st.dt,crit:crit>1,st,ground,delay:o.delay||0,z:0,ang:0,splash:(st.splash||0)*TILE,arc:st.arc,tx:e.x,ty:e.y-8,cluster:o.nocluster?0:(st.cluster||0),mul:o.mul||1};
  if(ground){
   const v=e.def.spd*this.D.spd*(1-Math.max(e.slow,e.aura)),dist0=Math.hypot(e.x-sx,e.y-sy),tf=dist0/st.spd,pr=posAtD(e.path,e.d+(e.stun>0||e.blocker?0:v*tf));
   p.tx=o.tx!==undefined?o.tx:pr[0];p.ty=o.ty!==undefined?o.ty:pr[1];const dd=Math.hypot(p.tx-sx,p.ty-sy);p.dur=Math.max(.25,dd/st.spd);
  }
  this.proj.push(p);return p;
 }
 sfxFor(t){const k=t.st.proj;Sound.sfx({arrow:'arrow',bolt:'magic',fire:'fire',ice:'ice',spark:'zap',ball:'cannon',shell:'cannon',crystal:'magic',shadow:'magic',arc:'zap',sky:'magic'}[k]||'arrow')}
 fireTower(t,dt){
  const st=t.st,rng=this.rng(t),atk=st.atk;
  if(atk==='heal'||atk==='mine'||atk==='aura'||atk==='summon')return;
  const n=atk==='multi'?st.shots:1,tg=this.targets(t,rng,n,(st.minr||0)*TILE);
  if(!tg.length)return;
  t.cd=1/this.rateOf(t);const e0=tg[0];t.face=e0.x>=t.cx?1:-1;t.angle=Math.atan2(e0.y-(t.cy-16),e0.x-t.cx);t.rec=1;
  if(atk==='proj'||atk==='splash'){const sh=st.shots||1;for(let k=0;k<sh;k++)this.mkProj(t,e0,{delay:k*.12});this.sfxFor(t)}
  else if(atk==='multi'){for(let k=0;k<st.shots;k++)this.mkProj(t,tg[k%tg.length],{delay:k*.05});this.sfxFor(t)}
  else if(atk==='chain'){this.chainAttack(t,e0);Sound.sfx('zap')}
  else if(atk==='pierce'){this.pierceAttack(t,e0);Sound.sfx('zap')}
  else if(atk==='breath'){this.breathAttack(t,e0,rng);t.fire=.2;Sound.sfx('fire')}
  else if(atk==='sky'){const list=this.targets(t,rng,st.shots||1);list.forEach((e,i)=>this.strike(e,i,t));Sound.sfx('magic')}
 }
 chainAttack(t,e0){
  const st=t.st,hit=[e0],pts=[[t.cx,t.cy-34],[e0.x,e0.y-10]];let cur=e0;
  while(hit.length<st.chain){let b=null,bd=2.3*TILE;for(const e of this.enemies){if(e.dying||e.phase>0||hit.includes(e))continue;const d=Math.hypot(e.x-cur.x,e.y-cur.y);if(d<bd){bd=d;b=e}}if(!b)break;hit.push(b);pts.push([b.x,b.y-10]);cur=b}
  const dm=this.dmgOf(t);hit.forEach((e,i)=>{this.hurt(e,dm*Math.pow(.88,i),st.dt,t);this.burst(e.x,e.y-8,'#fff08a',5,60,.3,2)});
  this.bolt({pts,col:'#fff08a',life:.2,max:.2});
 }
 pierceAttack(t,e0){
  const st=t.st,ang=Math.atan2(e0.y-(t.cy-30),e0.x-t.cx),rng=this.rng(t),dx=Math.cos(ang),dy=Math.sin(ang),ox=t.cx,oy=t.cy-30,list=[];
  for(const e of this.enemies){if(e.dying||e.phase>0)continue;const rx=e.x-ox,ry=e.y-8-oy,pr=rx*dx+ry*dy,pe=Math.abs(rx*dy-ry*dx);if(pr>0&&pr<rng+20&&pe<18)list.push([pr,e])}
  list.sort((a,b)=>a[0]-b[0]);const dm=this.dmgOf(t);list.slice(0,st.hits).forEach(([,e])=>{this.hurt(e,dm,st.dt,t);this.burst(e.x,e.y-8,'#d08aff',6,70,.4,2)});
  this.bolt({pts:[[ox,oy],[ox+dx*(rng+20),oy+dy*(rng+20)]],col:'#d08aff',life:.25,max:.25,wide:1});
 }
 breathAttack(t,e0,rng){
  const st=t.st,ang=Math.atan2(e0.y-t.cy+20,e0.x-t.cx),dm=this.dmgOf(t);
  for(const e of this.enemies){if(e.dying||e.phase>0)continue;const dx=e.x-t.cx,dy=e.y-(t.cy-20),d=Math.hypot(dx,dy);if(d>rng)continue;let da=Math.abs(Math.atan2(dy,dx)-ang);if(da>Math.PI)da=6.283-da;if(da<st.cone){this.hurt(e,dm,'fire',t);if(st.burn)this.addBurn(e,st.burn[0],st.burn[1])}}
  const f=t.face>0?1:-1;this.breathFx(t.cx+f*14,t.cy-26,ang,st.cone);
 }
 explode(p,x,y){
  const st=p.st,r=p.splash,tw=p.tw;let col=p.kind==='crystal'?'#8affff':p.kind==='fire'?'#ff8a2a':'#ffb060';
  for(const e of this.enemies){if(e.dying||e.phase>0)continue;if(Math.hypot(e.x-x,e.y-e.def.px*3-y)<=r+14||Math.hypot(e.x-x,e.y-y)<=r+14){
   this.hurt(e,p.dmg,p.dt,tw);if(st.burn)this.addBurn(e,st.burn[0],st.burn[1]);if(st.stun)this.stunE(e,st.stun);if(st.slow)this.addSlow(e,st.slow[0],st.slow[1])}}
  this.burst(x,y,col,Math.min(30,8+r/4),r*2.2,.55,4);this.burst(x,y,'#fff',6,r,.25,3);
  this.ring(x,y,r);
  this.shake=Math.max(this.shake,Math.min(.25,r/300));Sound.sfx(p.kind==='fire'?'fire':p.kind==='crystal'?'magic':'boom');
  if(st.echo&&!p.echo){let c=0;for(const e of this.enemies){if(c>=st.echo)break;if(e.dying||e.phase>0)continue;if(Math.hypot(e.x-x,e.y-y)<3*TILE&&Math.hypot(e.x-x,e.y-y)>r*.6){c++;const q=this.mkProj(tw,e,{mul:.4,tx:e.x,ty:e.y,delay:.1*c});q.echo=1;q.sx=x;q.sy=y-40;q.x=x;q.y=y-40;q.dur=.25}}}
  if(p.cluster){for(let i=0;i<p.cluster;i++){const a=Math.random()*6.283,q=this.mkProj(tw,{x,y,def:ED.e0,path:this.paths[0],d:0,slow:0,aura:0,stun:1,blocker:0},{mul:.5,nocluster:1,tx:x+Math.cos(a)*50,ty:y+Math.sin(a)*50,delay:.05*i});q.sx=x;q.sy=y-30;q.x=x;q.y=y-30;q.dur=.35}}
 }
 hitProj(p,e){
  const st=p.st,tw=p.tw;this.hurt(e,p.dmg,p.dt,tw);
  if(p.crit)this.floatTxt(e.x,e.y-26,'CRÍTICO!','#ff5a3a');
  if(st.poison)this.addPoison(e,st.poison[0],st.poison[1]);if(st.slow)this.addSlow(e,st.slow[0],st.slow[1]);if(st.burn)this.addBurn(e,st.burn[0],st.burn[1]);
  if(st.freeze&&Math.random()<st.freeze&&!e.def.imm.includes('ice')){this.stunE(e,1);this.floatTxt(e.x,e.y-26,'Congelado','#8af0ff')}
  const col={arrow:'#ddd',bolt:tw.def.glow,ice:'#8af0ff',shadow:'#b060ff',spark:'#fff08a'}[p.kind]||'#fff';this.burst(e.x,e.y-8,col,5,60,.3,2);Sound.sfx('hit');
 }
 /* ---------- aliados ---------- */
 spawnAlly(t){
  const st=t.st,k=st.minion,a={uid:this.uid++,t,kind:k,x:t.cx,y:t.cy+8,hp:st.mhp,max:st.mhp,dmg:st.mdmg*(1+t.buffDmg),cd:.5,target:null,st:null,life:k==='skel'?22:undefined,face:1,anim:0,sidx:-1};
  const used=new Set(this.allies.filter(x=>x.t===t&&x.kind==='knight').map(x=>x.sidx));
  if(t.stations&&t.stations.length){if(k==='knight'){const n=t.stations.length,step=Math.max(1,Math.floor(n/(st.max+1)));for(let i=0;i<st.max;i++){const idx=Math.min(n-1,step*(i+1)-1);if(!used.has(idx)){a.sidx=idx;break}}if(a.sidx<0)a.sidx=Math.floor(Math.random()*n)}else a.sidx=Math.floor(Math.random()*t.stations.length)}
  this.allies.push(a);Sound.sfx('summon');this.burst(a.x,a.y,k==='skel'?'#7aff7a':'#fff0a0',10,60,.5,3);
 }
 updateAlly(a,dt){
  a.cd-=dt;a.anim+=dt;if(a.life!==undefined){a.life-=dt;if(a.life<=0)a.hp=0}
  if(a.target&&(a.target.dying||a.target.def.fly))a.target=null;
  const st=a.t.st,reach=a.kind==='skel'?95:34;
  if(!a.target){let b=null,bd=reach;for(const e of this.enemies){if(e.dying||e.def.fly||e.phase>0)continue;const sx=a.kind==='skel'?a.x:(a.t.stations&&a.t.stations[a.sidx]?a.t.stations[a.sidx].x:a.x),sy=a.kind==='skel'?a.y:(a.t.stations&&a.t.stations[a.sidx]?a.t.stations[a.sidx].y:a.y);const d=Math.hypot(e.x-sx,e.y-sy);if(d<bd){bd=d;b=e}}a.target=b}
  const move=(tx,ty,sp)=>{const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);if(d>3){a.x+=dx/d*sp*dt;a.y+=dy/d*sp*dt;if(Math.abs(dx)>1)a.face=dx>0?1:-1;return true}return false};
  if(a.target){
   const e=a.target,d=Math.hypot(e.x-a.x,e.y-a.y);
   if(d>20)move(e.x,e.y,a.kind==='skel'?80:60);
   else if(a.cd<=0){a.cd=.85;this.hurt(e,a.dmg,'phys',null);this.burst(e.x,e.y-8,'#ddd',3,40,.2,2);if(st.aura)a.hp=Math.min(a.max,a.hp+a.max*.03)}
   if(d<30&&!e.def.boss&&!e.def.fly&&!e.blocker)e.blocker=a;
  }else{const s=a.t.stations&&a.t.stations[a.sidx];if(s)move(s.x,s.y,70);else move(a.t.cx,a.t.cy+30,60)}
  if(a.kind==='knight'&&st.aura&&Math.random()<dt*.5)this.parts.push({x:a.x+rnd(-6,6),y:a.y-10,vx:0,vy:-20,life:.5,max:.5,col:'#fff0a0',size:2,g:0});
 }
 /* ---------- inimigos ---------- */
 bossAbil(e,dt){
  const def=e.def;if(!def.abil)return;
  def.abil.forEach((a,i)=>{
   if(a.every){e.abT[i]-=dt;if(e.abT[i]>0)return;e.abT[i]=a.every}
   switch(a.t){
    case'summon':for(let k=0;k<a.n;k++)this.spawn('e'+a.type,e.pi,e.hpm*.6,e.d-8-k*10);this.burst(e.x,e.y,'#7aff7a',20,100,.6,3);Sound.sfx('summon');break;
    case'charge':e.charge=a.dur;e.chargeMul=a.mul;e.slow=0;e.slowT=0;Sound.sfx('roar');this.floatTxt(e.x,e.y-70,'¡Investida!','#ff9a4a');break;
    case'disable':{const l=this.towers.filter(t=>Math.hypot(t.cx-e.x,t.cy-e.y)<6*TILE).sort((x,y)=>Math.hypot(x.cx-e.x,x.cy-e.y)-Math.hypot(y.cx-e.x,y.cy-e.y)).slice(0,a.n);
     l.forEach(t=>{t.dis=Math.max(t.dis,a.dur);this.bolt({pts:[[e.x,e.y-30],[t.cx,t.cy-20]],col:def.e,life:.35,max:.35});this.burst(t.cx,t.cy-10,def.e,10,60,.5,3)});if(l.length)Sound.sfx('ice');break}
    case'curse':{const l=this.towers.filter(t=>Math.hypot(t.cx-e.x,t.cy-e.y)<5*TILE);l.forEach(t=>{t.curse=Math.max(t.curse,a.dur);this.burst(t.cx,t.cy-10,'#ffd35a',8,50,.5,3)});if(l.length)this.floatTxt(e.x,e.y-70,'Maldição!','#ffd35a');break}
    case'shield':e.shield=e.maxhp*a.pct;this.burst(e.x,e.y-20,'#ff8a2a',20,90,.6,3);this.floatTxt(e.x,e.y-70,'Escudo de lava','#ff8a2a');break;
    case'regen':e.hp=Math.min(e.maxhp,e.hp+e.maxhp*a.pct*dt);break;
    case'blink':{const nd=Math.min(e.path.total-30,e.d+a.dist);this.burst(e.x,e.y-20,'#c040ff',25,120,.6,3);e.d=nd;this.place(e);this.burst(e.x,e.y-20,'#c040ff',25,120,.6,3);Sound.sfx('summon');break}
    case'phase':e.phase=a.dur;this.floatTxt(e.x,e.y-70,'Fase sombria','#c070ff');break;
   }
  });
  // habilidades por limiar de vida
  def.abil.forEach((a,i)=>{
   if(a.t==='split'){for(const th of a.at)if(!e.splitDone[th]&&e.hp/e.maxhp<=th){e.splitDone[th]=1;for(let k=0;k<a.n;k++)this.spawn('e'+a.type,e.pi,e.hpm*.8,e.d-10-k*14);this.floatTxt(e.x,e.y-70,'A hidra se divide!','#8aff8a');Sound.sfx('roar');this.shake=.5}}
   if(a.t==='enrage'&&!e.enr&&e.hp/e.maxhp<=a.at){e.enr=true;e.spdM*=a.mul;this.floatTxt(e.x,e.y-70,'¡FÚRIA!','#ff4a2a');Sound.sfx('roar');this.shake=.8}
   if(a.t==='regen')e.hp=Math.min(e.maxhp,e.hp+e.maxhp*a.pct*dt);
  });
 }
 updateEnemy(e,dt){
  const def=e.def;
  if(e.dying){e.dt+=dt;return}
  e.anim+=dt;e.flash=Math.max(0,e.flash-dt);if(e.phase>0)e.phase-=dt;if(e.charge>0)e.charge-=dt;
  if(e.slowT>0){e.slowT-=dt;if(e.slowT<=0)e.slow=0}
  if(e.stun>0)e.stun-=dt;
  if(e.poison){this.hurt(e,e.poison.dps*dt,'poison');e.poison.t-=dt;if(e.poison.t<=0)e.poison=null;if(Math.random()<dt*6)this.parts.push({x:e.x+rnd(-6,6),y:e.y-10,vx:0,vy:-14,life:.5,max:.5,col:'#7cff4a',size:2,g:0})}
  if(e.dying)return;
  if(e.burn){this.hurt(e,e.burn.dps*dt,'fire');e.burn.t-=dt;if(e.burn.t<=0)e.burn=null;if(Math.random()<dt*8)this.parts.push({x:e.x+rnd(-6,6),y:e.y-8,vx:0,vy:-24,life:.4,max:.4,col:pick(['#ff6a2a','#ffd35a']),size:3,g:0})}
  if(e.dying)return;
  // habilidades
  switch(def.ab){
   case'disable':{e.abT.d-=dt;if(e.abT.d<=0){let b=null,bd=170;for(const t of this.towers){const d=Math.hypot(t.cx-e.x,t.cy-e.y);if(d<bd&&t.dis<=0){bd=d;b=t}}if(b){b.dis=2;this.bolt({pts:[[e.x,e.y-12],[b.cx,b.cy-20]],col:'#ff5a3a',life:.2,max:.2});e.abT.d=6}else e.abT.d=1}break}
   case'healaura':{e.abT.h-=dt;if(e.abT.h<=0){e.abT.h=1;for(const o of this.enemies)if(!o.dying&&Math.hypot(o.x-e.x,o.y-e.y)<95&&o.hp<o.maxhp){o.hp=Math.min(o.maxhp,o.hp+o.maxhp*.05);this.parts.push({x:o.x,y:o.y-16,vx:0,vy:-20,life:.6,max:.6,col:'#7aff9a',size:3,g:0})}}break}
   case'rage':if(!e.rage&&e.hp<e.maxhp*.5){e.rage=true;e.spdM*=1.4;this.floatTxt(e.x,e.y-26,'Fúria!','#ff6a3a')}break;
   case'regen':e.hp=Math.min(e.maxhp,e.hp+e.maxhp*.015*dt);break;
   case'guards':{e.abT.g-=dt;if(e.abT.g<=0){e.abT.g=9;for(let k=0;k<2;k++)this.spawn('e4',e.pi,e.hpm*.5,e.d-24-k*18);Sound.sfx('summon')}break}
  }
  if(def.boss)this.bossAbil(e,dt);
  // bloqueio
  if(e.blocker){const b=e.blocker;if(b.hp<=0||Math.hypot(b.x-e.x,b.y-e.y)>46)e.blocker=null;else{e.atkT-=dt;if(e.atkT<=0){e.atkT=1;b.hp-=def.atk*(this.D.hp>1.2?1.3:1)}}}
  // movimento
  let v=def.spd*this.D.spd*e.spdM;
  if(e.charge>0)v*=e.chargeMul||2;else{let sl=Math.max(e.slow,e.aura);if(def.imm.includes('ice'))sl=0;v*=(1-clamp(sl,0,.85))}
  e.aura=0;if(e.stun>0||e.blocker)v=0;
  e.d+=v*dt;e.anim+=dt*v/18;this.place(e);
  if(e.d>=e.path.total){e.dying=true;e.dt=1;e.gone=true;this.lives-=def.life;this.stats.leaks++;this.stats.livesLost+=def.life;this.waveDone++;this.shake=.4;Sound.sfx('leak');this.floatTxt(e.x-20,e.y-20,'-'+def.life+' vida'+(def.life>1?'s':''),'#ff5a5a');if(def.boss){this.bossAlive=null;Sound.music('battle',this.M.mus)}}
 }
 /* ---------- passo da simulação ---------- */
 step(dt){
  if(this.over)return;
  this.time+=dt;this.mclock+=dt;
  // fila de spawn
  if(this.queue.length){this.qt+=dt;while(this.queue.length&&this.queue[0].t<=this.qt){const q=this.queue.shift();this.spawn(q.key,q.pi,q.hpm)}}
  // buffs
  for(const t of this.towers){t.buffDmg=0;t.buffRange=0;t.buffRate=0}
  for(const s of this.towers){if(s.def.atk!=='aura'||s.dis>0)continue;const r=this.rng(s),st=s.st;
   if(st.slowAura){for(const e of this.enemies)if(!e.dying&&Math.hypot(e.x-s.cx,e.y-s.cy)<=r)e.aura=Math.max(e.aura,st.slowAura);if(st.freezePulse){s.pulse+=dt;if(s.pulse>8){s.pulse=0;for(const e of this.enemies)if(!e.dying&&Math.hypot(e.x-s.cx,e.y-s.cy)<=r)this.stunE(e,1);this.ring(s.cx,s.cy,r);Sound.sfx('ice')}}}
   else for(const t of this.towers){if(t===s)continue;if(Math.hypot(t.cx-s.cx,t.cy-s.cy)<=r){t.buffDmg+=st.buffDmg||0;t.buffRange+=st.buffRange||0;t.buffRate+=st.buffRate||0}}}
  // torres
  for(const t of this.towers){
   t.cd-=dt;t.rec=Math.max(0,t.rec-dt*4);t.fire=Math.max(0,(t.fire||0)-dt);if(t.dis>0){t.dis-=dt;continue}if(t.curse>0)t.curse-=dt;
   const a=t.st.atk;
   if(a==='heal'){t.timer+=dt;const h=t.st.heal;if(t.timer>=h.every){t.timer=0;if(this.lives<this.maxLives&&t.healed<h.cap){this.lives=Math.min(this.maxLives,this.lives+h.amt);t.healed++;this.floatTxt(t.cx,t.cy-50,'+'+h.amt+' vida','#7affb0');Sound.sfx('heal');this.burst(t.cx,t.cy-20,'#7affb0',14,70,.7,3)}}}
   else if(a==='mine'){t.timer+=dt;if(t.timer>=t.st.every){t.timer=0;this.gold+=t.st.gold;this.stats.gold+=t.st.gold;this.floatTxt(t.cx,t.cy-44,'+'+t.st.gold,'#ffd35a');Sound.sfx('coin');this.burst(t.cx,t.cy-24,'#ffd35a',6,50,.5,2)}}
   else if(a==='summon'){t.minions=this.allies.filter(x=>x.t===t&&x.hp>0);if(t.minions.length<t.st.max){t.sT-=dt;if(t.sT<=0){t.sT=t.st.every;this.spawnAlly(t)}}}
   else if(a!=='aura'){if(t.cd<=0)this.fireTower(t,dt)}
  }
  // aliados
  for(const a of this.allies){this.updateAlly(a,dt);if(a.hp<=0){a.dead=true;this.burst(a.x,a.y-6,a.kind==='skel'?'#7aff7a':'#fff0a0',8,60,.5,3);if(a.t.st.explode){for(const e of this.enemies)if(!e.dying&&Math.hypot(e.x-a.x,e.y-a.y)<60)this.hurt(e,40,'magic');this.burst(a.x,a.y,'#7aff7a',16,110,.5,3)}}}
  this.allies=this.allies.filter(a=>!a.dead);
  // inimigos
  for(const e of this.enemies)this.updateEnemy(e,dt);
  this.enemies=this.enemies.filter(e=>!(e.dying&&e.dt>.55)&&!(e.gone));
  // projéteis
  for(const p of this.proj){
   if(p.delay>0){p.delay-=dt;p.x=p.tw.cx;p.y=p.tw.cy-28;continue}
   if(this.headless&&!p.sent){p.sent=1;this.emitProj(p)}
   if(p.ground){p.t0+=dt;const k=Math.min(1,p.t0/p.dur);p.x=lerp(p.sx,p.tx,k);p.y=lerp(p.sy,p.ty,k);p.z=p.arc?Math.sin(k*Math.PI)*90:Math.sin(k*Math.PI)*10;p.ang=Math.atan2(p.ty-p.sy,p.tx-p.sx);
    if(p.kind==='fire'||p.kind==='crystal')this.trail(p.x,p.y-p.z,p.kind==='fire'?'#ff8a2a':'#8affff');
    if(k>=1){p.dead=true;if(p.splash)this.explode(p,p.tx,p.ty);else if(p.tgt&&!p.tgt.dying)this.hitProj(p,p.tgt)}}
   else{
    if(p.tgt&&!p.tgt.dying){p.tx=p.tgt.x;p.ty=p.tgt.y-8}
    const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),s=p.spd*dt;p.ang=Math.atan2(dy,dx);
    if(d<=s+5){p.dead=true;if(p.tgt&&!p.tgt.dying)this.hitProj(p,p.tgt)}else{p.x+=dx/d*s;p.y+=dy/d*s}
    if(p.kind==='bolt'||p.kind==='ice'||p.kind==='shadow')this.trail(p.x,p.y,p.kind==='ice'?'#8af0ff':p.kind==='shadow'?'#b060ff':p.tw.def.glow);
   }
  }
  this.proj=this.proj.filter(p=>!p.dead);
  // raios do céu
  for(const s of this.strikes){s.t-=dt;if(s.t<=0&&!s.done){s.done=1;s.flash=.3;for(const e of this.enemies){if(e.dying||e.phase>0)continue;if(Math.hypot(e.x-s.x,e.y-s.y)<=s.r)this.hurt(e,s.dmg,'magic',s.tw)}this.burst(s.x,s.y,'#fff6b0',22,150,.6,3);this.shake=Math.max(this.shake,.2);Sound.sfx('boom')}if(s.done)s.flash-=dt}
  this.strikes=this.strikes.filter(s=>!s.done||s.flash>0);
  if(!this.headless){for(const b of this.bolts)b.life-=dt;this.bolts=this.bolts.filter(b=>b.life>0);
  for(const p of this.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt}this.parts=this.parts.filter(p=>p.life>0);
  for(const f of this.floats){f.t-=dt*.8;f.y-=22*dt}this.floats=this.floats.filter(f=>f.t>0);}
  this.shake=Math.max(0,this.shake-dt*1.5);if(this.banner){this.banner.t-=dt;if(this.banner.t<=0)this.banner=null}
  // fim de wave / partida
  if(this.lives<=0){this.lives=0;this.over='lose';return}
  if(this.auto&&this.cleared&&!this.queue.length&&this.wave<this.N&&!this.over){this.autoT=(this.autoT||0)+dt;if(this.autoT>.9){this.autoT=0;this.startWave()}}
  const alive=this.enemies.some(e=>!e.dying);
  if(this.wave>0&&!this.queue.length&&!alive&&!this.cleared){
   this.cleared=true;this.wavesCleared=this.wave;
   if(this.wave>=this.N){this.over='win';return}
   const b=20+this.wave*4+this.mi*6;this.gold+=b;this.stats.gold+=b;this.floatTxt(MW/2,120,'Wave concluída! +'+b+' ouro','#ffd86b');Sound.sfx('coin');this.saveRun();
  }
 }
 remaining(){return this.queue.length+this.enemies.filter(e=>!e.dying).length}
 saveRun(){
  if(this.net||this.headless)return;Save.d.run={mi:this.mi,diff:this.diff,wave:this.wave,gold:this.gold,lives:this.lives,maxLives:this.maxLives,wc:this.wavesCleared,towers:this.towers.map(t=>({id:t.id,c:t.col,r:t.row,l:t.lvl,tg:t.tgt,inv:t.invested})),stats:this.stats};Save.save();
 }
 static resume(run){
  const g=new Game(run.mi,run.diff);g.wave=run.wave;g.gold=run.gold;g.lives=run.lives;g.maxLives=run.maxLives||g.maxLives;g.wavesCleared=run.wc||run.wave;g.cleared=true;Object.assign(g.stats,run.stats||{});
  run.towers.forEach(s=>{const t=g.buildTower(s.id,s.c,s.r,true,s.l,s.tg);if(t)t.invested=s.inv});g.sel=null;return g;
 }
 /* ---------- ambiente ---------- */
 mkEnv(init){
  const k=this.M.env,x=Math.random()*MW,y=init?Math.random()*MH:-10,o={x,y,ph:Math.random()*6.28,s:rnd(.6,1.4),vx:0,vy:0,c:'#fff',z:3};
  switch(k){
   case'leaves':o.vx=rnd(10,30);o.vy=rnd(20,40);o.c=pick(['#6aa83a','#a8883a','#4a8a2a','#c8a050']);break;
   case'petals':o.vx=rnd(10,25);o.vy=rnd(10,25);o.c=pick(['#ffb0c8','#fff','#ffe08a']);break;
   case'snow':o.vx=rnd(-10,15);o.vy=rnd(25,55);o.c='#fff';o.z=rnd(2,4);break;
   case'embers':o.y=init?o.y:MH+10;o.vx=rnd(-10,10);o.vy=-rnd(20,50);o.c=pick(['#ff8a2a','#ffd35a','#ff4a1a']);break;
   case'wisps':o.vx=rnd(-8,8);o.vy=rnd(-10,6);o.c='#9ac8ff';o.z=rnd(3,6);break;
   case'sand':o.vx=rnd(70,130);o.vy=rnd(-4,10);o.c='#e8cc90';o.z=2;break;
   case'fireflies':o.vx=rnd(-12,12);o.vy=rnd(-12,12);o.c='#e8ff7a';break;
   case'sparkles':o.vx=0;o.vy=rnd(-6,-2);o.c=pick(['#8afcff','#ff8ad8','#c0b0ff']);break;
   case'ash':o.vx=rnd(-6,12);o.vy=rnd(10,30);o.c=pick(['#aaa','#888','#ff7a3a']);break;
   case'void':o.y=init?o.y:MH+10;o.vx=rnd(-6,6);o.vy=-rnd(10,30);o.c=pick(['#c070ff','#8a40ff','#ff70e0']);break;
  }
  return o;
 }
 updateEnv(dt){
  for(let i=0;i<this.envp.length;i++){const o=this.envp[i];o.ph+=dt*1.5;o.x+=(o.vx+Math.sin(o.ph)*10)*dt;o.y+=o.vy*dt;
   if(this.M.env==='fireflies'||this.M.env==='wisps'||this.M.env==='sparkles'){o.vx+=rnd(-1,1)*dt*20;o.vy+=rnd(-1,1)*dt*20;o.vx=clamp(o.vx,-18,18);o.vy=clamp(o.vy,-18,18)}
   if(o.x>MW+20||o.x<-20||o.y>MH+20||o.y<-20){const n=this.mkEnv(false);if(['fireflies','wisps','sparkles'].includes(this.M.env)){n.x=Math.random()*MW;n.y=Math.random()*MH}else if(this.M.env==='sand'){n.x=-10;n.y=Math.random()*MH}else if(this.M.env!=='embers'&&this.M.env!=='void'){n.x=Math.random()*MW;n.y=-10}this.envp[i]=n}}
 }
 /* ---------- desenho ---------- */
 drawEnv(g,top){
  const k=this.M.env,tm=this.anim;
  if(!top)return;
  for(const o of this.envp){
   const tw=.5+.5*Math.sin(o.ph*2);
   if(k==='fireflies'){g.globalAlpha=.3+.7*tw;g.fillStyle=o.c;g.fillRect(o.x|0,o.y|0,3,3);glowAt(g,o.x,o.y,10,'#e8ff7a',.5*tw)}
   else if(k==='wisps'){glowAt(g,o.x,o.y,o.z*5,'#9ac8ff',.35+.3*tw)}
   else if(k==='sparkles'){g.globalAlpha=.2+.8*tw;g.fillStyle=o.c;g.fillRect((o.x|0)-1,o.y|0,5,2);g.fillRect(o.x|0,(o.y|0)-1,2,5)}
   else if(k==='embers'||k==='void'){g.globalAlpha=.4+.6*tw;g.fillStyle=o.c;g.fillRect(o.x|0,o.y|0,3,3);if(Math.random()<.02)glowAt(g,o.x,o.y,8,o.c,.5)}
   else if(k==='sand'){g.globalAlpha=.35;g.fillStyle=o.c;g.fillRect(o.x|0,o.y|0,14,2)}
   else{g.globalAlpha=k==='snow'?.9:.8;g.fillStyle=o.c;g.fillRect(o.x|0,o.y|0,o.z|0,o.z|0)}
  }
  g.globalAlpha=1;
  // névoa / sombras de nuvem
  if(['wisps','fireflies','void','sparkles','sand'].includes(k)){for(let i=0;i<3;i++){const x=((tm*8*(i+1)+i*480)%(MW+500))-250,y=140+i*190;const col=k==='sand'?'rgba(230,190,120,.10)':k==='void'?'rgba(120,60,200,.10)':k==='sparkles'?'rgba(100,100,220,.07)':'rgba(170,200,190,.11)';const gr=g.createRadialGradient(x,y,10,x,y,230);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-230,y-230,460,460)}}
  if(k==='petals'){for(let i=0;i<2;i++){const x=((tm*14+i*600)%(MW+400))-200,y=120+i*300;g.fillStyle='rgba(0,0,30,.07)';g.beginPath();g.ellipse(x,y,170,60,0,0,7);g.fill()}}
  if(k==='snow'){const gr=g.createLinearGradient(0,0,MW,0);const ph=(Math.sin(tm*.2)+1)/2;gr.addColorStop(0,'rgba(60,255,160,'+(.05+.05*ph)+')');gr.addColorStop(.5,'rgba(120,120,255,.04)');gr.addColorStop(1,'rgba(255,100,200,'+(.05+.04*(1-ph))+')');g.fillStyle=gr;g.fillRect(0,0,MW,150)}
  if(k==='embers'||k==='ash'){g.fillStyle='rgba(255,70,10,'+(.04+.03*Math.sin(tm*3))+')';g.fillRect(0,0,MW,MH)}
 }
 drawProj(g,p){
  if(p.delay>0)return;const x=p.x|0,y=(p.y-(p.z||0))|0;
  if(p.ground&&(p.z||0)>5){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(p.x,p.y+4,5,2.5,0,0,7);g.fill()}
  switch(p.kind){
   case'arrow':g.save();g.translate(x,y);g.rotate(p.ang);g.fillStyle='#9a7a4a';g.fillRect(-9,-1,12,2);g.fillStyle='#e8e8e8';g.fillRect(3,-2,4,4);g.fillStyle='#d8d8d8';g.fillRect(-10,-2,3,1);g.fillRect(-10,1,3,1);g.restore();break;
   case'bolt':case'arc':glowAt(g,x,y,14,p.tw?p.tw.def.glow:'#8ab0ff',.8);g.fillStyle='#fff';g.fillRect(x-2,y-2,5,5);break;
   case'fire':glowAt(g,x,y,16,'#ff8a2a',.9);g.fillStyle='#ffd35a';g.fillRect(x-3,y-3,7,7);g.fillStyle='#fff';g.fillRect(x-1,y-1,3,3);break;
   case'ice':glowAt(g,x,y,12,'#8af0ff',.8);g.save();g.translate(x,y);g.rotate(p.ang);g.fillStyle='#d8f8ff';g.fillRect(-5,-2,10,4);g.fillStyle='#8af0ff';g.fillRect(-2,-4,4,8);g.restore();break;
   case'ball':g.fillStyle='#22222a';g.fillRect(x-4,y-4,9,9);g.fillStyle='#55555e';g.fillRect(x-3,y-3,4,4);break;
   case'shell':g.fillStyle='#1a1a22';g.fillRect(x-5,y-5,11,11);g.fillStyle='#c06a20';g.fillRect(x-5,y-1,11,3);g.fillStyle='#666';g.fillRect(x-3,y-4,3,3);break;
   case'crystal':glowAt(g,x,y,16,'#8affff',.8);g.fillStyle='#cfffff';g.fillRect(x-3,y-5,6,10);g.fillStyle='#4adcdc';g.fillRect(x-1,y-5,3,10);break;
   case'shadow':glowAt(g,x,y,14,'#b060ff',.8);g.fillStyle='#2a0a4a';g.fillRect(x-3,y-3,7,7);g.fillStyle='#e0a0ff';g.fillRect(x-1,y-1,3,3);break;
   default:g.fillStyle='#fff';g.fillRect(x-2,y-2,5,5);
  }
 }
 draw(g,mouse){
  const tm=this.anim;g.save();
  if(this.shake>0&&Save.d.set.shake)g.translate(rnd(-1,1)*this.shake*8,rnd(-1,1)*this.shake*8);
  g.imageSmoothingEnabled=false;g.drawImage(this.bgd.c,0,0);
  // animações do cenário (portais, luzes)
  for(const a of this.bgd.anim)if(a.k==='gate'){glowAt(g,a.x,a.y,34+Math.sin(tm*3)*6,a.col,.45)}
  if(this.M.gd==='lava'||this.M.gd==='cave'||this.M.gd==='void'){}
  // destaque de seleção / construção
  const sel=this.sel;
  if(sel){const r=this.rng(sel);g.fillStyle='rgba(255,255,255,.08)';g.strokeStyle='rgba(255,230,140,.7)';g.lineWidth=2;g.beginPath();g.arc(sel.cx,sel.cy,r,0,7);g.fill();g.stroke();g.strokeStyle='#ffd86b';g.strokeRect(sel.x+2,sel.y+2,44,44);
   if(sel.st.minr){g.strokeStyle='rgba(255,100,80,.5)';g.setLineDash([5,5]);g.beginPath();g.arc(sel.cx,sel.cy,sel.st.minr*TILE,0,7);g.stroke();g.setLineDash([])}}
  if(Save.d.set.range&&!sel&&this.hover&&this.cellT.has(this.hover.c+','+this.hover.r)){const t=this.cellT.get(this.hover.c+','+this.hover.r);g.fillStyle='rgba(255,255,255,.06)';g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1;g.beginPath();g.arc(t.cx,t.cy,this.rng(t),0,7);g.fill();g.stroke()}
  // lista ordenada por Y
  const list=[];
  for(const t of this.towers)list.push([t.y+48,0,t]);
  for(const e of this.enemies)list.push([e.y+8,1,e]);
  for(const a of this.allies)list.push([a.y+8,2,a]);
  list.sort((a,b)=>a[0]-b[0]);
  for(const[,k,o]of list){
   if(k===0){drawTower(g,o,o.x,o.y,tm+o.uid);if(o.owner>=0&&this.players.length){const pl=this.players.find(p=>p.id===o.owner);if(pl){g.fillStyle='#000';g.fillRect(o.x+3,o.y+38,11,9);g.fillStyle=pl.color;g.fillRect(o.x+4,o.y+39,9,7)}}if(o.born<1){}
    if(o.lvl>=2){}}
   else if(k===1)this.drawEnemy(g,o,tm);
   else this.drawAlly(g,o,tm);
  }
  for(const s of this.strikes){if(!s.done){g.strokeStyle='rgba(255,246,176,'+(.5+.5*Math.sin(tm*30))+')';g.lineWidth=2;g.beginPath();g.arc(s.x,s.y,s.r*(.5+s.t),0,7);g.stroke()}else{const a=Math.max(0,s.flash/.3);g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,246,190,'+a*.9+')';g.fillRect(s.x-10*a-4,0,20*a+8,s.y);glowAt(g,s.x,s.y,s.r,'#fff6b0',a);g.restore()}}
  for(const p of this.proj)this.drawProj(g,p);
  for(const b of this.bolts){const a=b.life/b.max;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=b.col;g.globalAlpha=a;g.lineWidth=b.wide?5:3;g.beginPath();b.pts.forEach((p,i)=>{const jx=b.wide?0:rnd(-4,4),jy=b.wide?0:rnd(-4,4);i?g.lineTo(p[0]+jx,p[1]+jy):g.moveTo(p[0],p[1])});g.stroke();g.lineWidth=1;g.strokeStyle='#fff';g.stroke();g.restore()}
  for(const p of this.parts){const a=clamp(p.life/p.max,0,1);if(p.col==='ring'){g.strokeStyle='rgba(255,255,255,'+a*.6+')';g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,p.size*(1-a*.5),0,7);g.stroke();continue}g.globalAlpha=a;g.fillStyle=p.col;g.fillRect(p.x|0,p.y|0,p.size,p.size)}g.globalAlpha=1;
  this.drawEnv(g,true);
  g.font='bold 13px Georgia';g.textAlign='center';
  for(const f of this.floats){g.globalAlpha=clamp(f.t,0,1);g.fillStyle='#000';g.fillText(f.txt,f.x+1,f.y+1);g.fillStyle=f.col;g.fillText(f.txt,f.x,f.y)}g.globalAlpha=1;
  // fantasma de construção
  if(this.build!==null&&this.hover){const d=TOWERS[this.build],{c,r}=this.hover,ok=this.canBuild(c,r)&&this.gold>=this.cost(d);
   g.fillStyle=ok?'rgba(80,255,120,.28)':'rgba(255,60,60,.3)';g.fillRect(c*TILE,r*TILE,TILE,TILE);
   if(c>=0&&c<COLS&&r>=0&&r<ROWS){const st=statsFor(d,1),rr=st.range*(1+this.up('range')*.02)*TILE;g.strokeStyle=ok?'rgba(255,255,255,.8)':'rgba(255,90,90,.8)';g.fillStyle='rgba(255,255,255,.08)';g.lineWidth=2;g.beginPath();g.arc(c*TILE+24,r*TILE+24,rr,0,7);g.fill();g.stroke();
    g.globalAlpha=.75;drawTower(g,{def:d,lvl:1,face:1,rec:0,angle:-.5},c*TILE,r*TILE,tm);g.globalAlpha=1}}
  // chefão: barra
  const bo=this.enemies.find(e=>e.def.boss&&!e.dying);
  if(bo){const w=420,x=(MW-w)/2,y=10,pct=clamp(bo.hp/bo.maxhp,0,1);g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x-6,y-4,w+12,34);g.strokeStyle='#c9a050';g.lineWidth=2;g.strokeRect(x-6,y-4,w+12,34);g.fillStyle='#400';g.fillRect(x,y+14,w,10);
   const gr=g.createLinearGradient(0,y,0,y+24);gr.addColorStop(0,'#ff6a4a');gr.addColorStop(1,'#a01a10');g.fillStyle=gr;g.fillRect(x,y+14,w*pct,10);if(bo.shield>0){g.fillStyle='rgba(255,200,80,.9)';g.fillRect(x,y+11,w*clamp(bo.shield/bo.maxhp,0,1),3)}
   g.fillStyle='#ffd86b';g.font='bold 14px Georgia';g.fillText(bo.def.name.toUpperCase()+' — '+bo.def.title,MW/2,y+10)}
  if(this.banner){const a=clamp(this.banner.t,0,1);g.globalAlpha=a;g.font='900 40px Georgia';g.fillStyle='#000';g.fillText(this.banner.txt,MW/2+3,MH/2-60+3);g.fillStyle=this.banner.col;g.fillText(this.banner.txt,MW/2,MH/2-60);g.globalAlpha=1}
  // ambiente: tom
  g.restore();
 }
 drawEnemy(g,e,tm){
  const def=e.def,fr=((e.anim*2)|0)%2,dying=e.dying,S=16*def.k,sz=S*(def.boss?3:def.px)/def.k*(def.k===2?1:1);
  const scale=def.boss?3:def.px,w=S*scale/def.k*(def.k),dw=16*scale*(def.boss?2:1),sizePx=def.boss?96:16*scale*1.4;
  let img=enemySprite(def,fr,e.flash>0&&!dying);
  const fly=def.fly?Math.sin(e.anim*5)*3-8:0,x=e.x,y=e.y,ch=e.child?.7:1,wd=sizePx*ch;
  g.save();g.translate(x,y+fly);
  // sombra
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,-fly+2,wd*.32,wd*.1,0,0,7);g.fill();
  if(dying){const k=clamp(e.dt/.5,0,1);g.globalAlpha=1-k;g.rotate(k*.6*e.dir);g.translate(0,k*8);g.scale(1+k*.2,1-k*.5)}
  if(e.phase>0)g.globalAlpha=.4;
  g.scale(e.dir,1);if(e.stun>0&&!dying){g.translate(Math.sin(e.anim*40)*1.2,0)}
  g.imageSmoothingEnabled=false;
  if(def.boss&&def.o.aura)glowAt(g,0,-wd*.45,wd*.8,'#a040ff',.35);
  if(def.boss&&e.charge>0)glowAt(g,0,-wd*.4,wd*.7,'#ff6a2a',.35);
  if(e.slow>0&&e.slowT>0||e.aura>0){}
  g.drawImage(img,-wd/2,-wd+4+(fr&&!def.fly?-1:0),wd,wd);
  if(e.stun>0&&!dying){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(140,220,255,.4)';g.fillRect(-wd/2,-wd,wd,wd)}
  g.restore();
  if(!dying){
   if(e.slow>.05&&e.slowT>0){g.fillStyle='#8af0ff';g.fillRect(x-wd*.3,y-4,wd*.6,2)}
   if(e.shield>0){g.strokeStyle='rgba(255,210,100,.7)';g.lineWidth=2;g.beginPath();g.arc(x,y+fly-wd*.45,wd*.5,0,7);g.stroke()}
   if(e.hp<e.maxhp&&!def.boss){const bw=Math.max(22,wd*.7),bx=x-bw/2,by=y+fly-wd-4;g.fillStyle='#000';g.fillRect(bx-1,by-1,bw+2,6);g.fillStyle='#400';g.fillRect(bx,by,bw,4);g.fillStyle=e.hp/e.maxhp>.5?'#6ae04a':e.hp/e.maxhp>.25?'#e0c030':'#e04a3a';g.fillRect(bx,by,bw*clamp(e.hp/e.maxhp,0,1),4)}
  }
 }
 drawAlly(g,a,tm){
  const k=a.kind==='knight',fr=(Math.floor(a.anim*6))%2,x=a.x|0,y=a.y|0,f=a.face>0?1:-1;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,y+2,9,3,0,0,7);g.fill();
  const P=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+(f>0?dx:-dx-w),y+dy,w,h)};
  if(k){P(-4,-6,3,6+fr-1,'#8a8a98');P(1,-6,3,6-fr+1,'#8a8a98');P(-5,-16,10,10,'#d8d8e4');P(-5,-16,3,10,'#fff');P(-4,-23,8,7,'#d8d8e4');P(-3,-21,6,2,'#222');P(-1,-27,2,4,'#ffd35a');P(-8,-15,4,8,a.t.def.acc);P(4,-24,2,13,'#e8e8f4');P(3,-13,4,2,'#ffd35a')}
  else{P(-3,-5,2,5+fr,'#d8d4c0');P(1,-5,2,5+(1-fr),'#d8d4c0');P(-4,-13,8,8,'#d8d4c0');P(-3,-12,6,1,'#8a8a78');P(-3,-9,6,1,'#8a8a78');P(-4,-20,8,7,'#e8e4d2');P(-3,-18,2,2,'#7aff7a');P(1,-18,2,2,'#7aff7a');P(5,-16,1,10,'#9a7a4a');P(4,-18,3,3,'#cfd4e0')}
  const bw=18,pct=clamp(a.hp/a.max,0,1);g.fillStyle='#000';g.fillRect(x-bw/2-1,y-(k?32:26),bw+2,5);g.fillStyle='#46c0ff';g.fillRect(x-bw/2,y-(k?31:25),bw*pct,3);
 }
 /* ---------- rede: servidor autoritativo ---------- */
 ring(x,y,r){if(this.headless)this.fx.push(['ring',Math.round(x),Math.round(y),Math.round(r)]);else this.parts.push({x,y,vx:0,vy:0,life:.35,max:.35,col:'ring',size:r,g:0})}
 bolt(o){if(this.headless){if(this.fx.length<300)this.fx.push(['bolt',o.pts.map(p=>[Math.round(p[0]),Math.round(p[1])]),o.col,o.life,o.wide?1:0])}else this.bolts.push(o)}
 strike(e,i,t){const o={x:e.x,y:e.y,t:.35+i*.12,dmg:this.dmgOf(t),r:(t.st.splash||1)*TILE,tw:t,done:0};this.strikes.push(o);if(this.headless)this.fx.push(['st',Math.round(o.x),Math.round(o.y),Math.round(o.r),+o.t.toFixed(2)])}
 breathFx(x,y,ang,cone){if(this.headless){this.fx.push(['br',Math.round(x),Math.round(y),+ang.toFixed(2),cone]);return}for(let i=0;i<7;i++){const a=ang+rnd(-cone,cone),s=rnd(140,300);this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.2,.45),max:.45,col:pick(['#ff6a2a','#ffd35a','#ff9a3a','#fff0a0']),size:rnd(3,6),g:-20})}}
 emitProj(p){if(this.fx.length>=300)return;this.fx.push(['p',p.kind,Math.round(p.ground?p.sx:p.x),Math.round(p.ground?p.sy:p.y),Math.round(p.tx),Math.round(p.ty),Math.round(p.spd),p.ground?+p.dur.toFixed(2):0,p.arc?1:0,(p.tgt&&p.tgt.uid)||0,p.tw.id])}
 /* estado completo (servidor -> clientes) */
 snapshot(){
  const R2=v=>Math.round(v*100)/100,seen={},fx=[];
  for(const f of this.fx){if(f[0]==='s'){if(seen[f[1]])continue;seen[f[1]]=1}fx.push(f)}this.fx=[];
  return{k:'s',g:Math.floor(this.gold),l:this.lives,mx:this.maxLives,w:this.wave,rem:this.remaining(),wt:this.waveTotal,wd:this.waveDone,sp:this.speed,pz:this.paused?1:0,ov:this.over||0,au:this.auto?1:0,wc:this.wavesCleared,qn:this.queue.length,
   bn:this.banner?[this.banner.txt,this.banner.col,R2(this.banner.t)]:0,sh:R2(this.shake),
   s:[this.stats.kills,this.stats.leaks,this.stats.gold,this.stats.built,this.stats.bosses,this.stats.upgrades,this.stats.livesLost],
   T:this.towers.map(t=>[t.uid,t.id,t.col,t.row,t.lvl,R2(t.angle),t.face,R2(t.rec),t.dis>0?1:0,t.invested,t.tgt,t.owner,R2(t.buffDmg),R2(t.buffRange),R2(t.buffRate),t.curse>0?1:0]),
   E:this.enemies.map(e=>[e.uid,KEYI[e.key],Math.round(e.x*10)/10,Math.round(e.y*10)/10,Math.round(e.hp),Math.round(e.maxhp),e.dir,0,(e.dying?1:0)|(e.stun>0?2:0)|(e.phase>0?4:0)|(e.child?8:0)|(e.slow>.05&&e.slowT>0?16:0)|(e.charge>0?32:0)|(e.flash>0?64:0)|(e.poison?128:0)|(e.burn?256:0),Math.round(e.shield)]),
   A:this.allies.map(a=>[a.uid,a.kind==='skel'?0:1,Math.round(a.x),Math.round(a.y),Math.round(a.hp),a.max,a.face,a.t.id]),
   fx};
 }
 applySnap(s){
  this.gold=s.g;this.lives=s.l;this.maxLives=s.mx;this.wave=s.w;this.speed=s.sp;this.paused=!!s.pz;this.rem=s.rem;this.waveTotal=s.wt;this.waveDone=s.wd;this.queue=new Array(s.qn);this.auto=!!s.au;this.wavesCleared=s.wc;
  const st=s.s;this.stats={kills:st[0],leaks:st[1],gold:st[2],built:st[3],bosses:st[4],upgrades:st[5],livesLost:st[6]};
  this.shake=Math.max(this.shake,s.sh||0);
  if(s.bn&&s.bn[0]!==this._bn){this._bn=s.bn[0];this.banner={txt:s.bn[0],col:s.bn[1],t:s.bn[2]}}
  const old=new Map(this.towers.map(t=>[t.uid,t]));this.cellT.clear();
  this.towers=s.T.map(a=>{let t=old.get(a[0]);const def=TOWERS[a[1]];
   if(!t||t.id!==a[1]){t={uid:a[0],def,id:a[1],col:a[2],row:a[3],x:a[2]*TILE,y:a[3]*TILE,cx:a[2]*TILE+24,cy:a[3]*TILE+24,minions:[],lvl:0,rec:0,face:1,angle:-.5,curse:0,dis:0}}
   if(t.lvl!==a[4]){t.lvl=a[4];t.st=statsFor(def,t.lvl)}
   t.angle=a[5];t.face=a[6];if(a[7]>t.rec)t.rec=a[7];t.dis=a[8]?1:0;t.invested=a[9];t.tgt=a[10];t.owner=a[11];t.buffDmg=a[12];t.buffRange=a[13];t.buffRate=a[14];t.curse=a[15];
   this.cellT.set(t.col+','+t.row,t);return t});
  if(this.sel&&!this.towers.includes(this.sel))this.sel=this.towers.find(t=>t.uid===this.sel.uid)||null;
  if(this.pendingSel){const t=this.cellT.get(this.pendingSel.c+','+this.pendingSel.r);if(t&&t.owner===this.mySlot){this.sel=t;this.pendingSel=null}else if(Date.now()-this.pendingSel.ts>3000)this.pendingSel=null}
  const oe=new Map(this.enemies.map(e=>[e.uid,e]));
  this.enemies=s.E.map(a=>{let e=oe.get(a[0]);const fl=a[8];
   if(!e){const def=ED[KEYS[a[1]]];e={uid:a[0],key:def.key,def,x:a[2],y:a[3],anim:Math.random()*2,dt:0,abT:{},slowT:0,slow:0,aura:0,flash:0,charge:0,phase:0,stun:0,shield:0,dying:false,dir:1}}
   e.tx=a[2];e.ty=a[3];e.hp=a[4];e.maxhp=a[5];e.dir=a[6];
   const dy=!!(fl&1);if(dy&&!e.dying)e.dt=0;e.dying=dy;e.stun=fl&2?1:0;e.phase=fl&4?1:0;e.child=!!(fl&8);e.slow=fl&16?.5:0;e.slowT=fl&16?1:0;e.charge=fl&32?1:0;if(fl&64)e.flash=.07;e.poisoned=!!(fl&128);e.burning=!!(fl&256);e.shield=a[9];
   return e});
  const oa=new Map(this.allies.map(a=>[a.uid,a]));
  this.allies=s.A.map(a=>{let o=oa.get(a[0]);if(!o)o={uid:a[0],x:a[2],y:a[3],anim:Math.random()*3};o.kind=a[1]?'knight':'skel';o.tx=a[2];o.ty=a[3];o.hp=a[4];o.max=a[5];o.face=a[6];o.t={def:TOWERS[a[7]]};return o});
  if(s.ov&&!this.over)this.over=s.ov;
  if(s.fx&&s.fx.length)this.applyFx(s.fx);
 }
 applyFx(list){
  for(const f of list){switch(f[0]){
   case'b':this.burst(f[1],f[2],f[3],f[4],f[5],f[6],f[7]);break;
   case'f':this.floatTxt(f[1],f[2],f[3],f[4]);break;
   case'ring':this.ring(f[1],f[2],f[3]);break;
   case'bolt':this.bolts.push({pts:f[1],col:f[2],life:f[3],max:f[3],wide:f[4]});break;
   case'st':this.strikes.push({x:f[1],y:f[2],r:f[3],t:f[4],done:0,vis:1});break;
   case'br':this.breathFx(f[1],f[2],f[3],f[4]);break;
   case'p':{const gr=f[7]>0;if(this.proj.length<160)this.proj.push({x:f[2],y:f[3],sx:f[2],sy:f[3],tx:f[4],ty:f[5],spd:f[6],ground:gr,dur:f[7]||1,arc:!!f[8],t0:0,kind:f[1],ang:Math.atan2(f[5]-f[3],f[4]-f[2]),z:0,delay:0,tgtUid:f[9],tw:{def:TOWERS[f[10]]},vis:1,life:0});break}
   case's':if(curScr==='game')Sound.sfx(f[1]);break;
   case'm':Sound.music(f[1],this.M.mus);break;
  }}
 }
 /* animação local entre snapshots (somente cliente remoto) */
 stepVisual(dt){
  this.anim+=dt;const k=1-Math.exp(-dt*16);
  for(const e of this.enemies){
   if(e.dying){e.dt+=dt;continue}
   if(Math.abs(e.tx-e.x)+Math.abs(e.ty-e.y)>140){e.x=e.tx;e.y=e.ty}else{e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k}
   if(!e.stun)e.anim+=dt*(1.6+(Math.hypot(e.tx-e.x,e.ty-e.y)>.6?1.4:0));
   e.flash=Math.max(0,(e.flash||0)-dt);
   if((e.poisoned||e.burning)&&Math.random()<dt*7&&this.parts.length<650)this.parts.push({x:e.x+rnd(-6,6),y:e.y-10,vx:0,vy:-16,life:.45,max:.45,col:e.burning?pick(['#ff6a2a','#ffd35a']):'#7cff4a',size:e.burning?3:2,g:0});
  }
  for(const a of this.allies){a.x+=(a.tx-a.x)*k;a.y+=(a.ty-a.y)*k;a.anim+=dt}
  for(const t of this.towers)t.rec=Math.max(0,t.rec-dt*4);
  for(const p of this.proj){p.life+=dt;
   if(p.ground){p.t0+=dt;const kk=Math.min(1,p.t0/p.dur);p.x=lerp(p.sx,p.tx,kk);p.y=lerp(p.sy,p.ty,kk);p.z=p.arc?Math.sin(kk*Math.PI)*90:Math.sin(kk*Math.PI)*10;p.ang=Math.atan2(p.ty-p.sy,p.tx-p.sx);if(p.kind==='fire'||p.kind==='crystal')this.trail(p.x,p.y-p.z,p.kind==='fire'?'#ff8a2a':'#8affff');if(kk>=1)p.dead=true}
   else{let tx=p.tx,ty=p.ty;if(p.tgtUid){const e=this.enemies.find(q=>q.uid===p.tgtUid);if(e&&!e.dying){tx=e.x;ty=e.y-8;p.tx=tx;p.ty=ty}}
    const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy),sp=p.spd*dt;p.ang=Math.atan2(dy,dx);if(d<=sp+5||p.life>3)p.dead=true;else{p.x+=dx/d*sp;p.y+=dy/d*sp}
    if(p.kind==='bolt'||p.kind==='ice'||p.kind==='shadow')this.trail(p.x,p.y,p.kind==='ice'?'#8af0ff':p.kind==='shadow'?'#b060ff':p.tw.def.glow)}}
  this.proj=this.proj.filter(p=>!p.dead);
  for(const s of this.strikes){s.t-=dt;if(s.t<=0&&!s.done){s.done=1;s.flash=.3}if(s.done)s.flash-=dt}
  this.strikes=this.strikes.filter(s=>!s.done||s.flash>0);
  for(const b of this.bolts)b.life-=dt;this.bolts=this.bolts.filter(b=>b.life>0);
  for(const p of this.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt}this.parts=this.parts.filter(p=>p.life>0);
  for(const f of this.floats){f.t-=dt*.8;f.y-=22*dt}this.floats=this.floats.filter(f=>f.t>0);
  this.shake=Math.max(0,this.shake-dt*1.5);if(this.banner){this.banner.t-=dt;if(this.banner.t<=0)this.banner=null}
 }
}

module.exports={Game,MAPS,TOWERS,ENEMIES,BOSSES,DIFFS,ED,KEYS,TGT,statsFor,TILE,COLS,ROWS,MW,MH,Sound,Save,PROTOCOL,VERSION,getMapBG,RARITY,RAR_LISTS,TOWER_RAR,PLAYER_COLORS,CATS};
