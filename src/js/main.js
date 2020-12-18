const countryFlagIcon = document.querySelector('.country-flag');
const countryName = document.querySelector('.country-name');
const diseaseCasesNumber = document.querySelector('.all-disease-cases');
const deathCasesNumber = document.querySelector('.all-death-cases');
const recoverCasesNumber = document.querySelector('.all-recovered-cases');
const timeIntervalSwitch = document.querySelector('.statistic #last-day-stat');
const relativeValueSwitch = document.querySelector('.statistic #statistic-100k');

async function getCountryFlag() {  
  const flagUrl = `https://restcountries.eu/rest/v2/all?fields=name;population;flag`;
  const flagResponse = await fetch(flagUrl);
  const flagList = await flagResponse.json();
   
  let country = flagList.filter((num) => num.name === `${countryName.value}`);
   
  if (countryName.value === 'Russia') {
    country = flagList.filter((num) => num.name === 'Russian Federation');
  }

  if (countryName.value === 'US' || countryName.value === 'USA') {
    country = flagList.filter((num) => num.name === 'United States of America');
  }

  if (countryName.value === 'UK' || countryName.value === 'United Kingdom') {
    country = flagList.filter((num) => num.name === 'United Kingdom of Great Britain and Northern Ireland');
  }

  if (country[0] === undefined) {
    alert('There is no such country, try again!');
    countryFlagIcon.classList.add('hidden');
  } else {
    countryFlagIcon.src = `${country[0].flag}`;
    countryFlagIcon.classList.remove('hidden');
  }
}

async function getCountryPopulation() {
  const flagUrl = `https://restcountries.eu/rest/v2/all?fields=name;population;flag`;
  const flagResponse = await fetch(flagUrl);
  const flagList = await flagResponse.json(); 

  let country = flagList.filter((num) => num.name === `${countryName.value}`);
   
  if (countryName.value === 'Russia') {
    country = flagList.filter((num) => num.name === 'Russian Federation');
  }

  if (countryName.value === 'US' || countryName.value === 'USA') {
    country = flagList.filter((num) => num.name === 'United States of America');
  }

  if (countryName.value === 'UK' || countryName.value === 'United Kingdom') {
    country = flagList.filter((num) => num.name === 'United Kingdom of Great Britain and Northern Ireland');
  }

  if (!countryName.value) {
    let population = 0;
    for (let i = 0; i < flagList.length; i++) {
      population += flagList[i].population;
    }
    return population;
  }

  return country[0].population;
}

async function getCountryStatistic() {
  const statUrl = `https://api.covid19api.com/total/country/${countryName.value}`;
  const statResponse = await fetch(statUrl);
  const statList = await statResponse.json();
  const countryPopulation = await getCountryPopulation();

  const overallStatistic = statList[statList.length - 1];
  const increasingStatistic = statList[statList.length - 2];
  const overallDiseasesNumber = overallStatistic.Confirmed;
  const overallDeathesNumber = overallStatistic.Deaths;
  const overallRecoveredNumber = overallStatistic.Recovered;
  const lastDayDiseasesNumber = overallDiseasesNumber - increasingStatistic.Confirmed;
  const lastDayDeathesNumber = overallDeathesNumber - increasingStatistic.Deaths;
  const lastDayRecoveredNumber = overallRecoveredNumber - increasingStatistic.Recovered;
  const overallDiseasesNumberFor100k = Math.round(overallDiseasesNumber / (countryPopulation / 100000));
  const overallDeathesNumberFor100k = Math.round(overallDeathesNumber / (countryPopulation / 100000));
  const overallRecoveredNumberFor100k = Math.round(overallRecoveredNumber / (countryPopulation / 100000));
  const lastDayDiseasesNumberFor100k = Math.round(lastDayDiseasesNumber / (countryPopulation / 100000));
  const lastDayDeathesNumberFor100k = Math.round(lastDayDeathesNumber / (countryPopulation / 100000));
  const lastDayRecoveredNumberFor100k = Math.round(lastDayRecoveredNumber / (countryPopulation / 100000));

  if (timeIntervalSwitch.checked && relativeValueSwitch.checked) {
    diseaseCasesNumber.innerHTML = `${lastDayDiseasesNumberFor100k}`;
    deathCasesNumber.innerHTML = `${lastDayDeathesNumberFor100k}`;
    recoverCasesNumber.innerHTML = `${lastDayRecoveredNumberFor100k}`;
  } else if (timeIntervalSwitch.checked) {
    diseaseCasesNumber.innerHTML = `${lastDayDiseasesNumber}`;
    deathCasesNumber.innerHTML = `${lastDayDeathesNumber}`;
    recoverCasesNumber.innerHTML = `${lastDayRecoveredNumber}`;
  } else if (relativeValueSwitch.checked) {
    diseaseCasesNumber.innerHTML = `${overallDiseasesNumberFor100k}`;
    deathCasesNumber.innerHTML = `${overallDeathesNumberFor100k}`;
    recoverCasesNumber.innerHTML = `${overallRecoveredNumberFor100k}`;
  } else {
    diseaseCasesNumber.innerHTML = `${overallDiseasesNumber}`;
    deathCasesNumber.innerHTML = `${overallDeathesNumber}`;
    recoverCasesNumber.innerHTML = `${overallRecoveredNumber}`;
  }
}

function setCountry(e) {
  if (e.type === 'keypress') {

    if (e.which == 13 || e.keyCode == 13) {

      if ((countryName.value == '') || (countryName.value.length == 0)) {
        countryName.value = 'World';
      }

      getCountryFlag();
      getCountryStatistic();
      countryName.blur();
    }
  }
}

countryName.addEventListener('keypress', setCountry);
timeIntervalSwitch.addEventListener('click', getCountryStatistic);
relativeValueSwitch.addEventListener('click', getCountryStatistic);
