import {atAffinity} from './unit-potential.ts';
/** Adapter for current authored dungeons; generic Diplomacy scenarios use challenge-probability. */
import type {Member} from './engine.ts';
import type {DungeonRoom} from './rooms.ts';
import {floorCatalog,roomDungeon,checkProgressRate,roomEfficiency,floorDifficulty,enduranceMaximum,enduranceDrain} from './rooms.ts';
import {EQUIPMENT,equipmentCapacity,carryingLimit} from './equipment.ts';
import {resourceById} from './resources.ts';
import {WARP_SECONDS} from './content.ts';
import {challengeChance} from './challenge-probability.ts';
import type {Encounter} from './challenge-probability.ts';
/** Fresh entry, fixed stats, all ten standard encounters and boss successful. */
export function memberFloorChance(member:Member,dungeonId:string,floor:number,loadout=member.equipped){
 if(!Number.isInteger(floor)||floor<1||floor>100||!roomDungeon(dungeonId))throw Error('Invalid dungeon floor');
 if(loadout.length>equipmentCapacity(member)||new Set(loadout).size!==loadout.length||loadout.some(id=>!EQUIPMENT.some(e=>e.id===id)))throw Error('Illegal loadout');
 const actor={...member,gear:0},catalog=floorCatalog(dungeonId,floor),groups=roomDungeon(dungeonId).groups,scale=floorDifficulty(dungeonId,floor);
 const eligible=(room:DungeonRoom)=>room.checks.every(check=>checkProgressRate(actor,check,loadout)>0);
 const map=(rooms:DungeonRoom[]):Encounter[]=>rooms.map(room=>({
  weight:groups[room.group]*room.weight,
  requires:eligible(room)?[]:['unavailable'],
  deadline:roomEfficiency(actor,room,loadout)<.01?30:undefined,
  checks:room.checks.map(check=>({work:check.work*scale,rate:{base:checkProgressRate(actor,check,loadout)}}))
 }));
 const cargo=(room:DungeonRoom)=>!eligible(room)?0:room.checks.reduce((sum,check)=>sum+(check.guaranteed?.length?1+check.guaranteed.reduce((n,l)=>n+l.amount*resourceById(l.id).size,0):Math.max(1,...check.loot.map(l=>resourceById(l.id).size))),0);
 const maxCargo=10*Math.max(...catalog.normal.map(cargo))+10*Math.max(...catalog.treasure.map(cargo))+Math.max(...catalog.boss.map(cargo));
 if(maxCargo>carryingLimit(member.carryCapacity,loadout))throw Error('Cargo may bind: extend the probability state before evaluating this scenario');
 return challengeChance({id:`${dungeonId}:${floor}`,normal:map(catalog.normal),bonus:map(catalog.treasure),boss:map(catalog.boss),bonusChance:.15,rooms:10,capacity:{base:enduranceMaximum(actor,loadout)},drain:enduranceDrain((floor-1)*10+1),timeLimit:WARP_SECONDS},{allocation:{},channels:{},traits:[]},{id:loadout.join('+')||'bare',modifiers:[]});
}
/** Enumerates supplied available items, including bare and every legal slot combination. */
export function bestMemberLoadout(member:Member,dungeonId:string,floor:number,available:string[]){
 if(new Set(available).size!==available.length||available.some(id=>!EQUIPMENT.some(e=>e.id===id)))throw Error('Invalid available equipment');
 let combinations=1,choose=1;
 for(let k=1;k<=Math.min(available.length,equipmentCapacity(member));k++){choose=choose*(available.length-k+1)/k;combinations+=choose;}
 if(combinations>256)throw Error('More than 256 loadouts: declare a smaller equipment pool or use a bounded class search');
 const results:{loadout:string[];chance:number;budget:number;states:number}[]=[];
 const visit=(start:number,loadout:string[])=>{
  results.push({loadout:[...loadout],...memberFloorChance(member,dungeonId,floor,loadout)});
  if(loadout.length===equipmentCapacity(member))return;
  for(let i=start;i<available.length;i++)visit(i+1,[...loadout,available[i]]);
 };
 visit(0,[]);results.sort((a,b)=>b.chance-a.chance);return {best:results[0],evaluated:results.length,results};
}

/** Standard fully trained benchmark, over every supplied legal available loadout. */
export const maximumMemberChance=(member:Member,dungeonId:string,floor:number,available:string[])=>bestMemberLoadout(atAffinity(member),dungeonId,floor,available);
