import React,{useEffect,useId,useRef} from 'react';
import {createContext} from 'react';
import type {DungeonKnowledge} from './rooms.ts';
export const DiscoveryContext=createContext<DungeonKnowledge>({});
export function PageHeading({title,overline,children}:{title:string;overline:string;children?:React.ReactNode}){
 return <header className="page-heading"><div className="overline">{overline}</div><h2>{title}</h2>{children}</header>;
}
export function EmptyState({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}){
 return <div className="empty-state"><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function SectionTabs({label,options,selected,onSelect,prefix,className='subtabs'}:{label:string;options:{id:string;label:string}[];selected:string;onSelect:(id:string)=>void;prefix:string;className?:string}){
 return <><nav role="tablist" aria-label={label} className={className} onKeyDown={e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  const index=options.findIndex(o=>o.id===selected),next=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowRight'?1:-1)+options.length)%options.length;
  e.preventDefault();onSelect(options[next].id);e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
 }}>{options.map(o=><button type="button" key={o.id} id={`${prefix}-${o.id.replaceAll(' ','-')}-tab`} role="tab" aria-selected={selected===o.id} aria-controls={`${prefix}-${o.id.replaceAll(' ','-')}-panel`} tabIndex={selected===o.id?0:-1} className={selected===o.id?'selected':''} onClick={()=>onSelect(o.id)}>{o.label}</button>)}</nav>{options.filter(o=>o.id!==selected).map(o=><div key={o.id} hidden role="tabpanel" id={`${prefix}-${o.id.replaceAll(' ','-')}-panel`} aria-labelledby={`${prefix}-${o.id.replaceAll(' ','-')}-tab`}/>)}</>;
}
export function ConfirmDialog({title,description,action,onCancel,onConfirm}:{title:string;description:string;action:string;onCancel:()=>void;onConfirm:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),id=useId(),cancelRef=useRef(onCancel);cancelRef.current=onCancel;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null,dialog=ref.current!;dialog.showModal();
  const cancel=(event:Event)=>{event.preventDefault();cancelRef.current();};dialog.addEventListener('cancel',cancel);
  return()=>{dialog.removeEventListener('cancel',cancel);dialog.close();if(previous?.isConnected)previous.focus();};
 },[]);
 return <dialog ref={ref} onKeyDown={e=>{if(e.key!=='Tab')return;const buttons=e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} className="modal" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}><h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`}>{description}</p><div className="actions"><button autoFocus onClick={onCancel}>Cancel</button><button className="primary" onClick={onConfirm}>{action}</button></div></dialog>;
}
export function NumericDraftField({label,value,min,max,step=1,onCommit,disabled=false}:{label:string;value:number;min:number;max:number;step?:number;onCommit:(value:number)=>void;disabled?:boolean}){
 const [draft,setDraft]=React.useState(String(value)),[error,setError]=React.useState('');const id=useId();
 useEffect(()=>{setDraft(String(value));setError('');},[value]);
 const commit=()=>{const number=Number(draft);if(!draft.trim()||!Number.isFinite(number)||number<min||number>max||(step===1&&!Number.isInteger(number))){setError(`Enter ${step===1?'a whole number':'a number'} from ${min} to ${max}.`);return;}setError('');if(number!==value)onCommit(number);};
 return <label className="form-field">{label}<input type="number" aria-label={label} min={min} max={max} step={step} disabled={disabled} value={draft} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined} onChange={e=>{setDraft(e.target.value);setError('');}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){setDraft(String(value));setError('');}}}/>{error&&<span id={`${id}-error`} role="alert" className="field-error">{error}</span>}</label>;
}

export function InlineFeedback({message}:{message:string}){return message?<p className="inline-feedback" role="status">{message}</p>:null;}
/** Event handlers compute the engine result before reporting success. */
export function applyGameAction(game:import('./engine.ts').Game,action:(game:import('./engine.ts').Game)=>import('./engine.ts').Game,onChange:React.Dispatch<React.SetStateAction<import('./engine.ts').Game>>,feedback:(message:string)=>void,success:string){
 const next=action(game);if(next===game){feedback('Action unavailable. Check the requirements and try again.');return;}onChange(next);feedback(success);
}
