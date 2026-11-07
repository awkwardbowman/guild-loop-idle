import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ATTRIBUTE_BASELINE,formatNumber} from '../src/numbers.ts';
import {attributeValue,skillValue} from '../src/specialization.ts';
import {initialGame,completeStoryAction} from '../src/engine.ts';

test('NM01 tiny fallback remains nonzero for mechanics but renders as zero',()=>{
 assert.equal(ATTRIBUTE_BASELINE,.001);
 let g=initialGame();
 for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);
 const clyde=g.members.find(member=>member.origin==='clyde')!;
 assert.equal(attributeValue(clyde,'strength'),.001);
 assert.equal(skillValue(clyde,'power'),.001);
 assert.equal(formatNumber(attributeValue(clyde,'strength')),'0');
 assert.equal(formatNumber(skillValue(clyde,'power')),'0');
 assert.ok(attributeValue(clyde,'strength')>0);
 assert.equal(attributeValue(g.guildmaster,'soul'),8);
 assert.equal(skillValue(clyde,'finesse'),1);
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
