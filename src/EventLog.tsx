import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {calendar} from './engine.ts';
import {STATS} from './content.ts';
import {visibleTabs} from './progression.ts';
import {SECTIONS,filterReports,reportSection} from './sections.ts';
import type {Section} from './sections.ts';
const sections=Object.keys(SECTIONS) as Section[];
export function EventLog({game}:{game:Game}){
 const [selected,setSelected]=useState<Section[]>(sections);
 const reports=filterReports(game.reports,selected);
 // Offer visible tabs and any historical sections, without revealing future unlocks.
 const available=sections.filter(section=>visibleTabs(game.progression).includes(section)||game.reports.some(r=>reportSection(r)===section));
 function toggle(section:Section){setSelected(current=>current.includes(section)?current.filter(s=>s!==section):[...current,section]);}
 return <aside className="event-log"><div className="log-heading"><h2>Event log</h2><span className="badge">LIVE</span></div>
 <div className="log-filter">Newest first · {reports.length} / {game.reports.length} events</div>
 <div className="log-entries" role="log" aria-label="Guild events" aria-live="off">
 {reports.map((report,index)=>{const section=reportSection(report),unlock=section==='Story'&&['Unlock','Unlocked','Milestone'].includes(report.reason);return <article className="log-entry" style={{borderLeftColor:SECTIONS[section].color}} key={`${report.day}-${report.time}-${index}`} aria-label={`${section}: ${report.reason}`}>
 <div className="log-meta"><time>D{report.day} - {calendar(report.day,report.time).time}</time><b>{unlock?'Unlock':report.reason}</b></div>
 <p>{report.member!=='Guild'&&report.member!=='Story'&&<span className="log-member">{report.member} · </span>}{report.detail}</p>
 {STATS.some(stat=>report.growth[stat]>0)&&<small className="accent">{STATS.filter(stat=>report.growth[stat]>0).map(stat=>`+${report.growth[stat].toLocaleString(undefined,{maximumFractionDigits:1})} ${stat}`).join(' · ')}</small>}
 </article>;})}
 {!reports.length&&<p className="log-empty">{game.reports.length?'No events match these sections.':'No events yet.'}</p>}
 </div>
 <details className="log-filters"><summary>Filter sections <span>{available.every(section=>selected.includes(section))?'All':`${available.filter(section=>selected.includes(section)).length} selected`}</span></summary><div className="log-filter-options"><div className="log-filter-actions"><button onClick={()=>setSelected(sections)}>All</button><button onClick={()=>setSelected([])}>None</button></div>{available.map(section=><label key={section}><input type="checkbox" checked={selected.includes(section)} onChange={()=>toggle(section)}/><span className="section-number" style={{color:SECTIONS[section].color}}>{SECTIONS[section].number}</span>{section}</label>)}</div></details>
 </aside>;
}
