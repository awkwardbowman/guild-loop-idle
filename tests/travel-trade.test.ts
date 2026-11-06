import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sandboxGame,initialGame,completeStoryAction,startDay,advance,recall,sellResource,returnETA,toggleMember,setQueue} from '../src/engine.ts';
import {parseSave,exportSave} from '../src/persistence.ts';
import {LOCATIONS,travelSeconds} from '../src/locations.ts';
import {DUNGEONS,STATS,STAT_INFO} from '../src/content.ts';
function expedition(){const g=sandboxGame();for(const member of g.members)member.enabled=false;g.members[0].enabled=true;for(const stat of STATS)g.members[0].stats[stat].current=g.members[0].stats[stat].max=50;return startDay(g);}
function trading(){let g=advance(expedition(),40);g=toggleMember(g,g.members[0].id);g.inventory={timber:10,herb:4};return g;}
test('T01 local trip takes 15 seconds each way; no work, payment or recovery before its stage',()=>{
 let g=expedition();const seed=g.seed,max=g.members[0].stats.strength.max;
 assert.equal(g.homeLocationId,'emberveil');assert.equal(g.active[0].destinationLocationId,'catacombs');assert.equal(returnETA(g,g.active[0]),40);
 g=advance(g,14);assert.equal(g.active[0].stage,'outbound');assert.equal(g.active[0].travelRemaining,1);assert.equal(g.active[0].elapsed,0);assert.equal(g.seed,seed);assert.equal(g.stats.clears,0);
 g=advance(g,1);assert.equal(g.active[0].stage,'exploring');assert.equal(g.active[0].progress,0);
 g=advance(g,10);assert.equal(g.active[0].stage,'returning');assert.equal(g.active[0].travelRemaining,15);assert.equal(g.stats.clears,1);assert.equal(g.members[0].stats.strength.max,max);assert.equal(g.guild.chips,12);assert.deepEqual(g.inventory,{});assert.equal(g.members[0].cooldown,0);
 g=advance(g,14);assert.equal(g.active[0].travelRemaining,1);assert.equal(g.members[0].runs,0);
 g=advance(g,1);assert.equal(g.active.length,0);assert.equal(g.guild.chips,20);assert.equal(g.members[0].runs,1);assert.equal(g.members[0].cooldown,12);assert.ok(g.members[0].stats.strength.max>max);
 assert.equal(Object.values(g.inventory).reduce((a,b)=>a+b,0),1);
});
test('T02 outbound and exploring recalls travel home once; returning cannot restart or bypass the delay',()=>{
 for(const elapsed of [5,20]){let g=advance(expedition(),elapsed);g=recall(g,g.members[0].id);assert.equal(g.active[0].stage,'returning');assert.equal(g.active[0].travelRemaining,15);assert.equal(recall(g,g.members[0].id),g);g=advance(g,15);assert.equal(g.members[0].runs,1);assert.equal(g.guild.chips,12);}
});
test('T03 exhausted member can save while returning; training and rewards stay unbanked until arrival',()=>{
 let g=expedition();g.members[0].stats.strength.current=3;g=advance(g,18);assert.equal(g.active[0].stage,'returning');assert.equal(g.members[0].stats.strength.current,0);assert.equal(g.stats.retreats,0);
 const loaded=parseSave(exportSave(g));assert.deepEqual(loaded,g);g=advance(loaded,15);assert.equal(g.stats.retreats,1);assert.equal(g.members[0].cooldown,12);assert.deepEqual(parseSave(exportSave(g)),g);
});
test('T04 route destinations and durations are snapshotted while future assignments change',()=>{
 let g=expedition();const original=structuredClone(g.active[0]);g.progression.completed.archive_discovered={day:1,time:0};g=setQueue(g,g.members[0].id,[{dungeonId:'ruins',maxDepth:1}]);assert.deepEqual(g.active[0],original);
 g=advance(g,52);assert.equal(g.active[0].destinationLocationId,'old_quarter');assert.equal(g.active[0].outboundSeconds,15);assert.equal(g.active[0].returnSeconds,15);
 for(const dungeon of DUNGEONS)assert.ok(LOCATIONS.some(location=>location.id===dungeon.locationId));assert.equal(travelSeconds('emberveil','emberveil'),0);
});
test('T05 travel, exploration and return saves resume deterministically across midnight',()=>{
 for(const elapsed of [7,19,30]){let g=advance(expedition(),elapsed);g.elapsed=86395;const loaded=parseSave(exportSave(g));assert.deepEqual(advance(loaded,30),advance(g,30));}
});
test('T06 sale commits items immediately, pays at exactly 15 seconds, and never pays twice',()=>{
 let g=trading();const chips=g.guild.chips;g=sellResource(g,'timber',6);assert.equal(g.inventory.timber,4);assert.equal(g.guild.chips,chips);assert.equal(g.trades[0].remaining,15);assert.equal(sellResource(g,'timber',5),g);
 g=advance(g,14);assert.equal(g.guild.chips,chips);assert.equal(g.trades[0].remaining,1);g=advance(g,1);assert.equal(g.guild.chips,chips+6);assert.equal(g.trades.length,0);g=advance(g,30);assert.equal(g.guild.chips,chips+6);
});
test('T07 concurrent trades survive saves; invalid quantities and unavailable resources do nothing',()=>{
 let g=trading();for(const quantity of [0,-1,.5,Infinity,11])assert.equal(sellResource(g,'timber',quantity),g);assert.equal(sellResource(g,'chips',1),g);assert.equal(sellResource(initialGame(),'timber',1).trades.length,0);
 g=sellResource(g,'timber',2);g=advance(g,5);g=sellResource(g,'herb',3);assert.equal(g.trades.length,2);const loaded=parseSave(exportSave(g));assert.deepEqual(advance(loaded,15),advance(g,15));g=advance(g,10);assert.equal(g.trades.length,1);assert.equal(g.trades[0].remaining,5);
});
test('T08 imports reject broken routes, timers, duplicate trade IDs and depleted exploring members',()=>{
 const mutations=[(g:any)=>g.active[0].stage='teleporting',(g:any)=>g.active[0].destinationLocationId='nowhere',(g:any)=>g.active[0].travelRemaining=-1,(g:any)=>g.active[0].travelRemaining=16,(g:any)=>g.homeLocationId='nowhere',(g:any)=>g.active[0].stage='returning'];
 for(const mutate of mutations){const raw=JSON.parse(exportSave(expedition()));mutate(raw.game);assert.throws(()=>parseSave(JSON.stringify(raw)));}
 let g=advance(expedition(),15);for(const stat of STATS.filter(stat=>STAT_INFO[stat].consumable)){const raw=JSON.parse(exportSave(g));raw.game.members[0].stats[stat].current=0;assert.throws(()=>parseSave(JSON.stringify(raw)));}
 g=sellResource(trading(),'timber',1);for(const mutate of [(g:any)=>g.trades[0].remaining=0,(g:any)=>g.trades.push(g.trades[0]),(g:any)=>g.trades[0].resourceId='chips']){const raw=JSON.parse(exportSave(g));mutate(raw.game);assert.throws(()=>parseSave(JSON.stringify(raw)));}
});
test('T09 v3 active outings migrate in place without replaying outbound travel or losing carried loot',()=>{
 const g=advance(expedition(),24),raw=JSON.parse(exportSave(g));raw.version=raw.game.version=3;delete raw.game.homeLocationId;delete raw.game.trades;delete raw.game.nextTradeId;
 for(const run of raw.game.active)for(const key of ['stage','originLocationId','destinationLocationId','travelRemaining','outboundSeconds','returnSeconds','outcome'])delete run[key];
 const migrated=parseSave(JSON.stringify(raw));assert.equal(migrated.active[0].stage,'exploring');assert.equal(migrated.active[0].progress,g.active[0].progress);assert.equal(migrated.seed,g.seed);assert.deepEqual(migrated.active[0].loot,g.active[0].loot);assert.equal(migrated.active[0].returnSeconds,15);if(g.candidate)g.candidate.origin='legacy';assert.deepEqual(advance(migrated,16),advance({...g,active:g.active.map(run=>({...run,outboundSeconds:0}))},16));
});
