import { FundHelper } from '@Util/fundHelper';
import { FundDetail } from '@Model/fund';
import EastMoneyService from '@Service/eastmoney';
import StorageService from '@Service/storage';
import ChromeService from '@Service/chrome';

const MAX_INTERVAL = 10 * 60 * 1000; // 10分钟
const MIN_INTERVAL = 10 * 1000; // 10秒钟

let isTrading = false;

const getIsTrading = async (): Promise<boolean> => {
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
};

const updateBadge = (text: string, color: string): void => {
  ChromeService.setBadgeText(text);
  ChromeService.setBadgeBackgroundColor(isTrading ? color : '#1890ff');
}

const refresh = async () => {
  const getShowBadge: boolean = StorageService.getShowBadge();
  if (!getShowBadge) {
    updateBadge('', 'white');
  } else {
    const fundIds: Array<string> = StorageService.getFundIds();
    if (fundIds.length) {
      const data = await EastMoneyService.getFundList(fundIds);
      const items = new Map<string, FundDetail>();
      if (data.Datas && data.Datas.length > 0) {
        for (let i = 0; i < data.Datas.length; i++) {
          items.set(data.Datas[i].FCODE, new FundDetail(data.Datas[i]));
        }
      }
      isTrading = await getIsTrading();
      updateBadge(...FundHelper.totalGainedExpectedString(items));
    } else {
      updateBadge('', 'white');
    }
  }
  setTimeout(refresh, isTrading ? MIN_INTERVAL : MAX_INTERVAL);
};

try {
  refresh();
  chrome.runtime.onMessage.addListener((request) => {
    switch (request.type) {
      case 'hold_changed':
        updateBadge(...request.value as [string, string]);
        break;
      default:
        break;
    }
  });
} catch (e) { console.log(e); }