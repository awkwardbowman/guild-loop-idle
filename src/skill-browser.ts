import {SKILLS,isSkillDiscovered} from './skill-system.ts';
import type {SkillProfile} from './skill-system.ts';
export type SkillSort='name'|'level';
/** A checklist matches any selected attribute; no selection leaves the learned list unfiltered. */
export function browseLearnedSkills(profile:Pick<SkillProfile,'skills'>,attributes:readonly string[]=[],query='',sort:SkillSort='name'){
 const search=query.trim().toLocaleLowerCase();
 return SKILLS.filter(skill=>isSkillDiscovered(profile.skills[skill.id])&&(!search||skill.name.toLocaleLowerCase().includes(search))&&(!attributes.length||skill.affinities.some(affinity=>attributes.includes(affinity.attribute))))
 .sort((a,b)=>(sort==='level'?profile.skills[b.id].level-profile.skills[a.id].level:0)||a.name.localeCompare(b.name));
}
