import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {resourceAmount,buyStorage,togglePin} from './engine.ts';
import {RESOURCES,storageQuote,storageCap} from './resources.ts';
import type {StorageQuantity} from './resources.ts';
import {ResourceName} from './ResourceName.tsx';
import {TradePanel} from './TradePanel.tsx';
export function StoragePanel({game,onChange}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>}){
 const [quantity,setQuantity]=useState<StorageQuantity>(1);
 return <><section className="panel"><div className="panel-heading"><h3>Storage</h3><label>Capacity upgrades <select aria-label="Capacity upgrade quantity" value={quantity} onChange={event=>setQuantity(event.target.value==='max'?'max':Number(event.target.value) as StorageQuantity)}>{[1,10,100,'max'].map(value=><option key={value} value={value}>{value==='max'?'Max':value}</option>)}</select></label></div><div className="attribute-table-scroll"><table className="resource-table"><thead><tr><th>Resource</th><th>Stored / Max</th><th>Increase capacity</th><th>Pin</th></tr></thead><tbody>{RESOURCES.filter(resource=>['chips','leather','herb','materials'].includes(resource.id)||resourceAmount(game,resource.id)>0).map(resource=>{const amount=resourceAmount(game,resource.id),cap=storageCap(game,resource.id),quote=storageQuote(game.storage[resource.id],game.guild.chips,quantity);return <tr key={resource.id}><td><ResourceName id={resource.id}/></td><td className={amount>=cap?'storage-full':''}>{amount}/{cap===Infinity?'∞':cap}</td><td>{resource.id==='chips'?'—':<button disabled={!quote.affordable} onClick={()=>onChange(g=>buyStorage(g,resource.id,quantity))}>→ {quote.cap} · {quote.price} Chips</button>}</td><td><input aria-label={`Pin ${resource.name}`} type="checkbox" checked={game.pinnedResources.includes(resource.id)} onChange={()=>onChange(g=>togglePin(g,resource.id))}/></td></tr>;})}</tbody></table></div></section><TradePanel game={game} onChange={onChange}/></>;
}
