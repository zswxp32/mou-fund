
export default class ChromeService {
  static sendMessage(type: string, value: any): void {
    try {
      chrome.runtime.sendMessage({ type, value });
    } catch (e) { console.log(e); }
  }

  static setBadgeText(text: string): void {
    try {
      chrome.browserAction.setBadgeText({ text });
    } catch (e) { console.log(e); }
  }

  static setBadgeBackgroundColor(color: string): void {
    try {
      chrome.browserAction.setBadgeBackgroundColor({ color });
    } catch (e) { console.log(e); }
  }
}