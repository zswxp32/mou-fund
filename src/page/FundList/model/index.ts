import { Models } from '@rematch/core'
import { stockIndexs } from './stockIndexs';
import { toolBar } from './toolBar';
import { funds } from './funds';

export interface RootModel extends Models<RootModel> {
  stockIndexs: typeof stockIndexs;
  toolBar: typeof toolBar;
  funds: typeof funds;
}

export const models: RootModel = {
  stockIndexs,
  toolBar,
  funds,
};