import {RESOURCES} from './resources.ts';
export const REQUESTS=[
 {id:'gavin_leather_lesson',cityId:'emberveil',shopId:'gavin',name:'Scraps into possibilities',resourceId:'leather',amount:RESOURCES.find(r=>r.id==='leather')!.cap,skillId:'leather_crafting',event:'leather_crafting_learned'},
 {id:'gavin_herb_referral',cityId:'emberveil',shopId:'gavin',name:'A handful for Oakley Ash',resourceId:'herb',amount:RESOURCES.find(r=>r.id==='herb')!.cap,skillId:null,event:'stillmere_unlocked'}
] as const;
export type RequestId=typeof REQUESTS[number]['id'];
export type RequestCompletion={completedAt:number;studentId?:string};
