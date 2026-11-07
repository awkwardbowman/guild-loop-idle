import {SectionTabs} from './Interface.tsx';
import {attributeValue} from './specialization.ts';
import {formatNumber} from './numbers.ts';
import React,{useState} from 'react';
import type {Member} from './engine.ts';
import {STATS} from './attributes.ts';
import {StatSymbol} from './StatSymbols.tsx';
import {AttributesPanel,LearnedSkillsPanel} from './SkillPanel.tsx';
const fmt=formatNumber;
export type CharacterTab={id:string;label:string;content:React.ReactNode};
export function CharacterHeader({name,member,tags,known=true}:{name:string;member:Pick<Member,'stats'|'selections'> & {origin?:Member['origin']};tags?:React.ReactNode;known?:boolean}){
 return <header className="character-header"><h3>{name}</h3><div className="compact-stats" aria-label={`${name} maximum stats`}>{STATS.map(stat=><StatSymbol key={stat} stat={stat} value={known?fmt(stat==='soul'&&member.origin==='recruit'?1:attributeValue(member,stat)):'???'}/>)}</div>{tags&&<div className="character-tags">{tags}</div>}</header>;
}
export function CharacterPanel({name,member,tabs=[],story,lore,tags,showSkills=true}:{name:string;member:Pick<Member,'stats'|'specializations'|'skills'|'selections'|'constitutionExperience'>;tabs?:CharacterTab[];story?:React.ReactNode;lore:React.ReactNode;tags?:React.ReactNode;showSkills?:boolean}){
 const options=[...(story?[{id:'story',label:'Story',content:story}]:[]),{id:'attributes',label:'Skills',content:<AttributesPanel member={member}/>},...(showSkills?[{id:'skills',label:'Composite Skills',content:<LearnedSkillsPanel member={member}/>}]:[]),...tabs,{id:'lore',label:'Lore',content:lore}];
 const [selected,setSelected]=useState(tabs[0]?.id??options[0].id);const active=options.find(tab=>tab.id===selected)??options[0];const prefix=React.useId();
 return <section className="panel character-panel"><CharacterHeader name={name} member={member} tags={tags}/><SectionTabs label={`${name} tabs`} options={options} selected={active.id} onSelect={setSelected} prefix={prefix} className="character-tabs"/><div className="character-content" role="tabpanel" id={`${prefix}-${active.id}-panel`} aria-labelledby={`${prefix}-${active.id}-tab`}>{active.content}</div></section>;
}
