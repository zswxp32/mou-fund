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
  const m = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();;
  timeList.push(`${h}:${m}`);
}

const miniEchartOption = (fundGzDetail) => {
  let changeList = [];
  fundGzDetail.gzDetail.forEach(str => {
    const temp = str.split(',');
    changeList.push(parseFloat(temp[2]));
  });

  return {
    title: {
      show: false,
    },
    grid: {
      top: 8,
      left: 0,
      right: 0,
      bottom: 8,
      width: 260,
      height: 34,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      position: (point, params, dom, rect, size) => [point[0] + 30, point[1] - 20],
      backgroundColor: '#ffeee5',
      borderColor: '#ffddcc',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 8,
        lineHeight: 14,
      },
      formatter: ([s]) => {
        return `
        时间：${s.axisValue}<br/>
        涨跌：<span class="${toPercentColor(s.value)}">${toPercentString(s.value, true)}</span><br/>
        净值：${(fundGzDetail.fundBaseInfo.DWJZ * (1 + parseFloat(s.value) / 100)).toFixed(4)}
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
        lineStyle: {
          color: 'grey',
          width: 2,
        }
      },
      axisTick: {
        show: false,
      },
      data: timeList,
    },
    yAxis: {
      type: "value",
      interval: 5,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        formatter: (value) => toPercentString(value, true),
        color: (value) => toPercentColor(value),
        fontSize: 10,
      },
      min: (value) => value.min,
      max: (value) => value.max,
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
        data: changeList,
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

export default miniEchartOption;