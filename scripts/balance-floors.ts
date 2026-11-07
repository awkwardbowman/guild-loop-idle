/** Reproducible probability worksheet. Run with Node 24; no simulations or player saves. */
import {firstTenClearChance} from '../src/floor-probability.ts';
const rows=Array.from({length:10},(_,i)=>{
 const bare=firstTenClearChance(i+1),armored=firstTenClearChance(i+1,true);
 return {floor:i+1,workMultiplier:Number(bare.workMultiplier.toFixed(3)),enduranceBudgetSeconds:bare.budget,normalClearPercent:Number((bare.chance*100).toFixed(2)),roughArmorClearPercent:Number((armored.chance*100).toFixed(2))};
});
console.log(JSON.stringify({procedure:'docs/04-dungeons-and-expeditions.md#floor-clear-probability-procedure',scenario:'Fresh Arya at floor entry; one Constitution XP per prior floor, no ordinary practice; no Recall. Armor is a comparison, not an acquisition assumption.',method:'Weighted encounter-time distributions; ten counted slots with optional non-consecutive treasure, then a separate boss; sum all probability mass that fits the endurance budget.',rows},null,2));
