import type { Pools, Stat } from './content.ts';
import {ATTRIBUTES,STATS,STAT_INFO,zeroPools} from './attributes.ts';
import type {AttributeDefinition} from './attributes.ts';
export {ATTRIBUTES} from './attributes.ts';
export type {AttributeDefinition} from './attributes.ts';
export type SkillDefinition={id:string;name:string;affinities:{attribute:string;weight:number}[];specialization:number};
export const SKILLS: SkillDefinition[]=[
 {id:'observation',name:'Observation',affinities:[{attribute:'observation',weight:.75},{attribute:'scouting',weight:.25}],specialization:.5},
 {id:'investigation',name:'Investigation',affinities:[{attribute:'planning',weight:.75},{attribute:'observation',weight:.25}],specialization:.5},
 {id:'lock_picking',name:'Lock Picking',affinities:[{attribute:'finesse',weight:.75},{attribute:'design',weight:.25}],specialization:.5}
];
export type Specialization={value:number;affinity:number};
export type LearnedSkill={level:number;experience:number;lastUsedAt:number|null};
export type SkillProfile={specializations:Record<string,Specialization>;skills:Record<string,LearnedSkill>};
export type CheckActor=SkillProfile & {stats:Record<Stat,{current:number;max:number;affinity:number}>;gear:number};
export function newSkillProfile(stats:CheckActor['stats']):SkillProfile {
 return {specializations:Object.fromEntries(ATTRIBUTES.filter(a=>a.parent).map(a=>[a.id,{value:0,affinity:stats[rootPool(a.id)].affinity}])),skills:Object.fromEntries(SKILLS.map(s=>[s.id,{level:0,experience:0,lastUsedAt:null}]))};
}
export function validateAttributeTree(tree:AttributeDefinition[]){
 const ids=new Set(tree.map(a=>a.id));if(ids.size!==tree.length)throw Error('Duplicate attribute');
 for(const a of tree){const seen=new Set<string>();let n:AttributeDefinition|undefined=a;while(n){if(seen.has(n.id))throw Error('Attribute cycle');seen.add(n.id);if(n.parent){if(n.pool)throw Error('Specializations cannot have resource pools');const parent=tree.find(x=>x.id===n!.parent);if(!parent)throw Error('Missing attribute parent');n=parent;}else{if(!n.pool)throw Error('Root needs resource pool');n=undefined;}}}
}
export function rootPool(id:string,tree=ATTRIBUTES):Stat {const seen=new Set<string>();let a=tree.find(a=>a.id===id);while(a){if(seen.has(a.id))throw Error('Attribute cycle');seen.add(a.id);if(!a.parent){if(!a.pool)throw Error('Missing root pool');return a.pool;}a=tree.find(x=>x.id===a!.parent);}throw Error(`Unknown attribute ${id}`);}
/** Fill the gap with diminishing parent fallback, never add parent values twice. */
export function effectiveAttribute(actor:CheckActor,id:string,retention:number,tree=ATTRIBUTES):number {
 if(!Number.isFinite(retention)||retention<0||retention>1)throw Error('Invalid specialization retention');
 const seen=new Set<string>();
 function visit(key:string):number {const a=tree.find(a=>a.id===key);if(!a||seen.has(key))throw Error('Unknown or cyclic attribute');seen.add(key);if(!a.parent)return actor.stats[rootPool(key,tree)].max;const own=actor.specializations[key]?.value??0;const parent=visit(a.parent);return own+retention*Math.max(0,parent-own);}
 return visit(id);
}
export type Contribution={skill:string;weight:number};
export type Channel={skills:Contribution[];base:number;attributeFactor:number;levelFactor:number};
export type FailureOutcome={id:string;weight:number;kind:'retry'|'cooldown'|'alternate'|'damage'|'loss'|'return';seconds?:number;nextCheck?:number;damage?:Partial<Pools>;gearLoss?:number};
export type CheckDefinition={id:string;name:string;work:number;speed:Channel;success:Channel;chanceMin:number;chanceMax:number;efficiency:Channel;cost:{amount:number;distribution:{attribute:string;weight:number}[];per:'attempt'|'second'};training:Partial<Pools>;specializationTraining?:{attribute:string;amount:number}[];skillExperience:number;failures:FailureOutcome[]};
export type CheckRoom={id:string;name:string;checks:CheckDefinition[]};
export type RoomState={index:number;work:number;cooldown:number;attempts:number;status:'active'|'complete'|'bailed';lastOutcome:string|null};
export const newRoomState=():RoomState=>({index:0,work:0,cooldown:0,attempts:0,status:'active',lastOutcome:null});
function skillPower(actor:CheckActor,id:string){const d=SKILLS.find(s=>s.id===id);if(!d)throw Error(`Unknown skill ${id}`);const level=actor.skills[id]?.level??0;return {level:level/99,attribute:d.affinities.reduce((n,c)=>n+c.weight*effectiveAttribute(actor,c.attribute,d.specialization)/100,0)};}
function channel(actor:CheckActor,c:Channel){let attributes=0,levels=0;for(const x of c.skills){const p=skillPower(actor,x.skill);attributes+=p.attribute*x.weight;levels+=p.level*x.weight;}return c.base+attributes*c.attributeFactor+levels*c.levelFactor;}
export function checkMetrics(actor:CheckActor,check:CheckDefinition){return {speed:Math.max(.01,channel(actor,check.speed)),chance:Math.min(check.chanceMax,Math.max(check.chanceMin,channel(actor,check.success))),efficiency:Math.max(1,channel(actor,check.efficiency))};}
export function resourceCost(actor:CheckActor,check:CheckDefinition,scale=1):Pools {
 const costs=zeroPools();const efficiency=checkMetrics(actor,check).efficiency;
 for(const c of check.cost.distribution){const pool=rootPool(c.attribute);if(!STAT_INFO[pool].consumable)throw Error('Non-consumable stat cannot fund a cost');costs[pool]+=check.cost.amount*scale*c.weight/efficiency;}
 return costs;
}
function pay(actor:CheckActor,cost:Pools):boolean {if((Object.keys(cost) as Stat[]).some(s=>cost[s]>0&&(actor.stats[s].current<=0||actor.stats[s].current<cost[s])))return false;for(const s of Object.keys(cost) as Stat[])actor.stats[s].current=Math.max(0,actor.stats[s].current-cost[s]);return true;}
function exhausted(actor:CheckActor,cost:Pools){return (Object.keys(cost) as Stat[]).some(s=>cost[s]>0&&actor.stats[s].current<=0);}
export function gainSkillExperience(skill:LearnedSkill,amount:number,now:number){skill.lastUsedAt=now;skill.experience+=amount;while(skill.level<99&&skill.experience>=10*(skill.level+1)){skill.experience-=10*(skill.level+1);skill.level++;}if(skill.level===99)skill.experience=0;}
// Disuse metadata is stored now. No deterioration is applied until its design is approved.
export const SKILL_DECAY={enabled:false} as const;
export function stepRoom(input:CheckActor,room:CheckRoom,state:RoomState,random:()=>number,now:number,scale=1){
 const actor=structuredClone(input),next=structuredClone(state),training=zeroPools();
 const specialtyTraining:Record<string,number>={};
 if(!Number.isFinite(scale)||scale<=0||!Number.isInteger(now)||now<0)throw Error('Invalid check time or scaling');
 const messages:string[]=[];if(next.status!=='active')return {actor,state:next,training,specialtyTraining,messages};
 const check=room.checks[next.index];if(!check)throw Error('Invalid room position');
 const cost=resourceCost(actor,check,scale);
 const bail=(reason:string)=>{next.status='bailed';next.lastOutcome=reason;messages.push(reason);return {actor,state:next,training,specialtyTraining,messages};};
 // Check affordability before accumulating work, including during retry cooldowns.
 if((Object.keys(cost) as Stat[]).some(s=>cost[s]>0&&(actor.stats[s].current<=0||actor.stats[s].current<cost[s])))return bail('Required resources unavailable');
 if(next.cooldown>0){next.cooldown--;return {actor,state:next,training,specialtyTraining,messages};}
 if(check.cost.per==='second'&&(!pay(actor,cost)||exhausted(actor,cost)))return bail('Required resources exhausted');
 for(const c of [...check.speed.skills,...check.success.skills,...check.efficiency.skills])actor.skills[c.skill].lastUsedAt=now;
 const metrics=checkMetrics(actor,check);next.work+=metrics.speed;
 if(next.work<check.work*scale)return {actor,state:next,training,specialtyTraining,messages};
 if(check.cost.per==='attempt'&&(!pay(actor,cost)||exhausted(actor,cost)))return bail('Required resources exhausted');
 next.work=0;next.attempts++;
 const roll=random();if(roll<0||roll>=1||!Number.isFinite(roll))throw Error('Invalid random roll');
 if(roll<metrics.chance){
  next.lastOutcome='success';messages.push(`${check.name}: success`);
  const practice=new Map<string,number>();
  for(const contribution of [...check.speed.skills,...check.success.skills,...check.efficiency.skills]){
   const skill=SKILLS.find(skill=>skill.id===contribution.skill)!;
   for(const affinity of skill.affinities)if(ATTRIBUTES.some(attribute=>attribute.id===affinity.attribute&&attribute.parent))practice.set(affinity.attribute,Math.max(practice.get(affinity.attribute)??0,affinity.weight*contribution.weight));
  }
  for(const t of check.specializationTraining??[])practice.set(t.attribute,Math.max(practice.get(t.attribute)??0,t.amount));
  for(const [attribute,amount]of practice)specialtyTraining[attribute]=amount*scale;
  for(const s of Object.keys(training) as Stat[])training[s]=(check.training[s]??0)*scale;
  const trained=new Set([...check.speed.skills,...check.success.skills,...check.efficiency.skills].map(x=>x.skill));
  for(const id of trained)gainSkillExperience(actor.skills[id],check.skillExperience,now);
  next.index++;if(next.index>=room.checks.length){next.status='complete';next.index=room.checks.length;}
 }else{
  const failureRoll=random();if(!Number.isFinite(failureRoll)||failureRoll<0||failureRoll>=1)throw Error('Invalid failure roll');
  let roll=failureRoll*check.failures.reduce((n,f)=>n+f.weight,0);const outcome=check.failures.find(f=>(roll-=f.weight)<0)??check.failures.at(-1)!;
  next.lastOutcome=outcome.id;messages.push(`${check.name}: ${outcome.id}`);
  if(outcome.kind==='return')return bail(outcome.id);
  if(outcome.kind==='cooldown'||outcome.kind==='alternate')next.cooldown=outcome.seconds??0;
  if(outcome.kind==='alternate'){if(outcome.nextCheck===undefined||!room.checks[outcome.nextCheck])throw Error('Missing alternate approach');next.index=outcome.nextCheck;}
  if(outcome.damage)for(const [s,amount]of Object.entries(outcome.damage))actor.stats[s as Stat].current=Math.max(0,actor.stats[s as Stat].current-(amount??0)*scale);
  if(outcome.gearLoss)actor.gear=Math.max(0,actor.gear-outcome.gearLoss*scale);
  if(STATS.some(stat=>STAT_INFO[stat].consumable&&actor.stats[stat].current<=0))return bail('Injury forced return');
 }
 return {actor,state:next,training,specialtyTraining,messages};
}
export function validateRoom(room:CheckRoom){
 if(!room.checks.length)throw Error('Empty check room');const ids=new Set<string>();
 for(const c of room.checks){
  if(ids.has(c.id)||!c.id)throw Error('Duplicate check');ids.add(c.id);
  const finite=(n:number)=>Number.isFinite(n)&&n>=0;
  if(!finite(c.work)||c.work===0||!finite(c.cost.amount)||!finite(c.skillExperience)||!finite(c.chanceMin)||!finite(c.chanceMax)||c.chanceMin<0||c.chanceMax>1||!['attempt','second'].includes(c.cost.per)||Object.entries(c.training).some(([s,n])=>!STATS.includes(s as Stat)||!finite(n))||c.chanceMin>c.chanceMax)throw Error('Invalid check values');
  for(const ch of [c.speed,c.success,c.efficiency]){if(!finite(ch.base)||!finite(ch.attributeFactor)||!finite(ch.levelFactor)||!ch.skills.length||Math.abs(ch.skills.reduce((a,x)=>a+x.weight,0)-1)>1e-9||ch.skills.some(x=>!SKILLS.some(s=>s.id===x.skill)||!finite(x.weight)))throw Error('Invalid skill channel');}
  if(!c.cost.distribution.length||Math.abs(c.cost.distribution.reduce((a,x)=>a+x.weight,0)-1)>1e-9||c.cost.distribution.some(x=>!finite(x.weight)))throw Error('Invalid cost distribution');
  c.cost.distribution.forEach(x=>{if(!STAT_INFO[rootPool(x.attribute)].consumable)throw Error('Non-consumable cost');});
  for(const t of c.specializationTraining??[])if(!ATTRIBUTES.some(a=>a.id===t.attribute&&a.parent)||!finite(t.amount))throw Error('Invalid specialization training');
  if(!c.failures.length||!c.failures.some(f=>f.weight>0))throw Error('Missing failure outcomes');
  for(const f of c.failures){if(!['retry','cooldown','alternate','damage','loss','return'].includes(f.kind)||!finite(f.weight)||(f.seconds!==undefined&&(!Number.isInteger(f.seconds)||f.seconds<0))||(f.damage&&Object.values(f.damage).some(n=>!finite(n)))||(f.gearLoss!==undefined&&!finite(f.gearLoss)))throw Error('Invalid failure outcome');if(f.kind==='alternate'&&(f.nextCheck===undefined||!room.checks[f.nextCheck]))throw Error('Missing alternate approach');}
 }
}
const ch=(skill:string,base:number,attributeFactor:number,levelFactor:number):Channel=>({skills:[{skill,weight:1}],base,attributeFactor,levelFactor});
function sampleCheck(id:string,name:string,skill:string,cost:CheckDefinition['cost']['distribution'],training:Partial<Pools>):CheckDefinition{return {id,name,work:4,speed:ch(skill,1,1,.75),success:ch(skill,.55,.25,.2),chanceMin:.05,chanceMax:.98,efficiency:ch(skill,1,0,1),cost:{amount:2,distribution:cost,per:'attempt'},training,skillExperience:2,failures:[{id:'Try again',weight:6,kind:'retry'},{id:'Reassess the mechanism',weight:3,kind:'cooldown',seconds:3},{id:'Scraped hand',weight:1,kind:'damage',damage:{dexterity:1}}]};}
export const TRAP_ROOM:CheckRoom={id:'archive_trap',name:'Archive trap room',checks:[
 sampleCheck('see_trap','Notice the trap','observation',[{attribute:'observation',weight:1}],{perception:1}),
 sampleCheck('find_trigger','Find the trigger','investigation',[{attribute:'planning',weight:.75},{attribute:'observation',weight:.25}],{intelligence:1,perception:.25}),
 {...sampleCheck('disarm','Disarm the trap','lock_picking',[{attribute:'finesse',weight:.75},{attribute:'intelligence',weight:.25}],{dexterity:1,intelligence:.25}),speed:ch('investigation',1,1,.5),specializationTraining:[{attribute:'finesse',amount:1}]}
]};
validateAttributeTree(ATTRIBUTES);validateRoom(TRAP_ROOM);
