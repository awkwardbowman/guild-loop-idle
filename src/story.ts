import {EVENT_IDS,availableStoryActions,hasEvent} from './progression.ts';
import type {EventId,Progression,StoryActionId} from './progression.ts';
export type StoryTab='Story'|'Guild'|'Members'|'Activities'|'Shops';
export type StoryLocation={tab:StoryTab;label:string};
export type StoryGoal={id:string;title:string;description:string;location:StoryLocation;action?:StoryActionId};
export type PlotEntry={id:EventId;day:number;time:number;title:string;description:string;locations:StoryLocation[]};
const goalsLocation:StoryLocation={tab:'Story',label:'Story → Current Goals'};
const memberQueue:StoryLocation={tab:'Members',label:'Members → select a member → Assignments → Dungeon queue'};
const dungeonCatalog:StoryLocation={tab:'Activities',label:'Activities → Dungeons'};
const storage:StoryLocation={tab:'Guild',label:'Guild → Storage'};
const shops:StoryLocation={tab:'Shops',label:'Shops → Gavin Wess, Tanner & Barkeep'};
const skills:StoryLocation={tab:'Members',label:'Members → select a member → Skills / Attributes'};
export const EVENT_TEXT:Record<EventId,{title:string;description:string;locations:StoryLocation[]}>= {
 campaign_completed:{title:'The final checkpoint',description:'The floor 100 boss of the Catacombs of the Wound and Wish has fallen. Your guild has completed the main dungeon.',locations:[dungeonCatalog]},
 history_remembered:{title:'A beginning in Emberveil',description:'Your story begins in a small town rebuilding among ancient memories. Your Soul holds an unusual spark of magic.',locations:[goalsLocation]},
 friends_introduced:{title:'Arya and Clyde',description:'Arya is ready for the dungeon; Clyde has an eye for useful finds. Your friends will be the guild’s first recruits.',locations:[goalsLocation]},
 guild_founded:{title:'The guild is established',description:'Arya and Clyde join as your first two recruits. The nearby Catacombs of the Wound and Wish are open; no gear is needed.',locations:[{tab:'Guild',label:'Guild → Guild Master'},memberQueue,dungeonCatalog]},
 recruitment_opened:{title:'Recruitment is open',description:'The guild can search for more candidates.',locations:[{tab:'Guild',label:'Guild → Guild Hall → Recruitment'}]},
 first_member_recruited:{title:'Your first adventurers join',description:'Member management is available. Arya explores farther; Clyde can find resources she cannot harvest.',locations:[{tab:'Members',label:'Members → Arya / Clyde'},skills]},
 trail_discovered:{title:'The Catacombs of the Wound and Wish are open',description:'Abandoned passages, small creatures and forgotten caches offer an inexpensive first outing. Assign either friend.',locations:[memberQueue,dungeonCatalog]},
 first_floor_cleared:{title:'Your first room is cleared',description:'A small success. Keep exploring, compare the friends’ skills, and bring useful materials home.',locations:[memberQueue,dungeonCatalog]},
 first_return:{title:'Your first expedition returns',description:'Carried finds enter Storage, up to each resource’s cap. Excess is discarded and logged. Injured members heal after arriving home; ordinary returns need no recovery delay.',locations:[storage,{tab:'Guild',label:'Guild → Guild Hall'}]},
 first_leather:{title:'Your first Leather Scraps',description:'What can we possibly do with these scraps? Look for a local craftsperson.',locations:[goalsLocation,storage]},
 tanner_opened:{title:'Gavin Wess opens for business',description:'Shops is available. Complete Gavin’s requests to learn Leather Crafting and find a buyer for herbs. Each ally equips one item per tier.',locations:[shops,{tab:'Members',label:'Members → Equipment'}]},
 leather_crafting_learned:{title:'We can outfit the guild',description:'Gavin has taught one ally Leather Crafting. Now we know how to make it, we can outfit everyone with gear! Equipment purchases and the Leather Crafting assignment are available.',locations:[shops,{tab:'Activities',label:'Activities → Guild assignments'},skills]},
 first_herb:{title:'Useful herbs',description:'Clyde’s Herbology skill can recover delicate plants. Perhaps someone in town knows a buyer.',locations:[goalsLocation,storage]},
 herbs_discussed:{title:'Gavin does not buy herbs',description:'Bring together five herbs and Gavin will tell you where to find a buyer. The five herbs are consumed on referral.',locations:[goalsLocation,storage]},
 stillmere_unlocked:{title:'The road to Stillmere',description:'The nearby town has an herbalist. Herbs can now be sold through a 15-second trade, with Oakley Ash.',locations:[{tab:'Shops',label:'Shops → Stillmere Herbalist'},{tab:'Guild',label:'Guild → Storage → Trade'}]},
 archive_discovered:{title:'Forgotten Highwoven Annex is discovered',description:'A new dungeon with more traps and puzzles is available.',locations:[memberQueue,dungeonCatalog,skills]},
 archive_floor_cleared:{title:'An archive room is cleared',description:'A new lead points toward the old ridge workings.',locations:[goalsLocation]},
 quarry_discovered:{title:'Emberstone Delve is discovered',description:'The delve is available for assignment.',locations:[memberQueue,dungeonCatalog]},
 skill_checks_enabled:{title:'A new approach to trap rooms',description:'Future archive outings use skill checks; current outings retain their saved rules.',locations:[memberQueue,dungeonCatalog,skills]},
 room_routes_enabled:{title:'Arya, Clyde and the catacombs',description:'Two local friends join the guild. Future departures use weighted room routes. Existing outings remain intact.',locations:[memberQueue,dungeonCatalog]},
 legacy_access:{title:'Your established guild continues',description:'Your existing roster and progress remain accessible. New opportunities are listed in Current Goals.',locations:[{tab:'Guild',label:'Guild'},memberQueue,dungeonCatalog,storage]}
};
export function currentGoals(p:Progression,inventory?:Record<string,number>):StoryGoal[]{
 const goals:StoryGoal[]=availableStoryActions(p,inventory).map(action=>({id:action.id,title:action.title,description:action.description,action:action.id,location:goalsLocation}));
 if(hasEvent(p,'trail_discovered')&&!hasEvent(p,'first_floor_cleared'))goals.push({id:'clear_trail',title:'Explore your first rooms',description:'Assign Arya or Clyde to the Catacombs of the Wound and Wish. Compare their capabilities and finds; the trip takes 15 seconds each way.',location:memberQueue});
 if(hasEvent(p,'first_floor_cleared')&&!hasEvent(p,'first_return'))goals.push({id:'return_home',title:'Bring your finds home',description:'Let an expedition return normally, or request Recall in Members → Assignments. Loot is stored only on arrival home; Recall usually waits for a full-floor boundary.',location:memberQueue});
 if(hasEvent(p,'first_return')&&!hasEvent(p,'first_leather'))goals.push({id:'find_leather',title:'Collect Leather Scraps',description:'Explore catacomb rooms and bring Leather Scraps home.',location:dungeonCatalog});

 return goals;
}
export function plotEntries(p:Progression):PlotEntry[]{return EVENT_IDS.filter(id=>hasEvent(p,id)&&!(id==='skill_checks_enabled'&&hasEvent(p,'archive_discovered')&&!hasEvent(p,'legacy_access'))).map(id=>({id,...p.completed[id]!,...EVENT_TEXT[id]})).sort((a,b)=>b.day-a.day||b.time-a.time||EVENT_IDS.indexOf(b.id)-EVENT_IDS.indexOf(a.id));}
