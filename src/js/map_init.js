import * as constants from './constants';

const { L } = window;
const mapSpreadIcon = document.querySelector('.map-container .spread-icon');
const mapWindow = document.querySelector('.map-container');
const pageBody = document.querySelector('body');
let casesLayer;
let deathsLayer;
let recoversLayer;
let todayCasesLayer;
let todayRecoversLayer;
let todayDeathsLayer;
let casesPer100kLayer;
let deathsPer100kLayer;
let recoversPer100kLayer;

const baseLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: constants.ATTRIBUTION,
  maxZoom: 18,
  id: 'mapbox/dark-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoidGVkZHlrYXR6IiwiYSI6ImNraXQzeTZseDEzcXkzMWwzc3R4b2JtcGsifQ.6c4tCeNZLPWxAMUugvrPJA',
});

const Map = L.map('mapBlock', {
  layers: [baseLayer],
}).setView([0, 0], 2.3);

function createHTMLToolTip(country, parameter, cases, updateTime) {
  const html = `
      <span class="icon-marker-tooltip">
          <h2 class="country-name">${country}</h2>
          <ul>
            <li><strong>${parameter}:</strong> ${cases.toLocaleString()}</li>
            <li><strong>Last Update:</strong> ${new Date(updateTime).toLocaleDateString('en-US')}</li>
          </ul>
      </span> 
    `;

  return html;
}

function createGeoJsonLayer(geojson, parameter, scopeCoefficient, parameterDescriptionString, col) {
  return L.geoJSON(geojson, {
    pointToLayer(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: constants.BASIC_RADIUS_COEFFICIENT
          * (feature.properties[parameter] / scopeCoefficient),
        fillColor: col,
        color: '#000',
        weight: 1,
        opacity: 0,
        fillOpacity: 0.5,
        riseOnHover: true,
      });
    },
    onEachFeature(feature, layer) {
      layer.bindTooltip(createHTMLToolTip(feature.properties.country, parameterDescriptionString,
        feature.properties[parameter], feature.properties.updated));
    },
  });
}

async function createGeoJSON() {
  const response = await fetch('https://disease.sh/v3/covid-19/countries');
  const data = await response.text();
  const result = await JSON.parse(data);

  return result;
}

createGeoJSON()
  .then((geojson) => {
    casesLayer = createGeoJsonLayer(geojson, 'cases', constants.LARGE_SCOPE_COEFFICIENT, 'Cases', 'yellow');
    casesLayer.addTo(Map);

    deathsLayer = createGeoJsonLayer(geojson, 'deaths', constants.STANDARD_SCOPE_COEFFICIENT, 'Deaths', 'red');
    recoversLayer = createGeoJsonLayer(geojson, 'recovered', constants.LARGE_SCOPE_COEFFICIENT, 'Recovers', 'blue');
    todayCasesLayer = createGeoJsonLayer(geojson, 'todayCases', constants.SMALL_SCOPE_COEFFICIENT, 'Cases today', 'yellow');
    todayRecoversLayer = createGeoJsonLayer(geojson, 'todayRecovered', constants.SMALL_SCOPE_COEFFICIENT, 'Recovers today', 'blue');
    todayDeathsLayer = createGeoJsonLayer(geojson, 'todayDeaths', constants.EXTRASMALL_SCOPE_COEFFICIENT, 'Deaths today', 'red');
    casesPer100kLayer = createGeoJsonLayer(geojson, 'casesPerOneMillion', constants.SMALL_SCOPE_COEFFICIENT, 'Cases per 100K', 'yellow');
    deathsPer100kLayer = createGeoJsonLayer(geojson, 'deathsPerOneMillion', constants.EXTRASMALL_SCOPE_COEFFICIENT, 'Deaths per 100K', 'red');
    recoversPer100kLayer = createGeoJsonLayer(geojson, 'recoveredPerOneMillion', constants.SMALL_SCOPE_COEFFICIENT, 'Recovers per 100K', 'blue');
  })

  .then(() => {
    const overlays = {
      Cases: casesLayer,
      Deaths: deathsLayer,
      Recovered: recoversLayer,
      'Cases today': todayCasesLayer,
      'Deaths today': todayDeathsLayer,
      'Recovers today': todayRecoversLayer,
      'Cases per 100K of population': casesPer100kLayer,
      'Deaths per 100K of population': deathsPer100kLayer,
      'Recovers per 100K of population': recoversPer100kLayer,
    };

    L.control.layers(null, overlays).addTo(Map);
  })

  .then(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const legendBlock = L.DomUtil.create('div', 'info legend');
      const grades = [100, 1000, 10000, 100000, 1000000];

      for (let i = 0; i < grades.length; i += 1) {
        legendBlock.innerHTML += `<div class="legend-list"><i class="i-marker" style="width:${(i + 1) * 3}px; height:${(i + 1) * 3}px">
        </i><span>${grades[i]} - ${(grades[i + 1] ? grades[i + 1] : 'more')}</span></div>`;
      }
      return legendBlock;
    };

    legend.addTo(Map);
  });

mapSpreadIcon.addEventListener('click', () => {
  mapWindow.classList.toggle('full-screen-window');
  pageBody.classList.toggle('no-scroll');
});
