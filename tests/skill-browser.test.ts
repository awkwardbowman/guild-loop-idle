import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction} from '../src/engine.ts';
import {browseLearnedSkills} from '../src/skill-browser.ts';
import {gainSkillExperience,isSkillDiscovered} from '../src/skill-system.ts';
import {roomCheckStep,roomDungeon} from '../src/rooms.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
function opening(){let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;}
test('SB01 starting skills remain hidden, failures do not discover, successful use reveals and persists',()=>{
 const g=opening();assert.deepEqual(browseLearnedSkills(g.guildmaster),[]);assert.deepEqual(browseLearnedSkills(g.members[0]).map(skill=>skill.id),['combat']);assert.deepEqual(browseLearnedSkills(g.members[1]).map(skill=>skill.id),['herbology']);
 const member=g.members[0],check=roomDungeon('wood').rooms.find(room=>room.group==='combat')!.checks[0];
 const generated={id:'crypt_scavenger',index:0,work:100,attempts:0};
 const tired=structuredClone(member);tired.stats.strength.current=0;const failed=roomCheckStep({...tired,gear:0},check,generated,1,[],()=>.999,20);assert.equal(failed.outcome,'exhausted');assert.equal(failed.actor.skills.combat.experience,0);
 const success=roomCheckStep({...member,gear:0},check,generated,1,[],()=>0,21);assert.equal(success.outcome,'success');assert.deepEqual(browseLearnedSkills(success.actor).map(skill=>skill.id),['combat']);
 g.members[0].skills=success.actor.skills;g.elapsed=21;assert.equal(browseLearnedSkills(parseSave(exportSave(g)).members[0])[0].id,'combat');
 const corrupt=JSON.parse(exportSave(g));corrupt.game.members[0].skills.combat.discovered='yes';assert.throws(()=>parseSave(JSON.stringify(corrupt)),/learned skills/);
});
test('SB02 checklist matches participating attributes, combines search and sorts learned levels',()=>{
 const member=opening().members[0];for(const id of ['combat','lock_picking','harvesting'])gainSkillExperience(member.skills[id],2,1);
 assert.deepEqual(browseLearnedSkills(member,['design']).map(skill=>skill.id),['lock_picking']);
 assert.deepEqual(browseLearnedSkills(member,['power','handiwork']).map(skill=>skill.id),['combat','harvesting']);
 assert.deepEqual(browseLearnedSkills(member,['design'],'LOCK').map(skill=>skill.id),['lock_picking']);assert.deepEqual(browseLearnedSkills(member,['design'],'combat'),[]);
 assert.deepEqual(browseLearnedSkills(member,[],'','level').map(skill=>skill.id),['combat','harvesting','lock_picking']);
 assert.deepEqual(browseLearnedSkills(member).map(skill=>skill.name),['Combat','Harvesting','Lock Picking']);
});
test('SB03 older profiles retain used skills without exposing untouched seeded starter abilities',()=>{
 const member=opening().members[0];for(const skill of Object.values(member.skills))delete skill.discovered;
 assert.deepEqual(browseLearnedSkills(member),[]);member.skills.lock_picking.lastUsedAt=3;assert.equal(browseLearnedSkills(member)[0].id,'lock_picking');
 const mastered=member.skills.combat;gainSkillExperience(mastered,1e9,5);assert.equal(mastered.experience,0);assert.equal(mastered.level,99);assert.equal(isSkillDiscovered(mastered),true);
});
