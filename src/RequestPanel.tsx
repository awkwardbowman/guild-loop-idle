import React,{useState} from 'react';
import type {Game} from './engine.ts';
import {completeRequest} from './engine.ts';
import {REQUESTS} from './requests.ts';
import {hasEvent} from './progression.ts';
import {ResourceName} from './ResourceName.tsx';
export function RequestPanel({game,onChange,compact=false}:{game:Game;onChange:React.Dispatch<React.SetStateAction<Game>>;compact?:boolean}){
 const [students,setStudents]=useState<Record<string,string>>({});
 if(!hasEvent(game.progression,'tanner_opened'))return null;
 return <div className="shop-requests">{REQUESTS.filter(request=>!compact||!hasEvent(game.progression,request.event)).map(request=>{
 const done=hasEvent(game.progression,request.event),owned=game.inventory[request.resourceId]??0,student=students[request.id]??game.members.find(member=>['arya','clyde'].includes(member.origin))?.id;
 return <article key={request.id} className={`panel compact-card ${done?'purchase-bought':''}`}><details className="card-disclosure"><summary><span className="card-title">{request.name}</span><span className="badge">Gavin Wess · Request</span></summary><div className="card-body"><p>{request.skillId?'Bring Gavin a starter stockpile of scraps. Choose Arya or Clyde for one Leather Crafting lesson, opening equipment purchases for the guild.':'Bring Gavin a starter stockpile of herbs. He will introduce you to Elder Ash in Stillmere.'}</p></div></details><div className="card-footer"><span className={owned>=request.amount?'cost-ready':'cost-short'}>{owned}/{request.amount} <ResourceName id={request.resourceId}/></span>{done?<span>Completed</span>:<div className="card-controls">{request.skillId&&<select aria-label="Leather Crafting student" value={student??''} onChange={event=>setStudents(current=>({...current,[request.id]:event.target.value}))}>{game.members.filter(member=>['arya','clyde'].includes(member.origin)).map(member=><option key={member.id} value={member.id}>{member.name}</option>)}</select>}<button disabled={owned<request.amount||!!request.skillId&&!student} onClick={()=>onChange(g=>completeRequest(g,request.id,student))}>{request.skillId?'Learn Leather Crafting':'Meet Elder Ash'}</button></div>}</div></article>;
 })}</div>;
}
