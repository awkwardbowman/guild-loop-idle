import { freshProgression, hasFeature, hasEvent, dungeonUnlocked, recordEvent, availableStoryActions } from './progression.ts';
import type { Progression, StoryActionId, EventId } from './progression.ts';
import { newSkillProfile, newRoomState, stepRoom, TRAP_ROOM, checkMetrics } from './skill-system.ts';
import type { SkillProfile, RoomState, CheckActor } from './skill-system.ts';
import { DAY_SECONDS, WARP_SECONDS, RESET_SECONDS, STATS, VERSION, DUNGEONS, dungeonById, UPGRADE_INFO } from './content.ts';
import type { Pools, Upgrade } from './content.ts';
export type StatValues = { current: number; max: number; affinity: number };
export type Assignment = { dungeonId: string; maxDepth: number | null };
export type Member = SkillProfile & { id: string; name: string; tier: number; stats: Record<keyof Pools, StatValues>; queue: Assignment[]; queueIndex: number; cooldown: number; resetSeconds: number; enabled: boolean; runs: number };
export type Run = { specializationTraining: Record<string,number>; rules: 'tasks' | 'checks'; room: RoomState | null; memberId: string; dungeonId: string; personalLimit: number | null; floor: number; task: number; progress: number; elapsed: number; training: Pools; startMax: Pools; loot: Record<string, number>; gold: number };
export type Report = { day: number; time: number; member: string; reason: string; detail: string; growth: Pools };
export type Game = { progression: Progression; version: number; seed: number; nextId: number; day: number; elapsed: number; phase: 'planning' | 'running'; guild: { gold: number; materials: number; gear: number; gearCap: number; gearRegen: number; slots: number; rosterCap: number; priority: 'recruitment' | 'infrastructure'; work: number; upgrades: Record<Upgrade, number> }; members: Member[]; candidate: Member | null; active: Run[]; dungeonLimits: Record<string, number | null>; pinnedResources: string[]; reports: Report[]; inventory: Record<string, number>; stats: { clears: number; retreats: number; warps: number } };
export const zero = (): Pools => ({ might: 0, agility: 0, focus: 0 });
const copy = <T,>(v: T): T => structuredClone(v);
function rand(g: Game) { g.seed = (Math.imul(1664525, g.seed) + 1013904223) >>> 0; return g.seed / 4294967296; }
function log(g: Game, member: string, reason: string, detail: string, growth = zero()) { g.reports.unshift({ day: g.day, time: g.elapsed, member, reason, detail, growth }); g.reports = g.reports.slice(0, 100); }
export function recruit(g: Game): Member {
 const tier = rand(g) < .22 ? 2 : 1;
 const names = ['Rowan','Mira','Bram','Sable','Tess','Orin','Jun','Wren','Iris','Ash'];
 const id = `member-${g.nextId++}`;
 const name = `${names[Math.floor(rand(g) * names.length)]} ${id.split('-')[1]}`;
 const stats = {} as Member['stats'];
 for (const stat of STATS) { const affinity = 35 + tier * 25 + Math.floor(rand(g) * 45); const max = 10 + Math.floor(rand(g) * 8); stats[stat] = { current: max, max, affinity }; }
 return { ...newSkillProfile(stats), id, name, tier, stats, queue: dungeonUnlocked(g.progression,'wood')?[{ dungeonId: 'wood', maxDepth: 1 }]:[], queueIndex: 0, cooldown: 0, resetSeconds: RESET_SECONDS, enabled: true, runs: 0 };
}
export function initialGame(seed = 73129): Game {
 const g: Game = { progression: freshProgression(), version: VERSION, seed: seed >>> 0, nextId: 1, day: 1, elapsed: 0, phase: 'planning', guild: { gold: 12, materials: 0, gear: 8, gearCap: 8, gearRegen: .12, slots: 2, rosterCap: 5, priority: 'recruitment', work: 0, upgrades: { slots: 0, quarters: 0, gear: 0, regen: 0 } }, members: [], candidate: null, active: [], dungeonLimits: Object.fromEntries(DUNGEONS.map(d=>[d.id,null])), pinnedResources: ['gold','gear','materials'], reports: [], inventory: {}, stats: { clears: 0, retreats: 0, warps: 0 } };
 log(g, 'Story', 'A beginning', 'You and a friend are ready to build a guild.');
 g.pinnedResources=[];
 return g;
}
/** Developed-state fixture for simulation/regression tests, never used for a new player. */
export function sandboxGame(seed=73129):Game { const g=initialGame(seed);g.progression.completed.guild_founded={day:1,time:0};g.progression.completed.legacy_access={day:1,time:0};
 for (let i = 0; i < 3; i++) g.members.push(recruit(g));
 g.members[0].name = 'Rowan'; g.members[1].name = 'Mira'; g.members[2].name = 'Bram';
 g.members[0].stats.might.max = g.members[0].stats.might.current = 18;
 g.members[1].stats.focus.max = g.members[1].stats.focus.current = 20;
 g.members[1].queue = [{dungeonId:'ruins',maxDepth:1}]; g.members[2].queue = [{dungeonId:'quarry',maxDepth:1}];
 g.progression.completed.guild_founded={day:1,time:0};g.progression.completed.legacy_access={day:1,time:0};g.pinnedResources=['gold','gear','materials'];
 return g;
}
export function growth(max: number, affinity: number, training: number) { return Math.max(0, Math.min(affinity - max, training * Math.max(0, 1 - max / affinity))); }
export const floorScale = (floor: number) => 1 + (floor - 1) * .2;
export const taskDuration = (run: Pick<Run,'dungeonId'|'floor'|'task'> & {rules?:Run['rules']}) => run.rules==='checks' ? TRAP_ROOM.checks[run.task].work*floorScale(run.floor) : Math.ceil(dungeonById(run.dungeonId).tasks[run.task].duration * floorScale(run.floor));
export function effectiveLimit(g: Game, run: Pick<Run,'dungeonId'|'personalLimit'>) { return Math.min(g.dungeonLimits[run.dungeonId] ?? Infinity, run.personalLimit ?? Infinity); }
function finish(g: Game, run: Run, reason: string, detail: string) {
 const m = g.members.find(m => m.id === run.memberId)!;
 const gains = zero();
 for (const stat of STATS) { gains[stat] = growth(run.startMax[stat], m.stats[stat].affinity, run.training[stat]); m.stats[stat].max += gains[stat]; }
 noteEvent(g,'first_return');
 for(const [id,training]of Object.entries(run.specializationTraining)){const specialty=m.specializations[id];specialty.value+=growth(specialty.value,specialty.affinity,training);}
 m.runs++; m.cooldown = m.resetSeconds; m.queueIndex = m.queue.length ? (m.queueIndex + 1) % m.queue.length : 0;
 g.guild.gold += run.gold;
 for(const [id,amount] of Object.entries(run.loot)) g.inventory[id] = (g.inventory[id] ?? 0) + amount;
 if (reason === 'Retreated') g.stats.retreats++;
 if (reason === 'Warped home') g.stats.warps++;
 log(g, m.name, reason, `${detail} Banked ${run.gold} gold and ${Object.values(run.loot).reduce((a,b)=>a+b,0)} loot. Reset ${m.resetSeconds}s.`, gains);
 g.active = g.active.filter(r => r !== run);
}
function dispatch(g: Game) {
 if(!hasFeature(g.progression,'activities'))return;
 for (const m of g.members) {
  if (!m.enabled || m.cooldown > 0 || !m.queue.length || g.active.some(r=>r.memberId===m.id) || g.active.length >= g.guild.slots) continue;
  const entry = m.queue[m.queueIndex % m.queue.length]; const d = dungeonById(entry.dungeonId);
  if(!dungeonUnlocked(g.progression,d.id))continue;
  if (g.guild.gear < d.gear) continue;
  g.guild.gear -= d.gear;
  const startMax=zero(); for(const s of STATS) { m.stats[s].current=m.stats[s].max; startMax[s]=m.stats[s].max; }
  const rules = d.id==='ruins'&&(hasEvent(g.progression,'skill_checks_enabled')||hasEvent(g.progression,'archive_discovered'))?'checks':'tasks';
  g.active.push({specializationTraining:{},rules,room:rules==='checks'?newRoomState():null,memberId:m.id,dungeonId:d.id,personalLimit:entry.maxDepth,floor:1,task:0,progress:0,elapsed:0,training:zero(),startMax,loot:{},gold:0});
  log(g,m.name,'Departed',`${d.name} · target ${Math.min(g.dungeonLimits[d.id]??Infinity,entry.maxDepth??Infinity) === Infinity ? 'unlimited depth' : `floor ${Math.min(g.dungeonLimits[d.id]??Infinity,entry.maxDepth??Infinity)}`}.`);
 }
}
export function startDay(input: Game): Game { if(!hasEvent(input.progression,'guild_founded')&&!hasEvent(input.progression,'legacy_access'))return input;const g=copy(input); g.phase='running'; dispatch(g); return g; }
function reward(g: Game, run: Run) {
 const d=dungeonById(run.dungeonId); let roll=rand(g)*d.loot.reduce((a,l)=>a+l.weight,0);
 const loot=d.loot.find(l=>(roll-=l.weight)<0)??d.loot[d.loot.length-1];
 const amount=run.floor; const gold=Math.round(d.gold*floorScale(run.floor));
 run.loot[loot.id]=(run.loot[loot.id]??0)+amount; run.gold+=gold; g.stats.clears++;
 noteEvent(g,'first_floor_cleared');if(d.id==='ruins')noteEvent(g,'archive_floor_cleared');
 log(g,g.members.find(m=>m.id===run.memberId)!.name,'Floor cleared',`${d.name} F${run.floor} · carrying +${gold} gold, ${amount} ${loot.name}.`);
}
function tick(g: Game) {
 g.elapsed++; if(g.elapsed>=DAY_SECONDS) {g.elapsed=0;g.day++;log(g,'Guild','New day',`Day ${g.day}. Expeditions continue.`);}
 for(const m of g.members) m.cooldown=Math.max(0,m.cooldown-1);
 g.guild.gear=Math.min(g.guild.gearCap,g.guild.gear+g.guild.gearRegen);
 const canWork=hasFeature(g.progression,g.guild.priority==='recruitment'?'recruitment':'infrastructure');
 if(canWork&&(g.guild.priority==='infrastructure'||!g.candidate)) g.guild.work++;
 if(g.guild.work>=20) { g.guild.work-=20; if(g.guild.priority==='recruitment') {g.candidate=recruit(g);log(g,'Guild','Applicant arrived',`${g.candidate.name} is waiting.`);} else {g.guild.materials++;log(g,'Guild','Infrastructure','+1 building material.');} }
 for(const run of [...g.active]) {
  const m=g.members.find(m=>m.id===run.memberId)!;const d=dungeonById(run.dungeonId);const task=d.tasks[run.task];
  // A newly lowered global cap is applied at the next floor boundary.
  if(run.task===0&&run.progress===0&&(run.rules==='tasks'||run.room?.attempts===0)&&run.floor>effectiveLimit(g,run)) {finish(g,run,'Depth reached','Global depth limit reached.');continue;}
  run.elapsed++;
  if(run.rules==='checks') {
   const result=stepRoom({...m,gear:g.guild.gear},TRAP_ROOM,run.room!,()=>rand(g),(g.day-1)*DAY_SECONDS+g.elapsed,floorScale(run.floor));
   m.stats=result.actor.stats;m.skills=result.actor.skills;m.specializations=result.actor.specializations;g.guild.gear=result.actor.gear;run.room=result.state;
   for(const stat of STATS)run.training[stat]+=result.training[stat];
   for(const [id,amount]of Object.entries(result.specialtyTraining))run.specializationTraining[id]=(run.specializationTraining[id]??0)+amount;
   for(const detail of result.messages)log(g,m.name,'Skill check',detail);
   if(result.state.status==='bailed'){finish(g,run,'Retreated',result.state.lastOutcome??'Could not complete check.');continue;}
   if(result.state.status==='complete') {
    reward(g,run);
    if(run.floor>=effectiveLimit(g,run)){finish(g,run,'Depth reached',`${d.name} F${run.floor} completed.`);continue;}
    run.floor++;run.room=newRoomState();
   }
   run.task=run.room.index;run.progress=run.room.work;
   if(run.elapsed>=WARP_SECONDS)finish(g,run,'Warped home','Expedition time limit reached.');
   continue;
  }
  run.progress++;
  if(run.progress>=taskDuration(run)) {
   for(const s of STATS) m.stats[s].current=Math.max(0,m.stats[s].current-task.cost[s]*floorScale(run.floor));
   if(STATS.some(s=>m.stats[s].current<=0)) {finish(g,run,'Retreated',`Stat exhausted on ${d.name} F${run.floor}.`);continue;}
   for(const s of STATS) run.training[s]+=task.training[s]*floorScale(run.floor);
   run.task++;run.progress=0;
   if(run.task>=d.tasks.length) {
    reward(g,run);run.task=0;
    if(run.floor>=effectiveLimit(g,run)) {finish(g,run,'Depth reached',`${d.name} F${run.floor} completed.`);continue;}
    run.floor++;
   }
  }
  if(run.elapsed>=WARP_SECONDS) finish(g,run,'Warped home','Expedition time limit reached.');
 }
 dispatch(g);
}
export function advance(input: Game, seconds: number): Game {
 if(!Number.isInteger(seconds)||seconds<0||seconds>86400) throw Error('Advance must be 0–86400 whole seconds.');
 if(input.phase!=='running'||!seconds||(!hasEvent(input.progression,'guild_founded')&&!hasEvent(input.progression,'legacy_access')))return input;
 const g=copy(input);for(let i=0;i<seconds;i++)tick(g);return g;
}
export function returnETA(g: Game, run: Run): number {
 if(run.rules==='checks') {
  const member=g.members.find(m=>m.id===run.memberId)!;const actor={...member,gear:g.guild.gear};
  const scale=floorScale(run.floor),limit=effectiveLimit(g,run);
  let estimate=run.room?.cooldown??0;
  for(let i=run.task;i<TRAP_ROOM.checks.length;i++){const c=TRAP_ROOM.checks[i],metrics=checkMetrics(actor,c);estimate+=(c.work*scale-(i===run.task?run.progress:0))/metrics.speed/Math.max(.05,metrics.chance);}
  if(Number.isFinite(limit))estimate+=Math.max(0,limit-run.floor)*12*scale;
  else estimate=WARP_SECONDS-run.elapsed;
  return Math.max(1,Math.min(WARP_SECONDS-run.elapsed,Math.ceil(estimate)));
 }
 const current=copy(run);const m=g.members.find(m=>m.id===run.memberId)!;const pools=Object.fromEntries(STATS.map(s=>[s,m.stats[s].current])) as Pools;
 let seconds=0;
 while(current.elapsed<WARP_SECONDS) {
  if(current.task===0&&current.progress===0&&current.floor>effectiveLimit(g,current)) return seconds+1;
  const dt=Math.min(taskDuration(current)-current.progress,WARP_SECONDS-current.elapsed);seconds+=dt;current.elapsed+=dt;current.progress+=dt;
  if(current.progress<taskDuration(current))return seconds;
  const d=dungeonById(current.dungeonId);const task=d.tasks[current.task];
  for(const s of STATS)pools[s]-=task.cost[s]*floorScale(current.floor);
  if(STATS.some(s=>pools[s]<=0))return seconds;
  current.task++;current.progress=0;
  if(current.task>=d.tasks.length){if(current.floor>=effectiveLimit(g,current))return seconds;current.floor++;current.task=0;}
 }
 return seconds;
}
export function recall(input:Game,id:string):Game {const g=copy(input);const r=g.active.find(r=>r.memberId===id);if(!r)return input;finish(g,r,'Recalled','Manual safe return.');return g;}
export function changePriority(input:Game,priority:Game['guild']['priority']):Game {if(!hasFeature(input.progression,priority==='recruitment'?'recruitment':'infrastructure')||input.guild.priority===priority)return input;const g=copy(input);g.guild.priority=priority;g.guild.work=0;return g;}
export function acceptCandidate(input:Game):Game {if(!hasEvent(input.progression,'first_member_recruited')&&!hasEvent(input.progression,'legacy_access'))return input;if(!hasFeature(input.progression,'recruitment')||!input.candidate||input.members.length>=input.guild.rosterCap)return input;const g=copy(input);g.members.push(g.candidate!);if(!g.members.at(-1)!.queue.length&&dungeonUnlocked(g.progression,'wood'))g.members.at(-1)!.queue=[{dungeonId:'wood',maxDepth:1}];g.candidate=null;noteEvent(g,'first_member_recruited');return g;}
export function declineCandidate(input:Game):Game {const g=copy(input);g.candidate=null;return g;}
export function dismiss(input:Game,id:string):Game {if(input.active.some(r=>r.memberId===id))return input;const g=copy(input);g.members=g.members.filter(m=>m.id!==id);return g;}
export function moveMember(input:Game,id:string,delta:number):Game {const g=copy(input);const i=g.members.findIndex(m=>m.id===id),j=i+delta;if(i<0||j<0||j>=g.members.length)return input;[g.members[i],g.members[j]]=[g.members[j],g.members[i]];return g;}
export const validDepth=(n:unknown):n is number|null=>n===null||(typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=1000000);
export function setQueue(input:Game,id:string,queue:Assignment[]):Game {if(queue.length>20||queue.some(e=>!DUNGEONS.some(d=>d.id===e.dungeonId)||!dungeonUnlocked(input.progression,e.dungeonId)||!validDepth(e.maxDepth)))return input;const g=copy(input);const m=g.members.find(m=>m.id===id);if(!m)return input;m.queue=copy(queue);m.queueIndex=0;return g;}
export function setDungeonLimit(input:Game,id:string,depth:number|null):Game {if(!DUNGEONS.some(d=>d.id===id)||!dungeonUnlocked(input.progression,id)||!validDepth(depth))return input;const g=copy(input);g.dungeonLimits[id]=depth;return g;}
export function toggleMember(input:Game,id:string):Game {const g=copy(input);const m=g.members.find(m=>m.id===id);if(m)m.enabled=!m.enabled;return g;}
export function togglePin(input:Game,id:string):Game {if(!hasFeature(input.progression,'resources'))return input;if(!['gold','gear','materials',...DUNGEONS.flatMap(d=>d.loot.map(l=>l.id))].includes(id))return input;const g=copy(input);g.pinnedResources=g.pinnedResources.includes(id)?g.pinnedResources.filter(x=>x!==id):[...g.pinnedResources,id];return g;}
export function upgradeCost(g:Game,key:Upgrade){const n=g.guild.upgrades[key]+1;return {gold:UPGRADE_INFO[key].gold*n,materials:UPGRADE_INFO[key].materials*n};}
export function buyUpgrade(input:Game,key:Upgrade):Game {if(!hasFeature(input.progression,'infrastructure'))return input;const cost=upgradeCost(input,key);if(input.guild.gold<cost.gold||input.guild.materials<cost.materials)return input;const g=copy(input);g.guild.gold-=cost.gold;g.guild.materials-=cost.materials;g.guild.upgrades[key]++;if(key==='slots')g.guild.slots++;if(key==='quarters')g.guild.rosterCap++;if(key==='gear')g.guild.gearCap+=4;if(key==='regen')g.guild.gearRegen+=.1;return g;}
export function calendar(day:number,seconds:number){const y=Math.floor((day-1)/360)+1,month=Math.floor(((day-1)%360)/30)+1,date=((day-1)%30)+1;const pad=(n:number)=>String(n).padStart(2,'0');return {date:`${pad(date)} / ${pad(month)} / ${String(y).padStart(4,'0')}`,time:`${pad(Math.floor(seconds/3600))}:${pad(Math.floor(seconds%3600/60))}:${pad(seconds%60)}`};}

function noteEvent(g:Game,id:EventId){if(recordEvent(g.progression,id,{day:g.day,time:g.elapsed}))log(g,'Guild','Milestone',id.replaceAll('_',' '));}
export function completeStoryAction(input:Game,id:StoryActionId):Game {
 const action=availableStoryActions(input.progression).find(a=>a.id===id);if(!action)return input;
 const g=copy(input);if(action.id==='welcome_friend'){const friend=recruit(g);friend.name='Your friend';g.members.push(friend);}
 noteEvent(g,action.event);if(action.event==='trail_discovered'){for(const m of g.members)if(!m.queue.length)m.queue=[{dungeonId:'wood',maxDepth:1}];}if(action.event==='archive_discovered')noteEvent(g,'skill_checks_enabled');log(g,'Guild','Unlocked',action.title);return g;
}
export const checkActorFor=(g:Game,id:string):CheckActor|null=>{const m=g.members.find(m=>m.id===id);return m?structuredClone({...m,gear:g.guild.gear}):null;};
