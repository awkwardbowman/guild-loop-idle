import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,startingFriend,recruit,completeStoryAction,startDay,advance,buyStorage,unlockEquipment,buyEquipmentCapacity,equip,sellResource,recall,resourceAmount,completeRequest} from '../src/engine.ts';
import {STATS,tierBudget} from '../src/content.ts';
import {ROOM_DUNGEONS,roomDungeon,rollRoom,roomCheckStep,roomById,validateRoomDungeon} from '../src/rooms.ts';
import {rollLoot,cargoSize,rarityWeight,storageUpgradePrice,nextStorageCap,RESOURCES} from '../src/resources.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
import {visibleTabs,availableStoryActions} from '../src/progression.ts';
const found=(seed=1)=>{let game=initialGame(seed);for(const action of ['remember_history','meet_friends','found_guild'] as const)game=completeStoryAction(game,action);return game;};
function oneTrip(seed:number,name:string,maxed=false,armor=false){let game=found(seed);const member=game.members.find(member=>member.name===name)!;for(const other of game.members)other.enabled=other.id===member.id;
 if(maxed)for(const stat of STATS)member.stats[stat].max=member.stats[stat].current=member.stats[stat].affinity;
 if(armor){game.equipment={capacity:1,unlocked:['reinforced_armor']};member.equipped=['reinforced_armor'];}
 game=startDay(game);game.members.find(other=>other.id===member.id)!.enabled=false;
 for(let tick=0;tick<350&&game.members.find(other=>other.id===member.id)!.runs===0;tick++)game=advance(game,1);return game;
}
test('O01 fixed friends are reproducible with starting totals <=10 and tier potential 10^tier',()=>{
 const game=found(1),other=found(999);assert.deepEqual(game.members,other.members);assert.deepEqual(game.members.map(member=>member.name),['Arya','Clyde']);
 for(const member of game.members){assert.ok(STATS.reduce((sum,stat)=>sum+member.stats[stat].max,0)<=10);assert.ok(Math.abs(STATS.reduce((sum,stat)=>sum+member.stats[stat].affinity,0)-10)<1e-9);assert.ok(Object.values(member.skills).every(skill=>skill.level<=5));}
 assert.equal(tierBudget(1),10);assert.equal(tierBudget(2),100);assert.equal(tierBudget(3),1000);
 for(let i=0;i<100;i++){const member=recruit(game);assert.ok(Math.abs(STATS.reduce((sum,stat)=>sum+member.stats[stat].affinity,0)-tierBudget(member.tier))<1e-7);}
 assert.equal(game.guild.gearRegen,0);
});
test('O02 weighted resource costs keep starter outings short without a generic Constitution drain',()=>{
 for(let seed=1;seed<=12;seed++){const clyde=oneTrip(seed,'Clyde',true),arya=oneTrip(seed,'Arya',true);assert.ok(clyde.members[1].bestRoom<=10);assert.ok(arya.members[0].bestRoom<=10);assert.equal(clyde.members[1].runs,1);assert.equal(arya.members[0].runs,1);}
});

