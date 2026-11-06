import React from 'react';
import {resourceById} from './resources.ts';
import {RarityText} from './Indicators.tsx';
export function ResourceName({id}:{id:string}){const item=resourceById(id);return <RarityText index={item?.rarity??0}>{item?.name??id}</RarityText>;}
export function LootDrops({drops}:{drops:Record<string,number>}){return <span className="loot-drops">{Object.entries(drops).filter(([,amount])=>amount>0).map(([id,amount])=><span key={id}>{amount} <ResourceName id={id}/></span>)}</span>;}
