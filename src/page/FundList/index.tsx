import React, { useEffect, ReactElement } from 'react';
import { Provider, useDispatch } from 'react-redux';

import { Version } from '@Component/Version';

import { StockIndexs } from './component/StockIndexs';
import { ToolBar } from './component/ToolBar';
import { Funds } from './component/Funds';
import { Dispatch, store } from './store';

import '../../style/global.scss';

function PageFundList(): ReactElement {
  console.log('[build] PageFundList');

  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    dispatch.stockIndexs.load();
    dispatch.funds.loadFunds();
    dispatch.funds.loadTrends();
  }, []);

  return <div className="container">
    <StockIndexs />
    <ToolBar />
    <Funds />
    <Version product={PRODUCT} version={VERSION} />
  </div>;
}

export default (): ReactElement => {
  return <Provider store={store}>
    <PageFundList />
  </Provider>
}