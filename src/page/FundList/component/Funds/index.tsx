import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { LoadStatus, FundsMode } from '@Type/index';
import { toNumberColor, toNumberPN, toPercentColor, toPercentString } from '@Util/number';
import { FundHelper } from '@Util/fundHelper';
import { FundDetail } from '@Model/fund';
import { BlockLoading } from '@Component/Loading';
import { ChartMini } from '@Component/Chart';
import noDataImg from '@Image/no_data.jpg';

import { Dispatch, RootState } from '../../store';
import styles from './index.module.scss';

export const Funds: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const { status, mode, editing, gzrqT, jzrqT, codes, items, trends } = useSelector(
    (state: RootState) => state.funds
  );

  const onDragEnd = useCallback((result) => {
    if (!result.destination || !result.source) return;
    const codesCopyed = Array.from(codes);
    const [removed] = codesCopyed.splice(result.source.index, 1);
    codesCopyed.splice(result.destination.index, 0, removed);
    dispatch.funds.updateCodes(codesCopyed);
  }, [codes]);

  const onHoldChange = (code: string, k: string, v: any) => {
    const val = v.trim();
    if (isNaN(val / 1)) return;
    dispatch.funds.updateFundHold({ code, k, v: val / 1 });
  };

  const onDeleteClick = (code: string) => {
    dispatch.funds.deleteFund(code);
  };

  const buildListHeader = useMemo(() => {
    const simplify = mode === FundsMode.simplify;
    return <div className={styles.list_header}>
      <div className={styles.list_line}>
        <div className="tl">基金</div>
        {!editing && !simplify && <div className={styles.chart}>涨跌走势图</div>}
        <div>持有总额</div>
        <div>持有收益</div>
        {!editing && <div>
          <p>最新净值</p>
          {jzrqT && <p className={styles.gz_data}>{jzrqT}</p>}
        </div>}
        {!editing && <div>
          <p>实时估值</p>
          {gzrqT && <p className={styles.gz_data}>{gzrqT}</p>}
        </div>}
        {!editing && <div>
          <p>预估收益</p>
          {gzrqT && <p className={styles.gz_data}>{gzrqT}</p>}
        </div>}
        {editing ? <div>持有份额</div> : null}
        {editing ? <div>持有单价</div> : null}
        {editing ? <div>删除</div> : null}
      </div>
    </div>;
  }, [mode, editing, jzrqT, gzrqT]);

  const buildListBody = useMemo(() => {
    if (status === LoadStatus.loading) {
      return <div className={styles.list_body} style={{ height: `${codes.length * 50}px` }}>
        <BlockLoading />
      </div>;
    }

    if (items.size === 0) {
      return <div className={styles.list_body}>
        <div className={styles.no_data}>
          <img src={noDataImg} />
          <span>老铁，基金都被你删没了~ 赶紧添加你看好的基金吧！</span>
        </div>
      </div>;
    }

    const simplify = mode === FundsMode.simplify;
    return <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            className={styles.list_body}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            { codes.map((id, index) => {
              const item = items.get(id);
              const { code, name, jz, jzzzl, gz, gzzzl, money, gained, gainedPercent, gainedExpected, isETF, hold } = item;
              const { cost, count } = hold;
              return <Draggable key={code} draggableId={code} index={index}>
                {(provided) => (
                  <div
                    className={`${styles.list_line} ${simplify ? styles.simplify : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {/** 基金 */}
                    <div>
                      <p className="bold">
                        <Link className={styles.fund_link} title={name} to={`/fund/detail/${code}`}>{name}</Link>
                      </p>
                      {!simplify && <p className="fs14">
                        <span>{code}</span>
                        {isETF && <span className={styles.etf}>场内ETF</span>}
                      </p>}
                    </div>
                    {/** 涨跌走势图 */}
                    { !editing && !simplify && <div className={styles.chart} style={{ fontSize: 0 }}>
                      <ChartMini data={trends.get(code)} />
                    </div>}
                    {/** 持有总额 */}
                    <div className={`bold fs14`}>
                      {money.toFixed(2)}
                    </div>
                    {/** 持有收益 */}
                    <div>
                      <p className={`bold fs16 ${toNumberColor(gainedPercent)}`}>
                        {gainedPercent ? toPercentString(gainedPercent, true) : '--'}
                      </p>
                      {!simplify && <p className={`bold fs14 ${toNumberColor(gained)}`}>
                        {gained ? toNumberPN(gained) : '--'}
                      </p>}
                    </div>
                    {/** 最新净值 */}
                    { !editing && <div>
                      <p className={`bold fs16 ${toNumberColor(jzzzl)}`}>
                        {toPercentString(jzzzl, true)}
                      </p>
                      {!simplify && <p className='fs14'>{jz}</p>}
                    </div>}
                    {/** 实时估值 */}
                    { !editing && <div>
                      <p className={`bold fs16 ${toPercentColor(gzzzl)}`}>
                        {gzzzl ? toPercentString(gzzzl, true) : '--'}
                      </p>
                      {!simplify && <p className='fs14'>
                        {gz ? gz : '--'}
                      </p>}
                    </div>}
                    {/** 预估收益 */}
                    { !editing && <div className={`bold fs16 ${toNumberColor(gainedExpected)}`}>
                      {toNumberPN(gainedExpected)}
                    </div>}

                    {/** 持有份额 */}
                    { editing && <div>
                      <input type="text" className={styles.edit_input} defaultValue={count}
                        onChange={(e) => onHoldChange(code, 'count', e.target.value)} />
                    </div>}
                    {/** 持有单价 */}
                    { editing && <div>
                      <input type="text" className={styles.edit_input} defaultValue={cost}
                        onChange={(e) => onHoldChange(code, 'cost', e.target.value)} />
                    </div>}
                    {/** 删除 */}
                    { editing && <div>
                      <span className={styles.delete_button} onClick={() => onDeleteClick(code)}>🗑️</span>
                    </div>}
                    {/** 净值更新角标 */}
                    { buildTips(item)}
                  </div>
                )}
              </Draggable>;
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>;
  }, [status, mode, editing, codes, items, trends]);

  const buildListFooter = useMemo(() => {
    if (status === LoadStatus.loading || codes.length === 0) {
      return <div className={styles.list_footer}></div>;
    }

    const simplify = mode === FundsMode.simplify;
    return items.size > 0 && <div className={`${styles.list_footer} ${simplify ? styles.simplify : ''}`}>
      <div className={`${styles.list_line} ${simplify ? styles.simplify : ''}`}>
        <div className="tl">总览</div>
        {!editing && !simplify && <div className={styles.chart}></div>}
        <div className={`bold fs14`}>
          {FundHelper.totalMoney(items).toFixed(2)}
        </div>
        <div>
          <p className={`bold fs16 ${toNumberColor(FundHelper.totalGained(items))}`}>
            {FundHelper.totalPercent(items)}
          </p>
          {!simplify && <p className={`bold fs14 ${toNumberColor(FundHelper.totalGained(items))}`}>
            {toNumberPN(FundHelper.totalGained(items))}
          </p>}
        </div>
        {!editing && <div></div>}
        {!editing && <div></div>}
        {!editing && <div className={`bold fs16 ${toNumberColor(FundHelper.totalGainedExpected(items))}`}>
          {toNumberPN(FundHelper.totalGainedExpected(items))}
        </div>}
        {editing && <div></div>}
        {editing && <div></div>}
        {editing && <div></div>}
      </div>
    </div>;
  }, [status, mode, editing, codes, items]);

  const buildTips = (item: FundDetail) => {
    if (editing || item.gzing) return null;
    const simplify = mode === FundsMode.simplify;
    const classNames = [styles.tips];
    let tipText = '';
    if (item.gainedExpected !== null) {
      if (simplify) classNames.push(styles.simplify);
      if (item.updated) {
        classNames.push(styles.updated);
        tipText = !simplify ? '净值已更新' : '新';
      } else {
        classNames.push(styles.un_updated);
        tipText = !simplify ? '净值待更新' : '待';
      }
    } else {
      classNames.push(styles.cant_updated);
      tipText = !simplify ? '暂无估值' : '无';
    }

    return <span className={classNames.join(' ')}>{tipText}</span>;
  };

  return <div className={styles.list}>
    {buildListHeader}
    {buildListBody}
    {buildListFooter}
  </div>;
}