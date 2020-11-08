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

    this.updated = this.jzrq === this.gzrq;
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
}