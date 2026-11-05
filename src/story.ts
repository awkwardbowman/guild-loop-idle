import {EVENT_IDS,availableStoryActions,hasEvent} from './progression.ts';
import type {EventId,Progression,StoryActionId} from './progression.ts';
export type StoryTab='Story'|'Guild'|'Members'|'Activities'|'Resources';
export type StoryLocation={tab:StoryTab;label:string};
export type StoryGoal={id:string;title:string;description:string;location:StoryLocation;action?:StoryActionId};
export type PlotEntry={id:EventId;day:number;time:number;title:string;description:string;locations:StoryLocation[]};
const goalsLocation:StoryLocation={tab:'Story',label:'Story → Current Goals'};
const memberQueue:StoryLocation={tab:'Members',label:'Members → select a member → Dungeon queue'};
const dungeonCatalog:StoryLocation={tab:'Activities',label:'Activities → Dungeons'};
const skills:StoryLocation={tab:'Members',label:'Members → select a member → Skills and Attribute specializations'};
const EVENT_TEXT:Record<EventId,{title:string;description:string;locations:StoryLocation[]}>= {
 guild_founded:{title:'The guild is established',description:'The guild has opened its doors. Your first member is waiting to join you.',locations:[{tab:'Guild',label:'Guild'},goalsLocation]},
 recruitment_opened:{title:'Recruitment is open',description:'The guild can now search for candidates. Resume time to advance recruitment, then review each applicant.',locations:[{tab:'Guild',label:'Guild → Guild priorities → Recruitment'},{tab:'Guild',label:'Guild → Recruitment'}]},
 first_member_recruited:{title:'Your first member joins',description:'Member management is now available. Review their stats and plan their dungeon queue. A new expedition goal is available.',locations:[{tab:'Members',label:'Members → select a member'},goalsLocation]},
 trail_discovered:{title:'Briarwood Trail is discovered',description:'Your members can now explore the trail. Choose it in a member’s dungeon queue; adjust the global depth limit in Activities.',locations:[memberQueue,dungeonCatalog]},
 first_floor_cleared:{title:'Your first floor is cleared',description:'The first successful exploration has revealed a new opportunity: investigate the archive from Current Goals.',locations:[goalsLocation]},
 first_return:{title:'Your first expedition returns',description:'Resources and guild infrastructure are now available. View and pin your supplies, or invest in guild upgrades.',locations:[{tab:'Resources',label:'Resources → resource list and pin controls'},{tab:'Guild',label:'Guild → Infrastructure'}]},
 archive_discovered:{title:'Whispering Archive is discovered',description:'The archive and its three-stage trap rooms are available. Members can now develop Observation, Investigation and Lock Picking, with specializations beneath their attributes.',locations:[memberQueue,dungeonCatalog,skills]},
 archive_floor_cleared:{title:'An archive floor is cleared',description:'Your member has overcome the archive’s challenges. A new expedition goal now lets you survey the ridge.',locations:[goalsLocation]},
 quarry_discovered:{title:'Emberstone Delve is discovered',description:'The delve is now available for assignment. Review its demands before choosing how deep each member should go.',locations:[memberQueue,dungeonCatalog]},
 skill_checks_enabled:{title:'A new approach to trap rooms',description:'Future archive outings use observation, investigation and lock picking. An outing already underway finishes with its existing rules.',locations:[memberQueue,dungeonCatalog,skills]},
 legacy_access:{title:'Your established guild continues',description:'Your existing members and previously available features remain accessible. Check Current Goals for any new opportunities.',locations:[{tab:'Guild',label:'Guild'},{tab:'Members',label:'Members'},dungeonCatalog,{tab:'Resources',label:'Resources'},goalsLocation]}
};
export function currentGoals(p:Progression):StoryGoal[]{
 const goals:StoryGoal[]=availableStoryActions(p).map(a=>({id:a.id,title:a.title,description:a.description,action:a.id,location:goalsLocation}));
 if(hasEvent(p,'legacy_access'))return goals;
 if(hasEvent(p,'trail_discovered')&&!hasEvent(p,'first_floor_cleared'))goals.push({id:'clear_trail',title:'Clear your first dungeon floor',description:'Assign Briarwood Trail in a member’s dungeon queue and resume time. A personal max depth of 1 brings them home after the first floor.',location:memberQueue});
 if(hasEvent(p,'first_floor_cleared')&&!hasEvent(p,'first_return'))goals.push({id:'return_home',title:'Bring an expedition home',description:'Let a member reach their stopping depth, or use Recall safely to bring them back with their earned loot.',location:{tab:'Members',label:'Members → select an active member → Recall safely'}});
 if(hasEvent(p,'archive_discovered')&&!hasEvent(p,'archive_floor_cleared'))goals.push({id:'clear_archive',title:'Clear an archive floor',description:'Assign Whispering Archive in a member’s dungeon queue. Complete the trap-room checks to clear a floor; members improve through repeated outings.',location:memberQueue});
 return goals;
}
export function plotEntries(p:Progression):PlotEntry[]{
 return EVENT_IDS.filter(id=>hasEvent(p,id)&&!(id==='skill_checks_enabled'&&hasEvent(p,'archive_discovered')&&!hasEvent(p,'legacy_access')))
 .map(id=>({id,...p.completed[id]!,...EVENT_TEXT[id]}))
 .sort((a,b)=>a.day-b.day||a.time-b.time||EVENT_IDS.indexOf(a.id)-EVENT_IDS.indexOf(b.id));
}
