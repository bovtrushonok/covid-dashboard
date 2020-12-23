const leftSidebar = document.querySelector('.global-cases-container');
const imgBtn = document.querySelectorAll('.spread-icon-block');
const searchConteiner = document.querySelector('.countries-cases');
const countryUlConteiner = document.querySelector('.countries-list');
const state = {
  mode: 'Diseases',
  modeName: ['cases', 'deaths', 'recovered', 'casesPerOneMillion', 'deathsPerOneMillion', 'recoveredPerOneMillion', 'todayCases', 'todayDeaths', 'todayRecovered'],
  statistic100: false,
  lastDayStat: false,
};

const covidAllUrl = '/v3/covid-19/all';
const covidCountriesUrl = '/v3/covid-19/countries';

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
searchConteiner.prepend(searchInput());

function addDeads(data) {
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
  if (state.mode === 'Deathes' && !state.statistic100 && !state.lastDayStat) {
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
  if (state.mode === 'Deathes' && !state.statistic100 && state.lastDayStat) {
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
  if (state.mode === 'Deathes' && state.statistic100 && !state.lastDayStat) {
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
  if (state.mode === 'Deathes' && state.statistic100 && state.lastDayStat) {
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

function getCountyData(data, t) {
  setMode();

  const dataSort = data.sort((a, b) => (a[modeNameStatus] < b[modeNameStatus] ? 1 : -1));
  for (let i = 0; i < data.length; i += 1) {
    const li = document.createElement('li');
    const spanCases = document.createElement('span');
    const spanCounry = document.createElement('span');
    const flagCounry = document.createElement('img');
    flagCounry.setAttribute('src', dataSort[i].countryInfo.flag);
    if (modeTodayAt100) {
      spanCases.innerText = numberSeparator(Math.round((dataSort[i][modeNameStatus] * 100000)
      // eslint-disable-next-line no-undef
        / (dataSort[i].population === 0 ? 1 : dataSort[i].population)));
    } else {
      // eslint-disable-next-line dot-notation
      spanCases.innerText = numberSeparator(Math.round(dataSort[i][modeNameStatus] / one100people));
    }
    spanCounry.innerText = dataSort[i].country;
    t.append(li);
    li.append(flagCounry, spanCases, spanCounry);
  }
}

async function covidData(url) {
  const response = await fetch(`https://disease.sh${url}`);
  const result = await response.json();
  return result;
}

covidData(covidAllUrl).then((res) => {
  addDeads(res.cases);
});

covidData(covidCountriesUrl).then((res) => {
  getCountyData(res, countryUlConteiner);
});

async function showValue() {
  async function searchValue() {
    // eslint-disable-next-line no-unused-expressions
    countries = await covidData(covidCountriesUrl).then((res) => res);
  }
  await searchValue();
  countryUlConteiner.innerHTML = '';
  const arr = countries
    .filter((item) => item.country.toLowerCase().includes(valueInput.toLowerCase()));

  getCountyData(arr, countryUlConteiner);
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
    countryUlConteiner.innerHTML = '';
    await covidData(covidCountriesUrl).then((res) => {
      getCountyData(res, countryUlConteiner);
    });
  });
});

input.addEventListener('input', (e) => {
  valueInput = e.target.value;
  showValue();
});
