import StorageService from "@Service/storage";

type StringMap = { [key: string]: string };

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
