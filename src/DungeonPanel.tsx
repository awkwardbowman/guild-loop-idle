import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {setDungeonLimit} from './engine.ts';
import {DUNGEONS} from './content.ts';
import {dungeonUnlocked,hasEvent} from './progression.ts';
import {roomDungeon,ROOM_GROUPS} from './rooms.ts';
import {SPECIALIZATIONS} from './attributes.ts';
import {SKILLS,effectiveAttribute} from './skill-system.ts';
import {travelSeconds} from './locations.ts';
import {resourceById} from './resources.ts';
export function DungeonPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [selected,setSelected]=useState('');const member=game.members.find(member=>member.id===selected)??game.members[0];const modern=hasEvent(game.progression,'friends_introduced')||hasEvent(game.progression,'room_routes_enabled');
 const name=(id:string)=>SPECIALIZATIONS.find(attribute=>attribute.id===id)?.name??id;
 return <><label className="dungeon-comparison">Compare member<select aria-label="Compare dungeon member" value={member?.id??''} onChange={event=>setSelected(event.target.value)}>{game.members.map(member=><option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
 {DUNGEONS.filter(dungeon=>dungeonUnlocked(game.progression,dungeon.id)).map(dungeon=>{const route=roomDungeon(dungeon.id);return <section className="panel dungeon" key={dungeon.id}><div className="panel-heading"><h3>{dungeon.name}</h3><span className="badge">{modern?'No gear required':'Established route'}</span></div><p>{dungeon.description}</p><p className="muted">{travelSeconds(game.homeLocationId,dungeon.locationId)}s outbound · {travelSeconds(dungeon.locationId,game.homeLocationId)}s home · 10 rooms per floor</p>
 {!modern&&<p className="muted">Your established guild keeps its saved task routes. Meet Arya and Clyde in Current Goals to explore weighted room routes.</p>}
 <div className="room-group-weights"><h3>Room group weights</h3><div className="attribute-tags">{ROOM_GROUPS.map(group=><span className="badge" key={group}>{group}: {route.groups[group]}</span>)}</div><p className="muted">A group is rolled first, then a room within that group. Doubling a group’s weight doubles its chance relative to the others.</p></div>
 <details><summary>Rooms, checks and loot</summary>{ROOM_GROUPS.map(group=><div className="attribute-group" key={group}><h3>{group}</h3>{route.rooms.filter(room=>room.group===group).map(room=><article className="dungeon-check-profile" key={room.id}><b>{room.name} · weight {room.weight} · {room.mandatory?'Mandatory':'Optional'}</b>{room.checks.map(check=><div key={check.id}><p>{check.name} · {SKILLS.find(skill=>skill.id===check.skill)?.name}{check.requiredLevel>0?` level ${check.requiredLevel}+`:''}</p><small>{check.attributes.map(attribute=>`${name(attribute.attribute)} ${Math.round(attribute.weight*100)}%`).join(' · ')}</small>{member&&<small>{member.name}: {member.skills[check.skill].level<check.requiredLevel?'Cannot perform this check':`capability ${check.attributes.reduce((sum,attribute)=>sum+attribute.weight*effectiveAttribute({...member,gear:0},attribute.attribute,.5),0).toFixed(2)}`}</small>}<small>Loot weights: Chips 1 · {check.loot.map(entry=>`${resourceById(entry.id).name} ${entry.weight} (size ${resourceById(entry.id).size})`).join(' · ')}</small></div>)}</article>)}</div>)}</details>
 <div className="dungeon-bottom"><p>Difficulty grows ×1.04 per room. Loot budgets grow linearly. Optional failures skip; mandatory failures retry until resources cannot fund progress.</p><label className="depth">Global room limit<input aria-label={`${dungeon.name} global room limit`} type="number" min="1" max="1000000" placeholder="Unlimited" value={game.dungeonLimits[dungeon.id]??''} onChange={event=>{const raw=event.target.value;if(raw===''||Number.isInteger(Number(raw)))onChange(g=>setDungeonLimit(g,dungeon.id,raw===''?null:Number(raw)));}}/></label></div>
 </section>;})}</>;
}
