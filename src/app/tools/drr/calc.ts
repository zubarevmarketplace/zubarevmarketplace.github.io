export type MaxDrrInput = {
  price: number;
  marginBeforeAdsPercent: number;
  targetMarginPercent: number;
};
export type FunnelInput = { cpc: number; ctrPercent: number; crPercent: number };
export type BudgetInput = FunnelInput & {
  targetOrders: number;
  price: number;
  // Without a margin, ROMI cannot be determined from revenue alone.
  marginBeforeAdsPercent?: number;
};
export type BudgetResult = {
  impressions: number;
  clicks: number;
  orders: number;
  budget: number;
  cpo: number | null;
  drrPercent: number | null;
  romiPercent: number | null;
};

const nonNegative = (value: number) => Number.isFinite(value) && value >= 0;
const percent = (value: number) => nonNegative(value) && value <= 100;
const validFunnel = ({ cpc, ctrPercent, crPercent }: FunnelInput) =>
  nonNegative(cpc) && percent(ctrPercent) && ctrPercent > 0 && percent(crPercent) && crPercent > 0;
const finiteResults = (values: (number | null)[]) => values.every((value) => value === null || Number.isFinite(value));

export function calcMaxDrr({ price, marginBeforeAdsPercent, targetMarginPercent }: MaxDrrInput) {
  if (!Number.isFinite(price) || price <= 0 || !percent(marginBeforeAdsPercent) || !percent(targetMarginPercent) ||
    targetMarginPercent > marginBeforeAdsPercent) return null;
  const maxDrrPercent = marginBeforeAdsPercent - targetMarginPercent;
  const adCostPerUnit = price * (maxDrrPercent / 100);
  return finiteResults([adCostPerUnit]) ? { maxDrrPercent, adCostPerUnit } : null;
}

export function calcBudget(input: BudgetInput): BudgetResult | null {
  const { targetOrders, cpc, ctrPercent, crPercent, price, marginBeforeAdsPercent } = input;
  if (!validFunnel(input) || !nonNegative(targetOrders) || !Number.isFinite(price) || price <= 0 ||
    (marginBeforeAdsPercent !== undefined && !percent(marginBeforeAdsPercent))) return null;
  const clicks = targetOrders / (crPercent / 100);
  const impressions = clicks / (ctrPercent / 100);
  const budget = clicks * cpc;
  const revenue = targetOrders * price;
  const profitBeforeAds = marginBeforeAdsPercent === undefined ? null : revenue * (marginBeforeAdsPercent / 100);
  const result: BudgetResult = {
    impressions, clicks, orders: targetOrders, budget,
    cpo: targetOrders > 0 ? budget / targetOrders : null,
    drrPercent: revenue > 0 ? budget / revenue * 100 : null,
    romiPercent: budget > 0 && profitBeforeAds !== null ? (profitBeforeAds - budget) / budget * 100 : null,
  };
  return finiteResults([...Object.values(result), revenue, profitBeforeAds]) ? result : null;
}

export function calcOrdersFromBudget(input: FunnelInput & { budget: number }) {
  const { budget, cpc, ctrPercent, crPercent } = input;
  if (!validFunnel(input) || !nonNegative(budget) || cpc === 0) return null;
  const clicks = budget / cpc;
  const impressions = clicks / (ctrPercent / 100);
  const orders = clicks * (crPercent / 100);
  const result = { budget, clicks, impressions, orders };
  return finiteResults(Object.values(result)) ? result : null;
}
