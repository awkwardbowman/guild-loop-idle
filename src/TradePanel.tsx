import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {sellResource} from './engine.ts';
import {SALE_VALUES,DUNGEONS} from './content.ts';
import {locationById} from './locations.ts';
const resourceName=(id:string)=>DUNGEONS.flatMap(d=>d.loot).find(item=>item.id===id)?.name??id;
export function TradePanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [quantities,setQuantities]=useState<Record<string,string>>({});
 const available=Object.entries(game.inventory).filter(([id,count])=>count>0&&Object.hasOwn(SALE_VALUES,id));
 return <section className="panel"><div className="panel-heading"><h3>Trade · {locationById(game.homeLocationId).name}</h3><span>{locationById(game.homeLocationId).tradeSeconds}s per sale</span></div>
 <p className="muted">Items leave your stockpile when you start a sale. Gold arrives after the trade completes. Resume time to progress trades.</p>
 {available.length?<div className="trade-items">{available.map(([id,count])=>{const quantity=Number(quantities[id]??'1');return <div className="trade-item" key={id}><span>{resourceName(id)} · {count} available · {SALE_VALUES[id]} gold each</span><label>Quantity<input aria-label={`${resourceName(id)} sale quantity`} type="number" min="1" max={count} step="1" value={quantities[id]??'1'} onChange={event=>setQuantities(values=>({...values,[id]:event.target.value}))}/></label><button disabled={!Number.isSafeInteger(quantity)||quantity<=0||quantity>count||game.trades.length>=100} onClick={()=>onChange(g=>sellResource(g,id,quantity))}>Sell · {Number.isSafeInteger(quantity)&&quantity>0?quantity*SALE_VALUES[id]:0} gold</button></div>;})}</div>:<p className="muted">Bring home dungeon resources to start trading.</p>}
 {game.trades.length>0&&<div className="pending-trades"><h3>Trades in progress</h3>{game.trades.map(trade=><div className="pending-trade" key={trade.id}><div><span>{trade.quantity} {resourceName(trade.resourceId)} → {trade.gold} gold</span><b>{trade.remaining}s remaining</b></div><progress aria-label={`Trade ${trade.id} progress`} max={trade.duration} value={trade.duration-trade.remaining}/></div>)}</div>}
 </section>;
}
