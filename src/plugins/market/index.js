import { PluginRegistry } from "../../core/registry.js";
import { createFundPlugin, FundPlugin } from "../fund/fund-plugin.js";
import { createStockPlugin, StockPlugin } from "../stock/stock-plugin.js";

export { createFundPlugin, FundPlugin } from "../fund/fund-plugin.js";
export { createStockPlugin, StockPlugin } from "../stock/stock-plugin.js";
export {
  fundCheckpoints,
  fundDictionaries,
  fundDomainId,
  fundEventMaps,
  fundInformationItems,
  fundSubject,
  fundTimelineItems
} from "../fund/fund-data.js";
export {
  stockCheckpoints,
  stockDictionaries,
  stockDomainId,
  stockEventMaps,
  stockInformationItems,
  stockSubject,
  stockTimelineItems
} from "../stock/stock-data.js";

export function createMarketRegistry() {
  return new PluginRegistry().register(createStockPlugin()).register(createFundPlugin());
}

export const marketPluginClasses = {
  StockPlugin,
  FundPlugin
};