test('O03 weighted category and within-category selection remain separate; trap multiplier doubles relative weight',()=>{
 const route=roomDungeon('wood');assert.equal(route.groups.neutral,5);assert.equal(route.groups.combat,5);
 let calls=0;const selected=rollRoom('wood',()=>{calls++;return .01;});assert.equal(calls,2);assert.equal(roomById('wood',selected.id).group,'neutral');
 const random=(seed:number)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let ordinary=0,doubled=0;const a=random(4),b=random(4);for(let i=0;i<10000;i++){if(roomById('wood',rollRoom('wood',a).id).group==='trap')ordinary++;if(roomById('wood',rollRoom('wood',b,{trap:2}).id).group==='trap')doubled++;}
 assert.ok(doubled>ordinary*1.5);for(const dungeon of ROOM_DUNGEONS)validateRoomDungeon(dungeon);
 const bad=structuredClone(route);bad.groups.trap=-1;assert.throws(()=>validateRoomDungeon(bad));
});
test('O04 budget rolls re-evaluate eligible sizes after every draw and always retain the Chips fallback',()=>{
 const table=[{id:'leather',weight:5},{id:'herb',weight:1}],rolls=[.3,.3,.99,.99];let index=0;
 const leather=rollLoot(table,4,1,()=>rolls[index++]);assert.equal(leather.herb??0,0);assert.equal(cargoSize(leather),4);
 index=0;const herb=rollLoot(table,4,1,()=>index++===0?.999:0);assert.deepEqual(herb,{herb:1,chips:1});
 assert.deepEqual(rollLoot([],4,1,()=>.5),{chips:4});assert.equal(rarityWeight(1,0,100),1);assert.ok(rarityWeight(1,2,20)>rarityWeight(1,2,1));
 assert.deepEqual(rollLoot([{id:'herb',weight:100}],2,50,()=>.9),{chips:2});
});
test('O05 herbs require authored Herbology; no Perception threshold or random success gate',()=>{
 const game=found(),check=roomById('wood','crypt_garden').checks[0],state={id:'crypt_garden',index:0,work:0,attempts:0};
 assert.equal(roomCheckStep({...game.members[0],gear:0},check,state,1,[],()=>0,1).outcome,'ineligible');
 const result=roomCheckStep({...game.members[1],gear:0},check,state,1,[],()=>{throw Error('No success roll');},1);assert.equal(result.outcome,'success');assert.equal(result.actor.skills.herbology.experience,2);
});

test('O06 optional missing skills skip; mandatory checks progress deterministically and resource shortages stop them',()=>{
 let game=startDay(found());game.members.forEach(member=>member.enabled=false);game=advance(game,15);const run=game.active[0];run.generated={id:'crypt_garden',index:0,work:0,attempts:0};game=advance(game,1);assert.equal(game.active[0].floor,2);
 const check=roomById('wood','crypt_scavenger').checks[0],member=found().members[0];const result=roomCheckStep({...member,gear:0},check,{id:'crypt_scavenger',index:0,work:0,attempts:0},1,[],()=>{throw Error('No success roll');},1);assert.equal(result.outcome,'success');result.actor.stats.strength.current=.001;assert.equal(roomCheckStep(result.actor,check,result.state,1,[],()=>0,2).outcome,'exhausted');
});

test('O07 returned cargo respects each cap, logs discarded overflow and never deposits twice',()=>{
 let game=startDay(found());game.members.forEach(member=>member.enabled=false);const member=game.members[0];game=recall(game,member.id);const run=game.active.find(run=>run.memberId===member.id)!;run.loot={leather:20};run.chips=100;game.storage.leather.cap=3;game.storage.chips.cap=2;
 game=advance(game,15);assert.equal(game.inventory.leather,3);assert.equal(game.guild.chips,100);assert.ok(game.reports.some(report=>report.reason==='Storage overflow'&&report.detail.includes('Leather Scraps')));assert.ok(game.progression.completed.first_leather);
 assert.deepEqual(parseSave(exportSave(game)),game);const once=game.guild.chips;game=advance(game,1);assert.equal(game.guild.chips,once);
});
test('O08 Gavin requests use fixed starter quantities, consume herbs and unlock Elder Ash once',()=>{
 let game=found();game.progression.completed.first_leather={day:1,time:0};game=completeStoryAction(game,'open_tanner');assert.ok(visibleTabs(game.progression).includes('Shops'));game.inventory.herb=1;assert.equal(completeRequest(game,'gavin_herb_referral'),game);game.inventory.herb=5;game=completeRequest(game,'gavin_herb_referral');assert.equal(game.inventory.herb,0);assert.ok(game.progression.completed.stillmere_unlocked);assert.equal(completeRequest(game,'gavin_herb_referral'),game);
});

test('O09 a chosen ally learns Leather Crafting before shared purchases; equipment capacity equals ally tier',()=>{
 let game=found();game.progression.completed.tanner_opened={day:1,time:0};game.guild.chips=80;game.inventory.leather=12;assert.equal(unlockEquipment(game,'leather_armor'),game);assert.equal(completeRequest(game,'gavin_leather_lesson','guildmaster'),game);game=completeRequest(game,'gavin_leather_lesson',game.members[1].id);assert.equal(game.inventory.leather,0);assert.equal(game.members[1].skills.leather_crafting.level,1);game.inventory.leather=12;game=unlockEquipment(game,'leather_armor');game=unlockEquipment(game,'leather_pack');for(const member of game.members)game=equip(game,member.id,'leather_armor');assert.ok(game.members.every(member=>member.equipped.length===1));assert.equal(equip(game,game.members[0].id,'leather_pack'),game);game.members[0].tier=2;game=equip(game,game.members[0].id,'leather_pack');assert.equal(game.members[0].equipped.length,2);assert.equal(buyEquipmentCapacity(game,'tanner'),game);assert.deepEqual(parseSave(exportSave(game)),game);
});

