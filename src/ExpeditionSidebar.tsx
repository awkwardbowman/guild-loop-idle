import {AttentionSymbol} from './Indicators.tsx';
import React from 'react';
import type {Game} from './engine.ts';
import {dungeonOccupants,returnETA,memberActivities} from './engine.ts';
import {DUNGEONS} from './content.ts';
import {dungeonUnlocked} from './progression.ts';
import {StatSymbols} from './StatSymbols.tsx';
import {dungeonStatMix} from './stat-presentation.ts';
const duration=(n:number)=>n>=60?`${Math.ceil(n/60)}m`:`${n}s`;
export function ExpeditionSidebar({game,onOpen}:{game:Game;onOpen:()=>void}){
 return <details open><summary><b>Expeditions</b><small>{game.active.length} underway</small></summary><div className="segment">{DUNGEONS.filter(d=>dungeonUnlocked(game.progression,d.id)).map(dungeon=>{
 const occupants=dungeonOccupants(game,dungeon.id),next=occupants.length?Math.min(...occupants.map(run=>Math.max(1,returnETA(game,run)-run.returnSeconds))):null;
 return <button className="active-tile dungeon-tile" key={dungeon.id} onClick={onOpen}><div><b>{dungeon.name}</b><StatSymbols mix={dungeonStatMix(dungeon.id)}/></div><span>{occupants.length}/{dungeon.maxConcurrent} {dungeon.maxConcurrent===1?'slot':'slots'} · {next===null?'Available':`~${duration(next)}`}</span></button>;
 })}</div></details>;
}
export function MemberActivitySidebar({game,onOpen}:{game:Game;onOpen:()=>void}){
 return <details open><summary><b>Members · {game.members.length}</b><AttentionFlags game={game}/></summary><MemberActivityCounts game={game} onOpen={onOpen}/></details>;
}
export function MemberActivityCounts({game,onOpen}:{game:Game;onOpen:()=>void}){
 const counts=memberActivities(game);
 return <div className="segment activity-counts">{[[counts.expeditions,'running expeditions',null],[counts.trading,'trading',null],[counts.crafting,'crafting',null],[counts.healing,'healing','healing'],[counts.recruits,'recruits pending','recruits'],[counts.idle,'idle','idle']].map(([count,label,state])=><button key={label} onClick={onOpen}>{Number(count)>0&&state&&<AttentionSymbol state={state as 'healing'|'recruits'|'idle'}/>}<b>{count}</b><span>{label}</span></button>)}</div>;
}

export function AttentionFlags({game}:{game:Game}){const counts=memberActivities(game);return <span className="attention-flags">{(['recruits','healing','idle'] as const).filter(state=>counts[state]>0).map(state=><span key={state}><AttentionSymbol state={state}/><span>{counts[state]}</span></span>)}</span>;}
