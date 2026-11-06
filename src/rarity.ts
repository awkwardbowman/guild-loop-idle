/** Rarity is the outer classification; positive tiers are independent ranks within it. */
export const Rarity={Common:0,Uncommon:1,Rare:2,Epic:3,Legendary:4,Mythic:5,Relic:6,Masterwork:7,Eternal:8} as const;
export type RarityDefinition={name:string;short:string;color:string};
export const rarity:readonly RarityDefinition[]=[
 {name:'Common',short:'C',color:'#FDFEFE'},
 {name:'Uncommon',short:'U',color:'#27AE60'},
 {name:'Rare',short:'R',color:'#2471A3'},
 {name:'Epic',short:'E',color:'#7D3C98'},
 {name:'Legendary',short:'L',color:'#F1C40F'},
 {name:'Mythic',short:'M',color:'#D35400'},
 {name:'Relic',short:'Re',color:'#7B241C'},
 {name:'Masterwork',short:'Ma',color:'#B3CA1F'},
 {name:'Eternal',short:'Et',color:'#DC2367'}
];
export const rarityAt=(index:number=Rarity.Common)=>rarity[index]??rarity[Rarity.Common];
export const isRarity=(value:unknown):value is number=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<rarity.length;
