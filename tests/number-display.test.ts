import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MIN_PROGRESS_RATE,formatNumber} from '../src/numbers.ts';
import {checkRating,checkProgressRate,roomCheckStep,roomById,roomEfficiency} from '../src/rooms.ts';
import {attributeValue,skillValue} from '../src/specialization.ts';
import {initialGame,completeStoryAction} from '../src/engine.ts';

test('NM01 unowned stats are exactly zero; minimum rate applies only to eligible work',()=>{
 assert.equal(MIN_PROGRESS_RATE,.001);
 let g=initialGame();
 for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);
 const clyde=g.members.find(member=>member.origin==='clyde')!;
 assert.equal(attributeValue(clyde,'strength'),0);
 assert.equal(skillValue(clyde,'power'),0);
 assert.equal(formatNumber(attributeValue(clyde,'strength')),'0');
 assert.equal(formatNumber(skillValue(clyde,'power')),'0');
 assert.equal(attributeValue(clyde,'strength'),0);
 assert.equal(attributeValue(g.guildmaster,'soul'),8);
 assert.equal(skillValue(clyde,'finesse'),1);
 const actor={...clyde,gear:0};
 const combat=roomById('wood','crypt_scavenger').checks[0];
 const zeroPowerCheck={...combat,attributes:[{attribute:'power',weight:1}]};
 assert.equal(checkRating(actor,zeroPowerCheck,[]),0);
 assert.equal(checkProgressRate(actor,zeroPowerCheck,[]),.001);
 const work=roomCheckStep(actor,zeroPowerCheck,{id:'crypt_scavenger',index:0,work:0,attempts:0},1,[],()=>0,1);
 assert.equal(work.outcome,'working');
 assert.equal(work.state.work,.001);
 const invalidCheck={...zeroPowerCheck,skill:'crypt_lore',requiredLevel:1};
 assert.equal(checkProgressRate(actor,invalidCheck,[]),0);
 const invalid=roomCheckStep(actor,invalidCheck,{id:'crypt_scavenger',index:0,work:0,attempts:0},1,[],()=>0,1);
 assert.equal(invalid.outcome,'ineligible');
 assert.equal(invalid.state.work,0);
 const noAbilityRoom={...roomById('wood','crypt_scavenger'),checks:[zeroPowerCheck]};
 assert.ok(roomEfficiency(actor,noAbilityRoom,[])>0);
 const impossibleRoom={...noAbilityRoom,checks:[invalidCheck]};
 assert.equal(roomEfficiency(actor,impossibleRoom,[]),0);
});

test('NM02 all displayed numbers have at most two fractional places without truncating gameplay',()=>{
 assert.equal(formatNumber(1.234),'1.23');
 assert.equal(formatNumber(1.236),'1.24');
 assert.equal(formatNumber(.005),'0.01');
 assert.equal(formatNumber(.001),'0');
 assert.equal(formatNumber(5),'5');
 assert.equal(formatNumber(5.5),'5.5');
 assert.equal(formatNumber(0),'0');
});
