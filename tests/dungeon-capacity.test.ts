import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,advance,startDay,recall,dungeonOccupants,memberActivities,sandboxGame} from '../src/engine.ts';
import {dungeonById} from '../src/content.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
function opening(){let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;}
test('DC01 a single-place dungeon reserves space before arrival and never explores over cap',()=>{
 let g=opening();const before=structuredClone(g);g=advance(g,1);assert.equal(g.active.length,1);assert.equal(g.active[0].stage,'outbound');assert.equal(dungeonOccupants(g,'wood').length,1);assert.equal(before.active.length,0);
 for(let t=0;t<800;t++){g=advance(g,1);assert.ok(dungeonOccupants(g,'wood').length<=1);assert.ok(g.active.filter(run=>run.dungeonId==='wood'&&run.stage==='exploring').length<=1);}
 assert.ok(g.members.every(member=>member.runs>0),'Both friends eventually get a turn');
});
test('DC02 homeward travel releases capacity and the next member departs',()=>{
 let g=startDay(opening());const first=g.active[0].memberId;g=recall(g,first);assert.equal(dungeonOccupants(g,'wood').length,0);g=advance(g,1);assert.equal(g.active.length,2);assert.ok(g.active.some(run=>run.memberId===first&&run.stage==='returning'));assert.equal(dungeonOccupants(g,'wood').length,1);assert.notEqual(dungeonOccupants(g,'wood')[0].memberId,first);
});
test('DC03 authored per-dungeon caps can allow multiple people, while guild capacity still applies',()=>{
 const dungeon=dungeonById('wood'),saved=dungeon.maxConcurrent;try{dungeon.maxConcurrent=2;let g=opening();g=startDay(g);assert.equal(dungeonOccupants(g,'wood').length,2);let h=opening();h.guild.slots=1;h=advance(h,1);assert.equal(h.active.length,1);}finally{dungeon.maxConcurrent=saved;}
});
test('DC04 planning saves advance automatically and capacity is preserved through reload',()=>{
 let g=opening();assert.equal(g.phase,'planning');g=advance(g,19);const restored=parseSave(exportSave(g));assert.deepEqual(advance(restored,90),advance(g,90));assert.equal(dungeonOccupants(restored,'wood').length,1);
});
test('DC05 activity counts partition members without treating guild sales as assigned traders',()=>{
 let g=startDay(opening());let counts=memberActivities(g);assert.equal(counts.expeditions,1);assert.equal(counts.idle,1);g=recall(g,g.active[0].memberId);g=advance(g,15);counts=memberActivities(g);assert.equal(counts.healing,1);assert.equal(counts.expeditions+counts.healing+counts.idle,g.members.length);const h=sandboxGame();h.candidate=structuredClone(h.members[0]);h.trades=[{id:1,resourceId:'herb',quantity:1,chips:3,duration:15,remaining:10}];counts=memberActivities(h);assert.equal(counts.recruits,1);assert.equal(counts.trading,0);assert.equal(counts.crafting,0);assert.equal(counts.idle,3);
});
