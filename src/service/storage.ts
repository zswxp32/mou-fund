import { v4 as uuid } from 'uuid';

export type FundHold = {
  code: string;
  hold?: number;
  cost?: number;
};

type FundHoldMap = {
  [key: string]: FundHold,
};

const INIT_FUND_IDS: string[] = ['161725', '005598', '320007', '161726', '161028'];
const INIT_FUND_MAP: FundHoldMap = {};
INIT_FUND_IDS.forEach(id => INIT_FUND_MAP[id] = { code: id, hold: 0, cost: 0,});

export default class StorageService {
  static firstBite(): void {
    const first = localStorage.getItem('first-bite');
    if (first !== '1') {
      localStorage.setItem('first-bite', '1');
      // 首次内置5只
      this.resetFundIds(INIT_FUND_IDS);
      this.resetFundHold(INIT_FUND_MAP);
    }
  }

  static getDeviceId(): string {
    const id = localStorage.getItem('deviceid');
    if (id) return id;

    const newId = uuid();
    localStorage.setItem('deviceid', newId);
    return newId;
  }

  static getFundIds(): string[] {
    const fundIdsStr = localStorage.getItem('mou-fund-ids');
    if (!fundIdsStr) return [];
    return fundIdsStr.split(',');
  }

  static addFundById(fundId: string) : string[] {
    const fundIds = this.getFundIds();
    if (fundIds.includes(fundId)) {
      alert('这只基金你之前已经添加过了哦 ~');
    } else {
      fundIds.unshift(fundId);
      localStorage.setItem('mou-fund-ids', fundIds.toString());
    }
    return fundIds;
  }

  static deleteFundById(fundId: string): string[] {
    const fundIds = this.getFundIds();
    if (!fundIds.includes(fundId)) {
      alert('你还没有添加过这只基金哦 ~');
      return;
    }
    fundIds.splice(fundIds.indexOf(fundId), 1);
    localStorage.setItem('mou-fund-ids', fundIds.toString());
    return fundIds;
  }

  static resetFundIds(fundIds: string[]): void {
    localStorage.setItem('mou-fund-ids', fundIds.toString());
  }

  static getFundHolds(): FundHoldMap {
    const fundHoldsStr = localStorage.getItem('mou-fund-holds');
    if (!fundHoldsStr) return {};
    return JSON.parse(fundHoldsStr);
  }

  static addFundHold(hold: FundHold): FundHoldMap {
    const fundHolds = this.getFundHolds();
    if (!fundHolds[hold.code]) {
      fundHolds[hold.code] = hold;
      this.resetFundHold(fundHolds);
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
      this.resetFundHold(fundHolds);
    }
    return fundHolds;
  }

  static resetFundHold(holds: FundHoldMap): void {
    localStorage.setItem('mou-fund-holds', JSON.stringify(holds));
  }
}

StorageService.firstBite();