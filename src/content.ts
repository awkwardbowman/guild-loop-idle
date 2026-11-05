export const STATS = ['might', 'agility', 'focus'] as const;
export type Stat = typeof STATS[number];
export type Pools = Record<Stat, number>;
export type Task = { name: string; duration: number; cost: Pools; training: Pools };
export type Dungeon = { id: string; name: string; subtitle: string; description: string; gear: number; gold: number; accent: string; tasks: Task[]; loot: { id: string; name: string; weight: number }[] };
const p = (might: number, agility: number, focus: number): Pools => ({ might, agility, focus });
export const DUNGEONS: Dungeon[] = [
 { id: 'wood', name: 'Briarwood Trail', subtitle: 'THE OUTSKIRTS', description: 'A familiar path, a few restless creatures, and enough salvage to keep the guild going.', gear: 2, gold: 8, accent: 'green', tasks: [
  { name: 'Clear the fallen branches', duration: 3, cost: p(3,1,1), training: p(2,.5,.5) },
  { name: 'Cross the tangled ravine', duration: 3, cost: p(1,3,1), training: p(.5,2,.5) },
  { name: 'Track the woodland prowler', duration: 4, cost: p(2,2,3), training: p(1,1,2) }
 ], loot: [{ id: 'timber', name: 'Heartwood', weight: 7 }, { id: 'herb', name: 'Silverleaf', weight: 3 }] },
 { id: 'ruins', name: 'Whispering Archive', subtitle: 'THE OLD QUARTER', description: 'Read the wards. Keep a steady hand. The shelves still remember their keepers.', gear: 3, gold: 14, accent: 'blue', tasks: [
  { name: 'Decipher the outer seal', duration: 4, cost: p(1,1,5), training: p(.5,.5,3) },
  { name: 'Navigate the shifting shelves', duration: 4, cost: p(1,4,3), training: p(.5,2,2) },
  { name: 'Unbind the keeper', duration: 5, cost: p(3,2,6), training: p(1,1,4) }
 ], loot: [{ id: 'ink', name: 'Living ink', weight: 7 }, { id: 'relic', name: 'Ward fragment', weight: 3 }] },
 { id: 'quarry', name: 'Emberstone Delve', subtitle: 'BENEATH THE RIDGE', description: 'Heavy stone, narrow ledges, and a guardian that will test an unseasoned recruit.', gear: 4, gold: 22, accent: 'amber', tasks: [
  { name: 'Break through the shale', duration: 5, cost: p(7,2,1), training: p(4,1,.5) },
  { name: 'Traverse the furnace ledge', duration: 5, cost: p(4,6,2), training: p(3,3,1) },
  { name: 'Face the stone guardian', duration: 6, cost: p(9,3,4), training: p(5,1,2) }
 ], loot: [{ id: 'ore', name: 'Ember ore', weight: 8 }, { id: 'crystal', name: 'Sun crystal', weight: 2 }] }
];
export const dungeonById = (id: string) => DUNGEONS.find(d => d.id === id)!;
export const DAY_SECONDS = 86400;
export const WARP_SECONDS = 300;
export const RESET_SECONDS = 12;
export const VERSION = 3;
export type Upgrade = 'slots' | 'quarters' | 'gear' | 'regen';
export const UPGRADE_INFO: Record<Upgrade, { name: string; description: string; gold: number; materials: number }> = {
 slots: { name: 'Expedition desk', description: '+1 simultaneous expedition', gold: 24, materials: 2 },
 quarters: { name: 'Guest quarters', description: '+1 member capacity', gold: 18, materials: 1 },
 gear: { name: 'Supply racks', description: '+4 gear capacity', gold: 16, materials: 1 },
 regen: { name: 'Workshop', description: '+0.1 gear regenerated / second', gold: 20, materials: 2 }
};
