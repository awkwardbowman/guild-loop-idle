import React from 'react';
import {rarityAt} from './rarity.ts';
export const ATTENTION={
 recruits:{name:'Recruits waiting',color:'#e7bb70',path:'M13 6a4 4 0 1 1-8 0 4 4 0 1 1 8 0 M2 21v-3c0-4 14-4 14 0v3 M20 7v8 M16 11h8'},
 healing:{name:'Healing / dungeon failed',color:'#f19483',path:'M8 3h8v5h5v8h-5v5H8v-5H3V8h5z'},
 idle:{name:'Idle',color:'#f2d078',path:'M7 5v14 M17 5v14'}
} as const;
export function AttentionSymbol({state}:{state:keyof typeof ATTENTION}){const icon=ATTENTION[state];return <span className="attention-symbol" title={icon.name} style={{color:icon.color}}><svg viewBox="0 0 24 24" role="img" aria-label={icon.name}><path d={icon.path}/></svg></span>;}
export function RarityText({index=0,children}:{index?:number;children:React.ReactNode}){const grade=rarityAt(index);return <span className="rarity-text" style={{color:grade.color}} title={`${grade.name} (${grade.short})`}>{children}</span>;}
