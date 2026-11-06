export const RESOURCES=[
 {id:'chips',name:'Chips',size:1,cap:80,rarity:0,depthBias:0,sale:0},
 {id:'leather',name:'Leather Scraps',size:1,cap:12,rarity:0,depthBias:0,sale:1},
 {id:'hide',name:'Animal Hides',size:2,cap:8,rarity:0,depthBias:1,sale:2},
 {id:'ore',name:'Ore',size:2,cap:8,rarity:0,depthBias:1,sale:2},
 {id:'herb',name:'Herbs',size:3,cap:5,rarity:0,depthBias:2,sale:3},
 {id:'materials',name:'Building Materials',size:1,cap:10,rarity:0,depthBias:0,sale:1},
 {id:'timber',name:'Heartwood',size:1,cap:12,rarity:0,depthBias:0,sale:1},
 {id:'ink',name:'Living Ink',size:2,cap:8,rarity:0,depthBias:1,sale:2},
 {id:'relic',name:'Ward Fragments',size:3,cap:5,rarity:0,depthBias:2,sale:3},
 {id:'crystal',name:'Sun Crystals',size:3,cap:5,rarity:0,depthBias:2,sale:4}
] as const;
export const resourceById=(id:string)=>RESOURCES.find(resource=>resource.id===id)!;
export const initialStorage=()=>Object.fromEntries(RESOURCES.map(resource=>[resource.id,{cap:resource.cap,level:0}]));
/** Currency is stored in Chips; Pebs (pebbles) and Bowls (boulders) are future denominations. */
export const CURRENCY_NAMES=['Chips','Pebs','Bowls'] as const;
export const storageUpgradePrice=(level:number)=>Math.ceil(5*1.25**level);
export const nextStorageCap=(cap:number)=>Math.max(cap+1,Math.ceil(cap*1.2));
export const rarityWeight=(base:number,rarity:number,depth:number)=>base*(1+Math.min(4,(depth-1)/20)*rarity);
export const difficultyAtRoom=(room:number)=>1.04**(room-1);
export type LootEntry={id:string;weight:number};
/** One draw spends item size; only items that fit the remaining budget are eligible. */
export function rollLoot(entries:LootEntry[],budget:number,depth:number,random:()=>number,eligible:(id:string)=>boolean=()=>true):Record<string,number>{
 if(!Number.isInteger(budget)||budget<0||budget>100000||!Number.isInteger(depth)||depth<1)throw Error('Invalid loot budget');
 const pool=[{id:'chips',weight:1},...entries.filter(entry=>entry.id!=='chips')];
 if(pool.some(entry=>!RESOURCES.some(resource=>resource.id===entry.id)||!Number.isFinite(entry.weight)||entry.weight<=0))throw Error('Invalid loot table');
 const result:Record<string,number>={};let remaining=budget;
 while(remaining>0){
  const choices=pool.filter(entry=>resourceById(entry.id).size<=remaining&&(entry.id==='chips'||eligible(entry.id)));
  const weights=choices.map(entry=>entry.id==='chips'?1:rarityWeight(entry.weight,resourceById(entry.id).depthBias,depth));
  const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid loot roll');
  let roll=value*weights.reduce((sum,weight)=>sum+weight,0),index=choices.length-1;
  for(let i=0;i<choices.length;i++)if((roll-=weights[i])<0){index=i;break;}
  const id=choices[index].id;result[id]=(result[id]??0)+1;remaining-=resourceById(id).size;
 }
 return result;
}
export const cargoSize=(loot:Record<string,number>,chips=0)=>chips+Object.entries(loot).reduce((sum,[id,amount])=>sum+resourceById(id).size*amount,0);
