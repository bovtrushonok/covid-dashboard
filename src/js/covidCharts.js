import Chart from 'chart.js';

const chartBlock = document.querySelector('.graphics-block');
const canvas = document.createElement('canvas');

canvas.setAttribute('id', 'myChart');

const controlBtn = function createControlBtn(str) {
  const control = document.createElement('div');
  const rightBtn = document.createElement('div');
  const leftBtn = document.createElement('div');
  const display = document.createElement('div');
  const displayValue = str;

  display.innerText = displayValue;
  control.classList.add('panel-control');
  rightBtn.classList.add('panel-right-btn');
  leftBtn.classList.add('panel-left-btn');
  display.classList.add('display-panel');
  control.append(leftBtn, display, rightBtn);

  return control;
};

const arrMode = ['deaths', 'cases', 'recovered'];
const covidDataBase = '/v3/covid-19/historical/all?lastdays=all';

chartBlock.append(canvas, controlBtn('deads'));

async function getDataOnCovid(url) {
  const response = await fetch(`https://disease.sh${url}`);
  const result = await response.json();
  return result;
}

let arrData = [];

const chartConfig = {
  type: 'line',
  data: {
    labels: arrData,
    datasets: [],
  },
  options: {
    scales: {
      yAxes: [{
        type: 'linear',
        ticks: {
          beginAtZero: true,
          fontColor: '#999999',
          maxTicksLimit: 4,
        },
      }],
      xAxes: [{
        type: 'time',
        time: {
          unit: 'month',
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#999999',
          maxTicksLimit: 3,
        },
      }],
    },
    legend: {
      display: false,
    },
  },
};
const myChart = new Chart(canvas, chartConfig);

function setData(data, name, color) {
  const obj = {
    label: name,
    data: Object.values(data),
    backgroundColor: color,
    fill: true,
  };
  return obj;
}

let dataObj = null;
getDataOnCovid(covidDataBase).then((res) => {
  dataObj = res;
  arrData = Object.keys(res.cases).map((item) => new Date(item));
  myChart.data.labels = Object.keys(res.cases);
  myChart.data.datasets = [(setData(res.cases, 'cases', 'yellow'))];
  myChart.update();
});
let y = 0;

chartBlock.addEventListener('click', (e) => {
  const displayBlock = document.querySelector('.display-panel');
  if (e.target.className === 'panel-right-btn') {
    y = (y += 1) % arrMode.length;
    myChart.data.datasets = [setData(dataObj[arrMode[y]], arrMode[y], 'yellow')];
    myChart.update();
    displayBlock.innerText = arrMode[y];
  }
  if (e.target.className === 'panel-left-btn') {
    y = y === 0 ? 3 : y;
    y = Math.abs((y -= 1) % arrMode.length);
    myChart.data.datasets = [setData(dataObj[arrMode[y]], arrMode[y], 'yellow')];
    myChart.update();
    displayBlock.innerText = arrMode[y];
  }
});

export default myChart;