test('O10 storage upgrades charge Chips and increase only the selected resource cap',()=>{
 let game=oneTrip(1,'Arya');game.guild.chips=40;const original=game.storage.herb.cap,other=game.storage.leather.cap,price=storageUpgradePrice(game.storage.herb.level);game=buyStorage(game,'herb');assert.equal(game.guild.chips,40-price);assert.equal(game.storage.herb.cap,nextStorageCap(original));assert.equal(game.storage.leather.cap,other);assert.equal(game.storage.herb.level,1);assert.deepEqual(parseSave(exportSave(game)),game);
});
test('O11 mid-room rolls, partial work and both cargo/trade timers resume deterministically',()=>{
 let game=startDay(found(7));game=advance(game,33);const restored=parseSave(exportSave(game));assert.deepEqual(advance(restored,100),advance(game,100));
});
test('O12 malformed storage, room indexes, equipment ownership, tier budgets and carry snapshots reject imports',()=>{
 const game=advance(startDay(found()),16);for(const mutate of [(g:any)=>g.storage.herb.cap=0,(g:any)=>g.equipment.unlocked=['missing'],(g:any)=>g.members[0].stats.strength.affinity=100,(g:any)=>g.active[0].generated.index=99,(g:any)=>g.active[0].carryCapacity=-1]){const data=JSON.parse(exportSave(game));mutate(data.game);assert.throws(()=>parseSave(JSON.stringify(data)));}
});

test('O13 a real released v5 save migrates Gold balances, pending sales and pins to Chips without resetting trips',async()=>{
 const {readFile}=await import('node:fs/promises');const raw=JSON.parse(await readFile(new URL('./fixtures/v5-active.json',import.meta.url),'utf8'));
 raw.game.trades=[{id:1,locationId:'emberveil',resourceId:'timber',quantity:2,gold:2,remaining:8,duration:15}];raw.game.nextTradeId=2;
 const seed=raw.game.seed,balance=raw.game.guild.gold,active=raw.game.active.map((run:any)=>({memberId:run.memberId,stage:run.stage,floor:run.floor,progress:run.progress,travelRemaining:run.travelRemaining}));
 const game=parseSave(JSON.stringify(raw));assert.equal(game.guild.chips,balance);assert.equal(game.seed,seed);assert.equal(game.trades[0].chips,2);assert.equal(game.trades[0].remaining,8);assert.ok(game.pinnedResources.includes('chips'));assert.ok(!('gold' in game.guild));assert.deepEqual(game.active.map(run=>({memberId:run.memberId,stage:run.stage,floor:run.floor,progress:run.progress,travelRemaining:run.travelRemaining})),active);assert.ok(game.members.every(member=>member.origin==='legacy'));assert.deepEqual(parseSave(exportSave(game)),game);
});
test('O14 seeded opening reaches teaching, equips Clyde and refers to Elder Ash with consumed herbs',()=>{
 let game=startDay(found(73129));for(let seconds=0;seconds<5000&&!game.progression.completed.stillmere_unlocked;seconds+=10){game=advance(game,10);game=completeStoryAction(game,'open_tanner');game=completeRequest(game,'gavin_leather_lesson',game.members[1].id);game=completeRequest(game,'gavin_herb_referral');game=unlockEquipment(game,'leather_armor');const clyde=game.members[1];if(game.equipment.unlocked.includes('leather_armor')&&!clyde.equipped.length)game=equip(game,clyde.id,'leather_armor');}
 assert.ok(game.progression.completed.stillmere_unlocked);assert.ok(game.progression.completed.leather_crafting_learned);assert.equal(game.inventory.herb,0);assert.equal(game.members[1].skills.leather_crafting.discovered,true);assert.equal(game.members[0].skills.herbology.discovered,false);assert.deepEqual(parseSave(exportSave(game)),game);
});
