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

  updated: boolean; //估值已更新，判断方式：jzrq == gzrq

  constructor(data: StringMap) {
    this.code = data.FCODE;
    this.name = data.SHORTNAME;

    this.jz = parseFloat(data.NAV);
    this.jzzzl = parseFloat(data.NAVCHGRT);
    this.jzrq = data.PDATE.substr(5);

    this.gz = parseFloat(data.GSZ);
    this.gzzzl = parseFloat(data.GSZZL);
    this.gzrq = data.GZTIME.substr(5, 5);
    this.gzing = data.GZTIME.substr(11, 5) < '15:00';

    this.updated = this.jzrq === this.gzrq;
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
    return (this.gz - this.jz) * this.hold.count;
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