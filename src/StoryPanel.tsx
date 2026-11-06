import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {completeStoryAction,calendar} from './engine.ts';
import {currentGoals,plotEntries} from './story.ts';
import type {StoryLocation,StoryTab} from './story.ts';
export function StoryPanel({game,onChange,onNavigate}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;onNavigate:(tab:StoryTab)=>void}){
 const [view,setView]=useState<'Current Goals'|'Plot'>('Current Goals');
 const goals=currentGoals(game.progression,game.inventory),plot=plotEntries(game.progression);
 function visit(location:StoryLocation){if(location.tab==='Story')setView('Current Goals');else onNavigate(location.tab);}
 return <><div className="page-heading"><div className="overline">YOUR GUILD’S JOURNEY</div><h2>Story</h2></div>
 <nav className="subtabs" aria-label="Story tabs" role="tablist">{(['Current Goals','Plot'] as const).map(t=><button key={t} id={t==='Plot'?'story-plot-tab':'story-goals-tab'} role="tab" aria-selected={view===t} aria-controls={t==='Plot'?'story-plot':'story-goals'} className={view===t?'selected':''} onClick={()=>setView(t)}>{t}</button>)}</nav>
 {view==='Current Goals'?<section role="tabpanel" id="story-goals" aria-labelledby="story-goals-tab">{goals.length?goals.map(goal=><article className="panel story-compact" key={goal.id}><div className="story-quicklinks">{goal.action?<button className="primary" aria-label={goal.title} onClick={()=>onChange(state=>completeStoryAction(state,goal.action!))}>Continue →</button>:<button title={goal.location.label} onClick={()=>visit(goal.location)}>{goal.location.tab} ↗</button>}</div><details className="card-disclosure"><summary><span className="card-title">{goal.title}</span></summary><div className="card-body"><p>{goal.description}</p></div></details></article>):<div className="panel"><h3>No current story goals</h3></div>}</section>:
 <section role="tabpanel" id="story-plot" aria-labelledby="story-plot-tab">{!plot.length&&<div className="panel"><h3>Your story begins here</h3></div>}{plot.map(entry=><article className="panel story-compact" key={entry.id}><div className="story-quicklinks">{[...new Map(entry.locations.map(location=>[location.tab,location])).values()].map(location=><button key={location.tab} title={entry.locations.filter(item=>item.tab===location.tab).map(item=>item.label).join('\n')} onClick={()=>visit(location)}>{location.tab==='Story'?'Goals':location.tab} ↗</button>)}</div><details className="card-disclosure"><summary><span className="card-title">{entry.title}</span><small>Day {entry.day}</small></summary><div className="card-body"><time>{calendar(entry.day,entry.time).time}</time><p>{entry.description}</p></div></details></article>)}</section>}
 </>;
}
