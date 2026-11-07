import React from 'react';
import {STAT_INFO,ACTIVITY_GROUPS} from './attributes.ts';
import type {Stat} from './attributes.ts';
import {STAT_VISUALS,ACTIVITY_VISUALS} from './stat-presentation.ts';
import type {StatEmphasis} from './stat-presentation.ts';
export function StatSymbol({stat,label=false,value}:{stat:Stat;label?:boolean;value?:React.ReactNode}){
 const visual=STAT_VISUALS[stat];
 return <span className="stat-symbol" style={{'--stat-color':visual.color} as React.CSSProperties} title={STAT_INFO[stat].name}>
 <svg viewBox="0 0 24 24" role={label?undefined:"img"} aria-hidden={label||undefined} aria-label={label?undefined:STAT_INFO[stat].name}><path d={visual.path}/></svg>{label&&<span>{STAT_INFO[stat].name}</span>}{value!==undefined&&<span className="stat-value">{value}</span>}</span>;
}
export function StatSymbols({mix,limit=3}:{mix:StatEmphasis[];limit?:number}){return <span className="stat-symbols" role="group" aria-label="Known attributes">{mix.slice(0,limit).map(entry=><StatSymbol key={entry.stat} stat={entry.stat}/>)}</span>;}

export function ActivitySymbol({group,stat,label=false}:{group:import('./attributes.ts').ActivityGroup;stat?:Stat;label?:boolean}){
 const name=ACTIVITY_GROUPS.find(item=>item.id===group)!.name;
 return <span className="stat-symbol activity-symbol" style={{'--stat-color':stat?STAT_VISUALS[stat].color:'#000000'} as React.CSSProperties} title={name}><svg viewBox="0 0 24 24" role={label?undefined:"img"} aria-hidden={label||undefined} aria-label={label?undefined:name}><path d={ACTIVITY_VISUALS[group].path}/></svg>{label&&<span>{name}</span>}</span>;
}
