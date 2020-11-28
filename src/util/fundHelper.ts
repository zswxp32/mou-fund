import { FundDetail } from "@Model/fund";
import { toNumberBadge, toPercentString } from "./number";

export class FundHelper {
  public static totalMoney(items: Map<string, FundDetail>): number {
    let total = 0;
    items.forEach(item => total += item.money);
    return total;
  }

  public static totalGained(items: Map<string, FundDetail>): number {
    let total = 0;
    items.forEach(item => total += item.gained);
    return total;
  }

  public static totalPercent(items: Map<string, FundDetail>): string {
    const tm = this.totalMoney(items);
    const tg = this.totalGained(items);
    if (tm == 0) return '0.00%';
    return toPercentString(tg / (tm - tg) * 100, true);
  }

  public static totalGainedExpected(items: Map<string, FundDetail>): number {
    let total = 0;
    items.forEach(item => {
      if (item.gainedExpected !== null) {
        total += item.gainedExpected;
      }
    });
    return total;
  }

  public static totalGainedExpectedString(items: Map<string, FundDetail>): [string, string] {
    let total = 0;
    items.forEach(item => {
      if (item.gainedExpected !== null) {
        total += item.gainedExpected;
      }
    });
    return toNumberBadge(total);
  }
}