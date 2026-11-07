import React,{useState} from 'react';
import {formatNumber} from './numbers.ts';
import type {Game} from './engine.ts';
import {calendar} from './engine.ts';
import {STATS} from './content.ts';
import {visibleTabs} from './progression.ts';
import {SECTIONS,filterReports,reportSection,visibleReport} from './sections.ts';
import type {Section} from './sections.ts';
import {StatSymbol} from './StatSymbols.tsx';
import {AttentionSymbol,RarityText} from './Indicators.tsx';
import {LootDrops} from './ResourceName.tsx';
const sections=Object.keys(SECTIONS) as Section[];
export function EventLog({game}:{game:Game}){
 const [selected,setSelected]=useState<Section[]>(sections);
 const history=game.reports.filter(visibleReport),reports=filterReports(history,selected);
 const available=sections.filter(section=>visibleTabs(game.progression).includes(section)||history.some(r=>reportSection(r)===section));
 function toggle(section:Section){setSelected(current=>current.includes(section)?current.filter(s=>s!==section):[...current,section]);}
 return <aside className="event-log"><div className="log-heading"><h2>Event log</h2><span className="badge">LIVE</span></div><div className="log-filter">Newest first · {reports.length} / {history.length} events</div>
 <div className="log-entries" role="log" aria-label="Guild events" aria-live="off">{reports.map((report,index)=>{
 const section=reportSection(report),unlock=section==='Story'&&['Unlock','Unlocked','Milestone'].includes(report.reason),failed=report.reason==='Dungeon failed'||report.reason==='Retreated';
 return <article className="log-entry" style={{borderLeftColor:SECTIONS[section].color}} key={`${report.day}-${report.time}-${index}`} aria-label={`${section==='Activities'?'Dungeon':section}: ${report.reason}`}><div className="log-meta"><time>D{report.day} - {calendar(report.day,report.time).time}</time>{failed&&<AttentionSymbol state="healing"/>}<b>{unlock?'Unlock':failed?'Dungeon failed':report.reason}</b></div><p>{report.member!=='Guild'&&report.member!=='Story'&&<span className="log-member">{report.member} · </span>}{report.rarity===undefined?report.detail:<RarityText index={report.rarity}>{report.detail}</RarityText>}</p>{report.drops&&<LootDrops drops={report.drops}/>}{STATS.some(stat=>report.growth[stat]>=.005)&&<div className="log-growth">{STATS.filter(stat=>report.growth[stat]>=.005).map(stat=><StatSymbol key={stat} stat={stat} value={`+${formatNumber(report.growth[stat])}`}/>)}</div>}</article>;
 })}{!reports.length&&<p className="log-empty">No events to show.</p>}</div>
 <details className="log-filters"><summary>Filter sections <span>{available.every(section=>selected.includes(section))?'All':`${available.filter(section=>selected.includes(section)).length} selected`}</span></summary><div className="log-filter-options"><div className="log-filter-actions"><button onClick={()=>setSelected(sections)}>All</button><button onClick={()=>setSelected([])}>None</button></div>{available.map(section=><label key={section}><input type="checkbox" checked={selected.includes(section)} onChange={()=>toggle(section)}/><span className="section-number" style={{color:SECTIONS[section].color}}>{SECTIONS[section].number}</span>{section==='Activities'?'Dungeon':section}</label>)}</div></details></aside>;
}
