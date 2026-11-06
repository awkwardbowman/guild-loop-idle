import {ResourceName} from './ResourceName.tsx';
import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {setDungeonLimit,setQueue,dungeonOccupants} from './engine.ts';
import {DUNGEONS} from './content.ts';
import {dungeonUnlocked,hasEvent} from './progression.ts';
import {roomDungeon} from './rooms.ts';
import {SKILLS} from './skill-system.ts';
import {travelSeconds} from './locations.ts';
import {resourceById} from './resources.ts';
import {dungeonStatMix,skillStatMix} from './stat-presentation.ts';
import {StatSymbol,StatSymbols} from './StatSymbols.tsx';
export function DungeonPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [selected,setSelected]=useState('');const member=game.members.find(member=>member.id===selected)??game.members[0];const modern=hasEvent(game.progression,'friends_introduced')||hasEvent(game.progression,'room_routes_enabled');
 const [added,setAdded]=useState('');
 return <><label className="dungeon-comparison">Assign member<select aria-label="Dungeon assignment member" value={member?.id??''} onChange={event=>{setSelected(event.target.value);setAdded('');}}>{game.members.map(member=><option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
 {DUNGEONS.filter(dungeon=>dungeonUnlocked(game.progression,dungeon.id)).map(dungeon=>{
 const route=roomDungeon(dungeon.id),mix=dungeonStatMix(dungeon.id);
 const skillIds=[...new Set(route.rooms.flatMap(room=>room.checks.map(check=>check.skill)))];
 const loot=modern?['chips',...new Set(route.rooms.flatMap(room=>room.checks.flatMap(check=>check.loot.map(entry=>entry.id))))]:['chips',...dungeon.loot.map(entry=>entry.id)];
 return <section className="panel compact-card dungeon" key={dungeon.id}>
 <details className="card-disclosure"><summary><span className="card-title">{dungeon.name}</span><StatSymbols mix={mix}/><span className="badge">{dungeonOccupants(game,dungeon.id).length}/{dungeon.maxConcurrent}</span></summary>
 <div className="card-body"><p className="lore">{dungeon.description}</p><p className="muted">Travel Time: {travelSeconds(game.homeLocationId,dungeon.locationId)}s</p>
 <div className="attribute-tags">{mix.map(entry=><StatSymbol key={entry.stat} stat={entry.stat} label value={`${Math.round(entry.weight*100)}%`}/>)}</div>
 <h4>Skills & opportunities</h4><div className="skill-cards">{skillIds.map(id=>{const skill=SKILLS.find(s=>s.id===id)!;const checks=route.rooms.flatMap(room=>room.checks).filter(check=>check.skill===id);const level=Math.max(...checks.map(c=>c.requiredLevel));return <details className="skill-card" key={id}><summary><span>{skill.name}{level>0&&<small> Lv {level}+</small>}</span><StatSymbols mix={skillStatMix(checks)}/>{member&&<span className="skill-readiness">{member.skills[id].level>=level?'✓':'Locked'}</span>}</summary><div className="card-body"><p>{checks.map(check=>check.name).join(' · ')}</p><div className="attribute-tags">{skillStatMix(checks).map(entry=><StatSymbol key={entry.stat} stat={entry.stat} label/>)}</div>{member&&<p className="muted">{member.name} · Level {member.skills[id].level}{level>0?` / ${level} required`:''}</p>}</div></details>;})}</div>
 {!modern&&<p className="muted">Established task route. Continue Current Goals to discover new routes.</p>}</div></details>
 <div className="card-footer"><span className="reward-preview" title="Possible finds">Finds: {loot.map((id,index)=><React.Fragment key={id}>{index>0?' · ':''}<ResourceName id={id}/></React.Fragment>)}</span><div className="card-controls"><label className="depth">Room limit<input aria-label={`${dungeon.name} global room limit`} type="number" min="1" max="1000000" placeholder="Unlimited" value={game.dungeonLimits[dungeon.id]??''} onChange={event=>{const raw=event.target.value;if(raw===''||Number.isInteger(Number(raw)))onChange(g=>setDungeonLimit(g,dungeon.id,raw===''?null:Number(raw)));}}/></label><button disabled={!member||member.queue.length>=20} onClick={()=>{if(!member)return;onChange(g=>{const current=g.members.find(m=>m.id===member.id);return current?setQueue(g,current.id,[...current.queue,{dungeonId:dungeon.id,maxDepth:null}]):g;});setAdded(`${dungeon.id}:${member.id}`);}}>+ Queue</button></div></div>
 {added===`${dungeon.id}:${member?.id}`&&<span role="status" className="inline-feedback">Added to {member?.name}’s queue</span>}
 </section>;})}</>;
}
