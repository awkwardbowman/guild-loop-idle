import {readFileSync} from 'node:fs';
import {challengeChance,classCeiling} from '../src/challenge-probability.ts';
// Explicit JSON input only; never reads or mutates a player save.
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
console.log(JSON.stringify(input.scopes?classCeiling(input.challenge,input.scopes,input.threshold,input.maxEvaluations):challengeChance(input.challenge,input.profile,input.loadout),null,2));
