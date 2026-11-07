/** Synthetic probes only: never reads or modifies a player's save. Run with Node 24. */
import {initialGame,completeStoryAction,startDay,advance} from '../src/engine.ts';
import {floorDifficulty,enduranceMaximum} from '../src/rooms.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {STATS} from '../src/attributes.ts';
function opening(seed:number){let g=initialGame(seed);for(const a of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,a);g.members[1].enabled=false;return g;}
const rows=[];
for(let seed=1;seed<=30;seed++){
 let g=opening(seed);g.dungeonDefaults.depthLimit=100;g=startDay(g);
 let seconds=0;for(;seconds<3600&&!g.dungeonKnowledge.wood?.[10]?.bossCleared;seconds+=10)g=advance(g,10);
 // Validate the complete played state, not only the reported checkpoint.
 parseSave(exportSave(g));
 rows.push({seed,clearedTen:g.dungeonKnowledge.wood?.[10]?.bossCleared===true,seconds,returns:g.members[0].runs,constitutionXP:g.members[0].constitutionExperience});
}
// Stronger-than-current Arya: capped roots/Skills, all existing best armor, and ten floor XP.
const barrier=[];
for(let seed=1;seed<=30;seed++){
 let g=opening(seed),m=g.members[0];for(const stat of STATS)m.stats[stat].current=m.stats[stat].max=m.stats[stat].affinity;
 for(const specialty of Object.values(m.specializations))specialty.value=specialty.affinity;
 m.constitutionExperience=10;g.equipment.unlocked=['reinforced_armor'];m.equipped=['reinforced_armor'];
 g.dungeonKnowledge.wood={};for(let f=1;f<=10;f++)g.dungeonKnowledge.wood[f]={known:[`f${f}-boss-0`],bossCleared:true};
 g=startDay(g);g.members[0].enabled=false;
 for(let seconds=0;seconds<350&&g.members[0].runs===0;seconds++)g=advance(g,1);
 parseSave(exportSave(g));barrier.push({seed,clearedEleven:g.dungeonKnowledge.wood[11]?.bossCleared===true,returns:g.members[0].runs});
}
console.log(JSON.stringify({scope:'Only floors 1–10 are balanced. Floors 11+ are a provisional barrier pending Stillmere consumables and support; no potion effects are invented.',firstTen:{trials:rows.length,passed:rows.filter(r=>r.clearedTen).length,minSeconds:Math.min(...rows.map(r=>r.seconds)),maxSeconds:Math.max(...rows.map(r=>r.seconds)),meanSeconds:rows.reduce((n,r)=>n+r.seconds,0)/rows.length},currentKitBarrier:{trials:barrier.length,clearedEleven:barrier.filter(r=>r.clearedEleven).length},curve:[1,2,5,10,11,20].map(f=>({floor:f,workMultiplier:floorDifficulty('wood',f)})),rows,barrier},null,2));
