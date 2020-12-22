import Chart from 'chart.js';

const grafickBlock = document.querySelector('.graphics-block');
const canvas = document.createElement('canvas');
canvas.setAttribute('id', 'myChart');

const covidDataBase = '/v3/covid-19/historical/all?lastdays=all';

grafickBlock.append(canvas);

async function covid(url) {
  const response = await fetch(`https://disease.sh${url}`);
  const result = await response.json();
  return result;
}

let arrData = [];
// let dataBasa = [];

const chartConfig = {
  type: 'line',
  data: {
    labels: arrData,
    datasets: [],
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
        },
      }],
    },
  },
};

const myChart = new Chart(canvas, chartConfig);

console.log(myChart);

function setData(data, name, color) {
  const obj = {
    label: name,
    data: Object.values(data),
    backgroundColor: color,
    fill: false,
  };
  return obj;
}
covid(covidDataBase).then((res) => {
  console.log(res);
  console.log(Object.keys(res.cases));
  console.log(Object.values(res.cases));
  arrData = Object.keys(res.cases).map((item) => new Date(item));
  console.log(arrData);
  // dataBasa = Object.values(res.cases);
  myChart.data.labels = Object.keys(res.cases);
  myChart.data.datasets.push(setData(res.cases, 'deads', 'red'));
  // myChart.update();
  // setData(myChart, res.cases, 'cases', 'red');
  // setData(myChart, res.cases, 'green');
  console.log(setData(res.deaths, 'deads', 'red'));
  myChart.update();
});
