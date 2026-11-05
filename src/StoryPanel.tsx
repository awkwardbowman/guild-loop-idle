import React, {useState} from 'react';
import type {Game} from './engine.ts';
import {completeStoryAction} from './engine.ts';
import {STORY_ACTIONS,availableStoryActions,storyThreads,hasEvent} from './progression.ts';
export function StoryPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [selected,setSelected]=useState('Guild');const threads=storyThreads(game.progression),thread=threads.includes(selected)?selected:'Guild';
 const actions=availableStoryActions(game.progression).filter(a=>a.thread===thread);
 const completed=STORY_ACTIONS.filter(a=>a.thread===thread&&hasEvent(game.progression,a.event));
 return <><div className="page-heading"><div className="overline">YOUR GUILD’S JOURNEY</div><h2>Story</h2><p>New opportunities appear as your guild progresses.</p></div><nav className="subtabs" aria-label="Story threads">{threads.map(t=><button key={t} className={thread===t?'selected':''} onClick={()=>setSelected(t)}>{t}</button>)}</nav>
 {actions.map(a=><section className="panel story-action" key={a.id}><h3>{a.title}</h3><p>{a.description}</p><button className="primary" onClick={()=>onChange(g=>completeStoryAction(g,a.id))}>{a.title}</button></section>)}
 {!actions.length&&<section className="panel"><h3>{thread==='Guild'?'The guild is growing':'Beyond the guild'}</h3><p>{hasEvent(game.progression,'legacy_access')?'Your existing guild retains its unlocked opportunities.':thread==='Guild'?'Recruit your first member from the Guild tab. More opportunities will appear as you explore.':'Complete expeditions to uncover new opportunities.'}</p></section>}
 <section className="panel"><h3>Milestones</h3><ul className="milestones"><li>✓ Guild established</li>{completed.map(a=><li key={a.id}>✓ {a.title}</li>)}{thread==='Guild'&&hasEvent(game.progression,'first_member_recruited')&&<li>✓ First member recruited</li>}{thread==='Expeditions'&&hasEvent(game.progression,'first_floor_cleared')&&<li>✓ First floor cleared</li>}{thread==='Expeditions'&&hasEvent(game.progression,'first_return')&&<li>✓ First expedition returned</li>}</ul></section></>;
}
