import {isRarity} from './rarity.ts';
import type {Pools} from './attributes.ts';
import {zeroPools,STATS,SPECIALIZATIONS} from './attributes.ts';
import type {CheckActor} from './skill-system.ts';
import {gainSkillExperience,SKILLS,rootPool,isSkillDiscovered} from './skill-system.ts';
import {difficultyAtRoom,rollLoot,resourceById,cargoSize} from './resources.ts';
import type {LootEntry} from './resources.ts';
import {equipmentValue} from './equipment.ts';
import {skillValue,ownsSkill,canLearnComposite} from './specialization.ts';
import {MIN_PROGRESS_RATE} from './numbers.ts';
export const ROOM_GROUPS=['neutral','combat','trap','puzzle','boss','treasure'] as const;
export type RoomGroup=typeof ROOM_GROUPS[number];
export type RoomCheck={activityLevel?:number;id:string;name:string;skill:string;requiredLevel:number;attributes:{attribute:string;weight:number}[];work:number;loot:LootEntry[];harvest?:boolean;guaranteed?:{id:string;amount:number}[]};
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
// Room names are authored by location; IDs, checks, loot and weights still use the shared early-room templates.
const archiveRoomNames:Record<string,string>={
 crypt_passage:'Dust-choked reading hall',
 crypt_nest:'Nest of torn folios',
 crypt_scavenger:'Ink-stained scavenger',
 crypt_snare:'Snapped shelf tripwire',
 crypt_runes:'Faded catalog wards',
 crypt_guardian:'The librarian’s beetle',
 crypt_cache:'Discarded provision locker',
 crypt_garden:'Overgrown conservatory nook'
};
const delveRoomNames:Record<string,string>={
 crypt_passage:'Shale-choked tunnel',
 crypt_nest:'Abandoned miner’s nook',
 crypt_scavenger:'Territorial ridge scavenger',
 crypt_snare:'Loose scree tripline',
 crypt_runes:'Weathered survey glyphs',
 crypt_guardian:'Furnace-backed beetle',
 crypt_cache:'Forgotten mining supplies',
 crypt_garden:'Mineral spring herbs'
};
export const ROOM_DUNGEONS:RoomDungeon[]=[
 {dungeonId:'wood',groups:{neutral:5,combat:5,trap:2,puzzle:1,boss:.25,treasure:2},rooms:catacombs},
 {dungeonId:'ruins',groups:{neutral:3,combat:1,trap:5,puzzle:5,boss:.5,treasure:2},rooms:catacombs.map(room=>({...room,id:'archive_'+room.id,name:archiveRoomNames[room.id]??room.name,checks:room.checks.map(check=>({...check,id:'archive_'+check.id,work:check.work*1.5,loot:check.loot.map(entry=>entry.id==='leather'?{id:'ink',weight:entry.weight}:entry.id==='hide'?{id:'relic',weight:entry.weight}:entry)}))}))},
 {dungeonId:'quarry',groups:{neutral:3,combat:5,trap:2,puzzle:1,boss:1,treasure:2},rooms:catacombs.map(room=>({...room,id:'delve_'+room.id,name:delveRoomNames[room.id]??room.name,checks:room.checks.map(check=>({...check,id:'delve_'+check.id,work:check.work*2,loot:check.loot.map(entry=>entry.id==='leather'?{id:'ore',weight:entry.weight}:entry.id==='hide'?{id:'crystal',weight:entry.weight}:entry)}))}))}
];
export const roomDungeon=(id:string)=>ROOM_DUNGEONS.find(dungeon=>dungeon.dungeonId===id)!;
export const roomById=(dungeonId:string,id:string):DungeonRoom=>{
 const match=/^f(\d+)-(normal|treasure|boss)-(\d+)$/.exec(id);
 return match?floorCatalog(dungeonId,Number(match[1]))[match[2] as EncounterCategory][Number(match[3])]:roomDungeon(dungeonId).rooms.find(room=>room.id===id)!;
};
export type EncounterCategory='normal'|'treasure'|'boss';
export type FloorState={number:number;counted:number;successful:number;lastTreasure:boolean};
export type FloorKnowledge={known:string[];bossCleared:boolean};
export type DungeonKnowledge=Record<string,Record<string,FloorKnowledge>>;
export const CAMPAIGN_FLOORS=100;
export const categoryOf=(room:DungeonRoom):EncounterCategory=>room.group==='boss'?'boss':room.group==='treasure'?'treasure':'normal';
// Authored reusable encounter bands. Numbers and threats are provisional balance content.
const FLOOR_BANDS=[
 ['Dust and nests','crypt beetle'],['Buried halls','armored crypt beetle'],['Sealed passages','stoneback sentinel'],
 ['Broken wards','wardbound sentinel'],['Deep chambers','hollow stalker'],['Sunken vaults','vault guardian'],
 ['Silent galleries','ancient wardkeeper'],['Fractured depths','rift guardian'],['Inner crypts','crypt colossus'],['Final descent','last wardkeeper']
];
const EXTRA_NORMALS=[
 {name:'Fallen masonry',group:'neutral',skill:'athletics',attributes:[['force',.6],['endurance',.4]]},
 {name:'Narrow broken ledge',group:'trap',skill:'athletics',attributes:[['agility',.6],['observation',.4]]},
 {name:'Watchful burrow',group:'combat',skill:'combat',attributes:[['power',.6],['precision',.4]]},
 {name:'Collapsed doorway',group:'neutral',skill:'athletics',attributes:[['force',.7],['constitution',.3]]},
 {name:'Dust-covered survey marks',group:'puzzle',skill:'crypt_lore',attributes:[['planning',.5],['observation',.5]]}
] as const;
export function floorCatalog(dungeonId:string,floor:number):Record<EncounterCategory,DungeonRoom[]>{
 if(!Number.isInteger(floor)||floor<1||floor>100000||(dungeonId==='wood'&&floor>CAMPAIGN_FLOORS))throw Error('Invalid dungeon floor');
 const route=roomDungeon(dungeonId),band=FLOOR_BANDS[Math.min(9,Math.floor((floor-1)/10))];
 const originals=route.rooms.filter(r=>!['boss','treasure'].includes(r.group));
 const extras=EXTRA_NORMALS.map((r,i):DungeonRoom=>({...originals[0],name:r.name,group:r.group,mandatory:true,failure:r.group==='trap'?'injury':'return',checks:[makeCheck(`extra-${i}`,r.name,r.skill,r.attributes.map(([a,w])=>[a,w]),[])]}));
 const decorate=(rooms:DungeonRoom[],category:EncounterCategory)=>rooms.map((room,i)=>({...room,id:`f${floor}-${category}-${i}`,name:category==='boss'?`Floor ${floor} · ${band[1]}`:`${room.name} · floor ${floor}`,checks:room.checks.map((check,j)=>({...check,id:`f${floor}-${category}-${i}-${j}`,work:check.work*(category==='boss'?3:1),attributes:check.attributes.map(a=>({...a}))}))}));
 return {normal:decorate([...originals,...extras],'normal'),treasure:decorate(route.rooms.filter(r=>r.group==='treasure'),'treasure'),boss:decorate(route.rooms.filter(r=>r.group==='boss'),'boss')};
}
/** With replacement: ten traversals can encounter the same authored room repeatedly. */
export function rollFloorRoom(dungeonId:string,state:FloorState,random:()=>number):GeneratedRoom{
 const catalog=floorCatalog(dungeonId,state.number),route=roomDungeon(dungeonId);
 const category:EncounterCategory=state.counted===10?'boss':!state.lastTreasure&&random()<.15?'treasure':'normal';
 const room=weightedPick(catalog[category],r=>route.groups[r.group]*r.weight,random);
 return {id:room.id,index:0,work:0,attempts:0};
}
export function nextDungeonFloor(knowledge:DungeonKnowledge,id:string){
 let floor=1;while(knowledge[id]?.[floor]?.bossCleared&&floor<100000)floor++;
 return floor;
}
/** Floor-boundary exponential steps; bounded only to keep endless math finite. */
export const floorDifficulty=(dungeonId:string,floor:number)=>{
 // Only chapter one is balanced now. Chapter two deliberately requires future Stillmere support.
 const work=dungeonId==='wood'?(floor<=10?1.035**(floor-1):32*1.035**Math.min(floor-11,990)):1.025**Math.min(floor-1,1000);
 return Math.min(1e9,work);
};
export const generatedDifficulty=(dungeonId:string,id:string,roomNumber:number)=>id.startsWith('f')?floorDifficulty(dungeonId,Number(id.split('-')[0].slice(1))):difficultyAtRoom(roomNumber);
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
/** Eligibility remains independent from effective work; no minimum bypasses prerequisites. */
export function canAttemptRoomCheck(actor:CheckActor,check:RoomCheck):boolean{
 if(check.skill==='scavenging'&&!actor.selections?.attributes.includes('perception'))return false;
 if(check.requiredLevel>0&&check.skill!=='combat'&&(!isSkillDiscovered(actor.skills[check.skill])||actor.skills[check.skill].level<check.requiredLevel))return false;
 return true;
}
/** Missing stats contribute exactly zero; only the final eligible work rate has a floor. */
export const checkProgressRate=(actor:CheckActor,check:RoomCheck,loadout:string[])=>canAttemptRoomCheck(actor,check)?Math.max(MIN_PROGRESS_RATE,checkRating(actor,check,loadout)):0;
export const canonicalFloor=(room:number)=>Math.floor((room-1)/10)+1;
export const enduranceDrain=(room:number)=>.05*(1+(canonicalFloor(room)-1)*.2);
export const enduranceMaximum=(actor:CheckActor,loadout:string[])=>SPECIALIZATIONS.filter(s=>s.parent==='constitution'&&ownsSkill(actor,s.id)).reduce((sum,s)=>sum+equipmentValue(skillValue(actor,s.id),loadout,'constitution'),0);
/** Seconds needed at the current check values, divided into total authored work. */
export function roomEfficiency(actor:CheckActor,room:DungeonRoom,loadout:string[]){
 const work=room.checks.reduce((n,c)=>n+c.work,0);
 const seconds=room.checks.reduce((n,c)=>n+c.work/checkProgressRate(actor,c,loadout),0);
 return work/seconds/(room.referenceRate??1);
}
export function roomCheckCosts(_check:RoomCheck,depth=1):Pools{const costs=zeroPools();costs.constitution=enduranceDrain(depth);return costs;}
/** Pure work/training step. The engine pays its separate run-specific endurance meter. */
export function roomCheckStep(input:CheckActor,check:RoomCheck,state:GeneratedRoom,depth:number,loadout:string[],_random:()=>number,now:number,generatedDifficultyForStep=difficultyAtRoom(depth)){
 const actor=structuredClone(input),next=structuredClone(state),training=zeroPools(),specializationTraining:Record<string,number>={};
 // Generic danger checks use weighted work; only specific Composite activities have hard gates.
 if(!canAttemptRoomCheck(actor,check))return {actor,state:next,outcome:'ineligible' as const,training,specializationTraining};
 next.work+=checkProgressRate(actor,check,loadout);next.attempts++;
 if(next.work+1e-9<check.work*generatedDifficultyForStep)return {actor,state:next,outcome:'working' as const,training,specializationTraining};
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
