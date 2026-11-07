import {useContext} from 'react';
import {DiscoveryContext} from './Interface.tsx';
import {revealedDungeonSkills} from './discovery.ts';
import {skillMatrix,skillValue,skillPotential,trainingBand} from './specialization.ts';
import {formatNumber} from './numbers.ts';
import React,{useState} from 'react';
import {STAT_VISUALS} from './stat-presentation.ts';
import type {Member} from './engine.ts';
import {browseLearnedSkills} from './skill-browser.ts';
import type {SkillSort} from './skill-browser.ts';
import {StatSymbol,ActivitySymbol} from './StatSymbols.tsx';
import {ACTIVITY_GROUPS,STATS,STAT_INFO,SPECIALIZATIONS,STAT_SHORT} from './attributes.ts';
type Profile=Pick<Member,'stats'|'specializations'|'skills'|'selections'|'constitutionExperience'>;
export function LearnedSkillsPanel({member}:{member:Profile}){
 const [selected,setSelected]=useState<string[]>([]),[attributeQuery,setAttributeQuery]=useState(''),[query,setQuery]=useState(''),[sort,setSort]=useState<SkillSort>('name');
 const revealed=revealedDungeonSkills(useContext(DiscoveryContext));
 const known=browseLearnedSkills(member).filter(s=>revealed.has(s.id)),skills=browseLearnedSkills(member,selected,query,sort).filter(s=>revealed.has(s.id));
 const attributes=SPECIALIZATIONS.filter(attribute=>[attribute.name,STAT_INFO[attribute.parent].name,ACTIVITY_GROUPS.find(group=>group.id===attribute.group)!.name].some(name=>name.toLocaleLowerCase().includes(attributeQuery.trim().toLocaleLowerCase())));
 const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(attribute=>attribute!==id):[...current,id]);
 return <div className="skill-browser"><aside className="skill-filter-card" aria-label="Skill attribute filters"><div className="skill-filter-heading"><b>Skills · {selected.length}/27</b><button disabled={!selected.length&&!attributeQuery} onClick={()=>{setSelected([]);setAttributeQuery('');}}>Clear</button></div><input type="search" aria-label="Search skill attributes" placeholder="Find an attribute…" value={attributeQuery} onChange={event=>setAttributeQuery(event.target.value)}/><div className="skill-filter-checklist">{attributes.map(attribute=><label key={attribute.id} title={`${STAT_INFO[attribute.parent].name} · ${ACTIVITY_GROUPS.find(group=>group.id===attribute.group)!.name}`}><input type="checkbox" checked={selected.includes(attribute.id)} onChange={()=>toggle(attribute.id)}/><ActivitySymbol group={attribute.group} stat={attribute.parent}/><span style={{color:STAT_COLORS[attribute.parent]}}>{attribute.name}</span></label>)}{!attributes.length&&<p className="muted">No attributes match.</p>}</div></aside>
 <section className="learned-skill-results" aria-label="Composite Skills"><div className="skill-browser-toolbar"><input type="search" aria-label="Search Composite Skills" placeholder="Search skills…" value={query} onChange={event=>setQuery(event.target.value)}/><select aria-label="Sort learned skills" value={sort} onChange={event=>setSort(event.target.value as SkillSort)}><option value="name">Name A–Z</option><option value="level">Level ↓</option></select></div>
 {skills.length?<ul className="compact-skill-list">{skills.map(skill=><li key={skill.id}><b>{skill.name}</b><span className="skill-combination" aria-label={`${skill.name} attributes`}>{skill.affinities.map(affinity=>{const attribute=SPECIALIZATIONS.find(attribute=>attribute.id===affinity.attribute)!;return <span key={attribute.id} title={attribute.name}><ActivitySymbol group={attribute.group} stat={attribute.parent}/></span>;})}</span><span className="skill-level">Lv {member.skills[skill.id].level}</span></li>)}</ul>:<p className="skill-empty muted">{known.length?'No skills match these filters.':'No Composite Skills discovered yet.'}</p>}
 </section></div>;
}
export function AttributesPanel({member,revealPotential=false}:{member:Profile;revealPotential?:boolean}){
 const matrix=skillMatrix(member),[selected,setSelected]=useState('');
 const fmt=formatNumber;
 const selectedSkill=SPECIALIZATIONS.find(s=>s.id===selected);
 const describe=(id:string)=>{const value=skillValue(member,id),potential=skillPotential(member,id);return `${SPECIALIZATIONS.find(s=>s.id===id)!.name}: Value ${fmt(value)}; Potential ${revealPotential?fmt(potential):'unknown'}; ${trainingBand(value,potential)} training band${revealPotential?`; ${Math.round(value/potential*100)}%`:''}.`;};
 return <><p className="muted">Five Attributes × five Disciplines. Empty intersections have no authored Skill. Select a Value for details.</p><p className="scroll-cue" id="skill-scroll-help">Scroll horizontally for all Disciplines and totals. Each Skill value is a keyboard-accessible button.</p><div className="attribute-table-scroll" role="region" aria-label="Skill matrix" aria-describedby="skill-scroll-help" tabIndex={0}><table className="skill-matrix"><caption>Skills · Value and totals</caption><thead><tr><th scope="col">Attribute / Discipline</th>{matrix.selections.disciplines.map(group=><th scope="col" key={group}><ActivitySymbol group={group} label/></th>)}<th scope="col">Total</th></tr></thead><tbody>{matrix.cells.map((row,i)=><tr key={matrix.selections.attributes[i]}><th scope="row"><StatSymbol stat={matrix.selections.attributes[i]} label/></th>{row.map((skill,j)=><td key={j}>{skill&&<button type="button" className="skill-cell" title={describe(skill.id)} aria-label={describe(skill.id)} onClick={()=>setSelected(skill.id)}><ActivitySymbol group={skill.group} stat={skill.parent}/><span className={`skill-value training-${trainingBand(skillValue(member,skill.id),skillPotential(member,skill.id))}`}>{fmt(skillValue(member,skill.id))}</span></button>}</td>)}<td className="numeric">{fmt(matrix.rows[i])}</td></tr>)}</tbody><tfoot><tr><th scope="row">Total</th>{matrix.columns.map((value,i)=><td key={i} className="numeric">{fmt(value)}</td>)}<td className="numeric">{fmt(matrix.total)}</td></tr></tfoot></table></div>{selectedSkill&&<p role="status">{describe(selectedSkill.id)}</p>}<p className="muted">Red: below 75% · Yellow: 75–&lt;90% · Green: 90%+. Constitution floor XP: {member.constitutionExperience??0}. Composite Skills are shown separately.</p></>;
}
const STAT_COLORS=Object.fromEntries(STATS.map(stat=>[stat,STAT_VISUALS[stat].color]));
