import {StatSymbol} from './StatSymbols.tsx';
import type {Stat} from './attributes.ts';
import {RarityText} from './Indicators.tsx';
import React from 'react';
import type {Game} from './engine.ts';
import {unlockEquipment,buyEquipmentCapacity} from './engine.ts';
import {EQUIPMENT,SHOP_CAPACITY} from './equipment.ts';
import {hasEvent} from './progression.ts';
export function ShopsPanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 function capacity(shop:'tanner'|'herbalist'){const price=4*2**game.equipment.capacity,full=game.equipment.capacity>=SHOP_CAPACITY[shop];return <div className="card-footer"><span>Slots {game.equipment.capacity} / {SHOP_CAPACITY[shop]}</span><button disabled={full||game.guild.chips<price} onClick={()=>onChange(g=>buyEquipmentCapacity(g,shop))}>{full?'Capacity reached':`+ Slot · ${price} Chips`}</button></div>;}
 return <><div className="page-heading"><h2>Shops</h2></div><section className="panel compact-card"><details className="card-disclosure"><summary><span className="card-title">Gavin</span><span className="muted">Tanner & Barkeep</span></summary><div className="card-body"><p className="lore">“Scraps are a beginning. Give me enough leather and we can make something useful.”</p></div></details>
 <div className="shop-items">{EQUIPMENT.map(item=><div className="compact-item" key={item.id}><details className="card-disclosure"><summary><RarityText>{item.name}</RarityText><span className="badge">Tier {item.tier}</span></summary><div className="card-body"><p>{Object.entries(item.bonuses).map(([stat,amount])=><span key={stat}>+{(amount??0)*100}% <StatSymbol stat={stat as Stat} label/> </span>)}{item.carry>0&&<>+{item.carry} carry</>}</p></div></details><button disabled={game.equipment.unlocked.includes(item.id)||game.guild.chips<item.chips||(game.inventory.leather??0)<item.leather} onClick={()=>onChange(g=>unlockEquipment(g,item.id))}>{game.equipment.unlocked.includes(item.id)?'Unlocked':`${item.chips} Chips · ${item.leather} Leather`}</button></div>)}</div>{capacity('tanner')}</section>
 {hasEvent(game.progression,'stillmere_unlocked')&&<section className="panel compact-card"><details className="card-disclosure"><summary><span className="card-title">Stillmere Herbalist</span></summary><div className="card-body"><p className="lore">Fresh herbs find a welcome home on the herbalist’s shelves.</p><p>Sell herbs in Resources.</p></div></details>{capacity('herbalist')}</section>}</>;
}
