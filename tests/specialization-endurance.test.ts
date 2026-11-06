import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,startDay,advance,recall,setDungeonDefaults,setDungeonLimit,inheritDungeonLimit,setDungeonThreshold,effectiveLimit,effectiveThreshold,setQueue,completeRequest,recruit,returnETA} from '../src/engine.ts';
import {skillMatrix,skillValue,skillPotential,ownsSkill,canDungeon,canLearnComposite,trainingBand,defaultSelections} from '../src/specialization.ts';
import {enduranceMaximum,enduranceDrain,roomById,roomEfficiency,checkRating,roomCheckStep,ROOM_DUNGEONS,validateRoomDungeon} from '../src/rooms.ts';
import {modifiedValue} from '../src/equipment.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {STATS} from '../src/attributes.ts';
function opening(){let g=initialGame(73129);for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;}
function exploring(role:'arya'|'clyde'='arya'){
 let g=opening();g.members.forEach(m=>m.enabled=m.origin===role);g=advance(startDay(g),15);g.members.forEach(m=>m.enabled=false);return g;
}
function room(g:ReturnType<typeof exploring>,id:string,depth=1){const r=g.active[0];r.floor=depth;r.generated={id,index:0,work:0,attempts:0};r.progress=0;r.roomStartedAt=null;r.roomEfficiency=null;r.lowSkill=false;return r;}
function slow(){const g=exploring('clyde'),r=room(g,'crypt_guardian',100);r.endurance={max:100,current:100};return g;}
test('SE01 fixed roles satisfy the agreed selections, sparse 25 cells and totals count every Skill once',()=>{
 const g=opening();assert.equal(canDungeon(g.guildmaster),false);assert.equal(ownsSkill(g.members[0],'power'),true);assert.equal(canDungeon(g.members[1]),true);assert.equal(ownsSkill(g.members[1],'power'),false);assert.equal(ownsSkill(g.members[1],'vitality'),true);assert.ok(g.guildmaster.selections!.disciplines.includes('crafting'));
 for(const actor of [...g.members,g.guildmaster]){const m=skillMatrix(actor);assert.equal(m.cells.length,5);assert.ok(m.cells.every(r=>r.length===5));assert.ok(m.cells.flat().some(s=>s===null));assert.equal(m.total,m.rows.reduce((a,b)=>a+b,0));assert.equal(m.total,m.columns.reduce((a,b)=>a+b,0));assert.equal(m.total,m.cells.flat().reduce((n,s)=>n+(s?skillValue(actor,s.id):0),0));}
 assert.equal(trainingBand(.7499,1),'red');assert.equal(trainingBand(.75,1),'yellow');assert.equal(trainingBand(.9,1),'green');
 for(let i=0;i<100;i++){const m=recruit(g);assert.deepEqual(m.selections,defaultSelections(m));assert.equal(new Set(m.selections!.attributes).size,5);assert.equal(new Set(m.selections!.disciplines).size,5);}
});
test('SE02 missing Skill uses selected Attribute, absent Attribute contributes 0.01 without renormalization',()=>{
 const g=opening(),arya={...g.members[0],gear:0},clyde={...g.members[1],gear:0};const check={...roomById('wood','crypt_scavenger').checks[0],attributes:[{attribute:'power',weight:.9},{attribute:'finesse',weight:.1}]};
 assert.equal(skillValue(clyde,'power'),.01);assert.equal(skillValue(clyde,'finesse'),1);assert.ok(Math.abs(checkRating(clyde,check,[])-.109)<1e-10);assert.equal(checkRating(arya,check,[]),1);assert.ok(checkRating(clyde,check,[])>0);
 const unweighted=roomCheckStep(clyde,{...check,work:1}, {id:'crypt_scavenger',index:0,work:0,attempts:0},1,[],()=>{throw Error('no success RNG');},1);assert.equal(unweighted.outcome,'working');assert.equal(unweighted.state.work,.10900000000000001);
 const geared=checkRating(clyde,check,[]);assert.equal(geared,checkRating({...clyde,stats:{...clyde.stats,strength:{...clyde.stats.strength,current:0}}},check,[]));
});
test('SE03 gear order and stacking are deterministic; bonuses never create eligibility',()=>{
 assert.equal(modifiedValue(2,[{catchup:10,flat:3,percent:.5}]),13.5);assert.equal(modifiedValue(20,[{catchup:10}]),20);
 assert.equal(modifiedValue(2,[{catchup:6,flat:1,percent:.1},{catchup:10,flat:2,percent:.4}]),13.5);
 const g=opening();assert.equal(enduranceMaximum({...g.guildmaster,gear:0},['reinforced_armor']),0);
 const actor={...g.members[1],gear:0};assert.equal(enduranceMaximum(actor,[]),1);assert.equal(enduranceMaximum(actor,['leather_armor']),1.1);assert.equal(canLearnComposite(actor,'leather_crafting'),true);assert.equal(canLearnComposite(g.members[0],'leather_crafting'),false);
 g.progression.completed.tanner_opened={day:1,time:0};g.inventory.leather=12;assert.equal(completeRequest(g,'gavin_leather_lesson',g.members[0].id),g);assert.ok(completeRequest(g,'gavin_leather_lesson',g.members[1].id).progression.completed.leather_crafting_learned);
});
test('SE04 each room spends separate endurance at its floor rate and never drains Attributes',()=>{
 let g=exploring();const r=room(g,'crypt_guardian',50),before=structuredClone(g.members[0].stats);const initial=r.endurance.current;g=advance(g,1);assert.deepEqual(g.members[0].stats,before);assert.ok(Math.abs(g.active[0].endurance.current-(initial-enduranceDrain(50)))<1e-10);
 assert.equal(enduranceDrain(1),enduranceDrain(10));assert.ok(enduranceDrain(11)>enduranceDrain(10));
});
test('SE05 depleted capacity invokes the authored room outcome, rewards no incomplete work and heals once',()=>{
 for(const [id,reason]of [['crypt_guardian','Injured'],['crypt_passage','Tired']] as const){let g=exploring();const r=room(g,id);r.endurance.current=0;const stats=structuredClone(g.members[0].stats);g=advance(g,1);assert.equal(g.active[0].outcome?.reason,reason);assert.equal(g.active[0].chips,0);assert.equal(g.stats.clears,0);assert.deepEqual(g.members[0].stats,stats);g=advance(g,15);assert.equal(g.members[0].runs,1);assert.equal(g.members[0].cooldown,reason==='Injured'?12:0);assert.equal(g.reports.filter(r=>r.reason==='Dungeon failed').length,reason==='Injured'?1:0);}
});
test('SE06 general Constitution XP requires ten successful rooms in one floor and raises future capacity once',()=>{
 let g=exploring();const before=enduranceMaximum({...g.members[0],gear:0},[]);const r=room(g,'crypt_passage',10);r.successfulFloorRooms=9;g=advance(g,1);assert.equal(g.members[0].constitutionExperience,1);assert.equal(g.active[0].successfulFloorRooms,0);assert.equal(g.active[0].floor,11);assert.ok(enduranceMaximum({...g.members[0],gear:0},[])>before);assert.equal(g.active[0].endurance.max,before);
 const restored=parseSave(exportSave(g));assert.equal(restored.members[0].constitutionExperience,1);assert.deepEqual(advance(restored,1),advance(g,1));
 let h=exploring();room(h,'crypt_passage',9).successfulFloorRooms=8;h=setDungeonLimit(h,'wood',9);h=advance(h,1);assert.equal(h.members[0].constitutionExperience,0);
 let skipped=exploring();room(skipped,'crypt_garden',10).successfulFloorRooms=9;skipped=advance(skipped,1);assert.equal(skipped.members[0].constitutionExperience,0);
});
test('SE07 manual recall queues inside a floor, resolves at the next ten-room boundary, and preserves clock on reload',()=>{
 let g=exploring();const r=room(g,'crypt_passage',10);r.successfulFloorRooms=9;r.generated!.work=0;r.progress=0;
 g=recall(g,g.members[0].id);assert.equal(g.active[0].stage,'exploring');assert.equal(g.active[0].recallRequestedAt,0);
 // Enter room to create its evaluation, then recreate the queued boundary case for exact save continuation.
 g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Recalled');assert.equal(g.members[0].constitutionExperience,1);assert.equal(recall(g,g.members[0].id),g);
 let h=slow();h=recall(h,h.members[1].id);h=advance(h,10);const loaded=parseSave(exportSave(h));assert.equal(loaded.active[0].recallRequestedAt,0);assert.deepEqual(advance(loaded,20),advance(h,20));h=advance(h,20);assert.equal(h.active[0].outcome?.reason,'Injured');assert.equal(h.members[1].constitutionExperience,0);
});
test('SE08 below-threshold room grace uses actual benchmark efficiency and expires exactly at 30 game seconds',()=>{
 let g=slow();g=setDungeonThreshold(g,'wood',100);const expected=roomEfficiency({...g.members[1],gear:0},roomById('wood','crypt_guardian'),[]);g=advance(g,1);assert.equal(g.active[0].lowSkill,true);assert.equal(g.active[0].roomEfficiency,expected);assert.equal(g.active[0].roomStartedAt,0);g=advance(g,28);assert.equal(g.active[0].stage,'exploring');const saved=parseSave(exportSave(g));g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Injured');assert.match(g.active[0].outcome!.detail,/skill grace/);assert.deepEqual(advance(saved,1),g);assert.equal(g.stats.clears,0);
});
test('SE09 0% disables threshold, successful rooms continue within grace, changes apply on next entry',()=>{
 let g=slow();g=setDungeonThreshold(g,'wood',0);g=advance(g,30);assert.equal(g.active[0].stage,'exploring');assert.equal(g.active[0].lowSkill,false);
 let h=exploring();room(h,'crypt_passage');h=setDungeonThreshold(h,'wood',100);h=advance(h,1);assert.equal(h.active[0].floor,2);assert.equal(h.active[0].stage,'exploring');assert.equal(h.active[0].lowSkill,false);
 g=setDungeonThreshold(g,'wood',100);g=advance(g,1);assert.equal(g.active[0].lowSkill,false);
});
test('SE10 simultaneous and adjacent recall/threshold deadlines fail exactly once; completion wins the deadline',()=>{
 for(const offset of [0,1,-1]){let g=slow();g=setDungeonThreshold(g,'wood',100);g=recall(g,g.members[1].id);g.active[0].recallRequestedAt=offset===-1?0:offset; // offset -1 starts room one second later
 if(offset===-1){g.active[0].elapsed=1;g.active[0].roomStartedAt=1;g.active[0].lowSkill=true;g.active[0].roomEfficiency=.01;}
 g=advance(g,31);assert.equal(g.active[0].stage,'returning');assert.equal(g.stats.clears,0);assert.equal(g.members[1].constitutionExperience,0);g=advance(g,15);assert.equal(g.members[1].runs,1);assert.equal(g.reports.filter(r=>r.reason==='Dungeon failed').length,1);}
 let h=exploring();const r=room(h,'crypt_passage',10);r.successfulFloorRooms=9;r.roomStartedAt=0;r.lowSkill=true;r.roomEfficiency=.01;r.elapsed=29;r.recallRequestedAt=0;h=advance(h,1);assert.equal(h.active[0].outcome?.reason,'Recalled');assert.equal(h.members[0].constitutionExperience,1);assert.equal(h.stats.clears,1);
});
test('SE11 shared defaults inherit live, explicit Unlimited and Off override, assignment caps never restrict',()=>{
 let g=opening();g=setDungeonDefaults(g,{depthLimit:10,skillThreshold:2});assert.equal(effectiveLimit(g,{dungeonId:'wood'}),10);assert.equal(effectiveThreshold(g,'wood'),2);g=setQueue(g,g.members[0].id,[{dungeonId:'wood',maxDepth:1}]);assert.ok(!('maxDepth' in g.members[0].queue[0]));g=startDay(g);assert.ok(!('personalLimit' in g.active[0]));g=setDungeonDefaults(g,{depthLimit:20,skillThreshold:3});assert.equal(effectiveLimit(g,g.active[0]),20);g=setDungeonLimit(g,'wood',null);g=setDungeonThreshold(g,'wood',0);g=setDungeonDefaults(g,{depthLimit:1,skillThreshold:4});assert.equal(effectiveLimit(g,g.active[0]),Infinity);assert.equal(effectiveThreshold(g,'wood'),0);g=inheritDungeonLimit(g,'wood');g=setDungeonThreshold(g,'wood',undefined);assert.equal(effectiveLimit(g,g.active[0]),1);assert.equal(effectiveThreshold(g,'wood'),4);
 for(const n of [-1,101,NaN,Infinity])assert.equal(setDungeonThreshold(g,'wood',n),g);
});
test('SE12 lowering a shared limit finishes the current room, then applies without full-floor XP',()=>{
 let g=slow();g=setDungeonThreshold(g,'wood',0);g=advance(g,1);g=setDungeonLimit(g,'wood',1);assert.equal(g.active[0].stage,'exploring');const r=g.active[0],check=roomById('wood',r.generated!.id).checks[0];r.generated!.work=check.work*1.04**(r.floor-1)-.001;r.progress=r.generated!.work;g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Depth reached');assert.equal(g.members[1].constitutionExperience,0);
});
test('SE13 v8 migration drops unequal assignment caps and preserves active work, cargo, RNG and CON fraction',()=>{
 let g=slow();g=advance(g,3);const raw=JSON.parse(exportSave(g));raw.version=raw.game.version=8;raw.game.dungeonLimits={wood:22,ruins:null,quarry:5};raw.game.members[0].queue=[{dungeonId:'wood',maxDepth:1}];raw.game.members[1].queue=[{dungeonId:'wood',maxDepth:7}];raw.game.active[0].personalLimit=7;raw.game.members[1].stats.constitution.current=raw.game.members[1].stats.constitution.max/2;
 const restored=parseSave(JSON.stringify(raw));assert.equal(effectiveLimit(restored,restored.active[0]),22);assert.equal(restored.dungeonDefaults.depthLimit,null);assert.equal(restored.active[0].endurance.current/restored.active[0].endurance.max,.5);assert.equal(restored.active[0].generated!.work,g.active[0].generated!.work);assert.equal(restored.seed,g.seed);assert.deepEqual(restored.active[0].loot,g.active[0].loot);assert.ok(restored.members.every(m=>m.queue.every(e=>!('maxDepth' in e))));assert.equal(restored.active[0].successfulFloorRooms,0);assert.deepEqual(parseSave(exportSave(restored)),restored);
});
test('SE14 malformed v9 settings, selections, meters and timers reject without changing caller state',()=>{
 let g=slow();g=advance(g,1);const before=structuredClone(g);
 for(const change of [(h:any)=>h.dungeonDefaults.skillThreshold=-1,(h:any)=>h.dungeonThresholds={wood:101},(h:any)=>h.dungeonLimits={bad:3},(h:any)=>h.members[0].selections.attributes[1]=h.members[0].selections.attributes[0],(h:any)=>h.members[0].constitutionExperience=-1,(h:any)=>h.active[0].endurance.current=h.active[0].endurance.max+1,(h:any)=>h.active[0].recallRequestedAt=h.active[0].elapsed+1,(h:any)=>h.active[0].roomStartedAt=-1,(h:any)=>h.active[0].roomEfficiency=Infinity,(h:any)=>h.active[0].personalLimit=1]){const raw=JSON.parse(exportSave(g));change(raw.game);assert.throws(()=>parseSave(JSON.stringify(raw)));}
 assert.deepEqual(g,before);
});
test('SE15 full story runs through craft lesson and future capacity, while ETA forecasts the same return',()=>{
 let g=exploring('clyde');g=recall(g,g.members[1].id);g=advance(g,15);assert.equal(g.members[1].runs,1);assert.equal(g.members[1].constitutionExperience,0);
 let h=slow();h=setDungeonThreshold(h,'wood',100);h=advance(h,1);const before=structuredClone(h),eta=returnETA(h,h.active[0]);assert.deepEqual(h,before);h=advance(h,eta-1);assert.equal(h.members[1].runs,0);h=advance(h,1);assert.equal(h.members[1].runs,1);
 for(const route of ROOM_DUNGEONS)validateRoomDungeon(route);
});
test('SE16 faster weighted work pays fewer endurance seconds for identical loot without spending root stats',()=>{
 const results=[];
 for(const power of [99,199]){let g=exploring();const r=room(g,'crypt_guardian',150);r.endurance={current:100,max:100};g.members[0].specializations.power={value:power,affinity:200};g=setDungeonThreshold(g,'wood',0);const before=structuredClone(g.members[0].stats);let ticks=0;while(g.active[0].generated&&ticks<10){g=advance(g,1);ticks++;}assert.deepEqual(g.members[0].stats,before);assert.equal(g.stats.clears,1);results.push({ticks,spent:100-g.active[0].endurance.current,loot:g.active[0].loot});}
 assert.ok(results[1].ticks<results[0].ticks);assert.ok(results[1].spent<results[0].spent);assert.deepEqual(results[1].loot,results[0].loot);
});
test('SE17 characters without an owned Constitution Skill cannot dispatch even with armor; recruitment requires Charisma',()=>{
 let g=opening();g.members[0].selections=structuredClone(g.guildmaster.selections!);g.equipment.unlocked=['reinforced_armor'];g.members[0].equipped=['reinforced_armor'];g.members[1].enabled=false;g=startDay(g);assert.equal(g.active.length,0);
 g.progression.completed.recruitment_opened={day:1,time:0};g.guildmaster.selections!.attributes=['strength','dexterity','speed','constitution','luck'];g=advance(g,30);assert.equal(g.candidate,null);
});
test('SE18 exact endurance funding completes once, while insufficient funding and malformed authored benchmarks cannot grant progress',()=>{
 let g=exploring();const r=room(g,'crypt_guardian');r.endurance.current=enduranceDrain(1);g=advance(g,1);assert.equal(g.stats.clears,1);assert.deepEqual(g.active[0].loot,{leather:1});assert.equal(g.active[0].endurance.current,0);
 let h=exploring();room(h,'crypt_guardian').endurance.current=enduranceDrain(1)/2;h=advance(h,1);assert.equal(h.stats.clears,0);assert.deepEqual(h.active[0].loot,{});assert.equal(h.active[0].outcome?.reason,'Injured');
 for(const field of ['referenceRate','failure']){const route=structuredClone(ROOM_DUNGEONS[0]);delete (route.rooms[0] as any)[field];assert.throws(()=>validateRoomDungeon(route));}
});
