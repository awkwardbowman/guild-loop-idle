import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,advance,setQueue,recall} from '../src/engine.ts';
import {isDungeonEvent,visibleReport} from '../src/sections.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {rarity,Rarity,rarityAt} from '../src/rarity.ts';
import {RESOURCES} from '../src/resources.ts';
import {roomDungeon} from '../src/rooms.ts';
import {ACTIVITY_VISUALS,STAT_VISUALS} from '../src/stat-presentation.ts';
import {SPECIALIZATIONS,STATS,ACTIVITY_GROUPS} from '../src/attributes.ts';
function opening(seed=73129){let g=initialGame(seed);for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;}
test('CL01 queue changes log additions/removals, not repeated runs or cap edits',()=>{
 let g=opening();const member=g.members[0],count=g.reports.filter(r=>isDungeonEvent(r.reason)).length;
 g=setQueue(g,member.id,[{dungeonId:'wood',maxDepth:2}]);assert.equal(g.reports.filter(r=>isDungeonEvent(r.reason)).length,count);
 const unchanged=setQueue(g,member.id,[{dungeonId:'wood',maxDepth:2},{dungeonId:'wood',maxDepth:1}]);assert.equal(unchanged,g);
 g=setQueue(g,member.id,[]);assert.equal(g.reports.filter(r=>r.reason==='Dungeon assignment removed').length,1);
});
test('CL02 routine dungeon chatter is suppressed; boss/treasure events retain validated drops',()=>{
 let g=advance(opening(),800);const events=g.reports.filter(r=>r.section==='Activities');assert.ok(events.length>0);assert.ok(events.every(r=>isDungeonEvent(r.reason)));
 const rewards=events.filter(r=>r.reason==='Boss room beaten'||r.reason==='Treasure room cleared');assert.ok(rewards.length>0);assert.ok(rewards.every(r=>r.drops&&Object.keys(r.drops).every(id=>RESOURCES.some(item=>item.id===id))&&r.rarity===0));
 assert.deepEqual(parseSave(exportSave(g)),g);
 const bad=JSON.parse(exportSave(g));bad.game.reports[0].drops={unknown:4};assert.throws(()=>parseSave(JSON.stringify(bad)),/drops/);
 const corrupt=JSON.parse(exportSave(g));corrupt.game.reports[0].rarity=999;assert.throws(()=>parseSave(JSON.stringify(corrupt)),/rarity/);
});
test('CL03 exhausted dungeons produce one failure, while manual recall produces no failure',()=>{
 let g=opening();g=advance(g,1);g.active[0].endurance.current=0;g=advance(g,14);g.active[0].generated={id:'crypt_guardian',index:0,work:0,attempts:0};g=advance(g,16);assert.equal(g.reports.filter(r=>r.reason==='Dungeon failed').length,1);
 let h=advance(opening(),1);h=recall(h,h.active[0].memberId);h=advance(h,15);assert.equal(h.reports.filter(r=>r.reason==='Dungeon failed').length,0);
 assert.equal(visibleReport({member:'Arya',reason:'Room entered',section:'Activities'}),false);assert.equal(visibleReport({member:'Arya',reason:'Retreated',section:'Activities'}),false);
});
test('CL04 every attribute has a shared activity shape and parent color; rarity is independent of drop tuning',()=>{
 assert.equal(new Set(STATS.map(stat=>STAT_VISUALS[stat].color)).size,9);assert.equal(new Set(ACTIVITY_GROUPS.map(group=>ACTIVITY_VISUALS[group.id].path)).size,9);
 for(const attribute of SPECIALIZATIONS){assert.ok(ACTIVITY_VISUALS[attribute.group]);assert.ok(STAT_VISUALS[attribute.parent]);}
 assert.deepEqual(rarity.map(item=>item.color),['#FDFEFE','#27AE60','#2471A3','#7D3C98','#F1C40F','#D35400','#7B241C','#B3CA1F','#DC2367']);assert.equal(rarityAt(Rarity.Common).name,'Common');assert.ok(RESOURCES.every(item=>item.rarity===Rarity.Common));assert.ok(RESOURCES.some(item=>item.depthBias>0));assert.ok(roomDungeon('wood').rooms.every(room=>room.rarity===Rarity.Common));
});
