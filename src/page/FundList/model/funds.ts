import { LoadStatus } from '@Type/index';
import { FundsMode, FundDetail, FundTrends } from '@Model/fund';
import { createModel } from '@rematch/core';
import EastMoneyService from '@Service/eastmoney';
import StorageService from '@Service/storage';

import { RootModel } from '.';

export type FundsState = {
	status: LoadStatus;
	mode: FundsMode;
	editing: boolean;
	gzrqT: string;
	jzrqT: string;
	codes: string[];
	items: Map<string, FundDetail>;
	trends: Map<string, FundTrends>;
}

export const funds = createModel<RootModel>()({
	name: 'funds',
	state: {
		status: LoadStatus.loaded,
		mode: FundsMode.standard,
		editing: false,
		gzrqT: '',
		jzrqT: '',
		codes: StorageService.getFundIds(),
		items: new Map(),
		trends: new Map(),
	} as FundsState,
	reducers: {
		switchMode: (state): FundsState => {
			const newMode = state.mode === FundsMode.simplify ? FundsMode.standard : FundsMode.simplify;
			StorageService
			return { ...state, mode: newMode };
		},
		switchEditing: (state): FundsState => {
			return { ...state, editing: !state.editing };
		},
		updateStatus: (state, status: LoadStatus): FundsState => {
			return { ...state, status };
		},
		updateCodes: (state, codes: string[]): FundsState => {
			StorageService.setFundIds(codes);
			return { ...state, codes };
		},
		updateFunds: (state, res: { [key: string]: any }): FundsState => {
			const items = new Map();
			res.Datas.forEach(d => items.set(d.FCODE, new FundDetail(d)));
			return {
				...state,
				status: LoadStatus.loaded,
				gzrqT: res.Expansion.GZTIME.substr(5),
				jzrqT: res.Expansion.FSRQ.substr(5),
				items,
			};
		},
		addFund: (state, { code, item }: { code: string, item: FundDetail }): FundsState => {
			StorageService.addFund(code);
			StorageService.addFundHold({ code, count: 0, cost: 0 });
			return {
				...state,
				codes: [code, ...state.codes],
				items: new Map(state.items).set(code, item),
			};
		},
		deleteFund: (state, code: string): FundsState => {
			const index = state.codes.indexOf(code);
			if (index >= 0) {
				const newCodes = StorageService.deleteFund(code);
				const newItems = new Map(state.items);
				newItems.delete(code);
				// try {
				// 	chrome.runtime.sendMessage({
				// 		type: 'hold_changed',
				// 		value: data.totalGainedExpectedString,
				// 	});
				// } catch (e) { console.log(e); }
				return {
					...state,
					codes: newCodes,
					items: newItems,
				};
			}
			return state;
		},
		updateFundHold: (state, { code, k, v }: { code: string, k: string, v: number }): FundsState => {
			StorageService.updateFundHold({ code: code, [k]: v });
			return {
				...state,
				items: new Map(state.items),
			};
		},
		clearTrends: (state): FundsState => {
			return {
				...state,
				trends: new Map(),
			};
		},
		updateTrends: (state, { code, payload }: { code: string, payload: FundTrends }): FundsState => {
			return {
				...state,
				trends: new Map(state.trends).set(code, payload),
			};
		},
	},
	effects: (dispatch) => ({
		async loadFunds(_, root) {
			if (root.funds.codes.length > 0) {
				dispatch.funds.updateStatus(LoadStatus.loading);
				const res = await EastMoneyService.getFundList(root.funds.codes);
				dispatch.funds.updateFunds(res);
			}
		},
		async loadFundAndAdd(code: string) {
			const res = await EastMoneyService.getFundList([code]);
			if (res && res.Datas && res.Datas[0]) {
				dispatch.funds.addFund({ code, item: new FundDetail(res.Datas[0]) });
				dispatch.funds.loadTrendAndAdd(code);
			}
		},
		async loadTrends(_, root) {
			dispatch.funds.clearTrends();
			root.funds.codes.forEach(async (code: string) => {
				const res = await EastMoneyService.getFundTrends(code);
				dispatch.funds.updateTrends({ code, payload: res });
			});
		},
		async loadTrendAndAdd(code: string) {
			const res = await EastMoneyService.getFundTrends(code);
			dispatch.funds.updateTrends({ code, payload: res });
		},
	}),
});