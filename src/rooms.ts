import {isRarity} from './rarity.ts';
import type {Pools} from './attributes.ts';
import {zeroPools,STATS,SPECIALIZATIONS} from './attributes.ts';
import type {CheckActor} from './skill-system.ts';
import {effectiveAttribute,gainSkillExperience,SKILLS} from './skill-system.ts';
import {difficultyAtRoom,rollLoot,resourceById,cargoSize} from './resources.ts';
import type {LootEntry} from './resources.ts';
import {equipmentBonus} from './equipment.ts';
export const ROOM_GROUPS=['neutral','combat','trap','puzzle','boss','treasure'] as const;
export type RoomGroup=typeof ROOM_GROUPS[number];
export type RoomCheck={id:string;name:string;skill:string;requiredLevel:number;attributes:{attribute:string;weight:number}[];work:number;cost:Partial<Pools>;loot:LootEntry[];harvest?:boolean};
export type DungeonRoom={id:string;name:string;group:RoomGroup;rarity:number;weight:number;mandatory:boolean;checks:RoomCheck[]};
export type RoomDungeon={dungeonId:string;groups:Record<RoomGroup,number>;rooms:DungeonRoom[]};
export type GeneratedRoom={id:string;index:number;work:number;attempts:number};
const makeCheck=(id:string,name:string,skill:string,attributes:[string,number][],cost:Partial<Pools>,loot:LootEntry[],requiredLevel=0):RoomCheck=>({id,name,skill,requiredLevel,attributes:attributes.map(([attribute,weight])=>({attribute,weight})),work:4,cost,loot});
const salvage=[{id:'leather',weight:5},{id:'hide',weight:1},{id:'ore',weight:.3},{id:'herb',weight:.12}];
const catacombs:DungeonRoom[]=[
 {id:'crypt_passage',name:'Dusty passage',group:'neutral',rarity:0,weight:5,mandatory:true,checks:[makeCheck('pick_way','Pick a way through','athletics',[['agility',.5],['observation',.5]],{dexterity:.006},[{id:'leather',weight:2}])]},
 {id:'crypt_nest',name:'Abandoned nesting alcove',group:'neutral',rarity:0,weight:2,mandatory:false,checks:[makeCheck('search_nest','Search old nesting material','scavenging',[['observation',.5],['discovery',.5]],{perception:.008},salvage)]},
 {id:'crypt_scavenger',name:'A territorial scavenger',group:'combat',rarity:0,weight:5,mandatory:true,checks:[makeCheck('drive_off','Drive it away','combat',[['power',.4],['precision',.4],['toughness',.2]],{strength:.012,dexterity:.006},salvage)]},
 {id:'crypt_snare',name:'A rusted tripwire',group:'trap',rarity:0,weight:5,mandatory:true,checks:[makeCheck('step_past','Get past the snare','lock_picking',[['finesse',.6],['agility',.4]],{dexterity:.01,intelligence:.003},[{id:'leather',weight:3},{id:'ore',weight:.8}])]},
 {id:'crypt_runes',name:'Faded ritual markings',group:'puzzle',rarity:0,weight:5,mandatory:false,checks:[makeCheck('read_marks','Read the old markings','crypt_lore',[['planning',.6],['observation',.4]],{intelligence:.01},salvage,1)]},
 {id:'crypt_guardian',name:'An oversized crypt beetle',group:'boss',rarity:0,weight:5,mandatory:true,checks:[makeCheck('beetle','Turn back the beetle','combat',[['power',.5],['toughness',.5]],{strength:.02,constitution:.004},[{id:'hide',weight:4},{id:'leather',weight:4},{id:'ore',weight:1}])]},
 {id:'crypt_cache',name:'Forgotten supply cache',group:'treasure',rarity:0,weight:5,mandatory:false,checks:[makeCheck('open_cache','Recover the cache','scavenging',[['finesse',.35],['observation',.4],['discovery',.25]],{dexterity:.004,perception:.006},salvage)]},
 {id:'crypt_garden',name:'A damp herb-lined alcove',group:'treasure',rarity:0,weight:2,mandatory:false,checks:[{...makeCheck('harvest_herbs','Harvest the delicate herbs','harvesting',[['handiwork',.3],['observation',.5],['attunement',.2]],{dexterity:.004,perception:.008},[{id:'herb',weight:5},{id:'leather',weight:1}],1),harvest:true}]}
];
export const ROOM_DUNGEONS:RoomDungeon[]=[
 {dungeonId:'wood',groups:{neutral:5,combat:5,trap:2,puzzle:1,boss:.25,treasure:2},rooms:catacombs},
 {dungeonId:'ruins',groups:{neutral:3,combat:1,trap:5,puzzle:5,boss:.5,treasure:2},rooms:catacombs.map(room=>({...room,id:'archive_'+room.id,name:'Archive: '+room.name,checks:room.checks.map(check=>({...check,id:'archive_'+check.id,cost:Object.fromEntries(Object.entries(check.cost).map(([id,value])=>[id,value*1.5])),loot:check.loot.map(entry=>entry.id==='leather'?{id:'ink',weight:entry.weight}:entry.id==='hide'?{id:'relic',weight:entry.weight}:entry)}))}))},
 {dungeonId:'quarry',groups:{neutral:3,combat:5,trap:2,puzzle:1,boss:1,treasure:2},rooms:catacombs.map(room=>({...room,id:'delve_'+room.id,name:'Delve: '+room.name,checks:room.checks.map(check=>({...check,id:'delve_'+check.id,cost:Object.fromEntries(Object.entries(check.cost).map(([id,value])=>[id,value*2])),loot:check.loot.map(entry=>entry.id==='leather'?{id:'ore',weight:entry.weight}:entry.id==='hide'?{id:'crystal',weight:entry.weight}:entry)}))}))}
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
export const roomExertion=(depth:number,loadout:string[])=>.063*difficultyAtRoom(depth)/(1+equipmentBonus(loadout,'constitution'));
export const checkRating=(actor:CheckActor,check:RoomCheck,loadout:string[])=>check.attributes.reduce((rating,contribution)=>{
 const parent=contribution.attribute==='toughness'?'constitution':contribution.attribute==='endurance'?'constitution':null;
 return rating+contribution.weight*effectiveAttribute(actor,contribution.attribute,.5)*(1+(parent?equipmentBonus(loadout,parent):0));
},0);
export function roomCheckStep(input:CheckActor,check:RoomCheck,state:GeneratedRoom,depth:number,loadout:string[],random:()=>number,now:number){
 const actor=structuredClone(input),next=structuredClone(state),training=zeroPools();const specializationTraining:Record<string,number>={};
 if((actor.skills[check.skill]?.level??0)<check.requiredLevel)return {actor,state:next,outcome:'ineligible' as const,training,specializationTraining};
 const scale=difficultyAtRoom(depth),cost={...check.cost,constitution:(check.cost.constitution??0)+.001};
 for(const [stat,amount]of Object.entries(cost))if(actor.stats[stat as keyof Pools].current<=amount*scale)return {actor,state:next,outcome:'exhausted' as const,training,specializationTraining};
 next.work+=1+Math.min(1,checkRating(actor,check,loadout)/5);
 if(next.work<check.work*scale)return {actor,state:next,outcome:'working' as const,training,specializationTraining};
 next.work=0;next.attempts++;
 for(const [stat,amount]of Object.entries(cost))actor.stats[stat as keyof Pools].current-=amount*scale;
 const chance=Math.max(.15,Math.min(.98,.83+checkRating(actor,check,loadout)*.06+actor.skills[check.skill].level*.02-(scale-1)*.06));
 if(random()>=chance)return {actor,state:next,outcome:'failed' as const,training,specializationTraining};
 gainSkillExperience(actor.skills[check.skill],2,now);
 for(const contribution of check.attributes)specializationTraining[contribution.attribute]=.01*contribution.weight;
 for(const [stat,amount]of Object.entries(cost))training[stat as keyof Pools]=amount*.15;
 return {actor,state:next,outcome:'success' as const,training,specializationTraining};
}
export function roomRewards(check:RoomCheck,depth:number,remainingCarry:number,canHarvest:boolean,random:()=>number){
 const budget=Math.min(remainingCarry,roomLootBudget(depth,random));
 return rollLoot(check.loot,budget,depth,random,id=>id!=='herb'||canHarvest);
}
export function fitCargo(loot:Record<string,number>,capacity:number):Record<string,number>{const result:Record<string,number>={};let remaining=capacity;for(const [id,count]of Object.entries(loot)){const amount=Math.min(count,Math.floor(remaining/resourceById(id).size));if(amount)result[id]=amount;remaining-=amount*resourceById(id).size;}return result;}

export function validateRoomDungeon(dungeon:RoomDungeon){
 const positive=(value:number)=>Number.isFinite(value)&&value>0;
 if(!dungeon.dungeonId||ROOM_GROUPS.some(group=>!positive(dungeon.groups[group]))||new Set(dungeon.rooms.map(room=>room.id)).size!==dungeon.rooms.length)throw Error('Invalid room group weights');
 for(const group of ROOM_GROUPS)if(!dungeon.rooms.some(room=>room.group===group))throw Error('Empty room group');
 for(const room of dungeon.rooms){
  if(!positive(room.weight)||!room.checks.length||!isRarity(room.rarity))throw Error('Invalid room weight or checks');
  for(const check of room.checks){
   if(!SKILLS.some(skill=>skill.id===check.skill)||!Number.isInteger(check.requiredLevel)||check.requiredLevel<0||!positive(check.work)||Math.abs(check.attributes.reduce((sum,attribute)=>sum+attribute.weight,0)-1)>1e-9||check.attributes.some(attribute=>!SPECIALIZATIONS.some(known=>known.id===attribute.attribute)||!positive(attribute.weight))||Object.entries(check.cost).some(([stat,cost])=>!STATS.includes(stat as keyof Pools)||!Number.isFinite(cost)||cost<0))throw Error('Invalid room check');
  }
 }
}
ROOM_DUNGEONS.forEach(validateRoomDungeon);
