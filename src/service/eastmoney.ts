import { StockInfo } from '@Type/stock';
import axios, { AxiosInstance } from 'axios';
import { FundTrends } from '../model/fund';

const FundApi = {
  SystemTime: '/FundMApi/FundSystemDateTime.ashx',
  FundList: '/FundMNewApi/FundMNFInfo',
  FundStock: '/FundMNewApi/FundMNInverstPosition',
  FundGzDetail: '/FundMApi/FundVarietieValuationDetail.ashx',
  FundJz: '/FundMApi/FundNetDiagram.ashx'
};

const SearchApi = {
  Fund: '/FundSearch/api/FundSearchAPI.ashx',
};

const StockApi = {
  StockList: '/api/qt/ulist.np/get',
  StockTrends: '/api/qt/stock/trends2/get',
};

export default class EastMoneyService {
  fundAxios: AxiosInstance;
  searchAxis: AxiosInstance;
  stockAxios: AxiosInstance;

  constructor() {
    const commonParams = {
      plat: 'Wap',
      deviceid: 'Wap',
      product: 'EFund',
      Version: '2.0.0',
    };
    this.fundAxios = axios.create({
      baseURL: DEV ? 'http://localhost:3000/fund' : 'https://fundmobapi.eastmoney.com',
      timeout: 30 * 1000,
      params: commonParams,
    });
    this.searchAxis = axios.create({
      baseURL: DEV ? 'http://localhost:3000/search' : 'https://fundsuggest.eastmoney.com',
      timeout: 30 * 1000,
    });
    this.stockAxios = axios.create({
      baseURL: DEV ? 'http://localhost:3000/stock' : 'https://push2.eastmoney.com',
      timeout: 30 * 1000,
      params: commonParams,
    });
  }

  static _instance: EastMoneyService;

  static get instance(): EastMoneyService {
    if (!this._instance) {
      this._instance = new EastMoneyService();
    }
    return this._instance;
  }

  static async getSystemTime(): Promise<[string, boolean]> {
    const res = await this.instance.fundAxios.get(FundApi.SystemTime);
    return [res.data.Datas.SystemDateTime, res.data.Datas.IsTradeDay];
  }

  static async getIsTrading() : Promise<boolean> {
    let isTradeTime = false;
    const [systemTime, isTradeDay] = await EastMoneyService.getSystemTime();
    const nowTime = new Date(systemTime);
    const time = nowTime.getHours() + nowTime.getMinutes() / 60;
    // time > 09:27 && time < 15:03
    // 目的：将前后 3 分钟也视为交易时间，确保更新
    if (time > 9.45 && time < 15.05) {
      isTradeTime = true;
    }
    return isTradeDay && isTradeTime;
  }

  static async getFundList(fundIds: string[]): Promise<any> {
    const Fcodes = fundIds.toString();
    const res = await this.instance.fundAxios.get(FundApi.FundList, {
      params: {
        pageIndex: 1,
        pageSize: 50,
        appType: 'ttjj',
        Fcodes,
      },
    });
    return res.status === 200 ? res.data : null;
  }

  static async getFundStocks(fundId: string): Promise<any> {
    const res = await this.instance.fundAxios.get(FundApi.FundStock, {
      params: {
        FCODE: fundId
      },
    });
    return res.status === 200 ? res.data.Datas.fundStocks : null;
  }

  static async getFundTrends(fundId: string): Promise<FundTrends> {
    const res = await this.instance.fundAxios.get(FundApi.FundGzDetail, {
      params: {
        FCODE: fundId,
        RANGE: 'y',
      },
    });
    return res.status === 200 ? {
      dwjz: res.data.Expansion.DWJZ,
      list: res.data.Datas,
    } : null;
  }

  static async getStockList(stocks: any[]): Promise<StockInfo[]> {
    const fields = 'f1,f2,f3,f4,f12,f13,f14';
    const fltt = 2;
    const secids = stocks.map((item) => `${item.NEWTEXCH}.${item.GPDM}`).toString();
    const res = await this.instance.stockAxios.get(StockApi.StockList, {
      params: {
        fields,
        fltt,
        secids,
      }
    });
    return res.status === 200 ? res.data.data.diff : null;
  }

  static async getStockTrends(prefix: number, stockId: string): Promise<any> {
    const fields1 = 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13';
    const fields2 = 'f51,f53,f56,f58';
    const secid = `${prefix}.${stockId}`;
    const res = await this.instance.stockAxios.get(StockApi.StockTrends, {
      params: {
        secid,
        fields1,
        fields2,
        iscr: 0,
        iscca: 0,
        ndays: 1,
        forcect: 1,
      }
    });
    return res.status === 200 ? res.data.data : null;
  }

  static async searchFund(str: string): Promise<any[]> {
    const res = await this.instance.searchAxis.get(SearchApi.Fund, {
      params: { m: 9, key: str, '&_': Date.now() }
    });
    const list = [];
    if (res.data && res.data.Datas && res.data.Datas.length > 0) {
      res.data.Datas.forEach(item => {
        if (item.CATEGORY === 700 && item.FundBaseInfo.FTYPE !== '货币型') {
          list.push(item);
        }
      });
    }
    return list;
  }
}