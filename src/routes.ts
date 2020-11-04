import PageFundList from './page/FundList';
import PageFundDetail from './page/FundDetail';
import PageOption from './page/Option';
import PageNoMatch from './page/NoMatch';

export const PopupRoutes = [
  {
    path: "/",
    component: PageFundList,
    exact: true,
  },
  {
    path: '/fund/detail/:fundId',
    component: PageFundDetail,
    exact: true,
  },
  {
    path: '*',
    component: PageNoMatch,
  },
];

export const OptionRoutes = [
  {
    path: "/",
    component: PageOption,
    exact: true,
  },
  {
    path: '*',
    component: PageNoMatch,
  },
]