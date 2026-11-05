import type { Game, Member } from './engine.ts';
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
 validateRoute(m.queue);
}
function validateRoute(route: string[]) { requireValue(Array.isArray(route) && route.length <= 20 && route.every(id => DUNGEONS.some(d=>d.id===id)), 'dungeon queue'); }
function pools(p: unknown) { return object(p) && STATS.every(s=>num(p[s])); }
export function validateGame(input: unknown): Game {
 requireValue(object(input), 'expected a game object');
 const g = input as unknown as Game;
 requireValue(g.version === VERSION, 'unsupported format version');
 requireValue(integer(g.seed,0,4294967295) && integer(g.nextId,1) && integer(g.day,1) && integer(g.elapsed,0,DAY_SECONDS-1), 'clock or random state');
 requireValue(g.phase === 'running' || g.phase === 'planning', 'phase');
 const v = g.guild; requireValue(object(v), 'guild');
 requireValue(integer(v.gold) && integer(v.materials) && num(v.gear) && integer(v.gearCap,1,10000) && v.gear <= v.gearCap && num(v.gearRegen,0,100) && integer(v.slots,1,100) && integer(v.rosterCap,1,100), 'guild resources');
 requireValue((v.priority==='recruitment'||v.priority==='infrastructure') && integer(v.work,0,19) && object(v.upgrades) && ['slots','quarters','gear','regen'].every(k=>integer((v.upgrades as Record<string,number>)[k],0,100)), 'guild work or upgrades');
 requireValue(Array.isArray(g.members) && g.members.length <= v.rosterCap, 'roster capacity'); g.members.forEach(validateMember);
 const ids = g.members.map(m=>m.id); requireValue(new Set(ids).size === ids.length, 'duplicate members');
 if (g.candidate !== null) { validateMember(g.candidate); requireValue(!ids.includes(g.candidate.id), 'candidate already in roster'); ids.push(g.candidate.id); }
 requireValue(ids.every(id=>Number(id.split('-')[1])<g.nextId), 'next member ID');
 requireValue(Array.isArray(g.active) && g.active.length <= v.slots && new Set(g.active.map(r=>r.memberId)).size === g.active.length, 'active expedition count');
 requireValue(g.phase!=='planning'||(g.active.length===0&&g.elapsed===0), 'planning state');
 for (const r of g.active) {
  requireValue(object(r) && g.members.some(m=>m.id===r.memberId), 'active member'); validateRoute(r.route);
  requireValue(r.route.length>0 && integer(r.index,0,r.route.length-1) && integer(r.elapsed,0,WARP_SECONDS-1) && r.elapsed===g.elapsed, 'run position');
  const d=DUNGEONS.find(d=>d.id===r.route[r.index])!;
  requireValue(integer(r.task,0,d.tasks.length-1)&&integer(r.progress,0,d.tasks[r.task].duration-1)&&pools(r.training)&&pools(r.startMax), 'task state');
  const m=g.members.find(m=>m.id===r.memberId)!;
  requireValue(STATS.every(s=>m.stats[s].current>0 && r.startMax[s]===m.stats[s].max), 'active stat snapshot');
 }
 const lootIds=DUNGEONS.flatMap(d=>d.loot.map(l=>l.id));
 requireValue(object(g.inventory)&&Object.entries(g.inventory).every(([k,n])=>lootIds.includes(k)&&integer(n)), 'inventory');
 requireValue(object(g.stats)&&integer(g.stats.clears)&&integer(g.stats.retreats)&&integer(g.stats.warps), 'lifetime totals');
 requireValue(Array.isArray(g.reports)&&g.reports.length<=60&&g.reports.every(r=>object(r)&&integer(r.day,1,g.day)&&text(r.member,60)&&text(r.reason)&&text(r.detail,500)&&pools(r.growth)), 'reports');
 return structuredClone(g);
}
export function exportSave(g: Game): string { return JSON.stringify({ format: 'guild-loops', version: VERSION, game: validateGame(g) }, null, 2); }
export function parseSave(raw: string): Game {
 requireValue(raw.length<=2_000_000,'file exceeds 2 MB');
 let data: unknown; try { data=JSON.parse(raw); } catch { throw new Error('This file is not valid JSON. Your current game was not changed.'); }
 requireValue(object(data)&&data.format==='guild-loops','not a Guild Loops save');
 requireValue(data.version===0||data.version===VERSION,'unsupported version; this save may need a newer game');
 if(data.version===0) { requireValue(object(data.game),'legacy game'); data.game={...data.game,version:VERSION}; }
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
