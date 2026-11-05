import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialGame, startDay, advance, changePriority, acceptCandidate, buyUpgrade, setQueue, moveMember } from '../src/engine.ts';
import { exportSave, parseSave } from '../src/persistence.ts';
import { STATS } from '../src/content.ts';
test('E01 full game: grow, loot, recruit, upgrade, queue, save, continue for 20 days',()=>{
 let g=initialGame(); const original=g.members[0].stats.might.max;
 g=changePriority(g,'infrastructure');
 for(let day=0;day<3;day++)g=advance(startDay(g),60);
 assert.equal(g.stats.clears,6); assert.ok(g.guild.gold>=24); assert.ok(g.guild.materials>=2);
 g=buyUpgrade(g,'slots');assert.equal(g.guild.slots,3);
 g=moveMember(g,'member-3',-1);g=moveMember(g,'member-3',-1);
 g=changePriority(g,'recruitment');g=advance(startDay(g),60);assert.ok(g.candidate);
 g=acceptCandidate(g);assert.equal(g.members.length,4);
 g=setQueue(g,g.members[0].id,['wood','wood']);g=moveMember(g,g.members[3].id,-1);
 g=advance(startDay(g),5);const restored=parseSave(exportSave(g));assert.deepEqual(advance(restored,55),advance(g,55));g=advance(restored,55);
 for(let day=5;day<20;day++)g=advance(startDay(g),60);
 assert.equal(g.day,21);assert.ok(g.members.find(m=>m.id==='member-1')!.stats.might.max>original);assert.ok(g.stats.clears>20);assert.ok(g.stats.retreats>0);assert.ok(Object.keys(g.inventory).length>0);
 for(const m of g.members)for(const s of STATS){assert.ok(m.stats[s].current>=0);assert.ok(m.stats[s].max<=m.stats[s].affinity);}
 assert.ok(g.guild.gear>=0&&g.guild.gear<=g.guild.gearCap);assert.equal(g.active.length,0);
 console.log('20-day playthrough:',JSON.stringify({day:g.day,clears:g.stats.clears,retreats:g.stats.retreats,gold:g.guild.gold,members:g.members.length,might:g.members[0].stats.might.max}));
});
test('E02 deterministic large-step and one-second stepping agree',()=>{const g=startDay(initialGame());let stepped=g;for(let i=0;i<60;i++)stepped=advance(stepped,1);assert.deepEqual(advance(g,60),stepped);});
