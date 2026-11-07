import {readFileSync} from 'node:fs';
import {initialGame,startingFriend} from '../src/engine.ts';
import {bestMemberLoadout,maximumMemberChance} from '../src/member-probability.ts';
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
if(!input.member&&!['arya','clyde'].includes(input.role))throw Error('Supply a member profile or an authored role');
if(!['affinity','current'].includes(input.benchmark))throw Error('Declare affinity or current benchmark');
const member=input.member??startingFriend(initialGame(),input.role);
const result=(input.benchmark==='affinity'?maximumMemberChance:bestMemberLoadout)(member,input.dungeonId,input.floor,input.availableItemIds);
console.log(JSON.stringify({benchmark:input.benchmark,dungeonId:input.dungeonId,floor:input.floor,...result},null,2));
