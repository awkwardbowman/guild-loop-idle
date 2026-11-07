import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {initialGame,completeStoryAction} from '../../src/engine.ts';
import {exportSave,SAVE_KEY} from '../../src/persistence.ts';
const errors=new WeakMap<object,string[]>();
test.beforeEach(async({page})=>{const collected:string[]=[];errors.set(page,collected);page.on('pageerror',error=>collected.push(error.message));});
test.afterEach(async({page})=>{expect(errors.get(page)).toEqual([]);});
function fixture(){let g=initialGame();for(const a of ['remember_history','meet_friends','found_guild'] as const)g=completeStoryAction(g,a);g.members.forEach(m=>m.enabled=false);g.progression.completed.tanner_opened={day:1,time:0};g.progression.completed.stillmere_unlocked={day:1,time:0};return g;}
async function seed(page:any,game=fixture()){
 const data=exportSave(game);await page.addInitScript(({key,data}:{key:string;data:string})=>{if(!sessionStorage.getItem('test-seeded')){localStorage.setItem(key,data);sessionStorage.setItem('test-seeded','yes');}},{key:SAVE_KEY,data});await page.goto('/');
}
async function nav(page:any,name:string){await page.getByRole('navigation',{name:'Main tabs'}).getByRole('button',{name:new RegExp(`^(?:[0-9]+ )?${name}$`)}).click();}
test('UI01 fresh opening, keyboard tabs and founding flow',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Story',exact:true})).toBeVisible();
 const goals=page.getByRole('tab',{name:'Current Goals'});await goals.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Plot'})).toBeFocused();await expect(page.getByRole('tab',{name:'Plot'})).toHaveAttribute('aria-selected','true');await page.keyboard.press('Home');await expect(goals).toBeFocused();
 for(const title of ['Your story in Emberveil','Arya and Clyde','Open the guild'])await page.getByRole('button',{name:title,exact:true}).click();
 await nav(page,'Members');await expect(page.getByRole('heading',{name:'Arya',exact:true})).toBeVisible();
 const assignments=page.getByRole('tab',{name:'Assignments'});await assignments.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Equipment'})).toBeFocused();await page.keyboard.press('End');await expect(page.getByRole('tab',{name:'Lore'})).toBeFocused();
});
test('UI02 numeric drafts are not saved until valid commit; empty, out-of-range and Escape preserve state',async({page})=>{
 await seed(page);await nav(page,'Settings');const mode=page.getByLabel('Global depth limit mode');await mode.selectOption('limited');const input=page.getByLabel('Global maximum counted room');
 await input.fill('');await input.blur();await expect(input).toHaveAttribute('aria-invalid','true');await expect(page.getByRole('alert')).toContainText('whole number');
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.dungeonDefaults.depthLimit,SAVE_KEY)).toBe(10);
 await input.fill('23');expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.dungeonDefaults.depthLimit,SAVE_KEY)).toBe(10);await input.press('Enter');
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.dungeonDefaults.depthLimit,SAVE_KEY)).toBe(23);
 await input.fill('1000001');await input.blur();await expect(input).toHaveAttribute('aria-invalid','true');await input.press('Escape');await expect(input).toHaveValue('23');
 await page.reload();await nav(page,'Settings');await expect(page.getByLabel('Global maximum counted room')).toHaveValue('23');
});
test('UI03 modal traps focus, Escape and Cancel restore trigger, confirmed reset creates new guild',async({page})=>{
 await seed(page);await nav(page,'Settings');const reset=page.getByRole('button',{name:'Reset guild',exact:true});await reset.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByRole('button',{name:'Cancel'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('button',{name:'Reset guild'})).toBeFocused();await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Cancel'})).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(reset).toBeFocused();
 await reset.click();await dialog.getByRole('button',{name:'Cancel'}).click();await expect(reset).toBeFocused();await reset.click();await dialog.getByRole('button',{name:'Reset guild'}).click();await expect(page.getByRole('heading',{name:'Story',exact:true})).toBeVisible();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.members.length,SAVE_KEY)).toBe(0);
});
test('UI04 city changes open Shop and selected navigation states agree',async({page})=>{
 await seed(page);await nav(page,'Shops');await page.getByRole('navigation',{name:'Shop sections'}).getByRole('button',{name:'Requests'}).click();await page.getByRole('navigation',{name:'Shop cities'}).getByRole('button',{name:'Stillmere'}).click();await expect(page.getByRole('navigation',{name:'Shop sections'}).getByRole('button',{name:'Shop',exact:true})).toHaveAttribute('aria-current','page');await expect(page.getByText(/Sell surplus herbs in Guild → Storage/)).toBeVisible();
});
test('UI05 hidden dungeon requirements, successful discovery, category isolation and persisted reload',async({page})=>{
 const g=fixture();g.dungeonKnowledge.wood={1:{known:['f1-normal-0'],bossCleared:false}};await seed(page,g);await nav(page,'Activities');await page.locator('.dungeon > details > summary').click();
 await expect(page.getByText('Crypt Lore',{exact:true})).toHaveCount(0);await expect(page.getByText('Unknown 90%',{exact:true}).first()).toBeVisible();await page.locator('.floor-discovery > summary').click();const floor=page.locator('.floor-discovery');await expect(floor.getByText('1/10 known',{exact:true})).toBeVisible();await floor.getByLabel('Normal',{exact:true}).uncheck();await floor.getByLabel('Boss',{exact:true}).check();await expect(floor.getByText('0/1 known',{exact:true})).toBeVisible();await expect(floor.getByText('Unknown 100%',{exact:true})).toBeVisible();await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.dungeonKnowledge.wood[1].known,SAVE_KEY)).toEqual(['f1-normal-0']);
});
for(const width of [320,375,768,1024,1440])test(`UI06 layout and accessible controls at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await seed(page);for(const name of ['Story','Guild','Members','Activities','Shops','Info','Settings']){
  await nav(page,name);if(name==='Activities'){await page.locator('.dungeon > details > summary').click();await page.locator('.floor-discovery > summary').click();}if(name==='Members')await page.getByRole('tab',{name:'Skills',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.screenshot({path:`test-results/${name.toLowerCase()}-${width}.png`,fullPage:true});
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 }
 if(width<760){await page.getByRole('button',{name:'Guild status',exact:true}).click();await expect(page.getByRole('complementary',{name:'Guild status'})).toBeVisible();await page.getByRole('button',{name:'Guild status',exact:true}).click();await page.getByRole('button',{name:'Event log',exact:true}).click();await expect(page.locator('#guild-events')).toBeVisible();const boxes=await page.locator('.tabs button').evaluateAll(buttons=>buttons.map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})));expect(boxes.every(b=>b.width>=24&&b.height>=44)).toBe(true);}
 await page.screenshot({path:`test-results/layout-${width}.png`,fullPage:true});
});
test('UI07 200% desktop zoom reflows into a full-width usable shell',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await seed(page);await page.evaluate(()=>document.documentElement.style.zoom='2');await nav(page,'Settings');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);await expect(page.getByRole('button',{name:'Reset guild',exact:true})).toBeVisible();
});

test('UI08 teaching eligibility, purchase feedback, capacity and timed sales reflect actual saved engine results',async({page})=>{
 await page.clock.install();const g=fixture();g.progression.completed.first_return={day:1,time:0};g.guild.chips=100;g.storage.leather.cap=50;g.inventory.leather=20;await seed(page,g);
 await nav(page,'Shops');await page.getByRole('navigation',{name:'Shop sections'}).getByRole('button',{name:'Requests'}).click();const student=page.getByLabel('Leather Crafting student');await expect(student).toHaveValue(g.members[1].id);await student.selectOption(g.members[0].id);await expect(page.getByRole('button',{name:'Learn Leather Crafting'})).toBeDisabled();await expect(page.getByText('The selected member needs every component Skill to learn this Composite Skill.')).toBeVisible();await student.selectOption(g.members[1].id);await page.getByRole('button',{name:'Learn Leather Crafting'}).click();await expect(page.locator('.inline-feedback')).toContainText('completed');expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.inventory.leather,SAVE_KEY)).toBe(8);
 await page.getByRole('navigation',{name:'Shop sections'}).getByRole('button',{name:'Shop',exact:true}).click();await page.locator('.shop-purchase').first().getByRole('button',{name:'Unlock',exact:true}).click();await expect(page.getByRole('status')).toContainText('unlocked for the guild');await expect(page.locator('.shop-purchase').first().getByRole('button',{name:'Unlocked'})).toBeDisabled();
 await nav(page,'Guild');await page.getByRole('navigation',{name:'Guild tabs'}).getByRole('button',{name:'Storage'}).click();await page.locator('.resource-table').getByRole('button').first().click();await expect(page.getByRole('status')).toContainText('capacity increased');const chipsBefore=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.guild.chips,SAVE_KEY);await page.getByRole('button',{name:/^Sell ·/}).first().click();await expect(page.getByRole('status').filter({hasText:'Sale started'})).toBeVisible();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.guild.chips,SAVE_KEY)).toBe(chipsBefore);await page.clock.fastForward(16000);await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.guild.chips,SAVE_KEY)).toBe(chipsBefore+1);
});
test('UI09 actual timed gameplay reveals rooms, saves floor progress, and resumes the same outing after reload',async({page})=>{
 await page.clock.install();const g=fixture();g.members[0].enabled=true;await seed(page,g);await page.clock.fastForward(24000);await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game.dungeonKnowledge.wood?.[1]?.known.length??0,SAVE_KEY)).toBeGreaterThan(0);const before=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game,SAVE_KEY);await page.reload();const after=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).game,SAVE_KEY);expect(after.dungeonKnowledge).toEqual(before.dungeonKnowledge);expect(after.active[0].floorState).toEqual(before.active[0].floorState);expect(after.seed).toBe(before.seed);await nav(page,'Activities');await page.locator('.dungeon > details > summary').click();await expect(page.locator('.dungeon .coverage').first()).not.toHaveText('0/10 known');
});
