import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DUNGEON_PROFILES,dungeonAttributeMix,dungeonFit,validateDungeonProfile,checkAttributeMix} from '../src/dungeon-profiles.ts';
import {DUNGEONS,STATS} from '../src/content.ts';
import {TRAP_ROOM} from '../src/skill-system.ts';
import {sandboxGame} from '../src/engine.ts';
test('DP01 every dungeon has a unique authored check sequence and normalized attribute/importance weights',()=>{
 assert.deepEqual(DUNGEON_PROFILES.map(profile=>profile.dungeonId),DUNGEONS.map(dungeon=>dungeon.id));
 assert.equal(new Set(DUNGEON_PROFILES.map(profile=>profile.checks.map(check=>check.id).join(','))).size,DUNGEONS.length);
 for(const profile of DUNGEON_PROFILES){validateDungeonProfile(profile);assert.ok(Math.abs(dungeonAttributeMix(profile).reduce((sum,attribute)=>sum+attribute.weight,0)-1)<1e-9);}
});
test('DP02 archive overview derives its attributes from the actual authored skill-check channels',()=>{
 const profile=DUNGEON_PROFILES.find(profile=>profile.dungeonId==='ruins')!;profile.checks.forEach((check,index)=>assert.deepEqual(check.attributes,checkAttributeMix(TRAP_ROOM.checks[index])));
});
test('DP03 member comparison weights the relevant abilities and reflects specialist training without spending resources',()=>{
 const profile=DUNGEON_PROFILES[0],member=sandboxGame().members[0],actor={...member,gear:0};for(const stat of STATS)actor.stats[stat]={current:20,max:20,affinity:60};
 const original=structuredClone(actor);assert.ok(Math.abs(dungeonFit(actor,profile)-10)<1e-9);assert.deepEqual(actor,original);
 actor.specializations.force.value=20;const weighted=dungeonAttributeMix(profile).find(attribute=>attribute.attribute==='force')!.weight;
 assert.ok(Math.abs(dungeonFit(actor,profile)-(10+10*weighted))<1e-9);
});
test('DP04 invalid authored profiles reject unknown attributes, negative/unnormalized and duplicate weights',()=>{
 for(const mutate of [(profile:any)=>profile.checks[0].importance=2,(profile:any)=>profile.checks[0].attributes[0].attribute='missing',(profile:any)=>profile.checks[0].attributes[0].weight=-1,(profile:any)=>profile.checks[1].id=profile.checks[0].id]){const profile=structuredClone(DUNGEON_PROFILES[0]);mutate(profile);assert.throws(()=>validateDungeonProfile(profile));}
});
