import axios, { AxiosAdapter, AxiosInstance } from 'axios';
import jsonpAdapter from '../util/jsonp';

const FundApi = {
  FundList: '/FundMNewApi/FundMNFInfo',
  FundStock: '/FundMNewApi/FundMNInverstPosition',
  FundGzDetail: '/FundMApi/FundVarietieValuationDetail.ashx',
};

const SearchApi = {
  Fund: '/FundSearch/api/FundSearchAPI.ashx',
};

const StockApi = {
  StockList: '/qt/ulist.np/get',
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
      baseURL: 'https://fundmobapi.eastmoney.com',
      timeout: 30 * 1000,
      params: commonParams,
    });
    this.searchAxis = axios.create({
      baseURL: 'https://fundsuggest.eastmoney.com',
      timeout: 30 * 1000,
    });
    this.stockAxios = axios.create({
      baseURL: 'https://push2.eastmoney.com/api',
      timeout: 30 * 1000,
      params: commonParams,
    });
  }

  static _instance: EastMoneyService;

  static get instance() {
    if (!this._instance) {
      this._instance = new EastMoneyService();
    }
    return this._instance;
  }

  static async searchFund(str: string) {
    const res = await this.instance.searchAxis.get(SearchApi.Fund, {
      // adapter: jsonpAdapter as AxiosAdapter,
      params: {
        m: 9,
        key: str,
        '&_': Date.now(),
      }
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

  static async getFundList(fundIds: string[]) {
    const Fcodes = fundIds.toString();
    if (!Fcodes) alert('查询基金为空');
    const res = await this.instance.fundAxios.get(FundApi.FundList, {
      params: {
        pageIndex: 1,
        pageSize: 50,
        appType: 'ttjj',
        Fcodes,
      },
    });
    return res.status === 200 ? res.data.Datas : null;
  }

  static async getFundStocks(fundId: string) {
    const res = await this.instance.fundAxios.get(FundApi.FundStock, {
      params: {
        FCODE: fundId
      },
    });
    return res.status === 200 ? res.data.Datas.fundStocks : null;
  }

  /**
   * 获取基金当日今日估值走势
   * @param {*} fundId 
   */
  static async getFundGzDetail(fundId: string) {
    const res = await this.instance.fundAxios.get(FundApi.FundGzDetail, {
      // adapter: jsonpAdapter as AxiosAdapter,
      params: {
        FCODE: fundId,
        RANGE: 'y',
      },
    });
    return res.status === 200 ? {
      gzDetail: res.data.Datas,
      fundBaseInfo: res.data.Expansion,
    } : null;
  }

  static async getStockList(stocks) {
    const fields = 'f1,f2,f3,f4,f12,f13,f14,f292';
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
}