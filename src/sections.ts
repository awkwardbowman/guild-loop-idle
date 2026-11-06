/** Shared section identity and palette. Change colors here to restyle every reference. */
export const SECTIONS = {
 Story: {number:'00',color:'#f08080'},
 Guild: {number:'01',color:'#efad70'},
 Members: {number:'02',color:'#e5ce71'},
 Activities: {number:'03',color:'#83c99a'},
 Resources: {number:'04',color:'#7db9ed'},
 Shops: {number:'05',color:'#ae9aeb'},
 Info: {number:'06',color:'#d793d1'}
} as const;
export type Section = keyof typeof SECTIONS;
export const isSection=(value:unknown):value is Section=>typeof value==='string'&&Object.hasOwn(SECTIONS,value);
/** Old saves predate explicit section tags. Keep their history readable and filterable. */
export function reportSection(report:{section?:Section;member:string;reason:string}):Section {
 if(report.section)return report.section;
 if(report.member==='Story'||['Milestone','Unlocked','Unlock'].includes(report.reason))return 'Story';
 if(report.reason==='Applicant arrived')return 'Members';
 if(report.member==='Guild')return 'Guild';
 return 'Activities';
}
export function filterReports<T extends {section?:Section;member:string;reason:string}>(reports:T[],sections:readonly Section[]):T[]{
 return reports.filter(report=>sections.includes(reportSection(report)));
}

export const DUNGEON_EVENTS=['Dungeon assignment added','Dungeon assignment removed','Dungeon failed','Boss room beaten','Treasure room cleared'] as const;
export const isDungeonEvent=(reason:string)=>DUNGEON_EVENTS.some(event=>event===reason);
/** Also hide verbose history from saves written before compact dungeon logs. */
export const visibleReport=(report:{section?:Section;member:string;reason:string})=>reportSection(report)!=='Activities'||isDungeonEvent(report.reason)||report.reason==='Retreated';
