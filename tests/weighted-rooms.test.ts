import {legacyEnvelope} from './legacy-save.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,advance,startDay,recall,completeRequest,buyStorage,unlockEquipment} from '../src/engine.ts';
import {roomCheckStep,roomById,roomRewards,roomCheckCosts} from '../src/rooms.ts';
import {storageQuote,storageCap} from '../src/resources.ts';
import {parseSave,exportSave} from '../src/persistence.ts';
import {browseLearnedSkills} from '../src/skill-browser.ts';
function opening(){let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;}
test('WR06 Chips-only ordinary rooms, reserved boss scrap, and skill-gated single treasure drops',()=>{
 const passage=roomById('wood','crypt_passage').checks[0],boss=roomById('wood','crypt_guardian').checks[0],treasure=roomById('wood','crypt_cache').checks[0];assert.deepEqual(roomRewards(passage,100,30,false,()=>.99),{chips:1});assert.deepEqual(roomRewards(boss,1,1,false,()=>.99),{leather:1});assert.equal(roomRewards(treasure,1,10,false,()=>.999).herb,undefined);assert.deepEqual(roomRewards(treasure,1,10,true,()=>.999),{herb:1});assert.equal(roomRewards(treasure,1,2,true,()=>.999).herb,undefined);
});
test('WR07 request gates are fixed, atomic and shared with plot; guildmaster cannot learn the normal skill',()=>{
 let g=opening();g.progression.completed.tanner_opened={day:1,time:0};g.storage.leather.cap=50;g.guild.chips=100;g.inventory.leather=11;assert.equal(completeRequest(g,'gavin_leather_lesson',g.members[0].id),g);g.inventory.leather=12;assert.equal(completeRequest(g,'gavin_leather_lesson','guildmaster'),g);g=completeRequest(g,'gavin_leather_lesson',g.members[1].id);assert.equal(g.inventory.leather,0);assert.equal(g.requests.gavin_leather_lesson?.studentId,g.members[1].id);assert.ok(g.progression.completed.leather_crafting_learned);assert.ok(browseLearnedSkills(g.members[1]).some(s=>s.id==='leather_crafting'));assert.equal(completeRequest(g,'gavin_leather_lesson',g.members[0].id),g);g.inventory.leather=3;g=unlockEquipment(g,'leather_armor');assert.ok(g.equipment.unlocked.includes('leather_armor'));assert.deepEqual(parseSave(exportSave(g)),g);
});
test('WR08 bulk capacity charges every increasing price, Max respects budget, Chips has no storage upgrade',()=>{
 let g=opening();g.progression.completed.first_return={day:1,time:0};g.guild.chips=1000;const before=g.storage.herb.cap,quote=storageQuote(g.storage.herb,g.guild.chips,10);g=buyStorage(g,'herb',10);assert.equal(g.storage.herb.level,10);assert.equal(g.storage.herb.cap,quote.cap);assert.equal(g.guild.chips,1000-quote.price);assert.ok(g.storage.herb.cap>before);assert.equal(storageCap(g,'chips'),Infinity);assert.equal(buyStorage(g,'chips',1),g);g.guild.chips=1;assert.equal(buyStorage(g,'herb','max'),g);assert.equal(buyStorage(g,'herb',100),g);
});
test('WR09 v6 mid-room saves add skills/requests and preserve return travel, cargo and earned progress',()=>{
 const g=advance(startDay(opening()),15);g.active[0].generated={id:'crypt_guardian',index:0,work:0,attempts:0};g.active[0].roomStartedAt=0;g.active[0].roomEfficiency=1;const data=JSON.parse(exportSave(g));data.version=data.game.version=6;delete data.game.requests;for(const actor of [...data.game.members,data.game.guildmaster]){delete actor.skills.herbology;delete actor.skills.leather_crafting;}const migrated=parseSave(JSON.stringify(legacyEnvelope(data)));assert.equal(migrated.version,9);assert.equal(migrated.active[0].generated?.id,'crypt_guardian');assert.deepEqual(migrated.active[0].loot,g.active[0].loot);assert.equal(migrated.members[1].skills.herbology.discovered,true);assert.deepEqual(parseSave(exportSave(migrated)),migrated);
});

test('WR10 weighted ETA follows actual short outings without advancing the real guild',async()=>{
 const {returnETA}=await import('../src/engine.ts');let g=startDay(opening());g.members.forEach(member=>member.enabled=false);const before=structuredClone(g),eta=returnETA(g,g.active[0]);assert.ok(eta<100);assert.deepEqual(g,before);g=advance(g,eta-1);assert.ok(g.active.some(run=>run.memberId===before.active[0].memberId));g=advance(g,1);assert.ok(!g.active.some(run=>run.memberId===before.active[0].memberId));
});
