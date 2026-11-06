import {isRarity} from './rarity.ts';
import type {Pools} from './attributes.ts';
import {zeroPools,STATS,SPECIALIZATIONS} from './attributes.ts';
import type {CheckActor} from './skill-system.ts';
import {gainSkillExperience,SKILLS,rootPool,isSkillDiscovered} from './skill-system.ts';
import {difficultyAtRoom,rollLoot,resourceById,cargoSize} from './resources.ts';
import type {LootEntry} from './resources.ts';
import {equipmentValue} from './equipment.ts';
import {skillValue,ownsSkill,canLearnComposite} from './specialization.ts';
export const ROOM_GROUPS=['neutral','combat','trap','puzzle','boss','treasure'] as const;
export type RoomGroup=typeof ROOM_GROUPS[number];
export type RoomCheck={id:string;name:string;skill:string;requiredLevel:number;attributes:{attribute:string;weight:number}[];work:number;loot:LootEntry[];harvest?:boolean;guaranteed?:{id:string;amount:number}[]};
export type DungeonRoom={id:string;name:string;group:RoomGroup;rarity:number;weight:number;mandatory:boolean;failure:'injury'|'return';referenceRate:number;checks:RoomCheck[]};
export type RoomDungeon={dungeonId:string;groups:Record<RoomGroup,number>;rooms:DungeonRoom[]};
export type GeneratedRoom={id:string;index:number;work:number;attempts:number};
const makeCheck=(id:string,name:string,skill:string,attributes:[string,number][],loot:LootEntry[],requiredLevel=0):RoomCheck=>({id,name,skill,requiredLevel,attributes:attributes.map(([attribute,weight])=>({attribute,weight})),work:.5,loot});
const salvage=[{id:'leather',weight:2},{id:'herb',weight:1}];
const catacombs:DungeonRoom[]=[
 {id:'crypt_passage',name:'Dusty passage',group:'neutral',failure:'return',referenceRate:10,rarity:0,weight:5,mandatory:true,checks:[makeCheck('pick_way','Pick a way through','athletics',[['agility',.5],['observation',.5]],[])]},
 {id:'crypt_nest',name:'Abandoned nesting alcove',group:'neutral',failure:'return',referenceRate:10,rarity:0,weight:2,mandatory:false,checks:[makeCheck('search_nest','Search old nesting material','scavenging',[['observation',.5],['discovery',.5]],[])]},
 {id:'crypt_scavenger',name:'A territorial scavenger',group:'combat',failure:'return',referenceRate:10,rarity:0,weight:5,mandatory:true,checks:[makeCheck('drive_off','Drive it away','combat',[['power',.75],['constitution',.25]],[])]},
 {id:'crypt_snare',name:'A rusted tripwire',group:'trap',failure:'injury',referenceRate:10,rarity:0,weight:5,mandatory:true,checks:[makeCheck('step_past','Get past the snare','athletics',[['agility',.75],['constitution',.25]],[])]},
 {id:'crypt_runes',name:'Faded ritual markings',group:'puzzle',failure:'return',referenceRate:10,rarity:0,weight:5,mandatory:false,checks:[makeCheck('read_marks','Read the old markings','crypt_lore',[['planning',.6],['observation',.4]],[])]},
 {id:'crypt_guardian',name:'An oversized crypt beetle',group:'boss',failure:'injury',referenceRate:10,rarity:0,weight:5,mandatory:true,checks:[{...makeCheck('beetle','Turn back the beetle','combat',[['power',.75],['constitution',.25]],[]),guaranteed:[{id:'leather',amount:1}]}]},
 {id:'crypt_cache',name:'Forgotten supply cache',group:'treasure',failure:'return',referenceRate:10,rarity:0,weight:5,mandatory:false,checks:[makeCheck('open_cache','Recover the cache','scavenging',[['finesse',.35],['observation',.4],['discovery',.25]],salvage)]},
 {id:'crypt_garden',name:'A damp herb-lined alcove',group:'treasure',failure:'return',referenceRate:10,rarity:0,weight:2,mandatory:false,checks:[{...makeCheck('harvest_herbs','Harvest the delicate herbs','herbology',[['handiwork',.4],['observation',.6]],[{id:'herb',weight:5},{id:'leather',weight:1}],1),harvest:true}]}
];
export const ROOM_DUNGEONS:RoomDungeon[]=[
 {dungeonId:'wood',groups:{neutral:5,combat:5,trap:2,puzzle:1,boss:.25,treasure:2},rooms:catacombs},
 {dungeonId:'ruins',groups:{neutral:3,combat:1,trap:5,puzzle:5,boss:.5,treasure:2},rooms:catacombs.map(room=>({...room,id:'archive_'+room.id,name:'Archive: '+room.name,checks:room.checks.map(check=>({...check,id:'archive_'+check.id,work:check.work*1.5,loot:check.loot.map(entry=>entry.id==='leather'?{id:'ink',weight:entry.weight}:entry.id==='hide'?{id:'relic',weight:entry.weight}:entry)}))}))},
 {dungeonId:'quarry',groups:{neutral:3,combat:5,trap:2,puzzle:1,boss:1,treasure:2},rooms:catacombs.map(room=>({...room,id:'delve_'+room.id,name:'Delve: '+room.name,checks:room.checks.map(check=>({...check,id:'delve_'+check.id,work:check.work*2,loot:check.loot.map(entry=>entry.id==='leather'?{id:'ore',weight:entry.weight}:entry.id==='hide'?{id:'crystal',weight:entry.weight}:entry)}))}))}
];
export const roomDungeon=(id:string)=>ROOM_DUNGEONS.find(dungeon=>dungeon.dungeonId===id)!;
export const roomById=(dungeonId:string,id:string)=>roomDungeon(dungeonId).rooms.find(room=>room.id===id)!;
export function weightedPick<T>(items:readonly T[],weight:(item:T)=>number,random:()=>number):T{
 const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid room roll');let roll=value*items.reduce((sum,item)=>sum+weight(item),0);
 return items.find(item=>(roll-=weight(item))<0)??items.at(-1)!;
}
export function rollRoom(dungeonId:string,random:()=>number,multipliers:Partial<Record<RoomGroup,number>>={}):GeneratedRoom{
 const dungeon=roomDungeon(dungeonId);const group=weightedPick(ROOM_GROUPS,group=>dungeon.groups[group]*(multipliers[group]??1),random);
 const room=weightedPick(dungeon.rooms.filter(room=>room.group===group),room=>room.weight,random);return {id:room.id,index:0,work:0,attempts:0};
}
export const roomLootBudget=(depth:number,random:()=>number)=>1+Math.floor((depth-1)/4)+(random()<.5?0:1);
export const checkRating=(actor:CheckActor,check:RoomCheck,loadout:string[])=>check.attributes.reduce((rating,entry)=>rating+entry.weight*equipmentValue(skillValue(actor,entry.attribute),loadout,rootPool(entry.attribute)),0);
export const canonicalFloor=(room:number)=>Math.floor((room-1)/10)+1;
export const enduranceDrain=(room:number)=>.05*(1+(canonicalFloor(room)-1)*.2);
export const enduranceMaximum=(actor:CheckActor,loadout:string[])=>SPECIALIZATIONS.filter(s=>s.parent==='constitution'&&ownsSkill(actor,s.id)).reduce((sum,s)=>sum+equipmentValue(skillValue(actor,s.id),loadout,'constitution'),0);
/** Seconds needed at the current check values, divided into total authored work. */
export function roomEfficiency(actor:CheckActor,room:DungeonRoom,loadout:string[]){
 const work=room.checks.reduce((n,c)=>n+c.work,0);
 const seconds=room.checks.reduce((n,c)=>n+c.work/checkRating(actor,c,loadout),0);
 return work/seconds/(room.referenceRate??1);
}
export function roomCheckCosts(_check:RoomCheck,depth=1):Pools{const costs=zeroPools();costs.constitution=enduranceDrain(depth);return costs;}
/** Pure work/training step. The engine pays its separate run-specific endurance meter. */
export function roomCheckStep(input:CheckActor,check:RoomCheck,state:GeneratedRoom,depth:number,loadout:string[],_random:()=>number,now:number){
 const actor=structuredClone(input),next=structuredClone(state),training=zeroPools(),specializationTraining:Record<string,number>={};
 // Generic danger checks use weighted work; only specific Composite activities have hard gates.
 if(check.skill==='scavenging'&&!actor.selections?.attributes.includes('perception'))return {actor,state:next,outcome:'ineligible' as const,training,specializationTraining};
 if(check.requiredLevel>0&&check.skill!=='combat'&&(!isSkillDiscovered(actor.skills[check.skill])||actor.skills[check.skill].level<check.requiredLevel))return {actor,state:next,outcome:'ineligible' as const,training,specializationTraining};
 next.work+=checkRating(actor,check,loadout);next.attempts++;
 if(next.work+1e-9<check.work*difficultyAtRoom(depth))return {actor,state:next,outcome:'working' as const,training,specializationTraining};
 next.work=0;
 if(canLearnComposite(actor,check.skill))gainSkillExperience(actor.skills[check.skill],2,now);
 for(const entry of check.attributes){
  if(ownsSkill(actor,entry.attribute))specializationTraining[entry.attribute]=.01*entry.weight;
  const stat=rootPool(entry.attribute);if(actor.selections?.attributes.includes(stat))training[stat]+=.01*entry.weight;
 }
 return {actor,state:next,outcome:'success' as const,training,specializationTraining};
}
export function roomRewards(check:RoomCheck,depth:number,remainingCarry:number,canHarvest:boolean,random:()=>number){
 if(remainingCarry<1)return {};
 if(check.guaranteed?.length){const result:Record<string,number>={};let space=remainingCarry;for(const entry of check.guaranteed){const amount=Math.min(entry.amount,Math.floor(space/resourceById(entry.id).size));if(amount){result[entry.id]=amount;space-=amount*resourceById(entry.id).size;}}if(space>0)result.chips=1;return result;}
 if(!check.loot.length)return {chips:1};
 // A treasure gives a single weighted find; skill/space gate herbs. No common-room salvage shower.
 const eligible=check.loot.filter(entry=>(entry.id!=='herb'||canHarvest)&&resourceById(entry.id).size<=remainingCarry);
 const choices=[{id:'chips',weight:1},...eligible],chosen=weightedPick(choices,entry=>entry.weight,random);return {[chosen.id]:1};
}
export function fitCargo(loot:Record<string,number>,capacity:number):Record<string,number>{const result:Record<string,number>={};let remaining=capacity;for(const [id,count]of Object.entries(loot)){const amount=Math.min(count,Math.floor(remaining/resourceById(id).size));if(amount)result[id]=amount;remaining-=amount*resourceById(id).size;}return result;}

