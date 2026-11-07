import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,startDay,advance,recall,setDungeonLimit,recruit,dungeonWaiting,memberActivities} from '../src/engine.ts';
import {floorCatalog,rollFloorRoom,roomById,floorDifficulty,nextDungeonFloor,checkProgressRate} from '../src/rooms.ts';
import {floorPreview,dungeonPreview,revealedDungeonSkills} from '../src/discovery.ts';
import {parseSave,exportSave} from '../src/persistence.ts';
import {canDungeon,ownsSkill} from '../src/specialization.ts';
function opening(){let g=initialGame(73129);for(const a of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,a);g.members[1].enabled=false;return g;}
function exploring(){let g=advance(startDay(opening()),15);g.members.forEach(m=>m.enabled=false);g.active[0].endurance={current:1000,max:1000};return g;}
function encounter(g:ReturnType<typeof exploring>,category:'normal'|'treasure'|'boss',index=0){
 const r=g.active[0],state=r.floorState!;r.floor=(state.number-1)*10+Math.min(10,state.counted+1);
 const room=floorCatalog(r.dungeonId,state.number)[category][index];
 r.generated={id:room.id,index:0,work:Math.max(0,room.checks[0].work*floorDifficulty(r.dungeonId,state.number)-.001),attempts:0};r.progress=r.generated.work;r.roomStartedAt=null;r.roomEfficiency=null;r.lowSkill=false;return g;
}
test('FD01 all 100 campaign floors have ten stable normal identities, separate boss and treasure catalogs',()=>{
 for(let f=1;f<=100;f++){const a=floorCatalog('wood',f),b=floorCatalog('wood',f);assert.deepEqual(a,b);assert.equal(a.normal.length,10);assert.equal(new Set(a.normal.map(r=>r.id)).size,10);assert.equal(new Set(a.normal.map(r=>r.name)).size,10);assert.equal(a.boss.length,1);assert.equal(a.treasure.length,2);for(const r of Object.values(a).flat())assert.equal(roomById('wood',r.id).id,r.id);}
 assert.throws(()=>floorCatalog('wood',101));assert.equal(floorCatalog('ruins',101).normal.length,10);
});
test('FD02 normal encounter rolls are random with replacement, never require ten distinct discoveries',()=>{
 const state={number:1,counted:0,successful:0,lastTreasure:true};
 const a=rollFloorRoom('wood',state,()=>.01),b=rollFloorRoom('wood',state,()=>.99);
 assert.notEqual(a.id,b.id);assert.equal(rollFloorRoom('wood',state,()=>.01).id,a.id);
 for(let n=0;n<10;n++){state.counted=n;assert.equal(roomById('wood',rollFloorRoom('wood',state,()=>.01).id).group,'neutral');}
 state.counted=10;assert.equal(roomById('wood',rollFloorRoom('wood',state,()=>.01).id).group,'boss');
});
test('FD03 treasure never advances counted rooms or permits consecutive bonus rooms',()=>{
 let g=exploring();encounter(g,'treasure');g=advance(g,1);assert.equal(g.active[0].floorState!.counted,0);assert.equal(g.active[0].floor,1);assert.equal(g.active[0].floorState!.lastTreasure,true);
 assert.ok(!rollFloorRoom('wood',g.active[0].floorState!,()=>0).id.includes('treasure'));
 assert.ok(rollFloorRoom('wood',{...g.active[0].floorState!,lastTreasure:false},()=>0).id.includes('treasure'));
});
test('FD04 ten successful random normal clears do not clear floor or award XP before separate boss',()=>{
 let g=exploring();for(let n=0;n<10;n++){encounter(g,'normal');g=advance(g,1);}
 assert.equal(g.active[0].floorState!.counted,10);assert.equal(g.members[0].constitutionExperience,0);assert.equal(g.dungeonKnowledge.wood[1].bossCleared,false);assert.equal(g.dungeonKnowledge.wood[1].known.length,1);
 encounter(g,'boss');g=advance(g,1);assert.equal(g.members[0].constitutionExperience,1);assert.equal(g.dungeonKnowledge.wood[1].bossCleared,true);assert.equal(g.active[0].floorState!.number,2);assert.equal(nextDungeonFloor(g.dungeonKnowledge,'wood'),2);assert.equal(g.active[0].endurance.max,1000);
});
test('FD05 failed or skipped encounters never reveal a room or contribute successful-floor XP',()=>{
 let g=exploring();encounter(g,'treasure',1);g=advance(g,1);assert.deepEqual(g.dungeonKnowledge.wood[1].known,[]);assert.equal(g.active[0].floorState!.counted,0);
 g=exploring();encounter(g,'normal');g.active[0].endurance.current=0;g=advance(g,1);assert.deepEqual(g.dungeonKnowledge.wood[1].known,[]);assert.equal(g.members[0].constitutionExperience,0);
});
test('FD06 one newly known normal room reveals exactly one tenth of its actual mix; repeats reveal nothing extra',()=>{
 let g=exploring();assert.equal(floorPreview(g.dungeonKnowledge,'wood',1).unknown,1);encounter(g,'normal');g=advance(g,1);
 const p=floorPreview(g.dungeonKnowledge,'wood',1);assert.equal(p.known,1);assert.equal(p.total,10);assert.equal(p.unknown,.9);assert.ok(Math.abs(p.mix.reduce((n,e)=>n+e.weight,0)-.1)<1e-9);
 encounter(g,'normal');g=advance(g,1);assert.deepEqual(floorPreview(g.dungeonKnowledge,'wood',1),p);
});
test('FD07 category filters isolate Normal/Treasure/Boss denominators and unexplored floors do not leak',()=>{
 let g=exploring();encounter(g,'normal');g=advance(g,1);const before=floorPreview(g.dungeonKnowledge,'wood',1);
 assert.equal(floorPreview(g.dungeonKnowledge,'wood',1,['treasure']).unknown,1);assert.equal(floorPreview(g.dungeonKnowledge,'wood',1,['boss']).unknown,1);
 encounter(g,'treasure');g=advance(g,1);assert.deepEqual(floorPreview(g.dungeonKnowledge,'wood',1),before);assert.equal(floorPreview(g.dungeonKnowledge,'wood',1,['treasure']).unknown,.5);assert.equal(floorPreview(g.dungeonKnowledge,'wood',1,['boss']).total,1);assert.equal(dungeonPreview(g.dungeonKnowledge,'wood').total,10);
});
test('FD08 clearing a secret encounter reveals its Skill name; a boss reveals remaining floor Skills without granting stats',()=>{
 let g=exploring();assert.equal(revealedDungeonSkills(g.dungeonKnowledge).has('crypt_lore'),false);
 encounter(g,'normal',4);g=advance(g,1);assert.equal(revealedDungeonSkills(g.dungeonKnowledge).has('crypt_lore'),true);
 g=exploring();g.active[0].floorState={number:1,counted:10,successful:10,lastTreasure:false};encounter(g,'boss');g=advance(g,1);
 assert.equal(revealedDungeonSkills(g.dungeonKnowledge).has('crypt_lore'),true);assert.equal(floorPreview(g.dungeonKnowledge,'wood',1).known,0);assert.equal(floorPreview(g.dungeonKnowledge,'wood',1,['boss']).known,1);
});
test('FD09 queued Recall waits through room ten for boss, completion wins deadline and boss XP is not replayed',()=>{
 let g=exploring();g.active[0].floorState={number:1,counted:9,successful:9,lastTreasure:false};encounter(g,'normal');g=recall(g,g.members[0].id);g=advance(g,1);
 assert.equal(g.active[0].stage,'exploring');assert.equal(g.members[0].constitutionExperience,0);
 encounter(g,'boss');g.active[0].elapsed=29;g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Recalled');assert.equal(g.members[0].constitutionExperience,1);
 g=advance(g,15);assert.equal(g.members[0].runs,1);assert.equal(g.members[0].constitutionExperience,1);
});
test('FD10 room-count limits include the boss at a ten-room boundary and stop a partial floor without XP',()=>{
 let g=exploring();g=setDungeonLimit(g,'wood',10);g.active[0].floorState={number:1,counted:9,successful:9,lastTreasure:false};encounter(g,'normal');g=advance(g,1);assert.equal(g.active[0].stage,'exploring');encounter(g,'boss');g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Depth reached');assert.equal(g.members[0].constitutionExperience,1);
 g=exploring();g=setDungeonLimit(g,'wood',3);g.active[0].floorState={number:1,counted:2,successful:2,lastTreasure:false};encounter(g,'normal');g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Depth reached');assert.equal(g.members[0].constitutionExperience,0);
});
test('FD11 durable checkpoints resume the next uncleared floor; partial attempts resume from its beginning',()=>{
 let g=exploring();g.active[0].floorState={number:1,counted:10,successful:10,lastTreasure:false};encounter(g,'boss');g=recall(g,g.members[0].id);g=advance(g,16);assert.equal(g.active.length,0);
 g.members[0].enabled=true;g=advance(g,1);assert.equal(g.active[0].floorState!.number,2);assert.equal(g.active[0].floor,11);assert.equal(g.active[0].floorState!.counted,0);
});
test('FD12 floor 100 boss emits one durable ending, banks cargo once, and never dispatches into floor 101',()=>{
 let g=exploring();g.active[0].floorState={number:100,counted:10,successful:10,lastTreasure:false};g.dungeonKnowledge.wood={};
 for(let f=1;f<100;f++)g.dungeonKnowledge.wood[f]={bossCleared:true,known:[`f${f}-boss-0`]};
 encounter(g,'boss');g=advance(g,1);assert.equal(g.active[0].outcome?.reason,'Campaign complete');assert.ok(g.progression.completed.campaign_completed);
 g.members[0].enabled=true;g=advance(g,50);assert.equal(g.active.length,0);assert.equal(g.members[0].runs,1);assert.equal(dungeonWaiting(g,'wood').length,0);assert.equal(memberActivities(g).queued,0);assert.equal(g.reports.filter(r=>r.reason==='Unlock'&&r.detail==='The final checkpoint').length,1);assert.deepEqual(parseSave(exportSave(g)),g);
});
test('FD13 mid-floor, treasure history, Recall clocks, RNG, boss checkpoints and revelations roundtrip exactly',()=>{
 let g=exploring();encounter(g,'normal');g=advance(g,1);g=recall(g,g.members[0].id);g=advance(g,1);const restored=parseSave(exportSave(g));assert.deepEqual(restored,g);assert.deepEqual(advance(restored,100),advance(g,100));
});
test('FD14 malformed discovery identities, categories, floor counts, boss checkpoints and campaign flags are rejected',()=>{
 const g=exploring();for(const mutate of [(h:any)=>h.dungeonKnowledge.wood[1].known=['f2-normal-0'],(h:any)=>h.dungeonKnowledge.wood[1].known=['f1-normal-0','f1-normal-0'],(h:any)=>h.dungeonKnowledge.wood[1].bossCleared=true,(h:any)=>h.active[0].floorState.counted=11,(h:any)=>h.active[0].floorState.successful=1,(h:any)=>h.progression.completed.campaign_completed={day:1,time:0},(h:any)=>h.dungeonKnowledge.wood[101]={known:[],bossCleared:false},(h:any)=>h.members[0].soulAccess='leech']){const data=JSON.parse(exportSave(g));mutate(data.game);assert.throws(()=>parseSave(JSON.stringify(data)));}
});
test('FD15 v9 outings retain historical rules/work/cargo without fabricated floor discovery',()=>{
 let g=exploring();g.active[0].floorState=null;g.active[0].generated={id:'crypt_guardian',index:0,work:0,attempts:0};g.active[0].roomStartedAt=0;g.active[0].roomEfficiency=1;
 const old=JSON.parse(exportSave(g));old.version=old.game.version=9;delete old.game.dungeonKnowledge;for(const r of old.game.active)delete r.floorState;for(const m of old.game.members)delete m.soulAccess;delete old.game.guildmaster.soulAccess;
 const migrated=parseSave(JSON.stringify(old));assert.equal(migrated.version,10);assert.equal(migrated.active[0].floorState,null);assert.deepEqual(migrated.dungeonKnowledge,{});assert.equal(migrated.seed,g.seed);assert.deepEqual(migrated.active[0].loot,g.active[0].loot);
});
test('FD16 random recruits have inert Soul exactly one, no selected Soul and no Soul capability',()=>{
 const g=opening();for(let i=0;i<300;i++){const m=recruit(g);assert.deepEqual(m.stats.soul,{current:1,max:1,affinity:1});assert.equal(m.soulAccess,'none');assert.ok(!m.selections!.attributes.includes('soul'));for(const skill of ['soul_sense','imbuement'])assert.equal(ownsSkill(m,skill),false);}
 assert.equal(g.guildmaster.soulAccess,'guildmaster');assert.equal(canDungeon(g.guildmaster),false);assert.ok(g.members.every(m=>m.soulAccess==='none'&&canDungeon(m)));
});
test('FD17 difficulty steps exponentially at floors, remains finite in endless dungeons and preserves beginner work',()=>{
 assert.equal(floorDifficulty('wood',1),1);assert.ok(floorDifficulty('wood',2)>1);assert.ok(floorDifficulty('wood',100)>floorDifficulty('ruins',100));assert.ok(Number.isFinite(floorDifficulty('ruins',100000)));assert.ok(Math.abs(floorDifficulty('wood',10)/floorDifficulty('wood',9)-1.035)<1e-9);
});

