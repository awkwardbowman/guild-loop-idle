import { EVENT_IDS } from './progression.ts';
import { SKILLS, ATTRIBUTES, newSkillProfile, TRAP_ROOM } from './skill-system.ts';
import type { Game, Member, Assignment } from './engine.ts';
import { taskDuration, validDepth } from './engine.ts';
import { STATS, DUNGEONS, VERSION, WARP_SECONDS, DAY_SECONDS } from './content.ts';
export const SAVE_KEY = 'guild-loops.save.v1';
export const BACKUP_KEY = 'guild-loops.backup.v1';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
function requireValue(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`Invalid save: ${message}`); }
const num = (v: unknown, min = 0, max = 1e12) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const integer = (v: unknown, min = 0, max = 1e9) => num(v,min,max) && Number.isInteger(v);
const text = (v: unknown, max = 200) => typeof v === 'string' && v.length <= max;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function validateMember(m: Member) {
 requireValue(object(m) && text(m.id,60) && /^member-\d+$/.test(m.id) && text(m.name,60) && integer(m.tier,1,10) && integer(m.runs), 'member identity');
 requireValue(object(m.stats), 'member stats');
 for (const s of STATS) { const v = m.stats[s]; requireValue(object(v) && num(v.affinity,.001,1e9) && num(v.max,.001,v.affinity) && num(v.current,0,v.max), `${s} stat bounds`); }
 requireValue(object(m.specializations)&&Object.keys(m.specializations).length===ATTRIBUTES.filter(a=>a.parent).length&&ATTRIBUTES.filter(a=>a.parent).every(a=>{const v=m.specializations[a.id];return object(v)&&num(v.affinity,.001,1e9)&&num(v.value,0,v.affinity);}), 'specialization values');
 requireValue(object(m.skills)&&Object.keys(m.skills).length===SKILLS.length&&SKILLS.every(d=>{const v=m.skills[d.id];return object(v)&&integer(v.level,0,99)&&num(v.experience,0,v.level===99?0:10*(v.level+1)-1e-9)&&(v.lastUsedAt===null||integer(v.lastUsedAt));}), 'learned skills');
 validateRoute(m.queue);
 requireValue(integer(m.queueIndex,0,Math.max(0,m.queue.length-1)) && integer(m.cooldown,0,86400) && integer(m.resetSeconds,1,86400) && typeof m.enabled==='boolean', 'member schedule');
}
function validateRoute(route: Assignment[]) { requireValue(Array.isArray(route) && route.length <= 20 && route.every(e => object(e) && DUNGEONS.some(d=>d.id===e.dungeonId) && validDepth(e.maxDepth)), 'dungeon queue'); }
function pools(p: unknown) { return object(p) && STATS.every(s=>num(p[s])); }
export function validateGame(input: unknown): Game {
 requireValue(object(input), 'expected a game object');
 const g = input as unknown as Game;
 requireValue(g.version === VERSION, 'unsupported format version');
 requireValue(integer(g.seed,0,4294967295) && integer(g.nextId,1) && integer(g.day,1) && integer(g.elapsed,0,DAY_SECONDS-1), 'clock or random state');
 requireValue(object(g.progression)&&object(g.progression.completed)&&(Object.keys(g.progression.completed).length===0||Object.hasOwn(g.progression.completed,'guild_founded'))&&Object.entries(g.progression.completed).every(([id,stamp])=>EVENT_IDS.includes(id as typeof EVENT_IDS[number])&&object(stamp)&&integer(stamp.day,1,g.day)&&integer(stamp.time,0,DAY_SECONDS-1)&&(stamp.day<g.day||stamp.time<=g.elapsed)), 'progression events');
 requireValue(g.phase === 'running' || g.phase === 'planning', 'phase');
 const v = g.guild; requireValue(object(v), 'guild');
 requireValue(integer(v.gold) && integer(v.materials) && num(v.gear) && integer(v.gearCap,1,10000) && v.gear <= v.gearCap && num(v.gearRegen,0,100) && integer(v.slots,1,100) && integer(v.rosterCap,1,100), 'guild resources');
 requireValue((v.priority==='recruitment'||v.priority==='infrastructure') && integer(v.work,0,19) && object(v.upgrades) && ['slots','quarters','gear','regen'].every(k=>integer((v.upgrades as Record<string,number>)[k],0,100)), 'guild work or upgrades');
 requireValue(Array.isArray(g.members) && g.members.length <= v.rosterCap, 'roster capacity'); g.members.forEach(validateMember);
 for(const m of [...g.members,...(g.candidate?[g.candidate]:[])])requireValue(Object.values(m.skills).every(s=>s.lastUsedAt===null||s.lastUsedAt<=(g.day-1)*DAY_SECONDS+g.elapsed), 'future skill timestamp');
 if(!Object.hasOwn(g.progression.completed,'guild_founded'))requireValue(g.members.length===0&&g.candidate===null&&g.active.length===0&&g.phase==='planning','unopened guild');
 const ids = g.members.map(m=>m.id); requireValue(new Set(ids).size === ids.length, 'duplicate members');
 if (g.candidate !== null) { validateMember(g.candidate); requireValue(!ids.includes(g.candidate.id), 'candidate already in roster'); ids.push(g.candidate.id); }
 requireValue(ids.every(id=>Number(id.split('-')[1])<g.nextId), 'next member ID');
 requireValue(Array.isArray(g.active) && g.active.length <= v.slots && new Set(g.active.map(r=>r.memberId)).size === g.active.length, 'active expedition count');
 requireValue(g.phase!=='planning'||g.active.length===0, 'planning state');
 requireValue(object(g.dungeonLimits)&&DUNGEONS.every(d=>validDepth(g.dungeonLimits[d.id])), 'global depth limits');
 const resourceIds=['gold','gear','materials',...DUNGEONS.flatMap(d=>d.loot.map(l=>l.id))];
 requireValue(Array.isArray(g.pinnedResources)&&new Set(g.pinnedResources).size===g.pinnedResources.length&&g.pinnedResources.every(id=>resourceIds.includes(id)), 'pinned resources');
 for (const r of g.active) {
  requireValue(object(r) && g.members.some(m=>m.id===r.memberId) && DUNGEONS.some(d=>d.id===r.dungeonId), 'active member or dungeon');
  requireValue(validDepth(r.personalLimit)&&integer(r.floor,1,1000000)&&integer(r.elapsed,0,WARP_SECONDS-1), 'run position');
  requireValue(object(r.specializationTraining)&&Object.entries(r.specializationTraining).every(([id,n])=>ATTRIBUTES.some(a=>a.id===id&&a.parent)&&num(n)), 'pending specialization training');
  requireValue(r.rules==='tasks'||r.rules==='checks', 'run rules');
  if(r.rules==='tasks')requireValue(r.room===null,'legacy task room');
  else { const room=r.room;requireValue(r.dungeonId==='ruins'&&object(room)&&room.status==='active'&&integer(room.index,0,TRAP_ROOM.checks.length-1)&&room.index===r.task&&num(room.work)&&room.work===r.progress&&integer(room.cooldown,0,86400)&&integer(room.attempts)&&(room.lastOutcome===null||text(room.lastOutcome)), 'active check state'); }
  const d=DUNGEONS.find(d=>d.id===r.dungeonId)!;
  requireValue(integer(r.task,0,d.tasks.length-1)&&num(r.progress,0,taskDuration(r)-1e-9)&&pools(r.training)&&pools(r.startMax)&&integer(r.gold), 'task state');
  requireValue(object(r.loot)&&Object.entries(r.loot).every(([id,n])=>d.loot.some(l=>l.id===id)&&integer(n)), 'carried loot');
  const m=g.members.find(m=>m.id===r.memberId)!;
  requireValue(m.cooldown===0&&STATS.every(s=>m.stats[s].current>0 && r.startMax[s]===m.stats[s].max), 'active stat snapshot');
 }
 const lootIds=DUNGEONS.flatMap(d=>d.loot.map(l=>l.id));
 requireValue(object(g.inventory)&&Object.entries(g.inventory).every(([k,n])=>lootIds.includes(k)&&integer(n)), 'inventory');
 requireValue(object(g.stats)&&integer(g.stats.clears)&&integer(g.stats.retreats)&&integer(g.stats.warps), 'lifetime totals');
 requireValue(Array.isArray(g.reports)&&g.reports.length<=100&&g.reports.every(r=>object(r)&&integer(r.day,1,g.day)&&integer(r.time,0,DAY_SECONDS-1)&&text(r.member,60)&&text(r.reason)&&text(r.detail,500)&&pools(r.growth)), 'reports');
 return structuredClone(g);
}
export function exportSave(g: Game): string { return JSON.stringify({ format: 'guild-loops', version: VERSION, game: validateGame(g) }, null, 2); }
export function parseSave(raw: string): Game {
 requireValue(raw.length<=2_000_000,'file exceeds 2 MB');
 let data: unknown; try { data=JSON.parse(raw); } catch { throw new Error('This file is not valid JSON. Your current game was not changed.'); }
 requireValue(object(data)&&data.format==='guild-loops','not a Guild Loops save');
 requireValue(data.version===0||data.version===1||data.version===2||data.version===VERSION,'unsupported version; this save may need a newer game');
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
  g.dungeonLimits=Object.fromEntries(DUNGEONS.map(d=>[d.id,null]));g.pinnedResources=['gold','gear','materials'];
  g.reports=g.reports.map(r=>({...r,time:0}));
  data.game=g;
 }
 if(data.version===0||data.version===1||data.version===2){
  requireValue(object(data.game),'legacy game');const g=data.game as unknown as Game;
  requireValue(g.version===2&&Array.isArray(g.members)&&Array.isArray(g.active),'v2 structure');
  for(const m of [...g.members,...(g.candidate?[g.candidate]:[])])Object.assign(m,newSkillProfile(m.stats));
  g.progression={completed:{guild_founded:{day:1,time:0},legacy_access:{day:g.day,time:g.elapsed}}};
  for(const r of g.active){r.rules='tasks';r.room=null;r.specializationTraining={};}
  g.version=VERSION;
 }
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
