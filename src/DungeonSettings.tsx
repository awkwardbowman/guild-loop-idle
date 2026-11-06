import type React from 'react';
import type {Game} from './engine.ts';
import {setDungeonDefaults,setDungeonLimit,inheritDungeonLimit,setDungeonThreshold,effectiveLimit,effectiveThreshold} from './engine.ts';
export function DungeonSettings({game,onChange,dungeonId}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;dungeonId?:string}){
 const id=dungeonId,prefix=id??'Global',global=!id;
 const depth=id?(Object.hasOwn(game.dungeonLimits,id)?game.dungeonLimits[id]:undefined):game.dungeonDefaults.depthLimit;
 const threshold=id?game.dungeonThresholds[id]:game.dungeonDefaults.skillThreshold;
 const depthMode=depth===undefined?'inherit':depth===null?'unlimited':'limited';
 return <section className="dungeon-settings" aria-label={`${prefix} dungeon settings`}><h4>{global?'Dungeon Defaults':'Dungeon settings'}</h4>
 <label>Depth Limit<select aria-label={`${prefix} depth limit mode`} value={depthMode} onChange={e=>{const mode=e.target.value;if(id)onChange(g=>mode==='inherit'?inheritDungeonLimit(g,id):setDungeonLimit(g,id,mode==='unlimited'?null:10));else onChange(g=>setDungeonDefaults(g,{...g.dungeonDefaults,depthLimit:mode==='unlimited'?null:10}));}}>{!global&&<option value="inherit">Inherit global default</option>}<option value="unlimited">Unlimited</option><option value="limited">Room limit</option></select></label>
 {depthMode==='limited'&&<label>Maximum room<input aria-label={`${prefix} maximum room`} type="number" min="1" max="1000000" value={depth??''} onChange={e=>{const n=Number(e.target.value);if(id)onChange(g=>setDungeonLimit(g,id,n));else onChange(g=>setDungeonDefaults(g,{...g.dungeonDefaults,depthLimit:n}));}}/></label>}
 {!global&&<label>Threshold mode<select aria-label={`${prefix} threshold mode`} value={threshold===undefined?'inherit':'override'} onChange={e=>onChange(g=>setDungeonThreshold(g,id!,e.target.value==='inherit'?undefined:effectiveThreshold(g,id!)))}><option value="inherit">Inherit global default</option><option value="override">Override</option></select></label>}
 {(global||threshold!==undefined)&&<label>Insufficient Skill Threshold (%)<input aria-label={`${prefix} insufficient skill threshold`} type="number" min="0" max="100" step="0.1" value={threshold??0} onChange={e=>{const n=Number(e.target.value);if(id)onChange(g=>setDungeonThreshold(g,id,n));else onChange(g=>setDungeonDefaults(g,{...g.dungeonDefaults,skillThreshold:n}));}}/></label>}
 <p className="muted">{id?`Active: ${effectiveLimit(game,{dungeonId:id})===Infinity?'Unlimited':`room ${effectiveLimit(game,{dungeonId:id})}`} · ${effectiveThreshold(game,id)}% threshold. `:''}0% disables the skill timeout. Below threshold at room entry: finish within 30 game seconds or suffer that room’s failure. Depth limits count rooms.</p></section>;
}
