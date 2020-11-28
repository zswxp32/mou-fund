import { createModel } from '@rematch/core';

import { LoadStatus } from '@Type/index';
import EastMoneyService from '@Service/eastmoney';

import { RootModel } from '.';

export type ToolBarState = {
  searchStatus?: LoadStatus;
  searchStr?: string;
  searchResult?: any[];
  searchBoxShow?: boolean;
}

let _searchTimer = null;

export const toolBar = createModel<RootModel>()({
  name: 'toolBar',
  state: {
    searchStatus: LoadStatus.loading,
    searchStr: '',
    searchResult: [],
    searchBoxShow: false,
  } as ToolBarState,
  reducers: {
    update: (state, payload: ToolBarState): ToolBarState => {
      return {
        ...state,
        ...payload,
      };
    }
  },
  effects: (dispatch) => ({
    async resetSearch() {
      if (_searchTimer) clearTimeout(_searchTimer);
      dispatch.toolBar.update({
        searchStatus: LoadStatus.loading,
        searchStr: '',
        searchResult: [],
        searchBoxShow: false,
      });
    },
    async startSearch(str: string, root) {
      if (str === root.toolBar.searchStr) return;
      dispatch.toolBar.update({
        searchStatus: LoadStatus.loading,
        searchBoxShow: true,
        searchStr: str,
        searchResult: [],
      });
      if (_searchTimer !== null) {
        clearTimeout(_searchTimer);
      }
      _searchTimer = setTimeout(async () => {
        const searchResult = await EastMoneyService.searchFund(str);
        dispatch.toolBar.update({
          searchResult,
          searchBoxShow: true,
          searchStr: str,
          searchStatus: LoadStatus.loaded,
        });
      }, 500);
    },
  }),
});