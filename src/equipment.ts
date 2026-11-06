import type {Stat} from './attributes.ts';
export type Equipment={id:string;name:string;tier:number;description:string;chips:number;leather:number;bonuses:Partial<Record<Stat,number>>;carry:number};
export const EQUIPMENT:Equipment[]=[
 {id:'leather_armor',name:'Rough Leather Armor',tier:1,description:'+10% Constitution effectiveness; physical exertion costs less.',chips:4,leather:3,bonuses:{constitution:.1},carry:0},
 {id:'reinforced_armor',name:'Reinforced Leather Armor',tier:2,description:'+25% Constitution effectiveness; supports longer outings.',chips:12,leather:8,bonuses:{constitution:.25},carry:0},
 {id:'leather_pack',name:'Leather Satchel',tier:1,description:'+12 carrying capacity.',chips:5,leather:4,bonuses:{},carry:12}
];
export const equipmentById=(id:string)=>EQUIPMENT.find(item=>item.id===id)!;
export const equipmentBonus=(loadout:string[],stat:Stat)=>loadout.reduce((sum,id)=>sum+(equipmentById(id).bonuses[stat]??0),0);
export const carryingLimit=(base:number,loadout:string[])=>base+loadout.reduce((sum,id)=>sum+equipmentById(id).carry,0);
export const SHOP_CAPACITY={tanner:1,herbalist:5} as const;
