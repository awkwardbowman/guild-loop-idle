import { DAY_SECONDS, WARP_SECONDS, STATS, VERSION, DUNGEONS, dungeonById, UPGRADE_INFO } from './content.ts';
import type { Pools, Upgrade } from './content.ts';
export type StatValues = { current: number; max: number; affinity: number };
export type Member = { id: string; name: string; tier: number; stats: Record<keyof Pools, StatValues>; queue: string[]; runs: number };
export type Run = { memberId: string; route: string[]; index: number; task: number; progress: number; elapsed: number; training: Pools; startMax: Pools };
export type Report = { day: number; member: string; reason: string; detail: string; growth: Pools };
export type Game = { version: number; seed: number; nextId: number; day: number; elapsed: number; phase: 'planning' | 'running'; guild: { gold: number; materials: number; gear: number; gearCap: number; gearRegen: number; slots: number; rosterCap: number; priority: 'recruitment' | 'infrastructure'; work: number; upgrades: Record<Upgrade, number> }; members: Member[]; candidate: Member | null; active: Run[]; reports: Report[]; inventory: Record<string, number>; stats: { clears: number; retreats: number; warps: number } };
export const zero = (): Pools => ({ might: 0, agility: 0, focus: 0 });
const copy = <T,>(v: T): T => structuredClone(v);
function rand(g: Game) { g.seed = (Math.imul(1664525, g.seed) + 1013904223) >>> 0; return g.seed / 4294967296; }
function log(g: Game, member: string, reason: string, detail: string, growth = zero()) { g.reports.unshift({ day: g.day, member, reason, detail, growth }); g.reports = g.reports.slice(0, 60); }
export function recruit(g: Game): Member {
 const tier = rand(g) < .22 ? 2 : 1;
 const names = ['Rowan','Mira','Bram','Sable','Tess','Orin','Jun','Wren','Iris','Ash'];
 const id = `member-${g.nextId++}`;
 const name = `${names[Math.floor(rand(g) * names.length)]} ${id.split('-')[1]}`;
 const stats = {} as Member['stats'];
 for (const stat of STATS) { const affinity = 35 + tier * 25 + Math.floor(rand(g) * 45); const max = 10 + Math.floor(rand(g) * 8); stats[stat] = { current: max, max, affinity }; }
 return { id, name, tier, stats, queue: ['wood'], runs: 0 };
}
export function initialGame(seed = 73129): Game {
 const g: Game = { version: VERSION, seed: seed >>> 0, nextId: 1, day: 1, elapsed: 0, phase: 'planning', guild: { gold: 12, materials: 0, gear: 8, gearCap: 8, gearRegen: .12, slots: 2, rosterCap: 5, priority: 'recruitment', work: 0, upgrades: { slots: 0, quarters: 0, gear: 0, regen: 0 } }, members: [], candidate: null, active: [], reports: [], inventory: {}, stats: { clears: 0, retreats: 0, warps: 0 } };
 for (let i = 0; i < 3; i++) g.members.push(recruit(g));
 g.members[0].name = 'Rowan'; g.members[1].name = 'Mira'; g.members[2].name = 'Bram';
 g.members[0].stats.might.max = g.members[0].stats.might.current = 18;
 g.members[1].stats.focus.max = g.members[1].stats.focus.current = 20;
 g.members[1].queue = ['ruins']; g.members[2].queue = ['quarry'];
 log(g, 'The guild', 'Founded', 'Three new names in the ledger. A whole world beyond the door.');
 return g;
}
export function growth(max: number, affinity: number, training: number) { return Math.max(0, Math.min(affinity - max, training * Math.max(0, 1 - max / affinity))); }
function finish(g: Game, run: Run, reason: string, detail: string) {
 const m = g.members.find(m => m.id === run.memberId)!;
 const gains = zero();
 for (const stat of STATS) { gains[stat] = growth(run.startMax[stat], m.stats[stat].affinity, run.training[stat]); m.stats[stat].max += gains[stat]; }
 m.runs++;
 if (reason === 'Retreated') g.stats.retreats++;
 if (reason === 'Warped home') g.stats.warps++;
 log(g, m.name, reason, detail, gains);
 g.active = g.active.filter(r => r !== run);
}
export function startDay(input: Game): Game {
 if (input.phase !== 'planning') return input;
 const g = copy(input); g.phase = 'running'; g.elapsed = 0;
 for (const m of g.members) {
  for (const stat of STATS) m.stats[stat].current = m.stats[stat].max;
  if (!m.queue.length) { log(g, m.name, 'Stayed home', 'No dungeons in their queue.'); continue; }
  if (g.active.length >= g.guild.slots) { log(g, m.name, 'Stayed home', 'All expedition slots were assigned to earlier members.'); continue; }
  const d = dungeonById(m.queue[0]);
  if (g.guild.gear < d.gear) { log(g, m.name, 'Stayed home', `Needs ${d.gear} gear; the guild has ${g.guild.gear.toFixed(1)}.`); continue; }
  g.guild.gear -= d.gear;
  const startMax = zero(); for (const s of STATS) startMax[s] = m.stats[s].max;
  g.active.push({ memberId: m.id, route: [...m.queue], index: 0, task: 0, progress: 0, elapsed: 0, training: zero(), startMax });
 }
 return g;
}
function reward(g: Game, run: Run) {
 const d = dungeonById(run.route[run.index]);
 let roll = rand(g) * d.loot.reduce((a,l) => a + l.weight, 0);
 const loot = d.loot.find(l => (roll -= l.weight) < 0) ?? d.loot[d.loot.length - 1];
 g.inventory[loot.id] = (g.inventory[loot.id] ?? 0) + 1; g.guild.gold += d.gold; g.stats.clears++;
 const name = g.members.find(m => m.id === run.memberId)!.name;
 log(g, name, 'Dungeon cleared', `${d.name}: +${d.gold} gold, ${loot.name}.`);
}
function tick(g: Game) {
 g.elapsed++;
 g.guild.gear = Math.min(g.guild.gearCap, g.guild.gear + g.guild.gearRegen);
 if (g.guild.priority === 'infrastructure' || !g.candidate) g.guild.work++;
 if (g.guild.work >= 20) {
  g.guild.work -= 20;
  if (g.guild.priority === 'recruitment') { g.candidate = recruit(g); log(g, 'The guild', 'Applicant arrived', `${g.candidate.name} is waiting at the recruitment desk.`); }
  else { g.guild.materials++; log(g, 'The guild', 'Infrastructure', '+1 building material.'); }
 }
 for (const run of [...g.active]) {
  const m = g.members.find(m => m.id === run.memberId)!;
  const d = dungeonById(run.route[run.index]); const task = d.tasks[run.task];
  run.elapsed++; run.progress++;
  if (run.progress >= task.duration) {
   for (const stat of STATS) m.stats[stat].current = Math.max(0, m.stats[stat].current - task.cost[stat]);
   if (STATS.some(s => m.stats[s].current <= 0)) { finish(g, run, 'Retreated', `A stat ran out during “${task.name}” in ${d.name}.`); continue; }
   for (const stat of STATS) run.training[stat] += task.training[stat];
   run.task++; run.progress = 0;
   if (run.task >= d.tasks.length) {
    reward(g, run); run.index++; run.task = 0;
    if (run.index >= run.route.length) { finish(g, run, 'Route complete', 'Every dungeon in the queue is complete.'); continue; }
    if (run.elapsed >= WARP_SECONDS || g.elapsed >= DAY_SECONDS) { finish(g, run, 'Warped home', 'Time ran out before the next dungeon.'); continue; }
    const next = dungeonById(run.route[run.index]);
    if (g.guild.gear < next.gear) { finish(g, run, 'Supplies exhausted', `Not enough guild gear to enter ${next.name}.`); continue; }
    g.guild.gear -= next.gear;
   }
  }
  if (run.elapsed >= WARP_SECONDS || g.elapsed >= DAY_SECONDS) finish(g, run, 'Warped home', 'The recall ward brought this adventurer home.');
 }
 if (g.elapsed >= DAY_SECONDS) { g.phase = 'planning'; g.day++; g.elapsed = 0; }
}
export function advance(input: Game, seconds: number): Game {
 if (!Number.isInteger(seconds) || seconds < 0 || seconds > 3600) throw new Error('Advance must be 0–3600 whole seconds.');
 if (input.phase !== 'running' || !seconds) return input;
 const g = copy(input); for (let i = 0; i < seconds && g.phase === 'running'; i++) tick(g); return g;
}
export function changePriority(input: Game, priority: Game['guild']['priority']): Game { if (input.phase !== 'planning' || input.guild.priority === priority) return input; const g = copy(input); g.guild.priority = priority; g.guild.work = 0; return g; }
export function acceptCandidate(input: Game): Game { if (input.phase !== 'planning' || !input.candidate || input.members.length >= input.guild.rosterCap) return input; const g = copy(input); g.members.push(g.candidate!); g.candidate = null; return g; }
export function dismiss(input: Game, id: string): Game { if (input.phase !== 'planning') return input; const g = copy(input); g.members = g.members.filter(m => m.id !== id); return g; }
export function declineCandidate(input: Game): Game { if (input.phase !== 'planning' || !input.candidate) return input; const g = copy(input); g.candidate = null; return g; }
export function moveMember(input: Game, id: string, delta: number): Game { if (input.phase !== 'planning') return input; const g = copy(input); const i = g.members.findIndex(m => m.id === id); const j = i + delta; if (i < 0 || j < 0 || j >= g.members.length) return input; [g.members[i], g.members[j]] = [g.members[j], g.members[i]]; return g; }
export function setQueue(input: Game, id: string, queue: string[]): Game { if (input.phase !== 'planning' || queue.length > 20 || queue.some(id => !DUNGEONS.some(d => d.id === id))) return input; const g = copy(input); const m = g.members.find(m => m.id === id); if (!m) return input; m.queue = [...queue]; return g; }
export function upgradeCost(g: Game, key: Upgrade) { const n = g.guild.upgrades[key] + 1; return { gold: UPGRADE_INFO[key].gold * n, materials: UPGRADE_INFO[key].materials * n }; }
export function buyUpgrade(input: Game, key: Upgrade): Game {
 if (input.phase !== 'planning') return input;
 const cost = upgradeCost(input, key); if (input.guild.gold < cost.gold || input.guild.materials < cost.materials) return input;
 const g = copy(input); g.guild.gold -= cost.gold; g.guild.materials -= cost.materials; g.guild.upgrades[key]++;
 if (key === 'slots') g.guild.slots++; if (key === 'quarters') g.guild.rosterCap++; if (key === 'gear') g.guild.gearCap += 4; if (key === 'regen') g.guild.gearRegen += .1;
 return g;
}
