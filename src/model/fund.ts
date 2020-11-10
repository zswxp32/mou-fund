import StorageService, { FundHold, FundHoldMap } from "../service/storage";
import { toPercentString } from "../util/number";

type StringMap = { [key: string]: string };

export class Fund {
  code: string; // 基金代码：FCODE
  name: string; // 基金名：SHORTNAME

  jz: number; // 净值：NAV
  jzzzl: number; // 净值增长率：NAVCHGRT
  jzrq: string; // 净值日期：PDATE

  gz: number; // 估值：GSZ
  gzzzl: number; // 估值增长率：GSZZL
  gzrq: string; // 估值日期：GZTIME

  gzing: boolean;
  updated: boolean;

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

  public get holdInfo(): FundHold {
    return StorageService.getFundHolds()[this.code];
  }

  public get money(): number {
    return this.jz * this.holdInfo.hold;
  }

  public get gained(): number {
    if (this.holdInfo.cost === 0 || this.holdInfo.hold === 0) return null;
    return (this.jz - this.holdInfo.cost) * this.holdInfo.hold;
  }

  public get gainedPercent(): number {
    if (this.holdInfo.cost === 0) return null;
    return (this.jz - this.holdInfo.cost) / this.holdInfo.cost * 100;
  }

  public get gainedExpected(): number {
    if (this.updated) {
      return (this.jz - this.jz / (1 + this.jzzzl / 100)) * this.holdInfo.hold;
    }
    return (this.gz - this.jz) * this.holdInfo.hold;
  }
}

export class FundList {
  gzrq: string;
  jzrq: string;
  items: Fund[];

  constructor(gzrq: string, list: StringMap[]) {
    this.gzrq = gzrq;
    if (list && list.length) {
      this.items = list.map(item => new Fund(item));
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

  setItems(items: Fund[]): FundList {
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