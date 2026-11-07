import {SPECIALIZATIONS,STATS,ACTIVITY_GROUPS} from './attributes.ts';
import type {Stat,ActivityGroup} from './attributes.ts';
import type {CheckActor,SkillProfile} from './skill-system.ts';
import {SKILLS} from './skill-system.ts';
export type Selections={attributes:Stat[];disciplines:ActivityGroup[]};
export const ROLE_SELECTIONS:Record<'arya'|'clyde'|'guildmaster',Selections>={
 arya:{attributes:['strength','dexterity','constitution','speed','perception'],disciplines:['combat','dungeoneering','exploration','crafting','logistics']},
 clyde:{attributes:['dexterity','constitution','perception','intelligence','luck'],disciplines:['crafting','exploration','management','recovery','trade']},
 guildmaster:{attributes:['perception','intelligence','charisma','soul','luck'],disciplines:['crafting','social','trade','recovery','management']}
};
export type SpecializedProfile=SkillProfile & Pick<CheckActor,'stats'>;
/** Deterministic strongest five roots; recovery guarantees a Constitution Skill when CON is chosen. */
export function defaultSelections(actor:Pick<CheckActor,'stats'>,role?:string):Selections{
 if(role&&role in ROLE_SELECTIONS)return structuredClone(ROLE_SELECTIONS[role as keyof typeof ROLE_SELECTIONS]);
 const attributes=[...STATS].sort((a,b)=>actor.stats[b].affinity-actor.stats[a].affinity||STATS.indexOf(a)-STATS.indexOf(b)).slice(0,5);
 const disciplines=[...ACTIVITY_GROUPS].sort((a,b)=>SPECIALIZATIONS.filter(s=>s.group===b.id&&attributes.includes(s.parent)).length-SPECIALIZATIONS.filter(s=>s.group===a.id&&attributes.includes(s.parent)).length||ACTIVITY_GROUPS.indexOf(a)-ACTIVITY_GROUPS.indexOf(b)).slice(0,5).map(g=>g.id);
 if(attributes.includes('constitution')&&!disciplines.some(d=>['combat','logistics','recovery'].includes(d)))disciplines[4]='recovery';
 return {attributes,disciplines};
}
export function ownsSkill(actor:SpecializedProfile,id:string):boolean{
 const skill=SPECIALIZATIONS.find(s=>s.id===id);return !!skill&&!!actor.selections?.attributes.includes(skill.parent)&&actor.selections.disciplines.includes(skill.group);
}
export const canDungeon=(actor:SpecializedProfile)=>SPECIALIZATIONS.some(s=>s.parent==='constitution'&&ownsSkill(actor,s.id));
export function attributeValue(actor:Pick<SpecializedProfile,'stats'|'selections'>,stat:Stat){return actor.selections?.attributes.includes(stat)?Math.max(1,actor.stats[stat].max):0;}
export function skillValue(actor:SpecializedProfile,id:string):number{
 const skill=SPECIALIZATIONS.find(s=>s.id===id);
 if(!skill)return STATS.includes(id as Stat)?attributeValue(actor,id as Stat):0;
 if(!ownsSkill(actor,id))return attributeValue(actor,skill.parent);
 return 1+actor.specializations[id].value+(skill.parent==='constitution'?(actor.constitutionExperience??0)*.01:0);
}
export function skillPotential(actor:SpecializedProfile,id:string){const skill=SPECIALIZATIONS.find(s=>s.id===id)!;return 1+actor.specializations[id].affinity+(skill.parent==='constitution'?(actor.constitutionExperience??0)*.01:0);}
export function canLearnComposite(actor:SpecializedProfile,id:string){const skill=SKILLS.find(s=>s.id===id);return !!skill&&skill.affinities.every(a=>ownsSkill(actor,a.attribute));}
export function skillMatrix(actor:SpecializedProfile){
 const selections=actor.selections??defaultSelections(actor);
 const cells=selections.attributes.map(stat=>selections.disciplines.map(group=>SPECIALIZATIONS.find(s=>s.parent===stat&&s.group===group)??null));
 const rows=cells.map(row=>row.reduce((n,s)=>n+(s?skillValue(actor,s.id):0),0));
 const columns=selections.disciplines.map((_,i)=>cells.reduce((n,row)=>n+(row[i]?skillValue(actor,row[i]!.id):0),0));
 return {selections,cells,rows,columns,total:rows.reduce((a,b)=>a+b,0)};
}
export const trainingBand=(value:number,potential:number)=>value/potential>=.9?'green':value/potential>=.75?'yellow':'red';

export const disciplineValue=(actor:SpecializedProfile,group:ActivityGroup)=>SPECIALIZATIONS.filter(s=>s.group===group&&ownsSkill(actor,s.id)).reduce((sum,s)=>sum+skillValue(actor,s.id),0);
