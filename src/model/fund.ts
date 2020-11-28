import EastMoneyService from "../service/eastmoney";
import StorageService from "../service/storage";
import { toNumberBadge, toPercentString } from "../util/number";

type StringMap = { [key: string]: string };

export enum FundsMode {
	simplify,
	standard,
}

export type FundTrends = {
	dwjz: number,
	list: string[],
};

export type FundHold = {
  code: string;
  cost?: number;
  count?: number;
};

export type FundHoldMap = {
  [key: string]: FundHold,
};

export class FundDetail {
  code: string; // 基金代码：FCODE
  name: string; // 基金名：SHORTNAME

  jz: number; // 净值：NAV
  jzzzl: number; // 净值增长率：NAVCHGRT
  jzrq: string; // 净值日期：PDATE

  gz: number; // 估值：GSZ
  gzzzl: number; // 估值增长率：GSZZL
  gzrq: string; // 估值日期：GZTIME
  gzing: boolean; // 估值更新中（09:30 - 14:59）

  updated: boolean; //估值已更新，判断方式：jzrq == gzrq
  isETF: boolean; // 是否ETF

  constructor(data: StringMap) {
    this.code = data.FCODE;
    this.name = data.SHORTNAME;

    this.jz = parseFloat(data.NAV);
    this.jzzzl = parseFloat(data.NAVCHGRT);
    this.jzrq = data.PDATE.substr(5);

    this.gz = data.GSZ !== '--' ? parseFloat(data.GSZ) : null;
    this.gzzzl = data.GSZZL !== '--' ? parseFloat(data.GSZZL) : null;
    this.gzrq = data.GZTIME !== '--' ? data.GZTIME.substr(5, 5) : null;
    this.gzing = data.GZTIME !== '--' ? data.GZTIME.substr(11, 5) < '15:00' : false;

    this.updated = this.jzrq === this.gzrq;
    this.isETF = data.HQDATE !== '--';
  }

  public get hold(): FundHold {
    return StorageService.getFundHolds()[this.code];
  }

  public get money(): number {
    return this.jz * this.hold.count;
  }

  public get gained(): number {
    const { cost, count } = this.hold;
    if (cost === 0 || count === 0) return null;
    return (this.jz - cost) * count;
  }

  public get gainedPercent(): number {
    const { cost } = this.hold;
    if (cost === 0) return null;
    return (this.jz - cost) / cost * 100;
  }

  public get gainedExpected(): number {
    const { count } = this.hold;
    // 已更新
    if (this.updated) {
      return (this.jz - this.jz / (1 + this.jzzzl / 100)) * count;
    }
    // 未更新
    if (this.gz) {
      return (this.gz - this.jz) * count;
    }
    return null;
  }
}

interface FundListProps {
  gzrq?: string;
  jzrq?: string;
  ids?: string[];
  list?: StringMap[];
  items?: Map<string, FundDetail>; 
}

export class FundList {
  gzrq: string;
  jzrq: string;
  ids: string[];
  items: Map<string, FundDetail>;

  constructor(props: FundListProps = {}) {
    this.gzrq = props.gzrq || '';
    this.jzrq = props.jzrq || '';
    this.ids = props.ids || [];
    this.items = props.items || new Map();
    if (props.list && props.list.length > 0) {
      this._initItems(props.list || []);
    }
    this._initJzrq();
  }

  private _initItems(list: StringMap[]): void {
    list.forEach(item => this.items.set(item.FCODE, new FundDetail(item)));
  }

  private _initJzrq(): void {
    // 只要有一个基金收益已更新，则将header中的净值日期改为更新日期
    for (let i = 0; i < this.ids.length; i++) {
      const item = this.items.get(this.ids[i]);
      if (this.jzrq < item.jzrq) {
        this.jzrq = item.jzrq;
        break;
      }
    }
  }

  public get totalMoney(): number {
    let total = 0;
    this.items.forEach(item => total += item.money);
    return total;
  }

  public get totalGained(): number {
    let total = 0;
    this.items.forEach(item => total += item.gained);
    return total;
  }

  public get totalPercent(): string {
    if (this.totalMoney == 0) return '0.00%';
    return toPercentString(this.totalGained / (this.totalMoney - this.totalGained) * 100, true);
  }

  public get totalGainedExpected(): number {
    let total = 0;
    this.items.forEach(item => {
      if (item.gainedExpected !== null) {
        total += item.gainedExpected;
      }
    });
    return total;
  }

  public get totalGainedExpectedString(): [string, string] {
    let total = 0;
    this.items.forEach(item => {
      if (item.gainedExpected !== null) {
        total += item.gainedExpected;
      }
    });
    return toNumberBadge(total);
  }

  public async addFund(fundId: string): Promise<FundList> {
    const list = await EastMoneyService.getFundList([fundId]);
    if (list && list.Datas && list.Datas[0]) {
      const newIds = StorageService.addFund(fundId);
      const newItems = new Map(this.items).set(fundId, new FundDetail(list.Datas[0]));
      StorageService.addFundHold({ code: fundId, count: 0, cost: 0 });
      return new FundList({
        gzrq: this.gzrq,
        jzrq: this.jzrq,
        ids: newIds,
        items: newItems,
      });
    }
    return this;
  }

  public deleteFund(fundId: string): FundList {
    const idIndex = this.ids.indexOf(fundId);
    if (idIndex >= 0) {
      const newIds = StorageService.deleteFund(fundId);
      const newItems = new Map(this.items);
      newItems.delete(fundId);
      return new FundList({
        gzrq: this.gzrq,
        jzrq: this.jzrq,
        ids: newIds,
        items: newItems,
      });
    }
    return this;
  }

  public updateHold(fundId: string, key: string, value: any): FundList {
    const val = value.trim();
    if (isNaN(val / 1)) return this;
    StorageService.updateFundHold({
      code: fundId,
      [key]: val / 1,
    });
    return new FundList({
      gzrq: this.gzrq,
      jzrq: this.jzrq,
      ids: this.ids,
      items: this.items,
    });
  }

  public reorderFunds(fundIds: string[]): FundList {
    const newIds = StorageService.setFundIds(fundIds);
    return new FundList({
      gzrq: this.gzrq,
      jzrq: this.jzrq,
      ids: newIds,
      items: this.items,
    });
  }
}