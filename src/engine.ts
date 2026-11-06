import {RESOURCES,resourceById,initialStorage,storageUpgradePrice,nextStorageCap,cargoSize,difficultyAtRoom} from './resources.ts';
import {EQUIPMENT,equipmentById,equipmentBonus,carryingLimit,SHOP_CAPACITY} from './equipment.ts';
import {rollRoom,roomById,roomExertion,roomCheckStep,roomRewards} from './rooms.ts';
import type {GeneratedRoom} from './rooms.ts';
import {STAT_INFO,zeroPools} from './attributes.ts';
import {travelSeconds,locationById} from './locations.ts';
import type {LocationId} from './locations.ts';
import {EVENT_TEXT} from './story.ts';
import {reportSection} from './sections.ts';
import type {Section} from './sections.ts';
import { freshProgression, hasFeature, hasEvent, dungeonUnlocked, recordEvent, availableStoryActions, STORY_ACTIONS } from './progression.ts';
import type { Progression, StoryActionId, EventId } from './progression.ts';
import { newSkillProfile, newRoomState, stepRoom, TRAP_ROOM, checkMetrics } from './skill-system.ts';
import type { SkillProfile, RoomState, CheckActor } from './skill-system.ts';
import { DAY_SECONDS, WARP_SECONDS, RESET_SECONDS, STATS, VERSION, DUNGEONS, dungeonById, UPGRADE_INFO, SALE_VALUES, tierBudget } from './content.ts';
import type { Pools, Upgrade } from './content.ts';
export type StatValues = { current: number; max: number; affinity: number };
export type Assignment = { dungeonId: string; maxDepth: number | null };
export type Member = SkillProfile & { origin:'legacy'|'recruit'|'arya'|'clyde';equipped:string[];carryCapacity:number;bestRoom:number; id: string; name: string; tier: number; stats: Record<keyof Pools, StatValues>; queue: Assignment[]; queueIndex: number; cooldown: number; resetSeconds: number; enabled: boolean; runs: number };
export type Run = { stage: 'outbound' | 'exploring' | 'returning'; originLocationId:LocationId; destinationLocationId:LocationId; travelRemaining:number; outboundSeconds:number; returnSeconds:number; outcome:{reason:string;detail:string}|null; specializationTraining: Record<string,number>; rules: 'tasks' | 'checks' | 'rooms';generated:GeneratedRoom|null;loadout:string[];carryCapacity:number; room: RoomState | null; memberId: string; dungeonId: string; personalLimit: number | null; floor: number; task: number; progress: number; elapsed: number; training: Pools; startMax: Pools; loot: Record<string, number>; chips: number };
export type Report = { section?: Section; day: number; time: number; member: string; reason: string; detail: string; growth: Pools };
export type Trade = {id:number;locationId:LocationId;resourceId:string;quantity:number;chips:number;remaining:number;duration:number};
export type Guildmaster=SkillProfile & {id:'guildmaster';name:string;stats:Member['stats'];innateMagic:true};
export type Game = { storage:Record<string,{cap:number;level:number}>;equipment:{unlocked:string[];capacity:number}; guildmaster:Guildmaster; homeLocationId:LocationId; trades:Trade[]; nextTradeId:number; progression: Progression; version: number; seed: number; nextId: number; day: number; elapsed: number; phase: 'planning' | 'running'; guild: { chips: number; materials: number; gear: number; gearCap: number; gearRegen: number; slots: number; rosterCap: number; priority: 'recruitment' | 'infrastructure'; work: number; upgrades: Record<Upgrade, number> }; members: Member[]; candidate: Member | null; active: Run[]; dungeonLimits: Record<string, number | null>; pinnedResources: string[]; reports: Report[]; inventory: Record<string, number>; stats: { clears: number; retreats: number; warps: number } };
export const zero=zeroPools;
const copy = <T,>(v: T): T => structuredClone(v);
function rand(g: Game) { g.seed = (Math.imul(1664525, g.seed) + 1013904223) >>> 0; return g.seed / 4294967296; }
function log(g: Game, member: string, reason: string, detail: string, growth = zero(), section:Section = reportSection({member,reason})) { g.reports.unshift({ section, day: g.day, time: g.elapsed, member, reason, detail, growth }); g.reports = g.reports.slice(0, 100); }
export function recruit(g: Game,legacy=false): Member {
 const tier = rand(g) < .22 ? 2 : 1;
 const names = ['Rowan','Mira','Bram','Sable','Tess','Orin','Jun','Wren','Iris','Ash'];
 const id = `member-${g.nextId++}`;
 const name = `${names[Math.floor(rand(g) * names.length)]} ${id.split('-')[1]}`;
 const stats = {} as Member['stats'];
 for (const stat of ['strength','dexterity','intelligence',...STATS.filter(stat=>!['strength','dexterity','intelligence'].includes(stat))] as (keyof Pools)[]) { const affinity = 35 + tier * 25 + Math.floor(rand(g) * 45); const max = 10 + Math.floor(rand(g) * 8); stats[stat] = { current: max, max, affinity }; }
 const total=STATS.reduce((sum,stat)=>sum+stats[stat].affinity,0);if(!legacy)for(const stat of STATS){const affinity=stats[stat].affinity/total*tierBudget(tier);stats[stat]={current:affinity*.8,max:affinity*.8,affinity};}
 return {origin:legacy?'legacy':'recruit',equipped:[],carryCapacity:legacy?1000000:32,bestRoom:0, ...newSkillProfile(stats), id, name, tier, stats, queue: dungeonUnlocked(g.progression,'wood')?[{ dungeonId: 'wood', maxDepth: 1 }]:[], queueIndex: 0, cooldown: 0, resetSeconds: RESET_SECONDS, enabled: true, runs: 0 };
}
export function startingFriend(g:Game,who:'arya'|'clyde'):Member {
 const affinity=who==='arya'?[2,1.8,2,1.4,.8,.5,.4,.4,.7]:[.4,.7,.8,.5,1.8,1.6,1.4,1,1.8];
 const stats=Object.fromEntries(STATS.map((stat,index)=>[stat,{affinity:affinity[index],max:affinity[index]*.9,current:affinity[index]*.9}])) as Member['stats'];
 const profile=newSkillProfile(stats);
 if(who==='arya'){profile.skills.combat.level=3;profile.skills.athletics.level=2;profile.skills.lock_picking.level=1;}
 else {profile.skills.scavenging.level=4;profile.skills.harvesting.level=2;profile.skills.observation.level=2;profile.skills.crypt_lore.level=1;}
 return {...profile,origin:who,equipped:[],carryCapacity:who==='arya'?72:36,bestRoom:0,id:`member-${g.nextId++}`,name:who==='arya'?'Arya':'Clyde',tier:1,stats,queue:[],queueIndex:0,cooldown:0,resetSeconds:RESET_SECONDS,enabled:true,runs:0};
}
/** Provisional starting values; the guildmaster alone has innate magic. */
export function newGuildmaster():Guildmaster {
 const stats=Object.fromEntries(STATS.map(stat=>[stat,{current:stat==='soul'?8:.25,max:stat==='soul'?8:.25,affinity:stat==='soul'?80:2.5}])) as Member['stats'];
 return {id:'guildmaster',name:'Guildmaster',innateMagic:true,stats,...newSkillProfile(stats)};
}
export const canCastInnateMagic=(g:Game,actorId:string)=>actorId===g.guildmaster.id&&g.guildmaster.innateMagic;
export function initialGame(seed = 73129): Game {
 const g: Game = { storage:initialStorage(),equipment:{unlocked:[],capacity:0},guildmaster:newGuildmaster(),homeLocationId:'emberveil',trades:[],nextTradeId:1,progression: freshProgression(), version: VERSION, seed: seed >>> 0, nextId: 1, day: 1, elapsed: 0, phase: 'planning', guild: { chips: 0, materials: 0, gear: 0, gearCap: 8, gearRegen: 0, slots: 2, rosterCap: 5, priority: 'recruitment', work: 0, upgrades: { slots: 0, quarters: 0, gear: 0, regen: 0 } }, members: [], candidate: null, active: [], dungeonLimits: Object.fromEntries(DUNGEONS.map(d=>[d.id,null])), pinnedResources: ['chips','gear','materials'], reports: [], inventory: {}, stats: { clears: 0, retreats: 0, warps: 0 } };
 log(g, 'Story', 'A beginning', 'A thousand years after the old legends, Emberveil is beginning to stir again. Your story starts here.');
 g.pinnedResources=[];
 return g;
}
/** Developed-state fixture for simulation/regression tests, never used for a new player. */
export function sandboxGame(seed=73129):Game { const g=initialGame(seed);g.progression.completed.guild_founded={day:1,time:0};g.progression.completed.legacy_access={day:1,time:0};
 g.guild.chips=12;g.guild.gear=8;g.guild.gearRegen=.12;for(const storage of Object.values(g.storage))storage.cap=1000000000;
 for (let i = 0; i < 3; i++) g.members.push(recruit(g,true));
 g.members[0].name = 'Rowan'; g.members[1].name = 'Mira'; g.members[2].name = 'Bram';
 g.members[0].stats.strength.max = g.members[0].stats.strength.current = 18;
 g.members[1].stats.intelligence.max = g.members[1].stats.intelligence.current = 20;
 g.members[1].queue = [{dungeonId:'ruins',maxDepth:1}]; g.members[2].queue = [{dungeonId:'quarry',maxDepth:1}];
 g.progression.completed.guild_founded={day:1,time:0};g.progression.completed.legacy_access={day:1,time:0};g.pinnedResources=['chips','gear','materials'];
 return g;
}
export function growth(max: number, affinity: number, training: number) { return Math.max(0, Math.min(affinity - max, training * Math.max(0, 1 - max / affinity))); }
export const floorScale = (floor: number) => 1 + (floor - 1) * .2;
export const taskDuration = (run: Pick<Run,'dungeonId'|'floor'|'task'> & {rules?:Run['rules'];generated?:GeneratedRoom|null}) => run.rules==='rooms' ? (run.generated?roomById(run.dungeonId,run.generated.id).checks[run.generated.index].work*difficultyAtRoom(run.floor):1) : run.rules==='checks' ? TRAP_ROOM.checks[run.task].work*floorScale(run.floor) : Math.ceil(dungeonById(run.dungeonId).tasks[run.task].duration * floorScale(run.floor));
export function effectiveLimit(g: Game, run: Pick<Run,'dungeonId'|'personalLimit'>) { return Math.min(g.dungeonLimits[run.dungeonId] ?? Infinity, run.personalLimit ?? Infinity); }
function arriveHome(g: Game, run: Run, reason: string, detail: string) {
 const m = g.members.find(m => m.id === run.memberId)!;
 const gains = zero();
 for (const stat of STATS) { gains[stat] = growth(run.startMax[stat], m.stats[stat].affinity, run.training[stat]); m.stats[stat].max += gains[stat]; }
 noteEvent(g,'first_return');
 for(const [id,training]of Object.entries(run.specializationTraining)){const specialty=m.specializations[id];specialty.value+=growth(specialty.value,specialty.affinity,training);}
 m.runs++; m.cooldown = m.resetSeconds; m.queueIndex = m.queue.length ? (m.queueIndex + 1) % m.queue.length : 0;
 deposit(g,'chips',run.chips);
 for(const [id,amount] of Object.entries(run.loot))deposit(g,id,amount);
 refreshDiscoveries(g);
 if (reason === 'Retreated') g.stats.retreats++;
 if (reason === 'Warped home') g.stats.warps++;
 log(g, m.name, reason, `${detail} Banked ${run.chips} chips and ${Object.values(run.loot).reduce((a,b)=>a+b,0)} loot. Reset ${m.resetSeconds}s.`, gains);
 g.active = g.active.filter(r => r !== run);
}
function finish(g:Game,run:Run,reason:string,detail:string){
 if(run.stage==='returning')return;
 run.stage='returning';run.travelRemaining=run.returnSeconds;run.outcome={reason,detail};
 // Exploration state is no longer active; preserve carried rewards and pending training.
 run.task=0;run.progress=0;run.room=null;run.generated=null;
 if(!run.travelRemaining){arriveHome(g,run,reason,detail);return;}
 log(g,g.members.find(m=>m.id===run.memberId)!.name,'Returning',`${detail} Travel home: ${run.travelRemaining}s.`);
}
function dispatch(g: Game) {
 if(!hasFeature(g.progression,'activities'))return;
 for (const m of g.members) {
  if (!m.enabled || m.cooldown > 0 || !m.queue.length || g.active.some(r=>r.memberId===m.id) || g.active.length >= g.guild.slots) continue;
  const entry = m.queue[m.queueIndex % m.queue.length]; const d = dungeonById(entry.dungeonId);
  if(!dungeonUnlocked(g.progression,d.id))continue;
  const generated=hasEvent(g.progression,'friends_introduced')||hasEvent(g.progression,'room_routes_enabled');
  if (!generated&&g.guild.gear < d.gear) continue;
  if(!generated)g.guild.gear -= d.gear;
  const startMax=zero(); for(const s of STATS) { m.stats[s].current=m.stats[s].max; startMax[s]=m.stats[s].max; }
  const rules = generated?'rooms':d.id==='ruins'&&(hasEvent(g.progression,'skill_checks_enabled')||hasEvent(g.progression,'archive_discovered'))?'checks':'tasks';
  const outboundSeconds=travelSeconds(g.homeLocationId,d.locationId),returnSeconds=travelSeconds(d.locationId,g.homeLocationId);
  g.active.push({generated:null,loadout:[...m.equipped],carryCapacity:carryingLimit(m.carryCapacity,m.equipped),stage:outboundSeconds?'outbound':'exploring',originLocationId:g.homeLocationId,destinationLocationId:d.locationId,travelRemaining:outboundSeconds,outboundSeconds,returnSeconds,outcome:null,specializationTraining:{},rules,room:rules==='checks'?newRoomState():null,memberId:m.id,dungeonId:d.id,personalLimit:entry.maxDepth,floor:1,task:0,progress:0,elapsed:0,training:zero(),startMax,loot:{},chips:0});
  log(g,m.name,'Departed',`${d.name} · ${outboundSeconds}s travel · target ${Math.min(g.dungeonLimits[d.id]??Infinity,entry.maxDepth??Infinity) === Infinity ? 'unlimited depth' : `room ${Math.min(g.dungeonLimits[d.id]??Infinity,entry.maxDepth??Infinity)}`}.`);
 }
}
export function startDay(input: Game): Game { if(!hasEvent(input.progression,'guild_founded')&&!hasEvent(input.progression,'legacy_access'))return input;const g=copy(input); g.phase='running'; dispatch(g); return g; }
function reward(g: Game, run: Run) {
 const d=dungeonById(run.dungeonId); let roll=rand(g)*d.loot.reduce((a,l)=>a+l.weight,0);
 const loot=d.loot.find(l=>(roll-=l.weight)<0)??d.loot[d.loot.length-1];
 const amount=run.floor; const chips=Math.round(d.chips*floorScale(run.floor));
 run.loot[loot.id]=(run.loot[loot.id]??0)+amount; run.chips+=chips; g.stats.clears++;
 noteEvent(g,'first_floor_cleared');if(d.id==='ruins')noteEvent(g,'archive_floor_cleared');
 log(g,g.members.find(m=>m.id===run.memberId)!.name,'Floor cleared',`${d.name} F${run.floor} · carrying +${chips} chips, ${amount} ${loot.name}.`);
}
function tick(g: Game) {
 g.elapsed++; if(g.elapsed>=DAY_SECONDS) {g.elapsed=0;g.day++;log(g,'Guild','New day',`Day ${g.day}. Expeditions continue.`);}
 for(const m of g.members) m.cooldown=Math.max(0,m.cooldown-1);
 g.guild.gear=Math.min(g.guild.gearCap,g.guild.gear+g.guild.gearRegen);
 const canWork=hasFeature(g.progression,g.guild.priority==='recruitment'?'recruitment':'infrastructure');
 if(canWork&&(g.guild.priority==='infrastructure'||!g.candidate)) g.guild.work++;
 if(g.guild.work>=20) { g.guild.work-=20; if(g.guild.priority==='recruitment') {g.candidate=recruit(g);log(g,'Guild','Applicant arrived',`${g.candidate.name} is waiting.`);} else {deposit(g,'materials',1);log(g,'Guild','Infrastructure','+1 building material.');} }
 for(const trade of [...g.trades]){
  trade.remaining--;
  if(trade.remaining===0){deposit(g,'chips',trade.chips);g.trades=g.trades.filter(t=>t.id!==trade.id);log(g,'Guild','Sale completed',`${trade.quantity} ${DUNGEONS.flatMap(d=>d.loot).find(item=>item.id===trade.resourceId)?.name??trade.resourceId} sold for ${trade.chips} chips.`,zero(),'Resources');}
 }
 for(const run of [...g.active]) {
  if(run.stage!=='exploring'){
   run.travelRemaining--;
   if(run.travelRemaining===0){
    if(run.stage==='returning'){arriveHome(g,run,run.outcome!.reason,run.outcome!.detail);}
    else {run.stage='exploring';log(g,g.members.find(m=>m.id===run.memberId)!.name,'Arrived',`${dungeonById(run.dungeonId).name} · exploration begins.`);}
   }
   continue;
  }
  if(run.rules==='rooms'){tickGenerated(g,run);continue;}
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
   if(STATS.some(s=>STAT_INFO[s].consumable&&m.stats[s].current<=0)) {finish(g,run,'Retreated',`Stat exhausted on ${d.name} F${run.floor}.`);continue;}
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
export function returnETA(g:Game,run:Run):number {
 if(run.stage==='returning')return run.travelRemaining;
 return (run.stage==='outbound'?run.travelRemaining:0)+explorationETA(g,run)+run.returnSeconds;
}
function explorationETA(g: Game, run: Run): number {
 if(run.rules==='rooms'){return Math.max(1,WARP_SECONDS-run.elapsed);}
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
  if(STATS.some(s=>STAT_INFO[s].consumable&&pools[s]<=0))return seconds;
  current.task++;current.progress=0;
  if(current.task>=d.tasks.length){if(current.floor>=effectiveLimit(g,current))return seconds;current.floor++;current.task=0;}
 }
 return seconds;
}
export function recall(input:Game,id:string):Game {const g=copy(input);const r=g.active.find(r=>r.memberId===id);if(!r||r.stage==='returning')return input;finish(g,r,'Recalled','Manual safe return.');return g;}
export function changePriority(input:Game,priority:Game['guild']['priority']):Game {if(!hasFeature(input.progression,priority==='recruitment'?'recruitment':'infrastructure')||input.guild.priority===priority)return input;const g=copy(input);g.guild.priority=priority;g.guild.work=0;return g;}
export function acceptCandidate(input:Game):Game {if(!hasEvent(input.progression,'first_member_recruited')&&!hasEvent(input.progression,'legacy_access'))return input;if(!hasFeature(input.progression,'recruitment')||!input.candidate||input.members.length>=input.guild.rosterCap)return input;const g=copy(input);g.members.push(g.candidate!);if(!g.members.at(-1)!.queue.length&&dungeonUnlocked(g.progression,'wood'))g.members.at(-1)!.queue=[{dungeonId:'wood',maxDepth:1}];g.candidate=null;noteEvent(g,'first_member_recruited');return g;}
export function declineCandidate(input:Game):Game {const g=copy(input);g.candidate=null;return g;}
export function dismiss(input:Game,id:string):Game {if(input.active.some(r=>r.memberId===id))return input;const g=copy(input);g.members=g.members.filter(m=>m.id!==id);return g;}
export function moveMember(input:Game,id:string,delta:number):Game {const g=copy(input);const i=g.members.findIndex(m=>m.id===id),j=i+delta;if(i<0||j<0||j>=g.members.length)return input;[g.members[i],g.members[j]]=[g.members[j],g.members[i]];return g;}
export const validDepth=(n:unknown):n is number|null=>n===null||(typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=1000000);
export function setQueue(input:Game,id:string,queue:Assignment[]):Game {if(queue.length>20||queue.some(e=>!DUNGEONS.some(d=>d.id===e.dungeonId)||!dungeonUnlocked(input.progression,e.dungeonId)||!validDepth(e.maxDepth)))return input;const g=copy(input);const m=g.members.find(m=>m.id===id);if(!m)return input;m.queue=copy(queue);m.queueIndex=0;return g;}
export function setDungeonLimit(input:Game,id:string,depth:number|null):Game {if(!DUNGEONS.some(d=>d.id===id)||!dungeonUnlocked(input.progression,id)||!validDepth(depth))return input;const g=copy(input);g.dungeonLimits[id]=depth;return g;}
export function toggleMember(input:Game,id:string):Game {const g=copy(input);const m=g.members.find(m=>m.id===id);if(m)m.enabled=!m.enabled;return g;}
export function togglePin(input:Game,id:string):Game {if(!hasFeature(input.progression,'resources'))return input;if(!['gear',...RESOURCES.map(resource=>resource.id)].includes(id))return input;const g=copy(input);g.pinnedResources=g.pinnedResources.includes(id)?g.pinnedResources.filter(x=>x!==id):[...g.pinnedResources,id];return g;}
export function upgradeCost(g:Game,key:Upgrade){const n=g.guild.upgrades[key]+1;return {chips:UPGRADE_INFO[key].chips*n,materials:UPGRADE_INFO[key].materials*n};}
export function buyUpgrade(input:Game,key:Upgrade):Game {if(!hasFeature(input.progression,'infrastructure'))return input;const cost=upgradeCost(input,key);if(input.guild.chips<cost.chips||input.guild.materials<cost.materials)return input;const g=copy(input);g.guild.chips-=cost.chips;g.guild.materials-=cost.materials;g.guild.upgrades[key]++;if(key==='slots')g.guild.slots++;if(key==='quarters')g.guild.rosterCap++;if(key==='gear')g.guild.gearCap+=4;if(key==='regen')g.guild.gearRegen+=.1;return g;}
export function calendar(day:number,seconds:number){const y=Math.floor((day-1)/360)+1,month=Math.floor(((day-1)%360)/30)+1,date=((day-1)%30)+1;const pad=(n:number)=>String(n).padStart(2,'0');return {date:`${pad(date)} / ${pad(month)} / ${String(y).padStart(4,'0')}`,time:`${pad(Math.floor(seconds/3600))}:${pad(Math.floor(seconds%3600/60))}:${pad(seconds%60)}`};}

function noteEvent(g:Game,id:EventId){
 if(!recordEvent(g.progression,id,{day:g.day,time:g.elapsed}))return;
 // Archive discovery already describes its skill unlock in the same plot entry.
 if(id==='skill_checks_enabled'&&hasEvent(g.progression,'archive_discovered')&&!hasEvent(g.progression,'legacy_access'))return;
 log(g,'Story','Unlock',STORY_ACTIONS.find(a=>a.event===id)?.title??EVENT_TEXT[id].title,zero(),'Story');
}
export function completeStoryAction(input:Game,id:StoryActionId):Game {
 const action=availableStoryActions(input.progression,input.inventory).find(a=>a.id===id);if(!action)return input;
 const g=copy(input);
 if(action.id==='found_guild'){
  g.members.push(startingFriend(g,'arya'),startingFriend(g,'clyde'));noteEvent(g,action.event);noteEvent(g,'first_member_recruited');noteEvent(g,'trail_discovered');
  for(const member of g.members)member.queue=[{dungeonId:'wood',maxDepth:null}];return g;
 }
 if(action.id==='revisit_catacombs'){if(g.members.length+2>g.guild.rosterCap)return input;g.members.push(startingFriend(g,'arya'),startingFriend(g,'clyde'));for(const member of g.members.filter(member=>member.origin==='arya'||member.origin==='clyde'))member.queue=[{dungeonId:'wood',maxDepth:null}];}
 noteEvent(g,action.event);if(action.event==='archive_discovered')noteEvent(g,'skill_checks_enabled');return g;
}
export const checkActorFor=(g:Game,id:string):CheckActor|null=>{const m=g.members.find(m=>m.id===id);return m?structuredClone({...m,gear:g.guild.gear}):null;};

/** Items are committed immediately; sale proceeds arrive only after the trade timer. */
export function sellResource(input:Game,resourceId:string,quantity:number):Game {
 if(!hasFeature(input.progression,'resources')||(!hasEvent(input.progression,'legacy_access')&&(!hasEvent(input.progression,'tanner_opened')||(resourceId==='herb'&&!hasEvent(input.progression,'stillmere_unlocked'))))||!Number.isSafeInteger(quantity)||quantity<=0||!Object.hasOwn(SALE_VALUES,resourceId)||(input.inventory[resourceId]??0)<quantity||input.trades.length>=100)return input;
 const chips=SALE_VALUES[resourceId]*quantity;if(!Number.isSafeInteger(chips)||chips>1e9)return input;
 const g=copy(input),duration=locationById(g.homeLocationId).tradeSeconds;
 g.inventory[resourceId]-=quantity;
 g.trades.push({id:g.nextTradeId++,locationId:g.homeLocationId,resourceId,quantity,chips,remaining:duration,duration});
 log(g,'Guild','Trade started',`${quantity} ${DUNGEONS.flatMap(d=>d.loot).find(item=>item.id===resourceId)?.name??resourceId} committed · ${chips} chips in ${duration}s.`,zero(),'Resources');
 return g;
}
export function runStageLabel(run:Run):string {
 return run.stage==='outbound'?'Travelling to dungeon':run.stage==='returning'?'Travelling home':'Exploring';
}
export function runProgress(run:Run):{value:number;max:number} {
 return run.stage==='exploring'?{value:run.progress,max:taskDuration(run)}:{value:(run.stage==='outbound'?run.outboundSeconds:run.returnSeconds)-run.travelRemaining,max:run.stage==='outbound'?run.outboundSeconds:run.returnSeconds};
}

export function resourceAmount(g:Game,id:string):number{return id==='chips'?g.guild.chips:id==='materials'?g.guild.materials:g.inventory[id]??0;}
function deposit(g:Game,id:string,amount:number){
 if(!amount)return;const stored=resourceAmount(g,id),accepted=Math.min(amount,Math.max(0,g.storage[id].cap-stored));
 if(id==='chips')g.guild.chips+=accepted;else if(id==='materials')g.guild.materials+=accepted;else g.inventory[id]=stored+accepted;
 if(amount>accepted)log(g,'Guild','Storage overflow',`${amount-accepted} ${resourceById(id).name} discarded: storage is full.`,zero(),'Resources');
}
function refreshDiscoveries(g:Game){
 if((g.inventory.leather??0)>0)noteEvent(g,'first_leather');if((g.inventory.herb??0)>0)noteEvent(g,'first_herb');
}
export function buyStorage(input:Game,id:string):Game{
 if(!hasFeature(input.progression,'resources')||!RESOURCES.some(resource=>resource.id===id))return input;
 const storage=input.storage[id],price=storageUpgradePrice(storage.level);if(!Number.isSafeInteger(price)||input.guild.chips<price||storage.level>=100)return input;
 const g=copy(input);g.guild.chips-=price;g.storage[id]={cap:nextStorageCap(storage.cap),level:storage.level+1};return g;
}
export function unlockEquipment(input:Game,id:string):Game{
 const item=EQUIPMENT.find(item=>item.id===id);if(!item||!hasEvent(input.progression,'tanner_opened')||input.equipment.unlocked.includes(id)||input.guild.chips<item.chips||(input.inventory.leather??0)<item.leather)return input;
 const g=copy(input);g.guild.chips-=item.chips;g.inventory.leather-=item.leather;g.equipment.unlocked.push(id);log(g,'Guild','Equipment unlocked',`${item.name} is available to every member.`,zero(),'Shops');return g;
}
export function buyEquipmentCapacity(input:Game,shop:'tanner'|'herbalist'):Game{
 if(!hasEvent(input.progression,shop==='tanner'?'tanner_opened':'stillmere_unlocked')||input.equipment.capacity>=SHOP_CAPACITY[shop])return input;
 const price=4*2**input.equipment.capacity;if(input.guild.chips<price)return input;
 const g=copy(input);g.guild.chips-=price;g.equipment.capacity++;return g;
}
export function equip(input:Game,memberId:string,id:string):Game{
 const member=input.members.find(member=>member.id===memberId);if(!member||!input.equipment.unlocked.includes(id)||input.active.some(run=>run.memberId===memberId))return input;
 const removing=member.equipped.includes(id);if(!removing&&member.equipped.length>=input.equipment.capacity)return input;
 const g=copy(input),m=g.members.find(member=>member.id===memberId)!;m.equipped=removing?m.equipped.filter(item=>item!==id):[...m.equipped,id];return g;
}
function resolvedRoom(g:Game,run:Run,skipped:boolean){
 const member=g.members.find(member=>member.id===run.memberId)!;member.bestRoom=Math.max(member.bestRoom,run.floor);g.stats.clears++;
 if(!skipped){noteEvent(g,'first_floor_cleared');if(run.dungeonId==='ruins')noteEvent(g,'archive_floor_cleared');}
 const completed=run.floor;run.generated=null;run.progress=0;
 if(completed>=effectiveLimit(g,run)){finish(g,run,'Depth reached',`Room ${completed} reached.`);return;}
 run.floor++;
}
function tickGenerated(g:Game,run:Run){
 const member=g.members.find(member=>member.id===run.memberId)!;
 if(run.floor>effectiveLimit(g,run)){finish(g,run,'Depth reached','Room limit reached.');return;}
 if(cargoSize(run.loot,run.chips)>=run.carryCapacity){finish(g,run,'Cargo full','Carrying capacity reached.');return;}
 run.elapsed++;
 if(!run.generated){
  const exertion=roomExertion(run.floor,run.loadout);
  if(member.stats.constitution.current<=exertion){finish(g,run,'Retreated',`Too tired to enter room ${run.floor}.`);return;}
  member.stats.constitution.current-=exertion;run.generated=rollRoom(run.dungeonId,()=>rand(g));
  log(g,member.name,'Room entered',`Room ${run.floor} · ${roomById(run.dungeonId,run.generated.id).name}.`);
 }
 const definition=roomById(run.dungeonId,run.generated.id),check=definition.checks[run.generated.index];
 const result=roomCheckStep({...member,gear:g.guild.gear},check,run.generated,run.floor,run.loadout,()=>rand(g),(g.day-1)*DAY_SECONDS+g.elapsed);
 member.stats=result.actor.stats;member.skills=result.actor.skills;member.specializations=result.actor.specializations;run.generated=result.state;run.progress=result.state.work;
 if(result.outcome==='exhausted'){finish(g,run,'Retreated',`Cannot fund ${check.name}.`);return;}
 if(result.outcome==='ineligible'||result.outcome==='failed'){
  if(!definition.mandatory){log(g,member.name,'Room skipped',`${definition.name}: ${result.outcome==='ineligible'?'requires '+check.skill+' level '+check.requiredLevel:'check failed'}.`);resolvedRoom(g,run,true);}
  else if(result.outcome==='ineligible'){finish(g,run,'Retreated',`Required skill missing: ${check.skill}.`);return;}
  else log(g,member.name,'Retrying',`${check.name}: failed; trying again.`);
 }else if(result.outcome==='success'){
  for(const stat of STATS)run.training[stat]+=result.training[stat];
  for(const [id,amount]of Object.entries(result.specializationTraining))run.specializationTraining[id]=(run.specializationTraining[id]??0)+amount;
  const remaining=run.carryCapacity-cargoSize(run.loot,run.chips),canHarvest=member.skills.harvesting.level>=1;
  const rewards=roomRewards(check,run.floor,remaining,canHarvest,()=>rand(g));
  for(const [id,amount]of Object.entries(rewards))if(id==='chips')run.chips+=amount;else run.loot[id]=(run.loot[id]??0)+amount;
  log(g,member.name,'Check succeeded',`${check.name} · ${Object.entries(rewards).map(([id,amount])=>`${amount} ${resourceById(id).name}`).join(', ')}.`);
  run.generated.index++;run.generated.work=0;run.progress=0;
  if(run.generated.index>=definition.checks.length)resolvedRoom(g,run,false);
 }
 if(g.active.includes(run)&&run.stage==='exploring'&&run.elapsed>=WARP_SECONDS)finish(g,run,'Warped home','Exploration time limit reached.');
}
