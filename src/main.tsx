import {AssignmentsPanel,memberStatus} from './AssignmentsPanel.tsx';
import {rarityAt} from './rarity.ts';
import {RequestPanel} from './RequestPanel.tsx';
import {storageCap} from './resources.ts';
import {equipmentCapacity} from './equipment.ts';
import {ResourceName} from './ResourceName.tsx';
import {RarityText} from './Indicators.tsx';
import {ExpeditionSidebar,MemberActivitySidebar,MemberActivityCounts,AttentionFlags} from './ExpeditionSidebar.tsx';
import {MechanicsReference} from './MechanicsReference.tsx';
import {dungeonStatMix} from './stat-presentation.ts';
import {StatSymbols} from './StatSymbols.tsx';
import {GuildPanel} from './GuildPanel.tsx';
import {ShopsPanel} from './ShopsPanel.tsx';
import {RESOURCES,cargoSize} from './resources.ts';
import {EQUIPMENT,carryingLimit} from './equipment.ts';
import {roomById} from './rooms.ts';
import {TradePanel} from './TradePanel.tsx';
import {locationById} from './locations.ts';
import {EventLog} from './EventLog.tsx';
import {SECTIONS} from './sections.ts';
import type {Section} from './sections.ts';
import {DungeonPanel} from './DungeonPanel.tsx';
import {DungeonSettings} from './DungeonSettings.tsx';
import {hasFeature,hasEvent,dungeonUnlocked,visibleTabs} from './progression.ts';
import {StoryPanel} from './StoryPanel.tsx';
import {CharacterPanel} from './CharacterPanel.tsx';
import {TRAP_ROOM} from './skill-system.ts';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialGame, startDay, advance, resourceAmount, moveMember, setQueue, changePriority, acceptCandidate, declineCandidate, dismiss, buyUpgrade, upgradeCost, setDungeonLimit, toggleMember, togglePin, recall, returnETA, effectiveLimit, calendar, runStageLabel, runProgress, equip } from './engine.ts';
import type { Game, Member } from './engine.ts';
import { DUNGEONS, dungeonById, UPGRADE_INFO, WARP_SECONDS } from './content.ts';
import type { Upgrade } from './content.ts';
import { loadLocal, saveLocal, parseSave, exportSave, SAVE_KEY, BACKUP_KEY } from './persistence.ts';
import './style.css';
const fmt=(n:number)=>n.toLocaleString(undefined,{maximumFractionDigits:1});
const duration=(n:number)=>n>=60?`${Math.floor(n/60)}m ${n%60}s`:`${n}s`;
const resources=RESOURCES.map(resource=>({id:resource.id,name:resource.name}));
const value=(g:Game,id:string)=>id==='gear'?`${fmt(g.guild.gear)} / ${g.guild.gearCap}`:fmt(id==='chips'?g.guild.chips:id==='materials'?g.guild.materials:g.inventory[id]??0);
function Depth({value,onChange,label}:{value:number|null;onChange:(v:number|null)=>void;label:string}) {const [draft,setDraft]=useState(value===null?'':String(value));useEffect(()=>setDraft(value===null?'':String(value)),[value]);return <label className="depth">{label}<input aria-label={label} type="number" min="1" max="1000000" placeholder="Unlimited" value={draft} onChange={e=>{const v=e.target.value;setDraft(v);if(v==='')onChange(null);else if(Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=1000000)onChange(Number(v));}} onBlur={()=>setDraft(value===null?'':String(value))}/></label>;}
function App(){
 const [loaded]=useState(()=>loadLocal(localStorage));const [game,setGame]=useState<Game>(()=>loaded.game??initialGame());
 const [blocked,setBlocked]=useState(!!loaded.warning&&!loaded.game&&loaded.warning.includes('not been overwritten'));
 const [notice,setNotice]=useState<string|null>(loaded.warning);const [tab,setTab]=useState('Story');const [subtab,setSubtab]=useState('Dungeons');
 const [guildView,setGuildView]=useState('Guild Master');
 const [selected,setSelected]=useState(game.members[0]?.id??'');const [pending,setPending]=useState<Game|null>(null);const [confirm,setConfirm]=useState<'reset'|'dismiss'|null>(null);const [saved,setSaved]=useState(false);
 const fileRef=useRef<HTMLInputElement>(null);const member=game.members.find(m=>m.id===selected)??game.members[0];
 useEffect(()=>{if(blocked)return;let previous=performance.now(),remainder=0;const timer=setInterval(()=>{const now=performance.now();remainder+=(now-previous)/1000;previous=now;const seconds=Math.min(60,Math.floor(remainder));if(seconds){remainder-=seconds;setGame(g=>advance(g,seconds));}},100);return()=>clearInterval(timer);},[blocked]);
 useEffect(()=>{if(blocked)return;try{saveLocal(localStorage,game);setSaved(true);}catch{setSaved(false);setNotice('Autosave unavailable. Export your save before leaving.');}},[game,blocked]);
 useEffect(()=>{const handler=(e:StorageEvent)=>{if(e.key!==SAVE_KEY&&e.key!==BACKUP_KEY)return;setBlocked(true);setNotice('Another tab changed this save. Export your progress before reloading.');};window.addEventListener('storage',handler);return()=>window.removeEventListener('storage',handler);},[]);
 useEffect(()=>{if(!pending&&!confirm)return;const modal=document.querySelector<HTMLElement>('[role="dialog"]');const previous=document.activeElement as HTMLElement|null;const elements=modal?.querySelectorAll<HTMLButtonElement>('button');elements?.[0]?.focus();const handler=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPending(null);setConfirm(null);}if(e.key==='Tab'&&elements?.length){const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',handler);return()=>{document.removeEventListener('keydown',handler);previous?.focus();};},[pending,confirm]);
 const unlockedDungeons=DUNGEONS.filter(d=>dungeonUnlocked(game.progression,d.id));
 const tabs=visibleTabs(game.progression);const activeTab=tabs.includes(tab)?tab:tabs[0];
 const clock=calendar(game.day,game.elapsed);
 const status=(m:Member)=>memberStatus(game,m);
 function download(){const url=URL.createObjectURL(new Blob([exportSave(game)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`guild-loops-day-${game.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Save exported.');}
 async function importFile(file?:File){if(!file)return;try{if(file.size>2_000_000)throw Error('Save exceeds 2 MB.');setPending(parseSave(await file.text()));}catch(e){setNotice((e as Error).message);}if(fileRef.current)fileRef.current.value='';}

 return <div className="game-shell"><aside className="sidebar"><section className="calendar compact-calendar"><div className="guild-location">{locationById(game.homeLocationId).name} - Dragon Campe Guild</div><div className="date">Day {game.day} - {clock.date.replaceAll(' / ','/')}</div><div className="clock">{clock.time}</div></section>
 {hasFeature(game.progression,'activities')&&<ExpeditionSidebar game={game} onOpen={()=>{setSubtab('Dungeons');setTab('Activities');}}/>}
 {hasFeature(game.progression,'members')&&<MemberActivitySidebar game={game} onOpen={()=>setTab('Members')}/>}
 {hasFeature(game.progression,'resources')&&<details><summary><b>Resources</b></summary><div className="segment">{game.pinnedResources.map(id=><div className="resource-mini" key={id}><span>{id==='gear'?'Legacy supplies':<ResourceName id={id}/>}</span><b className={id!=='gear'&&resourceAmount(game,id)>=storageCap(game,id)?'storage-full':''}>{value(game,id)}/{id==='gear'?game.guild.gearCap:storageCap(game,id)===Infinity?'∞':storageCap(game,id)}</b></div>)}<button className="text-button" onClick={()=>{setGuildView('Storage');setTab('Guild');}}>Manage pinned resources →</button></div></details>}<div className="sidebar-bottom">{blocked?'Autosave blocked':saved?'● Saved on this device':'○ Unsaved'}{hasEvent(game.progression,'guild_founded')?<button className="text-button" onClick={()=>setTab('Info')}>Help</button>:<button className="text-button" onClick={()=>fileRef.current?.click()}>Load a save</button>}</div></aside>
 <main className="workspace"><nav className="tabs" aria-label="Main tabs">{tabs.filter(t=>t!=='Info'&&t!=='Settings').map(t=><button key={t} aria-current={activeTab===t?'page':undefined} className={activeTab===t?'selected':''} onClick={()=>setTab(t)}><small className="section-number" style={{color:SECTIONS[t as Section].color}}>{SECTIONS[t as Section].number}</small>{t}</button>)}{tabs.includes('Info')&&<button className={`info-tab ${activeTab==='Info'?'selected':''}`} onClick={()=>setTab('Info')}>Info</button>}{tabs.includes('Settings')&&<button className={`${tabs.includes('Info')?'settings-tab':'info-tab'} ${activeTab==='Settings'?'selected':''}`} onClick={()=>setTab('Settings')}>Settings</button>}</nav>
 {notice&&<div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice(null)}>×</button></div>}
 <div className="tab-content">
 {activeTab==='Story'&&<StoryPanel game={game} onChange={setGame} onNavigate={destination=>{if(destination==='Activities')setSubtab('Dungeons');setTab(destination);}}/>}
 {activeTab==='Guild'&&<GuildPanel game={game} onChange={setGame} view={guildView} onView={setGuildView} onNavigate={destination=>{if(destination==='Activities')setSubtab('Dungeons');setTab(destination);}}/>}
 {activeTab==='Shops'&&<ShopsPanel game={game} onChange={setGame}/>}
 {activeTab==='Members'&&<><div className="page-heading"><div className="overline">ROSTER & ASSIGNMENTS</div><h2>Members</h2></div><div className="member-activity-overview"><MemberActivityCounts game={game} onOpen={()=>{}}/></div><div className="member-layout"><section className="panel roster"><h3>Dispatch priority</h3>{game.members.map((m,i)=><div className={`roster-row ${member?.id===m.id?'current':''}`} key={m.id}><button className="roster-name" onClick={()=>setSelected(m.id)}><small>{i+1}</small><span><b>{m.name}</b><small>{status(m)}</small></span></button><div className="arrows"><button aria-label={`Move ${m.name} up`} disabled={i===0} onClick={()=>setGame(g=>moveMember(g,m.id,-1))}>↑</button><button aria-label={`Move ${m.name} down`} disabled={i===game.members.length-1} onClick={()=>setGame(g=>moveMember(g,m.id,1))}>↓</button></div></div>)}</section>
 {member?<CharacterPanel key={member.id} name={member.name} member={member} tags={<span className="badge"><RarityText index={member.rarity}>{rarityAt(member.rarity).name} T{member.tier}</RarityText></span>} showSkills={hasFeature(game.progression,'skills')}
 story={<div className="character-story"><p>{member.runs} returns · Best room {member.bestRoom}</p><p>{status(member)}</p></div>}
 lore={<p className="lore">{member.origin==='arya'?'Arya is ready for the dungeon. She is one of your first friends in Emberveil.':member.origin==='clyde'?'Clyde has an eye for useful finds. He is one of your first friends in Emberveil.':'An adventurer who has joined your guild in Emberveil.'}</p>}
 tabs={[
 {id:'assignments',label:'Assignments',content:<AssignmentsPanel game={game} member={member} onChange={setGame} onDismiss={()=>setConfirm('dismiss')}/>},
 {id:'equipment',label:'Equipment',content:<><p className="status-line">{member.equipped.length} / {equipmentCapacity(member)} equipped · Carry {carryingLimit(member.carryCapacity,member.equipped)}</p>{EQUIPMENT.filter(item=>game.equipment.unlocked.includes(item.id)).map(item=><button key={item.id} aria-pressed={member.equipped.includes(item.id)} disabled={game.active.some(run=>run.memberId===member.id)||(!member.equipped.includes(item.id)&&member.equipped.length>=equipmentCapacity(member))} onClick={()=>setGame(g=>equip(g,member.id,item.id))}>{member.equipped.includes(item.id)?'◆ ':'◇ '}{item.name}</button>)}{!game.equipment.unlocked.length&&<p className="muted">No equipment unlocked.</p>}</>}
 ]}/>:<section className="panel">No members. Use Guild → Recruitment to find someone.</section>}</div></>}
 {activeTab==='Activities'&&<><div className="page-heading"><div className="overline">EXPEDITIONS & DUTIES</div><h2>Activities</h2></div><nav className="subtabs" aria-label="Activity tabs">{['Dungeons','Guild assignments'].map(t=><button className={subtab===t?'selected':''} key={t} onClick={()=>setSubtab(t)}>{t}</button>)}</nav>{subtab==='Dungeons'?<DungeonPanel game={game} onChange={setGame}/>:hasEvent(game.progression,'leather_crafting_learned')?<section className="panel"><h3>Leather Crafting</h3><p>{game.members.filter(member=>member.skills.leather_crafting.discovered).map(member=>member.name).join(', ')} can work here. The first crafting recipe is coming next.</p></section>:<section className="panel"><p>Learn Leather Crafting from Gavin to open your first guild assignment.</p></section>}</>}
 {activeTab==='Info'&&<><div className="page-heading"><div className="overline">REFERENCE & GUIDES</div><h2>Info</h2></div><MechanicsReference/><details className="panel reference"><summary>How to play</summary><div className="card-body"><p>Recruit members in Guild. Set their repeating dungeon assignment in Members, global dungeon defaults in Settings, and overrides in Activities. Available members depart automatically in roster order, subject to expedition capacity. The Catacombs of the Wound and Wish need no gear.</p><p>Each outing attempts one queued dungeon. Passing a check adds loot to the member’s carried haul. Reaching the dungeon’s shared Depth Limit starts their journey home at a room boundary. Endurance depletion in a room invokes its authored failure; the expedition time limit starts their return after {WARP_SECONDS}s of exploration.</p><p>Each expedition travels to its location before exploring, then travels home before banking loot. Nearby travel currently takes 15 seconds each way. Sales also take 15 seconds; committed items leave inventory immediately and Chips arrive on completion. Loot is banked on return. Completed tasks train maximum stats for the next outing, approaching each stat’s affinity. Uninjured members are ready on arrival; injured members finish healing before their next departure.</p><p>Time runs at one game second per real second. The temporary calendar has 30-day months and 12-month years, beginning 01 / 01 / 0001. Midnight does not recall members. Time continues while this page is open, including in the background. Closed-page offline progress is not implemented.</p></div></details><details className="panel reference"><summary>In development</summary><div className="card-body"><p>Guildmaster skill tree, stat-driven recovery, returned gear/supplies, and member traits are planned. A future dungeon failure system may lose a percentage of carried loot and apply a longer reset. Storage overflow is discarded. Safe retreats keep carried loot; those penalties are not active. Skills do not deteriorate yet. Each dungeon has weighted room groups and its own checks. Optional unavailable skills skip a room; funded checks advance deterministically. Endurance depletion and room skill timeouts use the current room’s authored failure outcome. No gear conversion is available yet.</p></div></details></>}
 {activeTab==='Settings'&&<><div className="page-heading"><div className="overline">GLOBAL PREFERENCES & GAME DATA</div><h2>Settings</h2></div><section className="panel"><DungeonSettings game={game} onChange={setGame}/></section><section className="panel"><h3>Save files</h3><p>Save data stays on this device. Export a backup or import one from another device. Importing replaces the current guild after confirmation.</p><div className="actions"><button onClick={download}>Export save</button><button onClick={()=>fileRef.current?.click()}>Import save</button></div></section><section className="panel"><h3>Reset progress</h3><p>Start a new guild from the beginning. All progress in this device's current save will be replaced. Export a backup first if you want to keep it.</p><div className="actions"><button className="danger" onClick={()=>setConfirm('reset')}>Reset guild</button></div></section></>}
 </div></main><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e=>importFile(e.target.files?.[0])}/>
 <EventLog game={game}/>
 {(pending||confirm)&&<div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="modal"><h2 id="dialog-title">{pending?'Replace this guild?':confirm==='reset'?'Start a new guild?':'Dismiss this member?'}</h2><p>{pending?'The imported save replaces your current progress.':confirm==='reset'?'This replaces your current guild. Export a backup first if you want to keep it.':`${member?.name} and their growth will leave your roster.`}</p><div className="actions"><button onClick={()=>{setPending(null);setConfirm(null);}}>Cancel</button><button className="primary" onClick={()=>{if(pending){setGame(pending);setBlocked(false);}else if(confirm==='reset'){setGame(initialGame());setBlocked(false);setNotice(null);setTab('Story');setSubtab('Dungeons');setGuildView('Guild Master');setSelected('');}else if(member)setGame(g=>dismiss(g,member.id));setPending(null);setConfirm(null);}}>Confirm</button></div></section></div>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
