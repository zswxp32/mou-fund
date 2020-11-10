import { toPercentString, toPercentColor } from '../../../util/number';

const timeList = [];
for (let i = 0; i < 242; i++) {
  let time;
  if (i < 121) {
    time = new Date((1.5 * 60 + i) * 60 * 1000);
  } else {
    time = new Date((3 * 60 + i - 1) * 60 * 1000);
  }
  const h = time.getHours() < 10 ? `0${time.getHours()}` : time.getHours();
  const m = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
  timeList.push(`${h}:${m}`);
}

const candleEchartOption = (data) => {
  const timeList = new Array(241);
  const priceList = [];
  const tradList = [];
  data.trends.forEach((str, index) => {
    const [time, price, trad] = str.split(',');
    timeList[index] = time;
    priceList.push(price);
    tradList.push(trad);
  });

  const toChange = (value: number): number => {
    return 100 * (value - data.prePrice) / data.prePrice;
  };

  return {
    title: {
      show: false,
    },
    grid: {
      top: 4,
      left: 0,
      right: 0,
      bottom: 4,
      width: 240,
      height: 24,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      position: (point) => [point[0] + 20, 0],
      backgroundColor: '#fff',
      borderColor: '#ffddcc',
      borderWidth: 1,
      padding: [3, 5, 3, 5],
      textStyle: {
        color: '#333',
        fontSize: 8,
        lineHeight: 14,
        align: 'left',
      },
      formatter: ([s]) => {
        const change = toChange(s.value);
        return `
          时间：${s.axisValue.split(' ')[1]}<br/>
          涨跌：<span class="${toPercentColor(change)}">${toPercentString(change, true)}</span><br/>
          价格：${s.value}<br/>
          成交：${tradList[s.dataIndex]}手
        `;
      },
    },
    xAxis: {
      type: "category",
      position: "bottom",
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      data: timeList,
    },
    yAxis: {
      type: "value",
      interval: 100,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        formatter: (value) => toPercentString(toChange(value), true),
        color: (value) => toPercentColor(toChange(value)),
        fontSize: 10,
      },
      min: (value) => Math.min(value.min, data.prePrice),
      max: (value) => Math.max(value.max, data.prePrice),
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#cccccc",
        },
      },
    },
    series: [
      {
        type: 'line',
        areaStyle: {
          color: '#ffddcc',
          opacity: 0.5,
        },
        lineStyle: {
          width: 2,
          color: '#ff9966',
        },
        data: priceList,
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: {
            color: '#666',
            type: "solid",
          },
          data: [{
            yAxis: data.prePrice
          }],
          label: {
            show: false,
          },
        },

        markPoint: {
          symbol: 'circle',
          symbolSize: 4,
          label: {
            show: false,
          },
          data: [{
            type: 'max',
            name: '最大值',
            itemStyle: {
              color: '#e62e00'
            },
          }, {
            type: 'min',
            name: '最小值',
            itemStyle: {
              color: '#009900',
            },
          }]
        },
      },
    ]
  };
};

export default candleEchartOption;