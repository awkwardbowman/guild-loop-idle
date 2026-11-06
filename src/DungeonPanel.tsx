import {attributeValue} from './specialization.ts';
import {DungeonSettings} from './DungeonSettings.tsx';
import {ResourceName} from './ResourceName.tsx';
import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {setDungeonLimit,setQueue,memberCanDungeon,dungeonWaiting,dungeonOccupants} from './engine.ts';
import {DUNGEONS} from './content.ts';
import {dungeonUnlocked,hasEvent} from './progression.ts';
import {roomDungeon} from './rooms.ts';
import {SKILLS,isSkillDiscovered} from './skill-system.ts';
import {travelSeconds} from './locations.ts';
import {resourceById} from './resources.ts';
import {dungeonStatMix,skillStatMix} from './stat-presentation.ts';
import {StatSymbol,StatSymbols} from './StatSymbols.tsx';
export function DungeonPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [selected,setSelected]=useState('');const member=game.members.find(member=>member.id===selected)??game.members[0];const modern=hasEvent(game.progression,'friends_introduced')||hasEvent(game.progression,'room_routes_enabled');
 const [added,setAdded]=useState('');
 return <><label className="dungeon-comparison">Assign member<select aria-label="Dungeon assignment member" value={member?.id??''} onChange={event=>{setSelected(event.target.value);setAdded('');}}>{game.members.map(member=><option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
 {DUNGEONS.filter(dungeon=>dungeonUnlocked(game.progression,dungeon.id)).map(dungeon=>{
 const route=roomDungeon(dungeon.id),mix=dungeonStatMix(dungeon.id),waiting=dungeonWaiting(game,dungeon.id);
 const skillIds=dungeon.id==='wood'?['combat','herbology']:[...new Set(route.rooms.flatMap(room=>room.checks.map(check=>check.skill)))].filter(id=>member&&isSkillDiscovered(member.skills[id]));
 const loot=modern?['chips',...new Set(route.rooms.flatMap(room=>room.checks.flatMap(check=>check.loot.map(entry=>entry.id))))]:['chips',...dungeon.loot.map(entry=>entry.id)];
 return <section className="panel compact-card dungeon" key={dungeon.id}>
 <details className="card-disclosure"><summary><span className="card-title">{dungeon.name}</span><StatSymbols mix={mix}/><span className="badge">{dungeonOccupants(game,dungeon.id).length}/{dungeon.maxConcurrent}</span><span className="badge">{waiting.length} queued</span></summary>
 <div className="card-body"><h4>Waiting queue</h4>{waiting.length?<ol className="waiting-queue">{waiting.map(m=><li key={m.id}><b>{m.name}</b><span> · Ready for a place</span><div className="attribute-tags">{mix.map(({stat})=><StatSymbol key={stat} stat={stat} label value={attributeValue(m,stat).toFixed(2)}/>)}</div></li>)}</ol>:<p className="muted">No members waiting.</p>}<p className="lore">{dungeon.description}</p><p className="muted">Travel Time: {travelSeconds(game.homeLocationId,dungeon.locationId)}s</p>
 <div className="attribute-tags">{mix.map(entry=><StatSymbol key={entry.stat} stat={entry.stat} label value={`${Math.round(entry.weight*100)}%`}/>)}</div>
 {skillIds.length>0&&<h4>Skills & opportunities</h4>}<div className="skill-cards">{skillIds.map(id=>{const skill=SKILLS.find(s=>s.id===id)!;const checks=route.rooms.flatMap(room=>room.checks).filter(check=>check.skill===id);const level=Math.max(...checks.map(c=>c.requiredLevel));return <details className="skill-card" key={id}><summary><span>{skill.name}{level>0&&<small> Lv {level}+</small>}</span><StatSymbols mix={skillStatMix(checks)}/>{member&&<span className="skill-readiness">{member.skills[id].level>=level?'✓':'Locked'}</span>}</summary><div className="card-body"><p>{checks.map(check=>check.name).join(' · ')}</p><div className="attribute-tags">{skillStatMix(checks).map(entry=><StatSymbol key={entry.stat} stat={entry.stat} label/>)}</div>{member&&<p className="muted">{member.name} · Level {member.skills[id].level}{level>0?` / ${level} required`:''}</p>}</div></details>;})}</div>
 <DungeonSettings game={game} onChange={onChange} dungeonId={dungeon.id}/>
 {!modern&&<p className="muted">Established task route. Continue Current Goals to discover new routes.</p>}</div></details>
 <div className="card-footer"><span className="reward-preview" title="Possible finds">Finds: {loot.map((id,index)=><React.Fragment key={id}>{index>0?' · ':''}<ResourceName id={id}/></React.Fragment>)}</span><div className="card-controls"><button disabled={!member||!memberCanDungeon(game,member)||member.queue[0]?.dungeonId===dungeon.id} onClick={()=>{if(!member)return;onChange(g=>{const current=g.members.find(m=>m.id===member.id);return current?setQueue(g,current.id,[{dungeonId:dungeon.id}]):g;});setAdded(`${dungeon.id}:${member.id}`);}}>Assign</button>{member&&!memberCanDungeon(game,member)&&<small>Requires an owned Constitution Skill.</small>}</div></div>
 {added===`${dungeon.id}:${member?.id}`&&<span role="status" className="inline-feedback">Added to {member?.name}’s queue</span>}
 </section>;})}</>;
}