export function validateRoomDungeon(dungeon:RoomDungeon){
 const positive=(value:number)=>Number.isFinite(value)&&value>0;
 if(!dungeon.dungeonId||ROOM_GROUPS.some(group=>!positive(dungeon.groups[group]))||new Set(dungeon.rooms.map(room=>room.id)).size!==dungeon.rooms.length)throw Error('Invalid room group weights');
 for(const group of ROOM_GROUPS)if(!dungeon.rooms.some(room=>room.group===group))throw Error('Empty room group');
 for(const room of dungeon.rooms){
  if(!positive(room.weight)||!room.checks.length||!isRarity(room.rarity)||!['injury','return'].includes(room.failure??'')||!positive(room.referenceRate??0))throw Error('Invalid room weight or checks');
  for(const check of room.checks){
   if(!SKILLS.some(skill=>skill.id===check.skill)||!Number.isInteger(check.requiredLevel)||check.requiredLevel<0||!positive(check.work)||Math.abs(check.attributes.reduce((sum,attribute)=>sum+attribute.weight,0)-1)>1e-9||check.attributes.some(attribute=>(!STATS.includes(attribute.attribute as keyof Pools)&&!SPECIALIZATIONS.some(known=>known.id===attribute.attribute))||!positive(attribute.weight)))throw Error('Invalid room check');
  }
 }
}
ROOM_DUNGEONS.forEach(validateRoomDungeon);
