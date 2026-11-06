import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialGame,completeStoryAction,startDay,advance} from '../src/engine.ts';
import {plotEntries} from '../src/story.ts';
import {SECTIONS,filterReports,reportSection} from '../src/sections.ts';
import {exportSave,parseSave} from '../src/persistence.ts';
test('plot unlocks produce one readable Story event each, including automatic milestones',()=>{
 let game=initialGame();
 for(const action of ['remember_history','meet_friends','found_guild'] as const)game=completeStoryAction(game,action);
 assert.ok(game.reports.some(report=>report.reason==='Unlock'&&report.detail==='Arya and Clyde'));
 const unchanged=completeStoryAction(game,'found_guild');assert.equal(unchanged,game);
 game=startDay(game);for(let seconds=0;seconds<400&&!game.progression.completed.first_return;seconds++)game=advance(game,1);assert.ok(game.progression.completed.first_return);
 for(const entry of plotEntries(game.progression))assert.ok(game.reports.some(r=>r.section==='Story'&&r.reason==='Unlock'&&r.day===entry.day&&r.time===entry.time));
 const before=game.reports.filter(r=>r.reason==='Unlock').length;
 game=completeStoryAction(game,'open_recruitment');
 assert.equal(game.reports.filter(r=>r.reason==='Unlock').length,before+1);
 assert.equal(game.reports[0].detail,'Open recruitment');
 assert.deepEqual(parseSave(exportSave(game)),game);
});
test('section filters support all, multiple, none and reports from old saves',()=>{
 const reports=[{member:'Guild',reason:'Milestone'},{member:'Rowan',reason:'Departed'},{member:'Guild',reason:'Applicant arrived'},{member:'Guild',reason:'New day'}];
 assert.deepEqual(reports.map(reportSection),['Story','Activities','Members','Guild']);
 assert.deepEqual(filterReports(reports,['Story','Members']),[reports[0],reports[2]]);
 assert.deepEqual(filterReports(reports,[]),[]);
 assert.equal(filterReports(reports,Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]).length,4);
});
test('old report saves load without section tags; invalid new tags are rejected',()=>{
 const game=initialGame();delete game.reports[0].section;
 assert.equal(parseSave(exportSave(game)).reports[0].section,undefined);
 const raw=JSON.parse(exportSave(game));raw.game.reports[0].section='Bogus';
 assert.throws(()=>parseSave(JSON.stringify(raw)),/reports/);
});
