import {test} from 'node:test';
import assert from 'node:assert/strict';
import {challengeChance,classCeiling} from '../src/challenge-probability.ts';
import type {Challenge,ClassScope} from '../src/challenge-probability.ts';
const check={weight:1,checks:[{work:50,rate:{weights:{influence:.5,insight:.5}}}]};
const challenge:Challenge={id:'diplomacy-fixture',normal:[check],bonus:[{weight:1,requires:['gift'],checks:[{work:1,rate:{base:1}}]}],boss:[check],bonusChance:0,rooms:10,capacity:{weights:{influence:1}},drain:1,timeLimit:300};
const bare={id:'bare',modifiers:[]};
const scope=(budget:number):ClassScope=>({id:`fixture-budget-${budget}`,budget,bounds:{charisma:{min:1,max:budget},intelligence:{min:1,max:budget},a:{min:1,max:budget},b:{min:1,max:budget},c:{min:1,max:budget}},channels:{influence:{weights:{charisma:1}},insight:{weights:{intelligence:1}}},traits:[],loadouts:[bare]});
test('CP01 combat-independent odds and class proof reject the strongest legal low-budget class',()=>{
 const result=classCeiling(challenge,[scope(14)],.01);assert.equal(result.status,'proven-below');assert.equal(result.upper,0);assert.equal(result.evaluations,2);
 const result2=classCeiling(challenge,[scope(50)],.01);assert.equal(result2.status,'counterexample');assert.equal(result2.witness!.chance,1);
 assert.equal(Object.values(result2.witness!.allocation).reduce((a,b)=>a+b,0),50);
});
test('CP02 bounded search encloses exhaustive five-attribute optimum and never mistakes an optimistic vector for a recruit',()=>{
 const small={...scope(10),bounds:{charisma:{min:1,max:8},intelligence:{min:1,max:8},a:{min:1,max:1},b:{min:1,max:1},c:{min:1,max:1}}};
 const c={...challenge,normal:[{...check,checks:[{work:2,rate:{weights:{insight:1}}}]}],boss:[{...check,checks:[{work:2,rate:{weights:{insight:1}}}]}],rooms:1};
 let best=0;for(let charisma=1;charisma<=6;charisma++)best=Math.max(best,challengeChance(c,{allocation:{charisma,intelligence:7-charisma,a:1,b:1,c:1},channels:small.channels,traits:[]},bare).chance);
 const limited=classCeiling(c,[small],.99,1);assert.equal(limited.status,'inconclusive');assert.equal(limited.evaluations,0);assert.ok(limited.lower<=best&&limited.upper>=best);
 const result=classCeiling(c,[small],.99,100);assert.equal(result.status,'counterexample');assert.equal(result.lower,best);
});
test('CP03 weighted failures, optional capability skips, deadlines, ordered checks and equipment are explicit',()=>{
 const profile={allocation:{charisma:3,intelligence:3},channels:scope(10).channels,traits:[]};
 const room={weight:1,checks:[{work:1,rate:{base:1}},{work:1,rate:{base:1}}]};
 const c={...challenge,normal:[room,{...room,requires:['treaty']}],boss:[room],rooms:1,bonusChance:1,capacity:{base:5}};
 assert.equal(challengeChance(c,profile,bare).chance,.5); // 2 + skipped bonus 1 + boss 2
 assert.equal(challengeChance({...c,timeLimit:4},profile,bare).chance,0);
 assert.equal(challengeChance({...c,boss:[{...room,deadline:1}]},profile,bare).chance,0);
 const gear={id:'charm',modifiers:[{channel:'influence',catchup:9,flat:1,percent:1}]};
 assert.equal(challengeChance(challenge,profile,gear).budget,14);
 assert.throws(()=>challengeChance(challenge,profile,{id:'invalid',modifiers:[{channel:'influence',percent:-.1}]}));
 assert.throws(()=>classCeiling(challenge,[{...scope(3),budget:3}],.01));
});

test('CP04 allocation tradeoffs require branching; exhaustive legal odds remain inside the certificate',()=>{
 const s={...scope(5),bounds:{charisma:{min:1,max:4},intelligence:{min:1,max:4}}};
 const encounter={weight:1,checks:[{work:4,rate:{weights:{insight:1}}}]};
 const c={...challenge,normal:[encounter],boss:[encounter],rooms:2};
 for(let charisma=1;charisma<5;charisma++)assert.equal(challengeChance(c,{allocation:{charisma,intelligence:5-charisma},channels:s.channels,traits:[]},bare).chance,0);
 assert.equal(classCeiling(c,[s],.01,2).status,'inconclusive');
 const result=classCeiling(c,[s],.01,100);assert.equal(result.status,'proven-below');assert.equal(result.upper,0);assert.ok(result.evaluations>2);
});
