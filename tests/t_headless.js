const C=require('/tmp/eternia/dist/server/game-core.js');
const g=new C.Game(0,'normal',{headless:true,fair:true,coop:2});C.Sound.game=g;
g.gold=3000;let n=0;
const cells=[];for(let r=0;r<13;r++)for(let c=0;c<20;c++)if(g.canBuild(c,r))cells.push([c,r]);
[0,5,10,6,7,8,2,11].forEach((id,i)=>{const [c,r]=cells.find(([c,r])=>g.canBuild(c,r)&&[1,2,3].some(d=>g.bgd.pc.has((c+d)+','+r)||g.bgd.pc.has(c+','+(r+d))));g.buildTower(id,c,r,false,1,undefined,i%3)});
let maxSnap=0,tot=0,snaps=0,fxc={};const t0=Date.now();
for(let tick=0;tick<60*60*12&&!g.over;tick++){
 if(tick%60===0&&!g.queue.length&&g.wave<g.N&&!g.enemies.some(e=>!e.dying))g.startWave();
 if(tick%60===0&&g.gold>200){const t=g.towers.find(t=>t.lvl<3);if(t)g.upgradeTower(t)}
 g.step(1/60);
 if(tick%4===0){const s=g.snapshot();const j=JSON.stringify(s);maxSnap=Math.max(maxSnap,j.length);tot+=j.length;snaps++;s.fx.forEach(f=>fxc[f[0]]=(fxc[f[0]]||0)+1)}
}
console.log('over',g.over,'wave',g.wave+'/'+g.N,'lives',g.lives,'kills',g.stats.kills,'ms',Date.now()-t0,'sim minutes',(g.time/60).toFixed(1));
console.log('snap avg',Math.round(tot/snaps),'max',maxSnap,'bytes; fx kinds',JSON.stringify(fxc));
// paridade de mapas: lista blocked por mapa
const out={};for(let i=0;i<10;i++){const b=C.getMapBG(i);out[i]=[...b.blocked].sort().join(';')+'|'+[...b.pc].sort().length}
require('fs').writeFileSync('/tmp/eternia/blocked_server.json',JSON.stringify(out));
console.log('blocked per map',Object.values(out).map(v=>v.split('|')[0].split(';').filter(Boolean).length).join(','));
