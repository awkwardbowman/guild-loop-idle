import {floorCatalog,nextDungeonFloor} from './rooms.ts';
import type {DungeonKnowledge,EncounterCategory} from './rooms.ts';
import {checkStatMix} from './stat-presentation.ts';
import type {StatEmphasis} from './stat-presentation.ts';
import {SKILLS} from './skill-system.ts';
/** Equal authored-identity weighting, independently normalized for each selected category. */
export function floorPreview(knowledge:DungeonKnowledge,id:string,floor:number,categories:EncounterCategory[]=['normal']){
 const catalog=floorCatalog(id,floor),known=knowledge[id]?.[floor]?.known??[];
 const rooms=categories.flatMap(c=>catalog[c]),revealed=rooms.filter(r=>known.includes(r.id));
 const weights=new Map<StatEmphasis['stat'],number>();
 for(const room of revealed)for(const check of room.checks)for(const {stat,weight}of checkStatMix(check))weights.set(stat,(weights.get(stat)??0)+weight/room.checks.length/rooms.length);
 return {known:revealed.length,total:rooms.length,unknown:rooms.length?1-revealed.length/rooms.length:1,mix:[...weights].map(([stat,weight])=>({stat,weight})).sort((a,b)=>b.weight-a.weight)};
}
export function exploredFloors(knowledge:DungeonKnowledge,id:string){
 return [...new Set([1,...Object.keys(knowledge[id]??{}).map(Number)])].sort((a,b)=>a-b);
}
export function dungeonPreview(knowledge:DungeonKnowledge,id:string,categories:EncounterCategory[]=['normal']){
 const floors=exploredFloors(knowledge,id),parts=floors.map(f=>floorPreview(knowledge,id,f,categories));
 const weights=new Map<StatEmphasis['stat'],number>();
 for(const part of parts)for(const {stat,weight}of part.mix)weights.set(stat,(weights.get(stat)??0)+weight/parts.length);
 return {known:parts.reduce((n,p)=>n+p.known,0),total:parts.reduce((n,p)=>n+p.total,0),unknown:parts.reduce((n,p)=>n+p.unknown,0)/parts.length,mix:[...weights].map(([stat,weight])=>({stat,weight}))};
}
export function revealedDungeonSkills(knowledge:DungeonKnowledge):Set<string>{
 const result=new Set(SKILLS.filter(s=>!s.dungeonId).map(s=>s.id));
 for(const [id,floors]of Object.entries(knowledge))for(const [number,state]of Object.entries(floors)){
  const catalog=Object.values(floorCatalog(id,Number(number))).flat();
  for(const room of catalog)if(state.bossCleared||state.known.includes(room.id))for(const check of room.checks)if(!SKILLS.find(s=>s.id===check.skill)?.dungeonId||SKILLS.find(s=>s.id===check.skill)?.dungeonId===id)result.add(check.skill);
 }
 return result;
}
export {nextDungeonFloor};
