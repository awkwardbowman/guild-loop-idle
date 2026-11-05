import React from 'react';
import type {Member} from './engine.ts';
import {ATTRIBUTES,SKILLS,effectiveAttribute} from './skill-system.ts';
export function SkillPanel({member}:{member:Member}){
 const actor={...member,gear:0};
 return <><section className="panel"><h3>Skills</h3><p className="muted">Practice improves proficiency up to level 99. Skills can affect speed, success and resource efficiency in different proportions.</p><table><thead><tr><th>Skill</th><th>Level</th><th>Practice</th></tr></thead><tbody>{SKILLS.map(s=>{const learned=member.skills[s.id];return <tr key={s.id}><td><b>{s.name}</b><small className="skill-detail">{s.affinities.map(a=>`${Math.round(a.weight*100)}% ${ATTRIBUTES.find(n=>n.id===a.attribute)?.name}`).join(' · ')}</small></td><td>{learned.level} / 99</td><td>{learned.level===99?'Mastered':`${learned.experience} / ${10*(learned.level+1)}`}</td></tr>;})}</tbody></table></section>
 <section className="panel"><h3>Attribute specializations</h3><p className="muted">Specializations draw on their parent resource. Broader attributes contribute with diminishing effectiveness through the tree.</p>{ATTRIBUTES.filter(a=>a.parent).map(a=>{const v=member.specializations[a.id];return <div className="specialization" key={a.id}><b>{ATTRIBUTES.find(n=>n.id===a.parent)?.name} → {a.name}</b><span>{v.value.toFixed(1)} / {v.affinity} potential</span><small>Effective at 50% fallback: {effectiveAttribute(actor,a.id,.5).toFixed(1)}</small></div>;})}</section></>;
}
