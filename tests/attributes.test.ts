import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STATS,STAT_INFO,SPECIALIZATIONS,ACTIVITY_GROUPS,ATTRIBUTES,attributesForGroup,zeroPools} from '../src/attributes.ts';
import {recruit,initialGame,sandboxGame,startDay,advance,canCastInnateMagic,completeStoryAction,recall} from '../src/engine.ts';
import {effectiveAttribute,rootPool,resourceCost,TRAP_ROOM,newRoomState,stepRoom,validateRoom} from '../src/skill-system.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
const expected={
 combat:['power','precision','toughness'],dungeoneering:['force','finesse','agility'],exploration:['scouting','observation','discovery'],crafting:['handiwork','design','attunement'],social:['insight','persuasion','serendipity'],trade:['appraisal','bargaining','opportunity'],logistics:['hauling','endurance','movement'],recovery:['vitality','diagnosis','resilience'],management:['planning','leadership','inspiration']
};
test('AT01 accepted matrix has exactly nine stats, nine groups and all 27 exact matches',()=>{
 assert.equal(STATS.length,9);assert.equal(ACTIVITY_GROUPS.length,9);assert.equal(ATTRIBUTES.length,36);assert.equal(SPECIALIZATIONS.length,27);
 for(const group of ACTIVITY_GROUPS)assert.deepEqual(attributesForGroup(group.id).map(attribute=>attribute.id),expected[group.id]);
 for(const stat of STATS)assert.equal(SPECIALIZATIONS.filter(attribute=>attribute.parent===stat).length,3);
 for(const attribute of SPECIALIZATIONS)assert.equal(rootPool(attribute.id),attribute.parent);
});
test('AT02 every recruit and guildmaster gets complete independent nine-stat and 27-attribute profiles',()=>{
 const game=initialGame();for(let i=0;i<3;i++)game.members.push(recruit(game));game.progression.completed.guild_founded={day:1,time:0};for(const actor of [...game.members,game.guildmaster]){assert.deepEqual(Object.keys(actor.stats).sort(),[...STATS].sort());assert.equal(Object.keys(actor.specializations).length,27);}
 assert.ok(game.guildmaster.stats.soul.max>Math.max(...game.members.map(member=>member.stats.soul.max)));
 assert.equal(canCastInnateMagic(game,'guildmaster'),true);for(const member of game.members)assert.equal(canCastInnateMagic(game,member.id),false);
 game.members[0].specializations.power.value=.01;assert.equal(game.members[1].specializations.power.value,0);assert.equal(game.guildmaster.specializations.power.value,0);
 assert.deepEqual(parseSave(exportSave(game)),game);
});
test('AT03 group attributes fall back to distinct parent stats without extra resource pools',()=>{
 const member=sandboxGame().members[0],actor={...member,gear:100};
 for(const attribute of SPECIALIZATIONS)assert.equal(effectiveAttribute(actor,attribute.id,.5),member.stats[attribute.parent].max*.5);
 const check=structuredClone(TRAP_ROOM.checks[2]);check.cost.distribution=[{attribute:'finesse',weight:.5},{attribute:'design',weight:.5}];
 assert.deepEqual(resourceCost(actor,check),{...zeroPools(),dexterity:1,intelligence:1});
});
test('AT04 luck is a non-consumable modifier; depleted luck does not force a return',()=>{
 assert.equal(STAT_INFO.luck.consumable,false);let game=sandboxGame();for(const member of game.members)member.enabled=false;game.members[0].enabled=true;
 game=startDay(game);game.members[0].stats.luck.current=0;assert.deepEqual(parseSave(exportSave(game)),game);game=advance(game,25);assert.equal(game.stats.clears,1);assert.equal(game.active[0].stage,'returning');
 const actor={...game.members[0],gear:100},check=structuredClone(TRAP_ROOM.checks[0]);check.cost.distribution=[{attribute:'discovery',weight:1}];
 assert.throws(()=>resourceCost(actor,check),/Non-consumable/);assert.throws(()=>validateRoom({id:'luck-cost',name:'Invalid',checks:[check]}),/Non-consumable/);
});
test('AT05 successful checks train their contributing attributes; failed checks grant none',()=>{
 const actor={...sandboxGame().members[0],gear:100};for(const stat of STATS)actor.stats[stat]={current:100,max:100,affinity:100};
 const check=structuredClone(TRAP_ROOM.checks[0]);check.work=1;check.chanceMin=check.chanceMax=1;
 const result=stepRoom(actor,{id:'practice',name:'Practice',checks:[check]},newRoomState(),()=>0,1);
 assert.ok(result.specialtyTraining.observation>0);assert.ok(result.specialtyTraining.scouting>0);assert.equal(result.actor.specializations.observation.value,0);
 check.chanceMin=check.chanceMax=0;check.failures=[{id:'retry',weight:1,kind:'retry'}];assert.deepEqual(stepRoom(actor,{id:'fail',name:'Fail',checks:[check]},newRoomState(),()=>.9,1).specialtyTraining,{});
});
/** Reconstruct actual pre-v5 three-pool saves, including reports and carried training. */
function oldSchema(game:ReturnType<typeof initialGame>,version=4):any{
 const g:any=structuredClone(game),map={might:'strength',agility:'dexterity',focus:'intelligence'};
 const oldPools=(p:any)=>Object.fromEntries(Object.entries(map).map(([old,current])=>[old,p[current]]));
 for(const member of [...g.members,...(g.candidate?[g.candidate]:[])]){member.stats=oldPools(member.stats);member.specializations={finger_dexterity:member.specializations.finesse};}
 for(const run of g.active){run.training=oldPools(run.training);run.startMax=oldPools(run.startMax);run.specializationTraining={finger_dexterity:.75};}
 for(const report of g.reports)report.growth=oldPools(report.growth);
 delete g.guildmaster;g.version=version;return {format:'guild-loops',version,game:g};
}
test('AT06 v4 saves migrate real old pools and trained/pending Finesse while retaining trip, trade and RNG state',()=>{
 let game=advance(startDay(sandboxGame()),20);game.members[0].specializations.finesse={value:3,affinity:77};game.reports[0].growth.dexterity=2;
 const raw=oldSchema(game);raw.game.trades=[{id:1,locationId:'emberveil',resourceId:'timber',quantity:2,chips:2,duration:15,remaining:8}];raw.game.nextTradeId=2;
 const migrated=parseSave(JSON.stringify(raw));assert.equal(migrated.version,6);assert.equal(migrated.seed,game.seed);assert.deepEqual(migrated.members[0].stats.dexterity,game.members[0].stats.dexterity);assert.deepEqual(migrated.members[0].specializations.finesse,{value:3,affinity:77});assert.equal(migrated.active[0].specializationTraining.finesse,.75);assert.equal(migrated.active[0].stage,game.active[0].stage);assert.equal(migrated.active[0].progress,game.active[0].progress);assert.equal(migrated.reports[0].growth.dexterity,2);assert.deepEqual(migrated.trades,raw.game.trades);assert.equal(migrated.members[0].stats.luck.max,12);
 assert.deepEqual(advance(parseSave(exportSave(migrated)),40),advance(migrated,40));
});
test('AT07 v4 returning and exhausted members retain their return countdown and cannot receive duplicated rewards',()=>{
 let game=startDay(sandboxGame());game=recall(game,game.members[0].id);game.members[0].stats.strength.current=0;game=advance(game,5);
 const migrated=parseSave(JSON.stringify(oldSchema(game)));assert.equal(migrated.active[0].stage,'returning');assert.equal(migrated.active[0].travelRemaining,10);const complete=advance(migrated,10);assert.equal(complete.members[0].runs,1);assert.equal(complete.members[0].cooldown,12);
});
test('AT08 malformed current schema, incomplete attributes and missing legacy roots reject without losing the caller state',()=>{
 const game=sandboxGame();for(const mutate of [(g:any)=>delete g.members[0].stats.soul,(g:any)=>delete g.members[0].specializations.opportunity,(g:any)=>g.guildmaster.innateMagic=false,(g:any)=>g.guildmaster.specializations.inspiration.value=1e12]){const raw=JSON.parse(exportSave(game));mutate(raw.game);assert.throws(()=>parseSave(JSON.stringify(raw)));}
 const legacy=oldSchema(game);delete legacy.game.members[0].stats.agility;assert.throws(()=>parseSave(JSON.stringify(legacy)),/legacy stat/);assert.equal(game.members[0].stats.dexterity.current,game.members[0].stats.dexterity.max);
});