test('FD18 Arya can clear floors one through ten with starter stats and earned training, without potions or equipment',()=>{
 for(const seed of [1,9,23]){let g=opening();g.seed=seed;g.dungeonDefaults.depthLimit=100;g=startDay(g);for(let seconds=0;seconds<1200&&!g.dungeonKnowledge.wood?.[10]?.bossCleared;seconds+=10)g=advance(g,10);assert.ok(g.dungeonKnowledge.wood?.[10]?.bossCleared,`starter Arya seed ${seed}`);assert.equal(g.members[0].equipped.length,0);assert.deepEqual(parseSave(exportSave(g)),g);}
});
test('FD19 floor eleven is a current-kit barrier even for fully trained Arya with existing best armor',()=>{
 let g=opening(),m=g.members[0];for(const stat of Object.values(m.stats))stat.current=stat.max=stat.affinity;for(const skill of Object.values(m.specializations))skill.value=skill.affinity;m.constitutionExperience=10;g.equipment.unlocked=['reinforced_armor'];m.equipped=['reinforced_armor'];g.dungeonKnowledge.wood={};for(let f=1;f<=10;f++)g.dungeonKnowledge.wood[f]={known:[`f${f}-boss-0`],bossCleared:true};g=startDay(g);g.members[0].enabled=false;g=advance(g,350);assert.equal(g.dungeonKnowledge.wood[11]?.bossCleared,false);assert.equal(g.members[0].runs,1);assert.ok(floorDifficulty('wood',11)>floorDifficulty('wood',10)*20);
});
test('FD20 valid global defaults can be chosen before founding; invalid drafts never alter the guild',async()=>{
 const {setDungeonDefaults}=await import('../src/engine.ts');const g=initialGame();const updated=setDungeonDefaults(g,{depthLimit:23,skillThreshold:0});assert.equal(updated.members.length,0);assert.equal(updated.dungeonDefaults.depthLimit,23);assert.deepEqual(parseSave(exportSave(updated)),updated);assert.equal(setDungeonDefaults(g,{depthLimit:0,skillThreshold:0}),g);
});
test('FD21 skipped standard rooms grant no full-floor Constitution XP when the boss is cleared',()=>{
 let g=exploring();g.active[0].floorState={number:1,counted:10,successful:9,lastTreasure:false};encounter(g,'boss');g=advance(g,1);assert.equal(g.dungeonKnowledge.wood[1].bossCleared,true);assert.equal(g.members[0].constitutionExperience,0);
});

