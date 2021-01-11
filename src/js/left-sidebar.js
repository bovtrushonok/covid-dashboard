import myChart from './covidCharts';
import { getCountryFlag, getCountryStatistic } from './statistic-table';

const leftSidebar = document.querySelector('.global-cases-container');
const imgBtn = document.querySelectorAll('.spread-icon-block');
const searchContainer = document.querySelector('.countries-cases');
const countriesContainer = document.querySelector('.countries-list');
const countryName = document.querySelector('.country-name');
const state = {
  mode: 'Diseases',
  modeName: ['cases', 'deaths', 'recovered', 'casesPerOneMillion', 'deathsPerOneMillion', 'recoveredPerOneMillion', 'todayCases', 'todayDeaths', 'todayRecovered'],
  statistic100: false,
  lastDayStat: false,
};

const COVID_ALL_URL = '/v3/covid-19/all';
const COVID_COUNTRIES_URL = '/v3/covid-19/countries';
const checkbox = document.querySelectorAll('div.countries-cases > div.mode-switches-block > div.mode-button > input.mode-switch');

let valueInput = '';
let countries;
let fullScreenWindow = false;

function numberSeparator(num) {
  const str = String(num).split('').reverse().join('');
  let str2 = '';

  for (let i = str.length - 1; i >= 0; i -= 1) {
    if ((i + 1) % 3 === 0) { str2 += ' '; }
    str2 += str[i];
  }

  return str2.trim();
}
const searchInput = function searchElement() {
  const search = document.createElement('input');

  search.classList.add('search-input');
  search.setAttribute('placeholder', 'choose country');

  return search;
};

async function getCovidData(url) {
  const response = await fetch(`https://disease.sh${url}`);
  const result = await response.json();

  return result;
}

searchContainer.prepend(searchInput());

function addDeathData(data) {
  leftSidebar.childNodes[1].lastElementChild.innerText = numberSeparator(data);
}

let modeNameStatus = '';
let one100people = 1;
let modeTodayAt100 = false;

function setMode() {
  if (state.mode === 'Diseases' && !state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'cases';
    modeTodayAt100 = false;
    one100people = 1;
  }

  if (state.mode === 'Deaths' && !state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'deaths';
    one100people = 1;
  }

  if (state.mode === 'Recovered' && !state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'recovered';
    modeTodayAt100 = false;
    one100people = 1;
  }

  if (state.mode === 'Diseases' && !state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayCases';
    modeTodayAt100 = false;
    one100people = 1;
  }

  if (state.mode === 'Deaths' && !state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayDeaths';
    modeTodayAt100 = false;
    one100people = 1;
  }

  if (state.mode === 'Recovered' && !state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayRecovered';
    modeTodayAt100 = false;
    one100people = 1;
  }

  if (state.mode === 'Diseases' && state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'casesPerOneMillion';
    one100people = 10;
    modeTodayAt100 = false;
  }

  if (state.mode === 'Deaths' && state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'deathsPerOneMillion';
    one100people = 10;
    modeTodayAt100 = false;
  }

  if (state.mode === 'Recovered' && state.statistic100 && !state.lastDayStat) {
    modeNameStatus = 'recoveredPerOneMillion';
    one100people = 10;
    modeTodayAt100 = false;
  }

  if (state.mode === 'Diseases' && state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayCases';
    modeTodayAt100 = true;
    one100people = 1;
  }

  if (state.mode === 'Deaths' && state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayDeaths';
    modeTodayAt100 = true;
    one100people = 1;
  }

  if (state.mode === 'Recovered' && state.statistic100 && state.lastDayStat) {
    modeNameStatus = 'todayRecovered';
    modeTodayAt100 = true;
    one100people = 1;
  }
}

const arrayModeName = ['deaths', 'cases', 'recovered'];
let arrayModeIndex = 0;
let dataCovidObj = null;
const arena = document.querySelector('.graphics-block');

