import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {setQueue,memberCanDungeon,dungeonWaiting,dungeonOccupants,setDungeonStart,startingFloor} from './engine.ts';
import {DUNGEONS} from './content.ts';
import {dungeonUnlocked,hasEvent} from './progression.ts';
import {floorCatalog} from './rooms.ts';
import type {EncounterCategory,DungeonKnowledge} from './rooms.ts';
import {floorPreview,dungeonPreview,exploredFloors,revealedDungeonSkills,nextDungeonFloor} from './discovery.ts';
import {SKILLS} from './skill-system.ts';
import {travelSeconds} from './locations.ts';
import {StatSymbol} from './StatSymbols.tsx';
import {formatNumber} from './numbers.ts';
import {DungeonSettings} from './DungeonSettings.tsx';
import {EmptyState} from './Interface.tsx';
export function DiscoveryMix({preview}:{preview:ReturnType<typeof floorPreview>}){
 return <div className="discovery-mix"><span className="coverage">{preview.known}/{preview.total} known</span><span>Unknown {formatNumber(preview.unknown*100)}%</span>{preview.mix.map(entry=><StatSymbol key={entry.stat} stat={entry.stat} label value={`${formatNumber(entry.weight*100)}%`}/>)}</div>;
}
function FloorDiscovery({knowledge,dungeonId,floor}:{knowledge:DungeonKnowledge;dungeonId:string;floor:number}){
 const [categories,setCategories]=useState<EncounterCategory[]>(['normal']);
 const preview=floorPreview(knowledge,dungeonId,floor,categories),catalog=floorCatalog(dungeonId,floor),state=knowledge[dungeonId]?.[floor];
 const selectedRooms=categories.flatMap(c=>catalog[c]),known=selectedRooms.filter(r=>state?.known.includes(r.id));
 const toggle=(category:EncounterCategory)=>setCategories(current=>current.includes(category)?current.filter(c=>c!==category):[...current,category]);
 return <details className="floor-discovery"><summary><b>Floor {floor}</b><span>{floorPreview(knowledge,dungeonId,floor).known}/10 normal rooms known · {state?.bossCleared?'Boss defeated':'Boss unknown'}</span></summary><div className="card-body"><fieldset className="category-filters"><legend>Encounter categories · floor {floor}</legend>{(['normal','treasure','boss'] as const).map(category=><label key={category}><input type="checkbox" checked={categories.includes(category)} onChange={()=>toggle(category)}/>{category==='normal'?'Normal':category==='treasure'?'Treasure':'Boss'}</label>)}</fieldset>{categories.length?<><DiscoveryMix preview={preview}/><p className="muted">Each distinct room contributes equally within the selected categories. Repeated clears reveal no additional coverage.</p>{known.length?<ul>{known.map(room=><li key={room.id}>{room.name}</li>)}</ul>:<p className="muted">Successfully clear an encounter to learn its requirements.</p>}</>:<p className="muted">Select a category to inspect its discovery.</p>}</div></details>;
}
export function DungeonPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [selected,setSelected]=useState(''),[feedback,setFeedback]=useState('');
 const member=game.members.find(m=>m.id===selected)??game.members[0],revealed=revealedDungeonSkills(game.dungeonKnowledge);
 return <><label className="dungeon-comparison">Assign member<select aria-label="Dungeon assignment member" value={member?.id??''} onChange={e=>{setSelected(e.target.value);setFeedback('');}}>{game.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
 {DUNGEONS.filter(d=>dungeonUnlocked(game.progression,d.id)).map(dungeon=>{
  const preview=dungeonPreview(game.dungeonKnowledge,dungeon.id),waiting=dungeonWaiting(game,dungeon.id),completed=dungeon.id==='wood'&&hasEvent(game.progression,'campaign_completed');
  const floors=exploredFloors(game.dungeonKnowledge,dungeon.id),known=game.dungeonKnowledge[dungeon.id]??{};
  // Only successfully cleared encounters, or a defeated floor boss, can expose special names.
  const checks=floors.flatMap(f=>{const catalog=Object.values(floorCatalog(dungeon.id,f)).flat();return catalog.filter(r=>known[f]?.bossCleared||known[f]?.known.includes(r.id)).flatMap(r=>r.checks);});
  const skills=[...new Set(checks.map(c=>c.skill))].filter(id=>revealed.has(id));
  const finds=[...new Set(floors.flatMap(f=>Object.values(floorCatalog(dungeon.id,f)).flat().filter(r=>known[f]?.known.includes(r.id)).flatMap(r=>r.checks.flatMap(c=>[...c.loot.map(l=>l.id),...(c.guaranteed??[]).map(l=>l.id)]))))];
  const reason=completed?'Main dungeon completed.':!member?'Recruit a member in Guild Hall.':!memberCanDungeon(game,member)?'Requires an owned Constitution Skill.':member.queue[0]?.dungeonId===dungeon.id?`Already assigned to ${member.name}.`:'';
  return <section className="panel compact-card dungeon" key={dungeon.id}><details className="card-disclosure"><summary><span className="card-title">{dungeon.name}</span><span className="badge">{dungeonOccupants(game,dungeon.id).length}/{dungeon.maxConcurrent} active</span><span className="badge">{waiting.length} queued</span></summary><div className="card-body"><p className="lore">{dungeon.description}</p><p>{dungeon.id==='wood'?'100 floors · Main campaign':'Endless floors'} · {completed?'Complete':`Next outing: floor ${startingFloor(game,dungeon.id)}`} · Travel {travelSeconds(game.homeLocationId,dungeon.locationId)}s</p>{dungeon.id==='wood'&&nextDungeonFloor(game.dungeonKnowledge,dungeon.id)>10&&!completed&&<p className="notice">Floor 11 marks a major difficulty jump. Revisit earlier floors to train and gather supplies.</p>}<h4>Known requirements · explored floors</h4><DiscoveryMix preview={preview}/><p className="muted">Ten random standard encounters, optional non-consecutive treasure, then a separate boss. Boss checkpoints unlock the next starting floor. Room identity can repeat; only new successful clears increase discovery.</p>
  <h4>Waiting queue</h4>{waiting.length?<ol>{waiting.map(m=><li key={m.id}>{m.name} · Ready for a place</li>)}</ol>:<p className="muted">No members waiting. Assign a member below.</p>}
  <div className="floor-list">{floors.map(f=><FloorDiscovery key={f} knowledge={game.dungeonKnowledge} dungeonId={dungeon.id} floor={f}/>)}</div>
  <h4>Revealed Composite Skills</h4>{skills.length?<ul>{skills.map(id=><li key={id}>{SKILLS.find(s=>s.id===id)!.name}</li>)}</ul>:<EmptyState title="No encounter Skills revealed">Clear an encounter to reveal its Skill, or defeat a floor boss to reveal that floor’s remaining Skills.</EmptyState>}
  <p className="muted">{finds.length?`Discovered possible finds: ${finds.join(', ')}.`:'Possible finds are unknown until an encounter is successfully cleared.'}</p>
  <label className="form-field">Starting floor<select aria-label={`${dungeon.id} starting floor`} value={game.dungeonStarts[dungeon.id]??'latest'} disabled={completed} onChange={e=>onChange(g=>setDungeonStart(g,dungeon.id,e.target.value==='latest'?undefined:Number(e.target.value)))}><option value="latest">Latest checkpoint · floor {Math.min(dungeon.id==='wood'?100:100000,nextDungeonFloor(game.dungeonKnowledge,dungeon.id))}</option>{Array.from({length:Math.min(dungeon.id==='wood'?100:100000,nextDungeonFloor(game.dungeonKnowledge,dungeon.id))},(_,i)=>i+1).map(f=><option key={f} value={f}>Floor {f}</option>)}</select></label><p className="muted">Choose an earlier starting floor to gather materials and train before attempting the latest checkpoint. Active outings keep their current floor.</p><DungeonSettings game={game} onChange={onChange} dungeonId={dungeon.id}/></div></details><div className="card-footer"><div className="card-controls"><button disabled={!!reason} onClick={()=>{if(!member)return;const next=setQueue(game,member.id,[{dungeonId:dungeon.id}]);if(next!==game){onChange(next);setFeedback(`Assigned ${member.name} to ${dungeon.name}.`);}else setFeedback('Assignment unavailable. Check the member and dungeon requirements.');}}>Assign</button>{reason&&<small>{reason}</small>}</div></div></section>;
 })}{feedback&&<p className="inline-feedback" role="status">{feedback}</p>}</>;
}
