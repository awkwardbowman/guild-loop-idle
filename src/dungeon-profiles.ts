import {SPECIALIZATIONS} from './attributes.ts';
import {effectiveAttribute,SKILLS,TRAP_ROOM} from './skill-system.ts';
import type {CheckActor,CheckDefinition} from './skill-system.ts';
export type WeightedAttribute={attribute:string;weight:number};
export type DungeonCheckProfile={id:string;name:string;importance:number;attributes:WeightedAttribute[]};
export type DungeonProfile={dungeonId:string;checks:DungeonCheckProfile[]};
const check=(id:string,name:string,importance:number,attributes:[string,number][]):DungeonCheckProfile=>({id,name,importance,attributes:attributes.map(([attribute,weight])=>({attribute,weight}))});
/** Combine the actual check's speed/success/efficiency dependencies for a planning overview. */
export function checkAttributeMix(definition:CheckDefinition):WeightedAttribute[]{
 const weights=new Map<string,number>();
 for(const channel of [definition.speed,definition.success,definition.efficiency])for(const contribution of channel.skills){
  const skill=SKILLS.find(skill=>skill.id===contribution.skill)!;
  for(const affinity of skill.affinities){
   const attribute=affinity.attribute;
   weights.set(attribute,(weights.get(attribute)??0)+contribution.weight*affinity.weight/3);
  }
 }
 return [...weights].map(([attribute,weight])=>({attribute,weight}));
}
/** Provisional planning profiles: content authors can give every dungeon a unique check sequence. */
export const DUNGEON_PROFILES:DungeonProfile[]=[
 {dungeonId:'wood',checks:[
  check('catacomb_rubble','Shift the fallen masonry',.3,[['force',.6],['finesse',.25],['planning',.15]]),
  check('catacomb_crossing','Cross the broken crypt',.3,[['agility',.6],['observation',.25],['endurance',.15]]),
  check('catacomb_scavenger','Track the crypt scavenger',.4,[['power',.4],['precision',.3],['observation',.3]])
 ]},
 {dungeonId:'ruins',checks:TRAP_ROOM.checks.map((definition,index)=>({id:definition.id,name:definition.name,importance:index===2?.4:.3,attributes:checkAttributeMix(definition)}))},
 {dungeonId:'quarry',checks:[
  check('delve_shale','Break through the shale',.3,[['force',.6],['hauling',.25],['endurance',.15]]),
  check('delve_ledge','Traverse the furnace ledge',.3,[['agility',.5],['toughness',.3],['observation',.2]]),
  check('delve_guardian','Face the stone guardian',.4,[['power',.5],['precision',.25],['toughness',.25]])
 ]}
];
export function validateDungeonProfile(profile:DungeonProfile){
 const validWeights=(weights:number[])=>weights.length>0&&weights.every(weight=>Number.isFinite(weight)&&weight>0)&&Math.abs(weights.reduce((sum,weight)=>sum+weight,0)-1)<1e-9;
 if(!profile.checks.length||new Set(profile.checks.map(check=>check.id)).size!==profile.checks.length||!validWeights(profile.checks.map(check=>check.importance)))throw Error('Invalid dungeon check importance');
 for(const check of profile.checks)if(!check.id||!check.name||!validWeights(check.attributes.map(attribute=>attribute.weight))||new Set(check.attributes.map(attribute=>attribute.attribute)).size!==check.attributes.length||check.attributes.some(attribute=>!SPECIALIZATIONS.some(known=>known.id===attribute.attribute)))throw Error('Invalid dungeon attribute weights');
}
export function dungeonAttributeMix(profile:DungeonProfile):WeightedAttribute[]{
 const weights=new Map<string,number>();for(const check of profile.checks)for(const attribute of check.attributes)weights.set(attribute.attribute,(weights.get(attribute.attribute)??0)+check.importance*attribute.weight);
 return [...weights].map(([attribute,weight])=>({attribute,weight})).sort((a,b)=>b.weight-a.weight||a.attribute.localeCompare(b.attribute));
}
/** Advisory capability score; affordability and individual checks still decide actual outcomes. */
export const dungeonFit=(actor:CheckActor,profile:DungeonProfile)=>dungeonAttributeMix(profile).reduce((score,attribute)=>score+attribute.weight*effectiveAttribute(actor,attribute.attribute,.5),0);
DUNGEON_PROFILES.forEach(validateDungeonProfile);
