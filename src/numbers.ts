/** Presentation only: keep full floating-point precision in calculations and saves. */
const displayNumber=new Intl.NumberFormat(undefined,{maximumFractionDigits:2});
export const formatNumber=(value:number):string=>displayNumber.format(value);
/** Tiny non-selected Attribute competence; rounds to 0 in the UI. */
export const ATTRIBUTE_BASELINE=0.001;
