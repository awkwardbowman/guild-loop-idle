/** Presentation only: keep full floating-point precision in calculations and saves. */
const displayNumber=new Intl.NumberFormat(undefined,{maximumFractionDigits:2});
export const formatNumber=(value:number):string=>displayNumber.format(value);
/** Ineligible or unowned stats are really zero; only eligible work gets a tiny floor. */
export const MIN_PROGRESS_RATE=0.001;
