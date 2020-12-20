const leftSidebar = document.querySelector('.global-cases-container');
const imgBtn = document.querySelectorAll('.spread-icon-block');
const searchConteiner = document.querySelector('.countries-cases');
const countryUlConteiner = document.querySelector('.countries-list');
const covidAllUrl = '/v3/covid-19/all';
const covidCountriesUrl = '/v3/covid-19/countries';

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
  return search;
};
searchConteiner.prepend(searchInput());

function addDeads(data) {
  leftSidebar.childNodes[1].lastElementChild.innerText = numberSeparator(data);
}

function getCountyData(data, t) {
  const dataSort = data.sort((a, b) => (a.cases < b.cases ? 1 : -1));
  for (let i = 0; i < data.length; i += 1) {
    const li = document.createElement('li');
    const spanCases = document.createElement('span');
    const spanCounry = document.createElement('span');
    const flagCounry = document.createElement('img');
    flagCounry.setAttribute('src', dataSort[i].countryInfo.flag);
    spanCases.innerText = numberSeparator(dataSort[i].cases);
    spanCounry.innerText = dataSort[i].country;
    t.append(li);
    li.append(flagCounry, spanCases, spanCounry);
  }
  console.log(dataSort);
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

imgBtn.forEach((item) => {
  item.addEventListener('click', (e) => {
    fullScreenWindow = !fullScreenWindow;
    e.path[2].classList.toggle('full-screen-window', fullScreenWindow);
  });
});
