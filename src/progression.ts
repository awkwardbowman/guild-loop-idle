/** Saved events are facts. Feature visibility is derived, never independently saved. */
export const EVENT_IDS = ['guild_founded','recruitment_opened','first_member_recruited','trail_discovered','first_floor_cleared','first_return','archive_discovered','archive_floor_cleared','quarry_discovered','skill_checks_enabled','legacy_access'] as const;
export type EventId = typeof EVENT_IDS[number];
export type Stamp = { day: number; time: number };
export type Progression = { completed: Partial<Record<EventId, Stamp>> };
export type Feature = 'recruitment'|'members'|'activities'|'resources'|'infrastructure'|'skills';
export const freshProgression = (): Progression => ({completed:{}});
export const hasEvent = (p:Progression,id:EventId) => Object.hasOwn(p.completed,id);
export function recordEvent(p:Progression,id:EventId,stamp:Stamp):boolean {if(hasEvent(p,id))return false;p.completed[id]={...stamp};return true;}
const FEATURES: Record<Feature,EventId> = {recruitment:'recruitment_opened',members:'first_member_recruited',activities:'trail_discovered',resources:'first_return',infrastructure:'first_return',skills:'archive_discovered'};
export const hasFeature=(p:Progression,f:Feature)=>hasEvent(p,'legacy_access')||hasEvent(p,FEATURES[f]);
export const dungeonUnlocked=(p:Progression,id:string)=>['wood','ruins','quarry'].includes(id)&&(hasEvent(p,'legacy_access')||hasEvent(p,id==='wood'?'trail_discovered':id==='ruins'?'archive_discovered':'quarry_discovered')); 
export const STORY_ACTIONS = [
 {id:'found_guild',thread:'Guild',title:'Open the guild',description:'You grew up watching adventurers come and go, always wondering what it would be like to be part of their stories. You have never been an adventurer yourself, but you believe you can build something of your own. With one friend willing to take the first step beside you, you decide to open a guild.',requires:[],event:'guild_founded'},
 {id:'welcome_friend',thread:'Guild',title:'Welcome your first member',description:'Your friend is ready to become the guild’s first adventurer. A guildmaster and one member: it is a small beginning, but it is yours.',requires:['guild_founded'],event:'first_member_recruited'},
 {id:'study_checks',thread:'Guild',title:'Train for trap rooms',description:'Explore the archive using observation, investigation and lock picking.',requires:['legacy_access'],event:'skill_checks_enabled'},
 {id:'open_recruitment',thread:'Guild',title:'Open recruitment',description:'Look for more adventurers to join you and your friend.',requires:['first_member_recruited'],event:'recruitment_opened'},
 {id:'discover_trail',thread:'Expeditions',title:'Survey the outskirts',description:'Make Briarwood Trail available for expeditions.',requires:['first_member_recruited'],event:'trail_discovered'},
 {id:'discover_archive',thread:'Expeditions',title:'Investigate the archive',description:'Unlock the archive and its three-stage trap-room skill checks.',requires:['first_floor_cleared'],event:'archive_discovered'},
 {id:'discover_quarry',thread:'Expeditions',title:'Survey the ridge',description:'Make Emberstone Delve available for expeditions.',requires:['archive_floor_cleared'],event:'quarry_discovered'}
] as const satisfies readonly {id:string;thread:string;title:string;description:string;requires:readonly EventId[];event:EventId}[];
export type StoryActionId=typeof STORY_ACTIONS[number]['id'];
export function availableStoryActions(p:Progression){return STORY_ACTIONS.filter(a=>a.requires.every(id=>hasEvent(p,id))&&!hasEvent(p,a.event)&&(!hasEvent(p,'legacy_access')||a.id==='study_checks'));}
export function storyThreads(p:Progression){return ['Guild',...(hasFeature(p,'members')?['Expeditions']:[])];}
export function visibleTabs(p:Progression){if(!hasEvent(p,'guild_founded')&&!hasEvent(p,'legacy_access'))return ['Story'];return ['Story','Guild',...(hasFeature(p,'members')?['Members']:[]),...(hasFeature(p,'activities')?['Activities']:[]),...(hasFeature(p,'resources')?['Resources']:[]),'Info'];}
