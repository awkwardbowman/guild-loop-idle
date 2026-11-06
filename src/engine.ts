import {defaultSelections,canDungeon,canLearnComposite} from './specialization.ts';
import {REQUESTS} from './requests.ts';
import type {RequestId,RequestCompletion} from './requests.ts';
import {storageQuote,storageCap} from './resources.ts';
import type {StorageQuantity} from './resources.ts';
import {equipmentCapacity} from './equipment.ts';
import {RESOURCES,resourceById,initialStorage,storageUpgradePrice,nextStorageCap,cargoSize,difficultyAtRoom} from './resources.ts';
import {EQUIPMENT,equipmentById,equipmentBonus,carryingLimit,SHOP_CAPACITY} from './equipment.ts';
import {rollRoom,roomById,roomCheckStep,roomRewards,enduranceMaximum,enduranceDrain,roomEfficiency} from './rooms.ts';
import type {GeneratedRoom} from './rooms.ts';
import {STAT_INFO,zeroPools} from './attributes.ts';
import {travelSeconds,locationById} from './locations.ts';
import type {LocationId} from './locations.ts';
import {EVENT_TEXT} from './story.ts';
import {reportSection,isDungeonEvent} from './sections.ts';
import type {Section} from './sections.ts';
import { freshProgression, hasFeature, hasEvent, dungeonUnlocked, recordEvent, availableStoryActions, STORY_ACTIONS } from './progression.ts';
import type { Progression, StoryActionId, EventId } from './progression.ts';
import { newSkillProfile, newRoomState, stepRoom, TRAP_ROOM, checkMetrics } from './skill-system.ts';
import type { SkillProfile, RoomState, CheckActor } from './skill-system.ts';
import { DAY_SECONDS, WARP_SECONDS, RESET_SECONDS, STATS, VERSION, DUNGEONS, dungeonById, UPGRADE_INFO, SALE_VALUES, tierBudget } from './content.ts';
import type { Pools, Upgrade } from './content.ts';
export type StatValues = { current: number; max: number; affinity: number };
export type Assignment = { dungeonId: string };
export type DungeonHistory = {bestRoom:number;lastReturn:{room:number;reason:string;detail:string;day:number;time:number}|null};
export type Member = SkillProfile & { rarity:number;dungeonHistory:Record<string,DungeonHistory>;origin:'legacy'|'recruit'|'arya'|'clyde';equipped:string[];carryCapacity:number;bestRoom:number; id: string; name: string; tier: number; stats: Record<keyof Pools, StatValues>; queue: Assignment[]; queueIndex: number; cooldown: number; resetSeconds: number; enabled: boolean; runs: number };
export type Run = {recallRequestedAt:number|null;roomStartedAt:number|null;lowSkill:boolean;roomEfficiency:number|null;successfulFloorRooms:number;endurance:{current:number;max:number}; reachedRoom:number;stage: 'outbound' | 'exploring' | 'returning'; originLocationId:LocationId; destinationLocationId:LocationId; travelRemaining:number; outboundSeconds:number; returnSeconds:number; outcome:{reason:string;detail:string}|null; specializationTraining: Record<string,number>; rules: 'tasks' | 'checks' | 'rooms';generated:GeneratedRoom|null;loadout:string[];carryCapacity:number; room: RoomState | null; memberId: string; dungeonId: string; floor: number; roomLoot?:Record<string,number>; task: number; progress: number; elapsed: number; training: Pools; startMax: Pools; loot: Record<string, number>; chips: number };
export type Report = { section?: Section; day: number; time: number; member: string; reason: string; detail: string; growth: Pools;drops?:Record<string,number>;rarity?:number };
export type Trade = {id:number;locationId:LocationId;resourceId:string;quantity:number;chips:number;remaining:number;duration:number};
export type Guildmaster=SkillProfile & {id:'guildmaster';name:string;stats:Member['stats'];innateMagic:true};
export type Game = { requests:Partial<Record<RequestId,RequestCompletion>>;storage:Record<string,{cap:number;level:number}>;equipment:{unlocked:string[];capacity:number}; guildmaster:Guildmaster; homeLocationId:LocationId; trades:Trade[]; nextTradeId:number; progression: Progression; version: number; seed: number; nextId: number; day: number; elapsed: number; phase: 'planning' | 'running'; guild: { chips: number; materials: number; gear: number; gearCap: number; gearRegen: number; slots: number; rosterCap: number; priority: 'recruitment' | 'infrastructure'; work: number; upgrades: Record<Upgrade, number> }; members: Member[]; candidate: Member | null; active: Run[]; dungeonDefaults:{depthLimit:number|null;skillThreshold:number};dungeonThresholds:Partial<Record<string,number>>;dungeonLimits: Partial<Record<string, number | null>>; pinnedResources: string[]; reports: Report[]; inventory: Record<string, number>; stats: { clears: number; retreats: number; warps: number } };
export const zero=zeroPools;
const copy = <T,>(v: T): T => structuredClone(v);
function rand(g: Game) { g.seed = (Math.imul(1664525, g.seed) + 1013904223) >>> 0; return g.seed / 4294967296; }
function log(g: Game, member: string, reason: string, detail: string, growth = zero(), section:Section = reportSection({member,reason}),extra:Pick<Report,'drops'|'rarity'>={}) {
 if(section==='Activities'&&!isDungeonEvent(reason))return;
 g.reports.unshift({section,day:g.day,time:g.elapsed,member,reason,detail,growth,...extra});g.reports=g.reports.slice(0,100);
}
export function recruit(g: Game,legacy=false): Member {
 const tier = rand(g) < .22 ? 2 : 1;
 const names = ['Rowan','Mira','Bram','Sable','Tess','Orin','Jun','Wren','Iris','Ash'];
 const id = `member-${g.nextId++}`;
 const name = `${names[Math.floor(rand(g) * names.length)]} ${id.split('-')[1]}`;
 const stats = {} as Member['stats'];
 for (const stat of ['strength','dexterity','intelligence',...STATS.filter(stat=>!['strength','dexterity','intelligence'].includes(stat))] as (keyof Pools)[]) { const affinity = 35 + tier * 25 + Math.floor(rand(g) * 45); const max = 10 + Math.floor(rand(g) * 8); stats[stat] = { current: max, max, affinity }; }
 const total=STATS.reduce((sum,stat)=>sum+stats[stat].affinity,0);if(!legacy)for(const stat of STATS){const affinity=stats[stat].affinity/total*tierBudget(tier);stats[stat]={current:affinity*.8,max:affinity*.8,affinity};}
 return {rarity:0,dungeonHistory:{},origin:legacy?'legacy':'recruit',equipped:[],carryCapacity:legacy?1000000:32,bestRoom:0, ...newSkillProfile(stats), selections:defaultSelections({stats}),constitutionExperience:0, id, name, tier, stats, queue: dungeonUnlocked(g.progression,'wood')?[{ dungeonId: 'wood' }]:[], queueIndex: 0, cooldown: 0, resetSeconds: RESET_SECONDS, enabled: true, runs: 0 };
}
export function startingFriend(g:Game,who:'arya'|'clyde'):Member {
 const affinity=who==='arya'?[2,1.8,2,1.4,.8,.5,.4,.4,.7]:[.4,.7,.8,.5,1.8,1.6,1.4,1,1.8];
 const stats=Object.fromEntries(STATS.map((stat,index)=>[stat,{affinity:affinity[index],max:affinity[index]*.9,current:affinity[index]*.9}])) as Member['stats'];
 const profile=newSkillProfile(stats);
 if(who==='arya'){profile.skills.combat.level=3;profile.skills.combat.discovered=true;}
 else {profile.skills.herbology.level=2;profile.skills.herbology.discovered=true;}
 return {...profile,selections:defaultSelections({stats},who),constitutionExperience:0,rarity:0,dungeonHistory:{},origin:who,equipped:[],carryCapacity:who==='arya'?72:36,bestRoom:0,id:`member-${g.nextId++}`,name:who==='arya'?'Arya':'Clyde',tier:1,stats,queue:[],queueIndex:0,cooldown:0,resetSeconds:RESET_SECONDS,enabled:true,runs:0};
}
/** Provisional starting values; the guildmaster alone has innate magic. */
export function newGuildmaster():Guildmaster {
 const stats=Object.fromEntries(STATS.map(stat=>[stat,{current:stat==='soul'?8:.25,max:stat==='soul'?8:.25,affinity:stat==='soul'?80:2.5}])) as Member['stats'];
 return {id:'guildmaster',name:'Guildmaster',innateMagic:true,stats,...newSkillProfile(stats),selections:defaultSelections({stats},'guildmaster'),constitutionExperience:0};
}
export const canCastInnateMagic=(g:Game,actorId:string)=>actorId===g.guildmaster.id&&g.guildmaster.innateMagic;
export function initialGame(seed = 73129): Game {
 const g: Game = { requests:{},storage:initialStorage(),equipment:{unlocked:[],capacity:0},guildmaster:newGuildmaster(),homeLocationId:'emberveil',trades:[],nextTradeId:1,progression: freshProgression(), version: VERSION, seed: seed >>> 0, nextId: 1, day: 1, elapsed: 0, phase: 'planning', guild: { chips: 0, materials: 0, gear: 0, gearCap: 8, gearRegen: 0, slots: 2, rosterCap: 5, priority: 'recruitment', work: 0, upgrades: { slots: 0, quarters: 0, gear: 0, regen: 0 } }, members: [], candidate: null, active: [], dungeonDefaults:{depthLimit:null,skillThreshold:1},dungeonThresholds:{},dungeonLimits:{}, pinnedResources: ['chips','gear','materials'], reports: [], inventory: {}, stats: { clears: 0, retreats: 0, warps: 0 } };
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
 g.members[1].queue = [{dungeonId:'ruins'}]; g.members[2].queue = [{dungeonId:'quarry'}];
 g.progression.completed.guild_founded={day:1,time:0};g.progression.completed.legacy_access={day:1,time:0};g.pinnedResources=['chips','gear','materials'];
 return g;
}
export function growth(max: number, affinity: number, training: number) { return Math.max(0, Math.min(affinity - max, training * Math.max(0, 1 - max / affinity))); }
export const floorScale = (floor: number) => 1 + (floor - 1) * .2;
export const taskDuration = (run: Pick<Run,'dungeonId'|'floor'|'task'> & {rules?:Run['rules'];generated?:GeneratedRoom|null}) => run.rules==='rooms' ? (run.generated?roomById(run.dungeonId,run.generated.id).checks[run.generated.index].work*difficultyAtRoom(run.floor):1) : run.rules==='checks' ? TRAP_ROOM.checks[run.task].work*floorScale(run.floor) : Math.ceil(dungeonById(run.dungeonId).tasks[run.task].duration * floorScale(run.floor));
export function effectiveLimit(g:Game,run:{dungeonId:string}){return (Object.hasOwn(g.dungeonLimits,run.dungeonId)?g.dungeonLimits[run.dungeonId]:g.dungeonDefaults.depthLimit)??Infinity;}
export const effectiveThreshold=(g:Game,id:string)=>g.dungeonThresholds[id]??g.dungeonDefaults.skillThreshold;
function arriveHome(g: Game, run: Run, reason: string, detail: string) {
 const m = g.members.find(m => m.id === run.memberId)!;
 const gains = zero();
 for (const stat of STATS) { gains[stat] = growth(run.startMax[stat], m.stats[stat].affinity, run.training[stat]); m.stats[stat].max += gains[stat]; }
 noteEvent(g,'first_return');
 for(const [id,training]of Object.entries(run.specializationTraining)){const specialty=m.specializations[id];specialty.value+=growth(specialty.value,specialty.affinity,training);}
 if(run.rules==='rooms'&&reason!=='Injured')for(const stat of STATS)m.stats[stat].current=m.stats[stat].max;
 m.runs++; m.cooldown = run.rules==='rooms'?(reason==='Injured'?m.resetSeconds:0):m.resetSeconds; m.queueIndex = m.queue.length ? (m.queueIndex + 1) % m.queue.length : 0;
 deposit(g,'chips',run.chips);
 for(const [id,amount] of Object.entries(run.loot))deposit(g,id,amount);
 refreshDiscoveries(g);
 if (reason === 'Retreated') g.stats.retreats++;
 if (reason === 'Warped home') g.stats.warps++;
 log(g, m.name, reason==='Injured'?'Dungeon failed':reason, `${dungeonById(run.dungeonId).name} · ${detail} Banked ${run.chips} chips and ${Object.values(run.loot).reduce((a,b)=>a+b,0)} loot. Reset ${m.resetSeconds}s.`, gains);
 g.active = g.active.filter(r => r !== run);
}
function finish(g:Game,run:Run,reason:string,detail:string){
 if(run.stage==='returning')return;
 const member=g.members.find(m=>m.id===run.memberId)!;
 const history=member.dungeonHistory[run.dungeonId]??={bestRoom:0,lastReturn:null};
 const reached=run.reachedRoom;
 history.bestRoom=Math.max(history.bestRoom,reached);
 history.lastReturn={room:reached,reason,detail,day:g.day,time:g.elapsed};
 run.stage='returning';run.travelRemaining=run.returnSeconds;run.outcome={reason,detail};
 // Exploration state is no longer active; preserve carried rewards and pending training.
 run.task=0;run.progress=0;run.room=null;run.generated=null;run.roomStartedAt=null;run.lowSkill=false;run.roomEfficiency=null;delete run.roomLoot;
 if(!run.travelRemaining){arriveHome(g,run,reason,detail);return;}
 log(g,g.members.find(m=>m.id===run.memberId)!.name,'Returning',`${detail} Travel home: ${run.travelRemaining}s.`);
}
/** Departing members reserve a dungeon place; homeward travel releases it. */
export function dungeonOccupants(g:Game,id:string){return g.active.filter(run=>run.dungeonId===id&&run.stage!=='returning');}
export const memberCanDungeon=(g:Game,m:Member)=>!(hasEvent(g.progression,'friends_introduced')||hasEvent(g.progression,'room_routes_enabled'))||canDungeon(m);
export function dungeonWaiting(g:Game,id:string){return g.members.filter(member=>member.enabled&&memberCanDungeon(g,member)&&member.cooldown===0&&member.queue[0]?.dungeonId===id&&!g.active.some(run=>run.memberId===member.id));}
export function memberActivities(g:Game){
 const expeditionIds=new Set(g.active.map(run=>run.memberId));
 const expeditions=g.members.filter(member=>expeditionIds.has(member.id)).length;
 const healing=g.members.filter(member=>!expeditionIds.has(member.id)&&member.cooldown>0).length;
 // Trading/crafting currently have no assigned members. Pending sales are guild transactions.
 const queued=g.members.filter(member=>member.enabled&&memberCanDungeon(g,member)&&member.queue.length>0&&member.cooldown===0&&!expeditionIds.has(member.id)).length;
 return {expeditions,trading:0,crafting:0,healing,queued,recruits:g.candidate?1:0,idle:g.members.length-expeditions-healing-queued};
}
function dispatch(g: Game) {
 if(!hasFeature(g.progression,'activities'))return;
 for (const m of g.members) {
  if (!m.enabled || m.cooldown > 0 || !m.queue.length || g.active.some(r=>r.memberId===m.id) || g.active.length >= g.guild.slots) continue;
  const entry = m.queue[m.queueIndex % m.queue.length]; const d = dungeonById(entry.dungeonId);
  if(!dungeonUnlocked(g.progression,d.id)||dungeonOccupants(g,d.id).length>=d.maxConcurrent)continue;
  const generated=hasEvent(g.progression,'friends_introduced')||hasEvent(g.progression,'room_routes_enabled');
  if(generated&&!canDungeon(m))continue;
  if (!generated&&g.guild.gear < d.gear) continue;
  if(!generated)g.guild.gear -= d.gear;
  const startMax=zero(); for(const s of STATS) { m.stats[s].current=m.stats[s].max; startMax[s]=m.stats[s].max; }
  const rules = generated?'rooms':d.id==='ruins'&&(hasEvent(g.progression,'skill_checks_enabled')||hasEvent(g.progression,'archive_discovered'))?'checks':'tasks';
  const outboundSeconds=travelSeconds(g.homeLocationId,d.locationId),returnSeconds=travelSeconds(d.locationId,g.homeLocationId);
  const enduranceMax=generated?enduranceMaximum({...m,gear:0},m.equipped):0;
  g.active.push({recallRequestedAt:null,roomStartedAt:null,lowSkill:false,roomEfficiency:null,successfulFloorRooms:0,endurance:{current:enduranceMax,max:enduranceMax},reachedRoom:0,generated:null,loadout:[...m.equipped],carryCapacity:carryingLimit(m.carryCapacity,m.equipped),stage:outboundSeconds?'outbound':'exploring',originLocationId:g.homeLocationId,destinationLocationId:d.locationId,travelRemaining:outboundSeconds,outboundSeconds,returnSeconds,outcome:null,specializationTraining:{},rules,room:rules==='checks'?newRoomState():null,memberId:m.id,dungeonId:d.id,floor:1,task:0,progress:0,elapsed:0,training:zero(),startMax,loot:{},chips:0});
  log(g,m.name,'Departed',`${d.name} · ${outboundSeconds}s travel · target ${effectiveLimit(g,{dungeonId:d.id}) === Infinity ? 'unlimited depth' : `room ${effectiveLimit(g,{dungeonId:d.id})}`}.`);
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
 for(const m of g.members){const healing=m.cooldown>0;m.cooldown=Math.max(0,m.cooldown-1);if(healing&&m.cooldown===0)for(const stat of STATS)m.stats[stat].current=m.stats[stat].max;}
 g.guild.gear=Math.min(g.guild.gearCap,g.guild.gear+g.guild.gearRegen);
 const canWork=hasFeature(g.progression,g.guild.priority==='recruitment'?'recruitment':'infrastructure')&&(g.guild.priority!=='recruitment'||g.guildmaster.selections?.attributes.includes('charisma'));
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
  const historyMember=g.members.find(m=>m.id===run.memberId)!;
  const history=historyMember.dungeonHistory[run.dungeonId]??={bestRoom:0,lastReturn:null};
  if(run.floor<=effectiveLimit(g,run))run.reachedRoom=Math.max(run.reachedRoom,run.floor);
  history.bestRoom=Math.max(history.bestRoom,run.reachedRoom);
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
 if(!seconds)return input;
 const g=copy(input);g.phase='running';dispatch(g);for(let i=0;i<seconds;i++)tick(g);return g;
}
export function returnETA(g:Game,run:Run):number {
 if(run.stage==='returning')return run.travelRemaining;
 if(run.rules==='rooms'&&run.outboundSeconds<=30&&run.returnSeconds<=30){
  const forecast=copy(g);for(const member of forecast.members)member.enabled=false;
  for(let seconds=1;seconds<=400;seconds++){tick(forecast);if(!forecast.active.some(active=>active.memberId===run.memberId))return seconds;}
 }

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
export function recall(input:Game,id:string):Game {const g=copy(input);const r=g.active.find(r=>r.memberId===id);if(!r||r.stage==='returning')return input;if(r.rules!=='rooms'||r.stage==='outbound'||(!r.generated&&(r.floor-1)%10===0)){finish(g,r,'Recalled','Manual safe return at a full-floor boundary.');}else if(r.recallRequestedAt===null){r.recallRequestedAt=r.elapsed;}return g;}
export function changePriority(input:Game,priority:Game['guild']['priority']):Game {if(!hasFeature(input.progression,priority==='recruitment'?'recruitment':'infrastructure')||input.guild.priority===priority)return input;const g=copy(input);g.guild.priority=priority;g.guild.work=0;return g;}
export function acceptCandidate(input:Game):Game {if(!hasEvent(input.progression,'first_member_recruited')&&!hasEvent(input.progression,'legacy_access'))return input;if(!hasFeature(input.progression,'recruitment')||!input.candidate||input.members.length>=input.guild.rosterCap)return input;const g=copy(input);g.members.push(g.candidate!);if(!g.members.at(-1)!.queue.length&&dungeonUnlocked(g.progression,'wood'))g.members.at(-1)!.queue=[{dungeonId:'wood'}];g.candidate=null;for(const entry of g.members.at(-1)!.queue)log(g,g.members.at(-1)!.name,'Dungeon assignment added',dungeonById(entry.dungeonId).name,zero(),'Activities');noteEvent(g,'first_member_recruited');return g;}
export function declineCandidate(input:Game):Game {const g=copy(input);g.candidate=null;return g;}
export function dismiss(input:Game,id:string):Game {if(input.active.some(r=>r.memberId===id))return input;const g=copy(input);for(const entry of g.members.find(member=>member.id===id)?.queue??[])log(g,g.members.find(member=>member.id===id)!.name,'Dungeon assignment removed',dungeonById(entry.dungeonId).name,zero(),'Activities');g.members=g.members.filter(m=>m.id!==id);return g;}
export function moveMember(input:Game,id:string,delta:number):Game {const g=copy(input);const i=g.members.findIndex(m=>m.id===id),j=i+delta;if(i<0||j<0||j>=g.members.length)return input;[g.members[i],g.members[j]]=[g.members[j],g.members[i]];return g;}
export const validDepth=(n:unknown):n is number|null=>n===null||(typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=1000000);
export function setQueue(input:Game,id:string,queue:(Assignment & {maxDepth?:number|null})[]):Game {
 if(queue.length>1||queue.some(e=>!DUNGEONS.some(d=>d.id===e.dungeonId)||!dungeonUnlocked(input.progression,e.dungeonId)||(e.maxDepth!==undefined&&!validDepth(e.maxDepth))))return input;
 const g=copy(input),member=g.members.find(member=>member.id===id);if(!member)return input;
 const count=(entries:Assignment[],dungeonId:string)=>entries.filter(entry=>entry.dungeonId===dungeonId).length;
 for(const dungeon of DUNGEONS){const delta=count(queue,dungeon.id)-count(member.queue,dungeon.id);for(let i=0;i<Math.abs(delta);i++)log(g,member.name,delta>0?'Dungeon assignment added':'Dungeon assignment removed',dungeon.name,zero(),'Activities');}
 member.queue=queue.map(({dungeonId})=>({dungeonId}));member.queueIndex=0;return g;
}
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
  for(const member of g.members){member.queue=[{dungeonId:'wood'}];log(g,member.name,'Dungeon assignment added',dungeonById('wood').name,zero(),'Activities');}return g;
 }
 if(action.id==='revisit_catacombs'){if(g.members.length+2>g.guild.rosterCap)return input;g.members.push(startingFriend(g,'arya'),startingFriend(g,'clyde'));for(const member of g.members.filter(member=>member.origin==='arya'||member.origin==='clyde'))member.queue=[{dungeonId:'wood'}];}
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
 if(!amount)return;const stored=resourceAmount(g,id),accepted=id==='chips'?amount:Math.min(amount,Math.max(0,g.storage[id].cap-stored));
 if(id==='chips')g.guild.chips+=accepted;else if(id==='materials')g.guild.materials+=accepted;else g.inventory[id]=stored+accepted;
 if(amount>accepted)log(g,'Guild','Storage overflow',`${amount-accepted} ${resourceById(id).name} discarded: storage is full.`,zero(),'Resources');
}
function refreshDiscoveries(g:Game){
 if((g.inventory.leather??0)>0)noteEvent(g,'first_leather');if((g.inventory.herb??0)>0)noteEvent(g,'first_herb');
}
export function buyStorage(input:Game,id:string,quantity:StorageQuantity=1):Game{
 if(id==='chips'||!hasFeature(input.progression,'resources')||!RESOURCES.some(resource=>resource.id===id)||![1,10,100,'max'].includes(quantity))return input;
 const quote=storageQuote(input.storage[id],input.guild.chips,quantity);if(!quote.affordable)return input;
 const g=copy(input);g.guild.chips-=quote.price;g.storage[id]={cap:quote.cap,level:quote.level};return g;
}
export function completeRequest(input:Game,id:RequestId,studentId?:string):Game{
 const request=REQUESTS.find(request=>request.id===id);if(!request||!hasEvent(input.progression,'tanner_opened')||input.requests[id]||hasEvent(input.progression,request.event)||(input.inventory[request.resourceId]??0)<request.amount)return input;
 const student=request.skillId?input.members.find(member=>member.id===studentId&&['arya','clyde'].includes(member.origin)):undefined;
 if(request.skillId&&(!student||!canLearnComposite(student,request.skillId)))return input;
 const g=copy(input);g.inventory[request.resourceId]-=request.amount;
 if(request.skillId){const learner=g.members.find(member=>member.id===student!.id)!;learner.skills[request.skillId]={level:1,experience:0,lastUsedAt:null,discovered:true};}
 g.requests[id]={completedAt:(g.day-1)*DAY_SECONDS+g.elapsed,...(student?{studentId:student.id}:{})};noteEvent(g,request.event);return g;
}
export function unlockEquipment(input:Game,id:string):Game{
 const item=EQUIPMENT.find(item=>item.id===id);if(!item||!hasEvent(input.progression,'tanner_opened')||!hasEvent(input.progression,'leather_crafting_learned')||input.equipment.unlocked.includes(id)||input.guild.chips<item.chips||(input.inventory.leather??0)<item.leather)return input;
 const g=copy(input);g.guild.chips-=item.chips;g.inventory.leather-=item.leather;g.equipment.unlocked.push(id);log(g,'Guild','Equipment unlocked',`${item.name} is available to every member.`,zero(),'Shops');return g;
}
/** Retired compatibility API: equipment capacity now comes from ally tier. */
export function buyEquipmentCapacity(input:Game,_shop:'tanner'|'herbalist'):Game{return input;}
export function equip(input:Game,memberId:string,id:string):Game{
 const member=input.members.find(member=>member.id===memberId);if(!member||!input.equipment.unlocked.includes(id)||input.active.some(run=>run.memberId===memberId))return input;
 const removing=member.equipped.includes(id);if(!removing&&member.equipped.length>=equipmentCapacity(member))return input;
 const g=copy(input),m=g.members.find(member=>member.id===memberId)!;m.equipped=removing?m.equipped.filter(item=>item!==id):[...m.equipped,id];return g;
}
function resolvedRoom(g:Game,run:Run,skipped:boolean){
 const member=g.members.find(member=>member.id===run.memberId)!;member.bestRoom=Math.max(member.bestRoom,run.floor);g.stats.clears++;
 if(!skipped){noteEvent(g,'first_floor_cleared');if(run.dungeonId==='ruins')noteEvent(g,'archive_floor_cleared');}
 const completed=run.floor;
 run.successfulFloorRooms=skipped?0:run.successfulFloorRooms+1;
 if(completed%10===0){
  if(run.successfulFloorRooms===10)member.constitutionExperience=(member.constitutionExperience??0)+1;
  run.successfulFloorRooms=0;
 }
 run.generated=null;run.progress=0;run.roomStartedAt=null;run.lowSkill=false;run.roomEfficiency=null;
 if(completed%10===0&&run.recallRequestedAt!==null){finish(g,run,'Recalled',`Safe return after canonical floor ${completed/10}.`);return;}
 if(completed>=effectiveLimit(g,run)){finish(g,run,'Depth reached',`Room ${completed} reached.`);return;}
 run.floor++;
}
function tickGenerated(g:Game,run:Run){
 const member=g.members.find(member=>member.id===run.memberId)!;
 if(!run.generated&&run.floor>effectiveLimit(g,run)){finish(g,run,'Depth reached','Room limit reached.');return;}
 if(cargoSize(run.loot,run.chips)>=run.carryCapacity){finish(g,run,'Cargo full','Carrying capacity reached.');return;}
 run.elapsed++;
 if(!run.generated){
  run.generated=rollRoom(run.dungeonId,()=>rand(g));run.roomLoot={};
  log(g,member.name,'Room entered',`Room ${run.floor} · ${roomById(run.dungeonId,run.generated.id).name}.`);
 }
 const definition=roomById(run.dungeonId,run.generated.id),check=definition.checks[run.generated.index];
 if(run.roomStartedAt===null){
  run.roomStartedAt=run.elapsed-1;
  run.roomEfficiency=roomEfficiency({...member,gear:g.guild.gear},definition,run.loadout);
  run.lowSkill=effectiveThreshold(g,run.dungeonId)>0&&run.roomEfficiency<effectiveThreshold(g,run.dungeonId)/100;
 }
 const drain=enduranceDrain(run.floor);
 if(run.endurance.current+1e-9<drain){failGeneratedRoom(g,run,'Endurance depleted');return;}
 run.endurance.current=Math.max(0,run.endurance.current-drain);
 const result=roomCheckStep({...member,gear:g.guild.gear},check,run.generated,run.floor,run.loadout,()=>rand(g),(g.day-1)*DAY_SECONDS+g.elapsed);
 member.stats=result.actor.stats;member.skills=result.actor.skills;member.specializations=result.actor.specializations;run.generated=result.state;run.progress=result.state.work;
 if(result.outcome==='ineligible'){
  if(!definition.mandatory){log(g,member.name,'Room skipped',`${definition.name}: ${'requires '+check.skill+' level '+check.requiredLevel}.`);resolvedRoom(g,run,true);}
  else {failGeneratedRoom(g,run,`Required Composite Skill unavailable: ${check.skill}`);return;}
 }else if(result.outcome==='success'){
  for(const stat of STATS)run.training[stat]+=result.training[stat];
  for(const [id,amount]of Object.entries(result.specializationTraining))run.specializationTraining[id]=(run.specializationTraining[id]??0)+amount;
  const remaining=run.carryCapacity-cargoSize(run.loot,run.chips),canHarvest=member.skills.herbology.discovered===true;
  const rewards=roomRewards(check,run.floor,remaining,canHarvest,()=>rand(g));
  run.roomLoot??={};for(const [id,amount]of Object.entries(rewards))run.roomLoot[id]=(run.roomLoot[id]??0)+amount;
  for(const [id,amount]of Object.entries(rewards))if(id==='chips')run.chips+=amount;else run.loot[id]=(run.loot[id]??0)+amount;
  log(g,member.name,'Check succeeded',`${check.name} · ${Object.entries(rewards).map(([id,amount])=>`${amount} ${resourceById(id).name}`).join(', ')}.`);
  run.generated.index++;run.generated.work=0;run.progress=0;
  if(run.generated.index>=definition.checks.length){
   if(definition.group==='boss'||definition.group==='treasure')log(g,member.name,definition.group==='boss'?'Boss room beaten':'Treasure room cleared',`${dungeonById(run.dungeonId).name} · Room ${run.floor} · ${definition.name}`,zero(),'Activities',{drops:{...run.roomLoot},rarity:definition.rarity});
   delete run.roomLoot;resolvedRoom(g,run,false);
  }
 }
 if(g.active.includes(run)&&run.stage==='exploring'){
  if(run.generated&&run.lowSkill&&run.roomStartedAt!==null&&run.elapsed-run.roomStartedAt>=30){failGeneratedRoom(g,run,'Insufficient skill grace expired');return;}
  if(run.recallRequestedAt!==null&&run.elapsed-run.recallRequestedAt>=30){
   // Completion on the deadline is retained; an unfinished room uses its own failure.
   if(run.generated)failGeneratedRoom(g,run,'Recall timeout');
   else finish(g,run,'Interrupted','Recall timeout between rooms; partial floor, no floor XP.');
   return;
  }
  if(run.endurance.current<=1e-9){
   if(run.generated)failGeneratedRoom(g,run,'Endurance depleted');else finish(g,run,'Tired','Endurance depleted at a completed room boundary.');
   return;
  }
 }
 if(g.active.includes(run)&&run.stage==='exploring'&&run.elapsed>=WARP_SECONDS)finish(g,run,'Warped home','Exploration time limit reached.');
}

