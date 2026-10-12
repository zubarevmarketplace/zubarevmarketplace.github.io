import { tariffRegistry } from '../../config/tariffRegistry';
import { defaultInput as wbInput } from '../price-for-margin/defaults';
import type { CalculatorInput } from '../../types/calculator';

// Match the WB calculator's advanced-mode defaults.
export const defaultInput: CalculatorInput = {
  ...wbInput,
  manualLocalOrderShare: 50,
  manualFulfillmentCost: tariffRegistry.wb.defaults.fulfillmentCost,
  manualProcessingCost: tariffRegistry.wb.defaults.fbsProcessingCost,
};

export const defaultMonthlySales = 100;
