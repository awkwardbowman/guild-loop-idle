import {SPECIALIZATIONS,STATS,ACTIVITY_GROUPS} from './attributes.ts';
import type {SpecializedProfile,Selections} from './specialization.ts';
import {ownsSkill} from './specialization.ts';
const DECAY=2*Math.log(10);
/** Truncated exponential: P(start < affinity/2) = .9/.99 = 90.909...%. */
export function startingSkillValue(affinity:number,u:number){
 if(!Number.isFinite(affinity)||affinity<0||!Number.isFinite(u)||u<0||u>=1)throw Error('Invalid starting Skill draw');
 return affinity*(-Math.log1p(-u*(1-Math.exp(-DECAY)))/DECAY);
}
/** Shuffle first so the residual allocation does not favor a particular Skill identity. */
export function generateSkillPotential(selections:Selections,budget:number,random:()=>number){
 const owned=SPECIALIZATIONS.filter(s=>selections.attributes.includes(s.parent)&&selections.disciplines.includes(s.group));
 if(!selections.attributes.every(s=>STATS.includes(s))||!selections.disciplines.every(d=>ACTIVITY_GROUPS.some(g=>g.id===d))||selections.attributes.length!==5||new Set(selections.attributes).size!==5||selections.disciplines.length!==5||new Set(selections.disciplines).size!==5||!owned.length||!Number.isFinite(budget)||budget<owned.length*.1)throw Error('Invalid affinity budget/selections');
 const draw=()=>{const u=random();if(!Number.isFinite(u)||u<0||u>=1)throw Error('Invalid random draw');return u;};
 for(let i=owned.length-1;i>0;i--){const j=Math.floor(draw()*(i+1));[owned[i],owned[j]]=[owned[j],owned[i]];}
 const result=Object.fromEntries(SPECIALIZATIONS.map(s=>[s.id,{affinity:0,value:0}]));let remaining=budget-owned.length*.1;
 for(let i=0;i<owned.length;i++){const extra=i===owned.length-1?remaining:remaining*draw();remaining-=extra;const affinity=.1+extra;result[owned[i].id]={affinity,value:startingSkillValue(affinity,draw())};}
 return result;
}
/** 3% exponential base cost, plus independent multiplicative 10% XP penalties. */
export const trainingMultiplier=(level:number,affinity:number,activityLevel:number)=>.9**(Math.max(0,level-affinity)+Math.max(0,level-activityLevel));
/** Integrates continuous level cost exactly across the activity/affinity breakpoints. */
export function trainSkill(level:number,affinity:number,xp:number,activityLevel:number){
 if([level,affinity,xp,activityLevel].some(v=>!Number.isFinite(v)||v<0))throw Error('Invalid Skill training');
 let current=level,remaining=xp;
 const stops=[affinity,activityLevel].filter(v=>v>current).sort((a,b)=>a-b);stops.push(Infinity);
 for(const stop of stops){
  const slope=Math.log(1.03)-Math.log(.9)*((current>=affinity?1:0)+(current>=activityLevel?1:0));
  const cost=1.03**current/trainingMultiplier(current,affinity,activityLevel);
  if(!Number.isFinite(cost))return current;
  const needed=stop===Infinity?Infinity:cost*Math.expm1(slope*(stop-current))/slope;
  if(remaining<=needed)return current+Math.log1p(remaining*slope/cost)/slope;
  remaining-=needed;current=stop;
 }
 return current;
}
export function syncSkillTotals(actor:SpecializedProfile){
 for(const stat of STATS){
  const owned=SPECIALIZATIONS.filter(s=>s.parent===stat&&ownsSkill(actor,s.id));
  actor.stats[stat]={affinity:owned.reduce((n,s)=>n+actor.specializations[s.id].affinity,0),max:owned.reduce((n,s)=>n+actor.specializations[s.id].value,0),current:owned.reduce((n,s)=>n+actor.specializations[s.id].value,0)};
 }
 // Inert Soul is metadata, not an allocated/functional Skill or budget point.
 if(!actor.selections?.attributes.includes('soul'))actor.stats.soul={affinity:1,max:1,current:1};
}
/** The standard reasonable-maximum benchmark; does not claim an infinite-grind ceiling. */
export function atAffinity<T extends SpecializedProfile>(actor:T):T{
 if(actor.affinityModel!=='skills')throw Error('A legacy profile has no declared Skill-affinity budget');
 const result=structuredClone(actor);
 for(const s of SPECIALIZATIONS)if(ownsSkill(result,s.id))result.specializations[s.id].value=result.specializations[s.id].affinity;
 result.constitutionExperience=0;syncSkillTotals(result);return result;
}
