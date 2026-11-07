/** Theme-independent, deterministic challenge odds and bounded class-ceiling proofs. */
export type Allocation=Record<string,number>;
export type Expression={base?:number;weights?:Record<string,number>};
export type Modifier={channel:string;catchup?:number;flat?:number;percent?:number};
export type Loadout={id:string;modifiers:Modifier[]};
export type Encounter={weight:number;requires?:string[];checks:{work:number;rate:Expression}[];deadline?:number};
export type Challenge={id:string;normal:Encounter[];bonus:Encounter[];boss:Encounter[];bonusChance:number;rooms:number;capacity:Expression;drain:number;timeLimit:number};
export type Profile={allocation:Allocation;channels:Record<string,Expression>;traits:string[]};
const EPS=1e-9;
const finite=(v:number)=>Number.isFinite(v)&&v>=0;
function expression(e:Expression,values:Allocation){
 if(!finite(e.base??0))throw Error('Expressions require nonnegative finite constants');
 let result=e.base??0;
 for(const [key,weight]of Object.entries(e.weights??{})){
  if(!finite(weight)||!finite(values[key]))throw Error(`Invalid or missing channel: ${key}`);
  result+=weight*values[key];
 }
 if(!finite(result))throw Error('Expression overflow');return result;
}
/** Fixed traits/loadout and nonnegative expressions make odds monotone in allocation. */
export function challengeChance(challenge:Challenge,profile:Profile,loadout:Loadout){
 const c=challenge;
 if(!finite(c.drain)||c.drain===0||!Number.isInteger(c.timeLimit)||c.timeLimit<1||c.timeLimit>10000||!Number.isInteger(c.rooms)||c.rooms<1||c.rooms>1000||!finite(c.bonusChance)||c.bonusChance>1)throw Error('Invalid challenge limits');
 for(const value of Object.values(profile.allocation))if(!finite(value))throw Error('Invalid allocation');
 const channels:Allocation={};
 for(const [key,value]of Object.entries(profile.channels)){
  let catchup=0,flat=0,percent=0;
  for(const m of loadout.modifiers.filter(m=>m.channel===key)){
   if(!finite(m.catchup??0)||!finite(m.flat??0)||!finite(m.percent??0))throw Error('Only nonnegative equipment modifiers are supported');
   catchup=Math.max(catchup,m.catchup??0);flat+=m.flat??0;percent+=m.percent??0;
  }
  const raw=expression(value,profile.allocation);channels[key]=(Math.max(raw,(raw+catchup)/2)+flat)*(1+percent);
 }
 for(const m of loadout.modifiers)if(!(m.channel in channels))throw Error(`Unknown equipment channel: ${m.channel}`);
 const budget=Math.min(c.timeLimit,Math.floor((expression(c.capacity,channels)+EPS)/c.drain));
 const distribution=(rooms:Encounter[],optional=false)=>{
  if(!rooms.length)throw Error('Encounter category must be declared');
  const total=rooms.reduce((sum,r)=>sum+r.weight,0);
  if(!Number.isFinite(total)||total<=0)throw Error('Invalid encounter weights');
  const result=new Map<number,number>();
  for(const r of rooms){
   if(!finite(r.weight)||!r.checks.length||r.deadline!==undefined&&(!Number.isInteger(r.deadline)||r.deadline<1))throw Error('Invalid encounter');
   let seconds=0,eligible=!(r.requires??[]).some(t=>!profile.traits.includes(t));
   for(const check of r.checks){
    if(!finite(check.work)||check.work===0)throw Error('Invalid work');
    const rate=expression(check.rate,channels);
    if(rate===0)seconds=Infinity;else seconds+=Math.max(1,Math.ceil((check.work-EPS)/rate));
   }
   if(!eligible){if(optional)seconds=1;else continue;}
   if(r.deadline!==undefined&&seconds>r.deadline)continue;
   if(seconds<=budget)result.set(seconds,(result.get(seconds)??0)+r.weight/total);
  }
  return result;
 };
 const normal=distribution(c.normal),boss=distribution(c.boss),bonus=distribution(c.bonus,true);
 const optional=new Map<number,number>([[0,1-c.bonusChance]]);
 for(const [t,p]of bonus)optional.set(t,p*c.bonusChance);
 const multiply=(a:Map<number,number>,b:Map<number,number>)=>{
  const result=new Map<number,number>();
  for(const [s,p]of a)for(const [t,q]of b)if(s+t<=budget&&p*q>0)result.set(s+t,(result.get(s+t)??0)+p*q);
  return result;
 };
 const slot=multiply(optional,normal);let times=new Map([[0,1]]);
 for(let i=0;i<c.rooms&&times.size;i++)times=multiply(times,slot);
 times=multiply(times,boss);
 const chance=Math.min(1,Math.max(0,[...times.values()].reduce((a,b)=>a+b,0)));
 return {chance,budget,states:times.size};
}
export type ClassScope={id:string;budget:number;bounds:Record<string,{min:number;max:number}>;channels:Profile['channels'];traits:string[];loadouts:Loadout[]};
/** Integer generation budgets only. Each scope fixes selections, unlocks and legal loadouts. */
export function classCeiling(challenge:Challenge,scopes:ClassScope[],threshold:number,maxEvaluations=256){
 if(!scopes.length||!finite(threshold)||threshold>1||!Number.isInteger(maxEvaluations)||maxEvaluations<1)throw Error('Invalid class test');
 type Box={scope:ClassScope;loadout:Loadout;lo:Allocation;hi:Allocation;upper:number};
 const pending:Box[]=[];let evaluations=0,lower=0;
 let witness:{scope:string;loadout:string;allocation:Allocation;chance:number}|undefined;
 for(const scope of scopes){
  const entries=Object.entries(scope.bounds),lo:Allocation={},hi:Allocation={};
  if(!Number.isInteger(scope.budget)||scope.budget<0||!entries.length||!scope.loadouts.length)throw Error('Invalid class scope');
  for(const [key,b]of entries){if(!Number.isInteger(b.min)||!Number.isInteger(b.max)||b.min<0||b.max<b.min)throw Error('Invalid integer allocation bounds');lo[key]=b.min;hi[key]=b.max;}
  if(Object.values(lo).reduce((a,b)=>a+b,0)>scope.budget||Object.values(hi).reduce((a,b)=>a+b,0)<scope.budget)throw Error('Class has no legal allocation');
  for(const loadout of scope.loadouts)pending.push({scope,loadout,lo:{...lo},hi:{...hi},upper:1});
 }
 const evaluate=(box:Box,allocation:Allocation)=>{evaluations++;return challengeChance(challenge,{allocation,channels:box.scope.channels,traits:box.scope.traits},box.loadout).chance;};
 let resolvedUpper=0;
 while(pending.length&&evaluations+2<=maxEvaluations){
  pending.sort((a,b)=>a.upper-b.upper);const box=pending.pop()!;
  const keys=Object.keys(box.lo),sumLo=keys.reduce((n,k)=>n+box.lo[k],0),sumHi=keys.reduce((n,k)=>n+box.hi[k],0);
  if(sumLo>box.scope.budget||sumHi<box.scope.budget)continue;
  const oldLo={...box.lo},oldHi={...box.hi};
  for(const k of keys){box.hi[k]=Math.min(oldHi[k],box.scope.budget-sumLo+oldLo[k]);box.lo[k]=Math.max(oldLo[k],box.scope.budget-sumHi+oldHi[k]);}
  // This vector may exceed the total budget: it is an optimistic bound, never a witness.
  box.upper=Math.min(box.upper,evaluate(box,box.hi));
  const allocation={...box.lo};let remaining=box.scope.budget-Object.values(allocation).reduce((a,b)=>a+b,0);
  for(const k of keys){const add=Math.min(remaining,box.hi[k]-allocation[k]);allocation[k]+=add;remaining-=add;}
  const chance=evaluate(box,allocation);
  if(!witness||chance>lower){lower=chance;witness={scope:box.scope.id,loadout:box.loadout.id,allocation,chance};}
  if(lower>=threshold)return {status:'counterexample' as const,lower,upper:Math.max(lower,box.upper,resolvedUpper,...pending.map(b=>b.upper)),evaluations,witness};
  if(box.upper<threshold||box.upper<=lower){resolvedUpper=Math.max(resolvedUpper,box.upper);continue;}
  const split=keys.sort((a,b)=>(box.hi[b]-box.lo[b])-(box.hi[a]-box.lo[a]))[0];
  if(box.lo[split]===box.hi[split]){resolvedUpper=Math.max(resolvedUpper,box.upper);continue;}
  const mid=Math.floor((box.lo[split]+box.hi[split])/2);
  pending.push({...box,hi:{...box.hi,[split]:mid}},{...box,lo:{...box.lo,[split]:mid+1}});
 }
 const upper=Math.max(lower,resolvedUpper,...pending.map(b=>b.upper));
 return {status:upper<threshold?'proven-below' as const:'inconclusive' as const,lower,upper,evaluations,witness};
}
