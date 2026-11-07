import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateSkillPotential,startingSkillValue,trainingMultiplier,trainSkill,syncSkillTotals,atAffinity} from '../src/unit-potential.ts';
import {ROLE_SELECTIONS,ownsSkill,skillValue,skillMatrix} from '../src/specialization.ts';
import {initialGame,startingFriend,recruit,completeStoryAction,startDay,advance,setDungeonLimit} from '../src/engine.ts';
import {floorCatalog,floorDifficulty,enduranceMaximum} from '../src/rooms.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {maximumMemberChance} from '../src/member-probability.ts';
test('UP01 generation spends exactly ten points on owned Skills with a 0.1 minimum and repeatable draws',()=>{
 const generate=()=>{let seed=7;return generateSkillPotential(ROLE_SELECTIONS.arya,10,()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;});};
 const skills=generate();assert.deepEqual(skills,generate());assert.ok(Math.abs(Object.values(skills).reduce((n,s)=>n+s.affinity,0)-10)<1e-9);
 const m=startingFriend(initialGame(),'arya');
 for(const [id,s]of Object.entries(skills)){if(ownsSkill(m,id))assert.ok(s.affinity>=.1&&s.value>=0&&s.value<s.affinity);else assert.deepEqual(s,{value:0,affinity:0});}
 assert.throws(()=>generateSkillPotential(ROLE_SELECTIONS.arya,.1,()=>.5));assert.throws(()=>generateSkillPotential(ROLE_SELECTIONS.arya,10,()=>1));
});
test('UP02 truncated exponential starts below half affinity at least 90% of the time analytically',()=>{
 assert.equal(startingSkillValue(10,0),0);assert.ok(startingSkillValue(10,.9)<5);
 const halfCDF=(1-Math.exp(-Math.log(10)))/(1-Math.exp(-2*Math.log(10)));
 assert.ok(halfCDF>.9);assert.ok(Math.abs(startingSkillValue(10,halfCDF)-5)<1e-12);assert.throws(()=>startingSkillValue(10,1));
});
test('UP03 training reaches and exceeds affinity; both 10% penalties and slow exponential cost compose',()=>{
 assert.ok(Math.abs(trainingMultiplier(15,10,5)-.9**15)<1e-15);
 const costToOne=Math.expm1(Math.log(1.03))/Math.log(1.03);
 assert.ok(Math.abs(trainSkill(0,1,costToOne,100)-1)<1e-12);assert.ok(trainSkill(1,1,1,100)>1);
 assert.ok(trainSkill(15,10,1,5)<trainSkill(15,10,1,15));
 const whole=trainSkill(0,2,20,5),split=trainSkill(trainSkill(0,2,7,5),2,13,5);assert.ok(Math.abs(whole-split)<1e-12);
 assert.equal(trainSkill(100000,10,1,1),100000);assert.throws(()=>trainSkill(1,2,-1,3));
});
test('UP04 a full floor queues Constitution practice, survives return saves, then raises totals without a separate bonus',()=>{
 let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);
 g.members[1].enabled=false;g=setDungeonLimit(g,'wood',10);g=advance(startDay(g),15);g.members[0].enabled=false;
 const before=g.members[0].specializations.toughness.value,r=g.active[0],capacity=r.endurance.max,boss=floorCatalog('wood',1).boss[0];
 r.floorState={number:1,counted:10,successful:10,lastTreasure:false};r.floor=10;r.generated={id:boss.id,index:0,work:boss.checks[0].work*floorDifficulty('wood',1)-.001,attempts:0};r.progress=r.generated.work;
 g=advance(g,1);assert.equal(g.active[0].stage,'returning');assert.equal(g.active[0].endurance.max,capacity);assert.equal(g.members[0].specializations.toughness.value,before);assert.equal(g.active[0].skillPractice!.filter(p=>p.source==='floor').length,2);
 const corrupt=JSON.parse(exportSave(g));corrupt.game.active[0].skillPractice[0].id='not_a_skill';assert.throws(()=>parseSave(JSON.stringify(corrupt)));
 const restored=parseSave(exportSave(g));assert.deepEqual(advance(restored,15),advance(g,15));g=advance(g,15);
 assert.ok(g.members[0].specializations.toughness.value>before);assert.equal(g.members[0].constitutionExperience,0);assert.equal(g.members[0].stats.constitution.max,enduranceMaximum({...g.members[0],gear:0},[]));
 assert.deepEqual(parseSave(exportSave(g)),g);
});
test('UP05 max benchmarks use exactly Skill affinity and every legal gear combination, preserving overtraining in saves',()=>{
 const m=startingFriend(initialGame(),'arya'),before=JSON.stringify(m),max=atAffinity(m);
 assert.ok(Math.abs(skillMatrix(max).total-10)<1e-12);assert.equal(skillValue(max,'power'),2);assert.equal(JSON.stringify(m),before);
 const best=maximumMemberChance(m,'wood',10,['leather_armor','reinforced_armor','leather_pack']);assert.equal(best.evaluated,4);assert.ok(best.best.chance>.99);
 assert.equal(maximumMemberChance(m,'wood',11,['reinforced_armor']).best.chance,0);
 const g=initialGame();g.progression.completed.guild_founded={day:1,time:0};g.members=[m];g.nextId=2;m.specializations.power.value=3;syncSkillTotals(m);assert.deepEqual(parseSave(exportSave(g)),g);
});
test('UP06 v10 profiles and active progression remain historical; corruption of new totals and pending practice rejects',()=>{
 const g=initialGame();g.progression.completed.guild_founded={day:1,time:0};g.members=[startingFriend(g,'arya')];
 const legacy=initialGame();legacy.progression.completed.guild_founded={day:1,time:0};legacy.members=[recruit(legacy,true)];const data=JSON.parse(exportSave(legacy));data.version=data.game.version=10;const migrated=parseSave(JSON.stringify(data));assert.equal(migrated.version,11);assert.deepEqual(migrated.members,legacy.members);
 for(const mutate of [(h:any)=>h.members[0].stats.strength.max+=1,(h:any)=>h.members[0].specializations.power.affinity+=1,(h:any)=>h.members[0].constitutionExperience=1]){const raw=JSON.parse(exportSave(g));mutate(raw.game);assert.throws(()=>parseSave(JSON.stringify(raw)));}
});
