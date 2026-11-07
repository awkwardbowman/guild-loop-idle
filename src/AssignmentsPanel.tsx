import type React from 'react';
import {formatNumber} from './numbers.ts';
import type {Game,Member} from './engine.ts';
import {setQueue,recall,memberCanDungeon,toggleMember,runStageLabel,runProgress,effectiveLimit} from './engine.ts';
import {cargoSize} from './resources.ts';
import {roomById} from './rooms.ts';
import {RarityText} from './Indicators.tsx';
import {DUNGEONS,dungeonById} from './content.ts';
import {dungeonUnlocked} from './progression.ts';
import {StatSymbols} from './StatSymbols.tsx';
import {dungeonStatMix} from './stat-presentation.ts';
export function memberStatus(game:Game,member:Member){
 const run=game.active.find(run=>run.memberId===member.id);
 if(!run&&member.queue.length&&!memberCanDungeon(game,member))return 'Cannot enter: needs an owned Constitution Skill';
 return run?`${runStageLabel(run)} · ${dungeonById(run.dungeonId).name}`:member.cooldown?`Healing · ${member.cooldown}s`:!member.enabled?'Assignment paused':member.queue[0]?`Queued · ${dungeonById(member.queue[0].dungeonId).name}`:'Idle';
}
export function AssignmentsPanel({game,member,onChange,onDismiss}:{game:Game;member:Member;onChange:React.Dispatch<React.SetStateAction<Game>>;onDismiss:()=>void}){
 const run=game.active.find(run=>run.memberId===member.id),assignment=member.queue[0];
 return <><section className="outing"><h3>Current activity</h3><p className="status-line">{memberStatus(game,member)}</p>{run&&<><p>Room {run.floor} · stopping at {effectiveLimit(game,run)===Infinity?'unlimited depth':`room ${effectiveLimit(game,run)}`}</p>{run.generated&&<p><RarityText index={roomById(run.dungeonId,run.generated.id).rarity}>{roomById(run.dungeonId,run.generated.id).name}</RarityText></p>}{run.rules==='rooms'&&<><p>Endurance: {formatNumber(run.endurance.current)} / {formatNumber(run.endurance.max)}</p><progress aria-label="Endurance capacity" max={run.endurance.max} value={run.endurance.current}/>{run.lowSkill&&run.roomStartedAt!==null&&<p role="status">Insufficient skill: {formatNumber((run.roomEfficiency??0)*100)}% efficiency · {Math.max(0,30-(run.elapsed-run.roomStartedAt))}s grace remaining</p>}{run.recallRequestedAt!==null&&<p role="status">Recall queued for the next full-floor boundary · {Math.max(0,30-(run.elapsed-run.recallRequestedAt))}s until exceptional interruption</p>}</>}<progress max={runProgress(run).max} value={runProgress(run).value} aria-label="Current outing task"/><small>Carrying {run.chips} Chips · {Object.values(run.loot).reduce((a,b)=>a+b,0)} loot · size {cargoSize(run.loot,run.chips)} / {run.carryCapacity}</small></>}<div className="actions"><button onClick={()=>onChange(g=>toggleMember(g,member.id))}>{member.enabled?'Pause assignments':'Enable assignments'}</button>{run&&run.stage!=='returning'&&<button onClick={()=>onChange(g=>recall(g,member.id))} disabled={run.recallRequestedAt!==null}>{run.recallRequestedAt!==null?'Recall queued':'Recall'}</button>}{assignment&&<button onClick={()=>onChange(g=>setQueue(g,member.id,[]))}>Remove assignment</button>}<button className="danger text-button" disabled={!!run} onClick={onDismiss}>Dismiss member</button></div></section>
 <h3>Assign an activity</h3>{DUNGEONS.filter(d=>dungeonUnlocked(game.progression,d.id)).map(d=>{const selected=assignment?.dungeonId===d.id,history=member.dungeonHistory[d.id];return <section className="assignment-option" key={d.id}><div className="panel-heading"><b>{d.name}</b><StatSymbols mix={dungeonStatMix(d.id)}/><button disabled={selected||!memberCanDungeon(game,member)} onClick={()=>onChange(g=>setQueue(g,member.id,[{dungeonId:d.id}]))}>{selected?'Assigned':'Add to dungeon'}</button></div><p className="muted">Farthest room: {history?.bestRoom||'—'} · Last retreat: {history?.lastReturn?`${history.lastReturn.room} · ${history.lastReturn.reason}`:'—'}</p>{history?.lastReturn&&<p className="muted">{history.lastReturn.detail}</p>}</section>;})}</>;
}
