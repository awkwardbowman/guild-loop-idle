/** Content IDs stay stable across save versions. Timings are seconds of game time. */
export const BASE_TRAVEL_SECONDS = 15;
export const BASE_TRADE_SECONDS = 15;
export const LOCATIONS = [
 {id:'emberveil',name:'Emberveil',description:'A small town stirring back to life, a thousand years after the stories that left these stones behind.',travelSeconds:BASE_TRAVEL_SECONDS,tradeSeconds:BASE_TRADE_SECONDS},
 {id:'stillmere',name:'Stillmere',description:'A nearby town with an herbalist and a small market.',travelSeconds:BASE_TRAVEL_SECONDS,tradeSeconds:BASE_TRADE_SECONDS},
 {id:'catacombs',name:'Ritual Catacombs',description:'Weathered steps descend beneath a forgotten shrine. The old ritual marks have faded; small creatures now shelter among the stones.',travelSeconds:BASE_TRAVEL_SECONDS,tradeSeconds:BASE_TRADE_SECONDS},
 {id:'old_quarter',name:'The Old Quarter',description:'Broken walls and quiet halls preserve fragments of a town much older than the one rebuilding above.',travelSeconds:BASE_TRAVEL_SECONDS,tradeSeconds:BASE_TRADE_SECONDS},
 {id:'ridge',name:'Emberstone Ridge',description:'Old workings scar the hillside beyond Emberveil, where new paths follow the tracks of forgotten trade.',travelSeconds:BASE_TRAVEL_SECONDS,tradeSeconds:BASE_TRADE_SECONDS}
] as const;
export type LocationId=typeof LOCATIONS[number]['id'];
export const locationById=(id:LocationId)=>LOCATIONS.find(location=>location.id===id)!;
export const isLocationId=(id:unknown):id is LocationId=>LOCATIONS.some(location=>location.id===id);
/** Local routes currently share a duration. Later routes can vary by origin and destination. */
export function travelSeconds(origin:LocationId,destination:LocationId):number {
 return origin===destination?0:locationById(destination).travelSeconds;
}
