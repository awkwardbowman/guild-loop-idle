import {ownsSkill} from './specialization.ts';
import {defaultSelections} from './specialization.ts';
import {floorCatalog,categoryOf,nextDungeonFloor} from './rooms.ts';
import {enduranceMaximum,roomEfficiency} from './rooms.ts';
import {ACTIVITY_GROUPS} from './attributes.ts';
import {REQUESTS} from './requests.ts';
import {equipmentCapacity} from './equipment.ts';
import {isRarity} from './rarity.ts';
import {RESOURCES,initialStorage,cargoSize} from './resources.ts';
import {EQUIPMENT,carryingLimit} from './equipment.ts';
import {roomById,roomDungeon} from './rooms.ts';
import {STAT_INFO,zeroPools} from './attributes.ts';
import {isLocationId,travelSeconds} from './locations.ts';
import {isSection} from './sections.ts';
import { EVENT_IDS } from './progression.ts';
import { SKILLS, ATTRIBUTES, newSkillProfile, TRAP_ROOM } from './skill-system.ts';
import type { Game, Member, Assignment } from './engine.ts';
import { taskDuration, validDepth, newGuildmaster } from './engine.ts';
import { STATS, DUNGEONS, VERSION, WARP_SECONDS, DAY_SECONDS, SALE_VALUES, tierBudget } from './content.ts';
export const SAVE_KEY = 'guild-loops.save.v1';
export const BACKUP_KEY = 'guild-loops.backup.v1';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
function requireValue(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`Invalid save: ${message}`); }
const num = (v: unknown, min = 0, max = 1e12) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const integer = (v: unknown, min = 0, max = 1e9) => num(v,min,max) && Number.isInteger(v);
const text = (v: unknown, max = 200) => typeof v === 'string' && v.length <= max;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function validateMember(m: Member) {
 requireValue(object(m) && text(m.id,60) && /^member-\d+$/.test(m.id) && text(m.name,60) && integer(m.tier,1,Number.MAX_SAFE_INTEGER) && isRarity(m.rarity) && integer(m.runs), 'member identity');
 validateProfile(m);
 requireValue(m.soulAccess==='none','member Soul access');
 if(m.origin==='recruit')requireValue(m.stats.soul.current===1&&m.stats.soul.max===1&&m.stats.soul.affinity===1&&!m.selections!.attributes.includes('soul'),'inert recruit Soul');
 requireValue(['legacy','recruit','arya','clyde'].includes(m.origin)&&integer(m.carryCapacity,1,1000000)&&integer(m.bestRoom)&&Array.isArray(m.equipped)&&new Set(m.equipped).size===m.equipped.length&&m.equipped.every(id=>EQUIPMENT.some(item=>item.id===id)),'member equipment');
 if(m.affinityModel==='skills'){if(m.tier===1&&m.rarity===0)requireValue(Math.abs(ATTRIBUTES.filter(a=>a.parent&&ownsSkill(m,a.id)).reduce((n,a)=>n+m.specializations[a.id].affinity,0)-10)<1e-7,'Common T1 Skill affinity budget');}
 else if(m.origin!=='legacy')requireValue(STATS.reduce((sum,stat)=>sum+m.stats[stat].affinity,0)<=tierBudget(m.tier)+1e-7,'tier stat budget');
 requireValue(object(m.dungeonHistory)&&Object.entries(m.dungeonHistory).every(([id,h])=>DUNGEONS.some(d=>d.id===id)&&object(h)&&integer(h.bestRoom,0,1000000)&&(h.lastReturn===null||(object(h.lastReturn)&&integer(h.lastReturn.room,0,h.bestRoom)&&text(h.lastReturn.reason)&&text(h.lastReturn.detail,500)&&integer(h.lastReturn.day,1)&&integer(h.lastReturn.time,0,DAY_SECONDS-1)))),'dungeon history');
 validateRoute(m.queue);
 requireValue(integer(m.queueIndex,0,Math.max(0,m.queue.length-1)) && integer(m.cooldown,0,86400) && integer(m.resetSeconds,1,86400) && typeof m.enabled==='boolean', 'member schedule');
}
function validateProfile(m:Pick<Member,'stats'|'specializations'|'skills'|'selections'|'constitutionExperience'|'affinityModel'>){
 requireValue(object(m.selections)&&Array.isArray(m.selections.attributes)&&m.selections.attributes.length===5&&new Set(m.selections.attributes).size===5&&m.selections.attributes.every(s=>STATS.includes(s))&&Array.isArray(m.selections.disciplines)&&m.selections.disciplines.length===5&&new Set(m.selections.disciplines).size===5&&m.selections.disciplines.every(d=>ACTIVITY_GROUPS.some(g=>g.id===d)),'five Attribute and Discipline selections');
 requireValue(m.affinityModel===undefined||m.affinityModel==='skills','affinity model');
 requireValue(integer(m.constitutionExperience,0,1e9),'Constitution XP');
 requireValue(object(m.stats)&&Object.keys(m.stats).length===STATS.length, 'member stats');
 for (const s of STATS) { const v = m.stats[s]; requireValue(object(v) && num(v.affinity,m.affinityModel==='skills'?0:.001,1e12) && num(v.max,m.affinityModel==='skills'?0:.001,m.affinityModel==='skills'?1e12:v.affinity) && num(v.current,0,v.max), `${s} stat bounds`); }
 requireValue(object(m.specializations)&&Object.keys(m.specializations).length===ATTRIBUTES.filter(a=>a.parent).length&&ATTRIBUTES.filter(a=>a.parent).every(a=>{const v=m.specializations[a.id];return object(v)&&num(v.affinity,m.affinityModel==='skills'?0:.001,1e12)&&num(v.value,0,m.affinityModel==='skills'?1e12:v.affinity);}), 'specialization values');
 if(m.affinityModel==='skills'){
  requireValue(m.constitutionExperience===0,'obsolete Constitution bonus');
  for(const a of ATTRIBUTES.filter(a=>a.parent)){if(ownsSkill(m,a.id))requireValue(m.specializations[a.id].affinity>=.1,'minimum Skill affinity');else requireValue(m.specializations[a.id].affinity===0&&m.specializations[a.id].value===0,'unowned Skill values');}
  for(const stat of STATS){
   if(stat==='soul'&&!m.selections!.attributes.includes(stat))continue;
   const owned=ATTRIBUTES.filter(a=>a.parent===stat&&ownsSkill(m,a.id));
   requireValue(Math.abs(m.stats[stat].max-owned.reduce((n,a)=>n+m.specializations[a.id].value,0))<1e-7&&Math.abs(m.stats[stat].affinity-owned.reduce((n,a)=>n+m.specializations[a.id].affinity,0))<1e-7,'derived Attribute totals');
  }
 }
 requireValue(object(m.skills)&&Object.keys(m.skills).length===SKILLS.length&&SKILLS.every(d=>{const v=m.skills[d.id];return object(v)&&(v.discovered===undefined||typeof v.discovered==='boolean')&&integer(v.level,0,99)&&num(v.experience,0,v.level===99?0:10*(v.level+1)-1e-9)&&(v.lastUsedAt===null||integer(v.lastUsedAt));}), 'learned skills');
}
function validateRoute(route: Assignment[]) { requireValue(Array.isArray(route) && route.length <= 1 && route.every(e => object(e) && DUNGEONS.some(d=>d.id===e.dungeonId) && !Object.hasOwn(e,'maxDepth')), 'dungeon queue'); }
function pools(p: unknown) { return object(p) && STATS.every(s=>num(p[s])); }
export function validateGame(input: unknown): Game {
 requireValue(object(input), 'expected a game object');
 const g = input as unknown as Game;
 requireValue(g.version === VERSION, 'unsupported format version');
 requireValue(object(g.guildmaster)&&g.guildmaster.id==='guildmaster'&&text(g.guildmaster.name,60)&&g.guildmaster.innateMagic===true&&g.guildmaster.soulAccess==='guildmaster','guildmaster');
 validateProfile(g.guildmaster);
 requireValue(object(g.storage)&&RESOURCES.every(resource=>{const storage=g.storage[resource.id];return object(storage)&&integer(storage.cap,1,1e12)&&integer(storage.level,0,100);}), 'storage caps');
 requireValue(object(g.equipment)&&integer(g.equipment.capacity,0,100)&&Array.isArray(g.equipment.unlocked)&&new Set(g.equipment.unlocked).size===g.equipment.unlocked.length&&g.equipment.unlocked.every(id=>EQUIPMENT.some(item=>item.id===id)), 'equipment unlocks');
 requireValue(isLocationId(g.homeLocationId)&&integer(g.nextTradeId,1), 'guild location or trade ID');
 requireValue(Array.isArray(g.trades)&&g.trades.length<=100&&new Set(g.trades.map(t=>t.id)).size===g.trades.length&&g.trades.every(t=>object(t)&&integer(t.id,1,g.nextTradeId-1)&&isLocationId(t.locationId)&&Object.hasOwn(SALE_VALUES,t.resourceId)&&integer(t.quantity,1)&&integer(t.chips,1)&&integer(t.duration,1,86400)&&integer(t.remaining,1,t.duration)), 'pending trades');
 requireValue(integer(g.seed,0,4294967295) && integer(g.nextId,1) && integer(g.day,1) && integer(g.elapsed,0,DAY_SECONDS-1), 'clock or random state');
 requireValue(object(g.progression)&&object(g.progression.completed)&&(Object.hasOwn(g.progression.completed,'guild_founded')||Object.keys(g.progression.completed).every(id=>['history_remembered','friends_introduced'].includes(id)))&&Object.entries(g.progression.completed).every(([id,stamp])=>EVENT_IDS.includes(id as typeof EVENT_IDS[number])&&object(stamp)&&integer(stamp.day,1,g.day)&&integer(stamp.time,0,DAY_SECONDS-1)&&(stamp.day<g.day||stamp.time<=g.elapsed)), 'progression events');
 requireValue(object(g.requests)&&Object.entries(g.requests).every(([id,completion])=>{const request=REQUESTS.find(request=>request.id===id);return request&&object(completion)&&integer(completion.completedAt,0,(g.day-1)*DAY_SECONDS+g.elapsed)&&Object.hasOwn(g.progression.completed,request.event)&&(request.skillId?typeof completion.studentId==='string'&&/^member-\d+$/.test(completion.studentId):completion.studentId===undefined);}),'shop requests');
 requireValue(g.phase === 'running' || g.phase === 'planning', 'phase');
 const v = g.guild; requireValue(object(v), 'guild');
 requireValue(integer(v.chips,0,1e12) && integer(v.materials) && num(v.gear) && integer(v.gearCap,1,10000) && v.gear <= v.gearCap && num(v.gearRegen,0,100) && integer(v.slots,1,100) && integer(v.rosterCap,1,100), 'guild resources');
 requireValue((v.priority==='recruitment'||v.priority==='infrastructure') && integer(v.work,0,19) && object(v.upgrades) && ['slots','quarters','gear','regen'].every(k=>integer((v.upgrades as Record<string,number>)[k],0,100)), 'guild work or upgrades');
 requireValue(Array.isArray(g.members) && g.members.length <= v.rosterCap, 'roster capacity'); g.members.forEach(validateMember);
 for(const m of [...g.members,...(g.candidate?[g.candidate]:[])])requireValue(Object.values(m.dungeonHistory).every(h=>h.lastReturn===null||h.lastReturn.day<g.day||(h.lastReturn.day===g.day&&h.lastReturn.time<=g.elapsed)),'future dungeon history');
 for(const m of [...g.members,g.guildmaster,...(g.candidate?[g.candidate]:[])])requireValue(Object.values(m.skills).every(s=>s.lastUsedAt===null||s.lastUsedAt<=(g.day-1)*DAY_SECONDS+g.elapsed), 'future skill timestamp');
 if(!Object.hasOwn(g.progression.completed,'guild_founded'))requireValue(g.members.length===0&&g.candidate===null&&g.active.length===0&&g.trades.length===0&&(g.phase==='planning'||g.phase==='running'),'unopened guild');
 const ids = g.members.map(m=>m.id); requireValue(new Set(ids).size === ids.length, 'duplicate members');
 if (g.candidate !== null) { validateMember(g.candidate); requireValue(!ids.includes(g.candidate.id), 'candidate already in roster'); ids.push(g.candidate.id); }
 requireValue(ids.every(id=>Number(id.split('-')[1])<g.nextId), 'next member ID');
 requireValue(Array.isArray(g.active) && g.active.length <= v.slots && new Set(g.active.map(r=>r.memberId)).size === g.active.length, 'active expedition count');
 requireValue(g.phase!=='planning'||g.active.length===0, 'planning state');
 requireValue(object(g.dungeonDefaults)&&validDepth(g.dungeonDefaults.depthLimit)&&num(g.dungeonDefaults.skillThreshold,0,100),'dungeon defaults');
 requireValue(object(g.dungeonLimits)&&Object.entries(g.dungeonLimits).every(([id,v])=>DUNGEONS.some(d=>d.id===id)&&validDepth(v)), 'dungeon depth overrides');
 requireValue(object(g.dungeonThresholds)&&Object.entries(g.dungeonThresholds).every(([id,v])=>DUNGEONS.some(d=>d.id===id)&&num(v,0,100)),'dungeon threshold overrides');
 requireValue(object(g.dungeonKnowledge)&&Object.entries(g.dungeonKnowledge).every(([id,floors])=>DUNGEONS.some(d=>d.id===id)&&object(floors)&&Object.entries(floors).every(([number,known])=>{
  const floor=Number(number);if(String(floor)!==number||!integer(floor,1,id==='wood'?100:100000)||!object(known)||!Array.isArray(known.known)||new Set(known.known).size!==known.known.length||typeof known.bossCleared!=='boolean')return false;
  const catalog=floorCatalog(id,floor),ids=Object.values(catalog).flat().map(r=>r.id);
  return known.known.every(room=>typeof room==='string'&&ids.includes(room))&&(!known.bossCleared||catalog.boss.every(b=>known.known.includes(b.id)));
 })), 'floor discovery');
 requireValue(object(g.dungeonStarts)&&Object.entries(g.dungeonStarts).every(([id,floor])=>DUNGEONS.some(d=>d.id===id)&&integer(floor,1,Math.min(id==='wood'?100:100000,nextDungeonFloor(g.dungeonKnowledge,id)))),'dungeon starting floors');
 const clearedCampaign=g.dungeonKnowledge.wood?.[100]?.bossCleared===true;
 requireValue(clearedCampaign===Object.hasOwn(g.progression.completed,'campaign_completed'),'campaign checkpoint');
 const resourceIds=['gear' ,...RESOURCES.map(resource=>resource.id)];
 requireValue(Array.isArray(g.pinnedResources)&&new Set(g.pinnedResources).size===g.pinnedResources.length&&g.pinnedResources.every(id=>resourceIds.includes(id)), 'pinned resources');
 for (const r of g.active) {
  requireValue(object(r) && g.members.some(m=>m.id===r.memberId) && DUNGEONS.some(d=>d.id===r.dungeonId), 'active member or dungeon');
  requireValue(integer(r.reachedRoom,0,r.floor)&&!Object.hasOwn(r,'personalLimit')&&integer(r.floor,1,1000000)&&integer(r.elapsed,0,r.stage==='returning'?WARP_SECONDS:WARP_SECONDS-1), 'run position');
  requireValue(r.skillPractice===undefined||(Array.isArray(r.skillPractice)&&r.skillPractice.length<=10000&&r.skillPractice.every(p=>object(p)&&typeof p.id==='string'&&ATTRIBUTES.some(a=>a.id===p.id&&a.parent)&&num(p.xp)&&num(p.activity)&&(p.source===undefined||p.source==='floor'))),'pending Skill practice');
  requireValue(object(r.specializationTraining)&&Object.entries(r.specializationTraining).every(([id,n])=>ATTRIBUTES.some(a=>a.id===id&&a.parent)&&num(n)), 'pending specialization training');
  requireValue(r.rules==='tasks'||r.rules==='checks'||r.rules==='rooms', 'run rules');
  requireValue(object(r.endurance)&&num(r.endurance.max)&&num(r.endurance.current,0,r.endurance.max)&&integer(r.successfulFloorRooms,0,9),'run endurance or floor progress');
  requireValue((r.recallRequestedAt===null||integer(r.recallRequestedAt,0,r.elapsed))&&(r.roomStartedAt===null||integer(r.roomStartedAt,0,r.elapsed))&&typeof r.lowSkill==='boolean'&&(r.roomEfficiency===null||num(r.roomEfficiency,0,1e12)),'room and recall timers');
  requireValue(r.floorState===null||(object(r.floorState)&&r.rules==='rooms'&&integer(r.floorState.number,1,r.dungeonId==='wood'?100:100000)&&integer(r.floorState.counted,0,10)&&integer(r.floorState.successful,0,r.floorState.counted)&&typeof r.floorState.lastTreasure==='boolean'&&r.floor===(r.floorState.number-1)*10+Math.min(10,r.floorState.counted+1)),'floor encounter position');
  if(r.floorState&&r.generated){
   const catalog=floorCatalog(r.dungeonId,r.floorState.number),category=categoryOf(roomById(r.dungeonId,r.generated.id));
   requireValue(catalog[category].some(room=>room.id===r.generated!.id)&&(r.floorState.counted===10?category==='boss':category!=='boss')&&!(r.floorState.lastTreasure&&category==='treasure'),'floor encounter catalog');
  }
  if(r.rules==='rooms'&&r.generated!==null)requireValue(r.roomStartedAt!==null&&r.roomEfficiency!==null,'active room evaluation');
  if(r.stage!=='exploring'||r.generated===null)requireValue(r.roomStartedAt===null&&!r.lowSkill&&r.roomEfficiency===null,'inactive room evaluation');

  requireValue(integer(r.carryCapacity,1,10000000)&&Array.isArray(r.loadout)&&new Set(r.loadout).size===r.loadout.length&&r.loadout.every(id=>g.equipment.unlocked.includes(id)), 'run equipment snapshot');
  requireValue(r.rules!=='rooms'||cargoSize(r.loot,r.chips)<=r.carryCapacity, 'carried capacity');
  if(r.generated!==null){requireValue(r.rules==='rooms'&&r.stage==='exploring'&&object(r.generated)&&!!roomById(r.dungeonId,r.generated.id),'generated room');const room=roomById(r.dungeonId,r.generated.id);requireValue(integer(r.generated.index,0,room.checks.length-1)&&num(r.generated.work,0,taskDuration(r)-1e-9)&&r.progress===r.generated.work&&integer(r.generated.attempts),'generated room progress');}else requireValue(r.rules!=='rooms'||r.progress===0,'generated room boundary');
  requireValue(['outbound','exploring','returning'].includes(r.stage)&&isLocationId(r.originLocationId)&&isLocationId(r.destinationLocationId)&&r.destinationLocationId===DUNGEONS.find(d=>d.id===r.dungeonId)!.locationId&&integer(r.outboundSeconds,0,86400)&&integer(r.returnSeconds,0,86400)&&integer(r.travelRemaining,0,r.stage==='outbound'?r.outboundSeconds:r.returnSeconds), 'travel state');
  requireValue(r.stage==='exploring'?r.travelRemaining===0:r.travelRemaining>0, 'travel timer');
  requireValue(r.stage==='returning'?object(r.outcome)&&text(r.outcome.reason)&&text(r.outcome.detail,500)&&r.room===null&&r.task===0&&r.progress===0:r.outcome===null, 'return outcome');
  if(r.stage==='outbound')requireValue(r.elapsed===0&&r.task===0&&r.progress===0&&r.chips===0&&Object.keys(r.loot).length===0, 'outbound progress');
  if(r.rules==='tasks'||r.rules==='rooms'||r.stage==='returning')requireValue(r.room===null,'inactive check room');
  else { const room=r.room;requireValue(r.dungeonId==='ruins'&&object(room)&&room.status==='active'&&integer(room.index,0,TRAP_ROOM.checks.length-1)&&room.index===r.task&&num(room.work)&&room.work===r.progress&&integer(room.cooldown,0,86400)&&integer(room.attempts)&&(room.lastOutcome===null||text(room.lastOutcome)), 'active check state'); }
  const d=DUNGEONS.find(d=>d.id===r.dungeonId)!;
  requireValue(integer(r.task,0,d.tasks.length-1)&&num(r.progress,0,taskDuration(r)-1e-9)&&pools(r.training)&&pools(r.startMax)&&integer(r.chips), 'task state');
  requireValue(object(r.loot)&&Object.entries(r.loot).every(([id,n])=>(r.rules==='rooms'?RESOURCES.some(resource=>resource.id===id&&id!=='chips'):d.loot.some(l=>l.id===id))&&integer(n)), 'carried loot');
  const m=g.members.find(m=>m.id===r.memberId)!;
  requireValue(m.cooldown===0&&STATS.every(s=>(r.rules==='rooms'||r.stage==='returning'||!STAT_INFO[s].consumable||m.stats[s].current>0) && r.startMax[s]===m.stats[s].max), 'active stat snapshot');
 }
 const lootIds=RESOURCES.filter(resource=>!['chips','materials'].includes(resource.id)).map(resource=>resource.id as string);
 requireValue(object(g.inventory)&&Object.entries(g.inventory).every(([k,n])=>lootIds.includes(k)&&integer(n)&&n<=g.storage[k].cap)&&g.guild.materials<=g.storage.materials.cap, 'inventory');
 requireValue(g.members.every(member=>member.equipped.length<=equipmentCapacity(member)&&member.equipped.every(id=>g.equipment.unlocked.includes(id))), 'equipped items');
 requireValue(object(g.stats)&&integer(g.stats.clears)&&integer(g.stats.retreats)&&integer(g.stats.warps), 'lifetime totals');
 requireValue(Array.isArray(g.reports)&&g.reports.length<=100&&g.reports.every(r=>object(r)&&(r.section===undefined||isSection(r.section))&&integer(r.day,1,g.day)&&integer(r.time,0,DAY_SECONDS-1)&&text(r.member,60)&&text(r.reason)&&text(r.detail,500)&&pools(r.growth)), 'reports');
 for(const report of g.reports){requireValue(report.rarity===undefined||isRarity(report.rarity),'report rarity');requireValue(report.drops===undefined||(object(report.drops)&&Object.entries(report.drops).every(([id,amount])=>RESOURCES.some(resource=>resource.id===id)&&integer(amount,0,1e9))),'report drops');}
 for(const run of g.active)requireValue(run.roomLoot===undefined||(object(run.roomLoot)&&Object.entries(run.roomLoot).every(([id,amount])=>RESOURCES.some(resource=>resource.id===id)&&integer(amount,0,1e9))),'room loot');
 return structuredClone(g);
}
export function exportSave(g: Game): string { return JSON.stringify({ format: 'guild-loops', version: VERSION, game: validateGame(g) }, null, 2); }
/** Preserve old roots, carried training and history; initialize newly introduced roots deterministically. */
function migrateRootStats(g:Record<string,unknown>){
 requireValue(Array.isArray(g.members)&&Array.isArray(g.active)&&Array.isArray(g.reports),'legacy stat containers');
 const aliases={strength:'might',dexterity:'agility',intelligence:'focus'} as const;
 function pool(input:unknown):Record<string,unknown>{
  requireValue(object(input),'legacy pool');
  const result:Record<string,unknown>={...zeroPools()};
  for(const stat of STATS){const old=aliases[stat as keyof typeof aliases];
   if(Object.hasOwn(input,stat))result[stat]=input[stat];else if(old){requireValue(Object.hasOwn(input,old),'missing legacy pool');result[stat]=input[old];}
  }
  return result;
 }
 const members=[...g.members,...(g.candidate?[g.candidate]:[])];
 for(const member of members){
  requireValue(object(member)&&object(member.stats),'legacy member stats');
  const stats=member.stats,result:Record<string,unknown>={};
  for(const stat of STATS){const old=aliases[stat as keyof typeof aliases];
   if(Object.hasOwn(stats,stat))result[stat]=stats[stat];else if(old){requireValue(Object.hasOwn(stats,old),'missing legacy stat');result[stat]=stats[old];}
   else result[stat]={current:12,max:12,affinity:60};
  }
  member.stats=result;
 }
 for(const run of g.active){requireValue(object(run),'legacy run');run.training=pool(run.training);run.startMax=pool(run.startMax);
  const member=members.find(member=>object(member)&&member.id===run.memberId);requireValue(object(member),'legacy active member');
  for(const stat of STATS)if(!Object.hasOwn(aliases,stat))(run.startMax as Record<string,unknown>)[stat]=(member.stats as Member['stats'])[stat].max;
 }
 for(const report of g.reports){requireValue(object(report),'legacy report');report.growth=pool(report.growth);}
}
export function parseSave(raw: string): Game {
 requireValue(raw.length<=2_000_000,'file exceeds 2 MB');
 let data: unknown; try { data=JSON.parse(raw); } catch { throw new Error('This file is not valid JSON. Your current game was not changed.'); }
 requireValue(object(data)&&data.format==='guild-loops','not a Guild Loops save');
 requireValue(data.version===0||data.version===1||data.version===2||data.version===3||data.version===4||data.version===5||data.version===6||data.version===7||data.version===8||data.version===9||data.version===10||data.version===VERSION,'unsupported version; this save may need a newer game');
 if(typeof data.version==='number'&&data.version<6){
  requireValue(object(data.game)&&object(data.game.guild)&&Array.isArray(data.game.active),'legacy currency');const game=data.game;
  for(const holder of [game.guild,...(game.active as unknown[]),...(Array.isArray(game.trades)?game.trades:[])]){requireValue(object(holder),'legacy currency holder');if(Object.hasOwn(holder,'gold')&&!Object.hasOwn(holder,'chips'))holder.chips=holder.gold;delete holder.gold;}
  if(Array.isArray(game.pinnedResources))game.pinnedResources=game.pinnedResources.map(id=>id==='gold'?'chips':id);
 }
 if(typeof data.version==='number'&&data.version<5){
  requireValue(object(data.game),'legacy stat game');
  migrateRootStats(data.game);
 }
 if(data.version===0||data.version===1) {
  requireValue(object(data.game),'legacy game');
  const g=data.game as unknown as Game;
  // Validate the old structure's identity and containers before transforming it.
  requireValue(g.version===data.version&&Array.isArray(g.members)&&Array.isArray(g.active)&&Array.isArray(g.reports), 'legacy structure');
  for(const m of [...g.members,...(g.candidate?[g.candidate]:[])]) {
   requireValue(object(m)&&Array.isArray(m.queue)&&m.queue.every(id=>typeof id==='string'&&DUNGEONS.some(d=>d.id===id)), 'legacy queue');
   m.queue=(m.queue as unknown as string[]).map(dungeonId=>({dungeonId,maxDepth:1}));
   m.queueIndex=0;m.cooldown=0;m.resetSeconds=12;m.enabled=true;
  }
  // v1 rewards were banked immediately. Return old runs without replaying rewards.
  for(const r of g.active) {
   const m=g.members.find(m=>m.id===r.memberId);
   requireValue(m&&pools(r.training)&&pools(r.startMax), 'legacy run');
   for(const s of STATS) {const max=m.stats[s].max,aff=m.stats[s].affinity;m.stats[s].max+=Math.max(0,Math.min(aff-max,r.training[s]*Math.max(0,1-max/aff)));}
   m.runs++;m.cooldown=12;
  }
  g.active=[];g.version=2;
  g.elapsed=Math.min(86399,g.elapsed);g.phase='planning';
  g.dungeonLimits=Object.fromEntries(DUNGEONS.map(d=>[d.id,null]));g.pinnedResources=['chips','gear','materials'];
  g.reports=g.reports.map(r=>({...r,time:0}));
  data.game=g;
 }
 if(data.version===0||data.version===1||data.version===2){
  requireValue(object(data.game),'legacy game');const g=data.game as unknown as Game;
  requireValue(g.version===2&&Array.isArray(g.members)&&Array.isArray(g.active),'v2 structure');
  for(const m of [...g.members,...(g.candidate?[g.candidate]:[])])Object.assign(m,newSkillProfile(m.stats));
  g.progression={completed:{guild_founded:{day:1,time:0},legacy_access:{day:g.day,time:g.elapsed}}};
  for(const r of g.active){r.rules='tasks';r.room=null;r.specializationTraining={};}
  g.version=3;
 }
 if(data.version===0||data.version===1||data.version===2||data.version===3){
  requireValue(object(data.game),'legacy travel game');const g=data.game as unknown as Game;
  requireValue(g.version===3&&Array.isArray(g.active),'v3 structure');
  g.homeLocationId='emberveil';g.trades=[];g.nextTradeId=1;
  for(const r of g.active){
   requireValue(object(r)&&DUNGEONS.some(d=>d.id===r.dungeonId),'legacy dungeon');
   const destination=DUNGEONS.find(d=>d.id===r.dungeonId)!.locationId;
   Object.assign(r,{stage:'exploring',originLocationId:'emberveil',destinationLocationId:destination,travelRemaining:0,outboundSeconds:0,returnSeconds:travelSeconds(destination,'emberveil'),outcome:null});
  }
  g.version=4;
 }
 if(typeof data.version==='number'&&data.version<5){
  const g=data.game as unknown as Game;requireValue(g.version===4,'legacy stat version');
  g.guildmaster=newGuildmaster();
  for(const member of [...g.members,...(g.candidate?[g.candidate]:[])]){
   const profile=newSkillProfile(member.stats),previous=member.specializations;
   requireValue(object(previous)&&object(member.skills),'legacy skills');
   for(const [id,value] of Object.entries(previous)){
    const target=id==='finger_dexterity'?'finesse':id;
    requireValue(Object.hasOwn(profile.specializations,target),'unknown legacy specialization');
    profile.specializations[target]=value;
   }
   member.specializations=profile.specializations;
  }
  for(const run of g.active)if(Object.hasOwn(run.specializationTraining,'finger_dexterity')){
   run.specializationTraining.finesse=run.specializationTraining.finger_dexterity;delete run.specializationTraining.finger_dexterity;
  }
  g.version=5;
 }
 if(typeof data.version==='number'&&data.version<6){
  const g=data.game as unknown as Game;requireValue(g.version===5,'legacy opening version');
  g.equipment??={unlocked:[],capacity:0};g.storage??=initialStorage();
  for(const resource of RESOURCES){const held=resource.id==='chips'?g.guild.chips:resource.id==='materials'?g.guild.materials:g.inventory[resource.id]??0;g.storage[resource.id]??={cap:resource.cap,level:0};g.storage[resource.id].cap=Math.max(g.storage[resource.id].cap,held);}
  for(const member of [...g.members,...(g.candidate?[g.candidate]:[])]){
   member.origin='legacy';member.equipped??=[];member.carryCapacity??=1000000;member.bestRoom??=0;
   const defaults=newSkillProfile(member.stats);member.skills={...defaults.skills,...member.skills};
  }
  const gmDefaults=newSkillProfile(g.guildmaster.stats);g.guildmaster.skills={...gmDefaults.skills,...g.guildmaster.skills};
  for(const run of g.active){run.generated??=null;run.loadout??=[];run.carryCapacity??=1000000;}
  for(const report of g.reports){report.detail=report.detail.replace(/\bgold\b/gi,'Chips');}
  g.version=6;
 }
 if(typeof data.version==='number'&&data.version<7){
  const g=data.game as unknown as Game;requireValue(g.version===6,'legacy weighted-room version');g.requests??={};
  for(const member of [...g.members,g.guildmaster,...(g.candidate?[g.candidate]:[])]){
   const defaults=newSkillProfile(member.stats);member.skills={...defaults.skills,...member.skills};
   if('origin' in member&&member.origin==='arya')member.skills.combat.discovered=true;
   if('origin' in member&&member.origin==='clyde')member.skills.herbology={level:2,experience:0,lastUsedAt:null,discovered:true};
   if('equipped' in member)member.equipped=member.equipped.slice(0,equipmentCapacity(member));
  }
  // Existing unlocked templates are retained when the new teaching gate is introduced.
  if(g.equipment.unlocked.length)g.progression.completed.leather_crafting_learned={day:g.day,time:g.elapsed};
  for(const run of g.active){if(run.generated){const check=roomById(run.dungeonId,run.generated.id).checks[run.generated.index];run.generated.work=Math.min(run.generated.work,Math.max(0,check.work*1.04**(run.floor-1)-1e-8));run.progress=run.generated.work;}}
  g.version=7;
 }
 if(typeof data.version==='number'&&data.version<8){
  const g=data.game as unknown as Game;requireValue(g.version===7,'legacy assignment version');
  for(const member of [...g.members,...(g.candidate?[g.candidate]:[])]){
   requireValue(Array.isArray(member.queue)&&member.queue.length<=20&&member.queue.every(e=>object(e)&&DUNGEONS.some(d=>d.id===e.dungeonId)&&('maxDepth' in e&&validDepth(e.maxDepth)))&&integer(member.queueIndex,0,Math.max(0,member.queue.length-1)),'legacy assignment');
   member.rarity=0;member.dungeonHistory={};
   member.queue=member.queue.length?[member.queue[member.queueIndex]]:[];member.queueIndex=0;
  }
  for(const run of g.active){run.reachedRoom=run.stage==='outbound'||run.elapsed===0?0:run.rules==='rooms'&&run.stage==='exploring'&&!run.generated?Math.max(0,run.floor-1):run.floor;const m=g.members.find(m=>m.id===run.memberId);if(m)m.dungeonHistory[run.dungeonId]={bestRoom:run.reachedRoom,lastReturn:null};}
  g.version=8;
 }
 if(typeof data.version==='number'&&data.version<9){
  const g=data.game as unknown as Game;
  requireValue(g.version===8&&Array.isArray(g.members)&&Array.isArray(g.active)&&object(g.dungeonLimits),'v8 specialization migration');
  g.dungeonDefaults={depthLimit:null,skillThreshold:1};g.dungeonThresholds={};
  for(const actor of [...g.members,g.guildmaster,...(g.candidate?[g.candidate]:[])]){
   actor.selections=defaultSelections(actor,'origin' in actor?actor.origin:'guildmaster');actor.constitutionExperience=0;
   if('queue' in actor){requireValue(Array.isArray(actor.queue)&&actor.queue.length<=1&&actor.queue.every(e=>object(e)&&DUNGEONS.some(d=>d.id===e.dungeonId)&&('maxDepth' in e&&validDepth(e.maxDepth))),'v8 assignment');actor.queue=actor.queue.map(({dungeonId})=>({dungeonId}));}
  }
  // Keep dungeon caps (including explicit Unlimited); drop assignment caps rather than merging them.
  for(const run of g.active){
   requireValue(object(run),'v8 active run');
   const old=run as unknown as Record<string,unknown>;requireValue(validDepth(old.personalLimit),'v8 personal limit');delete old.personalLimit;
   const member=g.members.find(m=>m.id===run.memberId);requireValue(member,'v8 active member');
   const maximum=run.rules==='rooms'?enduranceMaximum({...member,gear:0},run.loadout):0;
   // Preserve the fraction of the former CON pool: never refill an active outing on import.
   run.endurance={max:maximum,current:maximum*Math.min(1,member.stats.constitution.current/member.stats.constitution.max)};
   run.recallRequestedAt=null;run.successfulFloorRooms=0;
   run.roomStartedAt=run.generated?run.elapsed:null;run.roomEfficiency=run.generated?roomEfficiency({...member,gear:0},roomById(run.dungeonId,run.generated.id),run.loadout):null;run.lowSkill=run.roomEfficiency!==null&&run.roomEfficiency<.01;
  }
  g.version=9;
 }
 if(typeof data.version==='number'&&data.version<10){
  const g=data.game as unknown as Game;requireValue(g.version===9,'v9 floor migration');
  g.dungeonStarts={};g.dungeonKnowledge={};g.guildmaster.soulAccess='guildmaster';
  for(const m of [...g.members,...(g.candidate?[g.candidate]:[])]){
   m.soulAccess='none';
   if(m.origin==='recruit'){
    m.stats.soul={current:1,max:1,affinity:1};
    const roots=STATS.filter(s=>s!=='soul'),total=roots.reduce((n,s)=>n+m.stats[s].affinity,0),factor=Math.min(1,(tierBudget(m.tier)-1)/total);
    for(const stat of roots){m.stats[stat].affinity*=factor;m.stats[stat].max*=factor;m.stats[stat].current*=factor;}
    m.selections=defaultSelections(m);
    const active=g.active.find(r=>r.memberId===m.id);if(active)for(const stat of STATS)active.startMax[stat]=m.stats[stat].max;
   }
  }
  // Finish historical outings with their original definitions; the next departure uses checkpoints.
  for(const run of g.active)run.floorState=null;
  g.version=10;
 }
 if(typeof data.version==='number'&&data.version<11){const g=data.game as unknown as Game;requireValue(g.version===10,'v10 affinity migration');g.version=11;}
 return validateGame(data.game);
}
export function saveLocal(storage: StorageLike, g: Game) {
 const data=exportSave(g);
 const previous=storage.getItem(SAVE_KEY);
 if(previous) { try { parseSave(previous); storage.setItem(BACKUP_KEY,previous); } catch { /* Keep an existing recovery copy if primary was corrupt. */ } }
 storage.setItem(SAVE_KEY,data);
}
export function loadLocal(storage: StorageLike): { game: Game | null; warning: string | null } {
 let primary: string|null, backup: string|null;
 try { primary=storage.getItem(SAVE_KEY); backup=storage.getItem(BACKUP_KEY); } catch { return {game:null,warning:'Browser storage is unavailable. Export a save file before leaving.'}; }
 if(!primary&&!backup) return {game:null,warning:null};
 if(primary) { try { return {game:parseSave(primary),warning:null}; } catch { /* Try backup. */ } }
 if(backup) { try { return {game:parseSave(backup),warning:'Recovered the previous automatic save. Export a backup now.'}; } catch { /* Explain recovery failure. */ } }
 return {game:null,warning:'Saved data could not be read. It has not been overwritten. Import a backup or explicitly start a new guild.'};
}
