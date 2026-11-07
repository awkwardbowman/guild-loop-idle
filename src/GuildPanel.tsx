import {PageHeading,InlineFeedback,applyGameAction} from './Interface.tsx';
import {StoragePanel} from './StoragePanel.tsx';
import {ResourceName} from './ResourceName.tsx';
import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {resourceAmount,buyStorage,changePriority,acceptCandidate,declineCandidate,upgradeCost,buyUpgrade} from './engine.ts';
import {hasFeature,hasEvent} from './progression.ts';
import {RESOURCES,storageUpgradePrice,nextStorageCap} from './resources.ts';
import {UPGRADE_INFO} from './content.ts';
import {CharacterPanel,CharacterHeader} from './CharacterPanel.tsx';
import {rarityAt} from './rarity.ts';
import {RarityText} from './Indicators.tsx';
export function GuildPanel({game,onChange,onNavigate,view,onView}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;onNavigate:(tab:string)=>void;view:string;onView:(view:string)=>void}){
 const [feedback,setFeedback]=useState('');
 const canStore=hasFeature(game.progression,'resources');
 return <><PageHeading title="Guild" overline="EMBERVEIL GUILD"><p>{game.guild.chips} Chips · A small hall, a growing town, and work worth doing.</p></PageHeading><InlineFeedback message={feedback}/>
 <nav className="subtabs" aria-label="Guild tabs">{['Guild Master','Guild Hall','Storage'].map(tab=><button key={tab} className={view===tab?'selected':''} aria-current={view===tab?'page':undefined} onClick={()=>onView(tab)}>{tab}</button>)}</nav>
 {view==='Guild Master'&&<CharacterPanel name="Guild Master" member={game.guildmaster} lore={<p className="lore">Your friends explore while you help Emberveil rebuild.</p>}/>}
 {view==='Guild Hall'&&<><div className="metrics"><div><small>Expeditions</small><b>{game.active.length} / {game.guild.slots}</b></div><div><small>Roster</small><b>{game.members.length} / {game.guild.rosterCap}</b></div><div><small>Rooms traversed</small><b>{game.stats.clears}</b></div></div>
 {hasFeature(game.progression,'recruitment')&&<section className="panel"><h3>Guild assignments</h3><div className="priority-options">{(['recruitment','infrastructure'] as const).map(priority=><button key={priority} className={game.guild.priority===priority?'chosen':''} onClick={()=>onChange(g=>changePriority(g,priority))}><b>{priority==='recruitment'?'Recruitment':'Infrastructure'}</b><small>{priority==='recruitment'?'Look for one candidate at a time.':'Produce building materials.'}</small></button>)}</div><progress max={20} value={game.guild.work}/></section>}
 {game.candidate&&<section className="panel"><CharacterHeader name={game.candidate.name} member={game.candidate} known={false} tags={<span className="badge"><RarityText index={game.candidate.rarity}>{rarityAt(game.candidate.rarity).name} T{game.candidate.tier}</RarityText></span>}/><div className="actions"><button disabled={game.members.length>=game.guild.rosterCap} onClick={()=>applyGameAction(game,acceptCandidate,onChange,setFeedback,'Member recruited.')}>Recruit</button><button onClick={()=>onChange(declineCandidate)}>Decline</button>{game.members.length>=game.guild.rosterCap&&<small>Increase roster capacity in Hall upgrades before recruiting.</small>}</div></section>}
 {hasFeature(game.progression,'infrastructure')&&<section className="panel"><h3>Hall upgrades</h3><div className="upgrade-grid">{(['slots','quarters'] as const).map(key=>{const upgrade=UPGRADE_INFO[key],price=upgradeCost(game,key);return <div className="upgrade" key={key}><b>{upgrade.name}</b><p>{upgrade.description}</p><button disabled={game.guild.chips<price.chips||game.guild.materials<price.materials} onClick={()=>applyGameAction(game,g=>buyUpgrade(g,key),onChange,setFeedback,`${upgrade.name} upgraded.`)}>{price.chips} Chips · {price.materials} materials</button>{(game.guild.chips<price.chips||game.guild.materials<price.materials)&&<small>Need {Math.max(0,price.chips-game.guild.chips)} more Chips and {Math.max(0,price.materials-game.guild.materials)} more materials.</small>}</div>;})}</div></section>}
 {!canStore&&<p className="muted">Bring your first expedition home to begin improving the hall.</p>}</>}
 {view==='Storage'&&(canStore?<StoragePanel game={game} onChange={onChange}/>:<p className="muted">Your first return will open the stockpile.</p>)}
 </>;
}
