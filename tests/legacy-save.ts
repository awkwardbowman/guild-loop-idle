export function previousShape(game:any){
 for(const actor of [...game.members,...(game.candidate?[game.candidate]:[])])for(const entry of actor.queue)entry.maxDepth??=null;
 for(const run of game.active)run.personalLimit??=null;
 return game;
}
export function legacyEnvelope(data:any){if(data.version<9)previousShape(data.game);return data;}
