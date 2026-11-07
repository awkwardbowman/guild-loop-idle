import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DUNGEONS,UPGRADE_INFO} from '../src/content.ts';
import {LOCATIONS} from '../src/locations.ts';
import {RESOURCES} from '../src/resources.ts';
import {REQUESTS} from '../src/requests.ts';
import {initialGame,completeStoryAction} from '../src/engine.ts';

const source=(path:string)=>readFileSync(new URL(`../src/${path}`,import.meta.url),'utf8');
const founded=()=>{let g=initialGame();for(const action of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,action);return g;};

test('QS01 Members-page activity counts are passive; sidebar navigation still clicks',()=>{
 const main=source('main.tsx'),sidebar=source('ExpeditionSidebar.tsx'),css=source('style.css');
 assert.match(main,/<MemberActivityCounts game=\{game\}\/>/);
 assert.doesNotMatch(main,/onOpen=\{\(\)=>\{\}\}/);
 assert.match(sidebar,/onOpen\?:\(\)=>void/);
 assert.match(sidebar,/onOpen\?<button/);
 assert.match(sidebar,/className="activity-count-static"/);
 assert.match(sidebar,/<MemberActivityCounts game=\{game\} onOpen=\{onOpen\}\/>/);
 assert.match(css,/\.activity-counts \.activity-count-static/);
});

test('QS02 Info and Settings identify active navigation; Story points to actual Recall',()=>{
 const main=source('main.tsx');
 assert.match(main,/aria-current=\{activeTab==='Info'\?'page':undefined\}/);
 assert.match(main,/aria-current=\{activeTab==='Settings'\?'page':undefined\}/);
 assert.match(main,/setConfirm\('reset'\)/);
 assert.match(main,/Guild → Guild Hall → Recruitment/);
 const goalGame=founded();
 const first=completeStoryAction(goalGame,'open_recruitment'); // gated until first return
 assert.equal(first,goalGame);
 assert.match(source('story.ts'),/request Recall in Members → Assignments/);
});

test('QS03 Hollow display names are lore-only; original IDs and shop request contracts stay stable',()=>{
 assert.deepEqual(DUNGEONS.map(d=>d.id),['wood','ruins','quarry']);
 assert.equal(DUNGEONS[0].name,'Catacombs of the Wound and Wish');
 assert.equal(DUNGEONS[1].name,'Forgotten Highwoven Annex');
 assert.equal(DUNGEONS[1].subtitle,'OLD HIGHWOVEN DISTRICT');
 assert.equal(LOCATIONS.find(loc=>loc.id==='old_quarter')?.name,'Old Highwoven District');
 assert.equal(UPGRADE_INFO.slots.name,"Wayfarer's Dispatch Table");
 assert.equal(UPGRADE_INFO.quarters.name,'Guild Bunkhouse');
 assert.equal(UPGRADE_INFO.gear.name,'Reclaimed Supply Stores');
 assert.equal(UPGRADE_INFO.regen.name,'Emberveil Workroom');
 assert.match(source('ShopsPanel.tsx'),/The Loomlight Hearth/);
 for(const file of ['ShopsPanel.tsx','RequestPanel.tsx','story.ts','progression.ts','requests.ts'])assert.doesNotMatch(source(file),/Elder Ash/);
 assert.match(source('ShopsPanel.tsx'),/Oakley Ash/);
 assert.deepEqual(REQUESTS.map(req=>req.id),['gavin_leather_lesson','gavin_herb_referral']);
 assert.equal(RESOURCES.find(x=>x.id==='herb')?.tier,3);
});

test('QS04 Rarity reference distinguishes rarity classification from independent tiers',()=>{
 const help=source('MechanicsReference.tsx');
 assert.match(help,/Rarity is the broad quality class; tier ranks materials within each rarity/);
 assert.doesNotMatch(help,/<th>Tier<\/th><th>Rarity<\/th>/);
 assert.match(help,/Leather Scraps T1, Animal Hides T2 and Herbs T3/);
});
