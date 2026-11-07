import {RarityText} from './Indicators.tsx';
import {rarityAt} from './rarity.ts';
import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {unlockEquipment} from './engine.ts';
import {EQUIPMENT} from './equipment.ts';
import {hasEvent} from './progression.ts';
import {StatSymbol} from './StatSymbols.tsx';
import type {Stat} from './attributes.ts';
import {RequestPanel} from './RequestPanel.tsx';
import {ResourceName} from './ResourceName.tsx';
export function ShopsPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [city,setCity]=useState('emberveil'),[view,setView]=useState('Shop'),[hideMaxed,setHideMaxed]=useState(false);
 const taught=hasEvent(game.progression,'leather_crafting_learned');
 const cost=(id:string,required:number)=>{const owned=id==='chips'?game.guild.chips:game.inventory[id]??0,capacity=id==='chips'?Infinity:game.storage[id].cap;return <span className={capacity<required?'cost-capacity':owned>=required?'cost-ready':'cost-short'}>{owned}/{required} <ResourceName id={id}/></span>;};
 return <><div className="page-heading"><h2>Shops</h2></div><nav className="subtabs" aria-label="Shop cities">{['emberveil',...(hasEvent(game.progression,'stillmere_unlocked')?['stillmere']:[])].map(id=><button key={id} className={city===id?'selected':''} onClick={()=>setCity(id)}>{id==='emberveil'?'Emberveil':'Stillmere'}</button>)}</nav><section className="panel"><div className="panel-heading"><h3>{city==='emberveil'?'Gavin Wess · Tanner & Barkeep':'Elder Ash · Herbologist'}</h3>{view==='Shop'&&city==='emberveil'&&<label><input type="checkbox" checked={hideMaxed} onChange={event=>setHideMaxed(event.target.checked)}/> Hide maxed purchases</label>}</div><nav className="subtabs" aria-label="Shop sections">{['Shop','Requests'].map(tab=><button key={tab} className={view===tab?'selected':''} onClick={()=>setView(tab)}>{tab}</button>)}</nav>{view==='Requests'?(city==='emberveil'?<RequestPanel game={game} onChange={onChange}/>:<p className="muted">No requests yet.</p>):city==='stillmere'?<p className="lore">“A friend of Gavin’s is welcome here. Your herbs will be put to good use.” Sell surplus herbs in Guild → Storage.</p>:<>{!taught&&<p className="muted">Complete Gavin’s Leather Crafting request to unlock equipment purchases.</p>}{EQUIPMENT.filter(item=>!hideMaxed||!game.equipment.unlocked.includes(item.id)).map(item=>{const bought=game.equipment.unlocked.includes(item.id),affordable=game.guild.chips>=item.chips&&(game.inventory.leather??0)>=item.leather;return <div className={`shop-purchase ${bought?'purchase-bought':affordable&&taught?'purchase-ready':'purchase-waiting'}`} key={item.id}><span className="shop-tier"><RarityText index={item.rarity}>{rarityAt(item.rarity).short} T{item.tier}</RarityText></span><details className="card-disclosure"><summary>{item.name}</summary><div className="card-body"><p>{Object.entries(item.bonuses).map(([stat,amount])=><span key={stat}>+{(amount??0)*100}% <StatSymbol stat={stat as Stat} label/> </span>)}{item.carry>0&&<>+{item.carry} carry</>}</p></div></details><div className="purchase-costs">{cost('chips',item.chips)}{cost('leather',item.leather)}</div><button disabled={bought||!affordable||!taught} onClick={()=>onChange(g=>unlockEquipment(g,item.id))}>{bought?'Bought':'Unlock'}</button></div>;})}</>}</section></>;
}
