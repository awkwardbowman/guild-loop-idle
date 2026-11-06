import React,{useState} from 'react';
import {STAT_VISUALS} from './stat-presentation.ts';
import type {Member} from './engine.ts';
import {SKILLS} from './skill-system.ts';
import {StatSymbol,ActivitySymbol} from './StatSymbols.tsx';
import {ACTIVITY_GROUPS,STATS,STAT_INFO,SPECIALIZATIONS,STAT_SHORT} from './attributes.ts';
type Profile=Pick<Member,'stats'|'specializations'|'skills'>;
export function LearnedSkillsPanel({member}:{member:Profile}){
 return <table><thead><tr><th>Skill</th><th>Level</th><th>Practice</th></tr></thead><tbody>{SKILLS.map(skill=>{const learned=member.skills[skill.id];return <tr key={skill.id}><td><b>{skill.name}</b><span className="skill-detail attribute-tags">{skill.affinities.map(a=>{const attribute=SPECIALIZATIONS.find(n=>n.id===a.attribute)!;return <span key={a.attribute} style={{color:STAT_COLORS[attribute.parent]}}><ActivitySymbol group={attribute.group} stat={attribute.parent}/> {attribute.name}</span>;})}</span></td><td>{learned.level} / 99</td><td>{learned.level===99?'Mastered':`${learned.experience} / ${10*(learned.level+1)}`}</td></tr>;})}</tbody></table>;
}
export function AttributesPanel({member}:{member:Profile}){
 const [sort,setSort]=useState<'stat'|'skill'>('stat');
 const attributes=[...SPECIALIZATIONS].sort((a,b)=>sort==='stat'?STATS.indexOf(a.parent)-STATS.indexOf(b.parent)||ACTIVITY_GROUPS.findIndex(g=>g.id===a.group)-ACTIVITY_GROUPS.findIndex(g=>g.id===b.group):ACTIVITY_GROUPS.findIndex(g=>g.id===a.group)-ACTIVITY_GROUPS.findIndex(g=>g.id===b.group)||STATS.indexOf(a.parent)-STATS.indexOf(b.parent));
 return <><div className="table-toolbar"><button onClick={()=>setSort(value=>value==='stat'?'skill':'stat')} aria-label="Toggle attribute sorting">Sort: {sort==='stat'?'Attribute':'Skill'} ↕</button></div><div className="attribute-table-scroll"><table className="attribute-table"><thead><tr><th>Symbol</th><th>Name</th><th>Attribute</th><th>Skill</th><th>Value</th><th>Potential</th></tr></thead><tbody>{attributes.map(attribute=><tr key={attribute.id}><td><ActivitySymbol group={attribute.group} stat={attribute.parent}/></td><td style={{color:STAT_COLORS[attribute.parent]}}>{attribute.name}</td><td><StatSymbol stat={attribute.parent}/> <span className="stat-abbreviation" title={STAT_INFO[attribute.parent].name}>{STAT_SHORT[attribute.parent]}</span></td><td><ActivitySymbol group={attribute.group} stat={attribute.parent}/> {ACTIVITY_GROUPS.find(g=>g.id===attribute.group)!.name}</td><td className="numeric">{member.specializations[attribute.id].value.toLocaleString(undefined,{maximumFractionDigits:2})}</td><td className="unknown-potential">???</td></tr>)}</tbody></table></div></>;
}
const STAT_COLORS=Object.fromEntries(STATS.map(stat=>[stat,STAT_VISUALS[stat].color]));
