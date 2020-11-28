import { StockIndexsCodes } from '@Config/index';
import { createModel } from '@rematch/core';
import EastMoneyService from '@Service/eastmoney';

import { LoadStatus, StockInfo } from '@Type/index';

import { RootModel } from '.';

export type StockIndexsState = {
	status?: LoadStatus;
	list?: StockInfo[];
}

export const stockIndexs = createModel<RootModel>()({
	name: 'stockIndexs',
	state: {
		status: LoadStatus.loading,
		list: [],
	} as StockIndexsState,
	reducers: {
		update: (state, payload: StockIndexsState): StockIndexsState => {
			return {
				...state,
				...payload,
			};
		}
	},
	effects: (dispatch) => ({
		async load(_, root) {
			dispatch.stockIndexs.update({
				status: LoadStatus.loading,
			});
			const list = await EastMoneyService.getStockList(StockIndexsCodes);
			dispatch.stockIndexs.update({
				status: LoadStatus.loaded,
				list: list || root.stockIndexs.list,
			});
		},
	}),
});