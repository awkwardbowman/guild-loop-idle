import React, {useState} from 'react';
import type {Game} from './engine.ts';
import {completeStoryAction,calendar} from './engine.ts';
import {currentGoals,plotEntries} from './story.ts';
import type {StoryLocation,StoryTab} from './story.ts';
export function StoryPanel({game,onChange,onNavigate}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;onNavigate:(tab:StoryTab)=>void}){
 const [view,setView]=useState<'Current Goals'|'Plot'>('Current Goals');
 const goals=currentGoals(game.progression,game.inventory),plot=plotEntries(game.progression);
 function visit(location:StoryLocation){if(location.tab==='Story')setView('Current Goals');else onNavigate(location.tab);}
 return <><div className="page-heading"><div className="overline">YOUR GUILD’S JOURNEY</div><h2>Story</h2><p>Follow your current goals or revisit what your guild has discovered.</p></div>
 <nav className="subtabs" aria-label="Story tabs" role="tablist">{(['Current Goals','Plot'] as const).map(t=><button key={t} id={t==='Plot'?'story-plot-tab':'story-goals-tab'} role="tab" aria-selected={view===t} aria-controls={t==='Plot'?'story-plot':'story-goals'} className={view===t?'selected':''} onClick={()=>setView(t)}>{t}</button>)}</nav>
 {view==='Current Goals'?<section role="tabpanel" id="story-goals" aria-labelledby="story-goals-tab">{goals.length?goals.map(g=><article className="panel story-action" key={g.id}><h3>{g.title}</h3><p>{g.description}</p><p className="story-location"><b>Where:</b> {g.location.label}</p>{g.action?<button className="primary" onClick={()=>onChange(state=>completeStoryAction(state,g.action!))}>{g.title}</button>:<button onClick={()=>visit(g.location)}>Go to {g.location.tab}</button>}</article>):<div className="panel"><h3>No current story goals</h3><p>Your available story goals are complete. Keep developing your guild; new goals will appear as more content becomes available.</p></div>}</section>:
 <section role="tabpanel" id="story-plot" aria-labelledby="story-plot-tab"><p className="muted">Your completed milestones and unlocks, from the guild’s beginning onward.</p>{!plot.length&&<div className="panel"><h3>Your story begins here</h3><p>Complete your first goal to begin the guild’s story.</p></div>}{plot.map(entry=><article className="panel plot-entry" key={entry.id}><time>Day {entry.day} · {calendar(entry.day,entry.time).time}</time><h3>{entry.title}</h3><p>{entry.description}</p><div className="unlock-locations"><b>Where to find it</b>{entry.locations.map(location=><div key={location.label}><span>{location.label}</span><button onClick={()=>visit(location)}>Go to {location.tab==='Story'?'Current Goals':location.tab}</button></div>)}</div></article>)}</section>}
 </>;
}
