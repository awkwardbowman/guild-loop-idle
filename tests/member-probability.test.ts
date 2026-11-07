import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,startingFriend} from '../src/engine.ts';
import {memberFloorChance,bestMemberLoadout} from '../src/member-probability.ts';
import {firstTenClearChance} from '../src/floor-probability.ts';
test('MP01 arbitrary member adapter agrees with first-ten worksheet and compares all legal supplied gear',()=>{
 const member=startingFriend(initialGame(),'arya');member.constitutionExperience=9;
 const before=JSON.stringify(member);
 assert.equal(memberFloorChance(member,'wood',10).chance,firstTenClearChance(10).chance);
 const best=bestMemberLoadout(member,'wood',10,['leather_armor','reinforced_armor','leather_pack']);
 assert.equal(best.evaluated,4);assert.equal(best.best.loadout[0],'reinforced_armor');assert.ok(best.best.chance>.95);
 assert.equal(JSON.stringify(member),before);
 assert.throws(()=>memberFloorChance(member,'wood',10,['leather_armor','reinforced_armor']));
 assert.throws(()=>memberFloorChance({...member,carryCapacity:0},'wood',10));
});
