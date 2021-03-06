import { FundHelper } from '@Util/fundHelper';
import { FundDetail } from '@Model/fund';
import EastMoneyService from '@Service/eastmoney';
import StorageService from '@Service/storage';
import ChromeService from '@Service/chrome';

const MAX_INTERVAL = 5 * 60 * 1000; // 5 分钟
const MIN_INTERVAL = 15 * 1000; // 15 秒钟

let isTrading: boolean = null;

const updateBadge = async (text: string, color: string): Promise<void> => {
  ChromeService.setBadgeText(text);
  ChromeService.setBadgeBackgroundColor(isTrading ? color : '#1890ff');
}

const refresh = async () => {
  const getShowBadge: boolean = StorageService.getShowBadge();
  isTrading = await EastMoneyService.getIsTrading();
  if (!getShowBadge) {
    await updateBadge('', 'white');
  } else {
    const fundIds: Array<string> = StorageService.getFundIds();
    if (fundIds.length) {
      const data = await EastMoneyService.getFundList(fundIds);
      if (data !== null || data.Datas || data.Datas.length > 0) {
        const items = new Map<string, FundDetail>();
        for (let i = 0; i < data.Datas.length; i++) {
          items.set(data.Datas[i].FCODE, new FundDetail(data.Datas[i]));
        }
        await updateBadge(...FundHelper.totalGainedExpectedString(items));
      }
    } else {
      await updateBadge(...FundHelper.totalGainedExpectedString(new Map<string, FundDetail>()));
    }
  }
  setTimeout(refresh, isTrading ? MIN_INTERVAL : MAX_INTERVAL);
};

try {
  refresh();
  chrome.runtime.onMessage.addListener(async (request) => {
    switch (request.type) {
      case 'gain_changed':
        await updateBadge(...request.value as [string, string]);
        break;
      default:
        break;
    }
  });
} catch (e) { console.log(e); }