function failGeneratedRoom(g:Game,run:Run,cause:string){
 if(run.stage!=='exploring'||!run.generated)return;
 const room=roomById(run.dungeonId,run.generated.id);
 finish(g,run,room.failure==='injury'?'Injured':'Tired',`${cause} during ${room.name}; authored ${room.failure} outcome. No incomplete-room rewards.`);
}
export function setDungeonDefaults(input:Game,defaults:Game['dungeonDefaults']):Game{
 if(!hasEvent(input.progression,'guild_founded')&&!hasEvent(input.progression,'legacy_access')||!validDepth(defaults.depthLimit)||!validThreshold(defaults.skillThreshold))return input;
 const g=copy(input);g.dungeonDefaults=copy(defaults);return g;
}
export const validThreshold=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;
export function setDungeonThreshold(input:Game,id:string,value:number|undefined):Game{
 if(!DUNGEONS.some(d=>d.id===id)||!dungeonUnlocked(input.progression,id)||(value!==undefined&&!validThreshold(value)))return input;
 const g=copy(input);if(value===undefined)delete g.dungeonThresholds[id];else g.dungeonThresholds[id]=value;return g;
}
export function inheritDungeonLimit(input:Game,id:string):Game{
 if(!DUNGEONS.some(d=>d.id===id)||!dungeonUnlocked(input.progression,id))return input;
 const g=copy(input);delete g.dungeonLimits[id];return g;
}
