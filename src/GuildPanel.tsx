import {ResourceName} from './ResourceName.tsx';
import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {resourceAmount,buyStorage,changePriority,acceptCandidate,declineCandidate,upgradeCost,buyUpgrade} from './engine.ts';
import {hasFeature,hasEvent} from './progression.ts';
import {RESOURCES,storageUpgradePrice,nextStorageCap} from './resources.ts';
import {UPGRADE_INFO} from './content.ts';
import {CharacterPanel,CharacterHeader} from './CharacterPanel.tsx';
import {RarityText} from './Indicators.tsx';
export function GuildPanel({game,onChange,onNavigate}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;onNavigate:(tab:string)=>void}){
 const [view,setView]=useState('Guild Master');const canStore=hasFeature(game.progression,'resources');
 return <><div className="page-heading"><div className="overline">EMBERVEIL GUILD</div><h2>Guild <span className="badge">{game.guild.chips} Chips</span></h2><p>A small hall, a growing town, and work worth doing.</p></div>
 <nav className="subtabs" aria-label="Guild tabs">{['Guild Master','Guild Hall','Storage'].map(tab=><button key={tab} className={view===tab?'selected':''} aria-pressed={view===tab} onClick={()=>setView(tab)}>{tab}</button>)}</nav>
 {view==='Guild Master'&&<CharacterPanel name="Guild Master" member={game.guildmaster} lore={<p className="lore">Your friends explore while you help Emberveil rebuild.</p>}/>}
 {view==='Guild Hall'&&<><div className="metrics"><div><small>Expeditions</small><b>{game.active.length} / {game.guild.slots}</b></div><div><small>Roster</small><b>{game.members.length} / {game.guild.rosterCap}</b></div><div><small>Rooms passed</small><b>{game.stats.clears}</b></div><div><small>Equipment slots per member</small><b>{game.equipment.capacity}</b></div></div>
 {hasFeature(game.progression,'recruitment')&&<section className="panel"><h3>Guild assignments</h3><div className="priority-options">{(['recruitment','infrastructure'] as const).map(priority=><button key={priority} className={game.guild.priority===priority?'chosen':''} onClick={()=>onChange(g=>changePriority(g,priority))}><b>{priority==='recruitment'?'Recruitment':'Infrastructure'}</b><small>{priority==='recruitment'?'Look for one candidate at a time.':'Produce building materials.'}</small></button>)}</div><progress max={20} value={game.guild.work}/></section>}
 {game.candidate&&<section className="panel"><CharacterHeader name={game.candidate.name} member={game.candidate} known={false} tags={<span className="badge"><RarityText>Common</RarityText></span>}/><div className="actions"><button disabled={game.members.length>=game.guild.rosterCap} onClick={()=>onChange(acceptCandidate)}>Recruit</button><button onClick={()=>onChange(declineCandidate)}>Decline</button></div></section>}
 {hasFeature(game.progression,'infrastructure')&&<section className="panel"><h3>Hall upgrades</h3><div className="upgrade-grid">{(['slots','quarters'] as const).map(key=>{const upgrade=UPGRADE_INFO[key],price=upgradeCost(game,key);return <div className="upgrade" key={key}><b>{upgrade.name}</b><p>{upgrade.description}</p><button disabled={game.guild.chips<price.chips||game.guild.materials<price.materials} onClick={()=>onChange(g=>buyUpgrade(g,key))}>{price.chips} Chips · {price.materials} materials</button></div>;})}</div></section>}
 {!canStore&&<p className="muted">Bring your first expedition home to begin improving the hall.</p>}</>}
 {view==='Storage'&&<>{canStore?<section className="panel"><table className="resource-table"><thead><tr><th>Resource</th><th>Stored / Cap</th><th>Increase cap</th></tr></thead><tbody>{RESOURCES.filter(resource=>['chips','leather','hide','ore','herb','materials'].includes(resource.id)||resourceAmount(game,resource.id)>0).map(resource=>{const storage=game.storage[resource.id],price=storageUpgradePrice(storage.level);return <tr key={resource.id}><td><ResourceName id={resource.id}/></td><td>{resourceAmount(game,resource.id)} / {storage.cap}</td><td><button disabled={game.guild.chips<price} onClick={()=>onChange(g=>buyStorage(g,resource.id))}>→ {nextStorageCap(storage.cap)} · {price} Chips</button></td></tr>;})}</tbody></table></section>:<p className="muted">Your first return will open the stockpile.</p>}</>}
 </>;
}
