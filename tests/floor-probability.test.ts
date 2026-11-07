import {test} from 'node:test';
import assert from 'node:assert/strict';
import {floorClearProbability} from '../src/floor-probability.ts';
// Each slot costs 1, 2, 3 or 4 seconds with probability 1/4.
// Two slots + a 2-second boss: six of the 16 equally likely paths fit six seconds.
const example={normal:[{seconds:1,probability:.5},{seconds:3,probability:.5}],treasure:[{seconds:1,probability:1}],boss:[{seconds:2,probability:1}],treasureChance:.5,rooms:2,capacity:6,drain:1};
test('FP01 floor probability matches a hand-enumerated example, rather than an expected-time cutoff',()=>{
 const p=floorClearProbability(example);assert.equal(p.chance,6/16);assert.equal(p.mass,1);assert.equal(p.minSeconds,4);assert.equal(p.maxSeconds,10);assert.equal(p.meanSeconds,7);
 assert.equal(floorClearProbability({...example,capacity:3}).chance,0);assert.equal(floorClearProbability({...example,capacity:10}).chance,1);
});
test('FP02 probability budgets include exact final-tick funding, reject invalid distributions and conserve mass',()=>{
 const fixed={...example,normal:[{seconds:1,probability:1}],treasureChance:0,capacity:2,drain:.5};
 assert.equal(floorClearProbability(fixed).chance,1);assert.equal(floorClearProbability({...fixed,capacity:1.999}).chance,0);
 for(const input of [{...example,drain:0},{...example,capacity:-1},{...example,treasureChance:2},{...example,rooms:1.5},{...example,normal:[{seconds:1,probability:.2}]},{...example,boss:[{seconds:2,probability:-1}]},{...example,normal:[{seconds:1.5,probability:1}]}])assert.throws(()=>floorClearProbability(input));
 assert.equal(floorClearProbability({...example,treasureChance:1}).mass,1);
});
