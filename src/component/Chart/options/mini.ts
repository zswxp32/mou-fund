import { toPercentString, toPercentColor } from '@Util/number';
import { FundTrends } from '@Model/fund';

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

const miniEchartOption = (trendsData: FundTrends) => {
  const changeList = [];
  trendsData.list.forEach(str => {
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
      width: 240,
      height: 34,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      position: (point) => [point[0] + 20, 1],
      backgroundColor: '#e6f7ff', // $blue1
      borderColor: '#69c0ff', // $blue4
      borderWidth: 1,
      padding: [3, 5, 3, 5],
      textStyle: {
        color: '#333',
        fontSize: 8,
        fontFamily: 'abc',
        lineHeight: 13,
        align: 'left',
      },
      formatter: ([s]) => {
        return `
          时间：${s.axisValue}<br/>
          涨跌：<span class="${toPercentColor(s.value)}">${toPercentString(s.value, true)}</span><br/>
          净值：${(trendsData.dwjz * (1 + parseFloat(s.value) / 100)).toFixed(4)}
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
      interval: 10,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        formatter: (value) => toPercentString(value, true),
        color: (value) => toPercentColor(value),
        fontSize: 10,
        fontFamily: 'abc',
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
          color: '#bae7ff', // $blue2
        },
        lineStyle: {
          width: 2,
          color: '#69c0ff', // $blue4
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
              color: 'red'
            },
          }, {
            type: 'min',
            name: '最小值',
            itemStyle: {
              color: 'green',
            },
          }]
        },
      },
    ]
  };
};

export default miniEchartOption;