import StorageService from "../service/storage";
import { toPercentString } from "../util/number";

type StringMap = { [key: string]: string };

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

  updated: boolean; //估值已更新，判断方式：gzrq == null || jzrq == gzrq

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

    this.updated = this.gzrq == null || this.jzrq === this.gzrq;
  }

  public get hold(): FundHold {
    return StorageService.getFundHolds()[this.code];
  }

  public get money(): number {
    return this.jz * this.hold.count;
  }

  public get gained(): number {
    if (this.hold.cost === 0 || this.hold.count === 0) return null;
    return (this.jz - this.hold.cost) * this.hold.count;
  }

  public get gainedPercent(): number {
    if (this.hold.cost === 0) return null;
    return (this.jz - this.hold.cost) / this.hold.cost * 100;
  }

  public get gainedExpected(): number {
    if (this.updated) {
      return (this.jz - this.jz / (1 + this.jzzzl / 100)) * this.hold.count;
    }
    if (this.gz) {
      return (this.gz - this.jz) * this.hold.count;
    }
    return null;
  }
}

export class FundList {
  gzrq: string;
  jzrq: string;
  items: FundDetail[];

  constructor(gzrq: string, list: StringMap[]) {
    this.gzrq = gzrq;
    if (list && list.length) {
      this.items = list.map(item => new FundDetail(item));
      this.jzrq = this.items[0].jzrq;
    } else {
      this.items = [];
    }
    this._initJzrq();
  }

  private _initJzrq(): void {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].jzrq > this.jzrq) {
        this.jzrq = this.items[i].jzrq;
        break;
      }
    }
  }

  setItems(items: FundDetail[]): FundList {
    this.items = items;
    return this;
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
    this.items.forEach(item => total += item.gainedExpected);
    return total;
  }
}