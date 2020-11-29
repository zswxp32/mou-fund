import { FundsMode } from '@Type/index';
import { FundHold, FundHoldMap } from '../model/fund';

const INIT_FUND_IDS = ['161725', '005598', '320007', '161726', '161028'];
const INIT_FUND_MAP = {};
INIT_FUND_IDS.forEach(id => INIT_FUND_MAP[id] = { code: id, count: 0, cost: 0, });

export default class StorageService {
  static firstBite(): void {
    const first = localStorage.getItem('first-bite');
    if (first !== '1') {
      localStorage.setItem('first-bite', '1');
      this.setMode(FundsMode.standard);
      this.setFundIds(INIT_FUND_IDS);
      this.setFundHold(INIT_FUND_MAP);
    }
  }

  static getMode(): FundsMode {
    const modeStr = localStorage.getItem('mou-fund-mode');
    if (modeStr === null || modeStr === '0') {
      return FundsMode.standard;
    }
    return FundsMode.simplify;
  }

  static setMode(mode: FundsMode): void {
    const modeStr = mode === FundsMode.standard ? '0' : '1';
    localStorage.setItem('mou-fund-mode', modeStr);
  }

  static getFundIds(): string[] {
    const fundIdsStr = localStorage.getItem('mou-fund-ids');
    if (!fundIdsStr) return [];
    return fundIdsStr.split(',');
  }

  static setFundIds(fundIds: string[]): string[] {
    localStorage.setItem('mou-fund-ids', fundIds.toString());
    return fundIds;
  }

  static addFund(fundId: string): string[] {
    const fundIds = this.getFundIds();
    if (fundIds.includes(fundId)) {
      alert('这只基金你之前已经添加过了哦 ~');
    } else {
      fundIds.unshift(fundId);
      localStorage.setItem('mou-fund-ids', fundIds.toString());
    }
    return fundIds;
  }

  static deleteFund(fundId: string): string[] {
    const fundIds = this.getFundIds();
    if (!fundIds.includes(fundId)) return fundIds;
    fundIds.splice(fundIds.indexOf(fundId), 1);
    localStorage.setItem('mou-fund-ids', fundIds.toString());
    return fundIds;
  }

  static getFundHolds(): FundHoldMap {
    const fundHoldsStr = localStorage.getItem('mou-fund-holds');
    if (!fundHoldsStr) return {};
    // replace for my bad
    return JSON.parse(fundHoldsStr.replace(/hold/g, 'count'));
  }

  static addFundHold(hold: FundHold): FundHoldMap {
    const fundHolds = this.getFundHolds();
    if (!fundHolds[hold.code]) {
      fundHolds[hold.code] = hold;
      this.setFundHold(fundHolds);
    }
    return fundHolds;
  }

  static updateFundHold(hold: FundHold): FundHoldMap {
    const fundHolds = this.getFundHolds();
    if (fundHolds[hold.code]) {
      fundHolds[hold.code] = {
        ...fundHolds[hold.code],
        ...hold,
      };
      this.setFundHold(fundHolds);
    }
    return fundHolds;
  }

  static setFundHold(holds: FundHoldMap): void {
    localStorage.setItem('mou-fund-holds', JSON.stringify(holds));
  }

  static getShowBadge(): boolean {
    const showStr = localStorage.getItem('mou-fund-badge-show');
    if (showStr === null || showStr === '') return true;
    return showStr === '1';
  }
}

StorageService.firstBite();