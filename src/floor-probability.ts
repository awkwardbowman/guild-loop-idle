/** Analytic floor-clear odds. No clock advancement, RNG sampling or player-save access. */
import {initialGame,startingFriend} from './engine.ts';
import {floorCatalog,roomDungeon,checkProgressRate,roomEfficiency,floorDifficulty,enduranceMaximum,enduranceDrain} from './rooms.ts';
import type {DungeonRoom} from './rooms.ts';
import {carryingLimit} from './equipment.ts';
import {resourceById} from './resources.ts';
import {WARP_SECONDS} from './content.ts';
export type TimeOutcome={seconds:number;probability:number};
type Distribution=Map<number,number>;
const EPS=1e-9;
function distribution(outcomes:TimeOutcome[]):Distribution{
 if(!outcomes.length||outcomes.some(o=>!Number.isInteger(o.seconds)||o.seconds<1||!Number.isFinite(o.probability)||o.probability<0)||Math.abs(outcomes.reduce((n,o)=>n+o.probability,0)-1)>EPS)throw Error('Invalid encounter probability distribution');
 const result:Distribution=new Map();for(const o of outcomes)if(o.probability>0)result.set(o.seconds,(result.get(o.seconds)??0)+o.probability);return result;
}
function convolve(a:Distribution,b:Distribution):Distribution{
 const result:Distribution=new Map();for(const [s,p]of a)for(const [t,q]of b)if(p*q>0)result.set(s+t,(result.get(s+t)??0)+p*q);return result;
}
/** Ten independent counted slots; each slot has at most one bonus before it, then one final boss. */
export function floorClearProbability({normal,treasure,boss,capacity,drain,treasureChance=.15,rooms=10}:{normal:TimeOutcome[];treasure:TimeOutcome[];boss:TimeOutcome[];capacity:number;drain:number;treasureChance?:number;rooms?:number}){
 if(!Number.isFinite(capacity)||capacity<0||!Number.isFinite(drain)||drain<=0||!Number.isFinite(treasureChance)||treasureChance<0||treasureChance>1||!Number.isInteger(rooms)||rooms<1||rooms>1000)throw Error('Invalid floor probability inputs');
 const normalTimes=distribution(normal),treasureTimes=distribution(treasure),bossTimes=distribution(boss);
 const bonus:Distribution=new Map();if(treasureChance<1)bonus.set(0,1-treasureChance);
 for(const [t,p]of treasureTimes)if(treasureChance>0)bonus.set(t,p*treasureChance);
 const slot=convolve(bonus,normalTimes);let times:Distribution=new Map([[0,1]]);
 for(let i=0;i<rooms;i++)times=convolve(times,slot);
 times=convolve(times,bossTimes);
 const budget=Math.floor((capacity+EPS)/drain),chance=[...times].filter(([t])=>t<=budget).reduce((n,[,p])=>n+p,0);
 return {chance:Math.min(1,Math.max(0,chance)),budget,mass:[...times.values()].reduce((a,b)=>a+b,0),minSeconds:Math.min(...times.keys()),maxSeconds:Math.max(...times.keys()),meanSeconds:[...times].reduce((n,[t,p])=>n+t*p,0)};
}
/** Conservative fresh-entry Arya: earned floor XP, no ordinary practice; optional existing armor. */
export function firstTenClearChance(floor:number,armor=false,constitutionXP=floor-1){
 if(!Number.isInteger(floor)||floor<1||floor>10)throw Error('This balance procedure is defined for floors 1–10');
 if(!Number.isInteger(constitutionXP)||constitutionXP<0||constitutionXP>1e9)throw Error('Invalid Constitution XP');
 const member=startingFriend(initialGame(),'arya');member.constitutionExperience=constitutionXP;
 const loadout=armor?['leather_armor']:[],actor={...member,gear:0},catalog=floorCatalog('wood',floor),groups=roomDungeon('wood').groups,scale=floorDifficulty('wood',floor);
 if(catalog.normal.length!==10)throw Error('Update the procedure for a different standard-room catalog');
 const outcomes=(rooms:DungeonRoom[],standard=false):TimeOutcome[]=>{
  const total=rooms.reduce((n,r)=>n+groups[r.group]*r.weight,0);
  return rooms.map(room=>{
   if(room.checks.length!==1)throw Error('Extend the procedure before modeling multi-check encounters');
   const check=room.checks[0],rate=checkProgressRate(actor,check,loadout);
   if(!rate&&(standard||room.mandatory))throw Error('A required encounter is ineligible; model an explicit failure branch');
   const seconds=rate?Math.max(1,Math.ceil((check.work*scale-EPS)/rate)):1;
   if(rate&&roomEfficiency(actor,room,loadout)<.01&&seconds>30)throw Error('Extend the procedure to include the low-skill deadline');
   return {seconds,probability:groups[room.group]*room.weight/total};
  });
 };
 const capacity=enduranceMaximum(actor,loadout),drain=enduranceDrain((floor-1)*10+1);
 const result=floorClearProbability({normal:outcomes(catalog.normal,true),treasure:outcomes(catalog.treasure),boss:outcomes(catalog.boss,true),capacity,drain});
 // Cargo and ward time must be provably non-binding before using a time-only calculation.
 const cargo=(room:DungeonRoom)=>{const c=room.checks[0];if(!checkProgressRate(actor,c,loadout))return 0;if(c.guaranteed?.length)return 1+c.guaranteed.reduce((n,l)=>n+l.amount*resourceById(l.id).size,0);return Math.max(1,...c.loot.filter(l=>l.id!=='herb'||member.skills.herbology.discovered===true).map(l=>resourceById(l.id).size));};
 const maxCargo=10*Math.max(...catalog.normal.map(cargo))+10*Math.max(...catalog.treasure.map(cargo))+Math.max(...catalog.boss.map(cargo));
 if(maxCargo>carryingLimit(member.carryCapacity,loadout)||result.maxSeconds>WARP_SECONDS)throw Error('Extend the procedure to include cargo or outing-time limits');
 return {floor,armor,constitutionXP:member.constitutionExperience,workMultiplier:scale,capacity,drain,...result};
}