function clickListCountry(e) {
  arena.addEventListener('click', (event) => {
    const displayBlock = document.querySelector('.display-panel');

    if (event.target.className === 'panel-right-btn') {
      arrayModeIndex = (arrayModeIndex += 1) % arrayModeName.length;

      myChart.data.datasets[0].data = [...Object.values(dataCovidObj
        .timeline[arrayModeName[arrayModeIndex]])];
      myChart.update();
      displayBlock.innerText = arrayModeName[arrayModeIndex];
    }

    if (event.target.className === 'panel-left-btn') {
      arrayModeIndex = arrayModeIndex === 0 ? 3 : arrayModeIndex;
      arrayModeIndex = Math.abs((arrayModeIndex -= 1) % arrayModeName.length);

      myChart.data.datasets[0].data = [...Object.values(dataCovidObj
        .timeline[arrayModeName[arrayModeIndex]])];
      myChart.update();
      displayBlock.innerText = arrayModeName[arrayModeIndex];
    }
  });

  const VALUE_COUNTRY = e.path[1].lastChild.innerText;
  const LAST_DAY_DATA_URL = `/v3/covid-19/historical/${VALUE_COUNTRY}?lastdays=all`;

  getCovidData(LAST_DAY_DATA_URL).then((res) => {
    dataCovidObj = res;

    myChart.data.datasets[0].data = [...Object.values(res.timeline.cases)];
    myChart.update();
  });
}

function getCountryData(data, listOfCountries) {
  setMode();

  const dataSort = data.sort((a, b) => (a[modeNameStatus] < b[modeNameStatus] ? 1 : -1));

  for (let i = 0; i < data.length; i += 1) {
    const countryBlock = document.createElement('li');
    const spanCases = document.createElement('span');
    const spanCountry = document.createElement('span');
    const flagCountry = document.createElement('img');

    flagCountry.setAttribute('src', dataSort[i].countryInfo.flag);

    if (modeTodayAt100) {
      spanCases.innerText = numberSeparator(Math.round((dataSort[i][modeNameStatus] * 100000)
        / (dataSort[i].population === 0 ? 1 : dataSort[i].population)));
    } else {
      spanCases.innerText = numberSeparator(Math.round(dataSort[i][modeNameStatus] / one100people));
    }

    spanCountry.innerText = dataSort[i].country;
    listOfCountries.append(countryBlock);
    countryBlock.append(flagCountry, spanCases, spanCountry);
    countryBlock.addEventListener('click', clickListCountry);

    countryBlock.addEventListener('click', () => {
      countryName.value = spanCountry.innerText;
      getCountryFlag();
      getCountryStatistic();
    });
  }
}

getCovidData(COVID_ALL_URL).then((res) => {
  addDeathData(res.cases);
});

getCovidData(COVID_COUNTRIES_URL).then((res) => {
  getCountryData(res, countriesContainer);
});

async function showValue() {
  async function searchValue() {
    countries = await getCovidData(COVID_COUNTRIES_URL).then((res) => res);

    return countries;
  }

  await searchValue();
  countriesContainer.innerHTML = '';

  const arr = countries
    .filter((item) => item.country.toLowerCase().includes(valueInput.toLowerCase()));

  getCountryData(arr, countriesContainer);
}

imgBtn.forEach((item) => {
  item.addEventListener('click', (e) => {
    fullScreenWindow = !fullScreenWindow;
    e.path[2].classList.toggle('full-screen-window', fullScreenWindow);
  });
});

const input = document.querySelector('.search-input');

checkbox.forEach((item) => {
  item.addEventListener('click', async (e) => {
    if (e.target.type !== 'checkbox') {
      state.mode = e.target.value;
    }

    if (e.target.type === 'checkbox' && e.target.id === 'statistic-100k') {
      state.statistic100 = e.target.checked;
    }

    if (e.target.type === 'checkbox' && e.target.id === 'last-day-stat') {
      state.lastDayStat = e.target.checked;
    }

    countriesContainer.innerHTML = '';

    await getCovidData(COVID_COUNTRIES_URL).then((res) => {
      getCountryData(res, countriesContainer);
    });
  });
});

input.addEventListener('input', (e) => {
  valueInput = e.target.value;
  showValue();
});
