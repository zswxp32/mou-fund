import { v4 as uuid } from 'uuid';

export default class StorageService {
  static firstBite() {
    const first = localStorage.getItem('first-bite');
    if (first !== '1') {
      // 首次内置5只
      this.resetFundIds(['161725', '005598', '320007', '161726', '161028']);
      localStorage.setItem('first-bite', '1');
    }
  }

  static getDeviceId() {
    const id = localStorage.getItem('deviceid');
    if (id) return id;

    let newId = uuid();
    localStorage.setItem('deviceid', newId);
    return newId;
  }

  static getFundIds(): string[] {
    const fundIdsStr = localStorage.getItem('mou-fundids');
    if (!fundIdsStr) return [];
    return fundIdsStr.split(',');
  }

  static addFundById(fundId) {
    const fundIds = this.getFundIds();
    if (fundIds.includes(fundId)) {
      alert('这只基金你之前已经添加过了哦 ~');
    } else {
      fundIds.unshift(fundId);
      localStorage.setItem('mou-fundids', fundIds.toString());
    }
    return fundIds;
  }

  static deleteFundById(fundId) {
    const fundIds = this.getFundIds();
    if (!fundIds.includes(fundId)) {
      alert('你还没有添加过这只基金哦 ~');
      return;
    }
    fundIds.splice(fundIds.indexOf(fundId), 1);
    localStorage.setItem('mou-fundids', fundIds.toString());
    return fundIds;
  }

  static resetFundIds(fundIds) {
    localStorage.setItem('mou-fundids', fundIds.toString());
  }
}

StorageService.firstBite();