test('FD22 choosing an earlier checkpoint supports farming without erasing discoveries or changing active outings',async()=>{
 const {setDungeonStart,startingFloor}=await import('../src/engine.ts');let g=opening();g.dungeonKnowledge.wood={1:{known:['f1-boss-0'],bossCleared:true}};assert.equal(startingFloor(g,'wood'),2);g=setDungeonStart(g,'wood',1);assert.equal(startingFloor(g,'wood'),1);g=startDay(g);assert.equal(g.active[0].floorState!.number,1);g=setDungeonStart(g,'wood',2);assert.equal(g.active[0].floorState!.number,1);assert.equal(setDungeonStart(g,'wood',3),g);assert.deepEqual(parseSave(exportSave(g)),g);assert.equal(g.dungeonKnowledge.wood[1].bossCleared,true);
});

test('FD23 modern adventurers cannot discover or dispatch to the obsolete Quarry site before a Soul-enabled replacement is authored',async()=>{
 const {dungeonUnlocked,availableStoryActions}=await import('../src/progression.ts');const g=opening();g.progression.completed.archive_floor_cleared={day:1,time:0};g.progression.completed.quarry_discovered={day:1,time:0};assert.equal(dungeonUnlocked(g.progression,'quarry'),false);assert.equal(availableStoryActions(g.progression).some(a=>a.id==='discover_quarry'),false);g.members.forEach(m=>m.queue=[{dungeonId:'quarry'}]);assert.equal(memberActivities(g).queued,0);assert.equal(startDay(g).active.length,0);
});
