import { FundList } from './model/fund';
import EastMoneyService from './service/eastmoney';
import StorageService from './service/storage';

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
  try {
    chrome.browserAction.setBadgeText({
      text,
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: isTrading ? color : '#1890ff',
    });
  } catch (e) { console.log(e); }
}

const refresh = async () => {
  const fundIds: Array<string> = StorageService.getFundIds();
  if (fundIds.length) {
    const data = await EastMoneyService.getFundList(fundIds);
    const fundListData = new FundList({
      gzrq: data.Expansion.GZTIME.substr(5),
      jzrq: data.Expansion.FSRQ.substr(5),
      ids: fundIds,
      list: data.Datas,
    });
    isTrading = await getIsTrading();
    updateBadge(...fundListData.totalGainedExpectedString);
  } else {
    updateBadge('', 'white');
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
} catch(e) { console.log(e); }