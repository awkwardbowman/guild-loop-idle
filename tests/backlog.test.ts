import {legacyEnvelope} from './legacy-save.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,advance,startDay,setQueue,dungeonWaiting,memberActivities,moveMember,recall} from '../src/engine.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {plotEntries} from '../src/story.ts';
import {recordEvent} from '../src/progression.ts';
import {equip} from '../src/engine.ts';
import {RESOURCES} from '../src/resources.ts';
const opening=()=>{let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;};
test('B01 assignments replace the destination, reject duplicates and display actual roster order',()=>{
 let g=opening();recordEvent(g.progression,'archive_discovered',{day:1,time:0});
 assert.deepEqual(dungeonWaiting(g,'wood').map(m=>m.name),['Arya','Clyde']);
 g=moveMember(g,g.members[1].id,-1);assert.deepEqual(dungeonWaiting(g,'wood').map(m=>m.name),['Clyde','Arya']);
 const id=g.members[0].id;assert.equal(setQueue(g,id,[...g.members[0].queue,...g.members[0].queue]),g);
 g=setQueue(g,id,[{dungeonId:'ruins',maxDepth:15}]);assert.equal(dungeonWaiting(g,'wood').length,1);assert.equal(dungeonWaiting(g,'ruins').length,1);
 g=startDay(g);assert.equal(dungeonWaiting(g,'wood').length+dungeonWaiting(g,'ruins').length,0);assert.equal(memberActivities(g).idle,0);
});
test('B02 history is per member and dungeon, includes recall depth/reason, and survives reload',()=>{
 let g=advance(startDay(opening()),15);const id=g.active[0].memberId;
 g=recall(g,id);const member=g.members.find(m=>m.id===id)!;
 assert.equal(member.dungeonHistory.wood.lastReturn?.reason,'Recalled');assert.equal(member.dungeonHistory.wood.bestRoom,0);
 assert.equal(member.dungeonHistory.ruins,undefined);assert.deepEqual(g.members[1].dungeonHistory,{});
 assert.deepEqual(parseSave(exportSave(g)),g);
});
test('B03 v7 migration retains the next planned destination, active snapshot, stats, gear and RNG',()=>{
 const original=advance(startDay(opening()),16),raw=JSON.parse(exportSave(original));raw.version=raw.game.version=7;
 const member=raw.game.members[0];member.queue=[{dungeonId:'wood',maxDepth:1},{dungeonId:'ruins',maxDepth:15}];member.queueIndex=1;
 for(const m of raw.game.members){delete m.rarity;delete m.dungeonHistory;}
 const g=parseSave(JSON.stringify(legacyEnvelope(raw)));assert.deepEqual(g.members[0].queue,[{dungeonId:'ruins'}]);assert.deepEqual(g.active.map(r=>[r.memberId,r.floor,r.progress,r.loot,r.chips,r.travelRemaining]),original.active.map(r=>[r.memberId,r.floor,r.progress,r.loot,r.chips,r.travelRemaining]));assert.deepEqual(g.members[0].stats,original.members[0].stats);assert.equal(g.seed,original.seed);assert.equal(g.members[0].rarity,0);
 assert.deepEqual(parseSave(exportSave(g)),g);
});
test('B04 malformed current rarity, tier, history and multi-assignment saves reject',()=>{
 for(const mutate of [(g:any)=>g.members[0].rarity=9,(g:any)=>g.members[0].tier=1.5,(g:any)=>g.members[0].dungeonHistory={unknown:{bestRoom:1,lastReturn:null}},(g:any)=>g.members[0].queue.push(g.members[0].queue[0])]){const raw=JSON.parse(exportSave(opening()));mutate(raw.game);assert.throws(()=>parseSave(JSON.stringify(legacyEnvelope(raw))));}
 const g=opening();g.members[0].tier=999;assert.equal(parseSave(exportSave(g)).members[0].tier,999);
});
test('B05 Common T1 friends retain starting stats and equipment access; materials carry separate tiers',()=>{
 let g=opening();g.equipment.unlocked=['leather_armor','leather_pack'];for(const m of g.members){assert.equal(m.rarity,0);assert.equal(m.tier,1);g=equip(g,m.id,'leather_armor');assert.deepEqual(g.members.find(a=>a.id===m.id)!.equipped,['leather_armor']);}
 assert.equal(RESOURCES.find(r=>r.id==='hide')!.tier,2);assert.equal(RESOURCES.find(r=>r.id==='herb')!.tier,3);
});
test('B06 plot uses descending day/time and deterministic ties without changing stored events',()=>{
 const g=opening();g.day=2;g.elapsed=10;recordEvent(g.progression,'archive_discovered',{day:2,time:10});const before=structuredClone(g.progression);const entries=plotEntries(g.progression);assert.equal(entries[0].id,'archive_discovered');assert.equal(entries.at(-1)!.id,'history_remembered');assert.deepEqual(g.progression,before);assert.deepEqual(plotEntries(parseSave(exportSave(g)).progression),entries);
});
