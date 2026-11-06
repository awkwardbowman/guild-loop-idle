/** Accepted root stats and the balanced 9 × 3 attribute/activity matrix. */
export const STATS=['strength','dexterity','constitution','speed','perception','intelligence','charisma','soul','luck'] as const;
export type Stat=typeof STATS[number];
export type Pools=Record<Stat,number>;
export const zeroPools=():Pools=>Object.fromEntries(STATS.map(stat=>[stat,0])) as Pools;
export const STAT_INFO:Record<Stat,{name:string;consumable:boolean}>={
 strength:{name:'Strength',consumable:true},dexterity:{name:'Dexterity',consumable:true},constitution:{name:'Constitution',consumable:true},speed:{name:'Speed',consumable:true},perception:{name:'Perception',consumable:true},intelligence:{name:'Intelligence',consumable:true},charisma:{name:'Charisma',consumable:true},soul:{name:'Soul',consumable:true},luck:{name:'Luck',consumable:false}
};
export const STAT_SHORT:Record<Stat,string>={strength:'STR',dexterity:'DEX',constitution:'CON',speed:'SPD',perception:'PER',intelligence:'INT',charisma:'CHA',soul:'SOU',luck:'LCK'};
export const ACTIVITY_GROUPS=[
 {id:'combat',name:'Combat'}, {id:'dungeoneering',name:'Dungeoneering'}, {id:'exploration',name:'Exploration'},
 {id:'crafting',name:'Crafting'}, {id:'social',name:'Social'}, {id:'trade',name:'Trade'},
 {id:'logistics',name:'Travel & Logistics'}, {id:'recovery',name:'Recovery & Support'}, {id:'management',name:'Management'}
] as const;
export type ActivityGroup=typeof ACTIVITY_GROUPS[number]['id'];
export type AttributeDefinition={id:string;name:string;parent?:string;pool?:Stat;group?:ActivityGroup};
export const SPECIALIZATIONS=[
 {id:'power',name:'Power',parent:'strength',group:'combat'},
 {id:'force',name:'Force',parent:'strength',group:'dungeoneering'},
 {id:'hauling',name:'Hauling',parent:'strength',group:'logistics'},
 {id:'precision',name:'Precision',parent:'dexterity',group:'combat'},
 {id:'finesse',name:'Finesse',parent:'dexterity',group:'dungeoneering'},
 {id:'handiwork',name:'Handiwork',parent:'dexterity',group:'crafting'},
 {id:'toughness',name:'Toughness',parent:'constitution',group:'combat'},
 {id:'endurance',name:'Endurance',parent:'constitution',group:'logistics'},
 {id:'vitality',name:'Vitality',parent:'constitution',group:'recovery'},
 {id:'agility',name:'Agility',parent:'speed',group:'dungeoneering'},
 {id:'scouting',name:'Scouting',parent:'speed',group:'exploration'},
 {id:'movement',name:'Movement',parent:'speed',group:'logistics'},
 {id:'observation',name:'Observation',parent:'perception',group:'exploration'},
 {id:'insight',name:'Insight',parent:'perception',group:'social'},
 {id:'diagnosis',name:'Diagnosis',parent:'perception',group:'recovery'},
 {id:'design',name:'Design',parent:'intelligence',group:'crafting'},
 {id:'appraisal',name:'Appraisal',parent:'intelligence',group:'trade'},
 {id:'planning',name:'Planning',parent:'intelligence',group:'management'},
 {id:'persuasion',name:'Persuasion',parent:'charisma',group:'social'},
 {id:'bargaining',name:'Bargaining',parent:'charisma',group:'trade'},
 {id:'leadership',name:'Leadership',parent:'charisma',group:'management'},
 {id:'attunement',name:'Attunement',parent:'soul',group:'crafting'},
 {id:'resilience',name:'Resilience',parent:'soul',group:'recovery'},
 {id:'inspiration',name:'Inspiration',parent:'soul',group:'management'},
 {id:'discovery',name:'Discovery',parent:'luck',group:'exploration'},
 {id:'serendipity',name:'Serendipity',parent:'luck',group:'social'},
 {id:'opportunity',name:'Opportunity',parent:'luck',group:'trade'}
] as const satisfies readonly AttributeDefinition[];
export const ATTRIBUTES:AttributeDefinition[]=[...STATS.map(id=>({id,name:STAT_INFO[id].name,pool:id})),...SPECIALIZATIONS];
export const attributesForGroup=(group:ActivityGroup)=>SPECIALIZATIONS.filter(attribute=>attribute.group===group);
export function validateAttributeMatrix(){
 if(SPECIALIZATIONS.length!==27||new Set(SPECIALIZATIONS.map(attribute=>attribute.id)).size!==27)throw Error('Expected 27 unique specializations');
 for(const stat of STATS)if(SPECIALIZATIONS.filter(attribute=>attribute.parent===stat).length!==3)throw Error('Each root needs three specializations');
 for(const group of ACTIVITY_GROUPS)if(attributesForGroup(group.id).length!==3)throw Error('Each activity needs three specializations');
}
validateAttributeMatrix();
