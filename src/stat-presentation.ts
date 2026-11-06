import {STATS,SPECIALIZATIONS} from './attributes.ts';
import type {Stat} from './attributes.ts';
import {roomDungeon} from './rooms.ts';
import type {RoomCheck} from './rooms.ts';
/** One visual identity for each root, inherited by its specialized attributes. */
export const STAT_VISUALS:Record<Stat,{color:string;path:string}>={
 strength:{color:'#f19483',path:'M7 3h10v4h4v10h-4v4H7v-4H3V7h4z'},
 dexterity:{color:'#69d9b0',path:'m12 2 9 10-9 10L3 12z M12 7v10 M8 12h8'},
 constitution:{color:'#e7bb70',path:'m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5z M8 11h8 M12 7v8'},
 speed:{color:'#f2e278',path:'M13 2 4 14h7l-1 8 10-13h-8z'},
 perception:{color:'#80c8ff',path:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 1 1 6 0'},
 intelligence:{color:'#aaacff',path:'M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z M12 6v15'},
 charisma:{color:'#f399ce',path:'M3 4h18v12H10l-6 5v-5H3z M7 9h10 M7 12h6'},
 soul:{color:'#c7a1f4',path:'M12 2c0 6-8 8-8 14a8 8 0 0 0 16 0c0-4-3-7-4-8 0 4-4 5-4 5s3-5 0-11z'},
 luck:{color:'#a9d773',path:'m12 2 2.8 6.4 7 .8-5.2 4.7 1.5 6.9-6.1-3.6-6.1 3.6 1.5-6.9L2.2 9.2l7-.8z'}
};
export type StatEmphasis={stat:Stat;weight:number};
export function checkStatMix(check:Pick<RoomCheck,'attributes'>):StatEmphasis[]{
 const weights=new Map<Stat,number>();
 for(const entry of check.attributes){const stat=SPECIALIZATIONS.find(a=>a.id===entry.attribute)?.parent;if(stat)weights.set(stat,(weights.get(stat)??0)+entry.weight);}
 return [...weights].map(([stat,weight])=>({stat,weight})).sort((a,b)=>b.weight-a.weight||STATS.indexOf(a.stat)-STATS.indexOf(b.stat));
}
/** Expected requirement mix from the live group/room probabilities, not old planning profiles. */
export function dungeonStatMix(id:string):StatEmphasis[]{
 const route=roomDungeon(id),weights=new Map<Stat,number>();
 const total=Object.values(route.groups).reduce((a,b)=>a+b,0);
 for(const room of route.rooms){
  const groupTotal=route.rooms.filter(r=>r.group===room.group).reduce((sum,r)=>sum+r.weight,0);
  const chance=route.groups[room.group]/total*room.weight/groupTotal;
  for(const check of room.checks)for(const entry of checkStatMix(check))weights.set(entry.stat,(weights.get(entry.stat)??0)+chance*entry.weight/room.checks.length);
 }
 return [...weights].map(([stat,weight])=>({stat,weight})).sort((a,b)=>b.weight-a.weight||STATS.indexOf(a.stat)-STATS.indexOf(b.stat));
}

export function skillStatMix(checks:RoomCheck[]):StatEmphasis[]{
 const weights=new Map<Stat,number>();
 for(const check of checks)for(const entry of checkStatMix(check))weights.set(entry.stat,(weights.get(entry.stat)??0)+entry.weight/checks.length);
 return [...weights].map(([stat,weight])=>({stat,weight})).sort((a,b)=>b.weight-a.weight||STATS.indexOf(a.stat)-STATS.indexOf(b.stat));
}

/** Activity shape + parent-stat color identifies every attribute in the matrix. */
export const ACTIVITY_VISUALS={
 combat:{path:'M4 3 21 20 M3 4l1 5 5-5z M3 20 20 3 M15 3l5 1 1 5 M2 17l5 5 M17 2l5 5'},
 dungeoneering:{path:'M4 21V4h16v17 M8 21V8h8v13 M2 21h20'},
 exploration:{path:'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20 M16 8l-3 5-5 3 3-5z'},
 crafting:{path:'M4 4h11v5H4z M9 9v12h4V9 M18 13l4 4-5 5-4-4z'},
 social:{path:'M2 3h14v11H8l-4 4v-4H2z M18 8h4v12h-3l-4 3v-6'},
 trade:{path:'M2 8h18l-4-4 M22 16H4l4 4 M20 8l-4 4 M4 16l4-4'},
 logistics:{path:'M2 5h13v13H2z M15 10h4l3 4v4h-7 M8 19a2 2 0 1 0-4 0 2 2 0 1 0 4 0 M21 19a2 2 0 1 0-4 0 2 2 0 1 0 4 0'},
 recovery:{path:'M12 21S2 15 2 8c0-6 8-7 10-1 2-6 10-5 10 1 0 7-10 13-10 13 M8 12h8 M12 8v8'},
 management:{path:'M9 2h6v6H9z M2 16h6v6H2z M16 16h6v6h-6z M12 8v4 M5 16v-4h14v4'}
} as const;
